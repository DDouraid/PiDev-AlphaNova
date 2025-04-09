package tn.esprit.event.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import tn.esprit.event.Entity.Event;
import tn.esprit.event.Services.EventService;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
@RequestMapping("Event")
public class EventControllers {

    @Autowired
    private EventService eventService;

    @PostMapping("/add")
    public Event addEvent(@RequestBody Event e) {
        return eventService.addEvent(e);
    }

    @GetMapping("/get-all")
    public List<Event> getAllEvent() {
        return eventService.getAllEvent();
    }

    @PutMapping("/update/{id}")
    public Event updateEvent(@RequestBody Event event, @PathVariable int id) {
        event.setIdEvent(id);
        return eventService.updateEvent(event);
    }

    @GetMapping("/get/{id}")
    public Event getEventById(@PathVariable("id") Integer id) {
        return eventService.getEventById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteEvent(@PathVariable("id") Integer id) {
        eventService.deleteEvent(id);
    }

    @GetMapping("/stats/date")
    public Map<String, Long> getEventDateStats() {
        return eventService.getEventDateStats();
    }

    // Injecter la clé API MapTiler
    @Value("${maptiler.api.key}")
    private String mapTilerApiKey;

    // Nouvel endpoint pour fournir la clé API MapTiler
    @GetMapping("/maptiler/key")
    @CrossOrigin(origins = "http://localhost:4200") // Ajoutez cette annotation
    public String getMapTilerApiKey() {
        System.out.println("Clé API MapTiler demandée: " + mapTilerApiKey); // Pour debug
        return mapTilerApiKey;
    }
}
