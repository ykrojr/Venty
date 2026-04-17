package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.Produto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ProdutoDTO {
    private Long id;
    private String nome;
    private BigDecimal custoMateriais;
    private BigDecimal custoFuncionarios;
    private BigDecimal custoTotal;
    private List<SubProdutoDTO> subprodutos;

    public static ProdutoDTO fromEntity(Produto p) {
        return ProdutoDTO.builder()
                .id(p.getId())
                .nome(p.getNome())
                .custoMateriais(p.cacularCustoMateriais())
                .custoFuncionarios(p.calcularCustoFuncionarios())
                .custoTotal(p.calcularCustoTotal())
                .subprodutos(p.getSubprodutos().stream().map(SubProdutoDTO::fromEntity).collect(Collectors.toList()))
                .build();
    }
}
