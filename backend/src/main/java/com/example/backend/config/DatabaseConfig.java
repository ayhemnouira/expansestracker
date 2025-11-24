package com.example.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(@Value("${DATABASE_URL:#{null}}") String databaseUrl) {

        // If DATABASE_URL is not set, Spring Boot will use application.properties defaults
        if (databaseUrl == null) {
            return null; // Let Spring Boot auto-configure from properties
        }

        // Fix Render's URL format
        String fixedUrl = databaseUrl;

        // Fix: postgres:// -> jdbc:postgresql://
        if (fixedUrl.startsWith("postgres://")) {
            fixedUrl = fixedUrl.replace("postgres://", "jdbc:postgresql://");
        }
        // Fix: postgresql:// -> jdbc:postgresql://
        else if (fixedUrl.startsWith("postgresql://")) {
            fixedUrl = "jdbc:" + fixedUrl;
        }

        System.out.println("=== USING DATABASE URL: " + fixedUrl + " ===");

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(fixedUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(2);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(600000);
        dataSource.setMaxLifetime(1800000);

        return dataSource;
    }
}