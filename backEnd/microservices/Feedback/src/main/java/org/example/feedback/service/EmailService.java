package org.example.feedback.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("re_8sJ1DaEs_Q24vs2JPDnw1SQsNk9uTLpBM")
    private String resendApiKey;

    @Value("ayoub.gombra@esprit.tn")
    private String emailFrom;

    public void sendEmail(String to, String subject, String body) throws Exception {
        String url = "https://api.resend.com/emails";

        // Préparer les en-têtes
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + resendApiKey);
        headers.set("Content-Type", "application/json");

        // Préparer le corps de la requête
        String requestBody = String.format(
                "{\"from\": \"%s\", \"to\": \"%s\", \"subject\": \"%s\", \"text\": \"%s\"}",
                emailFrom, to, subject, body
        );

        // Créer l'entité HTTP
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        // Envoyer la requête à l'API Resend
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // Vérifier la réponse
        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("Email envoyé avec succès : " + response.getBody());
        } else {
            throw new Exception("Échec de l'envoi de l'email via Resend : " + response.getBody());
        }
    }
}