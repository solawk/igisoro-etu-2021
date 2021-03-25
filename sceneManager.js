import
{
    UI_Layout
} from "./ui/uiLayout.js";

import * as UI_Factory from "./ui/uiFactory.js";

import
{
    VisualElements
} from "./rendering.js";

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
        UI_Factory.CreateText(0.1, 0.5,
            "Нажмите здесь, чтобы запустить игру с указанными настройками", false, "standbyText");
    }
);

let gameLayout = new UI_Layout();
Scenes.set("game", gameLayout);
gameLayout.addElementCall
(
    function()
    {
        let gameSceneContainer = UI_Factory.CreateContainer(gameTableObject, 0, 0);
        VisualElements.set("gameScene", gameSceneContainer);
    }
);