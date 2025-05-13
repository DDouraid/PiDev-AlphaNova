package com.example.interview.controllers;

import com.example.interview.Clients.UserServiceClient;
import com.example.interview.DTO.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.interview.entities.Interview;
import com.example.interview.services.InterviewService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:4200")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewService.getAllInterviews();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable Long id) {
        Optional<Interview> interview = interviewService.getInterviewById(id);
        return interview.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/addInter")
    public Interview createInterview(@RequestBody Interview interview, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        interview.setUserId(user.getId());
        interview.setUsername(user.getUsername());
        System.out.println("Received Interview: " + interview);
        if (interview.getId() != null && interview.getId() == 0) {
            interview.setId(null); // Ensure new entity has null ID
        }
        return interviewService.saveInterview(interview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}