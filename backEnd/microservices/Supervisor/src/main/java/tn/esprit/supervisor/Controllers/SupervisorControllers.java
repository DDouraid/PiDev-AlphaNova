package tn.esprit.supervisor.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.supervisor.Clients.UserServiceClient;
import tn.esprit.supervisor.DTO.UserDTO;
import tn.esprit.supervisor.Entity.Supervisor;
import tn.esprit.supervisor.Service.EmailService;
import tn.esprit.supervisor.Service.SupervisorService;
import java.util.List;



@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200/")
@RequestMapping("Supervisor")
public class SupervisorControllers {
    @Autowired
    SupervisorService supervisorService;
    @Autowired
    EmailService emailService;

    @Autowired
    private UserServiceClient userServiceClient;

    @PostMapping("/add")
    public Supervisor addSupervisor(@RequestBody Supervisor s,  @RequestHeader("Authorization") String token) {
        Supervisor addedSupervisor = supervisorService.addSupervisor(s);
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        s.setUserId(user.getId());
        s.setUsername(user.getUsername());
        // Send email to the supervisor's email address after adding
        String to = addedSupervisor.getEmail(); // Use the email from the added supervisor
        String subject = "Bienvenue en tant que Superviseur";
        String body = "Bonjour " + addedSupervisor.getName() + ",\n\nVous avez été ajouté en tant que superviseur à ESPRIT. Merci de votre collaboration !\n\nCordialement,\nL'équipe ESPRIT";

        emailService.sendEmail(to, subject, body);
        return addedSupervisor;
    }


    @GetMapping("/get-all")
    public List<Supervisor> getAllSupervisor() {
        return supervisorService.getAllSupervisor();
    }

    @PutMapping("/update/{id}")
    public Supervisor updateSupervisor(@RequestBody Supervisor supervisor, @PathVariable int id) {
        supervisor.setIdSup(id);
        return supervisorService.updateSupervisor(supervisor);
    }

    @GetMapping("/get/{id}")
    public Supervisor getSupervisorById(@PathVariable("id") Integer id) {
        return supervisorService.getSupervisorById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSupervisor(@PathVariable("id") Integer id) {
        supervisorService.deleteSupervisor(id);
    }


}