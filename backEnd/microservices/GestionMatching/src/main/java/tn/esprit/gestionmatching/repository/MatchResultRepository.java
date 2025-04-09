package tn.esprit.gestionmatching.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionmatching.entity.MatchResult;

public interface MatchResultRepository extends JpaRepository<MatchResult, Long> {
}