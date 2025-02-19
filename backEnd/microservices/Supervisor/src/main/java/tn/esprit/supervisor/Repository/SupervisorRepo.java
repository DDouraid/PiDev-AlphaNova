package tn.esprit.supervisor.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.supervisor.Entity.Supervisor;

public interface SupervisorRepo extends JpaRepository<Supervisor,Integer> {
}
