package br.edu.ifpe.ads.apadrinhamento.web;

import br.edu.ifpe.ads.apadrinhamento.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import static br.edu.ifpe.ads.apadrinhamento.web.ApiDtos.*;

@RestController @RequestMapping("/api")
public class PlatformController {
    private final PlatformService service; public PlatformController(PlatformService service){this.service=service;}
    @GetMapping("/users/me") UserView me(Principal p){return UserView.of(service.user(p.getName()));}
    @PutMapping("/users/me") UserView profile(Principal p,@Valid @RequestBody ProfileRequest r){return UserView.of(service.updateProfile(p.getName(),r.name(),r.period(),r.interests(),r.availability(),r.availabilitySlots(),r.bio(),r.avatarUrl()));}
    @PutMapping("/users/me/availability") UserView availability(Principal p,@RequestBody AvailabilityRequest r){return UserView.of(service.updateAvailability(p.getName(),r.availability(),r.availabilitySlots()));}
    @PostMapping("/users/me/photo") UserView photo(Principal p,@RequestBody PhotoRequest r){return UserView.of(service.updatePhoto(p.getName(),r.avatarUrl()));}
    @PutMapping("/users/me/steps") UserView steps(Principal p,@RequestBody StepsRequest r){return UserView.of(service.updateSteps(p.getName(),r.completedSteps()));}
    @PostMapping("/notifications/read") UserView markNotificationsRead(Principal p,@RequestBody NotificationActionRequest r){return UserView.of(service.markNotificationsRead(p.getName(),r.ids()));}
    @PostMapping("/notifications/archive") UserView archiveNotifications(Principal p,@RequestBody NotificationActionRequest r){return UserView.of(service.archiveNotifications(p.getName(),r.ids()));}
    @GetMapping("/mentors") List<UserView> mentors(){return service.mentors().stream().map(UserView::of).toList();}
    @PostMapping("/mentorships") @PreAuthorize("hasRole('AFILHADO')") MentorshipView request(Principal p,@Valid @RequestBody MentorshipRequest r){return MentorshipView.of(service.requestMentorship(p.getName(),r.mentorId()));}
    @GetMapping("/mentorships") List<MentorshipView> mentorships(Principal p){return service.myMentorships(p.getName()).stream().map(MentorshipView::of).toList();}
    @PatchMapping("/mentorships/{id}") MentorshipView mentorshipStatus(Principal p,@PathVariable Long id,@Valid @RequestBody MentorshipStatusRequest r){return MentorshipView.of(service.updateMentorship(p.getName(),id,r.status()));}
    @DeleteMapping("/mentorships/{id}") ResponseEntity<Void> cancelMentorship(Principal p,@PathVariable Long id){service.cancelMentorship(p.getName(),id);return ResponseEntity.noContent().build();}
    @GetMapping("/mentorships/{id}/messages") List<ChatMessageView> messages(Principal p,@PathVariable Long id){return service.messages(p.getName(),id).stream().map(ChatMessageView::of).toList();}
    @PostMapping("/mentorships/{id}/messages") ChatMessageView sendMessage(Principal p,@PathVariable Long id,@Valid @RequestBody ChatMessageRequest r){return ChatMessageView.of(service.sendMessage(p.getName(),id,r.content()));}
    @GetMapping("/meetings") List<MeetingView> meetings(Principal p){return service.myMeetings(p.getName()).stream().map(MeetingView::of).toList();}
    @PostMapping("/meetings") MeetingView meeting(Principal p,@Valid @RequestBody MeetingRequest r){return MeetingView.of(service.scheduleOrRequestMeeting(p.getName(),r.mentorshipId(),r.title(),r.startsAt(),r.durationMinutes(),r.format()));}
    @PatchMapping("/meetings/{id}") MeetingView meetingStatus(Principal p,@PathVariable Long id,@Valid @RequestBody MeetingStatusRequest r){return MeetingView.of(service.updateMeeting(p.getName(),id,r.status()));}
    @GetMapping("/questions") List<QuestionView> questions(){return service.questions().stream().map(q->QuestionView.of(q,service.answerCount(q.getId()))).toList();}
    @PostMapping("/questions") QuestionView question(Principal p,@Valid @RequestBody QuestionRequest r){var q=service.createQuestion(p.getName(),r.title(),r.content(),r.category());return QuestionView.of(q,0);}
    @PostMapping("/questions/{id}/like") QuestionView likeQuestion(Principal p,@PathVariable Long id){var q=service.likeQuestion(p.getName(),id);return QuestionView.of(q,service.answerCount(q.getId()));}
    @GetMapping("/questions/{id}/answers") List<AnswerView> answers(@PathVariable Long id){return service.answers(id).stream().map(AnswerView::of).toList();}
    @PostMapping("/questions/{id}/answers") AnswerView answer(Principal p,@PathVariable Long id,@Valid @RequestBody AnswerRequest r){return AnswerView.of(service.createAnswer(p.getName(),id,r.content()));}
    @GetMapping("/tips") List<TipView> tips(){return service.tips().stream().map(TipView::of).toList();}
    @PostMapping("/tips") @PreAuthorize("hasRole('PADRINHO')") TipView tip(Principal p,@Valid @RequestBody TipRequest r){return TipView.of(service.createTip(p.getName(),r.title(),r.content(),r.category()));}
    @PostMapping("/reviews") ReviewView review(Principal p,@Valid @RequestBody ReviewRequest r){return ReviewView.of(service.createReview(p.getName(),r.mentorshipId(),r.rating(),r.comment()));}
    @GetMapping("/admin/indicators") @PreAuthorize("hasRole('ADMIN')") Map<String,Long> indicators(){return service.indicators();}
    @GetMapping("/admin/pending") @PreAuthorize("hasRole('ADMIN')") List<MentorshipView> pending(){return service.pending().stream().map(MentorshipView::of).toList();}
}
