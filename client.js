// Настройки игрового режима
const GAME_TIME_SECONDS = 120; // Длительность раунда (2 минуты)
const SCORE_TO_WIN = 100;      // Очки для победы
const COOLDOWN_MS = 3000;      // Задержка перед следующим спавном в миллисекундах

let isGameActive = false;
let scores = {};
let gameTimer;

// Инициализация мода при старте
function initGameMode() {
    isGameActive = true;
    scores = { teamA: 0, teamB: 0 };
    
    // Запуск таймера раунда
    gameTimer = setInterval(() => {
        // Логика проверки таймера в игре
    }, 1000);

    // Вызываем функцию появления объектов
    spawnLoot();
}

// Логика спавна предметов (сокровищ)
function spawnLoot() {
    if (!isGameActive) return;

    // Генерация координат в пределах карты
    const coordinateX = Math.floor(Math.random() * 500) - 250;
    const coordinateY = 20; 
    const coordinateZ = Math.floor(Math.random() * 500) - 250;

    // Вставка объекта через API игры (пример концепта)
    console.log(`Спавн сокровища на координатах: X: ${coordinateX}, Y: ${coordinateY}, Z: ${coordinateZ}`);
    
    setTimeout(spawnLoot, COOLDOWN_MS);
}

// Подсчет очков команд
function addPoints(team, amount) {
    if (!isGameActive) return;
    
    scores[team] += amount;
    console.log(`Команда ${team} получила очки: ${scores[team]}`);

    if (scores[team] >= SCORE_TO_WIN) {
        declareWinner(team);
    }
}

// Завершение игры
function declareWinner(winningTeam) {
    isGameActive = false;
    clearInterval(gameTimer);
    console.log(`Игра окончена! Победитель: ${winningTeam}`);
}

// Вызываем функцию при запуске режима
initGameMode();
