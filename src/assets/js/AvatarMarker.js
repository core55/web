import Helper from '../../helper/';

export default class AvatarMarker extends google.maps.OverlayView {
  constructor(map, latLng, me, avatar) {
    super();
    this.setMap(map);
    this.latLng = latLng;
    this.me = me;
    this.avatar = avatar;
    this.color = 'black'; //default pin color before update
  }

  onAdd() {
    let div = document.createElement('div');
    div.className = "avatar-marker";

    let triangle = document.createElement('i');
    triangle.className = "avatar-marker-triangle";
    div.appendChild(triangle);

    if (this.me) {
      let span = document.createElement('span');
      span.className = "label";
      span.appendChild(document.createTextNode("YOU"));
      div.appendChild(span);
    } else if (this.avatar) {
      div.style.backgroundImage = 'url(' + this.avatar + ')';
    }
    this.getPanes().overlayMouseTarget.appendChild(div);
    this.div = div;
  }

  draw() {
    var div = this.div;
    var position =  new google.maps.LatLng(this.latLng);
    var overlayProjection = this.getProjection();
    var px = overlayProjection.fromLatLngToDivPixel(position);

    // Resize the image's div to fit the indicated dimensions.
    div.style.left = px.x - 35 +'px';
    div.style.top = px.y - 80 + 'px';
    // div.style.borderRadius = 50 + '%';
  }

  getDiv() {
    return this.div;
  }

  getPosition() {
    return this.latLng;
  }

  setPosition(newPosition) {
    this.latLng = newPosition; //do we have to redraw/force div to move?
    this.draw();
  }

  getColor() {
    return this.color;
  }

  calculateColor(timeSinceLastUpdate) {
    if (timeSinceLastUpdate < 5.1) {
      return '#3ED24C';
    } else if (timeSinceLastUpdate < 20) {
      return '#ffff00';
    } else if (timeSinceLastUpdate > 20) {
      return '#ff0000';
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
      var color = this.calculateColor(timeSinceLastUpdate);
      this.div.style.borderColor = color;
      this.color = color;
    }
  }


}
