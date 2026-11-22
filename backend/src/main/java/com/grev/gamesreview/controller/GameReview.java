package com.grev.gamesreview.controller;

import com.grev.gamesreview.DTO.*;
import com.grev.gamesreview.service.AvaliacaoService;
import com.grev.gamesreview.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/game")
public class GameReview {
    private final GameService gameService;
    private final AvaliacaoService avaliacaoService;

    public GameReview(GameService gameService, AvaliacaoService avaliacaoService) {
        this.gameService = gameService;
        this.avaliacaoService = avaliacaoService;
    }

    // Gets

    @GetMapping("/review/listar-jogos")
    public ResponseEntity<List<GameResponseDTO>> listarJogos(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String genero,
            @RequestParam(required = false) Integer metacritic) {

        return ResponseEntity.ok(gameService.listarJogos(titulo, genero, metacritic));
    }

    @GetMapping("/review/jogo/{id}")
    public ResponseEntity<GameResponseDTO> buscarJogoPorId(
            @PathVariable Long id) {

        return gameService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/review/listar-avaliacoes/{gameId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> gameAvaliacoes(
            @PathVariable Long gameId) {

        return avaliacaoService.listarPorJogo(gameId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/review/avaliacao/{idAvaliacao}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarAvaliacaoPorId(
            @PathVariable Long idAvaliacao){

        return avaliacaoService.buscarPorId(idAvaliacao)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Posts

    @PostMapping("/review/gravar-jogo")
    public ResponseEntity<?> gravarJogo(
            @RequestBody GameRequestDTO dados) {

        try {
            return ResponseEntity.ok(gameService.gravarJogo(dados));
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/review/gravar-avaliacao/{gameId}")
    public ResponseEntity<?> gravarAvaliacao(
            @PathVariable Long gameId,
            @RequestBody AvaliacaoRequestDTO dados) {

            try {
                Optional<AvaliacaoResponseDTO> salva = avaliacaoService.gravarAvaliacao(gameId, dados);
                if (salva.isEmpty()){
                    return ResponseEntity.notFound().build();
                }
                return ResponseEntity.ok(salva.get());
            } catch (IllegalArgumentException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }

    // Puts

    @PutMapping("/review/editar-jogo/{gameId}")
    public ResponseEntity<GameResponseDTO> editarJogo(
            @PathVariable Long gameId,
            @RequestBody GameRequestDTO dados) {

        if (dados == null){
            return ResponseEntity.badRequest().build();
        }

        return gameService.editarJogo(gameId, dados)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/review/editar-avaliacao/{idAvaliacao}")
    public ResponseEntity<?> editarAvaliacao(
            @PathVariable Long idAvaliacao,
            @RequestBody AvaliacaoUpdateDTO dados) {

        try {
            Optional<AvaliacaoResponseDTO> atualizada = avaliacaoService.editarAvaliacao(idAvaliacao, dados);
            if (atualizada.isEmpty()){
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(atualizada.get());
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (AccessDeniedException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // Deletes

    @DeleteMapping("/review/deletar-jogo/{gameId}")
    public ResponseEntity<String> deletarJogo(
            @PathVariable Long gameId) {

        return gameService.deletarJogo(gameId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/review/deletar-avaliacao/{idAvaliacao}")
    public ResponseEntity<String> deletarAvaliacao(
            @PathVariable Long idAvaliacao) {

        try {
            return avaliacaoService.deletarAvaliacao(idAvaliacao)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (AccessDeniedException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

}

