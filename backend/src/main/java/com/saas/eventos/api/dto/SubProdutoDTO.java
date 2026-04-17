package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.SubProduto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class SubProdutoDTO {
    private Long id;
    private String nome;
    private BigDecimal precoUnitario;
    private int quantidade;
    private boolean ehFuncionario;
    private BigDecimal custoTotalItem;

    public static SubProdutoDTO fromEntity(SubProduto s) {
        return SubProdutoDTO.builder()
                .id(s.getId())
                .nome(s.getNome())
                .precoUnitario(s.getPrecoUnitario())
                .quantidade(s.getQuantidade())
                .ehFuncionario(s.isEhFuncionario())
                .custoTotalItem(s.getTotalItem())
                .build();
    }
}
