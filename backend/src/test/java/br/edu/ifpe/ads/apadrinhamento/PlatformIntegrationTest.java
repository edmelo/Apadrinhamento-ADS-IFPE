package br.edu.ifpe.ads.apadrinhamento;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest @Transactional
class PlatformIntegrationTest {
    @Autowired AuthService auth;
    @Autowired PlatformService platform;

    @Test
    void executesMainStudentJourney() {
        var child=auth.register("Aluno Teste","aluno.teste@ifpe.edu.br","senha123",Role.AFILHADO);
        assertThat(auth.authenticate(child.getEmail(),"senha123").getId()).isEqualTo(child.getId());
        assertThat(auth.token(child)).isNotBlank();

        var mentor=platform.mentors().stream().filter(u->u.getEmail().equals("camila@ifpe.edu.br")).findFirst().orElseThrow();
        var request=platform.requestMentorship(child.getEmail(),mentor.getId());
        assertThat(request.getStatus()).isEqualTo(MentorshipStatus.PENDENTE);

        // Cancelamento de solicitação de match pelo afilhado e novo envio
        platform.cancelMentorship(child.getEmail(),request.getId());
        request=platform.requestMentorship(child.getEmail(),mentor.getId());
        assertThat(request.getStatus()).isEqualTo(MentorshipStatus.PENDENTE);

        var active=platform.updateMentorship(mentor.getEmail(),request.getId(),MentorshipStatus.ATIVO);
        assertThatThrownBy(()->platform.createMeeting(child.getEmail(),active.getId(),"Encontro do afilhado",LocalDateTime.now().plusDays(1),45,"Videochamada")).hasMessageContaining("padrinho");

        LocalDateTime slotTime=LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0).withNano(0);
        var meeting=platform.createMeeting(mentor.getEmail(),active.getId(),"Primeira mentoria",slotTime,45,"Videochamada");

        // Conflito de agendamento no mesmo dia e horário
        assertThatThrownBy(()->platform.createMeeting(mentor.getEmail(),active.getId(),"Encontro duplicado",slotTime,45,"Videochamada")).hasMessageContaining("Conflito");
        assertThatThrownBy(()->platform.requestMeeting(child.getEmail(),active.getId(),"Solicitação conflitante",slotTime.plusMinutes(15),45,"Videochamada")).hasMessageContaining("Conflito");

        // Mensagens bloqueadas antes da confirmação do encontro
        assertThatThrownBy(()->platform.sendMessage(child.getEmail(),active.getId(),"Olá padrinho!")).hasMessageContaining("confirmação");
        assertThat(platform.chatContacts(child.getEmail())).anySatisfy(c->{
            assertThat(c.mentorshipId()).isEqualTo(active.getId());
            assertThat(c.chatUnlocked()).isFalse();
        });

        assertThatThrownBy(()->platform.updateMeeting(mentor.getEmail(),meeting.getId(),MeetingStatus.CONFIRMADO)).hasMessageContaining("afilhado");
        assertThat(platform.updateMeeting(child.getEmail(),meeting.getId(),MeetingStatus.CONFIRMADO).getStatus()).isEqualTo(MeetingStatus.CONFIRMADO);

        // Mensagens liberadas após confirmação do encontro e lista de contatos para ambos
        var msg1=platform.sendMessage(child.getEmail(),active.getId(),"Olá Camila, presença confirmada!");
        var msg2=platform.sendMessage(mentor.getEmail(),active.getId(),"Ótimo! Nos vemos no encontro.");
        assertThat(platform.messages(child.getEmail(),active.getId())).extracting(ChatMessage::getId).containsExactly(msg1.getId(),msg2.getId());
        assertThat(platform.chatContacts(mentor.getEmail())).anySatisfy(c->{
            assertThat(c.mentorshipId()).isEqualTo(active.getId());
            assertThat(c.contact().getEmail()).isEqualTo(child.getEmail());
            assertThat(c.chatUnlocked()).isTrue();
            assertThat(c.messageCount()).isEqualTo(2);
            assertThat(c.lastMessage()).isEqualTo("Ótimo! Nos vemos no encontro.");
        });

