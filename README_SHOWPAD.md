# Intro

Showpad uses pdfjs in the asset viewer to render pdfs.

Canvas layer: main visual of the page
Text Layer: for text selection
Annotation layer: for links/annotations

# Updates to src

## Showpad asset link support in annotation layer:

It is possible to add links to a range of showpad entities using urls with the 'showpad:' protocol.

By default pdfjs only allows certain protocols for example https: therefore out of the box showpad: links are not rendered.

To allow showpad links to be rendered we need to add showpad: to the valid protocols [here](./src/shared/util.js#L450)

The handler for when these links is clicked is handled by the asset viewer, this abstraction decouples the complication of making changes to the annotation builder as all that we require is that the links are rendered in html.

## Custom operator list param when rendering a page

For embedded media support we need to be able to pass a custom operator list. To achieve this we must add an 'operatorList' param to the render method of the PDFPageProxy exposed in the public api:

- [Added operatorList param to RenderParameters jsdoc so correct type definitions will be exported](./src/display/api.js#L1198) 
- [Added operatorList param to RenderParameters passed to render call](./src/display/api.js#L1419) 
- [Prioritized operatorList param over the intentState.operatorList](./src/display/api.js#L1540)

## Prevent throwing of errors in svg renderer for unsupported operations

For embedded media support we use the svg renderer to create an svg element from which we extract the images to calculate some required metadata. 
The svg renderer is not officially supported so it does not support all operations, for example when an unsupported operation is encountered in the *_makeShadingPattern* function an error is thrown which results in the svg not being rendered. As the result of *_makeShadingPattern* are not requirements for our use case so we simply return null in this function to ensure that the svg is still created.

- [_makeShadingPattern](./src/display/svg.js#L1194)

## Force image smoothing 

Currently there is a check to determine if smoothing should be enabled for an image, however we have found that this can in some cases (SP-57645) that the check returns false when visually it looks better as true therefore we simply return true in this function.

- [getImageSmoothingEnabled](./src/display/canvas.js#L997)

## Skip checkFirstPage and checkLastPage

To assist in opening possibly corrupt pdfs a check is made when loading a document that fetches its last page, in some cases this results in a large number
of redundent byte range requests occuring which has a significant impact on the time to render a page. As we process pdfs we can assure that the correct
metadata fo numPages is defined so we simply skip these checks.

- [checkFirstPage](./src/core/worker.js#L174)
- [checkLastPage](./src/core/worker.js#L177)

## Bypass accelerated 2d canvas

There is an issue with Accelerated 2d canvas https://github.com/mozilla/pdf.js/issues/14641 that causes text to have issues https://jira.showpad.io/browse/SBE-8253

To fix this we need to add { willReadFrequently: true } to all getContext calls on the canvas to force the use of a software (instead of hardware accelerated) 2D canvas.

- [base_factory.js](./src/display/base_factory.js#L32)
- [font_loader.js](./src/display/font_loader.js#L279)
- [text_layer.js](./src/display/text_layer.js#L745)
- [image.js](./src/display/image.js#L371)
- [ink.js](./src/display/editor/ink.js#L595)
  
## Prevent Arbitrary Code Injection via font loader

https://showpad.atlassian.net/browse/VUL-5352

- [font_loader.js](./src/display/font_loader.js#L456)

# Updates to build process

- [Use hardcoded config to define version](./gulpfile.js#L285)
- [Update DIST_NAME](./gulpfile.js#L2154)
- [Update DIST_DESCRIPTION](./gulpfile.js#L2155) 
- [Add publishConfig](./gulpfile.js#L2197)
- [Add .npmrc file](./.npmrc)

## Required artifacts

- pdf.js
- pdf.worker.js
- web/text_layer_builder.css
- web/annotation_layer_builder.css

By default [text_layer_builder.css](./web/text_layer_builder.css) and [annotation_layer_builder.css](./web/annotation_layer_builder.css) are bundled as part of the default [pdf_viewer.css](./web/pdf_viewer.css#L15), however as we only use these 2 layers we copy these to build/dist/web. They are then loaded later to ensure the layers are correctly styled.

## Release 

PDFjs does not have a fixed release cycle it tends to be every couple of months, therefore when a new official release happens we should create a branch in our fork, apply the custom changes and create a new showpad release.

For example PDFjs releases version 2.16.105 then the corresponding showpad release will be 2.16.105-showpad-1, 2.16.105-showpad-2, 2.16.105-showpad-3 etc.

- Create branch in showpad fork from the upstream tag commit id git checkout -b v2.16.105 tag && git push --set-upstream origin v2.16.105
- Create branch in showpad fork from the upstream tag commit id git checkout -b v2.16.105-showpad tag && git push --set-upstream origin v2.16.105-showpad
- update version [here](./version-showpad.json#L2)
- install node-v14.16.0
- gulp dist-pre && cp web/annotation_layer_builder.css build/dist/web/annotation_layer_builder.css && cp web/text_layer_builder.css build/dist/web/text_layer_builder.css && cp .npmrc build/dist/
- cd build/dist
- npm pack | tail -n 1 ( to make local install for testing )
- npm publish