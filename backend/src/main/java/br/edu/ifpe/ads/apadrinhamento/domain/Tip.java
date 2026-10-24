package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Tip {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private UserAccount author;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=5000) private String content;
    private String category; private Instant createdAt=Instant.now(); private boolean visible=true;
    protected Tip() {}
    public Tip(UserAccount a,String t,String c,String category){author=a;title=t;content=c;this.category=category;}
    public Long getId(){return id;} public UserAccount getAuthor(){return author;} public String getTitle(){return title;} public String getContent(){return content;} public String getCategory(){return category;} public Instant getCreatedAt(){return createdAt;} public boolean isVisible(){return visible;}
}
