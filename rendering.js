const canvas=document.getElementById("gameCanvas"),ctx=canvas.getContext("2d");window.onresize=Redraw;export let CanvasSettings={context:ctx,dpr:window.devicePixelRatio||1,canvasW:0,canvasH:0,pitSize:0,pitGap:0,pitBorderOffset:0,standardFontSize:0,deratioW:function(a){return a*CanvasSettings.canvasW*CanvasSettings.dpr},deratioH:function(a){return a*CanvasSettings.canvasH*CanvasSettings.dpr}};AdjustCanvas();export let VisualElements=new Map;export let Images=new Map;let resLoadedAmount=0;LoadingScreen();export function Redraw(){AdjustCanvas();const a=canvas.width>Images.get("wood").image.width?canvas.width:Images.get("wood").image.width,t=canvas.height>9*Images.get("wood").image.width/16?canvas.height:9*Images.get("wood").image.width/16;ctx.drawImage(Images.get("wood").image,0,0,a,t);const n=GetElementsSorted(!0);for(let a of n)a.Draw()}export function GetElementsSorted(a){let t=Array.from(VisualElements.values());return t.sort(a?ZCompareFurthestFirst:ZCompareNearestFirst),t}function ZCompareFurthestFirst(a,t){return t.z-a.z}function ZCompareNearestFirst(a,t){return a.z-t.z}function AdjustCanvas(){CanvasSettings.dpr=window.devicePixelRatio||1,CanvasSettings.canvasW=.9*window.innerWidth,CanvasSettings.canvasW*(9/16)>.9*window.innerHeight&&(CanvasSettings.canvasW=1.6*window.innerHeight),CanvasSettings.canvasH=CanvasSettings.canvasW*(9/16),CanvasSettings.pitSize=CanvasSettings.canvasH*CanvasSettings.dpr/5,CanvasSettings.standardFontSize=CanvasSettings.canvasW*CanvasSettings.dpr/42,CanvasSettings.pitGap=CanvasSettings.pitSize/10,CanvasSettings.pitBorderOffset=CanvasSettings.pitSize/4,canvas.width=CanvasSettings.canvasW*CanvasSettings.dpr,canvas.height=CanvasSettings.canvasH*CanvasSettings.dpr,canvas.style.borderRadius=(CanvasSettings.canvasW/50).toString()+"px",canvas.style.width=Math.floor(CanvasSettings.canvasW)+"px",canvas.style.height=Math.floor(CanvasSettings.canvasH)+"px"}function LoadingImage(a,t){this.loaded=!1,this.image=new Image,this.image.addEventListener("load",function(){this.loaded=!0,resLoadedAmount++,LoadingUpdate()}.bind(this),!1);const n=t?".jpg":".png";this.image.src="images/"+a+n,Images.set(a,this)}function LoadingUpdate(){IsLoaded()?Redraw():LoadingScreen()}function IsLoaded(){let a=!0;for(let[t,n]of Images)!1===n.loaded&&(a=!1);return a}function LoadingScreen(){ctx.beginPath(),ctx.rect(0,0,CanvasSettings.canvasW,CanvasSettings.canvasH),ctx.fillStyle="rgba(0, 0, 0, 1)",ctx.fill(),ctx.closePath(),ctx.fillStyle="rgba(255, 255, 255, 1)",ctx.font="bold "+CanvasSettings.standardFontSize+"px math",ctx.fillText("Loading resources ("+resLoadedAmount+" of "+Images.size+")",CanvasSettings.canvasW/2,CanvasSettings.canvasH/2)}new LoadingImage("wood",!0),new LoadingImage("pit"),new LoadingImage("border"),new LoadingImage("seed"),new LoadingImage("arrow"),new LoadingImage("turn"),new LoadingImage("pitHalf"),new LoadingImage("pitGradient"),new LoadingImage("hand"),new LoadingImage("handShadow"),new LoadingImage("tutorialS1R1B1"),new LoadingImage("tutorialS1R1B4"),new LoadingImage("tutorialS1R1B5"),new LoadingImage("tutorialS1R2B1"),new LoadingImage("tutorialS2R1B2"),new LoadingImage("tutorialS2R1B3"),new LoadingImage("tutorialS2R1B4"),new LoadingImage("tutorialS2R2B4"),new LoadingImage("tutorialS3R1B2"),new LoadingImage("tutorialS3R1B3"),new LoadingImage("tutorialS3R1B4"),new LoadingImage("tutorialS3R2B1"),new LoadingImage("tutorialS3R2B2"),new LoadingImage("tutorialS4R1B4"),new LoadingImage("tutorialS4R1A1");