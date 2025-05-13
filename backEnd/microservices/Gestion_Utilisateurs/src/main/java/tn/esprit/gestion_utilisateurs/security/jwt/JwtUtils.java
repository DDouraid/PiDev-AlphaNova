package tn.esprit.gestion_utilisateurs.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import tn.esprit.gestion_utilisateurs.security.services.UserDetailsImpl;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

	private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
	private static final Key jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Secure key
	private static final long jwtExpirationMs = 86400000; // 1 day

	static {
		System.out.println("User Management JWT Secret (Base64): " + Base64.getEncoder().encodeToString(jwtSecret.getEncoded()));
	}
	// Updated to accept Authentication object directly
	public String generateJwtToken(Authentication authentication) {
		UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

		// Extract roles as a list of strings
		List<String> roles = userPrincipal.getAuthorities().stream()
				.map(authority -> authority.getAuthority())
				.collect(Collectors.toList());

		return Jwts.builder()
				.setSubject(userPrincipal.getUsername()) // Username as 'sub'
				.claim("id", userPrincipal.getId()) // Add numeric ID
				.claim("email", userPrincipal.getEmail()) // Add email claim
				.claim("roles", roles) // Add roles claim
				.setIssuedAt(new Date())
				.setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
				.signWith(jwtSecret, SignatureAlgorithm.HS512)
				.compact();
	}

	// Get username from JWT token
	public String getUserNameFromJwtToken(String token) {
		try {
			return Jwts.parserBuilder()
					.setSigningKey(jwtSecret)
					.build()
					.parseClaimsJws(token)
					.getBody()
					.getSubject();
		} catch (JwtException e) {
			logger.error("Error extracting username from token: {}", e.getMessage());
			return null;
		}
	}

	// Validate JWT token
	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parserBuilder()
					.setSigningKey(jwtSecret)
					.build()
					.parseClaimsJws(authToken);
			return true;
		} catch (JwtException e) {
			logger.error("JWT validation error: {}", e.getMessage());
			return false;
		}
	}
}