package com.example.message.controllers;

import com.example.message.Clients.UserServiceClient;
import com.example.message.DTO.UserDTO;
import com.example.message.entities.Groups;
import com.example.message.services.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private UserServiceClient userServiceClient;

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public List<Groups> getAllGroups() {
        return groupService.getAllGroups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Groups> getGroupById(@PathVariable Long id) {
        Optional<Groups> group = groupService.getGroupById(id);
        return group.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/addGroup")
    public Groups createGroup(@RequestBody Groups group, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        group.setUserId(user.getId());
        group.setUsername(user.getUsername());
        return groupService.createGroup(group);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Groups> updateGroup(@PathVariable Long id, @RequestBody Groups groupDetails) {
        try {
            Groups updatedGroup = groupService.updateGroup(id, groupDetails);
            return ResponseEntity.ok(updatedGroup);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
