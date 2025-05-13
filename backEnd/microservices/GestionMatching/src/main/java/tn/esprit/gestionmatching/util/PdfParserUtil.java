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
            System.out.println("Raw text extracted from PDF:\n" + text);

            // Extract admission-related numerical features
            cvData.setGreScore(extractGreScore(text));
            cvData.setToeflScore(extractToeflScore(text));
            cvData.setUniversityRating(extractUniversityRating(text));
            cvData.setSop(extractSop(text));
            cvData.setLor(extractLor(text));
            cvData.setCgpa(extractCgpa(text));
            cvData.setResearch(extractResearch(text));

            // Extract other fields for CV matching
            cvData.setSkills(extractSkills(text));
            cvData.setEducation(extractEducation(text));
            cvData.setCertifications(extractCertifications(text));

            // Log extracted data for debugging
            System.out.println("Extracted GRE Score: " + cvData.getGreScore());
            System.out.println("Extracted TOEFL Score: " + cvData.getToeflScore());
            System.out.println("Extracted University Rating: " + cvData.getUniversityRating());
            System.out.println("Extracted SOP: " + cvData.getSop());
            System.out.println("Extracted LOR: " + cvData.getLor());
            System.out.println("Extracted CGPA: " + cvData.getCgpa());
            System.out.println("Extracted Research: " + cvData.getResearch());
            System.out.println("Extracted Skills: " + cvData.getSkills());
            System.out.println("Extracted Education: " + cvData.getEducation());
            System.out.println("Extracted Certifications: " + cvData.getCertifications());

            return cvData;
        }
    }

    private static Double extractGreScore(String text) {
        // Enhanced pattern to match various GRE score formats (e.g., "GRE Score: 325", "GRE 325", "GRE:325")
        Pattern pattern = Pattern.compile("GRE\\s*(?:Score)?\\s*[:\\s-]*(\\d{3})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double score = Double.parseDouble(matcher.group(1));
            // Validate GRE score range (130-340)
            if (score >= 130 && score <= 340) {
                return score;
            }
            System.out.println("GRE Score out of valid range (130-340): " + score);
        }
        System.out.println("GRE Score not found, using default (300)");
        return 300.0; // Default value if not found or invalid
    }

    private static Double extractToeflScore(String text) {
        // Enhanced pattern to match TOEFL score formats (e.g., "TOEFL Score: 110", "TOEFL 105", "TOEFL:110")
        Pattern pattern = Pattern.compile("TOEFL\\s*(?:Score)?\\s*[:\\s-]*(\\d{2,3})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double score = Double.parseDouble(matcher.group(1));
            // Validate TOEFL score range (0-120)
            if (score >= 0 && score <= 120) {
                return score;
            }
            System.out.println("TOEFL Score out of valid range (0-120): " + score);
        }
        System.out.println("TOEFL Score not found, using default (100)");
        return 100.0; // Default value if not found or invalid
    }

    private static Double extractUniversityRating(String text) {
        // Match University Rating (e.g., "University Rating: 4", "Rating 3")
        Pattern pattern = Pattern.compile("University\\s*Rating\\s*[:\\s-]*(\\d)|Rating\\s*[:\\s-]*(\\d)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double rating = Double.parseDouble(matcher.group(1) != null ? matcher.group(1) : matcher.group(2));
            // Validate University Rating range (1-5)
            if (rating >= 1 && rating <= 5) {
                return rating;
            }
            System.out.println("University Rating out of valid range (1-5): " + rating);
        }
        // Fallback: Infer rating based on institution name (if available)
        Pattern institutionPattern = Pattern.compile("Education\\n(.*?)\\n(?:Experience|Certifications|$)", Pattern.DOTALL);
        Matcher institutionMatcher = institutionPattern.matcher(text);
        if (institutionMatcher.find()) {
            String educationSection = institutionMatcher.group(1).trim();
            String[] educationEntries = educationSection.split("\\n");
            for (String entry : educationEntries) {
                if (entry.toLowerCase().contains("harvard") || entry.toLowerCase().contains("mit") ||
                        entry.toLowerCase().contains("stanford") || entry.toLowerCase().contains("oxford") ||
                        entry.toLowerCase().contains("cambridge")) {
                    System.out.println("Found prestigious institution, setting University Rating to 5");
                    return 5.0;
                }
            }
            if (educationSection.toLowerCase().contains("university") || educationSection.toLowerCase().contains("college")) {
                System.out.println("Found general university/college, setting University Rating to 4");
                return 4.0;
            }
        }
        System.out.println("University Rating not found, using default (3)");
        return 3.0; // Default value if not found or inferred
    }

    private static Double extractSop(String text) {
        // Match SOP (e.g., "SOP: 4.5", "Statement of Purpose 3.0")
        Pattern pattern = Pattern.compile("SOP\\s*[:\\s-]*(\\d\\.?\\d?)|Statement\\s*of\\s*Purpose\\s*[:\\s-]*(\\d\\.?\\d?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double sop = Double.parseDouble(matcher.group(1) != null ? matcher.group(1) : matcher.group(2));
            // Validate SOP range (1-5)
            if (sop >= 1 && sop <= 5) {
                return sop;
            }
            System.out.println("SOP out of valid range (1-5): " + sop);
        }
        // Fallback: Infer SOP based on skills like "Communication" or "Writing"
        if (text.toLowerCase().contains("communication") || text.toLowerCase().contains("writing")) {
            System.out.println("Found communication/writing skills, setting SOP to 4.0");
            return 4.0;
        }
        System.out.println("SOP not found, using default (3.0)");
        return 3.0; // Default value if not found or inferred
    }

    private static Double extractLor(String text) {
        // Match LOR (e.g., "LOR: 4.0", "Letter of Recommendation 3.5")
        Pattern pattern = Pattern.compile("LOR\\s*[:\\s-]*(\\d\\.?\\d?)|Letter\\s*of\\s*Recommendation\\s*[:\\s-]*(\\d\\.?\\d?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double lor = Double.parseDouble(matcher.group(1) != null ? matcher.group(1) : matcher.group(2));
            // Validate LOR range (1-5)
            if (lor >= 1 && lor <= 5) {
                return lor;
            }
            System.out.println("LOR out of valid range (1-5): " + lor);
        }
        // Fallback: Infer LOR based on skills like "Leadership" or "Teamwork"
        if (text.toLowerCase().contains("leadership") || text.toLowerCase().contains("teamwork")) {
            System.out.println("Found leadership/teamwork skills, setting LOR to 4.0");
            return 4.0;
        }
        System.out.println("LOR not found, using default (3.0)");
        return 3.0; // Default value if not found or inferred
    }

    private static Double extractCgpa(String text) {
        // Match CGPA or GPA (e.g., "CGPA: 8.5", "GPA 3.7")
        Pattern pattern = Pattern.compile("CGPA\\s*[:\\s-]*(\\d\\.?\\d+)|GPA\\s*[:\\s-]*(\\d\\.?\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            double cgpa = Double.parseDouble(matcher.group(1) != null ? matcher.group(1) : matcher.group(2));
            // Convert GPA (0-4 scale) to CGPA (0-10 scale) if necessary
            if (cgpa <= 4.0) {
                cgpa = (cgpa / 4.0) * 10.0; // Convert GPA to CGPA
                System.out.println("Converted GPA to CGPA: " + cgpa);
            }
            // Validate CGPA range (0-10)
            if (cgpa >= 0 && cgpa <= 10) {
                return cgpa;
            }
            System.out.println("CGPA out of valid range (0-10): " + cgpa);
        }
        // Fallback: Infer CGPA based on education level
        Pattern educationPattern = Pattern.compile("Education\\n(.*?)\\n(?:Experience|Certifications|$)", Pattern.DOTALL);
        Matcher educationMatcher = educationPattern.matcher(text);
        if (educationMatcher.find()) {
            String educationSection = educationMatcher.group(1).trim();
            if (educationSection.toLowerCase().contains("master")) {
                System.out.println("Found Master’s degree, setting CGPA to 8.5");
                return 8.5;
            } else if (educationSection.toLowerCase().contains("phd")) {
                System.out.println("Found PhD degree, setting CGPA to 9.0");
                return 9.0;
            }
        }
        System.out.println("CGPA not found, using default (7.0)");
        return 7.0; // Default value if not found or inferred
    }

    private static Integer extractResearch(String text) {
        // Match Research (e.g., "Research: Yes", "Research Experience 1")
        Pattern pattern = Pattern.compile("Research\\s*(?:Experience)?\\s*[:\\s-]*(Yes|No|1|0)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String value = matcher.group(1);
            return value.equalsIgnoreCase("Yes") || value.equals("1") ? 1 : 0;
        }
        // Fallback: Infer Research based on keywords like "research", "thesis", "publication"
        if (text.toLowerCase().contains("research") || text.toLowerCase().contains("thesis") ||
                text.toLowerCase().contains("publication") || text.toLowerCase().contains("paper")) {
            System.out.println("Found research-related keywords, setting Research to 1");
            return 1;
        }
        System.out.println("Research not found, using default (0)");
        return 0; // Default value if not found or inferred
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