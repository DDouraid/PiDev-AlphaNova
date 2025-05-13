package com.example.message.controllers;

import com.example.message.Clients.UserServiceClient;
import com.example.message.DTO.UserDTO;
import com.example.message.entities.Message;
import com.example.message.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "http://localhost:4200")

public class MessageController {
    private final MessageService messageService;

    @Autowired
    private UserServiceClient userServiceClient;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // 🔹 Créer un message
    @PostMapping("/createMess")
    public ResponseEntity<Message> createMessage(@RequestBody Message message, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        message.setUserId(user.getId());
        message.setUsername(user.getUsername());

        return ResponseEntity.ok(messageService.createMessage(message));
    }

    // 🔹 Lire un message par ID
    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        Optional<Message> message = messageService.getMessageById(id);
        return message.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 Lire tous les messages
    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    // 🔹 Lire les messages par expéditeur
    @GetMapping("/sender/{senderId}")
    public ResponseEntity<List<Message>> getMessagesBySender(@PathVariable Long senderId) {
        return ResponseEntity.ok(messageService.getMessagesBySender(senderId));
    }

    // 🔹 Lire les messages par destinataire
    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<List<Message>> getMessagesByReceiver(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.getMessagesByReceiver(receiverId));
    }

    // 🔹 Lire les messages d'un groupe
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Message>> getMessagesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(messageService.getMessagesByGroup(groupId));
    }

    // 🔹 Mettre à jour un message
    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message message) {
        Message updatedMessage = messageService.updateMessage(id, message);
        return updatedMessage != null ? ResponseEntity.ok(updatedMessage) : ResponseEntity.notFound().build();
    }

    // 🔹 Supprimer un message
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        return messageService.deleteMessage(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
