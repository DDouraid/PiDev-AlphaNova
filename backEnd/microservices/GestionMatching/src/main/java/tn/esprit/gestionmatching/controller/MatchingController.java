package tn.esprit.gestionmatching.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import tn.esprit.gestionmatching.dto.MatchResponseWithOfferDto;
import tn.esprit.gestionmatching.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {
    @Autowired
    private MatchingService matchingService;

    @GetMapping("/match")
    public ResponseEntity<List<MatchResponseWithOfferDto>> matchCvWithOffers() {
        try {
            List<MatchResponseWithOfferDto> matches = matchingService.matchCvWithOffers();
            return ResponseEntity.ok(matches);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Injecter la clé API MapTiler
    @Value("${maptiler.api.key}")
    private String mapTilerApiKey;

    // Nouvel endpoint pour fournir la clé API MapTiler
    @GetMapping("/maptiler/key")
    @CrossOrigin(origins = "http://localhost:5000") // Ajoutez cette annotation
    public String getMapTilerApiKey() {
        System.out.println("Clé API MapTiler demandée: " + mapTilerApiKey); // Pour debug
        return mapTilerApiKey;
    }

}