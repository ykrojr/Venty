package com.saas.eventos.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateItemDTO {
    private Long id;
    private String nome;
    private List<TemplateSubProdutoDTO> subprodutos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateSubProdutoDTO {
        private Long id;
        private String nome;
        private BigDecimal precoUnitario;
        private int quantidade;
        private boolean ehFuncionario;
    }
}
