/**
 * Builds the downloadable campaign media kit:
 *   public/downloads/ola-western-media-kit.pdf
 *   public/downloads/ola-western-contact.vcf
 *   public/downloads/ola-western-boilerplate.txt
 *
 * Every file carries the official campaign website and email. Run with:
 *   npm run build:media-kit
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const SITE_URL = 'https://www.olawestern.ng';
const EMAIL = 'ekabo@olawestern.ng';
const PHONE = '+234 803 400 5708';
const HQ = '32 Road by 3rd Avenue, FESTAC Town, Amuwo-Odofin, Lagos';

const NAVY = rgb(0.043, 0.145, 0.271);
const NAVY_DEEP = rgb(0.027, 0.102, 0.2);
const ORANGE = rgb(1, 0.341, 0.133);
const WHITE = rgb(1, 1, 1);
const SLATE = rgb(0.275, 0.333, 0.412);
const MIST = rgb(0.929, 0.953, 0.98);
const EMERALD = rgb(0.063, 0.725, 0.506);

const OUT = path.join(process.cwd(), 'public', 'downloads');

function clean(value) {
  return String(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ');
}

function wrap(text, font, size, maxWidth) {
  const words = clean(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(page, text, x, y, options) {
  const { font, size = 10.5, color = SLATE, maxWidth, lineHeight = size * 1.55 } = options;
  const lines = wrap(text, font, size, maxWidth);
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

function label(page, text, x, y, font, color = ORANGE, size = 8) {
  page.drawText(clean(text).toUpperCase(), { x, y, size, font, color });
}

function rule(page, x, y, width, color = ORANGE, height = 2) {
  page.drawRectangle({ x, y, width, height, color });
}

async function buildPdf() {
  const doc = await PDFDocument.create();
  doc.setTitle('OlaWestern 2027 Campaign Media Kit');
  doc.setAuthor('Ola Western Campaign Organization');
  doc.setSubject('Official press and brand assets - Amuwo-Odofin Constituency I');
  doc.setKeywords(['Ola Western', 'APC', 'Amuwo-Odofin', 'Lagos State House of Assembly', '2027']);
  doc.setCreator(SITE_URL);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  /* ── Cover ─────────────────────────────────────────────────────── */
  const cover = doc.addPage([595.28, 841.89]);
  cover.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: NAVY_DEEP });
  cover.drawRectangle({ x: 0, y: 785, width: 595.28, height: 57, color: NAVY });
  cover.drawRectangle({ x: 0, y: 785, width: 595.28, height: 5, color: ORANGE });

  // Brand mark: concentric circles + wordmark.
  cover.drawCircle({ x: 78, y: 760, size: 22, color: ORANGE });
  cover.drawCircle({ x: 78, y: 760, size: 15, color: NAVY });
  cover.drawCircle({ x: 78, y: 760, size: 7, color: WHITE });
  cover.drawText('Ola', { x: 112, y: 752, size: 26, font: bold, color: WHITE });
  const olaWidth = bold.widthOfTextAtSize('Ola', 26);
  cover.drawText('Western', { x: 112 + olaWidth, y: 752, size: 26, font: bold, color: ORANGE });
  cover.drawText('LAGOS ASSEMBLY  /  AMUWO-ODOFIN 1', {
    x: 113, y: 738, size: 7.5, font: bold, color: rgb(1, 1, 1),
  });

  label(cover, 'Official media kit  /  2027 general elections', 56, 660, bold, ORANGE, 8.5);
  let y = 622;
  for (const line of wrap('Effective Legislative Representation for Amuwo-Odofin 1', bold, 31, 480)) {
    cover.drawText(line, { x: 56, y, size: 31, font: bold, color: WHITE });
    y -= 37;
  }
  y -= 10;
  cover.drawText('Hon. Engr. Folorunsho Olaitan Segun', { x: 56, y, size: 15, font: bold, color: WHITE });
  y -= 20;
  cover.drawText('"Ola Western"  |  APC Flagbearer', { x: 56, y, size: 11, font: regular, color: rgb(0.73, 0.78, 0.85) });
  y -= 42;
  y = paragraph(
    cover,
    'A civil engineer, employer and neighbour standing for accountable representation across Festac I-III and Mile 2. This kit contains the approved biography, the record, the legislative agenda and the official contact details for press and partners.',
    56, y, { font: regular, size: 10.5, color: rgb(0.78, 0.83, 0.9), maxWidth: 470, lineHeight: 17 },
  );

  // Cover fact strip.
  const stripY = 250;
  cover.drawRectangle({ x: 56, y: stripY, width: 483, height: 78, color: rgb(1, 1, 1), opacity: 0.06 });
  cover.drawRectangle({ x: 56, y: stripY, width: 4, height: 78, color: ORANGE });
  const facts = [
    ['Office', 'Lagos State House of Assembly'],
    ['Constituency', 'Amuwo-Odofin Constituency I'],
    ['Party', 'All Progressives Congress (APC)'],
  ];
  facts.forEach(([k, v], i) => {
    const fy = stripY + 56 - i * 22;
    cover.drawText(k.toUpperCase(), { x: 74, y: fy, size: 7, font: bold, color: ORANGE });
    cover.drawText(v, { x: 156, y: fy, size: 9.5, font: regular, color: WHITE });
  });

  // Contact ribbon.
  cover.drawRectangle({ x: 0, y: 0, width: 595.28, height: 104, color: NAVY });
  cover.drawRectangle({ x: 0, y: 100, width: 595.28, height: 4, color: ORANGE });
  label(cover, 'Press and partnerships', 56, 72, bold, ORANGE, 8);
  cover.drawText(EMAIL, { x: 56, y: 54, size: 12, font: bold, color: WHITE });
  cover.drawText(SITE_URL.replace('https://', ''), { x: 56, y: 36, size: 10, font: regular, color: rgb(0.78, 0.83, 0.9) });
  cover.drawText(PHONE, { x: 355, y: 54, size: 10, font: bold, color: WHITE });
  cover.drawText(`${PHONE} · desk & WhatsApp`, { x: 355, y: 36, size: 9, font: regular, color: rgb(0.78, 0.83, 0.9) });
  cover.drawText('Approved by the Ola Western Campaign Committee.', {
    x: 56, y: 16, size: 7.5, font: regular, color: rgb(0.55, 0.62, 0.72),
  });

  /* ── Page 2: biography, facts, record ───────────────────────────── */
  const p2 = doc.addPage([595.28, 841.89]);
  p2.drawRectangle({ x: 0, y: 741, width: 595.28, height: 101, color: NAVY });
  p2.drawRectangle({ x: 0, y: 737, width: 595.28, height: 4, color: ORANGE });
  label(p2, '01  /  The candidate', 48, 802, bold, ORANGE, 8);
  p2.drawText('Who is Ola Western?', { x: 48, y: 770, size: 24, font: bold, color: WHITE });
  p2.drawText('Approved biography and verified profile', { x: 48, y: 752, size: 9, font: regular, color: rgb(0.72, 0.78, 0.86) });

  y = 702;
  y = paragraph(
    p2,
    'Hon. Engr. Folorunsho Olaitan Segun, widely known as "Ola Western", is a Nigerian corporate executive, certified engineer, community leader and APC politician based in Amuwo-Odofin, Lagos State. He is the Chief Executive Officer of Western Concrete, an industrial civil-works and concrete manufacturing firm headquartered in FESTAC Town.',
    48, y, { font: regular, size: 10.2, maxWidth: 499, color: SLATE, lineHeight: 16.2 },
  );
  y -= 8;
  y = paragraph(
    p2,
    'His public footprint is built on corporate social responsibility: boreholes across six wards, drainage desilting along 7th Avenue, palliative outreach and a Food Fest that fed more than 1,000 households. In May 2026 he won the APC House of Assembly primary for Amuwo-Odofin Constituency I with over 3,000 votes and became the party flagbearer for the 2027 general elections.',
    48, y, { font: regular, size: 10.2, maxWidth: 499, color: SLATE, lineHeight: 16.2 },
  );

  y -= 18;
  label(p2, 'Key facts', 48, y, bold, ORANGE, 8);
  y -= 18;
  const factRows = [
    ['Full name', 'Hon. Engr. Folorunsho Olaitan Segun'],
    ['Popular name', 'Ola Western'],
    ['Office sought', 'Member, Lagos State House of Assembly'],
    ['Constituency', 'Amuwo-Odofin Constituency I'],
    ['Party', 'All Progressives Congress (APC)'],
    ['Profession', 'Certified civil engineer; CEO, Western Concrete'],
    ['Campaign HQ', HQ],
    ['Languages', 'English, Nigerian Pidgin, Yoruba'],
  ];
  p2.drawRectangle({ x: 48, y: y - 132, width: 499, height: 142, color: MIST });
  factRows.forEach(([k, v], i) => {
    const fy = y - 9 - i * 17;
    p2.drawText(k.toUpperCase(), { x: 62, y: fy, size: 7, font: bold, color: NAVY });
    p2.drawText(clean(v), { x: 176, y: fy, size: 8.8, font: regular, color: SLATE });
  });
  y -= 160;

  label(p2, 'The record before office', 48, y, bold, ORANGE, 8);
  y -= 18;
  const record = [
    'Six boreholes delivered across six wards in Amuwo-Odofin Constituency I.',
    '7th Avenue, FESTAC Town: stormwater drainage cleared and desilted (2018).',
    'Six FESTAC roads approved by the state; 1st Avenue rebuilt (2023).',
    'More than 1,000 households fed at the Ola Western Food Fest (2024).',
    '200+ widows supported; two transformers donated to the community.',
    'May 2026 APC primary: 3,000+ votes and the party flagbearer mandate.',
  ];
  for (const item of record) {
    p2.drawCircle({ x: 54, y: y + 3, size: 1.8, color: ORANGE });
    y = paragraph(p2, item, 66, y, { font: regular, size: 9.5, maxWidth: 470, color: SLATE, lineHeight: 14 });
    y -= 3;
  }

  y -= 22;
  p2.drawRectangle({ x: 48, y: y - 52, width: 499, height: 68, color: NAVY });
  p2.drawRectangle({ x: 48, y: y - 52, width: 4, height: 68, color: ORANGE });
  label(p2, 'Press assets', 66, y - 5, bold, ORANGE, 8);
  p2.drawText('High-resolution portraits, logos and shareable graphics:', {
    x: 66, y: y - 24, size: 8.8, font: regular, color: rgb(0.78, 0.83, 0.9),
  });
  p2.drawText(`${SITE_URL}/media-kit`, {
    x: 66, y: y - 41, size: 10, font: bold, color: WHITE,
  });

  p2.drawText(`${SITE_URL.replace('https://', '')}   |   ${EMAIL}`, {
    x: 48, y: 34, size: 8, font: bold, color: NAVY,
  });
  p2.drawText('OlaWestern 2027 Media Kit  /  page 2', { x: 430, y: 34, size: 7.5, font: regular, color: SLATE });

  /* ── Page 3: agenda + contact ──────────────────────────────────── */
  const p3 = doc.addPage([595.28, 841.89]);
  p3.drawRectangle({ x: 0, y: 741, width: 595.28, height: 101, color: NAVY });
  p3.drawRectangle({ x: 0, y: 737, width: 595.28, height: 4, color: ORANGE });
  label(p3, '02  /  The legislative agenda', 48, 802, bold, ORANGE, 8);
  p3.drawText('Four commitments, written to be checked', { x: 48, y: 770, size: 21, font: bold, color: WHITE });
  p3.drawText('The agenda for Amuwo-Odofin Constituency I', { x: 48, y: 752, size: 9, font: regular, color: rgb(0.72, 0.78, 0.86) });

  // Starts directly under the navy masthead; the first card must not sit on
  // the headline.
  y = 675;
  const agenda = [
    ['01', 'Youth empowerment and tech hubs', 'Digital-skill and creative-economy centres, sports facilities and a yearly youth opportunity register - one hub per ward.'],
    ['02', 'Roads, drainage and 23 Road', 'An FHA-state-LGA maintenance framework, full rehabilitation of 23 Road, canal desilting and avenue street-lighting.'],
    ['03', 'Market women and trader protection', 'Fair regulatory guidelines for LAWMA and municipal task forces, plus a written levy schedule traders can hold agencies to.'],
    ['04', 'Public safety and open representation', 'Quarterly town halls in Festac I-III and Mile 2, published legislative activity and a named ward desk for every request.'],
  ];
  for (const [n, title, body] of agenda) {
    p3.drawRectangle({ x: 48, y: y - 2, width: 499, height: 68, color: MIST });
    p3.drawRectangle({ x: 48, y: y - 2, width: 4, height: 68, color: ORANGE });
    p3.drawText(n, { x: 64, y: y + 46, size: 15, font: bold, color: ORANGE });
    p3.drawText(title, { x: 92, y: y + 46, size: 11, font: bold, color: NAVY });
    paragraph(p3, body, 92, y + 31, { font: regular, size: 8.6, maxWidth: 435, color: SLATE, lineHeight: 12.2 });
    y -= 82;
  }

  y -= 2;
  p3.drawRectangle({ x: 48, y: y - 128, width: 499, height: 132, color: NAVY });
  p3.drawRectangle({ x: 48, y: y + 2, width: 499, height: 4, color: EMERALD });
  label(p3, 'Press and partnerships', 66, y - 18, bold, ORANGE, 8);
  p3.drawText(EMAIL, { x: 66, y: y - 38, size: 13, font: bold, color: WHITE });
  p3.drawText(SITE_URL.replace('https://', ''), { x: 66, y: y - 55, size: 10, font: regular, color: rgb(0.78, 0.83, 0.9) });
  p3.drawText(`${PHONE} · desk & WhatsApp`, { x: 66, y: y - 72, size: 9, font: regular, color: rgb(0.78, 0.83, 0.9) });
  p3.drawText(HQ, { x: 66, y: y - 89, size: 9, font: regular, color: rgb(0.78, 0.83, 0.9) });
  p3.drawText('Media requests are answered by the campaign press desk.', { x: 66, y: y - 110, size: 7.5, font: regular, color: rgb(0.55, 0.62, 0.72) });
  y -= 150;

  label(p3, 'Approved boilerplate', 48, y, bold, ORANGE, 8);
  y -= 16;
  y = paragraph(
    p3,
    'Hon. Engr. Folorunsho Olaitan Segun ("Ola Western") is a certified civil engineer, the CEO of Western Concrete and the APC flagbearer for the Lagos State House of Assembly, Amuwo-Odofin Constituency I. His record includes six boreholes across six wards, drainage desilting along 7th Avenue, state approval for six FESTAC roads, the rebuilding of 1st Avenue, and a Food Fest that fed more than 1,000 households. He campaigns on youth innovation, infrastructure, market-trader protection and open, accountable representation.',
    48, y, { font: regular, size: 9, maxWidth: 499, color: SLATE, lineHeight: 13.4 },
  );

  p3.drawText('Paid for by the Ola Western Campaign Committee. Approved by Folorunsho Olaitan Segun for Lagos State House of Assembly, Amuwo-Odofin Constituency I.', {
    x: 48, y: 24, size: 6.8, font: regular, color: SLATE,
  });

  const bytes = await doc.save();
  await writeFile(path.join(OUT, 'ola-western-media-kit.pdf'), bytes);
  return bytes.length;
}

