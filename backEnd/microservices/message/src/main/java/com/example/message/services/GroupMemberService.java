package com.example.message.services;

import com.example.message.entities.GroupMember;
import com.example.message.repositories.GroupMemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;

    public GroupMemberService(GroupMemberRepository groupMemberRepository) {
        this.groupMemberRepository = groupMemberRepository;
    }

    public List<GroupMember> getAllGroupMembers() {
        return groupMemberRepository.findAll();
    }

    public Optional<GroupMember> getGroupMemberById(Long id) {
        return groupMemberRepository.findById(id);
    }

    public List<GroupMember> getMembersByGroupId(Long groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    public List<GroupMember> getGroupsByUserId(Long userId) {
        return groupMemberRepository.findByUserId(userId);
    }

    public GroupMember addGroupMember(GroupMember groupMember) {
        return groupMemberRepository.save(groupMember);
    }

    public GroupMember updateGroupMember(Long id, GroupMember groupMemberDetails) {
        return groupMemberRepository.findById(id).map(groupMember -> {
            groupMember.setGroup(groupMemberDetails.getGroup());
            groupMember.setUserId(groupMemberDetails.getUserId());
            return groupMemberRepository.save(groupMember);
        }).orElseThrow(() -> new RuntimeException("GroupMember not found"));
    }

    public void deleteGroupMember(Long id) {
        groupMemberRepository.deleteById(id);
    }
}
