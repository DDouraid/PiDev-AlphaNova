// Document/src/main/java/tn/esprit/application/services/DocumentService.java
package tn.esprit.documents.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.documents.entities.Document;
import tn.esprit.documents.entities.DocumentType;
import tn.esprit.documents.repositories.DocumentRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public Document createDocument(Document document) {
        validatePdf(document.getData());
        return documentRepository.save(document);
    }

    public Document updateDocument(Long id, Document documentDetails) {
        Document document = getDocumentById(id);
        validatePdf(documentDetails.getData());
        document.setName(documentDetails.getName());
        document.setType(documentDetails.getType());
        document.setData(documentDetails.getData());
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public byte[] generatePdf(String content) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText(content);
                contentStream.endText();
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    public Document createDocumentWithPdf(String name, String content) throws IOException {
        byte[] pdfBytes = generatePdf(content);
        Document document = new Document(name, DocumentType.REPORT, pdfBytes);
        return createDocument(document);
    }

    private void validatePdf(byte[] data) {
        try (PDDocument document = PDDocument.load(data)) {
            // If the document is loaded successfully, it is a valid PDF
        } catch (IOException e) {
            throw new RuntimeException("Invalid PDF file", e);
        }
    }
}