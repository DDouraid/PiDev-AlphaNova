package tn.esprit.library.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.library.entities.Library;

public interface LibraryRepository extends JpaRepository<Library, Long> {
}