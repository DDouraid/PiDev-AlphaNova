package tn.esprit.gestionmatching.config;

import tn.esprit.gestionmatching.util.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        System.out.println("Authorization header: " + header);

        // Skip token validation for /api/matching/** (or if no header is present)
        if (header == null || !header.startsWith("Bearer ") || request.getRequestURI().startsWith("/api/matching/")) {
            System.out.println("Skipping token validation for request: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        System.out.println("Extracted token: " + token);
        if (jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUserId(token);
            UserDetails userDetails = new User(userId, "", Collections.emptyList());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("Authentication set for user: " + userId);
        } else {
            System.out.println("Token validation failed");
        }
        filterChain.doFilter(request, response);
    }
}