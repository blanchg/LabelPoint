/**
 * LabelPoint.js
 *
 * Class to find the optimum placement for a label inside an irregular polygon using
 * Poles of Inaccessibility algorithm.
 *
 * George Gardiner
 * www.commonmode.co.uk
 */

(function (window, undefined) {
    var LabelPoint = {
        find: function (points, holes, precision) {
            if (holes == undefined)
                holes = [];
            if (precision == undefined) {
                precision = 1;
            }
            var x_min, y_min, x_max, y_max;
            var p = points[0];
            x_min = x_max = p.x;
            y_min = y_max = p.y;
            for (var i = 1; i < points.length; i++) {
                p = points[i];
                if (x_min>p.x) x_min = p.x;
                if (x_max<p.x) x_max = p.x;
                if (y_min>p.y) y_min = p.y;
                if (y_max<p.y) y_max = p.y;
            }
            var lp = this.poleScan(x_min, y_min, x_max, y_max, points, holes);
            if (precision > 0) {
                var r = ((x_max - x_min) * (y_max - y_min));
                var dx, dy;
                while (r > precision) {
                    lp = this.poleScan(x_min, y_min, x_max, y_max, points, holes);
                    dx = (x_max - x_min) / 24;
                    dy = (y_max - y_min) / 24;
                    x_min = lp.x - dx;
                    x_max = lp.x + dx;
                    y_min = lp.y - dy;
                    y_max = lp.y + dy;
                    r = dx * dy;
                }
            }
            return lp;
        },
        pointToLineDistance: function (x, y, x1, y1, x2, y2) {
            var A = x - x1;
            var B = y - y1;
            var C = x2 - x1;
            var D = y2 - y1;
            var dot = A * C + B * D;
            var len_sq = C * C + D * D;
            var param = -1;
            if (len_sq != 0) {
                param = dot / len_sq;
            }
            var xx, yy;
            if (param < 0) {
                xx = x1;
                yy = y1;
            }
            else if (param > 1) {
                xx = x2;
                yy = y2;
            }
            else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            var dx = x - xx;
            var dy = y - yy;
            return Math.sqrt(dx * dx + dy * dy);
        },
        pointToPerimeterDistance: function (x, y, points) {
            var d, p1, p2, minDistance;
            for (var i = 0; i < points.length; i++) {
                p1 = points[i];
                if ((i + 1) < points.length) {
                    p2 = points[i + 1];
                }
                else {
                    p2 = points[0];
                }
                d = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
                if (i == 0) {
                    minDistance = d;
                }
                else {
                    if (d < minDistance) {
                        minDistance = d;
                    }
                }
            }
            return minDistance;
        },
        isInside: function (x, y, points) {
            for (var c = false, i = -1, l = points.length, j = l - 1; ++i < l; j = i) {
                var pi = points[i];
                var pj = points[j];
                ((pi.y <= y && y < pj.y) || (pj.y <= y && y < pi.y))
                    && (x < (pj.x - pi.x) * (y - pi.y) / (pj.y - pi.y) + pi.x)
                    && (c = !c);
            }
            return c;
        },
        poleScan: function (x_min, y_min, x_max, y_max, points, holes) {
            var px, py, pd, maxDistance = 0;
            var allpoints = points.concat.apply(points, holes);
            for (var y = y_min; y < y_max; y += ((y_max - y_min) / 24)) {
                for (var x = x_min; x < x_max; x += ((x_max - x_min) / 24)) {
                    if (this.isInside(x, y, points)) {
                        var inHole = false;
                        for (var i = 0; i < holes.length && !inHole; i++) {
                            var hole = holes[i];
                            inHole = this.isInside(x, y, hole);
                        }
                        if (inHole)
                            continue;
                        pd = this.pointToPerimeterDistance(x, y, allpoints);
                        if (pd > maxDistance) {
                            maxDistance = pd;
                            px = x;
                            py = y;
                        }
                    }
                }
            }
            return {
                x: px,
                y: py
            };
        }
    };
    window.LabelPoint = LabelPoint;
})(window);