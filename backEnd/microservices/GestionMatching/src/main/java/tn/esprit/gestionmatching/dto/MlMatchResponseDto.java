package tn.esprit.gestionmatching.dto;



public class MlMatchResponseDto {
    private Long offerId;
    private Double matchScore;

    public MlMatchResponseDto(Long offerId, Double matchScore) {
        this.offerId = offerId;
        this.matchScore = matchScore;
    }

    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    @Override
    public String toString() {
        return "MlMatchResponseDto{offerId=" + offerId + ", matchScore=" + matchScore + "}";
    }
}