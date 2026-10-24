package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(uniqueConstraints=@UniqueConstraint(columnNames="mentorship_id"))
public class Review {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(optional=false) private Mentorship mentorship;
    @ManyToOne(optional=false) private UserAccount author;
    private int rating; @Column(length=1500) private String comment; private Instant createdAt=Instant.now();
    protected Review() {}
    public Review(Mentorship m,UserAccount a,int r,String c){mentorship=m;author=a;rating=r;comment=c;}
    public Long getId(){return id;} public Mentorship getMentorship(){return mentorship;} public UserAccount getAuthor(){return author;} public int getRating(){return rating;} public String getComment(){return comment;} public Instant getCreatedAt(){return createdAt;}
}