async function buildVcard() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Segun;Folorunsho;Olaitan;Hon. Engr.;',
    'FN:Hon. Engr. Folorunsho Olaitan Segun (Ola Western)',
    'ORG:Ola Western Campaign Organization',
    'TITLE:APC Flagbearer, Lagos State House of Assembly',
    'TEL;TYPE=WORK,VOICE:+2348034005708',
    `EMAIL;TYPE=WORK,INTERNET:${EMAIL}`,
    `URL:${SITE_URL}`,
    `ADR;TYPE=WORK:;;${HQ};Amuwo-Odofin;Lagos;;Nigeria`,
    'NOTE:Official campaign contact. Amuwo-Odofin Constituency I, Lagos State.',
    'END:VCARD',
  ];
  await writeFile(path.join(OUT, 'ola-western-contact.vcf'), `${lines.join('\r\n')}\r\n`, 'utf8');
}

async function buildBoilerplate() {
  const text = `OLAWESTERN 2027 - APPROVED PRESS BOILERPLATE
Website: ${SITE_URL}
Press email: ${EMAIL}
Campaign desk & WhatsApp: ${PHONE}
HQ: ${HQ}

SHORT BOILERPLATE (40 words)
Hon. Engr. Folorunsho Olaitan Segun ("Ola Western") is a certified civil engineer, CEO of Western Concrete and the APC flagbearer for the Lagos State House of Assembly, Amuwo-Odofin Constituency I. His record spans boreholes, drainage, roads and community philanthropy.

STANDARD BOILERPLATE (95 words)
Hon. Engr. Folorunsho Olaitan Segun ("Ola Western") is a Nigerian civil engineer, corporate executive and community leader. As CEO of Western Concrete he has delivered six boreholes across six wards, supported the desilting of 7th Avenue in FESTAC Town, and fed more than 1,000 households at the Ola Western Food Fest. In May 2026 he won the APC House of Assembly primary for Amuwo-Odofin Constituency I with over 3,000 votes. He campaigns on youth innovation, infrastructure, market-trader protection and accountable representation.

OFFICE SOUGHT
Member, Lagos State House of Assembly, Amuwo-Odofin Constituency I (2027 general elections).

PARTY
All Progressives Congress (APC) - flagbearer.

FOUR PILLARS
1. Youth empowerment and tech hubs.
2. Roads, drainage and 23 Road.
3. Market women and trader protection.
4. Public safety and open representation.

APPROVED DISCLOSURE
Paid for by the Ola Western Campaign Committee. Approved by Folorunsho Olaitan Segun for Lagos State House of Assembly, Amuwo-Odofin Constituency I.

Media requests: ${EMAIL}
All official assets: ${SITE_URL}/media-kit
`;
  await writeFile(path.join(OUT, 'ola-western-boilerplate.txt'), text, 'utf8');
}

await mkdir(OUT, { recursive: true });
const pdfBytes = await buildPdf();
await buildVcard();
await buildBoilerplate();
console.log(`Media kit written to public/downloads (PDF ${(pdfBytes / 1024).toFixed(0)} KB)`);
