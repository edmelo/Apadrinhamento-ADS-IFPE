package br.edu.ifpe.ads.apadrinhamento.web;

import br.edu.ifpe.ads.apadrinhamento.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import static br.edu.ifpe.ads.apadrinhamento.web.ApiDtos.*;

@RestController @RequestMapping("/api")
public class PlatformController {
    private final PlatformService service; public PlatformController(PlatformService service){this.service=service;}
    @GetMapping("/users/me") UserView me(Principal p){return UserView.of(service.user(p.getName()));}
    @PutMapping("/users/me") UserView profile(Principal p,@Valid @RequestBody ProfileRequest r){return UserView.of(service.updateProfile(p.getName(),r.name(),r.period(),r.interests(),r.availability(),r.bio()));}
    @GetMapping("/mentors") List<UserView> mentors(){return service.mentors().stream().map(UserView::of).toList();}
    @PostMapping("/mentorships") @PreAuthorize("hasRole('AFILHADO')") MentorshipView request(Principal p,@Valid @RequestBody MentorshipRequest r){return MentorshipView.of(service.requestMentorship(p.getName(),r.mentorId()));}
    @GetMapping("/mentorships") List<MentorshipView> mentorships(Principal p){return service.myMentorships(p.getName()).stream().map(MentorshipView::of).toList();}
    @PatchMapping("/mentorships/{id}") MentorshipView mentorshipStatus(Principal p,@PathVariable Long id,@Valid @RequestBody MentorshipStatusRequest r){return MentorshipView.of(service.updateMentorship(p.getName(),id,r.status()));}
    @GetMapping("/meetings") List<MeetingView> meetings(Principal p){return service.myMeetings(p.getName()).stream().map(MeetingView::of).toList();}
    @PostMapping("/meetings") MeetingView meeting(Principal p,@Valid @RequestBody MeetingRequest r){return MeetingView.of(service.createMeeting(p.getName(),r.mentorshipId(),r.title(),r.startsAt(),r.durationMinutes(),r.format()));}
    @PatchMapping("/meetings/{id}") MeetingView meetingStatus(Principal p,@PathVariable Long id,@Valid @RequestBody MeetingStatusRequest r){return MeetingView.of(service.updateMeeting(p.getName(),id,r.status()));}
    @GetMapping("/questions") List<QuestionView> questions(){return service.questions().stream().map(q->QuestionView.of(q,service.answerCount(q.getId()))).toList();}
    @PostMapping("/questions") QuestionView question(Principal p,@Valid @RequestBody QuestionRequest r){var q=service.createQuestion(p.getName(),r.title(),r.content(),r.category());return QuestionView.of(q,0);}
    @GetMapping("/questions/{id}/answers") List<AnswerView> answers(@PathVariable Long id){return service.answers(id).stream().map(AnswerView::of).toList();}
    @PostMapping("/questions/{id}/answers") AnswerView answer(Principal p,@PathVariable Long id,@Valid @RequestBody AnswerRequest r){return AnswerView.of(service.createAnswer(p.getName(),id,r.content()));}
    @GetMapping("/tips") List<TipView> tips(){return service.tips().stream().map(TipView::of).toList();}
    @PostMapping("/tips") TipView tip(Principal p,@Valid @RequestBody TipRequest r){return TipView.of(service.createTip(p.getName(),r.title(),r.content(),r.category()));}
    @PostMapping("/reviews") ReviewView review(Principal p,@Valid @RequestBody ReviewRequest r){return ReviewView.of(service.createReview(p.getName(),r.mentorshipId(),r.rating(),r.comment()));}
    @GetMapping("/admin/indicators") @PreAuthorize("hasRole('ADMIN')") Map<String,Long> indicators(){return service.indicators();}
    @GetMapping("/admin/pending") @PreAuthorize("hasRole('ADMIN')") List<MentorshipView> pending(){return service.pending().stream().map(MentorshipView::of).toList();}
}
