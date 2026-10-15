/* Carta do Rio Grande pelo Brasil — abas, filtro de referências e espaços futuros. */
(function () {
  'use strict';

  /* ===== CONFIGURAÇÃO — preencha quando estiver pronto ===== */
  // Planilha de respostas do Forms: o site lê só as colunas B, D e H (a B aparece como nome).
  // A planilha precisa estar visível para "qualquer pessoa com o link" (Leitor).
  var SHEET_ID = '1h1Fcr4d4R4TnodCWHhrL0XV0xE6esarxEwazFB4Yi2c';
  var SHEET_GID = '1031110268';
  var SHEET_QUERY = 'select B, D, H';
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


  /* ===== Lista de assinaturas (lida da planilha do Google) =====
     Usa o modo "script" (JSONP) da API de visualização do Google: funciona no site
     publicado e também abrindo o arquivo direto no computador. */
  var list = document.querySelector('[data-signers-list]');

  function renderSigners(rows) {
    var counter = document.querySelector('[data-signers-count]');
    var note = document.querySelector('[data-signers-note]');
    rows = rows.filter(function (r) { return r[0] && String(r[0]).trim(); });
    if (!rows.length) return;
    list.innerHTML = '';
    rows.reverse().forEach(function (r) {
      var li = document.createElement('li');
      li.className = 'signer';
      var name = document.createElement('strong');
      name.textContent = String(r[0]).trim();
      li.appendChild(name);
      var extra = r.slice(1).map(function (v) { return String(v == null ? '' : v).trim(); }).filter(Boolean).join(' · ');
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
  }

  if (SHEET_ID && list) {
    var cb = '__assinaturas' + Date.now();
    window[cb] = function (resp) {
      delete window[cb];
      if (!resp || resp.status === 'error' || !resp.table) {
        if (window.console) console.warn('Planilha de assinaturas: ', resp && resp.errors);
        return;
      }
      renderSigners(resp.table.rows.map(function (row) {
        return (row.c || []).map(function (cell) {
          return cell ? (cell.f != null ? cell.f : cell.v) : '';
        });
      }));
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq'
      + '?gid=' + SHEET_GID
      + '&headers=1'
      + '&tq=' + encodeURIComponent(SHEET_QUERY)
      + '&tqx=' + encodeURIComponent('out:json;responseHandler:' + cb)
      + '&_=' + Date.now();
    s.async = true;
    s.onerror = function () {
      if (window.console) console.warn('Não foi possível ler a planilha de assinaturas. Ela está compartilhada como "Qualquer pessoa com o link"?');
    };
    document.head.appendChild(s);
  }
})();
