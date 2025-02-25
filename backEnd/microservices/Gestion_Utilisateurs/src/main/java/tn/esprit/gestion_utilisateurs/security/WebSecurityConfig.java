package tn.esprit.gestion_users.security;

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
import tn.esprit.gestion_users.security.jwt.AuthEntryPointJwt;
import tn.esprit.gestion_users.security.jwt.AuthTokenFilter;
import tn.esprit.gestion_users.security.jwt.JwtUtils;
import tn.esprit.gestion_users.security.services.UserDetailsServiceImpl;

import java.util.List;
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

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
	public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(List.of(authProvider));
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> {})
				.exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/auth/**").permitAll()
						.requestMatchers("/api/test/**").permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
