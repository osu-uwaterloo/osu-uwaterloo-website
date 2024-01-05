// Routing and transition

const supportViewTransition = document.startViewTransition;
if (!supportViewTransition) document.startViewTransition = (fn) => fn();

class Router {
	constructor(onBeforeNavigate = null, onAfterNavigate = null) {
		if (window.Router) {
			return window.Router;
		}
		window.Router = this;
		this.onBeforeNavigate = onBeforeNavigate;
		this.onAfterNavigate = onAfterNavigate;
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
		if (this.onBeforeNavigate) this.onBeforeNavigate();
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
			// run onAfterNavigate
			if (this.onAfterNavigate) this.onAfterNavigate();
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


	static init(onBeforeNavigate = null, onAfterNavigate = null) {
		new Router(onBeforeNavigate, onAfterNavigate);
	}
}

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
				duration: 350,
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


// Triangles animation
class Triangles {
	equalateralRatio = 0.8660254037844386;
	baseVelocity = 100;
	triangleSize = 40;
	spawnRatio = 1;
	baseColor = [241, 200, 20];

	constructor(svg, options = {}) {
		this.svg = svg;
		const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
		this.width = viewBox[2];
		this.height = viewBox[3];
		this.triangleSize = this.height * 0.4;
		this.maxCount = Math.round(this.width * this.height / (this.triangleSize * this.triangleSize) * this.spawnRatio * 7);
		//this.baseVelocity = this.height * 0.1;
		this.init();
		return this;
	}

	init() {
		this.svg.innerHTML = '';
		this.addTriangles(true);
		window.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
		this.animation = requestAnimationFrame(this.tick.bind(this));
	}

	tick(time) {
		if (!this.lastTime) this.lastTime = time;
		const elapsed = time - this.lastTime;
		this.lastTime = time;
		if (!this.svg) {
			this.destory();
			return;
		}
		this.update(elapsed);
		this.animation = requestAnimationFrame(this.tick.bind(this));
	}

	update(elapsed) {
		const triangles = this.svg.querySelectorAll('polygon');
		const movedDistance = elapsed * 1 * this.baseVelocity / (this.height / this.triangleSize) / 2000;
		for (const triangle of triangles) {
			let y = Number(triangle.getAttribute('y'));
			const scale = Number(triangle.getAttribute('scale'));
			const size = Number(triangle.getAttribute('size'));
			y -= Math.max(0.35, scale) * movedDistance;
			if (y < - size / 2) {
				triangle.remove();
				this.addTriangle();
				continue;
			}
			triangle.setAttribute('y', y);
			this.renderTriangle(triangle);
		}

	}

	addTriangles(randomY = false) {
		const currentCount = this.svg.childElementCount;
		for (let i = 0; i < this.maxCount - currentCount; i++) {
			this.addTriangle(randomY);
		}
	}

	addTriangle(randomY = false) {
		const stdDev = 0.16;
		const mean = 0.5;
		const [u1, u2] = [Math.random(), Math.random()];
		const randStdNormal = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
		const scale = Math.max(1 * (mean + stdDev * randStdNormal), 0.1);
		const size = this.triangleSize * scale;
		const x = this.randomBetween(- size * this.equalateralRatio, this.width + size * this.equalateralRatio);
		const y = randomY ? this.randomBetween(- size / 2, this.height + size) : this.height + size;
		const fill = this.randomShade();
		const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('x', x);
		polygon.setAttribute('y', y);
		polygon.setAttribute('scale', scale);
		polygon.setAttribute('size', size);
		polygon.setAttribute('fill', fill);

		this.renderTriangle(polygon);
		this.svg.appendChild(polygon);
	}

	renderTriangle(polygonDom) {
		if (!polygonDom) return;
		const x = Number(polygonDom.getAttribute('x'));
		const y = Number(polygonDom.getAttribute('y'));
		const size = Number(polygonDom.getAttribute('size'));
		const x1 = x;
		const y1 = y - size;
		const x2 = x - size * this.equalateralRatio;
		const y2 = y + size / 2;
		const x3 = x + size * this.equalateralRatio;
		const y3 = y + size / 2;
		polygonDom.setAttribute('points', `${x1},${y1} ${x2},${y2} ${x3},${y3}`);
	}

	destory() {
		cancelAnimationFrame(this.animation);
		this.svg = null;
		window.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
	}

	randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	randomShade() {
		const shade = 1.025 + (Math.random() - 0.5) * 0.175;
		const color = this.baseColor.map(c => Math.round(c * shade));
		return `rgb(${color.join(',')})`;
	}

	onVisibilityChange() {
		if (document.hidden) {
			cancelAnimationFrame(this.animation);
		} else {
			this.lastTime = null;
			this.animation = requestAnimationFrame(this.tick.bind(this));
		}
	}
}


// Initialzaion
const initHomeCookieTriangleAnimation = () => {
	if (!document.querySelector('#logo .triangles')) return;
	window.homeCookieTriangleAnimation = new Triangles(document.querySelector('#logo .triangles'));
}

document.addEventListener('DOMContentLoaded', () => {
	initHomeCookieTriangleAnimation();
});

Router.init(() => {
	window.homeCookieTriangleAnimation?.destory();

}, () => {
	initHomeCookieTriangleAnimation();
});