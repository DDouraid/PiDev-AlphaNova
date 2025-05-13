package org.example.feedback.controller;

import org.example.feedback.Clients.UserServiceClient;
import org.example.feedback.DTO.UserDTO;
import org.example.feedback.entities.Feedback;
import org.example.feedback.service.EmailService;
import org.example.feedback.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("mic1Feedback")
public class FeedbackController {
    @Autowired
    FeedbackService feedbackService;
    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private EmailService emailService;

    @PostMapping("/addFeedback")
    public Feedback addFeedback(@RequestBody Feedback feedback, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        feedback.setUserId(user.getId());
        feedback.setUsername(user.getUsername());
        return feedbackService.addFeedback(feedback);
    }


    @GetMapping("/findAll")
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    @PutMapping("/updateFeedback/{id}")
    public Feedback updateFeedback(@PathVariable Integer id, @RequestBody Feedback feedback, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        feedback.setUserId(user.getId());
        feedback.setUsername(user.getUsername());

        feedback.setId(id);
        return feedbackService.updateFeedback(feedback);
    }


    @DeleteMapping("/delete/{id}")
    public void deleteFeedback(@PathVariable Integer id) {
        feedbackService.deleteFeedback(id);
    }


    @PostMapping("/send")
    public String sendEmail(@RequestParam String to) {

        String subject = "merci de nous envoyer votre feedback";
        String body = "merci de nous envoyer votre feedback on l'a bien reçus";

        emailService.sendEmail(to, subject, body);
        return "Email sent successfully!";
    }
}
