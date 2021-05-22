import
{
    UI_Layout
} from "./ui/uiLayout.js";

import * as UI from "./ui/uiFactory.js";

import
{
    VisualElements,
    Redraw
} from "./rendering.js";

import
{
    LocalGameStart,
    LocalGameEnd,
    gameSettings,
    serverStatus,
    ConnectToServer,
    RequestNewSession,
    JoinSession,
    DisconnectMe,
    TutorialGameStart,
    SetLocalGameOccupations,
    AttachAI,
    Log
} from "./client.js";

import * as Subject from "./ui/uiSubject.js";

export let gameTableObject = null;

export function SetGameTableObject(gameTable)
{
    gameTableObject = gameTable;
}

let Scenes = new Map;

export function SetScene(sceneName, parameters)
{
    for (let element of VisualElements.values())
    {
        element.Destroy();
    }

    VisualElements.clear();
    Subject.GameObservers.clear();
    Scenes.get(sceneName).unveil(parameters);
}

let mainMenuLayout = new UI_Layout();
Scenes.set("mainmenu", mainMenuLayout);
mainMenuLayout.addElementCall(
    function()
    {
        UI.CreateText(0.5, 0.15, 0, locale[gameSettings.language].gameTitle, "logoText", 3);
        UI.CreateText(0.7125, 0.15, 0, "v.0.19", "versionText", 1);

        UI.CreateText(0.5, 0.275, 0, locale[gameSettings.language].greeting + gameSettings.playerName, "nameText", 1);
        Subject.AddObserver("nameChangeStart", function()
        {
            UI.ChangeElementText("nameText", "");
            UI.ChangeElementText("nameButtonText", locale[gameSettings.language].apply);
        });
        Subject.AddObserver("nameChangeFinish", function()
        {
            UI.ChangeElementText("nameText", locale[gameSettings.language].greeting + gameSettings.playerName);
            UI.ChangeElementText("nameButtonText", locale[gameSettings.language].changeName);
            localStorage.setItem("playerName", gameSettings.playerName);
        });

        UI.CreateButton(0.5, 0.35, 1, 0.17, 0.055,
            function()
            {
                if (UI.GetElement("nameInput") == null)
                {
                    Subject.Notify("nameChangeStart");

                    UI.CreateInput(0.5, 0.275, 1, 0.3, 0.09, "playerName", "text", 12, "nameInput");
                }
                else
                {
                    UI.GetElement("nameInput").RetractInput();
                    UI.RemoveElement("nameInput");

                    Subject.Notify("nameChangeFinish");
                }
            },
            locale[gameSettings.language].changeName, "nameButton", 0.8);

        const serverStatusReadings =
            [
                locale[gameSettings.language].serverPend,
                locale[gameSettings.language].serverDiscon,
                locale[gameSettings.language].serverCon
            ];

        let initServerStatus = 0;
        switch (serverStatus)
        {
            case "pend":
                initServerStatus = 0;
                break;

            case "discon":
                initServerStatus = 1;
                break;

            case "con":
                initServerStatus = 2;
                break;
        }
        UI.CreateText(0.15, 0.1, 0, serverStatusReadings[initServerStatus], "serverStatusText", 1);
        Subject.AddObserver("serverPend", function()
        {
            UI.ChangeElementText("serverStatusText", serverStatusReadings[0]);
            UI.ChangeElementColor("onlineButtonText", "rgba(128, 128, 128, 1)");
        });
        Subject.AddObserver("serverCon", function()
        {
            UI.ChangeElementText("serverStatusText", serverStatusReadings[2]);
            UI.ChangeElementColor("onlineButtonText", "rgba(255, 255, 255, 1)");
        });
        Subject.AddObserver("serverDiscon", function()
        {
            UI.ChangeElementText("serverStatusText", serverStatusReadings[1]);
            UI.ChangeElementColor("onlineButtonText", "rgba(128, 128, 128, 1)");
        });

        UI.CreateButton(0.15, 0.17, 0, 0.275, 0.06,
            ConnectToServer, locale[gameSettings.language].reconnect, "reconnectButton", 1);

        UI.CreateButton(0.85, 0.17, 0, 0.16, 0.06, function()
        {
            if (gameSettings.language === "en")
            {
                gameSettings.language = "ru";
            }
            else
            {
                gameSettings.language = "en";
            }

            localStorage.setItem("language", gameSettings.language);
            SetScene("mainmenu");
        }, locale[gameSettings.language].language, "languageButton", 1);

        UI.CreateButton(0.25, 0.55, 0, 0.4, 0.18, LocalGameStart, locale[gameSettings.language].localMult, "localGameButton", 1.5);

        UI.CreateButton(0.25, 0.8, 0, 0.4, 0.18,
            function()
            {
                if (serverStatus === "con")
                {
                    SetScene("onlinemenu");
                }
            }, locale[gameSettings.language].onlineMult, "onlineButton", 1.5);
        UI.ChangeElementColor("onlineButtonText", serverStatus === "con" ? "rgba(255, 255, 255, 1)" : "rgba(128, 128, 128, 1)");

        UI.CreateButton(0.75, 0.55, 0, 0.4, 0.18,
            function()
            {
                SetScene("aimenu");
            },
            locale[gameSettings.language].vsAI, "vsaiButton", 1.5);

        UI.CreateButton(0.75, 0.8, 0, 0.4, 0.18,
            function()
            {
                SetScene("tutorialmenu");
            },
            locale[gameSettings.language].tutorial, "tutorialMenuButton", 1.5);

        UI.CreateButton(0.15, 0.3, 0, 0.275, 0.15,
            function()
            {
                SetScene("settings");
            },
            locale[gameSettings.language].settings, "settingsButton", 1.25);
    }
);

