package com.saas.eventos.service;

import com.saas.eventos.api.dto.AuthRequest;
import com.saas.eventos.api.dto.AuthResponse;
import com.saas.eventos.api.dto.UsuarioDTO;
import com.saas.eventos.config.JwtTokenProvider;
import com.saas.eventos.domain.model.Tenant;
import com.saas.eventos.domain.model.Usuario;
import com.saas.eventos.domain.repository.TenantRepository;
import com.saas.eventos.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Credenciais inválidas.");
        }

        String token = tokenProvider.generateToken(usuario.getEmail(), usuario.getTenant().getId());
        return new AuthResponse(token, UsuarioDTO.fromEntity(usuario));
    }

    @Transactional
    public AuthResponse registrarEmpresa(String nomeEmpresa, String nomeAdmin, String email, String senha) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        // Cria o Tenant (espaço de trabalho da empresa)
        Tenant tenant = new Tenant();
        tenant.setNome(nomeEmpresa);
        Tenant tenantSalvo = tenantRepository.save(tenant);

        // Cria o usuário Admin deste Tenant
        Usuario usuario = new Usuario();
        usuario.setNome(nomeAdmin);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha)); // Nunca salva senha em texto plano
        usuario.setTenant(tenantSalvo);
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        String token = tokenProvider.generateToken(usuarioSalvo.getEmail(), tenantSalvo.getId());
        return new AuthResponse(token, UsuarioDTO.fromEntity(usuarioSalvo));
    }
}
