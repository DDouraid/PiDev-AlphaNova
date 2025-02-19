package tn.esprit.gestion_utilisateurs.entities;

import jakarta.persistence.*;
import tn.esprit.gestion_utilisateurs.entities.UserRole;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRole role;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users;

    public Role(UserRole role) {
        this.role = role;
    }

    public Role() {

    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
