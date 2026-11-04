import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const base=fileURLToPath(new URL('.',import.meta.url));
const code=['engine.mjs','content.mjs','progress.mjs','pdf-report.mjs','app.mjs'].map(f=>readFileSync(base+f,'utf8').replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'')).join('\n');
const css=readFileSync(base+'style.css','utf8');
const pdfLibrary=readFileSync(base+'jspdf-4.2.1.umd.min.js','utf8').replace(/<\/script/gi,'<\\/script');
const html=readFileSync(base+'template.html','utf8').replace('/* STYLES */',css).replace('/* PDF LIBRARY */',()=>pdfLibrary).replace('/* APPLICATION */',()=>code);
writeFileSync(base+'index.html',html);mkdirSync(base+'dist',{recursive:true});writeFileSync(base+'dist/index.html',html);mkdirSync(base+'.openai',{recursive:true});writeFileSync(base+'.openai/hosting.json',JSON.stringify({static:{directory:'dist'}},null,2)+'\n');
console.log('Built index.html');
