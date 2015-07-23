/*
 * function DatePicker(targetDateFieldID, displayBelowThisObject, dtFormat,
 * 							dtSep, sundayfirst, dayArray, monthArray)
 * inits datepicker form
 * arguments:
 *    targetDateFieldID - (required) ID of field bounded to datepicker
 *    displayBelowThisObject - (opt) object below which datepicher will be placed
 *    dtFormat - (opt) date format: "dmy", "ymd" or "mdy"
 *    dtSep - (opt) separator of date fields
 *    sundayfirst - (opt) bool == true if sunday is first in week
 *    dayArray - (opt) array with daynames (on your language); format: SuMoTuWeThFrSa[Su]
 *    monthArray - (opt) array with month names
 *
 * returns object with properties:
 *    getDate - returns Date() object from targetDateFieldID
 *    display - show/hide datepicker; return true if shown or false
 *
 * after closing if there is global function datePickerClosed, it will run
 */


/*
var elementsCache = {};
function $(id) {
	if (elementsCache[id] === undefined)
		elementsCache[id] = document.getElementById(id);
	return elementsCache[id];
}
*/

function DatePicker(targetDateFieldID, displayBelowThisObject, dtFormat,
						dtSep, sundayfirst, dayArray, monthArray){
	// if we weren't told what node to display the datepicker beneath, just display it
	// beneath the date field we're updating
	var targetDateField = $(targetDateFieldID);
	if(!targetDateField){
		alert("Undefined element with ID==\""+targetDateFieldID+"\"");
		return null;
	}
	if(!displayBelowThisObject)
		displayBelowThisObject = targetDateField;
	var x = displayBelowThisObject.offsetLeft;
	var y = displayBelowThisObject.offsetTop + displayBelowThisObject.offsetHeight ;
	// deal with elements inside tables and such
	var parent = displayBelowThisObject;
	while(parent.offsetParent){
		parent = parent.offsetParent;
		x += parent.offsetLeft;
		y += parent.offsetTop ;
	}
	_DatePicker.setDefVars(dtFormat, dtSep, sundayfirst, dayArray, monthArray);
	this.getDate = function(){return _DatePicker.parseUserString(targetDateFieldID);};
	this.display = function(){return _DatePicker.drawDatePicker(targetDateField, x, y)};
	return this;
}

_DatePicker = function(){
var sundayfirst = true; // whether a week starts from sunday
var defaultDateSeparator = "/";        // common values would be "/" or "."
var defaultDateFormat = "mdy"    // valid values are "mdy", "dmy", and "ymd"
var dateSeparator = defaultDateSeparator;
var dateFormat = defaultDateFormat;

var datePickerDivID = "datepicker";

const AllowableSeparators = "./-"; // chars that could be separators

var dayArrayEn   = new Array('Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su');
var monthArrayEn = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July',
	'August', 'September', 'October', 'November', 'December');

var dayArray = dayArrayEn, monthArray = monthArrayEn; // arrays with date and month

var timefieldValue = null;  // value of datetime field
var targetDateField = null; // target field for datepicker

function setDefVars(dtFormat, dtSep, sundayfrst, dayArr, monthArr){
	// if a date separator character was given, update the dateSeparator variable
	if(dtSep && dtSep.length == 1 && AllowableSeparators.indexOf(dtSep) != -1)
		dateSeparator = dtSep;
	else
		dateSeparator = defaultDateSeparator;
	// if a date format was given, update the dateFormat variable
	if(dtFormat)
		dateFormat = dtFormat;
	else
		dateFormat = defaultDateFormat;
	if(typeof(sundayfrst) != "undefined") sundayfirst = sundayfrst;
	else sundayfirst = true;
	if(dayArr && dayArr.length > 6){
		dayArray = dayArr;
		if(dayArr.length == 7) dayArray[7] = dayArr[0];
	}else
		dayArray = dayArrayEn;
	if(monthArr && monthArr.length == 12)
		monthArray = monthArr;
	else
		monthArray = monthArrayEn;
}

