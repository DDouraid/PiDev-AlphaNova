package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.entities.InternshipOffer;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.entities.InternStatus;
import tn.esprit.application.repositories.InternshipOfferRepo;
import tn.esprit.application.repositories.InternshipRepo;
import tn.esprit.application.repositories.InternshipRequestRepo;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InternshipRequestServ {

    @Autowired
    private InternshipRequestRepo internshipRequestRepository;

    @Autowired
    private InternshipRepo internshipRepository;

    @Autowired
    private InternshipOfferRepo internshipOfferRepository;

    public List<InternshipRequest> findAll() {
        try {
            List<InternshipRequest> requests = internshipRequestRepository.findAll();
            System.out.println("Fetched " + requests.size() + " internship requests");
            return requests;
        } catch (Exception e) {
            System.err.println("Error fetching internship requests: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch internship requests", e);
        }
    }

    public Optional<InternshipRequest> findById(Long id) {
        try {
            Optional<InternshipRequest> request = internshipRequestRepository.findById(id);
            if (request.isPresent()) {
                System.out.println("Found internship request with ID: " + id);
            } else {
                System.out.println("Internship request with ID " + id + " not found");
            }
            return request;
        } catch (Exception e) {
            System.err.println("Error finding internship request with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to find internship request", e);
        }
    }

    public List<InternshipRequest> findByOfferId(Long offerId) {
        try {
            List<InternshipRequest> requests = internshipRequestRepository.findByOfferId(offerId);
            System.out.println("Fetched " + requests.size() + " internship requests for offer ID: " + offerId);
            return requests;
        } catch (Exception e) {
            System.err.println("Error fetching internship requests for offer ID " + offerId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch internship requests for offer ID " + offerId, e);
        }
    }

    public InternshipRequest save(InternshipRequest internshipRequest, Long offerId) {
        try {
            // Validate the internship offer exists
            Optional<InternshipOffer> offerOptional = internshipOfferRepository.findById(offerId);
            if (offerOptional.isEmpty()) {
                System.out.println("Internship offer with ID " + offerId + " not found");
                throw new RuntimeException("Internship offer with ID " + offerId + " not found");
            }
            InternshipOffer offer = offerOptional.get();
            System.out.println("Found internship offer with ID: " + offerId);

            // Set the offerId on the request
            internshipRequest.setOfferId(offerId);
            // Note: We are NOT setting the type here; it should already be set by the frontend

            // Save the internship request
            InternshipRequest savedRequest = internshipRequestRepository.save(internshipRequest);
            System.out.println("Saved internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType());

            // Create a new internship record linking the request and offer
            Internship internship = new Internship();
            internship.setTitle("Internship for " + internshipRequest.getTitle());
            internship.setDescription("Created from request ID " + savedRequest.getId() + " for offer ID " + offerId);
            internship.setStartDate(new Date());
            internship.setEndDate(null);
            internship.setStatus(InternStatus.IN_PROGRESS);
            internship.setInternshipOffer(offer);
            internship.setInternshipRequest(savedRequest);

            // Save the internship record
            internshipRepository.save(internship);
            System.out.println("Created internship for request ID: " + savedRequest.getId());

            // Update the bidirectional relationship
            savedRequest.setInternship(internship);

            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error saving internship request with offerId " + offerId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save internship request", e);
        }
    }

    public InternshipRequest save(InternshipRequest internshipRequest) {
        try {
            // Note: We are NOT setting the type here; it should already be set by the frontend
            InternshipRequest savedRequest = internshipRequestRepository.save(internshipRequest);
            System.out.println("Saved internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType());
            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error saving internship request: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save internship request", e);
        }
    }

    public InternshipRequest update(InternshipRequest updatedRequest) {
        try {
            InternshipRequest existingRequest = internshipRequestRepository.findById(updatedRequest.getId())
                    .orElseThrow(() -> {
                        System.out.println("Internship request with ID " + updatedRequest.getId() + " not found");
                        return new RuntimeException("Internship request with ID " + updatedRequest.getId() + " not found");
                    });

            existingRequest.setTitle(updatedRequest.getTitle());
            existingRequest.setDescription(updatedRequest.getDescription());
            existingRequest.setCvPath(updatedRequest.getCvPath());
            existingRequest.setEmail(updatedRequest.getEmail());
            existingRequest.setType(updatedRequest.getType()); // Update the type field

            InternshipRequest savedRequest = internshipRequestRepository.save(existingRequest);
            System.out.println("Updated internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType());
            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error updating internship request with ID " + updatedRequest.getId() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update internship request", e);
        }
    }

    public void delete(Long id) {
        try {
            InternshipRequest request = internshipRequestRepository.findById(id)
                    .orElseThrow(() -> {
                        System.out.println("Internship request with ID " + id + " not found");
                        return new RuntimeException("Internship request with ID " + id + " not found");
                    });

            Internship associatedInternship = request.getInternship();
            if (associatedInternship != null) {
                associatedInternship.setInternshipRequest(null);
                internshipRepository.save(associatedInternship);
                System.out.println("Cleared internship association for request ID: " + id);
            }

            internshipRequestRepository.deleteById(id);
            System.out.println("Deleted internship request with ID: " + id);
        } catch (Exception e) {
            System.err.println("Error deleting internship request with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete internship request", e);
        }
    }
}