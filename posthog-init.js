// Shared deferred PostHog initialization for the marketing site.
// Keep this separate from the library so neither script blocks HTML rendering.
var mslProductionHosts = ['microschoolledger.com', 'www.microschoolledger.com'];

if (window.posthog && mslProductionHosts.indexOf(window.location.hostname) !== -1) {
  posthog.init('phc_B349p68WcgUkeakKmWyyUap4iiHPYN3v7aNfVUyCKax6', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    cross_subdomain_cookie: true,
    loaded: function (analytics) {
      analytics.register({ marketing_positioning_version: 'collections_v1' });
    }
  });
}
