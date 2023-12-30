class Router {
	constructor() {
		if (window.Router) {
			return window.Router;
		}
		window.Router = this;
		this.cache = {};
		document.addEventListener('click', this.clickHandler.bind(this));
		window.addEventListener('popstate', this.popStateHandler.bind(this));
	}

	async clickHandler(e) {
		const a = e.target.closest('a');
		if (!a) {
			return;
		}
		const url = a.href;
		if (e.button !== 0) {
			return;
		}
		if (!url || url.indexOf(location.origin) !== 0 || e.ctrlKey || e.metaKey) {
			return;
		}
		if (new URL(url).pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) {
			e.preventDefault();
			return;
		}
		e.preventDefault();
		//console.log(e);
		//console.log(url);
		await this.navigate(url);
	}

	async navigate(url) {
		history.replaceState({
			html: document.documentElement.outerHTML,
			scroll: document.querySelector('#container')?.scrollTop ?? null
		}, null, location.href);
		history.pushState(null, null, url);
		await this.loadHTML(url);
	}

	async loadHTML(url, html = null, scroll = null) {
		//console.log(url);
		html = html;
		if (!html) html = this.cache[url];
		if (!html) html = await fetch(url).then(response => response.text());
		this.cache[url] = html;
		//console.log(html);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		if (!document.startViewTransition) document.startViewTransition = (fn) => fn();
		document.startViewTransition(() => {
			document.title = doc.title;
			// collapse the options in home page
			doc.querySelector('#optionsContainer')?.classList?.remove('open');
			// replace the main content
			document.querySelector('#main').replaceWith(doc.querySelector('#main'));
			// restore the scroll position
			if (scroll !== null && document.querySelector('#container')) {
				document.querySelector('#container').scrollTop = scroll;
			}
			// run scripts
			const scripts = document.querySelectorAll('script');
			for (const script of scripts) {
				if (!script.src) {
					eval(script.innerHTML);
				}
			}
		});
	}

	async popStateHandler(e) {
		if (e.state) {
			await this.loadHTML(location.href, e.state.html, e.state.scroll);
		} else {
			await this.loadHTML(location.href);
		}
	}


	static init() {
		new Router();
	}
}

Router.init();