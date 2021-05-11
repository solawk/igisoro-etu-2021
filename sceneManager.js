import
{
    UI_Layout
} from "./ui/uiLayout.js";

import * as UI from "./ui/uiFactory.js";

import
{
    VisualElements
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
        UI.CreateText(0.7125, 0.15, 0, "v.0.16-6", "versionText", 1);

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

        UI.CreateButton(0.15, 0.17, 0, 0.275, 0.06, ConnectToServer, locale[gameSettings.language].reconnect, "reconnectButton", 1);

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

        UI.CreateButton(0.75, 0.8, 0, 0.4, 0.18,
            function()
            {
                SetScene("settings");
            },
            locale[gameSettings.language].settings, "settingsButton", 1.5);
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

        UI.CreateButton(0.75, 0.3, 0, 0.1, 0.15,
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

        let gameTableContainer = UI.CreateContainer(gameTableObject, 0, 0, 0);
        VisualElements.set("gameTable", gameTableContainer);
        gameTableContainer.element.PitsFlushTexts();

        if (gameTableObject.opponent != null)
        {
            UI.CreateButton(0.175, 0.5, 1, 0.3, 0.09, function()
            {

            },
                locale[gameSettings.language].vs + gameTableObject.opponent, "opponentButton", 1);

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