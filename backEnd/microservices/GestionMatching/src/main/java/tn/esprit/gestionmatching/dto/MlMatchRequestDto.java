package tn.esprit.gestionmatching.dto;

import lombok.Data;

import java.util.List;

@Data
public class MlMatchRequestDto {
    private CvDataDto cv;
    private List<InternshipOfferDto> offers;

    public CvDataDto getCv() {
        return cv;
    }

    public void setCv(CvDataDto cv) {
        this.cv = cv;
    }

    public List<InternshipOfferDto> getOffers() {
        return offers;
    }

    public void setOffers(List<InternshipOfferDto> offers) {
        this.offers = offers;
    }
}