this.locale =
    {
        en:
            {
                language: "English",
                gameTitle: "Igisoro",
                greeting: "Welcome back, ",
                apply: "Apply",
                changeName: "Change name",
                serverDiscon: "Server offline",
                serverPend: "Server pending",
                serverCon: "Server online",
                reconnect: "Reconnect",
                localMult: "Local multiplayer",
                onlineMult: "Online multiplayer",
                vsAI: "vs AI",
                tutorial: "Tutorial",
                settings: "Settings",
                menu: "Menu",
                ui: "UI",

                speedTitle: "Game speed",
                speedVerySlow: "Very slow",
                speedSlow: "Slow",
                speedNormal: "Normal",
                speedFast: "Fast",
                speedVeryFast: "Very fast",
                reversingLevelTitle: "Reversing levels",
                reversingLevel0: "Reversing not allowed",
                reversingLevel1: "Reversing allowed\nif a capture\nhas occurred in this move",
                reversingLevel2: "Reversing allowed",
                rotateOccupationsTitle: "Rotate pit occupations\nin local multiplayer",
                enabled: "Enabled",
                disabled: "Disabled",

                firstTurnTitle: "First turn:",
                me: "Me",
                opponent: "Opponent",
                random: "Random",
                createGame: "Create game",
                joinGame: "Join game",
                sessionCode: "Session code:",
                invalidCode: "This session is unavailable!",
                codeHint: "Share it with a player you want to play with\n\nWaiting for the opponent to join...",
                leaveGame: "Leave game",

                vs: "vs ",
                opponentOffline: "Opponent offline...",
                exit: "Exit",
                reallyExit: "Really exit?",

                tutorialS1Title: "Basics",
                tutorialS2Title: "Captures",
                tutorialS3Title: "Reverse moves",
                tutorialS4Title: "Victory conditions",

                tutorialS1R1B1: "Igisoro is a traditional Rwandan board game,\nbelonging to the Mancala family.\n" +
                    "Like all Mancala games,\nit's played by two players on a wooden board.\n\n(tap to continue)",
                tutorialS1R1B2P1: "The board has 32 pits, separated into 4 rows, 2 per player:",
                tutorialS1R1B2P2: "the inner row",
                tutorialS1R1B2P3: "and the outer row.",
                tutorialS1R1B3: "A total of 64 balls called seeds\nare used to play,\n" +
                    "at the start of a game they are placed\nin the inner pits, 4 per each.",
                tutorialS1R1B4: "Players take turns to make their moves.\nThe turn indicator is a white glow on the table's side.\n\n" +
                    "Making a move involves picking all seeds\nfrom a pit with at least 2 in it\n" +
                    "and putting them one by one\nin the next pits (it's called sowing)\ncounter-clockwise.",
                tutorialS1R1B5: "Player's turn ends when the last seed\nfrom the hand lands into an empty pit.",
                tutorialS1R1B6: "Tap one of the left 4 pits to make a move.",
                tutorialS1R1A1: "As you can see,\nthe last seed has landed into an empty pit,\nyour turn would be over by now.",

                tutorialS1R2B1: "If the last seed from the hand\nlands into an occupied pit,\nplayer picks up all seeds from this pit\n" +
                    "and starts sowing again.",
                tutorialS1R2B2: "Now tap one of the right 4 pits\nand observe the result.",
                tutorialS1R2A1: "As you saw,\nthe sowing has occurred twice.\n\nIt can also happen more times,\n" +
                    "but landing the last seed into an empty pit\nalways stops the sowing.",
                tutorialS1R2A2: "You now have a basic understanding\nof the Igisoro board and of moving the seeds.",

                tutorialS2R1B1: "A game of Igisoro is won by capturing the opponent's seeds.",
                tutorialS2R1B2P1: "To capture\ntwo requirements must be met\nat the moment the sowing ends:",
                tutorialS2R1B2P2: "1. The opponent has\nboth of the opposite pits occupied;",
                tutorialS2R1B2P3: "2. Your pit the sowing\nhas ended on is inner and was occupied.",
                tutorialS2R1B3: "If the requirements are met,\nyou pick the opponent's seeds\nfrom both of the opposite pits\n" +
                    "and start sowing them on your side,\nas if they came from the pit\nthe recent sowing has started from.",
                tutorialS2R1B4: "Capture the opponent's seeds\nby tapping the designated pit.",
                tutorialS2R1A1: "As you can see,\nonly the recent sowing's starting pit is taken into the account,\n" +
                    "it doesn't have to be the one you tap.",

                tutorialS2R2B1: "As you could've noticed,\nthe captured seeds function the same way in sowing\nas your own.",
                tutorialS2R2B2: "It means they can trigger new captures.",
                tutorialS2R2B3: "A well-calculated chain reaction\ncan dramatically turn the tide in a game.",
                tutorialS2R2B4: "Tap this pit as your last possible move\nin this game and see what happens.",
                tutorialS2R2A1: "The reason this happened\nis poor seed placement from the opponent.",
                tutorialS2R2A2: "Remember that every pair of\nan occupied inner pit and\nan occupied outer pit is also a potential loss.",
                tutorialS2R2A3: "As you capture more seeds,\nit becomes more difficult to not jeopardize them.\n" +
                    "Minimize the amount of the two-row occupations.",

                tutorialS3R1B1: "Reverse moves are special moves in Igisoro\nthat allow clockwise sowing.\n\n" +
                    "They are enabled by default\nand can occur after 2 turns per player.\nYou can change their presence in the settings.",
                tutorialS3R1B2P1: "If the sowing ends on one of the designated pits,\na reverse move can occur if:",
                tutorialS3R1B2P2: "1. The pit the sowing ended on was occupied;",
                tutorialS3R1B2P3: "2. A regular capture doesn't occur;",
                tutorialS3R1B2P4: "3. By sowing from this pit clockwise\na direct capture can occur (without new sowings).",
                tutorialS3R1B3: "Every time you can make a reverse move\nyou are given a choice: \n" +
                    "to continue sowing (forward arrow)\nor make the reverse sowing (backward arrow).\n" +
                    "Tap the arrow of your choice to proceed then.",
                tutorialS3R1B4: "Tap this pit to end up in a reverse-capable pit,\nthen reverse to capture.",
                tutorialS3R1A1: "Regular and reverse captures, of course,\ncan be combined for devastating capture sprees.",
                tutorialS3R1A2: "Seeds captured by reversing behave the same way\nas regular ones, with one exception...",

                tutorialS3R2B1: "Reverse chain reactions can also occur.\nCaptured seeds behave as if they were put in the pit\n" +
                    "the reverse sowing has started from,\nallowing for additional reverse moves.",
                tutorialS3R2B2: "In this scenario tap the designated pit\nand make a total of 3 successive reverse moves.",
                tutorialS3R2A1: "Such scenarios are not common\nbut it's best to know them\nand act when the opportunity appears.",

                tutorialS4R1B1: "For you to win a game of Igisoro\nyour opponent must have no possible moves left.",
                tutorialS4R1B2: "The most common scenario\nis leaving the opponent without any pits\nwith 2 or more seeds in them.",
                tutorialS4R1B3: "It can happen with a capture by you\nor with a move by the opponent.",
                tutorialS4R1B4: "Capture the last opponent's seeds\ncapable of moving by tapping this pit.",
                tutorialS4R1A1: "Your opponent now only has single seeds\non their side and is not able to move.\nIt's a victory of yours.",

                tutorialS4R2B1: "In this another scenario\nyou're left with the last possible move.\nMake it.",
                tutorialS4R2A1: "As you can see,\nyou will not be able to start sowing anymore.\nThe game is over for you,\nthere's no need for your opponent to make a move.",

                tutorialS4R3B1: "There's another interesting victory condition,\nI call it leapfrog.",
                tutorialS4R3B2: "Look at the opponent's seeds.\nIf they start sowing from the 2-seed pit,\n" +
                    "they will always be landing in an empty pit\nand reproduce the pattern.\nThey will never capture anyways.",
                tutorialS4R3B3: "If the player only has 3 seeds - 2 behind 1 - it's considered a defeat automatically,\n" +
                    "as they will never be able to capture\nbut at the same time it's difficult to capture their last seeds.",
            },

        ru:
            {
                language: "Русский",
                gameTitle: "Игисоро",
                greeting: "С возвращением, ",
                apply: "Применить",
                changeName: "Сменить имя",
                serverDiscon: "Сервер недоступен",
                serverPend: "Подключение",
                serverCon: "Подключен к серверу",
                reconnect: "Переподключиться",
                localMult: "Локальная игра",
                onlineMult: "Игра по сети",
                vsAI: "Игра против ИИ",
                tutorial: "Обучение",
                settings: "Настройки",
                menu: "Меню",
                ui: "Интерфейс",

                speedTitle: "Скорость игры",
                speedVerySlow: "Медленнее",
                speedSlow: "Медленно",
                speedNormal: "Средне",
                speedFast: "Быстро",
                speedVeryFast: "Быстрее",
                reversingLevelTitle: "Уровень\nзадних ходов",
                reversingLevel0: "Задние ходы не разрешены",
                reversingLevel1: "Задние ходы разрешены,\nесли до этого\nпроизошёл захват",
                reversingLevel2: "Задние ходы разрешены",
                rotateOccupationsTitle: "Поворачивать\nколичества зёрен\nв локальной игре",
                enabled: "Включено",
                disabled: "Отключено",

                firstTurnTitle: "Первый ход:",
                me: "Мой",
                opponent: "Оппонента",
                random: "Случайно",
                createGame: "Создать игру",
                joinGame: "Присоединиться",
                sessionCode: "Код сессии:",
                invalidCode: "Эта сессия недоступна!",
                codeHint: "Сообщите этот код второму игроку\n\nОжидание подключения оппонента...",
                leaveGame: "Покинуть игру",

                vs: "против ",
                opponentOffline: "Отключился...",
                exit: "Выйти",
                reallyExit: "Выйти?",

                tutorialS1Title: "Основы",
                tutorialS2Title: "Захваты",
                tutorialS3Title: "Задние ходы",
                tutorialS4Title: "Условия победы",

                tutorialS1R1B1: "Игисоро - это традиционная руандийская настольная игра,\nпринадлежащая семейству манкала.\n" +
                    "Как и все игры семейства манкала,\nв неё играют двое игроков на деревянной доске.\n\n(нажмите, чтобы продолжить)",
                tutorialS1R1B2P1: "В доске есть 32 ямки,\nрасположенные в 4 ряда, по 2 у каждого игрока:",
                tutorialS1R1B2P2: "внутренний ряд",
                tutorialS1R1B2P3: "и внешний ряд.",
                tutorialS1R1B3: "Всего для игры используются 64 шарика,\nназываемые зёрнами,\n" +
                    "в начале игры они расположены во внутренних ямках,\nпо 4 штуки в каждой.",
                tutorialS1R1B4: "Игроки ходят по очереди.\nОчередь показана подсветкой\nс соответствующей стороны стола.\n\n" +
                    "Ход подразумевает взятие всех зёрен\nиз ямки с минимум 2-мя зёрнами\n" +
                    "и раскладывание их по одному\nв последующие ямки (это называется засеиванием)\nпротив часовой стрелки.",
                tutorialS1R1B5: "Ход игрока заканчивается, когда последнее зерно\nиз руки попадает в пустую ямку.",
                tutorialS1R1B6: "Нажмите на одну из 4-х левых ямок,\nчтобы сделать ход.",
                tutorialS1R1A1: "Как вы видите,\nпоследнее зерно попало в пустую ямку,\nваш ход на этом закончился.",

                tutorialS1R2B1: "Если последнее зерно из руки\nпопадает в занятую ямку,\nигрок берёт все зёрна из этой ямки\n" +
                    "и начинает засеивание дальше.",
                tutorialS1R2B2: "Теперь нажмите на одну из 4-х правых ямок\nи посмотрите на результат.",
                tutorialS1R2A1: "Как вы увидели,\nзасеивание произошло дважды.\n\nОно может произойти и большее число раз,\n" +
                    "но попадание последним зерном в пустую ямку\nвсегда завершает ход.",
                tutorialS1R2A2: "Теперь у вас есть базовое понимание\nдоски Игисоро и перемещения зёрен.",

                tutorialS2R1B1: "Игра в Игисоро выигрывается\nс помощью захватов зерён оппонента.",
                tutorialS2R1B2P1: "Чтобы сделать захват\nдва условия должны быть выполнены\nв момент завершения посева:",
                tutorialS2R1B2P2: "1. Обе противоположные\nямки оппонента\nдолжны быть заняты;",
                tutorialS2R1B2P3: "2. Ваша ямка, на которой\nзакончился посев\nдолжна быть занята и находиться\nво внутреннем ряду.",
                tutorialS2R1B3: "Если условия выполняются,\nвы берёте зёрна оппонента\nиз обеих противоположных ямок\n" +
                    "и начинаете сеять их у себя,\nкак если бы они вышли из той ямки,\nиз которой начался последний посев.",
                tutorialS2R1B4: "Захватите зёрна оппонента,\nнажав на выделенную ямку.",
                tutorialS2R1A1: "Как вы видите,\nучитывается только ямка,\nиз которой начался самый последний посев,\n" +
                    "это необязательно та же, что и нажатая.",

                tutorialS2R2B1: "Как вы могли заметить,\nзахваченные зёрна ведут себе при засеивании так же,\nкак и ваши собственные.",
                tutorialS2R2B2: "Это означает, что они могут вызывать новые захваты.",
                tutorialS2R2B3: "Хорошо рассчитанная цепная реакция\nможет переломить ход игры.",
                tutorialS2R2B4: "Нажмите на эту ямку, вашу последнюю возможность для хода\nв этой игре, и посмотрите, что произойдёт.",
                tutorialS2R2A1: "Причиной произошедшего является\nплохое расположение зёрен у оппонента.",
                tutorialS2R2A2: "Помните, что каждая пара\nзанятой внутренней и\nзанятой внешней ямки является потенциальной потерей.",
                tutorialS2R2A3: "По ходу захвата большего числа зёрен\nстановится всё сложнее не подвергнуть их опасности.\n" +
                    "Старайтесь уменьшать число таких пар занятых ячеек.",

                tutorialS3R1B1: "Задние ходы - это особые ходы в Игисоро,\nпозволяющие ходить по часовой стрелке.\n" +
                    "По умолчанию они включены\nи могут произойти после 2-х ходов каждого игрока.\nВы можете изменить их присутствие в меню настроек.",
                tutorialS3R1B2P1: "Если засеивание заканчивается\nна одной из выделенных ячеек,\nзадний ход может возникнуть, если:",
                tutorialS3R1B2P2: "1. Ячейка, на которой закончился посев, была занята;",
                tutorialS3R1B2P3: "2. Не происходит обычный захват;",
                tutorialS3R1B2P4: "3. Если засеивать из этой ячейки по часовой стрелке,\nпроизойдёт прямой захват (одним засеиванием).",
                tutorialS3R1B3: "Каждый раз при возможности сделать задний ход вам даётся выбор: \n" +
                    "продолжить засеивание (стрелка вперёд)\nили совершить задний ход (стрелка назад).\n" +
                    "В такой ситуации нажмите на стрелку, которую хотите выбрать.",
                tutorialS3R1B4: "Нажмите на эту ячейку,\nа затем совершите захват задним ходом.",
                tutorialS3R1A1: "Обычные и задние захваты, естественно,\nмогут использоваться вместе\nдля разрушительных комбинаций.",
                tutorialS3R1A2: "Захваченные задним ходом зёрна ведут себя так же,\nкак и обычные, за одним исключением...",

                tutorialS3R2B1: "Могут возникать цепные реакции из задних ходов.\nЗахваченные зёрна ведут себя,\nкак если бы они были положены в ямку,\n" +
                    "из которой начался задний посев,\nпозволяя совершить новые задние ходы.",
                tutorialS3R2B2: "В этом сценарии нажмите\nна выделенную ямку\nи совершите 3 задних хода.",
                tutorialS3R2A1: "Такие сценарии не часты,\nно об их существовании стоит знать,\nчтобы правильно распорядиться подобной ситуацией.",

                tutorialS4R1B1: "Чтобы выиграть игру в Игисоро\nу вашего оппонента не должно остаться возможных ходов.",
                tutorialS4R1B2: "Самый часто возникающий вариант - оставить оппонента\nбез ямок с более чем одним зерном.",
                tutorialS4R1B3: "Это может произойти от вашего захвата\nили после хода оппонента.",
                tutorialS4R1B4: "Захватите последние зёрна\nвашего оппонента,\nспособные на запуск засеивания,\nнажав на эту ямку.",
                tutorialS4R1A1: "У оппонента остались только одиночные зёрна,\nон не может походить. Победа ваша.",

                tutorialS4R2B1: "В этом сценарии\nу вас остался последний возможный ход. Сделайте его.",
                tutorialS4R2A1: "Как вы видите, вы больше не сможете начать посев.\nИгра для вас окончена,\nоппоненту не нужно делать ещё один ход.",

                tutorialS4R3B1: "Есть ещё одно интересное условие победы,\nя называю его чехардой.",
                tutorialS4R3B2: "Посмотрите на зёрна оппонента.\nЕсли он начнёт засеивание,\n" +
                    "то оно всегда закончится в пустой ячейке\nи возобновит ситуацию.\nЗахвата всё равно никогда не произойдёт.",
                tutorialS4R3B3: "Если у игрока осталось 3 зерна - два за одним,\nему автоматически засчитывается поражение,\n" +
                    "поскольку сам он сделать захват не сможет,\nно в то же время захватить его последние зёрна будет времязатратно.",
            }
    };
