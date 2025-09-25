# Multi-stage build pour optimiser la taille de l'image
FROM maven:3.9.4-eclipse-temurin-17 AS build

WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .

# Télécharger les dépendances (layer cache optimization)
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Build de l'application
RUN mvn clean package -DskipTests

# Image finale
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S precaju && \
    adduser -u 1001 -S precaju -G precaju

# Installer curl pour health checks
RUN apk add --no-cache curl

# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Créer le dossier pour les uploads
RUN mkdir -p /app/uploads && \
    chown -R precaju:precaju /app

# Changer vers l'utilisateur non-root
USER precaju

# Exposer le port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Variables d'environnement par défaut
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Commande de démarrage
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]













