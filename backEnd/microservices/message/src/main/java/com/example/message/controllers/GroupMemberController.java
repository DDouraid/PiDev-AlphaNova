package com.example.message.controllers;

import com.example.message.entities.GroupMember;
import com.example.message.services.GroupMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/group-members")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

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

    @PostMapping("/add")
    public GroupMember createGroupMember(@RequestBody GroupMember groupMember) {
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
