/* The door: panels drop in, then the door lifts once.
   Numbers: count up once when the band first enters view.
   Both are no-ops under prefers-reduced-motion — the CSS prints their final state. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the door ---------- */
  var door = document.querySelector('.door');
  if (door) {
    var panels = Array.prototype.slice.call(door.querySelectorAll('.panel'));
    if (REDUCED) {
      panels.forEach(function (p) { p.style.opacity = '1'; });
    } else {
      panels.forEach(function (p, i) {
        p.style.opacity = '0';
        p.style.transform = 'translateY(-18px)';
        p.style.transition = 'opacity .42s cubic-bezier(.22,1,.36,1) ' + (0.12 + i * 0.09) + 's, transform .42s cubic-bezier(.22,1,.36,1) ' + (0.12 + i * 0.09) + 's';
      });

      var opened = false;
      function openDoor() {
        if (opened) return;
        opened = true;
        panels.forEach(function (p) {
          p.style.opacity = '1';
          p.style.transform = 'none';
        });
        /* then the whole sectional door lifts once, out of frame */
        window.setTimeout(function () {
          door.classList.add('door--lift');
        }, 780);
      }

      if ('IntersectionObserver' in window) {
        var dio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { openDoor(); dio.disconnect(); }
          });
        }, { threshold: 0.35 });
        dio.observe(door);
      } else {
        openDoor();
      }
    }
  }

  /* ---------- the numbers ---------- */
  var figs = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (!figs.length) return;

  function run(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (REDUCED || isNaN(target)) { el.textContent = target.toFixed(decimals); return; }
    var start = null;
    var DUR = 900;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / DUR, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = (decimals ? target.toFixed(decimals) : String(target));
    }
    window.requestAnimationFrame(step);
  }

  if (REDUCED || !('IntersectionObserver' in window)) {
    figs.forEach(run);
    return;
  }
  var nio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(e.target); nio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  figs.forEach(function (f) { nio.observe(f); });
})();
