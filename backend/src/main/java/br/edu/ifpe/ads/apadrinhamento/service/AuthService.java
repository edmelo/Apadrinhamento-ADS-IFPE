package br.edu.ifpe.ads.apadrinhamento.service;

import br.edu.ifpe.ads.apadrinhamento.domain.*;
import br.edu.ifpe.ads.apadrinhamento.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.regex.Pattern;

@Service
public class AuthService {
    static final Pattern INSTITUTIONAL_EMAIL=Pattern.compile("^[a-z0-9._%+-]+@([a-z0-9-]+\\.)*ifpe\\.edu\\.br$");
    static final Pattern PASSWORD=Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)\\S{8,64}$");
    private final UserRepository users; private final PasswordEncoder passwords; private final JwtEncoder jwt; private final long tokenHours;
    public AuthService(UserRepository users,PasswordEncoder passwords,JwtEncoder jwt,@Value("${app.token-hours}")long tokenHours){this.users=users;this.passwords=passwords;this.jwt=jwt;this.tokenHours=tokenHours;}
    public UserAccount register(String name,String email,String password,Role role){var normalizedName=name==null?"":name.trim().replaceAll("\\s+"," ");var normalizedEmail=email==null?"":email.trim().toLowerCase();var normalizedPassword=password==null?"":password;if(normalizedName.length()<3)throw new IllegalArgumentException("Informe seu nome completo");if(normalizedEmail.isBlank())throw new IllegalArgumentException("E-mail é obrigatório");if(!INSTITUTIONAL_EMAIL.matcher(normalizedEmail).matches())throw new IllegalArgumentException("Use seu e-mail institucional do IFPE (ex.: nome@discente.ifpe.edu.br)");if(!PASSWORD.matcher(normalizedPassword).matches())throw new IllegalArgumentException("A senha deve ter de 8 a 64 caracteres, sem espaços, com pelo menos uma letra e um número");if(role==null)throw new IllegalArgumentException("Selecione um perfil");if(role==Role.ADMIN)throw new IllegalArgumentException("Administrador não pode ser criado pelo cadastro público");if(users.findByEmailIgnoreCase(normalizedEmail).isPresent())throw new IllegalArgumentException("E-mail já cadastrado");return users.save(new UserAccount(normalizedName,normalizedEmail,passwords.encode(normalizedPassword),role));}
    public UserAccount authenticate(String email,String password){var normalizedEmail=email==null?"":email.trim();var normalizedPassword=password==null?"":password;var user=users.findByEmailIgnoreCase(normalizedEmail).orElseThrow(()->new IllegalArgumentException("E-mail ou senha inválidos"));if(!user.isActive()||!passwords.matches(normalizedPassword,user.getPasswordHash()))throw new IllegalArgumentException("E-mail ou senha inválidos");return user;}
    public String token(UserAccount user){var now=Instant.now();var claims=JwtClaimsSet.builder().issuer("apadrinhamento-ads-ifpe").issuedAt(now).expiresAt(now.plus(Duration.ofHours(tokenHours))).subject(user.getEmail()).claim("uid",user.getId()).claim("name",user.getName()).claim("roles",java.util.List.of(user.getRole().name())).build();return jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue();}
    public UserAccount current(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));}
}