        assertThat(platform.updateMeeting(child.getEmail(),meeting.getId(),MeetingStatus.CANCELADO).getStatus()).isEqualTo(MeetingStatus.CANCELADO);

        // Solicitação de encontro pelo afilhado em horário específico
        LocalDateTime customTime=LocalDateTime.now().plusDays(3).withHour(16).withMinute(0).withSecond(0).withNano(0);
        var requestedByChild=platform.requestMeeting(child.getEmail(),active.getId(),"Dúvidas específicas",customTime,45,"Presencial");
        assertThat(requestedByChild.getProposedBy()).isEqualTo(Role.AFILHADO);
        assertThatThrownBy(()->platform.updateMeeting(child.getEmail(),requestedByChild.getId(),MeetingStatus.CONFIRMADO)).hasMessageContaining("padrinho");
        assertThat(platform.updateMeeting(mentor.getEmail(),requestedByChild.getId(),MeetingStatus.CONFIRMADO).getStatus()).isEqualTo(MeetingStatus.CONFIRMADO);

        // Persistência dos Primeiros Passos, Notificações e Foto de Perfil
        var updatedSteps=platform.updateSteps(child.getEmail(),List.of("conhecer_padrinho","guia_campus"));
        assertThat(updatedSteps.getCompletedSteps()).contains("conhecer_padrinho","guia_campus");

        var afterRead=platform.markNotificationsRead(child.getEmail(),List.of("notif-1","notif-2"));
        assertThat(afterRead.getReadNotifications()).contains("notif-1","notif-2");
        var afterArchive=platform.archiveNotifications(child.getEmail(),List.of("notif-1"));
        assertThat(afterArchive.getArchivedNotifications()).contains("notif-1");

        var withPhoto=platform.updatePhoto(child.getEmail(),"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
        assertThat(withPhoto.getAvatarUrl()).startsWith("data:image/png;base64,");

        var question=platform.createQuestion(child.getEmail(),"Dúvida de teste","Como posso estudar melhor?","Organização");
        assertThat(platform.likeQuestion(mentor.getEmail(),question.getId()).getLikes()).isEqualTo(1);
        platform.createAnswer(mentor.getEmail(),question.getId(),"Pratique um pouco todos os dias.");
        assertThat(platform.answerCount(question.getId())).isEqualTo(1);
        assertThat(platform.answers(question.getId())).extracting(a->a.getAuthor().getEmail()).containsExactly(mentor.getEmail());

        var faqSuggestions=platform.faqSuggestions();
        assertThat(faqSuggestions.trendingTerms()).isNotEmpty();
        assertThat(faqSuggestions.trendingTopics()).isNotEmpty();

        var promotedTip=platform.createTip(mentor.getEmail(),question.getTitle(),"Pratique um pouco todos os dias.","Organização",question.getId());
        assertThat(promotedTip.getSourceQuestionId()).isEqualTo(question.getId());
        assertThat(platform.faqSuggestions().trendingTopics())
            .filteredOn(t->t.questionId().equals(question.getId()))
            .allSatisfy(t->assertThat(t.alreadyInFaq()).isTrue());

        assertThat(platform.createTip(mentor.getEmail(),"Dica de teste","Comece com exercícios pequenos.","Estudos").getId()).isNotNull();
        assertThatThrownBy(()->platform.createTip(child.getEmail(),"Dica do afilhado","Conteúdo","Estudos")).hasMessageContaining("padrinhos");
        assertThat(platform.createReview(child.getEmail(),active.getId(),5,"Ótima mentoria").getRating()).isEqualTo(5);
    }

