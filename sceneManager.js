import
{
    UI_Layout
} from "./ui/uiLayout.js";

import * as UI_Factory from "./ui/uiFactory.js";

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
    Scenes.get(sceneName).unveil();
}

let mainMenuLayout = new UI_Layout();
Scenes.set("mainmenu", mainMenuLayout);
mainMenuLayout.addElementCall(
    function()
    {
        const logoText = UI_Factory.CreateText(0.5, 0.15 * 9 / 16, 0, "Igisoro", "logoText");
        logoText.element.sizeRatio = 3;

        UI_Factory.CreateText(0.5, 0.275 * 9 / 16, 0, "Welcome back, " + gameSettings.playerName, "nameText");

        UI_Factory.CreateButton(0.5, 0.35 * 9 / 16, 1, 0.2, 0.04,
            function()
            {
                if (!UI_Factory.ElementExists("nameInput"))
                {
                    UI_Factory.RemoveElement("nameText");

                    UI_Factory.CreateInput(0.5, 0.275 * 9 / 16, 1, 0.3, 0.05, "playerName", "text", 12, "nameInput");

                    UI_Factory.ChangeButtonText("nameButton", "Apply");
                }
                else
                {
                    UI_Factory.GetElement("nameInput").RetractInput();
                    UI_Factory.RemoveElement("nameInput");

                    UI_Factory.CreateText(0.5, 0.275 * 9 / 16, 0, "Welcome back, " + gameSettings.playerName, "nameText");

                    UI_Factory.ChangeButtonText("nameButton", "Change name");
                }
            },
            "Change name", "nameButton");

        UI_Factory.CreateButton(0.25, 0.6 * 9 / 16, 0, 0.4, 0.1, LocalGameStart, "Local Multiplayer", "localGameButton");
        const localGameText = UI_Factory.GetElement("localGameButtonText");
        localGameText.sizeRatio = 1.5;
    }
);

let gameLayout = new UI_Layout();
Scenes.set("game", gameLayout);
gameLayout.addElementCall
(
    function()
    {
        let gameTableContainer = UI_Factory.CreateContainer(gameTableObject, 0, 0, 0);
        VisualElements.set("gameTable", gameTableContainer);
        gameTableContainer.element.PitsFlushTexts();

        UI_Factory.CreateButton(0.5, 0.5 * 9 / 16, 1, 0.3, 0.05, LocalGameEnd,
            "Exit", "endButton");
    }
);