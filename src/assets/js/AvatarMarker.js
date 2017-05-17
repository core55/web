import Helper from '../../helper/';
import MarkerHelper from '../../helper/marker';

export default class AvatarMarker extends google.maps.OverlayView {
  constructor(map, latLng, me, user) {
    super();
    this.setMap(map);
    this.latLng = latLng;
    this.me = me;
    this.user = user;
    this.checkUserAvatar();
    this.color = 'black'; //default pin color before update
  }

  onAdd() {
    let div = document.createElement('div');
    div.className = "avatar-marker";

    let triangle = document.createElement('i');
    triangle.className = "avatar-marker-triangle";
    div.appendChild(triangle);

    if (this.me) {
      div.appendChild(MarkerHelper.generateMarkerLabel("You"));
    } else if (this.avatar) {
      div.style.backgroundImage = 'url(' + this.avatar + ')';
    }else if (this.user && this.user.nickname && this.user.nickname != "") {
      div.appendChild(MarkerHelper.generateMarkerLabel(Helper.getMarkerNickname(this.user.nickname)));
    }else {
      div.appendChild(MarkerHelper.generateMarkerLabel("?"));
    }

    this.getPanes().overlayMouseTarget.appendChild(div);
    this.div = div;
  }

  checkUserAvatar() {
    if (this.user == null || typeof this.user == 'undefined') { return; }

    if (this.user.googlePictureURI != null) {
      this.avatar = this.user.googlePictureURI;
      return;
    }

    if (this.user.gravatarURI != null) {
      this.avatar = this.user.gravatarURI;
      return;
    }
  }

  draw() {
    var div = this.div;
    var position =  new google.maps.LatLng(this.latLng);
    var overlayProjection = this.getProjection();
    var px = overlayProjection.fromLatLngToDivPixel(position);

    div.style.left = px.x - 35 +'px';
    div.style.top = px.y - 80 + 'px';
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
      return 'online';
    } else if (timeSinceLastUpdate < 20) {
      return 'recent';
    } else if (timeSinceLastUpdate > 20) {
      return 'idle';
    } else {
      return 'none';
    }
  }

  updateMarkerStyle(user) {
    //if its my pin or div not drawn yet, then do not update
    if (this.me || this.div == null) return;

    this.user = user;
    this.checkUserAvatar();

    var timeSinceLastUpdate = Helper.timeSinceLastUpdate(user.updatedAt);
    this.color = this.calculateColor(timeSinceLastUpdate);
    this.div.className = "avatar-marker avatar-marker-" + this.color;

    if (this.user && this.user.nickname && this.user.nickname != "") {
      let span = this.div.querySelector('.label');

      if (span) {
        span.innerHTML = Helper.getMarkerNickname(this.user.nickname);
      }

      return;
    }

    // todo: update avatar?
  }
}
