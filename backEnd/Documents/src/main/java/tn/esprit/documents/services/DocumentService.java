package tn.esprit.documents.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import tn.esprit.documents.entities.Document;
import tn.esprit.documents.repositories.DocumentRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Value("${document.storage.path}")
    private String storagePath;

    @Value("classpath:templates/template.pdf")
    private Resource templateResource; // Charger depuis le classpath

    private final DocumentRepository documentRepository;
    private final ResourceLoader resourceLoader;

    public DocumentService(DocumentRepository documentRepository, ResourceLoader resourceLoader) {
        this.documentRepository = documentRepository;
        this.resourceLoader = resourceLoader;
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

    public Document generatePdfWithTemplate(Map<String, String> formData, String name) throws IOException {
        logger.info("Début de la génération du PDF avec template pour: " + name);

        // Vérifier si le fichier template existe dans le classpath
        if (!templateResource.exists()) {
            logger.error("Le fichier template n'existe pas dans le classpath: " + templateResource.getFilename());
            throw new IOException("Template file not found in classpath: " + templateResource.getFilename());
        }

        // Charger le template depuis le classpath
        try (PDDocument templateDoc = PDDocument.load(templateResource.getInputStream())) {
            logger.info("Template chargé avec succès depuis le classpath");
            PDDocument newDoc = new PDDocument();
            PDPage newPage = new PDPage();
            newDoc.addPage(newPage);

            try (PDPageContentStream contentStream = new PDPageContentStream(newDoc, newPage)) {
                contentStream.setLeading(14.5f);
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.newLineAtOffset(100, 750);
                contentStream.showText("HOMORIS UNITED UNIVBRSITIES");
                contentStream.newLine();

                contentStream.showText("ATTESTATION DE STAGE");
                contentStream.newLine();
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("Nous soussignés, ");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("companyName", "[Nom de l'entreprise]") + ", certifions que :");
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("internName", "[Nom et Prénom du stagiaire]"));
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("a effectué un stage au sein de notre entreprise du ");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("startDate", "[Date de début]") + " au " +
                        formData.getOrDefault("endDate", "[Date de fin]") + ". Durant cette période, il/elle a occupé le poste de ");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("jobTitle", "[Titre du poste]") + " au sein de " +
                        formData.getOrDefault("department", "[Département/Service]") + ", où il/elle a eu pour missions principales :");
                contentStream.newLine();
                contentStream.newLine();

                contentStream.showText("- " + formData.getOrDefault("mission1", "[mission 1]"));
                contentStream.newLine();
                contentStream.showText("- " + formData.getOrDefault("mission2", "[mission 2]"));
                contentStream.newLine();
                contentStream.showText("- " + formData.getOrDefault("mission3", "[mission 3]"));
                contentStream.newLine();
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("Nous attestons que ");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("internName", "[Nom du stagiaire]") + " a fait preuve de " +
                        formData.getOrDefault("qualities", "[qualités professionnelles : rigueur, autonomie, etc.]") + ", et a su s'intégrer efficacement à notre équipe.");
                contentStream.newLine();
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("Fait à ");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.showText(formData.getOrDefault("location", "[Lieu]") + ", le " +
                        formData.getOrDefault("date", "[Date]") + ".");
                contentStream.newLine();
                contentStream.newLine();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("Signature et Cachet de l'entreprise");
                contentStream.endText();
            } catch (Exception e) {
                logger.error("Erreur lors de l'écriture du contenu dans le PDF: ", e);
                throw new IOException("Erreur lors de la génération du contenu: " + e.getMessage());
            }

            // Sauvegarder le PDF
            String pdfFilePath = Paths.get(storagePath, name + ".pdf").toString();
            File storageDir = new File(storagePath);
            if (!storageDir.exists()) {
                logger.info("Création du répertoire de stockage: " + storagePath);
                storageDir.mkdirs();
            }
            newDoc.save(pdfFilePath);
            newDoc.close();
            logger.info("PDF généré avec succès: " + pdfFilePath);

            // Enregistrer dans la base de données
            Document document = new Document();
            document.setName(name);
            document.setUrl(pdfFilePath);
            return documentRepository.save(document);
        } catch (IOException e) {
            logger.error("Erreur lors de la génération du PDF: ", e);
            throw e;
        }
    }
}