let settingsLayout = new UI_Layout();
Scenes.set("settings", settingsLayout);
settingsLayout.addElementCall
(
    function()
    {
        // Game speed stuff
        const speedNames =
            [
                locale[gameSettings.language].speedVerySlow,
                locale[gameSettings.language].speedSlow,
                locale[gameSettings.language].speedNormal,
                locale[gameSettings.language].speedFast,
                locale[gameSettings.language].speedVeryFast
            ];

        UI.CreateText(0.25, 0.125, 0, locale[gameSettings.language].speedTitle, "speedTitle", 2);

        Subject.AddObserver("spinspeed", function()
        {
            gameSettings.gameSpeed++;
            if (gameSettings.gameSpeed > 5) gameSettings.gameSpeed = 1;

            localStorage.setItem("gameSpeed", gameSettings.gameSpeed.toString());
            UI.ChangeElementText("spinSpeedButtonText", speedNames[gameSettings.gameSpeed - 1]);
        });

        UI.CreateButton(0.25, 0.3, 0, 0.25, 0.15,
            function()
            {
                Subject.Notify("spinspeed");
            },
            speedNames[gameSettings.gameSpeed - 1], "spinSpeedButton", 1.2);

        // Reverse levels stuff
        const revlevelDescriptions =
            [
                locale[gameSettings.language].reversingLevel0,
                locale[gameSettings.language].reversingLevel1,
                locale[gameSettings.language].reversingLevel2
            ];

        UI.CreateText(0.75, 0.125, 0, locale[gameSettings.language].reversingLevelTitle, "revlevelTitle", 2);
        UI.CreateText(0.75, 0.475, 0, revlevelDescriptions[gameSettings.reverseLevel], "revlevelDesc", 1);

        Subject.AddObserver("spinrevlevel", function()
        {
            gameSettings.reverseLevel = (gameSettings.reverseLevel + 1) % 3;

            localStorage.setItem("reverseLevel", gameSettings.reverseLevel.toString());
            UI.ChangeElementText("spinRevLevelButtonText", gameSettings.reverseLevel);
            UI.ChangeElementText("revlevelDesc", revlevelDescriptions[gameSettings.reverseLevel]);
        });

        UI.CreateButton(0.75, 0.3, 0, 0.15, 0.15,
            function()
            {
                Subject.Notify("spinrevlevel");
            },
            gameSettings.reverseLevel, "spinRevLevelButton", 2);

        Subject.AddObserver("switchRotateOccupations", function()
        {
            gameSettings.rotateOccupations = !gameSettings.rotateOccupations;

            localStorage.setItem("rotateOccupations", gameSettings.rotateOccupations.toString());
            UI.ChangeElementText("rotateOccupationsSwitchText",
                gameSettings.rotateOccupations ? locale[gameSettings.language].enabled : locale[gameSettings.language].disabled);
        });

        UI.CreateText(0.25, 0.55, 0, locale[gameSettings.language].rotateOccupationsTitle, "rotateOccupationsText", 1.5);
        UI.CreateButton(0.25, 0.75, 0, 0.3, 0.15,
            function()
            {
                Subject.Notify("switchRotateOccupations");
            },
            gameSettings.rotateOccupations ? locale[gameSettings.language].enabled : locale[gameSettings.language].disabled,
            "rotateOccupationsSwitch", 1.2);

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            locale[gameSettings.language].menu, "backToMenuButton", 1);
    }
);

