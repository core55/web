/**
 * Created by lqsch on 2017-05-05.
 */




//status listener version 2 (fits design)
/** @constructor */

export default class customInfobox extends google.maps.OverlayView {
  constructor(myLatlng, username,status, map) {
    super();
    // Initialize all properties.
    this.username_ = username;
    this.status_=status;
    this.myLatlng_ = myLatlng;
    this.content1=null;
    this.content2=null;
    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now
    this.div_ = null;
    this.element = null;
    // Explicitly call setMap on this overlay.
    this.setMap(map);
  }

  //add the div box into pane
  onAdd() {
    var div = document.createElement('div');
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '4px';
    div.style.borderColor='#3ED24C'
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
    this.content1.style.height=30+ 'px';
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
    this.content2.style.width= 140+ 'px';
    this.content2.style.height=30+ 'px';
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
    var px = overlayProjection.fromLatLngToDivPixel(position);
    //postion
    var div = this.div_;
    div.style.left = px.x+16+ 'px';
    div.style.top = px.y -128+ 'px';
    div.style.width = 150 + 'px';
    div.style.minHeight = 60+ 'px';
    this.element=document.getElementById(this.div_.id);
  }

  onRemove() {
    this.div_.className="bounce-leave-active";
    this.div_.parentNode.removeChild(this.div_);
    // this.div_ = null;
  }

  //not useful
  hide() {
    if (this.div_) {
      // The visibility property must be a string enclosed in quotes.
      this.div_.setAttribute("v-if", "!show");
      this.div_.className="bounce-leave-active";
      console.log(this.div_);
    }
  }

 //not useful
  show() {
    if (this.div_) {
      this.div_.setAttribute("v-if", "show");
      this.div_.className="bounce-enter-active";
      console.log(this.div_);
    }
  }

 //not useful (further expierment required)
  toggle()  {
    if (this.div_) {
      this.element.setAttribute("v-if", "show=!show");
      console.log(this.div_);
    }
  };
}
