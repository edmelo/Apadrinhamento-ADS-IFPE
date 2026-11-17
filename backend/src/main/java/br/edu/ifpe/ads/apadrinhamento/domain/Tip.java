package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Tip {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private UserAccount author;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=5000) private String content;
    private String category;
    @Column private Long sourceQuestionId;
    private Instant createdAt=Instant.now(); private boolean visible=true;
    protected Tip() {}
    public Tip(UserAccount a,String t,String c,String category){this(a,t,c,category,null);}
    public Tip(UserAccount a,String t,String c,String category,Long sourceQuestionId){author=a;title=t;content=c;this.category=category;this.sourceQuestionId=sourceQuestionId;}
    public Long getId(){return id;} public UserAccount getAuthor(){return author;} public String getTitle(){return title;} public String getContent(){return content;} public String getCategory(){return category;} public Long getSourceQuestionId(){return sourceQuestionId;} public void setSourceQuestionId(Long v){sourceQuestionId=v;} public Instant getCreatedAt(){return createdAt;} public boolean isVisible(){return visible;}
}
