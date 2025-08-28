# PRD Cursor Optimized - Preço di Cajú

> **Application PWA pour le suivi des prix des noix de cajou en Guinée-Bissau**
> Stack: React 18 + Vite + Spring Boot 3.2 + PostgreSQL + PWA

## 🎯 OBJECTIF CURSOR

Développe une application complète de suivi des prix des noix de cajou avec :
- **Frontend PWA** : React 18 + Vite + TailwindCSS + TypeScript
- **Backend API** : Spring Boot 3.2 + PostgreSQL + JWT
- **Mode offline** : Service Workers + IndexedDB
- **Temps réel** : WebSocket pour notifications
- **Multilingue** : Portugais (principal), Français, Anglais

---

## 📋 SPÉCIFICATIONS FONCTIONNELLES

### F1. Consultation des prix
```typescript
interface Price {
  id: string;
  region: string;
  quality: string;
  price: number;
  unit: string;
  recordedDate: Date;
  source: string;
  verified: boolean;
  photoUrl?: string;
  gpsLat?: number;
  gpsLng?: number;
}
```

**UI Requirements:**
- Cards avec graphiques sparklines (Chart.js ou Recharts)
- Filtres : région, qualité, période (date picker)
- Vue liste + vue carte (Google Maps ou Leaflet)
- Pagination infinie avec lazy loading
- Mode sombre/clair

### F2. Soumission collaborative
**Formulaire de soumission:**
```typescript
interface PriceSubmission {
  region: string;        // Select avec régions
  quality: string;       // Select avec qualités
  price: number;         // Input numérique + validation
  source: string;        // Input texte
  photo?: File;          // Upload image
  notes?: string;        // Textarea
  gpsCoords?: {lat: number, lng: number}; // Auto-détection
}
```

**Validations frontend:**
- Prix > 0 et < 10000 FCFA/kg
- Région obligatoire depuis liste prédéfinie
- Photo max 5MB, formats JPG/PNG
- Géolocalisation optionnelle mais recommandée

### F3. Mode offline robuste
```typescript
// Service Worker avec Workbox
const cachingStrategies = {
  '/api/prices': 'stale-while-revalidate',
  '/api/regions': 'cache-first',
  '/static': 'cache-first',
  '/api/auth': 'network-only'
};

// Queue de synchronisation
interface PendingAction {
  id: string;
  type: 'CREATE_PRICE' | 'UPDATE_PRICE';
  payload: any;
  timestamp: number;
  retryCount: number;
}
```

### F4. Authentification JWT
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'moderator' | 'contributor';
  preferredRegions: string[];
  reputationScore: number;
}

interface AuthTokens {
  accessToken: string;  // 15 min
  refreshToken: string; // 7 jours
}
```

### F5. Notifications push
- Firebase Cloud Messaging
- Notifications pour variations prix > 10%
- Préférences par région/qualité
- Fallback SMS avec Twilio (optionnel)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Structure du projet
```
preco-di-caju/
├── frontend/                    # React PWA
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/             # Pages/routes
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API calls + offline
│   │   ├── store/             # State management (Zustand)
│   │   ├── utils/             # Helpers
│   │   ├── types/             # TypeScript interfaces
│   │   └── i18n/              # Traductions (i18next)
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service Worker
│   └── vite.config.ts
├── backend/                    # Spring Boot API
│   ├── src/main/java/gw/precaju/
│   │   ├── config/            # Configuration Spring
│   │   ├── controller/        # REST endpoints
│   │   ├── service/           # Logique métier
│   │   ├── repository/        # JPA repositories
│   │   ├── entity/            # Entités JPA
│   │   ├── dto/               # DTOs
│   │   ├── security/          # JWT + Spring Security
│   │   └── websocket/         # WebSocket handlers
│   └── src/main/resources/
│       ├── application.yml    # Configuration
│       └── db/migration/      # Flyway migrations
├── docker-compose.yml         # Dev environment
└── README.md
```

### Stack technique détaillée

**Frontend (React PWA):**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "react-router-dom": "^6.8.0",
    "react-i18next": "^12.0.0",
    "@tanstack/react-query": "^4.24.0",
    "zustand": "^4.3.0",
    "react-hook-form": "^7.43.0",
    "zod": "^3.20.0",
    "chart.js": "^4.2.0",
    "react-chartjs-2": "^5.2.0",
    "workbox-webpack-plugin": "^6.5.0",
    "firebase": "^9.17.0"
  }
}
```

