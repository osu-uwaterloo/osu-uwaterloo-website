const supportViewTransition = document.startViewTransition;
if (!supportViewTransition) document.startViewTransition = (fn) => fn();

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
		if (e.button !== 0) {
			return;
		}
		const a = e.target.closest('a');
		if (!a) {
			return;
		}
		const url = a.href;
		if (!url || url.indexOf(location.origin) !== 0 || e.ctrlKey || e.metaKey) {
			return;
		}
		if (new URL(url).pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) {
			e.preventDefault();
			return;
		}
		e.preventDefault();
		await this.navigate(url);
	}

	async navigate(url) {
		history.replaceState({
			html: document.documentElement.outerHTML,
			scroll: document.querySelector('#container')?.scrollTop ?? null
		}, null, location.href);
		history.pushState(null, null, url);
		await this.loadHTML(url, document.body.getAttribute('type') ?? null);
	}

	/**
	 * @param {string} url the url of the page
	 * @param {string} previousPageType 'home' or 'post', indicates the type of the previous page
	 * @param {string} html the html content of the page, if not provided, it will be fetched from the url
	 * @param {number} scroll the scroll position
	 * @returns {Promise<void>}
	*/
	async loadHTML(url, previousPageType = null, html = null, scroll = null) {
		await Promise.all([
			new Promise(async resolve => {
				if (!html) html = this.cache[url];
				if (!html) html = await fetch(url).then(response => response.text());
				resolve();
			}),
			transitionPolyfill(url)
		]);
		this.cache[url] = html;
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const transition = document.startViewTransition(() => {
			document.title = doc.title;
			// collapse the options in home page
			doc.querySelector('#optionsContainer')?.classList?.remove('open');
			// replace the main content
			document.querySelector('#main').replaceWith(doc.querySelector('#main'));
			document.body.setAttribute('type', doc.body.getAttribute('type'));
			// set previous page type for transition
			document.body.setAttribute('from', previousPageType);
			document.body.classList.remove('transition-done');
			// set navbar active tab
			document.querySelector('.nav-sections').setAttribute(
				'data-section', 
				doc.querySelector('.nav-sections').getAttribute('data-section')
			);
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
		})
		try {
			await transition.finished;
		}
		catch (e) {}
		finally {
			document.body.classList.add('transition-done');
		}
	}

	async popStateHandler(e) {
		if (e.state) {
			await this.loadHTML(
				location.href,
				document.body.getAttribute('type') ?? null,
				e.state.html,
				e.state.scroll
			);
		} else {
			await this.loadHTML(
				location.href,
				document.body.getAttribute('type') ?? null
			);
		}
	}


	static init() {
		new Router();
	}
}

Router.init();



function transitionPolyfill(url) {
	if (supportViewTransition) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const path = new URL(url).pathname.replace(/\/$/, '');
	const type = path.length ? "page" : "home";
	const previousPageType = document.body.getAttribute('type') ?? null;
	if (type == "page" && previousPageType == "page") {
		const card = document.querySelector('#card');
		if (!card) return;
		return new Promise(resolve => {
			card.animate([
				{ transform: 'translateY(0)', opacity: 1 },
				{ transform: 'translateY(min(60vh, 600px))', opacity: 0 }
			], {
				duration: 250,
				easing: 'ease',
				fill: 'both'
			}).onfinish = resolve;
		});
	}
	if (type == "home" && previousPageType == "page") {
		const card = document.querySelector('#card');
		if (!card) return;
		return new Promise(resolve => {
			card.animate([
				{ transform: 'translateY(0)'},
				{ transform: 'translateY(calc(100vh + 310px))' }
			], {
				duration: 250,
				easing: 'ease',
				fill: 'both'
			}).onfinish = resolve;
		});
	}
	if (type == "page" && previousPageType == "home") {
		const cookie = document.querySelector('#buttonWrapper');
		return new Promise(resolve => {
			cookie.animate([
				{ transform: 'scale(1)', opacity: 1 },
				{ transform: 'scale(0.9)', opacity: 0 }
			], {
				duration: 250,
				easing: 'ease',
				fill: 'both'
			}).onfinish = resolve;
		});
	}
}