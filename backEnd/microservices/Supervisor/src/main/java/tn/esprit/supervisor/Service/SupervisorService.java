package tn.esprit.supervisor.Service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.supervisor.Entity.Supervisor;
import tn.esprit.supervisor.Repository.SupervisorRepo;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

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
        Integer id = updateSupervisor.getIdSup();
        if (id == null || !supervisorRepo.existsById(id)) {
            throw new RuntimeException("Supervisor not found with id: " + id);
        }
        return supervisorRepo.save(updateSupervisor); // JPA will update based on ID
    }

    @Override
    public Supervisor getSupervisorById(Integer id) {
        return supervisorRepo.findById(id).get();
    }




}
