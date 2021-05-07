
const fs = require("fs");

Array.min = (array) => {
    return Math.min.apply(Math, array);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

//milano (x, y) (9, 45)
const getjson = () => {
    let json_obj = JSON.parse(fs.readFileSync('./data/bike_ciclabili.geojson', 'utf8'));
    return json_obj
}
const jsontor = getjson()

function getNear(mycord, json_obj){

    let final_l = []
    

let list = json_obj.features.map((item, index)=>{
    return {
        id: item.properties.id_amat,
        coordinates: item.geometry.coordinates,
        
    }

})
list.map((item, index)=> {
    item.coordinates[0].map((item, index)=>{
        final_l.push(item)
    })
})
  final_l2 = final_l.map((item, index)=>{
      let lon_d = Math.abs(item[0]-mycord[0])
      let lat_d = Math.abs(item[1]-mycord[1])
      return lon_d + lat_d
  })
  let corrindex = final_l2.indexOf(Array.min(final_l2))
  let coordinate;
  final_l.map((item, index)=>{
      if (index===corrindex) {
          coordinate = item
      }
  })
  let toreturn = [];
  let coorit;
  list.map((item, oindex)=> {
      if (item.coordinates){
        let listint = item.coordinates[0]
        listint.map((nitem, index)=> {
            if (nitem === coordinate) {
                if (index-1!== -1) {
                    toreturn.push(listint[index-1]);
                }
                toreturn.push(listint[index]);
                if (listint.length-1 !== index) {
                toreturn.push(listint[index+1]);
                }
                coorit = json_obj.features[oindex]
            }
        })
      }
      
  })
  if (toreturn.length>2){ 
  toreturn.map((item, index)=>{
      if (item=== coordinate) {
          if (index===0) {
              toreturn = toreturn
          }
          else if (index===1) {
            let d1 = Math.abs(toreturn[0][0]-mycord[0]) + Math.abs(toreturn[0][1]-mycord[1])
            let d2 = Math.abs(toreturn[2][0]-mycord[0]) + Math.abs(toreturn[2][1]-mycord[1])
            if (d1<=d2) {
                toreturn.splice(2,1)
            }
            else if (d2<d1) {
                toreturn.splice(0,1)
            }
          } 
          else if (index===2) {
              toreturn = toreturn
          }
      }
  })}
  else {
      toreturn=toreturn
  }
  let x_a = toreturn[0][0]
  let y_a = toreturn[0][1]
  let x_b = toreturn[1][0] 
  let y_b = toreturn[1][1]
  let x_d = x_b - x_a
  let y_d = y_b - y_a
  let coe = y_d / x_d
  let new_point = []
  let x_c =x_a
  let y_c
  let n_push = parseInt(Math.abs(x_d / 0.0002))
  for (let n=1; n<=n_push-1; n++) {
  if (x_a < x_b) {// x_a < x_c < x_b
    x_c = x_c + 0.0002
  } 
  else if (x_a > x_b) {
      x_c = x_c + (-1 *0.0002)
  }
  else if (x_a=== x_b) {
      x_c = null
  }
  if (x_c) {
      y_c = coe*(x_c- x_a) + y_a
  }
  new_point.push([x_c, y_c])
}
new_point = new_point.concat(toreturn)
  let new_point2 = new_point.map((item, index)=>{
    let x_dif = Math.abs(item[0]-mycord[0])
    let y_dif = Math.abs(item[1]-mycord[1])
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
//0.00025225872844814035


console.log(getNear([9.162780099999999, 45.5076738], jsontor))