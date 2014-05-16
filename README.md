YAG - Yet Another Gallery for jQuery
====================================

This jQuery plug-in transforms an unordered list of thumbails into a much prettier dynamic gallery.
It supports mouse wheel to browse the gallery, long descriptions fetched from URL, and full size view into a lightbox.

Demo website : http://htmlpreview.github.io/?https://github.com/setaou/yag/blob/master/index.html

How to use
----------

Add these lines into the <header> section of your page :

    <link rel="stylesheet" href="gallery.css" type="text/css" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.0/jquery.min.js"></script>
    <script type="text/javascript" src="jquery.yag-1.0.js"></script>
    <script type="text/javascript">
    /*<![CDATA[*/
        $(document).ready(function() {
            $(".gallery").YAG();
        });
    /*]]>*/
    </script>

Customizing appearance (CSS)
----------------------------

It is easy to style the gallery. Good knowledge of CSS is still required to understand which CSS styles are aesthetical and which are structurally important.

Here is the DOM tree before YAG is applied :

    ul.gallery                        Unordered list
     ├li                              List item
     │ └a                             Link to full size picture
     │   └img                         Thumbnail
     ├...                             ...

And here is the DOM after YAG has transformed it :

    div.gallery                       Main container
     ├div.YAG-viewport                Viewport
     │ ├div.YAG-spinner               Loading indicator
     │ ├div.YAG-infobox               Information box
     │ │ ├div.YAG-infobox-overlay     Translucent background
     │ │ └div.YAG-infobox-content     Information box content
     │ │   ├div.YAG-title             Picture title
     │ │   └div.YAG-content           Picture caption
     │ └img                           Picture
     └div.YAG-thumbs                  Thumbnails gallery
       ├div.YAG-spinner               Loading indicator
       ├div.YAG-button-backward       Backward button
       ├div.YAG-button-forward        Forward button
       └ul                            Unordered list
         ├li                          List item
         │ └a                         Link to full size picture
         │   └img                     Thumbnail
         ├...                         ...

Note that the original unordered list has given its classes to the main container. It is thus easy to reference it to apply specific styles to the gallery. In this example the class "gallery" has been used but you can change it as you like (be sure to adapt the main stylesheet).

Here is the DOM tree of the lightbox used for full size view :

    div.YAG-gallery-realsize          Main container
     ├div.YAG-overlay                 Translucent background
     └div.YAG-frame                   Frame around the picture
       ├img                           Full size picture
       └div.YAG-title                 Picture caption
