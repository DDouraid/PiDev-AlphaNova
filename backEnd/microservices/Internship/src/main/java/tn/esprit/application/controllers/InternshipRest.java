package tn.esprit.application.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.services.InternshipServ;

import java.util.List;

@RestController
@RequestMapping("/internships")
public class InternshipRest {

    @Autowired
    private InternshipServ internshipService;

    // Get all internships
    @GetMapping
    public ResponseEntity<List<Internship>> getAllInternships() {
        return new ResponseEntity<>(internshipService.findAll(), HttpStatus.OK);
    }

    // Get internship by ID
    @GetMapping("/{id}")
    public ResponseEntity<Internship> getInternshipById(@PathVariable Long id) {
        return internshipService.findById(id)
                .map(internship -> new ResponseEntity<>(internship, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create an internship
    @PostMapping
    public ResponseEntity<Internship> createInternship(@RequestBody Internship internship) {
        System.out.println("Received Internship: " + internship.getTitle());
        Internship savedInternship = internshipService.save(internship);
        return new ResponseEntity<>(savedInternship, HttpStatus.CREATED);
    }


    // Update an internship
    @PutMapping("/{id}")
    public ResponseEntity<Internship> updateInternship( @RequestBody Internship updatedInternship) {
        return new ResponseEntity<>(internshipService.update(updatedInternship), HttpStatus.OK);
    }

    // Delete an internship
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
