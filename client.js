try {
    // 1. НАСТРОЙКА КОМАНД И ИГРЫ
    // Создаем стандартные команды для захода игроков
    Teams.Add("Blue", "СИНИЕ", new Color(0, 0, 1, 1));
    Teams.Add("Red", "КРАСНЫЕ", new Color(1, 0, 0, 1));

    // Получаем созданные команды в переменные для настройки свойств
    var blueTeam = Teams.Get("Blue");
    var redTeam = Teams.Get("Red");

    // Привязываем точки спавна из редактора карты к командам
    blueTeam.Spawns.Add(Spawns.GetContext().Get("BlueSpawn"));
    redTeam.Spawns.Add(Spawns.GetContext().Get("RedSpawn"));

    // Разрешаем игрокам одной команды наносить урон другой
    var damage = Damage.GetContext();
    damage.FriendlyFire = false; // Огонь по своим отключен

    // 2. ИГРОВЫЕ СОБЫТИЯ (ОБРАБОТЧИКИ)
    // Событие входа игрока на сервер
    Players.OnPlayerConnect.Add(function(player) {
        // Логика при подключении (например, выдача приветственных очков)
    });

    // Событие выбора команды игроком
    Players.OnQueue.Add(function(player) {
        // Автоматически отправляем игрока в синюю команду для теста
        blueTeam.Add(player); 
    });

    // Событие спавна (возрождения) игрока
    Spawns.OnSpawn.Add(function(player) {
        // Выдаем базовое оружие и инструмент для строительства
        player.Inventory.Main.Value = false;
        player.Inventory.Secondary.Value = false;
        player.Inventory.Melee.Value = true; // Разрешаем нож
    });

    // Событие смерти игрока
    Players.OnDeath.Add(function(player, killedBy) {
        // Логика начисления очков за убийство
    });

} catch (error) {
    // Обязательный блок от разработчиков для отлова багов в логах сервера
    Log.Error("Произошла ошибка в режиме: " + error.message);
}
