/**
 * Created by espen on 04.12.2016.
 */
(function () {
    function ray(a, b) {
        return {
            origin: a,
            direction: b,
            pointAt: function (t) {
                return a.add(b.multiply(t));
            }
        }
    }

    function color(rayToTrace, world) {
        var t       = 0.0;
        var closest = 12345678910110.1;
        var surface = {};
        var rec;
        if (world.forEach) {
            world.forEach(function (surf) {
                var h = surf.hit(rayToTrace, 0.001, closest);
                if (h.hit) {
                    t       = h.t;
                    closest = t;
                    surface = surf;
                    rec     = h;
                }
            });
        } else {
            var h   = world.hit(rayToTrace, 0.001, closest);
            surface = world;
            t       = h.t;
            rec     = h;
        }
        if (t > 0.0) {
            var n = rec.r.add(rec.normal).add(randUnitSphere());
            //var n = unitOfVector(ray.pointAt(t).subtract(surface.center));
            return color(ray(rec.r, n.subtract(rec.r)), world).multiply(0.5);
        }
        var unitdir = unitOfVector(rayToTrace.direction);
        t           = 0.5 * unitdir.y + 1.0;
        return vector(1.0, 1.0, 1.0).multiply(1.0 - t).add(vector(0.5, 0.7, 1.0).multiply(t));
    }

    function camera(lowerCorner, horizontal, vertical, origin) {
        return {
            setCorter: function (corner) {
                lowerCorner = corner;
            },
            getCorner: function () {
                return lowerCorner;
            },
            setHorizontal: function (horiz) {
                horizontal = horiz;
            },
            getHorizontal: function () {
                return horizontal;
            },
            setVertical: function (vert) {
                vertical = vert;
            },
            getVertical: function () {
                return vertical;
            },
            setOrigin: function (or) {
                origin = or;
            },
            getOrigin: function () {
                return origin;
            },
            getRay: function (u, v) {
                return ray(origin, lowerCorner.add(horizontal.multiply(u)).add(vertical.multiply(v)).subtract(origin));
            }
        }
    }

    function sphereSurface(center, radius) {

        return {
            center: center,
            radius: radius,
            hit: function (ray, tmin, tmax) {
                var oc    = ray.origin.subtract(center);
                var a     = ray.direction.dotmul(ray.direction);
                var b     = ray.direction.dotmul(oc);
                var c     = oc.dotmul(oc) - radius * radius;
                var limit = b * b - a * c;
                if (limit < 0) {
                    return {
                        t: 0.0,
                        hit: false
                    };
                }

                var temp = (-b - Math.sqrt(limit)) / a;
                var r    = ray.pointAt(temp);
                if (temp < tmax && temp > tmin) {
                    return {
                        hit: true,
                        t: temp,
                        r: r,
                        normal: r.subtract(center).divide(radius)
                    }
                }
                temp = (-b + Math.sqrt(limit)) / a;
                r    = ray.pointAt(temp);
                if (temp < tmax && temp > tmin) {
                    return {
                        hit: true,
                        t: temp,
                        r: r,
                        normal: r.subtract(center).divide(radius)
                    }
                }
                return {
                    t: -1.0,
                    hit: false
                };
            }
        }
    }

    function randUnitSphere() {
        var p = vector(Math.random(), Math.random(), Math.random()).multiply(2).subtract(vector(1.0, 1.0, 1.0));
        while (p.lengthSquared() >= 1.0) {
            p = vector(Math.random(), Math.random(), Math.random()).multiply(2).subtract(vector(1.0, 1.0, 1.0));
        }
        return p;
    }

    function vector(e0, e1, e2) {
        return {
            x: e0,
            y: e1,
            z: e2,
            add: function (vec) {
                if (isNaN(vec)) {
                    return vector(e0 + vec.x, e1 + vec.y, e2 + vec.z);
                } else {
                    return vector(e0 + vec, e1 + vec, e2 + vec);
                }
            },
            subtract: function (vec) {
                if (isNaN(vec)) {
                    return vector(e0 - vec.x, e1 - vec.y, e2 - vec.z);
                } else {
                    return vector(e0 - vec, e1 - vec, e2 - vec);
                }
            },
            multiply: function (vec) {
                if (isNaN(vec)) {
                    return vector(e0 * vec.x, e1 * vec.y, e2 * vec.z);
                } else {
                    return vector(e0 * vec, e1 * vec, e2 * vec);
                }
            },
            xmul: function (vec) {
                return vector(e1 * vec.z - e2 * vec.y, -(e0 * vec.z - e2 * vec.x), e0 * vec.y - e1 * vec.x)
            },
            dotmul: function (vec) {
                return e0 * vec.x + e1 * vec.y + e2 * vec.z;
            },
            divide: function (vec) {
                if (isNaN(vec)) {
                    return vector(e0 / vec.x, e1 / vec.y, e2 / vec.z);
                } else {
                    return vector(e0 / vec, e1 / vec, e2 / vec);
                }
            },
            sqrt: function () {
                return vector(Math.sqrt(e0), Math.sqrt(e1), Math.sqrt(e2));
            },
            invert: function () {
                return vector(-e0, -e1, -e2);
            },
            length: function () {
                return Math.sqrt(e0 * e0 + e1 * e1 + e2 * e2);
            },
            lengthSquared: function () {
                return e0 * e0 + e1 * e1 + e2 * e2;
            }
        };
    }

    function unitOfVector(v) {
        return v.divide(v.length());
    }

    function buildCanvas(w, h) {

        var c                 = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
        c.width               = w;
        c.height              = h;
        c.style.margin        = 0;
        c.style.display       = 'block';
        var body              = document.getElementsByTagName("body")[0];
        body.style.margin     = 0;
        body.style.padding    = 0;
        body.style.display    = 'block';
        body.style.background = 'black';
        body.appendChild(c);
        return {
            canvas: c,
            ctx: c.getContext('2d'),
            width: w,
            height: h
        };
    }

    function main() {
        var world   = buildCanvas(window.innerWidth, window.innerHeight);
        var id      = world.ctx.createImageData(world.width, world.height);
        var samples = 20;
        var dataIdx = 0;
        var cam     = camera(vector(-2.0, -1.0, -1.0), vector(4.0, 0.0, 0.0), vector(0.0, 2.0, 0.0), vector(0.0, 0.0, 0.0));
        var spheres = [sphereSurface(vector(0.0, 0.0, -1.0), 0.5), sphereSurface(vector(0.0, -100.5, -1.0), 100)];
        for (var y = world.height - 1; y >= 0; y--) {
            for (var x = 0; x < world.width; x++) {
                var c = vector(0.0, 0.0, 0.0);
                for (var s = 0; s < samples; s++) {
                    var u = (x + Math.random()) / world.width;
                    var v = (y + Math.random()) / world.height;
                    var r = cam.getRay(u, v);
                    c     = c.add(color(r, spheres));
                }
                c                  = c.divide(samples).sqrt();
                id.data[dataIdx++] = Math.floor(255 * c.x);
                id.data[dataIdx++] = Math.floor(255 * c.y);
                id.data[dataIdx++] = Math.floor(255 * c.z);
                id.data[dataIdx++] = 255;
            }
        }
        world.ctx.putImageData(id, 0, 0);
    }

    window.addEventListener('resize', main);
    main();

}());