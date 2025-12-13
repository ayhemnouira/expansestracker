//package com.example.backend.config;
//
//import org.springframework.boot.jdbc.DataSourceBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//
//import javax.sql.DataSource;
//import java.net.URI;
//
//@Configuration
//public class DatabaseConfig {
//
//    @Bean
//    @Primary
//    public DataSource dataSource() {
//        String databaseUrl = System.getenv("DATABASE_URL");
//
//        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
//            try {
//                URI dbUri = new URI(databaseUrl);
//                String username = dbUri.getUserInfo().split(":")[0];
//                String password = dbUri.getUserInfo().split(":")[1];
//                String host = dbUri.getHost();
//                int port = dbUri.getPort();
//                String path = dbUri.getPath();
//
//                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
//
//                return DataSourceBuilder
//                        .create()
//                        .url(jdbcUrl)
//                        .username(username)
//                        .password(password)
//                        .driverClassName("org.postgresql.Driver")
//                        .build();
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to parse DATABASE_URL", e);
//            }
//        }
//
//        return DataSourceBuilder
//                .create()
//                .url(databaseUrl)
//               .driverClassName("org.postgresql.Driver")
//                .build();
//    }
//}