Showpad uses pdfjs in the asset viewer to render pdfs.

Canvas layer: main visual of the page
Text Layer: for text selection
Annotation layer: for links/annotations

# Updates to src

## Showpad asset link support in annotation layer:

It is possible to add links to a range of showpad entities using urls with the 'showpad:' protocol.

By default pdfjs only allows certain protocols for example https: therefore out of the box showpad: links are not rendered.

To allow showpad links to be rendered we need to add showpad: to the valid protocols [here](./src/shared/util.js#L441)

The handler for when these links is clicked is handled by the asset viewer, this abstraction decouples the complication of making changes to the annotation builder as all that we require is that the links are rendered in html.

## Custom operator list param when rendering a page

For embedded media support we need to be able to pass a custom operator list. To achieve this we must add an 'operatorList' param to the render method of the PDFPageProxy exposed in the public api:

- [Added operatorList param to RenderParameters jsdoc so correct type definitions will be exported](./src/display/api.js#L1173) 
- [Added operatorList param to RenderParameters passed to render call](./src/display/api.js#L1388) 
- [Prioritized operatorList param over the intentState.operatorList](./src/display/api.js#L1507)

# Updates to build process

- [Use hardcoded config to define version](./gulpfile.js#282)
- [Update DIST_NAME](./gulpfile.js#2034)
- [Update DIST_DESCRIPTION](./gulpfile.js#L2035) 
- [Add publishConfig](./gulpfile.js#L2072)
- [Add .npmrc file](./.npmrc)

## Required artifacts

- pdf.js
- pdf.worker.js
- web/text_layer_builder.css
- web/annotation_layer_builder.css

By default [text_layer_builder.css](./web/text_layer_builder.css) and [annotation_layer_builder.css](./web/annotation_layer_builder.css) are bundled as part of the default [pdf_viewer.css](./web/pdf_viewer.css#L15), however as we only use these 2 layers we copy these to build/dist/web. They are then loaded later to ensure the layers are correctly styled.

## Release 

PDFjs does not have a fixed release cycle it tends to be every couple of months, therefore when a new official release happens we should create a branch in our fork, apply the custom changes and create a new showpad release.

For example PDFjs releases version 5.0.0 then the corresponding showpad release will be 5.0.0-showpad

- Create branch in showpad fork from the upstream tag commit id 
- update version [here](./version-showpad.json#L2)
- gulp dist-pre
- cp web/annotation_layer_builder.css build/dist/web/annotation_layer_builder. css && cp web/text_layer_builder.css build/dist/web/text_layer_builder.css && cp .npmrc build/dist/
- cd dist-build
- npm publish






