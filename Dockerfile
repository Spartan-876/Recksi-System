# --------------------------------------------------------
# ETAPA 1: CONSTRUCCIÓN (Build)
# Usamos una imagen con Maven y Java 21 para compilar
# --------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS build

# Copiamos todo el código fuente al contenedor
COPY . .

# Compilamos el proyecto y generamos el .jar (saltando tests para ir rápido)
RUN mvn clean package -DskipTests

# --------------------------------------------------------
# ETAPA 2: EJECUCIÓN (Run)
# Usamos una imagen ligera de Java 21 para correr la app
# --------------------------------------------------------
FROM eclipse-temurin:21-jdk-slim

# Copiamos el .jar generado en la etapa anterior y lo renombramos a app.jar
COPY --from=build /target/*.jar app.jar

# Informamos que la app usa el puerto 8080
EXPOSE 8080

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]