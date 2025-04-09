package tn.esprit.gestionmatching.service;

import org.springframework.http.ResponseEntity;
import tn.esprit.gestionmatching.dto.*;
import tn.esprit.gestionmatching.entity.InternshipOffer;
import tn.esprit.gestionmatching.entity.MatchResult;
import tn.esprit.gestionmatching.repository.InternshipOfferRepository;
import tn.esprit.gestionmatching.repository.MatchResultRepository;
import tn.esprit.gestionmatching.util.PdfParserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private InternshipOfferRepository internshipOfferRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Value("${app.user-management-service-url}")
    private String userManagementServiceUrl;

    @Value("${app.ml-service-url}")
    private String mlServiceUrl;

    @Value("${app.match-threshold}")
    private double matchThreshold;

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
            "Java", "Python", "JavaScript", "C++", "C#", "Ruby", "PHP", "Go", "Kotlin", "Swift", "R", "TypeScript", "Scala",
            "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET",
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQLite", "NoSQL", "Redis", "Cassandra",
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "CI/CD", "Git", "GitHub", "GitLab",
            "Excel", "Tableau", "Power BI", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", "PyTorch", "Hadoop", "Spark",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Neural Networks", "Reinforcement Learning",
            "Cybersecurity", "Ethical Hacking", "Penetration Testing", "Wireshark", "Metasploit", "OWASP", "Cryptography",
            "Android", "iOS", "Flutter", "React Native", "Xamarin",
            "Agile", "Scrum", "TDD", "BDD", "OOP", "Design Patterns", "REST API", "GraphQL", "Microservices",
            "Communication", "Teamwork", "Problem Solving", "Time Management", "Leadership", "Adaptability", "Critical Thinking",
            "Linux", "Unix", "Shell Scripting", "Jira", "Confluence", "Figma", "Adobe XD", "Photoshop", "Illustrator"
    );
    private static final List<String> KNOWN_DEGREES = Arrays.asList(
            "Bachelor’s in Computer Science", "Master’s in Computer Science", "PhD in Computer Science",
            "Bachelor’s in Information Technology", "Master’s in Information Technology", "PhD in Information Technology",
            "Bachelor’s in Software Engineering", "Master’s in Software Engineering", "PhD in Software Engineering",
            "Bachelor’s in Cybersecurity", "Master’s in Cybersecurity", "PhD in Cybersecurity",
            "Bachelor’s in Data Science", "Master’s in Data Science", "PhD in Data Science",
            "Bachelor’s in Statistics", "Master’s in Statistics", "PhD in Statistics",
            "Bachelor’s in Mathematics", "Master’s in Mathematics", "PhD in Mathematics",
            "Bachelor’s in Engineering", "Master’s in Engineering", "PhD in Engineering",
            "Bachelor’s in Electrical Engineering", "Master’s in Electrical Engineering", "PhD in Electrical Engineering",
            "Bachelor’s in Mechanical Engineering", "Master’s in Mechanical Engineering", "PhD in Mechanical Engineering",
            "Bachelor’s in Civil Engineering", "Master’s in Civil Engineering", "PhD in Civil Engineering",
            "Bachelor’s in Business Administration", "Master’s in Business Administration", "PhD in Business Administration",
            "Bachelor’s in Management Information Systems", "Master’s in Management Information Systems", "PhD in Management Information Systems",
            "Bachelor’s in Marketing", "Master’s in Marketing", "PhD in Marketing",
            "Bachelor’s in Artificial Intelligence", "Master’s in Artificial Intelligence", "PhD in Artificial Intelligence",
            "Bachelor’s in Physics", "Master’s in Physics", "PhD in Physics",
            "Bachelor’s in Economics", "Master’s in Economics", "PhD in Economics",
            "Bachelor’s in Graphic Design", "Master’s in Graphic Design", "PhD in Graphic Design",
            "Bachelor’s in Psychology", "Master’s in Psychology", "PhD in Psychology"
    );
    private static final List<String> KNOWN_CERTIFICATIONS = Arrays.asList(
            "AWS Certified Developer", "AWS Certified Solutions Architect", "AWS Certified SysOps Administrator",
            "Microsoft Certified: Azure Developer Associate", "Microsoft Certified: Azure Solutions Architect Expert",
            "Google Cloud Professional Cloud Architect", "Google Cloud Professional Data Engineer",
            "Oracle Certified Java Programmer", "Microsoft Certified: .NET Developer",
            "Certified Kubernetes Administrator", "Certified Kubernetes Application Developer",
            "Red Hat Certified Engineer", "Red Hat Certified System Administrator",
            "Certified Analytics Professional", "Google Data Analytics Professional Certificate",
            "Microsoft Certified: Data Analyst Associate", "Tableau Desktop Specialist",
            "SAS Certified Data Scientist", "IBM Data Science Professional Certificate",
            "Certified Information Systems Security Professional (CISSP)",
            "Certified Ethical Hacker (CEH)", "CompTIA Security+",
            "Certified Information Security Manager (CISM)",
            "Certified Information Systems Auditor (CISA)",
            "Project Management Professional (PMP)", "Certified ScrumMaster (CSM)",
            "Professional Scrum Master (PSM)", "PRINCE2 Practitioner",
            "Agile Certified Practitioner (PMI-ACP)",
            "Cisco Certified Network Associate (CCNA)", "Cisco Certified Network Professional (CCNP)",
            "CompTIA Network+", "Juniper Networks Certified Associate",
            "Adobe Certified Expert (ACE)", "Autodesk Certified Professional",
            "Salesforce Certified Administrator", "Salesforce Certified Platform Developer",
            "HubSpot Inbound Marketing Certification", "Google Ads Certification"
    );

    private static class OfferExtractedData {
        List<String> skills = new ArrayList<>();
        List<String> education = new ArrayList<>();
        List<String> certifications = new ArrayList<>();
    }

    private OfferExtractedData extractDataFromDescription(String description) {
        OfferExtractedData extractedData = new OfferExtractedData();
        if (description == null || description.trim().isEmpty()) {
            return extractedData;
        }

        String descLower = description.toLowerCase();

        for (String skill : KNOWN_SKILLS) {
            if (descLower.contains(skill.toLowerCase())) {
                extractedData.skills.add(skill);
            }
        }

        for (String degree : KNOWN_DEGREES) {
            if (descLower.contains(degree.toLowerCase())) {
                extractedData.education.add(degree);
            }
        }

        for (String cert : KNOWN_CERTIFICATIONS) {
            if (descLower.contains(cert.toLowerCase())) {
                extractedData.certifications.add(cert);
            }
        }

        return extractedData;
    }

    private double computeMatchScore(CvDataDto cvData, OfferExtractedData offerData) {
        double score = 0.0;
        double maxScore = 0.0;

        // Skills matching (0.5 points per skill match, 0.3 for related skills)
        if (cvData.getSkills() != null && !offerData.skills.isEmpty()) {
            System.out.println("Comparing CV skills: " + cvData.getSkills() + " with offer skills: " + offerData.skills);
            for (String offerSkill : offerData.skills) {
                boolean exactMatch = cvData.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase(offerSkill));
                if (exactMatch) {
                    score += 0.5;
                    System.out.println("Skill match found (exact): " + offerSkill);
                } else {
                    // Check for related skills
                    if (offerSkill.equalsIgnoreCase("MySQL") && cvData.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase("SQL"))) {
                        score += 0.3;
                        System.out.println("Skill match found (related): " + offerSkill + " (matched with SQL)");
                    } else if (offerSkill.equalsIgnoreCase("React") && cvData.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase("React.js"))) {
                        score += 0.5; // Treat React and React.js as an exact match
                        System.out.println("Skill match found (exact): " + offerSkill + " (matched with React.js)");
                    } else if (offerSkill.equalsIgnoreCase("Java") && cvData.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase("Kotlin"))) {
                        score += 0.3;
                        System.out.println("Skill match found (related): " + offerSkill + " (matched with Kotlin)");
                    } else if (offerSkill.equalsIgnoreCase("Python") && cvData.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase("R"))) {
                        score += 0.3;
                        System.out.println("Skill match found (related): " + offerSkill + " (matched with R)");
                    }
                }
                maxScore += 0.5;
            }
        } else {
            System.out.println("No skills to compare: CV skills=" + cvData.getSkills() + ", Offer skills=" + offerData.skills);
        }

        // Education matching (1 point for exact match, 0.8 for related)
        if (cvData.getEducation() != null && !offerData.education.isEmpty()) {
            System.out.println("Comparing CV education: " + cvData.getEducation() + " with offer education: " + offerData.education);
            for (CvDataDto.EducationDto edu : cvData.getEducation()) {
                for (String offerEdu : offerData.education) {
                    if (edu.getDegree() != null) {
                        // Exact match
                        if (edu.getDegree().equalsIgnoreCase(offerEdu)) {
                            score += 1.0;
                            System.out.println("Education match found (exact): " + offerEdu);
                            break;
                        }
                        // Partial match: treat "Engineer" as related to "Computer Science" or "Software Engineering"
                        else if ((edu.getDegree().toLowerCase().contains("engineer") &&
                                (offerEdu.toLowerCase().contains("computer science") || offerEdu.toLowerCase().contains("software engineering"))) ||
                                (edu.getDegree().toLowerCase().contains("computer science") && offerEdu.toLowerCase().contains("engineer"))) {
                            score += 0.8;
                            System.out.println("Education match found (partial): " + offerEdu);
                            break;
                        }
                    }
                }
            }
            maxScore += offerData.education.size() * 1.0;
        } else {
            System.out.println("No education to compare: CV education=" + cvData.getEducation() + ", Offer education=" + offerData.education);
        }

        // Certifications matching (0.5 points for exact match, 0.4 for related)
        if (cvData.getCertifications() != null && !offerData.certifications.isEmpty()) {
            System.out.println("Comparing CV certifications: " + cvData.getCertifications() + " with offer certifications: " + offerData.certifications);
            for (CvDataDto.CertificationDto cert : cvData.getCertifications()) {
                for (String offerCert : offerData.certifications) {
                    if (cert.getName() != null) {
                        // Exact match
                        if (cert.getName().equalsIgnoreCase(offerCert)) {
                            score += 0.5;
                            System.out.println("Certification match found (exact): " + offerCert);
                            break;
                        }
                        // Partial match: match AWS certifications
                        else if (cert.getName().toLowerCase().contains("aws") && offerCert.toLowerCase().contains("aws")) {
                            score += 0.4;
                            System.out.println("Certification match found (partial): " + offerCert);
                            break;
                        }
                        // Partial match: match cybersecurity certifications
                        else if (cert.getName().toLowerCase().contains("ccna") && offerCert.toLowerCase().contains("security+")) {
                            score += 0.4;
                            System.out.println("Certification match found (partial): " + offerCert);
                            break;
                        }
                    }
                }
            }
            maxScore += offerData.certifications.size() * 0.5;
        } else {
            System.out.println("No certifications to compare: CV certifications=" + cvData.getCertifications() + ", Offer certifications=" + offerData.certifications);
        }

        // Normalize score to 0-1 range
        double finalScore = maxScore > 0 ? score / maxScore : 0.0;
        System.out.println("Computed match score: " + finalScore + " (score=" + score + ", maxScore=" + maxScore + ")");
        return finalScore;
    }

    public List<MatchResponseWithOfferDto> matchCvWithOffers() throws IOException {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication() != null ?
                    SecurityContextHolder.getContext().getAuthentication().getName() : null;
            System.out.println("Authenticated username: " + username);
            UserDTO user;

            if (username == null || "anonymousUser".equals(username)) {
                System.out.println("No authenticated user or anonymous, using hardcoded test user");
                user = new UserDTO();
                user.setId(6L);
                user.setUsername("kais");
                user.setEmail("kais.berrehouma@esprit.tn");
                user.setCvFile("C:/Users/dridi/Downloads/profile_Douraid Dridi_2025-04-03 (7).pdf");
            } else {
                String token = SecurityContextHolder.getContext().getAuthentication().getCredentials() != null ?
                        (String) SecurityContextHolder.getContext().getAuthentication().getCredentials() : "";
                System.out.println("JWT token: " + token);
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                System.out.println("Fetching user data from: " + userManagementServiceUrl + "/me");
                ResponseEntity<UserDTO> userResponse = restTemplate.exchange(
                        userManagementServiceUrl + "/me",
                        HttpMethod.GET,
                        entity,
                        UserDTO.class
                );
                user = userResponse.getBody();
                System.out.println("User data: " + user);
                if (user == null || user.getCvFile() == null) {
                    throw new RuntimeException("CV file not found for user: " + username);
                }
            }

            File cvFile = new File(user.getCvFile());
            System.out.println("CV file path: " + cvFile.getAbsolutePath());
            if (!cvFile.exists()) {
                throw new RuntimeException("CV file does not exist: " + cvFile.getAbsolutePath());
            }
            CvDataDto cvData = PdfParserUtil.parseCvPdf(cvFile, user.getId());
            System.out.println("Parsed CV data: " + cvData);

            List<InternshipOffer> offers = internshipOfferRepository.findAll();
            System.out.println("Internship offers: " + offers);
            if (offers.isEmpty()) {
                throw new RuntimeException("No internship offers found in the database");
            }

            // Convert offers to DTOs and create a map for quick lookup
            List<InternshipOfferDto> offerDtos = offers.stream().map(offer -> {
                InternshipOfferDto dto = new InternshipOfferDto();
                dto.setId(offer.getId());
                dto.setTitle(offer.getTitle());
                dto.setDescription(offer.getDescription());
                dto.setCompany(offer.getCompany());
                dto.setLocation(offer.getLocation());
                dto.setDatePosted(offer.getDatePosted());
                return dto;
            }).collect(Collectors.toList());
            System.out.println("Offer DTOs: " + offerDtos);

            Map<Long, InternshipOfferDto> offerDtoMap = offerDtos.stream()
                    .collect(Collectors.toMap(InternshipOfferDto::getId, dto -> dto));

            // Compute match scores and create response with offer details
            List<MatchResponseWithOfferDto> matchResults = new ArrayList<>();
            for (InternshipOffer offer : offers) {
                OfferExtractedData extractedData = extractDataFromDescription(offer.getDescription());
                double matchScore = computeMatchScore(cvData, extractedData);
                InternshipOfferDto offerDto = offerDtoMap.get(offer.getId());
                matchResults.add(new MatchResponseWithOfferDto(offer.getId(), matchScore, offerDto));
            }
            System.out.println("Match results with computed scores: " + matchResults);

            // Save results
            matchResults.forEach(match -> {
                MatchResult result = new MatchResult();
                result.setUserId(user.getId());
                result.setInternshipOfferId(match.getOfferId());
                result.setMatchScore(match.getMatchScore());
                matchResultRepository.save(result);
                System.out.println("Saved match result: " + result);
            });

            // Filter by threshold
            List<MatchResponseWithOfferDto> filteredResults = matchResults.stream()
                    .filter(match -> match.getMatchScore() >= matchThreshold)
                    .collect(Collectors.toList());
            System.out.println("Filtered results: " + filteredResults);
            return filteredResults;

        } catch (Exception e) {
            System.err.println("Error in matchCvWithOffers: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process matching: " + e.getMessage(), e);
        }
    }

    public InternshipOffer getOfferById(Long id) {
        return internshipOfferRepository.findById(id).orElse(null);
    }

    public static class UserDTO {
        private Long id;
        private String username;
        private String email;
        private List<String> roles;
        private String profileImage;
        private String cvFile;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        public String getProfileImage() { return profileImage; }
        public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
        public String getCvFile() { return cvFile; }
        public void setCvFile(String cvFile) { this.cvFile = cvFile; }

        @Override
        public String toString() {
            return "UserDTO{id=" + id + ", username='" + username + "', email='" + email + "', cvFile='" + cvFile + "'}";
        }
    }
}