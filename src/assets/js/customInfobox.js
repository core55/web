/**
 * Created by lqsch on 2017-05-05.
 */


import Helper from '../../helper/index';
//status listener version 2 (fits design)
/** @constructor */

export default class customInfobox extends google.maps.OverlayView {
  constructor(myLatlng, username,status, map,marker) {
    super();
    // Initialize all properties.
    this.marker_=marker;
    this.username_ = username;
    this.status_=status;
    this.myLatlng_ = myLatlng;
    this.content1=null;
    this.content2=null;
    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now
    this.div_ = null;
    // Explicitly call setMap on this overlay.
    this.setMap(map);
  }

  //add the div box into pane
  onAdd() {
    var div = document.createElement('div');
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '2px';
    var color=Helper.getStatus(this.marker_.icon);
    if(color[0]=='green'){
      div.style.borderColor='#3ED24C'
    }else if(color[0]=='yellow'){
      div.style.borderColor='#ffff00'
    }else if(color[0]=='red'){
      div.style.borderColor='#ff0000'
    }else{
      div.style.borderColor='#000000'
    }

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
    this.content1.style.color='#0000';
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
    this.content2.style.color='#0000';
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
    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayImage.appendChild(div);
  }

  //draw out the box
  draw() {
    var overlayProjection = this.getProjection();
    var position = this.myLatlng_;
    if(overlayProjection) {
      var px = overlayProjection.fromLatLngToDivPixel(position);
      //postion
      var div = this.div_;
      div.style.left = px.x + 15 + 'px';
      div.style.top = px.y - 145 + 'px';
      div.style.width = 150 + 'px';
      var cont1height = parseInt(this.content1.style.height, 10);
      var cont2height = parseInt(this.content2.offsetHeight, 10);
      div.style.minHeight = cont1height + cont2height + 20 + 'px';
    }
  }

  //smooth status box
  updateLatLng(nLatlng){
    this.myLatlng_=nLatlng;
  }

  onRemove() {
    this.div_.className="bounce-leave-active";
    this.div_.parentNode.removeChild(this.div_);
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
