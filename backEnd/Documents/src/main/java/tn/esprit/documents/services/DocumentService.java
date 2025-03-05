package tn.esprit.documents.services;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import tn.esprit.documents.entities.DbDocument;
import tn.esprit.documents.entities.DocumentType;
import tn.esprit.documents.repositories.DocumentRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Value("${document.storage.path}")
    private String storagePath;

    private final DocumentRepository documentRepository;
    private final ResourceLoader resourceLoader;

    public DocumentService(DocumentRepository documentRepository, ResourceLoader resourceLoader) {
        this.documentRepository = documentRepository;
        this.resourceLoader = resourceLoader;
    }

    public List<DbDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public DbDocument getDocumentById(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    public DbDocument createDocument(DbDocument document) {
        return documentRepository.save(document);
    }

    public DbDocument updateDocument(Long id, DbDocument documentDetails) {
        DbDocument document = getDocumentById(id);
        if (document != null) {
            document.setName(documentDetails.getName());
            document.setType(documentDetails.getType());
            return documentRepository.save(document);
        }
        return null;
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public DbDocument generatePdfWithTemplate(Map<String, String> formData, String name) throws IOException {
        logger.info("Début de la génération du PDF avec template pour: " + name);

        String pdfFilePath = Paths.get(storagePath, name + ".pdf").toString();
        File storageDir = new File(storagePath);
        if (!storageDir.exists()) {
            if (!storageDir.mkdirs()) {
                logger.warn("Échec de la création du répertoire de stockage: " + storagePath);
            }
        }

        try (PdfWriter writer = new PdfWriter(pdfFilePath);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc)) {

            // Définir les marges (ajouter une marge en tête de document)
            document.setMargins(72, 72, 36, 72); // 72 points = 1 inch

            // Charger et ajouter le logo
            Resource logoResource = resourceLoader.getResource("classpath:static/images/logo.png");
            if (logoResource.exists()) {
                byte[] logoBytes = Files.readAllBytes(logoResource.getFile().toPath());
                ImageData imageData = ImageDataFactory.create(logoBytes);
                Image logo = new Image(imageData);
                logo.scaleToFit(200, 75);
                logo.setHorizontalAlignment(HorizontalAlignment.CENTER); // Centrer le logo
                document.add(logo);
            } else {
                logger.warn("Logo non trouvé, génération sans logo.");
            }

            PdfFont font = PdfFontFactory.createFont("Times-Roman");
            PdfFont boldFont = PdfFontFactory.createFont("Times-Bold");

            Paragraph title = new Paragraph("ATTESTATION DE STAGE")
                    .setFont(boldFont)
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Espacement
            document.add(new Paragraph("\n"));

            // Corps du texte avec formatage
            Paragraph companyPara = new Paragraph("Nous soussignés, " +
                    formData.getOrDefault("companyName", "[Nom de l'entreprise]") +
                    " certifions que :")
                    .setFont(font)
                    .setFontSize(12);
            document.add(companyPara);

            // Espacement
            document.add(new Paragraph("\n"));

            Paragraph internPara = new Paragraph(formData.getOrDefault("internName", "[Nom et Prénom du stagiaire]"))
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER); // Centrer le nom du stagiaire
            document.add(internPara);

            // Espacement
            document.add(new Paragraph("\n"));

            Paragraph periodPara = new Paragraph("a effectué un stage au sein de notre entreprise du " +
                    formData.getOrDefault("startDate", "[Date de début]") + " au " +
                    formData.getOrDefault("endDate", "[Date de fin]") +
                    ". Durant cette période, il/elle a occupé le poste de " +
                    formData.getOrDefault("jobTitle", "[Titre du poste]") +
                    " au sein de " +
                    formData.getOrDefault("department", "[Département/Service]") +
                    ", où il/elle a eu pour missions principales :")
                    .setFont(font)
                    .setFontSize(12);
            document.add(periodPara);

            // Liste des missions avec indentation
            Paragraph mission1 = new Paragraph("- " + formData.getOrDefault("mission1", "[mission 1]"))
                    .setFont(font)
                    .setFontSize(12)
                    .setMarginLeft(20);
            document.add(mission1);

            Paragraph mission2 = new Paragraph("- " + formData.getOrDefault("mission2", "[mission 2]"))
                    .setFont(font)
                    .setFontSize(12)
                    .setMarginLeft(20);
            document.add(mission2);

            Paragraph mission3 = new Paragraph("- " + formData.getOrDefault("mission3", "[mission 3]"))
                    .setFont(font)
                    .setFontSize(12)
                    .setMarginLeft(20);
            document.add(mission3);

            // Espacement
            document.add(new Paragraph("\n"));

            Paragraph qualitiesPara = new Paragraph("Nous attestons que " +
                    formData.getOrDefault("internName", "[Nom du stagiaire]") +
                    " a fait preuve de " +
                    formData.getOrDefault("qualities", "[qualités]") +
                    " et a su s'intégrer efficacement à notre équipe.")
                    .setFont(font)
                    .setFontSize(12);
            document.add(qualitiesPara);

            Paragraph locationPara = new Paragraph("Fait à " +
                    formData.getOrDefault("location", "[Lieu]") +
                    ", le " +
                    formData.getOrDefault("date", "[Date]") + ".")
                    .setFont(font)
                    .setFontSize(12);
            document.add(locationPara);

            // Espacement
            document.add(new Paragraph("\n"));

            // Signature en gras alignée à droite en bas de page
            Paragraph signaturePara = new Paragraph("Signature et Cachet de l'entreprise")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(signaturePara);

            logger.info("PDF généré avec succès: " + pdfFilePath);
        } catch (IOException e) {
            logger.error("Erreur lors de la génération du PDF: ", e);
            throw e;
        }

        DbDocument docEntity = new DbDocument();
        docEntity.setName(name);
        docEntity.setType(DocumentType.AGREEMENT);
        return documentRepository.save(docEntity);
    }

    public String getFilePath(String name) {
        return Paths.get(storagePath, name + ".pdf").toString();
    }
}