package tn.esprit.event.Services;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.event.Entity.Event;
import tn.esprit.event.Repository.EventRepository;

import java.util.List;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@AllArgsConstructor
@Service
public class EventService implements IEventService {

    @Autowired
    EventRepository eventRepository;

    @Override
    public Event addEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvent() {
        return eventRepository.findAll();
    }

    @Override
    public Event updateEvent(Event updatedEvent) {
        return eventRepository.findById(updatedEvent.getIdEvent())
                .map(existingEvent -> {
                    existingEvent.setTitle(updatedEvent.getTitle());
                    existingEvent.setDescription(updatedEvent.getDescription());
                    existingEvent.setDate(updatedEvent.getDate());
                    existingEvent.setLocation(updatedEvent.getLocation());
                    return eventRepository.save(existingEvent);
                }).orElseThrow(() -> new RuntimeException("Événement non trouvé"));
    }


    @Override
    public void deleteEvent(Integer id) {
        eventRepository.deleteById(id);
    }



    @Override
    public Event getEventById(Integer id) {
        return eventRepository.findById(id).get();
    }





}
