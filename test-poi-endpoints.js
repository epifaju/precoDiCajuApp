#!/usr/bin/env node

/**
 * Script de test pour diagnostiquer les endpoints POI
 * Utilise : node test-poi-endpoints.js
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080';

async function testEndpoint(endpoint, description) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Test: ${description}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS`);
      
      if (Array.isArray(data)) {
        console.log(`📊 Data: Array with ${data.length} items`);
        if (data.length > 0) {
          console.log(`Sample item keys: [${Object.keys(data[0]).join(', ')}]`);
        }
      } else if (typeof data === 'object') {
        console.log(`📊 Data: Object with keys [${Object.keys(data).join(', ')}]`);
        console.log(`Data content:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`📊 Data: ${typeof data} - ${data}`);
      }
    } else {
      const text = await response.text();
      console.log(`❌ FAILED`);
      console.log(`Error response: ${text}`);
    }
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
    if (error.cause) {
      console.log(`Cause: ${error.cause}`);
    }
  }
}

async function main() {
  console.log('🚀 Test des endpoints POI');
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log('=' * 50);
  
  // Test de connectivité de base
  await testEndpoint('/api/v1/poi/health', 'Health check POI service');
  
  // Test des endpoints POI
  await testEndpoint('/api/v1/poi', 'Get all POIs');
  await testEndpoint('/api/v1/poi/stats', 'Get POI statistics');
  await testEndpoint('/api/v1/poi/with-phone', 'Get POIs with phone numbers');
  
  // Test d'endpoints de fallback
  await testEndpoint('/api/v1/regions', 'Get all regions (fallback)');
  await testEndpoint('/actuator/health', 'Spring Boot actuator health');
  
  console.log('\n🏁 Tests terminés');
  console.log('\n💡 ANALYSE:');
  console.log('- Si /api/v1/poi/health fonctionne mais pas /api/v1/poi, le problème est dans les données ou le service');
  console.log('- Si /api/v1/poi retourne un tableau vide, il faut ajouter des données POI');
  console.log('- Si /api/v1/poi/stats fonctionne mais pas /api/v1/poi, vérifier le repository');
}

// Polyfill fetch pour Node.js si nécessaire
if (typeof fetch === 'undefined') {
  console.log('Installing fetch polyfill...');
  global.fetch = require('node-fetch');
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
