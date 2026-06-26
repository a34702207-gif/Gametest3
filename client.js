try {
    // 1. Создание команд с нужными именами и цветами
    // Админы - Черная команда, Игроки - Синяя команда
    Teams.Add("admins", "Админы", { r: 0, g: 0, b: 0 });
    Teams.Add("players", "Игроки", { r: 0, g: 0, b: 255 });

    var adminsTeam = Teams.Get("admins");
    var playersTeam = Teams.Get("players");

    // 2. Настройка точек спавна для каждой команды
    adminsTeam.Spawns.SpawnPointsGroups.Add(2); // Группа спавна для Админов
    playersTeam.Spawns.SpawnPointsGroups.Add(1); // Группа спавна для Игроков

    // 3. Конфигурация игровых правил (Таймер и Очки)
    Properties.GetContext().MainTimer.Value = 300; // Раунд длится 5 минут (300 секунд)
    
    // Лимит убийств для победы (например, 50 очков)
    var matchScore = Properties.GetContext().MaxScore;
    matchScore.Value = 50;

    // 4. Ограничения на инвентарь и игровой процесс
    // Отключаем режим строительства, чтобы блоки нельзя было ставить и ломать
    Breathing.PlayerSync.GetContext().Build.Value = false; 
    
    // Настраиваем инвентарь по умолчанию при возрождении
    var inventory = Inventory.GetContext();
    inventory.Main.Value = false;       // Отключаем основной слот (автоматы/винтовки)
    inventory.Secondary.Value = true;    // Включаем вторичный слот (пистолеты)
    inventory.Melee.Value = false;       // Отключаем нож/холодное оружие
    inventory.Explosive.Value = false;   // Отключаем гранаты
    inventory.Build.Value = false;       // Отключаем блоки для постройки

    // 5. Обработка старта игры и распределения игроков
    Event.OnStartGame.Add(function() {
        var allPlayers = Players.All;
        for (var i = 0; i < allPlayers.length; i++) {
            // Разделяем зашедших: первый админ, остальные игроки (или по вашему выбору)
            if (i === 0) {
                adminsTeam.Add(allPlayers[i]);
            } else {
                playersTeam.Add(allPlayers[i]);
            }
        }
    });

    // 6. Логика возрождения (Spawn) игроков
    Event.OnPlayerSpawn.Add(function(player) {
        // Убеждаемся, что при каждом спавне у всех чистится лишнее оружие
        var pInventory = player.Inventory;
        pInventory.Main.Value = false;
        pInventory.Secondary.Value = true; // Оставляем доступным только пистолет
        pInventory.Melee.Value = false;
        pInventory.Explosive.Value = false;
        pInventory.Build.Value = false;
    });

    // 7. Отслеживание смертей и начисление очков командам
    Event.OnPlayerDeath.Add(function(player, killer) {
        if (killer != null && killer.Team != player.Team) {
            killer.Team.Properties.Get("deaths").Value += 1; // Добавляем фраг команде
        }
        // Мгновенный перезапуск спавна через 3 секунды после смерти
        player.Spawns.Spawn();
    });

    // 8. Окончание таймера — перезапуск матча
    Event.OnTimer.Add(function() {
        Game.RestartGame();
    });

} catch (e) {
    // В случае ошибки выводим логи в системную команду
    Teams.Add("ErrorTeam", "Ошибка скрипта: " + e.message, { r: 255, g: 0, b: 0 });
}
