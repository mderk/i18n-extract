import glob from 'glob';
import fs from 'fs';
import path from 'path'
import { uniq } from './utils';
import extractFromCode from './extractFromCode';

export default function extractFromFiles(filenames, options) {
  let keys = [];

  // filenames should be an array
  if (typeof filenames === 'string') {
    filenames = [
      filenames,
    ];
  }

  let toScan = [];

  filenames.forEach((filename) => {
    toScan = toScan.concat(glob.sync(filename, {}));
  });

  toScan.forEach((filename) => {
    let code = fs.readFileSync(filename, 'utf8');
    code = compileCode(filename, code, options);
    keys = keys.concat(extractFromCode(code, options));
  });

  return uniq(keys);
}

const compilersCache = {};

function compileCode(filename, code, options) {
  if (!options || !options.compilers) {
    return code;
  }

  let ext = path.extname(filename);
  if (!ext) {
    return code;
  }
  ext = ext.substr(1); // .txt -> txt
  const compiler = options.compilers[ext];
  if (compiler) {
    let compile = compilersCache[compiler];
    try {
      if (!compile) {
        compile = require('./compilers/'+compiler+'/compile');
        compilersCache[compiler] = compile;
      }
      if (compile) {
        return compile(code, options);
      }
    } catch (e) {
      console.log('Skipping ' + filename);
      console.log(e);
    }
  }
  return code;
}
