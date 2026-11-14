/* =========================================================
   Speakvest.ae — content blocks built from the data/ files
   Projects  -> data/projects.json
   Guides    -> data/guides.json
   FAQ       -> data/faq.json
   Glossary  -> data/glossary.json
   ========================================================= */
(function () {
  var SV = window.SV, E = SV.esc;
  SV.planShort = function (p) { return p ? String(p).split(' (')[0] : 'Ask us'; };

  SV.projectCard = function (p) {
    var gv = p.priceFrom && p.priceFrom >= 2e6;
    return '<article class="p-card"><a class="ph" href="project.html?p=' + encodeURIComponent(p.slug) + '" aria-label="' + E(p.name) + '">' +
      '<img src="' + E(p.image) + '" alt="' + E(p.name) + ' in ' + E(p.area) + '" loading="lazy" decoding="async" width="800" height="500">' +
      '<span class="badge">Handover ' + E(p.handover || 'TBC') + '</span>' + (gv ? '<span class="badge gv">Golden Visa ✓</span>' : '') + '</a>' +
      '<div class="p-body"><span class="p-dev">' + E(p.developer) + '</span><h3 class="p-name">' + E(p.name) + '</h3>' +
      '<div class="p-meta"><span>📍 ' + E(p.area) + ', ' + E(p.emirate) + '</span><span>' + E(p.types) + '</span></div>' +
      '<div class="p-price"><small>Starting from</small>' + (p.priceFrom ? SV.aed(p.priceFrom) : 'Price on request') + '</div>' +
      '<div class="p-meta"><span>Plan: <b style="color:#000">' + E(SV.planShort(p.paymentPlan)) + '</b></span></div>' +
      '<div class="p-actions"><a class="btn btn-black" href="project.html?p=' + encodeURIComponent(p.slug) + '">View project</a>' +
      '<a class="btn btn-line" target="_blank" rel="noopener" href="' + SV.wa('project', { project: p.name, code: p.slug.toUpperCase() }) + '">Get brochure</a></div></div></article>';
  };
  SV.projects = function () { return SV.getJSON('data/projects.json').then(function (l) { return l.filter(function (p) { return p.show !== false; }); }); };

  SV.guideCard = function (g) {
    return '<article class="guide-card"><div class="guide-cover"><small>// ' + E(g.kicker) + '</small><b>' + E(g.cover) + '</b><span class="tagw">' + E(g.code) + '</span></div>' +
      '<div><h3>🔒 ' + E(g.title) + '</h3><p>' + E(g.description) + ' <span class="note">' + E(g.pages || '') + '</span></p>' +
      '<div data-gate="' + E(g.slug) + '"><button class="btn btn-brand" type="button" data-unlock>Get it free →</button></div></div></article>';
  };
  SV.renderGuides = function (el, limit) {
    return SV.getJSON('data/guides.json').then(function (list) {
      list = list.filter(function (g) { return g.show !== false; }); if (limit) list = list.slice(0, limit);
      el.innerHTML = list.map(SV.guideCard).join('');
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-unlock]'); if (!b) return;
        var box = b.parentNode, g = list.filter(function (x) { return x.slug === box.dataset.gate; })[0];
        SV.leadForm(box, { type: 'guide: ' + g.title, title: 'Where should we send it?', button: 'Unlock the guide', fields: 'name,phone,email,budget', thanks: 'Your guide is ready below. We\'ll also send it on WhatsApp.',
          afterHTML: '<p><a class="btn btn-black" href="' + E(g.url) + '" target="_blank" rel="noopener">Open the guide →</a></p>' });
      });
    });
  };

  SV.renderFAQ = function (el, limit) {
    return SV.getJSON('data/faq.json').then(function (list) {
      if (limit) list = list.slice(0, limit);
      var cats = []; list.forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
      el.innerHTML = (limit ? [null] : cats).map(function (c) {
        return (c ? '<h2 style="font-size:1.6rem;margin:40px 0 6px">' + E(c) + '</h2>' : '') + list.filter(function (f) { return !c || f.cat === c; }).map(function (f, i) {
          return '<details class="acc"' + (i === 0 && !c ? ' open' : '') + '><summary>' + E(f.q) + '</summary><div class="ans">' + E(f.a) + '</div></details>';
        }).join('');
      }).join('');
      var ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }; }) };
      var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
    });
  };

  SV.renderGlossary = function (el, limit) {
    return SV.getJSON('data/glossary.json').then(function (list) {
      if (limit) list = list.slice(0, limit);
      el.innerHTML = list.map(function (g) { return '<div class="card"><h3>' + E(g.term) + ' <small>' + E(g.tag) + '</small></h3><p style="margin:0">' + E(g.text) + '</p></div>'; }).join('');
    });
  };
})();
