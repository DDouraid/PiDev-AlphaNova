package org.example.feedback.repo;

import org.example.feedback.entities.Feedback;
import org.example.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepo extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByUserId(Long userId); // Update to query by userId
}
