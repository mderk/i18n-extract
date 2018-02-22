import glob from 'glob';
import fs from 'fs';
import path from 'path'
import extractFromCode from './extractFromCode';

export default function extractFromFiles(filenames, options) {
  const keys = [];

  // filenames should be an array
  if (typeof filenames === 'string') {
    filenames = [filenames];
  }

  let toScan = [];
  const globOpts = (options && options.glob) || {};

  filenames.forEach(filename => {
    toScan = toScan.concat(glob.sync(filename, globOpts));
  });

  toScan.forEach(filename => {
    let code = fs.readFileSync(filename, 'utf8');
    code = compileCode(filename, code, options);
    const extractedKeys = extractFromCode(code, options);
    extractedKeys.forEach(keyObj => {
      keyObj.file = filename;
      keys.push(keyObj);
    });
  });

  return keys;
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
