package com.example.message.controllers;

import com.example.message.Clients.UserServiceClient;
import com.example.message.DTO.UserDTO;
import com.example.message.entities.GroupMember;
import com.example.message.services.GroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/group-members")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @Autowired
    private UserServiceClient userServiceClient;

    public GroupMemberController(GroupMemberService groupMemberService) {
        this.groupMemberService = groupMemberService;
    }

    @GetMapping
    public List<GroupMember> getAllGroupMembers() {
        return groupMemberService.getAllGroupMembers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupMember> getGroupMemberById(@PathVariable Long id) {
        Optional<GroupMember> groupMember = groupMemberService.getGroupMemberById(id);
        return groupMember.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/group/{groupId}")
    public List<GroupMember> getMembersByGroupId(@PathVariable Long groupId) {
        return groupMemberService.getMembersByGroupId(groupId);
    }

    @GetMapping("/user/{userId}")
    public List<GroupMember> getGroupsByUserId(@PathVariable Long userId) {
        return groupMemberService.getGroupsByUserId(userId);
    }

    // Modified POST mapping to remove "/add"
    @PostMapping("/addGroupMember")
    public GroupMember createGroupMember(@RequestBody GroupMember groupMember, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        groupMember.setUserId(user.getId());
        groupMember.setUsername(user.getUsername());
        return groupMemberService.addGroupMember(groupMember);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupMember> updateGroupMember(@PathVariable Long id, @RequestBody GroupMember groupMemberDetails) {
        try {
            GroupMember updatedGroupMember = groupMemberService.updateGroupMember(id, groupMemberDetails);
            return ResponseEntity.ok(updatedGroupMember);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroupMember(@PathVariable Long id) {
        groupMemberService.deleteGroupMember(id);
        return ResponseEntity.noContent().build();
    }
}