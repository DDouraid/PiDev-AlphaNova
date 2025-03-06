package tn.esprit.application.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.entities.InternshipRequest;

import java.util.List;

public interface InternshipRequestRepo extends JpaRepository<InternshipRequest, Long> {
    List<InternshipRequest> findByOfferId(Long offerId);
}
