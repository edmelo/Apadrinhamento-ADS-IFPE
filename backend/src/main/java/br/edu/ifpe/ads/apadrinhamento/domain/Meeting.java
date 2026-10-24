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
    protected Meeting() {}
    public Meeting(Mentorship m,String title,LocalDateTime startsAt,int duration,String format){mentorship=m;this.title=title;this.startsAt=startsAt;durationMinutes=duration;this.format=format;}
    public Long getId(){return id;} public Mentorship getMentorship(){return mentorship;} public String getTitle(){return title;} public LocalDateTime getStartsAt(){return startsAt;}
    public int getDurationMinutes(){return durationMinutes;} public String getFormat(){return format;} public MeetingStatus getStatus(){return status;} public void setStatus(MeetingStatus v){status=v;}
}
