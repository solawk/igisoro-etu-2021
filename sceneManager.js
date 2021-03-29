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
    LocalGameEnd
} from "./client.js";

export let gameTableObject = null;
export function SetGameTableObject(gameTable)
{
    gameTableObject = gameTable;
}

let Scenes = new Map;

export function SetScene(sceneName)
{
    VisualElements.clear();
    Scenes.get(sceneName).unveil();
}

let standbyLayout = new UI_Layout();
Scenes.set("standby", standbyLayout);
standbyLayout.addElementCall
(
    function()
    {
        UI_Factory.CreateButton(0.5, 0.5 * 9 / 16, 0, 0.9, 0.1, LocalGameStart,
            "Нажмите здесь, чтобы запустить игру с указанными настройками", "launchButton");
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
            "Выйти", "endButton");
    }
);