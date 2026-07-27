const DEFAULT_TITLE = 'Wayfare — Road Trip Planner';
const DEFAULT_DESCRIPTION =
  'Plan driveable multi-stop road trips with daily driving caps, fuel estimates, border logistics, and shareable itineraries. Zero API keys.';

function setMetaBySelector(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

/**
 * Update document title + OG/Twitter meta for shared trips.
 * Note: most social crawlers ignore URL hashes and do not run JS, so the
 * static tags in `index.html` remain the primary share card. Client updates
 * still improve the tab title and in-app browsers that re-read the DOM.
 */
export function syncDocumentMeta(labels: string[]): void {
  const hasRoute = labels.length >= 2;
  const title = hasRoute
    ? `Wayfare · ${labels[0]} → ${labels[labels.length - 1]}`
    : labels.length === 1
      ? `Wayfare · ${labels[0]}`
      : DEFAULT_TITLE;

  const description = hasRoute
    ? `Shared Wayfare itinerary: ${labels.join(' → ')}. Open to view the full multi-stop route, driving caps, and fuel estimate.`
    : DEFAULT_DESCRIPTION;

  document.title = title;
  setMetaBySelector('meta[name="description"]', 'content', description);
  setMetaBySelector('meta[property="og:title"]', 'content', title);
  setMetaBySelector('meta[property="og:description"]', 'content', description);
  setMetaBySelector('meta[name="twitter:title"]', 'content', title);
  setMetaBySelector('meta[name="twitter:description"]', 'content', description);
}
