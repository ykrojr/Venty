package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.TemplateCardapioDTO;
import com.saas.eventos.service.TemplateCardapioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/templates-cardapio")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TemplateCardapioController {

    private final TemplateCardapioService templateService;

    @Operation(summary = "Lista todos os templates de cardápio da empresa")
    @GetMapping
    public ResponseEntity<List<TemplateCardapioDTO>> listar() {
        return ResponseEntity.ok(templateService.listar());
    }

    @Operation(summary = "Cria um novo template de cardápio")
    @PostMapping
    public ResponseEntity<TemplateCardapioDTO> criar(@RequestBody TemplateCardapioDTO dto) {
        return ResponseEntity.ok(templateService.criar(dto));
    }

    @Operation(summary = "Aplica os itens de um template a um evento específico")
    @PostMapping("/{id}/aplicar/{eventoId}")
    public ResponseEntity<Void> aplicar(@PathVariable Long id, @PathVariable Long eventoId) {
        templateService.aplicarTemplateAoEvento(id, eventoId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Exclui um template de cardápio")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        templateService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