let tutorialMenu = new UI_Layout();
Scenes.set("tutorialmenu", tutorialMenu);
tutorialMenu.addElementCall
(
    function()
    {
        Subject.AddObserver("tutorialS1", function()
        {
            TutorialGameStart();
            SetScene("tutorialS1R1", { field: fields.S1R1});
        });

        Subject.AddObserver("tutorialS2", function()
        {
            TutorialGameStart();
            SetScene("tutorialS2R1", { field: fields.S2R1});
        });

        Subject.AddObserver("tutorialS3", function()
        {
            TutorialGameStart();
            SetScene("tutorialS3R1", { field: fields.S3R1});
        });

        Subject.AddObserver("tutorialS4", function()
        {
            TutorialGameStart();
            SetScene("tutorialS4R1", { field: fields.S4R1});
        });

        UI.CreateButton(0.25, 0.25, 0, 0.4, 0.15,
            function()
            {
                Subject.Notify("tutorialS1");
            },
            locale[gameSettings.language].tutorialS1Title, "tutorial1Button", 1.2);

        UI.CreateButton(0.75, 0.25, 0, 0.4, 0.15,
            function()
            {
                Subject.Notify("tutorialS2");
            },
            locale[gameSettings.language].tutorialS2Title, "tutorial2Button", 1.2);

        UI.CreateButton(0.25, 0.5, 0, 0.4, 0.15,
            function()
            {
                Subject.Notify("tutorialS3");
            },
            locale[gameSettings.language].tutorialS3Title, "tutorial3Button", 1.2);

        UI.CreateButton(0.75, 0.5, 0, 0.4, 0.15,
            function()
            {
                Subject.Notify("tutorialS4");
            },
            locale[gameSettings.language].tutorialS4Title, "tutorial4Button", 1.2);

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            locale[gameSettings.language].menu, "backToMenuButton", 1);
    }
);

let aiMenu = new UI_Layout();
Scenes.set("aimenu", aiMenu);
aiMenu.addElementCall
(
    function()
    {
        Subject.AddObserver("spindifficulty", function()
        {
            switch (gameSettings.aiDifficulty)
            {
                case 1:
                    gameSettings.aiDifficulty = 2;
                    UI.ChangeElementText("spinDifficultyButtonText", locale[gameSettings.language].medium);
                    break;

                case 2:
                    gameSettings.aiDifficulty = 3;
                    UI.ChangeElementText("spinDifficultyButtonText", locale[gameSettings.language].hard);
                    break;

                case 3:
                    gameSettings.aiDifficulty = 1;
                    UI.ChangeElementText("spinDifficultyButtonText", locale[gameSettings.language].easy);
                    break;
            }

            localStorage.setItem("aiDifficulty", gameSettings.aiDifficulty.toString());
        });

        UI.CreateButton(0.5, 0.3, 0, 0.3, 0.2, function()
        {
            let aiDepth = 1;
            let aiRandomness = 70;
            let aiSide = "top";

            switch (gameSettings.aiDifficulty)
            {
                case 2:
                    aiDepth = 3;
                    aiRandomness = 50;
                    break;

                case 3:
                    aiDepth = 5;
                    aiRandomness = 30;
                    break;
            }

            switch (gameSettings.aiFirstTurn)
            {
                case "second":
                    aiSide = "bottom";
                    break;

                case "random":
                    aiSide = Math.random() < 0.5 ? "bottom" : "top";
                    break;
            }

            LocalGameStart(locale[gameSettings.language].AI, aiSide === "bottom" ? "top" : "bottom");
            AttachAI(aiSide, { depth: aiDepth, randomness: aiRandomness });
            Redraw();
        }, locale[gameSettings.language].play, "aiGameButton", 2);

        let currentDifficultyText = "";

        switch (gameSettings.aiDifficulty)
        {
            case 1:
                currentDifficultyText = locale[gameSettings.language].easy;
                break;

            case 2:
                currentDifficultyText = locale[gameSettings.language].medium;
                break;

            case 3:
                currentDifficultyText = locale[gameSettings.language].hard;
                break;
        }

        UI.CreateText(0.2, 0.5, 0, locale[gameSettings.language].difficulty, "difficultyTitle", 2);

        UI.CreateButton(0.2, 0.65, 0, 0.3, 0.15,
            function()
            {
                Subject.Notify("spindifficulty");
            },
            currentDifficultyText, "spinDifficultyButton", 1.5);

        Subject.AddObserver("spinfirstturn", function()
        {
            switch (gameSettings.aiFirstTurn)
            {
                case "random":
                    gameSettings.aiFirstTurn = "first";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].me);
                    break;

                case "first":
                    gameSettings.aiFirstTurn = "second";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].AI);
                    break;

                case "second":
                    gameSettings.aiFirstTurn = "random";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].random);
                    break;
            }
        });

        UI.CreateText(0.8, 0.5, 0, locale[gameSettings.language].firstTurnTitle, "firstTurnText", 2);

        let startingFirstTurn = "";

        switch (gameSettings.aiFirstTurn)
        {
            case "random":
                startingFirstTurn = locale[gameSettings.language].random;
                break;

            case "first":
                startingFirstTurn = locale[gameSettings.language].me;
                break;

            case "second":
                startingFirstTurn = locale[gameSettings.language].AI;
                break;
        }

        UI.CreateButton(0.8, 0.65, 0, 0.3, 0.15, function()
        {
            Subject.Notify("spinfirstturn");
        }, startingFirstTurn, "spinFirstTurnButton", 1.5);

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            locale[gameSettings.language].menu, "backToMenuButton", 1);
    }
);

