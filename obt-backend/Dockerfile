
FROM maven:3.9.16-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/obt-backend-0.0.1-SNAPSHOT.jar"]

