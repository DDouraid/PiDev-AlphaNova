package org.example.tasks.repo;

import org.example.tasks.entities.TaskStatistics;
import org.example.tasks.entities.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TasksRepo extends JpaRepository<Tasks, Integer> {
    @Query(value = "SELECT " +
            "COUNT(*) AS total_tasks, " +
            "CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(CASE WHEN status = 'TO_DO' THEN 1 END) * 100.0 / COUNT(*)) END AS todo_percentage, " +
            "CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) * 100.0 / COUNT(*)) END AS in_progress_percentage, " +
            "CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(CASE WHEN status = 'DONE' THEN 1 END) * 100.0 / COUNT(*)) END AS done_percentage " +
            "FROM tasks", nativeQuery = true)
    TaskStatistics getTaskStatistics();
}
