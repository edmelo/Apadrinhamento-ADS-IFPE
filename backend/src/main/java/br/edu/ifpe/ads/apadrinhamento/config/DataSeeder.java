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
    @Bean CommandLineRunner seed(UserRepository users,MentorshipRepository mentorships,MeetingRepository meetings,QuestionRepository questions,AnswerRepository answers,TipRepository tips,PasswordEncoder encoder){return args->{
        if(users.count()>0){
            upgradeLegacyDemoData(users,tips);
            return;
        }
        var ana=new UserAccount("Ana Souza","ana@ifpe.edu.br",encoder.encode("senha123"),Role.AFILHADO);
        ana.setPeriod("1º período");
        ana.setInterests("Lógica, front-end e organização");
        ana.setAvailability("Segunda-feira 14:00 às 16:00, Quarta-feira 14:00 às 16:00");
        ana.setAvailabilitySlots("Segunda-feira|14:00|16:00;Quarta-feira|14:00|16:00");
        ana.setCompletedSteps("conhecer_padrinho");
        ana.setBio("Quero conhecer melhor o curso e organizar meus estudos.");
        users.save(ana);

        var joao=mentor(users,encoder,"João Mendes","joao@ifpe.edu.br","5º período","Java, projetos e rotina acadêmica","Segunda-feira 14:00 às 16:00, Quarta-feira 15:00 às 17:00","Segunda-feira|14:00|16:00;Quarta-feira|15:00|17:00");
        var camila=mentor(users,encoder,"Camila Torres","camila@ifpe.edu.br","6º período","Lógica, Java e projetos","Terça-feira 10:00 às 12:00, Quinta-feira 14:00 às 16:00","Terça-feira|10:00|12:00;Quinta-feira|14:00|16:00");
        var rafael=mentor(users,encoder,"Rafael Nunes","rafael@ifpe.edu.br","4º período","Mobile, carreira e rotina acadêmica","Quarta-feira 18:30 às 20:30, Sexta-feira 14:00 às 16:00","Quarta-feira|18:30|20:30;Sexta-feira|14:00|16:00");
        var larissa=mentor(users,encoder,"Larissa Melo","larissa@ifpe.edu.br","3º período","Python, dados, lógica e estágio","Segunda-feira 09:00 às 11:00, Sexta-feira 15:00 às 17:00","Segunda-feira|09:00|11:00;Sexta-feira|15:00|17:00");
        users.save(new UserAccount("Administração ADS","admin@ifpe.edu.br",encoder.encode("admin123"),Role.ADMIN));

        var vinculo=new Mentorship(joao,ana);
        vinculo.setStatus(MentorshipStatus.ATIVO);
        mentorships.save(vinculo);
        meetings.save(new Meeting(vinculo,"Conversa de boas-vindas",LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0),45,"Videochamada",Role.PADRINHO));

        var q1=new Question(ana,"Material para começar em Lógica de Programação","Alguém indica vídeos, livros ou exercícios para acompanhar a disciplina no 1º período?","Lógica de programação");
        q1.setLikes(5);
        questions.save(q1);
        answers.save(new Answer(q1,camila,"Comece praticando algoritmos simples no VisualG ou em Python/C e registre suas dúvidas. Resolver 2 exercícios por dia ajuda muito mais do que estudar apenas na véspera da prova."));
        answers.save(new Answer(q1,joao,"Recomendo também as listas de exercícios dos laboratórios do IFPE e usar testes de mesa no papel para entender laços de repetição."));

        var q2=new Question(ana,"Como funcionam as faltas e a média nas disciplinas?","Existe um limite de faltas por disciplina? Como funciona o cálculo de notas no Q-Acadêmico?","Rotina acadêmica");
        q2.setLikes(3);
        questions.save(q2);
        answers.save(new Answer(q2,rafael,"É necessário ter no mínimo 75% de frequência. Acompanhe sempre pelo Q-Acadêmico e converse com o professor caso precise justificar ausência por motivo médico."));

        var q3=new Question(larissa,"Dicas para conseguir o primeiro estágio em ADS","A partir de qual período vocês recomendam buscar estágio e o que colocar no GitHub?","Estágio");
        q3.setLikes(7);
        questions.save(q3);
        answers.save(new Answer(q3,camila,"A partir do 2º ou 3º período já vale criar um portfólio no GitHub com os projetos das disciplinas, README bem documentado e participar de projetos de extensão no IFPE."));

        seedFaqTips(tips,joao,camila,rafael,larissa);
    };}

    private void seedFaqTips(TipRepository tips,UserAccount joao,UserAccount camila,UserAccount rafael,UserAccount larissa){
        tips.save(new Tip(joao,"Onde ficam os laboratórios de informática e como acessá-los?","Os laboratórios de ADS ficam sinalizados nos blocos acadêmicos. Chegue alguns minutos antes na primeira semana, verifique o quadro de horários na porta de cada laboratório e utilize seu login institucional quando solicitado.","Vida no campus"));
        tips.save(new Tip(camila,"Como organizar a rotina de estudos no 1º período?","Separe blocos de 45 a 60 minutos durante a semana para praticar programação, revise os exemplos dados em aula no mesmo dia e anote dúvidas para levar ao seu padrinho ou monitor.","Organização"));
        tips.save(new Tip(rafael,"Como funciona o Q-Acadêmico, matrícula e renovação?","No Q-Acadêmico você consulta horários, notas, frequência, boletins e realiza a renovação de matrícula a cada semestre dentro do prazo do calendário acadêmico do IFPE.","Rotina acadêmica"));
        tips.save(new Tip(larissa,"Como aproveitar ao máximo o Programa de Apadrinhamento?","Combine encontros quinzenais ou semanais pela Agenda, utilize o chat após confirmar um agendamento e leve suas dúvidas sobre disciplinas, projetos e adaptação ao campus.","Sobre o apadrinhamento"));
        tips.save(new Tip(camila,"Quais ferramentas instalar no computador para o início do curso?","Recomendamos instalar o VS Code, Git, JDK (Java), Node.js ou Python conforme as disciplinas do semestre, além de criar sua conta educacional no GitHub Student Developer Pack com o e-mail @discente.ifpe.edu.br.","Estudos e programação"));
        tips.save(new Tip(rafael,"Onde encontrar oportunidades de monitoria, pesquisa e estágio?","Acompanhe os editais no portal do IFPE, os murais da coordenação de ADS e os grupos oficiais do curso. Projetos de iniciação científica e extensão contam horas complementares importantes.","Estágio e carreira"));
    }

    private void upgradeLegacyDemoData(UserRepository users,TipRepository tips){
        updateUserSlotsIfLegacy(users,"ana@ifpe.edu.br","Segunda-feira 14:00 às 16:00, Quarta-feira 14:00 às 16:00","Segunda-feira|14:00|16:00;Quarta-feira|14:00|16:00");
        updateUserSlotsIfLegacy(users,"joao@ifpe.edu.br","Segunda-feira 14:00 às 16:00, Quarta-feira 15:00 às 17:00","Segunda-feira|14:00|16:00;Quarta-feira|15:00|17:00");
        updateUserSlotsIfLegacy(users,"camila@ifpe.edu.br","Terça-feira 10:00 às 12:00, Quinta-feira 14:00 às 16:00","Terça-feira|10:00|12:00;Quinta-feira|14:00|16:00");
        updateUserSlotsIfLegacy(users,"rafael@ifpe.edu.br","Quarta-feira 18:30 às 20:30, Sexta-feira 14:00 às 16:00","Quarta-feira|18:30|20:30;Sexta-feira|14:00|16:00");
        updateUserSlotsIfLegacy(users,"larissa@ifpe.edu.br","Segunda-feira 09:00 às 11:00, Sexta-feira 15:00 às 17:00","Segunda-feira|09:00|11:00;Sexta-feira|15:00|17:00");
        if(tips.count()<=2){
            var joao=users.findByEmailIgnoreCase("joao@ifpe.edu.br").orElse(null);
            var camila=users.findByEmailIgnoreCase("camila@ifpe.edu.br").orElse(joao);
            var rafael=users.findByEmailIgnoreCase("rafael@ifpe.edu.br").orElse(joao);
            var larissa=users.findByEmailIgnoreCase("larissa@ifpe.edu.br").orElse(joao);
            if(joao!=null)seedFaqTips(tips,joao,camila,rafael,larissa);
        }
    }

    private void updateUserSlotsIfLegacy(UserRepository users,String email,String availability,String slots){
        users.findByEmailIgnoreCase(email).ifPresent(u->{
            if(u.getAvailabilitySlots()==null||u.getAvailabilitySlots().isBlank()||"Tardes durante a semana".equalsIgnoreCase(u.getAvailability())){
                u.setAvailability(availability);
                u.setAvailabilitySlots(slots);
                users.save(u);
            }
        });
    }

    private UserAccount mentor(UserRepository users,PasswordEncoder encoder,String name,String email,String period,String interests,String availability,String availabilitySlots){
        var u=new UserAccount(name,email,encoder.encode("senha123"),Role.PADRINHO);
        u.setPeriod(period);
        u.setInterests(interests);
        u.setAvailability(availability);
        u.setAvailabilitySlots(availabilitySlots);
        u.setBio("Disponível para compartilhar experiências, tirar dúvidas sobre disciplinas e apoiar quem está começando em ADS.");
        return users.save(u);
    }
}
