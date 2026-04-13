FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY pom.xml .
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/java-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
