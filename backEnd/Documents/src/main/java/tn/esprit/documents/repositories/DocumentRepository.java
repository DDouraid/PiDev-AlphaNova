package tn.esprit.documents.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.documents.entities.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
}