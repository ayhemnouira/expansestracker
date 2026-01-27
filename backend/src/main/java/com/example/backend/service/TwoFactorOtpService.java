package com.example.backend.service;

import com.example.backend.entity.TwoFactorOTP;
import com.example.backend.repo.TwoFactorOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwoFactorOtpService {

    private final TwoFactorOtpRepository twoFactorOtpRepository;

    @Transactional
    public TwoFactorOTP create(Long userId, String otp, String jwt) {
        TwoFactorOTP twoFactorOTP = TwoFactorOTP.builder()
                .userId(userId)
                .otp(otp)
                .jwt(jwt)
                .verified(false)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .build();

        TwoFactorOTP saved = twoFactorOtpRepository.save(twoFactorOTP);
        log.info("2FA OTP created for user: {}", userId);
        return saved;
    }

    public TwoFactorOTP findByUserId(Long userId) {
        return twoFactorOtpRepository.findByUserIdAndVerifiedFalseAndExpiryDateAfter(
                userId,
                LocalDateTime.now()
        ).orElse(null);
    }

    public TwoFactorOTP findById(String id) {
        return twoFactorOtpRepository.findById(id).orElse(null);
    }

    public boolean verify(TwoFactorOTP twoFactorOtp, String otp) {
        if (twoFactorOtp == null) {
            log.warn("2FA verification attempted with null OTP object");
            return false;
        }

        if (twoFactorOtp.isExpired()) {
            log.warn("2FA OTP expired for ID: {}", twoFactorOtp.getId());
            return false;
        }

        if (twoFactorOtp.getVerified()) {
            log.warn("2FA OTP already used for ID: {}", twoFactorOtp.getId());
            return false;
        }

        boolean isValid = twoFactorOtp.getOtp().equals(otp);

        if (isValid) {
            twoFactorOtp.setVerified(true);
            twoFactorOtpRepository.save(twoFactorOtp);
            log.info("2FA OTP verified successfully for ID: {}", twoFactorOtp.getId());
        } else {
            log.warn("Invalid 2FA OTP attempt for ID: {}", twoFactorOtp.getId());
        }

        return isValid;
    }

    @Transactional
    public void delete(TwoFactorOTP twoFactorOtp) {
        twoFactorOtpRepository.delete(twoFactorOtp);
        log.info("2FA OTP deleted: {}", twoFactorOtp.getId());
    }

    @Transactional
    public void deleteExpired() {
        int deleted = twoFactorOtpRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("Deleted {} expired 2FA OTPs", deleted);
    }
}

