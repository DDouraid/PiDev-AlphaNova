package tn.esprit.gestion_utilisateurs.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
		uniqueConstraints = {
				@UniqueConstraint(columnNames = "username"),
				@UniqueConstraint(columnNames = "email")
		})
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 20)
	private String username;

	@NotBlank
	@Size(max = 50)
	@Email
	private String email;

	@NotBlank
	@Size(max = 120)
	private String password;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "user_roles",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "role_id"))
	private Set<Role> roles = new HashSet<>();

	// Add isBlocked field with default value false
	@Column(name = "is_blocked", nullable = false, columnDefinition = "boolean default false")
	private boolean isBlocked = false;

	// Add profileImage field to store the path to the uploaded image
	@Column(name = "profile_image")
	private String profileImage; // Path to the image (e.g., "images/users/123-profile.jpg")

	@Column(name = "cv_file")
	private String cvFile; // Path to the CV file (e.g., "uploads/cvs/123-cv.pdf")

	public User() {
	}

	public User(String username, String email, String password) {
		this.username = username;
		this.email = email;
		this.password = password;
	}

	// Getter and Setter for cvFile
	public String getCvFile() {
		return cvFile;
	}

	public void setCvFile(String cvFile) {
		this.cvFile = cvFile;
	}

	// Getter and Setter for profileImage
	public String getProfileImage() {
		return profileImage;
	}

	public void setProfileImage(String profileImage) {
		this.profileImage = profileImage;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Set<Role> getRoles() {
		return roles;
	}

	public void setRoles(Set<Role> roles) {
		this.roles = roles;
	}

	// Getter for isBlocked
	public boolean isBlocked() {
		return this.isBlocked;
	}

	// Setter for isBlocked
	public void setBlocked(boolean isBlocked) {
		this.isBlocked = isBlocked;
	}
}