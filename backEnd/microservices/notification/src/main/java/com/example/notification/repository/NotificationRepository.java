package com.example.notification.repository;

import com.example.notification.entites.Notification;
import com.example.notification.entites.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);
    Page<Notification> findByUserId(Long userId, Pageable pageable);
    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);
    Page<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable);
}