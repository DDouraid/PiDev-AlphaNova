package tn.esprit.gestion_utilisateurs.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

	private static final Key jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Génère une clé sécurisée
	private static final long jwtExpirationMs = 86400000; // 1 jour

	public String generateJwtToken(String username) {
		return Jwts.builder()
				.setSubject(username)
				.setIssuedAt(new Date())
				.setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
				.signWith(jwtSecret, SignatureAlgorithm.HS512) // Utilise la clé sécurisée
				.compact();
	}

	public String getUserNameFromJwtToken(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(jwtSecret)
				.build()
				.parseClaimsJws(token)
				.getBody()
				.getSubject();
	}

	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parserBuilder()
					.setSigningKey(jwtSecret)
					.build()
					.parseClaimsJws(authToken);
			return true;
		} catch (JwtException e) {
			return false;
		}
	}
}
