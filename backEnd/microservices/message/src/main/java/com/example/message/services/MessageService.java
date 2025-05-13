package com.example.message.services;

import com.example.message.entities.Message;
import com.example.message.repositories.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {
    private final MessageRepository messageRepository;


    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    // Créer un message
    public Message createMessage(Message message) {


        return messageRepository.save(message);
    }

    // Lire un message par ID
    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    // Lire tous les messages
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    // Lire les messages par expéditeur
    public List<Message> getMessagesBySender(Long senderId) {
        return messageRepository.findByUserId(senderId);
    }

    // Lire les messages par destinataire
    public List<Message> getMessagesByReceiver(Long receiverId) {
        return messageRepository.findByReceiverId(receiverId);
    }

    // Lire les messages d'un groupe
    public List<Message> getMessagesByGroup(Long groupId) {
        return messageRepository.findByGroupId(groupId);
    }

    // Mettre à jour un message
    public Message updateMessage(Long id, Message updatedMessage) {
        return messageRepository.findById(id).map(message -> {
            message.setContent(updatedMessage.getContent());
            message.setAttachment(updatedMessage.getAttachment());
            message.setStatus(updatedMessage.getStatus());
            message.setUpdatedAt(updatedMessage.getUpdatedAt());
            return messageRepository.save(message);
        }).orElse(null);
    }

    // Supprimer un message
    public boolean deleteMessage(Long id) {
        if (messageRepository.existsById(id)) {
            messageRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
