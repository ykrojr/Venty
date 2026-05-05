package com.saas.eventos.service;

import com.saas.eventos.api.dto.ClienteDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.Cliente;
import com.saas.eventos.domain.model.Tenant;
import com.saas.eventos.domain.repository.ClienteRepository;
import com.saas.eventos.domain.repository.TenantRepository;
import com.saas.eventos.exception.AcessoNegadoException;
import com.saas.eventos.exception.ClienteNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final TenantRepository tenantRepository;

    private Long getCurrentTenantId() {
        UsuarioAutenticado auth = (UsuarioAutenticado) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getTenantId();
    }

    private Cliente buscarClienteValidado(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));
                
        if (!cliente.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Este cliente pertence a outra empresa.");
        }
        return cliente;
    }

    public List<ClienteDTO> listarClientesDoTenant() {
        return clienteRepository.findByTenantId(getCurrentTenantId())
                .stream().map(ClienteDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ClienteDTO buscarPorId(Long id) {
        return ClienteDTO.fromEntity(buscarClienteValidado(id));
    }

    public ClienteDTO criarCliente(ClienteDTO dto) {
        Tenant tenant = tenantRepository.findById(getCurrentTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));

        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setCpf(dto.getCpf());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEmail(dto.getEmail());
        cliente.setEndereco(dto.getEndereco());
        cliente.setTenant(tenant);

        return ClienteDTO.fromEntity(clienteRepository.save(cliente));
    }

    public ClienteDTO editarCliente(Long id, ClienteDTO dto) {
        Cliente cliente = buscarClienteValidado(id);

        cliente.setNome(dto.getNome());
        cliente.setCpf(dto.getCpf());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEmail(dto.getEmail());
        cliente.setEndereco(dto.getEndereco());

        return ClienteDTO.fromEntity(clienteRepository.save(cliente));
    }

    public void excluirCliente(Long id) {
        Cliente cliente = buscarClienteValidado(id);
        clienteRepository.delete(cliente);
    }
}
