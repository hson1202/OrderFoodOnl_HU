const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Frontend/src/i18n.js');
const src = fs.readFileSync(filePath, 'utf8');

const enOpen = '  en: {\n    translation: {';
const huOpen = '  hu: {\n    translation: {';
const enCloseBeforeHu = '\n    }\n  },\n  hu:';
const huClose = '\n    }\n  }\n};';

const iEn = src.indexOf(enOpen);
const iHu = src.indexOf(huOpen);
if (iEn === -1 || iHu === -1) throw new Error('Could not find en/hu blocks');

const enInnerStart = iEn + enOpen.length;
const enInnerEnd = src.indexOf(enCloseBeforeHu);
if (enInnerEnd === -1) throw new Error('Could not find en block end');

const enInner = src.slice(enInnerStart, enInnerEnd);

const huInnerStart = iHu + huOpen.length;
const huCloseIdx = src.indexOf(huClose);
if (huCloseIdx === -1) throw new Error('Could not find hu/resources end');

const newSrc = src.slice(0, huInnerStart) + enInner + src.slice(huCloseIdx);
fs.writeFileSync(filePath, newSrc);
console.log('Replaced hu.translation content with en inner, length', enInner.length);
