/* =========================================================
   Speakvest.ae — shared site script
   - Reads data/site.json (menu, WhatsApp messages, form endpoint)
   - Draws the header, footer, WhatsApp button
   - Builds and sends every lead form
   You normally never need to edit this file: change data/site.json.
   ========================================================= */
(function () {
  var SV = (window.SV = window.SV || {});
  var WA_ICON = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm7.4 17.9c-.3.9-1.8 1.7-2.5 1.8-.7.1-1.5.2-4.6-1-3.9-1.6-6.4-5.5-6.6-5.8-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.2c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .8.6.3.7 1 2.4 1.1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1.2-.3 1-1.1 1.2-1.5.3-.4.5-.3.9-.2.4.1 2.3 1.1 2.7 1.3.4.2.7.3.8.5.1.1.1.9-.2 1.8z"/></svg>';
  SV.WA_ICON = WA_ICON;

  /* ---------- helpers ---------- */
  SV.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  SV.fmt = function (n) { return Math.round(n || 0).toLocaleString('en-US'); };
  SV.aed = function (n) { return 'AED ' + SV.fmt(n); };
  SV.short = function (n) { if (!n) return 'On request'; if (n >= 1e6) return 'AED ' + (Math.round(n / 1e4) / 100).toString().replace(/\.?0+$/, '') + 'M'; return 'AED ' + Math.round(n / 1e3) + 'K'; };
  SV.fill = function (tpl, vars) { return String(tpl || '').replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : ''; }); };
  SV.wa = function (key, vars) {
    var c = SV.cfg || {}, w = c.whatsapp || {};
    var msg = SV.fill(w[key] || w.general || '', vars);
    return 'https://wa.me/' + (w.number || '') + '?text=' + encodeURIComponent(msg);
  };
  SV.getJSON = function (path) { return fetch(path, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(path); return r.json(); }); };

  /* remember ad / email tracking tags for the forms */
  var UTM = {};
  try {
    var qs = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      var v = qs.get(k) || sessionStorage.getItem('sv_' + k) || '';
      if (qs.get(k)) sessionStorage.setItem('sv_' + k, v);
      UTM[k] = v;
    });
  } catch (e) {}

  /* ---------- header / footer ---------- */
  function page() { var p = location.pathname.split('/').pop() || 'index.html'; return p.indexOf('.') < 0 ? p + '.html' : p; }
  function header(c) {
    var cur = page();
    var links = (c.nav || []).map(function (n) {
      var target = n.href.split('#')[0];
      var on = target === cur || (cur === 'project.html' && target === 'projects.html') || (cur.indexOf('guide-') === 0 && target === 'guides.html');
      return '<li><a href="' + SV.esc(n.href) + '"' + (on ? ' aria-current="page"' : '') + '>' + SV.esc(n.label) + '</a></li>';
    }).join('');
    var b = c.navButton || {};
    return '<div class="wrap"><nav class="nav-bar" aria-label="Main">' +
      '<a class="brand" href="index.html" aria-label="Speakvest home"><img src="assets/img/logo-horizontal-white.png" width="166" height="36" alt="Speakvest"></a>' +
      '<ul class="nav-links" id="nav-links">' + links + '</ul>' +
      (b.href ? '<a class="btn btn-brand nav-cta" href="' + SV.esc(b.href) + '">' + SV.esc(b.label) + ' →</a>' : '') +
      '<button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
      '</nav></div>';
  }
  function footer(c) {
    var cols = (c.footerColumns || []).map(function (col) {
      return '<div><h4>' + SV.esc(col.title) + '</h4><ul>' + col.links.map(function (l) { return '<li><a href="' + SV.esc(l.href) + '">' + SV.esc(l.label) + '</a></li>'; }).join('') + '</ul></div>';
    }).join('');
    var social = (c.social || []).map(function (s) { return '<li><a href="' + SV.esc(s.href) + '" target="_blank" rel="noopener">' + SV.esc(s.label) + '</a></li>'; }).join('');
    return '<div class="wrap"><div class="foot-grid">' +
      '<div class="foot-brand"><img src="assets/img/logo-stacked-white.png" width="327" height="240" alt="Speakvest"><p><b style="color:#fff">' + SV.esc(c.tagline) + '</b><br>' + SV.esc(c.bio) + '</p></div>' +
      cols + '<div><h4>Talk to us</h4><ul><li><a href="' + SV.wa('general') + '" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="index.html#project-check">Free project check</a></li>' + social + '</ul></div>' +
      '</div><div class="foot-legal"><p>' + SV.esc(c.disclaimer) + '</p><p>© ' + new Date().getFullYear() + ' ' + SV.esc(c.siteName) + '. All rights reserved.</p></div></div>';
  }
  function chrome(c) {
    var h = document.getElementById('site-header'); if (h) h.innerHTML = header(c);
    var f = document.getElementById('site-footer'); if (f) f.innerHTML = footer(c);
    var btn = document.querySelector('.menu-btn'), list = document.getElementById('nav-links');
    if (btn) btn.addEventListener('click', function () { var o = list.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    if (!document.querySelector('.wa-float')) {
      var a = document.createElement('a'); a.className = 'wa-float'; a.target = '_blank'; a.rel = 'noopener';
      a.href = SV.wa(document.body.dataset.wa || 'general', { project: document.body.dataset.project || '', code: document.body.dataset.code || '' });
      a.setAttribute('aria-label', 'Chat with Speakvest on WhatsApp'); a.innerHTML = WA_ICON; document.body.appendChild(a);
      var m = document.createElement('div'); m.className = 'mbar';
      m.innerHTML = '<a href="index.html#project-check" style="background:#1C1714">Free project check</a><a href="' + a.href + '" target="_blank" rel="noopener" style="background:#0b7a3b">WhatsApp</a>';
      document.body.appendChild(m);
    }
    document.querySelectorAll('[data-wa-link]').forEach(function (el) { el.href = SV.wa(el.dataset.waLink, el.dataset); el.target = '_blank'; el.rel = 'noopener'; });
  }

  /* ---------- lead forms ----------
     Put <div data-lead-form="type" data-title="..."></div> on any page.
     Every submission is sent to formEndpoint in data/site.json. */
  function opts(list, ph) { return '<option value="">' + ph + '</option>' + (list || []).map(function (v) { return '<option>' + SV.esc(v) + '</option>'; }).join(''); }
  SV.leadForm = function (el, o) {
    o = o || {}; var c = SV.cfg; var id = 'f' + Math.random().toString(36).slice(2, 7);
    var fields = (o.fields || el.dataset.fields || 'name,phone,email,project,budget,timeline').split(',');
    var has = function (k) { return fields.indexOf(k) > -1; };
    el.innerHTML = '<form class="form-card" novalidate>' +
      (o.title || el.dataset.title ? '<h3>' + SV.esc(o.title || el.dataset.title) + '</h3>' : '') +
      (o.sub || el.dataset.sub ? '<p class="note">' + SV.esc(o.sub || el.dataset.sub) + '</p>' : '') +
      '<div class="form-grid">' +
      '<div class="f"><label for="' + id + 'n">Your name *</label><input id="' + id + 'n" name="name" autocomplete="name" required></div>' +
      '<div class="f"><label for="' + id + 'p">WhatsApp number *</label><div class="phone"><select name="cc" aria-label="Country code">' + (c.countryCodes || ['+971']).map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select><input id="' + id + 'p" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" required placeholder="50 123 4567"></div></div>' +
      (has('email') ? '<div class="f ' + (has('project') ? '' : 'full') + '"><label for="' + id + 'e">Email</label><input id="' + id + 'e" name="email" type="email" autocomplete="email"></div>' : '') +
      (has('project') ? '<div class="f"><label for="' + id + 'pr">Project name or listing link</label><input id="' + id + 'pr" name="project" value="' + SV.esc(o.project || el.dataset.project || '') + '"></div>' : '') +
      (has('budget') ? '<div class="f"><label for="' + id + 'b">Budget *</label><select id="' + id + 'b" name="budget" required>' + opts(c.budgets, 'Choose…') + '</select></div>' : '') +
      (has('timeline') ? '<div class="f"><label for="' + id + 't">When are you buying?</label><select id="' + id + 't" name="timeline">' + opts(c.timelines, 'Choose…') + '</select></div>' : '') +
      (has('message') ? '<div class="f full"><label for="' + id + 'm">Message</label><textarea id="' + id + 'm" name="message"></textarea></div>' : '') +
      '</div>' +
      '<label class="consent"><input type="checkbox" name="consent" required> <span>I agree to be contacted on WhatsApp, phone or email about my enquiry. No spam, unsubscribe anytime.</span></label>' +
      '<button class="btn btn-brand" type="submit" style="width:100%">' + SV.esc(o.button || el.dataset.button || 'Send') + ' →</button>' +
      '<p class="form-error" role="alert" hidden></p></form>';
    var form = el.querySelector('form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = form.querySelector('.form-error'), ok = true;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
        if (inp.name === 'phone' && inp.value.replace(/\D/g, '').length < 7) bad = true;
        var f = inp.closest('.f'); if (f) f.classList.toggle('err', bad); if (bad) ok = false;
      });
      var em = form.querySelector('[name=email]');
      if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.closest('.f').classList.add('err'); ok = false; }
      if (!ok) { err.textContent = 'Please complete the highlighted fields and tick the consent box.'; err.hidden = false; return; }
      err.hidden = true;
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
      var payload = {
        formType: o.type || el.dataset.leadForm || 'general', name: d.name, phone: (d.cc || '') + ' ' + d.phone, email: d.email || '',
        project: d.project || '', budget: d.budget || '', timeline: d.timeline || '', message: d.message || '',
        extra: (typeof o.extra === 'function' ? o.extra() : o.extra) || el.dataset.extra || '',
        page: location.href.split('#')[0], referrer: document.referrer || '', submittedAt: new Date().toISOString()
      };
      for (var k in UTM) payload[k] = UTM[k];
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
      var done = function () {
        var waUrl = SV.wa('afterForm', { name: payload.name, projectPart: payload.project ? ' about ' + payload.project : '', budget: payload.budget || '—', timeline: payload.timeline || '—' });
        el.innerHTML = '<div class="form-card thanks"><div class="tick">✓</div><h3>Thank you, ' + SV.esc(payload.name.split(' ')[0]) + '!</h3><p>' + SV.esc(o.thanks || el.dataset.thanks || 'We have your details and will get back to you shortly.') + '</p>' +
          (o.afterHTML || '') + '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waUrl + '">' + WA_ICON + ' Continue on WhatsApp</a></div>';
        if (typeof o.onDone === 'function') o.onDone(payload);
      };
      if (!c.formEndpoint) { console.info('[Speakvest] No formEndpoint set in data/site.json. Submission not stored:', payload); done(); return; }
      fetch(c.formEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
        .then(done).catch(function () { btn.disabled = false; btn.textContent = 'Try again'; err.textContent = 'Something went wrong sending your details. Please try again or message us on WhatsApp.'; err.hidden = false; });
    });
  };

  /* ---------- boot ---------- */
  SV.ready = SV.getJSON('data/site.json').then(function (c) {
    SV.cfg = c; chrome(c);
    document.querySelectorAll('[data-lead-form]').forEach(function (el) { if (!el.dataset.manual) SV.leadForm(el); });
    return c;
  }).catch(function (e) { console.error('Could not load data/site.json', e); });
})();
