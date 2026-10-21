/* ============================================================
   motion.js — the whole page's choreography
   1. scroll progress line + header condense
   2. the garage door opens as you scroll (the hero IS the interaction)
   3. cards tilt toward the pointer and light up under it
   4. odometer figures
   5. magnetic call buttons
   transform/opacity only; all of it off under prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progressBar');
  var art = document.querySelector('.hero__art');
  var hero = document.querySelector('.hero');
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

    if (art && hero) {
      var travel = Math.max(hero.offsetHeight * 0.95, 1);
      var open = Math.min(Math.max(y / travel, 0), 1);
      art.style.setProperty('--door-open', open.toFixed(3));
      art.style.transform = 'translate3d(0,' + (-Math.min(y, 700) * 0.05).toFixed(1) + 'px,0)';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }

  if (REDUCED) {
    if (art) art.style.setProperty('--door-open', '1');
    if (header) header.classList.add('is-scrolled');
    if (bar) {
      var span0 = document.documentElement.scrollHeight - window.innerHeight;
      var p0 = span0 > 0 ? Math.min(Math.max(window.pageYOffset / span0, 0), 1) : 0;
      bar.style.transform = 'scaleX(' + p0.toFixed(4) + ')';
    }
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  }

  /* ---------- cards: tilt + spotlight ---------- */
  if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
      var tilt = card.querySelector('.card__tilt');
      if (!tilt) return;
      var raf = 0, px = 0, py = 0;

      function apply() {
        raf = 0;
        var r = card.getBoundingClientRect();
        var dx = (px - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (py - (r.top + r.height / 2)) / (r.height / 2);
        var max = 5.5;
        tilt.style.setProperty('--ry', (dx * max).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (-dy * max).toFixed(2) + 'deg');
        card.style.setProperty('--mx', ((px - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((py - r.top) / r.height * 100).toFixed(1) + '%');
      }

      card.addEventListener('pointermove', function (e) {
        px = e.clientX; py = e.clientY;
        if (!raf) raf = window.requestAnimationFrame(apply);
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--ry', '0deg');
        tilt.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- odometer ---------- */
  function buildOdometer(el) {
    var target = el.getAttribute('data-count');
    if (!target) return null;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var text = decimals ? Number(target).toFixed(decimals) : String(target);
    el.textContent = '';
    el.setAttribute('aria-label', text);
    var wrap = document.createElement('span');
    wrap.className = 'odo';
    wrap.setAttribute('aria-hidden', 'true');

    var cols = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (/\d/.test(ch)) {
        var col = document.createElement('span');
        col.className = 'odo__col';
        var strip = document.createElement('span');
        strip.className = 'odo__strip';
        for (var d = 0; d <= 9; d++) {
          var sp = document.createElement('span');
          sp.textContent = String(d);
          strip.appendChild(sp);
        }
        col.appendChild(strip);
        wrap.appendChild(col);
        cols.push({ strip: strip, digit: parseInt(ch, 10) });
      } else {
        var st = document.createElement('span');
        st.className = 'odo__static';
        st.textContent = ch;
        wrap.appendChild(st);
        cols.push(null);
      }
    }
    el.appendChild(wrap);
    return cols;
  }

  function spin(cols) {
    if (!cols) return;
    var delay = 0;
    cols.forEach(function (c) {
      if (!c) return;
      delay += 60;
      window.setTimeout(function () {
        c.strip.style.transform = 'translate3d(0,' + (-c.digit) + 'em,0)';
      }, delay);
    });
  }

  var figs = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (figs.length) {
    var built = figs.map(function (f) { return { el: f, cols: buildOdometer(f) }; });
    if (REDUCED || !('IntersectionObserver' in window)) {
      built.forEach(function (b) {
        if (!b.cols) return;
        b.cols.forEach(function (c) {
          if (!c) return;
          c.strip.style.transition = 'none';
          c.strip.style.transform = 'translate3d(0,' + (-c.digit) + 'em,0)';
        });
      });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var hit = built.filter(function (b) { return b.el === e.target; })[0];
          if (hit) {
            spin(hit.cols);
            var li = hit.el.closest('li');
            if (li) window.setTimeout(function () { li.classList.add('is-counted'); }, 1200);
          }
          io.unobserve(e.target);
        });
      }, { threshold: 0.55 });
      figs.forEach(function (f) { io.observe(f); });
    }
  }

  /* ---------- magnetic solid buttons ---------- */
  if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn--solid'), function (btn) {
      var raf = 0, px = 0, py = 0, r = null;
      function apply() {
        raf = 0;
        if (!r) return;
        var dx = (px - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (py - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = 'translate3d(' + (dx * 4).toFixed(1) + 'px,' + (dy * 3 - 1).toFixed(1) + 'px,0)';
      }
      btn.addEventListener('pointerenter', function () { r = btn.getBoundingClientRect(); }, { passive: true });
      btn.addEventListener('pointermove', function (e) {
        px = e.clientX; py = e.clientY;
        if (!raf) raf = window.requestAnimationFrame(apply);
      }, { passive: true });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }
})();
