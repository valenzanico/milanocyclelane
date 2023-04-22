//variabili
const API = "https://backend.milanocyclelane.algorithm-net.com/"; //api endpoint
let root = document.querySelector("#root"); //html node 
let body = document.body;
let search_result; //variabili globali
let leaflet_map;
let load_second;
let route;
let geojson;
let mly;
let markerComponent;
let hideorshowmapillary = 0;
let menu_state = 0;
let marker_state = { //oggetto globale in cui sono salvati i dati inierenti alla posizione
    destination: {
        marker: null,
        search_result: null,
        coordinates: null
    },
    start: {
        marker: null,
        search_result: null,
        coordinates: null
    },
    position: {
        marker: null,
        coordinates: null,
        is_possible: false,
        type: null
    },
    near_lane: {
        marker: null,
        coordinates: null,
        is_used: false
    }
}


var redIcon = new L.Icon({ //classe dell'icona della posizione from https://github.com/pointhi/leaflet-color-markers
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({ //classe dell'icona della posizione from https://github.com/pointhi/leaflet-color-markers
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});



//fuznioni chiamate dal dom
//qua si trovano le funzioni chiamate associate a un'evento


function remove_marker(type) { //questa funzione rimuove i marker e richiama il cilo della ricerca
    if (marker_state.position.marker == null && marker_state.position.is_possible == true && marker_state.position.coordinates != null && marker_state.position.type == type) {
        marker_state.position.marker = L.marker(marker_state.position.coordinates, { icon: redIcon }).addTo(leaflet_map);
        marker_state.position.marker.bindPopup(`<b>la tua posizione</b>`)
    }
    if (type === "start") {
        leaflet_map.removeLayer(marker_state.start.marker);
        marker_state.start.marker = null;
        if (document.getElementById("start-show")) {
            document.getElementById("start-show").remove()
        };
        marker_state.start.search_result = null;
        marker_state.start.coordinates = null;
        return search();
    } else if (type === "destination") {
        leaflet_map.removeLayer(marker_state.destination.marker);
        marker_state.destination.marker = null;
        if (document.getElementById("destination-show")) {
            document.getElementById("destination-show").remove()
        };
        marker_state.destination.search_result = null;
        marker_state.destination.coordinates = null;
        return search();
    } else if (type === "position") {
        leaflet_map.removeLayer(marker_state.position.marker);
        marker_state.position.marker = null;
        marker_state.position.coordinates = null;
    }
}

function on_get_place_start(placeid) {
    let search_result_html_list = document.getElementById("search-result-s");
    console.log(placeid);
    console.log(search_result);
    marker_state.start.search_result.map((item, index) => {
        if (item.obj_id === placeid) {
            if (check_if_exist([item.latitude, item.longitude])) {
                return
            }
            if (leaflet_map) {
                let start_marker = L.marker([item.latitude, item.longitude])
                start_marker.setZIndexOffset(3)
                marker_state.start.marker = start_marker.addTo(leaflet_map);
                marker_state.start.marker.bindPopup(`<b align="center">partenza</b><br /><button align="center" onclick="remove_marker('start')">rimuovi</button>`)
            }
            marker_state.start.coordinates = [item.latitude, item.longitude];
            document.getElementById("start-c").innerHTML = `<h4 id="start-show">partenza: ${item.display_name}</h4>`;
            return search();
        }
    })
}

function on_get_place_destination(placeid) {
    let search_result_html_list = document.getElementById("search-result-d");
    console.log(placeid);
    console.log(search_result);
    marker_state.destination.search_result.map((item, index) => {

        if (item.obj_id === placeid) {
            if (check_if_exist([item.latitude, item.longitude])) {
                return
            }
            if (leaflet_map) {
                let destination_marker = L.marker([item.latitude, item.longitude])
                destination_marker.setZIndexOffset(3)
                marker_state.destination.marker = destination_marker.addTo(leaflet_map);
                marker_state.destination.marker.bindPopup(`<b>destinazione</b><br /><button onclick="remove_marker('destination')">rimuovi</button>`)
            };
            marker_state.destination.coordinates = [item.latitude, item.longitude];
            document.getElementById("destination-c").innerHTML = `<h4 id="destination-show">destinazione: ${item.display_name}</h4>`;
            return search();
        }
    })
}

function on_get_place_pos(type) {
    let pos_coordinates = marker_state.position.coordinates;
    console.log(pos_coordinates);
    if (check_if_exist(pos_coordinates)) {
        return
    }
    if (type === "start") {
        if (leaflet_map) {
            leaflet_map.removeLayer(marker_state.position.marker);
            marker_state.position.marker = null;
            marker_state.position.type = type;
            let start_marker = L.marker(pos_coordinates)
            start_marker.setZIndexOffset(3)
            marker_state.start.marker = start_marker.addTo(leaflet_map);
            marker_state.start.marker.bindPopup(`<b>partenza</b><br /><button onclick="remove_marker('start')">rimuovi</button>`)
        };
        marker_state.start.coordinates = marker_state.position.coordinates
        document.getElementById("start-c").innerHTML = `<h4 id="start-show">partenza: la tua posizione</h4>`;
        return search();

    } else if (type === "destination") {
        if (leaflet_map) {
            leaflet_map.removeLayer(marker_state.position.marker);
            marker_state.position.marker = null;
            marker_state.position.type = type;
            let destination_marker = L.marker(pos_coordinates)
            destination_marker.setZIndexOffset(3)
            marker_state.destination.marker = destination_marker.addTo(leaflet_map);
            marker_state.destination.marker.bindPopup(`<b>destinazione</b><br /><button onclick="remove_marker('destination')">rimuovi</button>`)
        };
        marker_state.destination.coordinates = marker_state.position.coordinates
        document.getElementById("destination-c").innerHTML = `<h4 id="destination-show">destinazione: la tua posizione</h4>`;
        return search();
    }
}
async function handle_start_submit(event) {
    event.preventDefault();
    let search_input = event.target[0].value;
    let search_api_result = await search_api(search_input);
    marker_state.start.search_result = search_api_result;
    if (search_api_result[0]) {
        if (search_api_result[0].display_name) {

            let search_result_html_list = document.getElementById("search-result-s");
            search_result_html_list.innerHTML = "";
            if (marker_state.position.coordinates) {
                search_result_html_list.innerHTML += `<li id="my-pos-s"><a href="#" onclick="on_get_place_pos('start')">la tua posizione</a></li>`
            }
            search_api_result.map((item, index) => {
                if (item.display_name.includes("Milano")) {
                    search_result_html_list.innerHTML += `<li id=${item.obj_id}><a href="#" onclick="on_get_place_start(${item.obj_id})">${item.display_name}</a></li>`
                        // aggiungere event listener di ogni eleemnto cercato da scegliere
                }
            })
        }
    }
}
async function handle_destination_submit(event) {
    event.preventDefault();
    let search_input = event.target[0].value;
    let search_api_result = await search_api(search_input);
    marker_state.destination.search_result = search_api_result;
    if (search_api_result[0]) {
        if (search_api_result[0].display_name) {
            let search_result_html_list = document.getElementById("search-result-d");
            search_result_html_list.innerHTML = "";
            if (marker_state.position.coordinates) {
                search_result_html_list.innerHTML += `<li id="my-pos-d"><a href="#" onclick="on_get_place_pos('destination')">la tua posizione</a></li>`
            }
            search_api_result.map((item, index) => {
                if (item.display_name.includes("Milano")) {
                    search_result_html_list.innerHTML += `<li id=${item.obj_id}><a href="#" onclick="on_get_place_destination(${item.obj_id})">${item.display_name}</a></li>`
                        // aggiungere event listener di ogni eleemnto cercato da scegliere
                }
            })
        }
    }
}

async function getnear_coord() {
    if (marker_state.position.is_possible) {
        let coord = await getNear([parseFloat(marker_state.position.coordinates[1]), parseFloat(marker_state.position.coordinates[0])], geojson)
        managemapillaryviewer([parseFloat(marker_state.position.coordinates[1]), parseFloat(marker_state.position.coordinates[0])], coord)
    }
}

async function manage_menu() {
    if (menu_state === 0) {
        document.querySelector("#root").setAttribute("class", "menu-open")
        menu_state = 1
    } else {
        document.querySelector("#root").setAttribute("class", "menu-close")
        menu_state = 0
    }
}

//funzioni richimate da altre funzioni
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getapi() {
    return fetch(API)
        .then(data => data.json())

}

function onLoad() {
    let t = new Date()
    load_second = t.getSeconds()
}

function check_if_exist(coord) {
    if (marker_state.start.coordinates) {
        if (coord[0] === marker_state.start.coordinates[0] && coord[1] === marker_state.start.coordinates[1]) {
            console.log("esiste");
            return true
        }
    }
    if (marker_state.destination.coordinates) {
        if (coord[0] === marker_state.destination.coordinates[0] && coord[1] === marker_state.destination.coordinates[1]) {
            console.log("esiste");
            return true
        }
    } else {
        console.log("non esiste");
        return false
    }
}

function insert_leaflet_map() {
    let new_leaflet_map = L.map('leaflet-map').setView([45.4773, 9.1815], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(new_leaflet_map);

    return new_leaflet_map
}

async function search_api(query) { //funzione per gestione api ricerca openstreetmap
    let json = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}, Milano&format=jsonv2`)
        .then(data => data.json())
    let result_array = json.map((item, index) => {
        return {
            boundingbox: item.boundingbox,
            latitude: item.lat,
            longitude: item.lon,
            display_name: item.display_name,
            obj_id: item.place_id
        }
    })
    return result_array
}



function create_route(waypoints) {
    route = L.routing.control({
            router: L.Routing.mapbox('pk.eyJ1IjoidmFsZW56YW5pY28iLCJhIjoiY2ttcnpkYzJnMGN2ZzJyczBzNTZrZWRmeSJ9.Yc0IzLvcfZgxTK-QYPbK8A'),
            waypoints: waypoints,
            lineOptions: {
                addWaypoints: false
            },
            /* plan: {
                addWaypoints: false edit in public/dist/leaflet-routing-machine.js:18280
            } */
        })
        // route.on('routeselected', e => {
        //     let geo = L.Routing.routeToGeoJson(e.route);
        //     console.log(geo)
        // })
}

async function manage_route() {
    let can_route = () => {
        if (marker_state.start.coordinates && marker_state.destination.coordinates) {
            return true;
        } else {
            return false;
        }
    }
    if (can_route()) {
        let waypoints = [
            L.latLng(parseFloat(marker_state.start.coordinates[0]), parseFloat(marker_state.start.coordinates[1])),
            L.latLng(parseFloat(marker_state.destination.coordinates[0]), parseFloat(marker_state.destination.coordinates[1]))
        ];
        if (!route) {
            create_route(waypoints);
            route.addTo(leaflet_map);
            manage_menu();
        } else {
            route.addTo(leaflet_map);
            route.setWaypoints(waypoints);
        }
    } else {
        if (route) {
            leaflet_map.removeControl(route);
        }
    }
}

function get_user_position() {
    "use strict";
    return new Promise(function(resolve, reject) {
        var coordinates = {
            latitude: null,
            longitude: null,
            error: false,
        }

        function success(pos) {
            coordinates.latitude = pos.coords.latitude;
            coordinates.longitude = pos.coords.longitude;
            resolve(coordinates);
        }

        function fail(error) {
            coordinates.error = true;
            resolve(coordinates);
        }
        navigator.geolocation.getCurrentPosition(success, fail);
    });
}
//questa funzione inserice la view html della ricerca
//inizializza le variabili
//viene chiamata ogni volta 
async function search() { // search funxtion per gestione html
    let pos_list_el = t => {
        if (marker_state.position.coordinates) {
            if (t === "s") {
                return `<li id="my-pos-s"><a href="#" onclick="on_get_place_pos('start')">la tua posizione</a></li>`
            } else if (t === "d") {
                return `<li id="my-pos-d"><a href="#" onclick="on_get_place_pos('destination')">la tua posizione</a></li>`
            }
        } else {
            return ""
        }
    }
    let old_html_div = document.getElementById("search")
    if (!old_html_div) {
        root.innerHTML += `<div id="search" class="search"></div>`
    }

    let start_point = () => {
        let start_c = document.getElementById("start-c")
        if (!start_c) {
            let html_form = `
        <div id="start-c">
    <form id="search-form1" onsubmit="handle_start_submit(event)">
    <h4>partenza</h4>
            <input type="search">
            <input type="submit" value="cerca">
            <ul id="search-result-s">
            ${pos_list_el("s")}
            </ul>
        </form>
        </div>
        `;
            document.getElementById("search").innerHTML += html_form;
        } else {
            let html_form = `
    <form id="search-form1" onsubmit="handle_start_submit(event)">
    <h4>partenza</h4>
            <input type="search">
            <input type="submit" value="cerca">
            <ul id="search-result-s">
            ${pos_list_el("s")}
            </ul>
        </form>
        `;
            document.getElementById("start-c").innerHTML += html_form;
        }
    };
    let destination_point = () => {
        let destination_c = document.getElementById("destination-c")
        if (!destination_c) {
            let html_form = `
        <div id="destination-c">
    <form id="search-form2" onsubmit="handle_destination_submit(event)">
    <h4>destinazione</h4>
            <input type="search">
            <input type="submit" value="cerca">
            <ul id="search-result-d">
            ${pos_list_el("d")}
            </ul>
        </form>
        </div>
        `;
            document.getElementById("search").innerHTML += html_form;
        } else {
            let html_form = `
    <form id="search-form2" onsubmit="handle_destination_submit(event)">
    <h4>destinazione</h4>
            <input type="search">
            <input type="submit" value="cerca">
            <ul id="search-result-d">
                ${pos_list_el("d")}
            </ul>
        </form>
        `;
            document.getElementById("destination-c").innerHTML += html_form;

        }
    }
    let start_form = document.getElementById("search-form1");
    let destination_form = document.getElementById("search-form2");
    if (!marker_state.start.marker) {
        if (!start_form) {
            start_point();
        }

    } else {
        if (start_form) {
            start_form.remove();
        }
    };
    if (!marker_state.destination.marker) {
        if (!destination_form) {
            destination_point();
        }
    } else {
        if (destination_form) {
            destination_form.remove();
        }
    }
    manage_route();

}

//questa funzione inserisce la view html e il pulsante per richimare la ricerca della cilclabile più vicibna
function get_near_cyclable(mygeojson) {
    if (marker_state.position.is_possible) {
        geojson = mygeojson;
        root.innerHTML += `<div id="near_cycle" class="near_cycle">
    
    <button onclick="getnear_coord()">visualizza ciclabile più vicina</button></div>`
    }
}

async function getNear(mycord, json_obj) {

    let final_l = []


    let list = json_obj.features.map((item, index) => {
        return {
            id: item.properties.id_amat,
            coordinates: item.geometry.coordinates,

        }

    })
    list.map((item, index) => {
        item.coordinates[0].map((item, index) => {
            final_l.push(item)
        })
    })
    final_l2 = final_l.map((item, index) => {
        let lon_d = Math.abs(item[0] - mycord[0])
        let lat_d = Math.abs(item[1] - mycord[1])
        return lon_d + lat_d
    })
    let corrindex = final_l2.indexOf(Array.min(final_l2))
    let coordinate;
    final_l.map((item, index) => {
        if (index === corrindex) {
            coordinate = item
        }
    })
    let toreturn = [];
    let coorit;
    list.map((item, oindex) => {
        if (item.coordinates) {
            let listint = item.coordinates[0]
            listint.map((nitem, index) => {
                if (nitem === coordinate) {
                    if (index - 1 !== -1) {
                        toreturn.push(listint[index - 1]);
                    }
                    toreturn.push(listint[index]);
                    if (listint.length - 1 !== index) {
                        toreturn.push(listint[index + 1]);
                    }
                    coorit = json_obj.features[oindex]
                }
            })
        }

    })
    if (toreturn.length > 2) {
        toreturn.map((item, index) => {
            if (item === coordinate) {
                if (index === 0) {
                    toreturn = toreturn
                } else if (index === 1) {
                    let d1 = Math.abs(toreturn[0][0] - mycord[0]) + Math.abs(toreturn[0][1] - mycord[1])
                    let d2 = Math.abs(toreturn[2][0] - mycord[0]) + Math.abs(toreturn[2][1] - mycord[1])
                    if (d1 <= d2) {
                        toreturn.splice(2, 1)
                    } else if (d2 < d1) {
                        toreturn.splice(0, 1)
                    }
                } else if (index === 2) {
                    toreturn = toreturn
                }
            }
        })
    } else {
        toreturn = toreturn
    }
    let x_a = toreturn[0][0]
    let y_a = toreturn[0][1]
    let x_b = toreturn[1][0]
    let y_b = toreturn[1][1]
    let x_d = x_b - x_a
    let y_d = y_b - y_a
    let coe = y_d / x_d
    let new_point = []
    let x_c = x_a
    let y_c
    let n_push = parseInt(Math.abs(x_d / 0.0002))
    for (let n = 1; n <= n_push - 1; n++) {
        if (x_a < x_b) { // x_a < x_c < x_b
            x_c = x_c + 0.0002
        } else if (x_a > x_b) {
            x_c = x_c + (-1 * 0.0002)
        } else if (x_a === x_b) {
            x_c = null
        }
        if (x_c) {
            y_c = coe * (x_c - x_a) + y_a
        }
        new_point.push([x_c, y_c])
    }
    new_point = new_point.concat(toreturn)
    let new_point2 = new_point.map((item, index) => {
        let x_dif = Math.abs(item[0] - mycord[0])
        let y_dif = Math.abs(item[1] - mycord[1])
        return x_dif + y_dif
    })

    let nearcoord_ind = new_point2.indexOf(Array.min(new_point2))
    let nearcoord = new_point[nearcoord_ind]
    let result_dict = {
        coord: toreturn,
        ite: coorit,
        cc: coordinate,
        xy_distanza: {
            x_d: x_d,
            y_d: y_d,
            m: coe,
            x_a: x_a,
            y_a: y_a,
            x_b: x_b,
            y_b: y_b,
            xy_c: new_point,
            npush: n_push,
            risultato: nearcoord
        }
    };
    return result_dict.xy_distanza.risultato

}


function initMapillary() {
    mly = new Mapillary.Viewer({
        apiClient: 'MLY|5994274650684119|6ea414a1693c80861e8166ae074e2d9d',
        component: {
            cover: false,
            marker: true,
        },
        container: 'mly',
    });
}

function addMarker(position, lane) {
    markerComponent = mly.getComponent('marker');
    var interactiveMarker = new Mapillary.MarkerComponent.SimpleMarker(
        'position-id', { lat: position[1], lon: position[0] }, {
            ballColor: '#000',
            ballOpacity: 1,
            color: 0xffff00,
            opacity: 0.5,
        });

    // Create a non interactive simple marker with default options
    var defaultMarker = new Mapillary.MarkerComponent.SimpleMarker(
        'lane-id', { lat: lane[1], lon: lane[0] });
    markerComponent.add([interactiveMarker]);
    markerComponent.add([defaultMarker]);
}



function movetopoint(position, lane) {
    let keytomove;
    fetch(`https://a.mapillary.com/v3/images?client_id=5994274650684119&closeto=${position[0]},${position[1]}&lookat=${lane[0]},${lane[1]}`)
        .then(data => data.json())
        .then(json => {
            keytomove = json["features"][0]["properties"]["key"]
            mly.moveToKey(keytomove).catch(function(e) { console.error(e); });
        })
}

function showViewer(position_coord, lane_coord) {
    marker_state.near_lane.coordinates = [lane_coord[1].toString(), lane_coord[0].toString()]
    marker_state.near_lane.marker = L.marker(marker_state.near_lane.coordinates, { icon: orangeIcon }).addTo(leaflet_map);
    marker_state.near_lane.marker.bindPopup(`<b>ciclabile più vicina</b>`)
    marker_state.near_lane.is_used = true
    leaflet_map.setView(marker_state.near_lane.coordinates, 25)
    document.querySelector("#mly").removeAttribute("class")
    document.querySelector("#mly").setAttribute("class", "mly")
    initMapillary();
    addMarker(position_coord, lane_coord);
    movetopoint(position_coord, lane_coord);
    mly.resize();
    window.addEventListener('resize', function() { mly.resize(); });

}

function hideViewer() {
    markerComponent.removeAll();
    mly.remove();
    document.querySelector("#mly").removeAttribute("class")
    document.querySelector("#mly").setAttribute("class", "mly-hidden")
    marker_state.near_lane.coordinates = null;
    leaflet_map.removeLayer(marker_state.near_lane.marker);
    marker_state.near_lane.marker = null;
    leaflet_map.setView([45.4773, 9.1815], 12);
    marker_state.near_lane.is_used = false
}

function managemapillaryviewer(position_coord, lane_coord) {
    if (hideorshowmapillary === 1) {
        hideViewer();
        hideorshowmapillary = 0;
        document.querySelector("#near_cycle > button").innerText = "visualizza ciclabile più vicina";
        manage_menu();
    } else {
        showViewer(position_coord, lane_coord);
        hideorshowmapillary = 1;
        document.querySelector("#near_cycle > button").innerText = "nascondi ciclabile più vicina";
        manage_menu();
    }
}


async function add_graphic_element() {
    document.querySelector("#graph-root").innerHTML += `
    <label class="menu-button" onclick="manage_menu()"><img class="menu-button-icon" src="/images/dropdownmenubutton.svg" alt="MENU"></img></label>
    `
}


async function start_whatchposition() {
    let success = position => {
        let current_pos = position.coords;
        if (marker_state.position.marker) {
            marker_state.position.coordinates = [current_pos.latitude.toString(), current_pos.longitude.toString()];
            leaflet_map.removeLayer(marker_state.position.marker);
            marker_state.position.marker = null;
            marker_state.position.marker = L.marker(marker_state.position.coordinates, { icon: redIcon }).addTo(leaflet_map);
            marker_state.position.marker.bindPopup(`<b>la tua posizione</b>`)
            marker_state.position.is_possible = true;
            console.log("update pos");
        } else {
            marker_state.position.coordinates = [current_pos.latitude.toString(), current_pos.longitude.toString()];
            marker_state.position.marker = null;
            marker_state.position.marker = L.marker(marker_state.position.coordinates, { icon: redIcon }).addTo(leaflet_map);
            marker_state.position.marker.bindPopup(`<b>la tua posizione</b>`)
            marker_state.position.is_possible = true;
            console.log("create pos");
        }
    }

    let error = () => {
        console.error('Sorry, no position available.');
        marker_state.position.is_possible = false;
    }

    const options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };

    navigator.geolocation.watchPosition(success, error, options);

}
async function append_legend() {
    document.querySelector("#graph-root").innerHTML += `
    <div class="map-legend" id="map-legend">
    <p><i></i> ciclabili</p>
    </div>
    `
}
async function append_footer() {
    document.querySelector("#root").innerHTML += `
    <div class="footer">
    <a href="/info">Info</a>
    <a href="/install">Install</a>
    </div>
    `
}
//funzione main
//questa funzione richiama tutte le altre
//si occupa di:
// -scaricare il file geojson dalle api e inserirlo nella mappa leaflet
// -agiungere la mappa all dom
// -richiedere la posizione gps corrente alle api
async function main() {
    onLoad();
    root.querySelector("#loading").innerHTML = `
    <?xml version="1.0" encoding="utf-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="loader" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
    <path d="M28 50A22 22 0 0 0 72 50A22 22.8 0 0 1 28 50" fill="#36013f" stroke="none">
      <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.4;360 50 50.4"></animateTransform>
    </path>
    <!-- [ldio] generated by https://loading.io/ --></svg>
    `;
    let l_geojson = await getapi();
    let map_container = document.createElement("div");
    map_container.id = "leaflet-map";
    body.insertBefore(map_container, root)
    leaflet_map = insert_leaflet_map();
    L.geoJSON(l_geojson).addTo(leaflet_map)
    let current_pos = await get_user_position();
    if (!current_pos.error) {
        marker_state.position.is_possible = true;
        marker_state.position.coordinates = [current_pos.latitude.toString(), current_pos.longitude.toString()]
        marker_state.position.marker = L.marker(marker_state.position.coordinates, { icon: redIcon }).addTo(leaflet_map);
        marker_state.position.marker.bindPopup(`<b>la tua posizione</b>`)
        start_whatchposition();
    };
    append_legend();
    add_graphic_element();
    search();
    get_near_cyclable(l_geojson);
    append_footer();
    root.querySelector("#loading").remove();

}
main();