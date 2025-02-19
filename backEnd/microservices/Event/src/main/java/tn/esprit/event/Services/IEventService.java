package tn.esprit.event.Services;

import tn.esprit.event.Entity.Event;

import java.util.List;

public interface IEventService {

    Event addEvent(Event event);
    List<Event> getAllEvent();
    void deleteEvent(Integer id);
    Event updateEvent(Event event);
    Event getEventById(Integer id);
}