function drawDatePicker(TDF, x, y){
	targetDateField = TDF;
	var dt = getFieldDate(targetDateField.value);
	// the datepicker table will be drawn inside of a <div> with an ID defined by the
	// global datePickerDivID variable. If such a div doesn't yet exist on the HTML
	// document we're working with, add one.
	if(!document.getElementById(datePickerDivID)){
		var newNode = document.createElement("div");
		newNode.setAttribute("id", datePickerDivID);
		newNode.setAttribute("class", "dpDiv");
		newNode.setAttribute("style", "visibility: hidden;");
		document.body.appendChild(newNode);
	}
	// move the datepicker div to the proper x,y coordinate and toggle the visiblity
	var pickerDiv = document.getElementById(datePickerDivID);
	pickerDiv.style.left = x + "px";
	pickerDiv.style.top = y + "px";
	pickerDiv.style.visibility = (pickerDiv.style.visibility == "visible" ? "hidden" : "visible");
	pickerDiv.style.display = (pickerDiv.style.display == "block" ? "none" : "block");
	// draw the datepicker table
	if(pickerDiv.style.display == "none") return false;
	else{
		refreshDatePicker(targetDateField, dt.getFullYear(), dt.getMonth(), dt.getDate());
		return true;
	}
}

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
// create a day in calendar
function creTD(tr, cls, thisDay){
	var td = creEl("td", tr, cls);
	var DS = getDateString(thisDay);
	td.onclick = function(){updateDateField(targetDateField, DS);};
	return td;
}
// make string from time element
function getTimeString(time){
	var hourString = "00" + time.getHours();
	var minuteString = "00" + time.getMinutes();
	hourString = hourString.substring(hourString.length - 2);
	minuteString = minuteString.substring(minuteString.length - 2);
	var timeString = hourString + ':' + minuteString;
	return timeString;
}
// create time field and fill it with current time
function creTimeInput(parent){
	var sp = creEl("span", parent); sp.innerHTML = "time: ";
	var inp = creEl("input", parent, "dpTime", "dp_Time");
	if(!timefieldValue){
		var tm = new Date();
		timefieldValue = getTimeString(tm);
	}
	inp.value = timefieldValue;
	inp.type = "time";
	inp.onchange = function(){timefieldValue=this.value;};
}
/**
This is the function that actually draws the datepicker calendar.
*/
function refreshDatePicker(targetDateField, year, month, day){
	/*
	Convenience function for writing the code for the buttons that bring us back or forward
	a month.
	*/
	function getButtonCode(parent, dateVal, adjust, label, title){
		var newMonth = (dateVal.getMonth () + adjust) % 12;
		var newYear = dateVal.getFullYear() + parseInt((dateVal.getMonth() + adjust) / 12);
		if(newMonth < 0){
			newMonth += 12;
			newYear += -1;
		}
		var btn = creEl("button", parent, "dpButton");
		btn.title = title; btn.innerHTML = label;
		btn.onclick = function(){refreshDatePicker(targetDateField, newYear, newMonth);};
		return btn;
	}
	// if no arguments are passed, use today's date; otherwise, month and year
	// are required (if a day is passed, it will be highlighted later)
	var thisDay;
	if ((month >= 0) && (year > 0)) {
		thisDay = new Date(year, month, 1);
	}else{
		thisDay = new Date()
		day = thisDay.getDate();
		thisDay.setDate(1);
	}
	var outer = document.getElementById(datePickerDivID);
	// clear old content
	if(outer.childNodes &&  outer.childNodes.length)
		for(i = outer.childNodes.length-1; i>-1; i--) outer.removeChild(outer.childNodes[i]);
	// the calendar will be drawn as a table
	// you can customize the table elements with a global CSS style sheet,
	// or by hardcoding style and formatting elements below
	var tbl = creEl("table", outer, "dpTable"); tbl.cols = 7;
	var tr = creEl("tr", tbl, "dpTitleTR");
	// here we add time input string
	var td = creEl("td", tr, "dpFullTitleTD"); td.colSpan = 7;
	creTimeInput(td);
	// this is the title bar, which displays the month and the buttons to
	// go back to a previous month or forward to the next month
	tr = creEl("tr", tbl, "dpTitleTR");
	td = creEl("td", tr, "dpButtonTD"); td.align = "center";
	getButtonCode(td, thisDay, -12, "&lt;&lt;","Previous year");
	creEl("br", td);
	getButtonCode(td, thisDay, -1, "&lt;","Previous month");
	td = creEl("td", tr, "dpTitleTD"); td.colSpan = 5;
	var div = creEl("div", td, "dpTitleText");
	div.innerHTML = monthArray[ thisDay.getMonth()] + " " + thisDay.getFullYear();
	td = creEl("td", tr, "dpButtonTD"); td.align = "center";
	getButtonCode(td, thisDay, 12, "&gt;&gt;", "Next year");
	creEl("br", td);
	getButtonCode(td, thisDay, 1, "&gt;","Next month");
	// this is the row that indicates which day of the week we're on
	tr = creEl("tr", tbl, "dpDayTR");
	var dDate = sundayfirst ? 0 : 1;
	for(i = 0; i < 7; i++){
		td = creEl("td", tr, "dpDayTD"); td.innerHTML = dayArray[i+dDate];
	}
	tr = creEl("tr", tbl, "dpTR");
	// first, the leading blanks
	if(sundayfirst)
		for (i = thisDay.getDay(); i > 0; i--)
			creEl("td", tr, "dpTD");
	else
		for (i = (thisDay.getDay()+6)%7; i > 0; i--)
			creEl("td", tr, "dpTD");
	// now, the days of the month
	do{
		dayNum = thisDay.getDate();
		var cls = (dayNum == day) ? "dpDayHighlightTD" : "dpTD";
		td = creTD(tr, cls, thisDay);
		var blk = td;
		if(dayNum == day)
			blk = creEl("div", td, "dpDayHighlight");
		blk.innerHTML = dayNum;
		// if this is a Saturday/Sunday, start a new row
			if(thisDay.getDay() == (sundayfirst ? 6 : 0))
				tr = creEl("tr", tbl, "dpTR");
		// increment the day
		thisDay.setDate(thisDay.getDate() + 1);
	}while (thisDay.getDate() > 1)
	// fill in any trailing blanks
	if(thisDay.getDay() != (sundayfirst ? 0 : 1)){
		if(sundayfirst)
			for (i = thisDay.getDay(); i < 6; i++)
				creEl("td", tr, "dpTD");
		else
			for (i = (thisDay.getDay()+6)%7; i < 6; i++)
				creEl("td", tr, "dpTD");
	}
	// add a button to allow the user to easily return to today, or close the calendar
	var today = new Date();
	tr = creEl("tr", tbl, "dpTodayButtonTR");
	td = creEl("td", tr, "dpTodayButtonTD"); td.colSpan = 3;
	var btn = creEl("button", td, "dpTodayButton"); btn.innerHTML = "Today";
	btn.onclick = function(){refreshDatePicker(targetDateField);};
	creEl("td", tr, "dpButtonTD");
	td = creEl("td", tr, "dpTodayButtonTD"); td.colSpan = 3;
	btn = creEl("button", td, "dpTodayButton"); btn.innerHTML = "Close";
	btn.onclick = function(){updateDateField(targetDateField);};
}

