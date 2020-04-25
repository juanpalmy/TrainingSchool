/*
 * @(#)lmstoc.js 1.3 2004-06-20
 *
 * Copyright (c) 2003 Werner Randelshofer
 * Staldenmattweg 2, Immensee, CH-6405, Switzerland
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of 
 * Werner Randelshofer. ("Confidential Information").  You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Werner Randelshofer.
 */ 
/**
 * This scripts inserts a table of contents (TOC) at the current location
 * into a HTML document.
 *
 * This file is intended to be included in the body of a HTML document. The
 * HTML document must be in a child frame of the Learning Management System
 * generated by TinyLMS.
 *
 * Example:
 * <html>
 *   <head>
 *     <title>Table Of Contens</title>
 *     <script language="JavaScript" src="lib/lmscollections.js" type="text/JavaScript"></script>
 *     <script language="JavaScript" src="lib/lmsfonts.js" type="text/JavaScript"></script>
 *     <script language="JavaScript" src="lib/lmsstub.js" type="text/JavaScript"></script>
 *   </head>
 *   <body>
 *     <script language="JavaScript" src="lib/lmstoc.js" type="text/JavaScript"></script>
 *   </body>
 * </html>
 *
 * @version 1.3 2004-06-20 Expanding and collapsing nodes did not work on some browsers.
 *                         Show a disabled disclosure symbol for nodes that can not be collapsed by the user.
 * 1.2.1 2004-06-14 We must not show an item as emphasized, when TinyLMS is not in course mode.
 * 1.2 2004-06-13 Support for debugging improved. 
 * 1.1.7 2003-11-06 Support for debugging added.
 * 1.1 2003-11-04 Adapted to changes in lmsapi.js and lmscam.js
 * 1.0 2003-09-12 Locale specific labels are now read from the API object.
 * 0.20.1 2003-04-07 Safari browser can not handle return statements
 * within switch statements.
 * 0.19.4 2003-04-04 Revised.
 * 0.19 2003-03-26 Revised.
 * 0.18 2003-03-26 Revised.
 * 0.17 2003-03-16 Naming conventions for CAM elements streamlined with Java implementation.
 * 0.15.2 2003-03-11 Revised.
 * 0.3.1 2003-03-11 Revised.
 * 0.3 2003-03-10 Colors adapted to new color scheme.
 * 0.2 2003-02-27 Revised.
 * 0.1 2003-02-05 Created.
 */


/**
 * Writes the title of the table contents.
 * The title is the name of the current CAM organization.
 *
 * @param selectedItem the current item within the current CAM organization.
 */
function writeOrganization(organizationElement) {
	document.writeln('<tr><td valign="top" class="organization" height="52">');
  document.writeln('<a href="#" onclick="stub.getAPI().gotoMenu()">'+organizationElement.title+'</a>'); 
	document.writeln('</td></tr>');
}

function writeIcon(lessonStatus) {
		switch (lessonStatus) {
			case "passed" :
			case "completed" :
				document.write('<img src="images/symbols/sym_toc_passed.gif" width="12" height="9" border="0">');
				break;
			case "failed" :
				document.write('<img src="images/symbols/sym_toc_failed.gif" width="12" height="9" border="0">');
			  break;
			case "incomplete" :
			case "browsed" :
				document.write('<img src="images/symbols/sym_toc_browsed.gif" width="12" height="9" border="0">');
			  break;
			case "not attempted" :
			case "" :
			case null :
				document.write('<img src="images/symbols/sym_toc_spacer.gif" width="12" height="9" border="0">');
			  break;
			case "current" :
				document.write('<img src="images/symbols/sym_toc_current.gif" width="12" height="9" border="0">');
			  break;
			default :
			  document.write("lessonStatus:"+lessonStatus);
				break;
		}
}
function getCSSClass(lessonStatus) {
  /*
	switch (lessonStatus) {
		case "passed" :
		case "completed" :
			return "Passed";
			break;
		case "failed" :
			return "Visited";
			break;
		case "incomplete" :
		case "browsed" :
			return "Visited";
			break;
		case "not attempted" :
		case "" :
			return "";
			break;
		case "current" :
			return "Current";
			break;
		default :
			return "";
			break;
	}*/
  result = "";
	switch (lessonStatus) {
		case "passed" :
		case "completed" :
			result = "Passed";
			break;
		case "failed" :
		case "incomplete" :
		case "browsed" :
			result = "Visited";
			break;
		case "not attempted" :
		case "" :
			result = "";
			break;
		case "current" :
			result = "Current";
			break;
		default :
			result = "";
			break;
	}
	return result;
	
}
/**
 * Sets the expanded state of the cam item with the specified id.
 * @param itemElementID ID of the cam item.
 * @param b True expands the cam item, false collapses it.
 */
