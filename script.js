
const get_coords = (tleLine1, tleLine2, date) => {
    //esta funcion nos permite traducir la info en formato TLE, regresa las coordenadas

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
    //esta funcion es para crear una objeto con dimenciones predefinidas pero con
    //coordenadas como paremetro

    //creamos una forma con los atributos por defecto
    var polygonAttributes = new WorldWind.ShapeAttributes(null);
    //le agregamos el colore del interior en formato rgba
    polygonAttributes.interiorColor = new WorldWind.Color(1, 0, 0, 0.75);
    //definimos el color del border del objeto
    polygonAttributes.outlineColor = WorldWind.Color.BLUE;
    //permitimos que se visualice el borde del objeto (desactivado por defecto)
    polygonAttributes.drawOutline = true;
    //aplicamos matices de la luz en el objeto (desactivado por defecto)
    polygonAttributes.applyLighting = true;

    //el valor que usamos para darle 2 dimenciones al objeto de la basura, solo 2 para no impactar mucho en memoria
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

const set_layer_display = (layer, is_visible) => {
    //funcion para ocular capas

    layer.opacity = (is_visible) ? 1 : 0;
}



//creamos el canvas
var wwd = new WorldWind.WorldWindow("canvasOne");

//agregar capa inicial de resolucion baja
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
//capa de resolucion alta
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

//agregamos la brujula
wwd.addLayer(new WorldWind.CompassLayer());
//agregamos la capa para las coordenadas
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
//agregamos la capa para los controles (botones) del mundo
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

//creamos una nueva capa
var polygonLayer = new WorldWind.RenderableLayer();
//la agregamos a worldwind
wwd.addLayer(polygonLayer);

//guardamos la fecha de este momento y definimos algunas constantes de tiempo en milisegundos
let current_date = new Date();
const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = 1000 * 60 * 60 * 24;


//prueba de prediccion COMENTAR ESTO
for (let i = 0; i < 100; i++) {

    //obtenemos la latitud, longitud y altitud de la basura de ejemplo
    let trash_coords = get_coords(
        "1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996",
        "2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(ONE_MINUTE*i))
    );

    //agregamos la info de la basura a la capa
    polygonLayer.addRenderable(get_polygon(trash_coords));
}













//lo sigueinte es para reconocer los objetos que reciben un click, estos se iran agregando al array de highlightedItems
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

    //CHEQUEN QUE PICK LIST TIENE EL RESULTADO DEL CLICK
    //SI SE DETECTA ALGO EL LENGTH DE PICK SE AUMENTA

    // Highlight the items picked.
    if (pickList.objects.length > 0) {
        for (var p = 0; p < pickList.objects.length; p++) {
            if (pickList.objects[p].isOnTop) {
                pickList.objects[p].userObject.highlighted = true;
                //se imprime el objeto que recibe un click
                console.log(pickList.objects[p].userObject);
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




