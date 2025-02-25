// Document/src/main/java/tn/esprit/documents/repositories/DocumentRepository.java
package tn.esprit.documents.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.documents.entities.Document;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}