package tn.esprit.library.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.library.entities.Library;
import tn.esprit.library.repositories.LibraryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class LibraryService {

    @Autowired
    private LibraryRepository libraryRepository;

    public List<Library> findAll() {
        return libraryRepository.findAll();
    }

    public Optional<Library> findById(Long id) {
        return libraryRepository.findById(id);
    }

    public Library save(Library library) {
        return libraryRepository.save(library);
    }

    public void deleteById(Long id) {
        libraryRepository.deleteById(id);
    }
}