import{CanvasSettings}from"../rendering.js";import{DrawFrame}from"./uiFrame.js";export function UI_Button(t,i,h,a){this.lengthRatio=t,this.heightRatio=i,this.callback=h,this.missCallback=a}UI_Button.prototype.Draw=function(t,i,h){DrawFrame(t,i,CanvasSettings.deratioW(this.lengthRatio),CanvasSettings.deratioH(this.heightRatio))},UI_Button.prototype.Click=function(t,i){let h=!1;return t>=-this.lengthRatio/2+this.heightRatio/2&&t<=this.lengthRatio/2-this.heightRatio/2&&i>=-this.heightRatio/2&&i<=this.heightRatio/2&&(h=!0),Math.sqrt(Math.pow(t-(-this.lengthRatio+this.heightRatio)/2,2)+Math.pow(i,2))<this.heightRatio/2&&t<=0&&(h=!0),Math.sqrt(Math.pow(t-(this.lengthRatio-this.heightRatio)/2,2)+Math.pow(i,2))<this.heightRatio/2&&t>=0&&(h=!0),h?(this.callback(),!0):(null!=this.missCallback&&this.missCallback(),!1)},UI_Button.prototype.Destroy=function(){};