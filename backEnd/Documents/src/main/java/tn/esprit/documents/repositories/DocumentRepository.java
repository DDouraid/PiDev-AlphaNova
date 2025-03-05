// Document/src/main/java/tn/esprit/documents/repositories/DocumentRepository.java
package tn.esprit.documents.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.documents.entities.DbDocument;

public interface DocumentRepository extends JpaRepository<DbDocument, Long> {
}