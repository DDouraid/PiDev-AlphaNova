package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.repositories.InternshipRequestRepo;

import java.util.List;
import java.util.Optional;

@Service
public class InternshipRequestServ {

    @Autowired
    private InternshipRequestRepo internshipRequestRepository;

    public List<InternshipRequest> findAll() {
        return internshipRequestRepository.findAll();
    }

    public Optional<InternshipRequest> findById(Long id) {
        return internshipRequestRepository.findById(id);
    }

    public InternshipRequest save(InternshipRequest internshipRequest) {
        return internshipRequestRepository.save(internshipRequest);
    }

    public InternshipRequest update(InternshipRequest internshipRequest) {
        return internshipRequestRepository.save(internshipRequest);
    }

    public void delete(Long id) {
        internshipRequestRepository.deleteById(id);
    }
}