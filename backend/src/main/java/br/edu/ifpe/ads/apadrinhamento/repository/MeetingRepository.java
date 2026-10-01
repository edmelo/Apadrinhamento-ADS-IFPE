package br.edu.ifpe.ads.apadrinhamento.repository;
import br.edu.ifpe.ads.apadrinhamento.domain.Meeting;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface MeetingRepository extends JpaRepository<Meeting,Long>{@Query("select m from Meeting m where m.mentorship.mentor.id=:id or m.mentorship.godchild.id=:id order by m.startsAt") List<Meeting> findForUser(@Param("id")Long id);}
