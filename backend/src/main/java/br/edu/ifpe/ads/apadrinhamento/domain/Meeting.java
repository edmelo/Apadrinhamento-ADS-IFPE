package br.edu.ifpe.ads.apadrinhamento.domain;

import jakarta.persistence.*;
import java.time.*;

@Entity
public class Meeting {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Mentorship mentorship;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private LocalDateTime startsAt;
    private int durationMinutes=45; private String format="Videochamada";
    @Enumerated(EnumType.STRING) private MeetingStatus status=MeetingStatus.PROPOSTO;
    @Enumerated(EnumType.STRING) private Role proposedBy=Role.PADRINHO;
    protected Meeting() {}
    public Meeting(Mentorship m,String title,LocalDateTime startsAt,int duration,String format){this(m,title,startsAt,duration,format,Role.PADRINHO);}
    public Meeting(Mentorship m,String title,LocalDateTime startsAt,int duration,String format,Role proposedBy){mentorship=m;this.title=title;this.startsAt=startsAt;durationMinutes=duration;this.format=format;this.proposedBy=proposedBy==null?Role.PADRINHO:proposedBy;}
    public Long getId(){return id;} public Mentorship getMentorship(){return mentorship;} public String getTitle(){return title;} public LocalDateTime getStartsAt(){return startsAt;}
    public int getDurationMinutes(){return durationMinutes;} public String getFormat(){return format;} public MeetingStatus getStatus(){return status;} public void setStatus(MeetingStatus v){status=v;}
    public Role getProposedBy(){return proposedBy==null?Role.PADRINHO:proposedBy;} public void setProposedBy(Role v){proposedBy=v;}
}
