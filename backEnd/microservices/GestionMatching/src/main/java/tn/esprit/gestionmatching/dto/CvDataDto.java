package tn.esprit.gestionmatching.dto;

import lombok.Data;

import java.util.List;

@Data
public class CvDataDto {
    private Long userId;
    private List<String> skills;
    private List<EducationDto> education;
    private List<CertificationDto> certifications;

    // Admission prediction features
    private Double greScore;
    private Double toeflScore;
    private Double universityRating;
    private Double sop;
    private Double lor;
    private Double cgpa;
    private Integer research;

    @Data
    public static class EducationDto {
        private String degree;
        private String institution;
        private String year;
    }

    @Data
    public static class CertificationDto {
        private String name;
        private String issuer;
        private String issueDate;
    }
}