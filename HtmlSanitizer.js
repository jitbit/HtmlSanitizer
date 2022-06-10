//JavaScript HTML Sanitizer v2.0.0, (c) Alexander Yumashev, Jitbit Software.

//homepage https://github.com/jitbit/HtmlSanitizer

//License: MIT https://github.com/jitbit/HtmlSanitizer/blob/master/LICENSE

var HtmlSanitizer = new (function () {

	var _tagWhitelist = {
		'A': true, 'ABBR': true, 'B': true, 'BLOCKQUOTE': true, 'BODY': true, 'BR': true, 'CENTER': true, 'CODE': true, 'DD': true, 'DIV': true, 'DL': true, 'DT': true, 'EM': true, 'FONT': true,
		'H1': true, 'H2': true, 'H3': true, 'H4': true, 'H5': true, 'H6': true, 'HR': true, 'I': true, 'IMG': true, 'LABEL': true, 'LI': true, 'OL': true, 'P': true, 'PRE': true,
		'SMALL': true, 'SOURCE': true, 'SPAN': true, 'STRONG': true, 'SUB': true, 'SUP': true, 'TABLE': true, 'TBODY': true, 'TR': true, 'TD': true, 'TH': true, 'THEAD': true, 'UL': true, 'U': true, 'VIDEO': true
	};

	var _contentTagWhiteList = { 'FORM': true, 'GOOGLE-SHEETS-HTML-ORIGIN': true }; //tags that will be converted to DIVs

	var _attributeWhitelist = { 'align': true, 'color': true, 'controls': true, 'height': true, 'href': true, 'id': true, 'src': true, 'style': true, 'target': true, 'title': true, 'type': true, 'width': true };

	var _cssWhitelist = { 'background-color': true, 'color': true, 'font-size': true, 'font-weight': true, 'text-align': true, 'text-decoration': true, 'width': true };

	var _schemaWhiteList = [ 'http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:', 'mailto:', 'pw:' ]; //which "protocols" are allowed in "href", "src" etc

	var _uriAttributes = { 'href': true, 'action': true };

	var _parser = new DOMParser();

	this.SanitizeHtml = function (input, extraTags, extraAttributes) {
		extraTags = (extraTags && extraTags instanceof Array) ? extraTags : [];
		extraAttributes = (extraAttributes && extraAttributes instanceof Array) ? extraAttributes : [];

		input = input.trim();
		if (input == "") return ""; //to save performance

		//firefox "bogus node" workaround
		if (input == "<br>") return "";

		if (input.indexOf("<body")==-1) input = "<body>" + input + "</body>"; //add "body" otherwise some tags are skipped, like <style>

		var doc = _parser.parseFromString(input, "text/html");

		//DOM clobbering check (damn you firefox)
		if (doc.body.tagName !== 'BODY')
			doc.body.remove();
		if (typeof doc.createElement !== 'function')
			doc.createElement.remove();

		function makeSanitizedCopy(node) {
			if (node.nodeType == Node.TEXT_NODE) {
				var newNode = node.cloneNode(true);
			} else if (node.nodeType == Node.ELEMENT_NODE && (_tagWhitelist[node.tagName] || _contentTagWhiteList[node.tagName] || extraTags.indexOf(node.tagName) > -1)) {

				if (_contentTagWhiteList[node.tagName])
					newNode = doc.createElement('DIV'); //convert to DIV
				else
					newNode = doc.createElement(node.tagName);

				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
					if (_attributeWhitelist[attr.name] || extraAttributes.indexOf(attr.name) > -1) {
						if (attr.name == "style") {
							for (s = 0; s < node.style.length; s++) {
								var styleName = node.style[s];
								if (_cssWhitelist[styleName])
									newNode.style.setProperty(styleName, node.style.getPropertyValue(styleName));
							}
						}
						else {
							if (_uriAttributes[attr.name]) { //if this is a "uri" attribute, that can have "javascript:" or something
								if (attr.value.indexOf(":") > -1 && !startsWithAny(attr.value, _schemaWhiteList))
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

				//remove useless empty spans (lots of those when pasting from MS Outlook)
				if ((newNode.tagName == "SPAN" || newNode.tagName == "B" || newNode.tagName == "I" || newNode.tagName == "U")
					&& newNode.innerHTML.trim() == "") {
					return doc.createDocumentFragment();
				}
				
			} else {
				newNode = doc.createDocumentFragment();
			}
			return newNode;
		};

		var resultElement = makeSanitizedCopy(doc.body);
		
		return resultElement.innerHTML
			.replace(/<br[^>]*>(\S)/g, "<br>\n$1")
			.replace(/div><div/g, "div>\n<div"); //replace is just for cleaner code
	}

	function startsWithAny(str, substrings) {
		for (var i = 0; i < substrings.length; i++) {
			if (str.indexOf(substrings[i]) == 0) {
				return true;
			}
		}
		return false;
	}

	this.AllowedTags = _tagWhitelist;
	this.AllowedAttributes = _attributeWhitelist;
	this.AllowedCssStyles = _cssWhitelist;
	this.AllowedSchemas = _schemaWhiteList;
});
