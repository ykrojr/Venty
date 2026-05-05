package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.Cliente;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDTO {
    private Long id;

    @NotBlank(message = "O nome do cliente é obrigatório.")
    private String nome;

    private String cpf;
    private String telefone;
    private String email;
    private String endereco;

    public static ClienteDTO fromEntity(Cliente cliente) {
        return ClienteDTO.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cpf(cliente.getCpf())
                .telefone(cliente.getTelefone())
                .email(cliente.getEmail())
                .endereco(cliente.getEndereco())
                .build();
    }
}