function setExpanded(itemElementID, b) {
	var api = stub.getAPI();
	var itemElement = api.cam.organizations.findByIdentifier(itemElementID);
	if (itemElement != null) {
	  itemElement.isExpanded = b;
	  api.fireUpdateTOCLater();
	}
}

/**
 * Writes the toc starting from depth 0 for the
 * subtree starting from the specified item.
 *
 * @param node The root of the subtree. node must be an instance of lmscam.js:ItemElement
 * @param selectedItem the selected item. selectedItem must be an instance of lmscam.js:ItemElement
 * @param depth The depth of the node in the TOC tree (must be 0).
 */
function TOC_writeTOC1Subtree(node, selectedItem, depth) {
	var title = cropString(node.title,22);

	var resource = node.getResource();
  var refItem = node;
  while (resource == null && refItem.getChildCount() != null) {
	  refItem = refItem.getChildAt(0);
		resource = refItem.getResource();
	}
	
	
	var lessonStatus = (resource == null) ? "" : resource.cmi_core_lesson_status;
	if (node == selectedItem) lessonStatus = "current"; 
  var iconStatus = lessonStatus;
	var cssClass = getCSSClass(lessonStatus);
	document.write('<p class="toc1'+cssClass+'">');
	
	
	if (node.getChildCount() == 0) {
		if (resource != null) document.write('<a class="toc1'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
		writeIcon(iconStatus);
		document.write(title); 
		if (resource != null) document.write('</a>'); 
		document.writeln('</p>'); 
	} else {
	  if (node.isNodeDescendant(selectedItem)) {
			document.write('<img src="images/symbols/sym_toc_disabled.gif" width="12" height="9" border="0">');
			if (resource != null) document.write('<a class="toc1'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>'); 
			for (var i=0; i < node.getChildCount(); i++) {
				this.writeTOC2Subtree(node.getChildAt(i), selectedItem, depth + 1);
			}
	  } else if (node.isExpanded) {
			document.write('<a class="toc1'+cssClass+'" href="#" onclick="setExpanded(\''+node.identifier+'\',false)">');
			document.write('<img src="images/symbols/sym_toc_expanded.gif" width="12" height="9" border="0">');
			document.write('</a>');
			if (resource != null) document.write('<a class="toc1'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>'); 
			for (var i=0; i < node.getChildCount(); i++) {
				this.writeTOC2Subtree(node.getChildAt(i), selectedItem, depth + 1);
			}
		} else {
			document.write('<a class="toc1'+cssClass+'" href="#" onclick="setExpanded(\''+node.identifier+'\',true)">');
			document.write('<img src="images/symbols/sym_toc_collapsed.gif" width="12" height="9" border="0">');
			document.write('</a>');
			if (resource != null) document.write('<a class="toc1'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>'); 
		}
	}
}
/**
 * Writes the toc starting from depth 1 for the
 * subtree starting from the specified item.
 *
 * @param node The root of the subtree. node must be an instance of lmscam.js:ItemElement
 * @param selectedItem the selected item. selectedItem must be an instance of lmscam.js:ItemElement
 * @param depth The depth of the node in the TOC tree (must be >= 1).
 */
function TOC_writeTOC2Subtree(node, selectedItem, depth) {
	var title = cropString(node.title,28 - depth * 3);

	var resource = node.getResource();
	var refItem = node;
  while (resource == null && refItem.getChildCount() != null) {
	  refItem = refItem.getChildAt(0);
		resource = refItem.getResource();
	}
	var lessonStatus = (resource == null) ? "" : resource.cmi_core_lesson_status;
	if (node == selectedItem) lessonStatus = "current";
  var iconStatus = lessonStatus;
	var cssClass = getCSSClass(lessonStatus);
	document.write('<p class="toc2'+cssClass+'">');
	if (depth > 0) {
		document.write('<img src="images/spacer.gif" width="'+(12*depth)+'" height="9" border="0">');
	}
	
	
	if (node.getChildCount() == 0) {
 		if (resource != null) document.write('<a class="toc2'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
		writeIcon(iconStatus);
		document.write(title); 
		if (resource != null) document.write('</a>'); 
		document.writeln('</p>');
	} else {
	  if (node.isNodeDescendant(selectedItem)) {
			document.write('<img src="images/symbols/sym_toc_disabled.gif" width="12" height="9" border="0">');
 			if (resource != null) document.write('<a class="toc2'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>');
			for (var i=0; i < node.getChildCount(); i++) {
				this.writeTOC2Subtree(node.getChildAt(i), selectedItem, depth + 1);
			}
	  } else if (node.isExpanded) {
			document.write('<a class="toc1'+cssClass+'" href="#" onclick="setExpanded(\''+node.identifier+'\',false)">');
			document.write('<img src="images/symbols/sym_toc_expanded.gif" width="12" height="9" border="0">');
			document.write('</a>');
 			if (resource != null) document.write('<a class="toc2'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>');
			for (var i=0; i < node.getChildCount(); i++) {
				this.writeTOC2Subtree(node.getChildAt(i), selectedItem, depth + 1);
			}
		} else {
			document.write('<a class="toc1'+cssClass+'" href="#" onclick="setExpanded(\''+node.identifier+'\',true)">');
			document.write('<img src="images/symbols/sym_toc_collapsed.gif" width="12" height="9" border="0">');
			document.write('</a>');
 			if (resource != null) document.write('<a class="toc2'+cssClass+'" href="#" onclick="stub.getAPI().gotoItemWithID(\''+refItem.identifier+'\')">');
			document.write(title); 
			if (resource != null) document.write('</a>'); 
			document.writeln('</p>');
		}
	}
}

/**
 * Writes the table of contents.
 * The TOC entries are retrieved from the LMS using the
 * protected operation "api.getCurrentItem()".
 */
function TOC_writeTOC() {
	var api = stub.getAPI();
	if (api.isLoggedIn()) {
		var selectedItem = null;
		if (api.mode == api.MODE_COURSE) {
			selectedItem = api.getAnticipatedItem();
			if (selectedItem == null) selectedItem = api.getCurrentItem();
		}
 		var currentOrganization = api.getCurrentOrganization();
		/*
	  // Count refreshes of the toc	
	  if (api.tocCounter == null) api.tocCounter = 1;
		else api.tocCounter++;
	  document.writeln(api.tocCounter+"<br>");
		*/
		document.writeln('<table width="100%" height="100%" border="0" cellpadding="2" cellspacing="0" bordercolor="#FFFFFF">');
		
		writeOrganization(currentOrganization);
	  
		
		for (var i=0; i < currentOrganization.getChildCount(); i++) {
			var child = currentOrganization.getChildAt(i);
				document.writeln('<tr><td valign="top" background="images/bg_toc_item.gif">');
				this.writeTOC1Subtree(child, selectedItem, 0);
				document.writeln('</td></tr>');
		}
		//document.writeln('<tr><td valign="top" class="tocButton" background="images/bg_toc_item.gif">');
		document.writeln('<tr height="100%"><td valign="bottom" class="tocButton">');
		document.writeln('<br>�<br>');
		document.writeln('<a class="tocButton" href="#" onclick="stub.getAPI().gotoLogin()">'+api.labels.get('toc.logoff')+'</a><br>');
		document.writeln('<a class="tocButton" href="#" onclick="stub.getAPI().gotoMenu()">'+api.labels.get('toc.menu')+'</a><br>');
		document.writeln('<a class="tocButton" href="#" onclick="stub.getAPI().gotoPreviousItem()">'+api.labels.get('toc.previous')+'</a><br>');
		document.writeln('<a class="tocButton" href="#" onclick="stub.getAPI().gotoNextItem()">'+api.labels.get('toc.next')+'</a><br>');
		if (api.showBugInfoButton) {
			document.write(
			'<a href="#"  onclick="stub.getAPI().showBugInfo()"><img src="images/bug.gif" width="13" height="13" border="0"></a>'
			);
		}
		if (api.showDebugButtons) {
			document.write('&nbsp;<a href="#"  onclick="stub.getAPI().toggleLogging();stub.getAPI().fireUpdateTOC();">');
			if (api.logger.level > 0) {
			document.write('<img src="images/on_button.gif" width="48" height="18" border="0">');
			} else {
			document.write('<img src="images/off_button.gif" width="48" height="18" border="0">');
			}
			document.write('</a>');
		}
		document.writeln('</td></tr>');
		document.writeln("</table>");
	}
}

function TOC() {
	this.writeTOC = TOC_writeTOC;
	this.writeTOC1Subtree = TOC_writeTOC1Subtree;
	this.writeTOC2Subtree = TOC_writeTOC2Subtree;
}

var t = new TOC();
t.writeTOC();