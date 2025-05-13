// backend/src/main/java/tn/esprit/gestion_utilisateurs/controllers/AuthController.java
package tn.esprit.gestion_utilisateurs.controllers;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.client.RestTemplate;
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
import java.util.*;
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
    @Autowired
    private RestTemplate restTemplate;

	@GetMapping("/users/{userId}")
	public ResponseEntity<Object> checkUserExists(@PathVariable Long userId) {
		return userRepository.findById(userId)
				.map(user -> ResponseEntity.ok().build())
				.orElse(ResponseEntity.notFound().build());
	}
	@GetMapping("/users/by-username/{username}")
	public ResponseEntity<Map<String, Object>> getUserByUsername(@PathVariable String username) {
		return userRepository.findByUsername(username)
				.map(user -> {
					Map<String, Object> response = new HashMap<>();
					response.put("id", user.getId());
					response.put("username", user.getUsername());
					return ResponseEntity.ok(response);
				})
				.orElse(ResponseEntity.notFound().build());
	}

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
//////////////////////////////////////////////////////////////////////////////////////////////////////
@PostMapping("/profile/CVtoBack")
public ResponseEntity<?> CVtoBack(Authentication authentication, @RequestParam("cv") MultipartFile cv) {
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
		return ResponseEntity.ok(new MessageResponse("CV uploaded successfully!"));
	} catch (Exception e) {
		System.err.println("Error uploading CV: " + e.getMessage());
		e.printStackTrace();
		return ResponseEntity.badRequest().body(new MessageResponse("Error uploading CV: " + e.getMessage()));
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////

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
//////////////////////////////////////////////////////////////////////////////////////////////////////



	@PostMapping("/linkedin-callback")
	public ResponseEntity<?> handleLinkedInCallback(@RequestParam("code") String code) {
		try {
			// LinkedIn OAuth configuration
			String clientId = "77ip9kskqvd40o"; // Replace with your Client ID
			String clientSecret = "WPL_AP1.Z1a6JQLTfKtXxjNn.qBSgiw=="; // Replace with your Client Secret
			String redirectUri = "http://localhost:5000/auth/callback";

			// Step 1: Exchange code for access token
			String tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
			MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
			body.add("grant_type", "authorization_code");
			body.add("code", code);
			body.add("redirect_uri", redirectUri);
			body.add("client_id", clientId);
			body.add("client_secret", clientSecret);

			HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
			ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, request, Map.class);

			Map<String, Object> tokenBody = tokenResponse.getBody();
			if (tokenBody == null || !tokenBody.containsKey("access_token")) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to obtain access token from LinkedIn"));
			}

			String accessToken = (String) tokenBody.get("access_token");

			// Step 2: Fetch user data from LinkedIn
			String userInfoUrl = "https://api.linkedin.com/v2/userinfo";
			headers = new HttpHeaders();
			headers.set("Authorization", "Bearer " + accessToken);
			HttpEntity<String> userEntity = new HttpEntity<>(headers);
			ResponseEntity<Map> userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userEntity, Map.class);

			Map<String, Object> userData = userResponse.getBody();
			if (userData == null) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to fetch LinkedIn user data"));
			}

			String email = (String) userData.get("email");
			String givenName = (String) userData.get("given_name");
			String familyName = (String) userData.get("family_name");
			String picture = (String) userData.get("picture");
			String sub = (String) userData.get("sub");

			// Construct a username from given_name and family_name
			String username = (givenName != null && familyName != null)
					? givenName + familyName
					: (givenName != null ? givenName : sub); // Fallback to sub if names are missing

			// Step 3: Check if user exists or create new
			Optional<User> existingUser = userRepository.findByEmail(email);
			User user;
			if (existingUser.isPresent()) {
				user = existingUser.get();
				if (user.isBlocked()) {
					return ResponseEntity.badRequest().body(new MessageResponse("Login failed: Account blocked"));
				}
			} else {
				user = new User();
				user.setUsername(username); // Use constructed name
				user.setEmail(email);
				user.setPassword(encoder.encode(UUID.randomUUID().toString()));
				Set<Role> roles = new HashSet<>();
				Role userRole = roleRepository.findByName(UserRole.STUDENT)
						.orElseThrow(() -> new RuntimeException("Error: Role STUDENT not found"));
				roles.add(userRole);
				user.setRoles(roles);
				user.setProfileImage(picture);
				userRepository.save(user);
			}

			// Step 4: Generate JWT
			UserDetailsImpl userDetails = UserDetailsImpl.build(user);
			Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = jwtUtils.generateJwtToken(authentication);

			List<String> roles = userDetails.getAuthorities().stream()
					.map(GrantedAuthority::getAuthority)
					.collect(Collectors.toList());

			return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), username, email, roles, user.getProfileImage(), user.getCvFile()));
		} catch (Exception e) {
			System.err.println("Error in LinkedIn OAuth flow: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(new MessageResponse("Error during LinkedIn login: " + e.getMessage()));
		}
	}

