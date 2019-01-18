# HtmlSanitizer

Client-side HTML Sanitizer (i.e. needs a browser, won't work in Node and other backends).

> Please note: to prevent XSS attacks you should also sanitize input **on the server**. Never trust the client.

Usage:

```html
<script src="HtmlSanitizer.js"></script>

<script>
    var input = HtmlSanitizer.SanitizeHtml("<div> <script> Alert('xss!'); </script> </div>");
    //input == "<div> </div>";
</script>
```

The sanitizer uses [whitelisting](https://en.wikipedia.org/wiki/Whitelisting) (as opposed to "blacklisting") and uses browser/DOM to parse the html by creating an invisible "sandboxed" iframe.

## Tags allowed by default

`a, abbr, b, blockquote, body, br, center, code, div, em, font, h1, h2, h3, h4, h5, h6, hr, i, img, label, li, ol, p, pre, small, source, span, strong, table, tbody, tr, td, th, thead, ul, u, video`

## Attributes allowed by default

`align, color, controls, height, href, src, style, target, title, type, width`

## CSS styles allowed by default

`color, background-color, font-size, text-align, text-decoration, font-weight`
