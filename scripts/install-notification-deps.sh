#!/bin/bash

# Script d'installation des dépendances pour les notifications push
# install-notification-deps.sh

echo "🔔 Installation des dépendances pour les notifications push"
echo "=========================================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

echo "✅ Node.js trouvé: $(node --version)"

# Installer web-push pour la génération des clés VAPID
echo ""
echo "📦 Installation de web-push..."
npm install web-push

if [ $? -eq 0 ]; then
    echo "✅ web-push installé avec succès"
else
    echo "❌ Erreur lors de l'installation de web-push"
    exit 1
fi

# Générer les clés VAPID
echo ""
echo "🔑 Génération des clés VAPID..."
node scripts/generate-vapid-keys.js

if [ $? -eq 0 ]; then
    echo "✅ Clés VAPID générées avec succès"
else
    echo "❌ Erreur lors de la génération des clés VAPID"
    exit 1
fi

echo ""
echo "🎉 Installation terminée !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Copiez les variables d'environnement dans vos fichiers .env"
echo "2. Redémarrez le backend Spring Boot"
echo "3. Redémarrez le frontend React"
echo "4. Testez les notifications avec: ./test-notifications.ps1"
echo ""
echo "📚 Documentation: NOTIFICATIONS_SETUP.md"