let onlineMenu = new UI_Layout();
Scenes.set("onlinemenu", onlineMenu);
onlineMenu.addElementCall
(
    function()
    {
        Subject.AddObserver("onlineConnectionLost", function()
        {
            SetScene("mainmenu");
        });

        Subject.AddObserver("spinfirstturn", function()
        {
            switch (gameSettings.firstTurn)
            {
                case "random":
                    gameSettings.firstTurn = "first";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].me);
                    break;

                case "first":
                    gameSettings.firstTurn = "second";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].opponent);
                    break;

                case "second":
                    gameSettings.firstTurn = "random";
                    UI.ChangeElementText("spinFirstTurnButtonText", locale[gameSettings.language].random);
                    break;
            }
        });

        UI.CreateButton(0.25, 0.2, 0, 0.4, 0.18, RequestNewSession,
            locale[gameSettings.language].createGame, "newOnlineGameButton", 1.5);

        UI.CreateText(0.25, 0.4, 0, locale[gameSettings.language].firstTurnTitle, "firstTurnText", 1);

        let startingFirstTurn = "";

        switch (gameSettings.firstTurn)
        {
            case "random":
                startingFirstTurn = locale[gameSettings.language].random;
                break;

            case "first":
                startingFirstTurn = locale[gameSettings.language].me;
                break;

            case "second":
                startingFirstTurn = locale[gameSettings.language].opponent;
                break;
        }

        UI.CreateButton(0.25, 0.5, 0, 0.2, 0.1, function()
        {
            Subject.Notify("spinfirstturn");
        }, startingFirstTurn, "spinFirstTurnButton", 1);

        // Joining
        UI.CreateButton(0.75, 0.2, 0, 0.4, 0.18, JoinSession, locale[gameSettings.language].joinGame, "joinGameButton", 1.5);

        Subject.AddObserver("incHundreds", function()
        {
            let hundreds = Math.floor(gameSettings.joinCode / 100);
            gameSettings.joinCode -= hundreds * 100;
            hundreds++;
            if (hundreds > 9) hundreds = 1;
            gameSettings.joinCode += hundreds * 100;

            UI.ChangeElementText("joinCodeHundredsText", hundreds.toString());
        });

        Subject.AddObserver("incTens", function()
        {
            let tens = Math.floor(gameSettings.joinCode % 100 / 10);
            gameSettings.joinCode -= tens * 10;
            tens = (tens + 1) % 10;
            gameSettings.joinCode += tens * 10;

            UI.ChangeElementText("joinCodeTensText", tens.toString());
        });

        Subject.AddObserver("incOnes", function()
        {
            let ones = gameSettings.joinCode % 10;
            gameSettings.joinCode -= ones;
            ones = (ones + 1) % 10;
            gameSettings.joinCode += ones;

            UI.ChangeElementText("joinCodeOnesText", ones.toString());
        });

        UI.CreateText(0.75, 0.4, 0, locale[gameSettings.language].sessionCode, "joinCodeHintText", 1);

        const joinCodeHundreds = Math.floor(gameSettings.joinCode / 100);
        const joinCodeTens = Math.floor(gameSettings.joinCode % 100 / 10);
        const joinCodeOnes = gameSettings.joinCode % 10;

        UI.CreateButton(0.6, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incHundreds");
        }, joinCodeHundreds.toString(), "joinCodeHundreds", 3);

        UI.CreateButton(0.75, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incTens");
        }, joinCodeTens.toString(), "joinCodeTens", 3);

        UI.CreateButton(0.9, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incOnes");
        }, joinCodeOnes.toString(), "joinCodeOnes", 3);

        UI.CreateText(0.75, 0.78, 0, locale[gameSettings.language].invalidCode, "invalidCodeText", 1);
        UI.SwitchElementVisibility("invalidCodeText", false);
        Subject.AddObserver("invalidCode", function()
        {
            UI.SwitchElementVisibility("invalidCodeText", true);
            setTimeout(function()
            {
                if (UI.GetElement("invalidCodeText") == null) return;
                UI.SwitchElementVisibility("invalidCodeText", false);
            }, 1500);
        });

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            locale[gameSettings.language].menu, "backToMenuButton", 1);
    }
);

