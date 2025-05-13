package tn.esprit.application.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/interviews/**").permitAll() // Allow all event endpoints
                        .requestMatchers("/internships/**").permitAll() // Allow all event endpoints
                        .requestMatchers("/internship-requests/**").permitAll() // Allow all event endpoints
                        .requestMatchers("/internship-offers/**").permitAll() // Allow all event endpoints
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}