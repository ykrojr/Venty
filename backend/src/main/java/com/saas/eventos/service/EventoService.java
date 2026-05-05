package com.saas.eventos.service;

import com.saas.eventos.api.dto.EventoDTO;
import com.saas.eventos.config.UsuarioAutenticado;
import com.saas.eventos.domain.model.Cliente;
import com.saas.eventos.domain.model.Evento;
import com.saas.eventos.domain.model.StatusEvento;
import com.saas.eventos.domain.model.Tenant;
import com.saas.eventos.domain.repository.ClienteRepository;
import com.saas.eventos.domain.repository.EventoRepository;
import com.saas.eventos.domain.repository.TenantRepository;
import com.saas.eventos.exception.AcessoNegadoException;
import com.saas.eventos.exception.ClienteNotFoundException;
import com.saas.eventos.exception.EventoNotFoundException;
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
    private final ClienteRepository clienteRepository;

    private Long getCurrentTenantId() {
        UsuarioAutenticado auth = (UsuarioAutenticado) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getTenantId();
    }

    private Evento buscarEventoValidado(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        
        if (!evento.getTenant().getId().equals(getCurrentTenantId())) {
            throw new AcessoNegadoException("Este evento pertence a outra empresa.");
        }
        return evento;
    }

    public List<EventoDTO> listarEventosDoCliente() {
        Long tenantId = getCurrentTenantId();
        List<Evento> eventos = eventoRepository.findByTenantId(tenantId);
        return eventos.stream().map(EventoDTO::fromEntity).collect(Collectors.toList());
    }

    public EventoDTO buscarPorId(Long id) {
        return EventoDTO.fromEntity(buscarEventoValidado(id));
    }

    public EventoDTO criarEvento(EventoDTO dto) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));

        Evento evento = new Evento();
        evento.setNome(dto.getNome());
        
        if (dto.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ClienteNotFoundException(dto.getClienteId()));
            if (!cliente.getTenant().getId().equals(tenantId)) {
                throw new AcessoNegadoException("Cliente inválido.");
            }
            evento.setCliente(cliente);
        }

        evento.setData(dto.getData());
        evento.setHora(dto.getHora());
        evento.setPacote(dto.getPacote());
        evento.setDetalhes(dto.getDetalhes());
        evento.setLocal(dto.getLocal());
        evento.setPrecoBase(dto.getPrecoBase());
        evento.setDesconto(dto.getDesconto());
        evento.setValorEntrada(dto.getValorEntrada());
        if (dto.getStatus() != null) {
            evento.setStatus(dto.getStatus());
        } else {
            evento.setStatus(StatusEvento.PLANEJAMENTO);
        }
        evento.setTenant(tenant);

        Evento eventoSalvo = eventoRepository.save(evento);
        return EventoDTO.fromEntity(eventoSalvo);
    }

    public EventoDTO editarEvento(Long id, EventoDTO dto) {
        Evento evento = buscarEventoValidado(id);

        evento.setNome(dto.getNome());

        if (dto.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ClienteNotFoundException(dto.getClienteId()));
            if (!cliente.getTenant().getId().equals(getCurrentTenantId())) {
                throw new AcessoNegadoException("Cliente inválido.");
            }
            evento.setCliente(cliente);
        } else {
            evento.setCliente(null);
        }

        evento.setData(dto.getData());
        evento.setHora(dto.getHora());
        evento.setPacote(dto.getPacote());
        evento.setDetalhes(dto.getDetalhes());
        evento.setLocal(dto.getLocal());
        evento.setPrecoBase(dto.getPrecoBase());
        evento.setDesconto(dto.getDesconto());
        evento.setValorEntrada(dto.getValorEntrada());

        if (dto.getStatus() != null) {
            evento.setStatus(dto.getStatus());
        }

        Evento eventoAtualizado = eventoRepository.save(evento);
        return EventoDTO.fromEntity(eventoAtualizado);
    }

    public void excluirEvento(Long id) {
        Evento evento = buscarEventoValidado(id);
        eventoRepository.delete(evento);
    }

    public EventoDTO mudarStatus(Long id, StatusEvento novoStatus) {
        Evento evento = buscarEventoValidado(id);
        evento.setStatus(novoStatus);
        
        // Mantendo compatibilidade com campo "concluido" antigo (opcional, pode ser removido no futuro)
        if (novoStatus == StatusEvento.CONCLUIDO) {
            evento.setConcluido(true);
        } else {
            evento.setConcluido(false);
        }

        Evento eventoAtualizado = eventoRepository.save(evento);
        return EventoDTO.fromEntity(eventoAtualizado);
    }
}
