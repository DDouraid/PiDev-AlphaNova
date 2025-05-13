package tn.esprit.application.DTO;

import lombok.Data;


import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private String profileImage;
    private String cvFile;
    private boolean isBlocked;
}