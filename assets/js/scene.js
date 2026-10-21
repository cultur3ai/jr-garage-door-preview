/* ============================================================
   scene.js — the hero story, once per load.

   0.0s  door sits closed
   0.6s  the spring snaps: spark, shudder, the bottom panel drops out of line
   1.7s  the door jams part-way up
   2.3s  a van pulls in and parks clear of the opening
   3.5s  the mechanic walks to the door
   4.4s  the fix goes in — sparks, the panel lifts back into line
   5.4s  the van pulls away
   5.9s  the door rolls up clean and the number is revealed
   6.9s  control passes back to the scroll

   Skipped entirely under prefers-reduced-motion (CSS hides the van and the
   mechanic and prints the door open). A scroll of more than 140px during
   playback jumps straight to the end — nobody should be trapped in a story.
   ============================================================ */
(function () {
  'use strict';

  var svg = document.querySelector('.scene');
  var art = document.querySelector('.hero__art');
  if (!svg || !art) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function setOpen(v) { art.style.setProperty('--door-open', v); }
  function cls(name, on) { svg.classList.toggle(name, !!on); }

  if (REDUCED) {
    setOpen('1');
    svg.classList.add('scene--done');
    return;
  }

  var timers = [];
  var finished = false;

  function at(ms, fn) { timers.push(window.setTimeout(fn, ms)); }

  function clearAll() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function finish(instant) {
    if (finished) return;
    finished = true;
    clearAll();
    root.dataset.scene = 'done';
    ['scene--snap', 'scene--jam', 'scene--arrive', 'scene--mechanic', 'scene--fix', 'scene--leave']
      .forEach(function (c) { svg.classList.remove(c); });
    svg.classList.add('scene--done');
    setOpen('1');
    if (instant) {
      /* let the scroll listener take over from here */
      window.dispatchEvent(new Event('scroll'));
    }
  }

  function play() {
    if (finished) return;
    root.dataset.scene = 'running';
    setOpen('0');

    at(600, function () { cls('scene--snap', true); });
    at(1300, function () { cls('scene--snap', false); cls('scene--jam', true); setOpen('0.16'); });
    at(2300, function () { cls('scene--arrive', true); });
    at(3500, function () { cls('scene--mechanic', true); });
    at(4400, function () { cls('scene--fix', true); });
    at(5400, function () { cls('scene--fix', false); cls('scene--jam', false); cls('scene--leave', true); });
    at(5900, function () { setOpen('0.55'); });
    at(6350, function () { setOpen('1'); });
    at(6900, function () {
      cls('scene--leave', false);
      cls('scene--mechanic', false);
      finish(false);
    });
  }

  /* start when the hero is actually in view */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { play(); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(svg);
  } else {
    play();
  }

  /* a deliberate scroll skips the story rather than fighting it */
  var startY = window.pageYOffset;
  function maybeSkip() {
    if (finished) return;
    if (Math.abs(window.pageYOffset - startY) > 140) finish(true);
  }
  window.addEventListener('scroll', maybeSkip, { passive: true });

  root.dataset.scene = root.dataset.scene || 'idle';
})();
