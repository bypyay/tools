
// Ã¢â€â‚¬Ã¢â€â‚¬ POLYFILLS Ã¢â€â‚¬Ã¢â€â‚¬
// roundRect polyfill for Safari/Firefox older versions
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    if(w<2*r)r=w/2;if(h<2*r)r=h/2;
    this.beginPath();
    this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);
    this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);
    this.arcTo(x,y,x+w,y,r);this.closePath();
    return this;
  };
}
// STATE
let canvasW=800,canvasH=800,zoom=1;
let currentTemplate=null,cells=[],photos=[];
let selectedCell=null,selectedText=null;
let gap=8,borderRadius=0,bgColor='#ffffff';
let globalFilter='none',glBright=100,glSat=100;
let globalShadow=2;
let _txtFont="'Outfit',sans-serif",_txtClr='#ffffff';
let _txtBold=false,_txtItalic=false,_txtShadow=true,_txtBg=false;
let history=[],historyIdx=-1;
let showBorders=false,showWm=false;

// ══════════════════════════════════════════════════════════════════
// FABRIC.JS TEXT LAYER
// Text elements live on a Fabric canvas overlaid on #collage-canvas. The editor IS
// the canvas, so the bytes you see are the bytes that get exported — no two-renderer
// mismatch. Photos and shapes remain DOM elements for now; the Fabric canvas sits on
// top with pointer-events toggled dynamically so clicks on empty space fall through.
// ══════════════════════════════════════════════════════════════════
let fabricCanvas=null;

function initFabricLayer(){
  if(fabricCanvas||typeof fabric==='undefined')return;
  const el=document.getElementById('fabric-text-layer');
  if(!el)return;
  // Quality knobs:
  //   enableRetinaScaling — ups the drawing buffer to devicePixelRatio so glyph edges
  //     stay sharp on hi-DPI displays (default true in Fabric 5+ but explicit here).
  //   imageSmoothingEnabled — true so any glyph cache resampling stays smooth.
  //   devicePixelRatio override — Fabric reads window.devicePixelRatio at construction.
  fabricCanvas=new fabric.Canvas(el,{
    width:canvasW,
    height:canvasH,
    backgroundColor:'transparent',
    preserveObjectStacking:true,
    selection:true,
    fireRightClick:false,
    stopContextMenu:false,
    enableRetinaScaling:true,
    imageSmoothingEnabled:true,
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Custom delete control: a red × button at the top-right of every selected text.
  // Click removes the object; Fabric's built-in corner controls (resize / rotate)
  // remain intact.
  const renderDeleteIcon=(ctx,left,top,styleOverride,fabricObj)=>{
    const size=22;
    ctx.save();
    ctx.translate(left,top);
    // Circle background
    ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);
    ctx.fillStyle='#e05252';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    // X mark
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.lineCap='round';
    const r=size*.22;
    ctx.beginPath();
    ctx.moveTo(-r,-r);ctx.lineTo(r,r);
    ctx.moveTo(r,-r);ctx.lineTo(-r,r);
    ctx.stroke();
    ctx.restore();
  };
  const deleteControl=new fabric.Control({
    x:0.5,
    y:-0.5,
    offsetX:16,
    offsetY:-16,
    cursorStyle:'pointer',
    mouseUpHandler:(eventData,transform)=>{
      const target=transform.target;
      const canvas=target.canvas;
      canvas.remove(target);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      if(selectedElem&&selectedElem.__fabric===target){
        selectedElem=null;
        if(typeof updateRightPanel==='function')updateRightPanel(null);
      }
      if(typeof saveHistory==='function')saveHistory();
      return true;
    },
    render:renderDeleteIcon,
    cornerSize:22,
  });
  // Apply to all IText / Textbox instances.
  fabric.IText.prototype.controls.deleteControl=deleteControl;
  if(fabric.Textbox)fabric.Textbox.prototype.controls.deleteControl=deleteControl;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Stamp-style border + padding + background Ã¢â€â‚¬Ã¢â€â‚¬
  // Fabric IText doesn't support CSS-style box decorations. We override the IText
  // render so any object with __border / __padding / __bgColor / __borderRadius
  // gets a rectangle drawn around the text in object-local coordinates.
  if(!fabric.IText.prototype.__borderHookInstalled){
    const origRender=fabric.IText.prototype._render;
    fabric.IText.prototype._render=function(ctx){
      const pad=this.__padding||{top:0,right:0,bottom:0,left:0};
      const hasBox=this.__bgColor||(this.__border&&this.__border.width>0);
      if(hasBox){
        // Draw box behind the text. Coordinates are object-local with origin at the
        // object's center (Fabric pre-translates before _render).
        const w=this.width+pad.left+pad.right;
        const h=this.height+pad.top+pad.bottom;
        const x=-w/2+(pad.left-pad.right)/2;
        const y=-h/2+(pad.top-pad.bottom)/2;
        const r=this.__borderRadius||0;
        ctx.save();
        ctx.beginPath();
        if(r>0&&typeof ctx.roundRect==='function'){
          ctx.roundRect(x,y,w,h,r);
        }else{
          ctx.rect(x,y,w,h);
        }
        if(this.__bgColor){ctx.fillStyle=this.__bgColor;ctx.fill();}
        if(this.__border&&this.__border.width>0){
          ctx.strokeStyle=this.__border.color||'#000';
          ctx.lineWidth=this.__border.width;
          ctx.stroke();
        }
        ctx.restore();
      }
      origRender.call(this,ctx);
    };
    fabric.IText.prototype.__borderHookInstalled=true;
  }
  // Ã¢â€â‚¬Ã¢â€â‚¬ Fabric 5.1.0 textBaseline typo workaround Ã¢â€â‚¬Ã¢â€â‚¬
  // Inside fabric.min.js, _setTextStyles assigns ctx.textBaseline = 'alphabetical'
  // — a typo for the valid HTML5 Canvas value 'alphabetic'. Older Chrome silently
  // coerced it; current Chrome (April 2026+) throws a CanvasTextBaseline enum
  // validation error after every text render. We wrap the 2D-context setter so
  // the bad value is quietly remapped to 'alphabetic' before it hits the engine.
  if(!window.__fabricBaselineFixed){
    const proto=CanvasRenderingContext2D.prototype;
    const desc=Object.getOwnPropertyDescriptor(proto,'textBaseline');
    if(desc&&desc.set&&desc.get){
      Object.defineProperty(proto,'textBaseline',{
        configurable:true,
        get(){return desc.get.call(this);},
        set(v){desc.set.call(this,v==='alphabetical'?'alphabetic':v);},
      });
    }
    window.__fabricBaselineFixed=true;
  }
  // The Fabric canvas sits on top of photos/shapes. Toggle pointer-events so clicks on
  // empty space pass through to DOM layers below. Listen on document so we get updates
  // even while pointer-events is 'none' on the upper-canvas.
  const updatePointerEvents=(clientX,clientY)=>{
    if(!fabricCanvas)return;
    const upper=fabricCanvas.upperCanvasEl;
    if(!upper)return;
    // While the user is drawing a rubber-band selection, leave the upper-canvas
    // transparent so the drag can sweep across Fabric text without Fabric stealing it.
    if(typeof _rubberBand!=='undefined'&&_rubberBand){upper.style.pointerEvents='none';return;}
    const active=fabricCanvas.getActiveObject();
    if(active&&active.isEditing){upper.style.pointerEvents='auto';return;}
    const rect=upper.getBoundingClientRect();
    if(rect.width===0)return;
    const scaleX=fabricCanvas.width/rect.width;
    const scaleY=fabricCanvas.height/rect.height;
    const px=(clientX-rect.left)*scaleX;
    const py=(clientY-rect.top)*scaleY;
    // Hit-test against each Fabric object's bounding rect (includes small padding for handles)
    const pad=active?30:6;
    let hit=false;
    for(const obj of fabricCanvas.getObjects()){
      if(!obj.visible)continue;
      const b=obj.getBoundingRect(true,true);
      if(px>=b.left-pad&&px<=b.left+b.width+pad&&py>=b.top-pad&&py<=b.top+b.height+pad){hit=true;break;}
    }
    upper.style.pointerEvents=hit?'auto':'none';
  };
  document.addEventListener('mousemove',e=>updatePointerEvents(e.clientX,e.clientY),true);
  document.addEventListener('touchmove',e=>{if(e.touches[0])updatePointerEvents(e.touches[0].clientX,e.touches[0].clientY);},true);
  // On mobile there's no continuous mousemove to keep upper-canvas pointer-events in
  // sync, so the very first tap on a Fabric text would land on whatever DOM element
  // sits underneath (usually a cell, which then opens the file picker). Update at
  // touchstart too so subsequent touches in the same gesture flow correctly. The
  // current touch's target is already locked by the OS hit-test; the cell handlers
  // below use `fabricObjectAt` as a safety net to bail when the touch is actually
  // over a Fabric text.
  document.addEventListener('touchstart',e=>{if(e.touches[0])updatePointerEvents(e.touches[0].clientX,e.touches[0].clientY);},true);

  // Selection lifecycle → bridge to existing right-panel infrastructure.
  fabricCanvas.on('selection:created',e=>onFabricSelectionChange(e.selected?.[0]||fabricCanvas.getActiveObject()));
  fabricCanvas.on('selection:updated',e=>onFabricSelectionChange(e.selected?.[0]||fabricCanvas.getActiveObject()));
  fabricCanvas.on('selection:cleared',()=>onFabricSelectionChange(null));

  // Persist to history on meaningful Fabric mutations.
  //   object:modified — single discrete event at end of move/resize/rotate; record
  //                     immediately (no debounce) so each gesture is one entry.
  //   object:added / object:removed — also discrete; immediate.
  //   text:changed — fires on every keystroke during inline edit; debounce so a typing
  //                  burst collapses into one entry.
  const immediateSave=()=>{if(_suppressHistory)return;if(typeof saveHistory==='function')saveHistory();};
  const debouncedTextSave=()=>{if(_suppressHistory)return;if(typeof debouncedSave==='function')debouncedSave();else if(typeof saveHistory==='function')saveHistory();};
  fabricCanvas.on('object:modified',immediateSave);
  fabricCanvas.on('object:added',immediateSave);
  fabricCanvas.on('object:removed',immediateSave);
  fabricCanvas.on('text:changed',debouncedTextSave);
}

function resizeFabricLayer(w,h){
  if(!fabricCanvas)return;
  fabricCanvas.setWidth(w);
  fabricCanvas.setHeight(h);
  fabricCanvas.requestRenderAll();
}

// Hit-test the Fabric layer at viewport coordinates. Returns the topmost visible
// Fabric object whose padded bounding box contains the point, or null.
// Used by cell touch/mouse handlers as a safety net so taps that visually land
// on Fabric text don't fall through to the cell underneath (which would open the
// file picker on mobile, where pointer-events haven't been pre-armed by hover).
function fabricObjectAt(clientX,clientY){
  if(!fabricCanvas||!fabricCanvas.upperCanvasEl)return null;
  const rect=fabricCanvas.upperCanvasEl.getBoundingClientRect();
  if(rect.width===0)return null;
  const sx=fabricCanvas.width/rect.width, sy=fabricCanvas.height/rect.height;
  const px=(clientX-rect.left)*sx, py=(clientY-rect.top)*sy;
  const objs=fabricCanvas.getObjects();
  // Bigger pad on touch devices so fingers can land on small text without
  // missing into the underlying cell.
  const pad=(typeof isMobile==='function'&&isMobile())?16:6;
  for(let i=objs.length-1;i>=0;i--){
    const obj=objs[i];
    if(!obj.visible)continue;
    const b=obj.getBoundingRect(true,true);
    if(px>=b.left-pad&&px<=b.left+b.width+pad&&py>=b.top-pad&&py<=b.top+b.height+pad)return obj;
  }
  return null;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ CSS-to-Fabric translator Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Maps CSS text properties (used throughout templates/style-picker) to Fabric IText
// options. Handles shadow, -webkit-text-stroke, letter-spacing, line-height, alignment.
function cssStyleToFabricProps(cssStyle){
  const s=cssStyle||{};
  const props={};
  if(s.fontSize)props.fontSize=parseFloat(s.fontSize)||36;
  if(s.fontFamily){props.fontFamily=s.fontFamily.replace(/['"]/g,'').split(',')[0].trim();}
  if(s.fontWeight)props.fontWeight=s.fontWeight;
  if(s.fontStyle)props.fontStyle=s.fontStyle;
  if(s.color&&s.color!=='transparent'&&s.color!=='rgba(0, 0, 0, 0)'&&s.color!=='rgba(0,0,0,0)')props.fill=s.color;
  else if(s.color)props.fill='rgba(0,0,0,0)';
  if(s.textAlign)props.textAlign=s.textAlign;
  if(s.letterSpacing){
    // Fabric uses charSpacing (units = 1/1000 em). Convert px → em via font size.
    const ls=parseFloat(s.letterSpacing)||0;
    const fs=parseFloat(s.fontSize)||36;
    if(fs>0)props.charSpacing=Math.round((ls/fs)*1000);
  }
  if(s.lineHeight){
    const lh=s.lineHeight==='normal'?1.16:parseFloat(s.lineHeight);
    if(!isNaN(lh))props.lineHeight=lh>5?lh/(parseFloat(s.fontSize)||36):lh;
  }
  if(s.textDecoration){
    if(s.textDecoration.includes('underline'))props.underline=true;
    if(s.textDecoration.includes('line-through'))props.linethrough=true;
    if(s.textDecoration.includes('overline'))props.overline=true;
  }
  if(s.textShadow&&s.textShadow!=='none'){
    // Parse first shadow only (Fabric supports single shadow per object).
    // Format: "offsetX offsetY blur color" — color may be rgba() or hex.
    const str=s.textShadow.trim();
    const colorRe=/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/;
    const colorMatch=str.match(colorRe);
    const color=colorMatch?colorMatch[0]:'rgba(0,0,0,0.5)';
    const numRe=/-?[\d.]+/g;
    const rest=str.replace(colorRe,'');
    const nums=(rest.match(numRe)||[]).map(parseFloat);
    props.shadow=new fabric.Shadow({
      color,
      offsetX:nums[0]||0,
      offsetY:nums[1]||0,
      blur:nums[2]||0,
    });
  }
  const stroke=s.webkitTextStroke||s.textStroke;
  if(stroke){
    const m=stroke.match(/([\d.]+)px\s+(.+)/);
    if(m){props.strokeWidth=parseFloat(m[1]);props.stroke=m[2].trim();props.paintFirst='stroke';}
  }
  if(s.textTransform==='uppercase')props.__textTransform='uppercase';
  else if(s.textTransform==='lowercase')props.__textTransform='lowercase';
  if(s.opacity)props.opacity=parseFloat(s.opacity);
  // Border + padding (used by the Stamp preset). Fabric IText has no native border,
  // so we stash the values on custom props and the prototype _render override
  // (installed in initFabricLayer) draws them around the text.
  if(s.border){
    const m=String(s.border).match(/([\d.]+)px\s+(?:solid\s+)?(.+)/);
    if(m)props.__border={width:parseFloat(m[1])||1,color:(m[2]||'#000').trim()};
  }
  if(s.padding!=null){
    // Accept "8px" / "8px 14px" / "8px 14px 8px 14px" / number
    const parts=String(s.padding).trim().split(/\s+/).map(p=>parseFloat(p)||0);
    let t,r,b,l;
    if(parts.length===1)t=r=b=l=parts[0];
    else if(parts.length===2){t=b=parts[0];r=l=parts[1];}
    else if(parts.length===3){t=parts[0];r=l=parts[1];b=parts[2];}
    else{t=parts[0];r=parts[1];b=parts[2];l=parts[3];}
    props.__padding={top:t,right:r,bottom:b,left:l};
  }
  if(s.borderRadius)props.__borderRadius=parseFloat(s.borderRadius)||0;
  if(s.background||s.backgroundColor){
    const bg=s.backgroundColor||s.background;
    if(bg&&bg!=='transparent'&&bg!=='none')props.__bgColor=bg;
  }
  return props;
}

function applyTextTransform(text,transform){
  if(transform==='uppercase')return text.toUpperCase();
  if(transform==='lowercase')return text.toLowerCase();
  return text;
}

// Create & add a Fabric IText at a canvas position. align controls how (x,y) maps to
// the text's origin: 'center' centers horizontally on x; 'right' right-aligns to x;
// default places the left edge at x.
// opts.autoSelect (default true): when false, the text is added without selecting it.
// Use false when bulk-adding text from a template — selecting every text on load
// shows handles + delete control on each one which clutters the canvas.
function addFabricTextAt(text,cssStyle,x,y,align,opts){
  if(!fabricCanvas)initFabricLayer();
  if(!fabricCanvas)return null;
  const props=cssStyleToFabricProps(cssStyle);
  const textTransform=props.__textTransform;
  delete props.__textTransform;
  const displayText=applyTextTransform(text,textTransform);
  const originX=align==='center'?'center':align==='right'?'right':'left';
  const it=new fabric.IText(displayText,Object.assign({
    left:x,
    top:y,
    originX,
    originY:'top',
    angle:(opts&&opts.angle)||0,
    lockUniScaling:false,
    editable:true,
    // Re-render text vectorially every frame instead of caching a bitmap. Fabric's
    // default object cache lets text get pixelated when the canvas is zoomed; turning
    // it off keeps glyph edges crisp at any zoom level (small cost: redraw per frame
    // for active edits — negligible for a handful of text layers).
    objectCaching:false,
    statefullCache:false,
    noScaleCache:true,
  },props));
  // Stash the CSS text-transform so re-edits and exports stay consistent.
  if(textTransform)it.__textTransform=textTransform;
  fabricCanvas.add(it);
  const autoSelect=!opts||opts.autoSelect!==false;
  if(autoSelect){
    fabricCanvas.setActiveObject(it);
    fabricCanvas.requestRenderAll();
    // setActiveObject doesn't always fire selection:created — call the bridge directly
    // so the right panel shows properties for freshly-added text.
    onFabricSelectionChange(it);
  }else{
    fabricCanvas.requestRenderAll();
  }
  return it;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Layer ops for Fabric text (called from the right panel) Ã¢â€â‚¬Ã¢â€â‚¬
function deleteTextLayer(){
  if(selectedElem?.__fabric&&fabricCanvas){
    fabricCanvas.remove(selectedElem.__fabric);
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
    selectedElem=null;
    if(typeof updateRightPanel==='function')updateRightPanel(null);
    if(typeof saveHistory==='function')saveHistory();
    return;
  }
  if(selectedElem&&typeof selectedElem.remove==='function'){
    selectedElem.remove();
    selectedElem=null;
    if(typeof updateRightPanel==='function')updateRightPanel(null);
    if(typeof saveHistory==='function')saveHistory();
  }
}
function duplicateTextLayer(){
  if(selectedElem?.__fabric&&fabricCanvas){
    selectedElem.__fabric.clone(cloned=>{
      cloned.set({left:(selectedElem.__fabric.left||0)+20,top:(selectedElem.__fabric.top||0)+20});
      if(selectedElem.__fabric.__originalText)cloned.__originalText=selectedElem.__fabric.__originalText;
      if(selectedElem.__fabric.__textTransform)cloned.__textTransform=selectedElem.__fabric.__textTransform;
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.requestRenderAll();
      if(typeof saveHistory==='function')saveHistory();
    });
    return;
  }
  if(typeof duplicateElem==='function')duplicateElem(selectedElem);
}
function textLayerBringForward(){
  if(selectedElem?.__fabric&&fabricCanvas){
    fabricCanvas.bringForward(selectedElem.__fabric);
    fabricCanvas.requestRenderAll();
    if(typeof saveHistory==='function')saveHistory();
    return;
  }
  if(typeof bringForward==='function')bringForward(selectedElem);
}
function textLayerSendBackward(){
  if(selectedElem?.__fabric&&fabricCanvas){
    fabricCanvas.sendBackwards(selectedElem.__fabric);
    fabricCanvas.requestRenderAll();
    if(typeof saveHistory==='function')saveHistory();
    return;
  }
  if(typeof sendBackward==='function')sendBackward(selectedElem);
}

// Called from Fabric selection events. Bridges to the existing DOM right-panel code
// by updating a minimal "selectedElem-like" reference plus the panel UI.
function onFabricSelectionChange(obj){
  // Deselect any DOM-side element selection so the UI doesn't show both.
  document.querySelectorAll('.canvas-elem.selected,.canvas-text-pro.selected,.cell.selected').forEach(el=>el.classList.remove('selected'));
  if(typeof selectedCell!=='undefined')selectedCell=null;
  if(typeof selectedText!=='undefined')selectedText=null;
  if(obj&&(obj.type==='i-text'||obj.type==='text'||obj.type==='textbox')){
    selectedElem={__fabric:obj,dataset:{elemType:'text'}};
    if(typeof updateRightPanelForElem==='function')updateRightPanelForElem(selectedElem);
    // The right panel is updated, but don't auto-open it on mobile — the user
    // tapped to select / drag the text, not to style it.
  }else{
    selectedElem=null;
    if(typeof updateRightPanel==='function')updateRightPanel(null);
  }
}

// TEMPLATES
// Layout templates sorted by photo count
const TEMPLATES=[
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 1 PHOTO Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:1,name:'Full Frame',id:'s1',cells:[[0,0,1,1]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 2 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:2,name:'Side by Side',id:'d1',cells:[[0,0,.5,1],[.5,0,.5,1]]},
  {n:2,name:'Top & Bottom',id:'d2',cells:[[0,0,1,.5],[0,.5,1,.5]]},
  {n:2,name:'Big + Small',id:'d3',cells:[[0,0,.65,1],[.65,0,.35,1]]},
  {n:2,name:'Diagonal',id:'d4',cells:[[0,0,.6,.6],[.4,.4,.6,.6]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 3 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:3,name:'Triptych',id:'t1',cells:[[0,0,1/3,1],[1/3,0,1/3,1],[2/3,0,1/3,1]]},
  {n:3,name:'Top + 2',id:'t2',cells:[[0,0,1,.55],[0,.55,.5,.45],[.5,.55,.5,.45]]},
  {n:3,name:'2 + Bottom',id:'t3',cells:[[0,0,.5,.55],[.5,0,.5,.55],[0,.55,1,.45]]},
  {n:3,name:'H-Split',id:'hs3',cells:[[0,0,1,.38],[0,.38,.5,.62],[.5,.38,.5,.62]]},
  {n:3,name:'Feature L',id:'fl',cells:[[0,0,.65,1],[.65,0,.35,.5],[.65,.5,.35,.5]]},
  {n:3,name:'Feature R',id:'fr',cells:[[0,0,.35,.5],[0,.5,.35,.5],[.35,0,.65,1]]},
  {n:3,name:'Row 3',id:'r3',cells:[[0,0,1,1/3],[0,1/3,1,1/3],[0,2/3,1,1/3]]},
  {n:3,name:'Cascade 3',id:'ca3',cells:[[0,0,.55,.55],[.55,0,.45,.55],[.1,.55,.9,.45]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 4 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:4,name:'4 Grid',id:'g4',cells:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
  {n:4,name:'Feature + 3',id:'f3',cells:[[0,0,.65,1],[.65,0,.35,1/3],[.65,1/3,.35,1/3],[.65,2/3,.35,1/3]]},
  {n:4,name:'Left + 3',id:'l3',cells:[[0,0,.35,1/3],[0,1/3,.35,1/3],[0,2/3,.35,1/3],[.35,0,.65,1]]},
  {n:4,name:'T-Shape',id:'ts4',cells:[[0,0,1,.4],[0,.4,.33,.6],[.33,.4,.34,.6],[.67,.4,.33,.6]]},
  {n:4,name:'L-Shape',id:'ls4',cells:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,1,.5]]},
  {n:4,name:'Asymmetric',id:'asym',cells:[[0,0,.42,1],[.42,0,.58,.5],[.42,.5,.28,.5],[.7,.5,.3,.5]]},
  {n:4,name:'Staircase',id:'stair4',cells:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
  {n:4,name:'Widescreen',id:'ws4',cells:[[0,0,1,.5],[0,.5,.33,.5],[.33,.5,.34,.5],[.67,.5,.33,.5]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 5 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:5,name:'Magazine',id:'mag',cells:[[0,0,.6,.55],[.6,0,.4,.55],[0,.55,.33,.45],[.33,.55,.34,.45],[.67,.55,.33,.45]]},
  {n:5,name:'Cross',id:'crs5',cells:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.33,.5],[.33,.5,.34,.5],[.67,.5,.33,.5]]},
  {n:5,name:'3+2 Rows',id:'r32',cells:[[0,0,1/3,.5],[1/3,0,1/3,.5],[2/3,0,1/3,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
  {n:5,name:'2+3 Rows',id:'r23',cells:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,1/3,.5],[1/3,.5,1/3,.5],[2/3,.5,1/3,.5]]},
  {n:5,name:'Pentagon',id:'pent',cells:[[.25,0,.5,.45],[0,.45,.33,.55],[.33,.45,.34,.55],[.67,.45,.33,.55],[.1,.9,.8,.1]]},
  {n:5,name:'Big+4 Edge',id:'be5',cells:[[.2,.2,.6,.6],[0,0,.2,1],[.8,0,.2,1],[.2,0,.6,.2],[.2,.8,.6,.2]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 6 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:6,name:'2×3 Grid',id:'g23',cells:[[0,0,1/3,1/2],[1/3,0,1/3,1/2],[2/3,0,1/3,1/2],[0,.5,1/3,.5],[1/3,.5,1/3,.5],[2/3,.5,1/3,.5]]},
  {n:6,name:'3×2 Grid',id:'g32',cells:[[0,0,.5,1/3],[.5,0,.5,1/3],[0,1/3,.5,1/3],[.5,1/3,.5,1/3],[0,2/3,.5,1/3],[.5,2/3,.5,1/3]]},
  {n:6,name:'1+5',id:'o15',cells:[[0,0,1,.45],[0,.45,.2,.55],[.2,.45,.2,.55],[.4,.45,.2,.55],[.6,.45,.2,.55],[.8,.45,.2,.55]]},
  {n:6,name:'Big+5',id:'b6',cells:[[0,0,.6,.6],[.6,0,.4,.3],[.6,.3,.4,.3],[0,.6,.25,.4],[.25,.6,.25,.4],[.5,.6,.5,.4]]},
  {n:6,name:'Mosaic 6',id:'mos6',cells:[[0,0,.5,.5],[.5,0,.25,.25],[.75,0,.25,.25],[.5,.25,.25,.25],[.75,.25,.25,.25],[0,.5,1,.5]]},
  {n:6,name:'Hexagon',id:'hex6',cells:[[0,0,1/3,1/2],[1/3,0,1/3,1/2],[2/3,0,1/3,1/2],[0,.5,1/3,.5],[1/3,.5,1/3,.5],[2/3,.5,1/3,.5]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 7 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:7,name:'Mosaic 7',id:'mos7',cells:[[0,0,.5,.45],[.5,0,.25,.45],[.75,0,.25,.22],[.75,.22,.25,.23],[0,.45,.25,.55],[.25,.45,.25,.55],[.5,.45,.5,.55]]},
  {n:7,name:'Big+6',id:'b7',cells:[[0,0,.6,.6],[.6,0,.4,.3],[.6,.3,.4,.3],[0,.6,.2,.4],[.2,.6,.2,.4],[.4,.6,.2,.4],[.6,.6,.4,.4]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 8 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:8,name:'2×4 Grid',id:'g24',cells:[
    [0,0,.25,.5],[.25,0,.25,.5],[.5,0,.25,.5],[.75,0,.25,.5],
    [0,.5,.25,.5],[.25,.5,.25,.5],[.5,.5,.25,.5],[.75,.5,.25,.5]]},
  {n:8,name:'4×2 Grid',id:'g42',cells:[
    [0,0,.5,.25],[.5,0,.5,.25],[0,.25,.5,.25],[.5,.25,.5,.25],
    [0,.5,.5,.25],[.5,.5,.5,.25],[0,.75,.5,.25],[.5,.75,.5,.25]]},
  {n:8,name:'Mosaic 8',id:'mos8',cells:[
    [0,0,.5,.4],[.5,0,.25,.4],[.75,0,.25,.2],[.75,.2,.25,.2],
    [0,.4,.25,.3],[.25,.4,.25,.3],[.5,.4,.5,.3],
    [0,.7,1,.3]]},
  {n:8,name:'Magazine 8',id:'mag8',cells:[
    [0,0,.6,.5],[.6,0,.2,.25],[.8,0,.2,.25],[.6,.25,.2,.25],[.8,.25,.2,.25],
    [0,.5,.33,.5],[.33,.5,.34,.5],[.67,.5,.33,.5]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 9 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:9,name:'3×3 Grid',id:'g9',cells:[
    [0,0,1/3,1/3],[1/3,0,1/3,1/3],[2/3,0,1/3,1/3],
    [0,1/3,1/3,1/3],[1/3,1/3,1/3,1/3],[2/3,1/3,1/3,1/3],
    [0,2/3,1/3,1/3],[1/3,2/3,1/3,1/3],[2/3,2/3,1/3,1/3]]},
  {n:9,name:'Center+8',id:'c9',cells:[
    [.30,.30,.40,.40],
    [0,0,.333,.30],[.333,0,.334,.30],[.667,0,.333,.30],
    [0,.30,.30,.40],[.70,.30,.30,.40],
    [0,.70,.333,.30],[.333,.70,.334,.30],[.667,.70,.333,.30]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 10 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:10,name:'2×5 Grid',id:'g25',cells:[
    [0,0,.2,.5],[.2,0,.2,.5],[.4,0,.2,.5],[.6,0,.2,.5],[.8,0,.2,.5],
    [0,.5,.2,.5],[.2,.5,.2,.5],[.4,.5,.2,.5],[.6,.5,.2,.5],[.8,.5,.2,.5]]},
  {n:10,name:'5×2 Vertical',id:'g52',cells:(()=>{const a=[];for(let r=0;r<5;r++)for(let c=0;c<2;c++)a.push([c/2,r/5,.5,.2]);return a;})()},
  {n:10,name:'Big+9',id:'b10',cells:[
    [0,0,.6,.6],
    [.6,0,.2,.2],[.8,0,.2,.2],[.6,.2,.2,.2],[.8,.2,.2,.2],[.6,.4,.2,.2],[.8,.4,.2,.2],
    [0,.6,.33,.4],[.33,.6,.34,.4],[.67,.6,.33,.4]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 12 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:12,name:'3×4 Grid',id:'g34',cells:[
    [0,0,1/4,1/3],[1/4,0,1/4,1/3],[2/4,0,1/4,1/3],[3/4,0,1/4,1/3],
    [0,1/3,1/4,1/3],[1/4,1/3,1/4,1/3],[2/4,1/3,1/4,1/3],[3/4,1/3,1/4,1/3],
    [0,2/3,1/4,1/3],[1/4,2/3,1/4,1/3],[2/4,2/3,1/4,1/3],[3/4,2/3,1/4,1/3]]},
  {n:12,name:'4×3 Grid',id:'g43',cells:[
    [0,0,1/3,1/4],[1/3,0,1/3,1/4],[2/3,0,1/3,1/4],
    [0,1/4,1/3,1/4],[1/3,1/4,1/3,1/4],[2/3,1/4,1/3,1/4],
    [0,2/4,1/3,1/4],[1/3,2/4,1/3,1/4],[2/3,2/4,1/3,1/4],
    [0,3/4,1/3,1/4],[1/3,3/4,1/3,1/4],[2/3,3/4,1/3,1/4]]},
  {n:12,name:'2×6 Wide',id:'g26',cells:(()=>{const a=[];for(let r=0;r<2;r++)for(let c=0;c<6;c++)a.push([c/6,r/2,1/6,.5]);return a;})()},
  {n:7,name:'Family Tree',id:'fam_tree_7',cells:[
    [.4,0,.2,.3],
    [.15,.35,.25,.3],[.6,.35,.25,.3],
    [0,.7,.22,.3],[.26,.7,.22,.3],[.52,.7,.22,.3],[.78,.7,.22,.3]]},
  {n:12,name:'12 Mosaic',id:'mosaic_12',cells:[
    [0,0,.5,.4],
    [.5,0,.5,.2],[.5,.2,.5,.2],
    [0,.4,1/3,.25],[1/3,.4,1/3,.25],[2/3,.4,1/3,.25],
    [0,.65,1/6,.35],[1/6,.65,1/6,.35],[2/6,.65,1/6,.35],
    [3/6,.65,1/6,.35],[4/6,.65,1/6,.35],[5/6,.65,1/6,.35]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 15 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:15,name:'3×5 Grid',id:'g35',cells:[
    [0,0,.2,1/3],[.2,0,.2,1/3],[.4,0,.2,1/3],[.6,0,.2,1/3],[.8,0,.2,1/3],
    [0,1/3,.2,1/3],[.2,1/3,.2,1/3],[.4,1/3,.2,1/3],[.6,1/3,.2,1/3],[.8,1/3,.2,1/3],
    [0,2/3,.2,1/3],[.2,2/3,.2,1/3],[.4,2/3,.2,1/3],[.6,2/3,.2,1/3],[.8,2/3,.2,1/3]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 16 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:16,name:'4×4 Grid',id:'g44',cells:(()=>{const a=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)a.push([c/4,r/4,.25,.25]);return a;})()},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 20 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:20,name:'4×5 Grid',id:'g45',cells:(()=>{const a=[];for(let r=0;r<4;r++)for(let c=0;c<5;c++)a.push([c/5,r/4,.2,.25]);return a;})()},
  {n:20,name:'5×4 Vertical',id:'g54',cells:(()=>{const a=[];for(let r=0;r<5;r++)for(let c=0;c<4;c++)a.push([c/4,r/5,.25,.2]);return a;})()},
  {n:20,name:'20 Mosaic',id:'mosaic_20',cells:[
    [0,0,.4,.4],[.4,0,.2,.2],[.6,0,.2,.2],[.8,0,.2,.2],
    [.4,.2,.2,.2],[.6,.2,.2,.2],[.8,.2,.2,.2],
    [0,.4,.2,.2],[.2,.4,.2,.2],[.4,.4,.2,.2],[.6,.4,.2,.2],[.8,.4,.2,.2],
    [0,.6,.4,.2],[.4,.6,.2,.2],[.6,.6,.2,.2],[.8,.6,.2,.2],
    [0,.8,.2,.2],[.2,.8,.2,.2],[.4,.8,.2,.2],[.6,.8,.4,.2]]},
  {n:20,name:'20 Frame + Heart',id:'frame_20',...(()=>{
    // Border ring of a 6×6 grid (20 photos) framing a heart-shaped photo in the center.
    // shapeCells routes rendering through renderShapeCollage so the center cell clips to a heart.
    const sc=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(r===0||r===5||c===0||c===5)sc.push({x:c/6,y:r/6,w:1/6,h:1/6});
    sc.push({x:.3,y:.3,w:.4,h:.4,shape:'heart'});
    return {cells:sc.map(o=>[o.x,o.y,o.w,o.h]),shapeCells:sc};})()},
  {n:20,name:'Bento 20',id:'bt20',cells:[
    [0,0,.3,.3],[.3,0,.2,.15],[.3,.15,.2,.15],[.5,0,.25,.3],[.75,0,.25,.15],[.75,.15,.25,.15],
    [0,.3,.2,.25],[.2,.3,.3,.25],[.5,.3,.2,.25],[.7,.3,.3,.25],
    [0,.55,.25,.25],[.25,.55,.25,.125],[.25,.675,.25,.125],[.5,.55,.25,.25],[.75,.55,.25,.25],
    [0,.8,.2,.2],[.2,.8,.2,.2],[.4,.8,.2,.2],[.6,.8,.2,.2],[.8,.8,.2,.2]]},
  {n:20,name:'Headliner 20',id:'feat_20',cells:(()=>{
    const a=[];for(let c=0;c<4;c++)a.push([c*.25,0,.25,.4]);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++)a.push([c*.25,.4+r*.15,.25,.15]);return a;})()},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 25 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:25,name:'5×5 Grid',id:'g55',cells:(()=>{const a=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)a.push([c/5,r/5,.2,.2]);return a;})()},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 30 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:30,name:'5×6 Grid',id:'g56',cells:(()=>{const a=[];for(let r=0;r<5;r++)for(let c=0;c<6;c++)a.push([c/6,r/5,1/6,.2]);return a;})()},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 36 PHOTOS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:36,name:'6×6 Grid',id:'g66',cells:(()=>{const a=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)a.push([c/6,r/6,1/6,1/6]);return a;})()},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 2 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:2,name:'Overlap',id:'d5',cells:[[0,0,.7,.7],[.3,.3,.7,.7]]},
  {n:2,name:'V-Split',id:'d6',cells:[[0,0,.5,1],[.5,0,.5,1]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 3 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:3,name:'Thirds-H',id:'t4',cells:[[0,0,1,1/3],[0,1/3,1,1/3],[0,2/3,1,1/3]]},
  {n:3,name:'Focus',id:'t5',cells:[[.1,.1,.8,.55],[0,.65,.5,.35],[.5,.65,.5,.35]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 4 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:4,name:'Pinwheel',id:'pw4',cells:[[0,0,.5,.5],[.5,0,.5,.5],[.15,.5,.35,.5],[.5,.5,.5,.5]]},
  {n:4,name:'Float',id:'ft4',cells:[[.05,.05,.55,.55],[.45,.05,.5,.45],[.05,.55,.45,.4],[.55,.5,.4,.45]]},
  {n:4,name:'Strip+Sq',id:'ss4',cells:[[0,0,1,.38],[0,.38,.33,.62],[.33,.38,.34,.62],[.67,.38,.33,.62]]},
  {n:4,name:'Z-Flow',id:'zf4',cells:[[0,0,.6,.5],[.5,.5,.5,.5],[.4,0,.6,.5],[0,.5,.5,.5]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 5 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:5,name:'Quilt',id:'qt5',cells:[[0,0,.5,.5],[.5,0,.25,.25],[.75,0,.25,.25],[.5,.25,.25,.25],[.75,.25,.25,.25]]},
  {n:5,name:'Spine',id:'sp5',cells:[[0,0,.32,1],[.32,0,.36,.5],[.68,0,.32,.5],[.32,.5,.36,.5],[.68,.5,.32,.5]]},
  {n:5,name:'Arch',id:'ar5',cells:[[.2,0,.6,.5],[0,.5,.33,.5],[.33,.5,.34,.5],[.67,.5,.33,.5],[0,0,.2,1]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 6 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:6,name:'Bento',id:'bn6',cells:[[0,0,.55,.45],[.55,0,.45,.3],[.55,.3,.22,.35],[.77,.3,.23,.35],[0,.45,.27,.55],[.27,.45,.73,.55]]},
  {n:6,name:'Stagger',id:'sg6',cells:[[0,0,.5,.35],[.5,.15,.5,.35],[0,.35,.5,.35],[.5,.5,.5,.35],[0,.7,.5,.3],[.5,.7,.5,.3]]},
  {n:6,name:'Filmstrip',id:'fs6',cells:[[0,0,1/6,1],[1/6,0,1/6,1],[2/6,0,1/6,1],[3/6,0,1/6,1],[4/6,0,1/6,1],[5/6,0,1/6,1]]},
  {n:6,name:'Split3',id:'sl6',cells:[[0,0,.5,.33],[.5,0,.5,.33],[0,.33,.33,.34],[.33,.33,.34,.34],[.67,.33,.33,.34],[0,.67,1,.33]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 7 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:7,name:'Metro',id:'mt7',cells:[[0,0,.55,.55],[.55,0,.22,.28],[.77,0,.23,.28],[.55,.28,.45,.27],[0,.55,.22,.45],[.22,.55,.33,.45],[.55,.55,.45,.45]]},
  {n:7,name:'Cascade',id:'cs7',cells:[[0,0,.45,.45],[.55,0,.45,.45],[0,.55,.3,.45],[.3,.55,.4,.45],[.7,.55,.3,.45],[.1,.9,.4,.1],[.55,.9,.35,.1]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 8 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:8,name:'Bento 8',id:'bt8',cells:[[0,0,.5,.5],[.5,0,.25,.25],[.75,0,.25,.25],[.5,.25,.25,.25],[.75,.25,.25,.25],[0,.5,.25,.5],[.25,.5,.5,.5],[.75,.5,.25,.5]]},
  {n:8,name:'Metro 8',id:'mr8',cells:[[0,0,.4,.4],[.4,0,.3,.4],[.7,0,.3,.25],[.7,.25,.15,.15],[.85,.25,.15,.15],[0,.4,.25,.6],[.25,.4,.45,.6],[.7,.4,.3,.6]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 9 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:9,name:'Mosaic 9',id:'spi9',cells:[
    [0,0,.50,.50],
    [.50,0,.25,.25],[.75,0,.25,.25],[.50,.25,.25,.25],[.75,.25,.25,.25],
    [0,.50,.25,.50],[.25,.50,.25,.50],[.50,.50,.25,.50],[.75,.50,.25,.50]]},
  {n:9,name:'Bento 9',id:'bt9',cells:[
    [0,0,.5,.5],[.5,0,.25,.5],[.75,0,.25,.25],[.75,.25,.25,.25],
    [0,.5,.25,.5],[.25,.5,.25,.25],[.25,.75,.25,.25],[.5,.5,.25,.5],[.75,.5,.25,.5]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 10 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:10,name:'Editorial',id:'ed10',cells:[
    [0,0,.6,.45],[.6,0,.2,.22],[.8,0,.2,.22],[.6,.22,.2,.23],[.8,.22,.2,.23],
    [0,.45,.25,.55],[.25,.45,.25,.55],[.5,.45,.25,.55],[.75,.45,.25,.28],[.75,.73,.25,.27]]},
  {n:10,name:'Mosaic 10',id:'ms10',cells:[
    [0,0,.4,.4],[.4,0,.3,.25],[.7,0,.3,.25],[.4,.25,.6,.15],
    [0,.4,.2,.3],[.2,.4,.2,.3],[.4,.4,.2,.3],[.6,.4,.4,.3],
    [0,.7,.5,.3],[.5,.7,.5,.3]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CREATIVE 12 Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:12,name:'Bento 12',id:'bt12',cells:[
    [0,0,.5,.4],[.5,0,.25,.2],[.75,0,.25,.2],[.5,.2,.25,.2],[.75,.2,.25,.2],
    [0,.4,.25,.3],[.25,.4,.25,.3],[.5,.4,.5,.3],
    [0,.7,.25,.3],[.25,.7,.25,.3],[.5,.7,.25,.3],[.75,.7,.25,.3]]},
  {n:12,name:'Editorial 12',id:'ed12',cells:[
    [0,0,.4,.5],[.4,0,.3,.25],[.7,0,.3,.25],[.4,.25,.6,.25],
    [0,.5,.2,.5],[.2,.5,.2,.25],[.4,.5,.2,.25],[.6,.5,.2,.5],[.8,.5,.2,.25],
    [.2,.75,.2,.25],[.4,.75,.2,.25],[.8,.75,.2,.25]]},

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 30 PHOTOS — additional layouts Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {n:30,name:'6×5 Vertical',id:'g65',cells:(()=>{const a=[];for(let r=0;r<6;r++)for(let c=0;c<5;c++)a.push([c/5,r/6,.2,1/6]);return a;})()},
  {n:30,name:'30 Mosaic',id:'mosaic_30',cells:(()=>{
    const a=[];
    for(let r=0;r<5;r++)a.push([0,r/5,.25,.2]);
    for(let r=0;r<5;r++)for(let c=0;c<5;c++)a.push([.25+c*.15,r/5,.15,.2]);
    return a;
  })()},
  {n:30,name:'30 Magazine',id:'mag_30',cells:(()=>{
    const a=[];
    a.push([0,0,.5,.35]);
    a.push([.5,0,.5,.35]);
    for(let c=0;c<6;c++)a.push([c/6,.35,1/6,.1]);
    for(let c=0;c<6;c++)a.push([c/6,.45,1/6,.1]);
    for(let c=0;c<4;c++)a.push([c*.25,.55,.25,.15]);
    for(let c=0;c<6;c++)a.push([c/6,.7,1/6,.15]);
    for(let c=0;c<6;c++)a.push([c/6,.85,1/6,.15]);
    return a;
  })()},
];


// Ã¢â€â‚¬Ã¢â€â‚¬ SHAPE (clip-path) TEMPLATES Ã¢â€â‚¬Ã¢â€â‚¬
// Each cell has optional: shape ('heart'|'circle'|'star'|'hexagon'|'diamond'|'triangle'|'arrow')
const SHAPE_TEMPLATES=[
  {name:'Heart',id:'sh_heart',icon:'Ã¢ÂÂ¤Ã¯Â¸Â',
   cells:[{x:0,y:0,w:.48,h:.48,shape:'heart'},{x:.52,y:0,w:.48,h:.48,shape:'heart'},
          {x:.26,y:.52,w:.48,h:.48,shape:'heart'}]},
  {name:'Big Heart',id:'sh_bigheart',icon:'Ã°Å¸â€™Â',
   cells:[{x:.1,y:.08,w:.8,h:.84,shape:'heart'}]},
  {name:'Circles',id:'sh_circles',icon:'Ã¢Â­â€¢',
   cells:[{x:0,y:0,w:.48,h:.48,shape:'circle'},{x:.52,y:0,w:.48,h:.48,shape:'circle'},
          {x:0,y:.52,w:.48,h:.48,shape:'circle'},{x:.52,y:.52,w:.48,h:.48,shape:'circle'}]},
  {name:'Mix Grid',id:'sh_mix',icon:'Ã°Å¸â€â‚¬',
   cells:[{x:0,y:0,w:.3,h:.3,shape:'circle'},{x:.35,y:0,w:.3,h:.3,shape:'circle'},{x:.7,y:0,w:.3,h:.3,shape:'circle'},
          {x:0,y:.35,w:.3,h:.3,shape:'circle'},{x:.35,y:.35,w:.3,h:.3,shape:'circle'},{x:.7,y:.35,w:.3,h:.3,shape:'circle'},
          {x:.2,y:.68,w:.6,h:.32,shape:'heart'}]},
  {name:'Stars',id:'sh_stars',icon:'Ã¢Â­Â',
   cells:[{x:.02,y:.02,w:.44,h:.44,shape:'star'},{x:.54,y:.02,w:.44,h:.44,shape:'star'},
          {x:.02,y:.54,w:.44,h:.44,shape:'star'},{x:.54,y:.54,w:.44,h:.44,shape:'star'}]},
  {name:'Big Star',id:'sh_bigstar',icon:'Ã°Å¸Å’Å¸',
   cells:[{x:.08,y:.04,w:.84,h:.84,shape:'star'}]},
  {name:'Diamond',id:'sh_diamond',icon:'Ã°Å¸â€™Â ',
   cells:[{x:.04,y:.25,w:.42,h:.5,shape:'diamond'},{x:.54,y:.25,w:.42,h:.5,shape:'diamond'}]},
  {name:'Hex Grid',id:'sh_hex',icon:'Ã¢Â¬Â¡',
   cells:[{x:.02,y:.02,w:.44,h:.44,shape:'hexagon'},{x:.54,y:.02,w:.44,h:.44,shape:'hexagon'},
          {x:.02,y:.54,w:.44,h:.44,shape:'hexagon'},{x:.54,y:.54,w:.44,h:.44,shape:'hexagon'}]},
  {name:'Hearts+Sq',id:'sh_heartsq',icon:'Ã°Å¸â€™â€¢',
   cells:[{x:.02,y:.02,w:.45,h:.45,shape:'heart'},{x:.53,y:.02,w:.45,h:.45,shape:'circle'},
          {x:.02,y:.53,w:.45,h:.45,shape:'circle'},{x:.53,y:.53,w:.45,h:.45,shape:'heart'}]},
  {name:'Triangle',id:'sh_tri',icon:'Ã°Å¸â€Âº',
   cells:[{x:.04,y:.04,w:.44,h:.44,shape:'triangle'},{x:.52,y:.04,w:.44,h:.44,shape:'triangle'},
          {x:.28,y:.52,w:.44,h:.44,shape:'triangle'}]},
  {name:'Broken Heart',id:'sh_brokenheart',icon:'Ã°Å¸â€™â€',
   cells:[{x:.01,y:.04,w:.48,h:.92,shape:'heartL'},{x:.51,y:.04,w:.48,h:.92,shape:'heartR'}]},
  {name:'Flower',id:'sh_flower',icon:'Ã°Å¸Å’Â¸',
   cells:[{x:.28,y:.02,w:.44,h:.44,shape:'circle'},
          {x:.02,y:.28,w:.44,h:.44,shape:'circle'},{x:.54,y:.28,w:.44,h:.44,shape:'circle'},
          {x:.28,y:.54,w:.44,h:.44,shape:'circle'},
          {x:.25,y:.25,w:.5,h:.5,shape:'circle'}]},
  {name:'Arrow',id:'sh_arrow',icon:'Ã¢Å¾Â¡Ã¯Â¸Â',
   cells:[{x:.02,y:.2,w:.96,h:.6,shape:'arrow'}]},
  {name:'Shield',id:'sh_shield',icon:'Ã°Å¸â€ºÂ¡Ã¯Â¸Â',
   cells:[{x:.08,y:.04,w:.84,h:.92,shape:'shield'}]},

  // Ã¢â€â‚¬Ã¢â€â‚¬ Geometric cutout layouts (Nov 2026) Ã¢â€â‚¬Ã¢â€â‚¬
  // Mix of strip-grid and shape-cutout designs inspired by editorial collage layouts.
  // Strip layouts use plain rectangular cells; cutout layouts use new clip-path shapes
  // (vshape, xbandA/B, hexS1-S6) defined in getClipPathCSS.
  {name:'Heart Strip',id:'sh_heartstrip',icon:'Ã°Å¸â€™â€”',
   cells:[{x:.02,y:.06,w:.3,h:.88,shape:'rect'},
          {x:.34,y:.3,w:.32,h:.4,shape:'heart'},
          {x:.68,y:.06,w:.3,h:.88,shape:'rect'}]},
  {name:'V Photo',id:'sh_vshape',icon:'V',
   cells:[{x:.04,y:.04,w:.92,h:.92,shape:'vshape'}]},
  {name:'Twin Bars',id:'sh_twinbars',icon:'Ã¢â€“Â®Ã¢â€“Â®',
   cells:[{x:.18,y:.04,w:.28,h:.92,shape:'rect'},
          {x:.54,y:.04,w:.28,h:.92,shape:'rect'}]},
  {name:'Hex Slices',id:'sh_hexslice',icon:'Ã¢Â¬Â¢',
   cells:[{x:.5,y:.04,w:.46,h:.46,shape:'hexS1'},
          {x:.5,y:.27,w:.46,h:.46,shape:'hexS2'},
          {x:.5,y:.5,w:.46,h:.46,shape:'hexS3'},
          {x:.04,y:.5,w:.46,h:.46,shape:'hexS4'},
          {x:.04,y:.27,w:.46,h:.46,shape:'hexS5'},
          {x:.04,y:.04,w:.46,h:.46,shape:'hexS6'}]},
  {name:'X Cross',id:'sh_xcross',icon:'Ã¢Å“â€“',
   cells:[{x:0,y:0,w:1,h:1,shape:'xbandA'},
          {x:0,y:0,w:1,h:1,shape:'xbandB'}]},
  {name:'Filmstrip',id:'sh_filmstrip',icon:'Ã°Å¸Å½Å¾',
   cells:[{x:.02,y:.05,w:.46,h:.9,shape:'rect'},
          {x:.5,y:.05,w:.11,h:.9,shape:'rect'},
          {x:.62,y:.05,w:.11,h:.9,shape:'rect'},
          {x:.74,y:.05,w:.11,h:.9,shape:'rect'},
          {x:.86,y:.05,w:.12,h:.9,shape:'rect'}]},
  {name:'Big + Stack',id:'sh_bigstack',icon:'Ã¢â€“Â®Ã¢â€“Â¤',
   cells:[{x:.02,y:.05,w:.6,h:.9,shape:'rect'},
          {x:.64,y:.05,w:.34,h:.21,shape:'rect'},
          {x:.64,y:.28,w:.34,h:.21,shape:'rect'},
          {x:.64,y:.51,w:.34,h:.21,shape:'rect'},
          {x:.64,y:.74,w:.34,h:.21,shape:'rect'}]},
  {name:'Star Spotlight',id:'sh_starspot',icon:'Ã¢Â­Â',
   cells:[{x:.02,y:.02,w:.235,h:.23,shape:'rect'},
          {x:.27,y:.02,w:.235,h:.23,shape:'rect'},
          {x:.52,y:.02,w:.235,h:.23,shape:'rect'},
          {x:.77,y:.02,w:.21,h:.23,shape:'rect'},
          {x:.06,y:.28,w:.88,h:.7,shape:'star'}]},

  // Ã¢â€â‚¬Ã¢â€â‚¬ More creative layouts (round 2) Ã¢â€â‚¬Ã¢â€â‚¬
  // Pinwheel: 4 triangle blades, each in one quadrant, oriented for rotational
  // symmetry — together they look like a turning pinwheel with X-shaped gaps.
  {name:'Pinwheel',id:'sh_pinwheel',icon:'Ã°Å¸Å’â‚¬',
   cells:[{x:.5,y:0,w:.5,h:.5,shape:'pinTR'},
          {x:.5,y:.5,w:.5,h:.5,shape:'pinBR'},
          {x:0,y:.5,w:.5,h:.5,shape:'pinBL'},
          {x:0,y:0,w:.5,h:.5,shape:'pinTL'}]},
  // 2×2 diamond grid — four diamond cells arranged as a square of rhombi.
  {name:'Diamond Grid',id:'sh_diamondgrid',icon:'Ã¢â€”â€¡Ã¢â€”â€¡',
   cells:[{x:.02,y:.02,w:.46,h:.46,shape:'diamond'},
          {x:.52,y:.02,w:.46,h:.46,shape:'diamond'},
          {x:.02,y:.52,w:.46,h:.46,shape:'diamond'},
          {x:.52,y:.52,w:.46,h:.46,shape:'diamond'}]},
  // Cinema-style triple letterbox: three wide horizontal strips stacked.
  {name:'Cinema Stripe',id:'sh_cinema',icon:'Ã°Å¸Å½Â¬',
   cells:[{x:.04,y:.06,w:.92,h:.27,shape:'rect'},
          {x:.04,y:.365,w:.92,h:.27,shape:'rect'},
          {x:.04,y:.67,w:.92,h:.27,shape:'rect'}]},
  // Magazine spread — one feature image on top, four thumbnails below.
  {name:'Magazine',id:'sh_magazine',icon:'Ã°Å¸â€œÂ°',
   cells:[{x:.02,y:.02,w:.96,h:.62,shape:'rect'},
          {x:.02,y:.66,w:.235,h:.32,shape:'rect'},
          {x:.265,y:.66,w:.235,h:.32,shape:'rect'},
          {x:.51,y:.66,w:.235,h:.32,shape:'rect'},
          {x:.755,y:.66,w:.225,h:.32,shape:'rect'}]},
  // Plus / cross arrangement — 5 squares in a + shape with empty corners.
  {name:'Plus Cross',id:'sh_pluscross',icon:'Ã¢Å¾â€¢',
   cells:[{x:.34,y:.02,w:.32,h:.31,shape:'rect'},
          {x:.02,y:.34,w:.31,h:.32,shape:'rect'},
          {x:.34,y:.34,w:.32,h:.32,shape:'rect'},
          {x:.67,y:.34,w:.31,h:.32,shape:'rect'},
          {x:.34,y:.67,w:.32,h:.31,shape:'rect'}]},
  // 3x3 tic-tac-toe grid — nine equal squares with thin gaps for a clean
  // gallery wall look.
  {name:'Tic-Tac-Toe',id:'sh_ttt',icon:'Ã¢Å’â€”',
   cells:[{x:.02,y:.02,w:.32,h:.32,shape:'rect'},{x:.34,y:.02,w:.32,h:.32,shape:'rect'},{x:.66,y:.02,w:.32,h:.32,shape:'rect'},
          {x:.02,y:.34,w:.32,h:.32,shape:'rect'},{x:.34,y:.34,w:.32,h:.32,shape:'rect'},{x:.66,y:.34,w:.32,h:.32,shape:'rect'},
          {x:.02,y:.66,w:.32,h:.32,shape:'rect'},{x:.34,y:.66,w:.32,h:.32,shape:'rect'},{x:.66,y:.66,w:.32,h:.32,shape:'rect'}]},
];


const STICKERS=['Ã¢ÂÂ¤Ã¯Â¸Â','Ã¢Â­Â','Ã°Å¸Å’Å¸','Ã¢Å“Â¨','Ã°Å¸Å½â€°','Ã°Å¸Å½Å ','Ã°Å¸Å’Â¸','Ã°Å¸Å’Âº','Ã°Å¸Å’Ë†','Ã°Å¸Â¦â€¹','Ã°Å¸Å’â„¢','Ã¢Ëœâ‚¬Ã¯Â¸Â','Ã°Å¸â€Â¥','Ã°Å¸â€™Â«','Ã°Å¸Å½Âµ','Ã°Å¸Å½Â¶','Ã°Å¸Ââ€ ','Ã°Å¸â€™Å½','Ã°Å¸Å½Â','Ã°Å¸Å’Â¿','Ã°Å¸Ââ‚¬','Ã°Å¸Å’Å ','Ã°Å¸Å½Â¨','Ã°Å¸â€œÂ¸','Ã°Å¸â€™â€¢','Ã°Å¸ËœÂ','Ã°Å¸Â¥Â°','Ã¢Å“Å’Ã¯Â¸Â','Ã°Å¸â„¢Å’','Ã°Å¸â€˜â€˜','Ã°Å¸Å’Â»','Ã°Å¸Â¦â€ž','Ã°Å¸ÂÂ','Ã°Å¸ÂÂ','Ã¢Ââ€žÃ¯Â¸Â','Ã°Å¸Å½â‚¬','Ã°Å¸Å½Â­','Ã°Å¸Å’Â´','Ã°Å¸Ââ€Ã¯Â¸Â','Ã°Å¸Å½Â ','Ã°Å¸Â¦Å¡'];

// Ã¢â€â‚¬Ã¢â€â‚¬ RICH OCCASION TEMPLATES Ã¢â€â‚¬Ã¢â€â‚¬
// Templates with drawn backgrounds + real movable DOM elements (shapes, emojis, text)

const OCC_CATEGORIES=[
  {id:'all',label:'All',emoji:'Ã¢Å Å¾'},
  {id:'birthday',label:'Ã°Å¸Å½â€š Birthday',emoji:'Ã°Å¸Å½â€š'},
  {id:'anniversary',label:'Ã°Å¸â€™Â Anniversary',emoji:'Ã°Å¸â€™Â'},
  {id:'wedding',label:'Ã°Å¸â€™â€™ Wedding',emoji:'Ã°Å¸â€™â€™'},
  {id:'travel',label:'Ã¢Å“Ë†Ã¯Â¸Â Travel',emoji:'Ã¢Å“Ë†Ã¯Â¸Â'},
  {id:'baby',label:'Ã°Å¸â€˜Â¶ Baby',emoji:'Ã°Å¸â€˜Â¶'},
  {id:'holiday',label:'Ã°Å¸Å½â€ž Holiday',emoji:'Ã°Å¸Å½â€ž'},
  {id:'family',label:'Ã°Å¸ÂÂ  Family',emoji:'Ã°Å¸ÂÂ '},
  {id:'graduation',label:'Ã°Å¸Å½â€œ Grad',emoji:'Ã°Å¸Å½â€œ'},
  {id:'instagram',label:'Ã°Å¸â€œÂ± Instagram',emoji:'Ã°Å¸â€œÂ±'},
];

function mkShape(id,svg,x,y,w,h,color,rot=0,opacity=1){return {kind:'shape',id,svg,x,y,w,h,color,rot,opacity};}
function mkEmoji(emoji,x,y,size,rot=0,opacity=1){return {kind:'emoji',content:emoji,x,y,w:size,h:size,fontSize:Math.round(size*.75),rot,opacity};}
function mkText(text,x,y,style){return {kind:'text',text,x,y,style};}

const SV={
  star:`<polygon points="13,2 15.9,9.3 24,9.3 17.6,14 19.9,21.3 13,16.7 6.1,21.3 8.4,14 2,9.3 10.1,9.3" fill="currentColor"/>`,
  heart:`<path d="M13 21C13 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.2 3 11.7 3.8 13 5C14.3 3.8 15.8 3 18.5 3C21.5 3 24 5.5 24 8.5C24 14.5 13 21 13 21Z" fill="currentColor"/>`,
  diamond:`<polygon points="13,2 24,13 13,24 2,13" fill="currentColor"/>`,
  circle:`<circle cx="13" cy="13" r="9" fill="currentColor"/>`,
  cloud:`<ellipse cx="8" cy="14" rx="5" ry="4" fill="currentColor"/><ellipse cx="14" cy="12" rx="6" ry="5" fill="currentColor"/><ellipse cx="19" cy="15" rx="4" ry="3.5" fill="currentColor"/>`,
  frame:`<rect x="2" y="2" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"/>`,
  frameRound:`<rect x="2" y="2" width="22" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2.5"/>`,
  frameDash:`<rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>`,
  corners:`<path d="M4,12 V4 H12 M14,4 H22 V12 M22,14 V22 H14 M12,22 H4 V14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  wave:`<path d="M2,13 Q7,6 12,13 Q17,20 22,13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
  arrowR:`<line x1="2" y1="13" x2="20" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="15,8 20,13 15,18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
  sparkle:`<path d="M13,2 L14.5,10 L22,13 L14.5,16 L13,24 L11.5,16 L4,13 L11.5,10 Z" fill="currentColor"/>`,
};

// ══════════════════════════════════════════════════════════════════
// OCC_TEMPLATES — lazy-loaded from /static/js/occasion-templates.js
// The array is ~2000 lines and only needed when the user opens the Occasions
// tab. Starts as null so we can detect "not loaded yet" and trigger the fetch.
// ══════════════════════════════════════════════════════════════════
let OCC_TEMPLATES=window.OCC_TEMPLATES||null;
let _occLoadingPromise=null;
function loadOccTemplates(){
  if(window.OCC_TEMPLATES && window.OCC_TEMPLATES.length>0){
    OCC_TEMPLATES=window.OCC_TEMPLATES;
    return Promise.resolve(OCC_TEMPLATES);
  }
  if(OCC_TEMPLATES)return Promise.resolve(OCC_TEMPLATES);
  if(_occLoadingPromise)return _occLoadingPromise;
  _occLoadingPromise=new Promise((resolve,reject)=>{
    window.onOccTemplatesReady=()=>{
      OCC_TEMPLATES=window.OCC_TEMPLATES||[];
      resolve(OCC_TEMPLATES);
    };
    const s=document.createElement('script');
    s.src='../../assets/js/occasion-templates.js';
    s.async=true;
    s.onload=()=>{
      if(window.OCC_TEMPLATES){
        OCC_TEMPLATES=window.OCC_TEMPLATES;
        resolve(OCC_TEMPLATES);
      }
    };
    s.onerror=()=>reject(new Error('Failed to load occasion templates'));
    document.head.appendChild(s);
  });
  return _occLoadingPromise;
}





// Ã¢â€â‚¬Ã¢â€â‚¬ DRAWING HELPERS Ã¢â€â‚¬Ã¢â€â‚¬
function seededRng(seed){
  let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280;};
}
function drawSpiderWeb(ctx,x,y,r,rings,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=.7;
  const spokes=8;
  for(let i=0;i<spokes;i++){
    const a=i*Math.PI*2/spokes;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();
  }
  for(let ri=1;ri<=rings;ri++){
    const rr=r*ri/rings;ctx.beginPath();
    for(let i=0;i<=spokes;i++){const a=i*Math.PI*2/spokes;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
    ctx.stroke();
  }
  ctx.restore();
}
function drawBat(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;
  ctx.beginPath();ctx.ellipse(x,y,size*.4,size*.25,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-size*.4,y);ctx.bezierCurveTo(x-size*.9,y-size*.6,x-size*.3,y-size*.7,x,y-size*.1);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+size*.4,y);ctx.bezierCurveTo(x+size*.9,y-size*.6,x+size*.3,y-size*.7,x,y-size*.1);ctx.fill();
  ctx.restore();
}
function drawSpider(ctx,x,y,size,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=.8;ctx.fillStyle=col;
  // Legs
  for(let i=0;i<4;i++){
    const side=i<2?-1:1,offset=(i%2===0?-1:1);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+side*size*1.6,y+offset*size*.8);ctx.stroke();
  }
  // Body
  ctx.beginPath();ctx.arc(x,y,size*.45,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x,y-size*.7,size*.3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawHouse(ctx,x,y,w,h,col){
  ctx.save();ctx.fillStyle=col;
  ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+h*.4);ctx.lineTo(x+w*.5,y);ctx.lineTo(x+w,y+h*.4);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,200,0,.6)';
  ctx.fillRect(x+w*.15,y+h*.55,w*.22,w*.22);ctx.fillRect(x+w*.63,y+h*.55,w*.22,w*.22);
  ctx.restore();
}
function drawBalloon(ctx,x,y,r,col,wobble){
  ctx.save();ctx.translate(x,y);ctx.rotate((parseFloat(wobble)||0)*0.1);
  // Soft drop shadow
  ctx.shadowColor='rgba(0,0,0,.14)';ctx.shadowBlur=r*.6;ctx.shadowOffsetY=r*.15;
  // Refined balloon body with gradient shading (matte finish)
  const bg=ctx.createRadialGradient(-r*.25,-r*.35,0,0,-r*.2,r*.9);
  bg.addColorStop(0,'rgba(255,255,255,.45)');
  bg.addColorStop(.35,col);
  bg.addColorStop(1,col);
  ctx.fillStyle=bg;
  ctx.beginPath();ctx.ellipse(0,-r*.2,r*.62,r,0,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='transparent';
  // Tiny knot at bottom
  ctx.fillStyle=col;
  ctx.beginPath();ctx.moveTo(-r*.08,r*.75);ctx.lineTo(r*.08,r*.75);ctx.lineTo(0,r*.88);ctx.closePath();ctx.fill();
  // Elegant tapered string
  ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.6;
  ctx.beginPath();ctx.moveTo(0,r*.88);ctx.bezierCurveTo(r*.35,r*1.4,-r*.2,r*1.8,r*.08,r*2.3);ctx.stroke();
  ctx.restore();
}
function drawStar(ctx,x,y,r,col,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=col;
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const a1=i*Math.PI*2/5-Math.PI/2,a2=(i+.5)*Math.PI*2/5-Math.PI/2;
    i===0?ctx.moveTo(x+Math.cos(a1)*r,y+Math.sin(a1)*r):ctx.lineTo(x+Math.cos(a1)*r,y+Math.sin(a1)*r);
    ctx.lineTo(x+Math.cos(a2)*r*.4,y+Math.sin(a2)*r*.4);
  }
  ctx.closePath();ctx.fill();ctx.restore();
}
function drawCake(ctx,x,y,w,h){
  // Note: called as drawCake(ctx, cx, cy, w, col) - h arg holds color in current usage
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.1)';ctx.shadowBlur=w*.15;ctx.shadowOffsetY=w*.08;
  // Elegant tiered cake silhouette: wider base, narrower top
  const baseH=w*.45,topH=w*.3,plateH=w*.08;
  // Plate
  ctx.fillStyle='#f3e9d8';
  ctx.beginPath();ctx.ellipse(x,y,w*.62,plateH*.55,0,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='transparent';
  // Bottom tier (cream + gold trim)
  const bg1=ctx.createLinearGradient(x,y-baseH,x,y);
  bg1.addColorStop(0,'#fefaf0');bg1.addColorStop(1,'#f0e4cc');
  ctx.fillStyle=bg1;
  ctx.fillRect(x-w*.48,y-baseH,w*.96,baseH);
  ctx.fillStyle='#d4af37';
  ctx.fillRect(x-w*.48,y-baseH*.18,w*.96,w*.02);
  // Top tier
  const bg2=ctx.createLinearGradient(x,y-baseH-topH,x,y-baseH);
  bg2.addColorStop(0,'#fefaf0');bg2.addColorStop(1,'#e8dcc1');
  ctx.fillStyle=bg2;
  ctx.fillRect(x-w*.32,y-baseH-topH,w*.64,topH);
  ctx.fillStyle='#d4af37';
  ctx.fillRect(x-w*.32,y-baseH-topH*.18,w*.64,w*.018);
  // Single elegant candle with soft flame
  const candleX=x,candleY=y-baseH-topH;
  ctx.fillStyle='#e8d5a5';ctx.fillRect(candleX-w*.02,candleY-w*.2,w*.04,w*.2);
  // Flame
  const fg=ctx.createRadialGradient(candleX,candleY-w*.26,0,candleX,candleY-w*.26,w*.1);
  fg.addColorStop(0,'#fff3c4');fg.addColorStop(.5,'#f5c842');fg.addColorStop(1,'rgba(245,200,66,0)');
  ctx.fillStyle=fg;
  ctx.beginPath();ctx.ellipse(candleX,candleY-w*.26,w*.06,w*.09,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawBanner(ctx,x,y,width,text,col){
  ctx.save();
  // Elegant ribbon banner with curve and end fishtails
  const h=22,sag=8;
  const main=col||'#c97a5f';
  const dark=shadeColor(main,-25);
  // Curved ribbon body
  ctx.fillStyle=main;
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.quadraticCurveTo(x+width/2,y+sag,x+width,y);
  ctx.lineTo(x+width,y+h);
  ctx.quadraticCurveTo(x+width/2,y+h+sag,x,y+h);
  ctx.closePath();ctx.fill();
  // Left fishtail shadow
  ctx.fillStyle=dark;
  ctx.beginPath();
  ctx.moveTo(x,y);ctx.lineTo(x-h*.8,y+h*.1);ctx.lineTo(x-h*.5,y+h*.5);ctx.lineTo(x-h*.8,y+h*.9);ctx.lineTo(x,y+h);
  ctx.closePath();ctx.fill();
  // Right fishtail shadow
  ctx.beginPath();
  ctx.moveTo(x+width,y);ctx.lineTo(x+width+h*.8,y+h*.1);ctx.lineTo(x+width+h*.5,y+h*.5);ctx.lineTo(x+width+h*.8,y+h*.9);ctx.lineTo(x+width,y+h);
  ctx.closePath();ctx.fill();
  // Thin inner decorative line
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.8;
  ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.quadraticCurveTo(x+width/2,y+sag+4,x+width-4,y+4);ctx.stroke();
  // Optional text
  if(text){
    ctx.fillStyle='rgba(255,255,255,.95)';
    ctx.font=`italic 600 ${h*.55}px 'Playfair Display', 'Fraunces', serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,x+width/2,y+h/2+sag*.4);
  }
  ctx.restore();
}

// Utility: shade a color (hex or rgb/rgba) by a percentage; preserves alpha for rgba
function shadeColor(col,pct){
  try{
    let r,g,b,a=1;
    const m=String(col).match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
    if(m){r=+m[1];g=+m[2];b=+m[3];if(m[4]!==undefined)a=+m[4];}
    else{
      let hex=String(col).replace('#','');
      if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
      r=parseInt(hex.substr(0,2),16);g=parseInt(hex.substr(2,2),16);b=parseInt(hex.substr(4,2),16);
    }
    if(!isFinite(r)||!isFinite(g)||!isFinite(b))return col;
    const f=pct<0?0:255,t=Math.min(1,Math.abs(pct)/100);
    r=Math.round((f-r)*t+r);g=Math.round((f-g)*t+g);b=Math.round((f-b)*t+b);
    r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
    if(a<1)return `rgba(${r},${g},${b},${a})`;
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1).padStart(6,'0')}`;
  }catch(e){return col;}
}
function drawRose(ctx,x,y,size,angle,col){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const light=shadeColor(col,25);
  const dark=shadeColor(col,-20);
  // Outer petals (soft overlapping ellipses with gradient tint)
  for(let i=0;i<7;i++){
    ctx.save();ctx.rotate(i*Math.PI*2/7);
    const pg=ctx.createLinearGradient(0,-size*.6,0,-size*.1);
    pg.addColorStop(0,light);pg.addColorStop(1,col);
    ctx.fillStyle=pg;
    ctx.beginPath();ctx.ellipse(0,-size*.42,size*.26,size*.48,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  // Inner petal ring
  for(let i=0;i<5;i++){
    ctx.save();ctx.rotate(i*Math.PI*2/5+Math.PI/5);
    ctx.fillStyle=dark;ctx.globalAlpha=.85;
    ctx.beginPath();ctx.ellipse(0,-size*.22,size*.16,size*.28,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  // Tight center
  const cg=ctx.createRadialGradient(0,0,0,0,0,size*.25);
  cg.addColorStop(0,dark);cg.addColorStop(1,shadeColor(col,-35));
  ctx.fillStyle=cg;ctx.globalAlpha=1;
  ctx.beginPath();ctx.arc(0,0,size*.22,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawOrnamentalBorder(ctx,W,H,col,inset){
  ctx.save();ctx.strokeStyle=col;
  // Elegant double line - thin outer, hairline inner
  ctx.lineWidth=1;
  ctx.strokeRect(inset,inset,W-inset*2,H-inset*2);
  ctx.lineWidth=.4;ctx.globalAlpha=.6;
  ctx.strokeRect(inset+4,inset+4,W-inset*2-8,H-inset*2-8);
  ctx.globalAlpha=1;
  // Minimalist corner diamonds (art deco feel)
  const d=5;
  [[inset,inset],[W-inset,inset],[inset,H-inset],[W-inset,H-inset]].forEach(([cx,cy])=>{
    ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(cx,cy-d);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.lineTo(cx-d,cy);
    ctx.closePath();ctx.fill();
  });
  // Inner corner tick marks
  ctx.lineWidth=.6;const tk=10;
  [[inset+4,inset+4,1,1],[W-inset-4,inset+4,-1,1],[inset+4,H-inset-4,1,-1],[W-inset-4,H-inset-4,-1,-1]].forEach(([cx,cy,sx,sy])=>{
    ctx.beginPath();
    ctx.moveTo(cx,cy+sy*tk);ctx.lineTo(cx,cy);ctx.lineTo(cx+sx*tk,cy);
    ctx.stroke();
  });
  ctx.restore();
}
function drawHeart(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;
  ctx.beginPath();
  ctx.moveTo(x,y+size*.3);
  ctx.bezierCurveTo(x,y-size*.2,x-size,y-size*.2,x-size,y+size*.1);
  ctx.bezierCurveTo(x-size,y+size*.6,x,y+size*.9,x,y+size*.9);
  ctx.bezierCurveTo(x,y+size*.9,x+size,y+size*.6,x+size,y+size*.1);
  ctx.bezierCurveTo(x+size,y-size*.2,x,y-size*.2,x,y+size*.3);
  ctx.closePath();ctx.fill();ctx.restore();
}
function drawFloralCorner(ctx,x,y,w,h,angle){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const cols=['#f8bbd0','#c8e6c9','#ffe0b2','#e1bee7'];
  for(let i=0;i<3;i++){
    ctx.fillStyle=cols[i];ctx.globalAlpha=.6;
    ctx.beginPath();ctx.ellipse(w*.15+i*w*.1,h*.15+i*h*.1,w*.07,h*.12,Math.PI/4+i*.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(w*.15+i*w*.1,h*.15+i*h*.1,w*.12,h*.07,-Math.PI/4+i*.5,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#f5c842';ctx.globalAlpha=.8;
  ctx.beginPath();ctx.arc(w*.15,h*.15,w*.04,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawDoves(ctx,x,y,size){
  ctx.save();ctx.fillStyle='rgba(255,255,255,.8)';
  // Two simple doves
  [-size*.5,size*.5].forEach((ox,i)=>{
    ctx.save();ctx.translate(x+ox,y);if(i===1)ctx.scale(-1,1);
    ctx.beginPath();ctx.ellipse(0,0,size*.6,size*.28,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(size*.5,0,size*.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(0,-size*.1);ctx.bezierCurveTo(-size*.3,-size*.5,-size*.5,-size*.3,-size*.1,0);ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
function drawRings(ctx,x,y,size,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=size*.12;
  ctx.beginPath();ctx.arc(x-size*.35,y,size,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(x+size*.35,y,size,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
function drawChristmasTree(ctx,x,y,w,h){
  ctx.save();
  [.4,.6,.8,1].forEach((frac,i)=>{
    const tw=w*frac,ty=y-h+h*(.2+i*.2);
    ctx.fillStyle=i%2===0?'#1b5e20':'#2e7d32';
    ctx.beginPath();ctx.moveTo(x,ty-h*(frac*.35));ctx.lineTo(x-tw/2,ty);ctx.lineTo(x+tw/2,ty);ctx.closePath();ctx.fill();
  });
  // Trunk
  ctx.fillStyle='#5d4037';ctx.fillRect(x-w*.06,y,w*.12,h*.1);
  // Ornaments
  ['#ff3366','#f5c842','#4facfe','#ff6b35'].forEach((c,i)=>{
    const ang=i*Math.PI/2,r=w*.3+i*w*.05;
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+Math.cos(ang)*r*.5,y-h*.4+Math.sin(ang)*r*.3,4,0,Math.PI*2);ctx.fill();
  });
  // Star top
  drawStar(ctx,x,y-h,8,'#ffd700',1);
  ctx.restore();
}
function drawHolly(ctx,x,y,size,leafCol,berryCol){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=leafCol;
  ctx.beginPath();ctx.ellipse(-size*.3,0,size*.5,size*.25,Math.PI/4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(size*.3,0,size*.5,size*.25,-Math.PI/4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=berryCol;
  [-5,0,5].forEach(ox=>{ctx.beginPath();ctx.arc(ox,0,3,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}
function drawFirework(ctx,x,y,r,col,rng){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.globalAlpha=.8;
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,len=r*(.4+rng()*.6);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
    ctx.beginPath();ctx.arc(x+Math.cos(a)*len,y+Math.sin(a)*len,2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function drawChampagne(ctx,x,y,size,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=size*.08;ctx.fillStyle=col;ctx.globalAlpha=.7;
  // Glass
  ctx.beginPath();ctx.moveTo(x-size*.4,y);ctx.lineTo(x+size*.4,y);ctx.lineTo(x+size*.15,y+size*.8);ctx.lineTo(x+size*.1,y+size*.9);ctx.lineTo(x-size*.1,y+size*.9);ctx.lineTo(x-size*.15,y+size*.8);ctx.closePath();ctx.stroke();
  // Stem+base
  ctx.beginPath();ctx.moveTo(x,y+size*.8);ctx.lineTo(x,y+size*1.2);ctx.moveTo(x-size*.3,y+size*1.2);ctx.lineTo(x+size*.3,y+size*1.2);ctx.stroke();
  // Bubbles
  ctx.fillStyle=col;ctx.globalAlpha=.5;
  [-.1,0,.1].forEach((ox,i)=>{ctx.beginPath();ctx.arc(x+ox*size,y+size*(.2+i*.15),size*.04,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}
function drawRibbon(ctx,x,y,W,H,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+W*.1,y);ctx.lineTo(x+W*.9,y);ctx.moveTo(x+W*.1,y+H);ctx.lineTo(x+W*.9,y+H);ctx.stroke();
  ctx.restore();
}
function drawArrow(ctx,x1,y1,x2,y2,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.fillStyle=col;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1);
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-12*Math.cos(a-0.5),y2-12*Math.sin(a-0.5));ctx.lineTo(x2-12*Math.cos(a+0.5),y2-12*Math.sin(a+0.5));ctx.closePath();ctx.fill();
  ctx.restore();
}
function drawCloud(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;
  [[0,0,size*.35],[-.3,-.1,size*.25],[.28,-.08,size*.28],[-.55,.06,size*.18],[.5,.06,size*.2]].forEach(([ox,oy,r])=>{
    ctx.beginPath();ctx.arc(x+ox*size,y+oy*size,r,0,Math.PI*2);ctx.fill();
  });
  ctx.restore();
}
function drawBottle(ctx,x,y,w,h,col){
  ctx.save();ctx.fillStyle=col;ctx.globalAlpha=.8;
  ctx.roundRect(x-w/2,y-h*.6,w,h*.7,w*.3);ctx.fill();
  ctx.fillStyle=col;ctx.globalAlpha=.9;
  ctx.fillRect(x-w*.28,y-h*.6,w*.56,h*.18);
  ctx.fillRect(x-w*.2,y-h*.78,w*.4,h*.2);
  ctx.fillStyle='rgba(255,255,255,.3)';
  ctx.beginPath();ctx.ellipse(x-w*.12,y-h*.4,w*.08,h*.14,-.3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawBunny(ctx,x,y,size){
  ctx.save();ctx.fillStyle='rgba(240,240,240,.8)';
  // Ears
  ctx.beginPath();ctx.ellipse(x-size*.3,y-size*.8,size*.12,size*.35,-.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(x+size*.3,y-size*.8,size*.12,size*.35,.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,182,193,.6)';
  ctx.beginPath();ctx.ellipse(x-size*.3,y-size*.8,size*.06,size*.22,-.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(x+size*.3,y-size*.8,size*.06,size*.22,.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(240,240,240,.8)';
  ctx.beginPath();ctx.arc(x,y,size*.38,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.beginPath();ctx.arc(x-size*.12,y-size*.08,size*.05,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+size*.12,y-size*.08,size*.05,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,100,100,.7)';ctx.beginPath();ctx.arc(x,y+size*.04,size*.04,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawPlane(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;ctx.translate(x,y);ctx.rotate(-.25);
  ctx.beginPath();ctx.moveTo(size*.6,0);ctx.lineTo(-size*.5,size*.12);ctx.lineTo(-size*.3,0);ctx.lineTo(-size*.5,-size*.12);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(size*.1,0);ctx.lineTo(-size*.1,-size*.32);ctx.lineTo(-size*.35,-size*.32);ctx.lineTo(-size*.2,0);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-size*.05,0);ctx.lineTo(-size*.2,size*.2);ctx.lineTo(-size*.38,size*.2);ctx.lineTo(-size*.28,0);ctx.closePath();ctx.fill();
  ctx.restore();
}
function drawCompass(ctx,x,y,size,col){
  ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.stroke();
  ['N','E','S','W'].forEach((d,i)=>{
    const a=i*Math.PI/2-Math.PI/2;
    ctx.font=`bold ${size*.35}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(d,x+Math.cos(a)*size*.65,y+Math.sin(a)*size*.65);
  });
  ctx.beginPath();ctx.moveTo(x,y-size*.4);ctx.lineTo(x-size*.12,y+size*.15);ctx.lineTo(x,y+size*.1);ctx.lineTo(x+size*.12,y+size*.15);ctx.closePath();ctx.fill();
  ctx.restore();
}
function drawSimpleHouse(ctx,x,y,w,h,col){
  ctx.save();ctx.fillStyle=col;
  ctx.fillRect(x-w/2,y-h*.5,w,h*.5);
  ctx.beginPath();ctx.moveTo(x-w*.55,y-h*.5);ctx.lineTo(x,y-h);ctx.lineTo(x+w*.55,y-h*.5);ctx.closePath();ctx.fill();
  ctx.restore();
}
function drawBotanicalSpray(ctx,cx,cy,size,angle,col){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  const stem=col||'#8a9b73';
  const leaf=col||'#a3b88a';
  // Main stem
  ctx.strokeStyle=stem;ctx.lineWidth=Math.max(1,size*.03);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.25,-size*.35,size*.95,-size*.75);ctx.stroke();
  // Leaves along the stem
  const leaves=5;
  for(let i=0;i<leaves;i++){
    const t=(i+1)/(leaves+1);
    const lx=t*size*.85+size*.08,ly=-t*size*.7;
    const side=i%2===0?1:-1;
    const la=-Math.PI/2+side*Math.PI*.35;
    ctx.save();ctx.translate(lx,ly);ctx.rotate(la);
    ctx.fillStyle=leaf;
    ctx.beginPath();
    ctx.ellipse(0,-size*.1,size*.06,size*.14,0,0,Math.PI*2);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(0,size*.02);ctx.lineTo(0,-size*.22);ctx.stroke();
    ctx.restore();
  }
  // A few small buds at the tip
  ctx.fillStyle=shadeColor(stem,15);
  [[size*.9,-size*.75,size*.035],[size*.82,-size*.68,size*.028]].forEach(([bx,by,br])=>{
    ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();
  });
  ctx.restore();
}

function drawArchFrame(ctx,x,y,w,h,col,lineWidth){
  // Elegant rounded-arch outline (for weddings/anniversaries)
  ctx.save();
  ctx.strokeStyle=col;ctx.lineWidth=lineWidth||1.2;
  ctx.beginPath();
  ctx.moveTo(x,y+h);
  ctx.lineTo(x,y+w*.5);
  ctx.arc(x+w*.5,y+w*.5,w*.5,Math.PI,0,false);
  ctx.lineTo(x+w,y+h);
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx,x,y,size,col){
  // Clean 4-point sparkle (not the cartoonish 5-point star)
  ctx.save();ctx.fillStyle=col;ctx.globalAlpha=.9;
  ctx.beginPath();
  ctx.moveTo(x,y-size);
  ctx.quadraticCurveTo(x+size*.15,y-size*.15,x+size,y);
  ctx.quadraticCurveTo(x+size*.15,y+size*.15,x,y+size);
  ctx.quadraticCurveTo(x-size*.15,y+size*.15,x-size,y);
  ctx.quadraticCurveTo(x-size*.15,y-size*.15,x,y-size);
  ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawGoldLeafCorner(ctx,cx,cy,size,sx,sy,col){
  // Minimalist leaf-inspired corner flourish
  ctx.save();ctx.translate(cx,cy);ctx.scale(sx,sy);
  ctx.strokeStyle=col;ctx.lineWidth=.9;ctx.lineCap='round';
  // Quarter-arc
  ctx.beginPath();ctx.arc(0,0,size,Math.PI/2,Math.PI);ctx.stroke();
  // Small decorative leaf cluster
  ctx.fillStyle=col;
  [0.25,0.5,0.75].forEach(t=>{
    const a=Math.PI/2+t*Math.PI/2;
    const lx=Math.cos(a)*size,ly=Math.sin(a)*size;
    ctx.save();ctx.translate(lx,ly);ctx.rotate(a+Math.PI/2);
    ctx.beginPath();ctx.ellipse(0,-size*.08,size*.04,size*.09,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// Extract RGB tuple (as "r,g,b" string) from any color for building rgba() dynamically
function colToRGB(col){
  const m=String(col).match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if(m)return `${m[1]},${m[2]},${m[3]}`;
  let hex=String(col).replace('#','');
  if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
  const r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16);
  if(isFinite(r)&&isFinite(g)&&isFinite(b))return `${r},${g},${b}`;
  return '0,0,0';
}

// Soft glowing bokeh dots (scattered, randomized via seed)
function drawBokeh(ctx,W,H,count,col,seed){
  const rng=seededRng(seed||1);const rgb=colToRGB(col);
  for(let i=0;i<count;i++){
    const x=rng()*W,y=rng()*H,r=4+rng()*22;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${rgb},.28)`);g.addColorStop(.5,`rgba(${rgb},.09)`);g.addColorStop(1,`rgba(${rgb},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
}

// Subtle film grain overlay
function drawFilmGrain(ctx,W,H,opacity,seed){
  const rng=seededRng(seed||1);
  ctx.save();ctx.fillStyle=`rgba(0,0,0,${opacity||.04})`;
  const n=Math.floor(W*H/280);
  for(let i=0;i<n;i++)ctx.fillRect(rng()*W,rng()*H,.7,.7);
  ctx.restore();
}

// Watercolor-style gradient blob with feathered edge
function drawWatercolorBlob(ctx,cx,cy,r,col,alpha){
  const rgb=colToRGB(col);const a=alpha||.4;
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
  g.addColorStop(0,`rgba(${rgb},${a})`);
  g.addColorStop(.55,`rgba(${rgb},${a*.35})`);
  g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
}

// Washi tape strip with torn-edge feel
function drawWashiTape(ctx,cx,cy,w,h,angle,col){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  ctx.globalAlpha=.72;ctx.fillStyle=col;
  ctx.fillRect(-w/2,-h/2,w,h);
  // Darker edges for depth
  ctx.globalAlpha=.45;ctx.fillStyle=shadeColor(col,-20);
  ctx.fillRect(-w/2,-h/2-.4,w,.6);
  ctx.fillRect(-w/2,h/2-.2,w,.6);
  // Hairline white highlight
  ctx.globalAlpha=.35;ctx.strokeStyle='#fff';ctx.lineWidth=.4;
  ctx.beginPath();ctx.moveTo(-w/2+2,-h/4);ctx.lineTo(w/2-2,-h/4);ctx.stroke();
  ctx.restore();
}

// Polaroid frame (decorative; draws frame + placeholder photo area)
function drawPolaroidFrame(ctx,cx,cy,w,h,angle,phColor){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  ctx.shadowColor='rgba(0,0,0,.22)';ctx.shadowBlur=6;ctx.shadowOffsetY=3;
  const pad=5,footer=h*.18;
  ctx.fillStyle='#fefdf8';
  ctx.fillRect(-w/2-pad,-h/2-pad,w+pad*2,h+pad+footer);
  ctx.shadowColor='transparent';
  // Photo placeholder (pastel gradient)
  const pc=phColor||'#d4c5a9';
  const rgb=colToRGB(pc);
  const g=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);
  g.addColorStop(0,`rgba(${rgb},.8)`);g.addColorStop(1,pc);
  ctx.fillStyle=g;ctx.fillRect(-w/2,-h/2,w,h);
  ctx.restore();
}

// Editorial gold rectangle frame with leaf corner accents
function drawGoldLeafFrame(ctx,x,y,w,h,col){
  ctx.save();
  ctx.strokeStyle=col;ctx.lineWidth=1.3;
  ctx.strokeRect(x,y,w,h);
  // Leaf accents at each corner
  const s=Math.min(w,h)*.04;
  [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{
    ctx.save();ctx.translate(cx,cy);ctx.scale(sx,sy);
    ctx.fillStyle=col;
    for(let a=0;a<3;a++){
      ctx.save();ctx.rotate(a*Math.PI/6+Math.PI/12);
      ctx.beginPath();ctx.ellipse(s*.9,0,s*.55,s*.17,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  });
  ctx.restore();
}

// Italic script watermark text (large, soft)
function drawScriptWatermark(ctx,text,cx,cy,size,col){
  ctx.save();
  ctx.fillStyle=col;
  ctx.font=`italic 700 ${size}px 'Playfair Display','Fraunces',serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,cx,cy);
  ctx.restore();
}

// Postcard-style circular stamp
function drawStampCircle(ctx,cx,cy,r,col,label){
  ctx.save();
  ctx.strokeStyle=col;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([2,2]);ctx.lineWidth=.6;
  ctx.beginPath();ctx.arc(cx,cy,r*.78,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=col;
  ctx.font=`800 ${r*.26}px 'Outfit','Inter',sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label||'',cx,cy);
  ctx.restore();
}

// Pine sprig (minimalist Christmas motif)
function drawPineSprig(ctx,cx,cy,size,angle,col){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,size*.035);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-size);ctx.stroke();
  const steps=9;
  for(let i=0;i<steps;i++){
    const t=(i+1)/(steps+1);const ny=-t*size;
    const len=size*.18*(1-t*.35);
    ctx.beginPath();ctx.moveTo(0,ny);ctx.lineTo(-len,ny+len*.45);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,ny);ctx.lineTo(len,ny+len*.45);ctx.stroke();
  }
  ctx.restore();
}

// Berry cluster (3-4 small berries with subtle highlight)
function drawBerryCluster(ctx,cx,cy,size,col){
  ctx.save();
  [[0,0,size*.34],[-size*.48,size*.14,size*.28],[size*.44,size*.22,size*.3],[size*.12,-size*.38,size*.24]].forEach(([dx,dy,r])=>{
    ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.38)';
    ctx.beginPath();ctx.arc(cx+dx-r*.28,cy+dy-r*.28,r*.3,0,Math.PI*2);ctx.fill();
  });
  ctx.restore();
}

// Crescent moon (carved via composite op)
function drawCrescent(ctx,cx,cy,r,col){
  ctx.save();
  ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath();ctx.arc(cx+r*.38,cy-r*.12,r*.88,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// Bare branch silhouette (elegant, for moody templates)
function drawBareBranch(ctx,cx,cy,size,angle,col){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  ctx.strokeStyle=col;ctx.lineWidth=size*.025;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.25,-size*.4,size,-size*.85);ctx.stroke();
  [[.3,-.6],[.5,-.55],[.7,-.65]].forEach(([tx,ty])=>{
    const bx=tx*size,by=ty*size;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+size*.22,by-size*.25);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-size*.05,by-size*.22);ctx.stroke();
  });
  ctx.restore();
}

// ═════════════════════════════════════════════════════════════
// PREMIUM HELPERS v2 — editorial / art-deco / painterly
// ═════════════════════════════════════════════════════════════

// 1. Curved text along an arc (for wedding/anniversary arched headings)
// Pass radius>0 for convex arc (text curves upward), radius<0 for concave
function drawArcText(ctx,text,cx,cy,radius,startAngle,col,font,letterGap){
  ctx.save();
  ctx.fillStyle=col;
  ctx.font=font||"italic 700 20px 'Playfair Display',serif";
  ctx.textAlign='center';ctx.textBaseline='middle';
  const chars=text.split('');
  const step=letterGap||.08;
  const total=(chars.length-1)*step;
  let ang=startAngle-total/2;
  const flip=radius<0?-1:1;const r=Math.abs(radius);
  for(const ch of chars){
    const x=cx+Math.cos(ang-Math.PI/2)*r*flip;
    const y=cy+Math.sin(ang-Math.PI/2)*r;
    ctx.save();ctx.translate(x,y);
    ctx.rotate(flip>0?ang:ang+Math.PI);
    ctx.fillText(ch,0,0);
    ctx.restore();
    ang+=step;
  }
  ctx.restore();
}

// 2. Halftone dot grid with size-varying density (editorial accent)
function drawHalftoneDots(ctx,x,y,w,h,density,col,fadeDir){
  ctx.save();ctx.fillStyle=col;
  const step=Math.max(4,Math.min(w,h)/density);
  for(let py=y;py<y+h;py+=step){
    for(let px=x;px<x+w;px+=step){
      let t;
      if(fadeDir==='down')t=(py-y)/h;
      else if(fadeDir==='up')t=1-(py-y)/h;
      else if(fadeDir==='right')t=(px-x)/w;
      else t=1;
      const r=Math.max(.4,step*.38*(1-t*.7));
      ctx.globalAlpha=.4+(1-t)*.5;
      ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

// 3. Art-deco radial sunburst (rays emanating from center)
function drawSunburst(ctx,cx,cy,innerR,outerR,rays,col){
  ctx.save();ctx.fillStyle=col;
  for(let i=0;i<rays;i++){
    const a1=i*Math.PI*2/rays;
    const a2=a1+Math.PI*2/rays*.45;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a1)*innerR,cy+Math.sin(a1)*innerR);
    ctx.lineTo(cx+Math.cos(a1)*outerR,cy+Math.sin(a1)*outerR);
    ctx.lineTo(cx+Math.cos(a2)*outerR,cy+Math.sin(a2)*outerR);
    ctx.lineTo(cx+Math.cos(a2)*innerR,cy+Math.sin(a2)*innerR);
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

// 4. Repeating chevron border (art-deco V-pattern)
function drawChevronBorder(ctx,x,y,w,h,size,col){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=size*.2;ctx.lineCap='square';ctx.lineJoin='miter';
  // Top edge
  for(let px=x;px<x+w-size;px+=size){
    ctx.beginPath();ctx.moveTo(px,y+size*.5);ctx.lineTo(px+size*.5,y);ctx.lineTo(px+size,y+size*.5);ctx.stroke();
  }
  // Bottom edge
  for(let px=x;px<x+w-size;px+=size){
    ctx.beginPath();ctx.moveTo(px,y+h-size*.5);ctx.lineTo(px+size*.5,y+h);ctx.lineTo(px+size,y+h-size*.5);ctx.stroke();
  }
  ctx.restore();
}

// 5. Clean 8-point geometric star (more refined than 5-point)
function drawStarburst8(ctx,cx,cy,size,col){
  ctx.save();ctx.fillStyle=col;
  ctx.beginPath();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const r=(i%2===0)?size:size*.42;
    const x=cx+Math.cos(a-Math.PI/2)*r,y=cy+Math.sin(a-Math.PI/2)*r;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();ctx.fill();
  ctx.restore();
}

// 6. Art-deco stepped/ziggurat corner frame
function drawDecoFrame(ctx,x,y,w,h,col,lw){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw||1.5;
  const s=Math.min(w,h)*.04;
  // Outer rect
  ctx.strokeRect(x,y,w,h);
  // Stepped corners
  [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{
    ctx.save();ctx.translate(cx,cy);ctx.scale(sx,sy);
    ctx.beginPath();
    ctx.moveTo(0,s*2.5);ctx.lineTo(s,s*2.5);ctx.lineTo(s,s*1.5);ctx.lineTo(s*2,s*1.5);ctx.lineTo(s*2,s);ctx.lineTo(s*2.5,s);ctx.lineTo(s*2.5,0);
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

// 7. Painterly brush stroke (layered bristles with jitter)
function drawBrushStroke(ctx,x1,y1,x2,y2,width,col,alpha){
  ctx.save();
  ctx.globalAlpha=alpha||.35;
  ctx.strokeStyle=col;ctx.lineCap='round';
  const bristles=7;
  for(let i=0;i<bristles;i++){
    const t=(i/(bristles-1))-.5;
    const ox=t*width*.8,oy=t*width*.15;
    ctx.lineWidth=width*.22+Math.random()*width*.08;
    ctx.globalAlpha=(alpha||.35)*(.55+Math.random()*.5);
    ctx.beginPath();
    ctx.moveTo(x1+ox,y1+oy);
    const midx=(x1+x2)/2+ox+Math.random()*width*.2-width*.1;
    const midy=(y1+y2)/2+oy+Math.random()*width*.2-width*.1;
    ctx.quadraticCurveTo(midx,midy,x2+ox,y2+oy);
    ctx.stroke();
  }
  ctx.restore();
}

// 8. Organic watercolor splash (many small low-opacity circles with jitter)
function drawWatercolorSplash(ctx,cx,cy,r,col,seed,alpha){
  const rng=seededRng(seed||1);const rgb=colToRGB(col);const a=alpha||.22;
  ctx.save();
  for(let i=0;i<34;i++){
    const ang=rng()*Math.PI*2;
    const dist=rng()*r*.9;
    const x=cx+Math.cos(ang)*dist,y=cy+Math.sin(ang)*dist;
    const rad=r*.2+rng()*r*.5;
    const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(${rgb},${a*(.4+rng()*.6)})`);
    g.addColorStop(1,`rgba(${rgb},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// 9. Modern confetti ribbon strip (refined, using shapes from a palette)
function drawConfettiRibbon(ctx,y,W,height,seed,palette){
  const rng=seededRng(seed||1);
  const count=Math.floor(W/12);
  ctx.save();
  for(let i=0;i<count;i++){
    const x=rng()*W,cy=y+rng()*height;
    const col=palette[i%palette.length];
    const shape=i%4;const s=3+rng()*5;
    ctx.save();ctx.translate(x,cy);ctx.rotate(rng()*Math.PI*2);
    ctx.globalAlpha=.7+rng()*.3;ctx.fillStyle=col;
    if(shape===0){ctx.fillRect(-s*.6,-s*.25,s*1.2,s*.5);} // tiny rect
    else if(shape===1){ctx.beginPath();ctx.arc(0,0,s*.45,0,Math.PI*2);ctx.fill();} // dot
    else if(shape===2){ // thin line
      ctx.strokeStyle=col;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();
    } else { // 4-point sparkle
      ctx.beginPath();
      ctx.moveTo(0,-s);ctx.lineTo(s*.25,0);ctx.lineTo(s,0);
      ctx.lineTo(s*.25,s*.25);ctx.lineTo(0,s);
      ctx.lineTo(-s*.25,s*.25);ctx.lineTo(-s,0);ctx.lineTo(-s*.25,0);
      ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

// 10. Gradient background with noise grain for tactile feel
function drawGrainGradient(ctx,W,H,c1,c2,angle,grainOp,seed){
  ctx.save();
  const a=(angle||0)*Math.PI/180;
  const dx=Math.cos(a)*W,dy=Math.sin(a)*H;
  const g=ctx.createLinearGradient(W/2-dx/2,H/2-dy/2,W/2+dx/2,H/2+dy/2);
  g.addColorStop(0,c1);g.addColorStop(1,c2);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  drawFilmGrain(ctx,W,H,grainOp||.05,seed||1);
  ctx.restore();
}

// 11. Large italic-serif monogram letter (centered, decorative watermark)
function drawMonogram(ctx,letter,cx,cy,size,col,font){
  ctx.save();
  ctx.fillStyle=col;
  ctx.font=font||`italic 900 ${size}px 'Playfair Display','Fraunces',serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(letter,cx,cy);
  ctx.restore();
}

// 12. Radial vignette (darken or lighten edges subtly)
function drawVignette(ctx,W,H,strength,col){
  const c=col||'rgba(0,0,0,1)';const s=strength||.35;
  const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);
  const rgb=colToRGB(c);
  g.addColorStop(0,`rgba(${rgb},0)`);
  g.addColorStop(1,`rgba(${rgb},${s})`);
  ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
}

// ═════════════════════════════════════════════════════════════
// PREMIUM HELPERS v3 — style-specific (editorial / wabi-sabi / deco / nouveau / med / riso / scandi)
// ═════════════════════════════════════════════════════════════

// 13. Grainy blur atmospheric background (2026 "grainy blur" aesthetic)
function drawGrainyBlur(ctx,W,H,col1,col2,grainOp,seed){
  const rng=seededRng(seed||1);
  const rgb1=colToRGB(col1),rgb2=colToRGB(col2);
  // Base fill
  ctx.fillStyle=col1;ctx.fillRect(0,0,W,H);
  // Overlapping soft color blobs
  for(let i=0;i<7;i++){
    const x=rng()*W,y=rng()*H;
    const r=Math.max(W,H)*(.35+rng()*.35);
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    const col=i%2===0?rgb1:rgb2;
    g.addColorStop(0,`rgba(${col},${.28+rng()*.28})`);
    g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  drawFilmGrain(ctx,W,H,grainOp||.08,seed||1);
}

// 14. Sumi-e single brushstroke (Japanese ink wash, wabi-sabi)
function drawSumiStroke(ctx,x1,y1,x2,y2,width,col,seed){
  const rng=seededRng(seed||1);
  ctx.save();ctx.strokeStyle=col;ctx.lineCap='round';
  for(let p=0;p<5;p++){
    ctx.globalAlpha=.18+rng()*.28;
    ctx.lineWidth=width*(1-p*.14);
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    const midx=(x1+x2)/2+(rng()-.5)*width*.4;
    const midy=(y1+y2)/2+(rng()-.5)*width*.4;
    ctx.quadraticCurveTo(midx,midy,x2,y2);
    ctx.stroke();
  }
  ctx.globalAlpha=.5;ctx.fillStyle=col;
  for(let i=0;i<6;i++){
    const t=rng();
    const x=x1+(x2-x1)*t+rng()*width*.3-width*.15;
    const y=y1+(y2-y1)*t+rng()*width*.3-width*.15;
    ctx.beginPath();ctx.arc(x,y,width*.08*rng(),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// 15. Art deco fan (quarter-sunburst rays)
function drawDecoFan(ctx,cx,cy,r,rays,angStart,angEnd,col){
  ctx.save();ctx.fillStyle=col;
  const range=angEnd-angStart;
  const step=range/rays;
  for(let i=0;i<rays;i++){
    if(i%2===0)continue;
    const a1=angStart+i*step,a2=a1+step;
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,a1,a2);ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,r*.008);
  ctx.beginPath();ctx.arc(cx,cy,r,angStart,angEnd);ctx.stroke();
  ctx.restore();
}

// 16. Ziggurat stepped frame (art deco)
function drawZiggurat(ctx,x,y,w,h,col,steps,lw){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw||1.4;
  const n=steps||3;
  const s=Math.min(w,h)*.02;
  for(let i=0;i<n;i++){
    const inset=i*s*1.6;
    ctx.strokeRect(x+inset,y+inset,w-inset*2,h-inset*2);
  }
  ctx.restore();
}

// 17. Art nouveau whiplash S-curve
function drawWhiplashCurve(ctx,x1,y1,x2,y2,col,width,tightness){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=width||1.4;ctx.lineCap='round';
  const t=tightness||.5;
  ctx.beginPath();ctx.moveTo(x1,y1);
  const c1x=x1+(x2-x1)*.15,c1y=y1+(y2-y1)*.85*t;
  const c2x=x1+(x2-x1)*.85,c2y=y2-(y2-y1)*.85*t;
  ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x2,y2);
  ctx.stroke();
  // Small botanical flourish at midpoint
  const mx=(x1+x2)/2,my=(y1+y2)/2;
  ctx.fillStyle=col;ctx.globalAlpha=.7;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.ellipse(mx+i*width*1.2-width*1.2,my,width*.5,width*.2,i*.3,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// 18. Stained-glass panel grid (art nouveau compartmentalization)
function drawStainedGlass(ctx,x,y,w,h,cols,rows,leadCol,fillCol){
  ctx.save();
  if(fillCol){ctx.fillStyle=fillCol;ctx.fillRect(x,y,w,h);}
  ctx.strokeStyle=leadCol;ctx.lineWidth=Math.max(1.4,Math.min(w,h)*.003);
  ctx.strokeRect(x,y,w,h);
  for(let i=1;i<cols;i++){
    const px=x+(i/cols)*w;
    ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+h);ctx.stroke();
  }
  for(let j=1;j<rows;j++){
    const py=y+(j/rows)*h;
    ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(x+w,py);ctx.stroke();
  }
  ctx.restore();
}

// 19. Linen cross-hatch texture (scandinavian fabric feel)
function drawLinenTexture(ctx,x,y,w,h,col,density){
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=.4;
  const step=density||3;
  ctx.globalAlpha=.3;
  for(let py=y;py<y+h;py+=step){
    ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(x+w,py);ctx.stroke();
  }
  ctx.globalAlpha=.18;
  for(let px=x;px<x+w;px+=step){
    ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+h);ctx.stroke();
  }
  ctx.restore();
}

// 20. Risograph two-color overprint block (multiply blend)
function drawRisoOverprint(ctx,x,y,w,h,col1,col2,offsetX,offsetY){
  ctx.save();
  ctx.globalCompositeOperation='multiply';
  ctx.globalAlpha=.55;
  ctx.fillStyle=col1;ctx.fillRect(x,y,w,h);
  ctx.translate(offsetX||3,offsetY||2);
  ctx.fillStyle=col2;ctx.fillRect(x,y,w,h);
  ctx.restore();
}

// 21. Wax seal (circular embossed seal with letter)
function drawWaxSeal(ctx,cx,cy,r,col,letter){
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=r*.3;ctx.shadowOffsetY=r*.08;
  ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='transparent';
  // Inner radial highlight for dimensional feel
  const g=ctx.createRadialGradient(cx-r*.3,cy-r*.35,0,cx,cy,r);
  g.addColorStop(0,'rgba(255,255,255,.25)');
  g.addColorStop(.5,'rgba(255,255,255,0)');
  g.addColorStop(1,'rgba(0,0,0,.2)');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  // Inner ring
  ctx.strokeStyle=shadeColor(col,-35);ctx.lineWidth=Math.max(.8,r*.05);
  ctx.beginPath();ctx.arc(cx,cy,r*.78,0,Math.PI*2);ctx.stroke();
  // Center letter
  if(letter){
    ctx.fillStyle=shadeColor(col,-30);
    ctx.font=`italic 900 ${r*.85}px 'Playfair Display','Fraunces',serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(letter,cx,cy+r*.04);
  }
  ctx.restore();
}

// 22. Pressed flower silhouette (flat Oshibana-style botanical)
function drawPressedFlower(ctx,cx,cy,size,petals,col){
  ctx.save();ctx.translate(cx,cy);
  ctx.fillStyle=col;ctx.globalAlpha=.78;
  const n=petals||6;
  for(let i=0;i<n;i++){
    ctx.save();ctx.rotate(i*Math.PI*2/n);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(size*.28,-size*.22,size*.8,-size*.2,size,0);
    ctx.bezierCurveTo(size*.8,size*.2,size*.28,size*.22,0,0);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha=1;
  ctx.fillStyle=shadeColor(col,-30);
  ctx.beginPath();ctx.arc(0,0,size*.15,0,Math.PI*2);ctx.fill();
  // Stem
  ctx.strokeStyle=shadeColor(col,-30);
  ctx.lineWidth=Math.max(.6,size*.025);
  ctx.globalAlpha=.85;
  ctx.beginPath();ctx.moveTo(0,size*.15);ctx.lineTo(0,size*1.8);ctx.stroke();
  // Two leaves on stem
  [.55,.85].forEach((t,idx)=>{
    const sy=size*.15+(size*1.65)*t;
    const side=idx%2===0?-1:1;
    ctx.fillStyle=col;ctx.globalAlpha=.78;
    ctx.beginPath();
    ctx.ellipse(side*size*.18,sy,size*.22,size*.08,side*.4,0,Math.PI*2);
    ctx.fill();
  });
  ctx.restore();
}

// ═════════════════════════════════════════════════════════════
// 8 STYLE PALETTES — research-driven, 2026 direction
// ═════════════════════════════════════════════════════════════
const STYLE_PALETTES={
  editorial_minimal:{bg1:'#fafaf7',bg2:'#f0efea',accent:'#1a1a1a',rule:'#b8a98a',soft:'#8a8578'},
  wabi_sabi:        {bg1:'#f3ede2',bg2:'#e8ddc8',accent:'#3d362c',rule:'#8a7866',soft:'#9a8a78'},
  art_deco_luxe:    {bg1:'#0a0a1a',bg2:'#1a1a2e',accent:'#d4af37',rule:'#d4af37',soft:'#a88828'},
  parisian:         {bg1:'#fbf9f4',bg2:'#f3efe6',accent:'#111111',rule:'#6b6b6b',soft:'#8a8578'},
  art_nouveau:      {bg1:'#f4ede0',bg2:'#e5d9c0',accent:'#4a5a3c',rule:'#b89968',soft:'#8a9b73'},
  mediterranean:    {bg1:'#f5dfc0',bg2:'#e8b793',accent:'#8b3a1c',rule:'#c97a2e',soft:'#d9a04c'},
  scandinavian:     {bg1:'#efece5',bg2:'#d9d4c8',accent:'#2a2a28',rule:'#8a8578',soft:'#a8a098'},
  riso_duotone:     {bg1:'#f0e8d5',bg2:'#e5d9b8',accent:'#c85a2e',rule:'#4a5a8a',soft:'#a8896d'}
};

function drawGarland(ctx,x,y,w,h,n,col){
  ctx.save();
  // Elegant curved string with small botanical leaves + occasional pearl
  const stringCol='rgba(0,0,0,.22)';
  const leafCol=col||'#a3b88a';
  ctx.strokeStyle=stringCol;ctx.lineWidth=.7;
  // Draw the hanging curve
  ctx.beginPath();
  for(let i=0;i<=n*4;i++){
    const t=i/(n*4);
    const gx=x+w*t;
    const gy=y+h*.5+h*.5*Math.sin(t*Math.PI*2*n/8);
    if(i===0)ctx.moveTo(gx,gy);else ctx.lineTo(gx,gy);
  }
  ctx.stroke();
  // Sprigs of leaves spaced along the curve
  for(let i=0;i<n;i++){
    const t=(i+.5)/n;
    const gx=x+w*t;
    const gy=y+h*.5+h*.5*Math.sin(t*Math.PI*2*n/8);
    // Leaf (ellipse)
    ctx.save();ctx.translate(gx,gy);ctx.rotate((i%2===0?1:-1)*.3);
    ctx.fillStyle=leafCol;ctx.globalAlpha=.85;
    ctx.beginPath();ctx.ellipse(0,4,3.5,7,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
    // Small pearl every few leaves
    if(i%3===0){
      const pg=ctx.createRadialGradient(gx,gy-2,0,gx,gy-2,3);
      pg.addColorStop(0,'#ffffff');pg.addColorStop(1,shadeColor(leafCol,30));
      ctx.fillStyle=pg;
      ctx.beginPath();ctx.arc(gx,gy-2,2.5,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}
function drawSimpleTree(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;
  ctx.beginPath();ctx.moveTo(x,y-size*.8);ctx.lineTo(x-size*.4,y);ctx.lineTo(x+size*.4,y);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x,y-size*.5);ctx.lineTo(x-size*.55,y+size*.3);ctx.lineTo(x+size*.55,y+size*.3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#5d4037';ctx.fillRect(x-size*.08,y+size*.3,size*.16,size*.2);
  ctx.restore();
}
function drawSunflower(ctx,x,y,size){
  ctx.save();ctx.translate(x,y);
  for(let i=0;i<12;i++){
    ctx.save();ctx.rotate(i*Math.PI/6);
    ctx.fillStyle='#f5c842';ctx.beginPath();ctx.ellipse(0,-size*.6,size*.15,size*.3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.fillStyle='#5d4037';ctx.beginPath();ctx.arc(0,0,size*.3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawDiploma(ctx,x,y,w,h){
  ctx.save();ctx.fillStyle='rgba(212,175,55,.3)';ctx.strokeStyle='rgba(212,175,55,.6)';ctx.lineWidth=1.5;
  ctx.roundRect(x-w/2,y,w,h,4);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(212,175,55,.6)';
  ctx.beginPath();ctx.arc(x-w*.35,y+h*.5,h*.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+w*.35,y+h*.5,h*.3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawMortarboard(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;ctx.translate(x,y);
  ctx.beginPath();ctx.moveTo(-size*.5,0);ctx.lineTo(size*.5,0);ctx.lineTo(size*.5,-size*.15);ctx.lineTo(-size*.5,-size*.15);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-size*.55,-size*.08);ctx.lineTo(0,-size*.4);ctx.lineTo(size*.55,-size*.08);ctx.closePath();ctx.fill();
  ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(size*.45,-size*.25);ctx.lineTo(size*.45,size*.18);ctx.stroke();
  ctx.beginPath();ctx.arc(size*.45,size*.22,size*.07,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawLaurel(ctx,x,y,size,col){
  ctx.save();ctx.fillStyle=col;
  for(let i=0;i<6;i++){
    const a=(i-2.5)*Math.PI/8;
    [-1,1].forEach(side=>{
      ctx.save();ctx.translate(x+side*Math.cos(a)*size*.7,y+Math.sin(a)*size*.5);ctx.rotate(a*side);
      ctx.beginPath();ctx.ellipse(0,0,size*.12,size*.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
    });
  }
  ctx.restore();
}

let activeOccCat='all';

function buildOccCategoryPills(){
  const el=document.getElementById('occ-cat-pills');
  OCC_CATEGORIES.forEach(c=>{
    const pill=document.createElement('button');
    pill.className='occ-pill'+(c.id==='all'?' active':'');
    pill.dataset.cat=c.id;
    if(c.id==='all'){pill.innerHTML='<i class="fa-solid fa-table-cells-large"></i> All';}
    else{pill.textContent=c.label;}
    pill.onclick=()=>{
      document.querySelectorAll('.occ-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
      activeOccCat=c.id;
      buildOccTemplateGrid();
    };
    el.appendChild(pill);
  });
}

function buildOccTemplateGrid(){
  const g=document.getElementById('occ-template-grid');g.innerHTML='';
  // Templates are lazy-loaded — show a loading state and trigger fetch if needed.
  if(!OCC_TEMPLATES){
    g.innerHTML=`<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-muted);font-size:12px"><i class="fa-solid fa-spinner fa-spin" style="font-size:18px;margin-bottom:8px;display:block"></i>Loading occasion templates…</div>`;
    loadOccTemplates().then(()=>buildOccTemplateGrid()).catch(()=>{
      g.innerHTML=`<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--danger);font-size:12px">Couldn't load templates. Refresh the page to try again.</div>`;
    });
    return;
  }
  // Templates flagged with cat:'any' (the blank starter) always show first regardless
  // of which category pill is active — they're cross-category starting points.
  const alwaysShown=OCC_TEMPLATES.filter(t=>t.cat==='any');
  const categoryShown=activeOccCat==='all'
    ?OCC_TEMPLATES.filter(t=>t.cat!=='any')
    :OCC_TEMPLATES.filter(t=>t.cat===activeOccCat);
  // When viewing "All", interleave templates round-robin by category for variety,
  // AND shuffle within each bucket (with a fixed seed so the order is stable per
  // session) so newer concept templates aren't buried at the bottom of each category.
  let mixed=categoryShown;
  if(activeOccCat==='all'){
    const buckets={};
    categoryShown.forEach(t=>{(buckets[t.cat]=buckets[t.cat]||[]).push(t);});
    // Fisher-Yates shuffle each bucket with a deterministic seed.
    const rng=seededRng(2026);
    Object.values(buckets).forEach(arr=>{
      for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(rng()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
    });
    // Also shuffle the category order so the same category isn't always first.
    const cats=Object.keys(buckets);
    for(let i=cats.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [cats[i],cats[j]]=[cats[j],cats[i]];
    }
    mixed=[];
    let added=true;
    while(added){
      added=false;
      for(const c of cats){
        if(buckets[c].length){mixed.push(buckets[c].shift());added=true;}
      }
    }
  }
  const filtered=[...alwaysShown,...mixed];
  filtered.forEach(t=>{
    const card=document.createElement('div');card.className='occ-tmpl-card';card.dataset.id=t.id;
    const cvs=document.createElement('canvas');cvs.width=124;cvs.height=94;
    drawRichOccPreview(cvs,t,124,94);
    card.appendChild(cvs);
    if(t.badge){
      const b=document.createElement('div');
      b.className=`occ-badge occ-badge-${t.badge==='hot'?'hot':'new'}`;
      b.textContent=t.badge==='hot'?'Ã°Å¸â€Â¥':'New';
      card.appendChild(b);
    }
    const info=document.createElement('div');info.className='occ-tmpl-info';
    const catData=OCC_CATEGORIES.find(c=>c.id===t.cat);
    const subLabel=t.cat==='any'
      ?'<i class="fa-solid fa-wand-magic-sparkles"></i> Start blank'
      :`${catData?.emoji||''} ${t.photoFrames.length} ${t.photoFrames.length===1?'photo':'photos'}`;
    info.innerHTML=`<div class="occ-tmpl-name">${t.name}</div><div class="occ-tmpl-sub">${subLabel}</div>`;
    card.appendChild(info);
    card.onclick=()=>confirmTemplateSwitch(()=>applyRichOccTemplate(t,card));
    g.appendChild(card);
  });
}

// Photo placeholder gradients that hint at real photo content
const PLACEHOLDER_GRADIENTS=[
  ['#fecaca','#fda4af'], // coral
  ['#bae6fd','#7dd3fc'], // sky
  ['#bbf7d0','#86efac'], // mint
  ['#fed7aa','#fdba74'], // peach
  ['#ddd6fe','#c4b5fd'], // lavender
  ['#fbcfe8','#f9a8d4'], // pink
  ['#fef08a','#fde047'], // lemon
  ['#a5b4fc','#818cf8'], // periwinkle
];
function drawRichOccPreview(canvas,t,W,H){
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  try{t.drawBg(ctx,W,H);}catch(e){}
  t.photoFrames.forEach(({rx,ry,rw,rh,angle,shape},i)=>{
    const px=rx*W,py=ry*H,pw=rw*W,ph=rh*H;
    const shapeId=shape||'rect';
    const isRect=shapeId==='rect';
    ctx.save();ctx.translate(px+pw/2,py+ph/2);ctx.rotate(angle*Math.PI/180);
    if(isRect){
      // Polaroid white card with shadow for rectangle frames.
      ctx.fillStyle='#fff';
      ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=4;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;
      ctx.fillRect(-pw/2-3,-ph/2-3,pw+6,ph+10);
      ctx.shadowColor='transparent';
    }else{
      // Drop shadow under the silhouette to mimic the live cell's filter.
      ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=4;ctx.shadowOffsetX=1;ctx.shadowOffsetY=2;
      ctx.fillStyle='#fff';
      ctx.beginPath();
      const sh=getCardShape(shapeId);
      sh.drawPath(ctx,-pw/2,-ph/2,pw,ph);
      ctx.fill();
      ctx.shadowColor='transparent';
    }
    // Photo placeholder gradient — clipped to the shape silhouette so circles look
    // like circles, hearts look like hearts, etc.
    const [c1,c2]=PLACEHOLDER_GRADIENTS[i%PLACEHOLDER_GRADIENTS.length];
    const g=ctx.createLinearGradient(-pw/2,-ph/2,pw/2,ph/2);
    g.addColorStop(0,c1);g.addColorStop(1,c2);
    ctx.save();
    if(!isRect){
      ctx.beginPath();
      const sh=getCardShape(shapeId);
      sh.drawPath(ctx,-pw/2,-ph/2,pw,ph);
      ctx.clip();
    }
    ctx.fillStyle=g;ctx.fillRect(-pw/2,-ph/2,pw,ph);
    ctx.restore();
    ctx.restore();
  });
  try{t.drawTitle(ctx,W,H);}catch(e){}
}

function applyRichOccTemplate(t,card,syncCategory){
  document.querySelectorAll('.occ-tmpl-card').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');

  // Ã¢â€â‚¬Ã¢â€â‚¬ Auto-switch to the Templates tab + sync category pill Ã¢â€â‚¬Ã¢â€â‚¬
  // Only runs when syncCategory is true (URL deep-link from a landing-page
  // hero CTA like /collage-maker?template=occ_xmas_magic). On regular user
  // clicks in the template grid we keep the currently-active category so
  // the user can browse "All" and pick a template without losing their
  // place in the list.
  if(syncCategory){
    if(typeof switchTab==='function'){
      const occBtn=Array.from(document.querySelectorAll('.stab')).find(b=>(b.getAttribute('onclick')||'').indexOf('occasions')!==-1);
      if(occBtn)switchTab('occasions',occBtn);
    }
    // Skip 'any' (the blank starter) — it's cross-category and shouldn't pin the filter.
    if(t.cat&&t.cat!=='any'&&t.cat!==activeOccCat){
      activeOccCat=t.cat;
      document.querySelectorAll('.occ-pill').forEach(p=>{
        p.classList.toggle('active',p.dataset.cat===t.cat);
      });
      if(typeof buildOccTemplateGrid==='function')buildOccTemplateGrid();
    }
  }

  // This template renders the full canvas as artwork — use a single-cell "frame"
  // We draw the themed bg onto the collage canvas via a special render mode
  currentTemplate={id:t.id,name:t.name,cells:[[0,0,1,1]],occTemplate:t};
  bgColor='#ffffff';bgImageDataUrl=null;currentPattern=null;

  // Suppress per-mutation history while we build the template — final saveHistory
  // at the bottom records the whole thing as one undo step.
  _suppressHistory=true;

  // Render the full themed canvas
  const cv=document.getElementById('collage-canvas');
  cv.style.backgroundImage='';cv.style.background='#fff';
  cells=[];cv.querySelectorAll('.cell').forEach(el=>el.remove());
  cv.style.width=canvasW+'px';cv.style.height=canvasH+'px';
  applyShadow();

  // Draw the rich background onto a hidden canvas, set as bg image
  const offscreen=document.createElement('canvas');
  offscreen.width=canvasW;offscreen.height=canvasH;
  const octx=offscreen.getContext('2d');
  t.drawBg(octx,canvasW,canvasH);
  // NOTE: drawTitle is NOT called here — title text is placed as movable DOM elements instead
  // This prevents overlap between canvas-painted text and DOM text layers

  // Place photo frames as real draggable cells. Each frame may include a `shape` key
  // (heart, star, circle, hexagon, diamond, ellipse) which clips the photo to that
  // silhouette; default is rectangular polaroid.
  // Shapes whose silhouette only reads correctly when the cell box is square
  // (heart, star, circle, hexagon, diamond). For these we collapse the per-axis
  // canvas dimensions to a single square size based on the smaller side, so the
  // shape never gets stretched into an ellipse (or, in the case of `circle(50%)`,
  // visibly chopped at top/bottom because CSS evaluates 50% against the
  // diagonal). The aspect-rescale lock in setCanvasSize keeps it square through
  // subsequent aspect changes.
  const lockedShapes=new Set(['heart','star','circle','hexagon','diamond']);
  t.photoFrames.forEach(({rx,ry,rw,rh,angle,shape},i)=>{
    let cw=rw*canvasW, ch=rh*canvasH;
    if(lockedShapes.has(shape)){
      const s=Math.min(cw,ch);
      cw=s;ch=s;
    }
    createOccCell({
      x:rx*canvasW,y:ry*canvasH,w:cw,h:ch,angle,zIndex:10+i,shape:shape||'rect',
    });
  });

  // Set the decorated bg as backgroundImage
  bgImageDataUrl=offscreen.toDataURL();
  cv.style.backgroundImage=`url(${bgImageDataUrl})`;
  cv.style.backgroundSize='cover';
  cv.style.backgroundPosition='center';

  // Ã¢â€â‚¬Ã¢â€â‚¬ Place canvasElements as real movable DOM elements Ã¢â€â‚¬Ã¢â€â‚¬
  // Remove any existing canvas elements from previous templates
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro').forEach(el=>el.remove());
  // Also clear Fabric text layer since template text is now handled by Fabric.
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}

  if(t.canvasElements&&t.canvasElements.length){
    t.canvasElements.forEach(ce=>{
      const ex=Math.round((ce.x||0)*canvasW);
      const ey=Math.round((ce.y||0)*canvasH);
      const ew=Math.round((ce.w||60));
      const eh=Math.round((ce.h||60));
      if(ce.kind==='shape'){
        // Build minimal opts matching addCanvasElem signature
        const opts={type:'shape',svg:ce.svg,id:ce.id||'shape',color:ce.color||'#ffffff',
          w:ew,h:eh,rot:ce.rot||0,opacity:ce.opacity||1,
          isLine:!!ce.isLine,isFrame:!!ce.isFrame};
        addCanvasElemAt(opts,ex,ey);
      } else if(ce.kind==='emoji'){
        const opts={type:'emoji',content:ce.content,w:ew,h:eh,rot:ce.rot||0,
          opacity:ce.opacity||1,fontSize:ce.fontSize||Math.round(ew*.75)};
        addCanvasElemAt(opts,ex,ey);
      } else if(ce.kind==='text'){
        addProTextAt(ce.text||'Text',ce.style||{},ex,ey,ce.align,ce.angle);
      }
    });
  }

  updateFillStats();
  if(typeof updateRightPanelGlobalActions==='function')updateRightPanelGlobalActions();
  _suppressHistory=false;
  saveHistory();
  // Reset the edited flag AFTER the initial snapshot so the freshly-loaded template
  // doesn't trigger the "switch template?" dialog on the very next click.
  _userHasEdited=false;
  showToast(`"${t.name}" template ready — add your photos!`,'success');
  hideMobNav();
}

// Create a single polaroid-style cell on the occasion canvas. Wires drag/resize/rotate
// and the action buttons (replace / crop / duplicate / remove). Returns the cell data.
// Geometry is in absolute canvas pixels: x, y, w, h, angle (degrees), zIndex.
function createOccCell(geom){
  const cv=document.getElementById('collage-canvas');
  const i=cells.length; // new cell index
  const shapeId=geom.shape||'rect';
  const isRect=shapeId==='rect';
  const cellEl=document.createElement('div');
  cellEl.className='cell occ-polaroid'+(isRect?'':' shape-'+shapeId);
  cellEl.dataset.shape=shapeId;
  cellEl.style.left=geom.x+'px';cellEl.style.top=geom.y+'px';
  cellEl.style.width=geom.w+'px';cellEl.style.height=geom.h+'px';
  cellEl.style.transform=`rotate(${geom.angle||0}deg)`;
  cellEl.style.transformOrigin='center';
  cellEl.style.borderRadius='2px';
  cellEl.style.zIndex=geom.zIndex||10+i;
  cellEl.style.cursor='move';
  cellEl.dataset.rot=String(geom.angle||0);
  if(isRect){
    // Polaroid look via CSS — white frame + shadow (moves with cell).
    cellEl.style.background='#fff';
    cellEl.style.padding='6px 6px 18px 6px';
    cellEl.style.boxSizing='border-box';
    cellEl.style.boxShadow='3px 5px 18px rgba(0,0,0,.28),1px 2px 6px rgba(0,0,0,.15)';
  }else{
    // Non-rect shapes: no polaroid frame. The clip-path lives on an INNER wrapper
    // (.cell-clip below) so the action buttons + resize/rotate handles aren't
    // clipped to the shape silhouette. A drop-shadow filter on the wrapper mimics
    // the polaroid lift around the cropped silhouette.
    cellEl.style.background='transparent';
    cellEl.style.padding='0';
    cellEl.style.boxSizing='border-box';
    cellEl.style.boxShadow='none';
  }

  // Inner clip-wrapper holds the photo + placeholder + overlay. The outer cell
  // hosts the action buttons + handles unclipped. For rect cells the wrapper has
  // no clip-path and just inherits the polaroid padding zone.
  const clipEl=document.createElement('div');
  clipEl.className='cell-clip';
  clipEl.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:hidden;';
  if(!isRect){
    // Make sure SVG-based clip paths (Heart) exist before referencing them.
    if(typeof installShapeClipPaths==='function')installShapeClipPaths();
    const sh=getCardShape(shapeId);
    clipEl.style.clipPath=sh.clipPath;
    clipEl.style.webkitClipPath=sh.clipPath;
    clipEl.style.filter='drop-shadow(2px 4px 8px rgba(0,0,0,.25))';
    clipEl.style.background='#eef0fb';
  }else{
    // Inherit polaroid padding so the photo sits inside the white frame.
    clipEl.style.top='6px';clipEl.style.left='6px';clipEl.style.right='6px';clipEl.style.bottom='18px';
    clipEl.style.width='auto';clipEl.style.height='auto';
  }
  cellEl.appendChild(clipEl);

  const ov=document.createElement('div');ov.className='cell-overlay';clipEl.appendChild(ov);
  const placeholder=document.createElement('div');placeholder.className='cell-ph';
  placeholder.innerHTML=`<div class="ph-circle"><i class="fa-solid fa-plus"></i></div><p>Tap to add photo</p>`;
  clipEl.appendChild(placeholder);
  const acts=document.createElement('div');acts.className='cell-actions';
  acts.innerHTML=`<button class="cab" title="Replace photo" onclick="triggerCellUpload(${i});event.stopPropagation()"><i class="fa-solid fa-arrow-up-from-bracket"></i></button><button class="cab" title="Crop" onclick="openCropModal(${i});event.stopPropagation()"><i class="fa-solid fa-crop"></i></button><button class="cab" title="Duplicate" onclick="duplicateOccCell(${i});event.stopPropagation()"><i class="fa-solid fa-clone"></i></button><button class="cab del" title="Remove photo or delete empty card" onclick="removeOccCellPhotoOrDelete(${i});event.stopPropagation()"><i class="fa-solid fa-xmark"></i></button>`;
  cellEl.appendChild(acts);

  const resizeHandle=document.createElement('div');
  resizeHandle.className='ce-resize';
  // Don't force display:block here — let the CSS show it only on :hover / .selected.
  attachResizeHandler(resizeHandle,cellEl,false);
  cellEl.appendChild(resizeHandle);

  const rotHandle=document.createElement('button');
  rotHandle.className='ce-rotate';rotHandle.innerHTML='<i class="fa-solid fa-rotate"></i>';
  attachRotateHandler(rotHandle,cellEl);
  cellEl.appendChild(rotHandle);

  // Drag — closures capture cellEl + the new index `i`. When the cell being dragged
  // is part of a multi-selection, every other DOM-selected element + the active
  // Fabric object/group rides along by the same delta so the user can move groups.
  let cellDragActive=false,cdStartX=0,cdStartY=0,cdStartL=0,cdStartT=0,cdMoved=false;
  // Cached starting positions of every co-moving item, captured at mousedown.
  let groupStarts=[];
  const captureGroupStarts=()=>{
    groupStarts=[];
    if(!multiSelectedDOM.has(cellEl))return; // not part of a group → solo drag
    multiSelectedDOM.forEach(el=>{
      if(el===cellEl||!el.style)return;
      groupStarts.push({type:'dom',el,sl:parseFloat(el.style.left)||0,st:parseFloat(el.style.top)||0});
    });
    if(typeof fabricCanvas!=='undefined'&&fabricCanvas){
      (fabricCanvas.getActiveObjects?.()||[]).forEach(o=>{
        groupStarts.push({type:'fabric',el:o,sl:o.left||0,st:o.top||0});
      });
    }
  };
  // If the input lands over a Fabric text that visually sits on top of this cell,
  // adopt the gesture: select the Fabric object AND drive its drag from the cell's
  // own touch/mouse listeners. This is necessary on mobile because Fabric's
  // upper-canvas pointer-events isn't pre-armed for touch, so the Fabric layer
  // never receives the touch — the cell does. Driving the drag from here lets
  // a single touch both select and move the text.
  let fabricDrag=null; // {obj, startX, startY, sl, st, moved}
  const startFabricGesture=(clientX,clientY)=>{
    const obj=fabricObjectAt(clientX,clientY);
    if(!obj||!fabricCanvas)return false;
    fabricCanvas.upperCanvasEl.style.pointerEvents='auto';
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.requestRenderAll();
    fabricDrag={obj,startX:clientX,startY:clientY,sl:obj.left||0,st:obj.top||0,moved:false};
    return true;
  };
  cellEl.addEventListener('mousedown',e=>{
    if(e.target.closest('.ce-resize,.ce-rotate,.cab,.cell-actions'))return;
    if(e.target.closest('.canvas-elem,.canvas-text-pro'))return;
    if(startFabricGesture(e.clientX,e.clientY)){e.stopPropagation();return;}
    cdStartX=e.clientX;cdStartY=e.clientY;
    cdStartL=parseFloat(cellEl.style.left)||0;
    cdStartT=parseFloat(cellEl.style.top)||0;
    cellDragActive=true;cdMoved=false;
    captureGroupStarts();
    e.stopPropagation();
  });
  cellEl.addEventListener('touchstart',e=>{
    if(e.target.closest('.ce-resize,.ce-rotate,.cab,.cell-actions'))return;
    const t=e.touches[0];
    if(startFabricGesture(t.clientX,t.clientY)){cellDragActive=false;e.stopPropagation();return;}
    cdStartX=t.clientX;cdStartY=t.clientY;
    cdStartL=parseFloat(cellEl.style.left)||0;
    cdStartT=parseFloat(cellEl.style.top)||0;
    cellDragActive=true;cdMoved=false;
    captureGroupStarts();
    e.stopPropagation();
  },{passive:true});
  const cellMouseMove=e=>{
    // Fabric drag adopted from the cell's listener — translate the active Fabric
    // object instead of the cell.
    if(fabricDrag){
      const cvRect=cv.getBoundingClientRect();
      const sx=canvasW/cvRect.width,sy=canvasH/cvRect.height;
      const t=e.touches?e.touches[0]:e;
      const dx=(t.clientX-fabricDrag.startX)*sx;
      const dy=(t.clientY-fabricDrag.startY)*sy;
      if(Math.abs(t.clientX-fabricDrag.startX)>4||Math.abs(t.clientY-fabricDrag.startY)>4)fabricDrag.moved=true;
      fabricDrag.obj.set({left:fabricDrag.sl+dx,top:fabricDrag.st+dy});
      fabricDrag.obj.setCoords();
      if(fabricCanvas)fabricCanvas.requestRenderAll();
      return;
    }
    if(!cellDragActive)return;
    const cvRect=cv.getBoundingClientRect();
    const sx=canvasW/cvRect.width,sy=canvasH/cvRect.height;
    const clientX=e.touches?e.touches[0].clientX:e.clientX;
    const clientY=e.touches?e.touches[0].clientY:e.clientY;
    const dx=clientX-cdStartX, dy=clientY-cdStartY;
    if(Math.abs(dx)>4||Math.abs(dy)>4)cdMoved=true;
    const ddx=dx*sx, ddy=dy*sy;
    cellEl.style.left=(cdStartL+ddx)+'px';
    cellEl.style.top=(cdStartT+ddy)+'px';
    // Move every co-moving item by the same delta.
    groupStarts.forEach(g=>{
      if(g.type==='dom'&&g.el.style){
        g.el.style.left=(g.sl+ddx)+'px';
        g.el.style.top=(g.st+ddy)+'px';
      }else if(g.type==='fabric'&&g.el){
        g.el.set({left:g.sl+ddx,top:g.st+ddy});
        g.el.setCoords();
      }
    });
    if(groupStarts.some(g=>g.type==='fabric')&&fabricCanvas)fabricCanvas.requestRenderAll();
  };
  const cellMouseUp=()=>{
    if(fabricDrag){
      if(fabricDrag.moved&&typeof saveHistory==='function')saveHistory();
      fabricDrag=null;
      return;
    }
    if(cellDragActive){cellDragActive=false;if(cdMoved)saveHistory();}
  };
  document.addEventListener('mousemove',cellMouseMove);
  document.addEventListener('mouseup',cellMouseUp);
  document.addEventListener('touchmove',e=>{if(cellDragActive)cellMouseMove(e);},{passive:true});
  document.addEventListener('touchend',cellMouseUp,{passive:true});

  // Look up the cell's current index by element reference rather than the closure-
  // captured `i` — that way handlers stay correct after a delete shifts the array.
  const liveIdx=()=>cells.findIndex(c=>c.el===cellEl);
  cellEl.onclick=e=>{
    if(e.target.closest('.canvas-elem,.canvas-text-pro,.ce-resize,.ce-rotate'))return;
    if(cdMoved){cdMoved=false;return;}
    if(fabricObjectAt(e.clientX,e.clientY)){e.stopPropagation();return;}
    e.stopPropagation();
    const cur=liveIdx();if(cur<0)return;
    const cd=cells[cur];
    if(!cd?.imgData)triggerCellUpload(cur);else selectCell(cur);
  };
  cellEl.addEventListener('touchend',e=>{
    if(cdMoved){cdMoved=false;return;}
    const t=e.changedTouches[0];
    const moved=Math.abs(t.clientX-cdStartX)>8||Math.abs(t.clientY-cdStartY)>8;
    if(!moved){
      // Tap-on-Fabric-text path: don't open the file picker, just leave the
      // Fabric text selected (already done by startFabricGesture in touchstart).
      if(fabricObjectAt(t.clientX,t.clientY)){e.stopPropagation();return;}
      e.stopPropagation();const cur=liveIdx();if(cur<0)return;const cd=cells[cur];if(!cd?.imgData)triggerCellUpload(cur);else selectCell(cur);
    }
  },{passive:true});
  cellEl.ondragover=e=>{e.preventDefault();cellEl.classList.add('drag-over');};
  cellEl.ondragleave=()=>cellEl.classList.remove('drag-over');
  cellEl.ondrop=e=>{e.preventDefault();cellEl.classList.remove('drag-over');const cur=liveIdx();if(cur>=0)dropOnCell(e,cur);};
  cv.appendChild(cellEl);

  const cd={el:cellEl,cellIndex:i,imgData:null,img:null,fit:'cover'};
  cells.push(cd);
  return cd;
}

// Duplicate an occasion-template cell (with photo if present). Drops the new cell at
// a slight offset from the source so it's visible. Called from the per-cell duplicate
// button rendered in createOccCell.
function duplicateOccCell(srcIdx){
  const src=cells[srcIdx];
  if(!src||!src.el)return;
  const srcL=parseFloat(src.el.style.left)||0;
  const srcT=parseFloat(src.el.style.top)||0;
  const srcW=parseFloat(src.el.style.width)||100;
  const srcH=parseFloat(src.el.style.height)||100;
  const angle=parseFloat(src.el.dataset.rot||'0');
  // Offset by ~30px on each axis but stay within the canvas.
  const offX=Math.min(30,Math.max(0,canvasW-srcL-srcW));
  const offY=Math.min(30,Math.max(0,canvasH-srcT-srcH));
  // Use the highest existing zIndex + 1 so the dup floats above the source.
  const maxZ=cells.reduce((m,c)=>Math.max(m,parseInt(c.el?.style.zIndex||10)),10);
  const newCd=createOccCell({
    x:srcL+offX,y:srcT+offY,w:srcW,h:srcH,angle,zIndex:maxZ+1,
    shape:src.el.dataset.shape||'rect',
  });
  if(src.imgData){
    newCd.fit=src.fit||'cover';
    setPhotoInCell(newCd.cellIndex,src.imgData,newCd);
  }
  saveHistory();
  if(typeof updateFillStats==='function')updateFillStats();
  showToast('Cell duplicated','success');
}

// Show a styled confirm dialog. Calls onConfirm() when user clicks the primary button.
//   opts.title    — heading text (default "Confirm")
//   opts.message  — body text
//   opts.icon     — Font Awesome class string (default fa-trash-can, danger color)
// Returns true if the user has done meaningful editing since the current template
// was loaded. Templates load under _suppressHistory so the flag stays false until a
// real user action (drag, resize, photo upload, text edit, etc.) triggers
// saveHistory. Reset to false at the end of every template apply.
function hasUserEdits(){
  return _userHasEdited;
}

// Wrap a template-apply call with a confirm dialog if the user has work in progress.
// Used by applyRichOccTemplate / applyTemplate / applyShapeTemplate so switching
// templates doesn't silently destroy the user's photos / text / stickers.
function confirmTemplateSwitch(applyFn){
  if(!hasUserEdits()){applyFn();return;}
  openConfirmDialog({
    title:'Switch template?',
    message:'Your current photos, text, and elements will be replaced. Use undo (Ctrl+Z) afterwards if you change your mind.',
    icon:'fa-arrows-rotate',
    confirmLabel:'Switch',
  },applyFn);
}

//   opts.confirmLabel  — primary button label (default "Confirm")
//   opts.danger   — true → red primary button (default true)
function openConfirmDialog(opts,onConfirm){
  const overlay=document.getElementById('generic-confirm-modal');
  if(!overlay){if(window.confirm(opts.message||'Are you sure?'))onConfirm&&onConfirm();return;}
  document.getElementById('gcm-title').textContent=opts.title||'Confirm';
  document.getElementById('gcm-msg').textContent=opts.message||'Are you sure?';
  const iconEl=document.getElementById('gcm-icon');
  iconEl.innerHTML=`<i class="fa-solid ${opts.icon||'fa-trash-can'}"></i>`;
  iconEl.style.color=opts.danger===false?'var(--accent)':'var(--danger)';
  const ok=document.getElementById('gcm-ok');
  ok.innerHTML=`<i class="fa-solid fa-check"></i> ${opts.confirmLabel||'Confirm'}`;
  if(opts.danger===false){ok.style.background='var(--accent)';ok.style.borderColor='var(--accent)';ok.style.boxShadow='';}
  else{ok.style.background='var(--danger)';ok.style.borderColor='var(--danger)';ok.style.boxShadow='0 2px 8px rgba(224,82,82,.3)';}
  // Replace the click handler so previous bindings don't stack.
  ok.onclick=()=>{closeModal('generic-confirm-modal');onConfirm&&onConfirm();};
  overlay.classList.add('open');
}

// × button on an occasion cell: if the cell holds a photo, just remove the photo
// (matches the prior behavior). If the cell is empty, ask whether to delete the whole
// card — empty cards are a leftover of the template, and the user usually wants to
// reclaim that real estate. Refuses to delete the last remaining cell.
function removeOccCellPhotoOrDelete(idx){
  const cd=cells[idx];
  if(!cd)return;
  if(cd.imgData){
    removeCellPhoto(idx);
    return;
  }
  if(!cd.el?.classList.contains('occ-polaroid'))return;
  if(cells.length<=1){showToast('Cannot delete the last cell','error');return;}
  openConfirmDialog({
    title:'Delete this card?',
    message:'This empty card will be removed from the layout.',
    icon:'fa-trash',
    confirmLabel:'Delete card',
  },()=>deleteOccCell(idx));
}

// Update the persistent action row above the right-panel body. Visible whenever an
// occasion template is active (regardless of what's selected) so the user can always
// add another card without having to first click an existing one.
function updateRightPanelGlobalActions(){
  const host=document.getElementById('rp-global-actions');
  if(!host)return;
  const isOcc=!!(currentTemplate&&currentTemplate.occTemplate);
  if(isOcc){
    // Shape buttons — clicking each adds a new card cropped to that shape. Photos
    // uploaded into the card get clipped to the silhouette automatically.
    const shapeBtns=CARD_SHAPES.map(s=>
      `<button class="rp-shape-btn" title="Add ${s.name} card" onclick="addOccCell('${s.id}')"><i class="fa-solid ${s.faIcon}"></i></button>`
    ).join('');
    host.innerHTML=`
      <div style="padding:10px 14px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted)">Add Card</div>
      <div style="padding:0 14px 10px;display:grid;grid-template-columns:repeat(${CARD_SHAPES.length},1fr);gap:6px">${shapeBtns}</div>`;
  }else{
    host.innerHTML='';
  }
}

// Add a fresh occasion-template card of the given shape (defaults to 'rect').
// Sized to match the average of existing cells (so it visually fits the layout)
// with a sensible fallback for empty canvases.
function addOccCell(shape){
  shape=shape||'rect';
  // Average size from existing occ cells, or sensible default.
  const polaroids=cells.filter(c=>c.el?.classList.contains('occ-polaroid'));
  let w,h;
  if(polaroids.length){
    const totals=polaroids.reduce((acc,c)=>{
      acc.w+=parseFloat(c.el.style.width)||0;
      acc.h+=parseFloat(c.el.style.height)||0;
      return acc;
    },{w:0,h:0});
    w=totals.w/polaroids.length;
    h=totals.h/polaroids.length;
  }else{
    w=Math.round(canvasW*.32);
    h=Math.round(canvasH*.32);
  }
  // Centre the new card, then nudge by 20px × number of existing polaroids so multiple
  // adds don't perfectly overlap.
  // Heart / circle / star / etc. read better with 1:1 aspect; rect keeps the
  // averaged source aspect so it slots into existing layouts cleanly.
  if(shape!=='rect'&&shape!=='ellipse'){
    const side=Math.min(w,h);
    w=side;h=side;
  }
  const offset=Math.min(polaroids.length*20,Math.max(canvasW,canvasH)*.2);
  const x=Math.max(0,Math.min(canvasW-w,(canvasW-w)/2+offset-30));
  const y=Math.max(0,Math.min(canvasH-h,(canvasH-h)/2+offset-30));
  const maxZ=cells.reduce((m,c)=>Math.max(m,parseInt(c.el?.style.zIndex||10)),10);
  const newCd=createOccCell({x,y,w,h,angle:0,zIndex:maxZ+1,shape});
  if(typeof updateFillStats==='function')updateFillStats();
  saveHistory();
  // Select the new card so the user can immediately upload / position it.
  selectCell(newCd.cellIndex);
  showToast(`${getCardShape(shape).name} card added`,'success');
}

// Delete an occasion-template cell entirely (DOM + cells array entry). Re-indexes the
// remaining cells and rewrites their action-button onclick strings so they reference
// the new positions. Live drag/click closures use `liveIdx()` so they don't need to
// be rewritten. Refuses to remove the last cell on the canvas.
function deleteOccCell(srcIdx){
  const cd=cells[srcIdx];
  if(!cd||!cd.el)return;
  if(cells.length<=1){showToast('Cannot delete the last cell','error');return;}
  cd.el.remove();
  cells.splice(srcIdx,1);
  // Rewrite the inline onclick handlers on each remaining cell's action row so that
  // baked-in indexes match the new array position.
  cells.forEach((c,newIdx)=>{
    c.cellIndex=newIdx;
    if(!c.el)return;
    const acts=c.el.querySelector('.cell-actions');
    if(acts){
      acts.innerHTML=`<button class="cab" title="Replace photo" onclick="triggerCellUpload(${newIdx});event.stopPropagation()"><i class="fa-solid fa-arrow-up-from-bracket"></i></button><button class="cab" title="Crop" onclick="openCropModal(${newIdx});event.stopPropagation()"><i class="fa-solid fa-crop"></i></button><button class="cab" title="Duplicate" onclick="duplicateOccCell(${newIdx});event.stopPropagation()"><i class="fa-solid fa-clone"></i></button><button class="cab del" title="Remove photo or delete empty card" onclick="removeOccCellPhotoOrDelete(${newIdx});event.stopPropagation()"><i class="fa-solid fa-xmark"></i></button>`;
    }
  });
  if(selectedCell===srcIdx)selectedCell=null;
  else if(selectedCell!=null&&selectedCell>srcIdx)selectedCell=selectedCell-1;
  if(typeof updateRightPanel==='function')updateRightPanel(selectedCell);
  if(typeof updateFillStats==='function')updateFillStats();
  saveHistory();
  showToast('Card deleted','success');
}

// Helper: addCanvasElem at specific coords (not centered)
function addCanvasElemAt(opts,x,y){
  const canvas=document.getElementById('collage-canvas');
  const el=document.createElement('div');
  el.className='canvas-elem';
  el.dataset.elemType=opts.type;
  el.dataset.elemId=opts.id||'custom';
  el.dataset.rot=opts.rot||0;
  el.dataset.color=opts.color||'#ffffff';
  el.style.cssText=`left:${x}px;top:${y}px;width:${opts.w}px;height:${opts.h}px;transform:rotate(${opts.rot||0}deg);opacity:${opts.opacity||1};z-index:50;`;
  if(opts.type==='emoji'){
    el.innerHTML=`<span style="font-size:${opts.fontSize||48}px;line-height:1;display:block;text-align:center;user-select:none">${opts.content}</span>`;
  } else {
    const fillVal=opts.isLine||opts.isFrame?'none':opts.color||'#ffffff';
    const strokeVal=opts.isLine||opts.isFrame?opts.color||'#ffffff':'none';
    el.innerHTML=`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;color:${opts.color};fill:${fillVal};stroke:${strokeVal}">${opts.svg}</svg>`;
  }
  const del=document.createElement('button');del.className='ce-del';del.innerHTML='<i class="fa-solid fa-xmark"></i>';
  del.onclick=e=>{e.stopPropagation();el.remove();if(selectedElem===el){selectedElem=null;updateRightPanel(null);}saveHistory();};
  el.appendChild(del);
  const resize=document.createElement('div');resize.className='ce-resize';
  attachResizeHandler(resize,el);el.appendChild(resize);
  const rot=document.createElement('button');rot.className='ce-rotate';rot.innerHTML='<i class="fa-solid fa-rotate"></i>';
  attachRotateHandler(rot,el);el.appendChild(rot);
  attachDragHandler(el);
  el.onclick=e=>{e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);};
  canvas.appendChild(el);
}

// Helper: addProText at specific coords. Routes to the Fabric text layer. The `align`
// argument controls origin the same way the old DOM version did:
//   'center' → horizontally centered on x
//   'right'  → right-edge at x
//   default  → left-edge at x
// Used by templates which add many text layers in one pass — explicitly disables
// auto-selection so the canvas isn't covered in selection handles after loading.
function addProTextAt(text,styles,x,y,align,angle){
  return addFabricTextAt(text,styles,x,y,align,{autoSelect:false,angle:angle||0});
}

function buildStickerGrid(){
  const g=document.getElementById('sticker-grid');g.innerHTML='';
  STICKERS.forEach(s=>{const d=document.createElement('div');d.className='sticker-item';d.textContent=s;d.onclick=()=>{placeSticker(s);closeModal('sticker-modal');};g.appendChild(d);});
}

let activeCountFilter = 'all';
let customBuilderCount = 4;

function buildCountPills(){
  const g = document.getElementById('count-pills');
  if(!g) return;
  g.innerHTML = '';
  // Collect unique counts
  const counts = [...new Set(TEMPLATES.map(t=>t.n))].sort((a,b)=>a-b);
  // "All" pill
  const allP = document.createElement('button');
  allP.className = 'count-pill active'; allP.textContent = 'All';
  allP.onclick = () => { activeCountFilter='all'; g.querySelectorAll('.count-pill').forEach(p=>p.classList.remove('active')); allP.classList.add('active'); buildTemplateGrid(); };
  g.appendChild(allP);
  counts.forEach(n => {
    const p = document.createElement('button');
    p.className = 'count-pill'; p.textContent = n === 1 ? '1 photo' : `${n}`;
    p.onclick = () => { activeCountFilter=n; g.querySelectorAll('.count-pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); buildTemplateGrid(); };
    g.appendChild(p);
  });
}

function buildTemplateGrid(){
  // Always clear and rebuild the dedicated sections container
  const container = document.getElementById('layout-sections');
  if(!container) return;
  container.innerHTML = '';

  const filtered = activeCountFilter==='all' ? TEMPLATES : TEMPLATES.filter(t=>t.n===activeCountFilter);

  // Group by count
  const groups = {};
  filtered.forEach(t=>{ if(!groups[t.n])groups[t.n]=[]; groups[t.n].push(t); });

  Object.keys(groups).sort((a,b)=>+a-+b).forEach(n => {
    // Section label
    const lbl = document.createElement('div');
    lbl.className = 'tmpl-section-label';
    lbl.textContent = n==1 ? '1 Photo' : `${n} Photos`;
    container.appendChild(lbl);

    // Grid of cards
    const grid = document.createElement('div');
    grid.className = 'template-grid';
    if(!document.getElementById('template-grid')) grid.id = 'template-grid';

    groups[n].forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card'; card.dataset.id = t.id;
      // Templates with shapeCells (e.g. 20 Frame + Heart) preview through the shape
      // renderer so shaped cells draw as their real outline instead of a rect.
      card.innerHTML = `${t.shapeCells?renderShapeTmplSVG({id:t.id,cells:t.shapeCells}):renderTmplSVG(t)}<div class="tmpl-badge">${t.n}</div><div class="template-name">${t.name}</div>`;
      card.onclick = () => confirmTemplateSwitch(() => applyTemplate(t, card));
      grid.appendChild(card);
    });
    container.appendChild(grid);
  });

  // Ensure template-grid id exists
  if(!document.getElementById('template-grid')){
    const first = container.querySelector('.template-grid');
    if(first) first.id = 'template-grid';
  }

  // Shape frames section
  const sLbl = document.createElement('div');
  sLbl.className = 'tmpl-section-label'; sLbl.textContent = 'Shape Frames';
  container.appendChild(sLbl);

  const sg = document.createElement('div');
  sg.className = 'template-grid'; sg.id = 'shape-template-grid';
  SHAPE_TEMPLATES.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'template-card'; card.dataset.id = t.id;
    card.innerHTML = `${renderShapeTmplSVG(t)}<div class="tmpl-badge">${t.icon}</div><div class="template-name">${t.name}</div>`;
    card.onclick = () => confirmTemplateSwitch(() => applyShapeTemplate(t, card));
    sg.appendChild(card);
  });
  container.appendChild(sg);
}

function customBuilderChange(delta){
  customBuilderCount = Math.max(1, Math.min(50, customBuilderCount + delta));
  const el = document.getElementById('cb-count');
  if(el) el.textContent = customBuilderCount;
}

function applyCustomLayout(){
  const n = customBuilderCount;
  const style = document.getElementById('cb-style').value;
  let cells = [];

  if(style === 'grid'){
    // Auto-compute best grid dimensions
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const w = 1/cols, h = 1/rows;
    for(let i=0; i<n; i++){
      const c = i%cols, r = Math.floor(i/cols);
      cells.push([c*w, r*h, w, h]);
    }
  } else if(style === 'row'){
    const h = 1/n;
    for(let i=0;i<n;i++) cells.push([0, i*h, 1, h]);
  } else if(style === 'col'){
    const w = 1/n;
    for(let i=0;i<n;i++) cells.push([i*w, 0, w, 1]);
  } else if(style === 'masonry'){
    // 2-column masonry with varied heights
    const col0=[],col1=[];let y0=0,y1=0;
    for(let i=0;i<n;i++){
      const tall = (i%3===0)?0.38:0.28;
      if(y0<=y1){ col0.push([0,y0,.5,tall]); y0+=tall; }
      else{ col1.push([.5,y1,.5,tall]); y1+=tall; }
    }
    const total=Math.max(y0,y1);
    // Normalize heights
    [...col0,...col1].forEach(c=>{c[3]=c[3]/total;c[1]=c[1]/total;});
    cells=[...col0,...col1];
  } else if(style === 'feature'){
    // First photo big (60% width), rest in a column on the right or grid below
    if(n===1){ cells=[[0,0,1,1]]; }
    else if(n<=4){
      cells.push([0,0,.6,1]);
      const rh=1/(n-1);
      for(let i=1;i<n;i++) cells.push([.6,(i-1)*rh,.4,rh]);
    } else {
      cells.push([0,0,.6,.55]);
      const topRest=n>3?2:n-1;
      const tw=.4/topRest;
      for(let i=0;i<topRest;i++) cells.push([.6+i*tw,0,tw,.55]);
      const botRest=n-1-topRest;
      const bw=1/botRest;
      for(let i=0;i<botRest;i++) cells.push([i*bw,.55,bw,.45]);
    }
  }

  if(!cells.length){ showToast('Could not generate layout','error'); return; }

  const t = {n, name:`Custom ${n}`, id:`custom_${Date.now()}`, cells};
  // Clear occasion template bg
  const cv = document.getElementById('collage-canvas');
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro,.canvas-text').forEach(el=>el.remove());
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}
  selectedElem=null; bgImageDataUrl=null; currentPattern=null;
  cv.style.backgroundImage=''; bgColor=bgColor||'#ffffff'; applyBgToCanvas();
  document.querySelectorAll('.template-card,.occ-tmpl-card').forEach(c=>c.classList.remove('selected'));
  currentTemplate=t;
  saveHistory(); renderCollage(); updateFillStats();
  showToast(`Custom ${n}-photo layout created!`,'success');
  hideMobNav();
}

function renderShapeTmplSVG(t){
  const W=88,H=70;
  const items=t.cells.map((c,i)=>{
    const x=c.x*W,y=c.y*H,w=c.w*W,h=c.h*H;
    const cx=x+w/2,cy=y+h/2,rx=w/2,ry=h/2;
    const cols=['#c5caea','#d6daef','#b8bfe5','#cdd2f0','#bfc5e8'];
    const fill=cols[i%cols.length];
    const id=`cp${t.id}${i}`;
    switch(c.shape){
      case 'heart':{
        // Smooth SVG path heart
        const hx=cx, hy1=y+h*0.85, hy2=y+h*0.3, hy3=y+h*0.2;
        return `<path d="M ${hx} ${hy1} C ${x+w*0.8} ${y+h*0.65} ${x+w} ${y+h*0.5} ${x+w} ${hy2} C ${x+w} ${y+h*0.1} ${x+w*0.75} ${y} ${hx} ${hy3} C ${x+w*0.25} ${y} ${x} ${y+h*0.1} ${x} ${hy2} C ${x} ${y+h*0.5} ${x+w*0.2} ${y+h*0.65} ${hx} ${hy1} Z" fill="${fill}"/>`;
      }
      case 'heartL':{
        return `<path d="M ${x+w} ${y+h*0.85} C ${x+w*0.6} ${y+h*0.65} ${x+w*0.4} ${y+h*0.5} ${x+w*0.4} ${y+h*0.3} C ${x+w*0.4} ${y+h*0.1} ${x+w*0.55} ${y} ${x+w} ${y+h*0.2} L ${x+w*0.82} ${y+h*0.28} L ${x+w*0.9} ${y+h*0.42} L ${x+w*0.8} ${y+h*0.56} L ${x+w*0.9} ${y+h*0.7} L ${x+w} ${y+h*0.85} Z" fill="${fill}"/>`;
      }
      case 'heartR':{
        return `<path d="M ${x} ${y+h*0.85} L ${x+w*0.1} ${y+h*0.7} L ${x} ${y+h*0.56} L ${x+w*0.1} ${y+h*0.42} L ${x} ${y+h*0.28} L ${x+w*0.18} ${y+h*0.2} C ${x+w*0.45} ${y} ${x+w*0.6} ${y+h*0.1} ${x+w*0.6} ${y+h*0.3} C ${x+w*0.6} ${y+h*0.5} ${x+w*0.4} ${y+h*0.65} ${x} ${y+h*0.85} Z" fill="${fill}"/>`;
      }
      case 'circle': return `<circle cx="${cx}" cy="${cy}" r="${Math.min(rx,ry)*.95}" fill="${fill}"/>`;
      case 'star':{
        const pts=[];const n=5,r1=Math.min(rx,ry),r2=r1*.4;
        for(let j=0;j<n*2;j++){const a=j*Math.PI/n-Math.PI/2;const r=j%2===0?r1:r2;pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);}
        return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
      }
      case 'hexagon':{
        const pts=[];for(let j=0;j<6;j++){const a=j*Math.PI/3-Math.PI/6;pts.push(`${cx+Math.min(rx,ry)*Math.cos(a)},${cy+Math.min(rx,ry)*Math.sin(a)}`);}
        return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
      }
      case 'diamond': return `<polygon points="${cx},${y} ${x+w},${cy} ${cx},${y+h} ${x},${cy}" fill="${fill}"/>`;
      case 'triangle': return `<polygon points="${cx},${y} ${x+w},${y+h} ${x},${y+h}" fill="${fill}"/>`;
      case 'arrow': return `<polygon points="${x},${y+h*.2} ${x+w*.65},${y+h*.2} ${x+w*.65},${y} ${x+w},${cy} ${x+w*.65},${y+h} ${x+w*.65},${y+h*.8} ${x},${y+h*.8}" fill="${fill}"/>`;
      case 'shield': return `<polygon points="${x+w*.1},${y} ${x+w*.9},${y} ${x+w},${y+h*.05} ${x+w},${y+h*.45} ${x+w*.85},${y+h*.7} ${x+w*.65},${y+h*.88} ${cx},${y+h} ${x+w*.35},${y+h*.88} ${x+w*.15},${y+h*.7} ${x},${y+h*.45} ${x},${y+h*.05}" fill="${fill}"/>`;
      case 'vshape': return `<polygon points="${x},${y} ${x+w*.3},${y} ${x+w*.5},${y+h*.5} ${x+w*.7},${y} ${x+w},${y} ${x+w},${y+h*.25} ${x+w*.55},${y+h} ${x+w*.45},${y+h} ${x},${y+h*.25}" fill="${fill}"/>`;
      case 'xbandA': return `<polygon points="${x},${y} ${x+w*.25},${y} ${x+w},${y+h*.75} ${x+w},${y+h} ${x+w*.75},${y+h} ${x},${y+h*.25}" fill="${fill}"/>`;
      case 'xbandB': return `<polygon points="${x+w*.75},${y} ${x+w},${y} ${x+w},${y+h*.25} ${x+w*.25},${y+h} ${x},${y+h} ${x},${y+h*.75}" fill="${fill}"/>`;
      case 'hexS1': return `<polygon points="${x},${y} ${x},${y+h} ${x+w},${y+h*.5}" fill="${fill}"/>`;
      case 'hexS2': return `<polygon points="${x},${y+h*.5} ${x+w},${y} ${x+w},${y+h}" fill="${fill}"/>`;
      case 'hexS3': return `<polygon points="${x},${y} ${x+w},${y+h*.5} ${x},${y+h}" fill="${fill}"/>`;
      case 'hexS4': return `<polygon points="${x+w},${y} ${x+w},${y+h} ${x},${y+h*.5}" fill="${fill}"/>`;
      case 'hexS5': return `<polygon points="${x+w},${y+h*.5} ${x},${y+h} ${x},${y}" fill="${fill}"/>`;
      case 'hexS6': return `<polygon points="${x+w},${y+h} ${x},${y+h*.5} ${x+w},${y}" fill="${fill}"/>`;
      case 'pinTR': return `<polygon points="${x},${y+h} ${x+w},${y} ${x+w},${y+h}" fill="${fill}"/>`;
      case 'pinBR': return `<polygon points="${x},${y} ${x+w},${y+h} ${x},${y+h}" fill="${fill}"/>`;
      case 'pinBL': return `<polygon points="${x+w},${y} ${x},${y+h} ${x},${y}" fill="${fill}"/>`;
      case 'pinTL': return `<polygon points="${x+w},${y+h} ${x},${y} ${x+w},${y}" fill="${fill}"/>`;
      default: return `<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="2" fill="${fill}"/>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#eef0fb" rx="6"/>${items.join('')}</svg>`;
}

function applyShapeTemplate(t,card){
  _suppressHistory=true;
  // Clear occasion template leftovers
  const cv=document.getElementById('collage-canvas');
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro,.canvas-text').forEach(el=>el.remove());
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}
  selectedElem=null;
  bgImageDataUrl=null;currentPattern=null;
  cv.style.backgroundImage='';cv.style.backgroundSize='';cv.style.backgroundPosition='';
  bgColor=bgColor||'#ffffff';applyBgToCanvas();

  document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.occ-tmpl-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');

  // Convert shape template cells to standard format with clip metadata
  currentTemplate={id:t.id,name:t.name,cells:t.cells.map(c=>[c.x,c.y,c.w,c.h]),shapeCells:t.cells};
  renderShapeCollage();updateFillStats();
  if(typeof updateRightPanelGlobalActions==='function')updateRightPanelGlobalActions();
  _suppressHistory=false;
  saveHistory();
  _userHasEdited=false;
  showToast(`"${t.name}" shape layout`,'success');
  hideMobNav();
}

function renderTmplSVG(t){
  const pad=4,W=80,H=64,iw=W-pad*2,ih=H-pad*2;
  const cols=['#c5caea','#d6daef','#b8bfe5','#cdd2f0','#bfc5e8','#d0d4f0'];
  const rects=t.cells.map(([x,y,w,h],i)=>{
    const rx=pad+x*iw,ry=pad+y*ih,rw=Math.max(2,w*iw-1.5),rh=Math.max(2,h*ih-1.5);
    return `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" rx="2" fill="${cols[i%cols.length]}"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#eef0fb" rx="6"/>${rects}</svg>`;
}

function applyTemplate(t,card){
  _suppressHistory=true;
  currentTemplate=t;
  document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.occ-tmpl-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');

  // Clear all occasion template decorations: canvas elements, text layers, bg image
  const cv=document.getElementById('collage-canvas');
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro,.canvas-text').forEach(el=>el.remove());
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}
  selectedElem=null;

  // Reset background to plain color
  bgImageDataUrl=null;
  currentPattern=null;
  cv.style.backgroundImage='';
  cv.style.backgroundSize='';
  cv.style.backgroundPosition='';
  // Keep bgColor as-is (user's chosen color) or reset to default white
  bgColor=bgColor||'#ffffff';
  applyBgToCanvas();

  if(currentTemplate.shapeCells){renderShapeCollage();}else{renderCollage();}
  updateFillStats();
  if(typeof updateRightPanelGlobalActions==='function')updateRightPanelGlobalActions();
  _suppressHistory=false;
  saveHistory();
  _userHasEdited=false;
  showToast(`"${t.name}" — ${t.cells.length} cells`,'success');
  hideMobNav();
}

// RENDER
// Central helper — always call this to apply background, never set style.background directly
function applyBgToCanvas(){
  const cv=document.getElementById('collage-canvas');
  if(bgImageDataUrl){
    // uploaded or canvas-drawn image
    cv.style.background='';
    cv.style.backgroundImage=`url(${bgImageDataUrl})`;
    cv.style.backgroundSize='cover';
    cv.style.backgroundPosition='center';
  } else if(currentPattern){
    // pattern (already set by applyPattern, just leave it)
  } else {
    // solid color or gradient — use background shorthand, clear backgroundImage first
    cv.style.backgroundImage='';
    cv.style.backgroundSize='';
    cv.style.backgroundPosition='';
    cv.style.background=bgColor;
  }
}


// Ã¢â€â‚¬Ã¢â€â‚¬ SHAPE COLLAGE RENDERER Ã¢â€â‚¬Ã¢â€â‚¬
function getClipPathCSS(shape, w, h){
  // Returns a CSS clip-path string using % values (polygon) or px path()
  // w, h are the actual pixel dimensions of the element
  const W=w, H=h;
  switch(shape){
    case 'heart':{
      // Smooth heart using cubic bezier - works correctly for any aspect ratio
      // Key: use the MINIMUM of W and H to keep heart proportional
      const s = Math.min(W, H); // size reference - use shorter dimension
      const ox = (W - s) / 2;  // center offset X
      const oy = (H - s) / 2;  // center offset Y
      // Heart defined in a square of size s, centered in the cell
      const L = ox, R = ox + s, T = oy, B = oy + s;
      const midX = ox + s/2;
      return `path('M ${midX} ${B*0.92+T*0.08} C ${R*0.85+L*0.15} ${B*0.72+T*0.28} ${R} ${B*0.55+T*0.45} ${R} ${T+s*0.3} C ${R} ${T+s*0.1} ${R-s*0.25} ${T} ${midX} ${T+s*0.18} C ${L+s*0.25} ${T} ${L} ${T+s*0.1} ${L} ${T+s*0.3} C ${L} ${B*0.55+T*0.45} ${L*0.85+R*0.15} ${B*0.72+T*0.28} ${midX} ${B*0.92+T*0.08} Z')`;
    }
    case 'heartL':{
      // Left half of broken heart - smooth left arc, jagged right edge
      const cx=W, notchX=W*0.88;
      return `path('M ${W} ${H*0.85} C ${W*0.6} ${H*0.65} ${W*0.4} ${H*0.5} ${W*0.4} ${H*0.3} C ${W*0.4} ${H*0.1} ${W*0.55} 0 ${W} ${H*0.2} L ${W*0.82} ${H*0.28} L ${W*0.9} ${H*0.42} L ${W*0.8} ${H*0.56} L ${W*0.9} ${H*0.7} L ${W} ${H*0.85} Z')`;
    }
    case 'heartR':{
      // Right half of broken heart - jagged left edge, smooth right arc
      return `path('M 0 ${H*0.85} L ${W*0.1} ${H*0.7} L 0 ${H*0.56} L ${W*0.1} ${H*0.42} L 0 ${H*0.28} L ${W*0.18} ${H*0.2} C ${W*0.45} 0 ${W*0.6} ${H*0.1} ${W*0.6} ${H*0.3} C ${W*0.6} ${H*0.5} ${W*0.4} ${H*0.65} 0 ${H*0.85} Z')`;
    }
    case 'circle':
      return 'circle(48% at 50% 50%)';
    case 'star':
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    case 'hexagon':
      return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    case 'triangle':
      return 'polygon(50% 0%, 100% 100%, 0% 100%)';
    case 'arrow':
      return 'polygon(0% 20%, 65% 20%, 65% 0%, 100% 50%, 65% 100%, 65% 80%, 0% 80%)';
    case 'shield':
      return 'polygon(10% 0%, 90% 0%, 100% 5%, 100% 45%, 85% 70%, 65% 88%, 50% 100%, 35% 88%, 15% 70%, 0% 45%, 0% 5%)';
    // V chevron pointing down — outer V outline with inner V cut so the photo
    // forms a thick "V" letter shape.
    case 'vshape':
      return 'polygon(0% 0%, 30% 0%, 50% 50%, 70% 0%, 100% 0%, 100% 25%, 55% 100%, 45% 100%, 0% 25%)';
    // Diagonal stroke of an X, top-left to bottom-right.
    case 'xbandA':
      return 'polygon(0% 0%, 25% 0%, 100% 75%, 100% 100%, 75% 100%, 0% 25%)';
    // Diagonal stroke of an X, top-right to bottom-left.
    case 'xbandB':
      return 'polygon(75% 0%, 100% 0%, 100% 25%, 25% 100%, 0% 100%, 0% 75%)';
    // Six triangular slices that compose into a hexagon when their cells are
    // tiled around the canvas centre. Each slice's polygon is in its cell's
    // local coordinate space; the bbox positions in SHAPE_TEMPLATES place each
    // slice so the three vertices land on the centre + two adjacent hex corners.
    case 'hexS1': return 'polygon(0% 0%, 0% 100%, 100% 50%)';
    case 'hexS2': return 'polygon(0% 50%, 100% 0%, 100% 100%)';
    case 'hexS3': return 'polygon(0% 0%, 100% 50%, 0% 100%)';
    case 'hexS4': return 'polygon(100% 0%, 100% 100%, 0% 50%)';
    case 'hexS5': return 'polygon(100% 50%, 0% 100%, 0% 0%)';
    case 'hexS6': return 'polygon(100% 100%, 0% 50%, 100% 0%)';
    // Pinwheel blades — each is a right triangle with the right angle at the
    // outer corner of its quadrant + hypotenuse from canvas centre to the
    // adjacent edge midpoint. Together the 4 blades look like spinning fan
    // blades with a 4-armed empty cross between them.
    case 'pinTR': return 'polygon(0% 100%, 100% 0%, 100% 100%)';
    case 'pinBR': return 'polygon(0% 0%, 100% 100%, 0% 100%)';
    case 'pinBL': return 'polygon(100% 0%, 0% 100%, 0% 0%)';
    case 'pinTL': return 'polygon(100% 100%, 0% 0%, 100% 0%)';
    case 'rect':
      return null; // explicit no-clip — same as default
    default:
      return null;
  }
}

function renderShapeCollage(){
  if(!currentTemplate||!currentTemplate.shapeCells)return;
  const canvas=document.getElementById('collage-canvas');
  const existingData={};
  cells.forEach(c=>{if(c.imgData)existingData[c.cellIndex]={data:c.imgData,fit:c.fit};});
  canvas.querySelectorAll('.cell').forEach(el=>el.remove());
  cells=[];
  applyShadow();applyBgToCanvas();

  currentTemplate.shapeCells.forEach((sc,i)=>{
    const el=document.createElement('div');
    el.className='cell';
    const px=sc.x*canvasW, py=sc.y*canvasH, pw=sc.w*canvasW, ph=sc.h*canvasH;
    el.style.left=px+'px'; el.style.top=py+'px';
    el.style.width=pw+'px'; el.style.height=ph+'px';
    el.style.borderRadius='0'; // clip-path handles shaping
    // Tag the DOM cell with its shape so the Canvas-2D exporter can re-apply the
    // same clip when rasterising. Without this the export sees `dataset.shape`
    // as undefined → falls back to `'rect'` → photos export as rectangles.
    el.dataset.shape=sc.shape||'rect';

    // Inner wrapper that owns the clip-path so the photo + placeholder are
    // shaped, but the cell-actions / resize / rotate buttons sit on the cell
    // itself and stay visible (the parent clip-path would otherwise crop them).
    const clipEl=document.createElement('div');
    clipEl.className='cell-clip';
    clipEl.style.cssText='position:absolute;inset:0;';
    const cp=getClipPathCSS(sc.shape,pw,ph);
    if(cp){
      clipEl.style.clipPath=cp;
      clipEl.style.webkitClipPath=cp;
      // path()-based clips use absolute coords inside the wrapper, so let the
      // wrapper render outside its own box if the shape extends to the edge.
      clipEl.style.overflow='visible';
      // Give the wrapper the cell's empty-state background + drop shadow so the
      // shape shows as the soft purple silhouette (same look the cell used to
      // have before the clip moved to the wrapper). The cell itself goes
      // transparent below so we don't see a square behind the shape.
      clipEl.style.background='linear-gradient(135deg,#f0f2f8,#e8eaf5)';
      clipEl.style.filter='drop-shadow(0 3px 10px rgba(73,86,165,.18))';
      el.style.background='transparent';
    }
    // The cell itself doesn't need overflow:hidden once the photo is in the
    // wrapper, and removing it lets unclipped buttons render past the shape.
    el.style.overflow='visible';
    el.appendChild(clipEl);

    // Photo placeholder + dim hover overlay live INSIDE the clip wrapper.
    clipEl.appendChild(Object.assign(document.createElement('div'),{className:'cell-overlay'}));
    const ph2=document.createElement('div');ph2.className='cell-ph';
    ph2.innerHTML=`<div class="ph-circle"><i class="fa-solid fa-plus"></i></div><p>Click to add</p>`;
    clipEl.appendChild(ph2);

    // Action buttons / handles stay on the cell so they aren't clipped.
    const acts=document.createElement('div');acts.className='cell-actions';
    acts.innerHTML=`<button class="cab" title="Replace photo" onclick="triggerCellUpload(${i});event.stopPropagation()"><i class="fa-solid fa-arrow-up-from-bracket"></i></button><button class="cab" title="Crop photo" onclick="openCropModal(${i});event.stopPropagation()"><i class="fa-solid fa-crop"></i></button><button class="cab del" title="Remove photo" onclick="removeCellPhoto(${i});event.stopPropagation()"><i class="fa-solid fa-xmark"></i></button>`;
    el.appendChild(acts);

    // Drag-to-swap
    el.setAttribute('draggable','true');
    el.addEventListener('dragstart',e=>{const cd=cells[i];if(!cd?.imgData){e.preventDefault();return;}e.dataTransfer.setData('cellSwapIdx',String(i));el.style.opacity='.5';});
    el.addEventListener('dragend',()=>{el.style.opacity='';});
    el.addEventListener('dragover',e=>{
      const types=e.dataTransfer.types;
      if(types.includes('cellswapidx')||types.includes('photo-idx')||types.includes('photoindex')||types.includes('Files')||types.includes('files')){
        e.preventDefault();el.classList.add('drag-over');
      }
    });
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('drop',e=>{el.classList.remove('drag-over');const fromIdx=parseInt(e.dataTransfer.getData('cellSwapIdx'));if(isNaN(fromIdx)||fromIdx===i)return;e.preventDefault();e.stopPropagation();swapCells(fromIdx,i);});

    el.onclick=e=>{
      if(e.target.closest('.canvas-elem')||e.target.closest('.canvas-text-pro'))return;
      if(fabricObjectAt(e.clientX,e.clientY)){e.stopPropagation();return;}
      e.stopPropagation();
      if(swapSourceIdx!==null){enableCellSwap(i);return;}
      const cd=cells[i];if(!cd.imgData)triggerCellUpload(i);else selectCell(i);
    };
    el.ondragover=e=>{e.preventDefault();el.classList.add('drag-over');};
    el.ondragleave=()=>el.classList.remove('drag-over');
    el.ondrop=e=>{e.preventDefault();el.classList.remove('drag-over');dropOnCell(e,i);};

    canvas.appendChild(el);
    const cd={el,cellIndex:i,imgData:null,img:null,fit:'cover',shape:sc.shape};
    cells.push(cd);
    if(existingData[i]){cd.fit=existingData[i].fit||'cover';setPhotoInCell(i,existingData[i].data,cd);}
  });
  updateFillStats();
  if(cellBorderWidth>0)setTimeout(updateCellBorders,0);
}


function swapCells(a,b){
  const ca=cells[a],cb=cells[b];
  if(!ca||!cb)return;
  // Swap imgData and img
  const tmpData=ca.imgData,tmpImg=ca.img,tmpFit=ca.fit;
  if(cb.imgData){
    ca.imgData=cb.imgData;ca.img=cb.img;ca.fit=cb.fit;
    setPhotoInCell(a,ca.imgData,ca);
  } else {
    removeCellPhoto(a);
  }
  if(tmpData){
    cb.imgData=tmpData;cb.img=tmpImg;cb.fit=tmpFit;
    setPhotoInCell(b,cb.imgData,cb);
  } else {
    removeCellPhoto(b);
  }
  saveHistory();showToast('Photos swapped!','success');
}

function renderCollage(){
  if(!currentTemplate)return;
  const canvas=document.getElementById('collage-canvas');
  const existingData={};
  cells.forEach(c=>{if(c.imgData)existingData[c.cellIndex]={data:c.imgData,fit:c.fit};});
  canvas.querySelectorAll('.cell').forEach(el=>el.remove());
  cells=[];
  applyShadow();
  applyBgToCanvas();

  currentTemplate.cells.forEach((c,i)=>{
    const[x,y,w,h]=c;
    const el=document.createElement('div');
    el.className='cell';
    el.style.left=(x*canvasW+gap/2)+'px';
    el.style.top=(y*canvasH+gap/2)+'px';
    el.style.width=(w*canvasW-gap)+'px';
    el.style.height=(h*canvasH-gap)+'px';
    el.style.borderRadius=borderRadius+'px';

    el.appendChild(Object.assign(document.createElement('div'),{className:'cell-overlay'}));

    const ph=document.createElement('div');ph.className='cell-ph';
    ph.innerHTML=`<div class="ph-circle">+</div><p>Tap to add photo</p>`;
    el.appendChild(ph);

    const acts=document.createElement('div');acts.className='cell-actions';
    acts.innerHTML=`<button class="cab" title="Replace photo" onclick="triggerCellUpload(${i});event.stopPropagation()"><i class="fa-solid fa-arrow-up-from-bracket"></i></button><button class="cab" title="Crop photo" onclick="openCropModal(${i});event.stopPropagation()"><i class="fa-solid fa-crop"></i></button><button class="cab del" title="Remove photo" onclick="removeCellPhoto(${i});event.stopPropagation()"><i class="fa-solid fa-xmark"></i></button>`;
    el.appendChild(acts);

    // Ã¢â€â‚¬Ã¢â€â‚¬ Drag photo between cells (rearrange) Ã¢â€â‚¬Ã¢â€â‚¬
    el.setAttribute('draggable','true');
    el.addEventListener('dragstart',e=>{
      const cd=cells[i];
      if(!cd?.imgData){e.preventDefault();return;}
      e.dataTransfer.setData('cellSwapIdx',String(i));
      el.style.opacity='.5';
    });
    el.addEventListener('dragend',()=>{el.style.opacity='';});
    el.addEventListener('dragover',e=>{
      // Accept cell swaps AND external file drops from PC
      const types=e.dataTransfer.types;
      if(types.includes('cellswapidx')||types.includes('photo-idx')||types.includes('photoindex')||Array.from(types).some(t=>t.toLowerCase()==='files')){
        e.preventDefault();el.classList.add('drag-over');
      }
    });
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('drop',e=>{
      el.classList.remove('drag-over');
      // Check for cell swap first
      const fromIdx=parseInt(e.dataTransfer.getData('cellSwapIdx'));
      if(!isNaN(fromIdx)&&fromIdx!==i){e.preventDefault();e.stopPropagation();swapCells(fromIdx,i);return;}
      // Otherwise handle as photo drop (internal or external file)
      e.preventDefault();
      dropOnCell(e,i);
    });

    el.onclick=e=>{
      if(fabricObjectAt(e.clientX,e.clientY)){e.stopPropagation();return;}
      e.stopPropagation();
      // If in swap mode, this cell becomes the target
      if(swapSourceIdx!==null){
        enableCellSwap(i);
        return;
      }
      const cd=cells[i];
      if(!cd.imgData)triggerCellUpload(i);
      else selectCell(i);
    };
    el.ondragover=e=>{e.preventDefault();el.classList.add('drag-over');};
    el.ondragleave=()=>el.classList.remove('drag-over');
    el.ondrop=e=>{e.preventDefault();el.classList.remove('drag-over');dropOnCell(e,i);};

    canvas.appendChild(el);
    const cd={el,cellIndex:i,imgData:null,img:null,fit:'cover'};
    cells.push(cd);
    if(existingData[i]){cd.fit=existingData[i].fit||'cover';setPhotoInCell(i,existingData[i].data,cd);}
  });
  updateFillStats();
  // Re-apply cell borders if set
  if(cellBorderWidth>0)setTimeout(updateCellBorders,0);
  // Attach long-press context menu on mobile
  attachAllCellLongPress();
}

// CELL UPLOAD
let cellTarget=-1;
function triggerCellUpload(idx){
  cellTarget=idx;
  let inp=document.getElementById('cell-file-inp');
  if(!inp){
    inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.id='cell-file-inp';inp.style.display='none';
    document.body.appendChild(inp);
    inp.onchange=e=>{
      if(!e.target.files[0])return;
      const r=new FileReader();
      r.onload=ev=>{setPhotoInCell(cellTarget,ev.target.result,cells[cellTarget]);saveHistory();updateFillStats();showToast('Photo added!','success');updateRightPanel(cellTarget);};
      r.readAsDataURL(e.target.files[0]);
      inp.value='';
    };
  }
  inp.click();
}
function uploadForCell(idx){triggerCellUpload(idx);}

function setPhotoInCell(idx,imgData,cd){
  cd.imgData=imgData;
  const ex=cd.el.querySelector('img');if(ex)ex.remove();
  const img=document.createElement('img');img.src=imgData;
  img.style.objectFit=cd.fit||'cover';
  img.style.width='100%';img.style.height='100%';
  applyImgStyle(img,cd);
  // Prefer the inner .cell-clip wrapper (occ-template cells with shape support);
  // fall back to the cell itself for grid-template cells.
  const host=cd.el.querySelector('.cell-clip')||cd.el;
  host.insertBefore(img,host.firstChild);
  const ph=cd.el.querySelector('.cell-ph');if(ph)ph.style.display='none';
  cd.img=img;
  if(showBorders)img.style.boxSizing='border-box';
}

function removeCellPhoto(idx){
  const c=cells[idx];c.imgData=null;
  if(c.img){c.img.remove();c.img=null;}
  const ph=c.el.querySelector('.cell-ph');if(ph)ph.style.display='';
  c.el.classList.remove('selected');
  if(selectedCell===idx){selectedCell=null;updateRightPanel(null);}
  saveHistory();updateFillStats();
}

function selectCell(idx){
  cells.forEach(c=>c.el.classList.remove('selected'));
  document.querySelectorAll('.canvas-text').forEach(t=>t.classList.remove('selected'));
  // Drop any DOM canvas-elem / Fabric selection so only the cell is highlighted.
  document.querySelectorAll('.canvas-elem,.canvas-text-pro').forEach(e=>e.classList.remove('selected'));
  if(fabricCanvas&&fabricCanvas.getActiveObject()){
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  }
  selectedElem=null;
  selectedText=null;
  if(selectedCell===idx){selectedCell=null;updateRightPanel(null);return;}
  selectedCell=idx;cells[idx].el.classList.add('selected');updateRightPanel(idx);mobOpenProps();
}

function updateRightPanel(idx){
  const rp=document.getElementById('rp-body');
  if(idx===null){rp.innerHTML=`<div class="no-sel"><div class="ns-icon"><i class="fa-solid fa-arrow-pointer"></i></div>Select a cell or text layer to edit</div>`;return;}
  const c=cells[idx];
  const isPolaroid=c.el.classList.contains('occ-polaroid');
  const currentRot=Math.round(parseFloat(c.el.dataset.rot)||0);
  rp.innerHTML=`
    <div class="prop-row"><div class="prop-label" style="color:var(--accent);font-weight:700">Cell ${idx+1} of ${cells.length}</div></div>
    <div class="prop-row"><button class="btn btn-ghost" style="width:100%;font-size:12px" onclick="triggerCellUpload(${idx})"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo</button></div>
    ${isPolaroid?`
    <div class="prop-row"><div class="prop-label">Card Shape</div>
      <div class="rp-shape-grid">
        ${(typeof CARD_SHAPES!=='undefined'?CARD_SHAPES:[]).map(s=>{
          const active=(c.el.dataset.shape||'rect')===s.id;
          return `<button class="rp-shape-btn${active?' active':''}" title="${s.name}" onclick="setCellShape(${idx},'${s.id}')"><i class="fa-solid ${s.faIcon}"></i></button>`;
        }).join('')}
      </div></div>
    <div class="prop-row"><div class="prop-label">Rotation: <strong id="cell-rot-val">${currentRot}Ã‚Â°</strong></div>
    <input type="range" min="-180" max="180" value="${currentRot}" style="width:100%;accent-color:var(--accent)" oninput="
      cells[${idx}].el.style.transform='rotate('+this.value+'deg)';
      cells[${idx}].el.dataset.rot=this.value;
      document.getElementById('cell-rot-val').textContent=this.value+'Ã‚Â°';
      debouncedSave();
    "></div>`:''}
    ${c.imgData?`
    <div class="prop-row"><div class="prop-label">Fit Mode</div>
      <select class="prop-input" onchange="setCellFit(${idx},this.value)">
        <option value="cover" ${c.fit==='cover'?'selected':''}>Cover (fill)</option>
        <option value="contain" ${c.fit==='contain'?'selected':''}>Contain (fit)</option>
        <option value="fill" ${c.fit==='fill'?'selected':''}>Stretch</option>
      </select></div>
    <div class="prop-row"><div class="prop-label">Focal Point</div>
      <select class="prop-input" onchange="setCellPos(${idx},this.value)">
        <option value="center">Center</option><option value="top">Top</option>
        <option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
      </select></div>
    <div class="prop-row" style="display:flex;gap:6px">
      <button class="btn btn-secondary" style="flex:1;font-size:11px" onclick="openCropModal(${idx})"><i class="fa-solid fa-crop"></i> Crop</button>
      <button class="btn btn-secondary" style="flex:1;font-size:11px" onclick="enableCellSwap(${idx})"><i class="fa-solid fa-arrow-right-arrow-left"></i> Swap</button>
    </div>
    <div class="prop-row"><div class="prop-label" style="margin-bottom:12px">Cell Adjustments</div>
      <div style="background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;">
      <div class="cell-adj-row"><span class="cell-adj-label">Brightness</span><input type="range" min="40" max="200" value="${Math.round(cells[idx].brightness||100)}" style="flex:1;accent-color:var(--accent)" oninput="setCellAdj(${idx},'brightness',this.value);document.getElementById('cadj-b-${idx}').textContent=this.value+'%'"><span class="cell-adj-val" id="cadj-b-${idx}">${Math.round(cells[idx].brightness||100)}%</span></div>
      <div class="cell-adj-row"><span class="cell-adj-label">Contrast</span><input type="range" min="40" max="200" value="${Math.round(cells[idx].contrast||100)}" style="flex:1;accent-color:var(--accent)" oninput="setCellAdj(${idx},'contrast',this.value);document.getElementById('cadj-c-${idx}').textContent=this.value+'%'"><span class="cell-adj-val" id="cadj-c-${idx}">${Math.round(cells[idx].contrast||100)}%</span></div>
      <div class="cell-adj-row" style="margin-bottom:0"><span class="cell-adj-label">Saturation</span><input type="range" min="0" max="200" value="${Math.round(cells[idx].saturation||100)}" style="flex:1;accent-color:var(--accent)" oninput="setCellAdj(${idx},'saturation',this.value);document.getElementById('cadj-s-${idx}').textContent=this.value+'%'"><span class="cell-adj-val" id="cadj-s-${idx}">${Math.round(cells[idx].saturation||100)}%</span></div>
      </div>
    </div>
    <div class="prop-row" style="margin-top:16px"><button class="btn btn-ghost" style="width:100%;font-size:12px;color:var(--danger);border-color:var(--danger)" onclick="removeCellPhoto(${idx})"><i class="fa-solid fa-xmark"></i> Remove Photo</button></div>`
    :`<div style="font-size:11px;color:var(--text-light);margin-top:4px;line-height:1.6">Empty cell — click Upload or drag a photo from the Photos tab.</div>`}
    ${cells[idx]?.el?.classList.contains('occ-polaroid')?`<div class="prop-row" style="margin-top:8px"><button class="btn btn-ghost" style="width:100%;font-size:12px;color:var(--danger);border-color:var(--danger);background:rgba(224,82,82,.06)" onclick="deleteOccCell(${idx})"><i class="fa-solid fa-trash"></i> Delete Card</button></div>`:''}`;
}

function setCellFit(idx,fit){cells[idx].fit=fit;if(cells[idx].img)cells[idx].img.style.objectFit=fit;}
function setCellPos(idx,pos){if(cells[idx].img)cells[idx].img.style.objectPosition=pos;}

// Convert an existing occ-template cell to a different shape in-place. Mutates the
// outer cell's classes/styles AND its inner .cell-clip wrapper so the photo (if any)
// gets re-clipped to the new silhouette. For non-rect shapes we also force a 1:1
// aspect since hearts / stars / circles look weird stretched.
function setCellShape(idx,shapeId){
  const cd=cells[idx];
  if(!cd||!cd.el||!cd.el.classList.contains('occ-polaroid'))return;
  if(typeof installShapeClipPaths==='function')installShapeClipPaths();
  const sh=getCardShape(shapeId);
  const isRect=shapeId==='rect';
  const cellEl=cd.el;
  const oldShape=cellEl.dataset.shape||'rect';
  if(oldShape===shapeId)return;
  cellEl.dataset.shape=shapeId;
  // Update outer cell visual: polaroid look only for rect shapes.
  cellEl.classList.remove('shape-rect','shape-circle','shape-ellipse','shape-heart','shape-star','shape-hexagon','shape-diamond');
  if(!isRect)cellEl.classList.add('shape-'+shapeId);
  if(isRect){
    cellEl.style.background='#fff';
    cellEl.style.padding='6px 6px 18px 6px';
    cellEl.style.boxShadow='3px 5px 18px rgba(0,0,0,.28),1px 2px 6px rgba(0,0,0,.15)';
  }else{
    cellEl.style.background='transparent';
    cellEl.style.padding='0';
    cellEl.style.boxShadow='none';
  }
  // Update the inner clip wrapper.
  const clipEl=cellEl.querySelector('.cell-clip');
  if(clipEl){
    if(isRect){
      clipEl.style.clipPath='';
      clipEl.style.webkitClipPath='';
      clipEl.style.filter='';
      clipEl.style.background='';
      // Re-apply polaroid padding-inset positioning.
      clipEl.style.top='6px';clipEl.style.left='6px';clipEl.style.right='6px';clipEl.style.bottom='18px';
      clipEl.style.width='auto';clipEl.style.height='auto';
    }else{
      clipEl.style.clipPath=sh.clipPath;
      clipEl.style.webkitClipPath=sh.clipPath;
      clipEl.style.filter='drop-shadow(2px 4px 8px rgba(0,0,0,.25))';
      clipEl.style.background='#eef0fb';
      clipEl.style.top='0';clipEl.style.left='0';clipEl.style.right='';clipEl.style.bottom='';
      clipEl.style.width='100%';clipEl.style.height='100%';
    }
  }
  // Force 1:1 aspect for shapes that look stretched as ovals.
  const aspectLocked=new Set(['heart','star','circle','hexagon','diamond']);
  if(aspectLocked.has(shapeId)){
    const w=parseFloat(cellEl.style.width)||0;
    const h=parseFloat(cellEl.style.height)||0;
    const side=Math.min(w,h);
    if(side>0&&w!==h){
      cellEl.style.width=side+'px';
      cellEl.style.height=side+'px';
    }
  }
  saveHistory();
  // Re-render the right panel so the active shape button reflects the new state.
  if(typeof updateRightPanel==='function')updateRightPanel(idx);
  showToast(`Shape: ${sh.name}`,'success');
}
function setCellAdj(idx,prop,val){
  cells[idx][prop]=parseInt(val);
  if(cells[idx].img)applyCellImgStyle(cells[idx]);
  debouncedSave();
}
function applyCellImgStyle(cd){
  const img=cd.img;if(!img)return;
  const parts=[];
  if(globalFilter!=='none')parts.push(globalFilter);
  const b=cd.brightness||100, c=cd.contrast||100, s=cd.saturation||100;
  const gb=glBright||100, gs=glSat||100;
  parts.push(`brightness(${Math.round(b*gb/100)}%)`);
  parts.push(`contrast(${c}%)`);
  parts.push(`saturate(${Math.round(s*gs/100)}%)`);
  img.style.filter=parts.join(' ');
}

// IMG STYLES
function applyImgStyle(img,cd){
  const parts=[];
  if(globalFilter!=='none')parts.push(globalFilter);
  const b=(cd&&cd.brightness)||100, c=(cd&&cd.contrast)||100, s=(cd&&cd.saturation)||100;
  parts.push(`brightness(${Math.round(b*glBright/100)}%)`);
  parts.push(`contrast(${c}%)`);
  parts.push(`saturate(${Math.round(s*glSat/100)}%)`);
  img.style.filter=parts.join(' ')||'none';
}
function applyFilterAll(){cells.forEach(c=>{if(c.img)applyImgStyle(c.img,c);});}

// PHOTOS
function handleDragOver(e){e.preventDefault();document.getElementById('upload-zone').classList.add('dragover');}
function handleDragLeave(){document.getElementById('upload-zone').classList.remove('dragover');}
function handleDrop(e){e.preventDefault();document.getElementById('upload-zone').classList.remove('dragover');Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')).forEach(addPhoto);}
function handleFileInput(e){Array.from(e.target.files).forEach(addPhoto);}
function addPhoto(file){
  const r=new FileReader();
  r.onload=ev=>{photos.push({data:ev.target.result,name:file.name});renderThumbs();document.getElementById('photo-count').textContent=photos.length;};
  r.readAsDataURL(file);
}
function renderThumbs(){
  const c=document.getElementById('photo-thumbs');c.innerHTML='';
  photos.forEach((p,i)=>{
    const d=document.createElement('div');d.className='photo-thumb';d.draggable=true;
    d.innerHTML=`<img src="${p.data}"><button class="rem-btn" onclick="removePhoto(${i},event)"><i class="fa-solid fa-xmark"></i></button>`;
    d.ondragstart=e=>e.dataTransfer.setData('photoIndex',i);
    d.ondblclick=()=>insertNextEmpty(i);
    c.appendChild(d);
  });
}
function removePhoto(i,e){e.stopPropagation();photos.splice(i,1);renderThumbs();document.getElementById('photo-count').textContent=photos.length;}
function addPhotoIfNew(dataUrl, name){
  // Only add if not already in photos (check by data equality would be slow, use name+size)
  const exists=photos.some(p=>p.data===dataUrl);
  if(!exists){
    photos.push({data:dataUrl,name:name||'photo'});
    renderThumbs();
    document.getElementById('photo-count').textContent=photos.length;
  }
}

function dropOnCell(e,idx){
  // 1. External file drag from PC
  if(e.dataTransfer.files&&e.dataTransfer.files.length>0){
    const file=Array.from(e.dataTransfer.files).find(f=>f.type.startsWith('image/'));
    if(file){
      const r=new FileReader();
      r.onload=ev=>{
        addPhotoIfNew(ev.target.result,file.name);
        setPhotoInCell(idx,ev.target.result,cells[idx]);
        saveHistory();updateFillStats();showToast('Photo placed!','success');
        updateRightPanel(selectedCell);
      };
      r.readAsDataURL(file);
      return;
    }
  }
  // 2. Internal drag from photo thumbnail — already in photos, just place it
  const pi=e.dataTransfer.getData('photoIndex');
  if(pi!==''){
    setPhotoInCell(idx,photos[parseInt(pi)].data,cells[idx]);
    saveHistory();updateFillStats();showToast('Photo placed!','success');
    updateRightPanel(selectedCell);
  }
}
function insertNextEmpty(pi){
  if(!currentTemplate){showToast('Pick a template first!','error');return;}
  const emp=cells.find(c=>!c.imgData);
  if(!emp){showToast('All cells filled!','error');return;}
  setPhotoInCell(emp.cellIndex,photos[pi].data,emp);saveHistory();updateFillStats();showToast('Added to next empty cell','success');
}
function autoFill(){
  if(!currentTemplate){showToast('Pick a template first!','error');return;}
  if(!photos.length){showToast('Upload photos first!','error');switchTab('photos',document.querySelectorAll('.stab')[1]);return;}
  cells.forEach((c,i)=>setPhotoInCell(i,photos[i%photos.length].data,c));
  saveHistory();updateFillStats();showToast(`Auto-filled ${cells.length} cells!`,'success');
}
function shufflePhotos(){
  if(!cells.length)return;
  const imgs=cells.map(c=>({data:c.imgData,fit:c.fit}));
  for(let i=imgs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[imgs[i],imgs[j]]=[imgs[j],imgs[i]];}
  cells.forEach((c,i)=>{if(imgs[i].data){c.fit=imgs[i].fit;setPhotoInCell(i,imgs[i].data,c);}else removeCellPhoto(i);});
  saveHistory();updateFillStats();showToast('Shuffled!','success');
}
function updateFillStats(){
  const filled=cells.filter(c=>c.imgData).length,total=cells.length;
  document.getElementById('fill-info').textContent=`${filled}/${total} filled`;
  document.getElementById('fill-progress').style.width=(total?(filled/total*100):0)+'%';
}

// STYLE
function setBg(el){bgColor=el.dataset.color;const cv=document.getElementById('collage-canvas');cv.style.background=bgColor;cv.style.backgroundImage='';bgImageDataUrl=null;document.querySelectorAll('#bg-colors .color-swatch').forEach(s=>s.classList.remove('selected'));el.classList.add('selected');}
function setCustomBg(v){
  const cv=document.getElementById('collage-canvas');cv.style.background=v;cv.style.backgroundImage='';bgImageDataUrl=null;
  bgColor=v;
  liveCustomBg(v);
}
function updateGap(v){gap=parseInt(v);document.getElementById('gap-val').textContent=v+'px';renderCollage();}
function updateRadius(v){borderRadius=parseInt(v);document.getElementById('radius-val').textContent=v+'px';cells.forEach(c=>c.el.style.borderRadius=v+'px');}
function setFilter(el){document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));el.classList.add('active');globalFilter=el.dataset.filter;applyFilterAll();}
function updateBrightness(v){glBright=parseInt(v);document.getElementById('brightness-val').textContent=v+'%';applyFilterAll();}
function updateSat(v){glSat=parseInt(v);document.getElementById('sat-val').textContent=v+'%';applyFilterAll();}
function updateShadow(v){globalShadow=parseInt(v);document.getElementById('shadow-val').textContent=['None','Soft','Medium','Deep','Dramatic'][v];applyShadow();}
function applyShadow(){
  const sh=['none','0 2px 12px rgba(73,86,165,.1)','0 8px 40px rgba(73,86,165,.18)','0 16px 60px rgba(73,86,165,.28)','0 24px 80px rgba(0,0,0,.35)'];
  document.getElementById('collage-canvas').style.boxShadow=sh[globalShadow];
}

// EXTRAS

// function toggleWatermark(){
//   showWm=!showWm;document.getElementById('wm-btn').classList.toggle('active',showWm);
//   const canvas=document.getElementById('collage-canvas');let wm=canvas.querySelector('.watermark');
//   if(showWm){if(!wm){wm=document.createElement('div');wm.className='watermark';wm.textContent='Ã¢Å“Â¦ CollageStudio';canvas.appendChild(wm);}}else{if(wm)wm.remove();}
//   showToast(showWm?'Watermark added':'Watermark removed');
// }

// CANVAS SIZE
function setCanvasSize(w,h,el){
  // Capture old dimensions BEFORE we mutate canvasW/H — needed to proportionally
  // rescale anything positioned in absolute pixels (occ-template cells, Fabric text).
  const oldW=canvasW, oldH=canvasH;
  const sx=w/oldW, sy=h/oldH;
  canvasW=w;canvasH=h;
  const canvas=document.getElementById('collage-canvas');
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  resizeFabricLayer(w,h);
  document.getElementById('size-badge').textContent=`${w} × ${h}`;
  // Remove active from every size/social pill, then mark every pill (in any tab)
  // whose onclick targets this exact w,h — keeps the two pill rows in sync.
  document.querySelectorAll('.size-pill,.social-pill').forEach(p=>{
    p.classList.remove('active');
    const oc=p.getAttribute('onclick')||'';
    if(oc.includes(`setCanvasSize(${w},${h}`))p.classList.add('active');
  });
  if(el)el.classList.add('active');

  const isOcc=!!(currentTemplate&&currentTemplate.occTemplate);
  if(isOcc){
    // Occasion templates have draggable polaroid cells in absolute pixels — re-render
    // the themed background at the new dimensions and rescale every cell so its
    // relative position/size on the canvas stays the same.
    const cv=document.getElementById('collage-canvas');
    try{
      const off=document.createElement('canvas');
      off.width=w;off.height=h;
      const octx=off.getContext('2d');
      currentTemplate.occTemplate.drawBg(octx,w,h);
      bgImageDataUrl=off.toDataURL();
      cv.style.backgroundImage=`url(${bgImageDataUrl})`;
      cv.style.backgroundSize='cover';
      cv.style.backgroundPosition='center';
    }catch(e){}
    // Shapes that need to stay 1:1 (heart, star, circle, hexagon, diamond) — DON'T
    // touch their width/height across aspect changes. Using Math.min(sx,sy) (or any
    // one-way ratio) doesn't reverse cleanly across multiple aspect swaps and the
    // shape would shrink toward zero each round-trip. Positions still scale so the
    // shape tracks the new canvas; user can resize manually if needed.
    // Rectangle and ellipse fill the new aspect so they keep independent W/H scales.
    const aspectLockedShapes=new Set(['heart','star','circle','hexagon','diamond']);
    cells.forEach(c=>{
      if(!c.el||!c.el.classList.contains('occ-polaroid'))return;
      const l=parseFloat(c.el.style.left)||0;
      const t=parseFloat(c.el.style.top)||0;
      const cw=parseFloat(c.el.style.width)||0;
      const ch=parseFloat(c.el.style.height)||0;
      const shape=c.el.dataset.shape||'rect';
      const locked=aspectLockedShapes.has(shape);
      // Rescale around the cell's CENTER, not its top-left corner. With a
      // top-left scale, a locked-size cell whose original right edge sat near
      // the canvas edge ends up bunched toward one side after the canvas grows
      // (because the cell's width didn't grow with sx). Center-anchored scale
      // keeps each cell's visual centre at the same proportional spot, so a
      // 2×4 grid of locked circles stays evenly distributed when the aspect
      // changes.
      const cx=l+cw/2, cy=t+ch/2;
      const newCw=locked?cw:cw*sx;
      const newCh=locked?ch:ch*sy;
      const newCx=cx*sx, newCy=cy*sy;
      c.el.style.left=(newCx-newCw/2)+'px';
      c.el.style.top=(newCy-newCh/2)+'px';
      if(!locked){
        c.el.style.width=newCw+'px';
        c.el.style.height=newCh+'px';
      }
    });
    // Rescale Fabric text positions proportionally to keep them in the same relative
    // spot on the canvas. Font size is intentionally NOT rescaled — using Math.min(sx,sy)
    // (or any one-way ratio) doesn't reverse cleanly across multiple aspect changes
    // (1:1 → 16:9 → 1:1 ends up smaller every round-trip), so the text would shrink
    // toward zero. Better to keep the user's chosen font size and let them adjust
    // manually if a new aspect needs a different scale.
    if(fabricCanvas){
      fabricCanvas.getObjects().forEach(o=>{
        if(o.type==='i-text'||o.type==='text'||o.type==='textbox'){
          o.set({
            left:(o.left||0)*sx,
            top:(o.top||0)*sy,
          });
          o.setCoords();
        }
      });
      fabricCanvas.requestRenderAll();
    }
  }else if(currentTemplate){
    // Shape templates (Arrow, Heart, V, Hex Slices, etc.) own per-cell clip-paths
    // sized in pixels. renderCollage() builds plain rectangular cells, which is
    // why shapes were collapsing to rectangles after aspect changes — we need
    // renderShapeCollage() to rebuild each cell with the right clip at the new
    // canvas dimensions. Existing photos are preserved by cellIndex inside
    // renderShapeCollage(), so the user's uploads stay put.
    if(currentTemplate.shapeCells){renderShapeCollage();}else{renderCollage();}
  }
  // Always fit to screen after size change
  setTimeout(resetZoom,50);
  // Capture this aspect change in history so undo/redo restore the previous size.
  // Skip the initial 800x800 default (oldW/H equal new — no real change).
  if(oldW!==w||oldH!==h){
    if(typeof saveHistory==='function')saveHistory();
  }
}

function updateCellUIScale(){
  // Keep buttons and placeholder visually consistent regardless of zoom or canvas size
  // sizeFactor: very gentle — barely grows for larger canvases, capped tight
  const baseSize=800;
  const sizeFactor=Math.min(1.15, Math.max(0.85, Math.sqrt(canvasW/baseSize)));
  const uiScale=Math.min(2.0, (1/zoom)*sizeFactor);
  document.getElementById('collage-canvas').style.setProperty('--cell-ui-scale',uiScale.toFixed(3));
}

function resetZoom(){
  const sc=document.getElementById('canvas-scroll');
  if(!sc)return;
  const pad=window.innerWidth<=768?28:72;
  const aw=sc.clientWidth-pad;
  const ah=sc.clientHeight-pad;
  if(aw<=0||ah<=0)return;
  zoom=Math.min(1,aw/canvasW,ah/canvasH);
  zoom=Math.floor(zoom*100)/100;
  const canvas=document.getElementById('collage-canvas');
  canvas.style.transform=`scale(${zoom})`;
  canvas.style.transformOrigin='center center';
  document.getElementById('zoom-label').textContent=Math.round(zoom*100)+'%';
  updateCellUIScale();
}

// ZOOM
function changeZoom(delta){
  zoom=Math.max(0.15,Math.min(2.5,zoom+delta/100));
  const canvas=document.getElementById('collage-canvas');
  canvas.style.transform=`scale(${zoom})`;canvas.style.transformOrigin='center center';
  document.getElementById('zoom-label').textContent=Math.round(zoom*100)+'%';
  updateCellUIScale();
}

// STICKERS
function placeSticker(emoji){
  addCanvasElem({type:'emoji',content:emoji,w:72,h:72,rot:0,opacity:1,fontSize:56});
}

// TEXT
function showAddText(){
  // Use pro text system — add a default heading text layer
  addProText('Your Text Here', TEXT_STYLE_PRESETS[0].style);
  switchTab('text', document.querySelector('.stab[onclick*=\'text\']'));
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function selFont(el){document.querySelectorAll('.font-btn').forEach(f=>f.classList.remove('active'));el.classList.add('active');_txtFont=el.dataset.font;}
function selTxtClr(el){document.querySelectorAll('.txt-sw').forEach(s=>s.classList.remove('selected'));el.classList.add('selected');_txtClr=el.dataset.c;}

function addText(){
  // Redirect old modal addText to pro system
  const content = document.getElementById('text-input').value.trim();
  if(!content) return;
  const sz = document.getElementById('txt-sz').value;
  addProText(content, {fontSize: sz+'px', fontFamily: _txtFont||"'Outfit',sans-serif", color: _txtClr||'#1a1c2e',
    fontWeight: _txtBold?'700':'400', fontStyle: _txtItalic?'italic':'normal',
    textShadow: _txtShadow?'2px 2px 6px rgba(0,0,0,.5)':'none'});
  document.getElementById('text-input').value='';
  closeModal('text-modal');
}

function rgbToHex(rgb){
  if(!rgb||rgb.startsWith('#'))return rgb||'#ffffff';
  const m=rgb.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if(!m)return '#ffffff';
  return '#'+[m[1],m[2],m[3]].map(x=>parseInt(x).toString(16).padStart(2,'0')).join('');
}

function selectTextEl(el){
  document.querySelectorAll('.canvas-text').forEach(t=>t.classList.remove('selected'));
  cells.forEach(c=>c.el.classList.remove('selected'));
  selectedCell=null;selectedText=el;el.classList.add('selected');
  const rp=document.getElementById('rp-body');
  const span=el.querySelector('.txt-content');
  const txt=span?span.textContent:'';
  rp.innerHTML=`
    <div class="prop-row"><div class="prop-label" style="color:var(--accent);font-weight:700">Text Layer</div></div>
    <div class="prop-row"><div class="prop-label">Content</div>
      <textarea class="prop-input" oninput="var sp=selectedText&&selectedText.querySelector('.txt-content');if(sp)sp.textContent=this.value;">${txt}</textarea></div>
    <div class="prop-row"><div class="prop-label">Size</div>
      <input class="prop-input" type="number" value="${parseInt(el.style.fontSize)||36}" oninput="if(selectedText)selectedText.style.fontSize=this.value+'px'"></div>
    <div class="prop-row"><div class="prop-label">Color</div>
      <input class="prop-input" type="color" value="${rgbToHex(el.style.color)||'#ffffff'}" oninput="if(selectedText)selectedText.style.color=this.value"></div>
    <div class="prop-row"><button class="btn btn-ghost" style="width:100%;font-size:12px;color:var(--danger);border-color:var(--danger)" onclick="if(selectedText){selectedText.remove();selectedText=null;updateRightPanel(null)}"><i class="fa-solid fa-trash"></i> Delete</button></div>`;
}

function makeDraggable(el){
  let sx,sy,sl,st;
  el.addEventListener('mousedown',e=>{
    if(e.target.tagName==='BUTTON')return;
    sx=e.clientX;sy=e.clientY;sl=parseInt(el.style.left)||0;st=parseInt(el.style.top)||0;
    const mv=e2=>{el.style.left=(sl+e2.clientX-sx)+'px';el.style.top=(st+e2.clientY-sy)+'px';};
    const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
    document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
  });
}

// HISTORY — full snapshot of all state
// Set true while restoreState is rebuilding the canvas — Fabric mutation events
// (object:added/removed/modified, text:changed) and cell handlers will fire during
// restore and would otherwise create infinite loops of new history entries.
let _suppressHistory=false;
// Tracks whether the user has interacted with the canvas since the last template
// load. Used to gate the "switch template?" dialog so it doesn't fire on every
// template click — only when there's real work that would be lost.
let _userHasEdited=false;

function saveHistory(){
  if(_suppressHistory)return;
  // A non-suppressed save = the user did something. Templates load under
  // _suppressHistory so this only flips during real interaction.
  _userHasEdited=true;
  const cv=document.getElementById('collage-canvas');
  // Capture all canvas elements (shapes, text-pro) as HTML snapshots
  const elemsHTML=[];
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro').forEach(el=>{
    // Clone without event handlers — just the visual HTML
    const clone=el.cloneNode(true);
    // Remove control buttons from snapshot (they get re-added on restore)
    clone.querySelectorAll('.ce-del,.txt-del2,.ce-resize,.ce-rotate').forEach(b=>b.remove());
    elemsHTML.push({
      html:clone.outerHTML,
      left:el.style.left,
      top:el.style.top,
      width:el.style.width,
      height:el.style.height||'',
      transform:el.style.transform||'',
      zIndex:el.style.zIndex||'50',
      opacity:el.style.opacity||'1',
      rot:el.dataset.rot||'0',
      elemType:el.dataset.elemType||'',
      className:el.className,
    });
  });

  // Per-cell geometry — needed for occasion templates because the user can move /
  // resize / rotate / add / delete cells, and renderCollage() can't reproduce those
  // changes from the immutable template definition.
  const cellGeoms=cells.map(c=>{
    if(!c.el)return null;
    return{
      left:c.el.style.left,
      top:c.el.style.top,
      width:c.el.style.width,
      height:c.el.style.height,
      transform:c.el.style.transform||'',
      zIndex:c.el.style.zIndex||'10',
      rot:c.el.dataset.rot||'0',
      isPolaroid:c.el.classList.contains('occ-polaroid'),
      shape:c.el.dataset.shape||'rect',
    };
  });

  // Fabric text layer state — toJSON serializes every text object including any
  // custom props we added (text-transform stash, original-text stash).
  let fabricJSON=null;
  if(fabricCanvas){
    try{ fabricJSON=fabricCanvas.toJSON(['__textTransform','__originalText','__border','__padding','__borderRadius','__bgColor']); }catch(e){}
  }

  const s={
    template:currentTemplate,
    imgs:cells.map(c=>({data:c.imgData,fit:c.fit,brightness:c.brightness,contrast:c.contrast,saturation:c.saturation})),
    bg:bgColor,
    bgImg:bgImageDataUrl||null,
    gap,
    borderRadius,
    globalFilter,
    glBright,
    glSat,
    cellBorderColor,
    cellBorderWidth,
    cellBorderStyle,
    elemsHTML,
    cellGeoms,
    fabricJSON,
    canvasW,canvasH,
  };
  history=history.slice(0,historyIdx+1);
  history.push(s);
  if(history.length>50)history.shift();
  historyIdx=history.length-1;
}

function undo(){
  if(historyIdx<=0){showToast('Nothing to undo','error');return;}
  historyIdx--;
  restoreState(history[historyIdx]);
  showToast('Undo','');
}

function redo(){
  if(historyIdx>=history.length-1){showToast('Nothing to redo','error');return;}
  historyIdx++;
  restoreState(history[historyIdx]);
  showToast('Redo','');
}

function restoreState(s){
  if(!s||!s.template)return;
  const cv=document.getElementById('collage-canvas');

  // Suppress every history-emitting handler during the rebuild so we don't
  // re-record the steps we're replaying.
  _suppressHistory=true;

  // Restore canvas dimensions FIRST so cells/text rebuild at the right size.
  // The cell-geometry snapshot below uses absolute pixels referenced to the saved
  // canvas, so we must set canvasW/H + the DOM size before recreating cells.
  if(s.canvasW&&s.canvasH&&(s.canvasW!==canvasW||s.canvasH!==canvasH)){
    canvasW=s.canvasW;canvasH=s.canvasH;
    cv.style.width=canvasW+'px';cv.style.height=canvasH+'px';
    if(typeof resizeFabricLayer==='function')resizeFabricLayer(canvasW,canvasH);
    const sizeBadge=document.getElementById('size-badge');
    if(sizeBadge)sizeBadge.textContent=`${canvasW} × ${canvasH}`;
    // Sync size-pill active state to the restored dimensions.
    document.querySelectorAll('.size-pill,.social-pill').forEach(p=>{
      p.classList.remove('active');
      const oc=p.getAttribute('onclick')||'';
      if(oc.includes(`setCanvasSize(${canvasW},${canvasH}`))p.classList.add('active');
    });
  }

  // Restore core state vars
  currentTemplate=s.template;
  bgColor=s.bg||'#ffffff';
  gap=s.gap||8;
  borderRadius=s.borderRadius||0;
  globalFilter=s.globalFilter||'none';
  glBright=s.glBright||100;
  glSat=s.glSat||100;
  cellBorderColor=s.cellBorderColor||'#4956a5';
  cellBorderWidth=s.cellBorderWidth||0;
  cellBorderStyle=s.cellBorderStyle||'solid';

  // Restore bg image
  if(s.bgImg){bgImageDataUrl=s.bgImg;}
  else{bgImageDataUrl=null;}

  // Remove all movable elements + clear Fabric text layer
  cv.querySelectorAll('.canvas-elem,.canvas-text-pro,.canvas-text').forEach(el=>el.remove());
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}

  // Cell rebuild: occasion templates remember per-cell geometry (cells the user has
  // moved/resized/added/deleted), so we recreate cells from the snapshot. Regular
  // templates use the deterministic renderCollage() pipeline.
  const isOcc=!!(currentTemplate&&currentTemplate.occTemplate);
  const polaroidGeoms=(s.cellGeoms||[]).filter(g=>g&&g.isPolaroid);
  if(isOcc&&polaroidGeoms.length){
    cells.forEach(c=>c.el&&c.el.remove());
    cells=[];
    polaroidGeoms.forEach(g=>{
      const w=parseFloat(g.width)||100;
      const h=parseFloat(g.height)||100;
      const x=parseFloat(g.left)||0;
      const y=parseFloat(g.top)||0;
      const angle=parseFloat(g.rot)||0;
      const z=parseInt(g.zIndex)||10;
      createOccCell({x,y,w,h,angle,zIndex:z,shape:g.shape||'rect'});
    });
  }else{
    renderCollage();
  }

  // Restore cell photos and per-cell adjustments
  s.imgs.forEach((img,i)=>{
    if(img&&img.data&&cells[i]){
      cells[i].fit=img.fit||'cover';
      cells[i].brightness=img.brightness||100;
      cells[i].contrast=img.contrast||100;
      cells[i].saturation=img.saturation||100;
      setPhotoInCell(i,img.data,cells[i]);
    }
  });

  // Restore Fabric text layer
  if(fabricCanvas&&s.fabricJSON){
    try{
      fabricCanvas.loadFromJSON(s.fabricJSON,()=>{
        // Re-apply quality knobs that don't survive serialization.
        fabricCanvas.getObjects().forEach(o=>{
          if(o.type==='i-text'||o.type==='text'||o.type==='textbox'){
            o.objectCaching=false;
            o.statefullCache=false;
            o.noScaleCache=true;
          }
        });
        fabricCanvas.requestRenderAll();
      });
    }catch(e){console.warn('Fabric restore failed',e);}
  }

  // Restore canvas elements with full style
  if(s.elemsHTML&&s.elemsHTML.length){
    s.elemsHTML.forEach(snap=>{
      const tmp=document.createElement('div');
      tmp.innerHTML=snap.html;
      const el=tmp.firstElementChild;
      if(!el)return;

      // Restore position/style
      if(snap.left)el.style.left=snap.left;
      if(snap.top)el.style.top=snap.top;
      if(snap.width)el.style.width=snap.width;
      if(snap.height)el.style.height=snap.height;
      if(snap.transform)el.style.transform=snap.transform;
      if(snap.zIndex)el.style.zIndex=snap.zIndex;
      if(snap.opacity)el.style.opacity=snap.opacity;
      if(snap.rot)el.dataset.rot=snap.rot;

      cv.appendChild(el);

      // Re-attach all interaction handlers
      const isText=el.classList.contains('canvas-text-pro');

      // Delete button
      const delBtn=document.createElement('button');
      delBtn.className=isText?'txt-del2 ce-del':'ce-del';
      delBtn.innerHTML='<i class="fa-solid fa-xmark"></i>';
      delBtn.onclick=e=>{e.stopPropagation();el.remove();if(selectedElem===el){selectedElem=null;updateRightPanel(null);}saveHistory();};
      el.appendChild(delBtn);

      // Resize handle
      const resizeBtn=document.createElement('div');
      resizeBtn.className='ce-resize';
      attachResizeHandler(resizeBtn,el,isText);
      el.appendChild(resizeBtn);

      // Rotate handle
      const rotBtn=document.createElement('button');
      rotBtn.className='ce-rotate';
      rotBtn.innerHTML='<i class="fa-solid fa-rotate"></i>';
      attachRotateHandler(rotBtn,el);
      el.appendChild(rotBtn);

      // Text editing
      if(isText){
        const txtEdit=el.querySelector('.txt-edit');
        if(txtEdit){
          txtEdit.contentEditable='false';
          txtEdit.ondblclick=e=>{e.stopPropagation();txtEdit.contentEditable='true';txtEdit.style.cursor='text';txtEdit.style.userSelect='text';txtEdit.style.webkitUserSelect='text';txtEdit.focus();};
          txtEdit.onblur=()=>{txtEdit.contentEditable='false';txtEdit.style.cursor='inherit';txtEdit.style.userSelect='none';txtEdit.style.webkitUserSelect='none';};
          txtEdit.addEventListener('mousedown',e=>{if(txtEdit.contentEditable==='true')e.stopPropagation();});
        }
      }

      attachDragHandler(el);
      el.onclick=e=>{e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);};
      el.addEventListener('touchend',e=>{
        const t=e.changedTouches[0];
        const moved=Math.abs(t.clientX-(elemDrag.startX||0))>6||Math.abs(t.clientY-(elemDrag.startY||0))>6;
        if(!moved){e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);}
      },{passive:true});
    });
  }

  applyBgToCanvas();
  applyFilterAll();
  if(cellBorderWidth>0)setTimeout(updateCellBorders,0);
  updateFillStats();
  selectedElem=null;
  selectedCell=null;
  updateRightPanel(null);
  if(typeof updateRightPanelGlobalActions==='function')updateRightPanelGlobalActions();
  // Release the suppress flag in a microtask so any synchronous after-effects
  // (object:added events from loadFromJSON, etc.) finish first.
  setTimeout(()=>{ _suppressHistory=false; },0);
}

function clearCanvas(){
  document.getElementById('confirm-clear-modal').classList.add('open');
}
function doClearCanvas(){
  _suppressHistory=true;
  cells.forEach(c=>removeCellPhoto(c.cellIndex));
  document.querySelectorAll('.canvas-text,.canvas-text-pro,.canvas-elem').forEach(t=>t.remove());
  if(fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.clear();fabricCanvas.requestRenderAll();}
  selectedElem=null;
  _suppressHistory=false;
  saveHistory();showToast('Canvas cleared');
}

// EXPORT — pure Canvas 2D, no html2canvas needed
async function downloadCollage(fmt='png', scale=2, quality=0.92, filename='my-collage'){
  if(!currentTemplate){showToast('No collage to export!','error');return;}

  // Ã¢â€â‚¬Ã¢â€â‚¬ Show progress overlay Ã¢â€â‚¬Ã¢â€â‚¬
  const overlay=document.getElementById('export-progress-overlay');
  const bar=document.getElementById('exp-prog-bar');
  const step=document.getElementById('exp-prog-step');
  const pct=document.getElementById('exp-prog-pct');
  function setProgress(percent,label){
    bar.style.width=percent+'%';
    pct.textContent=Math.round(percent)+'%';
    step.textContent=label;
  }
  overlay.classList.add('show');
  setProgress(0,'Preparing canvas…');
  await new Promise(r=>setTimeout(r,30)); // allow repaint

  try{
    const scale2=scale||2;
    const oc=document.createElement('canvas');
    oc.width=canvasW*scale2; oc.height=canvasH*scale2;
    const ctx=oc.getContext('2d');
    ctx.scale(scale2,scale2);

    // Ã¢â€â‚¬Ã¢â€â‚¬ Background Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(5,'Drawing background…');
    await new Promise(r=>setTimeout(r,10));
    if(bgImageDataUrl){
      await new Promise(resolve=>{
        const img=new Image();
        img.onload=()=>{ctx.drawImage(img,0,0,canvasW,canvasH);resolve();};
        img.src=bgImageDataUrl;
      });
    } else if(currentPattern){
      const baseColor=bgColor.startsWith('linear')?'#f2f3f8':bgColor;
      ctx.fillStyle=baseColor;
      ctx.fillRect(0,0,canvasW,canvasH);
      const pc=document.createElement('canvas');pc.width=80;pc.height=80;
      const pctx=pc.getContext('2d');
      pctx.fillStyle=baseColor;pctx.fillRect(0,0,80,80);
      currentPattern.fn(pctx,80);
      const patImg=new Image();
      await new Promise(resolve=>{patImg.onload=resolve;patImg.src=pc.toDataURL();});
      const pat=ctx.createPattern(patImg,'repeat');
      if(pat){ctx.fillStyle=pat;ctx.fillRect(0,0,canvasW,canvasH);}
    } else {
      const bg=bgColor;
      if(bg.startsWith('linear-gradient')){
        const stops=bg.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g)||['#ffffff','#ffffff'];
        const grd=ctx.createLinearGradient(0,0,canvasW,canvasH);
        stops.forEach((c,i)=>grd.addColorStop(i/(stops.length-1),c));
        ctx.fillStyle=grd;
      } else {
        ctx.fillStyle=bg;
      }
      ctx.fillRect(0,0,canvasW,canvasH);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Draw each cell Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(15,'Rendering photos…');
    await new Promise(r=>setTimeout(r,10));
    const totalCells=cells.length||1;
    let cellIdx=0;
    for(const cd of cells){
      cellIdx++;
      setProgress(15+Math.round((cellIdx/totalCells)*35),`Rendering photo ${cellIdx} of ${totalCells}…`);
      if(cellIdx%2===0)await new Promise(r=>setTimeout(r,0));
      const el=cd.el;
      const x=parseFloat(el.style.left);
      const y=parseFloat(el.style.top);
      const w=parseFloat(el.style.width);
      const h=parseFloat(el.style.height);
      const br=parseFloat(el.style.borderRadius)||0;
      const isPolaroid=el.classList.contains('occ-polaroid');
      // Polaroid has 6px padding on sides/top, 18px on bottom
      const pad=isPolaroid?6:0, padBot=isPolaroid?18:0;
      // Photo area inside polaroid padding
      const photoX=x+pad, photoY=y+pad;
      const photoW=w-pad*2, photoH=h-pad-padBot;

      const transformStr=el.style.transform||'';
      const rotMatch=transformStr.match(/rotate\((-?[\d.]+)deg\)/);
      const rotDeg=rotMatch?parseFloat(rotMatch[1]):0;

      ctx.save();
      const cellShapeR=el.dataset.shape||'rect';
      const useShapeR=cellShapeR!=='rect';
      if(rotDeg!==0){
        const cx=x+w/2, cy=y+h/2;
        ctx.translate(cx,cy);ctx.rotate(rotDeg*Math.PI/180);ctx.translate(-w/2,-h/2);

        // Draw polaroid white card with shadow (skipped for shape cells — shape itself is the card)
        if(isPolaroid&&!useShapeR){
          ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=16;ctx.shadowOffsetX=3;ctx.shadowOffsetY=5;
          ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
          ctx.shadowColor='transparent';
        }

        if(cd.imgData&&cd.img){
          const img=cd.img;const iw=img.naturalWidth,ih=img.naturalHeight;
          const fit=cd.fit||'cover';const pos=img.style.objectPosition||'center';
          const pw2=useShapeR?w:(isPolaroid?photoW:w);
          const ph2=useShapeR?h:(isPolaroid?photoH:h);
          const ox=useShapeR?0:(isPolaroid?pad:0);
          const oy=useShapeR?0:(isPolaroid?pad:0);
          const {sx,sy,sw,sh,dx,dy,dw,dh}=calcObjectFit(fit,pos,iw,ih,pw2,ph2);
          if(useShapeR){
            ctx.save();
            ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=10;ctx.shadowOffsetX=2;ctx.shadowOffsetY=4;
            ctx.fillStyle='#000';
            shapeFill(ctx,cellShapeR,ox,oy,pw2,ph2);
            ctx.restore();
            shapeClip(ctx,cellShapeR,ox,oy,pw2,ph2);
          }else{
            ctx.beginPath();ctx.rect(ox,oy,pw2,ph2);ctx.clip();
          }
          const parts=[];
          if(globalFilter!=='none')parts.push(globalFilter);
          const cb=cd.brightness||100, cc=cd.contrast||100, cs=cd.saturation||100;
          parts.push(`brightness(${Math.round(cb*glBright/100)}%)`);
          parts.push(`contrast(${cc}%)`);
          parts.push(`saturate(${Math.round(cs*glSat/100)}%)`);
          ctx.filter=parts.join(' ')||'none';
          ctx.drawImage(img,sx,sy,sw,sh,ox+dx,oy+dy,dw,dh);
          ctx.filter='none';
        } else if(!isPolaroid){
          ctx.fillStyle='#e8eaf0';ctx.fillRect(0,0,w,h);
          ctx.fillStyle='rgba(73,86,165,.3)';ctx.font=`bold ${Math.min(w,h)*.15}px sans-serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Ã°Å¸â€œÂ·',w/2,h/2);
        }
      } else {
        // Non-rotated cell
        const cellShape=el.dataset.shape||'rect';
        const useShape=cellShape!=='rect';
        if(isPolaroid&&!useShape){
          ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=14;ctx.shadowOffsetX=3;ctx.shadowOffsetY=5;
          ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);
          ctx.shadowColor='transparent';
        }
        if(cd.imgData&&cd.img){
          // For shape cells the photo fills the entire cell box (no polaroid padding).
          const pw2=useShape?w:(isPolaroid?photoW:w);
          const ph2=useShape?h:(isPolaroid?photoH:h);
          const ox=useShape?x:(isPolaroid?photoX:x);
          const oy=useShape?y:(isPolaroid?photoY:y);
          if(useShape){
            // Drop shadow under the silhouette to mimic the .cell-clip filter.
            ctx.save();
            ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=10;ctx.shadowOffsetX=2;ctx.shadowOffsetY=4;
            ctx.fillStyle='#000';
            shapeFill(ctx,cellShape,ox,oy,pw2,ph2);
            ctx.restore();
            shapeClip(ctx,cellShape,ox,oy,pw2,ph2);
          }else{
            roundedClip(ctx,ox,oy,pw2,ph2,br);
          }
          const parts=[];
          if(globalFilter!=='none')parts.push(globalFilter);
          const cb=cd.brightness||100, cc=cd.contrast||100, cs=cd.saturation||100;
          parts.push(`brightness(${Math.round(cb*glBright/100)}%)`);
          parts.push(`contrast(${cc}%)`);
          parts.push(`saturate(${Math.round(cs*glSat/100)}%)`);
          ctx.filter=parts.join(' ')||'none';
          const img=cd.img;const iw=img.naturalWidth,ih=img.naturalHeight;
          const fit=cd.fit||'cover';const pos=img.style.objectPosition||'center';
          const {sx,sy,sw,sh,dx,dy,dw,dh}=calcObjectFit(fit,pos,iw,ih,pw2,ph2);
          ctx.drawImage(img,sx,sy,sw,sh,ox+dx,oy+dy,dw,dh);
          ctx.filter='none';
        } else if(!isPolaroid){
          ctx.fillStyle='#eef0fb';ctx.fillRect(x,y,w,h);
          ctx.fillStyle='rgba(73,86,165,0.25)';
          ctx.font='bold 13px Outfit,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText('+',x+w/2,y+h/2);
        }
      }
      ctx.restore();

      // Ã¢â€â‚¬Ã¢â€â‚¬ Draw cell border Ã¢â€â‚¬Ã¢â€â‚¬
      if(cellBorderWidth>0){
        const drawBorderRect=(bx,by,bw,bh,bw2,br2)=>{
          ctx.save();
          ctx.strokeStyle=cellBorderColor;
          ctx.lineWidth=bw2;
          if(cellBorderStyle==='dashed')ctx.setLineDash([bw2*3,bw2*2]);
          else if(cellBorderStyle==='dotted')ctx.setLineDash([bw2,bw2*2]);
          else ctx.setLineDash([]);
          const half=bw2/2;
          if(br2>0){
            ctx.beginPath();
            const r2=Math.min(br2,bw/2,bh/2);
            ctx.moveTo(bx+half+r2,by+half);ctx.lineTo(bx+bw-half-r2,by+half);ctx.arcTo(bx+bw-half,by+half,bx+bw-half,by+half+r2,r2);
            ctx.lineTo(bx+bw-half,by+bh-half-r2);ctx.arcTo(bx+bw-half,by+bh-half,bx+bw-half-r2,by+bh-half,r2);
            ctx.lineTo(bx+half+r2,by+bh-half);ctx.arcTo(bx+half,by+bh-half,bx+half,by+bh-half-r2,r2);
            ctx.lineTo(bx+half,by+half+r2);ctx.arcTo(bx+half,by+half,bx+half+r2,by+half,r2);
            ctx.closePath();ctx.stroke();
          } else {
            ctx.strokeRect(bx+half,by+half,bw-bw2,bh-bw2);
          }
          ctx.setLineDash([]);
          ctx.restore();
        };

        const bx=rotDeg!==0?0:x, by=rotDeg!==0?0:y;
        const bw=w, bh=h;

        ctx.save();
        if(rotDeg!==0){
          const rcx=x+w/2,rcy=y+h/2;
          ctx.translate(rcx,rcy);ctx.rotate(rotDeg*Math.PI/180);ctx.translate(-w/2,-h/2);
        }

        if(cellBorderStyle==='double'&&cellBorderWidth>=3){
          // Draw outer border
          const outer=Math.max(1,Math.round(cellBorderWidth/3));
          drawBorderRect(bx,by,bw,bh,outer,br);
          // Draw inner border
          const gap=outer;
          drawBorderRect(bx+outer+gap,by+outer+gap,bw-2*(outer+gap),bh-2*(outer+gap),outer,Math.max(0,br-outer-gap));
        } else {
          drawBorderRect(bx,by,bw,bh,cellBorderWidth,br);
        }
        ctx.restore();
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Draw text & sticker overlays Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(52,'Rendering text layers…');
    await new Promise(r=>setTimeout(r,10));
    const textEls=document.getElementById('collage-canvas').querySelectorAll('.canvas-text');
    for(const tel of textEls){
      const tx=parseFloat(tel.style.left)||0;
      const ty=parseFloat(tel.style.top)||0;
      const fs=parseFloat(tel.style.fontSize)||32;
      const ff=(tel.style.fontFamily||'sans-serif').replace(/'/g,'');
      const fw=tel.style.fontWeight||'500';
      const fi=tel.style.fontStyle==='italic'?'italic':'';
      const fc=tel.style.color||'#ffffff';
      const hasBg=!!(tel.style.background && tel.style.background!=='');
      // get text content from the dedicated .txt-content span
      const span=tel.querySelector('.txt-content');
      const txt=span?span.textContent.trim():'';
      if(!txt) continue;

      ctx.save();
      ctx.font=`${fi} ${fw} ${fs}px ${ff}`;
      ctx.fillStyle=fc;

      // text shadow
      const ts=tel.style.textShadow;
      if(ts && ts!=='none'){
        ctx.shadowColor='rgba(0,0,0,0.6)';
        ctx.shadowBlur=12;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=2;
      }

      // background box
      if(hasBg){
        const pad=8;
        const mw=ctx.measureText(txt).width;
        ctx.fillStyle='rgba(0,0,0,0.45)';
        ctx.shadowColor='transparent';
        roundedClip(ctx,tx-pad,ty-pad,mw+pad*2,fs+pad*2,6);
        ctx.fillRect(tx-pad,ty-pad,mw+pad*2,fs+pad*2);
        ctx.restore();ctx.save();
        ctx.font=`${fi} ${fw} ${fs}px ${ff}`;
        ctx.fillStyle=fc;
        if(ts && ts!=='none'){ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12;ctx.shadowOffsetX=0;ctx.shadowOffsetY=2;}
      }

      ctx.textBaseline='top';
      ctx.fillText(txt, tx+6, ty+4);
      ctx.restore();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Draw pro text elements (.canvas-text-pro) Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(65,'Rendering pro text…');
    await new Promise(r=>setTimeout(r,10));

    // Ã¢â€â‚¬Ã¢â€â‚¬ FIX: Wait for all web fonts to be ready before drawing text Ã¢â€â‚¬Ã¢â€â‚¬
    try{ await document.fonts.ready; }catch(e){}

    // Ã¢â€â‚¬Ã¢â€â‚¬ Composite the Fabric.js text layer onto the export canvas Ã¢â€â‚¬Ã¢â€â‚¬
    // Fabric renders text with the same engine that drew it on the editor canvas, so
    // the exported bytes match the editor pixel-for-pixel. toCanvasElement(multiplier)
    // gives us a crisp raster at the export scale; we drawImage at logical size because
    // the export ctx is already scaled by scale2.
    if(fabricCanvas&&fabricCanvas.getObjects().length>0){
      try{
        // Deselect so selection handles / control outlines don't get baked into the export.
        const prevActive=fabricCanvas.getActiveObject();
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
        // Quality boost: render Fabric at max(scale2, 2 * devicePixelRatio) so text is
        // sharp even on hi-DPI screens with low export scale, then drawImage downsamples
        // to the target physical pixel size with smoothing on.
        const dpr=window.devicePixelRatio||1;
        const fabricMultiplier=Math.max(scale2,Math.ceil(scale2*dpr),2);
        const fabricImg=fabricCanvas.toCanvasElement(fabricMultiplier);
        const prevSmooth=ctx.imageSmoothingEnabled;
        const prevQuality=ctx.imageSmoothingQuality;
        ctx.imageSmoothingEnabled=true;
        ctx.imageSmoothingQuality='high';
        ctx.drawImage(fabricImg,0,0,canvasW,canvasH);
        ctx.imageSmoothingEnabled=prevSmooth;
        ctx.imageSmoothingQuality=prevQuality;
        if(prevActive){fabricCanvas.setActiveObject(prevActive);fabricCanvas.requestRenderAll();}
      }catch(e){
        console.warn('Fabric text composite failed',e);
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Helper: measure text width accounting for manual letter-spacing Ã¢â€â‚¬Ã¢â€â‚¬
    function measureWithSpacing(ctx2, str, ls2){
      if(!ls2) return ctx2.measureText(str).width;
      let w=0;
      for(const ch of str) w+=ctx2.measureText(ch).width+ls2;
      return w - ls2; // remove trailing spacing
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ FIX: Manual letter-spacing draw (ctx.letterSpacing not supported in all browsers) Ã¢â€â‚¬Ã¢â€â‚¬
    function fillTextSpaced(ctx2, str, x, y, ls2, align, maxW){
      if(!ls2){ ctx2.fillText(str, x, y); return; }
      const totalW = measureWithSpacing(ctx2, str, ls2);
      let startX = x;
      if(align==='center') startX = x - totalW/2;
      else if(align==='right') startX = x - totalW;
      for(const ch of str){
        ctx2.fillText(ch, startX, y);
        startX += ctx2.measureText(ch).width + ls2;
      }
    }
    function strokeTextSpaced(ctx2, str, x, y, ls2, align){
      if(!ls2){ ctx2.strokeText(str, x, y); return; }
      const totalW = measureWithSpacing(ctx2, str, ls2);
      let startX = x;
      if(align==='center') startX = x - totalW/2;
      else if(align==='right') startX = x - totalW;
      for(const ch of str){
        ctx2.strokeText(ch, startX, y);
        startX += ctx2.measureText(ch).width + ls2;
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Helper: resolve generic font family to computed font name Ã¢â€â‚¬Ã¢â€â‚¬
    function resolveFont(editEl, rawFF){
      // FIX: generic 'cursive'/'fantasy'/'monospace' resolve differently on canvas vs DOM
      // Use computed style to get the actual resolved font name from the browser
      const generic=['cursive','fantasy','serif','sans-serif','monospace'];
      const trimmed=rawFF.replace(/['"]/g,'').trim().toLowerCase();
      if(generic.includes(trimmed)){
        const resolved=window.getComputedStyle(editEl).fontFamily;
        return resolved||rawFF;
      }
      return rawFF;
    }

    const proTextEls=document.getElementById('collage-canvas').querySelectorAll('.canvas-text-pro');
    for(const tel of proTextEls){
      const edit=tel.querySelector('.txt-edit');
      if(!edit)continue;
      const txt=edit.textContent||'';
      if(!txt.trim())continue;
      const tx=parseFloat(tel.style.left)||0;
      const ty=parseFloat(tel.style.top)||0;
      const elW=parseFloat(tel.style.width)||parseFloat(tel.style.maxWidth)||Math.round(canvasW*0.8);
      // Use the actual rendered height (covers shadow descenders, multi-line, etc.)
      // rather than the explicit height which is usually unset on text wrappers.
      const measuredH=Math.ceil(edit.getBoundingClientRect().height||edit.offsetHeight||0);
      const explicitH=parseFloat(tel.style.height)||0;
      const elH=Math.max(measuredH,explicitH)||Math.ceil((parseFloat(getComputedStyle(edit).fontSize)||36)*1.5);
      const op=parseFloat(tel.style.opacity)||1;
      const rotMatch=(tel.style.transform||'').match(/rotate\((-?[\d.]+)deg\)/);
      const rotDeg=rotMatch?parseFloat(rotMatch[1]):0;

      // Read styles directly from inline style (not computedStyle which gives screen-scaled values)
      const editStyle=edit.style;
      const cs=window.getComputedStyle(edit);
      const fs=parseFloat(editStyle.fontSize||cs.fontSize)||36;
      const ffRaw=editStyle.fontFamily||cs.fontFamily||'sans-serif';
      // FIX Bug 3: resolve generic font families to actual computed font names
      const ff=resolveFont(edit, ffRaw);
      const fwRaw=editStyle.fontWeight||cs.fontWeight||'400';
      const fw=fwRaw;
      const fi2=(editStyle.fontStyle||cs.fontStyle)==='italic'?'italic':'normal';
      // FIX Bug 2: detect transparent color for outline text
      const fcRaw=editStyle.color||cs.color||'#ffffff';
      const isTransparentColor=fcRaw==='transparent'||fcRaw==='rgba(0, 0, 0, 0)'||fcRaw==='rgba(0,0,0,0)';
      const fc=isTransparentColor?'rgba(0,0,0,0)':fcRaw;
      const ta=editStyle.textAlign||cs.textAlign||'left';
      // FIX Bug 4: read letter-spacing from computedStyle (inline style may not be set)
      const lsRaw=editStyle.letterSpacing||cs.letterSpacing||'0';
      const ls=parseFloat(lsRaw)||0;
      const lhRaw=editStyle.lineHeight||cs.lineHeight||'normal';
      const lh=lhRaw==='normal'?fs*1.2:parseFloat(lhRaw)||fs*1.2;
      const ts=editStyle.textShadow||cs.textShadow||'none';
      const tt=editStyle.textTransform||cs.textTransform||'none';
      const td=editStyle.textDecoration||cs.textDecoration||'none';
      const stroke=editStyle.webkitTextStroke||editStyle.textStroke||cs.webkitTextStroke||cs.getPropertyValue('-webkit-text-stroke')||'';
      // FIX Bug 1: read stamp border/padding styles
      const borderWidth=parseFloat(editStyle.borderWidth||cs.borderWidth)||0;
      const borderColor=editStyle.borderColor||cs.borderColor||'transparent';
      const borderRadius=parseFloat(editStyle.borderRadius||cs.borderRadius)||0;
      const padTop=parseFloat(editStyle.paddingTop||cs.paddingTop)||0;
      const padRight=parseFloat(editStyle.paddingRight||cs.paddingRight)||0;
      const padBottom=parseFloat(editStyle.paddingBottom||cs.paddingBottom)||0;
      const padLeft=parseFloat(editStyle.paddingLeft||cs.paddingLeft)||0;

      ctx.save();
      ctx.globalAlpha=op;

      // Apply rotation around element centre
      if(rotDeg!==0){
        const cx=tx+elW/2, cy=ty+elH/2;
        ctx.translate(cx,cy);
        ctx.rotate(rotDeg*Math.PI/180);
        ctx.translate(-elW/2,-elH/2);
        ctx.translate(0,0);
      } else {
        ctx.translate(tx,ty);
      }

      ctx.font=`${fi2} ${fw} ${fs}px ${ff}`;
      // Note: ctx.letterSpacing set for modern browsers as fallback; manual spacing used below for full compat
      try{ ctx.letterSpacing=ls+'px'; }catch(e){}

      // Ã¢â€â‚¬Ã¢â€â‚¬ Text shadow — robust multi-shadow parser Ã¢â€â‚¬Ã¢â€â‚¬
      // CSS default shadow color is currentColor (the text color), not arbitrary black.
      function parseShadows(shadowStr, color){
        if(!shadowStr||shadowStr==='none')return[];
        const resolved=shadowStr.replace(/currentColor/gi,color);
        const parts=[];let cur='',depth=0;
        for(const ch of resolved){
          if(ch==='(')depth++;
          else if(ch===')')depth--;
          else if(ch===','&&depth===0){parts.push(cur.trim());cur='';continue;}
          cur+=ch;
        }
        if(cur.trim())parts.push(cur.trim());
        return parts.map(part=>{
          const colorRe=/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g;
          let sc=color;
          const cm=part.match(colorRe);
          if(cm)sc=cm[0];
          const noCol=part.replace(colorRe,'');
          const vals=[];
          const vr=/(-?[\d.]+)(?:px|em|rem)?/g;
          let vm;
          while((vm=vr.exec(noCol))!==null)vals.push(parseFloat(vm[1]));
          return{ox:vals[0]||0,oy:vals[1]||0,blur:vals[2]||0,color:sc};
        });
      }

      const shadows=parseShadows(ts,fc);

      // Parse stroke "Npx color" once for reuse in shadow + final passes
      let strokeWidth=0, strokeColor='';
      if(stroke && stroke!=='0px' && stroke!==''){
        const sm=stroke.match(/([\d.]+)px\s+(.+)/);
        if(sm){ strokeWidth=parseFloat(sm[1]); strokeColor=sm[2].trim(); }
      }
      const hasStroke = strokeWidth>0 && strokeColor && strokeColor!=='transparent';

      // Word wrap (account for padding in available width)
      const textAreaW=elW-padLeft-padRight;
      const words=txt.split(' ');
      const lines=[];let line='';
      ctx.font=`${fi2} ${fw} ${fs}px ${ff}`;
      for(const word of words){
        const test=line?line+' '+word:word;
        if(measureWithSpacing(ctx,test,ls)>textAreaW*1.02&&line){lines.push(line);line=word;}
        else line=test;
      }
      if(line)lines.push(line);
      const finalLines=[];
      for(const l of lines)finalLines.push(...l.split('\n'));

      const lineH=lh>fs?lh:fs*1.2;
      const topOffset=(lineH-fs)/2;

      // FIX Bug 1: Draw stamp border box BEFORE text
      if(borderWidth>0 && borderColor && borderColor!=='transparent' && borderColor!=='rgba(0, 0, 0, 0)'){
        const totalTextH=finalLines.length*lineH;
        const boxW=elW;
        const boxH=totalTextH+padTop+padBottom;
        ctx.save();
        ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
        ctx.strokeStyle=borderColor;
        ctx.lineWidth=borderWidth;
        ctx.lineJoin='round';
        if(borderRadius>0){
          const r=Math.min(borderRadius,boxW/2,boxH/2);
          const bx=borderWidth/2, by=borderWidth/2;
          const bw=boxW-borderWidth, bh=boxH-borderWidth;
          ctx.beginPath();
          ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);ctx.arcTo(bx+bw,by,bx+bw,by+r,r);
          ctx.lineTo(bx+bw,by+bh-r);ctx.arcTo(bx+bw,by+bh,bx+bw-r,by+bh,r);
          ctx.lineTo(bx+r,by+bh);ctx.arcTo(bx,by+bh,bx,by+bh-r,r);
          ctx.lineTo(bx,by+r);ctx.arcTo(bx,by,bx+r,by,r);
          ctx.closePath();ctx.stroke();
        } else {
          ctx.strokeRect(borderWidth/2,borderWidth/2,boxW-borderWidth,boxH-borderWidth);
        }
        ctx.restore();
      }

      // Text draw origin offset by padding
      const textOffsetX=padLeft;
      const textOffsetY=padTop;

      // Per-line iteration helper — keeps alignment/positioning logic in one place.
      function forEachLine(cb){
        finalLines.forEach((lineStr,i)=>{
          const drawStr=tt==='uppercase'?lineStr.toUpperCase():tt==='lowercase'?lineStr.toLowerCase():lineStr;
          let drawX=textOffsetX;
          if(ta==='center')drawX=textOffsetX+textAreaW/2;
          else if(ta==='right')drawX=textOffsetX+textAreaW;
          const yPos=textOffsetY+topOffset+i*lineH;
          const canvasAlign=ta==='center'?'center':ta==='right'?'right':'left';
          cb(drawStr,drawX,yPos,canvasAlign);
        });
      }
      function drawStrokePass(){
        if(!hasStroke)return;
        ctx.strokeStyle=strokeColor;
        // Browser renders -webkit-text-stroke painted before fill — fill covers the inner half
        // of the stroke. Canvas strokeText centers on the path the same way, so lineWidth=Npx
        // matches an N-px CSS text-stroke. (The old *2 multiplier was a workaround for an
        // earlier render order that has since been fixed.)
        ctx.lineWidth=strokeWidth;
        ctx.lineJoin='round';
        ctx.miterLimit=2;
        forEachLine((s,x,y,al)=>{
          ctx.textAlign=al;ctx.textBaseline='top';
          strokeTextSpaced(ctx,s,x,y,ls,al);
        });
      }
      function drawFillPass(){
        if(isTransparentColor)return;
        ctx.fillStyle=fc;
        forEachLine((s,x,y,al)=>{
          ctx.textAlign=al;ctx.textBaseline='top';
          fillTextSpaced(ctx,s,x,y,ls,al,textAreaW);
        });
      }
      function drawDecorations(){
        if(!(td.includes('underline')||td.includes('line-through')))return;
        const decoColor=isTransparentColor?(strokeColor||'#000'):fc;
        ctx.fillStyle=decoColor;
        forEachLine((s,x,y,al)=>{
          ctx.textAlign=al;ctx.textBaseline='top';
          const tw=measureWithSpacing(ctx,s,ls);
          const lx=al==='center'?x-tw/2:al==='right'?x-tw:x;
          if(td.includes('underline'))ctx.fillRect(lx,y+fs+Math.max(1,fs*.06),tw,Math.max(1,fs/14));
          if(td.includes('line-through'))ctx.fillRect(lx,y+fs*.55,tw,Math.max(1,fs/14));
        });
      }

      // Render order matches the browser:
      //   1. Shadows (reverse order — CSS spec: first listed is topmost)
      //   2. Stroke (outline behind fill)
      //   3. Fill
      //   4. Decorations (underline / line-through)
      // Each shadow pass casts shadow from the FULL glyph silhouette: stroke + fill + decorations.
      // The shadow-cast paint is overwritten by the final un-shadowed pass below; only the
      // shadow blur remains visible, matching how the browser composites text-shadow.
      if(shadows.length>0){
        for(let si=shadows.length-1;si>=0;si--){
          const sh=shadows[si];
          ctx.save();
          ctx.shadowOffsetX=sh.ox;
          ctx.shadowOffsetY=sh.oy;
          ctx.shadowBlur=sh.blur;
          ctx.shadowColor=sh.color;
          drawStrokePass();
          drawFillPass();
          drawDecorations();
          ctx.restore();
        }
      }

      ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
      drawStrokePass();
      drawFillPass();
      drawDecorations();

      ctx.restore();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Draw canvas elements (.canvas-elem — shapes, emojis) Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(80,'Rendering shapes & stickers…');
    await new Promise(r=>setTimeout(r,10));
    const elemEls=document.getElementById('collage-canvas').querySelectorAll('.canvas-elem');
    for(const el of elemEls){
      const ex=parseFloat(el.style.left)||0;
      const ey=parseFloat(el.style.top)||0;
      const ew=parseFloat(el.style.width)||80;
      const eh=parseFloat(el.style.height)||80;
      const op=parseFloat(el.style.opacity)||1;
      const rotMatch=(el.style.transform||'').match(/rotate\((-?[\d.]+)deg\)/);
      const rotDeg=rotMatch?parseFloat(rotMatch[1]):0;

      // Check if emoji/sticker
      const spanEl=el.querySelector('span');
      const svgEl=el.querySelector('svg');

      ctx.save();
      ctx.globalAlpha=op;
      // Rotate around element centre
      const cx=ex+ew/2, cy=ey+eh/2;
      ctx.translate(cx,cy);
      if(rotDeg!==0)ctx.rotate(rotDeg*Math.PI/180);
      ctx.translate(-ew/2,-eh/2);

      if(spanEl&&!svgEl){
        // Emoji/sticker — draw as text
        const fs=parseFloat(spanEl.style.fontSize)||48;
        ctx.font=`${fs}px serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText(spanEl.textContent,ew/2,eh/2);
      } else if(el.dataset.elemType==='image'){
        // Custom image element
        const imgEl=el.querySelector('img');
        if(imgEl){
          const src=imgEl.dataset.imgSrc||imgEl.src;
          await new Promise(resolve=>{
            const i2=new Image();
            i2.onload=()=>{
              // object-fit: contain
              const iw=i2.naturalWidth, ih=i2.naturalHeight;
              const scale=Math.min(ew/iw, eh/ih);
              const dw=iw*scale, dh=ih*scale;
              const dx=(ew-dw)/2, dy=(eh-dh)/2;
              ctx.drawImage(i2,dx,dy,dw,dh);
              resolve();
            };
            i2.onerror=resolve;
            i2.src=src;
          });
        }
      } else if(svgEl){
        // SVG shape — render via Image
        const svgColor=svgEl.style.color||el.dataset.color||'#4956a5';
        const svgClone=svgEl.cloneNode(true);
        svgClone.setAttribute('width',ew);
        svgClone.setAttribute('height',eh);
        svgClone.style.color=svgColor;
        // Apply fill/stroke from inline style
        const fill=svgEl.style.fill||'';
        const stroke=svgEl.style.stroke||'';
        if(fill)svgClone.style.fill=fill;
        if(stroke)svgClone.style.stroke=stroke;
        const svgStr=new XMLSerializer().serializeToString(svgClone);
        const blob=new Blob([svgStr],{type:'image/svg+xml'});
        const url=URL.createObjectURL(blob);
        await new Promise(resolve=>{
          const img=new Image();
          img.onload=()=>{ctx.drawImage(img,0,0,ew,eh);URL.revokeObjectURL(url);resolve();};
          img.onerror=()=>{URL.revokeObjectURL(url);resolve();};
          img.src=url;
        });
      }
      ctx.restore();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Watermark Ã¢â€â‚¬Ã¢â€â‚¬
    const wm=document.getElementById('collage-canvas').querySelector('.watermark');
    if(wm){
      ctx.save();
      ctx.font='italic 11px Fraunces,serif';
      ctx.fillStyle='rgba(73,86,165,0.45)';
      ctx.textAlign='right';
      ctx.textBaseline='bottom';
      ctx.fillText('Ã¢Å“Â¦ CollageStudio',canvasW-10,canvasH-8);
      ctx.restore();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Download Ã¢â€â‚¬Ã¢â€â‚¬
    setProgress(92,'Encoding image…');
    await new Promise(r=>setTimeout(r,30));
    const mimeType=fmt==='jpg'?'image/jpeg':'image/png';
    const ext=fmt==='jpg'?'jpg':'png';
    oc.toBlob(blob=>{
      setProgress(100,'Done! Ã°Å¸Å½â€°');
      setTimeout(()=>{
        overlay.classList.remove('show');
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.download=`${filename}.${ext}`;a.href=url;a.click();
        setTimeout(()=>URL.revokeObjectURL(url),2000);
        showToast('Downloaded successfully!','success');
      },500);
    },mimeType,quality);

  }catch(err){
    overlay.classList.remove('show');
    console.error(err);
    showToast('Export failed: '+err.message,'error');
  }
}

// Rounded rectangle clip path
function roundedClip(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();ctx.clip();
}

// ══════════════════════════════════════════════════════════════════
// CARD SHAPES — heart, star, circle, etc. for occasion-template cells.
// Each shape provides:
//   id, name, faIcon — UI metadata
//   clipPath — CSS clip-path for the live DOM cell
//   drawPath(ctx,x,y,w,h) — adds a path on the export ctx (call ctx.beginPath first)
// Polaroid shape (rect) is the default and uses the standard rect path.
// ══════════════════════════════════════════════════════════════════
const CARD_SHAPES=[
  {id:'rect',name:'Rectangle',faIcon:'fa-square',
   clipPath:'',
   drawPath:(ctx,x,y,w,h)=>{ctx.rect(x,y,w,h);}},
  {id:'circle',name:'Circle',faIcon:'fa-circle',
   clipPath:'circle(50% at 50% 50%)',
   drawPath:(ctx,x,y,w,h)=>{const r=Math.min(w,h)/2;ctx.arc(x+w/2,y+h/2,r,0,Math.PI*2);}},
  {id:'ellipse',name:'Oval',faIcon:'fa-egg',
   clipPath:'ellipse(50% 50% at 50% 50%)',
   drawPath:(ctx,x,y,w,h)=>{ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);}},
  {id:'heart',name:'Heart',faIcon:'fa-heart',
   // CSS path() uses absolute coords and won't scale with the element, so the live
   // clip-path references an SVG <clipPath clipPathUnits="objectBoundingBox"> defined
   // by installShapeClipPaths() below. The drawPath callback handles export rendering
   // and scales the same path to (w,h) explicitly.
   clipPath:'url(#card-clip-heart)',
   drawPath:(ctx,x,y,w,h)=>{
     const sx=w/100,sy=h/100;
     ctx.moveTo(x+50*sx,y+90*sy);
     ctx.bezierCurveTo(x+0*sx,y+55*sy,x+0*sx,y+15*sy,x+25*sx,y+15*sy);
     ctx.bezierCurveTo(x+40*sx,y+15*sy,x+50*sx,y+30*sy,x+50*sx,y+40*sy);
     ctx.bezierCurveTo(x+50*sx,y+30*sy,x+60*sx,y+15*sy,x+75*sx,y+15*sy);
     ctx.bezierCurveTo(x+100*sx,y+15*sy,x+100*sx,y+55*sy,x+50*sx,y+90*sy);
     ctx.closePath();
   }},
  {id:'star',name:'Star',faIcon:'fa-star',
   clipPath:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
   drawPath:(ctx,x,y,w,h)=>{
     const pts=[[50,0],[61,35],[98,35],[68,57],[79,91],[50,70],[21,91],[32,57],[2,35],[39,35]];
     pts.forEach(([px,py],i)=>{const cx=x+px*w/100,cy=y+py*h/100;i?ctx.lineTo(cx,cy):ctx.moveTo(cx,cy);});
     ctx.closePath();
   }},
  {id:'hexagon',name:'Hexagon',faIcon:'fa-shapes',
   clipPath:'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
   drawPath:(ctx,x,y,w,h)=>{
     const pts=[[25,0],[75,0],[100,50],[75,100],[25,100],[0,50]];
     pts.forEach(([px,py],i)=>{const cx=x+px*w/100,cy=y+py*h/100;i?ctx.lineTo(cx,cy):ctx.moveTo(cx,cy);});
     ctx.closePath();
   }},
  {id:'diamond',name:'Diamond',faIcon:'fa-gem',
   clipPath:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
   drawPath:(ctx,x,y,w,h)=>{
     ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();
   }},
  // Organic blob — irregular 13-point polygon for the "fluid / liquid" 2026
  // aesthetic. Stretches with the cell so it doesn't need aspect-locking.
  {id:'blob',name:'Blob',faIcon:'fa-droplet',
   clipPath:'polygon(35% 5%, 60% 0%, 80% 12%, 95% 30%, 100% 55%, 92% 78%, 75% 95%, 50% 100%, 25% 92%, 8% 75%, 0% 55%, 5% 30%, 18% 12%)',
   drawPath:(ctx,x,y,w,h)=>{
     const pts=[[35,5],[60,0],[80,12],[95,30],[100,55],[92,78],[75,95],[50,100],[25,92],[8,75],[0,55],[5,30],[18,12]];
     pts.forEach(([px,py],i)=>{const cx=x+px*w/100,cy=y+py*h/100;i?ctx.lineTo(cx,cy):ctx.moveTo(cx,cy);});
     ctx.closePath();
   }},
];
function getCardShape(id){return CARD_SHAPES.find(s=>s.id===id)||CARD_SHAPES[0];}
// Trace a shape's silhouette onto the current Canvas-2D path, no clipping yet.
// Returns true on success so callers can fall back if the shape couldn't be
// rendered. The two layered uses (shadow fill + clip) share this so they always
// agree on the silhouette.
//   1. Prefer a registered CARD_SHAPES entry — its drawPath is hand-tuned.
//   2. Otherwise reuse getClipPathCSS so shape templates (triangle, arrow,
//      shield, heart halves, vshape, xbands, hex slices) trace the identical
//      silhouette in the export as in the live editor.
function traceShapePath(ctx,shapeId,x,y,w,h){
  const registered=CARD_SHAPES.find(s=>s.id===shapeId);
  if(registered){
    ctx.beginPath();
    registered.drawPath(ctx,x,y,w,h);
    return {kind:'path'};
  }
  const css=typeof getClipPathCSS==='function'?getClipPathCSS(shapeId,w,h):null;
  if(!css)return null;
  const polyMatch=css.match(/^polygon\(([^)]+)\)$/);
  if(polyMatch){
    const points=polyMatch[1].split(',').map(p=>{
      const parts=p.trim().split(/\s+/);
      const parseAxis=(s,extent)=>s.endsWith('%')?parseFloat(s)/100*extent:parseFloat(s);
      return [x+parseAxis(parts[0],w), y+parseAxis(parts[1],h)];
    });
    ctx.beginPath();
    points.forEach(([cx,cy],i)=>i?ctx.lineTo(cx,cy):ctx.moveTo(cx,cy));
    ctx.closePath();
    return {kind:'path'};
  }
  const circleMatch=css.match(/^circle\(\s*(\d+(?:\.\d+)?)%?\s+at\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s*\)$/);
  if(circleMatch){
    const r=parseFloat(circleMatch[1])/100*Math.min(w,h);
    const cx=x+parseFloat(circleMatch[2])/100*w;
    const cy=y+parseFloat(circleMatch[3])/100*h;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    return {kind:'path'};
  }
  const pathMatch=css.match(/^path\(\s*['"](.+)['"]\s*\)$/);
  if(pathMatch&&typeof Path2D!=='undefined'){
    // getClipPathCSS path() coords are already in cell-local pixel space, so
    // hand back a Path2D + translation so the caller can fill or clip it without
    // mutating the global path state.
    return {kind:'path2d',path:new Path2D(pathMatch[1]),tx:x,ty:y};
  }
  return null;
}
// Clip the export ctx to a card shape's path. Mirrors roundedClip's API.
function shapeClip(ctx,shapeId,x,y,w,h){
  const r=traceShapePath(ctx,shapeId,x,y,w,h);
  if(!r){ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();return;}
  if(r.kind==='path2d'){
    ctx.translate(r.tx,r.ty);
    ctx.clip(r.path);
    ctx.translate(-r.tx,-r.ty);
    return;
  }
  ctx.clip();
}
// Fill a shape's silhouette (used to draw the shadow underneath).
function shapeFill(ctx,shapeId,x,y,w,h){
  const r=traceShapePath(ctx,shapeId,x,y,w,h);
  if(!r){ctx.beginPath();ctx.rect(x,y,w,h);ctx.fill();return;}
  if(r.kind==='path2d'){
    ctx.translate(r.tx,r.ty);
    ctx.fill(r.path);
    ctx.translate(-r.tx,-r.ty);
    return;
  }
  ctx.fill();
}

// Inject SVG <clipPath> defs for shapes whose CSS clip-path can't scale on its own
// (anything that needs cubic beziers — path() uses absolute coords). Runs once.
// `clipPathUnits="objectBoundingBox"` makes the path coords 0-1 percentages of the
// element's bounding box, so the clip stretches to fit any cell size.
let _shapeClipsInstalled=false;
function installShapeClipPaths(){
  if(_shapeClipsInstalled)return;
  if(document.getElementById('card-clip-defs')){_shapeClipsInstalled=true;return;}
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='card-clip-defs';
  svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;width:0;height:0;overflow:hidden');
  svg.setAttribute('aria-hidden','true');
  // Heart path normalised to 0-1 coordinates (was 100×100, divide by 100).
  svg.innerHTML=`<defs><clipPath id="card-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.9 C0,0.55 0,0.15 0.25,0.15 C0.4,0.15 0.5,0.3 0.5,0.4 C0.5,0.3 0.6,0.15 0.75,0.15 C1,0.15 1,0.55 0.5,0.9 Z"/></clipPath></defs>`;
  document.body.appendChild(svg);
  _shapeClipsInstalled=true;
}

// Calculate drawImage params from object-fit + object-position
function calcObjectFit(fit,pos,iw,ih,cw,ch){
  // default: cover centre
  let sx=0,sy=0,sw=iw,sh=ih,dx=0,dy=0,dw=cw,dh=ch;

  if(fit==='fill'){
    return {sx:0,sy:0,sw:iw,sh:ih,dx:0,dy:0,dw:cw,dh:ch};
  }

  const imgRatio=iw/ih, cellRatio=cw/ch;

  if(fit==='contain'){
    if(imgRatio>cellRatio){ dw=cw; dh=cw/imgRatio; }
    else { dh=ch; dw=ch*imgRatio; }
    dx=(cw-dw)/2; dy=(ch-dh)/2;
    return {sx:0,sy:0,sw:iw,sh:ih,dx,dy,dw,dh};
  }

  // cover (default)
  if(imgRatio>cellRatio){
    // image wider than cell → crop sides
    sh=ih; sw=ih*cellRatio;
  } else {
    // image taller than cell → crop top/bottom
    sw=iw; sh=iw/cellRatio;
  }

  // Apply object-position
  const p=pos.trim().toLowerCase();
  const hMap={left:0,center:.5,right:1};
  const vMap={top:0,center:.5,bottom:1};
  let hFrac=.5,vFrac=.5;

  const parts=p.split(/\s+/);
  if(parts.length===1){
    if(hMap[parts[0]]!==undefined) hFrac=hMap[parts[0]];
    else if(vMap[parts[0]]!==undefined) vFrac=vMap[parts[0]];
  } else {
    if(hMap[parts[0]]!==undefined) hFrac=hMap[parts[0]]; else if(!isNaN(parts[0])) hFrac=parseFloat(parts[0])/100;
    if(vMap[parts[1]]!==undefined) vFrac=vMap[parts[1]]; else if(!isNaN(parts[1])) vFrac=parseFloat(parts[1])/100;
  }

  sx=(iw-sw)*hFrac;
  sy=(ih-sh)*vFrac;

  return {sx,sy,sw,sh,dx:0,dy:0,dw:cw,dh:ch};
}

// UI
function switchTab(name,el){
  document.querySelectorAll('.sidebar-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
  const panel=document.getElementById('tab-'+name);
  if(panel)panel.classList.add('active');
  if(el)el.classList.add('active');
}
let _tt;
function showToast(msg,type=''){
  const t=document.getElementById('toast');document.getElementById('t-msg').textContent=msg;
  const icon=type==='success'?'fa-circle-check':type==='error'?'fa-circle-xmark':'fa-circle-info';
  document.getElementById('t-icon').innerHTML=`<i class="fa-solid ${icon}"></i>`;
  t.className=type?`show ${type}`:'show';clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2400);
}

function deselect(){
  cells.forEach(c=>c.el&&c.el.classList.remove('selected'));
  document.querySelectorAll('.canvas-text,.canvas-elem,.canvas-text-pro').forEach(t=>t.classList.remove('selected'));
  // Also clear any active Fabric text selection so its handles + delete control go away.
  if(fabricCanvas&&fabricCanvas.getActiveObject()){
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  }
  if(typeof clearMultiSelectionDOM==='function')clearMultiSelectionDOM();
  selectedCell=null;selectedText=null;selectedElem=null;
  updateRightPanel(null);
}

// Ã¢â€â‚¬Ã¢â€â‚¬ GLOBAL CANVAS DROP — drag image file from PC onto canvas Ã¢â€â‚¬Ã¢â€â‚¬
document.getElementById('canvas-scroll').addEventListener('dragover',e=>{
  if(Array.from(e.dataTransfer.types).some(t=>t.toLowerCase()==='files')){
    e.preventDefault();
    e.dataTransfer.dropEffect='copy';
    // Highlight whichever cell the cursor is over
    const target=document.elementFromPoint(e.clientX,e.clientY);
    const cellEl=target?.closest('.cell');
    document.querySelectorAll('.cell').forEach(c=>c.classList.remove('drag-over'));
    if(cellEl)cellEl.classList.add('drag-over');
  }
});
document.getElementById('canvas-scroll').addEventListener('dragleave',e=>{
  if(!document.getElementById('canvas-scroll').contains(e.relatedTarget)){
    document.querySelectorAll('.cell').forEach(c=>c.classList.remove('drag-over'));
  }
});
document.getElementById('canvas-scroll').addEventListener('drop',e=>{
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('drag-over'));
  if(e.dataTransfer.files&&e.dataTransfer.files.length>0){
    const file=Array.from(e.dataTransfer.files).find(f=>f.type.startsWith('image/'));
    if(file){
      const target=document.elementFromPoint(e.clientX,e.clientY);
      const cellEl=target?.closest('.cell');
      const idx=cellEl?cells.findIndex(c=>c.el===cellEl):-1;
      e.preventDefault();
      const r=new FileReader();
      r.onload=ev=>{
        addPhotoIfNew(ev.target.result,file.name);
        if(idx>=0){
          setPhotoInCell(idx,ev.target.result,cells[idx]);
          saveHistory();updateFillStats();showToast('Photo placed!','success');
          updateRightPanel(selectedCell);
        } else {
          const emp=cells.find(c=>!c.imgData);
          if(emp){setPhotoInCell(emp.cellIndex,ev.target.result,emp);saveHistory();updateFillStats();showToast('Photo placed in next cell!','success');}
          else showToast('Photo added to panel!','success');
        }
      };
      r.readAsDataURL(file);
    }
  }
});

// Clicks on empty canvas space deselect everything. We need to distinguish three cases:
//   1. Click hit a DOM element (.canvas-elem, .cell, .canvas-text-pro) → handled by
//      the element itself; we leave its selection alone.
//   2. Click hit the Fabric upper-canvas (target inside .canvas-container) → Fabric
//      already processed it (selecting a text or firing selection:cleared), so we
//      don't intervene here.
//   3. Click bypassed Fabric (because pointer-events were 'none' on empty zones) and
//      landed on bare #collage-canvas → empty-space click; deselect everything,
//      including any active Fabric object (handled by deselect()).
function clickLandedOnEditable(e){
  if(e.target.closest('.canvas-elem,.canvas-text-pro,.canvas-text,.cell,.canvas-container'))return true;
  if(e.target.id==='fabric-text-layer')return true;
  return false;
}
document.getElementById('collage-canvas').addEventListener('click',e=>{
  if(typeof _suppressNextCanvasClick!=='undefined'&&_suppressNextCanvasClick){
    _suppressNextCanvasClick=false;
    return;
  }
  if(!clickLandedOnEditable(e)){
    deselect();
    if(isMobile())closeAllMobPanels();
  }
});
document.getElementById('collage-canvas').addEventListener('touchend',e=>{
  if(!clickLandedOnEditable(e)){
    deselect();
    if(isMobile())closeAllMobPanels();
  }
});

// Clicks anywhere outside the canvas + right-panel + modals also deselect, so the
// user can drop the selection by tapping the sidebar, toolbar, or empty side gutters.
// Excluded zones: the canvas itself (its own handlers run), the right panel (where
// the user is editing the selected element's properties), any open modal/menu, and
// the page loader / context menu / mobile nav.
function clickLandedInEditingZone(e){
  return !!e.target.closest('#collage-canvas, .right-panel, .sidebar, .mob-nav, .mob-backdrop, .modal-overlay, .crop-modal-overlay, #ctx-menu, #page-loader, .canvas-container');
}
document.addEventListener('mousedown',e=>{
  if(clickLandedInEditingZone(e))return;
  // Discard Fabric's active object too so its selection box / delete control vanish.
  if(fabricCanvas&&fabricCanvas.getActiveObject()){
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  }
  if(typeof selectedElem!=='undefined'&&selectedElem){
    deselect();
  }else if(typeof selectedCell!=='undefined'&&selectedCell!==null){
    deselect();
  }
},true);

document.addEventListener('keydown',e=>{
  const tag=document.activeElement.tagName;
  const inFormField=tag==='INPUT'||tag==='TEXTAREA'||document.activeElement.isContentEditable;
  // Fabric IText is "in editing mode" when the user has double-clicked into it; in
  // that mode the user is typing — keyboard shortcuts must not steal Backspace etc.
  const fabActive=fabricCanvas&&fabricCanvas.getActiveObject();
  const fabricEditing=!!(fabActive&&fabActive.isEditing);

  // Undo/redo always available unless typing in a form field.
  if(!inFormField){
    if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();undo();return;}
    if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();redo();return;}
  }
  if(inFormField||fabricEditing)return;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Arrow keys move EVERY selected element/text by 1 px (10 px with shift) Ã¢â€â‚¬Ã¢â€â‚¬
  // Works across both layers: each DOM element in the multi set + the legacy single
  // selectedElem + Fabric's active object/ActiveSelection (which already moves the
  // group as one when selected via Fabric's native shift-click).
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    const step=e.shiftKey?10:1;
    const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
    const dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
    let moved=false;
    // Fabric layer: moving the active object/group moves all child objects together.
    if(fabActive){
      e.preventDefault();
      fabActive.set({left:(fabActive.left||0)+dx,top:(fabActive.top||0)+dy});
      fabActive.setCoords();
      fabricCanvas.requestRenderAll();
      moved=true;
    }
    // DOM layer: shift every multi-selected element + the legacy single one.
    const domEls=new Set(multiSelectedDOM);
    if(selectedElem&&selectedElem.style)domEls.add(selectedElem);
    domEls.forEach(el=>{
      if(!el||!el.style)return;
      e.preventDefault();
      const l=parseFloat(el.style.left)||0;
      const t=parseFloat(el.style.top)||0;
      el.style.left=(l+dx)+'px';
      el.style.top=(t+dy)+'px';
      moved=true;
    });
    if(moved){
      if(typeof debouncedSave==='function')debouncedSave();
      return;
    }
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Delete / Backspace removes EVERY selected element/text Ã¢â€â‚¬Ã¢â€â‚¬
  // Only fires when NOT typing inline (fabricEditing already returned above).
  if(e.key==='Delete'||e.key==='Backspace'){
    let removed=false;
    // Fabric: remove every active object (handles ActiveSelection of N objects).
    if(fabricCanvas){
      const fabActives=fabricCanvas.getActiveObjects?.()||[];
      if(fabActives.length){
        e.preventDefault();
        fabActives.forEach(o=>fabricCanvas.remove(o));
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
        removed=true;
      }
    }
    // DOM: remove every multi-selected element + the legacy single one.
    const domEls=new Set(multiSelectedDOM);
    if(selectedElem&&typeof selectedElem.remove==='function')domEls.add(selectedElem);
    domEls.forEach(el=>{
      e.preventDefault();
      el.remove();
      removed=true;
    });
    if(removed){
      clearMultiSelectionDOM();
      selectedElem=null;
      if(typeof updateRightPanel==='function')updateRightPanel(null);
      if(typeof saveHistory==='function')saveHistory();
      return;
    }
    if(selectedCell!==null){
      e.preventDefault();
      removeCellPhoto(selectedCell);
    }
  }

  if(e.key==='Escape'){
    // Exit text editing mode on any active text element
    document.querySelectorAll('.txt-edit[contenteditable=true]').forEach(ed=>{
      ed.contentEditable='false';ed.style.cursor='inherit';ed.style.userSelect='none';
    });
    if(fabActive&&fabricCanvas){fabricCanvas.discardActiveObject();fabricCanvas.requestRenderAll();}
    cancelSwap();
    cells.forEach(c=>c.el.classList.remove('selected'));document.querySelectorAll('.canvas-text').forEach(t=>t.classList.remove('selected'));selectedCell=null;selectedText=null;selectedElem=null;updateRightPanel(null);document.querySelectorAll('.modal-overlay,.crop-modal-overlay').forEach(m=>m.classList.remove('open'));
  }
  if(e.key==='='||e.key==='+')changeZoom(10);if(e.key==='-')changeZoom(-10);if(e.key==='0')resetZoom();
});

// Ã¢â€â‚¬Ã¢â€â‚¬ EXPORT MODAL Ã¢â€â‚¬Ã¢â€â‚¬
let exportFmt='png';
function showExportModal(){
  document.getElementById('export-modal').classList.add('open');
  const scale=parseInt(document.getElementById('exp-scale').value)||2;
  document.getElementById('exp-pixel-size').textContent=Math.round(canvasW*scale)+' × '+Math.round(canvasH*scale)+' px';
  if(typeof loadExportAd==='function')loadExportAd();
}
function selectExportFmt(fmt){
  exportFmt=fmt;
  document.getElementById('exp-png').classList.toggle('selected',fmt==='png');
  document.getElementById('exp-jpg').classList.toggle('selected',fmt==='jpg');
  document.getElementById('jpg-quality-row').style.display=fmt==='jpg'?'block':'none';
  const ext=document.getElementById('exp-filename-ext');
  if(ext)ext.textContent='.'+fmt;
}
function doExportWithOptions(){
  closeModal('export-modal');
  const scale=parseInt(document.getElementById('exp-scale').value)||2;
  const quality=parseInt(document.getElementById('jpg-quality').value)/100||0.92;
  const rawName=(document.getElementById('exp-filename')?.value||'my-collage').trim().replace(/[^a-zA-Z0-9_\-\s]/g,'').trim()||'my-collage';
  downloadCollage(exportFmt,scale,quality,rawName);
}

// Ã¢â€â‚¬Ã¢â€â‚¬ GRADIENT BUILDER Ã¢â€â‚¬Ã¢â€â‚¬
function switchBgTab(name,el){
  document.querySelectorAll('.bgtab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.bg-stab').forEach(b=>b.classList.remove('active'));
  document.getElementById('bgtab-'+name).classList.add('active');
  el.classList.add('active');
}
function setBgClean(el){
  bgColor=el.dataset.color;
  bgImageDataUrl=null;currentPattern=null;
  applyBgToCanvas();
  document.querySelectorAll('.csw,.grad-preset,.bg-img-card,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected');
  const prev=document.getElementById('custom-bg-preview');
  if(prev)prev.style.background=bgColor;
}
const GRAD_PRESETS=[
  {name:'Purple Dream',g:'linear-gradient(135deg,#667eea,#764ba2)'},
  {name:'Sunset',g:'linear-gradient(135deg,#f093fb,#f5576c)'},
  {name:'Ocean Blue',g:'linear-gradient(135deg,#4facfe,#00f2fe)'},
  {name:'Forest',g:'linear-gradient(135deg,#43e97b,#38f9d7)'},
  {name:'Candy',g:'linear-gradient(135deg,#f6d365,#fda085)'},
  {name:'Royal',g:'linear-gradient(135deg,#4956a5,#c97ae8)'},
  {name:'Rose Gold',g:'linear-gradient(135deg,#f7971e,#ffd200)'},
  {name:'Midnight',g:'linear-gradient(135deg,#0f0c29,#302b63)'},
  {name:'Cherry',g:'linear-gradient(135deg,#eb3349,#f45c43)'},
  {name:'Emerald',g:'linear-gradient(135deg,#0f9b58,#00bf8f)'},
  {name:'Arctic',g:'linear-gradient(135deg,#dde9f5,#a8c8e8)'},
  {name:'Lava',g:'linear-gradient(135deg,#3d0000,#6f0000)'},
];
function buildGradPresets(){
  const grid=document.getElementById('grad-preset-grid');if(!grid)return;
  GRAD_PRESETS.forEach(p=>{
    const div=document.createElement('div');div.className='grad-preset';
    div.style.background=p.g;div.innerHTML=`<span>${p.name}</span>`;
    div.onclick=()=>{
      bgColor=p.g;bgImageDataUrl=null;currentPattern=null;
      applyBgToCanvas();
      document.querySelectorAll('.grad-preset,.csw,.bg-img-card,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
      div.classList.add('selected');
    };
    grid.appendChild(div);
  });
}

// BG IMAGES
const BG_IMAGES_DEF={
  nature:[
    {name:'Sunset Sky',fn:(ctx,w,h,rnd)=>{
      // Vivid multi-layer sunset
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#0d0221');g.addColorStop(.25,'#7b2d8b');g.addColorStop(.5,'#e8471a');
      g.addColorStop(.72,'#f5921e');g.addColorStop(.88,'#f9d71c');g.addColorStop(1,'#fcf59e');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Sun
      const sg=ctx.createRadialGradient(w*.5,h*.72,0,w*.5,h*.72,h*.18);
      sg.addColorStop(0,'#fff7a0');sg.addColorStop(.3,'#ffd700');sg.addColorStop(.7,'#ff8c00');sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
      // Horizon glow
      const hg=ctx.createRadialGradient(w*.5,h*.75,0,w*.5,h*.75,w*.6);
      hg.addColorStop(0,'rgba(255,180,0,.45)');hg.addColorStop(1,'transparent');
      ctx.fillStyle=hg;ctx.fillRect(0,0,w,h);
      // Silhouette skyline
      ctx.fillStyle='#0a0015';
      ctx.beginPath();ctx.moveTo(0,h);
      const bldgs=[[0,.88],[.08,.82],[.12,.75],[.15,.82],[.2,.78],[.25,.7],[.28,.78],[.32,.72],[.36,.8],[.4,.74],[.43,.82],[.5,.68],[.55,.76],[.6,.72],[.65,.8],[.7,.75],[.75,.82],[.8,.76],[.85,.83],[.9,.78],[.95,.85],[1,.82],[1,1]];
      bldgs.forEach(([x,y])=>ctx.lineTo(x*w,y*h));
      ctx.closePath();ctx.fill();
      // Stars near top
      ctx.fillStyle='#fff';
      for(let i=0;i<30;i++){ctx.globalAlpha=.4+rnd()*.6;ctx.beginPath();ctx.arc(rnd()*w,rnd()*h*.3,rnd()*.8+.2,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }},
    {name:'Night Sky',fn:(ctx,w,h,rnd)=>{
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#020210');g.addColorStop(.5,'#0a0a2e');g.addColorStop(1,'#0d1a3a');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Milky way band
      const mg=ctx.createLinearGradient(0,h*.1,w,h*.6);
      mg.addColorStop(0,'transparent');mg.addColorStop(.4,'rgba(100,120,200,.12)');mg.addColorStop(.6,'rgba(150,170,255,.18)');mg.addColorStop(1,'transparent');
      ctx.fillStyle=mg;ctx.fillRect(0,0,w,h);
      // Stars - varied sizes
      for(let i=0;i<120;i++){
        const x=rnd()*w,y=rnd()*h*.85,r=rnd()*1.2+.1;
        ctx.fillStyle='#fff';ctx.globalAlpha=.3+rnd()*.7;
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      // Bright stars with cross glow
      [[.15,.12],[.72,.08],[.45,.2],[.85,.15],[.3,.05]].forEach(([sx,sy])=>{
        ctx.globalAlpha=.9;ctx.fillStyle='#fffff0';
        ctx.beginPath();ctx.arc(sx*w,sy*h,1.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,240,.4)';ctx.lineWidth=.5;
        ctx.beginPath();ctx.moveTo(sx*w-6,sy*h);ctx.lineTo(sx*w+6,sy*h);ctx.moveTo(sx*w,sy*h-6);ctx.lineTo(sx*w,sy*h+6);ctx.stroke();
      });
      ctx.globalAlpha=1;
      // Crescent moon
      const mx=w*.78,my=h*.15,mr=h*.07;
      ctx.fillStyle='#fffde7';ctx.shadowColor='#fffde7';ctx.shadowBlur=20;
      ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#0a0a2e';ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(mx+mr*.3,my-mr*.05,mr*.88,0,Math.PI*2);ctx.fill();
      // Ground silhouette
      ctx.fillStyle='#04040f';
      ctx.beginPath();ctx.moveTo(0,h);
      [[0,.82],[.1,.78],[.2,.82],[.35,.75],[.5,.8],[.65,.76],[.8,.82],[1,.78],[1,1]].forEach(([x,y])=>ctx.lineTo(x*w,y*h));
      ctx.closePath();ctx.fill();
    }},
    {name:'Forest',fn:(ctx,w,h,rnd)=>{
      // Sky
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#1a4a1a');sky.addColorStop(.4,'#2d6b2d');sky.addColorStop(1,'#1a3a10');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      // Light shaft from top
      const lg=ctx.createRadialGradient(w*.5,0,0,w*.5,0,h*.8);
      lg.addColorStop(0,'rgba(180,255,120,.15)');lg.addColorStop(1,'transparent');
      ctx.fillStyle=lg;ctx.fillRect(0,0,w,h);
      // Background trees (light)
      ctx.fillStyle='#1a3d12';
      for(let i=0;i<12;i++){
        const tx=i*w/11+rnd()*w*.05,th=h*(.55+rnd()*.15),tw=w*.045;
        ctx.beginPath();ctx.moveTo(tx,h*.7);ctx.lineTo(tx-tw,h*.7-th*.4);ctx.lineTo(tx,h*.7-th);ctx.lineTo(tx+tw,h*.7-th*.4);ctx.closePath();ctx.fill();
      }
      // Mid trees (medium)
      ctx.fillStyle='#123a0a';
      for(let i=0;i<8;i++){
        const tx=i*w/7+rnd()*w*.08,th=h*(.65+rnd()*.15),tw=w*.06;
        ctx.beginPath();ctx.moveTo(tx,h);ctx.lineTo(tx-tw,h-th*.4);ctx.lineTo(tx,h-th);ctx.lineTo(tx+tw,h-th*.4);ctx.closePath();ctx.fill();
      }
      // Foreground dark trees
      ctx.fillStyle='#0a2208';
      for(let i=0;i<5;i++){
        const tx=i*w/4+rnd()*w*.1,th=h*.9,tw=w*.08;
        ctx.beginPath();ctx.moveTo(tx,h);ctx.lineTo(tx-tw,h-th*.35);ctx.lineTo(tx,h-th);ctx.lineTo(tx+tw,h-th*.35);ctx.closePath();ctx.fill();
      }
      // Forest floor
      ctx.fillStyle='#0d2208';ctx.fillRect(0,h*.85,w,h*.15);
      // Fog/mist layer
      const fog=ctx.createLinearGradient(0,h*.55,0,h*.75);
      fog.addColorStop(0,'transparent');fog.addColorStop(.5,'rgba(180,230,160,.08)');fog.addColorStop(1,'transparent');
      ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
    }},
    {name:'Ocean',fn:(ctx,w,h,rnd)=>{
      // Sky
      const sky=ctx.createLinearGradient(0,0,0,h*.5);
      sky.addColorStop(0,'#0a1628');sky.addColorStop(.5,'#1e4a7a');sky.addColorStop(1,'#2e7fc0');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.5);
      // Ocean
      const sea=ctx.createLinearGradient(0,h*.5,0,h);
      sea.addColorStop(0,'#1a6fa0');sea.addColorStop(.4,'#0d4a72');sea.addColorStop(1,'#061828');
      ctx.fillStyle=sea;ctx.fillRect(0,h*.5,w,h*.5);
      // Horizon reflection
      const hr=ctx.createLinearGradient(0,h*.45,0,h*.65);
      hr.addColorStop(0,'transparent');hr.addColorStop(.5,'rgba(255,255,255,.08)');hr.addColorStop(1,'transparent');
      ctx.fillStyle=hr;ctx.fillRect(0,0,w,h);
      // Moon/sun reflection on water
      const ref=ctx.createLinearGradient(w*.3,h*.5,w*.7,h);
      ref.addColorStop(0,'rgba(255,220,100,.3)');ref.addColorStop(.5,'rgba(255,220,100,.12)');ref.addColorStop(1,'transparent');
      ctx.fillStyle=ref;ctx.fillRect(0,h*.5,w,h*.5);
      // Wave lines - vivid
      for(let i=0;i<10;i++){
        const wy=h*(.5+i*.05);
        ctx.beginPath();
        for(let x=0;x<=w;x+=4)ctx.lineTo(x,wy+Math.sin(x/18+i*1.3)*4*(1+i*.15));
        ctx.strokeStyle=`rgba(100,200,255,${.08+i*.025})`;ctx.lineWidth=1+i*.1;ctx.stroke();
      }
      // Clouds
      ctx.fillStyle='rgba(180,210,240,.6)';
      [[.2,.15,.15],[.6,.1,.12],[.85,.2,.1]].forEach(([cx,cy,r])=>{
        ctx.beginPath();ctx.ellipse(cx*w,cy*h,r*w,r*h*.4,0,0,Math.PI*2);ctx.fill();
      });
      // Stars
      ctx.fillStyle='#fff';
      for(let i=0;i<20;i++){ctx.globalAlpha=.3+rnd()*.5;ctx.beginPath();ctx.arc(rnd()*w,rnd()*h*.35,.6,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }},
    {name:'Mountains',fn:(ctx,w,h,rnd)=>{
      // Sky gradient - vivid blue
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#0a1a3a');sky.addColorStop(.4,'#1a4a8a');sky.addColorStop(.7,'#4a8ad4');sky.addColorStop(1,'#8ac4f0');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      // Sun with rays
      ctx.fillStyle='#fffbe0';ctx.shadowColor='#ffd700';ctx.shadowBlur=30;
      ctx.beginPath();ctx.arc(w*.75,h*.18,h*.06,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      // Far mountains - snowy peaks
      ctx.fillStyle='#4a6a8a';
      ctx.beginPath();ctx.moveTo(0,h);
      [[0,.6],[.1,.4],[.2,.5],[.32,.28],[.45,.42],[.55,.32],[.68,.45],[.78,.3],[.88,.42],[1,.5],[1,1]].forEach(([x,y])=>ctx.lineTo(x*w,y*h));
      ctx.closePath();ctx.fill();
      // Snow caps
      ctx.fillStyle='#e8f4ff';
      [[.32,.28,.06],[.55,.32,.05],[.78,.3,.055]].forEach(([px,py,sz])=>{
        ctx.beginPath();ctx.moveTo(px*w,py*h);
        ctx.lineTo((px-sz)*w,(py+sz*.8)*h);ctx.lineTo((px+sz)*w,(py+sz*.8)*h);ctx.closePath();ctx.fill();
      });
      // Mid mountains - darker
      ctx.fillStyle='#2d4a6a';
      ctx.beginPath();ctx.moveTo(0,h);
      [[0,.75],[.15,.55],[.3,.65],[.45,.48],[.6,.58],[.75,.45],[.88,.58],[1,.65],[1,1]].forEach(([x,y])=>ctx.lineTo(x*w,y*h));
      ctx.closePath();ctx.fill();
      // Foreground - dark green
      ctx.fillStyle='#1a3a18';
      ctx.beginPath();ctx.moveTo(0,h);
      [[0,.88],[.2,.82],[.4,.85],[.6,.8],[.8,.84],[1,.82],[1,1]].forEach(([x,y])=>ctx.lineTo(x*w,y*h));
      ctx.closePath();ctx.fill();
    }},
    {name:'Cherry Blossom',fn:(ctx,w,h,rnd)=>{
      // Soft gradient sky
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#fce4ec');g.addColorStop(.5,'#fff0f5');g.addColorStop(1,'#fce4ec');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Tree trunk and branches
      ctx.strokeStyle='#5d4037';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(w*.5,h);ctx.quadraticCurveTo(w*.48,h*.6,w*.4,h*.35);ctx.stroke();
      ctx.lineWidth=3;
      [[w*.4,h*.35,w*.2,h*.1],[w*.4,h*.35,w*.55,h*.15],[w*.4,h*.35,w*.65,h*.3],[w*.4,h*.35,w*.25,h*.35]].forEach(([sx,sy,ex,ey])=>{
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+ex)/2+rnd()*20-10,(sy+ey)/2,ex,ey);ctx.stroke();
      });
      // Blossom clusters
      const pinks=['#f48fb1','#f06292','#ec407a','#fce4ec','#ff80ab'];
      for(let i=0;i<80;i++){
        const bx=rnd()*w*.7+w*.1,by=rnd()*h*.5+h*.05;
        const r=2+rnd()*4;
        ctx.fillStyle=pinks[Math.floor(rnd()*pinks.length)];
        ctx.globalAlpha=.7+rnd()*.3;
        ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.fill();
      }
      // Falling petals
      for(let i=0;i<30;i++){
        ctx.save();ctx.translate(rnd()*w,rnd()*h);ctx.rotate(rnd()*Math.PI*2);
        ctx.fillStyle=pinks[Math.floor(rnd()*pinks.length)];ctx.globalAlpha=.5+rnd()*.5;
        ctx.beginPath();ctx.ellipse(0,0,3+rnd()*2,1.5+rnd()*1,0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      ctx.globalAlpha=1;
      // Grass
      ctx.fillStyle='#81c784';ctx.fillRect(0,h*.85,w,h*.15);
      ctx.fillStyle='#66bb6a';ctx.fillRect(0,h*.9,w,h*.1);
    }},
    {name:'Beach',fn:(ctx,w,h,rnd)=>{
      // Sky to sea gradient
      const sky=ctx.createLinearGradient(0,0,0,h*.55);
      sky.addColorStop(0,'#9ed5e8');sky.addColorStop(.6,'#cce8f0');sky.addColorStop(1,'#e7f3f7');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.55);
      // Sea
      const sea=ctx.createLinearGradient(0,h*.55,0,h*.78);
      sea.addColorStop(0,'#4fa8c4');sea.addColorStop(.5,'#5cb6cf');sea.addColorStop(1,'#76c2d4');
      ctx.fillStyle=sea;ctx.fillRect(0,h*.55,w,h*.23);
      // Foam line
      ctx.fillStyle='rgba(255,255,255,.7)';
      for(let i=0;i<w;i+=8){ctx.beginPath();ctx.arc(i+rnd()*4,h*.78+rnd()*3,2.5,0,Math.PI*2);ctx.fill();}
      // Sand
      const sand=ctx.createLinearGradient(0,h*.78,0,h);
      sand.addColorStop(0,'#f1d8a8');sand.addColorStop(1,'#e0bc7e');
      ctx.fillStyle=sand;ctx.fillRect(0,h*.78,w,h*.22);
      // Sand texture grains
      ctx.fillStyle='rgba(150,100,50,.18)';
      for(let i=0;i<200;i++){ctx.fillRect(rnd()*w,h*.78+rnd()*h*.22,1,1);}
      // Sun
      const sg=ctx.createRadialGradient(w*.78,h*.18,0,w*.78,h*.18,h*.12);
      sg.addColorStop(0,'#fff7c2');sg.addColorStop(.5,'#fde68a');sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h*.5);
      // Distant sailboat
      ctx.fillStyle='rgba(255,255,255,.95)';
      ctx.beginPath();ctx.moveTo(w*.18,h*.62);ctx.lineTo(w*.21,h*.55);ctx.lineTo(w*.21,h*.625);ctx.closePath();ctx.fill();
      ctx.fillRect(w*.205,h*.625,w*.025,h*.008);
    }},
    {name:'Snow Day',fn:(ctx,w,h,rnd)=>{
      // Cool grey-blue gradient sky
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#cdd9e3');g.addColorStop(.55,'#e8eef3');g.addColorStop(1,'#f5f8fa');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Distant pine silhouettes
      ctx.fillStyle='rgba(60,80,90,.35)';
      for(let i=0;i<7;i++){
        const tx=i*w/6+rnd()*w*.05,ty=h*.55+rnd()*h*.04,th=h*.18+rnd()*h*.06,tw=h*.07;
        ctx.beginPath();ctx.moveTo(tx,ty+th);ctx.lineTo(tx-tw/2,ty+th);ctx.lineTo(tx,ty);ctx.lineTo(tx+tw/2,ty+th);ctx.closePath();ctx.fill();
      }
      // Snow ground
      ctx.fillStyle='#fff';ctx.fillRect(0,h*.7,w,h*.3);
      // Snow drifts
      ctx.fillStyle='rgba(200,215,225,.55)';
      ctx.beginPath();ctx.moveTo(0,h*.78);
      for(let x=0;x<=w;x+=20)ctx.lineTo(x,h*.78+Math.sin(x/30)*6);
      ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
      // Falling snowflakes
      ctx.fillStyle='#fff';
      for(let i=0;i<140;i++){const sx=rnd()*w,sy=rnd()*h,sr=rnd()*1.6+.4;ctx.globalAlpha=.5+rnd()*.5;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }},
    {name:'Tropical',fn:(ctx,w,h,rnd)=>{
      // Sunset over water
      const sky=ctx.createLinearGradient(0,0,0,h*.6);
      sky.addColorStop(0,'#ff7b54');sky.addColorStop(.4,'#ffaa6c');sky.addColorStop(.8,'#ffd29c');sky.addColorStop(1,'#ffe2b8');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.6);
      // Sun
      ctx.fillStyle='#fff5c5';
      ctx.beginPath();ctx.arc(w*.5,h*.55,h*.1,0,Math.PI*2);ctx.fill();
      // Sea
      const sea=ctx.createLinearGradient(0,h*.6,0,h);
      sea.addColorStop(0,'#5b3a8a');sea.addColorStop(.5,'#3d2671');sea.addColorStop(1,'#2a1a55');
      ctx.fillStyle=sea;ctx.fillRect(0,h*.6,w,h*.4);
      // Sun reflection on water
      ctx.fillStyle='rgba(255,200,120,.4)';
      for(let i=0;i<10;i++){const ry=h*.6+i*h*.04;ctx.fillRect(w*.42,ry,w*.16,2);}
      // Palm tree silhouette on right
      ctx.fillStyle='#1a0f30';
      ctx.beginPath();ctx.moveTo(w*.85,h);ctx.quadraticCurveTo(w*.83,h*.7,w*.88,h*.35);ctx.lineTo(w*.9,h*.35);ctx.quadraticCurveTo(w*.86,h*.72,w*.88,h);ctx.closePath();ctx.fill();
      // Palm fronds
      [[-.6,-.5],[-.2,-.7],[.3,-.65],[.6,-.4],[-.7,-.1],[.7,-.15]].forEach(([dx,dy])=>{
        ctx.beginPath();ctx.moveTo(w*.89,h*.35);
        ctx.quadraticCurveTo(w*.89+w*.04*dx*.5,h*.35+h*.05*dy*.5,w*.89+w*.07*dx,h*.35+h*.1*dy);
        ctx.lineWidth=3;ctx.strokeStyle='#1a0f30';ctx.stroke();
      });
    }},
  ],
  abstract:[
    {name:'Bokeh',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#060610';ctx.fillRect(0,0,w,h);
      const cols=['#4956c8','#c97ae8','#38e8d4','#e8d438','#e8384a','#38a8e8'];
      // Large background bokeh
      for(let i=0;i<8;i++){
        const x=rnd()*w,y=rnd()*h,r=rnd()*w*.2+w*.05;
        const g=ctx.createRadialGradient(x,y,0,x,y,r);
        const c=cols[i%cols.length];
        g.addColorStop(0,c+'55');g.addColorStop(.5,c+'22');g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      }
      // Mid bokeh circles
      for(let i=0;i<20;i++){
        const x=rnd()*w,y=rnd()*h,r=rnd()*30+8;
        const g=ctx.createRadialGradient(x,y,r*.2,x,y,r);
        const c=cols[i%cols.length];
        g.addColorStop(0,'transparent');g.addColorStop(.6,c+'44');g.addColorStop(.85,c+'88');g.addColorStop(1,c+'22');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      // Bright small lights
      for(let i=0;i<35;i++){
        const x=rnd()*w,y=rnd()*h,r=rnd()*4+1;
        ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=.5+rnd()*.5;
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }},
    {name:'Geometric',fn:(ctx,w,h,rnd)=>{
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#0f1228');g.addColorStop(.5,'#1a1e40');g.addColorStop(1,'#0a0d20');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      const cols=[['#4956a5','#6673c4'],['#c97ae8','#e8a0f8'],['#38e8c9','#a0f8e8'],['#e8c938','#f8e090'],['#e83858','#f870a0']];
      // Large geometric shapes
      for(let i=0;i<18;i++){
        ctx.save();ctx.translate(rnd()*w,rnd()*h);ctx.rotate(rnd()*Math.PI);
        const [c1,c2]=cols[i%cols.length];
        const s=rnd()*60+20;
        ctx.fillStyle=c1;ctx.globalAlpha=.3+rnd()*.4;
        if(i%3===0){ctx.fillRect(-s/2,-s/2,s,s);}
        else if(i%3===1){ctx.beginPath();ctx.moveTo(0,-s*.6);ctx.lineTo(s*.5,s*.4);ctx.lineTo(-s*.5,s*.4);ctx.closePath();ctx.fill();}
        else{ctx.beginPath();ctx.arc(0,0,s*.5,0,Math.PI*2);ctx.fill();}
        // Stroke outline
        ctx.strokeStyle=c2;ctx.lineWidth=1;ctx.globalAlpha=.6;
        if(i%3===0){ctx.strokeRect(-s/2,-s/2,s,s);}
        ctx.restore();
      }
      ctx.globalAlpha=1;
    }},
    {name:'Aurora',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#020812';ctx.fillRect(0,0,w,h);
      // Stars
      ctx.fillStyle='#fff';
      for(let i=0;i<60;i++){ctx.globalAlpha=.2+rnd()*.6;ctx.beginPath();ctx.arc(rnd()*w,rnd()*h*.5,.4+rnd()*.6,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
      // Aurora curtains - vivid
      const aColors=[
        ['#00ff88','#00ffcc','#00aaff'],
        ['#8800ff','#cc00ff','#ff00cc'],
        ['#00ccff','#00ffaa','#88ff00'],
      ];
      aColors.forEach(([c1,c2,c3],ci)=>{
        ctx.save();
        const ag=ctx.createLinearGradient(0,h*(ci*.12),0,h*(ci*.12+.5));
        ag.addColorStop(0,'transparent');ag.addColorStop(.3,c1+'88');ag.addColorStop(.6,c2+'66');ag.addColorStop(1,'transparent');
        ctx.fillStyle=ag;
        ctx.beginPath();
        ctx.moveTo(0,h*(ci*.12));
        for(let x=0;x<=w;x+=8)ctx.lineTo(x,h*(ci*.12)+Math.sin(x/30+ci*2)*h*.06);
        for(let x=w;x>=0;x-=8)ctx.lineTo(x,h*(ci*.12+.5)+Math.sin(x/25+ci)*h*.04);
        ctx.closePath();ctx.fill();ctx.restore();
      });
      // Ground reflection
      const gr=ctx.createLinearGradient(0,h*.8,0,h);
      gr.addColorStop(0,'#0a1a0a');gr.addColorStop(1,'#050a05');
      ctx.fillStyle=gr;ctx.fillRect(0,h*.8,w,h*.2);
      // Ice reflection
      ctx.fillStyle='rgba(0,255,136,.1)';
      ctx.beginPath();ctx.ellipse(w*.5,h*.88,w*.4,h*.06,0,0,Math.PI*2);ctx.fill();
    }},
    {name:'Neon Grid',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#04040e';ctx.fillRect(0,0,w,h);
      // Perspective grid
      const vx=w*.5,vy=h*.45;
      ctx.strokeStyle='rgba(0,200,255,.35)';ctx.lineWidth=.8;
      // Horizontal lines converging to vanishing point
      for(let i=0;i<=12;i++){
        const y=h*.45+i*(h*.55/12);const spread=(i/12)*w*.5;
        ctx.beginPath();ctx.moveTo(vx-spread,y);ctx.lineTo(vx+spread,y);ctx.stroke();
      }
      // Vertical lines converging
      for(let i=-8;i<=8;i++){
        const bx=vx+i*(w*.06);
        ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(bx+(i*w*.02),h);ctx.stroke();
      }
      ctx.lineWidth=1.5;ctx.strokeStyle='rgba(0,200,255,.8)';
      // Horizon line bright
      ctx.beginPath();ctx.moveTo(0,h*.45);ctx.lineTo(w,h*.45);ctx.stroke();
      // Center glow
      const cg=ctx.createRadialGradient(vx,vy,0,vx,vy,h*.3);
      cg.addColorStop(0,'rgba(0,200,255,.25)');cg.addColorStop(.5,'rgba(80,0,200,.1)');cg.addColorStop(1,'transparent');
      ctx.fillStyle=cg;ctx.fillRect(0,0,w,h);
      // Pink/purple sky
      const sg=ctx.createLinearGradient(0,0,0,h*.45);
      sg.addColorStop(0,'#1a0030');sg.addColorStop(1,'#300060');
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h*.45);
      ctx.strokeStyle='rgba(200,0,255,.25)';ctx.lineWidth=.6;
      for(let i=0;i<8;i++){
        ctx.beginPath();ctx.moveTo(0,i*h*.06);ctx.lineTo(w,i*h*.06);ctx.stroke();
      }
      // Neon sun
      const sun=ctx.createRadialGradient(vx,vy,0,vx,vy,h*.12);
      sun.addColorStop(0,'#ff0080');sun.addColorStop(.5,'#ff4488');sun.addColorStop(1,'transparent');
      ctx.fillStyle=sun;ctx.fillRect(0,0,w,h*.5);
      // Stars
      ctx.fillStyle='#fff';
      for(let i=0;i<25;i++){ctx.globalAlpha=.3+rnd()*.5;ctx.beginPath();ctx.arc(rnd()*w,rnd()*h*.4,.4,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }},
    {name:'Confetti',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
      const cols=['#4956c8','#e05252','#38b27a','#f5c842','#c97ae8','#4facfe','#ff6b35','#e91e63'];
      for(let i=0;i<100;i++){
        ctx.save();ctx.translate(rnd()*w,rnd()*h);ctx.rotate(rnd()*Math.PI*2);
        ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=.75+rnd()*.25;
        const t=i%4;
        if(t===0){ctx.fillRect(-5,-2.5,10,5);}
        else if(t===1){ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();}
        else if(t===2){ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(4,4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();}
        else{ctx.beginPath();ctx.ellipse(0,0,5,2,0,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
      ctx.globalAlpha=1;
    }},
    {name:'Pastel Blobs',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#fffef8';ctx.fillRect(0,0,w,h);
      const cols=['#ffb3c8','#a8e6cf','#b3d9ff','#e8b3ff','#ffe8a1','#b3f0e8','#ffcba8'];
      // Large soft blobs
      for(let i=0;i<9;i++){
        const x=rnd()*w,y=rnd()*h,rx=(rnd()*.4+.15)*w,ry=(rnd()*.3+.1)*h;
        const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
        g.addColorStop(0,cols[i%cols.length]+'dd');g.addColorStop(.5,cols[(i+2)%cols.length]+'88');g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.globalAlpha=.8;ctx.fillRect(0,0,w,h);
      }
      ctx.globalAlpha=1;
      // Overlay slight texture
      ctx.fillStyle='rgba(255,255,255,.3)';
      for(let i=0;i<400;i++){ctx.fillRect(rnd()*w,rnd()*h,1,1);}
    }},
    {name:'Mesh Gradient',fn:(ctx,w,h,rnd)=>{
      // CSS-mesh-gradient look — 4 large overlapping radial blobs in vivid hues
      // covering the canvas, then a subtle haze on top to soften the edges.
      ctx.fillStyle='#0d0a2e';ctx.fillRect(0,0,w,h);
      const stops=[
        [w*.2,h*.25,'#ff6b9d'],
        [w*.85,h*.18,'#feca57'],
        [w*.18,h*.82,'#48dbfb'],
        [w*.78,h*.78,'#a55eea'],
      ];
      stops.forEach(([cx,cy,col])=>{
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.55);
        g.addColorStop(0,col);g.addColorStop(.45,col+'66');g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      });
      // Soft haze for that frosted-glass mesh look
      ctx.fillStyle='rgba(255,255,255,.04)';ctx.fillRect(0,0,w,h);
    }},
    {name:'Wave Layers',fn:(ctx,w,h,rnd)=>{
      // Sky background
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#fef3e9');sky.addColorStop(1,'#ffd9b8');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      // Stacked wave bands, each a smooth sine curve in a different hue
      const bands=[
        {y:.45,col:'#ff9a76',amp:.05},
        {y:.6,col:'#ff7e7e',amp:.04},
        {y:.75,col:'#c06c84',amp:.06},
        {y:.88,col:'#6c5b7b',amp:.05},
      ];
      bands.forEach(({y:by,col,amp})=>{
        ctx.fillStyle=col;
        ctx.beginPath();ctx.moveTo(0,h);
        for(let x=0;x<=w;x+=4){
          const wave=Math.sin(x/w*Math.PI*2+by*10)*h*amp;
          ctx.lineTo(x,h*by+wave);
        }
        ctx.lineTo(w,h);ctx.closePath();ctx.fill();
      });
    }},
    {name:'Holographic',fn:(ctx,w,h,rnd)=>{
      // Iridescent gradient sweep — pinks, purples, blues, mint
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#ff80b5');g.addColorStop(.25,'#c47aff');g.addColorStop(.5,'#7ab9ff');g.addColorStop(.75,'#7af9d4');g.addColorStop(1,'#fff48a');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Light streaks for the mylar shimmer
      ctx.globalAlpha=.18;ctx.fillStyle='#fff';
      for(let i=0;i<14;i++){
        ctx.save();ctx.translate(w*.5,h*.5);ctx.rotate(rnd()*Math.PI*2);
        ctx.fillRect(-w,-2-rnd()*4,w*2,2+rnd()*3);
        ctx.restore();
      }
      ctx.globalAlpha=1;
      // Subtle dark vignette so the photos don't melt into the background
      const v=ctx.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.4,w*.5,h*.5,Math.max(w,h)*.7);
      v.addColorStop(0,'transparent');v.addColorStop(1,'rgba(0,0,0,.18)');
      ctx.fillStyle=v;ctx.fillRect(0,0,w,h);
    }},
  ],
  texture:[
    {name:'Paper',fn:(ctx,w,h,rnd)=>{
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#f0ead8');g.addColorStop(.5,'#f5f0e2');g.addColorStop(1,'#ede5d0');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Paper grain noise
      for(let i=0;i<3000;i++){
        ctx.fillStyle=`rgba(${rnd()>0.5?'80,60,30':'240,220,180'},.04)`;
        ctx.fillRect(rnd()*w,rnd()*h,rnd()<.5?1:2,1);
      }
      // Subtle ruled lines
      ctx.strokeStyle='rgba(150,130,90,.07)';ctx.lineWidth=1;
      for(let y=20;y<h;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    }},
    {name:'Marble',fn:(ctx,w,h,rnd)=>{
      // Rich cream marble base
      const g=ctx.createLinearGradient(0,0,w*.3,h);
      g.addColorStop(0,'#f5f0ec');g.addColorStop(.3,'#ede8e0');g.addColorStop(.6,'#f0ece5');g.addColorStop(1,'#e8e2d8');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Marble veins - dark
      for(let i=0;i<8;i++){
        ctx.save();ctx.strokeStyle=`rgba(${180+rnd()*30},${165+rnd()*25},${140+rnd()*25},${.2+rnd()*.25})`;
        ctx.lineWidth=.5+rnd()*1.5;
        ctx.beginPath();
        let x=rnd()*w;
        for(let y=0;y<=h;y+=3)ctx.lineTo(x+Math.sin(y/20+i*2.3)*15+Math.sin(y/7+i)*4,y);
        ctx.stroke();ctx.restore();
      }
      // Gold veins
      for(let i=0;i<3;i++){
        ctx.strokeStyle=`rgba(200,170,100,.${Math.floor(15+rnd()*20)})`;ctx.lineWidth=.6;
        ctx.beginPath();let x=rnd()*w;
        for(let y=0;y<=h;y+=3)ctx.lineTo(x+Math.sin(y/15+i*3)*12,y);
        ctx.stroke();
      }
    }},
    {name:'Linen',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#e8dfc8';ctx.fillRect(0,0,w,h);
      // Woven texture
      for(let x=0;x<w;x+=2){
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);
        ctx.strokeStyle=`rgba(${120+rnd()*30},${100+rnd()*20},${70+rnd()*20},.15)`;ctx.lineWidth=1;ctx.stroke();
      }
      for(let y=0;y<h;y+=2){
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);
        ctx.strokeStyle=`rgba(${110+rnd()*30},${90+rnd()*20},${65+rnd()*20},.1)`;ctx.lineWidth=1;ctx.stroke();
      }
      // Thread highlight
      ctx.strokeStyle='rgba(255,240,200,.15)';ctx.lineWidth=1;
      for(let x=0;x<w;x+=4){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    }},
    {name:'Dark Marble',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#0e0e0e';ctx.fillRect(0,0,w,h);
      // Blue-grey marble veins
      for(let i=0;i<12;i++){
        ctx.strokeStyle=`rgba(${80+rnd()*60},${100+rnd()*60},${120+rnd()*80},${.08+rnd()*.12})`;
        ctx.lineWidth=.5+rnd()*2;
        ctx.beginPath();let x=rnd()*w;
        for(let y=0;y<=h;y+=3)ctx.lineTo(x+Math.sin(y/16+i*1.7)*12+Math.sin(y/5+i)*3,y);
        ctx.stroke();
      }
      // Gold veins
      for(let i=0;i<4;i++){
        ctx.strokeStyle=`rgba(212,175,55,${.12+rnd()*.15})`;ctx.lineWidth=.5+rnd();
        ctx.beginPath();let x=rnd()*w;
        for(let y=0;y<=h;y+=3)ctx.lineTo(x+Math.sin(y/12+i*2.8)*10,y);
        ctx.stroke();
      }
      // Subtle sheen
      const sg=ctx.createRadialGradient(w*.3,h*.3,0,w*.3,h*.3,w*.6);
      sg.addColorStop(0,'rgba(255,255,255,.05)');sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
    }},
    {name:'Gold Foil',fn:(ctx,w,h,rnd)=>{
      // Rich gold gradient base
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#8b6508');g.addColorStop(.15,'#d4a00a');g.addColorStop(.3,'#ffd700');
      g.addColorStop(.45,'#ffec6e');g.addColorStop(.6,'#d4a00a');g.addColorStop(.75,'#ffd700');
      g.addColorStop(.9,'#b8860b');g.addColorStop(1,'#ffd700');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Diagonal sheen
      const sg=ctx.createLinearGradient(0,0,w*.6,h*.4);
      sg.addColorStop(0,'transparent');sg.addColorStop(.4,'rgba(255,255,200,.35)');sg.addColorStop(.6,'rgba(255,255,200,.15)');sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
      // Fine texture lines
      ctx.lineWidth=.4;
      for(let i=0;i<30;i++){
        ctx.strokeStyle=`rgba(255,255,255,${.04+rnd()*.08})`;
        ctx.beginPath();let x=rnd()*w;
        for(let y=0;y<=h;y+=3)ctx.lineTo(x+Math.sin(y/10+i)*5,y);
        ctx.stroke();
      }
      // Dark grain
      for(let i=0;i<20;i++){
        ctx.strokeStyle=`rgba(100,70,0,${.04+rnd()*.06})`;ctx.lineWidth=.5;
        ctx.beginPath();let x=rnd()*w;
        for(let y=0;y<=h;y+=4)ctx.lineTo(x+Math.sin(y/8+i*2)*6,y);
        ctx.stroke();
      }
    }},
    {name:'Blueprint',fn:(ctx,w,h,rnd)=>{
      ctx.fillStyle='#0a2a5e';ctx.fillRect(0,0,w,h);
      // Fine grid
      ctx.strokeStyle='rgba(100,160,255,.2)';ctx.lineWidth=.5;
      for(let x=0;x<w;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      for(let y=0;y<h;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      // Major grid lines
      ctx.strokeStyle='rgba(100,160,255,.5)';ctx.lineWidth=.8;
      for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      // Blueprint drawing elements
      ctx.strokeStyle='rgba(150,200,255,.7)';ctx.lineWidth=1.2;
      // House shape
      ctx.beginPath();ctx.moveTo(w*.25,h*.75);ctx.lineTo(w*.25,h*.45);ctx.lineTo(w*.37,h*.3);ctx.lineTo(w*.49,h*.45);ctx.lineTo(w*.49,h*.75);ctx.closePath();ctx.stroke();
      // Circle/compass
      ctx.beginPath();ctx.arc(w*.72,h*.45,h*.12,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(w*.72-h*.14,h*.45);ctx.lineTo(w*.72+h*.14,h*.45);
      ctx.moveTo(w*.72,h*.45-h*.14);ctx.lineTo(w*.72,h*.45+h*.14);ctx.stroke();
      // Dimension lines
      ctx.strokeStyle='rgba(150,200,255,.4)';ctx.lineWidth=.6;
      ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(w*.15,h*.75);ctx.lineTo(w*.6,h*.75);ctx.stroke();
      ctx.setLineDash([]);
    }},
    {name:'Wood Grain',fn:(ctx,w,h,rnd)=>{
      // Warm wood base
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#b9824a');g.addColorStop(.5,'#a06c38');g.addColorStop(1,'#7a4f23');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Long horizontal grain stripes
      ctx.strokeStyle='rgba(60,30,5,.18)';ctx.lineWidth=1.1;
      for(let i=0;i<60;i++){
        ctx.beginPath();
        const baseY=rnd()*h;
        for(let x=0;x<=w;x+=8){
          const y=baseY+Math.sin(x/40+i*.8)*2.5+Math.sin(x/12+i)*1.2;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // Knots
      for(let i=0;i<3;i++){
        const kx=rnd()*w,ky=rnd()*h;
        const kg=ctx.createRadialGradient(kx,ky,0,kx,ky,12+rnd()*8);
        kg.addColorStop(0,'rgba(50,25,5,.7)');kg.addColorStop(.6,'rgba(70,40,15,.4)');kg.addColorStop(1,'transparent');
        ctx.fillStyle=kg;ctx.fillRect(kx-25,ky-25,50,50);
      }
    }},
    {name:'Watercolor',fn:(ctx,w,h,rnd)=>{
      // Soft cream base
      ctx.fillStyle='#fdf9f0';ctx.fillRect(0,0,w,h);
      // Wet-on-wet washes — overlapping translucent radial gradients in muted hues
      const cols=['#fbb4b4','#a8c8e8','#b8d8b0','#e8d4b0','#d8b8e0','#a0d8d0'];
      for(let i=0;i<10;i++){
        const cx=rnd()*w,cy=rnd()*h,r=h*.18+rnd()*h*.25;
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        const c=cols[i%cols.length];
        g.addColorStop(0,c+'66');g.addColorStop(.5,c+'33');g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      }
      // Edge bleeds — irregular blob outlines
      ctx.lineWidth=1;
      for(let i=0;i<6;i++){
        ctx.strokeStyle=cols[i%cols.length]+'70';
        ctx.beginPath();const cx=rnd()*w,cy=rnd()*h,r=20+rnd()*30;
        for(let a=0;a<Math.PI*2;a+=Math.PI/12){
          const wob=r+(rnd()-.5)*8;
          const x=cx+Math.cos(a)*wob,y=cy+Math.sin(a)*wob;
          a===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();ctx.stroke();
      }
      // Paper grain on top
      ctx.fillStyle='rgba(140,100,60,.04)';
      for(let i=0;i<300;i++){ctx.fillRect(rnd()*w,rnd()*h,1,1);}
    }},
    {name:'Concrete',fn:(ctx,w,h,rnd)=>{
      // Cool grey base with tonal variation
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#c8ccd0');g.addColorStop(.5,'#b8bcc0');g.addColorStop(1,'#a8acb0');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Mottled blotches for the cement look
      for(let i=0;i<40;i++){
        const cx=rnd()*w,cy=rnd()*h,r=20+rnd()*60;
        const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        const tone=rnd()<.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)';
        bg.addColorStop(0,tone);bg.addColorStop(1,'transparent');
        ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      }
      // Speckled aggregate
      for(let i=0;i<700;i++){
        ctx.fillStyle=rnd()<.5?'rgba(0,0,0,.18)':'rgba(255,255,255,.14)';
        ctx.fillRect(rnd()*w,rnd()*h,1,1);
      }
      // Hairline cracks
      ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=.6;
      for(let i=0;i<3;i++){
        ctx.beginPath();let cx=rnd()*w,cy=rnd()*h;ctx.moveTo(cx,cy);
        for(let s=0;s<8;s++){cx+=(rnd()-.5)*40;cy+=(rnd()-.5)*40;ctx.lineTo(cx,cy);}
        ctx.stroke();
      }
    }},
  ]
};

let bgImageDataUrl=null;

function buildBgImages(){
  Object.entries(BG_IMAGES_DEF).forEach(([cat,items])=>{
    const grid=document.getElementById('bg-img-grid-'+cat);if(!grid)return;
    items.forEach(item=>{
      // Create deterministic rng
      let seed=0;for(let i=0;i<item.name.length;i++)seed=seed*31+item.name.charCodeAt(i);
      const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
      const div=document.createElement('div');div.className='bg-img-card';
      // Draw at 2x resolution for crisp retina display
      const dpr=window.devicePixelRatio||1;
      const cw=Math.round(220*Math.max(1,dpr)), ch=Math.round(148*Math.max(1,dpr));
      const c=document.createElement('canvas');c.width=cw;c.height=ch;
      c.style.width='100%';c.style.height='100%';
      item.fn(c.getContext('2d'),cw,ch,rnd);
      div.appendChild(c);
      const lbl=document.createElement('span');lbl.textContent=item.name;div.appendChild(lbl);
      // Store fn for high-res render when applying to actual canvas
      div.dataset.bgName=item.name;
      div.onclick=()=>{
        // Render at full canvas resolution when applying
        const fullC=document.createElement('canvas');
        fullC.width=canvasW;fullC.height=canvasH;
        let seed2=0;item.name.split('').forEach(ch2=>seed2=seed2*31+ch2.charCodeAt(0));
        const rnd2=()=>{seed2=(seed2*9301+49297)%233280;return seed2/233280;};
        item.fn(fullC.getContext('2d'),canvasW,canvasH,rnd2);
        bgImageDataUrl=fullC.toDataURL('image/png');
        bgColor='#ffffff';currentPattern=null;
        applyBgToCanvas();
        document.querySelectorAll('.bg-img-card,.csw,.grad-preset,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
        div.classList.add('selected');
      };
      grid.appendChild(div);
    });
  });
}

function uploadBgImage(e){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    bgImageDataUrl=ev.target.result;currentPattern=null;
    applyBgToCanvas();
    showToast('Background image applied!','success');
  };
  r.readAsDataURL(file);e.target.value='';
}

function liveCustomBg(v){
  const swatch=document.getElementById('cct-swatch');
  const label=document.getElementById('cct-label');
  if(swatch)swatch.style.background=v;
  if(label)label.textContent=v;
  bgColor=v;bgImageDataUrl=null;currentPattern=null;
  applyBgToCanvas();
  document.querySelectorAll('.csw,.grad-preset,.bg-img-card,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
  addRecentColor(v);
}

function applyCustomColor(){
  const v=document.getElementById('custom-bg').value;
  bgColor=v;
  const cv=document.getElementById('collage-canvas');
  cv.style.background=v;cv.style.backgroundImage='';bgImageDataUrl=null;currentPattern=null;
  document.querySelectorAll('.csw,.grad-preset,.bg-img-card,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
  showToast('Color applied!','success');
}

function onGradColorChange(){
  const c1=document.getElementById('grad-c1').value;
  const c2=document.getElementById('grad-c2').value;
  const s1=document.getElementById('gpw-swatch1');if(s1)s1.style.background=c1;
  const h1=document.getElementById('gpw-hex1');if(h1)h1.textContent=c1;
  const s2=document.getElementById('gpw-swatch2');if(s2)s2.style.background=c2;
  const h2=document.getElementById('gpw-hex2');if(h2)h2.textContent=c2;
  const dir=document.getElementById('grad-dir').value;
  const grad=`linear-gradient(${dir},${c1},${c2})`;
  const preview=document.getElementById('grad-preview');if(preview)preview.style.background=grad;
}

function applyGradient(){
  const c1=document.getElementById('grad-c1').value;
  const c2=document.getElementById('grad-c2').value;
  const dir=document.getElementById('grad-dir').value;
  const grad=`linear-gradient(${dir},${c1},${c2})`;
  bgColor=grad;
  bgImageDataUrl=null;currentPattern=null;
  applyBgToCanvas();
  document.querySelectorAll('.grad-preset,.csw,.bg-img-card,.pattern-swatch').forEach(s=>s.classList.remove('selected'));
  showToast('Gradient applied!','success');
}

// Ã¢â€â‚¬Ã¢â€â‚¬ PATTERN BACKGROUNDS Ã¢â€â‚¬Ã¢â€â‚¬
const PATTERNS=[
  {name:'Dots',fn:(ctx,s)=>{ctx.fillStyle='#4956a520';for(let x=0;x<s;x+=12)for(let y=0;y<s;y+=12){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}}},
  {name:'Grid',fn:(ctx,s)=>{ctx.strokeStyle='#4956a530';ctx.lineWidth=1;for(let i=0;i<s;i+=16){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(s,i);ctx.stroke();}}},
  {name:'Diagonal',fn:(ctx,s)=>{ctx.strokeStyle='#4956a530';ctx.lineWidth=1;for(let i=-s;i<s*2;i+=16){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+s,s);ctx.stroke();}}},
  {name:'Chevron',fn:(ctx,s)=>{ctx.strokeStyle='#4956a540';ctx.lineWidth=2;for(let y=0;y<s;y+=20){for(let x=0;x<s;x+=20){ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x+10,y);ctx.lineTo(x+20,y+10);ctx.stroke();}}}},
  {name:'Hexagon',fn:(ctx,s)=>{ctx.strokeStyle='#4956a530';ctx.lineWidth=1;const r=14,h=r*Math.sqrt(3)/2;for(let row=0;row<s/h+1;row++)for(let col=0;col<s/r/1.5+1;col++){const cx=col*r*1.5,cy=row*h*2+(col%2?h:0);ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}ctx.closePath();ctx.stroke();}}},
  {name:'Cross',fn:(ctx,s)=>{ctx.strokeStyle='#4956a540';ctx.lineWidth=1.5;for(let x=10;x<s;x+=22)for(let y=10;y<s;y+=22){ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}}},
  {name:'Wave',fn:(ctx,s)=>{ctx.strokeStyle='#4956a530';ctx.lineWidth=1.5;for(let y=10;y<s;y+=18){ctx.beginPath();for(let x=0;x<s;x+=2){ctx.lineTo(x,y+Math.sin(x/10)*6);}ctx.stroke();}}},
  {name:'Stars',fn:(ctx,s)=>{ctx.fillStyle='#4956a540';for(let x=12;x<s;x+=24)for(let y=12;y<s;y+=24){ctx.save();ctx.translate(x,y);for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();ctx.translate(5*Math.cos(i*Math.PI*2/5),5*Math.sin(i*Math.PI*2/5));}ctx.restore();}}},
  // Confetti — multi-color party dots with subtle rotation, good for birthday
  // and celebration backgrounds.
  {name:'Confetti',fn:(ctx,s)=>{const cols=['#ec407a','#ffd54f','#42a5f5','#66bb6a','#ab47bc','#ff7043'];for(let i=0;i<26;i++){const x=(i*37%s),y=((i*53)%s),c=cols[i%cols.length];ctx.fillStyle=c+'80';ctx.save();ctx.translate(x,y);ctx.rotate(i*0.7);ctx.fillRect(-3,-1.5,6,3);ctx.restore();}}},
  // Triangles — alternating up/down small triangles, almost mosaic-like.
  {name:'Triangles',fn:(ctx,s)=>{ctx.fillStyle='#4956a525';const t=14;for(let r=0;r<s/t+1;r++){for(let c=0;c<s/t+1;c++){const x=c*t,y=r*t,up=(r+c)%2===0;ctx.beginPath();if(up){ctx.moveTo(x,y+t);ctx.lineTo(x+t,y+t);ctx.lineTo(x+t/2,y);}else{ctx.moveTo(x,y);ctx.lineTo(x+t,y);ctx.lineTo(x+t/2,y+t);}ctx.closePath();ctx.fill();}}}},
  // Hearts — small hand-drawn hearts pattern, perfect for love/anniversary.
  {name:'Hearts',fn:(ctx,s)=>{ctx.fillStyle='#ec407a45';const sp=20;for(let r=0;r<s/sp+1;r++){for(let c=0;c<s/sp+1;c++){const x=c*sp+(r%2?sp/2:0),y=r*sp;ctx.beginPath();ctx.moveTo(x,y+5);ctx.bezierCurveTo(x-5,y,x-5,y-3,x,y);ctx.bezierCurveTo(x+5,y-3,x+5,y,x,y+5);ctx.fill();}}}},
  // Brick — staggered brick wall, neutral architectural background.
  {name:'Brick',fn:(ctx,s)=>{ctx.strokeStyle='#4956a540';ctx.lineWidth=1.2;const bw=24,bh=12;for(let r=0;r<s/bh+1;r++){const offset=(r%2)*bw/2;for(let c=-1;c<s/bw+1;c++){ctx.strokeRect(c*bw+offset,r*bh,bw,bh);}}}},
  // Plaid — tartan check, double crossed lines for a cozy sweater feel.
  {name:'Plaid',fn:(ctx,s)=>{ctx.strokeStyle='#4956a530';ctx.lineWidth=1;for(let i=0;i<s;i+=12){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(s,i);ctx.stroke();}ctx.strokeStyle='#ec407a40';ctx.lineWidth=2.5;for(let i=6;i<s;i+=24){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(s,i);ctx.stroke();}}},
  // Rays — sunburst lines radiating from corner, energetic / poster vibe.
  {name:'Rays',fn:(ctx,s)=>{ctx.strokeStyle='#ffd54f70';ctx.lineWidth=1.5;ctx.beginPath();for(let a=0;a<Math.PI/2;a+=Math.PI/24){ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*s*1.5,Math.sin(a)*s*1.5);}ctx.stroke();}},
];

let currentPattern=null;
function buildPatternGrid(){
  const grid=document.getElementById('pattern-grid');
  if(!grid)return;
  grid.innerHTML='';
  const none=document.createElement('div');
  none.className='pattern-swatch selected';none.id='pat-none';
  const nc=document.createElement('canvas');nc.width=60;nc.height=60;
  const nctx=nc.getContext('2d');nctx.fillStyle='#f0f2f8';nctx.fillRect(0,0,60,60);
  nctx.strokeStyle='#ccc';nctx.strokeRect(.5,.5,59,59);
  nctx.fillStyle='#888';nctx.font='22px sans-serif';nctx.textAlign='center';nctx.textBaseline='middle';nctx.fillText('Ã¢Ë†â€¦',30,28);
  none.appendChild(nc);
  const nl=document.createElement('span');nl.textContent='None';none.appendChild(nl);
  none.onclick=()=>{currentPattern=null;applyPattern();document.querySelectorAll('.pattern-swatch').forEach(p=>p.classList.remove('selected'));none.classList.add('selected');};
  grid.appendChild(none);

  PATTERNS.forEach(p=>{
    const div=document.createElement('div');div.className='pattern-swatch';
    const c=document.createElement('canvas');c.width=60;c.height=60;
    const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,60,60);p.fn(ctx,60);
    div.appendChild(c);
    const lbl=document.createElement('span');lbl.textContent=p.name;div.appendChild(lbl);
    div.onclick=()=>{
      currentPattern=p;applyPattern();
      document.querySelectorAll('.pattern-swatch').forEach(s=>s.classList.remove('selected'));div.classList.add('selected');
    };
    grid.appendChild(div);
  });
}

function applyPattern(){
  const canvas=document.getElementById('collage-canvas');
  if(!currentPattern){
    bgImageDataUrl=null;
    applyBgToCanvas();
    return;
  }
  const pc=document.createElement('canvas');pc.width=80;pc.height=80;
  const ctx=pc.getContext('2d');
  ctx.fillStyle=bgColor.startsWith('linear')?'#f2f3f8':bgColor;ctx.fillRect(0,0,80,80);
  currentPattern.fn(ctx,80);
  canvas.style.backgroundImage='';
  canvas.style.backgroundSize='';
  canvas.style.backgroundPosition='';
  canvas.style.background=`url(${pc.toDataURL()}) repeat`;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ CELL BORDERS Ã¢â€â‚¬Ã¢â€â‚¬
let cellBorderColor='#4956a5',cellBorderWidth=0,cellBorderStyle='solid';
function setCBColor(col, swatchEl){
  cellBorderColor = col;
  const input = document.getElementById('cell-border-color');
  if(input) input.value = col;
  document.querySelectorAll('.cbc-swatch').forEach(s=>s.classList.remove('active'));
  if(swatchEl) swatchEl.classList.add('active');
  updateCellBorders();
}
function setCBColorRaw(col){
  cellBorderColor = col;
  document.querySelectorAll('.cbc-swatch').forEach(s=>s.classList.remove('active'));
  updateCellBorders();
}
function updateCellBorders(){
  cellBorderColor=document.getElementById('cell-border-color').value;
  cellBorderWidth=parseInt(document.getElementById('cell-border-width').value)||0;
  cellBorderStyle=document.getElementById('cell-border-style').value;
  const swatch=document.getElementById('cb-cct-swatch');
  const label=document.getElementById('cb-cct-label');
  if(swatch)swatch.style.background=cellBorderColor;
  if(label)label.textContent=cellBorderColor;

  // Inject/update a dynamic style for .has-border::after
  let styleTag=document.getElementById('cell-border-style-tag');
  if(!styleTag){
    styleTag=document.createElement('style');
    styleTag.id='cell-border-style-tag';
    document.head.appendChild(styleTag);
  }

  if(cellBorderWidth>0){
    const bw=cellBorderWidth;
    const col=cellBorderColor;
    const st=cellBorderStyle;
    let css='';
    if(st==='double'){
      const inner=Math.max(1,Math.round(bw/3));
      css=`.cell.has-border::after{border:${inner}px solid ${col};outline:${inner}px solid ${col};outline-offset:-${bw}px;}`;
    } else {
      css=`.cell.has-border::after{border:${bw}px ${st} ${col};}`;
    }
    styleTag.textContent=css;
    cells.forEach(c=>c.el.classList.add('has-border'));
  } else {
    styleTag.textContent='';
    cells.forEach(c=>c.el.classList.remove('has-border'));
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ DRAG-TO-SWAP PHOTOS BETWEEN CELLS Ã¢â€â‚¬Ã¢â€â‚¬
let swapSourceIdx=null;

function enterSwapMode(idx){
  // Cancel any existing swap mode first
  cancelSwap();
  swapSourceIdx=idx;
  cells[idx].el.classList.add('swap-src');
  // Mark all other cells as potential targets
  cells.forEach((c,i)=>{if(i!==idx)c.el.classList.add('swap-tgt');});
  // Show banner
  document.getElementById('swap-banner').classList.add('show');
  showToast('Click any cell to swap — or close to cancel','');
}

function cancelSwap(){
  if(swapSourceIdx===null)return;
  cells.forEach(c=>{c.el.classList.remove('swap-src','swap-tgt');});
  swapSourceIdx=null;
  document.getElementById('swap-banner').classList.remove('show');
}

function enableCellSwap(idx){
  if(swapSourceIdx===null){
    // Enter swap mode — this cell is the source
    enterSwapMode(idx);
  } else if(swapSourceIdx===idx){
    // Clicked source again — cancel
    cancelSwap();
  } else {
    // Clicked a different cell — do the swap
    const a=cells[swapSourceIdx],b=cells[idx];
    const tmpData=a.imgData,tmpFit=a.fit;
    if(b.imgData){setPhotoInCell(swapSourceIdx,b.imgData,a);a.fit=b.fit||'cover';if(a.img)a.img.style.objectFit=a.fit;}
    else removeCellPhoto(swapSourceIdx);
    if(tmpData){setPhotoInCell(idx,tmpData,b);b.fit=tmpFit||'cover';if(b.img)b.img.style.objectFit=b.fit;}
    else removeCellPhoto(idx);
    cancelSwap();
    saveHistory();updateFillStats();showToast('Photos swapped!','success');
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ CROP / PAN / ZOOM PER CELL Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€â‚¬Ã¢â€â‚¬ CROP Ã¢â€â‚¬Ã¢â€â‚¬
let cropCellIdx=-1, cropOffX=0, cropOffY=0, cropScale=1;
let cropDragging=false, cropDragStartX=0, cropDragStartY=0, cropStartOffX=0, cropStartOffY=0;
let cropVpW=0, cropVpH=0; // actual viewport px dimensions

function openCropModal(idx){
  const cd=cells[idx];
  if(!cd.imgData){showToast('Add a photo first','error');return;}
  cropCellIdx=idx;

  // Calculate cell's actual pixel dimensions to set viewport aspect ratio
  const cellEl=cd.el;
  const cellW=parseFloat(cellEl.style.width)||200;
  const cellH=parseFloat(cellEl.style.height)||200;
  const ratio=cellW/cellH;

  // Set viewport height to match cell aspect ratio (max 360px wide viewport)
  const vp=document.getElementById('crop-viewport');
  const maxVpW=Math.min(452, window.innerWidth-48); // modal width minus padding
  cropVpW=maxVpW;
  cropVpH=Math.round(maxVpW/ratio);
  // Cap height so modal doesn't overflow screen
  const maxVpH=Math.min(360, window.innerHeight-280);
  if(cropVpH>maxVpH){cropVpH=maxVpH; cropVpW=Math.round(maxVpH*ratio);}
  vp.style.width=cropVpW+'px';
  vp.style.height=cropVpH+'px';

  // Show ratio info
  const gcd=(a,b)=>b===0?a:gcd(b,a%b);
  const g=gcd(Math.round(cellW),Math.round(cellH));
  const rw=Math.round(cellW/g), rh=Math.round(cellH/g);
  document.getElementById('crop-ratio-badge').textContent=`${rw} : ${rh}`;
  document.getElementById('crop-cell-size').textContent=`${Math.round(cellW)} × ${Math.round(cellH)} px`;

  // Load image
  const img=document.getElementById('crop-img');
  img.src=cd.imgData;

  // Restore or reset crop state
  cropOffX=cd.cropOffX||0; cropOffY=cd.cropOffY||0; cropScale=cd.cropScale||1;
  document.getElementById('crop-zoom-slider').value=Math.round(cropScale*100);
  document.getElementById('crop-zoom-val').textContent=Math.round(cropScale*100)+'%';

  img.onload=()=>{clampCropOffset();updateCropImgTransform();};
  if(img.complete&&img.naturalWidth>0){clampCropOffset();updateCropImgTransform();}
  document.getElementById('crop-modal').classList.add('open');
}

function getCropBaseScale(){
  const img=document.getElementById('crop-img');
  const iw=img.naturalWidth||1, ih=img.naturalHeight||1;
  return Math.max(cropVpW/iw, cropVpH/ih);
}

function clampCropOffset(){
  // Prevent panning so image never exposes background
  const img=document.getElementById('crop-img');
  if(!img.naturalWidth)return;
  const base=getCropBaseScale();
  const scale=base*cropScale;
  const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
  // Max offset: image edge can't go inside viewport
  const maxX=(sw-cropVpW)/2, maxY=(sh-cropVpH)/2;
  cropOffX=Math.max(-maxX,Math.min(maxX,cropOffX));
  cropOffY=Math.max(-maxY,Math.min(maxY,cropOffY));
}

function updateCropImgTransform(){
  const vp=document.getElementById('crop-viewport');
  const img=document.getElementById('crop-img');
  if(!img.naturalWidth)return;
  const base=getCropBaseScale();
  const scale=base*cropScale;
  const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
  // Center + offset
  const cx=(cropVpW-sw)/2+cropOffX;
  const cy=(cropVpH-sh)/2+cropOffY;
  img.style.width=sw+'px'; img.style.height=sh+'px';
  img.style.left=cx+'px'; img.style.top=cy+'px';
}

function setCropZoom(val){
  cropScale=parseInt(val)/100;
  document.getElementById('crop-zoom-val').textContent=val+'%';
  clampCropOffset();
  updateCropImgTransform();
}

function resetCrop(){
  cropOffX=0; cropOffY=0; cropScale=1;
  document.getElementById('crop-zoom-slider').value=100;
  document.getElementById('crop-zoom-val').textContent='100%';
  clampCropOffset();
  updateCropImgTransform();
}

function applyCrop(){
  if(cropCellIdx<0)return;
  const cd=cells[cropCellIdx];
  const img=document.getElementById('crop-img');
  if(!img.naturalWidth)return;

  // Save crop state for re-opening
  cd.cropOffX=cropOffX; cd.cropOffY=cropOffY; cd.cropScale=cropScale;

  // --- Real canvas crop ---
  // Work out what portion of the original image is visible in the viewport
  const base=getCropBaseScale();
  const scale=base*cropScale;
  const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
  const imgLeft=(cropVpW-sw)/2+cropOffX; // px in viewport where image starts
  const imgTop=(cropVpH-sh)/2+cropOffY;

  // Viewport area in image-pixel coordinates
  // src: portion of image (in natural px) that maps to the viewport
  const srcX=(-imgLeft)/scale;
  const srcY=(-imgTop)/scale;
  const srcW=cropVpW/scale;
  const srcH=cropVpH/scale;

  // Clamp to image bounds
  const clampedSrcX=Math.max(0,srcX);
  const clampedSrcY=Math.max(0,srcY);
  const clampedSrcW=Math.min(img.naturalWidth-clampedSrcX,srcW-(clampedSrcX-srcX));
  const clampedSrcH=Math.min(img.naturalHeight-clampedSrcY,srcH-(clampedSrcY-srcY));

  // Draw cropped result to canvas at cell's actual display size
  const cellEl=cd.el;
  const cellW=parseFloat(cellEl.style.width)||200;
  const cellH=parseFloat(cellEl.style.height)||200;
  const outW=Math.round(cellW*2); // 2x for quality
  const outH=Math.round(cellH*2);

  const oc=document.createElement('canvas');
  oc.width=outW; oc.height=outH;
  const ctx=oc.getContext('2d');
  ctx.drawImage(img, clampedSrcX, clampedSrcY, clampedSrcW, clampedSrcH, 0, 0, outW, outH);

  const croppedDataUrl=oc.toDataURL('image/jpeg',0.92);

  // Replace cell image with the cropped version
  cd.cropOffX=0; cd.cropOffY=0; cd.cropScale=1; // reset crop state since it's now baked in
  setPhotoInCell(cropCellIdx, croppedDataUrl, cd);
  cd.imgData=croppedDataUrl; // keep original data too
  cd.img.style.objectFit='cover';
  cd.img.style.objectPosition='center';
  cd.img.style.transform='';

  closeModal('crop-modal');
  saveHistory();
  showToast('Crop applied!','success');
}

// Crop drag events (IIFE so bound once)
(function(){
  function getVp(){return document.getElementById('crop-viewport');}
  function onDown(e){
    if(!document.getElementById('crop-modal').classList.contains('open'))return;
    cropDragging=true;
    const touch=e.touches?e.touches[0]:e;
    cropDragStartX=touch.clientX; cropDragStartY=touch.clientY;
    cropStartOffX=cropOffX; cropStartOffY=cropOffY;
    e.preventDefault();
  }
  function onMove(e){
    if(!cropDragging)return;
    const touch=e.touches?e.touches[0]:e;
    cropOffX=cropStartOffX+(touch.clientX-cropDragStartX);
    cropOffY=cropStartOffY+(touch.clientY-cropDragStartY);
    clampCropOffset();
    updateCropImgTransform();
    e.preventDefault();
  }
  function onUp(){cropDragging=false;}
  document.addEventListener('DOMContentLoaded',()=>{
    const v=document.getElementById('crop-viewport');
    if(!v)return;
    v.addEventListener('mousedown',onDown);
    v.addEventListener('touchstart',onDown,{passive:false});
    document.addEventListener('mousemove',onMove);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('mouseup',onUp);
    document.addEventListener('touchend',onUp);
    v.addEventListener('wheel',e=>{
      e.preventDefault();
      cropScale=Math.max(1,Math.min(5,cropScale-e.deltaY*0.002));
      const sl=document.getElementById('crop-zoom-slider');
      sl.value=Math.round(cropScale*100);
      document.getElementById('crop-zoom-val').textContent=Math.round(cropScale*100)+'%';
      clampCropOffset();
      updateCropImgTransform();
    },{passive:false});
  });
})();
const isMobile=()=>window.innerWidth<=768;
let mobActivePanel=null; // 'layouts'|'photos'|'style'|'props'

function mobNav(panel,btn){
  const sidebar=document.querySelector('.sidebar');
  const rightPanel=document.querySelector('.right-panel');
  const backdrop=document.getElementById('mob-backdrop');

  // Toggle off if same panel tapped again
  if(mobActivePanel===panel){
    closeAllMobPanels();return;
  }
  // Close all first
  sidebar.classList.remove('mob-open');
  rightPanel.classList.remove('mob-open');
  document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));

  mobActivePanel=panel;
  if(btn)btn.classList.add('active');
  backdrop.classList.add('show');

  if(panel==='layouts'||panel==='photos'||panel==='style'||panel==='elements'||panel==='text'||panel==='occasions'){
    sidebar.classList.add('mob-open');
    const tabMap={layouts:'templates',photos:'photos',style:'style',elements:'elements',text:'text',occasions:'occasions'};
    const tabName=tabMap[panel];
    document.querySelectorAll('.sidebar-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
    const tabEl=document.getElementById('tab-'+tabName);
    const stabEl=document.querySelector(`.stab[onclick*="${tabName}"]`);
    if(tabEl)tabEl.classList.add('active');
    if(stabEl)stabEl.classList.add('active');
  } else if(panel==='props'){
    rightPanel.classList.add('mob-open');
  }
}

function closeAllMobPanels(){
  document.querySelector('.sidebar').classList.remove('mob-open');
  document.querySelector('.right-panel').classList.remove('mob-open');
  document.getElementById('mob-backdrop').classList.remove('show');
  document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));
  mobActivePanel=null;
}

// After picking a layout/template on mobile, just collapse the open side panel
// so the canvas is visible. The bottom tab bar itself stays put.
function hideMobNav(){
  if(!isMobile())return;
  closeAllMobPanels();
}

// Override updateRightPanel to auto-open props on mobile when cell selected
function mobOpenProps(){
  if(isMobile()){
    const rpBtn=document.getElementById('mn-props');
    mobNav('props',rpBtn);
  }
}

// Handle resize
window.addEventListener('resize',()=>{
  if(!isMobile()){
    closeAllMobPanels();
    document.querySelector('.sidebar').classList.remove('mob-open');
    document.querySelector('.right-panel').classList.remove('mob-open');
  }
  setTimeout(resetZoom,50);
});

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ PRO ELEMENTS SYSTEM Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════

// Shared element interaction state
let selectedElem=null;
// Multi-selection set for DOM elements (cells, canvas-elem, image elements). Fabric
// objects manage their own ActiveSelection via fabricCanvas — when we need the full
// selection across both layers we union this set with fabricCanvas.getActiveObjects().
const multiSelectedDOM=new Set();
function clearMultiSelectionDOM(){
  multiSelectedDOM.forEach(el=>el&&el.classList&&el.classList.remove('multi-selected'));
  multiSelectedDOM.clear();
}
function addToMultiSelectionDOM(el){
  if(!el||!el.classList)return;
  multiSelectedDOM.add(el);
  el.classList.add('multi-selected');
}
function removeFromMultiSelectionDOM(el){
  if(!el)return;
  multiSelectedDOM.delete(el);
  el.classList&&el.classList.remove('multi-selected');
}
// Returns ALL currently selected items across both layers — DOM elements (Set members
// PLUS the legacy single selectedElem if it's a DOM node) + Fabric objects.
function getAllSelectedItems(){
  const out=[];
  multiSelectedDOM.forEach(el=>out.push({type:'dom',el}));
  if(selectedElem&&selectedElem.classList&&!multiSelectedDOM.has(selectedElem)){
    out.push({type:'dom',el:selectedElem});
  }
  if(typeof fabricCanvas!=='undefined'&&fabricCanvas){
    const fabs=fabricCanvas.getActiveObjects?.()||[];
    fabs.forEach(o=>out.push({type:'fabric',el:o}));
  }
  return out;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Rubber-band drag selection Ã¢â€â‚¬Ã¢â€â‚¬
// Drag from empty canvas space to draw a selection rectangle. Anything (DOM cell,
// canvas-elem, Fabric text) whose bounding box intersects the rect on release is
// added to the multi-selection.
let _rubberBand=null;
let _rubberBandEl=null;
function ensureRubberBandEl(){
  if(_rubberBandEl)return _rubberBandEl;
  _rubberBandEl=document.createElement('div');
  _rubberBandEl.className='rubber-band';
  _rubberBandEl.style.cssText='position:absolute;border:1.5px dashed #4956a5;background:rgba(73,86,165,.14);pointer-events:none;display:none;z-index:300;left:0;top:0;';
  const cv=document.getElementById('collage-canvas');
  if(cv)cv.appendChild(_rubberBandEl);
  return _rubberBandEl;
}
function startRubberBand(clientX,clientY){
  const cv=document.getElementById('collage-canvas');
  if(!cv)return;
  const rect=cv.getBoundingClientRect();
  if(rect.width===0)return;
  const sx=canvasW/rect.width, sy=canvasH/rect.height;
  const x=(clientX-rect.left)*sx, y=(clientY-rect.top)*sy;
  // Disable Fabric upper-canvas pointer events for the duration so the cursor passing
  // over a Fabric object mid-drag doesn't get hijacked by Fabric's own handlers.
  if(fabricCanvas&&fabricCanvas.upperCanvasEl){
    fabricCanvas.upperCanvasEl.style.pointerEvents='none';
  }
  _rubberBand={sx:x,sy:y,cur:{left:x,top:y,right:x,bottom:y}};
  const el=ensureRubberBandEl();
  el.style.display='block';
  el.style.left=x+'px';el.style.top=y+'px';
  el.style.width='0px';el.style.height='0px';
}
function updateRubberBand(clientX,clientY){
  if(!_rubberBand)return;
  const cv=document.getElementById('collage-canvas');
  const rect=cv.getBoundingClientRect();
  const sx=canvasW/rect.width, sy=canvasH/rect.height;
  const x=(clientX-rect.left)*sx, y=(clientY-rect.top)*sy;
  const left=Math.min(_rubberBand.sx,x);
  const top=Math.min(_rubberBand.sy,y);
  const w=Math.abs(x-_rubberBand.sx), h=Math.abs(y-_rubberBand.sy);
  _rubberBand.cur={left,top,right:left+w,bottom:top+h};
  if(_rubberBandEl){
    _rubberBandEl.style.left=left+'px';
    _rubberBandEl.style.top=top+'px';
    _rubberBandEl.style.width=w+'px';
    _rubberBandEl.style.height=h+'px';
  }
}
let _suppressNextCanvasClick=false;
function endRubberBand(additive){
  if(!_rubberBand)return;
  const r=_rubberBand.cur;
  _rubberBand=null;
  if(_rubberBandEl)_rubberBandEl.style.display='none';
  // Restore Fabric pointer events (the mousemove tracker will manage from here).
  if(fabricCanvas&&fabricCanvas.upperCanvasEl){
    fabricCanvas.upperCanvasEl.style.pointerEvents='';
  }
  if(!r||(r.right-r.left)<6||(r.bottom-r.top)<6)return; // ignore tiny drags
  // The browser fires a synthesized 'click' after this mouseup; the canvas's
  // empty-space click handler would call deselect() and wipe what we just built.
  // Eat exactly one click.
  _suppressNextCanvasClick=true;
  if(!additive){clearMultiSelectionDOM();}
  // Hit-test DOM cells + canvas-elem (skip Fabric overlay container, control buttons).
  document.querySelectorAll('#collage-canvas .cell, #collage-canvas .canvas-elem').forEach(el=>{
    const eLeft=parseFloat(el.style.left)||0;
    const eTop=parseFloat(el.style.top)||0;
    const eW=parseFloat(el.style.width)||el.offsetWidth||0;
    const eH=parseFloat(el.style.height)||el.offsetHeight||0;
    const eRight=eLeft+eW, eBottom=eTop+eH;
    if(eLeft<r.right&&eRight>r.left&&eTop<r.bottom&&eBottom>r.top){
      addToMultiSelectionDOM(el);
    }
  });
  // Hit-test Fabric objects + build an ActiveSelection if 2+ were caught.
  if(fabricCanvas){
    if(!additive)fabricCanvas.discardActiveObject();
    const sel=[];
    fabricCanvas.getObjects().forEach(o=>{
      if(!o.visible)return;
      const b=o.getBoundingRect(true,true);
      if(b.left<r.right&&(b.left+b.width)>r.left&&b.top<r.bottom&&(b.top+b.height)>r.top){
        sel.push(o);
      }
    });
    if(sel.length===1){fabricCanvas.setActiveObject(sel[0]);}
    else if(sel.length>1){
      const as=new fabric.ActiveSelection(sel,{canvas:fabricCanvas});
      fabricCanvas.setActiveObject(as);
    }
    fabricCanvas.requestRenderAll();
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Wire rubber-band to canvas mouse events Ã¢â€â‚¬Ã¢â€â‚¬
// Capture-phase mousedown so we run before .cell / .canvas-elem handlers and can
// distinguish "drag-on-empty-space" from "drag-on-an-element". Targets that own
// their own drag (cells, elements, fabric overlay when over a hit object, action
// buttons, control handles, the wrapping container) bail out and let those
// handlers run unmolested.
(function installRubberBand(){
  const cv=document.getElementById('collage-canvas');
  if(!cv)return;
  const isInteractive=(t)=>!!(t&&t.closest&&t.closest('.cell, .canvas-elem, .canvas-text-pro, .canvas-text, .canvas-container, .ce-resize, .ce-rotate, .ce-del, .cab, .cell-actions, button, input, textarea, select'));
  cv.addEventListener('mousedown',(e)=>{
    if(e.button!==0)return;
    if(isInteractive(e.target))return;
    // If pointer landed on the Fabric upper-canvas with pointer-events='auto'
    // (i.e. cursor was over a Fabric object), let Fabric handle it.
    if(fabricCanvas&&fabricCanvas.upperCanvasEl&&e.target===fabricCanvas.upperCanvasEl){
      const cs=getComputedStyle(fabricCanvas.upperCanvasEl);
      if(cs.pointerEvents!=='none')return;
    }
    startRubberBand(e.clientX,e.clientY);
  },true);
  document.addEventListener('mousemove',(e)=>{
    if(_rubberBand)updateRubberBand(e.clientX,e.clientY);
  });
  document.addEventListener('mouseup',(e)=>{
    if(_rubberBand)endRubberBand(e.shiftKey||e.ctrlKey||e.metaKey);
  });
})();

let elemDrag={active:false,startX:0,startY:0,startL:0,startT:0,el:null};
let elemResize={active:false,startX:0,startY:0,startW:0,startH:0,el:null};
let elemRotate={active:false,startAngle:0,currentAngle:0,cx:0,cy:0,el:null};

// Ã¢â€â‚¬Ã¢â€â‚¬ Element & text color palettes Ã¢â€â‚¬Ã¢â€â‚¬
const ELEM_COLORS=['#ffffff','#1a1c2e','#4956a5','#e05252','#38b27a','#f5c842','#c97ae8','#ff6b35','#4facfe','#f06292','#26c6da','#66bb6a','transparent'];
const ELEM_SIZES={small:60,medium:100,large:160};

// Ã¢â€â‚¬Ã¢â€â‚¬ SVG Shape Library Ã¢â€â‚¬Ã¢â€â‚¬
const SVG_SHAPES=[
  {id:'rect',label:'Square',svg:`<rect x="4" y="4" width="18" height="18" rx="2" fill="currentColor"/>`,color:'#4956a5'},
  {id:'circle',label:'Circle',svg:`<circle cx="13" cy="13" r="9" fill="currentColor"/>`,color:'#e05252'},
  {id:'triangle',label:'Triangle',svg:`<polygon points="13,3 24,23 2,23" fill="currentColor"/>`,color:'#f5c842'},
  {id:'star5',label:'Star',svg:`<polygon points="13,2 15.9,9.3 24,9.3 17.6,14 19.9,21.3 13,16.7 6.1,21.3 8.4,14 2,9.3 10.1,9.3" fill="currentColor"/>`,color:'#f5c842'},
  {id:'heart',label:'Heart',svg:`<path d="M13 21.3C13 21.3 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.2 3 11.7 3.8 13 5C14.3 3.8 15.8 3 18.5 3C21.5 3 24 5.5 24 8.5C24 14.5 13 21.3 13 21.3Z" fill="currentColor"/>`,color:'#e05252'},
  {id:'diamond',label:'Diamond',svg:`<polygon points="13,2 24,13 13,24 2,13" fill="currentColor"/>`,color:'#c97ae8'},
  {id:'pentagon',label:'Pentagon',svg:`<polygon points="13,2 24,10 20,23 6,23 2,10" fill="currentColor"/>`,color:'#38b27a'},
  {id:'hexagon',label:'Hexagon',svg:`<polygon points="13,2 22,7 22,19 13,24 4,19 4,7" fill="currentColor"/>`,color:'#4facfe'},
  {id:'rounded-rect',label:'Rounded',svg:`<rect x="2" y="6" width="22" height="14" rx="7" fill="currentColor"/>`,color:'#ff6b35'},
  {id:'cross',label:'Plus',svg:`<path d="M11 2H15V11H24V15H15V24H11V15H2V11H11V2Z" fill="currentColor"/>`,color:'#4956a5'},
  {id:'speech',label:'Bubble',svg:`<path d="M2 4C2 2.9 2.9 2 4 2H22C23.1 2 24 2.9 24 4V17C24 18.1 23.1 19 22 19H15L10 24V19H4C2.9 19 2 18.1 2 17V4Z" fill="currentColor"/>`,color:'#4facfe'},
  {id:'cloud',label:'Cloud',svg:`<path d="M8,18 C5.2,18 3,15.8 3,13 C3,10.5 4.8,8.5 7.1,8.1 C7,7.8 7,7.4 7,7 C7,4.8 8.8,3 11,3 C12.4,3 13.6,3.7 14.4,4.8 C15,4.3 15.7,4 16.5,4 C18.4,4 20,5.6 20,7.5 C22.2,8 23.9,9.9 24,12.1 C21.9,12 20,13.9 20,16 L8,16 Z" fill="currentColor"/>`,color:'#90caf9'},
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Decoration elements Ã¢â€â‚¬Ã¢â€â‚¬
const DECO_ELEMENTS=[
  {id:'sparkle',label:'Sparkle',emoji:'Ã¢Å“Â¨'},{id:'star4',label:'Star4',emoji:'Ã¢Â­Â'},
  {id:'ribbon',label:'Ribbon',emoji:'Ã°Å¸Å½â‚¬'},{id:'crown',label:'Crown',emoji:'Ã°Å¸â€˜â€˜'},
  {id:'flower',label:'Flower',emoji:'Ã°Å¸Å’Â¸'},{id:'lightning',label:'Bolt',emoji:'Ã¢Å¡Â¡'},
  {id:'leaf',label:'Leaf',emoji:'Ã°Å¸ÂÆ’'},{id:'wave',label:'Wave',emoji:'Ã°Å¸Å’Å '},
  {id:'fire',label:'Fire',emoji:'Ã°Å¸â€Â¥'},{id:'gem',label:'Gem',emoji:'Ã°Å¸â€™Å½'},
  {id:'moon',label:'Moon',emoji:'Ã°Å¸Å’â„¢'},{id:'sun',label:'Sun',emoji:'Ã¢Ëœâ‚¬Ã¯Â¸Â'},
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Line / Arrow SVGs Ã¢â€â‚¬Ã¢â€â‚¬
const LINE_ELEMENTS=[
  {id:'line-h',label:'Line',svg:`<line x1="2" y1="13" x2="24" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,isLine:true},
  {id:'arrow-r',label:'Arrow →',svg:`<line x1="2" y1="13" x2="20" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="15,8 20,13 15,18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'arrow-lr',label:'Ã¢â€ â€ Arrow',svg:`<line x1="2" y1="13" x2="24" y2="13" stroke="currentColor" stroke-width="2.5"/><polyline points="7,8 2,13 7,18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="19,8 24,13 19,18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'divider',label:'Divider',svg:`<line x1="2" y1="10" x2="24" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="16" x2="24" y2="16" stroke="currentColor" stroke-width="1.5"/>`,isLine:true},
  {id:'dashed',label:'Dashed',svg:`<line x1="2" y1="13" x2="24" y2="13" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round"/>`,isLine:true},
  {id:'zigzag',label:'Zigzag',svg:`<polyline points="2,18 7,8 12,18 17,8 24,18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'wave-line',label:'Wavy',svg:`<path d="M2,13 Q7,6 12,13 Q17,20 22,13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,isLine:true},
  {id:'checkmark',label:'Check',svg:`<polyline points="3,13 9,20 22,6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Frame / Border SVGs Ã¢â€â‚¬Ã¢â€â‚¬
const FRAME_ELEMENTS=[
  {id:'frame-simple',label:'Frame',svg:`<rect x="2" y="2" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"/>`,isFrame:true,w:180,h:140},
  {id:'frame-rounded',label:'Round',svg:`<rect x="2" y="2" width="22" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2.5"/>`,isFrame:true,w:180,h:140},
  {id:'frame-dashed',label:'Dashed',svg:`<rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>`,isFrame:true,w:180,h:140},
  {id:'frame-double',label:'Double',svg:`<rect x="1" y="1" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="4" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1"/>`,isFrame:true,w:180,h:140},
  {id:'bracket-l',label:'[ Bracket',svg:`<path d="M18,3 H8 V23 H18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'bracket-r',label:'Bracket ]',svg:`<path d="M8,3 H18 V23 H8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'corner-tl',label:'Corner',svg:`<path d="M20,4 H4 V20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
  {id:'corner-all',label:'Corners',svg:`<path d="M4,12 V4 H12 M14,4 H22 V12 M22,14 V22 H14 M12,22 H4 V14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,isLine:true},
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Emoji stickers Ã¢â€â‚¬Ã¢â€â‚¬
const EMOJI_STICKERS=[
  'Ã°Å¸Å½â€š','Ã°Å¸Å½â€°','Ã°Å¸Å½Ë†','Ã°Å¸Å½Â','Ã°Å¸â€™Â','Ã°Å¸â€™â€™','Ã°Å¸Å’Â¸','Ã°Å¸Å’Â¹','Ã°Å¸â€™Â','Ã¢ÂÂ¤Ã¯Â¸Â',
  'Ã¢Å“Â¨','Ã¢Â­Â','Ã°Å¸Å’Å¸','Ã°Å¸â€™Â«','Ã°Å¸Å½â€œ','Ã°Å¸Ââ€ ','Ã°Å¸Â¥â€š','Ã°Å¸Å½â€ž','Ã°Å¸Å½Æ’','Ã¢Ââ€žÃ¯Â¸Â',
  'Ã°Å¸ÂÂ¼','Ã°Å¸â€˜Â¶','Ã°Å¸Â¦â€¹','Ã°Å¸Å’Âº','Ã°Å¸Å’Å ','Ã°Å¸â€Â¥','Ã°Å¸Å’â„¢','Ã¢Ëœâ‚¬Ã¯Â¸Â','Ã°Å¸Å’Ë†','Ã°Å¸â€¢Å Ã¯Â¸Â',
  'Ã°Å¸Å½Âµ','Ã°Å¸Å½Â¶','Ã°Å¸â€œÂ¸','Ã°Å¸â€”ÂºÃ¯Â¸Â','Ã¢Å“Ë†Ã¯Â¸Â','Ã¢â€ºÂµ','Ã°Å¸Ââ€Ã¯Â¸Â','Ã°Å¸Å’Â´','Ã°Å¸Å½Â¨','Ã°Å¸â€“Â¼Ã¯Â¸Â',
];

// Ã¢â€â‚¬Ã¢â€â‚¬ Text style presets Ã¢â€â‚¬Ã¢â€â‚¬
const TEXT_STYLE_PRESETS=[
  {label:'Heading',style:{fontSize:'48px',fontFamily:"'Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#1a1c2e',textShadow:'none',letterSpacing:'-1px',lineHeight:'1.1'}},
  {label:'Subheading',style:{fontSize:'32px',fontFamily:"'Outfit',sans-serif",fontWeight:'700',fontStyle:'normal',color:'#4956a5',textShadow:'none',letterSpacing:'0px',lineHeight:'1.3'}},
  {label:'Body',style:{fontSize:'18px',fontFamily:"'Outfit',sans-serif",fontWeight:'400',fontStyle:'normal',color:'#1a1c2e',textShadow:'none',letterSpacing:'0px',lineHeight:'1.6'}},
  {label:'Caption',style:{fontSize:'13px',fontFamily:"'Outfit',sans-serif",fontWeight:'500',fontStyle:'normal',color:'#7880aa',textShadow:'none',letterSpacing:'1.5px',lineHeight:'1.5',textTransform:'uppercase'}},
  {label:'Display',style:{fontSize:'72px',fontFamily:"'Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#ffffff',textShadow:'3px 3px 0 #4956a5',letterSpacing:'-2px',lineHeight:'1'}},
  {label:'Neon',style:{fontSize:'40px',fontFamily:"'Outfit',sans-serif",fontWeight:'800',color:'#ffffff',textShadow:'0 0 10px #4facfe, 0 0 20px #4facfe, 0 0 40px #4facfe',letterSpacing:'3px',lineHeight:'1.2'}},
  {label:'Shadow',style:{fontSize:'42px',fontFamily:"'Fraunces',serif",fontWeight:'900',color:'#ffffff',textShadow:'4px 4px 0 rgba(0,0,0,.5)',letterSpacing:'-1px',lineHeight:'1.1'}},
  {label:'Outline',style:{fontSize:'44px',fontFamily:"'Fraunces',serif",fontWeight:'900',color:'transparent',webkitTextStroke:'2px #4956a5',textStroke:'2px #4956a5',letterSpacing:'-1px',lineHeight:'1.1'}},
  {label:'Stamp',style:{fontSize:'28px',fontFamily:"'Outfit',sans-serif",fontWeight:'800',color:'#e05252',textShadow:'none',letterSpacing:'6px',lineHeight:'1.3',textTransform:'uppercase',border:'3px solid #e05252',padding:'6px 14px',borderRadius:'4px',opacity:'0.9'}},
  {label:'Handwritten',style:{fontSize:'36px',fontFamily:'cursive',fontWeight:'400',fontStyle:'italic',color:'#1a1c2e',textShadow:'none',letterSpacing:'1px',lineHeight:'1.4'}},
  {label:'Typewriter',style:{fontSize:'20px',fontFamily:'monospace',fontWeight:'400',color:'#1a1c2e',textShadow:'none',letterSpacing:'2px',lineHeight:'1.8',background:'rgba(0,0,0,.06)',padding:'8px 12px',borderRadius:'4px'}},
  {label:'Gold Foil',style:{fontSize:'44px',fontFamily:"'Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#d4af37',textShadow:'1px 1px 0 #b8860b, -1px -1px 0 #ffd700',letterSpacing:'-1px',lineHeight:'1.1'}},
];

const FONT_FAMILIES=[
  {name:'Modern',value:"'Outfit',sans-serif"},
  {name:'Poppins',value:"'Poppins',sans-serif"},
  {name:'Montserrat',value:"'Montserrat',sans-serif"},
  {name:'Raleway',value:"'Raleway',sans-serif"},
  {name:'Elegant',value:"'Fraunces',serif"},
  {name:'Playfair',value:"'Playfair Display',serif"},
  {name:'Abril',value:"'Abril Fatface',cursive"},
  {name:'Serif',value:'Georgia,serif'},
  {name:'Pacifico',value:"'Pacifico',cursive"},
  {name:'Dancing',value:"'Dancing Script',cursive"},
  {name:'Lobster',value:"'Lobster',cursive"},
  {name:'Bebas',value:"'Bebas Neue',cursive"},
  {name:'Marker',value:"'Permanent Marker',cursive"},
  {name:'Righteous',value:"'Righteous',cursive"},
  {name:'Mono',value:'monospace'},
];

const TEXT_COLORS=['#ffffff','#1a1c2e','#4956a5','#e05252','#38b27a','#f5c842','#c97ae8','#ff6b35','#4facfe','#f06292','#d4af37','#000000'];
const SHADOW_PRESETS=[
  {label:'None',val:'none'},
  {label:'Soft',val:'2px 2px 6px rgba(0,0,0,.4)'},
  {label:'Hard',val:'3px 3px 0 rgba(0,0,0,.6)'},
  {label:'Glow',val:'0 0 12px currentColor'},
  {label:'Neon',val:'0 0 8px #4facfe, 0 0 20px #4facfe'},
  {label:'Lift',val:'0 4px 12px rgba(0,0,0,.5)'},
];

// Ã¢â€â‚¬Ã¢â€â‚¬ BUILD ELEMENTS TAB Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€â‚¬Ã¢â€â‚¬ CUSTOM IMAGE ELEMENTS Ã¢â€â‚¬Ã¢â€â‚¬
let imageElements=[];

function addImageElements(e){
  Array.from(e.target.files).filter(f=>f.type.startsWith('image/')).forEach(file=>{
    const r=new FileReader();
    r.onload=ev=>{
      imageElements.push({data:ev.target.result,name:file.name});
      renderImageElemThumbs();
    };
    r.readAsDataURL(file);
  });
  e.target.value='';
}

function renderImageElemThumbs(){
  const grid=document.getElementById('img-elem-thumbs');
  if(!grid)return;
  grid.innerHTML='';
  imageElements.forEach((img,i)=>{
    const d=document.createElement('div');
    d.className='photo-thumb';
    d.title='Click to add to canvas';
    d.innerHTML=`<img src="${img.data}" style="object-fit:cover;width:100%;height:100%">
      <button class="rem-btn" onclick="removeImageElem(${i},event)"><i class="fa-solid fa-xmark"></i></button>`;
    d.onclick=()=>placeImageElem(img.data);
    grid.appendChild(d);
  });
}

function removeImageElem(i,e){
  e.stopPropagation();
  imageElements.splice(i,1);
  renderImageElemThumbs();
}

function placeImageElem(dataUrl){
  const canvas=document.getElementById('collage-canvas');
  const el=document.createElement('div');
  el.className='canvas-elem';
  el.dataset.elemType='image';

  const size=Math.round(Math.min(canvasW,canvasH)*0.35);
  el.style.cssText=`left:${Math.round(canvasW/2-size/2)}px;top:${Math.round(canvasH/2-size/2)}px;width:${size}px;height:${size}px;transform:rotate(0deg);z-index:50;`;

  const img=document.createElement('img');
  img.src=dataUrl;
  img.style.cssText='width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;user-select:none;';
  img.dataset.imgSrc=dataUrl;
  el.appendChild(img);

  // Controls
  const del=document.createElement('button');del.className='ce-del';del.innerHTML='<i class="fa-solid fa-xmark"></i>';
  del.onclick=e=>{e.stopPropagation();el.remove();if(selectedElem===el){selectedElem=null;updateRightPanel(null);}saveHistory();};
  el.appendChild(del);

  const resize=document.createElement('div');resize.className='ce-resize';
  attachResizeHandler(resize,el,false);
  el.appendChild(resize);

  const rot=document.createElement('button');rot.className='ce-rotate';rot.innerHTML='<i class="fa-solid fa-rotate"></i>';
  attachRotateHandler(rot,el);
  el.appendChild(rot);

  attachDragHandler(el);
  el.onclick=e=>{e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);};
  el.addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const moved=Math.abs(t.clientX-(elemDrag.startX||0))>6||Math.abs(t.clientY-(elemDrag.startY||0))>6;
    if(!moved){e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);}
  },{passive:true});

  canvas.appendChild(el);
  selectElem(el);
  saveHistory();
  showToast('Image added!','success');
  if(isMobile())closeAllMobPanels();
}

// Drag-drop onto the upload zone from PC
(function setupImgElemDrop(){
  document.addEventListener('DOMContentLoaded',()=>{
    // Bring up the Fabric text layer as soon as the DOM (and the Fabric CDN) are ready.
    initFabricLayer();
    // Size it to match whatever canvas size is currently set.
    resizeFabricLayer(canvasW,canvasH);
    // Install SVG clip-path defs so heart-shaped cards render correctly.
    installShapeClipPaths();
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const zone=document.getElementById('img-elem-upload-zone');
    if(!zone)return;
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragover');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('dragover'));
    zone.addEventListener('drop',e=>{
      e.preventDefault();zone.classList.remove('dragover');
      Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')).forEach(file=>{
        const r=new FileReader();
        r.onload=ev=>{imageElements.push({data:ev.target.result,name:file.name});renderImageElemThumbs();};
        r.readAsDataURL(file);
      });
    });
  });
})();

function buildElementsTab(){
  // Shapes
  buildElemGrid('elem-shapes', SVG_SHAPES, t=>addCanvasElem({type:'shape',svg:t.svg,id:t.id,color:t.color,w:80,h:80,rot:0,opacity:1}));
  // Emojis
  buildElemGrid('elem-stickers', EMOJI_STICKERS.map(e=>({id:e,emoji:e,label:'',isEmoji:true})), t=>addCanvasElem({type:'emoji',content:t.emoji,w:64,h:64,rot:0,opacity:1,fontSize:48}));
  // Frames
  buildElemGrid('elem-frames', FRAME_ELEMENTS, t=>addCanvasElem({type:'shape',svg:t.svg,id:t.id,color:'#4956a5',w:t.w||100,h:t.h||100,rot:0,opacity:1,isFrame:t.isFrame}));
  // Lines
  // Lines & Arrows — each preset enters draw mode pre-configured with its
  // style. User clicks the preset then drags on the canvas to draw a real
  // point-to-point line. The line is editable from the right inspector after
  // drawing (color, width, style, rotation, opacity). Same shape and behaviour
  // as the Frames & Borders presets above.
  const DRAW_LINE_PRESETS=[
    {id:'dl-solid',label:'Line',color:'#1a1c2e',width:4,style:'solid',arrow:'none',isLine:true,
     svg:'<line x1="3" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'},
    {id:'dl-thick',label:'Thick',color:'#1a1c2e',width:8,style:'solid',arrow:'none',isLine:true,
     svg:'<line x1="3" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'},
    {id:'dl-dashed',label:'Dashed',color:'#1a1c2e',width:4,style:'dashed',arrow:'none',isLine:true,
     svg:'<line x1="3" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 3"/>'},
    {id:'dl-dotted',label:'Dotted',color:'#1a1c2e',width:4,style:'dotted',arrow:'none',isLine:true,
     svg:'<line x1="3" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 3"/>'},
    {id:'dl-arrow',label:'Arrow',color:'#1a1c2e',width:4,style:'solid',arrow:'end',isLine:true,
     svg:'<line x1="3" y1="13" x2="19" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="16,9 23,13 16,17" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'},
    {id:'dl-darrow',label:'Double',color:'#1a1c2e',width:4,style:'solid',arrow:'both',isLine:true,
     svg:'<line x1="7" y1="13" x2="19" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="10,9 3,13 10,17" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,9 23,13 16,17" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'},
  ];
  buildElemGrid('elem-lines', DRAW_LINE_PRESETS, t=>startDrawMode({color:t.color,width:t.width,style:t.style,arrow:t.arrow}));
  // Decorations
  buildElemGrid('elem-deco', DECO_ELEMENTS.map(d=>({...d,isEmoji:true})), t=>addCanvasElem({type:'emoji',content:t.emoji,w:64,h:64,rot:0,opacity:1,fontSize:48}));
}

function buildElemGrid(containerId, items, onClick){
  const g=document.getElementById(containerId);if(!g)return;g.innerHTML='';
  items.forEach(item=>{
    const btn=document.createElement('button');btn.className='elem-btn';
    if(item.isEmoji){
      // For DECO_ELEMENTS: use item.emoji; for EMOJI_STICKERS: use item.id directly
      const display=item.emoji||item.id||'?';
      btn.innerHTML=`<span class="ei">${display}</span><span class="el">${item.label||display}</span>`;
    } else if(item.svg){
      btn.innerHTML=`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" style="color:${item.color||'#4956a5'};fill:${item.isLine||item.isFrame?'none':item.color||'#4956a5'};stroke:${item.isLine||item.isFrame?item.color||'#4956a5':'none'}">${item.svg}</svg><span class="el">${item.label||''}</span>`;
    }
    btn.onclick=()=>{onClick(item);};
    g.appendChild(btn);
  });
}

// Ã¢â€â‚¬Ã¢â€â‚¬ BUILD TEXT TAB Ã¢â€â‚¬Ã¢â€â‚¬
function buildTextTab(){
  // Text style presets
  const list=document.getElementById('text-style-list');if(!list)return;
  list.innerHTML='';
  TEXT_STYLE_PRESETS.forEach(p=>{
    const div=document.createElement('div');div.className='tsli';
    const preview=document.createElement('div');preview.className='tsl-preview';
    Object.assign(preview.style,{...p.style,maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',pointerEvents:'none'});
    preview.textContent=p.label;
    div.appendChild(preview);
    div.onclick=()=>addProText(p.label+' text',p.style);
    list.appendChild(div);
  });

  // Font families
  const ffg=document.getElementById('font-family-grid');if(!ffg)return;ffg.innerHTML='';
  FONT_FAMILIES.forEach(f=>{
    const btn=document.createElement('button');btn.className='ff-btn';
    btn.style.fontFamily=f.value;btn.textContent=f.name;
    btn.onclick=()=>{
      ffg.querySelectorAll('.ff-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      updateTextProp('fontFamily',f.value);
    };
    ffg.appendChild(btn);
  });

  // Text colors
  const tcr=document.getElementById('text-color-row');if(!tcr)return;tcr.innerHTML='';
  TEXT_COLORS.forEach(c=>{
    const sw=document.createElement('div');sw.className='tc-swatch';
    sw.style.background=c==='transparent'?'linear-gradient(135deg,#fff 45%,#f00 45%)':c;
    sw.style.border=c==='#ffffff'?'1.5px solid var(--border2)':'2px solid transparent';
    sw.onclick=()=>{tcr.querySelectorAll('.tc-swatch').forEach(s=>s.classList.remove('active'));sw.classList.add('active');updateTextProp('color',c);};
    tcr.appendChild(sw);
  });
  // Custom color
  const customSw=document.createElement('div');customSw.className='tc-swatch';
  customSw.style.background='conic-gradient(red,yellow,lime,cyan,blue,magenta,red)';customSw.style.position='relative';
  const customInput=document.createElement('input');customInput.type='color';customInput.style.cssText='position:absolute;opacity:0;width:0;height:0;top:0;left:0;';
  customInput.oninput=customInput.onchange=e=>{updateTextProp('color',e.target.value);};
  customSw.appendChild(customInput);
  customSw.onclick=()=>customInput.click();
  tcr.appendChild(customSw);

  // Style buttons
  const stb=document.getElementById('text-style-btns');if(!stb)return;stb.innerHTML='';
  [['B','fontWeight','700','400'],['I','fontStyle','italic','normal'],['U','textDecoration','underline','none'],['SÃŒÂ¶','textDecoration','line-through','none'],['CAPS','textTransform','uppercase','none']].forEach(([lbl,prop,on,off])=>{
    const b=document.createElement('button');b.className='tsb';
    b.style.fontWeight=lbl==='B'?'900':'600';if(lbl==='I')b.style.fontStyle='italic';
    b.textContent=lbl;
    b.onclick=()=>{b.classList.toggle('active');updateTextProp(prop,b.classList.contains('active')?on:off);};
    stb.appendChild(b);
  });

  // Align buttons
  const abt=document.getElementById('text-align-btns');if(!abt)return;abt.innerHTML='';
  [['Ã¢â€ Â','left'],['—','center'],['→','right']].forEach(([icon,val])=>{
    const b=document.createElement('button');b.className='tab-btn';b.textContent=icon;
    b.onclick=()=>{abt.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateTextProp('textAlign',val);};
    abt.appendChild(b);
  });

  // Shadow presets
  const sp=document.getElementById('shadow-presets');if(!sp)return;sp.innerHTML='';
  SHADOW_PRESETS.forEach(s=>{
    const b=document.createElement('button');b.className='shp';b.textContent=s.label;
    b.onclick=()=>{sp.querySelectorAll('.shp').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateTextProp('textShadow',s.val);};
    sp.appendChild(b);
  });
}

// Update property of currently selected text element
function updateTextProp(prop,val){
  // Works for both canvas-text-pro (via setTP) and sidebar text tab sliders
  if(selectedElem&&selectedElem.dataset.elemType==='text'){
    setTP(prop,val);
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ ADD CANVAS ELEMENT Ã¢â€â‚¬Ã¢â€â‚¬
function addCanvasElem(opts){
  const canvas=document.getElementById('collage-canvas');
  const el=document.createElement('div');
  el.className='canvas-elem';
  el.dataset.elemType=opts.type;
  el.dataset.elemId=opts.id||'custom';
  el.dataset.rot=opts.rot||0;
  el.dataset.color=opts.color||'#4956a5';

  const w=opts.w||80,h=opts.h||80;
  el.style.cssText=`left:${Math.round(canvasW/2-w/2)}px;top:${Math.round(canvasH/2-h/2)}px;width:${w}px;height:${h}px;transform:rotate(0deg);z-index:50;`;

  if(opts.type==='emoji'){
    el.innerHTML=`<span style="font-size:${opts.fontSize||48}px;line-height:1;display:block;text-align:center;user-select:none">${opts.content}</span>`;
  } else {
    // SVG shape — inject with current color
    el.innerHTML=`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;color:${opts.color||'#4956a5'};fill:${opts.isLine||opts.isFrame?'none':opts.color||'#4956a5'};stroke:${opts.isLine||opts.isFrame?opts.color||'#4956a5':'none'}">${opts.svg}</svg>`;
  }

  // Controls
  const del=document.createElement('button');del.className='ce-del';del.innerHTML='<i class="fa-solid fa-xmark"></i>';
  del.onclick=e=>{e.stopPropagation();el.remove();if(selectedElem===el){selectedElem=null;updateRightPanel(null);}saveHistory();};
  el.appendChild(del);

  const resize=document.createElement('div');resize.className='ce-resize';
  attachResizeHandler(resize,el);
  el.appendChild(resize);

  const rotate=document.createElement('button');rotate.className='ce-rotate';rotate.innerHTML='<i class="fa-solid fa-rotate"></i>';
  attachRotateHandler(rotate,el);
  el.appendChild(rotate);

  attachDragHandler(el);
  el.onclick=e=>{e.stopPropagation();selectElem(el,e.shiftKey||e.ctrlKey||e.metaKey);};
  canvas.appendChild(el);
  selectElem(el);
  saveHistory();
  showToast('Element added','success');
  if(isMobile())closeAllMobPanels();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ ADD PRO TEXT Ã¢â€â‚¬Ã¢â€â‚¬
// Routes to the Fabric text layer. Drag / resize / rotate / inline-edit are handled
// by Fabric natively; styling flows through the right-panel via setTP().
function addProText(text,styles){
  addFabricTextAt(text||'Your Text',styles||{},Math.round(canvasW*.1),Math.round(canvasH*.1),'left');
  if(typeof switchTab==='function'){
    const tab=document.querySelector(".stab[onclick*='text']");
    if(tab)switchTab('text',tab);
  }
  if(typeof isMobile==='function'&&isMobile()&&typeof closeAllMobPanels==='function')closeAllMobPanels();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ DRAG HANDLER Ã¢â€â‚¬Ã¢â€â‚¬
function attachDragHandler(el){
  // When dragging an element that's part of the multi-selection, every other selected
  // item rides along by the same delta. Capture the starting positions at mousedown.
  const captureCompanions=()=>{
    const companions=[];
    if(typeof multiSelectedDOM==='undefined'||!multiSelectedDOM.has(el))return companions;
    multiSelectedDOM.forEach(other=>{
      if(other===el||!other.style)return;
      companions.push({type:'dom',el:other,sl:parseFloat(other.style.left)||0,st:parseFloat(other.style.top)||0});
    });
    if(typeof fabricCanvas!=='undefined'&&fabricCanvas){
      (fabricCanvas.getActiveObjects?.()||[]).forEach(o=>{
        companions.push({type:'fabric',el:o,sl:o.left||0,st:o.top||0});
      });
    }
    return companions;
  };
  el.addEventListener('mousedown',e=>{
    const tgt=e.target;
    // Don't drag if clicking controls
    if(tgt.classList.contains('ce-del')||tgt.classList.contains('ce-resize')||tgt.classList.contains('ce-rotate'))return;
    // Don't drag if txt-edit is currently in editing mode (contentEditable=true)
    if(tgt.classList.contains('txt-edit')&&tgt.contentEditable==='true')return;
    e.stopPropagation();e.preventDefault();
    elemDrag={active:true,startX:e.clientX,startY:e.clientY,startL:parseInt(el.style.left)||0,startT:parseInt(el.style.top)||0,el,companions:captureCompanions()};
  });
  el.addEventListener('touchstart',e=>{
    if(e.target.classList.contains('ce-del')||e.target.classList.contains('ce-resize')||e.target.classList.contains('ce-rotate'))return;
    // Block drag on txt-edit only if actively editing
    if(e.target.classList.contains('txt-edit')&&e.target.contentEditable==='true')return;
    e.stopPropagation();
    e.preventDefault();
    const t=e.touches[0];
    elemDrag={active:true,startX:t.clientX,startY:t.clientY,startL:parseInt(el.style.left)||0,startT:parseInt(el.style.top)||0,el,companions:captureCompanions()};
  },{passive:false});
  // On mobile, click event is suppressed by touch-action:none — use touchend to select
  el.addEventListener('touchend',e=>{
    if(e.target.classList.contains('ce-del')||e.target.classList.contains('ce-resize')||e.target.classList.contains('ce-rotate'))return;
    const t=e.changedTouches[0];
    const startX=elemDrag.startX, startY=elemDrag.startY;
    const moved=Math.abs(t.clientX-startX)>6||Math.abs(t.clientY-startY)>6;
    if(!moved){
      e.stopPropagation();
      selectElem(el);
    }
  },{passive:true});
}

// Ã¢â€â‚¬Ã¢â€â‚¬ RESIZE HANDLER Ã¢â€â‚¬Ã¢â€â‚¬
function attachResizeHandler(handle,el,isText){
  const getStartFontSize=()=>{
    const edit=el.querySelector('.txt-edit');
    if(!edit)return 36;
    return parseFloat(edit.style.fontSize)||parseFloat(window.getComputedStyle(edit).fontSize)||36;
  };
  // Always read width/height from style (canvas coords), not offsetWidth (screen px)
  const getStartW=()=>parseFloat(el.style.width)||el.offsetWidth||80;
  const getStartH=()=>parseFloat(el.style.height)||el.offsetHeight||80;
  const isImageEl=el.dataset&&el.dataset.elemType==='image';

  handle.addEventListener('mousedown',e=>{
    e.stopPropagation();e.preventDefault();
    const startFontSize=isText?getStartFontSize():0;
    const sw=getStartW(),sh=getStartH();
    const aspectRatio=isImageEl&&sh>0?sw/sh:null;
    elemResize={active:true,startX:e.clientX,startY:e.clientY,startW:sw,startH:sh,el,isText,startFontSize,aspectRatio};
  });
  handle.addEventListener('touchstart',e=>{
    e.stopPropagation();e.preventDefault();
    const t=e.touches[0];
    const startFontSize=isText?getStartFontSize():0;
    const sw=getStartW(),sh=getStartH();
    const aspectRatio=isImageEl&&sh>0?sw/sh:null;
    elemResize={active:true,startX:t.clientX,startY:t.clientY,startW:sw,startH:sh,el,isText,startFontSize,aspectRatio};
  },{passive:false});
}

// Ã¢â€â‚¬Ã¢â€â‚¬ ROTATE HANDLER Ã¢â€â‚¬Ã¢â€â‚¬
function attachRotateHandler(handle,el){
  handle.addEventListener('mousedown',e=>{
    e.stopPropagation();e.preventDefault();
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const startAngle=Math.atan2(e.clientY-cy,e.clientX-cx)*(180/Math.PI);
    const currentRot=parseFloat(el.dataset.rot||0);
    elemRotate={active:true,startAngle,baseAngle:currentRot,cx,cy,el};
  });
  handle.addEventListener('touchstart',e=>{
    e.stopPropagation();e.preventDefault();
    const t=e.touches[0];
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const startAngle=Math.atan2(t.clientY-cy,t.clientX-cx)*(180/Math.PI);
    const currentRot=parseFloat(el.dataset.rot||0);
    elemRotate={active:true,startAngle,baseAngle:currentRot,cx,cy,el};
  },{passive:false});
}

// Ã¢â€â‚¬Ã¢â€â‚¬ GLOBAL MOUSE MOVE/UP Ã¢â€â‚¬Ã¢â€â‚¬
document.addEventListener('mousemove',e=>{
  if(elemDrag.active&&elemDrag.el){
    const canvasEl=document.getElementById('collage-canvas');
    const rect=canvasEl.getBoundingClientRect();
    const scaleX=canvasW/rect.width;
    const scaleY=canvasH/rect.height;
    const dx=(e.clientX-elemDrag.startX)*scaleX;
    const dy=(e.clientY-elemDrag.startY)*scaleY;
    elemDrag.el.style.left=(elemDrag.startL+dx)+'px';
    elemDrag.el.style.top=(elemDrag.startT+dy)+'px';
    // Move every multi-selection companion by the same delta.
    if(elemDrag.companions&&elemDrag.companions.length){
      elemDrag.companions.forEach(g=>{
        if(g.type==='dom'&&g.el.style){
          g.el.style.left=(g.sl+dx)+'px';
          g.el.style.top=(g.st+dy)+'px';
        }else if(g.type==='fabric'&&g.el){
          g.el.set({left:g.sl+dx,top:g.st+dy});
          g.el.setCoords();
        }
      });
      if(typeof fabricCanvas!=='undefined'&&fabricCanvas&&elemDrag.companions.some(g=>g.type==='fabric'))fabricCanvas.requestRenderAll();
    }
  }
  if(elemResize.active&&elemResize.el){
    const dx=e.clientX-elemResize.startX;
    const dy=e.clientY-elemResize.startY;
    // Account for canvas zoom scaling
    const canvasEl=document.getElementById('collage-canvas');
    const canvasRect=canvasEl.getBoundingClientRect();
    const scaleX=canvasW/canvasRect.width;
    const scaleY=canvasH/canvasRect.height;
    const nw=Math.max(20,elemResize.startW+dx*scaleX);
    const nh=elemResize.isText?elemResize.startH:elemResize.aspectRatio?Math.max(20,nw/elemResize.aspectRatio):Math.max(20,elemResize.startH+dy*scaleY);
    elemResize.el.style.width=nw+'px';
    if(!elemResize.isText)elemResize.el.style.height=nh+'px';
    // Scale text font size by vertical drag
    if(elemResize.isText){
      const edit=elemResize.el.querySelector('.txt-edit');
      if(edit&&elemResize.startFontSize>0){
        const newFs=Math.max(8,Math.round(elemResize.startFontSize+dy*scaleY*0.5));
        edit.style.fontSize=newFs+'px';
      }
    }
    // Scale emoji font size proportionally to element size
    const span=elemResize.el.querySelector('span');
    if(span&&elemResize.startW>0){
      const newFontSize=Math.max(12,Math.round(nw*0.72));
      span.style.fontSize=newFontSize+'px';
    }
  }
  if(elemRotate.active&&elemRotate.el){
    const el=elemRotate.el;
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const angle=Math.atan2(e.clientY-cy,e.clientX-cx)*(180/Math.PI);
    let rot=elemRotate.baseAngle+(angle-elemRotate.startAngle);
    // Snap to 45Ã‚Â° increments if shift held
    if(e.shiftKey)rot=Math.round(rot/45)*45;
    el.style.transform=`rotate(${rot}deg)`;
    el.dataset.rot=rot;
  }
});
document.addEventListener('mouseup',()=>{
  const wasDragging=elemDrag.active||elemResize.active||elemRotate.active;
  elemDrag.active=false;elemResize.active=false;elemRotate.active=false;
  if(wasDragging)saveHistory();
});
document.addEventListener('touchmove',e=>{
  if(elemDrag.active&&elemDrag.el){
    e.preventDefault();
    const t2=e.touches[0];
    const canvasEl2=document.getElementById('collage-canvas');
    const rect2=canvasEl2.getBoundingClientRect();
    const sx2=canvasW/rect2.width, sy2=canvasH/rect2.height;
    elemDrag.el.style.left=(elemDrag.startL+(t2.clientX-elemDrag.startX)*sx2)+'px';
    elemDrag.el.style.top=(elemDrag.startT+(t2.clientY-elemDrag.startY)*sy2)+'px';
  }
  if(elemResize.active&&elemResize.el){
    e.preventDefault();
    const t2=e.touches[0];
    const dx=t2.clientX-elemResize.startX;
    const dy=t2.clientY-elemResize.startY;
    const canvasEl=document.getElementById('collage-canvas');
    const canvasRect=canvasEl.getBoundingClientRect();
    const scaleX=canvasW/canvasRect.width;
    const scaleY=canvasH/canvasRect.height;
    const nw=Math.max(20,elemResize.startW+dx*scaleX);
    const nh=elemResize.isText?elemResize.startH:elemResize.aspectRatio?Math.max(20,nw/elemResize.aspectRatio):Math.max(20,elemResize.startH+dy*scaleY);
    elemResize.el.style.width=nw+'px';
    if(!elemResize.isText)elemResize.el.style.height=nh+'px';
    // Scale text font size by vertical drag
    if(elemResize.isText){
      const edit=elemResize.el.querySelector('.txt-edit');
      if(edit&&elemResize.startFontSize>0){
        const newFs=Math.max(8,Math.round(elemResize.startFontSize+dy*scaleY*0.5));
        edit.style.fontSize=newFs+'px';
      }
    }
    // Scale emoji font size proportionally to element size
    const span=elemResize.el.querySelector('span');
    if(span&&elemResize.startW>0){
      const newFontSize=Math.max(12,Math.round(nw*0.72));
      span.style.fontSize=newFontSize+'px';
    }
  }
  if(elemRotate.active&&elemRotate.el){
    e.preventDefault();
    const t2=e.touches[0];
    const el=elemRotate.el;
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const angle=Math.atan2(t2.clientY-cy,t2.clientX-cx)*(180/Math.PI);
    const rot=elemRotate.baseAngle+(angle-elemRotate.startAngle);
    el.style.transform=`rotate(${rot}deg)`;
    el.dataset.rot=rot;
  }
},{passive:false});
document.addEventListener('touchend',()=>{
  const wasDragging=elemDrag.active||elemResize.active||elemRotate.active;
  elemDrag.active=false;elemResize.active=false;elemRotate.active=false;
  if(wasDragging)saveHistory();
});

// Ã¢â€â‚¬Ã¢â€â‚¬ SELECT ELEMENT Ã¢â€â‚¬Ã¢â€â‚¬
// `additive`: when true (Shift / Ctrl / Cmd-click), add `el` to the multi-selection
// instead of replacing the current selection. Works across DOM + Fabric: a Fabric
// text remaining active stays active, and the DOM element joins the multi set.
function selectElem(el,additive){
  if(additive){
    // Toggle in/out of the multi set; keep any existing Fabric selection.
    if(multiSelectedDOM.has(el)){
      removeFromMultiSelectionDOM(el);
      if(selectedElem===el){selectedElem=null;updateRightPanel(null);}
    }else{
      // If there's a single legacy selection from before, move it into the multi set
      // so the user's existing item isn't lost when they shift-click another.
      if(selectedElem&&selectedElem.classList&&selectedElem!==el){
        addToMultiSelectionDOM(selectedElem);
      }
      addToMultiSelectionDOM(el);
      selectedElem=el;
      updateRightPanelForElem(el);
    }
    return;
  }
  // Non-additive — clear everything and select just this one.
  document.querySelectorAll('.canvas-elem,.canvas-text-pro').forEach(e=>e.classList.remove('selected'));
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.canvas-text').forEach(t=>t.classList.remove('selected'));
  clearMultiSelectionDOM();
  if(fabricCanvas&&fabricCanvas.getActiveObject()){
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  }
  selectedCell=null;selectedText=null;
  selectedElem=el;
  el.classList.add('selected');
  updateRightPanelForElem(el);
}

// Ã¢â€â‚¬Ã¢â€â‚¬ RIGHT PANEL FOR ELEMENTS Ã¢â€â‚¬Ã¢â€â‚¬
function updateRightPanelForElem(el){
  const rp=document.getElementById('rp-body');
  if(!el){rp.innerHTML=`<div class="no-sel"><div class="ns-icon"><i class="fa-solid fa-arrow-pointer"></i></div>Click any element to edit</div>`;return;}
  const type=el.dataset.elemType;

  if(type==='text'){
    // Pull current style from either the DOM wrapper or the Fabric bridge.
    const st=getCurrentTextStyle(el);
    const col=st.color;
    const hexCol=col.startsWith('#')?col:(rgbToHex(col)||'#ffffff');
    const fs=parseInt(st.fontSize)||36;
    const ff=st.fontFamily;
    const fw=st.fontWeight;
    const fi=st.fontStyle;
    const td=st.textDecoration;
    const tt=st.textTransform;
    const ta=st.textAlign;
    const ts=st.textShadow;
    const ls=parseFloat(st.letterSpacing)||0;
    const lh=parseFloat(st.lineHeight)||1.3;
    const op=Math.round(st.opacity*100);
    const txtColors=['#ffffff','#1a1c2e','#4956a5','#e05252','#38b27a','#f5c842','#c97ae8','#ff6b35','#4facfe','#f06292','#d4af37','#000000'];
    const shadowOpts=[['None','none'],['Soft','2px 2px 6px rgba(0,0,0,.5)'],['Hard','3px 3px 0 rgba(0,0,0,.7)'],['Glow','0 0 14px currentColor'],['Neon','0 0 8px #4facfe,0 0 20px #4facfe'],['Lift','0 6px 14px rgba(0,0,0,.5)'],['Gold','2px 2px 0 #b8860b,-2px -2px 0 #ffd700']];

    rp.innerHTML=`
<div class="rp-section-title"><i class="fa-solid fa-pen"></i> Text Layer</div>
<div class="ep-row"><div class="ep-label">Content (double-click canvas to edit)</div>
<textarea class="prop-input" id="rp-txt-content" rows="3">${st.content}</textarea></div>
<div class="ep-row"><div class="ep-label">Font Family</div>
<select class="prop-input" onchange="setTP('fontFamily',this.value)">
  ${FONT_FAMILIES.map(f=>`<option value="${f.value}"${ff===f.value?' selected':''}>${f.name}</option>`).join('')}
</select></div>
<div class="ep-row"><div class="ep-label">Size: <strong id="rp-fs-v">${fs}px</strong></div>
<input class="ep-range" type="range" min="8" max="200" value="${fs}" oninput="setTP('fontSize',this.value+'px');document.getElementById('rp-fs-v').textContent=this.value+'px'"></div>
<div class="ep-row"><div class="ep-label">Text Color</div>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
  <input type="color" value="${hexCol}" id="rp-txt-color" oninput="setTP('color',this.value);document.querySelectorAll('#rp-body .ep-swatch').forEach(s=>s.classList.remove('active'));" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border2);cursor:pointer;padding:2px">
  <div style="display:flex;flex-wrap:wrap;gap:4px">${txtColors.map(c=>`<div class="ep-swatch${hexCol===c?' active':''}" style="background:${c};${c==='#ffffff'?'border:1.5px solid var(--border2)':''}" onclick="setTP('color','${c}');document.getElementById('rp-txt-color').value='${c}';document.querySelectorAll('#rp-body .ep-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active')"></div>`).join('')}
  </div></div></div>
<div class="ep-row"><div class="ep-label">Style</div>
<div style="display:flex;gap:5px;flex-wrap:wrap">
  <button class="tsb${fw==='700'||fw==='900'?' active':''}" style="font-weight:900" onclick="this.classList.toggle('active');setTP('fontWeight',this.classList.contains('active')?'700':'400')">B</button>
  <button class="tsb${fi==='italic'?' active':''}" style="font-style:italic" onclick="this.classList.toggle('active');setTP('fontStyle',this.classList.contains('active')?'italic':'normal')">I</button>
  <button class="tsb${td.includes('underline')?' active':''}" onclick="this.classList.toggle('active');setTP('textDecoration',this.classList.contains('active')?'underline':'none')">U&#818;</button>
  <button class="tsb${td.includes('line-through')?' active':''}" onclick="this.classList.toggle('active');setTP('textDecoration',this.classList.contains('active')?'line-through':'none')">S&#x0336;</button>
  <button class="tsb${tt==='uppercase'?' active':''}" onclick="this.classList.toggle('active');setTP('textTransform',this.classList.contains('active')?'uppercase':'none')" style="font-size:10px;letter-spacing:1px">CAPS</button>
</div></div>
<div class="ep-row"><div class="ep-label">Alignment</div>
<div style="display:flex;gap:5px">
  <button class="tab-btn${ta==='left'?' active':''}" style="flex:1" onclick="document.querySelectorAll('#rp-body .tab-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');setTP('textAlign','left')"><i class="fa-solid fa-align-left"></i></button>
  <button class="tab-btn${ta==='center'?' active':''}" style="flex:1" onclick="document.querySelectorAll('#rp-body .tab-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');setTP('textAlign','center')"><i class="fa-solid fa-align-center"></i></button>
  <button class="tab-btn${ta==='right'?' active':''}" style="flex:1" onclick="document.querySelectorAll('#rp-body .tab-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');setTP('textAlign','right')"><i class="fa-solid fa-align-right"></i></button>
</div></div>
<div class="ep-row"><div class="ep-label">Text Shadow</div>
<div style="display:flex;flex-wrap:wrap;gap:4px">
  ${shadowOpts.map(([l,v])=>`<button class="shp${ts===v?' active':''}" onclick="setTP('textShadow','${v}');document.querySelectorAll('#rp-body .shp').forEach(b=>b.classList.remove('active'));this.classList.add('active')" style="flex:1;min-width:44px">${l}</button>`).join('')}
</div></div>
<div class="ep-row"><div class="ep-label">Text Outline</div>
<div style="display:flex;gap:6px;align-items:center">
  <input type="color" value="#000000" id="rp-stroke-col" oninput="setTP('webkitTextStroke',document.getElementById('rp-stroke-w').value+' '+this.value)" style="width:36px;height:30px;border-radius:6px;border:1.5px solid var(--border2);cursor:pointer;padding:2px">
  <select class="prop-input" id="rp-stroke-w" style="flex:1" onchange="const c=document.getElementById('rp-stroke-col').value;if(this.value==='0px'){const e=selectedElem?.querySelector('.txt-edit');if(e){e.style.webkitTextStroke='';}}else setTP('webkitTextStroke',this.value+' '+c)">
    <option value="0px">No Outline</option><option value="1px">Thin</option><option value="2px">Medium</option><option value="3px">Bold</option><option value="5px">Heavy</option>
  </select>
</div></div>
<div class="ep-row"><div class="ep-label">Letter Spacing: <strong id="rp-ls-v">${ls}px</strong></div>
<input class="ep-range" type="range" min="-5" max="30" value="${ls}" oninput="setTP('letterSpacing',this.value+'px');document.getElementById('rp-ls-v').textContent=this.value+'px'"></div>
<div class="ep-row"><div class="ep-label">Line Height: <strong id="rp-lh-v">${lh}</strong></div>
<input class="ep-range" type="range" min="0.8" max="3" step="0.1" value="${lh}" oninput="setTP('lineHeight',this.value);document.getElementById('rp-lh-v').textContent=parseFloat(this.value).toFixed(1)"></div>
<div class="ep-row"><div class="ep-label">Opacity: <strong id="rp-op-v">${op}%</strong></div>
<input class="ep-range" type="range" min="10" max="100" value="${op}" oninput="setTP('opacity',this.value/100);document.getElementById('rp-op-v').textContent=this.value+'%'"></div>
<div class="ep-row" style="display:flex;gap:5px">
  <button class="btn btn-ghost btn-sm dup-btn" style="flex:1" onclick="duplicateTextLayer()"><i class="fa-solid fa-clone"></i> Dup</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="textLayerBringForward()"><i class="fa-solid fa-arrow-up"></i> Forward</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="textLayerSendBackward()"><i class="fa-solid fa-arrow-down"></i> Back</button>
</div>
<div class="ep-row" style="margin-top:5px">
  <button class="btn btn-ghost btn-sm" style="width:100%;color:var(--danger);border-color:var(--danger)" onclick="deleteTextLayer()"><i class="fa-solid fa-trash"></i> Delete Element</button>
</div>`;
    setTimeout(()=>{
      const ta2=document.getElementById('rp-txt-content');
      if(ta2)ta2.addEventListener('input',()=>{
        // Route to Fabric (primary) or DOM (legacy) depending on what's selected.
        if(selectedElem?.__fabric){setTP('content',ta2.value);}
        else{const e=selectedElem?.querySelector('.txt-edit');if(e)e.textContent=ta2.value;}
      });
    },0);

  } else {
    const svgEl=el.querySelector('svg');
    const spanEl=el.querySelector('span');
    const isImageElem=el.dataset.elemType==='image';
    const col=svgEl?svgEl.style.color||'#4956a5':'#4956a5';
    const hexCol=col.startsWith('#')?col:(col.startsWith('rgb')?rgbToHex(col)||'#4956a5':'#4956a5');
    const w=parseFloat(el.style.width)||parseFloat(el.style.height)||80;
    const h=parseFloat(el.style.height)||w;
    const op=Math.round((parseFloat(el.style.opacity)||1)*100);
    const rot=Math.round(parseFloat(el.dataset.rot||0));
    const isEmoji=!!spanEl&&!svgEl&&!isImageElem;

    if(isImageElem){
      // Custom image element right panel
      rp.innerHTML=`
<div class="rp-section-title"><i class="fa-solid fa-image"></i> Image Element</div>
<div class="ep-row"><div class="ep-label">Width: <strong id="rp-iw-v">${Math.round(w)}px</strong></div>
<input class="ep-range" type="range" min="20" max="${Math.round(canvasW*0.9)}" value="${Math.round(w)}" oninput="if(selectedElem){selectedElem.style.width=this.value+'px';}document.getElementById('rp-iw-v').textContent=this.value+'px';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Height: <strong id="rp-ih-v">${Math.round(h)}px</strong></div>
<input class="ep-range" type="range" min="20" max="${Math.round(canvasH*0.9)}" value="${Math.round(h)}" oninput="if(selectedElem){selectedElem.style.height=this.value+'px';}document.getElementById('rp-ih-v').textContent=this.value+'px';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Rotation: <strong id="rp-ir-v">${rot}&#176;</strong></div>
<input class="ep-range" type="range" min="-180" max="180" value="${rot}" oninput="if(selectedElem){selectedElem.style.transform='rotate('+this.value+'deg)';selectedElem.dataset.rot=this.value;}document.getElementById('rp-ir-v').textContent=this.value+'&#176;';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Opacity: <strong id="rp-io-v">${op}%</strong></div>
<input class="ep-range" type="range" min="10" max="100" value="${op}" oninput="if(selectedElem)selectedElem.style.opacity=this.value/100;document.getElementById('rp-io-v').textContent=this.value+'%';debouncedSave()"></div>
<div class="ep-row" style="display:flex;gap:5px">
  <button class="btn btn-ghost btn-sm dup-btn" style="flex:1" onclick="duplicateElem(selectedElem)"><i class="fa-solid fa-clone"></i> Dup</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="bringForward(selectedElem)"><i class="fa-solid fa-arrow-up"></i> Fwd</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="sendBackward(selectedElem)"><i class="fa-solid fa-arrow-down"></i> Back</button>
</div>
<div class="ep-row" style="margin-top:5px">
  <button class="btn btn-ghost btn-sm" style="width:100%;color:var(--danger);border-color:var(--danger)" onclick="if(selectedElem){selectedElem.remove();selectedElem=null;updateRightPanel(null);saveHistory()}"><i class="fa-solid fa-trash"></i> Delete Image</button>
</div>`;
      return;
    }

    rp.innerHTML=`
<div class="rp-section-title"><i class="fa-solid fa-${isEmoji?'face-smile':'shapes'}"></i> ${isEmoji?'Sticker':'Shape'} Element</div>
${!isEmoji?`<div class="ep-row"><div class="ep-label">Fill Color</div>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
  <input type="color" value="${hexCol}" oninput="setElemColor(this.value,null)" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border2);cursor:pointer;padding:2px">
  <div style="display:flex;flex-wrap:wrap;gap:4px">${['#ffffff','#1a1c2e','#4956a5','#e05252','#38b27a','#f5c842','#c97ae8','#ff6b35','#4facfe','#f06292','#d4af37'].map(c=>`<div class="ep-swatch" style="background:${c};${c==='#ffffff'?'border:1.5px solid var(--border2)':''}" onclick="setElemColor('${c}',this)"></div>`).join('')}
  </div>
</div></div>`:''}
<div class="ep-row"><div class="ep-label">Size: <strong id="rp-sz-v">${w}px</strong></div>
<input class="ep-range" type="range" min="20" max="600" value="${w}" oninput="if(selectedElem){selectedElem.style.width=this.value+'px';selectedElem.style.height=this.value+'px';const sp=selectedElem.querySelector('span');if(sp){sp.style.fontSize=Math.round(this.value*.72)+'px';}}document.getElementById('rp-sz-v').textContent=this.value+'px';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Rotation: <strong id="rp-rot-v">${rot}&#176;</strong></div>
<input class="ep-range" type="range" min="-180" max="180" value="${rot}" oninput="if(selectedElem){selectedElem.style.transform='rotate('+this.value+'deg)';selectedElem.dataset.rot=this.value;}document.getElementById('rp-rot-v').textContent=this.value+'&#176;';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Opacity: <strong id="rp-eop-v">${op}%</strong></div>
<input class="ep-range" type="range" min="10" max="100" value="${op}" oninput="if(selectedElem)selectedElem.style.opacity=this.value/100;document.getElementById('rp-eop-v').textContent=this.value+'%';debouncedSave()"></div>
<div class="ep-row" style="display:flex;gap:5px">
  <button class="btn btn-ghost btn-sm dup-btn" style="flex:1" onclick="duplicateElem(selectedElem)"><i class="fa-solid fa-clone"></i> Dup</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="bringForward(selectedElem)"><i class="fa-solid fa-arrow-up"></i> Forward</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="sendBackward(selectedElem)"><i class="fa-solid fa-arrow-down"></i> Back</button>
</div>
<div class="ep-row" style="margin-top:5px">
  <button class="btn btn-ghost btn-sm" style="width:100%;color:var(--danger);border-color:var(--danger)" onclick="if(selectedElem){selectedElem.remove();selectedElem=null;updateRightPanel(null);saveHistory()}"><i class="fa-solid fa-trash"></i> Delete Element</button>
</div>`;
  }
}

let _histDebounce=null;
function debouncedSave(){clearTimeout(_histDebounce);_histDebounce=setTimeout(saveHistory,600);}

function setTP(prop,val){
  // Fabric path — write to the underlying IText and re-render the overlay canvas.
  if(selectedElem?.__fabric){
    applyCSSToFabricText(selectedElem.__fabric,prop,val);
    if(fabricCanvas)fabricCanvas.requestRenderAll();
    debouncedSave();
    return;
  }
  // DOM fallback (unused once all text is on Fabric, but kept for safety).
  const e=selectedElem?.querySelector?.('.txt-edit');
  if(!e)return;
  if(prop==='webkitTextStroke'){e.style.webkitTextStroke=val;e.style.textStroke=val;}
  else e.style[prop]=val;
  debouncedSave();
}

// Apply a single CSS-style property change to a Fabric IText. Mirrors the shape of the
// DOM setter so existing right-panel handlers ("setTP('fontSize','48px')") keep working.
function applyCSSToFabricText(fab,cssProp,val){
  if(!fab)return;
  switch(cssProp){
    case 'color':{
      const c=val||'#000';
      fab.set('fill',c);
      // Stamp-style border tracks the text color so the box stays color-coordinated.
      if(fab.__border)fab.__border.color=c;
      break;
    }
    case 'fontSize':{
      const nf=parseFloat(val)||36;
      // Preserve charSpacing (px→em conversion depends on fontSize).
      const lsPx=(fab.charSpacing||0)/1000*(fab.fontSize||36);
      fab.set('fontSize',nf);
      if(lsPx)fab.set('charSpacing',Math.round(lsPx/nf*1000));
      break;
    }
    case 'fontFamily':fab.set('fontFamily',String(val).replace(/['"]/g,'').split(',')[0].trim());break;
    case 'fontWeight':fab.set('fontWeight',val);break;
    case 'fontStyle':fab.set('fontStyle',val);break;
    case 'textAlign':fab.set('textAlign',val);break;
    case 'textDecoration':{
      fab.set('underline',String(val).includes('underline'));
      fab.set('linethrough',String(val).includes('line-through'));
      fab.set('overline',String(val).includes('overline'));
      break;
    }
    case 'textTransform':{
      fab.__textTransform=val;
      if(!fab.__originalText)fab.__originalText=fab.text;
      const base=fab.__originalText;
      fab.text=val==='uppercase'?base.toUpperCase():val==='lowercase'?base.toLowerCase():base;
      fab.setCoords();
      break;
    }
    case 'letterSpacing':{
      const ls=parseFloat(val)||0, fs=fab.fontSize||36;
      fab.set('charSpacing',Math.round(ls/fs*1000));
      break;
    }
    case 'lineHeight':{
      const lh=parseFloat(val);
      if(!isNaN(lh))fab.set('lineHeight',lh>5?lh/(fab.fontSize||36):lh);
      break;
    }
    case 'textShadow':{
      if(!val||val==='none'){fab.set('shadow',null);break;}
      const colorRe=/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|currentColor/;
      const cm=String(val).match(colorRe);
      let color=cm?cm[0]:'rgba(0,0,0,0.5)';
      if(color==='currentColor')color=fab.fill||'#000';
      const nums=(String(val).replace(colorRe,'').match(/-?[\d.]+/g)||[]).map(parseFloat);
      fab.set('shadow',new fabric.Shadow({offsetX:nums[0]||0,offsetY:nums[1]||0,blur:nums[2]||0,color}));
      break;
    }
    case 'webkitTextStroke':{
      if(!val||val==='0px'||val==='0px '){fab.set('strokeWidth',0);fab.set('stroke','');break;}
      const m=String(val).match(/([\d.]+)px\s+(.+)/);
      if(m){fab.set('strokeWidth',parseFloat(m[1]));fab.set('stroke',m[2].trim());fab.set('paintFirst','stroke');}
      break;
    }
    case 'opacity':fab.set('opacity',parseFloat(val)||1);break;
    case 'content':{
      fab.__originalText=val;
      const tt=fab.__textTransform;
      fab.text=tt==='uppercase'?val.toUpperCase():tt==='lowercase'?val.toLowerCase():val;
      fab.setCoords();
      break;
    }
    case 'border':{
      // "Npx solid color" — clears when empty / 'none' / '0px'
      if(!val||val==='none'){fab.__border=null;break;}
      const m=String(val).match(/([\d.]+)px\s+(?:solid\s+)?(.+)/);
      if(m){fab.__border={width:parseFloat(m[1])||1,color:(m[2]||'#000').trim()};}
      break;
    }
    case 'padding':{
      if(val==null||val===''){fab.__padding=null;break;}
      const parts=String(val).trim().split(/\s+/).map(p=>parseFloat(p)||0);
      let t,r,b,l;
      if(parts.length===1)t=r=b=l=parts[0];
      else if(parts.length===2){t=b=parts[0];r=l=parts[1];}
      else if(parts.length===3){t=parts[0];r=l=parts[1];b=parts[2];}
      else{t=parts[0];r=parts[1];b=parts[2];l=parts[3];}
      fab.__padding={top:t,right:r,bottom:b,left:l};
      break;
    }
    case 'borderRadius':fab.__borderRadius=parseFloat(val)||0;break;
    case 'background':
    case 'backgroundColor':{
      if(!val||val==='transparent'||val==='none'){fab.__bgColor=null;break;}
      fab.__bgColor=val;
      break;
    }
  }
}

// Read current text styling from a selectedElem-like reference (works for both DOM
// .canvas-text-pro wrappers and Fabric bridges). Returns a plain object with CSS-style
// keys so the right-panel renderer doesn't need two code paths.
function getCurrentTextStyle(el){
  const f=el?.__fabric;
  if(f){
    const fs=f.fontSize||36;
    const shadow=f.shadow?`${f.shadow.offsetX||0}px ${f.shadow.offsetY||0}px ${f.shadow.blur||0}px ${f.shadow.color||'rgba(0,0,0,.5)'}`:'none';
    const stroke=(f.strokeWidth&&f.stroke)?`${f.strokeWidth}px ${f.stroke}`:'';
    const deco=[];if(f.underline)deco.push('underline');if(f.linethrough)deco.push('line-through');
    return{
      content:f.__originalText||f.text||'',
      color:f.fill||'#ffffff',
      fontSize:fs+'px',
      fontFamily:f.fontFamily||"'Outfit',sans-serif",
      fontWeight:String(f.fontWeight||'400'),
      fontStyle:f.fontStyle||'normal',
      textDecoration:deco.join(' ')||'none',
      textTransform:f.__textTransform||'none',
      textAlign:f.textAlign||'left',
      textShadow:shadow,
      letterSpacing:((f.charSpacing||0)/1000*fs)+'px',
      lineHeight:String(f.lineHeight||1.16),
      opacity:f.opacity!=null?f.opacity:1,
      webkitTextStroke:stroke,
    };
  }
  const edit=el?.querySelector?.('.txt-edit');
  return{
    content:edit?.textContent||'',
    color:edit?.style.color||'#ffffff',
    fontSize:edit?.style.fontSize||'36px',
    fontFamily:edit?.style.fontFamily||"'Outfit',sans-serif",
    fontWeight:edit?.style.fontWeight||'400',
    fontStyle:edit?.style.fontStyle||'normal',
    textDecoration:edit?.style.textDecoration||'none',
    textTransform:edit?.style.textTransform||'none',
    textAlign:edit?.style.textAlign||'left',
    textShadow:edit?.style.textShadow||'none',
    letterSpacing:edit?.style.letterSpacing||'0',
    lineHeight:edit?.style.lineHeight||'1.3',
    opacity:parseFloat(el?.style?.opacity)||1,
    webkitTextStroke:edit?.style.webkitTextStroke||'',
  };
}


function setElemColor(col,swatchEl){
  if(!selectedElem)return;
  const svg=selectedElem.querySelector('svg');
  if(svg){
    svg.style.color=col;
    const isLineOrFrame=selectedElem.querySelector('line,polyline,path[fill=\'none\']');
    if(isLineOrFrame){svg.style.fill='none';svg.style.stroke=col;}
    else{svg.style.fill=col;svg.style.stroke='none';}
  }
  if(swatchEl){
    const row=swatchEl.closest('.ep-color-row');
    if(row)row.querySelectorAll('.ep-swatch').forEach(s=>s.classList.remove('active'));
    swatchEl.classList.add('active');
  }
  debouncedSave();
}

// Hook canvas click/touch to deselect elements — handled by unified deselect() above


// Ã¢â€â‚¬Ã¢â€â‚¬ Override showAddText to use pro system Ã¢â€â‚¬Ã¢â€â‚¬
function showAddText(){
  addProText('Type your text here',TEXT_STYLE_PRESETS[0].style);
  switchTab('text',document.querySelectorAll('.stab')[3]);
}

// INIT
// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ Z-INDEX HELPERS Ã¢â€â‚¬Ã¢â€â‚¬
function getElemZ(el){
  return parseInt(window.getComputedStyle(el).zIndex)||50;
}
function bringForward(el){
  if(!el)return;
  el.style.zIndex=getElemZ(el)+10;
  saveHistory();
}
function sendBackward(el){
  if(!el)return;
  el.style.zIndex=Math.max(1,getElemZ(el)-10);
  saveHistory();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ DUPLICATE ELEMENT Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
function duplicateElem(el){
  if(!el)return;
  const clone=el.cloneNode(true);
  clone.style.left=(parseInt(el.style.left)||0)+20+'px';
  clone.style.top=(parseInt(el.style.top)||0)+20+'px';
  clone.style.zIndex=(parseInt(el.style.zIndex)||50)+1;
  // Re-attach all handlers
  attachDragHandler(clone);
  clone.onclick=e=>{e.stopPropagation();selectElem(clone,e.shiftKey||e.ctrlKey||e.metaKey);};
  clone.addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const moved=Math.abs(t.clientX-(elemDrag.startX||0))>6||Math.abs(t.clientY-(elemDrag.startY||0))>6;
    if(!moved){e.stopPropagation();selectElem(clone,e.shiftKey||e.ctrlKey||e.metaKey);}
  },{passive:true});
  const resizeBtn=clone.querySelector('.ce-resize');
  if(resizeBtn)attachResizeHandler(resizeBtn,clone,clone.classList.contains('canvas-text-pro'));
  const rotBtn=clone.querySelector('.ce-rotate');
  if(rotBtn)attachRotateHandler(rotBtn,clone);
  const delBtn=clone.querySelector('.ce-del,.txt-del2');
  if(delBtn)delBtn.onclick=e=>{e.stopPropagation();clone.remove();if(selectedElem===clone){selectedElem=null;updateRightPanel(null);}saveHistory();};
  document.getElementById('collage-canvas').appendChild(clone);
  selectElem(clone);
  saveHistory();
  showToast('Duplicated!','success');
}

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ CONTEXT MENU (long press on cell) Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
let ctxLongPressTimer=null;
const ctxMenu=document.getElementById('ctx-menu');

function showCtxMenu(x,y,items){
  ctxMenu.innerHTML=items.map((it,i)=>
    it==='---'?'<div class="ctx-divider"></div>':
    `<div class="ctx-item${it.danger?' danger':''}" onclick="hideCtxMenu();(${it.action})()">
      <span class="ci">${it.icon}</span>${it.label}
    </div>`
  ).join('');
  // Position within viewport
  ctxMenu.style.display='block';
  const mw=ctxMenu.offsetWidth||180, mh=ctxMenu.offsetHeight||200;
  ctxMenu.style.left=Math.min(x,window.innerWidth-mw-8)+'px';
  ctxMenu.style.top=Math.min(y,window.innerHeight-mh-8)+'px';
}
function hideCtxMenu(){ctxMenu.style.display='none';}
document.addEventListener('click',e=>{if(!ctxMenu.contains(e.target))hideCtxMenu();});
document.addEventListener('touchstart',e=>{if(!ctxMenu.contains(e.target))hideCtxMenu();},{passive:true});

function attachCellLongPress(el,idx){
  el.addEventListener('touchstart',e=>{
    ctxLongPressTimer=setTimeout(()=>{
      const t=e.touches[0];
      const cd=cells[idx];
      showCtxMenu(t.clientX,t.clientY,[
        cd.imgData?{icon:'<i class="fa-solid fa-arrow-up-from-bracket"></i>',label:'Replace Photo',action:`()=>triggerCellUpload(${idx})`}:{icon:'<i class="fa-solid fa-folder-open"></i>',label:'Upload Photo',action:`()=>triggerCellUpload(${idx})`},
        cd.imgData?{icon:'<i class="fa-solid fa-crop"></i>',label:'Crop & Position',action:`()=>openCropModal(${idx})`}:null,
        cd.imgData?{icon:'<i class="fa-solid fa-arrow-right-arrow-left"></i>',label:'Swap Photo',action:`()=>enableCellSwap(${idx})`}:null,
        cd.imgData?'---':null,
        cd.imgData?{icon:'<i class="fa-solid fa-xmark"></i>',label:'Remove Photo',action:`()=>removeCellPhoto(${idx})`,danger:true}:null,
      ].filter(Boolean));
    },500);
  },{passive:true});
  el.addEventListener('touchend',()=>{clearTimeout(ctxLongPressTimer);},{passive:true});
  el.addEventListener('touchmove',()=>{clearTimeout(ctxLongPressTimer);},{passive:true});
}

// Attach long press to cells after render — called from renderCollage directly
function attachAllCellLongPress(){
  cells.forEach((cd,i)=>attachCellLongPress(cd.el,i));
}

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ PINCH-TO-ZOOM ON CANVAS (mobile) Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
let pinchStartDist=0, pinchStartZoom=1;
const canvasScroll=document.getElementById('canvas-scroll');

canvasScroll.addEventListener('touchstart',e=>{
  if(e.touches.length===2){
    pinchStartDist=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,
      e.touches[0].clientY-e.touches[1].clientY
    );
    pinchStartZoom=zoom;
  }
},{passive:true});

canvasScroll.addEventListener('touchmove',e=>{
  if(e.touches.length===2){
    e.preventDefault();
    const dist=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,
      e.touches[0].clientY-e.touches[1].clientY
    );
    const ratio=dist/pinchStartDist;
    const newZoom=Math.min(3,Math.max(0.2,pinchStartZoom*ratio));
    zoom=newZoom;
    const cv=document.getElementById('collage-canvas');
    cv.style.transform=`scale(${zoom})`;
    cv.style.transformOrigin='center center';
    document.getElementById('zoom-label').textContent=Math.round(zoom*100)+'%';
    updateCellUIScale();
  }
},{passive:false});

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ RECENT COLORS Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
let recentColors=[];
function addRecentColor(hex){
  if(!hex||!hex.startsWith('#'))return;
  recentColors=recentColors.filter(c=>c!==hex);
  recentColors.unshift(hex);
  recentColors=recentColors.slice(0,8);
  renderRecentColors();
}
function renderRecentColors(){
  const containers=document.querySelectorAll('.recent-colors-container');
  containers.forEach(container=>{
    container.innerHTML='';
    if(recentColors.length===0){container.style.display='none';return;}
    container.style.display='flex';
    recentColors.forEach(col=>{
      const sw=document.createElement('div');
      sw.className='recent-color-swatch';
      sw.style.background=col;
      sw.style.border=col==='#ffffff'?'2px solid var(--border2)':'2px solid transparent';
      sw.title=col;
      sw.onclick=()=>{
        // Apply to custom bg picker
        const input=document.getElementById('custom-bg');
        if(input){input.value=col;liveCustomBg(col);}
      };
      container.appendChild(sw);
    });
  });
}
// Hook into liveCustomBg to track recent colors — done inline in liveCustomBg itself

// Add recent colors row to bg solid tab
(function injectRecentColors(){
  const solidPanel=document.getElementById('bgtab-solid');
  if(!solidPanel)return;
  const row=document.createElement('div');
  row.innerHTML='<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted);margin-bottom:6px;margin-top:10px">Recent</div><div class="recent-colors recent-colors-container" style="display:none"></div>';
  solidPanel.appendChild(row);
})();

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ MULTI-SELECT ELEMENTS (Shift+Click) Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
let multiSelected=new Set();
document.addEventListener('keydown',e2=>{
  // Shift+A to select all elements
  if(e2.shiftKey&&e2.key==='a'){
    document.querySelectorAll('.canvas-elem,.canvas-text-pro').forEach(el=>{
      el.classList.add('selected');
      multiSelected.add(el);
    });
    showToast(`${multiSelected.size} elements selected`,'');
  }
  // Delete multi-selected
  if((e2.key==='Delete'||e2.key==='Backspace')&&multiSelected.size>1){
    const tag=document.activeElement.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA')return;
    multiSelected.forEach(el=>el.remove());
    multiSelected.clear();
    selectedElem=null;updateRightPanel(null);
  }
  // Escape clears multi-select
  if(e2.key==='Escape'){multiSelected.clear();}
});

// Patch mousedown on elements for shift-click multi-select
document.getElementById('collage-canvas').addEventListener('mousedown',e=>{
  const el=e.target.closest('.canvas-elem,.canvas-text-pro');
  if(el&&e.shiftKey){
    e.stopPropagation();
    if(multiSelected.has(el)){el.classList.remove('selected');multiSelected.delete(el);}
    else{el.classList.add('selected');multiSelected.add(el);}
  }
},{capture:true});

// ══════════════════════════════════════════════
// Ã¢â€â‚¬Ã¢â€â‚¬ FILENAME IN EXPORT Ã¢â€â‚¬Ã¢â€â‚¬
// ══════════════════════════════════════════════
// Extension badge update is handled inline via selectExportFmt below

// Filename-aware export — replaces doExportWithOptions inline below

function init(startId = 'mag'){
  buildStickerGrid();buildCountPills();buildTemplateGrid();buildPatternGrid();buildGradPresets();buildBgImages();
  buildOccCategoryPills();buildOccTemplateGrid();
  buildElementsTab();buildTextTab();
  const canvas=document.getElementById('collage-canvas');
  canvas.style.width=canvasW+'px';canvas.style.height=canvasH+'px';canvas.style.background=bgColor;
  applyShadow();
  document.getElementById('grad-preview').style.background='linear-gradient(135deg,#4956a5,#c97ae8)';

  // Background-prefetch the occasion templates as soon as the main UI is interactive,
  // so opening the Occasions tab is instant. Uses requestIdleCallback if available,
  // otherwise a short delay; either way the main script + first paint aren't blocked.
  const prefetchOcc=()=>loadOccTemplates().then(()=>{
    // If the user is already on the Occasions tab, repopulate the grid so the
    // loading spinner is replaced by real cards.
    if(document.querySelector('#occ-template-grid .fa-spinner')||
       (document.getElementById('occ-template-grid')?.children.length===0)){
      buildOccTemplateGrid();
    }
  }).catch(()=>{});
  if(typeof requestIdleCallback==='function')requestIdleCallback(prefetchOcc,{timeout:2500});
  else setTimeout(prefetchOcc,800);

  // Apply a starting template — if it's an occasion id we may have to wait for the
  // lazy load to finish before we can find it.
  const tryApplyStart=()=>{
    const occT = OCC_TEMPLATES&&OCC_TEMPLATES.find(t=>t.id===startId);
    if(occT){
      const occCard = document.querySelector(`.occ-tmpl-card[data-id="${startId}"]`) || Object.assign(document.createElement('div'),{dataset:{id:startId}});
      applyRichOccTemplate(occT, occCard, true);
      // URL ?cat= override: lets a landing page (e.g. /picture-montage-maker)
      // request a specific category filter regardless of the template's own
      // cat. Most useful with cat=all so the user sees every template across
      // categories instead of being pinned to the chosen template's bucket.
      const startCat = paramsz.get('cat');
      if(startCat){
        activeOccCat=startCat;
        document.querySelectorAll('.occ-pill').forEach(p=>p.classList.toggle('active',p.dataset.cat===startCat));
        if(typeof buildOccTemplateGrid==='function')buildOccTemplateGrid();
      }
      return true;
    }
    const defT = TEMPLATES.find(t=>t.id===startId);
    if(defT){
      const card = document.querySelector(`.template-card[data-id="${startId}"]`);
      if(card) applyTemplate(defT, card);
      else { currentTemplate=defT; if(defT.shapeCells)renderShapeCollage();else renderCollage(); updateFillStats(); }
      return true;
    }
    return false;
  };
  setTimeout(()=>{
    if(tryApplyStart())return;
    // Likely an occasion id but templates haven't loaded yet — wait for the prefetch.
    loadOccTemplates().then(tryApplyStart).catch(()=>{});
  }, 120);

  saveHistory();setTimeout(resetZoom,100);
}

const paramsz = new URLSearchParams(window.location.search);
const templatearg = paramsz.get('template');

if(templatearg){
  init(templatearg)
}
else init();


window.dumpTemplate = function() {
  const r = n => +n.toFixed(3);
  const cw = canvasW, ch = canvasH;

  let tplObj = null, tid = '(unknown)', tname = '(unnamed)';
  try {
    const t = (typeof currentTemplate !== 'undefined') ? currentTemplate : null;
    if (t) {
      tplObj = t.occTemplate || t;
      tid    = t.id   || tplObj.id   || '(unknown)';
      tname  = t.name || tplObj.name || '(unnamed)';
    }
  } catch (e) {}

  // photoFrames from each photo cell currently on the canvas
  const frames = (cells || []).map(c => {
    if (!c.el) return null;
    const l  = parseFloat(c.el.style.left)   || 0;
    const t  = parseFloat(c.el.style.top)    || 0;
    const w  = parseFloat(c.el.style.width)  || 0;
    const h  = parseFloat(c.el.style.height) || 0;
    const rotM = (c.el.style.transform || '').match(/rotate\((-?[\d.]+)deg\)/);
    const angle = rotM ? +parseFloat(rotM[1]).toFixed(1) : 0;
    const shape = c.el.dataset.shape || 'rect';
    const shapeStr = shape === 'rect' ? '' : `,shape:'${shape}'`;
    return `   {rx:${r(l/cw)},ry:${r(t/ch)},rw:${r(w/cw)},rh:${r(h/ch)},angle:${angle}${shapeStr}},`;
  }).filter(Boolean);

  // canvasElements text positions
  const texts = [];
  try {
    const fc = (typeof fabricCanvas !== 'undefined') ? fabricCanvas : null;
    if (fc) {
      fc.getObjects().forEach((o, i) => {
        if (!(o.type === 'i-text' || o.type === 'text' || o.type === 'textbox')) return;
        const align = o.originX === 'center' ? 'center' : (o.originX === 'right' ? 'right' : 'left');
        const ang   = o.angle ? `, angle:${+o.angle.toFixed(1)}` : '';
        const text  = (o.text || '').replace(/\n/g, '\\n').replace(/'/g, "\\'");
        texts.push(`  [${i}] '${text}'  ->  x:${r((o.left||0)/cw)}, y:${r((o.top||0)/ch)}, align:'${align}'${ang}`);
      });
    }
  } catch (e) {}

  const out =
`================================================
TEMPLATE: ${tid}  (${tname})
canvas: ${cw}x${ch}
================================================

photoFrames:[
${frames.join('\n')}
 ],

canvasElements text positions (match by text content, update x/y/align/angle only):
${texts.length ? texts.join('\n') : '  (no Fabric text found - was the template loaded fresh?)'}
`;
  console.log('%c=== TEMPLATE DUMP ===', 'background:#1a1a2e;color:#fff;padding:4px 8px;font-weight:700;border-radius:4px');
  console.log(out);
  return out;
};
console.log('%cdumpTemplate() ready', 'color:#4361ee;font-weight:700');

// ══════════════════════════════════════════════════════════════════
// FREEHAND DRAW TOOL — lets the user draw freehand lines/arrows on
// the canvas with the mouse. Supports stroke color, width, line
// style (solid/dashed/dotted), and optional arrowheads.
//
// Storage: each drawn line becomes a `.canvas-elem` with
// dataset.elemType='freehand-line'. The full SVG (including the
// path "d" attribute) lives inside the element so resize/rotate/
// drag/export all "just work" via the existing element pipeline.
// dataset also stores drawColor/drawWidth/drawStyle/drawArrow/
// drawPathRel + drawBaseW/drawBaseH so the inspector panel can
// rebuild the SVG when the user edits properties later.
// ══════════════════════════════════════════════════════════════════

(function injectDrawCSS(){
  if(document.getElementById('freehand-draw-css'))return;
  const s=document.createElement('style');
  s.id='freehand-draw-css';
  s.textContent=`
    body.draw-mode-active{cursor:crosshair !important;}
    body.draw-mode-active #collage-canvas{cursor:crosshair !important;}
    body.draw-mode-active .canvas-elem,
    body.draw-mode-active .upper-canvas,
    body.draw-mode-active .canvas-container{pointer-events:none !important;}
  `;
  document.head.appendChild(s);
})();

const _fdState={
  active:false,
  drawing:false,
  points:[],
  previewSvg:null,
  previewPath:null,
  // Sensible defaults for a newly drawn line. The user customises color,
  // width, line style, and arrow ends via the right-side inspector panel
  // after the line is drawn - same flow as every other element type.
  settings:{color:'#1a1c2e',width:4,style:'solid',arrow:'none'},
};

function startDrawMode(preset){
  // A preset object {color,width,style,arrow} pre-sets the line tool so each
  // sidebar preset (Solid / Arrow / Double Arrow / Dashed / Dotted) draws a
  // line with its specific style. Without a preset, the current defaults stick.
  if(preset&&typeof preset==='object'){
    if(preset.color)_fdState.settings.color=preset.color;
    if(preset.width)_fdState.settings.width=preset.width;
    if(preset.style)_fdState.settings.style=preset.style;
    if(preset.arrow)_fdState.settings.arrow=preset.arrow;
  }
  if(_fdState.active){endDrawMode();return;}
  _fdState.active=true;
  document.body.classList.add('draw-mode-active');
  const canvas=document.getElementById('collage-canvas');
  if(!canvas)return;
  canvas.addEventListener('mousedown',_fdMouseDown,true);
  canvas.addEventListener('mousemove',_fdMouseMove,true);
  document.addEventListener('mouseup',_fdMouseUp,true);
  canvas.addEventListener('touchstart',_fdTouchStart,{passive:false,capture:true});
  canvas.addEventListener('touchmove',_fdTouchMove,{passive:false,capture:true});
  document.addEventListener('touchend',_fdTouchEnd,{passive:false,capture:true});
  if(typeof showToast==='function')showToast('Click and drag on the canvas to draw a line','success');
}

function endDrawMode(){
  if(!_fdState.active)return;
  _fdState.active=false;
  document.body.classList.remove('draw-mode-active');
  if(_fdState.previewSvg){_fdState.previewSvg.remove();}
  _fdState.previewSvg=null;_fdState.previewPath=null;
  _fdState.drawing=false;_fdState.points=[];
  const canvas=document.getElementById('collage-canvas');
  if(canvas){
    canvas.removeEventListener('mousedown',_fdMouseDown,true);
    canvas.removeEventListener('mousemove',_fdMouseMove,true);
    canvas.removeEventListener('touchstart',_fdTouchStart,{capture:true});
    canvas.removeEventListener('touchmove',_fdTouchMove,{capture:true});
  }
  document.removeEventListener('mouseup',_fdMouseUp,true);
  document.removeEventListener('touchend',_fdTouchEnd,{capture:true});
}

function _fdGetCanvasPos(e){
  const canvas=document.getElementById('collage-canvas');
  const rect=canvas.getBoundingClientRect();
  const scaleX=canvasW/rect.width;
  const scaleY=canvasH/rect.height;
  return {x:(e.clientX-rect.left)*scaleX, y:(e.clientY-rect.top)*scaleY};
}

function _fdMouseDown(e){
  if(!_fdState.active)return;
  e.preventDefault();e.stopPropagation();
  _fdState.drawing=true;
  const p=_fdGetCanvasPos(e);
  // Straight line: only ever 2 points - start (anchor at click) and end (drag position).
  _fdState.points=[p,{x:p.x,y:p.y}];
  _fdCreatePreview();
}
function _fdMouseMove(e){
  if(!_fdState.active||!_fdState.drawing)return;
  e.preventDefault();
  // Update only the endpoint - the start point stays anchored at the click.
  _fdState.points[1]=_fdGetCanvasPos(e);
  _fdUpdatePreview();
}
function _fdMouseUp(e){
  if(!_fdState.active||!_fdState.drawing)return;
  e.preventDefault();
  _fdState.drawing=false;
  if(_fdState.points.length<2){
    if(_fdState.previewSvg){_fdState.previewSvg.remove();_fdState.previewSvg=null;_fdState.previewPath=null;}
    _fdState.points=[];
    endDrawMode();
    return;
  }
  _fdFinalize();
  // One-shot: exit draw mode after finalizing the line so the user can
  // immediately edit it via the right-side inspector panel (same flow as
  // every other element type).
  endDrawMode();
}
function _fdTouchStart(e){if(e.touches.length===1){e.preventDefault();_fdMouseDown(e.touches[0]);}}
function _fdTouchMove(e){if(e.touches.length===1){e.preventDefault();_fdMouseMove(e.touches[0]);}}
function _fdTouchEnd(e){_fdMouseUp(e.changedTouches[0]||{preventDefault(){},stopPropagation(){}});}

function _fdCreatePreview(){
  const canvas=document.getElementById('collage-canvas');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
  svg.style.cssText=`position:absolute;left:0;top:0;width:${canvasW}px;height:${canvasH}px;pointer-events:none;z-index:99998;`;
  svg.setAttribute('viewBox',`0 0 ${canvasW} ${canvasH}`);
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('fill','none');
  path.setAttribute('stroke',_fdState.settings.color);
  path.setAttribute('stroke-width',_fdState.settings.width);
  path.setAttribute('stroke-linecap','round');
  path.setAttribute('stroke-linejoin','round');
  path.setAttribute('vector-effect','non-scaling-stroke');
  const dash=_fdDashArray(_fdState.settings.style,_fdState.settings.width);
  if(dash)path.setAttribute('stroke-dasharray',dash);
  svg.appendChild(path);
  _fdState.previewSvg=svg;
  _fdState.previewPath=path;
  canvas.appendChild(svg);
}
function _fdUpdatePreview(){
  if(!_fdState.previewPath)return;
  _fdState.previewPath.setAttribute('d',_fdPointsToPath(_fdState.points));
}

function _fdPointsToPath(pts){
  if(pts.length<2)return '';
  let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for(let i=1;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    d+=` Q ${a.x.toFixed(2)} ${a.y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const last=pts[pts.length-1];
  d+=` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
}

function _fdDashArray(style,width){
  if(style==='dashed')return `${(width*3).toFixed(1)} ${(width*2).toFixed(1)}`;
  if(style==='dotted')return `${(width*0.6).toFixed(2)} ${(width*1.6).toFixed(2)}`;
  return null;
}

function _fdBuildArrowPath(pathD,sw,arrow){
  // Build arrow segments as a separate path string so they render as part of
  // the SVG geometry (always solid, always exactly at the line endpoints).
  // The straight-line path is always shape "M sx sy L ex ey" so we can parse
  // out the start and end coordinates and compute the arrowhead "V" segments.
  if(arrow==='none')return '';
  const m=pathD.match(/M\s+([\d.-]+)\s+([\d.-]+)\s+L\s+([\d.-]+)\s+([\d.-]+)/);
  if(!m)return '';
  const sx=parseFloat(m[1]),sy=parseFloat(m[2]),ex=parseFloat(m[3]),ey=parseFloat(m[4]);
  const dx=ex-sx,dy=ey-sy;
  const len=Math.hypot(dx,dy);
  if(len<1)return '';
  const ux=dx/len,uy=dy/len;          // unit direction along the line
  const px=-uy,py=ux;                  // perpendicular (left of direction)
  const ah=Math.max(8,sw*4);           // arrow head length back along the line
  const wing=Math.max(5,sw*2);         // half-width of the arrowhead
  let out='';
  if(arrow==='end'||arrow==='both'){
    const bx=ex-ux*ah,by=ey-uy*ah;
    const lx=bx+px*wing,ly=by+py*wing;
    const rx=bx-px*wing,ry=by-py*wing;
    out+=` M ${lx.toFixed(2)} ${ly.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)} L ${rx.toFixed(2)} ${ry.toFixed(2)}`;
  }
  if(arrow==='both'){
    const bx=sx+ux*ah,by=sy+uy*ah;
    const lx=bx+px*wing,ly=by+py*wing;
    const rx=bx-px*wing,ry=by-py*wing;
    out+=` M ${lx.toFixed(2)} ${ly.toFixed(2)} L ${sx.toFixed(2)} ${sy.toFixed(2)} L ${rx.toFixed(2)} ${ry.toFixed(2)}`;
  }
  return out.trim();
}

function _fdBuildSvgString(pathD,baseW,baseH,col,sw,style,arrow){
  const dash=_fdDashArray(style,sw);
  const arrowD=_fdBuildArrowPath(pathD,sw,arrow);
  // vector-effect="non-scaling-stroke" keeps the stroke width at exactly `sw`
  // pixels regardless of how much the user resizes the element bounding box.
  // Arrow path is rendered separately so the dash style on the main line
  // doesn't get applied to the arrowhead (always solid).
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${baseW.toFixed(2)} ${baseH.toFixed(2)}" preserveAspectRatio="none" style="width:100%;height:100%;color:${col};overflow:visible">`
    +`<path d="${pathD}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${dash?` stroke-dasharray="${dash}"`:''}/>`
    +(arrowD?`<path d="${arrowD}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`:'')
    +`</svg>`;
}

function _fdFinalize(){
  if(_fdState.previewSvg){_fdState.previewSvg.remove();_fdState.previewSvg=null;_fdState.previewPath=null;}
  const pts=_fdState.points;_fdState.points=[];
  if(pts.length<2)return;
  const s=_fdState.settings;
  const pad=Math.max(s.width*2+(s.arrow!=='none'?14:0),8);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(p=>{
    if(p.x<minX)minX=p.x;if(p.y<minY)minY=p.y;
    if(p.x>maxX)maxX=p.x;if(p.y>maxY)maxY=p.y;
  });
  minX-=pad;minY-=pad;maxX+=pad;maxY+=pad;
  const w=Math.max(40,maxX-minX), h=Math.max(40,maxY-minY);
  const localPts=pts.map(p=>({x:p.x-minX,y:p.y-minY}));
  const d=_fdPointsToPath(localPts);
  const svgStr=_fdBuildSvgString(d,w,h,s.color,s.width,s.style,s.arrow);

  const canvas=document.getElementById('collage-canvas');
  const el=document.createElement('div');
  el.className='canvas-elem';
  el.dataset.elemType='freehand-line';
  el.dataset.elemId='fhl';
  el.dataset.rot=0;
  el.dataset.color=s.color;
  el.dataset.drawColor=s.color;
  el.dataset.drawWidth=String(s.width);
  el.dataset.drawStyle=s.style;
  el.dataset.drawArrow=s.arrow;
  el.dataset.drawPathRel=d;
  el.dataset.drawBaseW=String(w);
  el.dataset.drawBaseH=String(h);
  el.style.cssText=`left:${Math.round(minX)}px;top:${Math.round(minY)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;transform:rotate(0deg);z-index:50;`;
  el.innerHTML=svgStr;

  const del=document.createElement('button');del.className='ce-del';del.innerHTML='<i class="fa-solid fa-xmark"></i>';
  del.onclick=ev=>{ev.stopPropagation();el.remove();if(selectedElem===el){selectedElem=null;if(typeof updateRightPanel==='function')updateRightPanel(null);}if(typeof saveHistory==='function')saveHistory();};
  el.appendChild(del);

  const resize=document.createElement('div');resize.className='ce-resize';
  if(typeof attachResizeHandler==='function')attachResizeHandler(resize,el);
  el.appendChild(resize);

  const rotate=document.createElement('button');rotate.className='ce-rotate';rotate.innerHTML='<i class="fa-solid fa-rotate"></i>';
  if(typeof attachRotateHandler==='function')attachRotateHandler(rotate,el);
  el.appendChild(rotate);

  if(typeof attachDragHandler==='function')attachDragHandler(el);
  el.onclick=ev=>{ev.stopPropagation();if(typeof selectElem==='function')selectElem(el,ev.shiftKey||ev.ctrlKey||ev.metaKey);};
  canvas.appendChild(el);
  if(typeof selectElem==='function')selectElem(el);
  if(typeof saveHistory==='function')saveHistory();
}

// Rebuild the inner SVG for an existing freehand-line element using its
// stored dataset (color, width, style, arrow, path). Called from the
// inspector panel when the user changes a property.
function _fdRebuildElemSvg(el){
  if(!el||el.dataset.elemType!=='freehand-line')return;
  const d=el.dataset.drawPathRel;
  const baseW=parseFloat(el.dataset.drawBaseW)||100;
  const baseH=parseFloat(el.dataset.drawBaseH)||100;
  const col=el.dataset.drawColor||'#e05252';
  const sw=parseFloat(el.dataset.drawWidth)||4;
  const style=el.dataset.drawStyle||'solid';
  const arrow=el.dataset.drawArrow||'none';
  el.dataset.color=col;
  const newSvg=_fdBuildSvgString(d,baseW,baseH,col,sw,style,arrow);
  const oldSvg=el.querySelector('svg');
  if(oldSvg){
    const tmp=document.createElement('div');
    tmp.innerHTML=newSvg;
    oldSvg.replaceWith(tmp.firstElementChild);
  }
}

// Inspector panel for freehand-line — invoked by patching
// updateRightPanelForElem to branch on the new type.
function _fdRenderInspector(el){
  const rp=document.getElementById('rp-body');
  if(!rp)return;
  const col=el.dataset.drawColor||'#1a1c2e';
  const sw=parseFloat(el.dataset.drawWidth)||4;
  const style=el.dataset.drawStyle||'solid';
  const op=Math.round((parseFloat(el.style.opacity)||1)*100);
  const rot=Math.round(parseFloat(el.dataset.rot||0));
  const palette=['#1a1c2e','#e05252','#4956a5','#38b27a','#f5c842','#ffffff','#c97ae8','#ff6b35','#d4af37','#f06292'];
  rp.innerHTML=`
<div class="rp-section-title"><i class="fa-solid fa-pen-nib"></i> Drawn Line</div>
<div class="ep-row"><div class="ep-label">Stroke Color</div>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
  <input type="color" value="${col}" oninput="_fdSetProp('drawColor',this.value)" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border2);cursor:pointer;padding:2px">
  <div style="display:flex;flex-wrap:wrap;gap:4px">${palette.map(c=>`<div class="ep-swatch${col.toLowerCase()===c.toLowerCase()?' active':''}" style="background:${c};${c==='#ffffff'?'border:1.5px solid var(--border2)':''}" onclick="_fdSetProp('drawColor','${c}',this)"></div>`).join('')}</div>
</div></div>
<div class="ep-row"><div class="ep-label">Width: <strong id="rp-fdw-v">${sw}px</strong></div>
<input class="ep-range" type="range" min="1" max="40" value="${sw}" oninput="_fdSetProp('drawWidth',this.value);document.getElementById('rp-fdw-v').textContent=this.value+'px'"></div>
<div class="ep-row"><div class="ep-label">Line Style</div>
<select class="prop-input" onchange="_fdSetProp('drawStyle',this.value)">
  <option value="solid"${style==='solid'?' selected':''}>Solid</option>
  <option value="dashed"${style==='dashed'?' selected':''}>Dashed</option>
  <option value="dotted"${style==='dotted'?' selected':''}>Dotted</option>
</select></div>
<div class="ep-row"><div class="ep-label">Rotation: <strong id="rp-fdr-v">${rot}&#176;</strong></div>
<input class="ep-range" type="range" min="-180" max="180" value="${rot}" oninput="if(selectedElem){selectedElem.style.transform='rotate('+this.value+'deg)';selectedElem.dataset.rot=this.value;}document.getElementById('rp-fdr-v').textContent=this.value+'&#176;';debouncedSave()"></div>
<div class="ep-row"><div class="ep-label">Opacity: <strong id="rp-fdo-v">${op}%</strong></div>
<input class="ep-range" type="range" min="10" max="100" value="${op}" oninput="if(selectedElem)selectedElem.style.opacity=this.value/100;document.getElementById('rp-fdo-v').textContent=this.value+'%';debouncedSave()"></div>
<div class="ep-row" style="display:flex;gap:5px">
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="bringForward(selectedElem)"><i class="fa-solid fa-arrow-up"></i> Forward</button>
  <button class="btn btn-ghost btn-sm" style="flex:1" onclick="sendBackward(selectedElem)"><i class="fa-solid fa-arrow-down"></i> Back</button>
</div>
<div class="ep-row" style="margin-top:5px">
  <button class="btn btn-ghost btn-sm" style="width:100%;color:var(--danger);border-color:var(--danger)" onclick="if(selectedElem){selectedElem.remove();selectedElem=null;updateRightPanel(null);saveHistory()}"><i class="fa-solid fa-trash"></i> Delete Line</button>
</div>`;
}

function _fdSetProp(prop,val,swatchEl){
  // selectedElem is a module-level `let` in this file. The previous code
  // used window.selectedElem which is undefined, so every property change
  // silently no-op'd. Reference the closure-scoped variable instead.
  if(!selectedElem||selectedElem.dataset.elemType!=='freehand-line')return;
  selectedElem.dataset[prop]=String(val);
  _fdRebuildElemSvg(selectedElem);
  if(swatchEl){
    document.querySelectorAll('#rp-body .ep-swatch').forEach(s=>s.classList.remove('active'));
    swatchEl.classList.add('active');
  }
  if(typeof debouncedSave==='function')debouncedSave();
}

// Monkey-patch updateRightPanelForElem to branch on freehand-line.
(function patchInspector(){
  if(typeof updateRightPanelForElem!=='function')return;
  const original=updateRightPanelForElem;
  window.updateRightPanelForElem=function(el){
    if(el&&el.dataset&&el.dataset.elemType==='freehand-line'){
      return _fdRenderInspector(el);
    }
    return original.apply(this,arguments);
  };
})();

// Expose for HTML button onclick.
window.startDrawMode=startDrawMode;
window.endDrawMode=endDrawMode;
window._fdSetProp=_fdSetProp;

