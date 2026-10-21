/* The door's arrival: panels drop in, once, when the hero is in view.
   The opening itself is scroll-driven in motion.js — this only handles the
   first paint so the door is never an empty frame. No counters live here.
   motion.js owns [data-count]. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var door = document.querySelector('.door');
  if (!door) return;

  var panels = Array.prototype.slice.call(door.querySelectorAll('.panel'));
  if (!panels.length) return;

  if (REDUCED) {
    panels.forEach(function (p) { p.style.opacity = '1'; p.style.transform = ''; });
    return;
  }

  panels.forEach(function (p, i) {
    p.style.opacity = '0';
    p.style.transform = 'translateY(-18px)';
    p.style.transition = 'opacity .42s cubic-bezier(.22,1,.36,1) ' + (0.1 + i * 0.08) + 's, transform .42s cubic-bezier(.22,1,.36,1) ' + (0.1 + i * 0.08) + 's';
  });

  var done = false;
  function reveal() {
    if (done) return;
    done = true;
    panels.forEach(function (p) { p.style.opacity = '1'; p.style.transform = ''; p.style.transition = ''; });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(door);
  } else {
    reveal();
  }
})();
