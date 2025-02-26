package tn.esprit.library.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.library.entities.Library;
import tn.esprit.library.services.LibraryService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/libraries")
@CrossOrigin(origins = "http://localhost:4200")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @GetMapping
    public List<Library> getAllLibraries() {
        return libraryService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Library> getLibraryById(@PathVariable Long id) {
        Optional<Library> library = libraryService.findById(id);
        return library.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Library createLibrary(@RequestBody Library library) {
        return libraryService.save(library);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Library> updateLibrary(@PathVariable Long id, @RequestBody Library libraryDetails) {
        Optional<Library> library = libraryService.findById(id);
        if (library.isPresent()) {
            Library updatedLibrary = library.get();
            updatedLibrary.setName(libraryDetails.getName());
            updatedLibrary.setType(libraryDetails.getType());
            updatedLibrary.setLevel(libraryDetails.getLevel());
            return ResponseEntity.ok(libraryService.save(updatedLibrary));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable Long id) {
        if (libraryService.findById(id).isPresent()) {
            libraryService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}