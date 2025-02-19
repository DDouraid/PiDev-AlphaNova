package org.example.tasks.repo;

import org.example.tasks.entities.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TasksRepo extends JpaRepository<Tasks, Integer> {
}
