package com.example.interview.services;

import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.interview.entities.Interview;
import com.example.interview.repositories.InterviewRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewServiceImpl implements InterviewService {


    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private EntityManager entityManager;

    @Override
    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    @Override
    public Optional<Interview> getInterviewById(Long id) {
        return interviewRepository.findById(id);
    }

    @Override
    @Transactional
    public Interview saveInterview(Interview interview) {
        System.out.println("Saving Interview: " + interview);
        if (interview.getId() == null) {
            entityManager.persist(interview); // Force insert for new entity
            return interview;
        } else {
            return interviewRepository.save(interview); // Update existing entity
        }
    }

    @Override
    public void deleteInterview(Long id) {
        interviewRepository.deleteById(id);
    }
}