let lobby = new UI_Layout();
Scenes.set("lobby", lobby);
lobby.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("onlineConnectionLost", function()
        {
            SetScene("mainmenu");
        });

        gameSettings.joinCode = parameters.sessionCode;

        UI.CreateText(0.5, 0.3, 0, locale[gameSettings.language].sessionCode + " " + parameters.sessionCode, "codeText", 3);
        UI.CreateText(0.5, 0.6, 0, locale[gameSettings.language].codeHint, "codeHintText", 1.5);

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                DisconnectMe();
                SetScene("onlinemenu");
            },
            locale[gameSettings.language].leaveGame, "backToOnlineMenuButton", 1);
    }
);

let gameLayout = new UI_Layout();
Scenes.set("game", gameLayout);
gameLayout.addElementCall
(
    function(parameters)
    {
        if (parameters.isOnline)
        {
            Subject.AddObserver("onlineConnectionLost", function()
            {
                SetScene("mainmenu");
            });
        }
        else if (gameTableObject.opponent != null)
        {
            UI.CreateButton(0.825, 0.5, 1, 0.3, 0.09, function()
            {
                if (UI.GetElement("boostButtonText").text === locale[gameSettings.language].boost)
                {
                    gameTableObject.Boost();
                    UI.ChangeElementText("boostButtonText", locale[gameSettings.language].boosting);
                }
                else
                {
                    gameTableObject.Deboost();
                    UI.ChangeElementText("boostButtonText", locale[gameSettings.language].boost);
                }
            }, locale[gameSettings.language].boost, "boostButton", 1);

            Subject.AddObserver("boostOff", function()
            {
                UI.ChangeElementText("boostButtonText", locale[gameSettings.language].boost);
            });
        }

        let gameTableContainer = UI.CreateContainer(gameTableObject, 0, 0, 0);
        VisualElements.set("gameTable", gameTableContainer);
        gameTableContainer.element.PitsFlushTexts();

        if (gameTableObject.opponent != null)
        {
            UI.CreateButton(0.175, 0.5, 1, 0.3, 0.09, function()
            {

            }, locale[gameSettings.language].vs + gameTableObject.opponent, "opponentButton", 1);

            Subject.AddObserver("conlost", function()
            {
                UI.ChangeElementText("opponentButtonText", locale[gameSettings.language].opponentOffline);
            });

            Subject.AddObserver("recon", function()
            {
                UI.ChangeElementText("opponentButtonText", locale[gameSettings.language].vs + gameTableObject.opponent);
            });
        }

        Subject.AddObserver("tryingToExit", function()
        {
            if (gameTableObject.winnerText != null)
            {
                if (parameters.isOnline)
                {
                    DisconnectMe();
                    SetScene("onlinemenu");
                }
                else
                {
                    LocalGameEnd();
                }

                return;
            }

            UI.RemoveElement("endButton");
            UI.RemoveElement("endButtonText");
            UI.CreateButton(0.5, 0.5, -1, 0.3, 0.09,
                parameters.isOnline ? function()
                    {
                        DisconnectMe();
                        SetScene("onlinemenu");
                    }
                    : LocalGameEnd,
                locale[gameSettings.language].reallyExit, "confirmEndButton", 1,
                function()
                {
                    Subject.Notify("cancellingExit");
                });
        });

        Subject.AddObserver("cancellingExit", function()
        {
            UI.RemoveElement("confirmEndButton");
            UI.RemoveElement("confirmEndButtonText");
            UI.CreateButton(0.5, 0.5, 1, 0.3, 0.09, function()
                {
                    Subject.Notify("tryingToExit");
                },
                locale[gameSettings.language].exit, "endButton", 1);
        });

        UI.CreateButton(0.5, 0.5, 1, 0.3, 0.09, function()
            {
                Subject.Notify("tryingToExit");
            },
            locale[gameSettings.language].exit, "endButton", 1);
    }
);

