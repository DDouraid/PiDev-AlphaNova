package org.example.feedback.controller;


import org.example.feedback.service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/email")
@CrossOrigin(origins = "http://localhost:4200")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public String sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        try {
            emailService.sendEmail(to, subject, body);
            return "Email envoyé avec succès !";
        } catch (Exception e) {
            return "Erreur lors de l'envoi : " + e.getMessage();
        }
    }
}
