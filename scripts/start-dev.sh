#!/bin/bash

# Script pour démarrer l'environnement de développement complet
# Usage: ./scripts/start-dev.sh

set -e

echo "🚀 Démarrage de l'environnement de développement Preço di Cajú"
echo "=================================================="

# Vérifier que Docker est installé et en cours d'exécution
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Vérifier que docker-compose est disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose n'est pas installé."
    exit 1
fi

echo "✅ Docker est prêt"

# Nettoyer les anciens containers si nécessaire
echo "🧹 Nettoyage des anciens containers..."
docker-compose down --remove-orphans

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que tous les services soient prêts
echo "⏳ Attente que tous les services soient prêts..."

# Attendre PostgreSQL
echo "  Attente de PostgreSQL..."
until docker-compose exec postgres pg_isready -U precaju -d precaju; do
    sleep 2
done
echo "✅ PostgreSQL est prêt"

# Attendre Redis
echo "  Attente de Redis..."
until docker-compose exec redis redis-cli ping; do
    sleep 2
done
echo "✅ Redis est prêt"

# Attendre le backend
echo "  Attente du backend Spring Boot..."
until curl -f http://localhost:8080/actuator/health; do
    sleep 5
done
echo "✅ Backend est prêt"

# Attendre le frontend
echo "  Attente du frontend React..."
until curl -f http://localhost:3000/health; do
    sleep 5
done
echo "✅ Frontend est prêt"

echo ""
echo "🎉 Environnement de développement prêt!"
echo "=================================================="
echo "📱 Frontend (React PWA):     http://localhost:3000"
echo "🔧 Backend API:              http://localhost:8080"
echo "🗄️  Base de données:          localhost:5432"
echo "🔴 Redis:                    localhost:6379"
echo "📊 Health Check Backend:     http://localhost:8080/actuator/health"
echo ""
echo "📖 Pour voir les logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Pour arrêter:"
echo "   docker-compose down"
echo ""
echo "🔧 Pour redémarrer un service:"
echo "   docker-compose restart <service-name>"
echo ""

# Optionnel: ouvrir automatiquement le navigateur
if command -v open &> /dev/null; then
    echo "🌐 Ouverture du navigateur..."
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Ouverture du navigateur..."
    xdg-open http://localhost:3000
fi

echo "✨ Bon développement!"


