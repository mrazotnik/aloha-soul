(function () {
'use strict';
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.lang = document.documentElement.lang || 'ru';
var curtain = document.getElementById('curtain');
var root = document.documentElement;
var opened = false, guard = null;
function flip() {
var a = document.querySelector('#cmark img');
var b = document.querySelector('.nav__mark img');
if (!a || !b) return;
var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
if (!ra.width || !rb.width) return;
curtain.style.setProperty('--fx', (rb.left + rb.width / 2 - ra.left - ra.width / 2).toFixed(1) + 'px');
curtain.style.setProperty('--fy', (rb.top + rb.height / 2 - ra.top - ra.height / 2).toFixed(1) + 'px');
curtain.style.setProperty('--fs', (rb.width / ra.width).toFixed(4));
}
function retire() { if (curtain && curtain.parentNode) { curtain.remove(); } }
function openCurtain() {
if (opened) return;
opened = true;
clearTimeout(guard);
flip();
curtain.classList.add('is-up');
setTimeout(function () { root.classList.add('is-open'); }, 1060);  // знак сел в шапку
setTimeout(retire, 2300);
}
function skip() {
if (!curtain) return;
root.classList.add('is-fast');
openCurtain();
curtain.classList.add('is-skip');
root.classList.add('is-open');
setTimeout(retire, 420);
}
if (reduced || !curtain) {
root.classList.add('is-open');
if (curtain) { curtain.remove(); }
} else {
requestAnimationFrame(function () { curtain.classList.add('is-ready'); });
guard = setTimeout(openCurtain, 3200);       // страховка, если load не придёт
addEventListener('load', function () { setTimeout(openCurtain, 620); });
['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (e) {
addEventListener(e, skip, { once: true, passive: true });
});
}
var nodes = [].slice.call(document.querySelectorAll('[data-anim]'));
if (reduced || !('IntersectionObserver' in window)) {
nodes.forEach(function (n) { n.classList.add('is-in'); });
} else {
var io = new IntersectionObserver(function (es, o) {
es.forEach(function (e) {
if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); }
});
}, { rootMargin: '0px 0px -5% 0px' });
nodes.forEach(function (n) { io.observe(n); });
}
var head = document.getElementById('head');
var bar = document.getElementById('headbar');
var lastY = window.scrollY, ticking = false;
function onScroll() {
var y = Math.max(0, window.scrollY);
var max = document.documentElement.scrollHeight - innerHeight;
head.classList.toggle('is-solid', y > 12);
head.classList.toggle('is-hidden', y > innerHeight * 0.9 && y > lastY + 6);
if (bar) { bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0); }
lastY = y;
ticking = false;
}
function queue() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
onScroll();
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);
var slides = [].slice.call(document.querySelectorAll('.slide'));
var dots = [].slice.call(document.querySelectorAll('.dot'));
var cur = 0, timer = null, HOLD = 5200, FADE = 1200;
function paint(i) {
dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
}
function go(next) {
if (next === cur || !slides.length) return;
var prev = slides[cur], el = slides[next];
var img = el.querySelector('img');
if (img) { img.removeAttribute('loading'); }
el.style.transition = 'opacity ' + FADE + 'ms cubic-bezier(.16,1,.3,1)';
el.classList.add('is-front');
el.classList.add('is-active');
if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
setTimeout(function () {
prev.style.transition = 'none';
prev.classList.remove('is-active');
void prev.offsetWidth;
prev.style.transition = '';
el.classList.remove('is-front');
}, FADE);
cur = next; paint(cur);
}
function loop() { timer = setTimeout(function () { go((cur + 1) % slides.length); loop(); }, HOLD); }
if (slides.length > 1 && !reduced) {
slides.forEach(function (s) { s.style.transition = 'opacity ' + FADE + 'ms cubic-bezier(.16,1,.3,1)'; });
paint(0); loop();
dots.forEach(function (d, k) {
d.addEventListener('click', function () { clearTimeout(timer); go(k); loop(); });
});
document.addEventListener('visibilitychange', function () {
if (document.hidden) { clearTimeout(timer); } else { clearTimeout(timer); loop(); }
});
}
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
a.addEventListener('click', function (e) {
var t = document.querySelector(a.getAttribute('href'));
if (!t) return;
e.preventDefault();
var y = t.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement)
.getPropertyValue('--head-h')) || 70);
scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
});
});
})();