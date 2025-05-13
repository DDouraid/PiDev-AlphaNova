package tn.esprit.gestionmatching.dto;

import java.util.List;

public class AdmissionPredictionDTO {
    private String admitted;
    private Double probability;
    private String recommendedUniversity;
    private Integer cluster;
    private List<String> advice;  // New field for advice

    public String getAdmitted() {
        return admitted;
    }

    public void setAdmitted(String admitted) {
        this.admitted = admitted;
    }

    public Double getProbability() {
        return probability;
    }

    public void setProbability(Double probability) {
        this.probability = probability;
    }

    public String getRecommendedUniversity() {
        return recommendedUniversity;
    }

    public void setRecommendedUniversity(String recommendedUniversity) {
        this.recommendedUniversity = recommendedUniversity;
    }

    public Integer getCluster() {
        return cluster;
    }

    public void setCluster(Integer cluster) {
        this.cluster = cluster;
    }

    public List<String> getAdvice() {
        return advice;
    }

    public void setAdvice(List<String> advice) {
        this.advice = advice;
    }

    @Override
    public String toString() {
        return "AdmissionPredictionDTO{admitted='" + admitted + "', probability=" + probability +
                ", recommendedUniversity='" + recommendedUniversity + "', cluster=" + cluster +
                ", advice=" + advice + "}";
    }
}