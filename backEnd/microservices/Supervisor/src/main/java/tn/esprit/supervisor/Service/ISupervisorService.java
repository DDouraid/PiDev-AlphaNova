package tn.esprit.supervisor.Service;

import com.google.zxing.WriterException;
import tn.esprit.supervisor.Entity.Supervisor;

import java.io.IOException;
import java.util.List;

public interface ISupervisorService  {
    Supervisor addSupervisor(Supervisor supervisor);
    List<Supervisor> getAllSupervisor();
    void deleteSupervisor(Integer id);
    Supervisor updateSupervisor(Supervisor supervisor);
    Supervisor getSupervisorById(Integer id);
}
