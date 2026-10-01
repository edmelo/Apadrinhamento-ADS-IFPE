package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ReviewRepository extends JpaRepository<Review,Long>{boolean existsByMentorshipId(Long mentorshipId);}
