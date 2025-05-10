function loadEarthquakeMarkers(data) {
    const map = document.getElementById("map");
    data.forEach(async eq => {
        const {Marker3DInteractiveElement} = await google.maps.importLibrary("maps3d");
        const {PinElement} = await google.maps.importLibrary("marker");
        const color = eq.mag > 5 ? "red" : eq.mag > 4 ? "orange" : "yellow";
        const pinScaled = new PinElement({
            scale: eq.mag * .75,
            glyph: `${eq.mag}`,
            glyphColor: color,
            background: 'black',
            borderColor: 'black'
        })
        const marker = new Marker3DInteractiveElement({
            position: {lat: eq.latitude, lng: eq.longitude, altitude: 1000},
            extruded: true,
            zIndex: eq.mag,
            altitudeMode: 'RELATIVE_TO_GROUND',
            collisionBehavior: google.maps.CollisionBehavior.OPTIONAL_AND_HIDE_LOWER_PRIORITY
        })
        marker.addEventListener("gmp-click", (e) => {
            sidebarDisplay(eq);
            map.flyCameraTo({
                endCamera: {
                  center: marker.position,
                  tilt: 67.5,
                  range: 10000
                },
                durationMillis: 3000
              });
            map.addEventListener("gmp-animationend", (e) => {
                map.flyCameraAround({
                    camera: {
                        center: marker.position,
                        tilt: 67.5,
                        range: 10000
                    },
                    durationMillis: 10000,
                    rounds: 1
                })
            }, {once: true});
            e.stopPropagation();
        });
        marker.id = eq.id;
        marker.appendChild(pinScaled);
        map.append(marker);
    })
}

function focusEarthquake(eq) {
    const map = document.getElementById("map");
    sidebarDisplay(eq);
    map.scrollIntoView({behavior: 'smooth', block: 'center'});
    map.flyCameraTo({
        endCamera: {
            center: {lat: eq.latitude, lng: eq.longitude, altitude: 1000},
            tilt: 67.5,
            range: 10000
        },
        durationMillis: 6000
    });
    map.addEventListener("gmp-animationend", (e) => {
        map.flyCameraAround({
            camera: {
                center: {lat: eq.latitude, lng: eq.longitude, altitude: 1000},
                tilt: 67.5,
                range: 10000
            },
            durationMillis: 6000,
            rounds: 1
        })
    }, {once: true});
}

function sidebarDisplay(eq) {
    const sidebar = document.getElementById("sidebar");
    const mag = document.getElementById("mag");
    const place = document.getElementById("place");
    const time = document.getElementById("time");
    const lat = document.getElementById("lat");
    const lng = document.getElementById("lng");
    mag.innerText = eq.mag;
    place.innerText = eq.place;
    time.innerText = eq.time;
    lat.innerText = eq.latitude;
    lng.innerText = eq.longitude;

}

window.initMap = async () => {
    const mapContainer = document.getElementById("mapcontainer");
    const {Map3DElement} = await google.maps.importLibrary("maps3d");
    const map = new Map3DElement({
        mapId: "468664a37d0a8931dbe5725e",
        mode: 'SATELLITE',
        range: 10000000,
        tilt: 0,
        center: {lat: 39.8283, lng: -98.5795, altitude: 0},
        heading:0
    })
    map.id = "map";
    mapContainer.append(map);

    const sidebar = document.createElement("div");
    sidebar.id = "sidebar";
    sidebar.style = `
        position: absolute;
        top: 5px;
        left: 5px;
        width:200px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        padding: 5px;
        color: white;
        z-index: 10;`;
    sidebar.innerHTML = `
        <strong style='font-size: 20px; color: brown'>Earthquake Details</strong><br>
        <strong>Magnitude:</strong> <span id="mag"></span><br>
        <strong>Location:</strong> <span id="place"></span><br>
        <strong>Time:</strong> <span id="time"></span><br>
        <strong>Latitude:</strong> <span id="lat"></span><br>
        <strong>Longitude:</strong> <span id="lng"></span><br>
    `;
    mapContainer.append(sidebar);
}
