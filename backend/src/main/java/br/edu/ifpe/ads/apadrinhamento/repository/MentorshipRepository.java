package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MentorshipRepository extends JpaRepository<Mentorship,Long>{List<Mentorship> findByMentorIdOrGodchildIdOrderByRequestedAtDesc(Long mentorId,Long godchildId);boolean existsByMentorIdAndGodchildIdAndStatusIn(Long mentorId,Long godchildId,Collection<MentorshipStatus> status);long countByStatus(MentorshipStatus status);List<Mentorship> findByStatusOrderByRequestedAtAsc(MentorshipStatus status);}
