package com.saas.eventos.service;

import com.saas.eventos.api.dto.ProdutoDTO;
import com.saas.eventos.api.dto.SubProdutoDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.Evento;
import com.saas.eventos.domain.model.Produto;
import com.saas.eventos.domain.model.SubProduto;
import com.saas.eventos.domain.repository.EventoRepository;
import com.saas.eventos.domain.repository.ProdutoRepository;
import com.saas.eventos.exception.AcessoNegadoException;
import com.saas.eventos.exception.EventoNotFoundException;
import com.saas.eventos.exception.ProdutoNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    private Evento buscarEventoValidado(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EventoNotFoundException(eventoId));
        
        if (!evento.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Este evento pertence a outra empresa.");
        }
        return evento;
    }

    public List<ProdutoDTO> listarProdutosDoEvento(Long eventoId) {
        buscarEventoValidado(eventoId);

        return produtoRepository.findByEventoId(eventoId)
                .stream().map(ProdutoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ProdutoDTO salvarProdutoNoEvento(Long eventoId, ProdutoDTO dto) {
        Evento evento = buscarEventoValidado(eventoId);

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

    public ProdutoDTO editarProduto(Long eventoId, Long produtoId, ProdutoDTO dto) {
        buscarEventoValidado(eventoId); // Garante que tem acesso ao evento
        
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ProdutoNotFoundException(produtoId));
                
        if (!produto.getEvento().getId().equals(eventoId)) {
            throw new AcessoNegadoException("Este produto não pertence ao evento informado.");
        }

        produto.setNome(dto.getNome());

        // Limpa subprodutos antigos e adiciona os novos para simplificar a edição no frontend
        produto.getSubprodutos().clear();
        
        if (dto.getSubprodutos() != null) {
            for (SubProdutoDTO sDto : dto.getSubprodutos()) {
                SubProduto sp = new SubProduto();
                sp.setNome(sDto.getNome());
                sp.setPrecoUnitario(sDto.getPrecoUnitario());
                sp.setQuantidade(sDto.getQuantidade());
                sp.setEhFuncionario(sDto.isEhFuncionario());
                sp.setProduto(produto);
                produto.getSubprodutos().add(sp);
            }
        }

        Produto salvo = produtoRepository.save(produto);
        return ProdutoDTO.fromEntity(salvo);
    }

    public void removerProduto(Long eventoId, Long produtoId) {
        buscarEventoValidado(eventoId); // Garante acesso e tenant

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ProdutoNotFoundException(produtoId));
        
        if (!produto.getEvento().getId().equals(eventoId)) {
            throw new AcessoNegadoException("Sem permissão para remover este produto.");
        }
        
        produtoRepository.delete(produto);
    }
}
