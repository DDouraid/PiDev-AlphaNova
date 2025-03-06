package tn.esprit.application.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.application.entities.InternshipRequest;
import tn.esprit.application.services.InternshipRequestServ;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/internship-requests")
public class InternshipRequestRest {

    @Autowired
    private InternshipRequestServ internshipRequestService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Get all internship requests
    @GetMapping
    public ResponseEntity<List<InternshipRequest>> getAllInternshipRequests() {
        try {
            List<InternshipRequest> requests = internshipRequestService.findAll();
            System.out.println("Fetched " + requests.size() + " internship requests");
            return new ResponseEntity<>(requests, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching internship requests: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get internship request by ID
    @GetMapping("/{id}")
    public ResponseEntity<InternshipRequest> getInternshipRequestById(@PathVariable Long id) {
        try {
            return internshipRequestService.findById(id)
                    .map(request -> {
                        System.out.println("Fetched internship request with ID: " + id);
                        return new ResponseEntity<>(request, HttpStatus.OK);
                    })
                    .orElseGet(() -> {
                        System.out.println("Internship request with ID " + id + " not found");
                        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                    });
        } catch (Exception e) {
            System.err.println("Error fetching internship request with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all requests by offer ID
    @GetMapping("/by-offer/{offerId}")
    public ResponseEntity<List<InternshipRequest>> getRequestsByOfferId(@PathVariable Long offerId) {
        try {
            List<InternshipRequest> requests = internshipRequestService.findByOfferId(offerId);
            System.out.println("Fetched " + requests.size() + " requests for offer ID: " + offerId);
            return new ResponseEntity<>(requests, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching requests for offer ID " + offerId + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create an internship request with offerId (multipart form data)
    @PostMapping("/{offerId}")
    public ResponseEntity<InternshipRequest> createInternshipRequestWithOffer(
            @PathVariable Long offerId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {
        try {
            System.out.println("Received Internship Request: " + title + " for Offer ID: " + offerId);
            System.out.println("CV received: " + (cv != null ? cv.getOriginalFilename() : "No CV uploaded"));

            InternshipRequest request = new InternshipRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setOfferId(offerId);

            if (cv != null && !cv.isEmpty()) {
                System.out.println("CV is not null and not empty. Original filename: " + cv.getOriginalFilename());
                validateFile(cv);
                String fileName = System.currentTimeMillis() + "_" + cv.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                System.out.println("Saving CV file to: " + filePath.toString());
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, cv.getBytes());
                System.out.println("CV file saved successfully: " + filePath.toString());
                request.setCvPath(fileName);
            } else {
                System.out.println("No CV file provided or CV file is empty.");
                request.setCvPath(null);
            }

            InternshipRequest savedRequest = internshipRequestService.save(request, offerId);
            System.out.println("Saved Internship Request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath());
            return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating internship request: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create an internship request without offerId (multipart form data)
    @PostMapping
    public ResponseEntity<InternshipRequest> createInternshipRequest(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {
        try {
            System.out.println("Received Internship Request: " + title);
            System.out.println("CV received: " + (cv != null ? cv.getOriginalFilename() : "No CV uploaded"));

            InternshipRequest request = new InternshipRequest();
            request.setTitle(title);
            request.setDescription(description);

            if (cv != null && !cv.isEmpty()) {
                System.out.println("CV is not null and not empty. Original filename: " + cv.getOriginalFilename());
                validateFile(cv);
                String fileName = System.currentTimeMillis() + "_" + cv.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                System.out.println("Saving CV file to: " + filePath.toString());
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, cv.getBytes());
                System.out.println("CV file saved successfully: " + filePath.toString());
                request.setCvPath(fileName);
            } else {
                System.out.println("No CV file provided or CV file is empty.");
                request.setCvPath(null);
            }

            InternshipRequest savedRequest = internshipRequestService.save(request);
            System.out.println("Saved Internship Request with ID: " + savedRequest.getId() + ", cvPath: " + savedRequest.getCvPath());
            return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating internship request: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update an internship request (multipart form data to allow CV updates)
    @PutMapping("/{id}")
    public ResponseEntity<InternshipRequest> updateInternshipRequest(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {
        try {
            InternshipRequest existingRequest = internshipRequestService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Internship request not found"));

            existingRequest.setTitle(title);
            existingRequest.setDescription(description);

            if (cv != null && !cv.isEmpty()) {
                validateFile(cv);
                if (existingRequest.getCvPath() != null) {
                    Path oldFilePath = Paths.get(uploadDir, existingRequest.getCvPath());
                    Files.deleteIfExists(oldFilePath);
                }
                String fileName = System.currentTimeMillis() + "_" + cv.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                System.out.println("Saving CV file to: " + filePath.toString());
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, cv.getBytes());
                existingRequest.setCvPath(fileName);
            }

            InternshipRequest updatedRequest = internshipRequestService.update(existingRequest);
            System.out.println("Updated Internship Request with ID: " + updatedRequest.getId());
            return new ResponseEntity<>(updatedRequest, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating internship request: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete an internship request
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternshipRequest(@PathVariable Long id) {
        try {
            InternshipRequest request = internshipRequestService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Internship request not found"));

            if (request.getCvPath() != null) {
                try {
                    Path filePath = Paths.get(uploadDir, request.getCvPath());
                    Files.deleteIfExists(filePath);
                    System.out.println("Deleted CV file: " + filePath.toString());
                } catch (Exception e) {
                    System.err.println("Failed to delete CV file: " + e.getMessage());
                }
            }

            internshipRequestService.delete(id);
            System.out.println("Deleted Internship Request with ID: " + id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            System.err.println("Error deleting internship request: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Download CV file
    @GetMapping("/cv/{fileName}")
    public ResponseEntity<Resource> downloadCv(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            if (!Files.exists(filePath)) {
                System.out.println("CV file not found: " + filePath.toString());
                throw new RuntimeException("File not found: " + fileName);
            }

            Resource resource = new UrlResource(filePath.toUri());
            System.out.println("Serving CV file: " + filePath.toString());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("Error downloading CV: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            String contentType = file.getContentType();
            System.out.println("Validating file: " + file.getOriginalFilename() + ", Content-Type: " + contentType + ", Size: " + file.getSize());
            if (contentType == null || !(
                    contentType.equals("application/pdf") ||
                            contentType.equals("application/msword") ||
                            contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            )) {
                throw new IllegalArgumentException("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
            }
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                throw new IllegalArgumentException("File size exceeds 5MB.");
            }
        }
    }
}