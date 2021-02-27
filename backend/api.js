const fetch = require('node-fetch');
exports.handler = async function() {
    let response = await fetch("https://dati.comune.milano.it/dataset/ceda0264-24f3-4869-9a2d-411906f0abab/resource/56515ac3-e260-4ebb-bfce-698347f07e1e/download/bike_ciclabili.geojson")
    let json_obj = await response.json()
    return {
        statusCode: 200,
        body: JSON.stringify({message: json_obj})
    }; 
}