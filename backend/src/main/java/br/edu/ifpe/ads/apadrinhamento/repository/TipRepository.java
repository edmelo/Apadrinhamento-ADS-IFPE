package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.Tip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TipRepository extends JpaRepository<Tip,Long>{List<Tip> findByVisibleTrueOrderByCreatedAtDesc();}
