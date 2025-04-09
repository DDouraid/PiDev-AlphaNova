package tn.esprit.event.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.event.Entity.Event;

import java.util.Map;

public interface EventRepository extends JpaRepository<Event,Integer> {

        @Query("SELECT " +
                "SUM(CASE WHEN e.date < CURRENT_DATE THEN 1 ELSE 0 END) as passed, " +
                "SUM(CASE WHEN e.date = CURRENT_DATE THEN 1 ELSE 0 END) as current, " +
                "SUM(CASE WHEN e.date > CURRENT_DATE THEN 1 ELSE 0 END) as upcoming " +
                "FROM Event e")
        Map<String, Long> getEventDateStats();


    }


