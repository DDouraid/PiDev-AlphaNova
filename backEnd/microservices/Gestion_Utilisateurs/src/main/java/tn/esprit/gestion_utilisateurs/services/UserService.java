package tn.esprit.gestion_utilisateurs.services;

import tn.esprit.gestion_utilisateurs.entities.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    User saveUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
}
