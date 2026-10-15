/* Carta do Rio Grande pelo Brasil — abas, filtro de referências e espaços futuros. */
(function () {
  'use strict';

  /* ===== CONFIGURAÇÃO — preencha quando estiver pronto ===== */
  // Planilha de respostas do Forms: o site lê só as colunas B, D e H (a B aparece como nome).
  // A planilha precisa estar visível para "qualquer pessoa com o link" (Leitor).
  var SIGNERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1h1Fcr4d4R4TnodCWHhrL0XV0xE6esarxEwazFB4Yi2c/gviz/tq?tqx=out:csv&gid=1031110268&tq=' + encodeURIComponent('select B, D, H');
  /* ========================================================= */

  var TABS = ['carta', 'referencias', 'assinaturas', 'contato'];
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
    if (hash === 'instagram') return 'contato';
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


  /* ===== Lista de assinaturas (planilha publicada como CSV) ===== */
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  var list = document.querySelector('[data-signers-list]');
  if (SIGNERS_CSV_URL && list) {
    fetch(SIGNERS_CSV_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) {
        var rows = parseCSV(text).slice(1).filter(function (r) { return r[0] && r[0].trim(); });
        var counter = document.querySelector('[data-signers-count]');
        var note = document.querySelector('[data-signers-note]');
        list.innerHTML = '';
        if (!rows.length) return;
        rows.reverse().forEach(function (r) {
          var li = document.createElement('li');
          li.className = 'signer';
          var name = document.createElement('strong');
          name.textContent = r[0].trim();
          li.appendChild(name);
          var extra = r.slice(1).map(function (v) { return v.trim(); }).filter(Boolean).join(' · ');
          if (extra) {
            var small = document.createElement('span');
            small.textContent = extra;
            li.appendChild(small);
          }
          list.appendChild(li);
        });
        counter.textContent = rows.length === 1 ? '1 assinatura' : rows.length.toLocaleString('pt-BR') + ' assinaturas';
        counter.hidden = false;
        note.textContent = 'A lista é atualizada automaticamente a cada nova assinatura (pode levar alguns minutos).';
      })
      .catch(function () { /* mantém os espaços de exemplo se a planilha não carregar */ });
  }

})();
