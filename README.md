YAG - Yet Another Gallery for jQuery
====================================

This jQuery plug-in transforms an unordered list of thumbails into a much prettier dynamic gallery.
It supports mouse wheel to browse the gallery, long descriptions fetched from URL, and full size view into a lightbox.

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

    ul.gallery                        Liste non ordonnée
     ├li                              Element de la liste
     │ └a                             Lien vers l'image en pleine taille
     │   └img                         Miniature de l'image
     ├...                             ...

And here is the DOM after YAG has transformed it :

    div.gallery                       Conteneur principal
     ├div.YAG-viewport                Zone de visualisation
     │ ├div.YAG-spinner               Témoin de chargement
     │ ├div.YAG-infobox               Boîte d'informations
     │ │ ├div.YAG-infobox-overlay     Fond translucide de la boîte d'information
     │ │ └div.YAG-infobox-content     Contenu de la boîte d'information
     │ │   ├div.YAG-title             Titre de l'image
     │ │   └div.YAG-content           Description de l'image
     │ └img                           Image
     └div.YAG-thumbs                  Galerie de miniatures
       ├div.YAG-spinner               Témoin de chargement
       ├div.YAG-button-backward       Bouton "retour"
       ├div.YAG-button-forward        Bouton "avance"
       └ul                            Liste non ordonnée
         ├li                          Element de la liste
         │ └a                         Lien vers l'image en pleine taille
         │   └img                     Miniature de l'image
         ├...                         ...

Note that the original unordered list has given its classes to the main container. It is thus easy to reference it to apply specific styles to the gallery. In this example the class "gallery" has been used but you can change it as you like (be sure to adapt the main stylesheet).

Here is the DOM tree of the lightbox used for full size view :

    div.YAG-gallery-realsize          Conteneur principal
     ├div.YAG-overlay                 Fond translucide
     └div.YAG-frame                   Cadre entourant l'image
       ├img                           Image
       └div.YAG-title                 Titre de l'image