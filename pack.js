// Obfuscate the built mod.js before publishing: mangled identifiers +
// base64 string array, no control-flow flattening (keeps game loop fast).
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

let src = fs.readFileSync(process.argv[2], 'utf8');
// key system: extra-heavy pass (control flow flattening, dead code, rc4 strings)
const GKS = '/*@GKS*/', GKE = '/*@GKE*/';
const a = src.indexOf(GKS), b = src.indexOf(GKE);
if (a < 0 || b < a) { console.error('pack: key system markers missing'); process.exit(1); }
const ks = src.slice(a + GKS.length, b);
const ksObf = JavaScriptObfuscator.obfuscate(ks, {
  compact: true,
  renameGlobals: false,
  identifierNamesGenerator: 'hexadecimal',
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 1,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 3,
  stringArrayWrappersType: 'function',
  splitStrings: true,
  splitStringsChunkLength: 4,
  numbersToExpressions: true,
  transformObjectKeys: true,
  selfDefending: false,
  target: 'browser'
}).getObfuscatedCode();
src = src.slice(0, a) + '\n' + ksObf + '\n' + src.slice(b + GKE.length);
const res = JavaScriptObfuscator.obfuscate(src, {
  compact: true,
  simplify: true,
  renameGlobals: false,
  renameProperties: false,
  identifierNamesGenerator: 'mangled-shuffled',
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 1,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: true,
  debugProtection: false,
  disableConsoleOutput: false,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  numbersToExpressions: false,
  target: 'browser'
});
fs.writeFileSync(process.argv[3], res.getObfuscatedCode());
