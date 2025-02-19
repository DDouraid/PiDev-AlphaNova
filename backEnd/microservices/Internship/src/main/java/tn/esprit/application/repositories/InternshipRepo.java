package tn.esprit.application.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.application.entities.Internship;

public interface InternshipRepo extends JpaRepository<Internship, Long> {


}
