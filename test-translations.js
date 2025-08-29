// Test script to verify Portuguese translations
const fs = require('fs');
const path = require('path');

// Read the Portuguese translation file
const ptTranslationsPath = path.join(__dirname, 'frontend/src/i18n/locales/pt.json');
const ptTranslations = JSON.parse(fs.readFileSync(ptTranslationsPath, 'utf8'));

// Check for missing keys that were causing errors
const requiredKeys = [
  'prices.verified',
  'prices.recordedOn', 
  'prices.by',
  'prices.previous',
  'prices.page',
  'prices.of',
  'prices.next',
  'prices.showing',
  'prices.results',
  'prices.sortBy.submitted',
  'prices.sortDir.desc',
  'prices.sortDir.asc',
  'dashboard.by'
];

console.log('🔍 Checking Portuguese translations...\n');

let allKeysPresent = true;

requiredKeys.forEach(key => {
  const keyParts = key.split('.');
  let value = ptTranslations;
  
  for (const part of keyParts) {
    if (value && value[part] !== undefined) {
      value = value[part];
    } else {
      console.log(`❌ Missing key: ${key}`);
      allKeysPresent = false;
      return;
    }
  }
  
  console.log(`✅ Found: ${key} = "${value}"`);
});

console.log('\n' + (allKeysPresent ? '🎉 All required translations are present!' : '⚠️  Some translations are missing!'));

// Also check the structure of the prices section
console.log('\n📋 Prices section structure:');
if (ptTranslations.prices) {
  console.log('✅ Prices section exists');
  console.log('   - verified:', ptTranslations.prices.verified || 'MISSING');
  console.log('   - recordedOn:', ptTranslations.prices.recordedOn || 'MISSING');
  console.log('   - by:', ptTranslations.prices.by || 'MISSING');
  console.log('   - showing:', ptTranslations.prices.showing || 'MISSING');
  console.log('   - results:', ptTranslations.prices.results || 'MISSING');
  console.log('   - sortBy.submitted:', ptTranslations.prices.sortBy?.submitted || 'MISSING');
  console.log('   - sortDir.asc:', ptTranslations.prices.sortDir?.asc || 'MISSING');
  console.log('   - sortDir.desc:', ptTranslations.prices.sortDir?.desc || 'MISSING');
  console.log('   - pagination:', ptTranslations.prices.pagination ? 'EXISTS' : 'MISSING');
} else {
  console.log('❌ Prices section missing');
}
