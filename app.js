/* ============================================================
   Beacon Hacks — site behavior
   Ported from the "Beacon Hacks v2" Claude Design artboard.
   ============================================================ */
(function () {
  'use strict';

  var EVENT_START = new Date('2027-01-30T08:30:00-08:00').getTime();

  /* Where the application form posts. Leave null and the wizard runs
     locally (shows the confirmation without sending anything). Set it to
     a URL — a Formspree/Google Form/Worker endpoint — to go live. */
  var APPLY_ENDPOINT = null;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */
  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function initCountdown() {
    var cells = {
      d: $('[data-cd="d"]'), h: $('[data-cd="h"]'),
      m: $('[data-cd="m"]'), s: $('[data-cd="s"]')
    };
    if (!cells.d) return;

    function tick() {
      var left = Math.max(0, EVENT_START - Date.now());
      cells.d.textContent = pad(Math.floor(left / 864e5));
      cells.h.textContent = pad(Math.floor(left / 36e5) % 24);
      cells.m.textContent = pad(Math.floor(left / 6e4) % 60);
      cells.s.textContent = pad(Math.floor(left / 1e3) % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     Scroll motion
     --------------------------------------------------------- */
  function show(el) { el.style.opacity = '1'; el.style.transform = 'none'; }

  function finishCount(el) {
    el.textContent = (el.getAttribute('data-prefix') || '') +
                     el.getAttribute('data-count') +
                     (el.getAttribute('data-suffix') || '');
  }

  function initMotion() {
    // Auto-assign reveal + staggered delay to direct children of [data-stagger].
    $$('[data-stagger] > *').forEach(function (el, i) {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '1');
      if (!el.hasAttribute('data-delay')) el.setAttribute('data-delay', String(Math.min(i, 9) * 70));
    });

    var reveals  = $$('[data-reveal]');
    var counters = $$('[data-count]');
    var scrubs   = $$('[data-scrub]');
    var dots     = $$('[data-dot]');
    var parallax = $$('[data-parallax]');
    var sections = $$('[data-section]');

    var strip   = $('[data-hstrip]');
    var rail    = $('[data-rail]');
    var bar     = $('[data-bar]');
    var hero    = $('[data-hero]');
    var labelEl = $('[data-label]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(show);
      counters.forEach(finishCount);
      dots.forEach(function (el) { el.style.background = 'var(--amber)'; el.style.borderColor = 'var(--amber)'; });
      if (rail) rail.style.height = '100%';
      return;
    }

    var vh = function () { return window.innerHeight || 800; };

    /* --- reveals (observer driven) --- */
    var viewH = vh();
    var hidden = [];
    reveals.forEach(function (el) {
      el.style.transition = 'opacity .75s cubic-bezier(.2,.7,.25,1), transform .75s cubic-bezier(.2,.7,.25,1)';
      el.style.transitionDelay = (el.getAttribute('data-delay') || 0) + 'ms';
      if (el.getBoundingClientRect().top < viewH * 0.98) { show(el); return; }
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      hidden.push(el);
    });

    // Safety net: if the observer never fires, reveal everything anyway.
    var ioProven = false;
    var net = setTimeout(function () {
      if (ioProven) return;
      hidden.forEach(show);
      counters.forEach(finishCount);
    }, 700);

    var io = new IntersectionObserver(function (entries) {
      ioProven = true; clearTimeout(net);
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    hidden.forEach(function (el) { io.observe(el); });

    /* --- counters --- */
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; cio.unobserve(el);
        var to = parseFloat(el.getAttribute('data-count'));
        var pre = el.getAttribute('data-prefix') || '';
        var suf = el.getAttribute('data-suffix') || '';
        var t0 = performance.now();
        (function tick(t) {
          var p = Math.min(1, (t - t0) / 1100);
          el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });

    /* --- header section label --- */
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.__vis = e.isIntersecting; });
      var label = 'BUILD WHAT LIGHTS THE WAY';
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].__vis) { label = sections[i].getAttribute('data-section'); break; }
      }
      if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
    }, { rootMargin: '-15% 0px -70% 0px' });
    sections.forEach(function (sec) { lio.observe(sec); });

    /* --- only scrub what is near the viewport --- */
    var live = new Set();
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) live.add(e.target); else live.delete(e.target);
      });
    }, { rootMargin: '30% 0px 30% 0px' });
    scrubs.forEach(function (el) { el.style.willChange = 'transform'; nio.observe(el); });
    dots.forEach(function (el) { nio.observe(el); });

    var railVisible = false;
    if (rail && rail.parentElement) {
      new IntersectionObserver(function (es) { railVisible = es[0].isIntersecting; },
        { rootMargin: '20% 0px 20% 0px' }).observe(rail.parentElement);
    }
    var stripVisible = false;
    if (strip) {
      new IntersectionObserver(function (es) { stripVisible = es[0].isIntersecting; },
        { rootMargin: '20% 0px 20% 0px' }).observe(strip);
    }

    /* --- the frame loop: read everything, then write everything --- */
    var lastY = null, lastStrip = -1;

    function frame() {
      requestAnimationFrame(frame);

      var view = vh();
      var y = window.scrollY || window.pageYOffset || 0;
      if (y === lastY) return;
      lastY = y;

      // READS
      var reads = [];
      live.forEach(function (el) { reads.push([el, el.getBoundingClientRect().top]); });
      var railRect = (railVisible && rail && rail.parentElement) ? rail.parentElement.getBoundingClientRect() : null;
      var stripRect = (stripVisible && strip) ? strip.getBoundingClientRect() : null;
      var stripMax = stripRect ? Math.max(0, strip.scrollWidth - strip.clientWidth) : 0;
      var total = Math.max(1, document.documentElement.scrollHeight - view);

      // WRITES
      if (bar) bar.style.width = Math.min(100, (y / total) * 100).toFixed(1) + '%';

      var hp = Math.min(1, y / (view * 0.9));
      if (hero) {
        hero.style.opacity = (1 - hp * 0.8).toFixed(3);
        hero.style.transform = 'translate3d(0,' + (hp * -60).toFixed(1) + 'px,0) scale(' + (1 - hp * 0.04).toFixed(3) + ')';
      }

      parallax.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translate3d(0,' + (y * f).toFixed(1) + 'px,0) rotate(' + (y * 0.02).toFixed(2) + 'deg)';
      });

      reads.forEach(function (pair) {
        var el = pair[0], top = pair[1];
        if (el.hasAttribute('data-dot')) {
          var lit = top < view * 0.6;
          if (el.__lit !== lit) {
            el.__lit = lit;
            el.style.background = lit ? '#ffb020' : '#0a0a0b';
            el.style.borderColor = lit ? '#ffb020' : 'rgba(242,239,232,.28)';
            el.style.boxShadow = lit ? '0 0 12px rgba(255,176,32,.55)' : 'none';
          }
          return;
        }
        var p = Math.min(1, Math.max(0, (view * 0.92 - top) / (view * 0.34)));
        var off = Math.pow(1 - p, 3);
        el.style.transform = el.getAttribute('data-scrub') === 'x'
          ? 'translate3d(' + (off * 46).toFixed(1) + 'px,0,0)'
          : 'translate3d(0,' + (off * 22).toFixed(1) + 'px,0)';
      });

      if (railRect) {
        var rp = Math.min(1, Math.max(0, (view * 0.6 - railRect.top) / Math.max(1, railRect.height)));
        rail.style.height = (rp * 100).toFixed(1) + '%';
      }

      if (stripRect) {
        var t = Math.min(1, Math.max(0, (view - stripRect.top) / (view + stripRect.height)));
        var target = Math.round(stripMax * t);
        if (Math.abs(target - lastStrip) > 1) { strip.scrollLeft = target; lastStrip = target; }
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     FAQ — one open at a time
     --------------------------------------------------------- */
  function initFaq() {
    var list = $('[data-faq]');
    if (!list) return;
    var items = $$('.faq-item', list);
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  }

  /* ---------------------------------------------------------
     Apply wizard
     --------------------------------------------------------- */
  function initApply() {
    var modal = $('[data-modal]');
    if (!modal) return;

    var card      = $('.modal-card', modal);
    var form      = $('[data-wizard]', modal);
    var panes     = $$('[data-pane]', modal);
    var segs      = $$('[data-bar-seg]', modal);
    var stepLabel = $('[data-step-label]', modal);
    var nav       = $('[data-nav]', modal);
    var backBtn   = $('[data-back]', modal);
    var nextBtn   = $('[data-next]', modal);
    var errorEl   = $('[data-error]', modal);
    var emailOut  = $('[data-email-out]', modal);

    var step = 1;
    var first = null;
    var coc = false;
    var lastFocus = null;

    function paneFor(n) { return panes.filter(function (p) { return p.getAttribute('data-pane') === String(n); })[0]; }

    function render() {
      panes.forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== String(step); });
      segs.forEach(function (s, i) { s.classList.toggle('is-on', step >= i + 1); });
      stepLabel.textContent = step === 4 ? 'APPLICATION SENT' : 'STEP ' + step + ' OF 3';
      nav.hidden = step >= 4;
      backBtn.hidden = step <= 1;
      nextBtn.textContent = step === 3 ? 'Submit application' : 'Next';
      clearError();
    }

    function clearError() {
      errorEl.hidden = true;
      errorEl.textContent = '';
      $$('.field', modal).forEach(function (f) { f.classList.remove('is-invalid'); });
    }

    function fail(message, field) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (field) {
        field.closest('.field').classList.add('is-invalid');
        field.focus();
      }
      return false;
    }

    function validate() {
      clearError();
      if (step === 1) {
        var name = form.elements.name, email = form.elements.email, school = form.elements.school;
        if (!name.value.trim())   return fail('Add your full name so we know who is applying.', name);
        if (!email.checkValidity() || !email.value.trim()) return fail('That email does not look right — we send decisions there.', email);
        if (!school.value.trim()) return fail('Tell us your school and grade.', school);
      }
      if (step === 2 && first === null) {
        return fail('Pick one so we can match you with the right mentors.');
      }
      if (step === 3 && !coc) {
        return fail('You need to agree to the code of conduct to apply.');
      }
      return true;
    }

    function collect() {
      return {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        school: form.elements.school.value.trim(),
        firstHackathon: first,
        idea: form.elements.idea.value.trim(),
        shirt: form.elements.shirt.value,
        diet: form.elements.diet.value.trim()
      };
    }

    function submit() {
      var data = collect();
      emailOut.textContent = data.email || 'your inbox';

      if (!APPLY_ENDPOINT) { step = 4; render(); return; }

      nextBtn.disabled = true;
      nextBtn.textContent = 'Sending…';
      fetch(APPLY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        step = 4; render();
      }).catch(function () {
        fail('That did not go through. Try again, or email team@beaconhacks.org.');
      }).then(function () {
        nextBtn.disabled = false;
        if (step !== 4) nextBtn.textContent = 'Submit application';
      });
    }

    function open(prefillEmail) {
      lastFocus = document.activeElement;
      step = 1;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      if (prefillEmail) form.elements.email.value = prefillEmail;
      render();
      var target = form.elements.name;
      if (target) setTimeout(function () { target.focus(); }, 0);
    }

    function close() {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('[data-open-apply]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(); });
    });
    $$('[data-close-apply]', modal).forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    $('[data-modal-scrim]', modal).addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      // Keep focus inside the dialog.
      var focusables = $$('a[href], button:not([disabled]), input, select, textarea', card)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var firstEl = focusables[0], lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    });

    $$('[data-first]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () {
        first = btn.getAttribute('data-first') === 'yes';
        $$('[data-first]', modal).forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        clearError();
      });
    });

    var cocBtn = $('[data-coc]', modal);
    cocBtn.addEventListener('click', function () {
      coc = !coc;
      cocBtn.setAttribute('aria-pressed', String(coc));
      clearError();
    });

    backBtn.addEventListener('click', function () {
      step = Math.max(1, step - 1);
      render();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      if (step === 3) { submit(); return; }
      step = step + 1;
      render();
      var firstField = $('input, textarea', paneFor(step));
      if (firstField) firstField.focus();
    });

    // The band above the FAQ hands its email straight into the wizard.
    var lead = $('[data-apply-form]');
    if (lead) {
      lead.addEventListener('submit', function (e) {
        e.preventDefault();
        open(lead.elements.email.value.trim());
      });
    }

    render();
  }

  /* ---------------------------------------------------------
     Sponsor prospectus placeholder
     --------------------------------------------------------- */
  function initProspectus() {
    var link = $('[data-prospectus]');
    if (!link) return;
    link.addEventListener('click', function (e) {
      if (link.getAttribute('href') !== '#') return;
      e.preventDefault();
      window.location.href = 'mailto:sponsors@beaconhacks.org?subject=Beacon%20Hacks%20prospectus';
    });
  }

  /* ---------------------------------------------------------
     Venue photos — fall back to the placeholder look if a file
     is missing, so the strip never shows broken images.
     --------------------------------------------------------- */
  function initVenueShots() {
    $$('.venue-shot img').forEach(function (img) {
      var fail = function () {
        var fig = img.closest('.venue-shot');
        if (fig) fig.classList.add('is-empty');
        if (img.parentNode) img.parentNode.removeChild(img);
      };
      img.addEventListener('error', fail);
      // The error may already have fired before this ran.
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }

  function boot() {
    initCountdown();
    initVenueShots();
    initMotion();
    initFaq();
    initApply();
    initProspectus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
