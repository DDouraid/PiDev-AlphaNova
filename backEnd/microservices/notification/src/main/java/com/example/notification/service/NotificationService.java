package com.example.notification.service;

import com.example.notification.entites.Notification;
import com.example.notification.entites.NotificationStatus;
import com.example.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Retrieves all notifications for a specific user.
     * @param userId The ID of the user.
     * @return List of notifications for the user.
     */
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    /**
     * Retrieves unread notifications for a specific user.
     * @param userId The ID of the user.
     * @return List of unread notifications for the user.
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    /**
     * Retrieves a notification by its ID.
     * @param id The ID of the notification.
     * @return Optional containing the notification if found.
     */
    @Transactional(readOnly = true)
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Creates a new notification with default status UNREAD if not specified.
     * @param notification The notification to create.
     * @return The saved notification.
     */
    @Transactional
    public Notification createNotification(Notification notification) {
        logger.info("Adding event: {}", notification);

        if (notification.getStatus() == null) {
            notification.setStatus(NotificationStatus.UNREAD);
        }
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    /**
     * Updates an existing notification.
     * @param id The ID of the notification to update.
     * @param notificationDetails The updated notification details.
     * @return The updated notification.
     * @throws RuntimeException if the notification is not found.
     */
    @Transactional
    public Notification updateNotification(Long id, Notification notificationDetails) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setMessage(notificationDetails.getMessage());
                    notification.setType(notificationDetails.getType());
                    notification.setStatus(notificationDetails.getStatus());
                    notification.setUpdatedAt(LocalDateTime.now());
                    return notificationRepository.save(notification);
                })
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    /**
     * Marks a notification as read.
     * @param notificationId The ID of the notification to mark as read.
     * @return The updated notification.
     * @throws RuntimeException if the notification is not found.
     */
    @Transactional
    public Notification markNotificationAsRead(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setStatus(NotificationStatus.READ);
                    notification.setUpdatedAt(LocalDateTime.now());
                    return notificationRepository.save(notification);
                })
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
    }

    /**
     * Deletes a notification by its ID.
     * @param notificationId The ID of the notification to delete.
     * @throws RuntimeException if the notification is not found.
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Retrieves all notifications.
     * @return List of all notifications.
     */
    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    /**
     * Retrieves paginated notifications for a specific user.
     * @param userId The ID of the user.
     * @param pageable Pagination information.
     * @return Page of notifications for the user.
     */
    @Transactional(readOnly = true)
    public Page<Notification> getPaginatedNotificationsByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }

    /**
     * Retrieves paginated unread notifications for a specific user.
     * @param userId The ID of the user.
     * @param pageable Pagination information.
     * @return Page of unread notifications for the user.
     */
    @Transactional(readOnly = true)
    public Page<Notification> getPaginatedUnreadNotificationsByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.UNREAD, pageable);
    }

    /**
     * Retrieves all paginated notifications.
     * @param pageable Pagination information.
     * @return Page of all notifications.
     */
    @Transactional(readOnly = true)
    public Page<Notification> getAllPaginatedNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable);
    }
}