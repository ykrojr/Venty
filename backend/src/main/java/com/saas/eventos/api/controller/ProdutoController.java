package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.ProdutoDTO;
import com.saas.eventos.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/eventos/{eventoId}/produtos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Operation(summary = "Lista os produtos/cardápios de um evento específico")
    @GetMapping
    public ResponseEntity<List<ProdutoDTO>> listar(@PathVariable Long eventoId) {
        return ResponseEntity.ok(produtoService.listarProdutosDoEvento(eventoId));
    }

    @Operation(summary = "Adiciona um produto/cardápio a um evento específico")
    @PostMapping
    public ResponseEntity<ProdutoDTO> criar(@PathVariable Long eventoId, @Valid @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.salvarProdutoNoEvento(eventoId, dto));
    }

    @Operation(summary = "Atualiza os dados de um produto existente e seus subprodutos")
    @PutMapping("/{produtoId}")
    public ResponseEntity<ProdutoDTO> editar(@PathVariable Long eventoId, @PathVariable Long produtoId, @Valid @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.editarProduto(eventoId, produtoId, dto));
    }

    @Operation(summary = "Remove um produto de um evento")
    @DeleteMapping("/{produtoId}")
    public ResponseEntity<Void> remover(@PathVariable Long eventoId, @PathVariable Long produtoId) {
        produtoService.removerProduto(eventoId, produtoId);
        return ResponseEntity.noContent().build();
    }
}
