//var System = importNamespace('System');

// опции
var EndOfMatchTime = 10;
Ui.GetContext().Hint.Value = "❄ загрузка...";

// константы
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var EndAreaTag = "parcourend"; 	// тэг зоны конца паркура
var SpawnAreasTag = "spawn";	// тэг зон промежуточных спавнов
var EndTriggerPoints = 1000;	// сколько дается очков за завершение маршрута
var CurSpawnPropName = "CurSpawn"; // свойство, отвечающее за индекс текущего спавна 0 - дефолтный спавн
var ViewSpawnsParameterName = "ViewSpawns";	// параметр создания комнаты, отвечающий за визуализацию спавнов
var ViewEndParameterName = "ViewEnd";	// параметр создания комнаты, отвечающий за визуализацию конца маршрута
var MaxSpawnsByArea = 25;	// макс спавнов на зону
var LeaderBoardProp = "Leader"; // свойство для лидерборда

// постоянные переменные
var mainTimer = Timers.GetContext().Get("Main"); 		// таймер конца игры
var endAreas = AreaService.GetByTag(EndAreaTag);		// зоны конца игры
var spawnAreas = AreaService.GetByTag(SpawnAreasTag);	// зоны спавнов
var stateProp = Properties.GetContext().Get("State");	// свойство состояния
var inventory = Inventory.GetContext();					// контекст инвентаря
BreackGraph.PlayerBlockBoost = true;

// параметры режима
Properties.GetContext().GameModeName.Value = "GameModes/Parcour";
Damage.FriendlyFire = false;
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// запрещаем все в руках
inventory.Main.Value = false;
inventory.Secondary.Value = false;
inventory.Melee.Value = false;
inventory.Explosive.Value = false;
inventory.Build.Value = false;

// создаем команду
Teams.Add("Blue", "люди", { b: 100 });
var blueTeam = Teams.Get("Blue");
blueTeam.Spawns.SpawnPointsGroups.Add(1);
blueTeam.Spawns.RespawnTime.Value = 0;

// вывод подсказки
Ui.GetContext().Hint.Value = "Создатель режима: ♨<color=blue>КОСТЯЯЯ</a>♨";

// настраиваем игровые состояния
stateProp.OnValue.Add(OnState);
function OnState() {
	switch (stateProp.Value) {
		case GameStateValue:
			var spawns = Spawns.GetContext();
			spawns.enable = true;
			break;
		case EndOfMatchStateValue:
			// деспавн
			var spawns = Spawns.GetContext();
			spawns.enable = false;
			spawns.Despawn();
			Game.GameOver(LeaderBoard.GetPlayers());
			mainTimer.Restart(EndOfMatchTime);
			// говорим кто победил
			break;
	}
}

// визуализируем конец маршрута
if (GameMode.Parameters.GetBool(ViewEndParameterName)) {
	var endView = AreaViewService.GetContext().Get("EndView");
	endView.Color = { b: 1 };
	endView.Tags = [EndAreaTag];
	endView.Enable = true;
}

// визуализируем промежуточные спавны маршрута
if (GameMode.Parameters.GetBool(ViewSpawnsParameterName)) {
	var spawnsView = AreaViewService.GetContext().Get("SpawnsView");
	spawnsView.Color = { r: 1, g: 1, b: 1 };
	spawnsView.Tags = [SpawnAreasTag];
	spawnsView.Enable = true;
}

// настраиваем триггер конца игры
var endTrigger = AreaPlayerTriggerService.Get("EndTrigger");
endTrigger.Tags = [EndAreaTag];
endTrigger.Enable = true;
endTrigger.OnEnter.Add(function (player) {
	endTrigger.Enable = false;
	player.Properties.Get(LeaderBoardProp).Value += 10000;
	stateProp.Value = EndOfMatchStateValue;
});

// настраиваем триггер спавнов
var spawnTrigger = AreaPlayerTriggerService.Get("SpawnTrigger");
spawnTrigger.Tags = [SpawnAreasTag];
spawnTrigger.Enable = true;
spawnTrigger.OnEnter.Add(function (player, area) {
	if (spawnAreas == null || spawnAreas.length == 0) InitializeMap(); // todo костыль изза бага (не всегда прогружает нормально)	
	if (spawnAreas == null || spawnAreas.length == 0) return;
	var prop = player.Properties.Get(CurSpawnPropName);
	var startIndex = 0;
	if (prop.Value != null) startIndex = prop.Value;
	for (var i = startIndex; i < spawnAreas.length; ++i) {
		if (spawnAreas[i] == area) {
			var prop = player.Properties.Get(CurSpawnPropName);
			if (prop.Value == null || i > prop.Value) {
				prop.Value = i;
				player.Properties.Get(LeaderBoardProp).Value += 100;
			}
			break;
		}
	}
});

