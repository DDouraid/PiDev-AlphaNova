package com.example.interview.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.interview.entities.Interview;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
}