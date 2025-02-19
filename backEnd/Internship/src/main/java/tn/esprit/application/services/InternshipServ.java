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

    public List<Internship> findAll() {
        return internshipRepository.findAll();
    }

    public Optional<Internship> findById(Long id) {
        return internshipRepository.findById(id);
    }

    public Internship save(Internship internship) {
        return internshipRepository.save(internship);
    }

    public Internship update(Internship internship) {return internshipRepository.save(internship); }

    public void delete(Long id) {
        internshipRepository.deleteById(id);
    }

}
