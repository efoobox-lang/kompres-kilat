import JSZip from 'jszip';

function escapeXml(unsafe: string): string {
  // Bersihkan karakter kontrol biner yang tidak valid dalam XML 1.0 agar file Word tidak corrupt
  const clean = unsafe.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, '');
  return clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Membuat file Microsoft Word (.docx) asli berbasis spesifikasi OpenXML
 * Kompatibel 100% dengan Microsoft Word, Google Docs, Apple Pages, dan WPS Office.
 */
export async function generateDocxBlob(
  paragraphs: string[],
  documentTitle: string = 'Dokumen Hasil Konversi OCR'
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  zip.folder('word')?.file(
    '_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // 4. word/document.xml
  const bodyXml = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) {
        return '<w:p/>';
      }

      if (trimmed.startsWith('===') || trimmed.startsWith('---') || /^\[\s*Halaman\s+\d+\s*\]/i.test(trimmed)) {
        return `
          <w:p>
            <w:pPr>
              <w:spacing w:before="280" w:after="140"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:b/>
                <w:color w:val="4F46E5"/>
                <w:sz w:val="26"/>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(trimmed)}</w:t>
            </w:r>
          </w:p>
        `;
      }

      const isHeading = trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ');
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
      let cleanText = trimmed;
      if (isHeading) {
        cleanText = trimmed.replace(/^#+\s*/, '');
      } else if (isBullet) {
        cleanText = trimmed.replace(/^[-•*]\s*/, '• ');
      }

      return `
        <w:p>
          <w:pPr>
            ${isHeading ? '<w:pStyle w:val="Heading1"/><w:spacing w:before="200" w:after="80"/>' : '<w:spacing w:after="100" w:line="276" w:lineRule="auto"/>'}
            ${isBullet ? '<w:ind w:left="420" w:hanging="240"/>' : ''}
          </w:pPr>
          <w:r>
            <w:rPr>
              ${isHeading ? '<w:b/><w:sz w:val="30"/><w:color w:val="1E1B4B"/>' : '<w:sz w:val="23"/><w:color w:val="1F2937"/>'}
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(cleanText)}</w:t>
          </w:r>
        </w:p>
      `;
    })
    .join('');

  zip.folder('word')?.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="333333"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(documentTitle)}</w:t>
      </w:r>
    </w:p>
    <w:p/>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return blob;
}

