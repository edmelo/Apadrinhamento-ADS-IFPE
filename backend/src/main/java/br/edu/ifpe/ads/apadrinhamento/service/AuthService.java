package br.edu.ifpe.ads.apadrinhamento.service;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.*;

@Service
public class AuthService {
    private final UserRepository users; private final PasswordEncoder passwords; private final JwtEncoder jwt; private final long tokenHours;
    public AuthService(UserRepository users,PasswordEncoder passwords,JwtEncoder jwt,@Value("${app.token-hours}")long tokenHours){this.users=users;this.passwords=passwords;this.jwt=jwt;this.tokenHours=tokenHours;}
    public UserAccount register(String name,String email,String password,Role role){var normalizedName=name==null?"":name.trim();var normalizedEmail=email==null?"":email.trim();var normalizedPassword=password==null?"":password.trim();if(normalizedName.isBlank())throw new IllegalArgumentException("Nome é obrigatório");if(normalizedEmail.isBlank())throw new IllegalArgumentException("E-mail é obrigatório");if(normalizedPassword.length()<6)throw new IllegalArgumentException("Senha deve ter pelo menos 6 caracteres");if(role==Role.ADMIN)throw new IllegalArgumentException("Administrador não pode ser criado pelo cadastro público");if(users.findByEmailIgnoreCase(normalizedEmail).isPresent())throw new IllegalArgumentException("E-mail já cadastrado");return users.save(new UserAccount(normalizedName,normalizedEmail,passwords.encode(normalizedPassword),role));}
    public UserAccount authenticate(String email,String password){var normalizedEmail=email==null?"":email.trim();var normalizedPassword=password==null?"":password;var user=users.findByEmailIgnoreCase(normalizedEmail).orElseThrow(()->new IllegalArgumentException("E-mail ou senha inválidos"));if(!user.isActive()||!passwords.matches(normalizedPassword,user.getPasswordHash()))throw new IllegalArgumentException("E-mail ou senha inválidos");return user;}
    public String token(UserAccount user){var now=Instant.now();var claims=JwtClaimsSet.builder().issuer("apadrinhamento-ads-ifpe").issuedAt(now).expiresAt(now.plus(Duration.ofHours(tokenHours))).subject(user.getEmail()).claim("uid",user.getId()).claim("name",user.getName()).claim("roles",java.util.List.of(user.getRole().name())).build();return jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue();}
    public UserAccount current(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));}
}
