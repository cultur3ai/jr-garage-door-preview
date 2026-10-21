/* Page-level motion: the scroll progress line, the header tightening after the
   hero, and a shallow parallax on the door. One rAF-throttled scroll listener,
   passive, transform-only. Nothing here runs under prefers-reduced-motion. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progressBar');
  var art = document.querySelector('.hero__art');
  var ticking = false;

  function paint() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (header) header.classList.toggle('is-scrolled', y > 48);

    if (bar) {
      var span = document.documentElement.scrollHeight - window.innerHeight;
      var p = span > 0 ? Math.min(Math.max(y / span, 0), 1) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }

    if (art) {
      var t = Math.min(y, 700);
      art.style.transform = 'translate3d(0,' + (-t * 0.05).toFixed(1) + 'px,0)';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }

  if (REDUCED) {
    /* static but correct: the bar shows real position, nothing else moves */
    if (bar) {
      var span = document.documentElement.scrollHeight - window.innerHeight;
      var p = span > 0 ? Math.min(Math.max(window.pageYOffset / span, 0), 1) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    if (header) header.classList.add('is-scrolled');
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();

  /* the numbers get a small pop when their count finishes */
  var figs = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (figs.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var li = e.target.closest('li');
        window.setTimeout(function () { if (li) li.classList.add('is-counted'); }, 950);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    figs.forEach(function (f) { io.observe(f); });
  }
})();
