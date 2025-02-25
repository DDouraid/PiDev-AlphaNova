package tn.esprit.gestion_users.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.gestion_users.models.Role;
import tn.esprit.gestion_users.models.UserRole;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByName(UserRole name);
}
