package tn.esprit.event.Services;

import org.springframework.dao.DataAccessException;
import tn.esprit.event.Entity.Event;

import java.util.List;
import java.util.Map;

public interface IEventService {

    Event addEvent(Event event);
    List<Event> getAllEvent();
    void deleteEvent(Integer id);
    Event updateEvent(Event event);
    Event getEventById(Integer id);
    Map<String, Long> getEventDateStats();


}
