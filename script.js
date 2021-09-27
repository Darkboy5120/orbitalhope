// Sample TLE
const get_coords = (tleLine1, tleLine2) => {
    //var tleLine1 = '1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996',
    //tleLine2 = '2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400';    

    // Initialize a satellite record
    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    //  Propagate satellite using time since epoch (in minutes).
    //var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

    //  Or you can use a JavaScript Date
    var positionAndVelocity = satellite.propagate(satrec, new Date());

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    var positionEci = positionAndVelocity.position,
        velocityEci = positionAndVelocity.velocity;

    // Set the Observer at 122.03 West by 36.96 North, in RADIANS
    var observerGd = {
        longitude: satellite.degreesToRadians(-122.0308),
        latitude: satellite.degreesToRadians(36.9613422),
        height: 0.370
    };

    // You will need GMST for some of the coordinate transforms.
    // http://en.wikipedia.org/wiki/Sidereal_time#Definition
    var gmst = satellite.gstime(new Date());

    // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
    var positionEcf   = satellite.eciToEcf(positionEci, gmst),
        observerEcf   = satellite.geodeticToEcf(observerGd),
        positionGd    = satellite.eciToGeodetic(positionEci, gmst),
        lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf);

    // The coordinates are all stored in key-value pairs.
    // ECI and ECF are accessed by `x`, `y`, `z` properties.
    var satelliteX = positionEci.x,
        satelliteY = positionEci.y,
        satelliteZ = positionEci.z;

    // Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
    var azimuth   = lookAngles.azimuth,
        elevation = lookAngles.elevation,
        rangeSat  = lookAngles.rangeSat;

    // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
    var longitude = positionGd.longitude,
        latitude  = positionGd.latitude,
        height    = positionGd.height;

    //  Convert the RADIANS to DEGREES.
    var longitudeDeg = satellite.degreesLong(longitude),
        latitudeDeg  = satellite.degreesLat(latitude);

    return {
        "longitude" : longitudeDeg,
        "latitude" : latitudeDeg
    };
}



var wwd = new WorldWind.WorldWindow("canvasOne");

//low resolution imagery layer
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
//hight resolution imagery layer
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

wwd.addLayer(new WorldWind.CompassLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

//create new layer for 3d for 3d polygons and add it to worldwindow
var polygonLayer = new WorldWind.RenderableLayer();
wwd.addLayer(polygonLayer);

var polygonAttributes = new WorldWind.ShapeAttributes(null);
polygonAttributes.interiorColor = new WorldWind.Color(1, 0, 0, 0.75);
polygonAttributes.outlineColor = WorldWind.Color.BLUE;
polygonAttributes.drawOutline = true;
polygonAttributes.applyLighting = true;

//use foo funct to use foo data example
let foo = get_coords(
    "1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996",
    "2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400"
);
console.log(foo);

const trash_size = 2;

var boundaries = [];
//latitude, longitude, altitude
boundaries.push(new WorldWind.Position(foo.latitude, foo.longitude, 1000000));
boundaries.push(new WorldWind.Position(foo.latitude+trash_size, foo.longitude, 1000000));
boundaries.push(new WorldWind.Position(foo.latitude+trash_size, foo.longitude+trash_size, 1000000));
boundaries.push(new WorldWind.Position(foo.latitude, foo.longitude+trash_size, 1000000));

var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
polygon.extrude = false;


console.log(polygon);

polygonLayer.addRenderable(polygon);


// Set the picking event handling.

var highlightedItems = [];

var handlePick = function (o) {
    // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
    // the mouse or tap location.
    var x = o.clientX,
        y = o.clientY;

    var redrawRequired = highlightedItems.length > 0;

    // De-highlight any highlighted placemarks.
    for (var h = 0; h < highlightedItems.length; h++) {
        highlightedItems[h].highlighted = false;
    }
    highlightedItems = [];

    // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
    // relative to the upper left corner of the canvas rather than the upper left corner of the page.
    var rectRadius = 50,
        pickPoint = wwd.canvasCoordinates(x, y),
        pickRectangle = new WorldWind.Rectangle(pickPoint[0] - rectRadius, pickPoint[1] + rectRadius,
            2 * rectRadius, 2 * rectRadius);

    var pickList = wwd.pickShapesInRegion(pickRectangle);
    if (pickList.objects.length > 0) {
        redrawRequired = true;
    }

    // Highlight the items picked.
    if (pickList.objects.length > 0) {
        for (var p = 0; p < pickList.objects.length; p++) {
            if (pickList.objects[p].isOnTop) {
                pickList.objects[p].userObject.highlighted = true;
                highlightedItems.push(pickList.objects[p].userObject);
            }
        }
    }

    // Update the window if we changed anything.
    if (redrawRequired) {
        wwd.redraw();
    }
};

// Listen for mouse moves and highlight the placemarks that the cursor rolls over.
wwd.addEventListener("mousemove", handlePick);

// Listen for taps on mobile devices and highlight the placemarks that the user taps.
var tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);