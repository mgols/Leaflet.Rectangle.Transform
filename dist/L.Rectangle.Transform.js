/**
 * Drag/rotate/resize handler for [leaflet](http://leafletjs.com) rectangles.
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 *
 * @author Simon Pigot <simon.pigot@csiro.au>
 * @license MIT
 * @preserve
 */
L.RectangleTransform = {};
L.RectangleTransform.pointOnLine = function(t, e, i) {
    var a = 1 + i / t.distanceTo(e);
    return new L.Point(t.x + (e.x - t.x) * a, t.y + (e.y - t.y) * a)
};
L.RectangleTransform.merge = function() {
    var t = 1;
    var e, i;
    var a = arguments[t];

    function n(t) {
        return Object.prototype.toString.call(t) === "[object Object]"
    }
    var r = arguments[0];
    while (a) {
        a = arguments[t++];
        for (e in a) {
            if (!a.hasOwnProperty(e)) {
                continue
            }
            i = a[e];
            if (n(i) && n(r[e])) {
                r[e] = L.Util.merge(r[e], i)
            } else {
                r[e] = i
            }
        }
    }
    return r
};
L.Matrix = function(t, e, i, a, n, r) {
    this._matrix = [t, e, i, a, n, r]
};
L.Matrix.prototype = {
    transform: function(t) {
        return this._transform(t.clone())
    },
    _transform: function(t) {
        var e = this._matrix;
        var i = t.x,
            a = t.y;
        t.x = e[0] * i + e[1] * a + e[4];
        t.y = e[2] * i + e[3] * a + e[5];
        return t
    },
    untransform: function(t) {
        var e = this._matrix;
        return new L.Point((t.x / e[0] - e[4]) / e[0], (t.y / e[2] - e[5]) / e[2])
    },
    clone: function() {
        var t = this._matrix;
        return new L.Matrix(t[0], t[1], t[2], t[3], t[4], t[5])
    },
    translate: function(t) {
        if (t === undefined) {
            return new L.Point(this._matrix[4], this._matrix[5])
        }
        var e, i;
        if (typeof t === "number") {
            e = i = t
        } else {
            e = t.x;
            i = t.y
        }
        return this._add(1, 0, 0, 1, e, i)
    },
    scale: function(t, e) {
        if (t === undefined) {
            return new L.Point(this._matrix[0], this._matrix[3])
        }
        var i, a;
        e = e || L.point(0, 0);
        if (typeof t === "number") {
            i = a = t
        } else {
            i = t.x;
            a = t.y
        }
        return this._add(i, 0, 0, a, e.x, e.y)._add(1, 0, 0, 1, -e.x, -e.y)
    },
    rotate: function(t, e) {
        var i = Math.cos(t);
        var a = Math.sin(t);
        e = e || new L.Point(0, 0);
        return this._add(i, a, -a, i, e.x, e.y)._add(1, 0, 0, 1, -e.x, -e.y)
    },
    flip: function() {
        this._matrix[1] *= -1;
        this._matrix[2] *= -1;
        return this
    },
    _add: function(t, e, i, a, n, r) {
        var s = [
            [],
            [],
            []
        ];
        var o = this._matrix;
        var h = [
            [o[0], o[2], o[4]],
            [o[1], o[3], o[5]],
            [0, 0, 1]
        ];
        var l = [
                [t, i, n],
                [e, a, r],
                [0, 0, 1]
            ],
            g;
        if (t && t instanceof L.Matrix) {
            o = t._matrix;
            l = [
                [o[0], o[2], o[4]],
                [o[1], o[3], o[5]],
                [0, 0, 1]
            ]
        }
        for (var _ = 0; _ < 3; _++) {
            for (var c = 0; c < 3; c++) {
                g = 0;
                for (var u = 0; u < 3; u++) {
                    g += h[_][u] * l[u][c]
                }
                s[_][c] = g
            }
        }
        this._matrix = [s[0][0], s[1][0], s[0][1], s[1][1], s[0][2], s[1][2]];
        return this
    }
};
L.matrix = function(t, e, i, a, n, r) {
    return new L.Matrix(t, e, i, a, n, r)
};
L.Handler.RectangleTransform = L.Handler.extend({
    options: {
        angle: 0,
        ni: 0,
        nj: 0,
        dphi: 0,
        dlambda: 0,
        scaleHandleOptions: {
            radius: 5,
            fillColor: "#ffffff",
            color: "#202020",
            fillOpacity: 1,
            weight: 2,
            opacity: .7,
            setCursor: true
        },
        scaleOriginHandleOptions: {
            radius: 10,
            fillColor: "#ffffff",
            color: "#202020",
            fillOpacity: 1,
            weight: 2,
            opacity: .7,
            setCursor: true
        },
        rotateHandleOptions: {
            radius: 7,
            fillColor: "#dddddd",
            color: "#202020",
            fillOpacity: 1,
            weight: 2,
            opacity: .7,
            setCursor: false
        },
        rotateLineOptions: {
            stroke: true,
            color: "#000000",
            weight: 1,
            opacity: 1,
            dashArray: [3, 3],
            fill: false
        },
        gridLineOptions: {
            stroke: true,
            color: "#000000",
            weight: 1,
            opacity: 1
        },
        handleClass: L.CircleMarker,
        cursorsByType: {
            ne: "nesw-resize",
            nw: "nwse-resize",
            sw: "nesw-resize",
            se: "nwse-resize",
            e: "e-resize",
            s: "s-resize",
            n: "n-resize",
            w: "w-resize"
        }
    },
    initialize: function(t) {
        this.rectangle_ = t;
        this.map_ = t._map;
        this.controlFeatures_ = null;
        this.gridLineFeatures_ = null;
        this.enabled_ = false;
        this.showGridLineFeatures_ = true;
        this.toRadians = function(t) {
            return t * Math.PI / 180
        };
        this.toDegrees = function(t) {
            return t * 180 / Math.PI
        };
        this.dphi_ = this.dlambda_ = this.ni_ = this.nj_ = 0;
        this.twoPIR = 2 * Math.PI * 6371
    },
    enable: function(t) {
        if (this.rectangle_._map) {
            this.map_ = this.rectangle_._map;
            if (t) {
                this.setOptions(t)
            }
            L.Handler.prototype.enable.call(this)
        }
    },
    gridLineFeaturesVisible: function(t) {
        if (this.gridLineFeatures_ && this.map_) {
            if (t && !this.map_.hasLayer(this.gridLineFeatures_)) {
                this.map_.addLayer(this.gridLineFeatures_);
                this.gridLineFeatures_.bringToBack()
            } else if (!t && this.map_.hasLayer(this.gridLineFeatures_)) {
                this.map_.removeLayer(this.gridLineFeatures_)
            }
        }
        this.showGridLineFeatures_ = t
    },
    setOptions: function(t) {
        var e = this.enabled_;
        if (e) {
            this.disable()
        }
        this.options = L.RectangleTransform.merge({}, L.Handler.RectangleTransform.prototype.options, t);
        if (t.angle) {
            this.angle_ = this.toRadians(-t.angle)
        }
        if (t.dphi) {
            this.dphi_ = t.dphi
        }
        if (t.dlambda) {
            this.dlambda_ = t.dlambda
        }
        if (t.ni) {
            this.ni_ = t.ni
        }
        if (t.nj) {
            this.nj_ = t.nj
        }
        if ("showGridLineFeatures" in t) {
            this.showGridLineFeatures_ = t.showGridLineFeatures
        }
        if (e) {
            this.enable()
        }
        return this
    },
    addHooks: function() {
        if (!this.anchor_) {
            this.setAnchor(this.rectangle_.getBounds().getSouthWest())
        }
        if (!this.angle_) {
            this.angle_ = 0
        } else {
            this.rotate_(this.rectangle_, this.angle_, this.getAnchor())
        }
        this.createOrUpdateControlFeatures_();
        this.rectangle_.on("mousedown", this.onTranslateStart_, this)
    },
    removeHooks: function() {
        this.hideHandlers_();
        this.rectangle_.off("mousedown", this.onTranslateStart_, this);
        this.controlFeatures_ = null;
        this.gridLineFeatures_ = null;
        this.rectangle_ = null;
        this.gridFeature_ = null
    },
    setAnchor: function(t) {
        this.anchor_ = t
    },
    setAngle: function(t) {
        this.angle_ = t
    },
    setGridCharacteristics: function(t, e, i, a) {
        this.ni_ = t;
        this.nj_ = e;
        this.dphi_ = i;
        this.dlambda_ = a
    },
    getAnchor: function() {
        return this.anchor_
    },
    getAngle: function() {
        return this.angle_
    },
    cloneLatLngs: function(t) {
        var e = [];
        for (var i = 0; i < t.length; i++) {
            var a = t[i];
            if (Array.isArray(a)) {
                var n = this.cloneLatLngs(a);
                e.push(n)
            } else {
                e.push({
                    lat: a.lat,
                    lng: a.lng
                })
            }
        }
        return e
    },
    destinationPoint: function(t, e, i) {
        var a = 6371;
        var n = this.toRadians(e);
        var r = this.toRadians(t.lat),
            s = this.toRadians(t.lng);
        var o = Math.asin(Math.sin(r) * Math.cos(i / a) + Math.cos(r) * Math.sin(i / a) * Math.cos(n));
        var h = s + Math.atan2(Math.sin(n) * Math.sin(i / a) * Math.cos(r), Math.cos(i / a) - Math.sin(r) * Math.sin(o));
        return L.latLng([this.toDegrees(o), this.toDegrees(h)])
    },
    calcdlambdakm: function(t, e) {
        var i = Math.abs(t) * Math.PI / 180;
        return this.twoPIR * Math.cos(i) * (e / 360)
    },
    calcdphikm: function(t) {
        return this.twoPIR * (t / 360)
    },
    createRealFeature: function(t) {
        if (this.dphi_ === 0 || this.dlambda_ === 0 || this.ni_ === 0 || this.nj_ === 0) {
            return false
        }
        var e = this.ni_ * this.calcdlambdakm(t.lat, this.dlambda_),
            i = this.nj_ * this.calcdphikm(this.dphi_),
            a = this.destinationPoint(t, 0, i),
            n = this.ni_ * this.calcdlambdakm(a.lat, this.dlambda_),
            r = this.destinationPoint(a, 90, n),
            s = this.destinationPoint(t, 90, e);
        return new L.Polygon([t, a, r, s, t])
    },
    createOrUpdateControlFeatures_: function() {
        if (this.controlFeatures_) {
            this.map_.removeLayer(this.controlFeatures_)
        }
        var t = new L.Polygon(this.cloneLatLngs(this.rectangle_.getLatLngs()));
        if (this.getAngle() !== 0) {
            this.rotate_(t, -1 * this.getAngle(), this.getAnchor())
        }
        var e = t.getBounds();
        var i = e.getNorthWest(),
            a = e.getNorthEast(),
            n = e.getSouthWest(),
            r = e.getSouthEast(),
            s = e.getCenter();
        var o = this.createHandler_(i, "nw"),
            h = this.createHandler_(a, "ne"),
            l = this.createHandler_(n, "sw", "origin"),
            g = this.createHandler_(r, "se"),
            _ = this.createHandler_(L.latLng(n.lat, s.lng), "s"),
            c = this.createHandler_(L.latLng(i.lat, s.lng), "n"),
            u = this.createHandler_(L.latLng(s.lat, r.lng), "e"),
            d = this.createHandler_(L.latLng(s.lat, n.lng), "w"),
            f = this.createHandler_(L.latLng(n.lat, n.lng - (s.lng - n.lng)), "rotate", "rotate"),
            m = new L.Polyline([L.latLng(n.lat, n.lng - (s.lng - n.lng)), n], this.options.rotateLineOptions);
        this.controlFeatures_ = new L.FeatureGroup([m, o, h, l, g, d, c, u, _, f]);
        if (this.gridLineFeatures_ && this.showGridLineFeatures_) {
            this.map_.removeLayer(this.gridLineFeatures_)
        }
        this.gridLineFeatures_ = new L.FeatureGroup;
        if (this.dphi_ !== 0 && this.dlambda_ !== 0 && this.ni_ !== 0 && this.nj_ !== 0) {
            for (var p = 1; p < this.ni_; p++) {
                var v = n.lng + this.dlambda_ * p;
                var y = new L.Polyline([L.latLng(n.lat, v), L.latLng(i.lat, v)], this.options.gridLineOptions);
                this.gridLineFeatures_.addLayer(y)
            }
            for (var w = 1; w < this.nj_; w++) {
                var x = n.lat + this.dphi_ * w;
                var M = new L.Polyline([L.latLng(x, n.lng), L.latLng(x, r.lng)], this.options.gridLineOptions);
                this.gridLineFeatures_.addLayer(M)
            }
        }
        if (this.getAngle() !== 0) {
            this.rotate_(this.controlFeatures_, this.getAngle(), this.getAnchor());
            this.rotate_(this.gridLineFeatures_, this.getAngle(), this.getAnchor())
        }
        if (this.showGridLineFeatures_) {
            this.map_.addLayer(this.gridLineFeatures_)
        }
        this.map_.addLayer(this.controlFeatures_)
    },
    createHandler_: function(t, e, i) {
        var a = this.options.handleClass;
        var n;
        if (i === "rotate") {
            n = this.options.rotateHandleOptions
        } else if (i === "origin") {
            n = this.options.scaleOriginHandleOptions
        } else {
            n = this.options.scaleHandleOptions
        }
        var r = new a(t, L.Util.extend({}, n, {
            id: e,
            className: this.options.cursorsByType[e] + "-webtrike"
        }));
        if (i === "rotate") {
            r.on("mousedown", this.onRotateStart_, this)
        } else {
            r.on("mousedown", this.onScaleStart_, this)
        }
        return r
    },
    rotate_: function(t, e, i) {
        var a = L.matrix(1, 0, 0, 1, 0, 0);
        a = a.rotate(e, this.project_(i)).flip();
        if (t instanceof L.FeatureGroup) {
            t.eachLayer(function(t) {
                this.transformLayer_(t, a)
            }, this)
        } else {
            this.transformLayer_(t, a)
        }
    },
    translate_: function(t, e) {
        var i = L.matrix(1, 0, 0, 1, 0, 0);
        i = i.translate(e);
        this.transformLayer_(t, i)
    },
    transformLayer_: function(t, e) {
        var i;
        if (t.getLatLngs) {
            i = t.getLatLngs()
        } else if (t.getLatLng) {
            i = [t.getLatLng()]
        } else {
            i = [t]
        }
        i = this.transformArray_(i, e);
        if (t.setLatLngs) {
            t.setLatLngs(i)
        } else if (t.setLatLng) {
            t.setLatLng(i[0])
        } else {
            t.lat = i[0].lat;
            t.lng = i[0].lng
        }
    },
    transformArray_: function(t, e) {
        for (var i = 0; i < t.length; i++) {
            var a = t[i];
            if (Array.isArray(a)) {
                a = this.transformArray_(a, e)
            } else {
                var n = e.transform(this.project_(a));
                var r = this.unproject_(n);
                a.lat = r.lat;
                a.lng = r.lng
            }
        }
        return t
    },
    project_: function(t) {
        return L.Projection.SphericalMercator.project(t)
    },
    unproject_: function(t) {
        return L.Projection.SphericalMercator.unproject(t)
    },
    onRotateStart_: function(t) {
        var e = this.map_;
        e.dragging.disable();
        this.previous_ = t.layerPoint;
        e.on("mousemove", this.onRotate_, this).on("mouseup", this.onRotateEnd_, this);
        this.rectangle_.fire("rotatestart", {
            layer: this.rectangle_,
            rotation: this.angle_
        })
    },
    onRotate_: function(t) {
        var e = this.map_;
        var i = t.layerPoint;
        var a = this.previous_;
        e.dragging.disable();
        var n = e.latLngToLayerPoint(this.getAnchor());
        if (a) {
            var r = Math.atan2(i.y - n.y, i.x - n.x) - Math.atan2(a.y - n.y, a.x - n.x);
            this.setAngle(this.angle_ - r);
            this.previous_ = i;
            this.rotate_(this.rectangle_, -r, this.getAnchor());
            this.createOrUpdateControlFeatures_(true)
        }
        this.rectangle_.fire("rotate", {
            layer: this.rectangle_,
            rotation: this.angle_
        })
    },
    onRotateEnd_: function(t) {
        var e = this.map_;
        e.off("mousemove", this.onRotate_, this).off("mouseup", this.onRotateEnd_, this);
        this.rectangle_.fire("rotateend", {
            layer: this.rectangle_,
            rotation: this.angle_
        })
    },
    onScaleStart_: function(t) {
        var e = t.target;
        var i = this.map_;
        i.dragging.disable();
        this.lastCoordinate_ = t.latlng;
        this.activeMarker_ = e;
        this.map_.on("mousemove", this.onScale_, this).on("mouseup", this.onScaleEnd_, this);
        this.rectangle_.fire("scalestart", {
            layer: this.rectangle_
        })
    },
    onScale_: function(t) {
        var e = t.latlng;
        var i, a, n = this.activeMarker_.options["id"];
        if (this.getAngle() !== 0) {
            this.rotate_(this.rectangle_, -1 * this.getAngle(), this.getAnchor())
        }
        var r = new L.Marker(e);
        if (this.getAngle() !== 0) {
            this.rotate_(r, -1 * this.getAngle(), this.getAnchor())
        }
        e = r.getLatLng();
        var s = this.rectangle_.getBounds();
        var o = s.getSouthWest(),
            h = s.getNorthEast();
        if (n === "s") {
            a = Math.min(e.lat, s.getNorth());
            o.lat = a
        } else if (n === "n") {
            a = Math.max(e.lat, s.getSouth());
            h.lat = a
        } else if (n === "e") {
            i = Math.max(e.lng, s.getWest());
            h.lng = i
        } else if (n === "w") {
            i = Math.min(e.lng, s.getEast());
            o.lng = i
        } else if (n === "nw") {
            i = Math.min(e.lng, s.getEast());
            a = Math.max(e.lat, s.getSouth());
            o.lng = i;
            h.lat = a
        } else if (n === "ne") {
            i = Math.max(e.lng, s.getWest());
            a = Math.max(e.lat, s.getSouth());
            h.lng = i;
            h.lat = a
        } else if (n === "se") {
            i = Math.max(e.lng, s.getWest());
            a = Math.min(e.lat, s.getNorth());
            h.lng = i;
            o.lat = a
        }
        this.rectangle_.setBounds(L.latLngBounds(o, h));
        if (this.getAngle() !== 0) {
            this.rotate_(this.rectangle_, this.getAngle(), this.getAnchor())
        }
        this.setAnchor(o);
        this.createOrUpdateControlFeatures_();
        this.rectangle_.fire("scale", {
            layer: this.rectangle_,
            anchor: this.anchor_
        })
    },
    onScaleEnd_: function(t) {
        this.map_.off("mousemove", this._onScale, this).off("mouseup", this._onScaleEnd, this);
        this.rectangle_.fire("scaleend", {
            layer: this._rectangle
        })
    },
    hideHandlers_: function() {
        this.map_.removeLayer(this.controlFeatures_)
    },
    onTranslateStart_: function(t) {
        var e = this.map_;
        e.dragging.disable();
        this.lastCoordinate_ = t.latlng;
        this.map_.on("mousemove", this.onTranslate_, this).on("mouseup", this.onTranslateEnd_, this);
        this.rectangle_.fire("translatestart", {
            layer: this.rectangle_
        })
    },
    onTranslate_: function(t) {
        var e = t.latlng;
        if (this.lastCoordinate_) {
            var i = this.project_(e);
            var a = this.project_(this.lastCoordinate_);
            var n = new L.Point(i.x - a.x, i.y - a.y);
            this.translate_(this.rectangle_, n);
            var r = this.getAnchor();
            this.translate_(r, n);
            this.setAnchor(r);
            this.createOrUpdateControlFeatures_();
            this.lastCoordinate_ = e
        }
        this.rectangle_.fire("translate", {
            layer: this.rectangle_,
            anchor: this.getAnchor()
        })
    },
    onTranslateEnd_: function(t) {
        this.map_.off("mousemove", this._onTranslate, this).off("mouseup", this._onTranslateEnd, this);
        this.rectangle_.fire("translateend", {
            layer: this._rectangle
        });
        this.rectangle_.on("mousedown", this.onTranslateStart_, this)
    }
});
L.Path.addInitHook(function() {
    if (this.options.transform) {
        this.transform = new L.Handler.RectangleTransform(this, this.options.transform)
    }
});
