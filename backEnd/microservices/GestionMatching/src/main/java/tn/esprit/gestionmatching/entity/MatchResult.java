package tn.esprit.gestionmatching.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "match_results")
public class MatchResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "internship_offer_id", nullable = false)
    private Long internshipOfferId;

    @Column(name = "match_score")
    private Double matchScore;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getInternshipOfferId() { return internshipOfferId; }
    public void setInternshipOfferId(Long internshipOfferId) { this.internshipOfferId = internshipOfferId; }
    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    @Override
    public String toString() {
        return "MatchResult{id=" + id + ", userId=" + userId + ", internshipOfferId=" + internshipOfferId + ", matchScore=" + matchScore + "}";
    }
}