// Practical guides (attendance, field trips): free-tool start links, the
// printable sheet button, and two explicit funnel events.
//   guide_viewed       — a guide was viewed (page = data-guide on <body>)
//   free_start_clicked — a "Start free" link in a guide was chosen
// free_start_clicked uses the same properties as /free-attendance/ and
// /free-events/ (entry_workflow, offer_version, cta_location, campaign
// fields), plus page = the guide, so guide signups join the existing funnel.
// Properties are campaign fields, the CTA location and the page only, never
// anything a visitor typed. Events reach PostHog only on the production hosts;
// elsewhere a browser test may collect them by setting
// window.__MSL_ANALYTICS_SINK__ = [] before the page loads.
(function () {
  var PRODUCTS = {
    attendance: { entry_workflow: 'attendance', offer_version: 'free_attendance_v1' },
    events: { entry_workflow: 'events', offer_version: 'free_events_v1', product: 'events' }
  };
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORAGE_KEY = 'mslGuideAttribution';
  var SAFE = /^[A-Za-z0-9 _.+\-]{1,100}$/;
  var PRODUCTION = ['microschoolledger.com', 'www.microschoolledger.com'];
  var isProduction = PRODUCTION.indexOf(window.location.hostname) !== -1;
  var guide = (document.body && document.body.dataset.guide) || 'guide';

  var params = new URLSearchParams(window.location.search);
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (e) { saved = {}; }
  var campaign = {};
  var fresh = UTM_KEYS.some(function (k) { return params.get(k); });
  UTM_KEYS.forEach(function (k) {
    var v = fresh ? params.get(k) : saved[k];
    if (v && SAFE.test(v)) campaign[k] = v;
  });
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(campaign)); } catch (e) { /* storage unavailable */ }

  function capture(name, properties, options) {
    if (!isProduction) {
      if (Array.isArray(window.__MSL_ANALYTICS_SINK__)) window.__MSL_ANALYTICS_SINK__.push({ type: 'capture', event: name, properties: properties, options: options || null });
      return;
    }
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, properties, options);
  }

  function base(extra) {
    var out = { page: guide, pathname: window.location.pathname };
    Object.keys(campaign).forEach(function (k) { out[k] = campaign[k]; });
    Object.keys(extra || {}).forEach(function (k) { out[k] = extra[k]; });
    return out;
  }

  // posthog-init.js runs deferred too; wait for it so the view isn't lost.
  function onReady(fn) {
    if (!isProduction || (window.posthog && window.posthog.__loaded)) { fn(); return; }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if ((window.posthog && window.posthog.__loaded) || tries > 40) { clearInterval(timer); fn(); }
    }, 100);
  }

  onReady(function () { capture('guide_viewed', base()); });

  document.querySelectorAll('a.start-free[data-product]').forEach(function (link) {
    var product = PRODUCTS[link.dataset.product];
    if (!product) return;
    var url = new URL(link.href);
    if (product.product) url.searchParams.set('product', product.product);
    url.searchParams.set('entry_workflow', product.entry_workflow);
    url.searchParams.set('landing_path', window.location.pathname);
    UTM_KEYS.forEach(function (k) { if (campaign[k]) url.searchParams.set(k, campaign[k]); });
    link.href = url.toString();
    link.addEventListener('click', function () {
      capture('free_start_clicked', base({
        entry_workflow: product.entry_workflow,
        offer_version: product.offer_version,
        cta_location: link.dataset.ctaLocation || 'unknown'
      }), { transport: 'sendBeacon', send_instantly: true });
    });
  });

  // Print only the sign-in sheet, not the whole article.
  document.querySelectorAll('[data-print-sheet]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.classList.add('printing-sheet');
      capture('guide_sheet_printed', base());
      window.print();
    });
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing-sheet'); });
}());
