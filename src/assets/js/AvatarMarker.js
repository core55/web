export default class AvatarMarker extends google.maps.OverlayView {
  constructor(map, latLng, user) {
    super();
    this.setMap(map);
    this.latLng = latLng;
    this.user = user;
  }

  onAdd() {
    let div = document.createElement('div');
    div.className = "avatar-marker";

    let triangle = document.createElement('i');
    triangle.className = "avatar-marker-triangle";
    div.appendChild(triangle);




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
}
