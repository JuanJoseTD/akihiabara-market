# Usar una imagen base de OpenJDK para Java 17
FROM openjdk:17-jdk-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo JAR de la aplicación (asumiendo que ya lo has construido con `mvn clean package`)
# El nombre del JAR puede variar, verifica el nombre exacto en tu carpeta 'target/'
COPY target/akihabara-market-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto en el que la aplicación Spring Boot se ejecutará
EXPOSE 8080

# Comando para ejecutar la aplicación cuando el contenedor se inicie
ENTRYPOINT ["java", "-jar", "app.jar"]
