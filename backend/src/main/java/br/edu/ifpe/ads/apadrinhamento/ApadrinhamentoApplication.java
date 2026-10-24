package br.edu.ifpe.ads.apadrinhamento;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class ApadrinhamentoApplication {
    public static void main(String[] args) {
        // Os horários dos encontros são LocalDateTime; o servidor precisa usar o mesmo fuso dos estudantes.
        TimeZone.setDefault(TimeZone.getTimeZone(System.getenv().getOrDefault("APP_TIMEZONE", "America/Recife")));
        SpringApplication.run(ApadrinhamentoApplication.class, args);
    }
}
