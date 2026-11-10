package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Question {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private UserAccount author;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=3000) private String content;
    @Column(nullable=false) private String category;
    @Column(columnDefinition=" integer default 0") private Integer likes=0;
    private Instant createdAt=Instant.now(); private boolean visible=true;
    protected Question() {}
    public Question(UserAccount author,String title,String content,String category){this.author=author;this.title=title;this.content=content;this.category=category;}
    public Long getId(){return id;} public UserAccount getAuthor(){return author;} public String getTitle(){return title;} public String getContent(){return content;} public String getCategory(){return category;}
    public int getLikes(){return likes==null?0:likes;} public void setLikes(Integer v){likes=v==null?0:v;} public void incrementLikes(){likes=getLikes()+1;}
    public Instant getCreatedAt(){return createdAt;} public boolean isVisible(){return visible;} public void setVisible(boolean v){visible=v;}
}
