package br.edu.ifpe.ads.apadrinhamento;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

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
        var meeting=platform.createMeeting(child.getEmail(),active.getId(),"Primeira mentoria",LocalDateTime.now().plusDays(1),45,"Videochamada");
        assertThat(platform.updateMeeting(mentor.getEmail(),meeting.getId(),MeetingStatus.CONFIRMADO).getStatus()).isEqualTo(MeetingStatus.CONFIRMADO);

        var question=platform.createQuestion(child.getEmail(),"Dúvida de teste","Como posso estudar melhor?","Organização");
        platform.createAnswer(mentor.getEmail(),question.getId(),"Pratique um pouco todos os dias.");
        assertThat(platform.answerCount(question.getId())).isEqualTo(1);
        assertThat(platform.createTip(mentor.getEmail(),"Dica de teste","Comece com exercícios pequenos.","Estudos").getId()).isNotNull();
        assertThat(platform.createReview(child.getEmail(),active.getId(),5,"Ótima mentoria").getRating()).isEqualTo(5);
    }
}
