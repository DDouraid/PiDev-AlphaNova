package tn.esprit.application.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.repositories.InternshipRepo;


import java.util.List;
import java.util.Optional;
@Service
public class InternshipServ {
    @Autowired
    private InternshipRepo internshipRepository;

    // Get all internships
    public List<Internship> findAll() {
        return internshipRepository.findAll();
    }

    // Get internship by ID
    public Optional<Internship> findById(Long id) {
        return internshipRepository.findById(id);
    }

    // Create an internship
    public Internship save(Internship internship) {
        return internshipRepository.save(internship);
    }

    // Update an internship
    public Optional<Internship> update(Long id, Internship updatedInternship) {
        return internshipRepository.findById(id).map(existingInternship -> {
            existingInternship.setTitle(updatedInternship.getTitle());
            existingInternship.setDescription(updatedInternship.getDescription());
            existingInternship.setStartDate(updatedInternship.getStartDate());
            existingInternship.setEndDate(updatedInternship.getEndDate());
            existingInternship.setStatus(updatedInternship.getStatus());
            return internshipRepository.save(existingInternship);
        });
    }

    // Delete an internship
    public void delete(Long id) {
        internshipRepository.deleteById(id);
    }

}
