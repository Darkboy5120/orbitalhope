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
    //esta funcion es para crear una objeto con dimenciones predefinidas pero con
    //coordenadas como paremetro

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

//guardamos la fecha de este momento y definimos algunas constantes de tiempo en milisegundos
let current_date = new Date();
const one_minute = 1000 * 60;
const one_hour = 1000 * 60 * 60;
const one_day = 1000 * 60 * 60 * 24;



let cordenadas =[
    get_coords(
        "1 49122U 21079A   21275.15082059  .00000029  00000-0  16545-4 0  9990",
        "2 49122  98.2818 346.3530 0001686 158.9355 201.1922 14.57684642  3644",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*1))
    ),
    get_coords(
        "1 49123U 21079B   21274.76528985  .00000423  00000-0  40047-4 0  9992",
        "2 49123  98.3179 347.5191 0137485 341.9235  17.7120 14.93117451  3673",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*2))
    ),
    get_coords(
        "1 49124U 21079C   21272.70469719  .00002623  00000-0  14257-3 0  9991",
        "2 49124  98.4033 344.6074 0221823 232.2673 125.8261 14.96975531  3299",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*3))
    ),
    get_coords(
        "1 49125U 21080A   21274.43868698 -.00000315  00000-0  00000-0 0  9990",
        "2 49125   0.0499 263.0902 0004018 274.6315  92.0202  1.00271811   396",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*4))
    ),
    get_coords(
        "1 22675U 93036A   21269.40469457  .00000015  00000-0  15215-4 0  9996",
        "2 22675  74.0378 244.8818 0025430 341.1003  18.9201 14.32581054477400",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*5))
    ),
    get_coords(
        "1 49122U 21079A   21274.46439531  .00000051  00000-0  21392-4 0  9995",
        "2 49123  98.3179 347.5191 0137485 341.9235  17.7120 14.93117451  3673",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*6))
    ),
    get_coords(
        "1 49123U 21079B   21274.22918002  .00000497  00000-0  45952-4 0  9997",
        "2 49123  98.3179 346.9523 0137518 343.6837  15.9975 14.93117043  3595",
        //aqui lo que hacemos es ir aumentando en un segundo mas cada iteracion
        new Date(current_date.getMilliseconds()+(one_minute*7))
    ),
];
const renderObjecbs=(data,capa,show)=>{
    if(show==true){
        for (let i = 0; i <cordenadas.length; i++) {
            //agregamos la info de la basura a la capa
            capa.addRenderable(get_polygon(cordenadas[i]));
            console.log((cordenadas[i]));
        }
        capa.opacity=1;
    }else{
        capa.opacity=0;
        for (let i = 0; i <cordenadas.length; i++) {
            //agregamos la info de la basura a la capa
            
            //polygonLayer.removeAllRenderables();
        }
    }
}
renderObjecbs(cordenadas,polygonLayer,true);

 
















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
                console.log(highlightedItems);
            }
        }
    }
    // Update the window if we changed anything.
    if (redrawRequired) {
        wwd.redraw();
    }
};
// Listen for mouse moves and highlight the placemarks that the cursor rolls over.
wwd.addEventListener("click", handlePick);
// Listen for taps on mobile devices and highlight the placemarks that the user taps.
var tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);
