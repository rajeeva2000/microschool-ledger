(function () {
  'use strict';
  var form = document.getElementById('tuition-form');
  var container = document.getElementById('programs');
  var status = document.getElementById('result-status');
  var error = document.getElementById('calculator-error');
  var download = document.getElementById('download-results');
  var resultBody = document.getElementById('results-body');
  var scheduleSection = document.getElementById('payment-schedule');
  var programCount = 0, started = false, lastInput, lastResult;
  var currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});
  var attribution = {};
  var params = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) { attribution[key] = params.get(key) || ''; });
  function track(event, properties) {
    if (['www.microschoolledger.com', 'microschoolledger.com'].indexOf(location.hostname) !== -1 && window.posthog && window.posthog.__loaded) {
      window.posthog.capture(event, Object.assign({calculator_version: 'tuition_v1', page: 'microschool_tuition_calculator'}, attribution, properties || {}));
    }
  }
  function dollars(cents) { return currency.format(cents / 100); }
  function field(id, key, label, value, max, step, description) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" data-field="' + key + '" type="number" min="0" max="' + max + '" step="' + step + '" value="' + value + '" required inputmode="' + (step === 1 ? 'numeric' : 'decimal') + '"' + (description ? ' aria-describedby="' + description + '"' : '') + '></div>';
  }
  function addProgram(values) {
    if (container.children.length >= 6) return;
    programCount++;
    var id = 'program-' + programCount;
    var card = document.createElement('fieldset');
    card.className = 'program-card';
    card.dataset.program = id;
    var defaults = values || {enrollment: 10, tuition: 6000, deposit: 500, payments: 10, discount: 0};
    // Labels and defaults come only from this script; visitor input never enters HTML.
    card.innerHTML = '<legend class="program-legend">Program</legend><div class="program-card-header"><h3 class="program-title">Program</h3><button class="text-button remove-program" type="button">Remove</button></div><div class="field-grid">' +
      field(id + '-enrollment', 'enrollment', 'Enrollments in this program', defaults.enrollment, 10000, 1, 'enrollment-help') +
      field(id + '-tuition', 'tuition', 'Annual tuition per enrollment ($)', defaults.tuition, 10000000, 0.01) +
      field(id + '-deposit', 'deposit', 'Upfront deposit toward tuition ($)', defaults.deposit, 10000000, 0.01) +
      field(id + '-payments', 'payments', 'Remaining monthly payments', defaults.payments, 12, 1) +
      '</div><details' + (defaults.discount ? ' open' : '') + '><summary>Allow for discounts</summary>' +
      field(id + '-discount', 'discount', 'Estimated combined discount (%)', defaults.discount, 100, 0.01, id + '-discount-help') +
      '<p class="field-help" id="' + id + '-discount-help">Use one average percentage for this program’s family, program-combination, and sibling discounts. This estimates their combined effect; it does not apply individual family rules.</p></details>';
    card.querySelector('[data-field="payments"]').min = 1;
    container.appendChild(card);
    card.querySelector('.remove-program').addEventListener('click', function () {
      card.remove();
      renumber();
      markDirty();
      document.getElementById('add-program').focus();
    });
    renumber();
    return card;
  }
  function renumber() {
    var cards = Array.from(container.children);
    cards.forEach(function (card, i) {
      var name = 'Program ' + (i + 1);
      card.querySelector('.program-title').textContent = name;
      card.querySelector('.program-legend').textContent = name;
      card.querySelector('.remove-program').setAttribute('aria-label', 'Remove ' + name.toLowerCase());
      card.querySelector('.remove-program').hidden = cards.length === 1;
    });
    document.getElementById('add-program').disabled = cards.length >= 6;
  }
  function readInput() {
    return {
      programs: Array.from(container.children).map(function (card) {
        var p = {};
        card.querySelectorAll('[data-field]').forEach(function (input) { p[input.dataset.field] = input.value; });
        return p;
      }),
      staffing: form.elements.staffing.value, space: form.elements.space.value, other: form.elements.other.value,
      collectionRate: form.elements.collectionRate.value, processingRate: form.elements.processingRate.value
    };
  }
  function markDirty() {
    if (!started) { track('tuition_calculator_started'); started = true; }
    lastResult = null;
    resultBody.hidden = true;
    scheduleSection.hidden = true;
    download.disabled = true;
    status.textContent = 'Inputs changed. Update your estimate to see the new results.';
  }
  function output(id, value) { document.getElementById(id).textContent = value; }
  function calculate(announce, analytics) {
    var invalid = Array.from(form.querySelectorAll('input')).filter(function (field) {
      field.removeAttribute('aria-invalid');
      return !field.checkValidity();
    });
    error.hidden = true;
    if (invalid.length) {
      invalid.forEach(function (field) { field.setAttribute('aria-invalid', 'true'); });
      error.textContent = invalid[0].labels[0].textContent + ': ' + invalid[0].validationMessage;
      error.hidden = false;
      invalid[0].focus();
      return false;
    }
    try {
      lastInput = readInput();
      lastResult = window.TuitionCalculator.calculate(lastInput);
    } catch (failure) {
      error.textContent = failure.message;
      error.hidden = false;
      status.textContent = 'Check your inputs, then update the estimate.';
      return false;
    }
    var r = lastResult;
    output('net-label', r.net < 0 ? 'Projected annual shortfall' : (r.net === 0 ? 'Projected annual balance' : 'Projected annual surplus'));
    output('net-result', dollars(r.net));
    [['gross-result', r.gross], ['discount-result', r.discounts], ['billed-result', r.billed], ['receipts-result', r.receipts], ['fees-result', r.paymentCosts], ['costs-result', r.annualCosts], ['upfront-result', r.upfront], ['reserve-result', r.reserve]].forEach(function (pair) { output(pair[0], dollars(pair[1])); });
    output('target-result', r.target === null ? 'No finite target at 0% collection' : dollars(r.target));
    output('lower-result', dollars(r.lowerEnrollmentNet) + (r.lowerEnrollmentNet < 0 ? ' shortfall' : ' surplus'));
    var summary = document.getElementById('program-summary');
    summary.replaceChildren();
    r.programs.forEach(function (p, i) {
      var article = document.createElement('article');
      article.className = 'program-payment';
      var heading = document.createElement('h3'); heading.textContent = 'Program ' + (i + 1); article.appendChild(heading);
      [p.enrollment + ' enrollments · ' + dollars(p.netTuition) + ' tuition each after discounts', dollars(p.deposit) + ' deposit per enrollment', p.payments + ' remaining payments: ' + dollars(p.installment) + ' each' + (p.installment !== p.finalInstallment ? ' (final payment ' + dollars(p.finalInstallment) + ')' : ''), dollars(p.billed) + ' annual tuition for this program'].forEach(function (text) { var line = document.createElement('p'); line.textContent = text; article.appendChild(line); });
      summary.appendChild(article);
    });
    var tbody = document.getElementById('schedule-rows');
    tbody.replaceChildren();
    r.schedule.forEach(function (row) {
      var tr = document.createElement('tr');
      var th = document.createElement('th'); th.scope = 'row'; th.textContent = row.period === 0 ? 'Upfront deposits' : 'Month ' + row.period; tr.appendChild(th);
      [row.receipts, row.paymentCosts, row.operatingCosts, row.cumulative].forEach(function (value) { var td = document.createElement('td'); td.textContent = dollars(value); tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    resultBody.hidden = false;
    scheduleSection.hidden = false;
    download.disabled = false;
    status.textContent = announce ? 'Estimate updated. Your results and download are ready.' : 'Fictional example. Replace the inputs to plan your school year.';
    if (analytics) track('tuition_calculator_calculated', {program_count: r.programs.length});
    return true;
  }
  function reset() {
    form.reset();
    container.replaceChildren();
    programCount = 0;
    addProgram({enrollment: 20, tuition: 6000, deposit: 500, payments: 10, discount: 0});
    error.hidden = true;
    calculate(false, false);
  }
  form.addEventListener('input', markDirty);
  form.addEventListener('submit', function (event) { event.preventDefault(); calculate(true, true); });
  document.getElementById('add-program').addEventListener('click', function () {
    var card = addProgram();
    markDirty();
    if (card) card.querySelector('input').focus();
  });
  document.getElementById('reset-example').addEventListener('click', function () { reset(); status.textContent = 'Fictional example restored. Your previous entries have been cleared.'; });
  download.addEventListener('click', function () {
    if (!lastResult) return;
    var blob = new Blob([window.TuitionCalculator.csv(lastInput, lastResult)], {type: 'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url; link.download = 'microschool-tuition-plan.csv';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    track('tuition_calculator_downloaded', {format: 'csv'});
    status.textContent = 'Your results download has started.';
  });
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation menu'); menu.classList.remove('open'); }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open)); toggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu'); menu.classList.toggle('open', !open);
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
  document.querySelectorAll('[data-cta]').forEach(function (link) {
    var target = new URL(link.href, location.href);
    Object.keys(attribution).forEach(function (key) { if (attribution[key] && !target.searchParams.has(key)) target.searchParams.set(key, attribution[key]); });
    link.href = target.href;
    link.addEventListener('click', function () { track('tuition_calculator_cta_clicked', {cta: link.dataset.cta, cta_location: link.dataset.location}); });
  });
  reset();
  track('tuition_calculator_viewed');
}());
