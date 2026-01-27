package com.example.backend.repo;

import com.example.backend.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, String> {

    Optional<VerificationToken> findByTokenAndTypeAndUsedFalseAndExpiryDateAfter(
            String token, String type, LocalDateTime currentTime);

    @Modifying
    int deleteByExpiryDateBeforeOrUsedTrue(LocalDateTime currentTime);
}