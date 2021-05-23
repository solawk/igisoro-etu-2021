import{GameTable}from"./gameTable.js";import{GetElementsSorted}from"./rendering.js";import*as SceneManager from"./sceneManager.js";import*as Subject from"./ui/uiSubject.js";import*as Messenger from"./clientMessenger.js";import{AI}from"./ai.js";const canvas=document.getElementById("gameCanvas");function ClickHandler(e){const n=GetElementsSorted(!1);for(let t of n)if(t.Click(e.offsetX,e.offsetY))break}canvas.onclick=ClickHandler;const globalScope=this;export let serverWebsocket=null;export let serverStatus="discon";ConnectToServer();export function ConnectToServer(){serverStatus="pend",Subject.Notify("serverPend"),console.log("Connection pending"),(serverWebsocket=new WebSocket("wss://igisoro.herokuapp.com")).addEventListener("open",function(){serverStatus="con",Subject.Notify("serverCon"),console.log("Connected to server!")}),serverWebsocket.addEventListener("close",function(){serverStatus="discon",Subject.Notify("serverDiscon"),Subject.Notify("onlineConnectionLost"),console.log("Server connection failed")}),serverWebsocket.addEventListener("message",function(e){const n=e.data;Messenger.ProcessMessage(n)})}function PingServer(){Messenger.SendMessage("P")}setInterval(function(){"con"===serverStatus&&PingServer()},15e3);export function RequestNewSession(){let e="N";switch(e+="S",gameSettings.firstTurn){case"first":e+="B";break;case"second":e+="T";break;case"random":e+=Math.random()<.5?"B":"T"}e+="?",e+="T"+gameSettings.gameSpeed.toString(),e+="?",e+="R"+gameSettings.reverseLevel.toString(),e+="?",e+="N"+gameSettings.playerName,e+="?",Messenger.SendMessage(e)}export function JoinSession(){let e="J";e+="C"+gameSettings.joinCode.toString(),e+="?",e+="N"+gameSettings.playerName,e+="?",Messenger.SendMessage(e)}export function InvalidJoinCode(){Subject.Notify("invalidCode")}export function OpponentLostConnection(){Subject.Notify("conlost")}export function OpponentReconnected(e){gameTable.opponent=e,Subject.Notify("recon")}export function DisconnectMe(){Messenger.SendMessage("D")}export function EnterLobby(e){SceneManager.SetScene("lobby",{sessionCode:e})}export function LocalGameStart(e,n){null==e?Log("local-multiplayer",gameSettings.playerName.toString()+" has entered a local session"):Log("vs-ai",gameSettings.playerName.toString()+" has entered a session against AI of difficulty "+gameSettings.aiDifficulty);const t=100*(5-gameSettings.gameSpeed+1),o={topOccupations:[],bottomOccupations:[]};for(let e=0;e<8;e++)o.topOccupations[e]=4,o.bottomOccupations[e]=4,o.topOccupations[e+8]=0,o.bottomOccupations[e+8]=0;LogicConnector=new GameConnector,LocalGame=game.StartGame("bottom",t,o,gameSettings.reverseLevel,LogicConnector),gameTable=new GameTable(LogicConnector,"bottom",o,t,gameSettings.rotateOccupations,n||"bottom",e),SceneManager.SetGameTableObject(gameTable),SceneManager.SetScene("game",{isOnline:!1}),LogicConnector.Callers.Server=LocalGame,LogicConnector.Callers.Client=gameTable,LogicConnector.ClientToServerCallbacks.StartMove=LocalGame.StartMove,LogicConnector.ServerToClientCallbacks.SetOccupation=gameTable.SetPitOccupation,LogicConnector.ServerToClientCallbacks.AddTransfer=gameTable.CreateTransfer,LogicConnector.ServerToClientCallbacks.SetTurn=gameTable.SetTurn,LogicConnector.ServerToClientCallbacks.Reverse=gameTable.SetReverse,LogicConnector.ServerToClientCallbacks.GameOver=gameTable.DesignateWinner}export function AttachAI(e,n){AIAgent=new AI(LogicConnector,e,n),LogicConnector.ServerToClientCallbacks.SetTurn=function(e){gameTable.SetTurn(e),AIAgent.React()},LogicConnector.ServerToClientCallbacks.Reverse=function(e){gameTable.SetReverse(e),-1!==e&&AIAgent.React()}}export function LocalGameEnd(){LocalGame=null,gameTable=null;const e=null!=AIAgent;AIAgent=null,LogicConnector.ServerToClientCallbacks.SetOccupation=function(){},LogicConnector.ServerToClientCallbacks.AddTransfer=function(){},LogicConnector.ServerToClientCallbacks.SetTurn=function(){},LogicConnector.ServerToClientCallbacks.Reverse=function(){},LogicConnector.ServerToClientCallbacks.GameOver=function(){},e?SceneManager.SetScene("aimenu"):SceneManager.SetScene("mainmenu")}export function SetLocalGameOccupations(e,n){LocalGame.topOccupations=e,LocalGame.bottomOccupations=n}export function TutorialGameStart(){const e={topOccupations:[],bottomOccupations:[]};for(let n=0;n<16;n++)e.topOccupations[n]=0,e.bottomOccupations[n]=0;LogicConnector=new GameConnector,LocalGame=game.StartGame("bottom",300,e,3,LogicConnector),gameTable=new GameTable(LogicConnector,"bottom",e,300,!1,"bottom",null),SceneManager.SetGameTableObject(gameTable),LogicConnector.Callers.Server=LocalGame,LogicConnector.Callers.Client=gameTable,LogicConnector.ClientToServerCallbacks.StartMove=LocalGame.StartMove,LogicConnector.ServerToClientCallbacks.SetOccupation=gameTable.SetPitOccupation,LogicConnector.ServerToClientCallbacks.AddTransfer=gameTable.CreateTransfer,LogicConnector.ServerToClientCallbacks.Reverse=gameTable.SetReverse,LogicConnector.ServerToClientCallbacks.SetTurn=function(){},LogicConnector.ServerToClientCallbacks.GameOver=function(){}}export function OnlineGameStart(e,n,t,o,a){Log("online-multiplayer",gameSettings.playerName.toString()+" has entered an online session");const r={topOccupations:game.TopOccFromFieldString(o),bottomOccupations:game.BottomOccFromFieldString(o)};(PresentationConnector=new GameConnector).Callers.Server=globalScope,gameTable=new GameTable(PresentationConnector,a,r,n,!1,e,t),SceneManager.SetGameTableObject(gameTable),SceneManager.SetScene("game",{isOnline:!0}),PresentationConnector.Callers.Client=gameTable,PresentationConnector.ClientToServerCallbacks.StartMove=Messenger.SendMove,PresentationConnector.ServerToClientCallbacks.SetOccupation=gameTable.SetPitOccupation,PresentationConnector.ServerToClientCallbacks.AddTransfer=gameTable.CreateTransfer,PresentationConnector.ServerToClientCallbacks.SetTurn=gameTable.SetTurn,PresentationConnector.ServerToClientCallbacks.Reverse=gameTable.SetReverse,PresentationConnector.ServerToClientCallbacks.GameOver=gameTable.DesignateWinner}export function Log(e,n){Messenger.SendMessage("LC"+e+"?M"+n+" -- "+(new Date).toUTCString()+"?")}export let LocalGame=null;let gameTable=null,AIAgent=null,LogicConnector=null;export let PresentationConnector=null;export const gameSettings={playerName:"Player"+Math.floor(100+900*Math.random()),language:"en",gameSpeed:3,reverseLevel:2,rotateOccupations:!1,firstTurn:"random",joinCode:100,aiDifficulty:1,aiFirstTurn:"random"};function InitLocalStorage(){const e=["playerName","language","gameSpeed","reverseLevel","rotateOccupations","aiDifficulty"],n={};for(const t of e){let e=localStorage[t];e||(localStorage.setItem(t,gameSettings[t]),e=gameSettings[t].toString()),n[t]=e}gameSettings.playerName=n.playerName,gameSettings.language=n.language,gameSettings.gameSpeed=parseInt(n.gameSpeed),gameSettings.reverseLevel=parseInt(n.reverseLevel),gameSettings.rotateOccupations="true"===n.rotateOccupations,gameSettings.aiDifficulty=parseInt(n.aiDifficulty)}InitLocalStorage(),SceneManager.SetScene("mainmenu");