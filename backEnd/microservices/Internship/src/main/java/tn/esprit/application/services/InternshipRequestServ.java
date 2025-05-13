package tn.esprit.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.application.entities.Internship;
import tn.esprit.application.entities.InternshipOffer;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.entities.InternStatus;
import tn.esprit.application.entities.RequestStatus;
import tn.esprit.application.repositories.InternshipOfferRepo;
import tn.esprit.application.repositories.InternshipRepo;
import tn.esprit.application.repositories.InternshipRequestRepo;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InternshipRequestServ {

    private final InternshipRequestRepo internshipRequestRepository;
    private final InternshipRepo internshipRepository;
    private final InternshipOfferRepo internshipOfferRepository;
    private final InterviewServ interviewServ;
    private final EmailSenderService emailSenderService;

    @Autowired
    public InternshipRequestServ(InternshipRequestRepo internshipRequestRepository, InternshipRepo internshipRepository,
                                 InternshipOfferRepo internshipOfferRepository, InterviewServ interviewServ,
                                 EmailSenderService emailSenderService) {
        this.internshipRequestRepository = internshipRequestRepository;
        this.internshipRepository = internshipRepository;
        this.internshipOfferRepository = internshipOfferRepository;
        this.interviewServ = interviewServ;
        this.emailSenderService = emailSenderService;
    }

    public InternshipRequest updateInternshipRequestStatus(Long id, String status) {
        InternshipRequest request = internshipRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        try {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            request.setStatus(requestStatus);
            InternshipRequest updatedRequest = internshipRequestRepository.save(request);
            if (requestStatus == RequestStatus.ACCEPTED) {
                // Pass the interview date from the frontend instead of using a fixed value
                // This will be handled by the InterviewService in the frontend
            }
            return updatedRequest;
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid status value: " + status + " for request ID " + id + ": " + e.getMessage());
            throw new RuntimeException("Invalid status value: " + status, e);
        } catch (Exception e) {
            System.err.println("Error updating status for request ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update internship request status", e);
        }
    }

    public InternshipRequest getInternshipRequestById(Long id) {
        return internshipRequestRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("Internship request with ID " + id + " not found");
                    return new RuntimeException("Internship request with ID " + id + " not found");
                });
    }

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
            Optional<InternshipOffer> offerOptional = internshipOfferRepository.findById(offerId);
            if (offerOptional.isEmpty()) {
                System.out.println("Internship offer with ID " + offerId + " not found");
                throw new RuntimeException("Internship offer with ID " + offerId + " not found");
            }
            InternshipOffer offer = offerOptional.get();
            System.out.println("Found internship offer with ID: " + offerId);

            internshipRequest.setOfferId(offerId);
            InternshipRequest savedRequest = internshipRequestRepository.save(internshipRequest);
            System.out.println("Saved internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType());

            Internship internship = new Internship();
            internship.setTitle("Internship for " + internshipRequest.getTitle());
            internship.setDescription("Internship for offer ID " + offerId);
            internship.setStartDate(new Date());
            internship.setEndDate(null);
            internship.setStatus(InternStatus.IN_PROGRESS);
            internship.setInternshipOffer(offer);
            internship.setInternshipRequest(savedRequest);

            internshipRepository.save(internship);

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
            InternshipRequest savedRequest = internshipRequestRepository.save(internshipRequest);
            System.out.println("Saved internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType());

            Internship internship = new Internship();
            internship.setTitle("Internship for " + internshipRequest.getTitle());
            internship.setDescription("Spontaneous request ID " + savedRequest.getId());
            internship.setStartDate(new Date());
            internship.setEndDate(null);
            internship.setStatus(InternStatus.IN_PROGRESS);
            internship.setInternshipOffer(null);
            internship.setInternshipRequest(savedRequest);

            internshipRepository.save(internship);

            savedRequest.setInternship(internship);
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
            existingRequest.setType(updatedRequest.getType());
            existingRequest.setStatus(updatedRequest.getStatus());

            InternshipRequest savedRequest = internshipRequestRepository.save(existingRequest);
            System.out.println("Updated internship request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath() + ", type: " + savedRequest.getType() + ", status: " + savedRequest.getStatus());
            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error updating internship request with ID " + updatedRequest.getId() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update internship request", e);
        }
    }

    public InternshipRequest updateStatus(Long id, RequestStatus status) {
        try {
            InternshipRequest existingRequest = internshipRequestRepository.findById(id)
                    .orElseThrow(() -> {
                        System.out.println("Internship request with ID " + id + " not found");
                        return new RuntimeException("Internship request with ID " + id + " not found");
                    });

            existingRequest.setStatus(status);
            InternshipRequest savedRequest = internshipRequestRepository.save(existingRequest);
            System.out.println("Updated status of internship request with ID: " + savedRequest.getId() + " to " + status);

            if (status == RequestStatus.ACCEPTED || status == RequestStatus.REJECTED) {
                String email = savedRequest.getEmail();
                if (email != null && !email.isEmpty()) {
                    String subject = status == RequestStatus.ACCEPTED
                            ? "Internship Request Accepted"
                            : "Interview Request Rejected";
                    String title = status == RequestStatus.ACCEPTED
                            ? "Your Internship Request Has Been Accepted!"
                            : "Your Internship Request Has Been Rejected";
                    String message = status == RequestStatus.ACCEPTED
                            ? "We are pleased to inform you that your internship request titled <strong>" + savedRequest.getTitle() + "</strong> has been accepted.<br>" +
                            "Start Date: " + savedRequest.getInternship().getStartDate() + "<br>" +
                            "End Date: " + (savedRequest.getInternship().getEndDate() != null ? savedRequest.getInternship().getEndDate() : "TBD") + "<br>" +
                            "Please contact us for the next steps."
                            : "We regret to inform you that your internship request titled <strong>" + savedRequest.getTitle() + "</strong> has been rejected.<br>" +
                            "Thank you for your interest. We encourage you to apply for other opportunities.";
                    try {
                        emailSenderService.sendSimpleEmail(email, subject, title, message);
                    } catch (Exception e) {
                        System.err.println("Failed to send email for internship request ID " + id + ": " + e.getMessage());
                    }
                } else {
                    System.out.println("No email address found for internship request ID: " + id);
                }
            }

            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error updating status of internship request with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update status of internship request", e);
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