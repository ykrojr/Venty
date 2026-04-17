package com.saas.eventos.service;

import com.saas.eventos.api.dto.EventoDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.Evento;
import com.saas.eventos.domain.model.Tenant;
import com.saas.eventos.domain.repository.EventoRepository;
import com.saas.eventos.domain.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final TenantRepository tenantRepository;

    private Long getCurrentTenantId() {
        UsuarioAutenticado auth = (UsuarioAutenticado) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getTenantId();
    }

    public List<EventoDTO> listarEventosDoCliente() {
        Long tenantId = getCurrentTenantId();
        List<Evento> eventos = eventoRepository.findByTenantId(tenantId);
        return eventos.stream().map(EventoDTO::fromEntity).collect(Collectors.toList());
    }

    public EventoDTO criarEvento(EventoDTO dto) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));

        Evento evento = new Evento();
        evento.setNome(dto.getNome());
        evento.setCpf(dto.getCpf());
        evento.setCelular(dto.getCelular());
        evento.setEndereco(dto.getEndereco());
        evento.setEmail(dto.getEmail());
        evento.setData(dto.getData());
        evento.setHora(dto.getHora());
        evento.setPacote(dto.getPacote());
        evento.setDetalhes(dto.getDetalhes());
        evento.setPrecoBase(dto.getPrecoBase());
        evento.setDesconto(dto.getDesconto());
        evento.setValorEntrada(dto.getValorEntrada());
        evento.setTenant(tenant);

        Evento eventoSalvo = eventoRepository.save(evento);
        return EventoDTO.fromEntity(eventoSalvo);
    }
}
