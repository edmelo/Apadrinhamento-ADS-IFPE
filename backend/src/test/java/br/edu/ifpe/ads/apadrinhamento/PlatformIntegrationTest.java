package br.edu.ifpe.ads.apadrinhamento;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
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

        var active=platform.updateMentorship(mentor.getEmail(),request.getId(),MentorshipStatus.ATIVO);
        assertThatThrownBy(()->platform.createMeeting(child.getEmail(),active.getId(),"Encontro do afilhado",LocalDateTime.now().plusDays(1),45,"Videochamada")).hasMessageContaining("padrinho");
        var meeting=platform.createMeeting(mentor.getEmail(),active.getId(),"Primeira mentoria",LocalDateTime.now().plusDays(1),45,"Videochamada");
        assertThatThrownBy(()->platform.updateMeeting(mentor.getEmail(),meeting.getId(),MeetingStatus.CONFIRMADO)).hasMessageContaining("afilhado");
        assertThat(platform.updateMeeting(child.getEmail(),meeting.getId(),MeetingStatus.CONFIRMADO).getStatus()).isEqualTo(MeetingStatus.CONFIRMADO);
        assertThat(platform.updateMeeting(child.getEmail(),meeting.getId(),MeetingStatus.CANCELADO).getStatus()).isEqualTo(MeetingStatus.CANCELADO);

        var question=platform.createQuestion(child.getEmail(),"Dúvida de teste","Como posso estudar melhor?","Organização");
        platform.createAnswer(mentor.getEmail(),question.getId(),"Pratique um pouco todos os dias.");
        assertThat(platform.answerCount(question.getId())).isEqualTo(1);
        assertThat(platform.answers(question.getId())).extracting(a->a.getAuthor().getEmail()).containsExactly(mentor.getEmail());
        assertThat(platform.createTip(mentor.getEmail(),"Dica de teste","Comece com exercícios pequenos.","Estudos").getId()).isNotNull();
        assertThatThrownBy(()->platform.createTip(child.getEmail(),"Dica do afilhado","Conteúdo","Estudos")).hasMessageContaining("padrinhos");
        assertThat(platform.createReview(child.getEmail(),active.getId(),5,"Ótima mentoria").getRating()).isEqualTo(5);
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
