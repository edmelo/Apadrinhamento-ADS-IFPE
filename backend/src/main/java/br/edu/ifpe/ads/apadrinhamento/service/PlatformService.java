package br.edu.ifpe.ads.apadrinhamento.service;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @Transactional
public class PlatformService {
    private final UserRepository users; private final MentorshipRepository mentorships; private final MeetingRepository meetings; private final QuestionRepository questions; private final AnswerRepository answers; private final TipRepository tips; private final ReviewRepository reviews;
    public PlatformService(UserRepository u,MentorshipRepository m,MeetingRepository me,QuestionRepository q,AnswerRepository a,TipRepository t,ReviewRepository r){users=u;mentorships=m;meetings=me;questions=q;answers=a;tips=t;reviews=r;}
    public UserAccount user(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));}
    public List<UserAccount> mentors(){return users.findByRoleAndActiveTrue(Role.PADRINHO);}
    public UserAccount updateProfile(String email,String name,String period,String interests,String availability,String bio){var u=user(email);u.setName(name);u.setPeriod(period);u.setInterests(interests);u.setAvailability(availability);u.setBio(bio);return users.save(u);}
    public Mentorship requestMentorship(String email,Long mentorId){var child=user(email);if(child.getRole()!=Role.AFILHADO)throw new IllegalArgumentException("Somente afilhados podem solicitar padrinhos");var mentor=users.findById(mentorId).filter(u->u.getRole()==Role.PADRINHO&&u.isActive()).orElseThrow(()->new IllegalArgumentException("Padrinho não encontrado"));if(mentorships.existsByMentorIdAndGodchildIdAndStatusIn(mentorId,child.getId(),List.of(MentorshipStatus.PENDENTE,MentorshipStatus.ATIVO)))throw new IllegalArgumentException("Já existe uma solicitação ou vínculo com este padrinho");return mentorships.save(new Mentorship(mentor,child));}
    public List<Mentorship> myMentorships(String email){var u=user(email);return mentorships.findByMentorIdOrGodchildIdOrderByRequestedAtDesc(u.getId(),u.getId());}
    public Mentorship updateMentorship(String email,Long id,MentorshipStatus status){var actor=user(email);var m=mentorships.findById(id).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));boolean allowed=actor.getRole()==Role.ADMIN||Objects.equals(m.getMentor().getId(),actor.getId())||(status==MentorshipStatus.ENCERRADO&&Objects.equals(m.getGodchild().getId(),actor.getId()));if(!allowed)throw new IllegalArgumentException("Você não pode alterar este vínculo");if(status==MentorshipStatus.ATIVO&&m.getStatus()!=MentorshipStatus.PENDENTE)throw new IllegalArgumentException("Apenas solicitações pendentes podem ser aceitas");m.setStatus(status);return mentorships.save(m);}
    public List<Meeting> myMeetings(String email){return meetings.findForUser(user(email).getId());}
    public Meeting createMeeting(String email,Long mentorshipId,String title,LocalDateTime startsAt,int duration,String format){var actor=user(email);var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));ensureParticipant(actor,m);if(m.getStatus()!=MentorshipStatus.ATIVO)throw new IllegalArgumentException("O vínculo precisa estar ativo");if(startsAt.isBefore(LocalDateTime.now()))throw new IllegalArgumentException("O encontro precisa estar no futuro");return meetings.save(new Meeting(m,title,startsAt,duration,format));}
    public Meeting updateMeeting(String email,Long id,MeetingStatus status){var meeting=meetings.findById(id).orElseThrow(()->new IllegalArgumentException("Encontro não encontrado"));ensureParticipant(user(email),meeting.getMentorship());meeting.setStatus(status);return meetings.save(meeting);}
    public List<Question> questions(){return questions.findByVisibleTrueOrderByCreatedAtDesc();}
    public Question createQuestion(String email,String title,String content,String category){return questions.save(new Question(user(email),title,content,category));}
    public List<Answer> answers(Long questionId){return answers.findByQuestionIdAndVisibleTrueOrderByCreatedAt(questionId);}
    public long answerCount(Long questionId){return answers.countByQuestionIdAndVisibleTrue(questionId);}
    public Answer createAnswer(String email,Long questionId,String content){var q=questions.findById(questionId).filter(Question::isVisible).orElseThrow(()->new IllegalArgumentException("Pergunta não encontrada"));return answers.save(new Answer(q,user(email),content));}
    public List<Tip> tips(){return tips.findByVisibleTrueOrderByCreatedAtDesc();}
    public Tip createTip(String email,String title,String content,String category){return tips.save(new Tip(user(email),title,content,category));}
    public Review createReview(String email,Long mentorshipId,int rating,String comment){var actor=user(email);var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));if(actor.getRole()!=Role.AFILHADO||!Objects.equals(m.getGodchild().getId(),actor.getId()))throw new IllegalArgumentException("Somente o afilhado do vínculo pode avaliar");if(reviews.existsByMentorshipId(mentorshipId))throw new IllegalArgumentException("Este vínculo já foi avaliado");return reviews.save(new Review(m,actor,rating,comment));}
    public Map<String,Long> indicators(){return Map.of("afilhados",users.countByRole(Role.AFILHADO),"padrinhos",users.countByRole(Role.PADRINHO),"vinculosAtivos",mentorships.countByStatus(MentorshipStatus.ATIVO),"aguardandoMatch",mentorships.countByStatus(MentorshipStatus.PENDENTE),"perguntas",questions.count());}
    public List<Mentorship> pending(){return mentorships.findByStatusOrderByRequestedAtAsc(MentorshipStatus.PENDENTE);}
    private void ensureParticipant(UserAccount user,Mentorship m){if(user.getRole()!=Role.ADMIN&&!Objects.equals(m.getMentor().getId(),user.getId())&&!Objects.equals(m.getGodchild().getId(),user.getId()))throw new IllegalArgumentException("Você não participa deste vínculo");}
}
