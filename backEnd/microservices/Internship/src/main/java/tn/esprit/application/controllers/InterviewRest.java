package tn.esprit.application.controllers;

import tn.esprit.application.entities.Interview;
import tn.esprit.application.entities.InterviewStatus;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.repositories.InterviewRepo;
import tn.esprit.application.services.EmailSenderService;
import tn.esprit.application.services.InternshipRequestServ;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/interviews")
public class InterviewRest {

    @Autowired
    private InterviewRepo interviewRepo;

    @Autowired
    private InternshipRequestServ internshipRequestServ;

    @Autowired
    private EmailSenderService emailSenderService;

    @PostMapping
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Map<String, Object> payload) {
        Long requestId = null;
        String interviewDateStr = null;
        try {
            requestId = payload.get("requestId") != null ? Long.valueOf(payload.get("requestId").toString()) : null;
            interviewDateStr = payload.get("interviewDate") != null ? payload.get("interviewDate").toString() : null;

            if (requestId == null || interviewDateStr == null) {
                throw new IllegalArgumentException("requestId and interviewDate are required");
            }

            System.out.println("Received request to schedule interview for request ID: " + requestId + " at " + interviewDateStr);
            LocalDateTime interviewDate = LocalDateTime.parse(interviewDateStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            InternshipRequest request = internshipRequestServ.getInternshipRequestById(requestId);
            Interview interview = new Interview();
            interview.setInternshipRequest(request);
            interview.setInterviewDate(interviewDate);
            interview.setStatus(InterviewStatus.SCHEDULED);
            Interview savedInterview = interviewRepo.save(interview);

            // Send email for scheduling
            String userName = request.getEmail().split("@")[0];
            emailSenderService.sendInterviewEmail(
                    request.getEmail(),
                    "Interview Scheduled",
                    userName,
                    "Your interview is scheduled for " + interviewDate.toLocalDate()
            );
            System.out.println("Interview scheduled with ID: " + savedInterview.getId() + " and email sent");
            return new ResponseEntity<>(savedInterview, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error scheduling interview for request ID " + (requestId != null ? requestId : "unknown") + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<Iterable<Interview>> getInterviews() {
        try {
            Iterable<Interview> interviews = interviewRepo.findAll();
            System.out.println("Fetched " + ((Iterable<?>) interviews).spliterator().getExactSizeIfKnown() + " interviews");
            return new ResponseEntity<>(interviews, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching interviews: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterviewStatus(@PathVariable Long id, @RequestParam InterviewStatus status) {
        try {
            System.out.println("Received request to update interview status for ID: " + id + " to " + status);
            Optional<Interview> interviewOpt = interviewRepo.findById(id);
            if (interviewOpt.isPresent()) {
                Interview interview = interviewOpt.get();
                interview.setStatus(status);
                Interview updatedInterview = interviewRepo.save(interview);
                InternshipRequest request = interview.getInternshipRequest();
                String userName = request.getEmail().split("@")[0];
                String message = String.format("Your interview scheduled for %s has been %s. %s",
                        interview.getInterviewDate().toLocalDate(),
                        status.toString().toLowerCase(),
                        status == InterviewStatus.ACCEPTED ? "We look forward to meeting you!" : "We appreciate your interest, but we will not proceed further");
                emailSenderService.sendInterviewEmail(
                        request.getEmail(),
                        status == InterviewStatus.ACCEPTED ? "Interview Accepted" : "Interview Rejected",
                        userName,
                        message
                );
                System.out.println("Updated interview status for ID: " + id + " to " + status + " and email sent");
                return new ResponseEntity<>(updatedInterview, HttpStatus.OK);
            }
            throw new RuntimeException("Interview not found");
        } catch (Exception e) {
            System.err.println("Error updating interview status for ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/email")
    public ResponseEntity<String> sendInterviewEmail(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String interviewDate = payload.get("interviewDate");
            Optional<Interview> interviewOpt = interviewRepo.findById(id);
            if (interviewOpt.isEmpty()) {
                return new ResponseEntity<>("Interview not found", HttpStatus.NOT_FOUND);
            }
            Interview interview = interviewOpt.get();
            String email = interview.getInternshipRequest().getEmail();
            emailSenderService.sendInterviewEmail(email, "Interview " + status,
                    email.split("@")[0],
                    status.equals("SCHEDULED") ? "Your interview is scheduled for " + interviewDate :
                            "Your interview has been " + status.toLowerCase());
            return new ResponseEntity<>("Email sent", HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error sending email for interview ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}