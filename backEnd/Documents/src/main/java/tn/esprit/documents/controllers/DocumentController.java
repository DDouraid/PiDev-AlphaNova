package tn.esprit.documents.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.documents.entities.DbDocument;
import tn.esprit.documents.services.DocumentService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:4200")
public class DocumentController {

    private final DocumentService documentService;

    // Injection par constructeur (recommandé)
    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<DbDocument> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DbDocument> getDocumentById(@PathVariable Long id) {
        DbDocument document = documentService.getDocumentById(id);
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(document);
    }

    @PostMapping
    public DbDocument createDocument(@RequestBody DbDocument document) {
        return documentService.createDocument(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DbDocument> updateDocument(@PathVariable Long id, @RequestBody DbDocument documentDetails) {
        DbDocument updatedDocument = documentService.updateDocument(id, documentDetails);
        if (updatedDocument == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updatedDocument);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-pdf-template")
    public ResponseEntity<DbDocument> generatePdfWithTemplate(@RequestBody Map<String, String> formData) {
        try {
            String name = formData.get("fileName");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(null); // Retourne null avec HttpStatus.BAD_REQUEST
            }
            DbDocument document = documentService.generatePdfWithTemplate(formData, name);
            return ResponseEntity.ok(document);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(null); // Retourne null avec HttpStatus.INTERNAL_SERVER_ERROR
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        DbDocument document = documentService.getDocumentById(id);
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\": \"Document not found\"}".getBytes());
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", document.getName() + ".pdf");
        try {
            byte[] fileContent = Files.readAllBytes(Paths.get(documentService.getFilePath(document.getName())));
            return ResponseEntity.ok().headers(headers).body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(("{\"message\": \"Error reading file: " + e.getMessage() + "\"}").getBytes());
        }
    }
}