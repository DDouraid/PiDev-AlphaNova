// backend/src/main/java/tn/esprit/gestion_utilisateurs/controllers/AuthController.java
package tn.esprit.gestion_utilisateurs.controllers;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;
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
import tn.esprit.gestion_utilisateurs.security.services.OtpService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;

	@Autowired
	JavaMailSender mailSender;

	@Autowired
	OtpService otpService;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
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
				roles,
				user.getProfileImage(),
				user.getCvFile()));
	}

	@GetMapping("/users")
	public ResponseEntity<PaginatedUserResponse> getAllUsers(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<User> userPage = userRepository.findAll(pageable);
		List<UserDTO> users = userPage.getContent().stream()
				.map(user -> new UserDTO(
						user.getId(),
						user.getUsername(),
						user.getEmail(),
						user.getRoles().stream().map(Role::getName).map(UserRole::name).collect(Collectors.toList()),
						user.getProfileImage(),
						user.getCvFile(),
						user.isBlocked()
				))
				.collect(Collectors.toList());
		return ResponseEntity.ok(new PaginatedUserResponse(
				users,
				userPage.getNumber(),
				userPage.getSize(),
				userPage.getTotalElements(),
				userPage.getTotalPages(),
				userPage.isLast()
		));
	}

	public static class PaginatedUserResponse {
		private List<UserDTO> users;
		private int page;
		private int size;
		private long totalElements;
		private int totalPages;
		private boolean last;

		public PaginatedUserResponse(List<UserDTO> users, int page, int size, long totalElements, int totalPages, boolean last) {
			this.users = users;
			this.page = page;
			this.size = size;
			this.totalElements = totalElements;
			this.totalPages = totalPages;
			this.last = last;
		}

		public List<UserDTO> getUsers() { return users; }
		public int getPage() { return page; }
		public int getSize() { return size; }
		public long getTotalElements() { return totalElements; }
		public int getTotalPages() { return totalPages; }
		public boolean isLast() { return last; }
	}

	public static class UserDTO {
		private Long id;
		private String username;
		private String email;
		private List<String> roles;
		private String profileImage;
		private String cvFile;
		private boolean isBlocked;

		public UserDTO(Long id, String username, String email, List<String> roles, String profileImage, String cvFile, boolean isBlocked) {
			this.id = id;
			this.username = username;
			this.email = email;
			this.roles = roles;
			this.profileImage = profileImage;
			this.cvFile = cvFile;
			this.isBlocked = isBlocked;
		}

		public Long getId() { return id; }
		public String getUsername() { return username; }
		public String getEmail() { return email; }
		public List<String> getRoles() { return roles; }
		public String getProfileImage() { return profileImage; }
		public String getCvFile() { return cvFile; }
		public boolean getIsBlocked() { return isBlocked; }
	}

	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated"));
		}
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		List<String> roles = userDetails.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList());
		User user = userRepository.findByUsername(userDetails.getUsername())
				.orElseThrow(() -> new RuntimeException("User not found"));
		return ResponseEntity.ok(new JwtResponse(
				null,
				userDetails.getId(),
				userDetails.getUsername(),
				userDetails.getEmail(),
				roles,
				user.getProfileImage(),
				user.getCvFile()
		));
	}

	@PostMapping(value = "/signup", consumes = {"multipart/form-data"})
	public ResponseEntity<?> registerUser(
			@Valid @RequestPart("signupRequest") SignupRequest signUpRequest,
			@RequestPart(value = "avatar", required = false) MultipartFile avatar) {
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

		User user = new User(
				signUpRequest.getUsername(),
				signUpRequest.getEmail(),
				encoder.encode(signUpRequest.getPassword())
		);

		Set<String> strRoles = signUpRequest.getRole();
		Set<Role> roles = new HashSet<>();

		if (strRoles == null || strRoles.isEmpty()) {
			Role userRole = roleRepository.findByName(UserRole.STUDENT)
					.orElseThrow(() -> new RuntimeException("Error: Role STUDENT not found."));
			roles.add(userRole);
		} else {
			strRoles.forEach(role -> {
				switch (role.toLowerCase()) {
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

		if (avatar != null && !avatar.isEmpty()) {
			try {
				String uploadDir = "uploads/users/";
				Path uploadPath = Paths.get(uploadDir);
				if (!Files.exists(uploadPath)) {
					Files.createDirectories(uploadPath);
					System.out.println("Created upload directory: " + uploadPath);
				}

				String originalFilename = avatar.getOriginalFilename();
				String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
				String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
				Path filePath = uploadPath.resolve(uniqueFilename);

				Files.copy(avatar.getInputStream(), filePath);
				System.out.println("Avatar image saved to: " + filePath);

				user.setProfileImage(uploadDir + uniqueFilename);
			} catch (Exception e) {
				System.err.println("Error uploading avatar image: " + e.getMessage());
				e.printStackTrace();
				return ResponseEntity.badRequest().body(new MessageResponse("Error uploading avatar image: " + e.getMessage()));
			}
		}

		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}

	@PutMapping("/profile")
	public ResponseEntity<?> updateUserProfile(Authentication authentication, @RequestBody UpdateProfileRequest updateProfileRequest) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated"));
		}

		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		User user = userRepository.findByUsername(userDetails.getUsername())
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (updateProfileRequest.getUsername() != null && !updateProfileRequest.getUsername().isEmpty()) {
			if (userRepository.existsByUsername(updateProfileRequest.getUsername()) && !updateProfileRequest.getUsername().equals(user.getUsername())) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
			}
			user.setUsername(updateProfileRequest.getUsername());
		}

		if (updateProfileRequest.getEmail() != null && !updateProfileRequest.getEmail().isEmpty()) {
			if (userRepository.existsByEmail(updateProfileRequest.getEmail()) && !updateProfileRequest.getEmail().equals(user.getEmail())) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
			}
			user.setEmail(updateProfileRequest.getEmail());
		}

		if (updateProfileRequest.getRoles() != null && !updateProfileRequest.getRoles().isEmpty()) {
			boolean isAdmin = userDetails.getAuthorities().stream()
					.anyMatch(authority -> authority.getAuthority().equals("ADMIN"));
			if (!isAdmin) {
				return ResponseEntity.status(403).body(new MessageResponse("Error: Only admins can update roles"));
			}

			Set<Role> roles = new HashSet<>();
			for (String role : updateProfileRequest.getRoles()) {
				Role userRole = roleRepository.findByName(UserRole.valueOf(role.toUpperCase()))
						.orElseThrow(() -> new RuntimeException("Error: Role " + role + " not found."));
				roles.add(userRole);
			}
			user.setRoles(roles);
		}

		userRepository.save(user);
		return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
	}

	@PostMapping("/profile/image")
	public ResponseEntity<?> uploadProfileImage(Authentication authentication, @RequestParam("image") MultipartFile image) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated"));
		}

		if (image == null || image.isEmpty()) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: No image provided"));
		}

		try {
			String uploadDir = "uploads/users/";
			Path uploadPath = Paths.get(uploadDir);
			if (!Files.exists(uploadPath)) {
				Files.createDirectories(uploadPath);
				System.out.println("Created upload directory: " + uploadPath);
			}

			String originalFilename = image.getOriginalFilename();
			String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
			String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
			Path filePath = uploadPath.resolve(uniqueFilename);

			Files.copy(image.getInputStream(), filePath);
			System.out.println("Image saved to: " + filePath);

			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
			User user = userRepository.findByUsername(userDetails.getUsername())
					.orElseThrow(() -> new RuntimeException("User not found"));
			user.setProfileImage(uploadDir + uniqueFilename);
			userRepository.save(user);

			System.out.println("Updated user profileImage: " + (uploadDir + uniqueFilename));
			System.out.println("User saved: " + user.getUsername() + ", Profile Image: " + user.getProfileImage());

			return ResponseEntity.ok(new MessageResponse("Profile image uploaded successfully!"));
		} catch (Exception e) {
			System.err.println("Error uploading image: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(new MessageResponse("Error uploading image: " + e.getMessage()));
		}
	}

	@PostMapping("/profile/cv")
	public ResponseEntity<?> uploadCV(Authentication authentication, @RequestParam("cv") MultipartFile cv) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated"));
		}

		if (cv == null || cv.isEmpty()) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: No CV file provided"));
		}

		try {
			String uploadDir = "uploads/cvs/";
			Path uploadPath = Paths.get(uploadDir);
			if (!Files.exists(uploadPath)) {
				Files.createDirectories(uploadPath);
				System.out.println("Created upload directory: " + uploadPath);
			}

			String originalFilename = cv.getOriginalFilename();
			String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
			String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
			Path filePath = uploadPath.resolve(uniqueFilename);

			Files.copy(cv.getInputStream(), filePath);
			System.out.println("CV saved to: " + filePath);

			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
			User user = userRepository.findByUsername(userDetails.getUsername())
					.orElseThrow(() -> new RuntimeException("User not found"));
			user.setCvFile(uploadDir + uniqueFilename);
			userRepository.save(user);

			System.out.println("Updated user cvFile: " + (uploadDir + uniqueFilename));
			System.out.println("User saved: " + user.getUsername() + ", CV File: " + user.getCvFile());

			return ResponseEntity.ok(new MessageResponse("CV uploaded successfully!"));
		} catch (Exception e) {
			System.err.println("Error uploading CV: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(new MessageResponse("Error uploading CV: " + e.getMessage()));
		}
	}

	@PostMapping("/request-otp")
	public ResponseEntity<?> requestOtp(@RequestBody ResetPasswordRequest request) {
		String email = request.getEmail();
		User user = userRepository.findByEmail(email).orElse(null);

		if (user == null) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found."));
		}

		String otp = otpService.generateOtp(email);

		try {
			// Create a MimeMessage for HTML email
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(email);
			helper.setSubject("Password Reset OTP - AlphaNova");

			// HTML email content with inline CSS (using a separate string to avoid formatting issues)
			String htmlTemplate = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center; padding: 20px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">AlphaNova</h1>
                                        <p style="color: #e6f0ff; margin: 5px 0 0; font-size: 14px;">Your Trusted Platform</p>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <h2 style="color: #333333; font-size: 20px; margin: 0 0 10px;">Password Reset OTP</h2>
                                        <p style="color: #666666; font-size: 16px; margin: 0 0 20px;">
                                            You have requested to reset your password. Please use the OTP below to proceed.
                                        </p>
                                        <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 6px; padding: 15px; display: inline-block; margin-bottom: 20px;">
                                            <p style="color: #007bff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">{OTP}</p>
                                        </div>
                                        <p style="color: #666666; font-size: 14px; margin: 0 0 20px;">
                                            This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0;">
                                            If you did not request a password reset, please ignore this email or contact support.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center; padding: 15px;">
                                        <p style="color: #666666; font-size: 12px; margin: 0;">
                                            © {YEAR} AlphaNova. All rights reserved.
                                        </p>
                                        <p style="color: #666666; font-size: 12px; margin: 5px 0 0;">
                                            Need help? <a href="mailto:support@alphanova.com" style="color: #007bff; text-decoration: none;">Contact Support</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;

			// Replace placeholders with actual values
			String htmlContent = htmlTemplate
					.replace("{OTP}", otp)
					.replace("{YEAR}", String.valueOf(LocalDateTime.now().getYear()));

			helper.setText(htmlContent, true); // Set HTML content (true indicates HTML)

			// Send the email
			mailSender.send(message);
			System.out.println("OTP sent to " + email + ": " + otp);
			return ResponseEntity.ok(new MessageResponse("OTP sent to your email."));
		} catch (MessagingException e) {
			System.err.println("Error sending OTP email: " + e.getMessage());
			return ResponseEntity.badRequest().body(new MessageResponse("Error sending OTP: " + e.getMessage()));
		}
	}
	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
		String email = request.getEmail();
		String otp = request.getOtp();
		String newPassword = request.getNewPassword();

		if (!otpService.verifyOtp(email, otp)) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired OTP."));
		}

		User user = userRepository.findByEmail(email)
				.orElse(null);

		if (user == null) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found."));
		}

		user.setPassword(encoder.encode(newPassword));
		userRepository.save(user);

		otpService.clearOtp(email);

		return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
	}
}

class UpdateProfileRequest {
	private String username;
	private String email;
	private List<String> roles;

	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public List<String> getRoles() { return roles; }
	public void setRoles(List<String> roles) { this.roles = roles; }
}

class ResetPasswordRequest {
	private String email;
	private String otp;
	private String newPassword;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getOtp() { return otp; }
	public void setOtp(String otp) { this.otp = otp; }
	public String getNewPassword() { return newPassword; }
	public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}