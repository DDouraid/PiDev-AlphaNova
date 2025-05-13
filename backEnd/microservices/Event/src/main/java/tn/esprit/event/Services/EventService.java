package tn.esprit.event.Services;

import tn.esprit.event.Entity.Event;
import tn.esprit.event.Repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService implements IEventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;

    @Override
    public Event addEvent(Event event) {
        logger.info("Adding event: {}", event);
        Event savedEvent = eventRepository.save(event);
        return savedEvent;
    }

    @Override
    public List<Event> getAllEvent() {
        return eventRepository.findAll();
    }

    @Override
    public Event updateEvent(Event updatedEvent) {
        return eventRepository.findById(updatedEvent.getIdEvent())
                .map(existingEvent -> {
                    logger.info("Updating event: {}", updatedEvent);
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
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Événement non trouvé"));
    }

    @Override
    public Map<String, Long> getEventDateStats() {
        Map<String, Long> immutableStats = eventRepository.getEventDateStats();
        Map<String, Long> stats = new HashMap<>(immutableStats);
        long total = stats.values().stream().mapToLong(Long::longValue).sum();
        stats.put("total", total);
        return stats;
    }
}
