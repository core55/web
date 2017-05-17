/**
 * Created by lqsch on 2017-05-05.
 */


import Helper from '../../helper/index';
//status listener version 2 (fits design)
/** @constructor */

export default class customInfobox extends google.maps.OverlayView {
  constructor(userInformation) {
    super();
    this.marker_= userInformation.marker;
    this.username_ = userInformation.nickname;
    this.status_= '"' + (userInformation.status || 'No status') + '"';
    this.myLatlng_ = new google.maps.LatLng(userInformation.marker.getPosition().lat, userInformation.marker.getPosition().lng);
    this.content1=null;
    this.content2=null;
    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now
    this.div_ = null;
    // Explicitly call setMap on this overlay.
    this.setMap(userInformation.marker.map);
  }

  //add the div box into pane
  onAdd() {
    var div = document.createElement('div');
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '2px';
    div.style.borderColor = this.marker_.getColor();
    div.style.borderRadius='20px'
    div.style.position = 'absolute';
    div.style.background='#FFFFFF';
    div.style.zIndex='9999'
    div.setAttribute("id", 'infobox');
    div.setAttribute("v-if", 'show');
    div.setAttribute("v-animation",'')
    div.className="bounce-enter-active"
    // Create the img element and attach it to the div.
     this.content1 = document.createElement('p');
    var u = document.createTextNode(this.username_);
    this.content2= document.createElement('p');
    var s =document.createTextNode(this.status_);
    //name
    this.content1.style.position = 'absolute';
    this.content1.style.fontSize='15px';
    this.content1.style.top=7+'px';
    this.content1.style.left=13+'px';
    this.content1.style.letterSpacing='0';
    this.content1.style.height='30px';
    this.content1.style.fontFamily= 'Arial-BoldMT';
    this.content1.style.fontWeight="Bold"
    this.content1.appendChild(u);
    //status
    this.content2.style.position = 'absolute';
    this.content2.style.fontSize='13px';
    this.content2.style.top=26+'px';
    this.content2.style.left=13+'px';
    this.content2.style.letterSpacing='0';
    this.content2.style.width= 120+ 'px';
    this.content2.style.minHeight='30px';
    this.content2.style.fontFamily= 'Arial';
    this.content2.style.fontWeight="Bold"
    this.content2.appendChild(s);
    div.appendChild(this.content1);
    div.appendChild(this.content2);
    this.div_ = div;
    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
  }

  //draw out the box
  draw() {
    var overlayProjection = this.getProjection();
    var position = this.myLatlng_;
    if(overlayProjection) {
      var px = overlayProjection.fromLatLngToDivPixel(position);
      var div = this.div_;
      div.style.left = px.x + 25 + 'px';
      div.style.top = px.y - 130 + 'px';
      div.style.width = 150 + 'px';
      var cont1height = parseInt(this.content1.style.height, 10);
      var cont2height = parseInt(this.content2.offsetHeight, 10);
      div.style.minHeight = cont1height + cont2height + 20 + 'px';
      // console.log("Positioned info window");
    }
  }

  //smooth status box
  updateLatLng(nLatlng){
    this.myLatlng_=nLatlng;
  }

  onRemove() {
    this.div_.className="bounce-leave-active";
    let app =this;
    setTimeout(function () {
      app.div_.parentNode.removeChild(app.div_);
    }, 500);

  }

  //not useful
  hide() {
    if (this.div_) {
      // The visibility property must be a string enclosed in quotes.
      this.div_.setAttribute("v-if", "!show");
      this.div_.className="bounce-leave-active";
    }
  }

  //not useful
  show() {
    if (this.div_) {
      this.div_.setAttribute("v-if", "show");
      this.div_.className="bounce-enter-active";
    }
  }

  //not useful (further expierment required)
  toggle()  {
    if (this.div_) {
    }
  };
}
