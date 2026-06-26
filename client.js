import { Teams, Players, Timers, GameMode, Ui, Properties, Map } from 'pixel_combats/room';

var mainTeam = Teams.Get("Blue");
var enemyTeam = Teams.Get("Red");

mainTeam.Spawns.SpawnsConfig.Value = 1;
enemyTeam.Spawns.SpawnsConfig.Value = 1;

mainTeam.Properties.Get("Deaths").Value = 0;
enemyTeam.Properties.Get("Deaths").Value = 0;

var matchTimer = Timers.GetContext().Get("MatchTimer");
matchTimer.OnTimer.Add(function() {
    GameMode.ExitToLobby();
});

Players.OnPlayerConnect.Add(function(player) {
    if (mainTeam.Count <= enemyTeam.Count) {
        mainTeam.Add(player);
    } else {
        enemyTeam.Add(player);
    }
});

Players.OnPlayerSpawn.Add(function(player) {
    player.Properties.Get("Scores").Value = 0;
});

Players.OnDeath.Add(function(player, killedBy) {
    if (player.Team != null) {
        player.Team.Properties.Get("Deaths").Value++;
    }
    if (killedBy != null && killedBy.Team != null && killedBy.Team != player.Team) {
        killedBy.Properties.Get("Scores").Value += 10;
    }
    player.Spawns.Spawn();
});

GameMode.OnStart.Add(function() {
    matchTimer.Restart(300);
});
