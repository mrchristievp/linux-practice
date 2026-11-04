export function requireReportName(name){const cleaned=String(name??'').replace(/\s+/g,' ').trim();if(!cleaned)throw Error('Enter your name before downloading your report.');if(cleaned.length>120)throw Error('Use 120 characters or fewer for your name.');return cleaned;}
// Preserve unsupported characters as visible escapes rather than losing command evidence.
export function pdfReportText(text){return String(text).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/\u00a0/g,' ').replace(/\t/g,'    ').replace(/[^\x20-\x7e\xa0-\xff\n]/gu,c=>'\\u{'+c.codePointAt(0).toString(16)+'}');}
export function createProgressPdf(report,{studentName,siteVersion=' ',PdfClass}={}){
 const name=requireReportName(studentName);if(typeof PdfClass!=='function')throw Error('PDF tools did not load. Refresh the page and try again.');
 const pdf=new PdfClass({unit:'pt',format:'letter',compress:true,putOnlyUsedFonts:true});
 pdf.setProperties({title:'Linux Practice Progress Report',author:name,subject:'Student progress, terminal work and practice questions',creator:'Linux Practice '+siteVersion});
 const margin=48,width=516,bottom=730;let y=110;
 function header(){pdf.setFont('helvetica','bold');pdf.setFontSize(16);pdf.setTextColor(37,39,54);pdf.text('Linux Practice - Progress Report',margin,48);pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.text(pdf.splitTextToSize('Student: '+pdfReportText(name),width),margin,68);pdf.setFontSize(9);pdf.setTextColor(90,95,105);pdf.text('Site '+pdfReportText(siteVersion),margin,90);pdf.setDrawColor(233,29,99);pdf.setLineWidth(1.5);pdf.line(margin,98,564,98);y=118;}
 function reserve(height){if(y+height>bottom){pdf.addPage();header();}}
 header();
 const raw=pdfReportText(report).split('\n');
 // Name and version are repeated in each page header; retain the report timestamp below.
 const created=raw.find(s=>s.startsWith('Report created:'))||'';
 const body=raw[0]==='LINUX PRACTICE - PROGRESS REPORT'?[created,'',...raw.slice(6)]:raw;
 for(let i=0;i<body.length;i++){
  const line=body[i];if(/^[=-]{4,}$/.test(line))continue;
  if(!line){reserve(6);y+=6;continue;}
  const section=/^[=-]{4,}$/.test(body[i+1]||'');
  pdf.setFont(section?'helvetica':'courier',section?'bold':'normal');pdf.setFontSize(section?10.5:9);
  const wrapped=pdf.splitTextToSize(line,width);if(!section&&(/:$/.test(line.trim())||/^\s+\d+\. /.test(line)))reserve(48);if(section)reserve(15*wrapped.length+30);
  for(const part of wrapped){reserve(section?15:12);pdf.setFont(section?'helvetica':'courier',section?'bold':'normal');pdf.setFontSize(section?10.5:9);pdf.setTextColor(section?37:50,section?39:53,section?54:62);pdf.text(part,margin,y);y+=section?15:12;}
 }
 const pages=pdf.getNumberOfPages();for(let n=1;n<=pages;n++){pdf.setPage(n);pdf.setDrawColor(215);pdf.setLineWidth(.5);pdf.line(margin,748,564,748);pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100);pdf.text(`Page ${n} of ${pages}`,564,763,{align:'right'});}
 return new Uint8Array(pdf.output('arraybuffer'));
}