    @Test
    void updatesMentorAvailabilityAutomaticallyWhenAcceptingMeetingRequest() {
        var mentor=auth.register("Padrinho Agenda","padrinho.agenda@ifpe.edu.br","senha123",Role.PADRINHO);
        platform.updateAvailability(
            mentor.getEmail(),
            "Segunda-feira 14:00 às 16:00, Quarta-feira 15:00 às 17:00",
            "Segunda-feira|14:00|16:00;Quarta-feira|15:00|17:00"
        );
        var child=auth.register("Afilhado Agenda","afilhado.agenda@discente.ifpe.edu.br","senha123",Role.AFILHADO);
        var active=platform.updateMentorship(mentor.getEmail(),platform.requestMentorship(child.getEmail(),mentor.getId()).getId(),MentorshipStatus.ATIVO);

        // Solicitação no início da faixa de segunda-feira (14:00–14:45) reduz o horário disponível para 14:45–16:00
        LocalDate nextMonday=LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        var reqMonday=platform.requestMeeting(child.getEmail(),active.getId(),"Dúvida de segunda",nextMonday.atTime(14,0),45,"Videochamada");
        platform.updateMeeting(mentor.getEmail(),reqMonday.getId(),MeetingStatus.CONFIRMADO);

        var afterMonday=platform.user(mentor.getEmail());
        assertThat(afterMonday.getAvailabilitySlots()).isEqualTo("Segunda-feira|14:45|16:00;Quarta-feira|15:00|17:00");
        assertThat(afterMonday.getAvailability()).isEqualTo("Segunda-feira 14:45 às 16:00, Quarta-feira 15:00 às 17:00");

        // Solicitação cobrindo toda a faixa de quarta-feira (15:00–17:00) remove o slot de quarta-feira
        LocalDate nextWednesday=LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.WEDNESDAY));
        var reqWednesday=platform.requestMeeting(child.getEmail(),active.getId(),"Revisão completa",nextWednesday.atTime(15,0),120,"Presencial");
        platform.updateMeeting(mentor.getEmail(),reqWednesday.getId(),MeetingStatus.CONFIRMADO);

        var afterWednesday=platform.user(mentor.getEmail());
        assertThat(afterWednesday.getAvailabilitySlots()).isEqualTo("Segunda-feira|14:45|16:00");
        assertThat(afterWednesday.getAvailability()).isEqualTo("Segunda-feira 14:45 às 16:00");

        // Solicitação em dia sem disponibilidade cadastrada (sexta-feira) mantém a disponibilidade inalterada
        LocalDate nextFriday=LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
        var reqFriday=platform.requestMeeting(child.getEmail(),active.getId(),"Horário extra",nextFriday.atTime(10,0),45,"Videochamada");
        platform.updateMeeting(mentor.getEmail(),reqFriday.getId(),MeetingStatus.CONFIRMADO);

        var afterFriday=platform.user(mentor.getEmail());
        assertThat(afterFriday.getAvailabilitySlots()).isEqualTo("Segunda-feira|14:45|16:00");
    }

    @Test
    void acceptsOnlyInstitutionalEmailAndStrongPassword() {
        assertThat(auth.register("Aluna Discente","aluna@discente.ifpe.edu.br","senha123",Role.AFILHADO).getId()).isNotNull();
        assertThatThrownBy(()->auth.register("Aluno Gmail","aluno@gmail.com","senha123",Role.AFILHADO)).hasMessageContaining("institucional");
        assertThatThrownBy(()->auth.register("Aluno Falso","aluno@ifpe.edu.br.com","senha123",Role.AFILHADO)).hasMessageContaining("institucional");
        assertThatThrownBy(()->auth.register("Aluno Curto","curto@ifpe.edu.br","abc12",Role.AFILHADO)).hasMessageContaining("8 a 64");
        assertThatThrownBy(()->auth.register("Aluno Letras","letras@ifpe.edu.br","somenteletras",Role.AFILHADO)).hasMessageContaining("número");
        assertThatThrownBy(()->auth.register("Admin Falso","adm@ifpe.edu.br","senha123",Role.ADMIN)).hasMessageContaining("Administrador");
    }
}
