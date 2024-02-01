package com.ssafy.fiveguys.game.player.api;



import com.ssafy.fiveguys.game.player.dto.PlayerDto;
import com.ssafy.fiveguys.game.player.dto.api.ApiResponse;
import com.ssafy.fiveguys.game.player.entity.Player;
import com.ssafy.fiveguys.game.player.service.PlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/player")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PlayerApiController {

    private final PlayerService playerService;


    @GetMapping("/{playerSequence}")
    public ApiResponse getPlayerInfo(@PathVariable("playerSequence") Long playerSequence) {


        Player player = playerService.getPlayerInfo(playerSequence);
        if(player == null) return null;
        int totalPlayerCount = playerService.playerTotalCount();

        PlayerDto playerDto = new PlayerDto(playerSequence, player.getTotalRound(),
            player.getTotalTurn(), player.getRankingScore(), player.getExp(),
            player.getPlayerLevel());

        return new ApiResponse(1, playerDto, totalPlayerCount);

    }

}
