package tn.esprit.gestion_utilisateurs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestion_utilisateurs.models.Role;
import tn.esprit.gestion_utilisateurs.models.User;
import tn.esprit.gestion_utilisateurs.models.UserRole;
import tn.esprit.gestion_utilisateurs.payload.response.MessageResponse;
import tn.esprit.gestion_utilisateurs.repository.RoleRepository;
import tn.esprit.gestion_utilisateurs.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    // Get All Users with timestamp to prevent caching
    @GetMapping("/users")
   // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        logger.debug("Fetching all users with timestamp: {}", System.currentTimeMillis());
        List<UserDTO> users = userRepository.findAll().stream()
                .map(user -> {
                    logger.debug("User {} isBlocked: {}", user.getUsername(), user.isBlocked());
                    return new UserDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRoles().stream().map(Role::getName).map(UserRole::name).collect(Collectors.toList()),
                            user.isBlocked()
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Update User
    @PutMapping("/users/{id}")
  //  @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        Set<Role> roles = userDTO.getRoles().stream()
                .map(role -> roleRepository.findByName(UserRole.valueOf(role)))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    // Block/Unblock User
    @PutMapping("/users/{id}/block")
   // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> blockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        boolean previousBlocked = user.isBlocked();
        user.setBlocked(!user.isBlocked()); // Toggle blocked status
        userRepository.save(user);
        logger.debug("User {} blocked status toggled from {} to {}", user.getUsername(), previousBlocked, user.isBlocked());
        String message = user.isBlocked() ? "User blocked successfully!" : "User unblocked successfully!";
        return ResponseEntity.ok(new MessageResponse(message));
    }

    // UserDTO class
    public static class UserDTO {
        private Long id;
        private String username;
        private String email;
        private List<String> roles;
        private boolean isBlocked;

        public UserDTO(Long id, String username, String email, List<String> roles, boolean isBlocked) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.roles = roles;
            this.isBlocked = isBlocked;
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public List<String> getRoles() { return roles; }
        public boolean isBlocked() { return isBlocked; }

        // Setters (for update)
        public void setUsername(String username) { this.username = username; }
        public void setEmail(String email) { this.email = email; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        public void setBlocked(boolean isBlocked) { this.isBlocked = isBlocked; }
    }
}