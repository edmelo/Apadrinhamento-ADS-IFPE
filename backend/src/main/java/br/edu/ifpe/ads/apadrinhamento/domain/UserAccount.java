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
    @Column(length=1000) private String availability;
    @Column(length=2000) private String availabilitySlots;
    @Column(length=1000) private String bio;
    @Column(columnDefinition="TEXT") private String avatarUrl;
    @Column(length=1000) private String completedSteps="";
    @Column(length=4000) private String readNotifications="";
    @Column(length=4000) private String archivedNotifications="";
    private boolean active=true;
    private Instant createdAt=Instant.now();

    protected UserAccount() {}
    public UserAccount(String name,String email,String passwordHash,Role role){this.name=name;this.email=email.toLowerCase();this.passwordHash=passwordHash;this.role=role;}
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public Role getRole(){return role;}
    public String getPeriod(){return period;} public void setPeriod(String v){period=v;} public String getInterests(){return interests;} public void setInterests(String v){interests=v;}
    public String getAvailability(){return availability;} public void setAvailability(String v){availability=v;}
    public String getAvailabilitySlots(){return availabilitySlots;} public void setAvailabilitySlots(String v){availabilitySlots=v;}
    public String getBio(){return bio;} public void setBio(String v){bio=v;}
    public String getAvatarUrl(){return avatarUrl;} public void setAvatarUrl(String v){avatarUrl=v;}
    public String getCompletedSteps(){return completedSteps==null?"":completedSteps;} public void setCompletedSteps(String v){completedSteps=v==null?"":v;}
    public String getReadNotifications(){return readNotifications==null?"":readNotifications;} public void setReadNotifications(String v){readNotifications=v==null?"":v;}
    public String getArchivedNotifications(){return archivedNotifications==null?"":archivedNotifications;} public void setArchivedNotifications(String v){archivedNotifications=v==null?"":v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public Instant getCreatedAt(){return createdAt;}
}
