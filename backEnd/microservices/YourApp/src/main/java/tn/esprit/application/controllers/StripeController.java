package tn.esprit.application.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.application.services.StripeService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:4200")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-checkout-session")
    public String createCheckoutSession() {
        try {
            return stripeService.createCheckoutSession();
        } catch (Exception e) {
            return "Erreur : " + e.getMessage();
        }
    }
}
