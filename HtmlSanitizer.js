/* 
 * JavaScript HTML Sanitizer, (c) Alexander Yumashev, Jitbit Software.
 * homepage https://github.com/jitbit/HtmlSanitizer
 * License: GNU GPL v3 https://github.com/jitbit/HtmlSanitizer/blob/master/LICENSE
 */

var HtmlSanitizer = (function () {

	var _tagWhitelist = {
		'A': true, 'ABBR': true, 'B': true, 'BLOCKQUOTE': true, 'BODY': true, 'BR': true, 'CENTER': true, 'CODE': true, 'DIV': true, 'EM': true, 'FONT': true,
		'H1': true, 'H2': true, 'H3': true, 'H4': true, 'H5': true, 'H6': true, 'HR': true, 'I': true, 'IMG': true, 'LABEL': true, 'LI': true, 'OL': true, 'P': true, 'PRE': true,
		'SMALL': true, 'SOURCE': true, 'SPAN': true, 'STRONG': true, 'TABLE': true, 'TBODY': true, 'TR': true, 'TD': true, 'TH': true, 'THEAD': true, 'UL': true, 'U': true, 'VIDEO': true
	};

	var _contentTagWhiteList = { 'FORM': true }; //tags that will be converted to DIVs

	var _attributeWhitelist = { 'align': true, 'color': true, 'controls': true, 'height': true, 'href': true, 'src': true, 'style': true, 'target': true, 'title': true, 'type': true, 'width': true };

	var _cssWhitelist = { 'color': true, 'background-color': true, 'font-size': true, 'text-align': true, 'text-decoration': true, 'font-weight': true };

	var _schemaWhiteList = [ 'http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:' ]; //which "protocols" are allowed in "href", "src" etc

	var _uriAttributes = { 'href': true, 'action': true, 'src': true };
	
	var _uriContainsWhiteList = [ ];

	var SanitizeHtml = function(input) {
		input = input.trim();
		if (input == "") return ""; //to save performance and not create iframe

		//firefox "bogus node" workaround
		if (input == "<br>") return "";

		var iframe = document.createElement('iframe');
		if (iframe['sandbox'] === undefined) {
			alert('Your browser does not support sandboxed iframes. Please upgrade to a modern browser.');
			return '';
		}
		iframe['sandbox'] = 'allow-same-origin';
		iframe.style.display = 'none';
		document.body.appendChild(iframe); // necessary so the iframe contains a document
		var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
		if (iframedoc.body == null) iframedoc.write("<body></body>"); // null in IE
		iframedoc.body.innerHTML = input;

		function makeSanitizedCopy(node) {
			
			var newNode;

			if (node.nodeType == Node.TEXT_NODE) {
				newNode = node.cloneNode(true);
			} else if (node.nodeType == Node.ELEMENT_NODE && (_tagWhitelist[node.tagName] || _contentTagWhiteList[node.tagName])) {

				//remove useless empty spans (lots of those when pasting from MS Outlook)
				if ((node.tagName == "SPAN" || node.tagName == "B" || node.tagName == "I" || node.tagName == "U")
					&& node.innerHTML.trim() == "") {
					return document.createDocumentFragment();
				}

				if (_contentTagWhiteList[node.tagName])
					newNode = iframedoc.createElement('DIV'); //convert to DIV
				else
					newNode = iframedoc.createElement(node.tagName);

				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
					if (_attributeWhitelist[attr.name]) {
						if (attr.name == "style") {
							for (s = 0; s < node.style.length; s++) {
								var styleName = node.style[s];
								if (_cssWhitelist[styleName])
									newNode.style.setProperty(styleName, node.style.getPropertyValue(styleName));
							}
						}
						else {
							if (_uriAttributes[attr.name]) { //if this is a "uri" attribute, that can have "javascript:" or something
								if (attr.value.indexOf(":") > -1 && !URIstartsWithAndContains(attr.value))
									continue;
							}
							newNode.setAttribute(attr.name, attr.value);
						}
					}
				}
				for (i = 0; i < node.childNodes.length; i++) {
					var subCopy = makeSanitizedCopy(node.childNodes[i]);
					newNode.appendChild(subCopy, false);
				}
			} else {
				newNode = document.createDocumentFragment();
			}
			return newNode;
		};

		var resultElement = makeSanitizedCopy(iframedoc.body);
		document.body.removeChild(iframe);
		return resultElement.innerHTML
			.replace(/<br[^>]*>(\S)/g, "<br>\n$1")
			.replace(/div><div/g, "div>\n<div"); //replace is just for cleaner code
	}

	function URIstartsWithAndContains(str) {
		
		var flag = false;
		
		//verify protocols
		for (var i = 0; i < _schemaWhiteList.length; i++) {
			if (str.indexOf(_schemaWhiteList[i]) == 0) {
				flag = true;
			}
		}
		
		//verify url partials
		for (var k = 0; k < _uriContainsWhiteList.length; k++) {
			if (str.indexOf(_uriContainsWhiteList[k]) == -1) {
				flag = false;
			}
		}
		
		return flag;
	}

	return {
		AllowedTags: _tagWhitelist,
		AllowedAttributes: _attributeWhitelist,
		AllowedCssStyles: _cssWhitelist,
		AllowedSchemas: _schemaWhiteList,
		AllowedAddresses: _uriContainsWhiteList,
		SanitizeHtml: SanitizeHtml
	}
})();
