package tn.esprit.gestion_users.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.gestion_users.models.UserRole;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

	@GetMapping("/all")
	public String allAccess() {
		return "Public Content.";
	}

	@GetMapping("/student")
	@PreAuthorize("hasRole('STUDENT') or hasRole('ACADEMIC_SUPERVISOR') or hasRole('ADMIN')")
	public String studentAccess() {
		return "Student Content.";
	}

	@GetMapping("/company")
	@PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
	public String companyAccess() {
		return "Company Content.";
	}

	@GetMapping("/supervisor")
	@PreAuthorize("hasRole('ACADEMIC_SUPERVISOR') or hasRole('ADMIN')")
	public String academicSupervisorAccess() {
		return "Academic Supervisor Board.";
	}

	@GetMapping("/admin")
	@PreAuthorize("hasRole('ADMIN')")
	public String adminAccess() {
		return "Admin Board.";
	}
}
