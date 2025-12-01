import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_KVI-fRWo.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/keystatic/_---params_.astro.mjs');
const _page3 = () => import('./pages/blog/pdfs.astro.mjs');
const _page4 = () => import('./pages/blog/_slug_.astro.mjs');
const _page5 = () => import('./pages/blog.astro.mjs');
const _page6 = () => import('./pages/games/dino.astro.mjs');
const _page7 = () => import('./pages/games/surf.astro.mjs');
const _page8 = () => import('./pages/games.astro.mjs');
const _page9 = () => import('./pages/keystatic/_---params_.astro.mjs');
const _page10 = () => import('./pages/photography/_album_.astro.mjs');
const _page11 = () => import('./pages/photography.astro.mjs');
const _page12 = () => import('./pages/recommendations.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["node_modules/@keystatic/astro/internal/keystatic-api.js", _page2],
    ["src/pages/blog/pdfs.astro", _page3],
    ["src/pages/blog/[slug].astro", _page4],
    ["src/pages/blog/index.astro", _page5],
    ["src/pages/games/dino.astro", _page6],
    ["src/pages/games/surf.astro", _page7],
    ["src/pages/games/index.astro", _page8],
    ["node_modules/@keystatic/astro/internal/keystatic-astro-page.astro", _page9],
    ["src/pages/photography/[album].astro", _page10],
    ["src/pages/photography/index.astro", _page11],
    ["src/pages/recommendations/index.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "663f7553-4c17-4100-bf4f-7fbefac9b57b"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
