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
        UI.CreateText(0.5, 0.15, 0, "Igisoro", "logoText", 3);
        UI.CreateText(0.7, 0.15, 0, "v.0.14", "versionText", 1);

        UI.CreateText(0.5, 0.275, 0, "Welcome back, " + gameSettings.playerName, "nameText", 1);
        Subject.AddObserver("nameChangeStart", function()
        {
            UI.ChangeElementText(UI.GetElement("nameText"), "");
            UI.ChangeElementText(UI.GetElement("nameButtonText"), "Apply");
        });
        Subject.AddObserver("nameChangeFinish", function()
        {
            UI.ChangeElementText(UI.GetElement("nameText"), "Welcome back, " + gameSettings.playerName);
            UI.ChangeElementText(UI.GetElement("nameButtonText"), "Change name");
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
            "Change name", "nameButton", 0.8);

        const serverStatusReadings =
            [
                "Server pending",
                "Server offline",
                "Server online"
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
            UI.ChangeElementText(UI.GetElement("serverStatusText"), serverStatusReadings[0]);
            UI.ChangeElementColor(UI.GetElement("onlineButtonText"), "rgba(128, 128, 128, 1)");
        });
        Subject.AddObserver("serverCon", function()
        {
            UI.ChangeElementText(UI.GetElement("serverStatusText"), serverStatusReadings[2]);
            UI.ChangeElementColor(UI.GetElement("onlineButtonText"), "rgba(255, 255, 255, 1)");
        });
        Subject.AddObserver("serverDiscon", function()
        {
            UI.ChangeElementText(UI.GetElement("serverStatusText"), serverStatusReadings[1]);
            UI.ChangeElementColor(UI.GetElement("onlineButtonText"), "rgba(128, 128, 128, 1)");
        });

        UI.CreateButton(0.15, 0.17, 0, 0.16, 0.05, ConnectToServer, "Reconnect", "reconnectButton", 1);

        UI.CreateButton(0.25, 0.55, 0, 0.4, 0.18, LocalGameStart, "Local Multiplayer", "localGameButton", 1.5);

        UI.CreateButton(0.25, 0.8, 0, 0.4, 0.18,
            function()
            {
                if (serverStatus === "con")
                {
                    SetScene("onlinemenu");
                }
            }, "Online Multiplayer", "onlineButton", 1.5);
        UI.ChangeElementColor(UI.GetElement("onlineButtonText"), serverStatus === "con" ? "rgba(255, 255, 255, 1)" : "rgba(128, 128, 128, 1)");

        UI.CreateButton(0.75, 0.8, 0, 0.4, 0.18,
            function()
            {
                SetScene("settings");
            },
            "Settings", "settingsButton", 1.5);
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
                "Very slow",
                "Slow",
                "Normal",
                "Fast",
                "Very fast"
            ];

        UI.CreateText(0.5, 0.075, 0, "Game speed", "speedTitle", 2);

        for (let i = 1; i <= 5; i++)
        {
            Subject.AddObserver("speedSet" + i, function()
            {
                gameSettings.gameSpeed = i;

                for (let o = 1; o <= 5; o++)
                {
                    UI.ChangeElementImage(UI.GetElement("speed" + o + "Mark"), null);
                }

                UI.ChangeElementImage(UI.GetElement("speed" + i + "Mark"), "checkMark");
            });

            UI.CreateImage(0.1 + ((i - 1) * 0.2), 0.35, 0, gameSettings.gameSpeed === i ? "checkMark" : null, 0.075, "speed" + i + "Mark");

            UI.CreateButton(0.1 + ((i - 1) * 0.2), 0.23, 0, 0.15, 0.14,
                function()
                {
                    Subject.Notify("speedSet" + i);
                },
                speedNames[i - 1], "speed" + i + "Button", 1);
        }

        // Reverse levels stuff
        const revlevelDescriptions =
            [
                "Reversing not allowed",
                "Reversing allowed\nif a capture\nhas occurred in this move",
                "Reversing allowed"
            ];

        UI.CreateText(0.5, 0.475, 0, "Reversing levels", "revlevelTitle", 2);
        UI.CreateText(0.8, 0.63, 0, revlevelDescriptions[gameSettings.reverseLevel], "revlevelDesc", 1);

        for (let i = 0; i <= 2; i++)
        {
            Subject.AddObserver("revlevelSet" + i, function()
            {
                gameSettings.reverseLevel = i;

                for (let o = 0; o <= 2; o++)
                {
                    UI.ChangeElementImage(UI.GetElement("revlevel" + o + "Mark"), null);
                }

                UI.ChangeElementImage(UI.GetElement("revlevel" + i + "Mark"), "checkMark");
                UI.ChangeElementText(UI.GetElement("revlevelDesc"), revlevelDescriptions[i]);
            });

            UI.CreateImage(0.1 + (i * 0.2), 0.75, 0, gameSettings.reverseLevel === i ? "checkMark" : null, 0.075, "revlevel" + i + "Mark");

            UI.CreateButton(0.1 + (i * 0.2), 0.63, 0, 0.15, 0.14,
                function()
                {
                    Subject.Notify("revlevelSet" + i);
                },
                i, "revlevel" + i + "Button", 2);
        }

        UI.CreateButton(0.25, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            "Menu", "backToMenuButton", 1);

        UI.CreateButton(0.75, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("uitweaks");
            },
            "UI", "uiTweaksButton", 1);
    }
)