**Backend (Spring Boot):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
</dependencies>
```

---

## 🗄️ MODÈLE DE DONNÉES

### Schéma PostgreSQL complet

```sql
-- Régions de Guinée-Bissau
CREATE TABLE regions (
    code VARCHAR(10) PRIMARY KEY,
    name_pt VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100),
    name_en VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

INSERT INTO regions VALUES
('BF', 'Bafatá', 'Bafatá', 'Bafata'),
('BB', 'Biombo', 'Biombo', 'Biombo'),
('BL', 'Bolama', 'Bolama', 'Bolama'),
('CA', 'Cacheu', 'Cacheu', 'Cacheu'),
('GA', 'Gabú', 'Gabú', 'Gabu'),
('OI', 'Oio', 'Oio', 'Oio'),
('QU', 'Quinara', 'Quinará', 'Quinara'),
('TO', 'Tombali', 'Tombali', 'Tombali'),
('BS', 'Bissau', 'Bissau', 'Bissau');

-- Qualités de cajou
CREATE TABLE quality_grades (
    code VARCHAR(20) PRIMARY KEY,
    name_pt VARCHAR(50) NOT NULL,
    name_fr VARCHAR(50),
    name_en VARCHAR(50),
    description_pt TEXT,
    active BOOLEAN DEFAULT TRUE
);

INSERT INTO quality_grades VALUES
('W180', 'Branco 180', 'Blanc 180', 'White 180', 'Amêndoas brancas grandes'),
('W210', 'Branco 210', 'Blanc 210', 'White 210', 'Amêndoas brancas médias'),
('W240', 'Branco 240', 'Blanc 240', 'White 240', 'Amêndoas brancas pequenas'),
('W320', 'Branco 320', 'Blanc 320', 'White 320', 'Amêndoas brancas muito pequenas'),
('LP', 'Pedaços Grandes', 'Gros Morceaux', 'Large Pieces', 'Pedaços grandes'),
('SP', 'Pedaços Pequenos', 'Petits Morceaux', 'Small Pieces', 'Pedaços pequenos'),
('RAW', 'Castanha Crua', 'Noix Brute', 'Raw Cashew', 'Castanha não processada');

-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'contributor',
    reputation_score INTEGER DEFAULT 0,
    preferred_regions JSONB DEFAULT '[]',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prix
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(10) NOT NULL REFERENCES regions(code),
    quality_grade VARCHAR(20) NOT NULL REFERENCES quality_grades(code),
    price_fcfa DECIMAL(10,2) NOT NULL CHECK (price_fcfa > 0),
    unit VARCHAR(10) DEFAULT 'kg',
    recorded_date DATE NOT NULL,
    source_name VARCHAR(100),
    source_type VARCHAR(50), -- 'market', 'cooperative', 'producer'
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    photo_url VARCHAR(500),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_prices_region_date ON prices(region_code, recorded_date DESC);
CREATE INDEX idx_prices_quality_date ON prices(quality_grade, recorded_date DESC);
CREATE INDEX idx_prices_created_at ON prices(created_at DESC);
```

---

## 🌐 API ENDPOINTS

### REST API complet

```java
// PriceController.java
@RestController
@RequestMapping("/api/v1/prices")
@CrossOrigin(origins = "*")
public class PriceController {

    @GetMapping
    public ResponseEntity<PageResponse<PriceDTO>> getPrices(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String quality,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) { /* Implementation */ }

    @GetMapping("/{id}")
    public ResponseEntity<PriceDTO> getPriceById(@PathVariable UUID id) { /* */ }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PriceDTO> createPrice(
        @Valid @RequestBody CreatePriceRequest request,
        Authentication auth
    ) { /* */ }