/**
Convert a JavaScript Date object to a string, based on the dateFormat and dateSeparator
variables at the beginning of this script library.
*/
function getDateString(dateVal){
	var dayString = "00" + dateVal.getDate();
	var monthString = "00" + (dateVal.getMonth()+1);
	dayString = dayString.substring(dayString.length - 2);
	monthString = monthString.substring(monthString.length - 2);
	switch (dateFormat) {
		case "dmy" :
			return dayString + dateSeparator + monthString + dateSeparator + dateVal.getFullYear();
		case "ymd" :
			return dateVal.getFullYear() + dateSeparator + monthString + dateSeparator + dayString;
		case "mdy" :
		default :
			return monthString + dateSeparator + dayString + dateSeparator + dateVal.getFullYear();
	}
}

/**
Convert a string to a JavaScript Date object.
*/
function getFieldDate(dateString){
	var dateVal;
	var dArray;
	var d, m, y;
	try{
		dArray = splitDateString(dateString);
		timefieldValue = dArray[2].split(" ")[1];
		if(dArray){
			switch(dateFormat){
			case "dmy" :
				d = parseInt(dArray[0], 10);
				m = parseInt(dArray[1], 10) - 1;
				y = parseInt(dArray[2], 10);
				break;
			case "ymd" :
				d = parseInt(dArray[2], 10);
				m = parseInt(dArray[1], 10) - 1;
				y = parseInt(dArray[0], 10);
				break;
			case "mdy" :
			default :
				d = parseInt(dArray[1], 10);
				m = parseInt(dArray[0], 10) - 1;
				y = parseInt(dArray[2], 10);
				break;
			}
			if(d > 31 || d < 1 || m > 12 || m < 1) throw "invalid";
			var th = timefieldValue.split(":");
			dateVal = new Date(y, m, d, th[0], th[1]);
		}else if(dateString){
			dateVal = new Date(dateString);
		} else {
			dateVal = new Date();
		}
	}catch(e){
		dateVal = new Date();
		timefieldValue = null;
	}
	return dateVal;
}

function parseUserString(datefieldID){
	var form = $(datefieldID);
	if(!form || !form.value) return null;
	return getFieldDate(form.value);
}

/**
Try to split a date string into an array of elements, using common date separators.
If the date is split, an array is returned; otherwise, we just return false.
*/
function splitDateString(dateString){
	var dArray;
	if (dateString.indexOf(dateSeparator) >= 0)
		dArray = dateString.split(dateSeparator);
	else
		dArray = false;
	return dArray;
}

function updateDateField(targetDateField, dateString){
	if(dateString)
		targetDateField.value = dateString + " " + timefieldValue;
	var pickerDiv = document.getElementById(datePickerDivID);
	pickerDiv.style.visibility = "hidden";
	pickerDiv.style.display = "none";
	targetDateField.focus();
	if((dateString) && (typeof(datePickerClosed) == "function"))
		datePickerClosed(targetDateField);
}

return{
	drawDatePicker: drawDatePicker,
	setDefVars:     setDefVars,
	parseUserString:parseUserString
};
}();
