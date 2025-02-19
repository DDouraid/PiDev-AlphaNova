package tn.esprit.event.Controllers;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.event.Entity.Event;
import tn.esprit.event.Services.EventService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/Event")
public class EventControllers {
    @Autowired
    EventService eventService;

    @PostMapping("/add")
    public Event addEvent(@RequestBody Event e) {
        return eventService.addEvent(e);
    }

    @GetMapping("/get-all")
    public List<Event> getAllEvent() {
        return eventService.getAllEvent();
    }




    @PutMapping("/update")
    public Event updateEvent(@RequestBody Event event) {
        return eventService.updateEvent(event);
    }

    @GetMapping("/get/{id}")
    public Event getEventById(@PathVariable("id") Integer id){

        return eventService.getEventById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteEvent(@PathVariable("id") Integer id){
        eventService.deleteEvent(id);
    }



}
