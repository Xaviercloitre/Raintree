# Raintree International School website

Static HTML/CSS/JS build for raintree.ac.th, deployed on Netlify from this repository.
The existing WordPress install remains a headless data source over the REST API.

- `index.html` - homepage (12 approved sections)
- `assets/css/main.css` - styles, Raintree brand tokens at the top
- `assets/js/main.js` - menu, call sheet, tap-to-play video, hero background
- `netlify.toml` - headers; carries the staging noindex guard, remove at cutover

Content rules: confirmed facts only, no superlatives, British English, no em dashes.
Amber "to confirm" markers in the page are open client questions, not copy.
