package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.InternshipOffer;
import tn.esprit.application.repositories.InternshipOfferRepo;

import java.util.List;
import java.util.Optional;

@Service
public class InternshipOfferServ {

    @Autowired
    private InternshipOfferRepo internshipOfferRepository;

    public List<InternshipOffer> findAll() {
        return internshipOfferRepository.findAll();
    }

    public Optional<InternshipOffer> findById(Long id) {
        return internshipOfferRepository.findById(id);
    }

    public InternshipOffer save(InternshipOffer internshipOffer) {
        return internshipOfferRepository.save(internshipOffer);
    }

    public InternshipOffer update(InternshipOffer internshipOffer) {
        return internshipOfferRepository.save(internshipOffer);
    }

    public void delete(Long id) {
        internshipOfferRepository.deleteById(id);
    }
}