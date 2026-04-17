package com.saas.eventos.service;

import com.saas.eventos.api.dto.ProdutoDTO;
import com.saas.eventos.api.dto.SubProdutoDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.Evento;
import com.saas.eventos.domain.model.Produto;
import com.saas.eventos.domain.model.SubProduto;
import com.saas.eventos.domain.repository.EventoRepository;
import com.saas.eventos.domain.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final EventoRepository eventoRepository;

    private Long getCurrentTenantId() {
        UsuarioAutenticado auth = (UsuarioAutenticado) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getTenantId();
    }

    /**
     * Lista os produtos de um evento específico (validando que pertence ao tenant logado)
     */
    public List<ProdutoDTO> listarProdutosDoEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        
        if (!evento.getTenant().getId().equals(getCurrentTenantId())) {
            throw new RuntimeException("Sem permissão para acessar este evento.");
        }

        return produtoRepository.findByEventoId(eventoId)
                .stream().map(ProdutoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Salva um produto DENTRO de um evento específico
     */
    public ProdutoDTO salvarProdutoNoEvento(Long eventoId, ProdutoDTO dto) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        if (!evento.getTenant().getId().equals(getCurrentTenantId())) {
            throw new RuntimeException("Sem permissão para acessar este evento.");
        }

        Produto p = new Produto();
        p.setNome(dto.getNome());
        p.setEvento(evento);

        if (dto.getSubprodutos() != null) {
            for (SubProdutoDTO sDto : dto.getSubprodutos()) {
                SubProduto sp = new SubProduto();
                sp.setNome(sDto.getNome());
                sp.setPrecoUnitario(sDto.getPrecoUnitario());
                sp.setQuantidade(sDto.getQuantidade());
                sp.setEhFuncionario(sDto.isEhFuncionario());
                sp.setProduto(p);
                p.getSubprodutos().add(sp);
            }
        }

        Produto salvo = produtoRepository.save(p);
        return ProdutoDTO.fromEntity(salvo);
    }

    /**
     * Remove um produto pelo ID (validando tenant)
     */
    public void removerProduto(Long produtoId) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        
        if (!produto.getEvento().getTenant().getId().equals(getCurrentTenantId())) {
            throw new RuntimeException("Sem permissão para remover este produto.");
        }
        
        produtoRepository.delete(produto);
    }
}
