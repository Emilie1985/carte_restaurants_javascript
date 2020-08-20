function callback(results, status) {
  const carte3 = new Board();
  let selectInf = document.getElementById("selectInf");
  let selectSup = document.getElementById("selectSup");
  let choice_inf = 0;
  let choice_sup = 5;
  const restoAround = [];
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      const newRestoAround = new Restaurant(
        results[i].name,
        results[i].vicinity,
        results[i].geometry.location.lat(),
        results[i].geometry.location.lng(),
        results[i].rating,
        null
      );
      newRestoAround.setUserTotal(results[i].user_ratings_total);
      restoAround.push(newRestoAround);
    }
  }
  carte3.afficherAll(restoAround, choice_inf, choice_sup, map);
}

function initMap() {
  if (google) {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
    });
    navigator.geolocation.getCurrentPosition(function (position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.setCenter(pos);
      const userMarker = new google.maps.Marker({
        position: pos,
        title: "marker",
        icon: "map_pin_icon1.png",
      });
      userMarker.setMap(map),
        function (error) {
          if (error.code == error.PERMISSION_DENIED) {
            console.log("Vous n'avez pas accepté la géolocalisation");
          }
        };
      let request = {
        location: pos,
        radius: "25000",
        type: "restaurant",
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
    });
  }
}
