package org.example.feedback.Clients;

import org.example.feedback.DTO.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-management-service", url = "http://localhost:8088/api/auth")
public interface UserServiceClient {

    @GetMapping("/me")
    UserDTO getCurrentUser(@RequestHeader("Authorization") String token);

    @GetMapping("/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable String username, @RequestHeader("Authorization") String token);
}