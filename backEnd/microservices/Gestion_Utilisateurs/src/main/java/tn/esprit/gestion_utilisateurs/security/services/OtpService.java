package tn.esprit.gestion_utilisateurs.security.services;


import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {
    private final Map<String, String> otpStore = new HashMap<>();
    private final Random random = new Random();

    // Generate a 6-digit OTP
    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(999999));
        otpStore.put(email, otp);
        return otp;
    }

    // Verify OTP
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = otpStore.get(email);
        return storedOtp != null && storedOtp.equals(otp);
    }

    // Clear OTP after use
    public void clearOtp(String email) {
        otpStore.remove(email);
    }
}
