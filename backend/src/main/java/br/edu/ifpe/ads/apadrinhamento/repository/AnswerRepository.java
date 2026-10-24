package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AnswerRepository extends JpaRepository<Answer,Long>{List<Answer> findByQuestionIdAndVisibleTrueOrderByCreatedAt(Long questionId);long countByQuestionIdAndVisibleTrue(Long questionId);}
