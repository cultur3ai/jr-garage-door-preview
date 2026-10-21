/* Reveal on scroll — arrives softly, leaves instantly.
   IntersectionObserver adds .is-in; a rAF sweep removes it only once the element
   is fully above the viewport, so scrolling back up replays the arrival while
   scrolling down never fights the hand. Exit has a 0s duration in the CSS. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGGER = 32;
  var STAGGER_MAX = 190;
  var ENTER_AT = 0.9;
  var DEAD_BAND = 60;

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!nodes.length) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    nodes.forEach(function (n) { n.classList.add('is-in'); });
    return;
  }

  /* stagger within a batch: each element waits its turn, capped */
  var pending = 0;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      if (entry.isIntersecting) {
        var delay = Math.min(pending * STAGGER, STAGGER_MAX);
        pending += 1;
        window.setTimeout(function () { el.classList.add('is-in'); }, delay);
      }
    });
  }, { threshold: ENTER_AT, rootMargin: '0px 0px -6% 0px' });

  nodes.forEach(function (n) { io.observe(n); });

  var ticking = false;
  function sweep() {
    ticking = false;
    var band = window.innerHeight + DEAD_BAND;
    nodes.forEach(function (n) {
      if (!n.classList.contains('is-in')) return;
      if (n.getBoundingClientRect().bottom < -DEAD_BAND) n.classList.remove('is-in');
    });
    /* safety: anything above the fold on load is already in */
    if (band < 0) return;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(sweep);
  }, { passive: true });

  /* first paint: reveal whatever is already on screen without waiting */
  window.requestAnimationFrame(function () {
    nodes.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) n.classList.add('is-in');
    });
  });
})();
