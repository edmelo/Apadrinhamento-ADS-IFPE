package br.edu.ifpe.ads.apadrinhamento.service;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.Normalizer;
import java.time.*;
import java.util.*;
import java.util.regex.Pattern;
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
        var saved=meetings.save(meeting);
        if(status==MeetingStatus.CONFIRMADO&&proposer==Role.AFILHADO){
            adjustMentorAvailabilityForMeeting(m.getMentor(),meeting.getStartsAt(),meeting.getDurationMinutes());
        }
        return saved;
    }

    public List<ChatContactInfo> chatContacts(String email){
        var actor=user(email);
        var myMentorships=mentorships.findByMentorIdOrGodchildIdOrderByRequestedAtDesc(actor.getId(),actor.getId());
        var myMeetings=meetings.findForUser(actor.getId());
        var now=LocalDateTime.now();
        List<ChatContactInfo> list=new ArrayList<>();
        for(Mentorship m:myMentorships){
            long msgCount=messages.countByMentorshipId(m.getId());
            if(m.getStatus()==MentorshipStatus.RECUSADO)continue;
            if(m.getStatus()==MentorshipStatus.ENCERRADO&&msgCount==0)continue;
            UserAccount contact=Objects.equals(m.getMentor().getId(),actor.getId())?m.getGodchild():m.getMentor();
            boolean unlocked=m.getStatus()==MentorshipStatus.ATIVO&&myMeetings.stream().anyMatch(me->Objects.equals(me.getMentorship().getId(),m.getId())&&(me.getStatus()==MeetingStatus.CONFIRMADO||me.getStatus()==MeetingStatus.CONCLUIDO));
            var lastMsg=messages.findTopByMentorshipIdOrderByCreatedAtDesc(m.getId()).orElse(null);
            LocalDateTime nextMeetingAt=myMeetings.stream()
                .filter(me->Objects.equals(me.getMentorship().getId(),m.getId())&&(me.getStatus()==MeetingStatus.PROPOSTO||me.getStatus()==MeetingStatus.CONFIRMADO)&&!me.getStartsAt().isBefore(now))
                .map(Meeting::getStartsAt)
                .min(LocalDateTime::compareTo)
                .orElse(null);
            list.add(new ChatContactInfo(
                m.getId(),
                contact,
                m.getStatus(),
                unlocked,
                lastMsg!=null?lastMsg.getContent():null,
                lastMsg!=null?lastMsg.getCreatedAt():null,
                lastMsg!=null?lastMsg.getSender().getName():null,
                msgCount,
                nextMeetingAt,
                m.getRequestedAt()
            ));
        }
        list.sort(Comparator
            .comparingInt((ChatContactInfo c)->mentorshipSortOrder(c.mentorshipStatus()))
            .thenComparing(Comparator.comparing(ChatContactInfo::chatUnlocked).reversed())
            .thenComparing(Comparator.comparing((ChatContactInfo c)->c.lastMessageAt()!=null?c.lastMessageAt():c.requestedAt()).reversed())
        );
        return list;
    }

    private int mentorshipSortOrder(MentorshipStatus status){
        return switch(status){
            case ATIVO->0;
            case PENDENTE->1;
            case ENCERRADO->2;
            case RECUSADO->3;
        };
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
    public Tip createTip(String email,String title,String content,String category){return createTip(email,title,content,category,null);}
    public Tip createTip(String email,String title,String content,String category,Long sourceQuestionId){
        var author=user(email);
        if(author.getRole()!=Role.PADRINHO&&author.getRole()!=Role.ADMIN)throw new IllegalArgumentException("Somente padrinhos podem compartilhar dicas");
        return tips.save(new Tip(author,title,content,category,sourceQuestionId));
    }

    public FaqSuggestionsData faqSuggestions(){
        var visibleQuestions=questions.findByVisibleTrueOrderByCreatedAtDesc();
        var visibleTips=tips.findByVisibleTrueOrderByCreatedAtDesc();
        List<FaqForumSuggestion> topicSuggestions=new ArrayList<>();
        Map<String,List<FaqForumSuggestion>> byCategory=new LinkedHashMap<>();

        for(Question q:visibleQuestions){
            var qAnswers=answers.findByQuestionIdAndVisibleTrueOrderByCreatedAt(q.getId());
            long ansCount=qAnswers.size();
            int likes=q.getLikes();
            long score=(likes*2L)+(ansCount*3L);
            String suggestedCat=mapForumToFaqCategory(q.getCategory());
            String searchKeyword=extractFaqSearchKeyword(q,visibleTips);
            boolean alreadyInFaq=tips.existsBySourceQuestionIdAndVisibleTrue(q.getId())
                ||visibleTips.stream().anyMatch(t->normalizeText(t.getTitle()).equals(normalizeText(q.getTitle())));
            var bestAnswer=qAnswers.stream()
                .filter(a->a.getAuthor().getRole()==Role.PADRINHO)
                .findFirst()
                .orElse(qAnswers.isEmpty()?null:qAnswers.get(0));
            String excerpt=truncateText(q.getContent(),140);
            String answerPreview=bestAnswer!=null?truncateText(bestAnswer.getContent(),180):null;
            String answerAuthor=bestAnswer!=null?bestAnswer.getAuthor().getName():null;
            var item=new FaqForumSuggestion(
                q.getId(),q.getTitle(),excerpt,q.getCategory(),suggestedCat,searchKeyword,
                likes,ansCount,score,answerPreview,answerAuthor,alreadyInFaq
            );
            topicSuggestions.add(item);
            byCategory.computeIfAbsent(q.getCategory(),k->new ArrayList<>()).add(item);
        }

        List<FaqForumSuggestion> topTopics=topicSuggestions.stream()
            .sorted(Comparator.comparingLong(FaqForumSuggestion::trendScore).reversed()
                .thenComparingInt(FaqForumSuggestion::likes).reversed()
                .thenComparingLong(FaqForumSuggestion::questionId).reversed())
            .limit(6)
            .toList();

        List<FaqTrendingTerm> terms=byCategory.entrySet().stream()
            .map(e->{
                var items=e.getValue();
                long qCount=items.size();
                long totalLikes=items.stream().mapToLong(FaqForumSuggestion::likes).sum();
                long totalAns=items.stream().mapToLong(FaqForumSuggestion::answerCount).sum();
                long score=items.stream().mapToLong(FaqForumSuggestion::trendScore).sum();
                var topItem=items.stream().max(Comparator.comparingLong(FaqForumSuggestion::trendScore)).orElse(items.get(0));
                return new FaqTrendingTerm(
                    e.getKey(),
                    topItem.searchKeyword(),
                    e.getKey(),
                    mapForumToFaqCategory(e.getKey()),
                    qCount,totalLikes,totalAns,score
                );
            })
            .sorted(Comparator.comparingLong(FaqTrendingTerm::trendScore).reversed()
                .thenComparingLong(FaqTrendingTerm::questionCount).reversed())
            .limit(6)
            .toList();

        return new FaqSuggestionsData(terms,topTopics);
    }

    public Review createReview(String email,Long mentorshipId,int rating,String comment){var actor=user(email);var m=mentorships.findById(mentorshipId).orElseThrow(()->new IllegalArgumentException("Vínculo não encontrado"));if(actor.getRole()!=Role.AFILHADO||!Objects.equals(m.getGodchild().getId(),actor.getId()))throw new IllegalArgumentException("Somente o afilhado do vínculo pode avaliar");if(reviews.existsByMentorshipId(mentorshipId))throw new IllegalArgumentException("Este vínculo já foi avaliado");return reviews.save(new Review(m,actor,rating,comment));}
    public Map<String,Long> indicators(){return Map.of("afilhados",users.countByRole(Role.AFILHADO),"padrinhos",users.countByRole(Role.PADRINHO),"vinculosAtivos",mentorships.countByStatus(MentorshipStatus.ATIVO),"aguardandoMatch",mentorships.countByStatus(MentorshipStatus.PENDENTE),"perguntas",questions.count());}
    public List<Mentorship> pending(){return mentorships.findByStatusOrderByRequestedAtAsc(MentorshipStatus.PENDENTE);}
    private void ensureParticipant(UserAccount user,Mentorship m){if(user.getRole()!=Role.ADMIN&&!Objects.equals(m.getMentor().getId(),user.getId())&&!Objects.equals(m.getGodchild().getId(),user.getId()))throw new IllegalArgumentException("Você não participa deste vínculo");}

    // Ajuste automático da disponibilidade do padrinho ao aceitar solicitação de encontro
    private record AvailabilitySlot(String day,int startMin,Integer endMin){}
    private static final Pattern HUMAN_SLOT_PATTERN=Pattern.compile("^([\\p{L}-]+)\\s+(\\d{1,2}:\\d{2})(?:\\s*(?:às|-|a)\\s*(\\d{1,2}:\\d{2}))?$",Pattern.CASE_INSENSITIVE);

    private void adjustMentorAvailabilityForMeeting(UserAccount mentor,LocalDateTime startsAt,int durationMinutes){
        if(mentor==null||startsAt==null)return;
        List<AvailabilitySlot> current=parseAvailabilitySlots(mentor);
        if(current.isEmpty())return;
        DayOfWeek meetingDay=startsAt.getDayOfWeek();
        int meetStartMin=startsAt.getHour()*60+startsAt.getMinute();
        int dur=durationMinutes>0?durationMinutes:45;
        int meetEndMin=Math.min(24*60,meetStartMin+dur);

        List<AvailabilitySlot> updated=new ArrayList<>();
        boolean changed=false;
        for(AvailabilitySlot slot:current){
            DayOfWeek slotDay=parseDayOfWeek(slot.day());
            if(slotDay!=meetingDay){
                updated.add(slot);
                continue;
            }
            String canonicalDay=canonicalDayName(slotDay);
            if(slot.endMin()==null){
                if(slot.startMin()>=meetStartMin&&slot.startMin()<meetEndMin){
                    changed=true;
                }else{
                    updated.add(slot);
                }
                continue;
            }
            int sStart=slot.startMin();
            int sEnd=slot.endMin();
            if(sStart<meetEndMin&&meetStartMin<sEnd){
                changed=true;
                if(meetStartMin-sStart>=15){
                    updated.add(new AvailabilitySlot(canonicalDay,sStart,meetStartMin));
                }
                if(sEnd-meetEndMin>=15){
                    updated.add(new AvailabilitySlot(canonicalDay,meetEndMin,sEnd));
                }
            }else{
                updated.add(slot);
            }
        }
        if(changed){
            mentor.setAvailabilitySlots(serializeAvailabilitySlots(updated));
            mentor.setAvailability(formatAvailabilityHuman(updated));
            users.save(mentor);
        }
    }

    private List<AvailabilitySlot> parseAvailabilitySlots(UserAccount user){
        List<AvailabilitySlot> list=new ArrayList<>();
        String rawSlots=user.getAvailabilitySlots();
        if(rawSlots!=null&&!rawSlots.isBlank()){
            for(String item:rawSlots.split(";")){
                String trimmed=item.trim();
                if(trimmed.isEmpty())continue;
                String[] parts=trimmed.split("\\|",-1);
                if(parts.length>=2){
                    String day=parts[0].trim();
                    Integer start=parseTimeMinutes(parts[1].trim());
                    Integer end=parts.length>=3?parseTimeMinutes(parts[2].trim()):null;
                    if(!day.isEmpty()&&start!=null){
                        list.add(new AvailabilitySlot(day,start,end));
                    }
                }
            }
            return list;
        }
        String rawText=user.getAvailability();
        if(rawText!=null&&!rawText.isBlank()){
            for(String part:rawText.split("[,;]+")){
                var m=HUMAN_SLOT_PATTERN.matcher(part.trim());
                if(m.matches()){
                    String day=m.group(1).trim();
                    Integer start=parseTimeMinutes(m.group(2));
                    Integer end=m.group(3)!=null?parseTimeMinutes(m.group(3)):null;
                    if(start!=null)list.add(new AvailabilitySlot(day,start,end));
                }
            }
        }
        return list;
    }

    private Integer parseTimeMinutes(String hhmm){
        if(hhmm==null||hhmm.isBlank())return null;
        String[] p=hhmm.trim().split(":");
        if(p.length!=2)return null;
        try{
            int h=Integer.parseInt(p[0]);
            int m=Integer.parseInt(p[1]);
            if(h<0||h>23||m<0||m>59)return null;
            return h*60+m;
        }catch(NumberFormatException e){
            return null;
        }
    }

    private String formatMinutes(int minutes){
        int clamped=Math.max(0,Math.min(24*60-1,minutes));
        return String.format("%02d:%02d",clamped/60,clamped%60);
    }

    private String serializeAvailabilitySlots(List<AvailabilitySlot> slots){
        return slots.stream()
            .map(s->s.day()+"|"+formatMinutes(s.startMin())+"|"+(s.endMin()!=null?formatMinutes(s.endMin()):""))
            .collect(Collectors.joining(";"));
    }

    private String formatAvailabilityHuman(List<AvailabilitySlot> slots){
        return slots.stream()
            .map(s->s.endMin()!=null?s.day()+" "+formatMinutes(s.startMin())+" às "+formatMinutes(s.endMin()):s.day()+" às "+formatMinutes(s.startMin()))
            .collect(Collectors.joining(", "));
    }

    private DayOfWeek parseDayOfWeek(String raw){
        if(raw==null)return null;
        String n=normalizeText(raw);
        if(n.startsWith("segunda"))return DayOfWeek.MONDAY;
        if(n.startsWith("terca"))return DayOfWeek.TUESDAY;
        if(n.startsWith("quarta"))return DayOfWeek.WEDNESDAY;
        if(n.startsWith("quinta"))return DayOfWeek.THURSDAY;
        if(n.startsWith("sexta"))return DayOfWeek.FRIDAY;
        if(n.startsWith("sabado"))return DayOfWeek.SATURDAY;
        if(n.startsWith("domingo"))return DayOfWeek.SUNDAY;
        return null;
    }

    private String canonicalDayName(DayOfWeek day){
        return switch(day){
            case MONDAY->"Segunda-feira";
            case TUESDAY->"Terça-feira";
            case WEDNESDAY->"Quarta-feira";
            case THURSDAY->"Quinta-feira";
            case FRIDAY->"Sexta-feira";
            case SATURDAY->"Sábado";
            case SUNDAY->"Domingo";
        };
    }

    private String mapForumToFaqCategory(String forumCategory){
        String n=normalizeText(forumCategory);
        if(n.contains("logica")||n.contains("programacao"))return "Estudos e programação";
        if(n.contains("estagio")||n.contains("carreira"))return "Estágio e carreira";
        if(n.contains("rotina")||n.contains("professor")||n.contains("prova"))return "Rotina acadêmica";
        if(n.contains("campus"))return "Vida no campus";
        if(n.contains("organizacao"))return "Organização";
        return "Sobre o apadrinhamento";
    }

    private static final Set<String> STOP_WORDS=Set.of(
        "como","para","com","das","dos","que","uma","sobre","quais","onde","qual","quando","porque",
        "por","nos","nas","pelo","pela","pelos","pelas","mais","menos","muito","muita","entre",
        "isso","essa","esse","este","esta","voce","voces","algum","alguem","funcionam","funciona",
        "comecar","conseguir","dicas","primeiro","primeira","disciplinas","disciplina","curso","ads","ifpe"
    );

    private String extractFaqSearchKeyword(Question q,List<Tip> visibleTips){
        String combinedTips=normalizeText(visibleTips.stream().map(t->t.getTitle()+" "+t.getContent()+" "+t.getCategory()).collect(Collectors.joining(" ")));
        List<String> candidates=new ArrayList<>();
        String titleContent=q.getTitle()+" "+q.getContent()+" "+q.getCategory();
        for(String rawToken:titleContent.split("[^\\p{L}0-9-]+")){
            String token=rawToken.trim();
            String norm=normalizeText(token);
            if(norm.length()>=4&&!STOP_WORDS.contains(norm)){
                candidates.add(token);
            }
        }
        for(String candidate:candidates){
            if(combinedTips.contains(normalizeText(candidate))){
                return candidate;
            }
        }
        String catNorm=normalizeText(q.getCategory());
        if(catNorm.contains("logica"))return "programação";
        if(catNorm.contains("estagio"))return "estágio";
        if(catNorm.contains("rotina"))return "Q-Acadêmico";
        if(catNorm.contains("campus"))return "laboratórios";
        if(catNorm.contains("organizacao"))return "rotina";
        return candidates.isEmpty()?q.getCategory():candidates.get(0);
    }

    private String normalizeText(String raw){
        if(raw==null)return "";
        return Normalizer.normalize(raw,Normalizer.Form.NFD).replaceAll("\\p{M}","").toLowerCase(Locale.ROOT).trim();
    }

    private String truncateText(String raw,int maxLen){
        if(raw==null)return "";
        String clean=raw.trim().replaceAll("\\s+"," ");
        if(clean.length()<=maxLen)return clean;
        return clean.substring(0,Math.max(0,maxLen-1)).trim()+"…";
    }

    public record ChatContactInfo(
        Long mentorshipId,
        UserAccount contact,
        MentorshipStatus mentorshipStatus,
        boolean chatUnlocked,
        String lastMessage,
        Instant lastMessageAt,
        String lastMessageSenderName,
        long messageCount,
        LocalDateTime nextMeetingAt,
        Instant requestedAt
    ){}

    public record FaqTrendingTerm(
        String label,
        String searchKeyword,
        String forumCategory,
        String suggestedFaqCategory,
        long questionCount,
        long totalLikes,
        long totalAnswers,
        long trendScore
    ){}

    public record FaqForumSuggestion(
        Long questionId,
        String title,
        String excerpt,
        String forumCategory,
        String suggestedFaqCategory,
        String searchKeyword,
        int likes,
        long answerCount,
        long trendScore,
        String topAnswerPreview,
        String topAnswerAuthorName,
        boolean alreadyInFaq
    ){}

    public record FaqSuggestionsData(
        List<FaqTrendingTerm> trendingTerms,
        List<FaqForumSuggestion> trendingTopics
    ){}
}
