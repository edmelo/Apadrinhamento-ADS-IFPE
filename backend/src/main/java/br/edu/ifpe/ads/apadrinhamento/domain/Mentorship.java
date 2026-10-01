package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Mentorship {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private UserAccount mentor;
    @ManyToOne(optional=false) private UserAccount godchild;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private MentorshipStatus status=MentorshipStatus.PENDENTE;
    private Instant requestedAt=Instant.now(); private Instant updatedAt=Instant.now();
    protected Mentorship() {}
    public Mentorship(UserAccount mentor,UserAccount godchild){this.mentor=mentor;this.godchild=godchild;}
    public Long getId(){return id;} public UserAccount getMentor(){return mentor;} public UserAccount getGodchild(){return godchild;}
    public MentorshipStatus getStatus(){return status;} public void setStatus(MentorshipStatus v){status=v;updatedAt=Instant.now();}
    public Instant getRequestedAt(){return requestedAt;} public Instant getUpdatedAt(){return updatedAt;}
}
