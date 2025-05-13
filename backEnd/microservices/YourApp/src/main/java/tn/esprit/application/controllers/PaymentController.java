package tn.esprit.application.controllers;



import tn.esprit.application.Clients.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.DTO.UserDTO;
import tn.esprit.application.entities.Payment;
import tn.esprit.application.services.PaymentService;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200") // Allow Angular origin
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Optional<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @PostMapping("/addPayment")
    public Payment createPayment(@RequestBody Payment payment, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);
        // Set user info in event
        payment.setUserId(user.getId());
        payment.setUsername(user.getUsername());
        System.out.println("Received Payment: " + payment);
        return paymentService.savePayment(payment);
    }

    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
    }
}
