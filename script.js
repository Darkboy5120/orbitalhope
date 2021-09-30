// Sample TLE
const get_coords = (tleLine1, tleLine2, date) => {
    //var tleLine1 = '1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996',
    //tleLine2 = '2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400';    

    // Initialize a satellite record
    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    //  Propagate satellite using time since epoch (in minutes).
    //var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

    //  Or you can use a JavaScript Date
    var positionAndVelocity = satellite.propagate(satrec, date);

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    var positionEci = positionAndVelocity.position,
        velocityEci = positionAndVelocity.velocity;

    // You will need GMST for some of the coordinate transforms.
    // http://en.wikipedia.org/wiki/Sidereal_time#Definition
    var gmst = satellite.gstime(new Date());

    // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
    var positionEcf   = satellite.eciToEcf(positionEci, gmst),
        positionGd    = satellite.eciToGeodetic(positionEci, gmst);

    // The coordinates are all stored in key-value pairs.
    // ECI and ECF are accessed by `x`, `y`, `z` properties.
    var satelliteX = positionEci.x,
        satelliteY = positionEci.y,
        satelliteZ = positionEci.z;

    // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
    var longitude = positionGd.longitude,
        latitude  = positionGd.latitude,
        height    = positionGd.height;

    //  Convert the RADIANS to DEGREES.
    var longitudeDeg = satellite.degreesLong(longitude),
        latitudeDeg  = satellite.degreesLat(latitude);

    return {
        "longitude" : longitudeDeg,
        "latitude" : latitudeDeg,
        "height" : height*1000
    };
}

const get_polygon = (coords) => {
    const trash_size = 1;

    var boundaries = [];
    //latitude, longitude, altitude
    boundaries.push(new WorldWind.Position(coords.latitude, coords.longitude, coords.height));
    boundaries.push(new WorldWind.Position(coords.latitude+trash_size, coords.longitude, coords.height));
    boundaries.push(new WorldWind.Position(coords.latitude+trash_size, coords.longitude+trash_size, coords.height));
    boundaries.push(new WorldWind.Position(coords.latitude, coords.longitude+trash_size, coords.height));

    var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
    polygon.extrude = false;

    return polygon;
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

let current_date = new Date();
const one_minute = 1000 * 60;
const one_hour = 1000 * 60 * 60;
const one_day = 1000 * 60 * 60 * 24;

for (let i = 0; i < 100; i++) {

    let trash_coords = get_coords(
        "1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996",
        "2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400",
        new Date(current_date.getMilliseconds()+(one_minute*i))
    );

    polygonLayer.addRenderable(get_polygon(trash_coords));
}

















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