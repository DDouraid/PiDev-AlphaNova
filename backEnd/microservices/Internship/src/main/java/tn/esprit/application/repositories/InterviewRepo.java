package tn.esprit.application.repositories;

import tn.esprit.application.entities.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewRepo extends JpaRepository<Interview, Long> {
}