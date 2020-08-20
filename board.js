class Board {
  //Ouverture d'une pop up
  popUp(titre, div, note, avis, resto) {
    $(note).val("");
    $(avis).val("");
    $(resto).val("");
    $("#newDiv").empty();
    $(div).dialog({
      appendTo: "#newDiv",
      dialogClass: "no-close",
      modal: true,
      autoOpen: false,
      title: titre,
      buttons: [
        {
          text: "Annuler",
          click: function () {
            $(this).dialog("close");
            $("main").css("opacity", 1);
            $("#newDiv").empty();
          },
        },
      ],
      open: function () {
        $(this).append(div);
        $("main").css("opacity", 0.5);
      },
    });
    $(div).dialog("open");
    $("main").css("opacity", 0.5);
  }

  //Fonction pour trouver une addresse à partir de coordonnées
  getAddress(lat, long) {
    return new Promise(function (resolve, reject) {
      const url =
        "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        lat +
        "," +
        long +
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

  //Fonction pour ajouter un nouveau restaurant au clic sur la carte
  clickAddResto(liste, lat, long, div, note, avis, resto, bouton) {
    div.innerHTML = "";
    $(div)
      .append("Nom du restaurant : ")
      .append(resto)
      .append("</br>Latitude : ")
      .append(lat)
      .append("</br>Longitude : ")
      .append(long)
      .append("</br>Votre note / 5 : ")
      .append(note)
      .append("</br>Votre avis : </br>")
      .append(avis)
      .append("</br></br>")
      .append(bouton)
      .css("margin-top", "40px")
      .css("line-height", "40px");
    this.popUp("Ajouter un nouveau restaurant", div, note, avis, resto);
  }
  //Fonction executée à chaque changement
  change(liste, choice_inf, choice_sup, listeMarqueurs, carte) {
    $("#liste").empty();
    $.each(liste, function (i) {
      liste[i].restaurantName = liste[i].restaurantName.replace(/ /g, "_");
      liste[i].newMarqueur(choice_inf, choice_sup, listeMarqueurs, carte);
      liste[i].afficher(choice_inf, choice_sup);
    });
    let that = this;
    const inputResto = document.createElement("input");
    inputResto.setAttribute("type", "texte");
    inputResto.setAttribute("placeholder", "Nom du restaurant");
    const inputNote = document.createElement("input");
    inputNote.setAttribute("type", "number");
    inputNote.setAttribute("min", "0");
    inputNote.setAttribute("max", "5");
    const inputAvis = document.createElement("textarea");
    inputAvis.setAttribute("cols", 30);
    inputAvis.setAttribute("rows", 10);
    inputAvis.setAttribute("placeholder", "Votre avis");
    const submit1 = document.createElement("input");
    submit1.setAttribute("type", "submit");
    submit1.setAttribute("id", "submit");
    submit1.setAttribute("value", "Creer l'avis sur le nouveau restaurant");
    map.addListener("click", function (e) {
      const newRestoDiv = document.createElement("div");
      that.clickAddResto(
        liste,
        e.latLng.lat(),
        e.latLng.lng(),
        newRestoDiv,
        inputNote,
        inputAvis,
        inputResto,
        submit1
      );

      submit1.onclick = function () {
        if (
          isNaN(parseInt(inputNote.value)) ||
          inputNote.value < 0 ||
          inputNote.value > 5
        ) {
          alert("La note doit être un chiffre entre 0 et 5");
        } else {
          $(newRestoDiv).dialog("close");
          $("main").css("opacity", 1);
          const nomSansTiret = inputResto.value.replace(/ /g, "_");
          let newResto = new Restaurant(
            nomSansTiret,
            null,
            e.latLng.lat(),
            e.latLng.lng(),
            parseInt(inputNote.value),
            inputAvis.value
          );
          newResto.user_ratings_total = 1;
          const pos = {
            lat: e.latLng.lng(),
            lng: e.latLng.lng(),
          };
          const newRestoMarqueur = new google.maps.Marker({
            position: pos,
          });
          let newAddress = that.getAddress(e.latLng.lat(), e.latLng.lng());
          newAddress
            .then(function (adresse) {
              newResto.address = adresse;
              liste.push(newResto);
              that.change(liste, choice_inf, choice_sup, listeMarqueurs, carte);
            })
            .catch(function (error) {
              console.log("error");
            });
        }
      };
    });
    $(".bouton_ajouter").click(function () {
      //Fonction pour trouver un restaurant avec son nom
      let resto;
      function findResto(restaurantR) {
        return restaurantR.restaurantName == resto;
      }
      resto = $(this).parent().attr("id");
      let restoObj = liste.find(findResto);
      const newRattingDiv = document.createElement("div");
      const submit = document.createElement("input");
      submit.setAttribute("type", "submit");
      submit.setAttribute("id", "submit");
      submit.setAttribute("value", "Envoyer l'avis");
      restoObj.clickAddRating(
        newRattingDiv,
        inputNote,
        inputAvis,
        submit,
        that
      );
      submit.onclick = function () {
        if (
          isNaN(parseInt(inputNote.value)) ||
          inputNote.value < 0 ||
          inputNote.value > 5
        ) {
          alert("La note doit être un chiffre entre 0 et 5");
        } else {
          $(newRattingDiv).dialog("close");
          $("main").css("opacity", 1);
          restoObj.clickSendRating(inputNote.value, inputAvis.value);
          that.change(liste, choice_inf, choice_sup, listeMarqueurs, carte);
        }
      };
    });
  }

  //Fonction qui affiche tous les restaurants d'une liste
  afficherAll(liste, choice_inf, choice_sup, carte) {
    let restoMarkerList = [];
    //Selection par les listes déroulantes
    this.change(liste, choice_inf, choice_sup, restoMarkerList, carte);
    let that = this;
    selectInf.onchange = function () {
      for (let k = 0; k < restoMarkerList.length; k++) {
        restoMarkerList[k].setMap(null);
      }
      restoMarkerList = [];
      choice_inf = parseInt(selectInf.options[selectInf.selectedIndex].value);
      if (choice_inf > choice_sup) {
        alert("Attention le premier chiffre doit être inférieur au second");
      } else {
        that.change(liste, choice_inf, choice_sup, restoMarkerList, carte);
      }
    };
    selectSup.onchange = function () {
      for (let k = 0; k < restoMarkerList.length; k++) {
        restoMarkerList[k].setMap(null);
      }
      restoMarkerList = [];
      choice_sup = parseInt(selectSup.options[selectSup.selectedIndex].value);
      if (choice_inf > choice_sup) {
        alert("Attention le premier chiffre doit être inférieur au second");
      } else {
        that.change(liste, choice_inf, choice_sup, restoMarkerList, carte);
      }
    };
  }
}