//////////////////////////////////////////////////////////////////////////////////////////////////////

	@GetMapping("/github-callback")
	public ResponseEntity<?> handleGitHubCallback(@RequestParam("code") String code) {
		if (code == null || code.isEmpty()) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: No authorization code provided"));
		}

		try {
			// GitHub OAuth configuration
			String clientId = "Ov23liyPX428Fh4qo4fW";
			String clientSecret = "26f0840a3c7646d5eddcf0350114201f964d0127";
			String redirectUri = "http://localhost:8088/api/auth/github-callback";

			// Step 1: Exchange code for access token
			String tokenUrl = "https://github.com/login/oauth/access_token" +
					"?client_id=" + clientId +
					"&client_secret=" + clientSecret +
					"&code=" + code +
					"&redirect_uri=" + redirectUri;

			HttpHeaders headers = new HttpHeaders();
			headers.set("Accept", "application/json");
			HttpEntity<String> entity = new HttpEntity<>(headers);
			ResponseEntity<Map> tokenResponse = restTemplate.exchange(tokenUrl, HttpMethod.POST, entity, Map.class);

			Map<String, Object> tokenBody = tokenResponse.getBody();
			if (tokenBody == null || !tokenBody.containsKey("access_token")) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to obtain access token from GitHub"));
			}

			String accessToken = (String) tokenBody.get("access_token");

			// Step 2: Fetch user data from GitHub
			String userUrl = "https://api.github.com/user";
			headers.set("Authorization", "Bearer " + accessToken);
			HttpEntity<String> userEntity = new HttpEntity<>(headers);
			ResponseEntity<Map> userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, userEntity, Map.class);

			Map<String, Object> userData = userResponse.getBody();
			if (userData == null) {
				return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to fetch GitHub user data"));
			}

			String username = (String) userData.get("login");
			String email = (String) userData.get("email");
			String avatarUrl = (String) userData.get("avatar_url");

			// Step 3: Check if user exists
			Optional<User> existingUser = userRepository.findByUsername(username);
			User user;
			if (existingUser.isPresent()) {
				user = existingUser.get();
				if (user.isBlocked()) {
					return ResponseEntity.badRequest().body(new MessageResponse("Login failed: Your account has been blocked. Contact support for assistance."));
				}
			} else {
				if (email != null && userRepository.existsByEmail(email)) {
					return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use with a different account."));
				}

				user = new User();
				user.setUsername(username);
				user.setEmail(email != null ? email : username + "@github.com");
				user.setPassword(encoder.encode(UUID.randomUUID().toString()));
				Set<Role> roles = new HashSet<>();
				Role userRole = roleRepository.findByName(UserRole.STUDENT)
						.orElseThrow(() -> new RuntimeException("Error: Role STUDENT not found."));
				roles.add(userRole);
				user.setRoles(roles);
				if (avatarUrl != null) {
					user.setProfileImage(avatarUrl);
				}
				userRepository.save(user);
			}

			// Step 4: Authenticate and generate JWT
			UserDetailsImpl userDetails = UserDetailsImpl.build(user);
			Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = jwtUtils.generateJwtToken(authentication);

			List<String> roles = userDetails.getAuthorities().stream()
					.map(GrantedAuthority::getAuthority)
					.collect(Collectors.toList());

			// Step 5: Redirect to appropriate route based on role
			String redirectUrl;
			if (roles.contains("ADMIN")) {
				redirectUrl = "http://localhost:5000/auth/callback?token=" + jwt;
			} else if (roles.contains("STUDENT")) {
				redirectUrl = "http://localhost:5000/auth/callback?token=" + jwt;
			} else {
				redirectUrl = "http://localhost:5000/auth/callback?token=" + jwt;
			}

			System.out.println("Redirecting to: " + redirectUrl); // Debug log
			return ResponseEntity.status(302)
					.header("Location", redirectUrl)
					.body(new JwtResponse(jwt, userDetails.getId(), username, user.getEmail(), roles, user.getProfileImage(), user.getCvFile()));
		} catch (Exception e) {
			System.err.println("Error in GitHub OAuth flow: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(new MessageResponse("Error during GitHub login: " + e.getMessage()));
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////

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