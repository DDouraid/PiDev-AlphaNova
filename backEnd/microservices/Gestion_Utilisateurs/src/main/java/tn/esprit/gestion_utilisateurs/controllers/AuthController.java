package tn.esprit.gestion_utilisateurs.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import tn.esprit.gestion_utilisateurs.models.Role;
import tn.esprit.gestion_utilisateurs.models.User;
import tn.esprit.gestion_utilisateurs.models.UserRole;
import tn.esprit.gestion_utilisateurs.payload.request.LoginRequest;
import tn.esprit.gestion_utilisateurs.payload.request.SignupRequest;
import tn.esprit.gestion_utilisateurs.payload.response.JwtResponse;
import tn.esprit.gestion_utilisateurs.payload.response.MessageResponse;
import tn.esprit.gestion_utilisateurs.repository.RoleRepository;
import tn.esprit.gestion_utilisateurs.repository.UserRepository;
import tn.esprit.gestion_utilisateurs.security.jwt.JwtUtils;
import tn.esprit.gestion_utilisateurs.security.services.UserDetailsImpl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;
  ///
	@Autowired
	UserRepository userRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
		// Authenticate user
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = jwtUtils.generateJwtToken(authentication);

		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		User user = userRepository.findByUsername(userDetails.getUsername())
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (user.isBlocked()) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Login failed: Your account has been blocked. Contact support for assistance."));
		}

		List<String> roles = userDetails.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList());

		return ResponseEntity.ok(new JwtResponse(jwt,
				userDetails.getId(),
				userDetails.getUsername(),
				userDetails.getEmail(),
				roles));
	}

	@GetMapping("/users")
	 // Restrict to admins only
	public ResponseEntity<List<UserDTO>> getAllUsers() {
		List<UserDTO> users = userRepository.findAll().stream()
				.map(user -> new UserDTO(
						user.getId(),
						user.getUsername(),
						user.getEmail(),
						user.getRoles().stream().map(Role::getName).map(UserRole::name).collect(Collectors.toList())
				))
				.collect(Collectors.toList());
		return ResponseEntity.ok(users);
	}

	// DTO to match frontend expectations
	public static class UserDTO {
		private Long id;
		private String username;
		private String email;
		private List<String> roles;

		public UserDTO(Long id, String username, String email, List<String> roles) {
			this.id = id;
			this.username = username;
			this.email = email;
			this.roles = roles;
		}

		// Getters
		public Long getId() { return id; }
		public String getUsername() { return username; }
		public String getEmail() { return email; }
		public List<String> getRoles() { return roles; }}

	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated"));
		}
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		List<String> roles = userDetails.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList());
		return ResponseEntity.ok(new JwtResponse(null, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), roles));
	}

	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
		if (userRepository.existsByUsername(signUpRequest.getUsername())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Username is already taken!"));
		}

		if (userRepository.existsByEmail(signUpRequest.getEmail())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Email is already in use!"));
		}

		// Create new user's account
		User user = new User(
				signUpRequest.getUsername(),
				signUpRequest.getEmail(),
				encoder.encode(signUpRequest.getPassword())
		);

		Set<String> strRoles = signUpRequest.getRole();
		Set<Role> roles = new HashSet<>();

		if (strRoles == null || strRoles.isEmpty()) {
			// Default role: STUDENT
			Role userRole = roleRepository.findByName(UserRole.STUDENT)
					.orElseThrow(() -> new RuntimeException("Error: Role STUDENT not found."));
			roles.add(userRole);
		} else {
			strRoles.forEach(role -> {
				switch (role.toLowerCase()) { // Convert to lowercase to avoid case sensitivity issues
					case "admin":
						Role adminRole = roleRepository.findByName(UserRole.ADMIN)
								.orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found."));
						roles.add(adminRole);
						break;

					case "company":
						Role companyRole = roleRepository.findByName(UserRole.COMPANY)
								.orElseThrow(() -> new RuntimeException("Error: Role COMPANY not found."));
						roles.add(companyRole);
						break;

					case "academic_supervisor":
						Role academicRole = roleRepository.findByName(UserRole.ACADEMIC_SUPERVISOR)
								.orElseThrow(() -> new RuntimeException("Error: Role ACADEMIC_SUPERVISOR not found."));
						roles.add(academicRole);
						break;

					default:
						Role studentRole = roleRepository.findByName(UserRole.STUDENT)
								.orElseThrow(() -> new RuntimeException("Error: Role STUDENT not found."));
						roles.add(studentRole);
						break;
				}
			});
		}

		user.setRoles(roles);
		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}
}
