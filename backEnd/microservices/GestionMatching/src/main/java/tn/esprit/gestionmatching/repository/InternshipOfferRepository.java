package tn.esprit.gestionmatching.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionmatching.entity.InternshipOffer;

public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {
}