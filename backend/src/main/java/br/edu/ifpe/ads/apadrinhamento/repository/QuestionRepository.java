package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface QuestionRepository extends JpaRepository<Question,Long>{List<Question> findByVisibleTrueOrderByCreatedAtDesc();}
