package com.example.message.services;

import com.example.message.entities.Groups;
import com.example.message.repositories.GroupRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {

    private final GroupRepository groupRepository;



    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<Groups> getAllGroups() {
        return groupRepository.findAll();
    }

    public Optional<Groups> getGroupById(Long id) {
        return groupRepository.findById(id);
    }

    public Groups createGroup(Groups group) {

        return groupRepository.save(group);
    }

    public Groups updateGroup(Long id, Groups groupDetails) {
        return groupRepository.findById(id).map(group -> {
            group.setName(groupDetails.getName());
            group.setUsername(groupDetails.getUsername());
            return groupRepository.save(group);
        }).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }
}
