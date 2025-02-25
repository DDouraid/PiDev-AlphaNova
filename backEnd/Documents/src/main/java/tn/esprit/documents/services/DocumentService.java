// Document/src/main/java/tn/esprit/documents/services/DocumentService.java
package tn.esprit.documents.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.documents.entities.Document;
import tn.esprit.documents.repositories.DocumentRepository;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

@Service
public class DocumentService {

    @Value("${document.storage.path}")
    private String storagePath;

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    public Document createDocument(Document document) {
        return documentRepository.save(document);
    }

    public Document updateDocument(Long id, Document documentDetails) {
        Document document = getDocumentById(id);
        if (document != null) {
            document.setName(documentDetails.getName());
            document.setUrl(documentDetails.getUrl());
            return documentRepository.save(document);
        }
        return null;
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public Document createDocumentWithPdf(String name, String content) throws IOException {
        PDDocument pdfDocument = new PDDocument();
        PDPage page = new PDPage();
        pdfDocument.addPage(page);

        try (PDPageContentStream contentStream = new PDPageContentStream(pdfDocument, page)) {
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(100, 700);
            contentStream.showText(content);
            contentStream.endText();
        }

        String pdfFilePath = Paths.get(storagePath, name + ".pdf").toString();
        pdfDocument.save(pdfFilePath);
        pdfDocument.close();

        Document document = new Document();
        document.setName(name);
        document.setUrl(pdfFilePath);
        return documentRepository.save(document);
    }
}
