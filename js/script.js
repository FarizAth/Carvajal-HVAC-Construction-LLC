/* ==========================================================================
   CARVAJAL HVAC CONSTRUCTION LLC — Site interactions
   Vanilla JS. No frameworks. Progressive enhancement throughout:
   every feature here is additive — nav links, forms, and content all
   work with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    var body = document.body;
    if (!toggle || !links) return;

    var focusable = null;
    var lastFocused = null;

    function openMenu() {
      links.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('menu-open');
      lastFocused = document.activeElement;
      focusable = links.querySelectorAll('a, button');
      if (focusable.length) focusable[0].focus();
      document.addEventListener('keydown', onKeydown);
    }
    function closeMenu() {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused) lastFocused.focus();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab' && focusable && focusable.length) {
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('is-open')) closeMenu(); else openMenu();
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    // Click outside (click on backdrop area of the fullscreen nav itself, outside the list items)
    links.addEventListener('click', function (e) {
      if (e.target === links) closeMenu();
    });

    // Sticky header shadow / condense on scroll
    var header = document.querySelector('.site-header');
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      if (!header) return;
      if (window.scrollY > 12) header.style.boxShadow = '0 8px 24px rgba(0,0,0,0.28)';
      else header.style.boxShadow = 'none';
      lastY = window.scrollY;
    }, { passive: true });

    // Active link based on current page
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('is-active');
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el, i) {
      el.style.setProperty('--i', i % 8);
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Custom cursor (desktop only, purely additive)
     --------------------------------------------------------------------- */
  function initCursor() {
    if (isTouch || reducedMotion) return;
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('has-custom-cursor');

    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var interactive = 'a, button, input, textarea, select, .gallery-item, [data-cursor-hover]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactive)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactive)) ring.classList.remove('is-active');
    });
    document.addEventListener('mousedown', function () { ring.style.transform += ' scale(0.85)'; });
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons (subtle, desktop only)
     --------------------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch || reducedMotion) return;
    var els = document.querySelectorAll('[data-magnetic]');
    els.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        items.forEach(function (i) {
          i.classList.remove('is-open');
          var btn = i.querySelector('.faq-q');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Hero video: pause when off-screen / respect reduced motion / connection
     --------------------------------------------------------------------- */
  function initHeroVideo() {
    var video = document.querySelector('.hero__media video');
    if (!video) return;
    if (reducedMotion) { video.removeAttribute('autoplay'); video.pause(); return; }

    var saveData = navigator.connection && navigator.connection.saveData;
    if (saveData) { video.removeAttribute('autoplay'); video.pause(); return; }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.1 });
      io.observe(video);
    }
  }

  /* ---------------------------------------------------------------------
     Contact form: client-side validation + submission
     Posts JSON to /api/contact (see /backend). Falls back to a mailto
     link if the endpoint is unavailable (e.g. static-only hosting),
     so the form never silently fails.
     --------------------------------------------------------------------- */
  function initForm() {
    var form = document.querySelector('#contact-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var endpoint = form.getAttribute('data-endpoint') || '/api/contact';

    function setFieldError(field, msg) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      var err = wrap.querySelector('.field-error');
      if (err) err.textContent = msg || '';
      field.setAttribute('data-touched', 'true');
    }

    function validateField(field) {
      if (field.hasAttribute('required') && !field.value.trim()) {
        setFieldError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        setFieldError(field, 'Enter a valid email address.');
        return false;
      }
      if (field.type === 'tel' && field.value && field.value.replace(/\D/g, '').length < 7) {
        setFieldError(field, 'Enter a valid phone number.');
        return false;
      }
      setFieldError(field, '');
      return true;
    }

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      // Honeypot spam check
      var honeypot = form.querySelector('input[name="company_website"]');
      if (honeypot && honeypot.value) { return; } // silently drop bots

      var fields = form.querySelectorAll('input[required], textarea[required], select[required]');
      var valid = true;
      fields.forEach(function (f) { if (!validateField(f)) valid = false; });
      // also validate optional email/tel if filled
      form.querySelectorAll('input[type="email"], input[type="tel"]').forEach(function (f) {
        if (!validateField(f)) valid = false;
      });

      if (!valid) {
        status.classList.add('is-error');
        status.textContent = 'Please fix the highlighted fields and try again.';
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(function () {
          status.classList.add('is-success');
          status.textContent = 'Thanks, ' + (data.name ? data.name.split(' ')[0] + '. ' : '') + 'We got your request and will reach out shortly. For anything urgent, call or WhatsApp us directly.';
          form.reset();
        })
        .catch(function () {
          // Backend not connected yet (static hosting / not configured).
          // Never pretend the message went through — offer a working fallback instead.
          status.classList.add('is-error');
          status.innerHTML = 'We could not submit the form right now. Please call <a href="tel:+14074974562" style="color:inherit;text-decoration:underline;">(407) 497-4562</a>, message us on <a href="https://wa.me/16892435224" style="color:inherit;text-decoration:underline;" target="_blank" rel="noopener">WhatsApp</a>, or email <a href="mailto:carvajalhvac@gmail.com" style="color:inherit;text-decoration:underline;">carvajalhvac@gmail.com</a> directly.';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        });
    });
  }

  /* ---------------------------------------------------------------------
     Current year in footer
     --------------------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
    initCursor();
    initMagnetic();
    initFaq();
    initHeroVideo();
    initForm();
    initYear();
  });
})();
