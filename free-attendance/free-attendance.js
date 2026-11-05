// Free attendance page: campaign carry-over and two funnel events.
// See docs in the app repo: docs/proposals/attendance-free-analytics.md.
//   free_offer_viewed  — this page was viewed
//   free_start_clicked — a "Start free" link was chosen
// Properties are campaign fields, the CTA location and the page path only —
// never anything a visitor typed. Events reach PostHog only on the
// production hosts (posthog-init.js); elsewhere a browser test may collect
// them by setting window.__MSL_ANALYTICS_SINK__ = [] before the page loads.
(function () {
  var OFFER_VERSION = 'free_attendance_v1';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORAGE_KEY = 'mslFreeAttendanceAttribution';
  var SAFE = /^[A-Za-z0-9 _.+\-]{1,100}$/;
  var PRODUCTION = ['microschoolledger.com', 'www.microschoolledger.com'];
  var isProduction = PRODUCTION.indexOf(window.location.hostname) !== -1;

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

  function props(extra) {
    var out = { entry_workflow: 'attendance', offer_version: OFFER_VERSION, page: 'free_attendance', pathname: window.location.pathname };
    Object.keys(campaign).forEach(function (k) { out[k] = campaign[k]; });
    Object.keys(extra || {}).forEach(function (k) { out[k] = extra[k]; });
    return out;
  }

  function capture(name, properties, options) {
    if (!isProduction) {
      if (Array.isArray(window.__MSL_ANALYTICS_SINK__)) window.__MSL_ANALYTICS_SINK__.push({ type: 'capture', event: name, properties: properties, options: options || null });
      return;
    }
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, properties, options);
  }

  function register(first) {
    if (!isProduction) {
      if (Array.isArray(window.__MSL_ANALYTICS_SINK__)) window.__MSL_ANALYTICS_SINK__.push({ type: 'register_once', properties: first });
      return;
    }
    if (window.posthog && window.posthog.register_once) window.posthog.register_once(first);
  }

  // The app link: attendance intent, this page as the landing path, and the campaign.
  function startUrl(href) {
    var url = new URL(href);
    url.searchParams.set('entry_workflow', 'attendance');
    url.searchParams.set('landing_path', window.location.pathname);
    UTM_KEYS.forEach(function (k) { if (campaign[k]) url.searchParams.set(k, campaign[k]); });
    return url.toString();
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

  onReady(function () {
    // First touch: kept for the person; later visits never overwrite it.
    register({ first_entry_workflow: 'attendance', first_offer_version: OFFER_VERSION });
    capture('free_offer_viewed', props());
  });

  document.querySelectorAll('a.start-free').forEach(function (link) {
    link.href = startUrl(link.href);
    link.addEventListener('click', function () {
      // The page is about to navigate to the app: send by beacon.
      capture('free_start_clicked', props({ cta_location: link.dataset.ctaLocation || 'unknown' }), { transport: 'sendBeacon', send_instantly: true });
    });
  });

  var button = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-menu');
  if (button && menu) {
    function setOpen(open) {
      button.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
    }
    button.addEventListener('click', function () { setOpen(button.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setOpen(false); });
  }
}());
