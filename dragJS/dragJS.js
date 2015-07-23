/*
 * function DRdiv(insideHTML)
 * creates draggable and resizible div
 * arguments:
 *    insideHTML - optional, data inside created div
 * returns div element avaiable for user's manipulations
 * returned object has following attributes:
 *    place:  set element's position
 *    resize: set element's size
 *    delete: remove element from DOM tree
 */

function DRdiv(insideHTML){
	var el = _DRdiv.init(insideHTML);
	el.place = _DRdiv.setp;
	el.resize = _DRdiv.resize;
	el.delete = function(){this.parentNode.parentNode.removeChild(this.parentNode)};
	return el;
}

_DRdiv = function(){
/*
var elementsCache = {};
function $(id) {
	if (elementsCache[id] === undefined)
		elementsCache[id] = document.getElementById(id);
	return elementsCache[id];
}
*/
/*
 *         BASE CONSTANTS
 */
// main div extremal size:
const minW = 100, minH = 100, maxW = 700, maxH = 400;
// size of "resize" div
const resHW = "30px";
function mkDiv(insideHTML){
	var L = ["top" , "width" , "left"  , "w", resL];
	var R = ["top" , "width" , "right" , "e", resR];
	var U = ["left", "height", "top"   , "n", resU];
	var D = ["left", "height", "bottom", "s", resD];
	var borders =[[L, null], [R, null], [U, null], [D, null],
				  [U, L], [U, R], [D, R], [D, L]];
	var d = document.createElement("div");
	d.className = "drag";
	d.id = "Big";
	d.onmousedown = ds;
	var _cursor = "";
	function setstyle(el, stl){
		el.style[stl[1]] = resHW;
		el.style[stl[2]] = "0px";
		_cursor += stl[3];
		el.resizefn.push(stl[4]);
	}
	var inside = document.createElement("div");
	inside.id = "indrag";
	inside.className = "indrag";
	if(insideHTML) inside.innerHTML = insideHTML;
	d.appendChild(inside);
	for(var i = 0; i < 8; i++){
		var el = document.createElement("div");
		el.className = "resz";
		el.resizefn = new Array();
		setstyle(el, borders[i][0]);
		var zi = 20;
		if(borders[i][1]) setstyle(el, borders[i][1]);
		else{ zi = 19; el.style[borders[i][0][0]] = "0px"; el.resizefn.push(null);}
		el.style.cursor = _cursor + "-resize";
		_cursor = "";
		el.onmousedown = rs;
		d.appendChild(el);
	}
	document.body.appendChild(d);
	return inside;
}
function getPosition(el) {
	var left = 0, top = 0;
	while(el){
		left += el.offsetLeft;
		top += el.offsetTop;
		el = el.parentOffset;
	}
	return {left: left, top: top};
}
function getStyleProp(el, prop){
	var p = window.getComputedStyle(el, null).getPropertyValue(prop);
	return parseInt(p);
}
function pE(e){
	if(e.preventDefault) e.preventDefault();
	if(e.stopPropagation) e.stopPropagation();
}
var maxX, maxY, X, Y;;
var oldmove, oldup;
var activeEl;
var moving = false;
function ds(e){
	activeEl = this;
	setProps(e, dro);
}
function setProps(e, onmove){
	pE(e);
	moving = true;
	oldmove = window.onmousemove;
	oldup = window.onmouseup;
	window.onmousemove = onmove;
	window.onmouseup = de;
	var pos = getPosition(activeEl);
	X = pos.left - e.clientX - getStyleProp(activeEl, "margin-left");
	Y = pos.top - e.clientY - getStyleProp(activeEl, "margin-top");
	maxX = window.innerWidth - (activeEl.offsetWidth + getStyleProp(activeEl, "margin-right"));
	maxY = window.innerHeight - (activeEl.offsetHeight + getStyleProp(activeEl, "margin-bottom"));
}
var oW, oH, oX, oY;
var resizeF;
function rs(e){
	activeEl = this.parentElement;
	setProps(e, res);
	resizeF = this.resizefn;
	oX = e.clientX; oY = e.clientY;
	oW = activeEl.clientWidth;
	oH = activeEl.clientHeight;
}
function dro(e){
	if(!moving) return true;
	pE(e);
	var L = X + e.clientX;
	var T = Y + e.clientY;
	if(L < 0) L = 0; if(T < 0) T = 0;
	if(L > maxX) L = maxX; if(T > maxY) T = maxY;
	activeEl.style.left = L + "px";
	activeEl.style.top = T + "px";
	return false;
}
function res(e){
	if(!moving) return true;
	pE(e);
	resizeF[0](e);
	if(resizeF[1]) resizeF[1](e);
	return false;
}
function resLR(e, Left){
	var L = X + e.clientX;
	if(Left && L < 0) L = 0;
	if(!Left && L > maxX) L = maxX;
	var dW = (L - X - oX) * ((Left) ? -1 : 1);
	var nW = oW + dW;
	if(nW > minW && nW < maxW){
		activeEl.style.width = nW;
		if(Left) activeEl.style.left = L + "px";
	}
}
function resL(e){
	resLR(e, true);
}
function resR(e){
	resLR(e, false);
}
function resUD(e, Up){
	var T = Y + e.clientY;
	if(Up && T < 0) T = 0;
	if(!Up && T > maxY) T = maxY;
	var dH = (T - Y - oY) * ((Up) ? -1 : 1);
	var nH = oH + dH;
	if(nH > minH && nH < maxH){
		activeEl.style.height = nH;
		if(Up) activeEl.style.top = T + "px";
	}
}
function resU(e){
	resUD(e, true);
}
function resD(e){
	resUD(e, false);
}
function de(e){
	pE(e); moving = false;
	resizeF = []; activeEl = null;
	window.onmousemove = oldmove;
	window.onmouseup = oldup;
}
function placeDiv(left, top){
	var El = this.parentElement;
	El.style.left = left + "px";
	El.style.top = top + "px";
}
function resizeDiv(w, h){
	var El = this.parentElement;
	El.style.width = w;
	El.style.height = h;
}
return{
	init:   mkDiv,
	setp:  placeDiv,
	resize: resizeDiv
};
}();
