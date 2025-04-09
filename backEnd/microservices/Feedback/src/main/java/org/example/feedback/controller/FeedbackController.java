package org.example.feedback.controller;

import org.example.feedback.entities.Feedback;
import org.example.feedback.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("mic1Feedback")
@CrossOrigin(origins = "http://localhost:4200")
public class FeedbackController {
    @Autowired
    FeedbackService feedbackService;

    @PostMapping("/addFeedback")
    public Feedback addFeedback(@RequestBody Feedback feedback) {
        return feedbackService.addFeedback(feedback);
    }


    @GetMapping("/findAll")
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    @PutMapping("/updateFeedback/{id}")
    public Feedback updateFeedback(@PathVariable Integer id, @RequestBody Feedback feedback) {

        feedback.setId(id);
        return feedbackService.updateFeedback(feedback);
    }


    @DeleteMapping("/delete/{id}")
    public void deleteFeedback(@PathVariable Integer id) {
        feedbackService.deleteFeedback(id);
    }
}
