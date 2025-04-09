package tn.esprit.gestionmatching.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MatchResponseWithOfferDto {
    @JsonProperty("offerId")
    private Long offerId;

    @JsonProperty("matchScore")
    private Double matchScore;

    @JsonProperty("offerDetails")
    private InternshipOfferDto offerDetails;

    public MatchResponseWithOfferDto(Long offerId, Double matchScore, InternshipOfferDto offerDetails) {
        this.offerId = offerId;
        this.matchScore = matchScore;
        this.offerDetails = offerDetails;
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

    @Override
    public String toString() {
        return "MatchResponseWithOfferDto{offerId=" + offerId + ", matchScore=" + matchScore + ", offerDetails=" + offerDetails + "}";
    }
}