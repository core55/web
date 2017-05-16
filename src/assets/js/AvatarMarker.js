import Helper from '../../helper/';

export default class AvatarMarker extends google.maps.OverlayView {
  constructor(map, latLng, me, avatar) {
    super();
    this.setMap(map);
    this.latLng = latLng;
    this.me = me;
    this.avatar = avatar;
  }

  onAdd() {
    let div = document.createElement('div');
    div.className = "avatar-marker";

    let triangle = document.createElement('i');
    triangle.className = "avatar-marker-triangle";
    div.appendChild(triangle);

    if (this.me) {
      let span = document.createElement('span');
      span.appendChild(document.createTextNode("YOU"));
      div.appendChild(span);
    } else if (this.avatar) {
      div.style.backgroundImage = 'url(' + this.avatar + ')';
      div.style.backgroundRepeat = 'none';
      div.style.backgroundPosition = 'center';
    }

    this.getPanes().overlayLayer.appendChild(div);
    this.div = div;
  }

  draw() {
    var div = this.div;
    var position =  new google.maps.LatLng(this.latLng);
    var overlayProjection = this.getProjection();
    var px = overlayProjection.fromLatLngToDivPixel(position);

    // Resize the image's div to fit the indicated dimensions.
    div.style.left = px.x - 35 +'px';
    div.style.top = px.y - 35 + 'px';
    // div.style.borderRadius = 50 + '%';
  }

  getPosition() {
    return this.latLng;
  }


  getColor(timeSinceLastUpdate) {
    if (timeSinceLastUpdate < 5.1) {
      return 'green';
    } else if (timeSinceLastUpdate < 20) {
      return 'yellow';
    } else if (timeSinceLastUpdate > 20) {
      return 'red';
    }
  }

  updateMarkerStyle(user) {
    if (this.me) //if its my pin, then do not update
      return;

    if (user.nickname == null) {
      let span = document.createElement('span');
      span.appendChild(document.createTextNode("?"));
      this.div.appendChild(span); //Have to remove this if user later gets a nickname
    } else {
      var timeSinceLastUpdate = Helper.timeSinceLastUpdate(user.updatedAt);
      var color = this.getColor(timeSinceLastUpdate);
      this.div.style.borderColor = color;
    }
  }


}
