//variabili
const API = "http://localhost:3000";
let root = document.querySelector("#root");
let body = document.body;
let search_result;
let leaflet_map;
let load_second;
let route;
let marker_state = {
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
        coordinates:null,
        is_possible: false,
        type: null
    } 
}


var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  


//fuznioni chiamate dal dom
//qua si trovano le funzioni chiamte associate a un'evento
function remove_marker(type) {
    if (marker_state.position.marker ==null && marker_state.position.is_possible ==true && marker_state.position.coordinates !=null && marker_state.position.type==type) {
        marker_state.position.marker = L.marker(marker_state.position.coordinates, {icon: redIcon}).addTo(leaflet_map);
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
    }
    else if (type==="destination") {
        leaflet_map.removeLayer(marker_state.destination.marker);
        marker_state.destination.marker = null;
        if (document.getElementById("destination-show")) {
            document.getElementById("destination-show").remove()
        };
        marker_state.destination.search_result = null;
        marker_state.destination.coordinates = null;
        return search();
    }
    else if (type==="position") {
        leaflet_map.removeLayer(marker_state.position.marker);
        marker_state.position.marker = null;
        marker_state.position.coordinates = null;
    }
}

function on_get_place_start(placeid) {
    let search_result_html_list = document.getElementById("search-result-s");
    console.log(placeid);
    console.log(search_result);
    marker_state.start.search_result.map((item, index)=>{
        if (item.obj_id===placeid) {
            if (check_if_exist([item.latitude, item.longitude])) {
                return
            }
            if (leaflet_map) {
                marker_state.start.marker = L.marker([item.latitude, item.longitude]).addTo(leaflet_map);
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
    marker_state.destination.search_result.map((item, index)=>{

        if (item.obj_id===placeid) {
            if (check_if_exist([item.latitude, item.longitude])) {
                return
            }
            if (leaflet_map) {
                marker_state.destination.marker = L.marker([item.latitude, item.longitude]).addTo(leaflet_map);
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
    if (type==="start") { 
        if (leaflet_map) {
            leaflet_map.removeLayer(marker_state.position.marker);
            marker_state.position.marker=null;
            marker_state.position.type=type;
            marker_state.start.marker = L.marker(pos_coordinates).addTo(leaflet_map);
            marker_state.start.marker.bindPopup(`<b>partenza</b><br /><button onclick="remove_marker('start')">rimuovi</button>`)
        };
        marker_state.start.coordinates = marker_state.position.coordinates
        document.getElementById("start-c").innerHTML = `<h4 id="start-show">partenza: la tua posizione</h4>`;
        return search();
        
    }
    else if (type==="destination") {
        if (leaflet_map) {
            leaflet_map.removeLayer(marker_state.position.marker);
            marker_state.position.marker=null;
            marker_state.position.type=type;
            marker_state.destination.marker = L.marker(pos_coordinates).addTo(leaflet_map);
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
        search_api_result.map((item, index)=>{
            if (item.display_name.includes("Milano")){
            search_result_html_list.innerHTML += `<li id=${item.obj_id}><a href="#" onclick="on_get_place_start(${item.obj_id})">${item.display_name}</a></li>` 
            // aggiungere event listener di ogni eleemnto cercato da scegliere
         } }) 
}}
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
        search_api_result.map((item, index)=>{
            if (item.display_name.includes("Milano")){
            search_result_html_list.innerHTML += `<li id=${item.obj_id}><a href="#" onclick="on_get_place_destination(${item.obj_id})">${item.display_name}</a></li>` 
            // aggiungere event listener di ogni eleemnto cercato da scegliere
         } }) 
}}
}

//funzioni richimate da altre funzioni
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function getapi(){
    return fetch(API)
    .then(data=>data.json())
    
}

function onLoad() {
    let t = new Date()
    load_second = t.getSeconds()
}

function check_if_exist(coord) {
    if (marker_state.start.coordinates) {
    if (coord[0]===marker_state.start.coordinates[0]&&coord[1]===marker_state.start.coordinates[1]) {
        console.log("esiste");
        return true
    }}
    if (marker_state.destination.coordinates) {
    if (coord[0]===marker_state.destination.coordinates[0] && coord[1]===marker_state.destination.coordinates[1]) {
        console.log("esiste");
        return true
    }}
    else {
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
    let json = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2`)
    .then(data=>data.json())
    let result_array = json.map((item,index)=>{
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
    let can_route = () =>{
        if (marker_state.start.coordinates && marker_state.destination.coordinates) {
            return true;
        }
        else {
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
    }
    else {
        route.addTo(leaflet_map);
        route.setWaypoints(waypoints);
    }
}
    else {
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
      function success (pos) {
          coordinates.latitude = pos.coords.latitude;
          coordinates.longitude = pos.coords.longitude;
          resolve(coordinates);
      }

      function fail(error){
          coordinates.error = true;
          resolve(coordinates); 
      }
      navigator.geolocation.getCurrentPosition(success, fail);
    });
}

async function search() { // search funxtion per gestione html
    let pos_list_el = t => {
        if (marker_state.position.coordinates) {
        if (t==="s") {
            return `<li id="my-pos-s"><a href="#" onclick="on_get_place_pos('start')">la tua posizione</a></li>`
        }
        else if(t==="d") {
            return `<li id="my-pos-d"><a href="#" onclick="on_get_place_pos('destination')">la tua posizione</a></li>`
        }
    }
    else {
        return ""
    }
    }
    let old_html_div = document.getElementById("search")
    if (!old_html_div) {
        root.innerHTML += `<div id="search"></div>`
    }
    
    let start_point =()=>{
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
        }
        else {
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
    let destination_point=() =>{
        let destination_c = document.getElementById("destination-c")
        if (!destination_c){
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
        }
        else {
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
        if (!start_form){
            start_point();
        }
        
    }
    else {
        if(start_form) {
            start_form.remove();
        }
    };
    if (!marker_state.destination.marker) {
        if (!destination_form){
            destination_point();
        }
    }
    else {
        if (destination_form) {
            destination_form.remove();
        }
    }
    manage_route();

}


//funzione main
async function main() {
    onLoad();
    
    let h1tag = root.querySelector("#loading");
    h1tag.innerText = "caricamento";
    let geojson = await getapi();
    let map_container = document.createElement("div");
    map_container.id = "leaflet-map";
    body.insertBefore(map_container, root)
    leaflet_map = insert_leaflet_map();
    L.geoJSON(geojson).addTo(leaflet_map)
    let current_pos = await get_user_position();
    if (!current_pos.error) {
        marker_state.position.is_possible = true
        marker_state.position.coordinates = [current_pos.latitude.toString(), current_pos.longitude.toString()]
        marker_state.position.marker = L.marker(marker_state.position.coordinates, {icon: redIcon}).addTo(leaflet_map);
        marker_state.position.marker.bindPopup(`<b>la tua posizione</b>`)
    }
    search();
    h1tag.innerText = "finito";
}

main();

