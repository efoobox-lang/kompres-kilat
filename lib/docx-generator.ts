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

export interface CvDocxOptions {
  fullName: string;
  contactLine?: string;
  summary?: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
  photoBase64?: string;
  template?: 'ats' | 'professional' | 'minimalist';
}

/**
 * Membuat file Microsoft Word (.docx) berformat Curriculum Vitae (CV) profesional
 * Mendukung heading rapi, bullet points, styling ATS/Professional, serta pasfoto tersemat.
 */
export async function generateCvDocxBlob(options: CvDocxOptions): Promise<Blob> {
  const {
    fullName = 'Nama Lengkap',
    contactLine = '',
    summary = '',
    sections = [],
    photoBase64,
    template = 'ats',
  } = options;

  const zip = new JSZip();
  const hasPhoto = Boolean(photoBase64 && photoBase64.startsWith('data:image/'));
  const isJpeg = hasPhoto && (photoBase64?.includes('image/jpeg') || photoBase64?.includes('image/jpg'));
  const photoExt = isJpeg ? 'jpeg' : 'png';

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
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
  const wordRels = hasPhoto
    ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdPhoto" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/photo.${photoExt}"/>
</Relationships>`
    : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  zip.folder('word')?.file('_rels/document.xml.rels', wordRels);

  // Jika ada foto, ekstrak data base64 dan simpan ke word/media/
  if (hasPhoto && photoBase64) {
    try {
      const base64Data = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      zip.folder('word')?.folder('media')?.file(`photo.${photoExt}`, base64Data, { base64: true });
    } catch (err) {
      console.warn('Gagal menyematkan foto ke Word:', err);
    }
  }

  const isAts = template === 'ats';
  const isProfessional = template === 'professional';
  const primaryAlign = isAts ? 'center' : 'left';
  const primaryColor = isProfessional ? '1E1B4B' : '0F172A';
  const accentColor = isProfessional ? '4338CA' : '475569';

  let photoXml = '';
  if (hasPhoto) {
    // Foto ukuran proporsional pasfoto 3x4 cm (1.080.000 x 1.440.000 EMUs)
    photoXml = `
      <w:p>
        <w:pPr>
          <w:jc w:val="${primaryAlign}"/>
          <w:spacing w:before="60" w:after="160"/>
        </w:pPr>
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
              <wp:extent cx="1080000" cy="1440000"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:docPr id="1" name="Pasfoto"/>
              <wp:cNvGraphicFramePr>
                <a:graphicFrameLocks noChangeAspect="1"/>
              </wp:cNvGraphicFramePr>
              <a:graphic>
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic>
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="photo.${photoExt}"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="rIdPhoto"/>
                      <a:stretch>
                        <a:fillRect/>
                      </a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="1080000" cy="1440000"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect">
                        <a:avLst/>
                      </a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphicData>
            </wp:inline>
          </w:drawing>
        </w:r>
      </w:p>
    `;
  }

  // Nama Lengkap Kandidat
  const nameXml = `
    <w:p>
      <w:pPr>
        <w:jc w:val="${primaryAlign}"/>
        <w:spacing w:before="60" w:after="40"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="38"/>
          <w:color w:val="${primaryColor}"/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(fullName)}</w:t>
      </w:r>
    </w:p>
  `;

  // Kontak & Alamat
  const contactXml = contactLine
    ? `
    <w:p>
      <w:pPr>
        <w:jc w:val="${primaryAlign}"/>
        <w:spacing w:after="200"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:color w:val="4B5563"/>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(contactLine)}</w:t>
      </w:r>
    </w:p>
  `
    : '';

  // Ringkasan Profesional / Profil Singkat
  let summaryXml = '';
  if (summary) {
    const summaryTitle = isProfessional ? 'PROFIL SINGKAT' : 'RINGKASAN PROFESIONAL';
    summaryXml = `
      <w:p>
        <w:pPr>
          <w:spacing w:before="200" w:after="80"/>
          <w:pBdr>
            <w:bottom w:val="single" w:sz="6" w:space="2" w:color="${accentColor}"/>
          </w:pBdr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="24"/>
            <w:color w:val="${primaryColor}"/>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          </w:rPr>
          <w:t xml:space="preserve">${summaryTitle}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr>
          <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:sz w:val="22"/>
            <w:color w:val="1F2937"/>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(summary)}</w:t>
        </w:r>
      </w:p>
    `;
  }

  // Bagian-Bagian CV (Pengalaman Kerja, Pendidikan, Keahlian, dll)
  const sectionsXml = sections
    .map((sec) => {
      const titleXml = `
        <w:p>
          <w:pPr>
            <w:spacing w:before="240" w:after="80"/>
            <w:pBdr>
              <w:bottom w:val="single" w:sz="6" w:space="2" w:color="${accentColor}"/>
            </w:pBdr>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:b/>
              <w:sz w:val="24"/>
              <w:color w:val="${primaryColor}"/>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(sec.title.toUpperCase())}</w:t>
          </w:r>
        </w:p>
      `;

      const itemsXml = sec.items
        .map((it, idx) => {
          const trimmed = it.trim();
          if (!trimmed) return '';

          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
          const cleanText = trimmed.replace(/^[-•*]\s*/, '');
          const isHeader = !isBullet && (trimmed.includes('|') || trimmed.includes('(') || idx === 0);

          if (isBullet) {
            return `
              <w:p>
                <w:pPr>
                  <w:spacing w:after="60" w:line="260" w:lineRule="auto"/>
                  <w:ind w:left="420" w:hanging="220"/>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:sz w:val="21"/>
                    <w:color w:val="1F2937"/>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  </w:rPr>
                  <w:t xml:space="preserve">• ${escapeXml(cleanText)}</w:t>
                </w:r>
              </w:p>
            `;
          }

          if (isHeader) {
            return `
              <w:p>
                <w:pPr>
                  <w:spacing w:before="120" w:after="40"/>
                </w:pPr>
                <w:r>
                  <w:rPr>
                    <w:b/>
                    <w:sz w:val="22"/>
                    <w:color w:val="${isProfessional ? '1E1B4B' : '111827'}"/>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  </w:rPr>
                  <w:t xml:space="preserve">${escapeXml(trimmed)}</w:t>
                </w:r>
              </w:p>
            `;
          }

          return `
            <w:p>
              <w:pPr>
                <w:spacing w:after="80" w:line="260" w:lineRule="auto"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:sz w:val="21"/>
                  <w:color w:val="374151"/>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(trimmed)}</w:t>
              </w:r>
            </w:p>
          `;
        })
        .join('');

      return titleXml + itemsXml;
    })
    .join('');

  zip.folder('word')?.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${photoXml}
    ${nameXml}
    ${contactXml}
    ${summaryXml}
    ${sectionsXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
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

