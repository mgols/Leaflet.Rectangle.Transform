# Leaflet.Rectangle.Transform [![npm version](https://badge.fury.io/js/leaflet-path-transform.svg)](https://badge.fury.io/js/leaflet-path-transform)

Translate/rotate/scale handler for [leaflet](http://leafletjs.com) rectangles. This is
Leaflet.Path.Transform (https://github.com/w8r/Leaflet.Path.Transform) modified to 
handle rectangles. Why did we do this? 

* wanted to control the scaling in a way that was dependent on the Path being a rectangle and to avoid shapes crossing over themselves
* finer and integrated control over the drag (translate) action (Leaflet.Path.Transform extends and incorporates Leaflet.Path.Drag)
* Leaflet.Path.Transform uses code that switches between pixel coordinates and 
geographical coordinates. I wanted something simpler that didn't require switching.
* wanted some specific info returned with 'rotate', 'translate' and 'scale' event, Leaflet.Path.Transform returned things I didn't want.

![RectangleTransform](https://raw.githubusercontent.com/webtrike/Leaflet.Rectangle.Transform/assets/RectangleTransform.png)

### Requirements

Leaflet 1.0+

### API
```shell
npm install leaflet-rectangle-transform --save
```
or include `dist/L.Rectangle.Transform.js` file

```js
require('leaflet-rectangle-transform');

var map = L.map('map-canvas').setView(center, zoom);
var rectangle = L.rectangle([..., ...], { transform: true }).addTo(map);

rectangle.transform.enable();
```

If you have changed the geometry of the transformed layer and want the tool to reflect the changes, use:

```js
// you have changed the geometry here
rectangle.setBounds([...]);
// and want to update handlers:
rectangle.transform.reset();
```

### `options`

* **`options.rotateHandleOptions`** - **<[Polyline_options](http://leafletjs.com/reference.html#polyline-options)>** - rotation handle styles
* **`options.rotateLineOptions`** - **<[Polyline_options](http://leafletjs.com/reference.html#polyline-options)>** - offset line to rotate handle style
* **`options.scaleHandleOptions`** - **<[Polyline_options](http://leafletjs.com/reference.html#polyline-options)>** - scale handle styles (w,nw,n,ne,e,se,s only)
* **`options.scaleOriginHandleOptions`** - **<[Polyline_options](http://leafletjs.com/reference.html#polyline-options)>** - scale origin handle styles (sw only)

### `cursors`

Handler assigns `resize` cursors to scale and scale origin handles. You can override that by setting `options.scaleHandleOptions.setCursor` and `options.scaleOriginHandleOptions.setCursor` to `false`. You can also handle provide a cursor for the rotate handles by setting `options.rotateHandleOptions.setCursor` to `true` and providing a cursor in `options.cursorsByType`.


### Events

Following events are fired on the transformed rectangle (anchor = origin):

* **`rotatestart`, `rotate`, `rotateend`** - `{ rotation: <Radians> }`
* **`scalestart`, `scale`, `scaleend`** - `{ anchor: <L.LatLng> }`
* **`translatestart`, `translate`, `translateend`** - `{ anchor: <L.LatLng> }`

### Development

```shell
npm run build
```
this will create a concatenation of the src in the dist directory.


### TODO

 - [ ] Tests
 - [x] [Leaflet.Editable](https://github.com/Leaflet/Leaflet.Editable) adapter
 - [ ] [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) adapter
 - [x] Canvas renderer support

### License

 Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
