package tn.esprit.gestionmatching.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import tn.esprit.gestionmatching.dto.CvDataDto;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PdfParserUtil {
    public static CvDataDto parseCvPdf(File pdfFile, Long userId) throws IOException {
        CvDataDto cvData = new CvDataDto();
        cvData.setUserId(userId);

        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFTextStripper textStripper = new PDFTextStripper();
            String text = textStripper.getText(document);

            // Normalize the text: replace multiple newlines with a single newline
            text = text.replaceAll("\\r\\n|\\r|\\n", "\n").replaceAll("\\n+", "\n").trim();

            // Log the raw text extracted from the PDF
            System.out.println("Raw text extracted from PDF:\n" + text);

            cvData.setSkills(extractSkills(text));
            cvData.setEducation(extractEducation(text));
            cvData.setCertifications(extractCertifications(text));

            // Log the extracted data for debugging
            System.out.println("Extracted Skills: " + cvData.getSkills());
            System.out.println("Extracted Education: " + cvData.getEducation());
            System.out.println("Extracted Certifications: " + cvData.getCertifications());

            return cvData;
        }
    }

    private static List<String> extractSkills(String text) {
        List<String> skills = new ArrayList<>();
        Pattern skillsPattern = Pattern.compile("Skills\\n(.*?)\\n(?:Languages|Education|Experience|Certifications|$)", Pattern.DOTALL);
        Matcher skillsMatcher = skillsPattern.matcher(text);

        if (skillsMatcher.find()) {
            String skillsSection = skillsMatcher.group(1).trim();
            System.out.println("Skills section found:\n" + skillsSection);
            String[] skillsArray = skillsSection.split("\\n");
            for (String skill : skillsArray) {
                skill = skill.trim();
                if (skill.startsWith("•")) {
                    skill = skill.substring(1).trim();
                }
                if (!skill.isEmpty()) {
                    skills.add(skill);
                    System.out.println("Extracted skill: " + skill);
                }
            }
        } else {
            System.out.println("Skills section not found in the text.");
        }
        return skills;
    }

    private static List<CvDataDto.EducationDto> extractEducation(String text) {
        List<CvDataDto.EducationDto> educationList = new ArrayList<>();
        Pattern educationPattern = Pattern.compile("Education\\n(.*?)\\n(?:Experience|Certifications|$)", Pattern.DOTALL);
        Matcher educationMatcher = educationPattern.matcher(text);

        if (educationMatcher.find()) {
            String educationSection = educationMatcher.group(1).trim();
            System.out.println("Education section found:\n" + educationSection);
            String[] educationEntries = educationSection.split("\\n");
            for (int i = 0; i < educationEntries.length - 1; i++) {
                String degree = educationEntries[i].trim();
                if (degree.isEmpty()) continue;

                String institutionLine = educationEntries[i + 1].trim();
                System.out.println("Processing education entry - Degree: " + degree + ", Institution Line: " + institutionLine);
                Pattern institutionPattern = Pattern.compile("(.*?)\\s*\\((\\d{4})\\)");
                Matcher institutionMatcher = institutionPattern.matcher(institutionLine);
                if (institutionMatcher.find()) {
                    CvDataDto.EducationDto education = new CvDataDto.EducationDto();
                    education.setDegree(degree);
                    education.setInstitution(institutionMatcher.group(1).trim());
                    education.setYear(institutionMatcher.group(2).trim());
                    educationList.add(education);
                    System.out.println("Extracted education: " + education);
                    i++;
                } else {
                    System.out.println("Failed to match institution pattern in: " + institutionLine);
                }
            }
        } else {
            System.out.println("Education section not found in the text.");
        }
        return educationList;
    }

    private static List<CvDataDto.CertificationDto> extractCertifications(String text) {
        List<CvDataDto.CertificationDto> certificationList = new ArrayList<>();
        Pattern certificationPattern = Pattern.compile("Certifications\\n(.*?)\\n?(?:$)", Pattern.DOTALL);
        Matcher certificationMatcher = certificationPattern.matcher(text);

        if (certificationMatcher.find()) {
            String certificationSection = certificationMatcher.group(1).trim();
            System.out.println("Certifications section found:\n" + certificationSection);
            String[] certificationEntries = certificationSection.split("\\n");
            for (int i = 0; i < certificationEntries.length - 1; i++) {
                String certName = certificationEntries[i].trim();
                if (certName.isEmpty()) continue;

                String issuerLine = certificationEntries[i + 1].trim();
                System.out.println("Processing certification entry - Cert Name: " + certName + ", Issuer Line: " + issuerLine);
                Pattern issuerPattern = Pattern.compile("(.*?)\\s*\\((\\d{4}-\\d{2})\\)");
                Matcher issuerMatcher = issuerPattern.matcher(issuerLine);
                if (issuerMatcher.find()) {
                    CvDataDto.CertificationDto certification = new CvDataDto.CertificationDto();
                    certification.setName(certName);
                    certification.setIssuer(issuerMatcher.group(1).trim());
                    certification.setIssueDate(issuerMatcher.group(2).trim());
                    certificationList.add(certification);
                    System.out.println("Extracted certification: " + certification);
                    i++;
                } else {
                    System.out.println("Failed to match issuer pattern in: " + issuerLine);
                }
            }
        } else {
            System.out.println("Certifications section not found in the text.");
        }
        return certificationList;
    }
}