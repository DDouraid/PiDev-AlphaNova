package tn.esprit.application.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.entities.InternStatus;
import tn.esprit.application.services.InternshipServ;

import java.util.Date;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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
    public ResponseEntity<Internship> updateInternship(@PathVariable Long id, @RequestBody Internship updatedInternship) {
        updatedInternship.setId(id); // Ensure the ID is set
        return new ResponseEntity<>(internshipService.update(updatedInternship), HttpStatus.OK);
    }

    // Delete an internship
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // New endpoint to update status and end date
    @PutMapping("/{id}/status-end-date")
    public ResponseEntity<Internship> updateStatusAndEndDate(
            @PathVariable Long id,
            @RequestParam("status") InternStatus status,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        try {
            Internship updatedInternship = internshipService.updateStatusAndEndDate(id, status, endDate);
            return new ResponseEntity<>(updatedInternship, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}