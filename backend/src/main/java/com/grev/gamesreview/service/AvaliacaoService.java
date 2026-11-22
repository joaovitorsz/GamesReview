package com.grev.gamesreview.service;


import com.grev.gamesreview.DTO.AvaliacaoRequestDTO;
import com.grev.gamesreview.DTO.AvaliacaoResponseDTO;
import com.grev.gamesreview.DTO.AvaliacaoUpdateDTO;
import com.grev.gamesreview.model.Avaliacao;
import com.grev.gamesreview.model.Role;
import com.grev.gamesreview.model.Usuario;
import com.grev.gamesreview.repository.AvaliacoesRepository;
import com.grev.gamesreview.repository.GameRepository;
import com.grev.gamesreview.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AvaliacaoService {

    private final GameRepository gameRepository;
    private final AvaliacoesRepository avaliacoesRepository;
    private final UsuarioRepository usuarioRepository;

    public AvaliacaoService(GameRepository gameRepository, AvaliacoesRepository avaliacoesRepository, UsuarioRepository usuarioRepository){
        this.gameRepository = gameRepository;
        this.avaliacoesRepository = avaliacoesRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario obterUsuarioLogado(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()){
            throw new AccessDeniedException("Usuário não autenticado.");
        }
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuário autenticado não encontrado."));
    }

    @Transactional(readOnly = true)
    public Optional<List<AvaliacaoResponseDTO>> listarPorJogo(Long gameId){
        return gameRepository.findById(gameId).map(game ->
                game.getAvaliacoes().stream()
                        .map(AvaliacaoResponseDTO::new)
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public Optional<AvaliacaoResponseDTO> buscarPorId(Long idAvaliacao){
        return avaliacoesRepository.findById(idAvaliacao)
                .map(AvaliacaoResponseDTO::new);
    }

    public Optional<AvaliacaoResponseDTO> gravarAvaliacao(Long gameId, AvaliacaoRequestDTO dados){

        if (dados == null){
            throw new IllegalArgumentException("As informações da avaliação são obrigatórias. Preencha corretamente.");
        }
        if (dados.avaliador() == null || dados.avaliador().isBlank()){
            throw new IllegalArgumentException("O nome do avaliador é obrigatório. Preencha corretamente.");
        }
        if (dados.nota() == null || dados.nota() < 0 || dados.nota() > 10){
            throw new IllegalArgumentException("A nota é obrigatória e deve estar entre 0 e 10.");
        }
        if (dados.comentario() == null || dados.comentario().isBlank()){
            throw new IllegalArgumentException("O comentário é obrigatório. Preencha corretamente.");
        }

        Usuario usuarioLogado = obterUsuarioLogado();

        return gameRepository.findById(gameId).map(game -> {

            Avaliacao novaAvaliacao = new Avaliacao();
            novaAvaliacao.setAvaliador(dados.avaliador().trim());
            novaAvaliacao.setNota(dados.nota());
            novaAvaliacao.setComentario(dados.comentario().trim());
            novaAvaliacao.setGame(game);
            novaAvaliacao.setUsuario(usuarioLogado);

            Avaliacao avaliacaoSalva = avaliacoesRepository.save(novaAvaliacao);
            return new AvaliacaoResponseDTO(avaliacaoSalva);
        });
    }

    public Optional<AvaliacaoResponseDTO> editarAvaliacao(Long idAvaliacao, AvaliacaoUpdateDTO dados){

        if (dados == null){
            throw new IllegalArgumentException("Informe os dados para atualização");
        }
        if (dados.nota() != null && (dados.nota() < 0 || dados.nota() > 10)){
            throw new IllegalArgumentException("A nota deve estar entre 0 e 10.");
        }
        if (dados.comentario() != null && dados.comentario().isBlank()){
            throw new IllegalArgumentException("Insira um comentário para sua avaliação.");
        }

        Usuario usuarioLogado = obterUsuarioLogado();

        return avaliacoesRepository.findById(idAvaliacao).map(avaliacao -> {
            boolean uDono = avaliacao.getUsuario() != null
                    && avaliacao.getUsuario().getEmail().equals(usuarioLogado.getEmail());

            if(!uDono){
                throw new AccessDeniedException("Você só pode editar suas próprias avaliações.");
            }

            if (dados.nota() != null) avaliacao.setNota(dados.nota());
            if (dados.comentario() != null) avaliacao.setComentario(dados.comentario().trim());

            Avaliacao avaliacaoAtualizada = avaliacoesRepository.save(avaliacao);
            return new AvaliacaoResponseDTO(avaliacaoAtualizada);
        });
    }

    public Optional<String> deletarAvaliacao(Long idAvaliacao) {

        Usuario usuarioLogado = obterUsuarioLogado();

        return avaliacoesRepository.findById(idAvaliacao).map(avaliacao -> {
            boolean uDono = avaliacao.getUsuario() != null
                    && avaliacao.getUsuario().getEmail().equals(usuarioLogado.getEmail());
            boolean uAdmin = usuarioLogado.getRole() == Role.ADMIN;

            if(!uDono && !uAdmin){
                throw new AccessDeniedException("Você não tem permissão para remover esta avaliação.");
            }

            String nomeJogo = avaliacao.getGame().getTitulo();
            String avaliador = avaliacao.getAvaliador();

            avaliacoesRepository.delete(avaliacao);
            return "Olá " + avaliador + "! Sua avaliação de " + nomeJogo + " foi removida!";
        });

    }

}
