package tn.esprit.gestionmatching.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MatchResponseWithOfferDto {
    @JsonProperty("offerId")
    private Long offerId;

    @JsonProperty("matchScore")
    private Double matchScore;

    @JsonProperty("offerDetails")
    private InternshipOfferDto offerDetails;

    @JsonProperty("admissionPrediction")
    private AdmissionPredictionDTO admissionPrediction; // Added field for admission prediction

    public MatchResponseWithOfferDto(Long offerId, Double matchScore, InternshipOfferDto offerDetails) {
        this.offerId = offerId;
        this.matchScore = matchScore;
        this.offerDetails = offerDetails;
    }

    public MatchResponseWithOfferDto() {
        // Default constructor for Jackson deserialization
    }

    // Getters and Setters
    public Long getOfferId() {
        return offerId;
    }

    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public InternshipOfferDto getOfferDetails() {
        return offerDetails;
    }

    public void setOfferDetails(InternshipOfferDto offerDetails) {
        this.offerDetails = offerDetails;
    }

    public AdmissionPredictionDTO getAdmissionPrediction() {
        return admissionPrediction;
    }

    public void setAdmissionPrediction(AdmissionPredictionDTO admissionPrediction) {
        this.admissionPrediction = admissionPrediction;
    }

    @Override
    public String toString() {
        return "MatchResponseWithOfferDto{" +
                "offerId=" + offerId +
                ", matchScore=" + matchScore +
                ", offerDetails=" + offerDetails +
                ", admissionPrediction=" + admissionPrediction +
                "}";
    }
}