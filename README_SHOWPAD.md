# Intro

Showpad uses pdfjs in the asset viewer to render the following layers of a pdf.

- Canvas layer: main visual of the page
- Text Layer: for text selection
- Annotation layer: for links/annotations
- Svg renderer to derive metadata for embedded media

# Updates required to src

## Showpad asset link support in annotation layer:

It is possible to add links to a range of showpad entities using urls with the 'showpad:' protocol.

By default pdfjs only allows certain protocols for example https: therefore out of the box showpad: links are not rendered.

To allow showpad links to be rendered we need to add showpad: to the valid protocols [here](./src/shared/util.js#L370)

The handler for when these links is clicked is handled by the asset viewer, this abstraction decouples the complication of making changes to the annotation builder as all that we require is that the links are rendered in html.

Call goToDestination on linkService rather than navigateTo [here](./src/display/annotation_layer.js#L327)
## Custom operator list param when rendering a page

For embedded media support we need to be able to pass a custom operator list. To achieve this we must add an 'operatorList' param to the render method of the PDFPageProxy exposed in the public api:

- [Added operatorList param to RenderParameters jsdoc so correct type definitions will be exported](./src/display/api.js#L892) 
- [Added operatorList param to RenderParameters passed to render call](./src/display/api.js#L1004) 
- [Prioritized operatorList param over the intentState.operatorList](./src/display/api.js#L1085)

## Font loading fix

https://github.com/mozilla/pdf.js/issues/11224

IE11/EDGE <= 18 does not support the Font Loading API, therefore there is a hack renders text to canvas and checks if for data to know if a font is loaded
but this is not reliable so we wait for the test to timeout to give the best chance of the font being ready.

- [Commented out callback when data found in canvas so we always wait for timeout](./src/display/font_loader.js#L279)

## Prevent throwing of errors in svg renderer for unsupported operations

For embedded media support we use the svg renderer to create an svg element from which we extract the images to calculate some required metadata. 
The svg renderer is not officially supported so it does not support all operations, for example when an unsupported operation is encountered in the *_makeShadingPattern* function an error is thrown which results in the svg not being rendered. As the result of *_makeShadingPattern* are not requirements for our use case so we simply return null in this function to ensure that the svg is still created.

- [_makeShadingPattern](./src/display/svg.js#L1048)
  
## Fix issue of multiple putImageData calls causing rendering to freeze on IOS16 when GPU Process: DOM Rendering is enabled [SP-75056](https://showpad.atlassian.net/browse/SP-75056)

Images are rendered to the canvas in chunks, therefore pages with alot of images will result in many putImageData operations. In IOS 16 GPU Process: DOM Rendering was enabled by default which in combination with large number of consecutive putImageData operations causes the operation to freeze. This issue was raised after investigation of SP-74888. To fix this we added a [putImageData function](./src/display/canvas.js#L447) that will ensure that on IOS a sync process is triggered every 100 operations to prevent overloading the system.

- [Added isIOS param](./src/display/canvas.js#L411)
- [Added putImageDataOperationCount param](./src/display/canvas.js#L412)
- [Added putImageData function](./src/display/canvas.js#L447)
- [putImageData usage #1](./src/display/canvas.js#L456)
- [putImageData usage #2](./src/display/canvas.js#L528)
- [putImageData usage #3](./src/display/canvas.js#L538)
- [putImageData usage #4](./src/display/canvas.js#L544)
- [putImageData usage #4](./src/display/canvas.js#L564)


# Updates to build process

- [Use hardcoded config to define version](./gulpfile.js#L226)
- [Update DIST_NAME](./gulpfile.js#L1312)
- [Update DIST_DESCRIPTION](./gulpfile.js#L1313) 
- [Remove peerDependencies ](./gulpfile.js#L1331) 
- [Add publishConfig](./gulpfile.js#L1346)
- [Add .npmrc file](./.npmrc)

## Required artifacts

- pdf.js
- pdf.worker.js
- web/text_layer_builder.css
- web/annotation_layer_builder.css

By default [text_layer_builder.css](./web/text_layer_builder.css) and [annotation_layer_builder.css](./web/annotation_layer_builder.css) are bundled as part of the default [pdf_viewer.css](./web/pdf_viewer.css#L15), however as we only use these 2 layers we copy these to build/dist/web. They are then loaded later to ensure the layers are correctly styled.

## Release 

Node version 10.0 is required.

2.3.200 was the last version that supports IE11/Legacy Edge so no new release should be used just patches.

- Create branch in showpad fork from the upstream tag commit id 
- update version [here](./version-showpad.json#L2)
- gulp dist-pre
- cp web/annotation_layer_builder.css build/dist/web/annotation_layer_builder.css && cp web/text_layer_builder.css build/dist/web/text_layer_builder.css && cp .npmrc build/dist/
- cd build/dist
- npm publish