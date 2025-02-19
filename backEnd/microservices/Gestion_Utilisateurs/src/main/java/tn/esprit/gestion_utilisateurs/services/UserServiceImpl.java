package tn.esprit.gestion_utilisateurs.services;

import org.springframework.stereotype.Service;
import tn.esprit.gestion_utilisateurs.entities.Role;
import tn.esprit.gestion_utilisateurs.entities.User;
import tn.esprit.gestion_utilisateurs.repositories.RoleRepository;
import tn.esprit.gestion_utilisateurs.repositories.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User saveUser(User user) {
        // Vérifier et ajouter les rôles existants en base de données
        Set<Role> validRoles = new HashSet<>();
        for (Role role : user.getRoles()) {
            Optional<Role> existingRole = roleRepository.findById(role.getId());
            existingRole.ifPresent(validRoles::add);
        }
        user.setRoles(validRoles);

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setName(updatedUser.getName());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPassword(updatedUser.getPassword());

            // Mise à jour des rôles (Vérification des rôles existants)
            Set<Role> validRoles = new HashSet<>();
            for (Role role : updatedUser.getRoles()) {
                Optional<Role> existingRole = roleRepository.findById(role.getId());
                existingRole.ifPresent(validRoles::add);
            }
            existingUser.setRoles(validRoles);

            return userRepository.save(existingUser);
        }).orElse(null);
    }


    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
