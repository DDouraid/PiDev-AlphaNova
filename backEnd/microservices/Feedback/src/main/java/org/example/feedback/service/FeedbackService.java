package org.example.feedback.service;

import org.example.feedback.entities.Feedback;
import org.example.feedback.repo.FeedbackRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
    @Autowired
    FeedbackRepo feedbackRepo;

    public Feedback addFeedback(Feedback feedback) {
        return feedbackRepo.save(feedback);
    }

    public void deleteFeedback(Integer idResult) {
        feedbackRepo.deleteById(idResult);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepo.findAll();
    }

    public Feedback updateFeedback(Feedback feedback) {
        return feedbackRepo.findById(feedback.getId())
                .map(existingEvent -> {
                    existingEvent.setId(feedback.getId());
                    existingEvent.setComment(feedback.getComment());
                    existingEvent.setNote(feedback.getNote());
                    return feedbackRepo.save(existingEvent);
                })
                .orElseThrow(() -> new RuntimeException("feedback not found with id: " + feedback.getId()));
    }
}
