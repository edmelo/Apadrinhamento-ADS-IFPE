package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UserRepository extends JpaRepository<UserAccount,Long>{Optional<UserAccount> findByEmailIgnoreCase(String email);List<UserAccount> findByRoleAndActiveTrue(Role role);long countByRole(Role role);}
