package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class ChatMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Mentorship mentorship;
    @ManyToOne(optional=false) private UserAccount sender;
    @Column(nullable=false,length=2000) private String content;
    private Instant createdAt=Instant.now();

    protected ChatMessage() {}
    public ChatMessage(Mentorship mentorship, UserAccount sender, String content) {
        this.mentorship = mentorship;
        this.sender = sender;
        this.content = content;
    }

    public Long getId() { return id; }
    public Mentorship getMentorship() { return mentorship; }
    public UserAccount getSender() { return sender; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
}
