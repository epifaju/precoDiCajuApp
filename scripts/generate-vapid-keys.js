#!/usr/bin/env node

/**
 * Script pour générer les clés VAPID pour les notifications push
 * Usage: node scripts/generate-vapid-keys.js
 */

const webpush = require("web-push");

console.log("🔑 Génération des clés VAPID pour les notifications push...\n");

try {
  // Générer les clés VAPID
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log("✅ Clés VAPID générées avec succès !\n");

  console.log("📋 Configuration à ajouter à votre fichier .env :");
  console.log("=".repeat(60));
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:admin@precaju.gw`);
  console.log("=".repeat(60));

  console.log("\n📋 Configuration pour le frontend (.env.local) :");
  console.log("=".repeat(60));
  console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log("=".repeat(60));

  console.log("\n📋 Configuration pour application.yml (backend) :");
  console.log("=".repeat(60));
  console.log("app:");
  console.log("  vapid:");
  console.log(`    public-key: \${VAPID_PUBLIC_KEY:${vapidKeys.publicKey}}`);
  console.log(`    private-key: \${VAPID_PRIVATE_KEY:${vapidKeys.privateKey}}`);
  console.log(`    subject: \${VAPID_SUBJECT:mailto:admin@precaju.gw}`);
  console.log("=".repeat(60));

  console.log("\n⚠️  IMPORTANT :");
  console.log("- Gardez la clé privée SECRÈTE et ne la partagez jamais");
  console.log("- La clé publique peut être exposée côté client");
  console.log("- Ajoutez ces variables à votre fichier .env");
  console.log("- Redémarrez votre application après configuration");

  console.log("\n🚀 Prochaines étapes :");
  console.log("1. Copiez les variables d'environnement dans vos fichiers .env");
  console.log("2. Redémarrez le backend Spring Boot");
  console.log("3. Redémarrez le frontend React");
  console.log("4. Testez les notifications dans les paramètres utilisateur");
} catch (error) {
  console.error(
    "❌ Erreur lors de la génération des clés VAPID :",
    error.message
  );
  console.log("\n💡 Solution :");
  console.log("Installez web-push avec : npm install web-push");
  process.exit(1);
}









