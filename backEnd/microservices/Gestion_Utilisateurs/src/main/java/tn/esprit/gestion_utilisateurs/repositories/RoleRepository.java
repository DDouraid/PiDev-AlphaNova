package tn.esprit.gestion_utilisateurs.repositories;

import tn.esprit.gestion_utilisateurs.entities.Role;
import tn.esprit.gestion_utilisateurs.entities.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRole(UserRole role);
}
