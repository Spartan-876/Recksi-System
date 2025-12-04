# --------------------------------------------------------
# ETAPA 1: CONSTRUCCIÓN (Build)
# --------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# --------------------------------------------------------
# ETAPA 2: EJECUCIÓN (Run)
# --------------------------------------------------------
# CORRECCIÓN: Usamos '21-jdk-alpine' que sí existe y es muy ligera
FROM eclipse-temurin:21-jdk-alpine

# Copiamos el .jar
COPY --from=build /target/*.jar app.jar

# Puerto
EXPOSE 8080

# Ejecutar
ENTRYPOINT ["java", "-jar", "app.jar"]