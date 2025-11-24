package com.example.backend.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");

        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
            // Convert postgresql:// to jdbc:postgresql://
            databaseUrl = "jdbc:" + databaseUrl;
        }

        return DataSourceBuilder
                .create()
                .url(databaseUrl)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}