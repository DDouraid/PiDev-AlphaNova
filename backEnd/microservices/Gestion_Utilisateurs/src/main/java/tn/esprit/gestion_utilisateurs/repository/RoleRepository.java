package tn.esprit.gestion_utilisateurs.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.gestion_utilisateurs.models.Role;
import tn.esprit.gestion_utilisateurs.models.UserRole;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByName(UserRole name);
}
