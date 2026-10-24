package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Answer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Question question;
    @ManyToOne(optional=false) private UserAccount author;
    @Column(nullable=false,length=3000) private String content;
    private Instant createdAt=Instant.now(); private boolean visible=true;
    protected Answer() {}
    public Answer(Question q,UserAccount a,String c){question=q;author=a;content=c;}
    public Long getId(){return id;} public Question getQuestion(){return question;} public UserAccount getAuthor(){return author;} public String getContent(){return content;} public Instant getCreatedAt(){return createdAt;} public boolean isVisible(){return visible;}
}
