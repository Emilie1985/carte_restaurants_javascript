class Restaurant {
  constructor(restaurantName, address, lat, long, stars, comments) {
    this.restaurantName = restaurantName;
    this.address = address;
    this.lat = lat;
    this.long = long;
    this.stars = stars;
    this.comments = comments;
    this.ratings = [{ stars: this.stars, comments: this.comments }];
    this.user_ratings_total = 0;
  }
  setUserTotal(newUserTotal) {
    this.user_ratings_total = newUserTotal;
  }
  moyenne() {
    let total = this.ratings[0].stars * this.user_ratings_total;
    for (let j = 1; j < this.ratings.length - 1; j++) {
      total += this.ratings[j + 1].stars;
      console.log(this.restaurantName + total);
    }
    return (
      Math.round(
        (total / (this.user_ratings_total + this.ratings.length - 1)) * 10
      ) / 10
    );
  }
  //Création du bouton pour ajouter un avis
  setButton() {
    const boutonRating = document.createElement("input");
    boutonRating.setAttribute("type", "submit");
    boutonRating.setAttribute("class", "bouton_ajouter");
    boutonRating.setAttribute("value", "Ajouter un avis");
    $("li").last().append(boutonRating);
  }
  afficher(inf, sup) {
    if (this.moyenne() >= inf && this.moyenne() <= sup) {
      const nomSansTiret = this.restaurantName.replace(/_/g, " ");
      let descri =
        "<li id=" +
        this.restaurantName +
        " >Nom : " +
        nomSansTiret +
        " </br>Adresse : " +
        this.address +
        " <br></li>Moyenne des avis : " +
        this.moyenne() +
        " sur 5 <br><br>";
      $("#liste").append(descri);
      this.setButton();
    }
  }
  newMarqueur(choice_inf, choice_sup, listeMarqueurs, carte) {
    const pos = {
      lat: this.lat,
      lng: this.long,
    };
    let marqueur = new google.maps.Marker({
      position: pos,
    });
    listeMarqueurs.push(marqueur);
    if (this.moyenne() >= choice_inf && this.moyenne() <= choice_sup) {
      marqueur.setMap(carte);
    }
    //Au clic sur un marqueur afficher les infos du restaurant
    let that = this;
    const listAvis = [];
    marqueur.addListener("click", function () {
      const nomSansTiret = that.restaurantName.replace(/_/g, " ");
      const avis = that.ratings.map((avis) => {
        if (avis.comments) {
          listAvis.push(avis.comments);
        }
        return listAvis;
      });
      let infoWindow = new google.maps.InfoWindow({
        content:
          "<h1 id='info_title'>" +
          nomSansTiret +
          "</h1>" +
          "<p> Moyenne des avis : " +
          that.moyenne() +
          "</br>" +
          listAvis.join("</br>"),
        position: { lat: that.lat, lng: that.long },
      });
      infoWindow.setMap(carte);
      //Afficher la streetView
      let panorama = new google.maps.StreetViewPanorama(
        document.getElementById("picture"),
        {
          position: { lat: that.lat, lng: that.long },
          pov: {
            heading: 34,
            pitch: 10,
          },
        }
      );
      carte.setStreetView(panorama);
    });
  }
  //Fonction pour trouver une addresse à partir de coordonnées
  getAddress() {
    return new Promise(function (resolve, reject) {
      const url =
        "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        this.lat +
        "," +
        this.long +
        "&key=";
      let addresse;
      $.getJSON(url, function (result, statut) {
        addresse = result.results[0].formatted_address;
        if (statut == "success") {
          resolve(addresse);
        } else {
          reject("échec de la requête");
        }
      });
    });
  }

  //Au clic sur le bouton nouvel avis rédaction d'un nouvel avis
  clickSendRating(note, avis) {
    const newRating = { stars: parseInt(note), comments: avis };
    this.ratings.push(newRating);
  }
  clickAddRating(divAvis, note, avis, bouton, board) {
    divAvis.innerHTML = "";
    $(divAvis)
      .append("Votre note / 5 : ")
      .append(note)
      .append("</br>Votre avis : </br>")
      .append(avis)
      .append("</br></br>")
      .append(bouton)
      .css("margin-top", "40px")
      .css("line-height", "40px");
    const nomSansTiret = this.restaurantName.replace(/_/g, " ");
    board.popUp(
      "Ajouter un nouvel avis pour le restaurant : " + nomSansTiret,
      divAvis
    );
  }
}