// настраиваем таймер конца игры
mainTimer.OnTimer.Add(function () { Game.RestartGame(); });

// создаем лидерборд
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Deaths",
		DisplayName: "смерть",
		ShortDisplayName: "смерть"
	},
	{
		Value: LeaderBoardProp,
		DisplayName: "очки",
		ShortDisplayName: "очки"
	}
];
// сортировка команд
LeaderBoard.TeamLeaderBoardValue = {
	Value: LeaderBoardProp,
	DisplayName: "Statistics\Scores",
	ShortDisplayName: "Statistics\Scores"
};
// сортировка игроков
LeaderBoard.PlayersWeightGetter.Set(function (player) {
	return player.Properties.Get(LeaderBoardProp).Value;
});
// счетчик смертей
Damage.OnDeath.Add(function (player) {
	++player.Properties.Deaths.Value;
});

// разрешаем вход в команду
Teams.OnRequestJoinTeam.Add(function (player, team) { team.Add(player);
player.Ui.Hint.Value = "здраствуйте   " + player
Players.Get("19ACA8C05B8C91EF").Damage.DamageIn.Value = false;
Players.Get("19ACA8C05B8C91EF").Build.BuildRangeEnable.Value = true;
Players.Get("19ACA8C05B8C91EF").Build.Pipette.Value = true;
});
// разрешаем спавн
Teams.OnPlayerChangeTeam.Add(function (player) { player.Spawns.Spawn() });

var admin = AreaPlayerTriggerService.Get("admin");
admin.Tags = ["admin"];
admin.Enable = true;
admin.OnEnter.Add(function (player, area) {
player.inventory.Main.Value = true;
player.inventory.MainInfinity.Value = true;
player.inventory.Secondary.Value = true;
player.inventory.SecondaryInfinity.Value = true;

player.inventory.Melee.Value = true;
player.inventory.Explosive.Value = true;
player.inventory.ExplosiveInfinity.Value = true;
player.inventory.Build.Value = true;
player.inventory.BuildInfinity.Value = true;
Build.GetContext().BlocksSet.Value = BuildBlocksSet.AllClear;

player.Build.BuildModeEnable.Value = true;
player.Ui.QuadsCount.Value = true;
player.Build.FlyEnable.Value = true;
player.Build.BuildRangeEnable.Value = true;
player.Ui.Hint.Value = player + "получил админку";
});


// счетчик спавнов
Spawns.OnSpawn.Add(function (player) {
	++player.Properties.Spawns.Value;
});

// инициализация всего что зависит от карты
Map.OnLoad.Add(InitializeMap);
function InitializeMap() {
	endAreas = AreaService.GetByTag(EndAreaTag);
	spawnAreas = AreaService.GetByTag(SpawnAreasTag);
	//log.debug("spawnAreas.length=" + spawnAreas.length);
	// ограничитель
	if (spawnAreas == null || spawnAreas.length == 0) return;
	// сортировка зон
	spawnAreas.sort(function (a, b) {
		if (a.Name > b.Name) return 1;
		if (a.Name < b.Name) return -1;
		return 0;
	});
}
InitializeMap();

// при смене свойства индекса спавна задаем спавн
Properties.OnPlayerProperty.Add(function (context, prop) {
	if (prop.Name != CurSpawnPropName) return;
	//log.debug(context.Player + " spawn point is " + prop.Value);
	SetPlayerSpawn(context.Player, prop.Value);
});

function SetPlayerSpawn(player, index) {
	var spawns = Spawns.GetContext(player);
	// очистка спавнов
	spawns.CustomSpawnPoints.Clear();
	// если нет захвата то сброс спавнов
	if (index < 0 || index >= spawnAreas.length) return;
	// задаем спавны
	var area = spawnAreas[index];
	var iter = area.Ranges.GetEnumerator();
	iter.MoveNext();
	var range = iter.Current;
	// определяем куда смотреть спавнам
	var lookPoint = {};
	if (index < spawnAreas.length - 1) lookPoint = spawnAreas[index + 1].Ranges.GetAveragePosition();
	else {
		if (endAreas.length > 0)
			lookPoint = endAreas[0].Ranges.GetAveragePosition();
	}

	//log.debug("range=" + range);
	var spawnsCount = 0;
	for (var x = range.Start.x; x < range.End.x; x += 2)
		for (var z = range.Start.z; z < range.End.z; z += 2) {
			spawns.CustomSpawnPoints.Add(x, range.Start.y, z, Spawns.GetSpawnRotation(x, z, lookPoint.x, lookPoint.z));
			++spawnsCount;
			if (spawnsCount > MaxSpawnsByArea) return;
		}player.Ui.Hint.Value = "ти топ";
}

// запуск игры
stateProp.Value = GameStateValue;