let uiTweaks = new UI_Layout();
Scenes.set("uitweaks", uiTweaks);
uiTweaks.addElementCall
(
    function()
    {
        Subject.AddObserver("switchRotateOccupations", function()
        {
            gameSettings.rotateOccupations = !gameSettings.rotateOccupations;

            UI.ChangeElementText(UI.GetElement("rotateOccupationsSwitchText"), gameSettings.rotateOccupations ? "Enabled" : "Disabled");
        });

        UI.CreateText(0.5, 0.175, 0, "Rotate pit occupations\nin local multiplayer", "rotateOccupationsText", 1.5);
        UI.CreateButton(0.5, 0.3, 0, 0.3, 0.09,
            function()
            {
                Subject.Notify("switchRotateOccupations");
            },
            gameSettings.rotateOccupations ? "Enabled" : "Disabled", "rotateOccupationsSwitch", 1);

        UI.CreateButton(0.25, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("mainmenu");
            },
            "Menu", "backToMenuButton", 1);

        UI.CreateButton(0.75, 0.9, 0, 0.3, 0.09,
            function()
            {
                SetScene("settings");
            },
            "Settings", "settingsButton", 1);
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
                    UI.ChangeElementText(UI.GetElement("spinFirstTurnButtonText"), "Me");
                    break;

                case "first":
                    gameSettings.firstTurn = "second";
                    UI.ChangeElementText(UI.GetElement("spinFirstTurnButtonText"), "Opponent");
                    break;

                case "second":
                    gameSettings.firstTurn = "random";
                    UI.ChangeElementText(UI.GetElement("spinFirstTurnButtonText"), "Random");
                    break;
            }
        });

        UI.CreateButton(0.25, 0.2, 0, 0.4, 0.18, RequestNewSession, "Create game", "newOnlineGameButton", 1.5);

        UI.CreateText(0.25, 0.4, 0, "First turn:", "firstTurnText", 1);

        let startingFirstTurn = "";

        switch (gameSettings.firstTurn)
        {
            case "random":
                startingFirstTurn = "Random";
                break;

            case "first":
                startingFirstTurn = "Me";
                break;

            case "second":
                startingFirstTurn = "Opponent";
                break;
        }

        UI.CreateButton(0.25, 0.5, 0, 0.2, 0.1, function()
        {
            Subject.Notify("spinfirstturn");
        }, startingFirstTurn, "spinFirstTurnButton", 1);

        // Joining
        UI.CreateButton(0.75, 0.2, 0, 0.4, 0.18, JoinSession, "Join game", "joinGameButton", 1.5);

        Subject.AddObserver("incHundreds", function()
        {
            let hundreds = Math.floor(gameSettings.joinCode / 100);
            gameSettings.joinCode -= hundreds * 100;
            hundreds++;
            if (hundreds > 9) hundreds = 1;
            gameSettings.joinCode += hundreds * 100;

            UI.ChangeElementText(UI.GetElement("joinCodeHundredsText"), hundreds.toString());
        });

        Subject.AddObserver("incTens", function()
        {
            let tens = Math.floor(gameSettings.joinCode % 100 / 10);
            gameSettings.joinCode -= tens * 10;
            tens = (tens + 1) % 10;
            gameSettings.joinCode += tens * 10;

            UI.ChangeElementText(UI.GetElement("joinCodeTensText"), tens.toString());
        });

        Subject.AddObserver("incOnes", function()
        {
            let ones = gameSettings.joinCode % 10;
            gameSettings.joinCode -= ones;
            ones = (ones + 1) % 10;
            gameSettings.joinCode += ones;

            UI.ChangeElementText(UI.GetElement("joinCodeOnesText"), ones.toString());
        });

        UI.CreateText(0.75, 0.4, 0, "Session code:", "joinCodeHintText", 1);

        const joinCodeHundreds = Math.floor(gameSettings.joinCode / 100);
        const joinCodeTens = Math.floor(gameSettings.joinCode % 100 / 10);
        const joinCodeOnes = gameSettings.joinCode % 10;

        UI.CreateButton(0.6, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incHundreds");
        }, (joinCodeHundreds).toString(), "joinCodeHundreds", 3);

        UI.CreateButton(0.75, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incTens");
        }, (joinCodeTens).toString(), "joinCodeTens", 3);

        UI.CreateButton(0.9, 0.6, 0, 0.14, 0.14 * 16 / 9, function()
        {
            Subject.Notify("incOnes");
        }, (joinCodeOnes).toString(), "joinCodeOnes", 3);

        UI.CreateText(0.75, 0.78, 0, "This session does not exist!", "invalidCodeText", 1);
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
            "Menu", "backToMenuButton", 1);
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

        UI.CreateText(0.5, 0.3, 0, "Session code: " + parameters.sessionCode, "codeText", 3);
        UI.CreateText(0.5, 0.6, 0, "Share it with a player you want to play with\n\nWaiting for the opponent to join...", "codeHintText", 1.5);

        UI.CreateButton(0.5, 0.9, 0, 0.3, 0.09,
            function()
            {
                DisconnectMe();
                SetScene("onlinemenu");
            },
            "Leave game", "backToOnlineMenuButton", 1);
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
                "vs " + gameTableObject.opponent, "opponentButton", 1);

            Subject.AddObserver("conlost", function()
            {
                UI.ChangeElementText(UI.GetElement("opponentButtonText"), "Opponent offline...");
            });

            Subject.AddObserver("recon", function()
            {
                UI.ChangeElementText(UI.GetElement("opponentButtonText"), "vs " + gameTableObject.opponent);
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
                "Really exit?", "confirmEndButton", 1,
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
                "Exit", "endButton", 1);
        });

        UI.CreateButton(0.5, 0.5, 1, 0.3, 0.09, function()
            {
                Subject.Notify("tryingToExit");
            },
            "Exit", "endButton", 1);
    }
);