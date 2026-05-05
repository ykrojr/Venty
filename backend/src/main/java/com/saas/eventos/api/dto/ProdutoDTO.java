package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.Produto;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoDTO {
    private Long id;

    @NotBlank(message = "O nome do produto é obrigatório.")
    private String nome;

    private BigDecimal custoMateriais;
    private BigDecimal custoFuncionarios;
    private BigDecimal custoTotal;
    private List<SubProdutoDTO> subprodutos;

    public static ProdutoDTO fromEntity(Produto p) {
        return ProdutoDTO.builder()
                .id(p.getId())
                .nome(p.getNome())
                .custoMateriais(p.calcularCustoMateriais())
                .custoFuncionarios(p.calcularCustoFuncionarios())
                .custoTotal(p.calcularCustoTotal())
                .subprodutos(p.getSubprodutos().stream().map(SubProdutoDTO::fromEntity).collect(Collectors.toList()))
                .build();
    }
}
