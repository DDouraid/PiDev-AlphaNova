package tn.esprit.application.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.services.InternshipRequestServ;

import java.util.List;
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})@RestController
@RequestMapping("/internship-requests")
public class InternshipRequestRest {

    @Autowired
    private InternshipRequestServ internshipRequestService;

    // Get all internship requests
    @GetMapping
    public ResponseEntity<List<InternshipRequest>> getAllInternshipRequests() {
        return new ResponseEntity<>(internshipRequestService.findAll(), HttpStatus.OK);
    }

    // Get internship request by ID
    @GetMapping("/{id}")
    public ResponseEntity<InternshipRequest> getInternshipRequestById(@PathVariable Long id) {
        return internshipRequestService.findById(id)
                .map(request -> new ResponseEntity<>(request, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create an internship request
    @PostMapping
    public ResponseEntity<InternshipRequest> createInternshipRequest(@RequestBody InternshipRequest request) {
        System.out.println("Received Internship Request: " + request.getTitle());
        InternshipRequest savedRequest = internshipRequestService.save(request);
        return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
    }

    // Update an internship request
    @PutMapping("/{id}")
    public ResponseEntity<InternshipRequest> updateInternshipRequest(@RequestBody InternshipRequest updatedRequest) {
        return new ResponseEntity<>(internshipRequestService.update(updatedRequest), HttpStatus.OK);
    }

    // Delete an internship request
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternshipRequest(@PathVariable Long id) {
        internshipRequestService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}