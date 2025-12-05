// inject-ga.js
const fs = require('fs');
const path = require('path');

const GA_ID = process.env.GA_ID || 'G-EM06MYPZ27'; // override in workflow if needed

const GA_SNIPPET = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>
`;

function injectInFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('gtag(')) return; // already injected

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${GA_SNIPPET}\n</head>`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Injected GA into ${filePath}`);
  } else {
    console.warn(`No </head> found in ${filePath}, skipping.`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith('.html')) {
      injectInFile(full);
    }
  }
}

walk('.');
