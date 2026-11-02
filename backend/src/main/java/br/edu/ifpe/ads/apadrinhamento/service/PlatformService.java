package br.edu.ifpe.ads.apadrinhamento.service;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @Transactional
public class PlatformService {
    private final UserRepository users;
    private final MentorshipRepository mentorships;
    private final MeetingRepository meetings;
    private final QuestionRepository questions;
    private final AnswerRepository answers;
    private final TipRepository tips;
    private final ReviewRepository reviews;
    private final ChatMessageRepository messages;

    public PlatformService(UserRepository u,MentorshipRepository m,MeetingRepository me,QuestionRepository q,AnswerRepository a,TipRepository t,ReviewRepository r,ChatMessageRepository cm){
        users=u;mentorships=m;meetings=me;questions=q;answers=a;tips=t;reviews=r;messages=cm;
    }

    public UserAccount user(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));}
    public List<UserAccount> mentors(){return users.findByRoleAndActiveTrue(Role.PADRINHO);}

    public UserAccount updateProfile(String email,String name,String period,String interests,String availability,String bio){
        return updateProfile(email,name,period,interests,availability,null,bio,null);
    }

    public UserAccount updateProfile(String email,String name,String period,String interests,String availability,String availabilitySlots,String bio,String avatarUrl){
        var u=user(email);
        if(name!=null&&!name.isBlank())u.setName(name.trim());
        u.setPeriod(period);
        u.setInterests(interests);
        if(availabilitySlots!=null)u.setAvailabilitySlots(availabilitySlots);
        if(availability!=null)u.setAvailability(availability);
        u.setBio(bio);
        if(avatarUrl!=null)u.setAvatarUrl(avatarUrl.isBlank()?null:avatarUrl);
        return users.save(u);
    }

    public UserAccount updateAvailability(String email,String availability,String availabilitySlots){
        var u=user(email);
        u.setAvailability(availability);
        u.setAvailabilitySlots(availabilitySlots);
        return users.save(u);
    }

    public UserAccount updatePhoto(String email,String avatarUrl){
        var u=user(email);
        u.setAvatarUrl(avatarUrl==null||avatarUrl.isBlank()?null:avatarUrl.trim());
        return users.save(u);
    }

    public UserAccount updateSteps(String email,List<String> completedSteps){
        var u=user(email);
        String joined=completedSteps==null?"":completedSteps.stream().filter(Objects::nonNull).map(String::trim).filter(s->!s.isEmpty()).distinct().collect(Collectors.joining(","));
        u.setCompletedSteps(joined);
        return users.save(u);
    }

    public UserAccount markNotificationsRead(String email,List<String> ids){
        var u=user(email);
        var set=new LinkedHashSet<>(splitCsv(u.getReadNotifications()));
        if(ids!=null)ids.stream().filter(Objects::nonNull).map(String::trim).filter(s->!s.isEmpty()).forEach(set::add);
        u.setReadNotifications(String.join(",",set));
        return users.save(u);
    }

    public UserAccount archiveNotifications(String email,List<String> ids){
        var u=user(email);
        var readSet=new LinkedHashSet<>(splitCsv(u.getReadNotifications()));
        var archSet=new LinkedHashSet<>(splitCsv(u.getArchivedNotifications()));
        if(ids!=null){
            ids.stream().filter(Objects::nonNull).map(String::trim).filter(s->!s.isEmpty()).forEach(id->{
                readSet.add(id);
                archSet.add(id);
            });
        }
        u.setReadNotifications(String.join(",",readSet));
        u.setArchivedNotifications(String.join(",",archSet));
        return users.save(u);
    }

    private List<String> splitCsv(String raw){
        if(raw==null||raw.isBlank())return List.of();
        return Arrays.stream(raw.split(",")).map(String::trim).filter(s->!s.isEmpty()).distinct().toList();
    }

    public Mentorship requestMentorship(String email,Long mentorId){
        var child=user(email);
        if(child.getRole()!=Role.AFILHADO)throw new IllegalArgumentException("Somente afilhados podem solicitar padrinhos");
        var mentor=users.findById(mentorId).filter(u->u.getRole()==Role.PADRINHO&&u.isActive()).orElseThrow(()->new IllegalArgumentException("Padrinho não encontrado"));
        if(mentorships.existsByMentorIdAndGodchildIdAndStatusIn(mentorId,child.getId(),List.of(MentorshipStatus.PENDENTE,MentorshipStatus.ATIVO)))
            throw new IllegalArgumentException("Já existe uma solicitação ou vínculo com este padrinho");
        return mentorships.save(new Mentorship(mentor,child));
    }

    public List<Mentorship> myMentorships(String email){
        var u=user(email);
        return mentorships.findByMentorIdOrGodchildIdOrderByRequestedAtDesc(u.getId(),u.getId());
    }

    public Mentorship updateMentorship(String email,Long id,MentorshipStatus status){
        var actor=user(email);
        var m=mentorships.findById(id).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));
        boolean isChildCancel = (status==MentorshipStatus.ENCERRADO||status==MentorshipStatus.RECUSADO)&&Objects.equals(m.getGodchild().getId(),actor.getId());
        boolean allowed=actor.getRole()==Role.ADMIN||Objects.equals(m.getMentor().getId(),actor.getId())||isChildCancel;
        if(!allowed)throw new IllegalArgumentException("Você não pode alterar este vínculo");
        if(status==MentorshipStatus.ATIVO&&m.getStatus()!=MentorshipStatus.PENDENTE)throw new IllegalArgumentException("Apenas solicitações pendentes podem ser aceitas");
        m.setStatus(status);
        return mentorships.save(m);
    }

    public void cancelMentorship(String email,Long id){
        var actor=user(email);
        var m=mentorships.findById(id).orElseThrow(()->new IllegalArgumentException("Solicitação não encontrada"));
        boolean allowed=actor.getRole()==Role.ADMIN||Objects.equals(m.getGodchild().getId(),actor.getId())||Objects.equals(m.getMentor().getId(),actor.getId());
        if(!allowed)throw new IllegalArgumentException("Você não pode cancelar esta solicitação");
        if(m.getStatus()==MentorshipStatus.PENDENTE){
            mentorships.delete(m);
        }else{
            m.setStatus(MentorshipStatus.ENCERRADO);
            mentorships.save(m);
        }
    }

    public List<Meeting> myMeetings(String email){return meetings.findForUser(user(email).getId());}

    public Meeting createMeeting(String email,Long mentorshipId,String title,LocalDateTime startsAt,int duration,String format){
        var actor=user(email);
        var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));
        if(actor.getRole()!=Role.PADRINHO||!Objects.equals(m.getMentor().getId(),actor.getId()))
            throw new IllegalArgumentException("Somente o padrinho do vínculo pode agendar encontros");
        return saveValidatedMeeting(m,title,startsAt,duration,format,Role.PADRINHO);
    }

    public Meeting requestMeeting(String email,Long mentorshipId,String title,LocalDateTime startsAt,int duration,String format){
        var actor=user(email);
        var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));
        if(actor.getRole()!=Role.AFILHADO||!Objects.equals(m.getGodchild().getId(),actor.getId()))
            throw new IllegalArgumentException("Somente o afilhado do vínculo pode solicitar encontros");
        return saveValidatedMeeting(m,title,startsAt,duration,format,Role.AFILHADO);
    }

    public Meeting scheduleOrRequestMeeting(String email,Long mentorshipId,String title,LocalDateTime startsAt,int duration,String format){
        var actor=user(email);
        if(actor.getRole()==Role.AFILHADO){
            return requestMeeting(email,mentorshipId,title,startsAt,duration,format);
        }
        return createMeeting(email,mentorshipId,title,startsAt,duration,format);
    }

    private Meeting saveValidatedMeeting(Mentorship m,String title,LocalDateTime startsAt,int duration,String format,Role proposedBy){
        if(m.getStatus()!=MentorshipStatus.ATIVO)throw new IllegalArgumentException("O vínculo precisa estar ativo");
        if(startsAt==null||startsAt.isBefore(LocalDateTime.now()))throw new IllegalArgumentException("O encontro precisa estar no futuro");
        var normalizedStart=startsAt.withSecond(0).withNano(0);
        int dur=duration>0?duration:45;
        validateNoConflict(m,normalizedStart,dur,null);
        return meetings.save(new Meeting(m,title,normalizedStart,dur,format,proposedBy));
    }

    private void validateNoConflict(Mentorship m,LocalDateTime startsAt,int durationMinutes,Long excludeMeetingId){
        LocalDateTime endsAt=startsAt.plusMinutes(durationMinutes>0?durationMinutes:45);
        Set<Meeting> related=new LinkedHashSet<>();
        related.addAll(meetings.findForUser(m.getMentor().getId()));
        related.addAll(meetings.findForUser(m.getGodchild().getId()));
        for(Meeting existing:related){
            if(excludeMeetingId!=null&&Objects.equals(existing.getId(),excludeMeetingId))continue;
            if(existing.getStatus()!=MeetingStatus.PROPOSTO&&existing.getStatus()!=MeetingStatus.CONFIRMADO)continue;
            LocalDateTime exStart=existing.getStartsAt().withSecond(0).withNano(0);
            LocalDateTime exEnd=exStart.plusMinutes(existing.getDurationMinutes()>0?existing.getDurationMinutes():45);
            if(exStart.isBefore(endsAt)&&startsAt.isBefore(exEnd)){
                throw new IllegalArgumentException("Conflito de agendamento: já existe um encontro solicitado ou agendado para este mesmo dia e horário.");
            }
        }
    }

    public Meeting updateMeeting(String email,Long id,MeetingStatus status){
        var actor=user(email);
        var meeting=meetings.findById(id).orElseThrow(()->new IllegalArgumentException("Encontro não encontrado"));
        var m=meeting.getMentorship();
        ensureParticipant(actor,m);
        boolean admin=actor.getRole()==Role.ADMIN,mentor=Objects.equals(m.getMentor().getId(),actor.getId()),godchild=Objects.equals(m.getGodchild().getId(),actor.getId());
        Role proposer=meeting.getProposedBy();
        switch(status){
            case CONFIRMADO->{
                if(proposer==Role.AFILHADO){
                    if(!mentor&&!admin)throw new IllegalArgumentException("Somente o padrinho convidado pode confirmar a solicitação de encontro");
                }else{
                    if(!godchild&&!admin)throw new IllegalArgumentException("Somente o afilhado convidado pode confirmar o encontro");
                }
                if(meeting.getStatus()!=MeetingStatus.PROPOSTO)throw new IllegalArgumentException("Apenas encontros propostos podem ser confirmados");
                validateNoConflict(m,meeting.getStartsAt().withSecond(0).withNano(0),meeting.getDurationMinutes(),meeting.getId());
            }
            case CANCELADO->{if(meeting.getStatus()!=MeetingStatus.PROPOSTO&&meeting.getStatus()!=MeetingStatus.CONFIRMADO)throw new IllegalArgumentException("Este encontro não pode mais ser cancelado");}
            case CONCLUIDO->{if(!mentor&&!admin)throw new IllegalArgumentException("Somente o padrinho pode concluir o encontro");if(meeting.getStatus()!=MeetingStatus.CONFIRMADO)throw new IllegalArgumentException("Apenas encontros confirmados podem ser concluídos");}
            case PROPOSTO->throw new IllegalArgumentException("Um encontro não pode voltar a ser proposto");
        }
        meeting.setStatus(status);
        return meetings.save(meeting);
    }

    public List<ChatMessage> messages(String email,Long mentorshipId){
        var actor=user(email);
        var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));
        ensureParticipant(actor,m);
        return messages.findByMentorshipIdOrderByCreatedAtAsc(mentorshipId);
    }

    public ChatMessage sendMessage(String email,Long mentorshipId,String content){
        var actor=user(email);
        var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));
        ensureParticipant(actor,m);
        boolean hasConfirmedMeeting=meetings.findForUser(actor.getId()).stream()
            .anyMatch(me->Objects.equals(me.getMentorship().getId(),mentorshipId)&&(me.getStatus()==MeetingStatus.CONFIRMADO||me.getStatus()==MeetingStatus.CONCLUIDO));
        if(!hasConfirmedMeeting){
            throw new IllegalArgumentException("A troca de mensagens só é liberada após a confirmação do agendamento.");
        }
        String trimmed=content==null?"":content.trim();
        if(trimmed.isEmpty())throw new IllegalArgumentException("Digite uma mensagem");
        return messages.save(new ChatMessage(m,actor,trimmed));
    }

    public List<Question> questions(){return questions.findByVisibleTrueOrderByCreatedAtDesc();}
    public Question createQuestion(String email,String title,String content,String category){return questions.save(new Question(user(email),title,content,category));}
    public Question likeQuestion(String email,Long questionId){
        user(email);
        var q=questions.findById(questionId).filter(Question::isVisible).orElseThrow(()->new IllegalArgumentException("Pergunta não encontrada"));
        q.incrementLikes();
        return questions.save(q);
    }
    public List<Answer> answers(Long questionId){return answers.findByQuestionIdAndVisibleTrueOrderByCreatedAt(questionId);}
    public long answerCount(Long questionId){return answers.countByQuestionIdAndVisibleTrue(questionId);}
    public Answer createAnswer(String email,Long questionId,String content){var q=questions.findById(questionId).filter(Question::isVisible).orElseThrow(()->new IllegalArgumentException("Pergunta não encontrada"));return answers.save(new Answer(q,user(email),content));}
    public List<Tip> tips(){return tips.findByVisibleTrueOrderByCreatedAtDesc();}
    public Tip createTip(String email,String title,String content,String category){var author=user(email);if(author.getRole()!=Role.PADRINHO&&author.getRole()!=Role.ADMIN)throw new IllegalArgumentException("Somente padrinhos podem compartilhar dicas");return tips.save(new Tip(author,title,content,category));}
    public Review createReview(String email,Long mentorshipId,int rating,String comment){var actor=user(email);var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));if(actor.getRole()!=Role.AFILHADO||!Objects.equals(m.getGodchild().getId(),actor.getId()))throw new IllegalArgumentException("Somente o afilhado do vínculo pode avaliar");if(reviews.existsByMentorshipId(mentorshipId))throw new IllegalArgumentException("Este vínculo já foi avaliado");return reviews.save(new Review(m,actor,rating,comment));}
    public Map<String,Long> indicators(){return Map.of("afilhados",users.countByRole(Role.AFILHADO),"padrinhos",users.countByRole(Role.PADRINHO),"vinculosAtivos",mentorships.countByStatus(MentorshipStatus.ATIVO),"aguardandoMatch",mentorships.countByStatus(MentorshipStatus.PENDENTE),"perguntas",questions.count());}
    public List<Mentorship> pending(){return mentorships.findByStatusOrderByRequestedAtAsc(MentorshipStatus.PENDENTE);}
    private void ensureParticipant(UserAccount user,Mentorship m){if(user.getRole()!=Role.ADMIN&&!Objects.equals(m.getMentor().getId(),user.getId())&&!Objects.equals(m.getGodchild().getId(),user.getId()))throw new IllegalArgumentException("Você não participa deste vínculo");}
}
