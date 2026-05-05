package com.saas.eventos.service;

import com.saas.eventos.api.dto.TemplateCardapioDTO;
import com.saas.eventos.api.dto.TemplateItemDTO;
import com.saas.eventos.api.dto.TemplateItemDTO.TemplateSubProdutoDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.*;
import com.saas.eventos.domain.repository.EventoRepository;
import com.saas.eventos.domain.repository.ProdutoRepository;
import com.saas.eventos.domain.repository.TemplateCardapioRepository;
import com.saas.eventos.domain.repository.TenantRepository;
import com.saas.eventos.exception.AcessoNegadoException;
import com.saas.eventos.exception.EventoNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateCardapioService {

    private final TemplateCardapioRepository templateRepository;
    private final TenantRepository tenantRepository;
    private final EventoRepository eventoRepository;
    private final ProdutoRepository produtoRepository;

    private Long getCurrentTenantId() {
        UsuarioAutenticado auth = (UsuarioAutenticado) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getTenantId();
    }

    public List<TemplateCardapioDTO> listar() {
        return templateRepository.findByTenantId(getCurrentTenantId()).stream()
                .map(TemplateCardapioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TemplateCardapioDTO criar(TemplateCardapioDTO dto) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));

        TemplateCardapio template = new TemplateCardapio();
        template.setNome(dto.getNome());
        template.setTenant(tenant);

        if (dto.getItens() != null) {
            for (TemplateItemDTO itemDto : dto.getItens()) {
                TemplateItem item = new TemplateItem();
                item.setNome(itemDto.getNome());
                item.setTemplate(template);
                
                if (itemDto.getSubprodutos() != null) {
                    for (TemplateSubProdutoDTO sDto : itemDto.getSubprodutos()) {
                        TemplateSubProduto s = TemplateSubProduto.builder()
                                .nome(sDto.getNome())
                                .precoUnitario(sDto.getPrecoUnitario())
                                .quantidade(sDto.getQuantidade())
                                .ehFuncionario(sDto.isEhFuncionario())
                                .templateItem(item)
                                .build();
                        item.getSubprodutos().add(s);
                    }
                }
                
                template.getItens().add(item);
            }
        }

        return TemplateCardapioDTO.fromEntity(templateRepository.save(template));
    }

    @Transactional
    public void aplicarTemplateAoEvento(Long templateId, Long eventoId) {
        TemplateCardapio template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        
        if (!template.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Acesso negado ao template.");
        }

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EventoNotFoundException(eventoId));
        
        if (!evento.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Acesso negado ao evento.");
        }

        for (TemplateItem item : template.getItens()) {
            Produto p = new Produto();
            p.setNome(item.getNome());
            p.setEvento(evento);
            
            for (TemplateSubProduto ts : item.getSubprodutos()) {
                SubProduto sp = SubProduto.builder()
                        .nome(ts.getNome())
                        .precoUnitario(ts.getPrecoUnitario())
                        .quantidade(ts.getQuantidade())
                        .ehFuncionario(ts.isEhFuncionario())
                        .produto(p)
                        .build();
                p.getSubprodutos().add(sp);
            }
            
            produtoRepository.save(p);
        }
    }

    @Transactional
    public void excluir(Long id) {
        TemplateCardapio template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        
        if (!template.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Acesso negado.");
        }
        
        templateRepository.delete(template);
    }
}
