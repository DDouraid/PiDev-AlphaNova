package tn.esprit.event.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity

public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer idEvent ;
    private String Title;
    private String Description;
    private Date date ;
    private  String Location;



}
