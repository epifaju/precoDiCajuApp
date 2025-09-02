#!/bin/bash

# Script pour tester que tous les services fonctionnent correctement
# Usage: ./scripts/test-services.sh

set -e

echo "🧪 Test des services Preço di Cajú"
echo "=================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un service
test_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name..."
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e " ${GREEN}✅ OK${NC} (HTTP $response)"
            return 0
        else
            echo -e " ${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
            return 1
        fi
    else
        echo -e " ${RED}❌ FAIL${NC} (Connection failed)"
        return 1
    fi
}

# Fonction pour tester PostgreSQL
test_postgres() {
    echo -n "Testing PostgreSQL..."
    
    if docker-compose exec -T postgres pg_isready -U precaju -d precaju > /dev/null 2>&1; then
        echo -e " ${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Fonction pour tester Redis
test_redis() {
    echo -n "Testing Redis..."
    
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e " ${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Tests
failed_tests=0

# Test PostgreSQL
test_postgres || ((failed_tests++))

# Test Redis  
test_redis || ((failed_tests++))

# Test Backend API
test_service "Backend Health" "http://localhost:8080/actuator/health" || ((failed_tests++))

# Test Backend API endpoints
test_service "Backend Regions API" "http://localhost:8080/api/v1/regions" || ((failed_tests++))
test_service "Backend Qualities API" "http://localhost:8080/api/v1/qualities" || ((failed_tests++))

# Test Frontend
test_service "Frontend" "http://localhost:3000/health" || ((failed_tests++))

# Test si le frontend sert l'index.html
test_service "Frontend App" "http://localhost:3000" || ((failed_tests++))

echo ""
echo "=================================="

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les tests sont passés avec succès!${NC}"
    echo ""
    echo "📱 Application prête à utiliser:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo ""
    echo "🧪 Tests API disponibles:"
    echo "   Health:   curl http://localhost:8080/actuator/health"
    echo "   Regions:  curl http://localhost:8080/api/v1/regions"
    echo "   Prices:   curl http://localhost:8080/api/v1/prices"
    exit 0
else
    echo -e "${RED}❌ $failed_tests test(s) ont échoué${NC}"
    echo ""
    echo -e "${YELLOW}💡 Suggestions:${NC}"
    echo "   1. Vérifiez que tous les containers sont démarrés: docker-compose ps"
    echo "   2. Vérifiez les logs: docker-compose logs"
    echo "   3. Redémarrez les services: docker-compose restart"
    exit 1
fi





