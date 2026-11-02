package br.edu.ifpe.ads.apadrinhamento.repository;

import br.edu.ifpe.ads.apadrinhamento.domain.Meeting;
import br.edu.ifpe.ads.apadrinhamento.domain.MeetingStatus;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.*;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    @Query("select m from Meeting m where m.mentorship.mentor.id=:id or m.mentorship.godchild.id=:id order by m.startsAt")
    List<Meeting> findForUser(@Param("id") Long id);
     
    //Encontros ativos de um padrinho específico (para checar sobreposição)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Meeting m where m.mentorship.mentor.id = :mentorId and m.status in :statuses")
    List<Meeting> findByMentorshipMentorIdAndStatusIn(@Param("mentorId") Long mentorId, @Param("statuses") List<MeetingStatus> statuses);
    // // Encontros ativos de um afilhado específico (para checar sobreposição)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Meeting m where m.mentorship.godchild.id = :godchildId and m.status in :statuses")
    List<Meeting> findByMentorshipGodchildIdAndStatusIn(@Param("godchildId") Long godchildId, @Param("statuses") List<MeetingStatus> statuses);
    }
