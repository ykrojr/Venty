package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.TemplateCardapio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateCardapioDTO {
    private Long id;
    private String nome;
    private List<TemplateItemDTO> itens;

    public static TemplateCardapioDTO fromEntity(TemplateCardapio template) {
        return TemplateCardapioDTO.builder()
                .id(template.getId())
                .nome(template.getNome())
                .itens(template.getItens().stream().map(i -> TemplateItemDTO.builder()
                        .id(i.getId())
                        .nome(i.getNome())
                        .subprodutos(i.getSubprodutos().stream().map(s -> TemplateItemDTO.TemplateSubProdutoDTO.builder()
                                .id(s.getId())
                                .nome(s.getNome())
                                .precoUnitario(s.getPrecoUnitario())
                                .quantidade(s.getQuantidade())
                                .ehFuncionario(s.isEhFuncionario())
                                .build()).collect(Collectors.toList()))
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
