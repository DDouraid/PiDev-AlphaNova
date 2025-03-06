package tn.esprit.gestion_utilisateurs.security.services;
// backend/src/main/java/tn/esprit/gestion_utilisateurs/services/SmsService.java

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    public void sendOtpSms(String toPhoneNumber, String otp) {
        Twilio.init(accountSid, authToken);
        String messageBody = "Your one-time password (OTP) for two-factor authentication is: " + otp + ". Valid for 5 minutes. Do not share this code.";
        Message message = Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                messageBody
        ).create();
        System.out.println("SMS sent: " + message.getSid());
    }
}