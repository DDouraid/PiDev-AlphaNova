package tn.esprit.event.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.event.Clients.UserServiceClient;
import tn.esprit.event.DTO.UserDTO;
import tn.esprit.event.Entity.Event;
import tn.esprit.event.Services.EventService;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("Event")
public class EventControllers {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserServiceClient userServiceClient;

    @PostMapping("/add")
    public Event addEvent(@RequestBody Event event, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        event.setUserId(user.getId());
        event.setUsername(user.getUsername());

        return eventService.addEvent(event);
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

    @Value("${maptiler.api.key}")
    private String mapTilerApiKey;

    @GetMapping("/maptiler/key")
    @CrossOrigin(origins = "http://localhost:4200")
    public String getMapTilerApiKey() {
        System.out.println("Clé API MapTiler demandée: " + mapTilerApiKey);
        return mapTilerApiKey;
    }
}