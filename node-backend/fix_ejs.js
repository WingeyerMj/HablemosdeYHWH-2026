const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'semillas_torah.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: destacada.title.replace
content = content.replace(
  /destacada\.title\.replace\(\/'\/g,\s*&quot;\\\\'&quot;\)/g,
  "destacada.title.replace(/'/g, \"\\\\'\")"
);
content = content.replace(
  /destacada\.title\.replace\(\/'\/g,\s*"[ \t]*\r?\n[ \t]*\\\\'"\)/g,
  "destacada.title.replace(/'/g, \"\\\\'\")"
);

// Fix 2: pi.title.replace
content = content.replace(
  /pi\.title\.replace\(\/'\/g,\s*"[ \t]*\r?\n[ \t]*\\\\'"\)/g,
  "pi.title.replace(/'/g, \"\\\\'\")"
);

// Fix 3 & 4: art.title.replace
content = content.replace(
  /art\.title\.replace\(\/'\/g,\s*"[ \t]*\r?\n[ \t]*\\\\'"\)/g,
  "art.title.replace(/'/g, \"\\\\'\")"
);

// Fix 5 & 6: short.title.replace
content = content.replace(
  /short\.title\.replace\(\/"[ \t]*\r?\n[ \t]*\/g,\s*'&quot;'\s*\)/g,
  "short.title.replace(/\"/g, '&quot;')"
);

fs.writeFileSync(filePath, content, 'utf8');

// Test EJS compilation
const ejs = require('./node_modules/ejs');
try {
  ejs.compile(content);
  console.log('SUCCESS: semillas_torah.ejs compiles cleanly!');
} catch (e) {
  console.error('ERROR compiling semillas_torah.ejs:', e.message);
}
