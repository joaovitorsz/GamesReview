package com.grev.gamesreview.service;

import com.grev.gamesreview.DTO.AuthResponseDTO;
import com.grev.gamesreview.DTO.UsuarioUpdateDTO;
import com.grev.gamesreview.model.Usuario;
import com.grev.gamesreview.repository.AvaliacoesRepository;
import com.grev.gamesreview.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AvaliacoesRepository avaliacoesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            AvaliacoesRepository avaliacoesRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.avaliacoesRepository = avaliacoesRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO editarPerfil(Usuario usuarioLogado, UsuarioUpdateDTO dados){
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow( () -> new IllegalArgumentException("Usuário não encontrado."));

        if (dados.nome() != null && !dados.nome().isBlank()){
            usuario.setNome(dados.nome().trim());
        }

        if(dados.email() != null && !dados.email().isBlank()) {
            String novoEmail = dados.email().trim();

            if(!novoEmail.equalsIgnoreCase(usuario.getEmail())) {
                if (usuarioRepository.existsByEmail(novoEmail)) {
                    throw new IllegalArgumentException("Este email já está em uso por outra conta.");
                }
                usuario.setEmail(novoEmail);
            }
        }

        if (dados.senha() != null && !dados.senha().isBlank()) {
            if(dados.senha().trim().length() < 6){
                throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres.");
            }
            usuario.setSenha(passwordEncoder.encode(dados.senha()));
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        String novoToken = jwtService.gerarToken(usuarioAtualizado);

        return new AuthResponseDTO(
                novoToken,
                usuarioAtualizado.getNome(),
                usuarioAtualizado.getEmail(),
                usuarioAtualizado.getRole()
        );

    }

    public String deletarConta(Usuario usuarioLogado){
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        String nome = usuario.getNome();
        avaliacoesRepository.desvincularUsuario(usuario.getId());
        usuarioRepository.delete(usuario);

        return "Olá, " + nome + "! Sua conta foi excluída com sucesso.";
    }

}
