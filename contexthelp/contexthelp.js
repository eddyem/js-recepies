/*
 * function ContextHelp()
 * creates contexthelp object with methods:
 *    init(A,L)  - call this method first, where
 *       A - object with help text, A = {ID1 or Name1: text1, ID2 or Name2: text2, ...}
 *          where ID or Name is id or name of HTML object you want to make context help
 *       L - (optional) label for help text (placed below text, have class redtxt)
 *    mkLabel(L) - add default hyperlink-like "button" for help calling, L - text on "button"
 *    activate() - call this method to activate help if you don't use default mkLabel
 */

function ContextHelp(){
	this.activate = _ContextHelp.callHelp;
	this.mkLabel = function(helplabel){_ContextHelp.mkLabel(helplabel);};
	this.init = function(helpArr, helpLbl){_ContextHelp.init(helpArr, helpLbl);};
	return this;
}

_ContextHelp = function(){
// create element and put it into the DOM tree
function creEl(Tag, Parent, Class, ID){
	var el = document.createElement(Tag);
	if(Class) el.className = Class;
	if(ID) el.id = ID;
	if(Parent){
		Parent.appendChild(el);
		el = Parent.lastElementChild;
	}
	return el;
}
function addLbl(lbl){
	if(!lbl) lbl = "Context help";
	var d = creEl("div", document.body, "helperdiv");
	var a = creEl("a", d, "helperanchor");
	a.href = "#";
	a.innerHTML = lbl;
	a.onclick = startHelp;
}
function initHelpText(helpArr, HL){
	HelpText = helpArr;
	if(HL) helpLabel = HL;
}

var tipobj = null;
var HelpText = null;
var helpLabel = "Click on this window or press ESC key to close helps";

function pE(e){
	if(e){
		e.stopPropagation();
		e.preventDefault();
	}
}

var oC, oK, oM;
function startHelp(e){
	pE(e);
	if(!HelpText) return false;
	oC = document.body.onclick;
	oM = document.body.onmouseover;
	oK = document.body.onkeydown;
	document.body.onkeydown = onkey;
	document.body.onclick = Help;
	document.body.onmouseover = checkobj;
	onkey(null, true); // remove old help tips
}

function Help(e){
	pE(e);
	if(!helptip(e)) return;
	document.body.onclick = oC;
	document.body.onmouseover = oM;
}

var oldclc, oldmout, oldcur;
function checkobj(e){
	pE(e);
	var obj = e.target;
	if(obj == document.body) return;
	if(typeof(obj.helpText) == "undefined"){
		var ht = getHT(obj);
		obj.helpText = ht;
	}
	oldclc = obj.onclick;
	oldmout = obj.onmouseout;
	obj.onclick = Help;
	obj.onmouseout = releaseonclick;
	oldcur = obj.style.cursor;
	if(obj.helpText) obj.style.cursor = "help";
}
function releaseonclick(e){
	pE(e);
	var obj = e.target;
	obj.onmouseout = oldmout;
	obj.onclick = oldclc;
	if(oldcur) obj.style.cursor = oldcur;
	else obj.style.cursor = "";
}
function helptip(e){
	var ss = e.target.helpText, helper;
	releaseonclick(e);
	if(ss && ss.length > 0){
		tipobj = document.createElement("DIV");
		tipobj.id = 'helptip';
		tipobj.setAttribute("name", "helptip");
		tipobj.onclick = function(e){document.body.removeChild(e.target);};
		tipobj.innerHTML = ss;
		helper = document.createElement("DIV");
		helper.className = 'redtxt';
		helper.innerHTML = helpLabel;
		helper.onclick = function(evt){evt.stopPropagation();
			document.body.removeChild(evt.target.parentNode);};
		tipobj.appendChild(helper);
		document.body.appendChild(tipobj);
		positiontip(e);
	}else return 0;
	return (ss.length);
}

function getHT(obj){
	var objid = obj.id, objname = obj.name;
	var ss="", nm;
	objid = obj.id; objname = obj.name;
	if(!objid && !objname) return null
	if(!objid && objname) nm = objname;
	else nm = objid;
	ss = HelpText[nm];
	return ss;
}

function positiontip(e){
	var wd = tipobj.offsetWidth, ht = tipobj.offsetHeight;
	var curX = e.clientX + 25;
	var curY = e.clientY - ht/2;
	var btmedge = document.body.clientHeight - curY - 15;
	var rightedge = document.body.clientWidth - curX - 15;
	if(rightedge < wd) curX -= wd+50;
	if(btmedge < ht) curY -= ht-btmedge+15;
	if(curY < 15) curY = 15;
	tipobj.style.left = curX+"px";
	tipobj.style.top = curY+"px";
}

function onkey(e, store){
	if(e && e.keyCode != 27) return;
	var helps = document.getElementsByName('helptip');
	var l = helps.length-1;
	for(var i=l; i>-1; i--) document.body.removeChild(helps[i]);
	if(!store){
		document.body.onkeydown = oK;
		document.body.onclick = oC;
		document.body.onmouseover = oM;
	}
}

return{
	mkLabel:  addLbl,
	callHelp: startHelp,
	init:     initHelpText
}
}();
