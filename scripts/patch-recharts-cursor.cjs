const fs = require('fs');
const path = require('path');

const root = process.cwd();
const recharts = path.join(root, 'node_modules', 'recharts');
const patches = path.join(root, 'patches');

const es6Target = path.join(recharts, 'es6', 'component', 'Cursor.js');
const libTarget = path.join(recharts, 'lib', 'component', 'Cursor.js');
const es6Source = path.join(patches, 'recharts-cursor-es6.js');
const libSource = path.join(patches, 'recharts-cursor-lib.js');

if (fs.existsSync(recharts) && fs.existsSync(es6Source) && fs.existsSync(libSource)) {
  fs.copyFileSync(es6Source, es6Target);
  fs.copyFileSync(libSource, libTarget);
}
