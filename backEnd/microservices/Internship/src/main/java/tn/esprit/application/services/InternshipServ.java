package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.entities.InternStatus;
import tn.esprit.application.repositories.InternshipRepo;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InternshipServ {

    @Autowired
    private InternshipRepo internshipRepository;

    public List<Internship> findAll() {
        return internshipRepository.findAll();
    }

    public Optional<Internship> findById(Long id) {
        return internshipRepository.findById(id);
    }

    public Internship save(Internship internship) {
        return internshipRepository.save(internship);
    }

    public Internship update(Internship internship) {
        return internshipRepository.save(internship);
    }

    public void delete(Long id) {
        internshipRepository.deleteById(id);
    }

    // New method to update status and end date
    public Internship updateStatusAndEndDate(Long id, InternStatus status, Date endDate) {
        Optional<Internship> optionalInternship = internshipRepository.findById(id);
        if (optionalInternship.isEmpty()) {
            throw new RuntimeException("Internship with ID " + id + " not found");
        }

        Internship internship = optionalInternship.get();
        internship.setStatus(status);
        internship.setEndDate(endDate);
        return internshipRepository.save(internship);
    }
}