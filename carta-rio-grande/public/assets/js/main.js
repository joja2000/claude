/* Carta do Rio Grande pelo Brasil — abas, filtro de referências e espaços futuros. */
(function () {
  'use strict';

  /* ===== CONFIGURAÇÃO — preencha quando estiver pronto ===== */
  // Link do Google Forms. Use o link "incorporar" (termina em ?embedded=true) ou o link normal do formulário.
  var FORM_URL = '';
  // Perfil do Instagram, ex.: 'https://www.instagram.com/cartadoriogrande/' e '@cartadoriogrande'
  var INSTAGRAM_URL = '';
  var INSTAGRAM_HANDLE = '';
  /* ========================================================= */

  var TABS = ['carta', 'referencias', 'assinaturas', 'instagram'];
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function showTab(id, opts) {
    opts = opts || {};
    if (TABS.indexOf(id) === -1) id = 'carta';
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (on && panel.hidden) {
        panel.hidden = false;
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      } else if (!on) {
        panel.hidden = true;
      }
    });
    if (opts.push && location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    if (opts.scroll) {
      var bar = document.querySelector('.tabs-bar');
      var top = bar.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }
    if (opts.focusTab) tabs[TABS.indexOf(id)].focus();
  }

  // Âncoras dentro da carta (ex.: #leitura) pertencem à aba "A Carta"
  function tabFromHash() {
    var hash = location.hash.slice(1);
    if (TABS.indexOf(hash) !== -1) return hash;
    var el = hash && document.getElementById(hash);
    var panel = el && el.closest('[role="tabpanel"]');
    return panel ? panel.id : 'carta';
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      showTab(tab.getAttribute('data-tab'), { push: true, scroll: true });
    });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      showTab(TABS[next], { push: true, focusTab: true });
    });
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-tab-link]');
    if (!link) return;
    e.preventDefault();
    showTab(link.getAttribute('data-tab-link'), { push: true, scroll: true });
    var panel = document.getElementById(link.getAttribute('data-tab-link'));
    panel.focus({ preventScroll: true });
  });

  window.addEventListener('popstate', function () { showTab(tabFromHash()); });

  var initial = tabFromHash();
  showTab(initial);
  if (location.hash && TABS.indexOf(location.hash.slice(1)) === -1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }

  /* ===== Filtro de referências ===== */
  var filter = document.querySelector('[data-ref-filter]');
  var refs = Array.prototype.slice.call(document.querySelectorAll('[data-refs] li'));
  var count = document.querySelector('[data-ref-count]');
  var empty = document.querySelector('[data-ref-empty]');
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  var texts = refs.map(function (li) { return norm(li.textContent); });
  function applyFilter() {
    var q = norm(filter.value.trim());
    var shown = 0;
    refs.forEach(function (li, i) {
      var match = !q || texts[i].indexOf(q) !== -1;
      li.hidden = !match;
      if (match) shown++;
    });
    count.textContent = q ? shown + ' de ' + refs.length : refs.length + ' fontes';
    empty.hidden = shown !== 0;
  }
  if (filter) { filter.addEventListener('input', applyFilter); applyFilter(); }

  /* ===== Compartilhar e imprimir ===== */
  var feedback = document.querySelector('[data-share-feedback]');
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = location.href.split('#')[0] + '#carta';
      var data = { title: 'Carta do Rio Grande pelo Brasil', text: 'Leia e assine a Carta do Rio Grande pelo Brasil.', url: url };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          if (feedback) feedback.textContent = 'Link copiado. É só colar onde quiser compartilhar.';
          btn.blur();
        });
      }
    });
  });
  var printBtn = document.querySelector('[data-print]');
  if (printBtn) printBtn.addEventListener('click', function () { showTab('carta'); window.print(); });

  /* ===== Google Forms (quando FORM_URL for preenchido) ===== */
  var slot = document.querySelector('[data-form-slot]');
  if (FORM_URL && slot) {
    var embedUrl = FORM_URL.indexOf('embedded=true') !== -1 ? FORM_URL
      : FORM_URL + (FORM_URL.indexOf('?') === -1 ? '?' : '&') + 'embedded=true';
    slot.closest('.sign-card').classList.add('has-form');
    slot.innerHTML =
      '<h3>Assine a carta</h3>' +
      '<div class="form-embed"><iframe src="' + embedUrl + '" title="Formulário de assinatura da carta" loading="lazy">Carregando…</iframe></div>' +
      '<p><a class="btn btn-line" href="' + FORM_URL + '" target="_blank" rel="noopener">Abrir o formulário em nova aba</a></p>';
    slot.classList.add('form-embed');
    var seal = document.querySelector('.sign-seal');
    if (seal) seal.hidden = true;
  }

  /* ===== Instagram (quando INSTAGRAM_URL for preenchido) ===== */
  if (INSTAGRAM_URL) {
    var igLink = document.querySelector('[data-ig-link]');
    igLink.href = INSTAGRAM_URL;
    igLink.target = '_blank';
    igLink.rel = 'noopener';
    igLink.removeAttribute('aria-disabled');
    igLink.classList.remove('is-disabled');
    document.querySelector('[data-ig-label]').textContent = 'Seguir no Instagram';
    if (INSTAGRAM_HANDLE) document.querySelector('[data-ig-handle]').textContent = INSTAGRAM_HANDLE;
  } else {
    var disabled = document.querySelector('[data-ig-link]');
    if (disabled) disabled.addEventListener('click', function (e) { e.preventDefault(); });
  }
})();
