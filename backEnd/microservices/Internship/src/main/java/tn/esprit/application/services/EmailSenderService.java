package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Async
    public void sendSimpleEmail(String toEmail, String subject, String title, String message) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);

        Context context = new Context();
        context.setVariable("title", title);
        context.setVariable("message", message);
        String emailContent = templateEngine.process("email-template", context);

        helper.setText(emailContent, true);

        mailSender.send(mimeMessage);
        System.out.println("Mail sent to: " + toEmail + " with subject: " + subject);
    }
}