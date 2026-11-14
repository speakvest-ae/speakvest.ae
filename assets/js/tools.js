/* =========================================================
   Speakvest.ae — investor tools
   Each tool is one entry in TOOLS below. To show / hide / reorder
   tools on the Tools page, edit data/tools.json (no code needed).
   To add a brand-new calculator, copy one block below, give it a
   new id, and add that id to data/tools.json.
   ========================================================= */
(function () {
  var SV = window.SV, $ = function (r, s) { return r.querySelector(s); };
  var A = function (n) { return SV.aed(n); };

  function range(id, label, min, max, step, val, fmt, hint) {
    return '<div class="field"><label for="' + id + '"><span>' + label + '</span><output id="' + id + 'o"></output></label>' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-fmt="' + (fmt || 'aed') + '">' +
      (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>';
  }
  function out(el) {
    el.querySelectorAll('input[type=range]').forEach(function (r) {
      var v = +r.value, f = r.dataset.fmt, o = el.querySelector('#' + r.id + 'o'); if (!o) return;
      o.textContent = f === 'aed' ? A(v) : f === 'pct' ? v + '%' : f === 'mo' ? v + ' mo' : f === 'wk' ? v + ' wk' : f === 'yr' ? v + ' yrs' : f === 'sqft' ? SV.fmt(v) + ' sq ft' : f === 'aedsq' ? 'AED ' + v : SV.fmt(v);
    });
  }
  function seg(name, items, on) { return '<div class="seg" data-seg="' + name + '">' + items.map(function (i) { return '<button type="button" data-v="' + i[0] + '"' + (i[0] === on ? ' class="on"' : '') + '>' + i[1] + '</button>'; }).join('') + '</div>'; }
  function segVal(el, name) { var b = el.querySelector('[data-seg="' + name + '"] .on'); return b ? b.dataset.v : ''; }
  function row(label, val, sub) { return '<div class="row"><span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span><b class="num">' + val + '</b></div>'; }
  function v(el, id) { return +el.querySelector('#' + id).value; }
  function wire(el, calc) {
    el.addEventListener('input', function () { out(el); calc(); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-seg] button'); if (!b) return;
      b.parentNode.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      if (b.parentNode.dataset.onSeg) return; out(el); calc();
    });
    out(el); calc();
  }
  /* "send me this" actions under every tool */
  function actions(el, tool, getText) {
    var box = document.createElement('div'); box.className = 'btns'; box.style.marginTop = '18px';
    box.innerHTML = '<button type="button" class="btn btn-black" data-send>Send me this breakdown →</button><a class="btn btn-wa" href="#" target="_blank" rel="noopener">' + SV.WA_ICON + ' Ask an advisor</a>';
    var formBox = document.createElement('div'); formBox.style.marginTop = '18px';
    el.appendChild(box); el.appendChild(formBox);
    var wa = box.querySelector('.btn-wa');
    var refresh = function () { wa.href = SV.wa('tool', { tool: tool, result: getText() }); };
    el.addEventListener('input', refresh); el.addEventListener('click', refresh); refresh();
    box.querySelector('[data-send]').addEventListener('click', function () {
      SV.leadForm(formBox, { type: 'tool: ' + tool, title: 'Where should we send it?', sub: 'We\'ll send this breakdown and check it against real project numbers.', button: 'Send me the breakdown', fields: 'name,phone,email,budget', extra: getText });
      formBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  var TOOLS = {};

  /* 1. TRUE COST ------------------------------------------------ */
  TOOLS['true-cost'] = { title: 'What will it really cost you?', tag: 'Free calculator', intro: 'Every fee between the listing price and the keys, and the cash you need on day one.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div>' +
      '<div class="field"><span class="lbl">Buying</span>' + seg('type', [['ready', 'Ready / resale'], ['offplan', 'Off-plan (developer)']], 'ready') + '</div>' +
      range('tc-price', 'Property price', 300000, 20000000, 50000, 2000000) +
      '<div data-off>' + range('tc-book', 'Booking / down payment', 5, 50, 1, 20, 'pct', 'The first instalment the developer asks for when you book. Usually 10–20%. Check the project\'s payment plan.') +
      '<p class="note" style="margin:0 0 14px">Off-plan is usually paid on the developer\'s payment plan. A mortgage, if you need one, normally starts at handover.</p></div>' +
      '<div class="field" data-mq><span class="lbl">Using a mortgage?</span>' + seg('mort', [['yes', 'Yes'], ['no', 'Cash']], 'yes') + '</div>' +
      '<div data-m>' + range('tc-ltv', 'Loan-to-value', 40, 80, 5, 80, 'pct', 'Banks set the maximum: often up to 80% for first-time resident buyers on lower-priced homes, less for non-residents and higher prices.') +
      range('tc-arr', 'Bank arrangement fee', 0, 1, 0.25, 1, 'pct') + '</div>' +
      '<div class="field" data-agent><span class="lbl">Buyer\'s agent (2% + VAT)</span>' + seg('agent', [['yes', 'Yes'], ['no', 'No']], 'yes') + '</div>' +
      '</div><div class="result" aria-live="polite"><h3>Your breakdown</h3><div data-rows></div>' +
      '<div class="big"><span>Fees on top of the price</span><b class="num" data-fees></b></div><div class="note" data-pct></div>' +
      '<div class="big"><span>Cash needed on day one</span><b class="num hl" data-cash></b></div><div class="bar" data-bar></div>' +
      '<p class="note">Typical public fee levels, rounded. Your bank, developer and trustee confirm the final numbers.</p></div></div>';
    var txt = '';
    wire(el, function () {
      var off = segVal(el, 'type') === 'offplan', p = v(el, 'tc-price'), mort = segVal(el, 'mort') === 'yes' && !off;
      el.querySelector('[data-m]').style.display = mort ? '' : 'none';
      el.querySelector('[data-mq]').style.display = off ? 'none' : '';
      el.querySelector('[data-off]').style.display = off ? '' : 'none';
      el.querySelector('[data-agent]').style.display = off ? 'none' : '';
      var ltv = v(el, 'tc-ltv') / 100, loan = mort ? p * ltv : 0, R = [], bookPct = v(el, 'tc-book'), book = p * bookPct / 100;
      R.push(['Dubai Land Department fee', '4% of the price', p * 0.04]);
      if (off) R.push(['Oqood registration & admin', 'DLD off-plan register, approx.', 1250]);
      else {
        R.push(['Title deed & admin', 'fixed DLD charges, approx.', 580]);
        R.push(['Registration trustee', (p >= 500000 ? 'AED 4,000' : 'AED 2,000') + ' + VAT', (p >= 500000 ? 4000 : 2000) * 1.05]);
        if (segVal(el, 'agent') === 'yes') R.push(['Agent commission', '2% + 5% VAT', p * 0.021]);
      }
      if (mort) {
        R.push(['Mortgage registration', '0.25% of the loan + approx. AED 290', loan * 0.0025 + 290]);
        R.push(['Property valuation', 'paid to the bank, approx.', 3000]);
        R.push(['Bank arrangement fee', v(el, 'tc-arr') + '% of the loan', loan * v(el, 'tc-arr') / 100]);
      }
      var fees = R.reduce(function (s, r) { return s + r[2]; }, 0), down = off ? book : p - loan, cash = down + fees;
      el.querySelector('[data-rows]').innerHTML = R.map(function (r) { return row(r[0], SV.fmt(r[2]), r[1]); }).join('') +
        (off ? row('Booking / down payment', SV.fmt(book), bookPct + '% of the price, paid to the escrow account') : '');
      el.querySelector('[data-fees]').textContent = A(fees);
      el.querySelector('[data-pct]').textContent = '≈ ' + (fees / p * 100).toFixed(1) + '% of the price' + (off ? '. The remaining ' + A(p - book) + ' follows the payment plan: see the payment plan tool.' : '');
      el.querySelector('[data-cash]').textContent = A(cash);
      el.querySelector('[data-bar]').innerHTML = '<i style="width:' + (down / cash * 100) + '%;background:#1C1714"></i><i style="width:' + (fees / cash * 100) + '%;background:#C8242B"></i>';
      txt = (off ? 'Off-plan' : 'Ready') + ' purchase at ' + A(p) + (off ? ', ' + bookPct + '% booking' : '') + (mort ? ' with ' + Math.round(ltv * 100) + '% mortgage' : '') + '\nFees: ' + A(fees) + '\nCash day one: ' + A(cash);
    });
    actions(el, 'True-cost calculator', function () { return txt; });
  } };

  /* 2. PAYMENT PLAN --------------------------------------------- */
  TOOLS['payment-plan'] = { title: 'See every payment before you book.', tag: 'Free calculator', intro: 'Off-plan plans spread the price over construction, and sometimes years after handover. Pick a plan shape and see what leaves your account, and when.', render: function (el) {
    var shapes = { '10/50/40': [10, 50, 40, 0], '20/40/40': [20, 40, 40, 0], '40/60': [20, 20, 60, 0], '50/50': [20, 30, 50, 0], 'post-handover': [20, 30, 10, 40] };
    el.innerHTML = '<div class="tool-grid"><div>' +
      '<div class="field"><span class="lbl">Plan shape</span><div class="seg" data-seg="shape" data-on-seg="1">' + Object.keys(shapes).map(function (k, i) { return '<button type="button" data-v="' + k + '"' + (i === 1 ? ' class="on"' : '') + '>' + (k === 'post-handover' ? 'With post-handover' : k) + '</button>'; }).join('') + '</div></div>' +
      range('pp-price', 'Price', 400000, 15000000, 50000, 1500000) +
      range('pp-down', 'Down payment', 0, 50, 1, 20, 'pct') + range('pp-build', 'During construction', 0, 80, 1, 40, 'pct') +
      range('pp-hand', 'On handover', 0, 80, 1, 40, 'pct') + range('pp-post', 'After handover', 0, 60, 1, 0, 'pct') +
      range('pp-months', 'Construction time', 12, 60, 1, 30, 'mo') + range('pp-pmonths', 'Post-handover period', 6, 60, 6, 24, 'mo') +
      '<div class="field"><span class="lbl">Add the 4% DLD fee at booking?</span>' + seg('dld', [['yes', 'Yes'], ['no', 'No']], 'yes') + '</div>' +
      '</div><div class="result" aria-live="polite"><h3>What leaves your account</h3><div data-sum class="note"></div><div class="bar" data-bar></div><div data-rows></div></div></div>';
    el.querySelector('[data-seg=shape]').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var s = shapes[b.dataset.v];
      ['pp-down', 'pp-build', 'pp-hand', 'pp-post'].forEach(function (id, i) { el.querySelector('#' + id).value = s[i]; });
      el.dispatchEvent(new Event('input'));
    });
    var txt = '';
    wire(el, function () {
      var p = v(el, 'pp-price'), d = v(el, 'pp-down'), b = v(el, 'pp-build'), h = v(el, 'pp-hand'), po = v(el, 'pp-post'), m = v(el, 'pp-months'), pm = v(el, 'pp-pmonths');
      var tot = d + b + h + po, dld = segVal(el, 'dld') === 'yes' ? p * 0.04 : 0;
      el.querySelector('[data-sum]').innerHTML = tot === 100 ? '<b style="color:#A11B21">Adds up to 100% ✓</b>' : '<b style="color:#b3261e">Adds up to ' + tot + '%. Adjust the sliders to reach 100%.</b>';
      el.querySelector('[data-bar]').innerHTML = [[d, '#000'], [b, '#C8242B'], [h, '#E9877F'], [po, '#9a9a9a']].map(function (x) { return '<i style="width:' + (x[0] / Math.max(tot, 1) * 100) + '%;background:' + x[1] + '"></i>'; }).join('');
      var R = [
        ['Due at booking', 'down payment' + (dld ? ' + 4% DLD fee' : ''), p * d / 100 + dld],
        ['Average per month while building', b + '% over ' + m + ' months', p * b / 100 / m],
        ['On handover', h + '% at keys', p * h / 100],
        ['Paid by handover (incl. DLD)', 'everything before you move in', p * (d + b + h) / 100 + dld],
        ['After handover, per month', po ? po + '% over ' + pm + ' months' : 'no post-handover part', po ? p * po / 100 / pm : 0]
      ];
      el.querySelector('[data-rows]').innerHTML = R.map(function (r) { return row(r[0], r[2] ? A(r[2]) : '—', r[1]); }).join('');
      txt = 'Plan ' + d + '/' + b + '/' + h + (po ? '/' + po + ' post' : '') + ' on ' + A(p) + '\nAt booking: ' + A(R[0][2]) + '\nMonthly while building: ' + A(R[1][2]) + '\nOn handover: ' + A(R[2][2]);
    });
    actions(el, 'Payment plan calculator', function () { return txt; });
  } };

  /* 3. RENTAL YIELD --------------------------------------------- */
  TOOLS['rental-yield'] = { title: 'Gross yield sells. Net yield pays.', tag: 'Free calculator', intro: 'Put in your own numbers. Service charges, empty weeks and management come off before the rent reaches you, and the outcome tells you whether the deal stacks up.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div>' +
      range('ry-price', 'Purchase price', 300000, 15000000, 25000, 1500000) +
      range('ry-rent', 'Annual rent', 20000, 1000000, 5000, 110000) +
      range('ry-size', 'Size', 300, 6000, 25, 900, 'sqft') +
      range('ry-sc', 'Service charge per sq ft per year', 0, 40, 1, 18, 'aedsq', 'Use the real figure for the building: the Dubai Land Department publishes service charges.') +
      range('ry-empty', 'Empty weeks per year', 0, 12, 1, 3, 'wk') +
      range('ry-mgmt', 'Management fee', 0, 10, 0.5, 5, 'pct') +
      range('ry-maint', 'Maintenance & insurance per year', 0, 50000, 500, 5000) +
      '<div class="field"><span class="lbl">Bought with a mortgage?</span>' + seg('mort', [['no', 'No, cash'], ['yes', 'Yes']], 'no') + '</div>' +
      '<div data-m>' + range('ry-ltv', 'Loan-to-value', 30, 80, 5, 60, 'pct') + range('ry-rate', 'Interest rate', 2, 9, 0.05, 4.5, 'pct') + range('ry-yrs', 'Loan term', 5, 25, 1, 25, 'yr') + '</div>' +
      '</div><div class="result" aria-live="polite"><h3>Your outcome</h3>' +
      '<div class="grid g2" style="margin-bottom:10px"><div class="stat"><span class="note">Gross yield</span><b class="num" data-g></b></div><div class="stat"><span class="note">Net yield</span><b class="num hl" data-n></b></div></div>' +
      '<div data-rows></div><div class="big"><span>Net income per year</span><b class="num" data-ni></b></div><div class="note" data-pm></div>' +
      '<div data-extra></div><div class="verdict" data-verdict></div>' +
      '<p class="note" style="margin-top:12px">Sample values are placeholders, not market data. Use the real service charge and a realistic rent for the unit.</p></div></div>';
    var txt = '';
    wire(el, function () {
      var p = v(el, 'ry-price'), rent = v(el, 'ry-rent'), sc = v(el, 'ry-size') * v(el, 'ry-sc'), empty = rent * v(el, 'ry-empty') / 52;
      var mg = (rent - empty) * v(el, 'ry-mgmt') / 100, mt = v(el, 'ry-maint'), net = rent - empty - mg - sc - mt;
      var g = rent / p * 100, n = net / p * 100, mort = segVal(el, 'mort') === 'yes';
      el.querySelector('[data-m]').style.display = mort ? '' : 'none';
      el.querySelector('[data-g]').textContent = g.toFixed(1) + '%';
      el.querySelector('[data-n]').textContent = n.toFixed(1) + '%';
      el.querySelector('[data-rows]').innerHTML = row('Annual rent', SV.fmt(rent)) + row('Empty weeks', '− ' + SV.fmt(empty)) + row('Management', '− ' + SV.fmt(mg)) + row('Service charges', '− ' + SV.fmt(sc)) + row('Maintenance & insurance', '− ' + SV.fmt(mt));
      el.querySelector('[data-ni]').textContent = A(net);
      el.querySelector('[data-pm]').textContent = A(net / 12) + ' per month · pays back the price in about ' + (net > 0 ? Math.round(p / net) + ' years' : '—');
      var extra = '';
      if (mort) {
        var loan = p * v(el, 'ry-ltv') / 100, r = v(el, 'ry-rate') / 1200, nper = v(el, 'ry-yrs') * 12;
        var emi = loan * r / (1 - Math.pow(1 + r, -nper)), cashIn = p - loan + p * 0.04 + 7000, cf = net - emi * 12;
        extra = '<div class="big"><span>After mortgage, per month</span><b class="num">' + A(cf / 12) + '</b></div><div class="note">Mortgage ' + A(emi) + '/month · cash-on-cash return ' + (cf / cashIn * 100).toFixed(1) + '% on ≈ ' + A(cashIn) + ' invested (deposit + fees)</div>';
      }
      el.querySelector('[data-extra]').innerHTML = extra;
      var vd = el.querySelector('[data-verdict]'), need = (p * 0.06 + sc + mt) / (1 - v(el, 'ry-empty') / 52) / (1 - v(el, 'ry-mgmt') / 100);
      if (n >= 6) { vd.className = 'verdict good'; vd.textContent = 'Strong: ' + n.toFixed(1) + '% net is a healthy income return for Dubai. Next, check the service charge and the realistic rent for this exact building.'; }
      else if (n >= 4.5) { vd.className = 'verdict ok'; vd.textContent = 'Fair: ' + n.toFixed(1) + '% net works if you also expect capital growth. For 6% net you would need about ' + A(need) + ' a year in rent.'; }
      else { vd.className = 'verdict low'; vd.textContent = 'Thin: ' + n.toFixed(1) + '% net leaves little room for surprises. For 6% net you would need about ' + A(need) + ' a year in rent, or a lower price.'; }
      txt = 'Price ' + A(p) + ', rent ' + A(rent) + '/yr\nGross ' + g.toFixed(1) + '% · Net ' + n.toFixed(1) + '%\nNet income ' + A(net) + '/yr';
    });
    actions(el, 'Rental yield calculator', function () { return txt; });
  } };

  /* 4. MORTGAGE ------------------------------------------------- */
  TOOLS['mortgage'] = { title: 'What will the monthly payment be?', tag: 'Free calculator', intro: 'A quick estimate of the monthly instalment, the total interest and the cash you need upfront.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div>' +
      range('mo-price', 'Property price', 300000, 20000000, 50000, 2000000) +
      range('mo-down', 'Down payment', 15, 70, 5, 20, 'pct', 'Residents usually need at least 20% on a first home under AED 5M; non-residents often 40–50%.') +
      range('mo-rate', 'Interest rate', 2, 9, 0.05, 4.25, 'pct') + range('mo-yrs', 'Loan term', 5, 25, 1, 25, 'yr') +
      '</div><div class="result" aria-live="polite"><h3>Your estimate</h3><div class="big"><span>Monthly instalment</span><b class="num hl" data-emi></b></div><div data-rows></div></div></div>';
    var txt = '';
    wire(el, function () {
      var p = v(el, 'mo-price'), d = v(el, 'mo-down') / 100, loan = p * (1 - d), r = v(el, 'mo-rate') / 1200, n = v(el, 'mo-yrs') * 12;
      var emi = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n, interest = emi * n - loan, up = p * d + p * 0.04 + loan * 0.0025 + 290 + 3000 + loan * 0.01 + 4200;
      el.querySelector('[data-emi]').textContent = A(emi);
      el.querySelector('[data-rows]').innerHTML = row('Loan amount', SV.fmt(loan)) + row('Total interest', SV.fmt(interest), 'over ' + v(el, 'mo-yrs') + ' years') + row('Total repaid', SV.fmt(emi * n)) + row('Cash needed upfront', SV.fmt(up), 'down payment + DLD 4% + typical bank & trustee fees');
      txt = 'Price ' + A(p) + ', ' + Math.round(d * 100) + '% down, ' + v(el, 'mo-rate') + '% over ' + v(el, 'mo-yrs') + ' yrs\nMonthly: ' + A(emi) + '\nUpfront cash: ' + A(up);
    });
    actions(el, 'Mortgage calculator', function () { return txt; });
  } };

  /* 5. OFF-PLAN GROWTH / ROI ------------------------------------ */
  TOOLS['offplan-roi'] = { title: 'What could off-plan growth be worth?', tag: 'Free calculator', intro: 'Off-plan buyers pay part of the price before handover. If the value rises, the return on the cash you actually put in can be much higher than the growth itself. Try cautious numbers.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div>' +
      range('ro-price', 'Purchase price', 400000, 15000000, 50000, 1500000) +
      range('ro-paid', 'Paid by handover', 10, 100, 5, 40, 'pct') +
      range('ro-g', 'Assumed growth per year', 0, 12, 0.5, 5, 'pct', 'An assumption, not a forecast. Values can also fall.') +
      range('ro-yrs', 'Years to handover', 1, 6, 0.5, 3, 'yr') +
      '</div><div class="result" aria-live="polite"><h3>Illustration</h3><div data-rows></div><div class="big"><span>Return on cash invested</span><b class="num hl" data-roi></b></div><div class="note" data-ann></div></div></div>';
    var txt = '';
    wire(el, function () {
      var p = v(el, 'ro-price'), paid = p * v(el, 'ro-paid') / 100, fees = p * 0.04 + 1250, val = p * Math.pow(1 + v(el, 'ro-g') / 100, v(el, 'ro-yrs')), gain = val - p, cash = paid + fees, roi = gain / cash * 100;
      el.querySelector('[data-rows]').innerHTML = row('Value at handover', SV.fmt(val)) + row('Gain in value', SV.fmt(gain)) + row('Cash you put in', SV.fmt(cash), 'instalments + DLD fee');
      el.querySelector('[data-roi]').textContent = roi.toFixed(0) + '%';
      el.querySelector('[data-ann]').textContent = 'About ' + ((Math.pow(1 + Math.max(roi, -99) / 100, 1 / v(el, 'ro-yrs')) - 1) * 100).toFixed(1) + '% a year, before selling costs. Illustration only.';
      txt = 'Off-plan at ' + A(p) + ', ' + v(el, 'ro-paid') + '% paid by handover, ' + v(el, 'ro-g') + '%/yr over ' + v(el, 'ro-yrs') + ' yrs\nGain ' + A(gain) + ' · ROI on cash ' + roi.toFixed(0) + '%';
    });
    actions(el, 'Off-plan growth calculator', function () { return txt; });
  } };

  /* 6. SAFETY CHECK --------------------------------------------- */
  var CHECKS = [
    ['The developer is registered with RERA', 'Look the developer up by name in the Dubai REST app.'],
    ['The project is registered and has its own escrow account', 'Check status, developer and escrow details in the app.'],
    ['My payment details match that escrow account exactly', 'Same bank, same account number. Never cash or a personal account.'],
    ['The escrow account is written into my SPA', 'Your Sale and Purchase Agreement.'],
    ['My purchase is registered with DLD (Oqood)', 'The interim register for off-plan sales. Ask for the certificate.'],
    ['My broker is RERA-registered', 'Ask for their broker card (BRN) and check it.'],
    ['Instalments are linked to construction progress', 'Compare the completion % with each milestone before paying.'],
    ['I\'ve read the handover date and delay clauses', 'What happens if completion slips?'],
    ['I know the developer\'s track record', 'Past handovers, on time, and quality today.'],
    ['Every receipt is in the project\'s name', 'Keep all of them for registration and any dispute.']
  ];
  TOOLS['safety-check'] = { title: 'Is your project safe to pay?', tag: '5-minute check', intro: 'Tick what you have already verified. Most of it takes five minutes in the Dubai REST app.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div class="checklist">' + CHECKS.map(function (c, i) { return '<label><input type="checkbox" data-i="' + i + '"><span><b>' + c[0] + '</b><small>' + c[1] + '</small></span></label>'; }).join('') + '</div>' +
      '<div class="result" aria-live="polite"><h3>Safety score</h3><div class="score num" data-s>0/10</div><div class="bar"><i data-b style="width:0;background:#C8242B"></i></div><p data-msg></p><a class="btn btn-line" href="guides.html">Get the full checklist PDF</a></div></div>';
    var txt = '';
    el.addEventListener('change', function () {
      var n = el.querySelectorAll('.checklist input:checked').length;
      el.querySelector('[data-s]').textContent = n + '/10'; el.querySelector('[data-b]').style.width = n * 10 + '%';
      el.querySelector('[data-msg]').textContent = n === 10 ? 'All ten checks done. Keep every receipt and you are in good shape.' : n >= 7 ? 'Nearly there. Finish the remaining checks before your next transfer.' : 'Keep going. Don\'t transfer anything until this reaches 10.';
      var miss = CHECKS.filter(function (c, i) { return !el.querySelector('[data-i="' + i + '"]').checked; }).map(function (c) { return '- ' + c[0]; });
      txt = 'Safety score ' + n + '/10' + (miss.length ? '\nStill to check:\n' + miss.join('\n') : '');
    });
    el.dispatchEvent(new Event('change'));
    actions(el, 'Off-plan safety check', function () { return txt; });
  } };

  /* 7. GOLDEN VISA CHECK ---------------------------------------- */
  TOOLS['golden-visa'] = { title: 'Does your property qualify for a Golden Visa?', tag: 'Quick check', intro: 'Property worth at least AED 2 million can make you eligible for the UAE\'s 10-year, renewable Golden Visa. Mortgaged and off-plan property can count, with conditions.', render: function (el) {
    el.innerHTML = '<div class="tool-grid"><div>' + range('gv-val', 'Your property value', 500000, 10000000, 50000, 1600000, 'aed', 'You can usually combine several properties to reach the threshold.') +
      '<div class="field"><span class="lbl">How is it bought?</span>' + seg('how', [['cash', 'Cash, ready'], ['mort', 'Mortgaged'], ['off', 'Off-plan']], 'cash') + '</div></div>' +
      '<div class="result" aria-live="polite"><div class="big" style="margin-top:0"><span>Threshold</span><b class="num">AED 2M</b></div><div class="bar"><i data-b style="background:#C8242B"></i></div><div class="verdict" data-verdict></div><p class="note" data-cond></p><a class="btn btn-brand" href="projects.html?min=2000000">Find visa-eligible projects →</a></div></div>';
    var txt = '';
    wire(el, function () {
      var val = v(el, 'gv-val'), how = segVal(el, 'how'), vd = el.querySelector('[data-verdict]');
      el.querySelector('[data-b]').style.width = Math.min(100, val / 2e6 * 100) + '%';
      if (val >= 2e6) { vd.className = 'verdict good'; vd.textContent = 'On value, you meet the AED 2M threshold.'; }
      else { vd.className = 'verdict low'; vd.textContent = A(2e6 - val) + ' to go to reach AED 2M.'; }
      el.querySelector('[data-cond]').textContent = how === 'mort' ? 'Mortgaged property: you will usually need a no-objection letter from the bank, and rules on how much must be paid off have changed over time.' : how === 'off' ? 'Off-plan: eligibility depends on the developer and on how much has been paid, and the rules have changed over time. Confirm before you rely on it.' : 'The value that counts is the one recorded by the Land Department, not a bank valuation.';
      txt = 'Property value ' + A(val) + ' (' + how + ') → ' + (val >= 2e6 ? 'meets AED 2M' : A(2e6 - val) + ' short');
    });
    actions(el, 'Golden Visa check', function () { return txt; });
  } };

  /* 8. INVESTOR MATCH ------------------------------------------- */
  var Q = [
    ['What do you want the property to do?', [['💸 Monthly rental income', 'income'], ['📈 Grow in value', 'growth'], ['🛂 Golden Visa', 'visa'], ['🏠 Live in it first', 'home']]],
    ['What is your budget?', [['Under AED 1M', 'b1'], ['AED 1M – 2M', 'b2'], ['AED 2M – 5M', 'b3'], ['AED 5M+', 'b4']]],
    ['Ready now or off-plan?', [['Ready, I want rent now', 'ready'], ['Off-plan, I can wait', 'off'], ['Open to both', 'both']]],
    ['How will you pay?', [['Cash', 'cash'], ['Mortgage', 'mort'], ['Payment plan', 'plan']]],
    ['How long will you hold it?', [['Under 3 years', 'short'], ['3 – 7 years', 'mid'], ['7+ years', 'long']]]
  ];
  TOOLS['investor-match'] = { title: 'What kind of UAE investor are you?', tag: '60 seconds', intro: 'Five questions. You get a plan for your profile and the projects worth looking at.', render: function (el) {
    var ans = [], i = 0;
    function draw() {
      if (i < Q.length) {
        el.innerHTML = '<p class="note">Question ' + (i + 1) + ' / ' + Q.length + '</p><h3>' + Q[i][0] + '</h3>' + Q[i][1].map(function (o) { return '<button type="button" class="quiz-opt" data-a="' + o[1] + '">' + o[0] + '</button>'; }).join('');
        return;
      }
      var goal = ans[0], b = ans[1], min = { b1: 0, b2: 1e6, b3: 2e6, b4: 5e6 }[b] || 0;
      var P = { income: ['The Income Builder', 'Focus on ready or near-complete apartments in high-demand rental areas, where net yield after service charges is strongest.'], growth: ['The Early Mover', 'Off-plan launches with long payment plans in growing communities let you control more value with less cash upfront.'], visa: ['The Golden Visa Seeker', 'Target AED 2M+ property from established developers, and confirm visa eligibility before you book.'], home: ['The Future Resident', 'Choose community, schools and layout first; family villas and townhouses with handover in your timeframe.'] }[goal];
      if (goal === 'visa' && min < 2e6) min = 2e6;
      var tips = [
        { ready: 'You want rent now: look at ready or near-complete units, and check the real service charge before you buy.', off: 'You can wait: off-plan lets you pay in stages. Check the escrow account and the developer\'s handover record first.', both: 'Open to both: compare a ready unit\'s net yield with an off-plan unit\'s payment plan before choosing.' }[ans[2]],
        { cash: 'Paying cash: you avoid bank fees and can move fast on good launches.', mort: 'With a mortgage: get pre-approval first, and plan for about 7–8% in fees on top of your deposit.', plan: 'On a payment plan: make sure every instalment fits your cash flow until handover, plus the 4% DLD fee at booking.' }[ans[3]],
        { short: 'Under 3 years: selling costs and possible developer resale rules matter, so check them before you book.', mid: '3–7 years: time to ride a full handover and some growth. Focus on established areas with steady demand.', long: '7+ years: put community, build quality and net yield first. That\'s what holds value.' }[ans[4]]
      ].filter(Boolean);
      el.innerHTML = '<div class="result"><span class="tool-tag">Your profile</span><h3 style="margin-top:12px">' + P[0] + '</h3><p>' + P[1] + '</p>' +
        '<ul class="check-list" style="margin:0 0 18px">' + tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul><div class="btns"><a class="btn btn-brand" href="projects.html' + (min ? '?min=' + min : '') + '">See matching projects →</a><button type="button" class="btn btn-line" data-restart>Start again</button></div></div>';
      el.dataset.result = P[0] + ' · answers: ' + ans.join(', ');
    }
    el.addEventListener('click', function (e) {
      var o = e.target.closest('[data-a]'); if (o) { ans.push(o.dataset.a); i++; draw(); }
      if (e.target.closest('[data-restart]')) { ans = []; i = 0; draw(); }
    });
    draw();
    actions(el, 'Investor match quiz', function () { return el.dataset.result || 'Investor match quiz'; });
  } };

  /* ---------- render helpers ---------- */
  SV.TOOLS = TOOLS;
  SV.renderTool = function (host, id, opt) {
    var t = TOOLS[id]; if (!t) return;
    opt = opt || {};
    host.classList.add('tool'); host.id = host.id || id;
    host.innerHTML = '<div class="tool-head"><div><h3 style="font-size:clamp(1.5rem,3vw,2.1rem)">' + SV.esc(opt.title || t.title) + '</h3><p class="note" style="max-width:640px;margin:0">' + SV.esc(opt.intro || t.intro) + '</p></div><span class="tool-tag">' + SV.esc(t.tag) + '</span></div><div class="tool-body"></div>';
    t.render(host.querySelector('.tool-body'));
  };
  SV.ready.then(function () {
    document.querySelectorAll('[data-tool]').forEach(function (h) { SV.renderTool(h, h.dataset.tool); });
  });
})();
