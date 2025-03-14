# JS Html Sanitizer

Client-side HTML Sanitizer (front-end only, i.e. "needs a browser", won't work in `Node`) to prevent XSS and unwanted tags in UGC.

* Very fast (8000 ops/sec)
* Very small (1.7kb *unminified!*)
* Zero dependency, vanilla JS, works even in IE (duh)

> Please note: to prevent XSS attacks you should always sanitize input **on the server too**. *Never trust the client!*

### Install

```html
<script src="https://cdn.jsdelivr.net/npm/@jitbit/htmlsanitizer@latest/HtmlSanitizer.min.js"></script>
```

or

```
npm install @jitbit/htmlsanitizer
```
(simply puts the script into `/node_modules`)

### Usage:

```html
<script>
    var html;
    
    //run with default settings
    html = HtmlSanitizer.SanitizeHtml("<div><script>alert('xss!');</sc" + "ript></div>"); //returns "<div></div>";
    html = HtmlSanitizer.SanitizeHtml("<a onclick=\"alert('xss')\"></a>"); //returns "<a></a>";
    html = HtmlSanitizer.SanitizeHtml("<a href=\"javascript:alert('xss')\"></a>"); //returns "<a></a>";
    
    //permanently allow a tag for all future invocations
    HtmlSanitizer.AllowedTags['FORM'] = true;
    html = HtmlSanitizer.SanitizeHtml("<form></form>"); //returns "<form></form>";
    
    //allow somthing only once by specifying a selector
    html = HtmlSanitizer.SanitizeHtml("<input type=checkbox>", "input[type=checkbox]"); //returns "<input type=\"checkbox\">";
</script>
```

The sanitizer uses [whitelisting](https://en.wikipedia.org/wiki/Whitelisting) approach (as opposed to "blacklisting") to clean out everything that's not allowed.

## Speed & Benchmarks

It uses browser/DOM to parse the html by using `DOMParser` object (hence the browser "front-end only" requirement) which makes it **much faster** than "pure JavaScript" sanitizers.

Tested on `https://www.bbc.co.uk` homepage - the page is sanitized **~370 times per second** on an i5 core CPU in Firefox Quantum (tested via `benchmark.js`)

Comparing HtmlSanitizer vs DOMPurify benchmark:

```
starting benchmark...
HtmlSanitizer x 8,048 ops/sec ±3.37% (44 runs sampled)
DOMPurify x 5,195 ops/sec ±3.30% (57 runs sampled)
Fastest is HtmlSanitizer
```

## Tags allowed by default

`a, abbr, b, blockquote, body, br, center, code, div, em, font, h1, h2, h3, h4, h5, h6, hr, i, img, label, li, ol, p, pre, small, source, span, strong, table, tbody, tr, td, th, thead, ul, u, video`

## Attributes allowed by default

`align, color, controls, height, href, src, style, target, title, type, width`

## CSS styles allowed by default

`color, background-color, font-size, text-align, text-decoration, font-weight`

## Schemas allowed by default

`http:, https:, data:, m-files:, file:, ftp:, mailto:, pw:`

(allowed in 'src', 'href' and similar "uri-attributes". To clean up stuff like `<a href='javascript:alert()'></a>`)

## Configuring

Allowed tags, attributes, schemas and styles are listed in `AllowedTags`, `AllowedAttributes`, `AllowedSchemas` and `AllowedCssStyles` public properties. To disallow a tag remove it from the dictionary like this:

```javascript
delete HtmlSanitizer.AllowedTags['TABLE']; //mind the uppercase
```

To add an allowed tag globally:

```javascript
HtmlSanitizer.AllowedTags['SCRIPT'] = true; //mind the uppercase
```

To allow an extra tag only once during invocation - specify extra selector to allow in the second parameter

```javascript
var html = HtmlSanitizer.SanitizeHtml("<input type=checkbox>", "input[type=checkbox]");
```

## Browser support

Supported by all major browsers, IE10 and higher.

## BUT WHY?

> Why create a front-end HTML sanitizer if the input has to be sanitized on the server anyway?

Users often copy-paste awful HTML generated by MS Word, MS Outlook or Apple Mail that needs a clean-up. Or you need to remove excessive formatting in an WYSIWYG editor. Or you need to display an (ugly) email message in a (beatuful) mobile app. Or (my favorite) you simply need to ease the load in the server-side sanitizer. And many many other use-cases.


&copy; [Jitbit](https://www.jitbit.com/)