let tutorialS1R1 = new UI_Layout();
Scenes.set("tutorialS1R1", tutorialS1R1);
tutorialS1R1.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.3, -6, locale[gameSettings.language].tutorialS1R1B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R1B2P1, "B2P1Text", 1.2);
            UI.CreateText(0.5, 0.65, -6, locale[gameSettings.language].tutorialS1R1B2P2, "B2P2Text", 1.5);
            UI.CreateText(0.5, 0.875, -6, locale[gameSettings.language].tutorialS1R1B2P3, "B2P3Text", 1.5);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2P1Text");
            UI.RemoveElement("B2P2Text");
            UI.RemoveElement("B2P3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B4");
            }, "B3Image");

            UI.CreateText(0.5, 0.3, -6, locale[gameSettings.language].tutorialS1R1B3, "B3Text", 1.2);
        });

        Subject.AddObserver("B4", function()
        {
            UI.RemoveElement("B3Image");
            UI.RemoveElement("B3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B4", 1, function()
            {
                Subject.Notify("B5");
            }, "B4Image");

            UI.CreateText(0.5, 0.5, -6, locale[gameSettings.language].tutorialS1R1B4, "B4Text", 1.2);
        });

        Subject.AddObserver("B5", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B5", 1, function()
            {
                Subject.Notify("B6");
            }, "B5Image");

            UI.CreateText(0.5, 0.5, -6, locale[gameSettings.language].tutorialS1R1B5, "B5Text", 1.2);
        });

        Subject.AddObserver("B6", function()
        {
            UI.RemoveElement("B5Image");
            UI.RemoveElement("B5Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, null, "B6Image");
            UI.CreateImage(0.75, 0.75, -5, null, 0.5, function(){}, "BlockerImage");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R1B6, "B6Text", 1.5);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B6Image");
            UI.RemoveElement("B6Text");
            UI.RemoveElement("BlockerImage");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("nextRoom-tutorialS1R2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R1A1, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "tutorialS1R2");
        Subject.Notify("B1");
    }
);

let tutorialS1R2 = new UI_Layout();
Scenes.set("tutorialS1R2", tutorialS1R2);
tutorialS1R2.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R2B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.3, -6, locale[gameSettings.language].tutorialS1R2B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, null, "B2Image");
            UI.CreateImage(0.25, 0.75, -5, null, 0.5, function(){}, "BlockerImage");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R2B2, "B2Text", 1.5);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2Text");
            UI.RemoveElement("BlockerImage");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("A2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R2A1, "A1Text", 1.2);
        });

        Subject.AddObserver("A2", function()
        {
            UI.RemoveElement("A1Image");
            UI.RemoveElement("A1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                SetScene("tutorialmenu");
                Log("tutorial-completions", gameSettings.playerName.toString() + " has completed the tutorial 1");
            }, "A2Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS1R2A2, "A2Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "");
        Subject.Notify("B1");
    }
);

