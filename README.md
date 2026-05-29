# Fullstack Dev Guide

An interactive developer reference covering every major fullstack topic.
No build tools, no dependencies to install — just open `index.html` in your browser.

## Folder Structure

```
fullstack-dev-guide/
├── index.html        ← Main HTML (open this)
├── css/
│   └── style.css     ← All styles & CSS variables
└── js/
    ├── data.js       ← All concept data (DB, DIFF_STYLES, SECTION_META)
    └── app.js        ← UI logic (render, search, tabs, navigation)
```

## How to Run

**Option 1 — Just open it:**
Double-click `index.html` in your file manager. Works with no server needed.

**Option 2 — Local dev server (recommended):**
```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code
Install "Live Server" extension → right-click index.html → Open with Live Server
```
Then visit `http://localhost:8080`

## Sections Covered

| Section      | Topics |
|-------------|--------|
| HTML / CSS  | Box model, Flexbox, CSS Grid, Selectors, Transitions, Variables, Responsive, Positions |
| JavaScript  | let/const, Arrow functions, Promises, Async/await, Array methods, Closures, Fetch API |
| React       | JSX, useState, useEffect, useReducer, useRef, useMemo |
| Node.js     | Express basics, Middleware, REST API |
| SQL / DB    | SELECT, JOINs, Aggregates |
| Auth        | JWT basics, Password hashing, OAuth 2.0, Auth middleware, CORS & HTTPS |
| API Design  | REST design, API keys, Rate limiting, Input validation, Error handling |
| Git         | Core workflow, Branches, Remotes & push |
| Deployment  | Environment vars, Docker, CI/CD pipeline, Nginx, PM2 |

## Features

- 🔍 **Live search** across all concepts
- 🏷️ **Category filters** per section
- 📖 **5 tabs per concept:** Overview · Code · Use Cases · Gotchas · Related
- ✅ **Mark as learned** with visual progress tracking
- ⬅️➡️ **Prev / Next** navigation within a section
- 🔗 **Related concepts** are clickable to jump directly

## Customising

To add a new concept, open `js/data.js` and add an entry to the relevant section array:

```js
{
  name: 'My Concept',
  cat:  'Category',
  icon: 'ti-star',           // Tabler icon name
  color: '#EEEDFE',          // Badge background
  tc:    '#3C3489',          // Badge text colour
  diff:  'beginner',         // beginner | intermediate | advanced
  desc:  'One-line description',
  explain: 'Longer explanation...',
  points: ['Point 1', 'Point 2', 'Point 3'],
  code: `// Your code here`,
  uses: [
    { t: 'Use case title', d: 'Description' },
  ],
  gotchas: ['Watch out for this...'],
  related: ['Other Concept'],
}
```

To add a new **section**, add the array to `DB` in `data.js`, add metadata to `SECTION_META`,
and add a `<button class="nav-btn" data-s="mykey">` in `index.html`.

## Icons

Icons come from [Tabler Icons](https://tabler.io/icons) loaded via CDN.
Browse icons at `https://tabler.io/icons` — use the name without the `ti-` prefix when searching.
