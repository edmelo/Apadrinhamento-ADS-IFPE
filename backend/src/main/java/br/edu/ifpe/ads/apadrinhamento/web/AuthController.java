package br.edu.ifpe.ads.apadrinhamento.web;

import br.edu.ifpe.ads.apadrinhamento.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import static br.edu.ifpe.ads.apadrinhamento.web.ApiDtos.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth; public AuthController(AuthService auth){this.auth=auth;}
    @PostMapping("/register") AuthResponse register(@Valid @RequestBody RegisterRequest r){var u=auth.register(r.name(),r.email(),r.password(),r.role());return new AuthResponse(auth.token(u),UserView.of(u));}
    @PostMapping("/login") AuthResponse login(@Valid @RequestBody LoginRequest r){var u=auth.authenticate(r.email(),r.password());return new AuthResponse(auth.token(u),UserView.of(u));}
    @GetMapping("/me") UserView me(Principal p){return UserView.of(auth.current(p.getName()));}
}
