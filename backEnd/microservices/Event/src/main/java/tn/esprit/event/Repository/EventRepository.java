package tn.esprit.event.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.event.Entity.Event;

public interface EventRepository extends JpaRepository<Event,Integer> {

}
