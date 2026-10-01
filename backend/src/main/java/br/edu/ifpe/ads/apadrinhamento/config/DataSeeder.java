package br.edu.ifpe.ads.apadrinhamento.config;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seed(UserRepository users,MentorshipRepository mentorships,MeetingRepository meetings,QuestionRepository questions,AnswerRepository answers,TipRepository tips,PasswordEncoder encoder){return args->{if(users.count()>0)return;
        var ana=new UserAccount("Ana Souza","ana@ifpe.edu.br",encoder.encode("senha123"),Role.AFILHADO);ana.setPeriod("1º período");ana.setInterests("Lógica, front-end e organização");ana.setAvailability("Tardes durante a semana");ana.setBio("Quero conhecer melhor o curso e organizar meus estudos.");users.save(ana);
        var joao=mentor(users,encoder,"João Mendes","joao@ifpe.edu.br","5º período","Java, projetos e rotina acadêmica");var camila=mentor(users,encoder,"Camila Torres","camila@ifpe.edu.br","7º período","Lógica, Java e projetos");mentor(users,encoder,"Rafael Nunes","rafael@ifpe.edu.br","5º período","Mobile, carreira e rotina");mentor(users,encoder,"Larissa Melo","larissa@ifpe.edu.br","6º período","Python, dados e estágio");
        users.save(new UserAccount("Administração ADS","admin@ifpe.edu.br",encoder.encode("admin123"),Role.ADMIN));
        var vínculo=new Mentorship(joao,ana);vínculo.setStatus(MentorshipStatus.ATIVO);mentorships.save(vínculo);meetings.save(new Meeting(vínculo,"Conversa de boas-vindas",LocalDateTime.now().plusDays(2).withHour(14).withMinute(0),45,"Videochamada"));
        var q=questions.save(new Question(ana,"Material para começar em Lógica de Programação","Alguém indica vídeos, livros ou exercícios para acompanhar a disciplina?","Lógica de programação"));answers.save(new Answer(q,camila,"Comece praticando algoritmos simples e registre suas dúvidas. A prática frequente ajuda mais do que estudar tudo de uma vez."));
        questions.save(new Question(ana,"Como funcionam as faltas nas disciplinas?","Existe um limite por disciplina?","Rotina acadêmica"));tips.save(new Tip(joao,"Onde ficam os laboratórios?","Os laboratórios seguem a sinalização dos blocos. Chegue alguns minutos antes na primeira semana e peça ajuda na recepção.","Vida no campus"));tips.save(new Tip(camila,"Minha rotina de estudos que funciona","Separe blocos curtos durante a semana, revise os exemplos da aula e pratique antes de consultar a resposta.","Organização"));
    };}
    private UserAccount mentor(UserRepository users,PasswordEncoder encoder,String name,String email,String period,String interests){var u=new UserAccount(name,email,encoder.encode("senha123"),Role.PADRINHO);u.setPeriod(period);u.setInterests(interests);u.setAvailability("Tardes durante a semana");u.setBio("Disponível para compartilhar experiências e apoiar quem está começando.");return users.save(u);}
}