let tutorialS2R1 = new UI_Layout();
Scenes.set("tutorialS2R1", tutorialS2R1);
tutorialS2R1.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.2, -6, locale[gameSettings.language].tutorialS2R1B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS2R1B2", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.3, 0.15, -6, locale[gameSettings.language].tutorialS2R1B2P1, "B2P1Text", 1.2);
            UI.CreateText(0.3, 0.5, -6, locale[gameSettings.language].tutorialS2R1B2P2, "B2P2Text", 1.2);
            UI.CreateText(0.3, 0.8, -6, locale[gameSettings.language].tutorialS2R1B2P3, "B2P3Text", 1.2);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2P1Text");
            UI.RemoveElement("B2P2Text");
            UI.RemoveElement("B2P3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS2R1B3", 1, function()
            {
                Subject.Notify("B4");
            }, "B3Image");

            UI.CreateText(0.3, 0.25, -6, locale[gameSettings.language].tutorialS2R1B3, "B3Text", 1.2);
        });

        Subject.AddObserver("B4", function()
        {
            UI.RemoveElement("B3Image");
            UI.RemoveElement("B3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS2R1B4", 1, null, "B4Image");
            UI.CreateImage(0.25, 0.75, -5, null, 0.5, function(){}, "BlockerImage");

            UI.CreateText(0.3, 0.5, -6, locale[gameSettings.language].tutorialS2R1B4, "B4Text", 1.2);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");
            UI.RemoveElement("BlockerImage");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("nextRoom-tutorialS2R2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R1A1, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "tutorialS2R2");
        Subject.Notify("B1");
    }
);

let tutorialS2R2 = new UI_Layout();
Scenes.set("tutorialS2R2", tutorialS2R2);
tutorialS2R2.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2B2, "B2Text", 1.2);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B4");
            }, "B3Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2B3, "B3Text", 1.2);
        });

        Subject.AddObserver("B4", function()
        {
            UI.RemoveElement("B3Image");
            UI.RemoveElement("B3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS2R2B4", 1, null, "B4Image");

            UI.CreateText(0.5, 0.85, -6, locale[gameSettings.language].tutorialS2R2B4, "B4Text", 1.2);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("A2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2A1, "A1Text", 1.2);
        });

        Subject.AddObserver("A2", function()
        {
            UI.RemoveElement("A1Image");
            UI.RemoveElement("A1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("A3");
            }, "A2Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2A2, "A2Text", 1.2);
        });

        Subject.AddObserver("A3", function()
        {
            UI.RemoveElement("A2Image");
            UI.RemoveElement("A2Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                SetScene("tutorialmenu");
                Log("tutorial-completions", gameSettings.playerName.toString() + " has completed the tutorial 2");
            }, "A3Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS2R2A3, "A3Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "");
        Subject.Notify("B1");
    }
);

let tutorialS3R1 = new UI_Layout();
Scenes.set("tutorialS3R1", tutorialS3R1);
tutorialS3R1.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R1B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS3R1B2", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.5, 0.15, -6, locale[gameSettings.language].tutorialS3R1B2P1, "B2P1Text", 1);
            UI.CreateText(0.5, 0.5, -6, locale[gameSettings.language].tutorialS3R1B2P2, "B2P2Text", 1);
            UI.CreateText(0.5, 0.65, -6, locale[gameSettings.language].tutorialS3R1B2P3, "B2P3Text", 1);
            UI.CreateText(0.5, 0.8, -6, locale[gameSettings.language].tutorialS3R1B2P4, "B2P4Text", 1);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2P1Text");
            UI.RemoveElement("B2P2Text");
            UI.RemoveElement("B2P3Text");
            UI.RemoveElement("B2P4Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS3R1B3", 1, function()
            {
                Subject.Notify("B4");
            }, "B3Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R1B3, "B3Text", 1);
        });

        Subject.AddObserver("B4", function()
        {
            UI.RemoveElement("B3Image");
            UI.RemoveElement("B3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS3R1B4", 1, null, "B4Image");
            UI.CreateImage(0.125, 0.75, -5, null, 0.25, function(){}, "Blocker1Image");
            UI.CreateImage(0.5, 1.64, -5, null, 1, function(){}, "Blocker2Image");

            UI.CreateText(0.3, 0.25, -6, locale[gameSettings.language].tutorialS3R1B4, "B4Text", 1);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");
            UI.RemoveElement("Blocker1Image");
            UI.RemoveElement("Blocker2Image");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("A2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R1A1, "A1Text", 1.2);
        });

        Subject.AddObserver("A2", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("nextRoom-tutorialS3R2");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R1A2, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "tutorialS3R2");
        Subject.Notify("B1");
    }
);

let tutorialS3R2 = new UI_Layout();
Scenes.set("tutorialS3R2", tutorialS3R2);
tutorialS3R2.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS3R2B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R2B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS3R2B2", 1, null, "B2Image");
            UI.CreateImage(0.5, 1.64, -5, null, 1, function(){}, "BlockerImage");

            UI.CreateText(0.7, 0.85, -6, locale[gameSettings.language].tutorialS3R2B2, "B2Text", 1);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2Text");
            UI.RemoveElement("BlockerImage");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                SetScene("tutorialmenu");
                Log("tutorial-completions", gameSettings.playerName.toString() + " has completed the tutorial 3");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS3R2A1, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "");
        Subject.Notify("B1");
    }
);

