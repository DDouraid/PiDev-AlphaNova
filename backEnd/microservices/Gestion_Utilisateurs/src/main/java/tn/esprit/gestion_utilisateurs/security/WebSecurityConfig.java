// backend/src/main/java/tn/esprit/gestion_utilisateurs/security/WebSecurityConfig.java
package tn.esprit.gestion_utilisateurs.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tn.esprit.gestion_utilisateurs.security.jwt.AuthEntryPointJwt;
import tn.esprit.gestion_utilisateurs.security.jwt.AuthTokenFilter;
import tn.esprit.gestion_utilisateurs.security.jwt.JwtUtils;
import tn.esprit.gestion_utilisateurs.security.services.UserDetailsServiceImpl;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig implements WebMvcConfigurer {

	private final AuthEntryPointJwt unauthorizedHandler;
	private final JwtUtils jwtUtils;
	private final UserDetailsServiceImpl userDetailsService;

	public WebSecurityConfig(UserDetailsServiceImpl userDetailsService, AuthEntryPointJwt unauthorizedHandler,
							 JwtUtils jwtUtils) {
		this.unauthorizedHandler = unauthorizedHandler;
		this.jwtUtils = jwtUtils;
		this.userDetailsService = userDetailsService;
	}

	@Bean
	public AuthTokenFilter authenticationJwtTokenFilter() {
		return new AuthTokenFilter(jwtUtils, userDetailsService);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(List.of(authProvider));
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// Log to confirm this configuration is loaded
		System.out.println("Configuring SecurityFilterChain for WebSecurityConfig");

		http
				.csrf(csrf -> {
					csrf.disable();
					System.out.println("CSRF disabled");
				})
				.cors(cors -> {
					System.out.println("CORS configured");
				})
				.exceptionHandling(exception -> {
					exception.authenticationEntryPoint(unauthorizedHandler);
					System.out.println("Exception handling configured with unauthorizedHandler");
				})
				.sessionManagement(session -> {
					session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
					System.out.println("Session management set to STATELESS");
				})
				.authorizeHttpRequests(auth -> auth
						// Public endpoints
						.requestMatchers("/api/auth/**").permitAll()
						.requestMatchers("/api/auth/signup").permitAll()
						.requestMatchers("/api/test/**").permitAll()
						.requestMatchers("/uploads/**").permitAll() // Allow public access to /uploads/**
						// All other requests require authentication
						.anyRequest().authenticated()
				)
				.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

		System.out.println("Security configuration applied: /uploads/** should be publicly accessible");

		return http.build();
	}
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Frontend origin
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/uploads/**")
				.addResourceLocations("file:uploads/");
		System.out.println("Static resource handler configured for /uploads/**");
	}


}