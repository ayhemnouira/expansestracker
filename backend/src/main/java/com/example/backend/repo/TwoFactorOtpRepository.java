// Repository
package com.example.backend.repo;

import com.example.backend.entity.TwoFactorOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TwoFactorOtpRepository extends JpaRepository<TwoFactorOTP, String> {

    Optional<TwoFactorOTP> findByUserIdAndVerifiedFalseAndExpiryDateAfter(
            Long userId,
            LocalDateTime currentTime
    );

    @Modifying
    int deleteByExpiryDateBefore(LocalDateTime currentTime);
}