let tutorialS4R1 = new UI_Layout();
Scenes.set("tutorialS4R1", tutorialS4R1);
tutorialS4R1.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS4R1B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS4R1B2, "B2Text", 1.2);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("B4");
            }, "B3Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS4R1B3, "B3Text", 1.2);
        });

        Subject.AddObserver("B4", function()
        {
            UI.RemoveElement("B3Image");
            UI.RemoveElement("B3Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS4R1B4", 1, null, "B4Image");
            UI.CreateImage(0.5, 0.5, -5, null, 0.6, function(){}, "Blocker1Image");
            UI.CreateImage(0.5, 1.64, -5, null, 1, function(){}, "Blocker2Image");

            UI.CreateText(0.3, 0.25, -6, locale[gameSettings.language].tutorialS4R1B4, "B4Text", 1);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B4Image");
            UI.RemoveElement("B4Text");
            UI.RemoveElement("Blocker1Image");
            UI.RemoveElement("Blocker2Image");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS4R1A1", 1, function()
            {
                Subject.Notify("nextRoom-tutorialS4R2");
            }, "A1Image");

            UI.CreateText(0.5, 0.75, -6, locale[gameSettings.language].tutorialS4R1A1, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "tutorialS4R2");
        Subject.Notify("B1");
    }
);

let tutorialS4R2 = new UI_Layout();
Scenes.set("tutorialS4R2", tutorialS4R2);
tutorialS4R2.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, null, "B1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS4R2B1, "B1Text", 1.2);
        });

        Subject.AddObserver("A1", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS1R1B1", 1, function()
            {
                Subject.Notify("nextRoom-tutorialS4R3");
            }, "A1Image");

            UI.CreateText(0.5, 0.25, -6, locale[gameSettings.language].tutorialS4R2A1, "A1Text", 1.2);
        });

        AddGenericTutorialStuff(parameters.field, "tutorialS4R3");
        Subject.Notify("B1");
    }
);

let tutorialS4R3 = new UI_Layout();
Scenes.set("tutorialS4R3", tutorialS4R3);
tutorialS4R3.addElementCall
(
    function(parameters)
    {
        Subject.AddObserver("B1", function()
        {
            UI.CreateImage(0.5, 0.5, -5, "tutorialS4R1A1", 1, function()
            {
                Subject.Notify("B2");
            }, "B1Image");

            UI.CreateText(0.5, 0.75, -6, locale[gameSettings.language].tutorialS4R3B1, "B1Text", 1.2);
        });

        Subject.AddObserver("B2", function()
        {
            UI.RemoveElement("B1Image");
            UI.RemoveElement("B1Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS4R1A1", 1, function()
            {
                Subject.Notify("B3");
            }, "B2Image");

            UI.CreateText(0.5, 0.75, -6, locale[gameSettings.language].tutorialS4R3B2, "B2Text", 1.2);
        });

        Subject.AddObserver("B3", function()
        {
            UI.RemoveElement("B2Image");
            UI.RemoveElement("B2Text");

            UI.CreateImage(0.5, 0.5, -5, "tutorialS4R1A1", 1, function()
            {
                SetScene("tutorialmenu");
                Log("tutorial-completions", gameSettings.playerName.toString() + " has completed the tutorial 4");
            }, "B3Image");

            UI.CreateText(0.5, 0.75, -6, locale[gameSettings.language].tutorialS4R3B3, "B3Text", 1);
        });

        AddGenericTutorialStuff(parameters.field, "");
        Subject.Notify("B1");
    }
);

function AddGenericTutorialStuff(field, nextRoomName)
{
    let gameTableContainer = UI.CreateContainer(gameTableObject, 0, 0, 0);
    VisualElements.set("gameTable", gameTableContainer);
    gameTableContainer.element.PitsFlushTexts();

    const topOcc = game.TopOccFromFieldString(field);
    const bottomOcc = game.BottomOccFromFieldString(field);

    for (let i = 0; i < 16; i++)
    {
        gameTableObject.SetPitOccupation
        (
            "top",
            i,
            topOcc[i]
        );

        gameTableObject.SetPitOccupation
        (
            "bottom",
            i,
            bottomOcc[i]
        );
    }

    SetLocalGameOccupations(topOcc, bottomOcc);

    gameTableObject.connector.ServerToClientCallbacks.SetTurn = function()
    {
        Subject.Notify("A1");
    }

    gameTableObject.connector.ServerToClientCallbacks.GameOver = function()
    {
        Subject.Notify("A1");
    }

    Subject.AddObserver("nextRoom-" + nextRoomName, function()
    {
        TutorialGameStart();
        SetScene(nextRoomName, { field: fields[nextRoomName.slice(-4)]});
    });

    UI.CreateButton(0.5, 0.5, 1, 0.3, 0.09, function()
        {
        },
        "", "endButton", 1);
}