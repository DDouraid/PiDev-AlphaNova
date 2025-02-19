package tn.esprit.gestion_utilisateurs.repositories;

import org.springframework.stereotype.Repository;
import tn.esprit.gestion_utilisateurs.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
