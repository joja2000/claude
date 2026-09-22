/* ==========================================================================
   Jesus & Morinel Advocacia — interações do site (JavaScript puro, sem dependências)
   ========================================================================== */
(function () {
  'use strict';

  window.__jmReady = true;

  var root = document.documentElement;
  var WHATSAPP_NUMBER = '5551999941535';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onMediaChange(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header: fundo sólido ao rolar ---------- */
  var header = document.querySelector('[data-header]');
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  var toggleLabel = toggle.querySelector('.sr-only');
  var outside = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('[data-wa-float]')];

  function setMenu(open) {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
    outside.forEach(function (el) { if (el) el.inert = open; });
    root.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = panel.querySelector('a');
      if (first) first.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (!root.classList.contains('nav-open')) return;
    if (event.key === 'Escape') {
      setMenu(false);
      toggle.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    // Mantém o foco dentro do menu aberto (botão + links do painel)
    var focusables = [toggle].concat(Array.prototype.slice.call(panel.querySelectorAll('a, button')));
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  onMediaChange(window.matchMedia('(min-width: 1024px)'), function (event) {
    if (event.matches && root.classList.contains('nav-open')) setMenu(false);
  });

  /* ---------- Revelação ao rolar ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Link ativo no menu ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var hash = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === hash;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  /* ---------- Carrossel de avaliações ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var status = carousel.querySelector('[data-carousel-status]');
    var items = track.children;
    var ticking = false;

    function stepSize() {
      if (!items.length) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return items[0].getBoundingClientRect().width + gap;
    }

    function update() {
      ticking = false;
      var step = stepSize();
      var maxScroll = track.scrollWidth - track.clientWidth;
      carousel.classList.toggle('is-static', maxScroll <= 2);
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
      var index = Math.min(items.length - 1, Math.round(track.scrollLeft / step));
      var perView = Math.max(1, Math.floor((track.clientWidth + 2) / step));
      var last = Math.min(items.length, index + perView);
      var label = perView > 1 ? (index + 1) + '–' + last : String(index + 1);
      var text = label + ' de ' + items.length;
      if (status.textContent !== text) status.textContent = text;
    }

    function go(direction) {
      track.scrollBy({ left: direction * stepSize(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });

    track.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    });

    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Horário de funcionamento + "Aberto agora" ----------
     Cada linha da tabela tem data-day (0 = domingo … 6 = sábado) e data-hours:
       "09:00-18:00" | "09:00-12:00,13:30-18:00" | "" (fechado) | "?" (a confirmar)
     O cálculo usa sempre o fuso de Brasília (America/Sao_Paulo). */
  var DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var table = document.querySelector('[data-hours-table]');
  var statusEl = document.querySelector('[data-status]');

  function parseHours(value) {
    value = (value || '').trim();
    if (value === '?') return null;
    if (value === '') return [];
    return value.split(',').map(function (part) {
      var m = part.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      return m ? [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])] : null;
    }).filter(Boolean);
  }

  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + 'h' + (m ? String(m).padStart(2, '0') : '');
  }

  function nowInBrasilia() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday),
      minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute)
    };
  }

  function computeStatus(schedule, now) {
    var today = schedule[now.day];
    if (today === null || today === undefined) {
      return { state: 'unknown', text: 'Horário em confirmação' };
    }
    for (var i = 0; i < today.length; i++) {
      if (now.minutes >= today[i][0] && now.minutes < today[i][1]) {
        return { state: 'open', text: 'Aberto agora · fecha às ' + formatTime(today[i][1]) };
      }
    }
    for (var offset = 0; offset < 7; offset++) {
      var day = (now.day + offset) % 7;
      var ranges = schedule[day];
      if (ranges === null || ranges === undefined) break;
      for (var j = 0; j < ranges.length; j++) {
        if (offset > 0 || ranges[j][0] > now.minutes) {
          var when = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : DAY_NAMES[day];
          return { state: 'closed', text: 'Fechado agora · abre ' + when + ' às ' + formatTime(ranges[j][0]) };
        }
      }
    }
    return { state: 'closed', text: 'Fechado agora' };
  }

  function renderHours() {
    if (!table || !statusEl) return;
    var now = nowInBrasilia();
    var schedule = {};

    table.querySelectorAll('tr[data-day]').forEach(function (row) {
      var day = Number(row.getAttribute('data-day'));
      var ranges = parseHours(row.getAttribute('data-hours'));
      var cell = row.querySelector('td');
      var th = row.querySelector('th');
      schedule[day] = ranges;

      if (ranges === null) {
        cell.textContent = 'A confirmar';
      } else if (ranges.length === 0) {
        cell.textContent = 'Fechado';
      } else {
        cell.textContent = ranges.map(function (r) {
          return formatTime(r[0]) + ' às ' + formatTime(r[1]);
        }).join(' · ');
      }
      cell.classList.toggle('is-closed', ranges !== null && ranges.length === 0);

      var isToday = day === now.day;
      row.classList.toggle('is-today', isToday);
      var tag = th.querySelector('.today-tag');
      if (isToday && !tag) {
        tag = document.createElement('span');
        tag.className = 'today-tag';
        tag.textContent = 'Hoje';
        th.append(' ', tag);
      } else if (!isToday && tag) {
        if (tag.previousSibling && tag.previousSibling.nodeType === 3) tag.previousSibling.remove();
        tag.remove();
      }
    });

    var result = computeStatus(schedule, now);
    statusEl.setAttribute('data-state', result.state);
    statusEl.querySelector('[data-status-text]').textContent = result.text;
  }

  renderHours();
  window.setInterval(renderHours, 60 * 1000);

  /* ---------- Formulário → WhatsApp (nada é enviado ao servidor) ---------- */
  var form = document.querySelector('[data-wa-form]');
  if (form) {
    var rules = [
      { field: form.elements.nome, message: 'Informe o seu nome.' },
      { field: form.elements.assunto, message: 'Conte, em poucas palavras, o assunto.' }
    ];

    function validate(rule) {
      var valid = rule.field.value.trim().length >= 2;
      var error = form.querySelector('[data-error-for="' + rule.field.id + '"]');
      rule.field.setAttribute('aria-invalid', String(!valid));
      error.textContent = valid ? '' : rule.message;
      return valid;
    }

    rules.forEach(function (rule) {
      rule.field.addEventListener('input', function () {
        if (rule.field.getAttribute('aria-invalid') === 'true') validate(rule);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;
      rules.forEach(function (rule) {
        if (!validate(rule) && !firstInvalid) firstInvalid = rule.field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var text = 'Olá! Meu nome é ' + form.elements.nome.value.trim() +
        '. Gostaria de falar com o Jesus & Morinel Advocacia sobre: ' + form.elements.assunto.value.trim();
      var link = document.createElement('a');
      link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
})();
