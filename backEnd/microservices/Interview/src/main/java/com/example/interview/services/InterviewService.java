package com.example.interview.services;

import com.example.interview.entities.Interview;

import java.util.List;
import java.util.Optional;

public interface InterviewService {
    List<Interview> getAllInterviews();
    Optional<Interview> getInterviewById(Long id);
    Interview saveInterview(Interview interview);
    void deleteInterview(Long id);
}