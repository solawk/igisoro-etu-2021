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
    gameSettings
} from "./client.js";

import * as Subject from "./ui/uiSubject.js";

export let gameTableObject = null;
export function SetGameTableObject(gameTable)
{
    gameTableObject = gameTable;
}

let Scenes = new Map;

export function SetScene(sceneName)
{
    for (let element of VisualElements.values())
    {
        element.Destroy();
    }

    VisualElements.clear();
    Subject.GameObservers.clear();
    Scenes.get(sceneName).unveil();
}

let mainMenuLayout = new UI_Layout();
Scenes.set("mainmenu", mainMenuLayout);
mainMenuLayout.addElementCall(
    function()
    {
        UI.CreateText(0.5, 0.15 * 9 / 16, 0, "Igisoro", "logoText", 3);
        UI.CreateText(0.7, 0.15 * 9 / 16, 0, "v.0.11", "versionText", 1);

        UI.CreateText(0.5, 0.275 * 9 / 16, 0, "Welcome back, " + gameSettings.playerName, "nameText", 1);
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

        UI.CreateButton(0.5, 0.35 * 9 / 16, 1, 0.17, 0.03,
            function()
            {
                if (UI.GetElement("nameInput") == null)
                {
                    Subject.Notify("nameChangeStart");

                    UI.CreateInput(0.5, 0.275 * 9 / 16, 1, 0.3, 0.05, "playerName", "text", 12, "nameInput");
                }
                else
                {
                    UI.GetElement("nameInput").RetractInput();
                    UI.RemoveElement("nameInput");

                    Subject.Notify("nameChangeFinish");
                }
            },
            "Change name", "nameButton", 0.8);

        UI.CreateButton(0.25, 0.55 * 9 / 16, 0, 0.4, 0.1, LocalGameStart, "Local Multiplayer", "localGameButton", 1.5);

        UI.CreateButton(0.75, 0.8 * 9 / 16, 0, 0.4, 0.1,
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

        UI.CreateText(0.5, 0.075 * 9 / 16, 0, "Game speed", "speedTitle", 2);

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

            UI.CreateImage(0.1 + ((i - 1) * 0.2), 0.35 * 9 / 16, 0, gameSettings.gameSpeed === i ? "checkMark" : null, 0.075, "speed" + i + "Mark");

            UI.CreateButton(0.1 + ((i - 1) * 0.2), 0.23 * 9 / 16, 0, 0.15, 0.075,
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
                "Reversing allowed\nif a direct capture\nhas occurred in this move",
                "Reversing allowed"
            ];

        UI.CreateText(0.5, 0.475 * 9 / 16, 0, "Reversing levels", "revlevelTitle", 2);
        UI.CreateText(0.8, 0.63 * 9 / 16, 0, revlevelDescriptions[gameSettings.reverseLevel], "revlevelDesc", 1);

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

            UI.CreateImage(0.1 + (i * 0.2), 0.75 * 9 / 16, 0, gameSettings.reverseLevel === i ? "checkMark" : null, 0.075, "revlevel" + i + "Mark");

            UI.CreateButton(0.1 + (i * 0.2), 0.63 * 9 / 16, 0, 0.15, 0.075,
                function()
                {
                    Subject.Notify("revlevelSet" + i);
                },
                i, "revlevel" + i + "Button", 2);
        }

        UI.CreateButton(0.5, 0.9 * 9 / 16, 0, 0.3, 0.05,
                function()
                {
                    SetScene("mainmenu");
                },
                "Back", "backToMenuButton", 1);
    }
)

let gameLayout = new UI_Layout();
Scenes.set("game", gameLayout);
gameLayout.addElementCall
(
    function()
    {
        let gameTableContainer = UI.CreateContainer(gameTableObject, 0, 0, 0);
        VisualElements.set("gameTable", gameTableContainer);
        gameTableContainer.element.PitsFlushTexts();

        UI.CreateButton(0.5, 0.5 * 9 / 16, 1, 0.3, 0.05, LocalGameEnd,
            "Exit", "endButton", 1);
    }
);