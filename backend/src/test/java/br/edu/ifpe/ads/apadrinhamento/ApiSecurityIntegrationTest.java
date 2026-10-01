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
    }
    private URI uri(String path){return URI.create("http://localhost:"+port+path);}
}
