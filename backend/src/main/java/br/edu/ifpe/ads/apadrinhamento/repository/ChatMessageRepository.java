package br.edu.ifpe.ads.apadrinhamento.repository;

import br.edu.ifpe.ads.apadrinhamento.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByMentorshipIdOrderByCreatedAtAsc(Long mentorshipId);
}
