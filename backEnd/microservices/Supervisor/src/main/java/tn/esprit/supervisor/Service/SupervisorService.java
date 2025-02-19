package tn.esprit.supervisor.Service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.supervisor.Entity.Supervisor;
import tn.esprit.supervisor.Repository.SupervisorRepo;

import java.util.List;

@AllArgsConstructor
@Service

public class SupervisorService implements ISupervisorService{
    @Autowired
    SupervisorRepo supervisorRepo;

    @Override
    public Supervisor addSupervisor(Supervisor supervisor) {
        return supervisorRepo.save(supervisor);
    }

    @Override
    public List<Supervisor> getAllSupervisor() {
        return supervisorRepo.findAll();
    }

    @Override
    public void deleteSupervisor(Integer id) {
        supervisorRepo.deleteById(id);

    }

    @Override
    public Supervisor updateSupervisor(Supervisor updateSupervisor) {
        return supervisorRepo.findById(updateSupervisor.getIdSup())
                .map(existingSupervisor -> {
                    existingSupervisor.setName(updateSupervisor.getName());
                    existingSupervisor.setEmail(updateSupervisor.getEmail());
                    existingSupervisor.setSpeciality(updateSupervisor.getSpeciality());
                    return supervisorRepo.save(existingSupervisor);
                }).orElseThrow(() -> new RuntimeException("Superviseur non trouvé"));
    }

    @Override
    public Supervisor getSupervisorById(Integer id) {
        return supervisorRepo.findById(id).get();
    }


}
