package tn.esprit.application.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.entities.InternshipOffer;
import tn.esprit.application.services.InternshipOfferServ;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/internship-offers")
public class InternshipOfferRest {

    @Autowired
    private InternshipOfferServ internshipOfferService;

    // Get all internship offers
    @GetMapping
    public ResponseEntity<List<InternshipOffer>> getAllInternshipOffers() {
        return new ResponseEntity<>(internshipOfferService.findAll(), HttpStatus.OK);
    }

    // Get internship offer by ID
    @GetMapping("/{id}")
    public ResponseEntity<InternshipOffer> getInternshipOfferById(@PathVariable Long id) {
        return internshipOfferService.findById(id)
                .map(offer -> new ResponseEntity<>(offer, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create an internship offer
    @PostMapping
    public ResponseEntity<InternshipOffer> createInternshipOffer(@RequestBody InternshipOffer offer) {
        System.out.println("Received Internship Offer: " + offer.getTitle());
        InternshipOffer savedOffer = internshipOfferService.save(offer);
        return new ResponseEntity<>(savedOffer, HttpStatus.CREATED);
    }

    // Update an internship offer
    @PutMapping("/{id}")
    public ResponseEntity<InternshipOffer> updateInternshipOffer(@RequestBody InternshipOffer updatedOffer) {
        return new ResponseEntity<>(internshipOfferService.update(updatedOffer), HttpStatus.OK);
    }

    // Delete an internship offer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternshipOffer(@PathVariable Long id) {
        internshipOfferService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}