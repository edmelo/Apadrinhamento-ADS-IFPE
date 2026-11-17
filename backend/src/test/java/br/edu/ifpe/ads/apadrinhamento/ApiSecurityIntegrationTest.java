package br.edu.ifpe.ads.apadrinhamento;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import java.net.URI;
import java.net.http.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiSecurityIntegrationTest {
    @LocalServerPort int port;
    private final HttpClient http=HttpClient.newHttpClient();

    @Test void protectsApiAndAcceptsJwtLogin() throws Exception {
        var unauthorized=http.send(HttpRequest.newBuilder(uri("/api/mentors")).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(unauthorized.statusCode()).isEqualTo(401);
        var login=http.send(HttpRequest.newBuilder(uri("/api/auth/login")).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"ana@ifpe.edu.br\",\"password\":\"senha123\"}")).build(),HttpResponse.BodyHandlers.ofString());
        assertThat(login.statusCode()).isEqualTo(200);
        var token=login.body().replaceFirst(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*","$1");
        var mentors=http.send(HttpRequest.newBuilder(uri("/api/mentors")).header("Authorization","Bearer "+token).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(mentors.statusCode()).isEqualTo(200);assertThat(mentors.body().trim()).startsWith("[");
        var admin=http.send(HttpRequest.newBuilder(uri("/api/admin/indicators")).header("Authorization","Bearer "+token).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(admin.statusCode()).isEqualTo(403);
        var tip=http.send(HttpRequest.newBuilder(uri("/api/tips")).header("Authorization","Bearer "+token).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString("{\"title\":\"Dica\",\"content\":\"Conteúdo\"}")).build(),HttpResponse.BodyHandlers.ofString());
        assertThat(tip.statusCode()).isEqualTo(403);assertThat(tip.body()).contains("permissão");

        var contacts=http.send(HttpRequest.newBuilder(uri("/api/chat/contacts")).header("Authorization","Bearer "+token).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(contacts.statusCode()).isEqualTo(200);assertThat(contacts.body()).contains("João Mendes");

        var faqSuggestions=http.send(HttpRequest.newBuilder(uri("/api/faq/suggestions")).header("Authorization","Bearer "+token).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(faqSuggestions.statusCode()).isEqualTo(200);assertThat(faqSuggestions.body()).contains("trendingTerms").contains("trendingTopics");

        var mentorLogin=http.send(HttpRequest.newBuilder(uri("/api/auth/login")).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"joao@ifpe.edu.br\",\"password\":\"senha123\"}")).build(),HttpResponse.BodyHandlers.ofString());
        assertThat(mentorLogin.statusCode()).isEqualTo(200);
        var mentorToken=mentorLogin.body().replaceFirst(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*","$1");
        var mentorContacts=http.send(HttpRequest.newBuilder(uri("/api/chat/contacts")).header("Authorization","Bearer "+mentorToken).GET().build(),HttpResponse.BodyHandlers.ofString());
        assertThat(mentorContacts.statusCode()).isEqualTo(200);assertThat(mentorContacts.body()).contains("Ana Souza").contains("Lucas Oliveira");
    }
    private URI uri(String path){return URI.create("http://localhost:"+port+path);}
}
