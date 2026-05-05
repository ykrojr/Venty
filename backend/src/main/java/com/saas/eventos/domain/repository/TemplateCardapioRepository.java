package com.saas.eventos.domain.repository;

import com.saas.eventos.domain.model.TemplateCardapio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateCardapioRepository extends JpaRepository<TemplateCardapio, Long> {
    List<TemplateCardapio> findByTenantId(Long tenantId);
}
