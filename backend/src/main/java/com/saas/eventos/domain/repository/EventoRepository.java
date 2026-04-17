package com.saas.eventos.domain.repository;

import com.saas.eventos.domain.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    // Busca todos os eventos APENAS do Tenant (Cliente) logado atualmente.
    // Isso garante que um cliente jamais veja os eventos de outro.
    List<Evento> findByTenantId(Long tenantId);
}
