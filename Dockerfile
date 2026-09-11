# Multi-stage Docker build for IP-SHAKTI Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
COPY data ./data
RUN mvn clean package -Dmaven.test.skip=true -B

# Lightweight JRE runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built artifact
COPY --from=build /app/target/ip-shakti-backend-0.0.1-SNAPSHOT.jar app.jar
COPY --from=build /app/data ./data

# Expose port (Render automatically maps $PORT)
EXPOSE 8085

# Memory-optimized execution for Render free tier (512MB RAM)
ENTRYPOINT ["sh", "-c", "java -Xmx380m -Xms200m -jar app.jar"]
