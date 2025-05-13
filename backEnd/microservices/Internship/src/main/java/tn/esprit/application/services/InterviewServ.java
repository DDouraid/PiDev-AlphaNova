package tn.esprit.application.services;

import tn.esprit.application.entities.Interview;
import tn.esprit.application.entities.InterviewStatus;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.repositories.InterviewRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class InterviewServ {

    private final InterviewRepo interviewRepo;
    private final EmailSenderService emailSenderService;

    @Autowired
    public InterviewServ(InterviewRepo interviewRepo, EmailSenderService emailSenderService) {
        this.interviewRepo = interviewRepo;
        this.emailSenderService = emailSenderService;
    }

    public Interview scheduleInterview(Long requestId, LocalDateTime interviewDate, InternshipRequest request) {
        Interview interview = new Interview();
        interview.setInternshipRequest(request);
        interview.setInterviewDate(interviewDate);
        interview.setStatus(InterviewStatus.SCHEDULED);

        Interview savedInterview = interviewRepo.save(interview);
        // Removed email sending logic
        return savedInterview;
    }

    public Interview updateInterviewStatus(Long interviewId, InterviewStatus status) {
        Optional<Interview> interviewOpt = interviewRepo.findById(interviewId);
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
            try {
                emailSenderService.sendInterviewEmail(
                        request.getEmail(),
                        status == InterviewStatus.ACCEPTED ? "Interview Accepted" : "Interview Rejected",
                        userName,
                        message
                );
            } catch (MessagingException e) {
                System.err.println("Failed to send interview status update email for interview ID " + interviewId + ": " + e.getMessage());
            }
            return updatedInterview;
        }
        throw new RuntimeException("Interview not found");
    }

    public Iterable<Interview> getAllInterviews() {
        return interviewRepo.findAll();
    }
}