package br.edu.ifpe.ads.apadrinhamento.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
    @Bean JwtEncoder jwtEncoder(@Value("${app.jwt-secret}")String secret){var key=new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256");return new NimbusJwtEncoder(new ImmutableSecret<SecurityContext>(key));}
    @Bean JwtDecoder jwtDecoder(@Value("${app.jwt-secret}")String secret){var key=new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256");return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();}
    @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){var roles=new JwtGrantedAuthoritiesConverter();roles.setAuthoritiesClaimName("roles");roles.setAuthorityPrefix("ROLE_");var converter=new JwtAuthenticationConverter();converter.setJwtGrantedAuthoritiesConverter(roles);return converter;}
    @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationConverter converter)throws Exception{return http.csrf(csrf->csrf.disable()).cors(Customizer.withDefaults()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(a->a.requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().requestMatchers("/api/auth/login","/api/auth/register","/actuator/health").permitAll().anyRequest().authenticated()).oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(converter))).build();}
    @Bean CorsConfigurationSource corsConfigurationSource(){var c=new CorsConfiguration();c.setAllowedOriginPatterns(List.of("http://localhost:*","http://127.0.0.1:*","null"));c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("*"));var source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/**",c);return source;}
}
