const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/', async (req, res) => {
    let response = await fetch("https://dati.comune.milano.it/dataset/ceda0264-24f3-4869-9a2d-411906f0abab/resource/56515ac3-e260-4ebb-bfce-698347f07e1e/download/bike_ciclabili.geojson")
    let json_obj = await response.json()
  res.status(200).send(json_obj)
});
const PORT = 80;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});