    @GetMapping("/stats")
    public ResponseEntity<PriceStatsDTO> getPriceStats(
        @RequestParam(required = false) String region,
        @RequestParam(defaultValue = "30") int days
    ) { /* */ }
}

// AuthController.java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) { /* */ }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) { /* */ }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) { /* */ }
}
```

### DTOs TypeScript
```typescript
// types/api.ts
export interface PriceDTO {
  id: string;
  region: string;
  regionName: string;
  quality: string;
  qualityName: string;
  priceFcfa: number;
  unit: string;
  recordedDate: string;
  sourceName?: string;
  sourceType?: string;
  photoUrl?: string;
  notes?: string;
  verified: boolean;
  createdAt: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface CreatePriceRequest {
  regionCode: string;
  qualityGrade: string;
  priceFcfa: number;
  sourceName?: string;
  sourceType?: string;
  notes?: string;
  photoFile?: File;
  gpsLat?: number;
  gpsLng?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

---

## 🌍 INTERNATIONALISATION

### Configuration i18next
```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './locales/pt.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    debug: process.env.NODE_ENV === 'development',
    resources: { pt, fr, en },
    interpolation: {
      escapeValue: false,
    }
  });
```

### Fichiers de traduction
```json
// i18n/locales/pt.json
{
  "nav": {
    "prices": "Preços",
    "submit": "Submeter",
    "profile": "Perfil"
  },
  "prices": {
    "title": "Preços do Cajú",
    "region": "Região",
    "quality": "Qualidade",
    "price": "Preço",
    "date": "Data",
    "source": "Fonte",
    "verified": "Verificado",
    "filterBy": "Filtrar por",
    "showAll": "Mostrar todos"
  },
  "submit": {
    "title": "Submeter Preço",
    "regionRequired": "Região é obrigatória",
    "priceInvalid": "Preço deve ser maior que 0",
    "success": "Preço submetido com sucesso!",
    "offline": "Salvo offline, será sincronizado quando conectar"
  }
}
```

---

## 📱 PWA CONFIGURATION

### Manifest PWA
```json
// public/manifest.json
{
  "name": "Preço di Cajú",
  "short_name": "PrecoCaju",
  "description": "Preços de cajú em Guiné-Bissau",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity"],
  "lang": "pt-GW"
}
```

### Service Worker avec Workbox
```typescript
// src/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';

// Précache des assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Stratégies de cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/prices'),
  new StaleWhileRevalidate({
    cacheName: 'api-prices',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => `${request.url}-${new Date().toDateString()}`
    }]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/regions'),
  new CacheFirst({ cacheName: 'api-static' })
);

// Background sync pour soumissions offline
self.addEventListener('sync', event => {
  if (event.tag === 'price-submission') {
    event.waitUntil(syncPendingSubmissions());
  }
});
```

---

## 🎨 COMPOSANTS UI PRINCIPAUX

### Structure des pages
```tsx
// pages/PricesPage.tsx
export default function PricesPage() {
  const { data, isLoading, error } = useQuery(['prices'], fetchPrices);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('prices.title')}
        </h1>
        <Link to="/submit" className="btn btn-primary">
          {t('nav.submit')}
        </Link>
      </div>
      
      <PriceFilters onFiltersChange={handleFiltersChange} />
      
      {isLoading && <PricesLoading />}
      {error && <ErrorMessage error={error} />}
      {data && (
        <>
          <PricesList prices={data.content} />
          <Pagination {...data} />
        </>
      )}
    </div>
  );
}

// components/PriceCard.tsx  
interface PriceCardProps {
  price: PriceDTO;
}

export function PriceCard({ price }: PriceCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {price.regionName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {price.qualityName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {price.priceFcfa} FCFA
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(price.recordedDate)}
          </p>
        </div>
      </div>
      
      {price.verified && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckIcon className="w-3 h-3 mr-1" />
          {t('prices.verified')}
        </span>
      )}
      
      {price.photoUrl && (
        <img 
          src={price.photoUrl} 
          alt="Price evidence"
          className="mt-3 w-full h-32 object-cover rounded-md"
        />
      )}
    </div>
  );
}
```

---

## ⚙️ CONFIGURATION ENVIRONNEMENT

### Docker Compose pour développement
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: precaju
      POSTGRES_USER: precaju
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/precaju
      SPRING_DATASOURCE_USERNAME: precaju
      SPRING_DATASOURCE_PASSWORD: password
      SPRING_REDIS_HOST: redis
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:8080/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Variables d'environnement
```bash
# .env (frontend)
VITE_API_URL=http://localhost:8080/api/v1
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_key

# application.yml (backend)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/precaju
    username: ${DB_USERNAME:precaju}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
```

---

## 🚀 INSTRUCTIONS DÉVELOPPEMENT

### 1. Initialisation projet
```bash
# Backend Spring Boot
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,postgresql,security \
  -d groupId=gw.precaju \
  -d artifactId=precaju-api \
  -d name="Precaju API" \
  -d packageName=gw.precaju \
  -o backend.zip

# Frontend React
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install tailwindcss @tailwindcss/forms
npx tailwindcss init -p
```

### 2. Ordre de développement recommandé

**Semaine 1-2 : Setup & Base**
- [ ] Setup projets backend + frontend
- [ ] Configuration PostgreSQL + migrations Flyway
- [ ] Modèles JPA + repositories
- [ ] Pages React de base + routing
- [ ] Configuration TailwindCSS + design system

**Semaine 3-4 : API & Auth**
- [ ] Endpoints CRUD prices
- [ ] Système d'authentification JWT
- [ ] Composants formulaires React Hook Form + Zod
- [ ] Intégration API avec React Query

**Semaine 5-6 : PWA & Offline**
- [ ] Configuration Service Worker + Workbox
- [ ] Stockage IndexedDB pour cache offline
- [ ] Queue synchronisation pour soumissions
- [ ] Tests offline/online

**Semaine 7-8 : Avancé**
- [ ] WebSocket pour notifications temps réel
- [ ] Upload photos + optimisation
- [ ] Géolocalisation
- [ ] Tests E2E + déploiement

### 3. Commandes essentielles
```bash
# Backend
./mvnw spring-boot:run
./mvnw test

# Frontend  
npm run dev
npm run build
npm run preview
npm run test

# Docker
docker-compose up -d
docker-compose logs -f
```

---

## ✅ CRITÈRES DE VALIDATION

### MVP Ready Checklist
- [ ] **Consultation prix** : Liste + filtres + pagination
- [ ] **Soumission prix** : Formulaire + validation + photo
- [ ] **Mode offline** : Cache + sync automatique
- [ ] **Authentification** : Register/Login + JWT
- [ ] **PWA** : Installation + notifications push
- [ ] **Responsive** : Mobile + desktop + tablette  
- [ ] **Multilingue** : PT/FR/EN complet
- [ ] **Performance** : < 3s chargement initial
- [ ] **Tests** : Coverage > 80%

### Métriques techniques
- Bundle size < 500KB gzipped
- First Contentful Paint < 1.5s
- API response time < 200ms (p95)
- PWA audit score > 90

---

## 📋 TODO CURSOR

**PRIORITÉ 1 (Semaines 1-4) :**
1. Générer structure complète des projets
2. Implémenter modèle de données PostgreSQL
3. Développer endpoints API REST complets  
4. Créer composants React + pages principales
5. Intégrer authentification JWT bout-en-bout

**PRIORITÉ 2 (Semaines 5-8) :**
6. Configurer PWA + Service Worker
7. Implémenter mode offline + synchronisation
8. Ajouter upload photos + géolocalisation
9. Intégrer notifications push Firebase
10. Tests automatisés + déploiement Docker

Commence par la **structure des projets** puis développe **étape par étape** en suivant l'ordre recommandé. Privilégie un **MVP fonctionnel** avant les features avancées.

---
