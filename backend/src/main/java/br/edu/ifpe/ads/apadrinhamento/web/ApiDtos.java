package br.edu.ifpe.ads.apadrinhamento.web;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;

final class ApiDtos {
    private ApiDtos(){}
    record LoginRequest(@Email String email,@NotBlank String password){}
    record RegisterRequest(@NotBlank String name,@Email String email,@Size(min=6)String password,@NotNull Role role){}
    record AuthResponse(String token,UserView user){}
    record ProfileRequest(@NotBlank String name,String period,String interests,String availability,String bio){}
    record UserView(Long id,String name,String email,Role role,String period,String interests,String availability,String bio){static UserView of(UserAccount u){return new UserView(u.getId(),u.getName(),u.getEmail(),u.getRole(),u.getPeriod(),u.getInterests(),u.getAvailability(),u.getBio());}}
    record MentorshipRequest(@NotNull Long mentorId){}
    record MentorshipStatusRequest(@NotNull MentorshipStatus status){}
    record MentorshipView(Long id,UserView mentor,UserView godchild,MentorshipStatus status,Instant requestedAt){static MentorshipView of(Mentorship m){return new MentorshipView(m.getId(),UserView.of(m.getMentor()),UserView.of(m.getGodchild()),m.getStatus(),m.getRequestedAt());}}
    record MeetingRequest(@NotNull Long mentorshipId,@NotBlank String title,@NotNull LocalDateTime startsAt,@Min(15)@Max(240)int durationMinutes,String format){}
    record MeetingStatusRequest(@NotNull MeetingStatus status){}
    record MeetingView(Long id,Long mentorshipId,String title,LocalDateTime startsAt,int durationMinutes,String format,MeetingStatus status){static MeetingView of(Meeting m){return new MeetingView(m.getId(),m.getMentorship().getId(),m.getTitle(),m.getStartsAt(),m.getDurationMinutes(),m.getFormat(),m.getStatus());}}
    record QuestionRequest(@NotBlank String title,@NotBlank String content,@NotBlank String category){}
    record QuestionView(Long id,UserView author,String title,String content,String category,Instant createdAt,long answerCount){static QuestionView of(Question q,long count){return new QuestionView(q.getId(),UserView.of(q.getAuthor()),q.getTitle(),q.getContent(),q.getCategory(),q.getCreatedAt(),count);}}
    record AnswerRequest(@NotBlank String content){}
    record AnswerView(Long id,UserView author,String content,Instant createdAt){static AnswerView of(Answer a){return new AnswerView(a.getId(),UserView.of(a.getAuthor()),a.getContent(),a.getCreatedAt());}}
    record TipRequest(@NotBlank String title,@NotBlank String content,String category){}
    record TipView(Long id,UserView author,String title,String content,String category,Instant createdAt){static TipView of(Tip t){return new TipView(t.getId(),UserView.of(t.getAuthor()),t.getTitle(),t.getContent(),t.getCategory(),t.getCreatedAt());}}
    record ReviewRequest(@NotNull Long mentorshipId,@Min(1)@Max(5)int rating,String comment){}
    record ReviewView(Long id,Long mentorshipId,int rating,String comment,Instant createdAt){static ReviewView of(Review r){return new ReviewView(r.getId(),r.getMentorship().getId(),r.getRating(),r.getComment(),r.getCreatedAt());}}
}
