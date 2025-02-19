package tn.esprit.supervisor.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.supervisor.Entity.Supervisor;
import tn.esprit.supervisor.Service.SupervisorService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/Superviso")

public class SupervisorControllers {
    @Autowired
    SupervisorService supervisorService;

    @PostMapping("/add")
    public Supervisor addSupervisor(@RequestBody Supervisor s) {
        return supervisorService.addSupervisor(s);
    }

    @GetMapping("/get-all")
    public List<Supervisor> getAllSupervisor() {
        return supervisorService.getAllSupervisor();
    }

    @PutMapping("/update")
    public Supervisor updateSupervisor(@RequestBody Supervisor supervisor) {
        return supervisorService.updateSupervisor(supervisor);
    }

    @GetMapping("/get/{id}")
    public Supervisor getSupervisorById(@PathVariable("id") Integer id){

        return supervisorService.getSupervisorById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSupervisor(@PathVariable("id") Integer id){
        supervisorService.deleteSupervisor(id);
    }








}
