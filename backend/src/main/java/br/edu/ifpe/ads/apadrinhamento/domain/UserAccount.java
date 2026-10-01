package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="users", uniqueConstraints=@UniqueConstraint(columnNames="email"))
public class UserAccount {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String email;
    @Column(nullable=false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    private String period;
    private String interests;
    private String availability;
    @Column(length=1000) private String bio;
    private boolean active=true;
    private Instant createdAt=Instant.now();

    protected UserAccount() {}
    public UserAccount(String name,String email,String passwordHash,Role role){this.name=name;this.email=email.toLowerCase();this.passwordHash=passwordHash;this.role=role;}
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public Role getRole(){return role;}
    public String getPeriod(){return period;} public void setPeriod(String v){period=v;} public String getInterests(){return interests;} public void setInterests(String v){interests=v;}
    public String getAvailability(){return availability;} public void setAvailability(String v){availability=v;} public String getBio(){return bio;} public void setBio(String v){bio=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public Instant getCreatedAt(){return createdAt;}
}
