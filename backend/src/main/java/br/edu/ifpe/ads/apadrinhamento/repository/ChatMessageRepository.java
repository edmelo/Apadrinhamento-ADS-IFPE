package br.edu.ifpe.ads.apadrinhamento.repository;

import br.edu.ifpe.ads.apadrinhamento.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByMentorshipIdOrderByCreatedAtAsc(Long mentorshipId);
    Optional<ChatMessage> findTopByMentorshipIdOrderByCreatedAtDesc(Long mentorshipId);
    long countByMentorshipId(Long mentorshipId);
}
