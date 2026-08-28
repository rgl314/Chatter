FROM maven:3.9.11-eclipse-temurin-21 AS builder

WORKDIR /chatter

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /chatter

COPY --from=builder /chatter/target/*.jar chatter.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","chatter.jar"]