// Test des clés de traduction portugaises
const fs = require('fs');

try {
    const pt = JSON.parse(fs.readFileSync('src/i18n/locales/pt.json', 'utf8'));
    
    console.log('🧪 Test des Traductions Portugaises - Mapa de Preços');
    console.log('==================================================');
    console.log('');
    
    // Clés principales à vérifier
    const mainKeys = [
        'quickStats', 'totalPrices', 'pricesWithGps', 
        'verifiedPrices', 'regionsCovered', 'filters', 'legend'
    ];
    
    console.log('✅ Vérification des clés principales:');
    let allPresent = true;
    
    mainKeys.forEach(key => {
        if (pt.map && pt.map[key]) {
            console.log(`  ✓ ${key}: ${pt.map[key]}`);
        } else {
            console.log(`  ✗ ${key}: MANQUANTE`);
            allPresent = false;
        }
    });
    
    console.log('');
    if (allPresent) {
        console.log('🎉 SUCCÈS! Toutes les clés principales sont présentes!');
        console.log('🌍 La page devrait maintenant afficher correctement en portugais:');
        console.log('   • "Estatísticas Rápidas" au lieu de "Quick Statistics"');
        console.log('   • "Total de Preços" au lieu de "Total Prices"');
        console.log('   • "Com GPS" au lieu de "With GPS"');
        console.log('   • "Preços Verificados" au lieu de "Verified"');
        console.log('   • "Regiões" au lieu de "Regions"');
    } else {
        console.log('❌ PROBLÈME: Il manque encore des clés de traduction!');
    }
    
    console.log('');
    console.log('📁 Fichier vérifié: src/i18n/locales/pt.json');
    console.log('🧪 Test terminé!');
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
}
