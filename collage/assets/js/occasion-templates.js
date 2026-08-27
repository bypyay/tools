// ══════════════════════════════════════════════════════════════════
// OCCASION TEMPLATES — lazy-loaded after the page is interactive.
// Defines window.OCC_TEMPLATES and notifies tool.js via onOccTemplatesReady().
// All draw helpers (drawGrainGradient, drawBokeh, drawStarburst8, etc.) and the
// STYLE_PALETTES constant come from tool.js, which is loaded first and lives in
// the global scope, so this file can reference them freely.
// ══════════════════════════════════════════════════════════════════

window.OCC_TEMPLATES=[

// ═══════════════════════════════════════════════════════════════
// BLANK STARTER — always shown first regardless of category filter
// ═══════════════════════════════════════════════════════════════

// Blank canvas with one starter photo card. From here the user can use the right
// panel "Add Card" shape buttons to add as many cards (rect / circle / heart /
// star / hexagon / diamond / oval) as they want, then style backgrounds + text
// from the Style tab.
{id:'occ_blank',name:'Blank',cat:'any',badge:null,n:1,
 photoFrames:[
   {rx:.25,ry:.25,rw:.5,rh:.5,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Plain cream with the lightest texture so the canvas doesn't feel sterile.
   drawGrainGradient(ctx,W,H,'#fdfaf3','#f5efe1',180,.04,11);
   // Hairline editorial border so the canvas edge reads cleanly when exported.
   ctx.strokeStyle='rgba(120,100,70,.25)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[],
},

// ═══════════════════════════════════════════════════════════════
// 🎂 BIRTHDAY  (7 templates: 1,2,3,4,5,6,8 photos)
// ═══════════════════════════════════════════════════════════════

// 1 photo
{id:'occ_bday_solo',name:'Gazette',cat:'birthday',badge:'hot',n:1,
 photoFrames:[{rx:.18,ry:.28,rw:.64,rh:.42,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Editorial cream + rust
   drawGrainGradient(ctx,W,H,'#fbf3e4','#f1e2c2',180,.07,11);
   // Top halftone dot band fading down (masthead background)
   drawHalftoneDots(ctx,W*.08,H*.02,W*.84,H*.14,20,'rgba(139,70,40,.55)','down');
   // Thin rule beneath masthead title
   ctx.strokeStyle='#6b2c18';ctx.lineWidth=Math.max(1,S*.0018);
   ctx.beginPath();ctx.moveTo(W*.08,H*.17);ctx.lineTo(W*.92,H*.17);ctx.stroke();
   ctx.lineWidth=Math.max(.5,S*.0008);
   ctx.beginPath();ctx.moveTo(W*.08,H*.18);ctx.lineTo(W*.92,H*.18);ctx.stroke();
   // Starbursts accent in top corners
   drawStarburst8(ctx,W*.1,H*.07,S*.022,'#6b2c18');
   drawStarburst8(ctx,W*.9,H*.07,S*.022,'#6b2c18');
   // Brushstroke underline beneath photo area
   drawBrushStroke(ctx,W*.25,H*.75,W*.75,H*.75,S*.018,'#c85a2e',.6);
   // Editorial border
   drawOrnamentalBorder(ctx,W,H,'rgba(107,44,24,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'THE GAZETTE',x:0.5,y:0.1,align:'center',style:{fontSize:'36px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#6b2c18'}},
   {kind:'text',text:'VOL. 01  /  SPECIAL EDITION  /  BIRTHDAY ISSUE',x:0.5,y:0.22,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#a04520',letterSpacing:'3px'}},
   {kind:'text',text:'Happy Birthday',x:0.5,y:0.85,align:'center',style:{fontSize:'34px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b2c18'}},
   {kind:'text',text:'CELEBRATING ANOTHER YEAR',x:0.5,y:0.94,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#a04520',letterSpacing:'6px'}},
 ]},

// 2 photos
{id:'occ_bday_duo',name:'Birthday Duo',cat:'birthday',badge:null,n:2,
 photoFrames:[{rx:.08,ry:.22,rw:.38,rh:.5,angle:0},{rx:.54,ry:.22,rw:.38,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf3e4','#f1e2c2',180,.06,22);
   drawBokeh(ctx,W,H,24,'#d4a574',3);
   drawBotanicalSpray(ctx,W*.06,H*.9,S*.16,-Math.PI*.45,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.9,S*.16,-Math.PI*.45,'#a3b88a');ctx.restore();
   drawStarburst8(ctx,W*.5,H*.85,S*.022,'rgba(139,70,40,.75)');
   drawOrnamentalBorder(ctx,W,H,'rgba(139,70,40,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'BIRTHDAY BESTIES',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#6b2c18',letterSpacing:'5px'}},
   {kind:'text',text:'cheers to',x:0.5,y:0.9,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#6b2c18',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Another Year',x:0.5,y:0.92,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b2c18'}},
 ]},

// 3 photos
{id:'occ_bday_confetti',name:'Polaroid Birthday',cat:'birthday',badge:'hot',n:3,
 photoFrames:[{rx:.06,ry:.22,rw:.28,rh:.48,angle:-4},{rx:.36,ry:.17,rw:.28,rh:.48,angle:2},{rx:.66,ry:.22,rw:.28,rh:.48,angle:-3}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm vintage paper gradient
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#fbf3e4');g.addColorStop(1,'#f1e5cf');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,42);
   drawBokeh(ctx,W,H,24,'#d4a574',3);
   // Proportional washi tape strips
   drawWashiTape(ctx,W*.2,H*.19,S*.1,S*.022,-Math.PI*.04,'#d4a574');
   drawWashiTape(ctx,W*.5,H*.14,S*.09,S*.02,Math.PI*.03,'#c97a5f');
   drawWashiTape(ctx,W*.8,H*.19,S*.1,S*.022,-Math.PI*.03,'#a3b88a');
   // Bottom botanical sprays
   drawBotanicalSpray(ctx,W*.06,H*.92,S*.16,-Math.PI*.5,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.92,S*.16,-Math.PI*.5,'#a3b88a');ctx.restore();
   // Thin gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'happy',x:0.5,y:0.82,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(139,105,20,.75)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Birthday',x:0.5,y:0.86,align:'center',style:{fontSize:'36px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
   {kind:'text',text:'make a wish, then blow',x:0.5,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(139,105,20,.7)',letterSpacing:'3px'}},
 ]},

// 4 photos - Neon
{id:'occ_bday_neon',name:'Neon Glass',cat:'birthday',badge:'hot',n:4,
 photoFrames:[{rx:.07,ry:.1,rw:.4,rh:.36,angle:0},{rx:.53,ry:.1,rw:.4,rh:.36,angle:0},{rx:.07,ry:.5,rw:.4,rh:.36,angle:0},{rx:.53,ry:.5,rw:.4,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,H);
   g.addColorStop(0,'#1a0d2e');g.addColorStop(1,'#05010d');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Aurora glows
   [['#ff2d8a',W*.25,H*.3,S*.45],['#00d4ff',W*.78,H*.32,S*.4],['#8a4dff',W*.5,H*.72,S*.5]].forEach(([c,x,y,r])=>{
     const rg=ctx.createRadialGradient(x,y,0,x,y,r);
     const rgb=colToRGB(c);
     rg.addColorStop(0,`rgba(${rgb},.32)`);rg.addColorStop(.6,`rgba(${rgb},.1)`);rg.addColorStop(1,`rgba(${rgb},0)`);
     ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
   });
   // Sparkle dots (proportional)
   const rng=seededRng(88);
   for(let i=0;i<60;i++){
     ctx.beginPath();ctx.arc(rng()*W,rng()*H,S*.001+rng()*S*.0025,0,Math.PI*2);
     ctx.fillStyle=`rgba(255,255,255,${.25+rng()*.55})`;ctx.fill();
   }
   // Gradient border
   const bg=ctx.createLinearGradient(0,0,W,0);
   bg.addColorStop(0,'#ff2d8a');bg.addColorStop(.5,'#8a4dff');bg.addColorStop(1,'#00d4ff');
   ctx.strokeStyle=bg;ctx.lineWidth=Math.max(1.5,S*.003);
   const bi=Math.max(12,S*.02);
   ctx.strokeRect(bi,bi,W-bi*2,H-bi*2);
   ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=Math.max(.5,S*.0008);
   ctx.strokeRect(bi+S*.008,bi+S*.008,W-(bi+S*.008)*2,H-(bi+S*.008)*2);
 },
 canvasElements:[
   {kind:'text',text:'celebrating',x:0.5,y:0.89,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,255,255,.55)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Another Year Brighter',x:0.5,y:0.92,align:'center',style:{fontSize:'18px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#fff',letterSpacing:'2px'}},
 ]},

// 5 photos - Golden
{id:'occ_bday_golden',name:'Golden Birthday',cat:'birthday',badge:null,n:5,
 photoFrames:[{rx:.04,ry:.18,rw:.42,rh:.5,angle:0},{rx:.54,ry:.12,rw:.42,rh:.38,angle:0},{rx:.54,ry:.54,rw:.2,rh:.36,angle:0},{rx:.76,ry:.54,rw:.2,rh:.36,angle:0},{rx:.04,ry:.72,rw:.46,rh:.22,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep navy + champagne
   drawGrainGradient(ctx,W,H,'#16091f','#2a1438',180,.04,77);
   drawBokeh(ctx,W,H,22,'#d4af37',77);
   const rng=seededRng(77);
   ctx.fillStyle='rgba(255,215,200,.65)';
   for(let i=0;i<45;i++){const x=rng()*W,y=rng()*H*.65,s=S*.0015+rng()*S*.003;ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();}
   drawMonogram(ctx,'Joy',W*.78,H*.8,H*.2,'rgba(212,175,55,.18)');
   drawStarburst8(ctx,W*.5,H*.05,S*.022,'rgba(212,175,55,.85)');
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.6)',Math.max(12,S*.02));
 },
 canvasElements:[
   {kind:'text',text:'wishing you',x:0.5,y:0.09,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
 ]},

// 6 photos - Pastel Balloon
{id:'occ_bday_pastel',name:'Pastel Dreams',cat:'birthday',badge:null,n:6,
 photoFrames:[{rx:.04,ry:.08,rw:.28,rh:.38,angle:0},{rx:.36,ry:.08,rw:.28,rh:.38,angle:0},{rx:.68,ry:.08,rw:.28,rh:.38,angle:0},
              {rx:.04,ry:.5,rw:.28,rh:.38,angle:0},{rx:.36,ry:.5,rw:.28,rh:.38,angle:0},{rx:.68,ry:.5,rw:.28,rh:.38,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft cream + blush watercolor
   drawGrainGradient(ctx,W,H,'#fef5f0','#f5e1d6',180,.05,33);
   drawWatercolorSplash(ctx,W*.15,H*.5,S*.2,'#e8c5b9',11,.28);
   drawWatercolorSplash(ctx,W*.85,H*.5,S*.2,'#c8d4bc',22,.28);
   drawBotanicalSpray(ctx,W*.04,H*.46,S*.12,-Math.PI*.5,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.46,S*.12,-Math.PI*.5,'#8a9b73');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'pastel',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,70,40,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Birthday Dreams',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
 ]},

// 8 photos - Party Grid
{id:'occ_bday_grid',name:'Birthday Grid',cat:'birthday',badge:null,n:8,
 photoFrames:[{rx:.03,ry:.04,rw:.22,rh:.3,angle:0},{rx:.27,ry:.04,rw:.22,rh:.3,angle:0},{rx:.51,ry:.04,rw:.22,rh:.3,angle:0},{rx:.75,ry:.04,rw:.22,rh:.3,angle:0},
              {rx:.03,ry:.36,rw:.22,rh:.3,angle:0},{rx:.27,ry:.36,rw:.22,rh:.3,angle:0},{rx:.51,ry:.36,rw:.22,rh:.3,angle:0},{rx:.75,ry:.36,rw:.22,rh:.3,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf3e4','#e8d9bc',180,.06,55);
   drawBokeh(ctx,W,H,18,'#d4a574',55);
   // Botanical sprays tucked into bottom-left and bottom-right corners (clear of title area)
   drawBotanicalSpray(ctx,W*.04,H*.99,S*.13,-Math.PI*.42,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.99,S*.13,-Math.PI*.42,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(139,70,40,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'BIRTHDAY MEMORIES',x:0.5,y:0.79,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#a04520',letterSpacing:'5px'}},
   {kind:'text',text:'Moments Worth Remembering',x:0.5,y:0.85,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b2c18'}},
 ]},

// STYLE: Parisian Chic (1 photo)
{id:'occ_bday_parisian',name:'Parisian Chic',cat:'birthday',badge:'new',n:1,
 photoFrames:[{rx:0.051,ry:0.145,rw:0.458,rh:0.569,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.parisian;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.06,11);
   // Thin rule under the title block
   ctx.strokeStyle=P.rule;ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.56,H*.72);ctx.lineTo(W*.94,H*.72);ctx.stroke();
   // Single pressed flower accent
   drawPressedFlower(ctx,W*.82,H*.88,S*.032,5,P.rule);
   // Wax seal with initial
   drawWaxSeal(ctx,W*.2,H*.82,S*.05,'#6b1919','J');
 },
 canvasElements:[
   {kind:'text',text:'NO. 01  /  A BIRTHDAY ESSAY',x:0.94,y:0.06,align:'right',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#6b6b6b',letterSpacing:'2px'}},
   {kind:'text',text:'Joyeux',x:0.56,y:0.51,style:{fontSize:'58px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#111111'}},
   {kind:'text',text:'Anniversaire',x:0.56,y:0.63,style:{fontSize:'52px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#111111'}},
   {kind:'text',text:'PARIS  /  SPRING 2026',x:0.56,y:0.77,style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8a8578',letterSpacing:'3px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 💍 ANNIVERSARY (5 templates: 1,2,3,4,6 photos)
// ═══════════════════════════════════════════════════════════════

// 1 photo
{id:'occ_ann_solo',name:'Heritage',cat:'anniversary',badge:'hot',n:1,
 photoFrames:[{rx:.26,ry:.22,rw:.48,rh:.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Burgundy + cream (2026 heritage palette)
   drawGrainGradient(ctx,W,H,'#f7ebd0','#eedfbd',180,.06,14);
   // Large burgundy monogram "&" in background
   drawMonogram(ctx,'&',W*.5,H*.5,H*.55,'rgba(107,25,25,.08)');
   // Art deco stepped frame around photo
   drawDecoFrame(ctx,W*.26-S*.015,H*.22-S*.015,W*.48+S*.03,H*.48+S*.03,'rgba(107,25,25,.65)',Math.max(1.4,S*.0022));
   // Halftone dot accents fading from edges
   drawHalftoneDots(ctx,W*.04,H*.15,W*.18,H*.6,12,'rgba(107,25,25,.35)','right');
   ctx.save();ctx.scale(-1,1);drawHalftoneDots(ctx,-W*.22,H*.15,W*.18,H*.6,12,'rgba(107,25,25,.35)','right');ctx.restore();
   // Corner 8-point starbursts
   [[W*.08,H*.08],[W*.92,H*.08],[W*.08,H*.92],[W*.92,H*.92]].forEach(([x,y])=>
     drawStarburst8(ctx,x,y,S*.018,'rgba(107,25,25,.7)'));
   // Editorial border
   drawOrnamentalBorder(ctx,W,H,'rgba(107,25,25,.6)',Math.max(12,S*.02));
 },
 canvasElements:[
   {kind:'text',text:'celebrating',x:0.5,y:0.82,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(139,69,55,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Love Story',x:0.5,y:0.85,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
   {kind:'text',text:'A N N I V E R S A R Y',x:0.5,y:0.92,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(180,140,60,.85)',letterSpacing:'8px'}},
 ]},

// 2 photos - Rose
{id:'occ_ann_rose',name:'Rose Anniversary',cat:'anniversary',badge:'hot',n:2,
 photoFrames:[{rx:.08,ry:.22,rw:.38,rh:.5,angle:0},{rx:.54,ry:.22,rw:.38,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusty rose gradient wash
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#fce7e5');g.addColorStop(1,'#f0cdc9');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Watercolor blobs for organic texture
   drawWatercolorBlob(ctx,W*.18,H*.12,S*.25,'#d48a7a',.3);
   drawWatercolorBlob(ctx,W*.82,H*.88,S*.27,'#b8604a',.28);
   // Corner botanical sprays
   drawBotanicalSpray(ctx,W*.05,H*.08,S*.18,-Math.PI*.1,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.95,H*.08,S*.18,-Math.PI*.1,'#8a9b73');ctx.restore();
   ctx.save();ctx.scale(1,-1);drawBotanicalSpray(ctx,W*.05,-H*.92,S*.18,-Math.PI*.1,'#8a9b73');ctx.restore();
   ctx.save();ctx.scale(-1,-1);drawBotanicalSpray(ctx,-W*.95,-H*.92,S*.18,-Math.PI*.1,'#8a9b73');ctx.restore();
   // Scripted "Forever" watermark between photos
   drawScriptWatermark(ctx,'Forever',W*.5,H*.1,H*.13,'rgba(139,69,55,.4)');
   // Rose accent at the bottom center
   drawRose(ctx,W*.5,H*.8,S*.07,0,'#c97a5f');
   drawRose(ctx,W*.42,H*.84,S*.05,.4,'#d8a48f');
   drawRose(ctx,W*.58,H*.84,S*.05,-.4,'#d8a48f');
   // Elegant gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'happy anniversary',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,55,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Forever Story',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
 ]},

// 3 photos - Silver
{id:'occ_ann_silver',name:'Silver Jubilee',cat:'anniversary',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.48,angle:0},{rx:.37,ry:.22,rw:.26,rh:.48,angle:0},{rx:.66,ry:.22,rw:.26,rh:.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a2535','#0e1520',180,.04,25);
   drawBokeh(ctx,W,H,20,'#c0c0c0',25);
   const rng=seededRng(25);
   ctx.fillStyle='rgba(220,220,220,.7)';
   for(let i=0;i<50;i++){const x=rng()*W,y=rng()*H,s=S*.001+rng()*S*.003;ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();}
   drawMonogram(ctx,'25',W*.5,H*.48,H*.35,'rgba(192,192,192,.15)');
   drawChevronBorder(ctx,W*.18,H*.05,W*.64,0,S*.022,'rgba(192,192,192,.6)');
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(192,192,192,.6)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'celebrating',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(220,220,220,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Twenty-Five Years',x:0.5,y:0.866,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8e8e8'}},
   {kind:'text',text:'S I L V E R   A N N I V E R S A R Y',x:0.5,y:0.93,align:'center',style:{fontSize:'8px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(220,220,220,.7)',letterSpacing:'5px'}},
 ]},

// 4 photos - Elegant dark
{id:'occ_ann_elegant',name:'Elegant Years',cat:'anniversary',badge:null,n:4,
 photoFrames:[{rx:.06,ry:.08,rw:.4,rh:.36,angle:0},{rx:.54,ry:.08,rw:.4,rh:.36,angle:0},{rx:.06,ry:.5,rw:.4,rh:.36,angle:0},{rx:.54,ry:.5,rw:.4,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f7ebd0','#eedfbd',180,.06,99);
   drawWatercolorSplash(ctx,W*.2,H*.15,S*.2,'#6b1919',11,.22);
   drawWatercolorSplash(ctx,W*.8,H*.85,S*.22,'#a83333',22,.22);
   drawMonogram(ctx,'&',W*.5,H*.48,H*.35,'rgba(107,25,25,.15)');
   drawHalftoneDots(ctx,W*.02,H*.42,W*.06,H*.16,10,'rgba(107,25,25,.4)','right');
   ctx.save();ctx.scale(-1,1);drawHalftoneDots(ctx,-W*.08,H*.42,W*.06,H*.16,10,'rgba(107,25,25,.4)','right');ctx.restore();
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(107,25,25,.65)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'elegant',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(107,25,25,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Years of Love',x:0.5,y:0.93,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b1919'}},
 ]},

// 6 photos - Floral
{id:'occ_ann_floral',name:'Floral Journey',cat:'anniversary',badge:null,n:6,
 photoFrames:[{rx:0.04,ry:0.08,rw:0.28,rh:0.38,angle:0},{rx:0.361,ry:0.051,rw:0.28,rh:0.38,angle:0},{rx:0.68,ry:0.08,rw:0.28,rh:0.38,angle:0},{rx:0.04,ry:0.5,rw:0.28,rh:0.38,angle:0},{rx:0.361,ry:0.52,rw:0.28,rh:0.38,angle:0},{rx:0.68,ry:0.5,rw:0.28,rh:0.38,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fce7e5','#f0cdc9',180,.05,62);
   drawWatercolorSplash(ctx,W*.15,H*.5,S*.2,'#c97a5f',11,.28);
   drawWatercolorSplash(ctx,W*.85,H*.5,S*.2,'#b8604a',22,.26);
   drawBotanicalSpray(ctx,W*.03,H*.46,S*.14,-Math.PI*.5,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.46,S*.14,-Math.PI*.5,'#8a9b73');ctx.restore();
   drawRose(ctx,W*.5,H*.48,S*.035,0,'#c85a4a');
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'our journey',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,55,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Blooming Together',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
 ]},

// STYLE: Art Deco Luxe (2 photos)
{id:'occ_ann_deco',name:'Art Deco Luxe',cat:'anniversary',badge:'new',n:2,
 photoFrames:[{rx:.1,ry:.2,rw:.36,rh:.5,angle:0},{rx:.54,ry:.2,rw:.36,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.art_deco_luxe;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.04,22);
   // Background sunburst
   drawSunburst(ctx,W*.5,H*.5,S*.1,S*.6,48,'rgba(212,175,55,.06)');
   drawBokeh(ctx,W,H,18,P.accent,22);
   // Corner deco fans
   drawDecoFan(ctx,0,0,S*.28,14,0,Math.PI*.5,P.accent);
   drawDecoFan(ctx,W,0,S*.28,14,Math.PI*.5,Math.PI,P.accent);
   drawDecoFan(ctx,0,H,S*.28,14,-Math.PI*.5,0,P.accent);
   drawDecoFan(ctx,W,H,S*.28,14,Math.PI,Math.PI*1.5,P.accent);
   // Big monogram "&" between photos
   drawMonogram(ctx,'&',W*.5,H*.45,H*.28,`rgba(212,175,55,.4)`);
   // Chevron accents
   drawChevronBorder(ctx,W*.2,H*.04,W*.6,0,S*.025,P.accent);
   // Ziggurat frame
   drawZiggurat(ctx,S*.02,S*.02,W-S*.04,H-S*.04,P.accent,3,Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'celebrating',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#d4af37',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'A Golden Union',x:0.5,y:0.86,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0c858'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 💒 WEDDING (5 templates: 1,2,3,4,6 photos)
// ═══════════════════════════════════════════════════════════════

// 1 photo
{id:'occ_wed_solo',name:'Vow',cat:'wedding',badge:'hot',n:1,
 photoFrames:[{rx:0.311,ry:0.23,rw:0.376,rh:0.49,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sage-cream gradient (2026 palette: sage + ivory)
   drawGrainGradient(ctx,W,H,'#f5efe0','#e8dcc0',180,.05,77);
   // Elegant arch frame around the portrait
   ctx.save();
   ctx.strokeStyle='rgba(138,155,115,.7)';ctx.lineWidth=Math.max(1.2,S*.0025);
   const ax=W*.26-S*.012,ay=H*.18-S*.012,aw=W*.48+S*.024,ah=H*.52+S*.024;
   ctx.beginPath();
   ctx.moveTo(ax,ay+ah);ctx.lineTo(ax,ay+aw*.42);
   ctx.arc(ax+aw*.5,ay+aw*.42,aw*.5,Math.PI,0,false);
   ctx.lineTo(ax+aw,ay+ah);ctx.stroke();
   ctx.strokeStyle='rgba(180,140,60,.4)';ctx.lineWidth=Math.max(.6,S*.001);
   const ix=ax+S*.008,iy=ay+S*.008,iw=aw-S*.016,ih=ah-S*.016;
   ctx.beginPath();
   ctx.moveTo(ix,iy+ih);ctx.lineTo(ix,iy+iw*.42);
   ctx.arc(ix+iw*.5,iy+iw*.42,iw*.5,Math.PI,0,false);
   ctx.lineTo(ix+iw,iy+ih);ctx.stroke();
   ctx.restore();
   // Full botanical wreath from corners (denser sage sprays)
   drawBotanicalSpray(ctx,W*.1,H*.12,S*.3,-Math.PI*.18,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.9,H*.12,S*.3,-Math.PI*.18,'#8a9b73');ctx.restore();
   // Bottom rose cluster + botanical sprigs
   drawRose(ctx,W*.5,H*.81,S*.065,0,'#c97a5f');
   drawRose(ctx,W*.43,H*.84,S*.048,.4,'#d8a48f');
   drawRose(ctx,W*.57,H*.84,S*.048,-.4,'#d8a48f');
   drawBotanicalSpray(ctx,W*.36,H*.85,S*.12,Math.PI*.1,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.64,H*.85,S*.12,Math.PI*.1,'#a3b88a');ctx.restore();
   // Gold border + inner hairline
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'THE WEDDING OF',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#8b6914',letterSpacing:'5px'}},
   {kind:'text',text:'the',x:0.5,y:0.82,align:'center',style:{fontSize:'16px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'400',fontStyle:'italic',color:'#8b6914'}},
   {kind:'text',text:'Wedding',x:0.5,y:0.89,align:'center',style:{fontSize:'32px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b6914'}},
   {kind:'text',text:'OF OUR DREAMS',x:0.5,y:0.95,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8b6914',letterSpacing:'6px'}},
 ]},

// 2 photos - Classic
{id:'occ_wed_classic',name:'Classic Wedding',cat:'wedding',badge:'hot',n:2,
 photoFrames:[{rx:0.039,ry:0.225,rw:0.38,rh:0.54,angle:0},{rx:0.595,ry:0.164,rw:0.37,rh:0.536,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm ivory linen wash
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#fbf6ea');g.addColorStop(1,'#f3ead4');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.05,42);
   // Large botanical sprays from top corners
   drawBotanicalSpray(ctx,W*.07,H*.12,S*.24,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.93,H*.12,S*.24,-Math.PI*.15,'#8a9b73');ctx.restore();
   // Bottom rose cluster center
   drawRose(ctx,W*.5,H*.8,S*.07,0,'#c97a5f');
   drawRose(ctx,W*.42,H*.84,S*.05,.4,'#d8a48f');
   drawRose(ctx,W*.58,H*.84,S*.05,-.4,'#d8a48f');
   // Thin gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'&',x:0.5,y:0.45,align:'center',style:{fontSize:'140px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'rgba(139,105,20,.3)'}},
   {kind:'text',text:'celebrating',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8b6914',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Mr. & Mrs.',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b6914'}},
 ]},

// 3 photos - Boho
{id:'occ_wed_boho',name:'Boho Wedding',cat:'wedding',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.48,angle:0},{rx:.37,ry:.22,rw:.26,rh:.48,angle:0},{rx:.66,ry:.22,rw:.26,rh:.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm terracotta + cream boho palette
   drawGrainGradient(ctx,W,H,'#f5ede0','#ecd9b8',180,.06,55);
   drawWatercolorSplash(ctx,W*.18,H*.12,S*.22,'#c49a6c',11,.3);
   drawWatercolorSplash(ctx,W*.82,H*.88,S*.24,'#b85c3c',22,.28);
   drawBotanicalSpray(ctx,W*.03,H*.12,S*.22,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.12,S*.22,-Math.PI*.15,'#8a9b73');ctx.restore();
   drawBotanicalSpray(ctx,W*.06,H*.9,S*.16,-Math.PI*.5,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.9,S*.16,-Math.PI*.5,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(122,92,56,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'WILD & FREE',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(122,92,56,.9)',letterSpacing:'6px'}},
   {kind:'text',text:'bohemian soul',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(122,92,56,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Bohemian Love',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#7a5c38'}},
   {kind:'text',text:'F O R E V E R   T O G E T H E R',x:0.5,y:0.92,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(122,92,56,.75)',letterSpacing:'5px'}},
 ]},

// 4 photos - Rustic
{id:'occ_wed_rustic',name:'Rustic Wedding',cat:'wedding',badge:null,n:4,
 photoFrames:[{rx:.06,ry:.08,rw:.4,rh:.36,angle:0},{rx:.54,ry:.08,rw:.4,rh:.36,angle:0},{rx:.06,ry:.5,rw:.4,rh:.36,angle:0},{rx:.54,ry:.5,rw:.4,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f0e8d8','#d4c5a9',180,.08,34);
   drawMonogram(ctx,'&',W*.5,H*.48,H*.32,'rgba(93,64,55,.14)');
   drawBotanicalSpray(ctx,W*.04,H*.1,S*.2,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.1,S*.2,-Math.PI*.15,'#8a9b73');ctx.restore();
   drawBotanicalSpray(ctx,W*.04,H*.9,S*.2,Math.PI*.15,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.9,S*.2,Math.PI*.15,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(93,64,55,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'rustic charm',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(93,64,55,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Just Married',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d4037'}},
 ]},

// 6 photos - Elegant night
{id:'occ_wed_night',name:'Wedding Night',cat:'wedding',badge:null,n:6,
 photoFrames:[{rx:.04,ry:.08,rw:.28,rh:.38,angle:0},{rx:.36,ry:.08,rw:.28,rh:.38,angle:0},{rx:.68,ry:.08,rw:.28,rh:.38,angle:0},
              {rx:.04,ry:.5,rw:.28,rh:.38,angle:0},{rx:.36,ry:.5,rw:.28,rh:.38,angle:0},{rx:.68,ry:.5,rw:.28,rh:.38,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#0d1528','#03060d',180,.04,77);
   drawBokeh(ctx,W,H,22,'#d4af37',77);
   const rng=seededRng(77);
   ctx.fillStyle='rgba(255,235,200,.7)';
   for(let i=0;i<55;i++){const x=rng()*W,y=rng()*H,s=S*.001+rng()*S*.003;ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();}
   drawMonogram(ctx,'Forever',W*.5,H*.48,H*.14,'rgba(212,175,55,.14)');
   drawStarburst8(ctx,W*.5,H*.04,S*.02,'rgba(212,175,55,.85)');
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'a night to remember',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Just Married',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0c858'}},
 ]},

// STYLE: Editorial Minimal (Kinfolk-inspired) (1 photo)
{id:'occ_wed_editorial',name:'Editorial Minimal',cat:'wedding',badge:'new',n:1,
 photoFrames:[{rx:0.323,ry:0.101,rw:0.599,rh:0.568,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.editorial_minimal;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.06,77);
   // Hairline rule under the title block
   ctx.strokeStyle=P.rule;ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.08,H*.9);ctx.lineTo(W*.5,H*.9);ctx.stroke();
   // Tiny botanical in the bottom-right margin
   drawPressedFlower(ctx,W*.9,H*.77,S*.028,5,P.rule);
 },
 canvasElements:[
   {kind:'text',text:'CHAPTER ONE',x:0.92,y:0.07,align:'right',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#1a1a1a',letterSpacing:'3px'}},
   {kind:'text',text:'the',x:0.08,y:0.68,style:{fontSize:'52px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#1a1a1a'}},
   {kind:'text',text:'Wedding',x:0.08,y:0.78,style:{fontSize:'62px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#1a1a1a'}},
   {kind:'text',text:'A QUIET CELEBRATION OF LOVE  /  SPRING 2026',x:0.08,y:0.94,style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8a8578',letterSpacing:'2px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🎄 HOLIDAY (6 templates: Christmas, NewYear, Valentine, Halloween, Diwali, Eid)
// ═══════════════════════════════════════════════════════════════

// Christmas - 3 photos
{id:'occ_xmas_magic',name:'Christmas Magic',cat:'holiday',badge:'hot',n:3,
 photoFrames:[{rx:0.076,ry:0.264,rw:0.26,rh:0.48,angle:0},{rx:0.37,ry:0.226,rw:0.26,rh:0.48,angle:0},{rx:0.665,ry:0.263,rw:0.26,rh:0.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#1e3a2c');g.addColorStop(1,'#14281f');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawWatercolorBlob(ctx,W*.5,H*.5,S*.6,'#f8f1dd',.18);
   drawFilmGrain(ctx,W,H,.06,25);
   // Pine sprigs (proportional)
   drawPineSprig(ctx,W*.08,H*.16,S*.2,-Math.PI*.15,'#c9b87a');
   drawPineSprig(ctx,W*.92,H*.16,S*.2,Math.PI*.15,'#c9b87a');
   drawPineSprig(ctx,W*.08,H*.9,S*.16,-Math.PI*.5,'#c9b87a');
   drawPineSprig(ctx,W*.92,H*.9,S*.16,Math.PI*.5,'#c9b87a');
   drawBerryCluster(ctx,W*.12,H*.18,S*.05,'#b83a3a');
   drawBerryCluster(ctx,W*.88,H*.18,S*.05,'#b83a3a');
   drawScriptWatermark(ctx,'Merry',W*.5,H*.12,H*.12,'rgba(201,184,122,.4)');
   drawOrnamentalBorder(ctx,W,H,'rgba(201,184,122,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'wishing you',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(201,184,122,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'A Merry Christmas',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f8f1dd'}},
   {kind:'text',text:'A N D   A   H A P P Y   N E W   Y E A R',x:0.5,y:0.93,align:'center',style:{fontSize:'8px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(201,184,122,.8)',letterSpacing:'4px'}},
 ]},

// Christmas - 6 photos
{id:'occ_xmas_grid',name:'Christmas Memories',cat:'holiday',badge:null,n:6,
 photoFrames:[{rx:.04,ry:.06,rw:.28,rh:.36,angle:0},{rx:.36,ry:.06,rw:.28,rh:.36,angle:0},{rx:.68,ry:.06,rw:.28,rh:.36,angle:0},
              {rx:.04,ry:.46,rw:.28,rh:.36,angle:0},{rx:.36,ry:.46,rw:.28,rh:.36,angle:0},{rx:.68,ry:.46,rw:.28,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep forest + cream (modern Christmas)
   drawGrainGradient(ctx,W,H,'#1e3a2c','#14281f',180,.05,35);
   drawWatercolorBlob(ctx,W*.5,H*.9,S*.5,'#f8f1dd',.15);
   drawPineSprig(ctx,W*.06,H*.86,S*.16,-Math.PI*.35,'#c9b87a');
   drawPineSprig(ctx,W*.94,H*.86,S*.16,Math.PI*.35,'#c9b87a');
   drawBerryCluster(ctx,W*.12,H*.88,S*.035,'#b83a3a');
   drawBerryCluster(ctx,W*.88,H*.88,S*.035,'#b83a3a');
   drawOrnamentalBorder(ctx,W,H,'rgba(201,184,122,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'our',x:0.5,y:0.88,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(201,184,122,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Christmas Memories',x:0.5,y:0.91,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f8f1dd'}},
 ]},

// New Year - 4 photos
{id:'occ_ny_gala',name:'Gala',cat:'holiday',badge:'hot',n:4,
 photoFrames:[{rx:.09,ry:.12,rw:.38,rh:.34,angle:0},{rx:.53,ry:.12,rw:.38,rh:.34,angle:0},{rx:.09,ry:.52,rw:.38,rh:.34,angle:0},{rx:.53,ry:.52,rw:.38,rh:.34,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep ink-navy radial
   const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,H);
   g.addColorStop(0,'#0d1528');g.addColorStop(1,'#03060d');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Art-deco sunburst in the center (subtle, behind 2026)
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.5,36,'rgba(212,175,55,.08)');
   // Gold bokeh + starfield
   drawBokeh(ctx,W,H,22,'#d4af37',9);
   const rng=seededRng(99);
   ctx.fillStyle='rgba(255,235,200,.7)';
   for(let i=0;i<55;i++){
     const x=rng()*W,y=rng()*H,s=S*.001+rng()*S*.003;
     ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
   }
   // Massive 2026 watermark
   drawMonogram(ctx,'2026',W*.5,H*.49,H*.4,'rgba(212,175,55,.14)',
     `900 ${H*.4}px 'Playfair Display','Fraunces',serif`);
   // 8-point starburst accents near corners
   [[W*.5,H*.05,S*.025],[W*.05,H*.5,S*.02],[W*.95,H*.5,S*.02],[W*.5,H*.95,S*.025]].forEach(([x,y,s])=>
     drawStarburst8(ctx,x,y,s,'rgba(212,175,55,.85)'));
   // Thin chevron accents at top + bottom
   drawChevronBorder(ctx,W*.2,H*.04,W*.6,0,S*.025,'rgba(212,175,55,.6)');
   // Deco frame border
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(212,175,55,.7)',Math.max(1.5,S*.0025));
 },
 canvasElements:[
   {kind:'text',text:'cheers to',x:0.5,y:0.9,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'A New Beginning',x:0.5,y:0.93,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0c858'}},
 ]},

// Valentine - 2 photos
{id:'occ_val_love',name:'Bouquet',cat:'holiday',badge:'hot',n:2,
 photoFrames:[{rx:.1,ry:.22,rw:.36,rh:.5,angle:0},{rx:.54,ry:.22,rw:.36,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusty rose + terracotta (2026 palette)
   drawGrainGradient(ctx,W,H,'#f5e1d6','#e8c5b9',180,.05,14);
   // Organic watercolor splashes (upgraded from blob)
   drawWatercolorSplash(ctx,W*.15,H*.14,S*.22,'#c85a4a',11,.3);
   drawWatercolorSplash(ctx,W*.85,H*.86,S*.24,'#b87b73',22,.28);
   // Brush-stroke heart watermark in center (painterly)
   ctx.save();ctx.globalAlpha=.18;
   drawHeart(ctx,W*.5,H*.5,S*.3,'#a3493d');
   ctx.restore();
   // Dense botanical wreath around bottom (roses + sage)
   drawRose(ctx,W*.5,H*.82,S*.065,0,'#c85a4a');
   drawRose(ctx,W*.43,H*.85,S*.048,.4,'#d88377');
   drawRose(ctx,W*.57,H*.85,S*.048,-.4,'#d88377');
   drawRose(ctx,W*.38,H*.88,S*.035,.2,'#b87b73');
   drawRose(ctx,W*.62,H*.88,S*.035,-.2,'#b87b73');
   drawBotanicalSpray(ctx,W*.32,H*.84,S*.14,Math.PI*.1,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.68,H*.84,S*.14,Math.PI*.1,'#8a9b73');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'MY FOREVER LOVE',x:0.5,y:0.1,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#8b4538',letterSpacing:'5px'}},
   {kind:'text',text:'Be My Valentine',x:0.5,y:0.92,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
 ]},

// Halloween - 3 photos
{id:'occ_hal_spooky',name:'Moody Halloween',cat:'holiday',badge:'hot',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.48,angle:0},{rx:.37,ry:.22,rw:.26,rh:.48,angle:0},{rx:.66,ry:.22,rw:.26,rh:.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Charcoal gradient
   const g=ctx.createRadialGradient(W*.5,H*.3,0,W*.5,H*.5,H);
   g.addColorStop(0,'#2a1f18');g.addColorStop(1,'#0f0a07');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Amber spotlight
   const sg=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,H*.7);
   sg.addColorStop(0,'rgba(212,130,40,.22)');sg.addColorStop(1,'transparent');
   ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
   // Crescent moon top-right (proportional)
   drawCrescent(ctx,W*.88,H*.14,S*.08,'rgba(240,200,120,.85)');
   // Bare branches silhouettes
   drawBareBranch(ctx,W*.04,H*.08,S*.26,Math.PI*.2,'rgba(80,50,30,.9)');
   ctx.save();ctx.scale(-1,1);drawBareBranch(ctx,-W*.96,H*.88,S*.26,Math.PI*.2,'rgba(80,50,30,.9)');ctx.restore();
   // Starfield (proportional)
   const rng=seededRng(66);
   ctx.fillStyle='rgba(240,200,120,.6)';
   for(let i=0;i<32;i++){
     const x=rng()*W,y=rng()*H*.5,s=S*.0015+rng()*S*.002;
     ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
   }
   drawScriptWatermark(ctx,'hallows',W*.5,H*.82,H*.1,'rgba(212,130,40,.18)');
   drawOrnamentalBorder(ctx,W,H,'rgba(212,130,40,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'a most',x:0.5,y:0.89,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,130,40,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Haunting Evening',x:0.5,y:0.92,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8a958'}},
 ]},

// Diwali - 2 photos
{id:'occ_diwali_fest',name:'Diwali Festival',cat:'holiday',badge:'new',n:2,
 photoFrames:[{rx:.1,ry:.22,rw:.36,rh:.5,angle:0},{rx:.54,ry:.22,rw:.36,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep amber + marigold (warm sophisticated palette)
   drawGrainGradient(ctx,W,H,'#2a1506','#1a0a02',180,.04,108);
   // Large radial glow behind
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.55,48,'rgba(245,175,40,.1)');
   // Gold bokeh + warm embers
   drawBokeh(ctx,W,H,24,'#f5af28',108);
   const rng=seededRng(108);
   ctx.fillStyle='rgba(255,200,100,.7)';
   for(let i=0;i<50;i++){const x=rng()*W,y=rng()*H,s=S*.001+rng()*S*.003;ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();}
   // Script watermark
   drawScriptWatermark(ctx,'Diwali',W*.5,H*.12,H*.11,'rgba(245,175,40,.3)');
   // 8-point stars for diyas
   [[W*.12,H*.82,S*.022],[W*.88,H*.82,S*.022],[W*.5,H*.05,S*.025]].forEach(([x,y,s])=>
     drawStarburst8(ctx,x,y,s,'rgba(245,175,40,.9)'));
   drawOrnamentalBorder(ctx,W,H,'rgba(245,175,40,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'festival of',x:0.5,y:0.88,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(245,175,40,.9)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Lights & Joy',x:0.5,y:0.91,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f5af28'}},
 ]},

// STYLE: Art Nouveau (2 photos - Valentine/romance)
{id:'occ_hol_nouveau',name:'Art Nouveau',cat:'holiday',badge:'new',n:2,
 photoFrames:[{rx:0.051,ry:0.251,rw:0.36,rh:0.5,angle:0,shape:'rect'},{rx:0.593,ry:0.245,rw:0.36,rh:0.5,angle:0,shape:'rect'}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.art_nouveau;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.05,14);
   // Faint stained-glass panel grid as background structure
   ctx.save();ctx.globalAlpha=.18;
   drawStainedGlass(ctx,S*.04,S*.04,W-S*.08,H-S*.08,3,4,P.rule,null);
   ctx.restore();
   // Whiplash curves cascading from top corners (signature art-nouveau motif)
   drawWhiplashCurve(ctx,W*.04,H*.05,W*.32,H*.22,P.accent,Math.max(1.8,S*.004));
   drawWhiplashCurve(ctx,W*.96,H*.05,W*.68,H*.22,P.accent,Math.max(1.8,S*.004));
   drawWhiplashCurve(ctx,W*.04,H*.95,W*.32,H*.78,P.accent,Math.max(1.8,S*.004));
   drawWhiplashCurve(ctx,W*.96,H*.95,W*.68,H*.78,P.accent,Math.max(1.8,S*.004));
   // Pressed-flower accents at curve terminals (iris-inspired)
   drawPressedFlower(ctx,W*.05,H*.08,S*.035,5,P.accent);
   drawPressedFlower(ctx,W*.95,H*.08,S*.035,5,P.accent);
   drawPressedFlower(ctx,W*.05,H*.92,S*.03,5,P.soft);
   drawPressedFlower(ctx,W*.95,H*.92,S*.03,5,P.soft);
   // Monogram watermark between photos
   drawMonogram(ctx,'&',W*.5,H*.45,H*.22,`rgba(74,90,60,.14)`);
   drawOrnamentalBorder(ctx,W,H,P.rule,Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'in bloom',x:0.5,y:0.85,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(74,90,60,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Everlasting Love',x:0.5,y:0.89,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#4a5a3c'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 👶 BABY (5 templates: shower, boy/girl, 1, 6 photos)
// ═══════════════════════════════════════════════════════════════

// Baby Shower - 3 photos
{id:'occ_baby_shower',name:'Pressed Flowers',cat:'baby',badge:'hot',n:3,
 photoFrames:[{rx:.08,ry:.26,rw:.26,rh:.4,angle:0},{rx:.37,ry:.26,rw:.26,rh:.4,angle:0},{rx:.66,ry:.26,rw:.26,rh:.4,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft sage + blush (wellness-focused 2026 palette)
   drawGrainGradient(ctx,W,H,'#f5efe6','#ece4d6',180,.05,33);
   // Large organic watercolor splashes in sage + blush
   drawWatercolorSplash(ctx,W*.18,H*.12,S*.22,'#c8d4bc',11,.35);
   drawWatercolorSplash(ctx,W*.82,H*.14,S*.2,'#e8c5b9',17,.32);
   drawWatercolorSplash(ctx,W*.5,H*.88,S*.25,'#d4c5a9',23,.28);
   // Botanical wreath -- denser than before
   drawBotanicalSpray(ctx,W*.03,H*.1,S*.22,-Math.PI*.12,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.1,S*.22,-Math.PI*.12,'#8a9b73');ctx.restore();
   drawBotanicalSpray(ctx,W*.06,H*.72,S*.18,-Math.PI*.35,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.72,S*.18,-Math.PI*.35,'#a3b88a');ctx.restore();
   // Small pressed-flower rose accents
   drawRose(ctx,W*.14,H*.22,S*.035,.3,'#b87b73');
   drawRose(ctx,W*.86,H*.22,S*.035,-.3,'#b87b73');
   // Hand-drawn sparkle accents
   [[W*.5,H*.2],[W*.28,H*.74],[W*.72,H*.74]].forEach(([x,y])=>
     drawStarburst8(ctx,x,y,S*.014,'rgba(139,105,20,.55)'));
   drawOrnamentalBorder(ctx,W,H,'rgba(200,160,100,.45)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'BABY ON THE WAY',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(139,105,20,.9)',letterSpacing:'6px'}},
   {kind:'text',text:'welcoming',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(170,100,90,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Little One',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#9c4d44'}},
   {kind:'text',text:'B A B Y   S H O W E R',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(170,100,90,.7)',letterSpacing:'6px'}},
 ]},

// Baby Boy - 2 photos
{id:'occ_baby_boy',name:'Baby Boy',cat:'baby',badge:'new',n:2,
 photoFrames:[{rx:0.056,ry:0.25,rw:0.34,rh:0.501,angle:0},{rx:0.621,ry:0.249,rw:0.324,rh:0.505,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Muted dusty-blue + cream (wellness palette)
   drawGrainGradient(ctx,W,H,'#e6ecf0','#c7d3de',180,.05,44);
   // Watercolor wash
   drawWatercolorSplash(ctx,W*.18,H*.12,S*.22,'#7a8ca0',11,.3);
   drawWatercolorSplash(ctx,W*.82,H*.88,S*.22,'#8a9bad',22,.28);
   // Botanical wreath
   drawBotanicalSpray(ctx,W*.04,H*.1,S*.22,-Math.PI*.12,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.1,S*.22,-Math.PI*.12,'#8a9b73');ctx.restore();
   // 8-point star accents
   [[W*.5,H*.2,S*.015],[W*.15,H*.78,S*.013],[W*.85,H*.78,S*.013]].forEach(([x,y,s])=>
     drawStarburst8(ctx,x,y,s,'rgba(60,80,100,.75)'));
   drawOrnamentalBorder(ctx,W,H,'rgba(60,80,100,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'LITTLE PRINCE',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.95)',letterSpacing:'6px'}},
   {kind:'text',text:'welcoming',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(60,80,100,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Little Prince',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3c5064'}},
   {kind:'text',text:"B O Y",x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(60,80,100,.7)',letterSpacing:'8px'}},
 ]},

// Baby Girl - 2 photos
{id:'occ_baby_girl',name:'Baby Girl',cat:'baby',badge:'new',n:2,
 photoFrames:[{rx:0.073,ry:0.26,rw:0.38,rh:0.5,angle:0},{rx:0.548,ry:0.253,rw:0.38,rh:0.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusty rose + cream
   drawGrainGradient(ctx,W,H,'#f5e1d6','#e8c5b9',180,.05,55);
   // Watercolor wash
   drawWatercolorSplash(ctx,W*.18,H*.12,S*.22,'#c85a4a',11,.28);
   drawWatercolorSplash(ctx,W*.82,H*.88,S*.22,'#b87b73',22,.28);
   // Botanical wreath
   drawBotanicalSpray(ctx,W*.04,H*.1,S*.22,-Math.PI*.12,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.1,S*.22,-Math.PI*.12,'#8a9b73');ctx.restore();
   // Rose accents
   drawRose(ctx,W*.5,H*.15,S*.045,0,'#c85a4a');
   drawRose(ctx,W*.43,H*.18,S*.03,.4,'#d88377');
   drawRose(ctx,W*.57,H*.18,S*.03,-.4,'#d88377');
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,60,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'LITTLE PRINCESS',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(139,69,55,.95)',letterSpacing:'6px'}},
   {kind:'text',text:'welcoming',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,55,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Little Princess',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
   {kind:'text',text:"G I R L",x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,55,.7)',letterSpacing:'8px'}},
 ]},

// Baby 1st Year - 6 photos
{id:'occ_baby_year',name:'First Year',cat:'baby',badge:'new',n:6,
 photoFrames:[{rx:0.04,ry:0.08,rw:0.28,rh:0.36,angle:0},{rx:0.355,ry:0.066,rw:0.286,rh:0.309,angle:0},{rx:0.68,ry:0.08,rw:0.28,rh:0.36,angle:0},{rx:0.04,ry:0.48,rw:0.28,rh:0.36,angle:0},{rx:0.363,ry:0.583,rw:0.275,rh:0.298,angle:0},{rx:0.68,ry:0.48,rw:0.28,rh:0.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf8f3','#faebe0',180,.05,66);
   drawWatercolorSplash(ctx,W*.15,H*.5,S*.2,'#f4c2b8',11,.28);
   drawWatercolorSplash(ctx,W*.85,H*.5,S*.2,'#c8d4bc',22,.28);
   drawMonogram(ctx,'01',W*.5,H*.47,H*.25,'rgba(200,140,110,.14)');
   drawBotanicalSpray(ctx,W*.03,H*.44,S*.13,-Math.PI*.5,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.44,S*.13,-Math.PI*.5,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(200,140,110,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'one year of',x:0.5,y:0.905,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(170,100,90,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Pure Joy',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b5348'}},
 ]},

// Newborn - 1 photo
{id:'occ_baby_newborn',name:'Newborn',cat:'baby',badge:'hot',n:1,
 photoFrames:[{rx:0.3,ry:0.208,rw:0.395,rh:0.516,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#fdf8f3');g.addColorStop(1,'#faebe0');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.04,77);
   // Arch frame around portrait
   ctx.save();
   ctx.strokeStyle='rgba(200,140,110,.5)';ctx.lineWidth=Math.max(1.2,S*.002);
   const ax=W*.24-S*.01,ay=H*.14-S*.01,aw=W*.52+S*.02,ah=H*.58+S*.02;
   ctx.beginPath();
   ctx.moveTo(ax,ay+ah);
   ctx.lineTo(ax,ay+aw*.42);
   ctx.arc(ax+aw*.5,ay+aw*.42,aw*.5,Math.PI,0,false);
   ctx.lineTo(ax+aw,ay+ah);
   ctx.stroke();
   ctx.strokeStyle='rgba(200,140,110,.25)';ctx.lineWidth=Math.max(.6,S*.0008);
   const ix=ax+S*.008,iy=ay+S*.008,iw=aw-S*.016,ih=ah-S*.016;
   ctx.beginPath();
   ctx.moveTo(ix,iy+ih);ctx.lineTo(ix,iy+iw*.42);
   ctx.arc(ix+iw*.5,iy+iw*.42,iw*.5,Math.PI,0,false);
   ctx.lineTo(ix+iw,iy+ih);ctx.stroke();
   ctx.restore();
   drawBotanicalSpray(ctx,W*.12,H*.12,S*.24,-Math.PI*.15,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.88,H*.12,S*.24,-Math.PI*.15,'#a3b88a');ctx.restore();
   drawScriptWatermark(ctx,'welcome',W*.5,H*.5,H*.22,'rgba(200,140,110,.08)');
   drawOrnamentalBorder(ctx,W,H,'rgba(200,140,110,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'hello world',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(170,100,80,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Little Miracle',x:0.5,y:0.87,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b5348'}},
   {kind:'text',text:'born with love',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(200,140,110,.8)',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// STYLE: Wabi-sabi (1 photo, asymmetric, huge breathing room)
{id:'occ_baby_wabi',name:'Wabi-sabi',cat:'baby',badge:'new',n:1,
 photoFrames:[{rx:.36,ry:.22,rw:.44,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.wabi_sabi;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.07,33);
   drawLinenTexture(ctx,0,0,W,H,P.soft,4);
   // Single asymmetric sumi brushstroke on the left (ma principle - intentional space)
   drawSumiStroke(ctx,W*.08,H*.2,W*.2,H*.82,S*.022,P.accent,7);
   // Tiny pressed flower off to one side
   drawPressedFlower(ctx,W*.92,H*.8,S*.035,6,P.rule);
 },
 canvasElements:[
   {kind:'text',text:'KANSO  /  SIMPLICITY',x:0.06,y:0.08,style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#9a8a78',letterSpacing:'3px'}},
   {kind:'text',text:'stillness',x:0.1,y:0.88,style:{fontSize:'32px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#3d362c'}},
   {kind:'text',text:'a small life begins',x:0.1,y:0.92,style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#9a8a78'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// ✈️ TRAVEL (5 templates)
// ═══════════════════════════════════════════════════════════════

// 3 photos - Adventure
{id:'occ_travel_adv',name:'Polaroid Postcard',cat:'travel',badge:'hot',n:3,
 photoFrames:[{rx:.06,ry:.22,rw:.28,rh:.46,angle:-3},{rx:.36,ry:.17,rw:.28,rh:.46,angle:2},{rx:.66,ry:.22,rw:.28,rh:.46,angle:-2}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Mineral earth palette (2026): warm beige + rust
   drawGrainGradient(ctx,W,H,'#f2e4cb','#d9c2a0',180,.06,55);
   // Faint map-dot watermark
   const rng=seededRng(33);
   ctx.fillStyle='rgba(74,58,47,.09)';
   for(let i=0;i<160;i++){
     const x=rng()*W,y=rng()*H*.7+H*.05,r=S*.001+rng()*S*.002;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Proportional washi tapes on polaroid tops
   drawWashiTape(ctx,W*.2,H*.2,S*.11,S*.022,-Math.PI*.04,'#a8896d');
   drawWashiTape(ctx,W*.5,H*.15,S*.09,S*.02,Math.PI*.03,'#6b7a5a');
   drawWashiTape(ctx,W*.8,H*.2,S*.11,S*.022,-Math.PI*.03,'#b85c3c');
   // Postcard stamps left + right
   drawStampCircle(ctx,W*.08,H*.84,S*.07,'#6b4226','PAR');
   drawStampCircle(ctx,W*.92,H*.84,S*.07,'#6b4226','TYO');
   // Brush-stroke underline across bottom (sun-faded)
   drawBrushStroke(ctx,W*.15,H*.92,W*.85,H*.92,S*.018,'#a8896d',.55);
   // Halftone fade from left edge
   drawHalftoneDots(ctx,W*.01,H*.3,W*.06,H*.4,10,'rgba(74,58,47,.3)','right');
   ctx.save();ctx.scale(-1,1);drawHalftoneDots(ctx,-W*.07,H*.3,W*.06,H*.4,10,'rgba(74,58,47,.3)','right');ctx.restore();
   // Vintage border
   drawOrnamentalBorder(ctx,W,H,'rgba(74,58,47,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'WANDERLUST',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(74,58,47,.9)',letterSpacing:'7px'}},
   {kind:'text',text:'adventure',x:0.5,y:0.83,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(90,60,30,.8)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Wanderlust Chronicles',x:0.5,y:0.86,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b4226'}},
   {kind:'text',text:'collect moments, not things',x:0.5,y:0.94,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(90,60,30,.7)',letterSpacing:'4px'}},
 ]},

// 1 photo - Solo trip
{id:'occ_travel_solo',name:'Solo Journey',cat:'travel',badge:null,n:1,
 photoFrames:[{rx:.22,ry:.14,rw:.56,rh:.58,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Mineral earth palette
   drawGrainGradient(ctx,W,H,'#f2e4cb','#d9c2a0',180,.06,11);
   // Map-dot watermark
   const rng=seededRng(11);
   ctx.fillStyle='rgba(74,58,47,.08)';
   for(let i=0;i<140;i++){const x=rng()*W,y=rng()*H,r=S*.001+rng()*S*.002;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
   // Postcard stamps
   drawStampCircle(ctx,W*.08,H*.82,S*.065,'#6b4226','ADV');
   drawStampCircle(ctx,W*.92,H*.82,S*.065,'#6b4226','EXP');
   drawBrushStroke(ctx,W*.25,H*.9,W*.75,H*.9,S*.018,'#a8896d',.55);
   drawOrnamentalBorder(ctx,W,H,'rgba(74,58,47,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'THE WORLD IS WAITING',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#6b4226',letterSpacing:'5px'}},
   {kind:'text',text:'solo',x:0.5,y:0.85,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#6b4226',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Journey Within',x:0.5,y:0.92,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b4226'}},
 ]},

// 4 photos - Memories
{id:'occ_travel_mem',name:'Travel Memories',cat:'travel',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.08,rw:.4,rh:.36,angle:0},{rx:.54,ry:.08,rw:.4,rh:.36,angle:0},{rx:.06,ry:.5,rw:.4,rh:.36,angle:0},{rx:.54,ry:.5,rw:.4,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f2e4cb','#d9c2a0',180,.06,33);
   const rng=seededRng(33);
   ctx.fillStyle='rgba(74,58,47,.08)';
   for(let i=0;i<160;i++){const x=rng()*W,y=rng()*H,r=S*.001+rng()*S*.002;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
   drawStampCircle(ctx,W*.5,H*.48,S*.08,'#6b4226','TRIP');
   drawWashiTape(ctx,W*.2,H*.04,S*.1,S*.022,-Math.PI*.04,'#a8896d');
   drawWashiTape(ctx,W*.8,H*.04,S*.1,S*.022,Math.PI*.04,'#6b7a5a');
   drawOrnamentalBorder(ctx,W,H,'rgba(74,58,47,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'wanderlust',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(74,58,47,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Memories Collected',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b4226'}},
 ]},

// 6 photos - Beach
{id:'occ_travel_beach',name:'Beach Vibes',cat:'travel',badge:null,n:6,
 photoFrames:[{rx:0.039,ry:0.036,rw:0.271,rh:0.369,angle:0},{rx:0.035,ry:0.545,rw:0.28,rh:0.38,angle:0},{rx:0.364,ry:0.539,rw:0.256,rh:0.351,angle:0},{rx:0.676,ry:0.543,rw:0.28,rh:0.38,angle:0},{rx:0.369,ry:0.036,rw:0.271,rh:0.369,angle:0},{rx:0.686,ry:0.038,rw:0.271,rh:0.369,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sun-faded coastal palette
   drawGrainGradient(ctx,W,H,'#e8dac8','#c8b89a',180,.06,88);
   drawWatercolorSplash(ctx,W*.15,H*.5,S*.22,'#7a8ca0',11,.22);
   drawWatercolorSplash(ctx,W*.85,H*.5,S*.22,'#c49a6c',22,.22);
   drawMonogram(ctx,'Sea & Sun',W*.5,H*.48,H*.13,'rgba(74,58,47,.14)');
   drawBrushStroke(ctx,W*.2,H*.47,W*.8,H*.47,S*.015,'#7a8ca0',.5);
   drawOrnamentalBorder(ctx,W,H,'rgba(74,58,47,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'sand, sea, sun',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(74,58,47,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Coastal Memories',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d5348'}},
 ]},

// 8 photos - World trip
{id:'occ_travel_world',name:'World Tour',cat:'travel',badge:null,n:8,
 photoFrames:[{rx:.03,ry:.04,rw:.22,rh:.3,angle:0},{rx:.27,ry:.04,rw:.22,rh:.3,angle:0},{rx:.51,ry:.04,rw:.22,rh:.3,angle:0},{rx:.75,ry:.04,rw:.22,rh:.3,angle:0},
              {rx:.03,ry:.36,rw:.22,rh:.3,angle:0},{rx:.27,ry:.36,rw:.22,rh:.3,angle:0},{rx:.51,ry:.36,rw:.22,rh:.3,angle:0},{rx:.75,ry:.36,rw:.22,rh:.3,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f2e4cb','#d9c2a0',180,.06,22);
   const rng=seededRng(22);
   ctx.fillStyle='rgba(74,58,47,.08)';
   for(let i=0;i<180;i++){const x=rng()*W,y=rng()*H,r=S*.001+rng()*S*.002;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
   // Postcard stamps tucked along bottom edge (outside title zone)
   drawStampCircle(ctx,W*.1,H*.96,S*.04,'#6b4226','PAR');
   drawStampCircle(ctx,W*.9,H*.96,S*.04,'#6b4226','NYC');
   drawOrnamentalBorder(ctx,W,H,'rgba(74,58,47,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'AROUND THE WORLD',x:0.5,y:0.81,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#a04520',letterSpacing:'5px'}},
   {kind:'text',text:'World Tour Collected',x:0.5,y:0.85,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b4226'}},
 ]},

// STYLE: Mediterranean warmth (3 photos)
{id:'occ_travel_med',name:'Mediterranean',cat:'travel',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.46,angle:0},{rx:.37,ry:.22,rw:.26,rh:.46,angle:0},{rx:.66,ry:.22,rw:.26,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.mediterranean;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.08,42);
   drawLinenTexture(ctx,0,0,W,H,P.rule,5);
   // Terracotta watercolor splashes (sun-bleached warmth)
   drawWatercolorSplash(ctx,W*.15,H*.12,S*.22,P.accent,11,.28);
   drawWatercolorSplash(ctx,W*.85,H*.88,S*.24,P.soft,22,.32);
   // Wax seals as postcard stamps in corners
   drawWaxSeal(ctx,W*.08,H*.88,S*.05,P.accent,'M');
   drawWaxSeal(ctx,W*.92,H*.88,S*.05,P.accent,'V');
   // Pressed olive-branch silhouettes
   drawBotanicalSpray(ctx,W*.04,H*.15,S*.2,-Math.PI*.12,P.rule);
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.15,S*.2,-Math.PI*.12,P.rule);ctx.restore();
   drawOrnamentalBorder(ctx,W,H,P.accent,Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'DOLCE VITA',x:0.5,y:0.08,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(139,58,28,.9)',letterSpacing:'7px'}},
   {kind:'text',text:'sun-kissed memories',x:0.5,y:0.9,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,58,28,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'La Bella Vita',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b3a1c'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🎓 GRADUATION (5 templates)
// ═══════════════════════════════════════════════════════════════

// 1 photo
{id:'occ_grad_solo',name:'Graduation Day',cat:'graduation',badge:'hot',n:1,
 photoFrames:[{rx:.24,ry:.16,rw:.52,rh:.54,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep ink-navy gradient
   const g=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.5,H);
   g.addColorStop(0,'#101b32');g.addColorStop(1,'#040712');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawBokeh(ctx,W,H,22,'#d4af37',3);
   // Tiny starfield
   const rng=seededRng(55);
   ctx.fillStyle='rgba(212,175,55,.75)';
   for(let i=0;i<40;i++){
     const x=rng()*W,y=rng()*H*.7,s=S*.0015+rng()*S*.003;
     ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
   }
   // Editorial gold leaf frame around the portrait
   drawGoldLeafFrame(ctx,W*.24-S*.012,H*.16-S*.012,W*.52+S*.024,H*.54+S*.024,'#d4af37');
   // Script watermark
   drawScriptWatermark(ctx,'Achieved',W*.5,H*.85,H*.1,'rgba(212,175,55,.18)');
   // Outer thin border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'the',x:0.5,y:0.83,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(212,175,55,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'Graduate',x:0.5,y:0.85,align:'center',style:{fontSize:'32px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0c858'}},
   {kind:'text',text:'C L A S S   O F   2 0 2 6',x:0.5,y:0.91,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'7px'}},
 ]},

// 3 photos - Class of 2025
{id:'occ_grad_class',name:'Yearbook',cat:'graduation',badge:'hot',n:3,
 photoFrames:[{rx:.08,ry:.24,rw:.26,rh:.46,angle:0},{rx:.37,ry:.24,rw:.26,rh:.46,angle:0},{rx:.66,ry:.24,rw:.26,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Ink navy + gold (editorial black+gold direction)
   drawGrainGradient(ctx,W,H,'#0d1528','#1a2340',180,.05,88);
   // Art-deco sunburst rays behind everything (subtle)
   drawSunburst(ctx,W*.5,H*.5,S*.1,S*.6,48,'rgba(212,175,55,.05)');
   // Huge "2026" watermark
   drawMonogram(ctx,'2026',W*.5,H*.5,H*.48,'rgba(212,175,55,.14)',
     `900 ${H*.48}px 'Playfair Display','Fraunces',serif`);
   // Chevron border at top + bottom (art deco)
   drawChevronBorder(ctx,W*.1,H*.06,W*.8,0,S*.025,'rgba(212,175,55,.7)');
   // Deco stepped frame
   drawDecoFrame(ctx,S*.025,S*.025,W-S*.05,H-S*.05,'rgba(212,175,55,.7)',Math.max(1.5,S*.0025));
   // 8-point starbursts near corners
   [[W*.08,H*.15,S*.022],[W*.92,H*.15,S*.022],[W*.08,H*.85,S*.022],[W*.92,H*.85,S*.022]].forEach(([x,y,s])=>
     drawStarburst8(ctx,x,y,s,'rgba(212,175,55,.85)'));
 },
 canvasElements:[
   {kind:'text',text:'CLASS OF 2026',x:0.5,y:0.12,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'class of',x:0.5,y:0.85,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(139,105,20,.8)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Two Thousand Twenty Six',x:0.5,y:0.878,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b6914'}},
   {kind:'text',text:'C O N G R A T U L A T I O N S',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,105,20,.8)',letterSpacing:'5px'}},
 ]},

// 4 photos - Honors
{id:'occ_grad_honors',name:'With Honors',cat:'graduation',badge:null,n:4,
 photoFrames:[{rx:0.08,ry:0.094,rw:0.394,rh:0.314,angle:0},{rx:0.08,ry:0.543,rw:0.4,rh:0.36,angle:0},{rx:0.528,ry:0.545,rw:0.4,rh:0.36,angle:0},{rx:0.533,ry:0.093,rw:0.394,rh:0.314,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#0d1528','#03060d',180,.04,88);
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.5,36,'rgba(212,175,55,.06)');
   drawBokeh(ctx,W,H,20,'#d4af37',88);
   drawMonogram(ctx,'Cum Laude',W*.5,H*.47,H*.1,'rgba(212,175,55,.22)');
   drawChevronBorder(ctx,W*.12,H*.04,W*.76,0,S*.02,'rgba(212,175,55,.7)');
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(212,175,55,.7)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'with',x:0.5,y:0.918,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Highest Honors',x:0.5,y:0.935,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0c858'}},
 ]},

// 6 photos - Friends Forever
{id:'occ_grad_friends',name:'Grad Friends',cat:'graduation',badge:null,n:6,
 photoFrames:[{rx:.04,ry:.08,rw:.28,rh:.38,angle:0},{rx:.36,ry:.08,rw:.28,rh:.38,angle:0},{rx:.68,ry:.08,rw:.28,rh:.38,angle:0},
              {rx:.04,ry:.5,rw:.28,rh:.38,angle:0},{rx:.36,ry:.5,rw:.28,rh:.38,angle:0},{rx:.68,ry:.5,rw:.28,rh:.38,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf5e6','#eadfc2',180,.05,33);
   drawMonogram(ctx,'2026',W*.5,H*.48,H*.22,'rgba(139,105,20,.14)');
   drawChevronBorder(ctx,W*.12,H*.04,W*.76,0,S*.02,'rgba(139,105,20,.7)');
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(139,105,20,.7)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'scholars & friends',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,105,20,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Forever Cohort',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b6914'}},
 ]},

// Special: Congratulations
{id:'occ_grad_congrats',name:'Congratulations',cat:'graduation',badge:'new',n:5,
 photoFrames:[{rx:0.041,ry:0.16,rw:0.42,rh:0.5,angle:0},{rx:0.5,ry:0.1,rw:0.42,rh:0.38,angle:0},{rx:0.529,ry:0.506,rw:0.2,rh:0.36,angle:0},{rx:0.755,ry:0.507,rw:0.2,rh:0.36,angle:0},{rx:0.08,ry:0.708,rw:0.414,rh:0.194,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#0d1528','#03060d',180,.04,99);
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.55,48,'rgba(212,175,55,.08)');
   drawBokeh(ctx,W,H,24,'#d4af37',99);
   drawMonogram(ctx,'Congrats',W*.75,H*.92,H*.1,'rgba(212,175,55,.35)');
   drawStarburst8(ctx,W*.08,H*.06,S*.025,'rgba(212,175,55,.85)');
   drawStarburst8(ctx,W*.92,H*.06,S*.025,'rgba(212,175,55,.85)');
   drawDecoFrame(ctx,S*.022,S*.022,W-S*.044,H-S*.044,'rgba(212,175,55,.7)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'you did it',x:0.24,y:0.95,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
 ]},

// STYLE: Risograph Duotone (4 photos)
{id:'occ_grad_riso',name:'Risograph',cat:'graduation',badge:'new',n:4,
 photoFrames:[{rx:.08,ry:.22,rw:.38,rh:.3,angle:0},{rx:.54,ry:.22,rw:.38,rh:.3,angle:0},{rx:.08,ry:.54,rw:.38,rh:.3,angle:0},{rx:.54,ry:.54,rw:.38,rh:.3,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.riso_duotone;
   ctx.fillStyle=P.bg1;ctx.fillRect(0,0,W,H);
   // Small overprint accent squares in the 4 corners (out of text path)
   drawRisoOverprint(ctx,W*.03,H*.03,W*.1,H*.04,P.accent,P.rule,3,2);
   drawRisoOverprint(ctx,W*.87,H*.03,W*.1,H*.04,P.rule,P.accent,-3,2);
   drawRisoOverprint(ctx,W*.03,H*.93,W*.1,H*.04,P.accent,P.rule,2,-2);
   drawRisoOverprint(ctx,W*.87,H*.93,W*.1,H*.04,P.rule,P.accent,-2,-2);
   drawFilmGrain(ctx,W,H,.1,88);
   // Print crop marks in the corners
   ctx.strokeStyle=P.accent;ctx.lineWidth=1;
   [[S*.015,S*.015],[W-S*.015,S*.015],[S*.015,H-S*.015],[W-S*.015,H-S*.015]].forEach(([cx,cy])=>{
     ctx.beginPath();
     ctx.moveTo(cx,cy-S*.015);ctx.lineTo(cx,cy+S*.015);
     ctx.moveTo(cx-S*.015,cy);ctx.lineTo(cx+S*.015,cy);
     ctx.stroke();
   });
 },
 canvasElements:[
   {kind:'text',text:'CLASS OF',x:0.5,y:0.13,align:'center',style:{fontSize:'22px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#c85a2e',letterSpacing:'4px'}},
   {kind:'text',text:'2026',x:0.5,y:0.89,align:'center',style:{fontSize:'42px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#4a5a8a',letterSpacing:'3px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🏠 FAMILY (5 templates)
// ═══════════════════════════════════════════════════════════════

// 3 photos
{id:'occ_fam_portrait',name:'Family Portrait',cat:'family',badge:'hot',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.48,angle:0},{rx:.37,ry:.22,rw:.26,rh:.48,angle:0},{rx:.66,ry:.22,rw:.26,rh:.48,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5efe0','#e5d4b0',180,.06,62);
   drawWatercolorSplash(ctx,W*.18,H*.15,S*.22,'#c8d4bc',11,.3);
   drawWatercolorSplash(ctx,W*.82,H*.85,S*.22,'#d4a574',22,.28);
   drawBotanicalSpray(ctx,W*.04,H*.12,S*.2,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.12,S*.2,-Math.PI*.15,'#8a9b73');ctx.restore();
   drawBotanicalSpray(ctx,W*.05,H*.9,S*.14,-Math.PI*.45,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.95,H*.9,S*.14,-Math.PI*.45,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(93,64,40,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'TOGETHER IS HOME',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(93,64,40,.9)',letterSpacing:'6px'}},
   {kind:'text',text:'our',x:0.5,y:0.84,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(93,64,40,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Beloved Family',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d4028'}},
   {kind:'text',text:'H O M E',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(93,64,40,.75)',letterSpacing:'8px'}},
 ]},

// 1 photo
{id:'occ_fam_solo',name:'Family Moment',cat:'family',badge:null,n:1,
 photoFrames:[{rx:.22,ry:.14,rw:.56,rh:.58,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5efe0','#e5d4b0',180,.06,71);
   drawBotanicalSpray(ctx,W*.12,H*.12,S*.22,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.88,H*.12,S*.22,-Math.PI*.15,'#8a9b73');ctx.restore();
   drawBotanicalSpray(ctx,W*.06,H*.88,S*.14,-Math.PI*.45,'#a3b88a');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.88,S*.14,-Math.PI*.45,'#a3b88a');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(93,64,40,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'HOME IS WHERE LOVE LIVES',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#5d4028',letterSpacing:'4px'}},
   {kind:'text',text:'our',x:0.5,y:0.85,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#5d4028',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Family',x:0.5,y:0.875,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d4028'}},
 ]},

// 4 photos - Reunion
{id:'occ_fam_reunion',name:'Family Reunion',cat:'family',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.08,rw:.4,rh:.36,angle:0},{rx:.54,ry:.08,rw:.4,rh:.36,angle:0},{rx:.06,ry:.5,rw:.4,rh:.36,angle:0},{rx:.54,ry:.5,rw:.4,rh:.36,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5efe0','#e8dcc0',180,.06,88);
   drawWatercolorSplash(ctx,W*.18,H*.15,S*.22,'#8a9b73',11,.3);
   drawWatercolorSplash(ctx,W*.82,H*.85,S*.22,'#c49a6c',22,.28);
   drawMonogram(ctx,'Roots',W*.5,H*.48,H*.14,'rgba(93,64,40,.14)');
   drawBotanicalSpray(ctx,W*.04,H*.1,S*.18,-Math.PI*.15,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.1,S*.18,-Math.PI*.15,'#8a9b73');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(93,64,40,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'roots & wings',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(93,64,40,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Family Reunion',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d4028'}},
 ]},

// 6 photos - Love album
{id:'occ_fam_album',name:'Family Album',cat:'family',badge:null,n:6,
 photoFrames:[{rx:.04,ry:.08,rw:.28,rh:.38,angle:0},{rx:.36,ry:.08,rw:.28,rh:.38,angle:0},{rx:.68,ry:.08,rw:.28,rh:.38,angle:0},
              {rx:.04,ry:.5,rw:.28,rh:.38,angle:0},{rx:.36,ry:.5,rw:.28,rh:.38,angle:0},{rx:.68,ry:.5,rw:.28,rh:.38,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf6f0','#f0e4d3',180,.06,44);
   drawMonogram(ctx,'Love',W*.5,H*.48,H*.14,'rgba(139,69,55,.14)');
   drawBotanicalSpray(ctx,W*.03,H*.44,S*.13,-Math.PI*.5,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.44,S*.13,-Math.PI*.5,'#8a9b73');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(139,69,55,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'moments worth keeping',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,55,.85)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Family Album',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
 ]},

// 8 photos - Multi gen
{id:'occ_fam_gen',name:'Generations',cat:'family',badge:null,n:8,
 photoFrames:[{rx:.03,ry:.04,rw:.22,rh:.3,angle:0},{rx:.27,ry:.04,rw:.22,rh:.3,angle:0},{rx:.51,ry:.04,rw:.22,rh:.3,angle:0},{rx:.75,ry:.04,rw:.22,rh:.3,angle:0},
              {rx:.03,ry:.36,rw:.22,rh:.3,angle:0},{rx:.27,ry:.36,rw:.22,rh:.3,angle:0},{rx:.51,ry:.36,rw:.22,rh:.3,angle:0},{rx:.75,ry:.36,rw:.22,rh:.3,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5efe0','#e5d4b0',180,.06,77);
   // Botanical sprays tucked into bottom corners (outside title zone)
   drawBotanicalSpray(ctx,W*.04,H*.98,S*.13,-Math.PI*.42,'#8a9b73');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.98,S*.13,-Math.PI*.42,'#8a9b73');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(93,64,40,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'GENERATIONS OF LOVE',x:0.5,y:0.79,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#8a6030',letterSpacing:'5px'}},
   {kind:'text',text:'Bound by Love',x:0.5,y:0.84,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5d4028'}},
 ]},

// STYLE: Scandinavian (3 photos - quiet, textural, greige)
{id:'occ_fam_scandi',name:'Scandinavian',cat:'family',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.24,rw:.26,rh:.44,angle:0},{rx:.37,ry:.24,rw:.26,rh:.44,angle:0},{rx:.66,ry:.24,rw:.26,rh:.44,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);const P=STYLE_PALETTES.scandinavian;
   drawGrainyBlur(ctx,W,H,P.bg1,P.bg2,.05,99);
   drawLinenTexture(ctx,0,0,W,H,P.rule,3.5);
   // Pressed flower moved to top-right corner (out of masthead text path)
   drawPressedFlower(ctx,W*.93,H*.08,S*.03,6,P.soft);
   // Hairline rules top and bottom of title area
   ctx.strokeStyle=P.rule;ctx.lineWidth=Math.max(1,S*.0012);
   ctx.beginPath();ctx.moveTo(W*.08,H*.18);ctx.lineTo(W*.92,H*.18);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.08,H*.74);ctx.lineTo(W*.92,H*.74);ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'THE FAMILY PORTRAIT  /  HYGGE SERIES',x:0.08,y:0.15,style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#a8a098',letterSpacing:'3px'}},
   {kind:'text',text:'quiet',x:0.5,y:0.82,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8a8578',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Quiet Life',x:0.5,y:0.85,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#2a2a28'}},
   {kind:'text',text:'TOGETHER  /  2026',x:0.5,y:0.92,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#8a8578',letterSpacing:'6px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// NEW PREMIUM TEMPLATES — 2026 DROP 2
// ═══════════════════════════════════════════════════════════════

// BIRTHDAY — Midnight Soirée (3 photos, champagne + navy)
{id:'occ_bday_midnight',name:'Midnight Soirée',cat:'birthday',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.22,rw:.26,rh:.46,angle:0},{rx:.37,ry:.22,rw:.26,rh:.46,angle:0},{rx:.66,ry:.22,rw:.26,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep navy to midnight gradient with gold bokeh
   drawGrainGradient(ctx,W,H,'#0a0e26','#1a1238',180,.04,91);
   drawBokeh(ctx,W,H,28,'#d4af37',42);
   // Scatter tiny gold stars
   const rng=seededRng(42);
   for(let i=0;i<80;i++){
     const x=rng()*W,y=rng()*H,s=S*.001+rng()*S*.0028;
     ctx.fillStyle=`rgba(212,175,55,${.35+rng()*.6})`;
     ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
   }
   // Larger starburst constellations at corners
   [[W*.12,H*.12],[W*.88,H*.12],[W*.5,H*.08],[W*.12,H*.88],[W*.88,H*.88]].forEach(([x,y])=>
     drawStarburst8(ctx,x,y,S*.018,'rgba(212,175,55,.9)'));
   // Gold halftone fade from top
   drawHalftoneDots(ctx,W*.25,H*.02,W*.5,H*.08,14,'rgba(212,175,55,.4)','right');
   // Confetti ribbons cascading top + bottom
   // Confetti bands placed between the text rows and the photos so they don't muddy
   // the legibility of either. Top: 0.18-0.21 (text ends ~.14, photos start .22).
   // Bottom: 0.7-0.74 (photos end ~.68, text starts .82).
   drawConfettiRibbon(ctx,H*.18,W,H*.03,77,['#d4af37','#e8c56a','#fff4d0','#b8941e']);
   drawConfettiRibbon(ctx,H*.7,W,H*.04,88,['#d4af37','#e8c56a','#fff4d0','#b8941e']);
   // Deco frame
   drawDecoFrame(ctx,S*.02,S*.02,W-S*.04,H-S*.04,'rgba(212,175,55,.65)',Math.max(1.4,S*.0022));
 },
 canvasElements:[
   {kind:'text',text:'THE MIDNIGHT SOIREE',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'est. 2026',x:0.5,y:0.14,align:'center',style:{fontSize:'10px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(255,235,180,.7)',letterSpacing:'3px'}},
   {kind:'text',text:'another year',x:0.5,y:0.82,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Golden & Bold',x:0.5,y:0.85,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
   {kind:'text',text:'CHEERS TO YOU',x:0.5,y:0.91,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.7)',letterSpacing:'6px'}},
 ]},

// BIRTHDAY — Kawaii Pop (4 photos, bright pastels + clouds)
{id:'occ_bday_kawaii',name:'Kawaii Pop',cat:'birthday',badge:'new',n:4,
 photoFrames:[{rx:.08,ry:.16,rw:.36,rh:.32,angle:-3},{rx:.56,ry:.14,rw:.36,rh:.32,angle:2},{rx:.08,ry:.54,rw:.36,rh:.32,angle:2},{rx:.56,ry:.56,rw:.36,rh:.32,angle:-3}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Candy pink to lavender gradient
   drawGrainGradient(ctx,W,H,'#ffe1f0','#e0dcff',180,.05,23);
   // Rainbow arc top-left
   const rainbow=['#ff9bc2','#ffcb9b','#fff59b','#b8f59b','#9bd4ff','#c89bff'];
   rainbow.forEach((c,i)=>{
     ctx.beginPath();ctx.arc(W*.02,H*.02,S*(.18-i*.012),0,Math.PI*.5);
     ctx.strokeStyle=c;ctx.lineWidth=S*.012;ctx.stroke();
   });
   // Fluffy clouds
   const drawCloud=(cx,cy,scale)=>{
     ctx.fillStyle='rgba(255,255,255,.85)';
     [[0,0,1],[-.8,.1,.75],[.8,.1,.75],[-.4,-.2,.85],[.4,-.2,.85]].forEach(([dx,dy,s])=>{
       ctx.beginPath();ctx.arc(cx+dx*scale,cy+dy*scale,scale*s*.55,0,Math.PI*2);ctx.fill();
     });
   };
   drawCloud(W*.85,H*.2,S*.08);
   drawCloud(W*.15,H*.75,S*.07);
   drawCloud(W*.9,H*.8,S*.06);
   // Confetti dots scattered
   const rng=seededRng(11);
   const confetti=['#ff6b9d','#ffd166','#06d6a0','#4cc9f0','#c77dff'];
   for(let i=0;i<60;i++){
     ctx.fillStyle=confetti[Math.floor(rng()*confetti.length)];
     const x=rng()*W,y=rng()*H,s=S*.006+rng()*S*.008,shape=Math.floor(rng()*3);
     ctx.save();ctx.translate(x,y);ctx.rotate(rng()*Math.PI);
     if(shape===0){ctx.fillRect(-s*.4,-s*.15,s*.8,s*.3);}
     else if(shape===1){ctx.beginPath();ctx.arc(0,0,s*.25,0,Math.PI*2);ctx.fill();}
     else{ctx.beginPath();ctx.moveTo(0,-s*.3);ctx.lineTo(s*.3,0);ctx.lineTo(0,s*.3);ctx.lineTo(-s*.3,0);ctx.closePath();ctx.fill();}
     ctx.restore();
   }
   // Sparkles
   [[W*.5,H*.08],[W*.5,H*.92],[W*.04,H*.5],[W*.96,H*.5]].forEach(([x,y])=>
     drawStarburst8(ctx,x,y,S*.02,'#ff6b9d'));
   // Rounded scalloped border
   ctx.strokeStyle='#ff6b9d';ctx.lineWidth=S*.004;
   ctx.setLineDash([S*.015,S*.008]);
   ctx.strokeRect(S*.025,S*.025,W-S*.05,H-S*.05);
   ctx.setLineDash([]);
 },
 canvasElements:[
   {kind:'text',text:'YAY IT IS YOUR DAY',x:0.5,y:0.11,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#ff6b9d',letterSpacing:'5px'}},
   {kind:'text',text:'so cute',x:0.5,y:0.875,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#9d7dff',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Sweet Like You',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#ff6b9d'}},
 ]},

// WEDDING — Mandala Royale (4 photos, Indian wedding mandala)
{id:'occ_wed_mandala',name:'Mandala Royale',cat:'wedding',badge:'new',n:4,
 photoFrames:[{rx:.1,ry:.12,rw:.35,rh:.35,angle:0},{rx:.55,ry:.12,rw:.35,rh:.35,angle:0},{rx:.1,ry:.53,rw:.35,rh:.35,angle:0},{rx:.55,ry:.53,rw:.35,rh:.35,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Rich maroon to burgundy gradient
   drawGrainGradient(ctx,W,H,'#3d0a15','#5c0f1f',180,.05,55);
   // Central mandala
   ctx.save();ctx.translate(W*.5,H*.5);
   const gold='rgba(212,175,55,';
   for(let ring=0;ring<5;ring++){
     const r=S*(.08+ring*.06);
     const spokes=8+ring*4;
     ctx.strokeStyle=gold+(.35-ring*.04)+')';ctx.lineWidth=Math.max(.8,S*.0012);
     ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
     for(let i=0;i<spokes;i++){
       const a=(i/spokes)*Math.PI*2;
       ctx.save();ctx.rotate(a);
       ctx.beginPath();
       ctx.moveTo(r-S*.012,0);ctx.bezierCurveTo(r,S*.012,r+S*.012,0,r,-S*.012);ctx.closePath();
       ctx.fillStyle=gold+(.25-ring*.03)+')';ctx.fill();
       ctx.restore();
     }
   }
   ctx.restore();
   // Corner paisley/sparkles
   [[W*.08,H*.08],[W*.92,H*.08],[W*.08,H*.92],[W*.92,H*.92]].forEach(([x,y])=>{
     drawStarburst8(ctx,x,y,S*.025,gold+'.85)');
   });
   // Gold chevron borders top/bottom
   drawChevronBorder(ctx,W*.15,H*.04,W*.7,0,S*.02,gold+'.7)');
   // Double gold ornate border
   drawOrnamentalBorder(ctx,W,H,gold+'.7)',Math.max(10,S*.02));
   drawDecoFrame(ctx,S*.045,S*.045,W-S*.09,H-S*.09,gold+'.55)',Math.max(1.2,S*.0018));
 },
 canvasElements:[
   {kind:'text',text:'SHUBH VIVAH',x:0.5,y:0.07,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'8px'}},
   {kind:'text',text:'the',x:0.5,y:0.88,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(212,175,55,.75)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Sacred Union',x:0.5,y:0.90,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
 ]},

// HOLIDAY — Harvest Gratitude (4 photos, Thanksgiving)
{id:'occ_hol_harvest',name:'Harvest',cat:'holiday',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.22,rw:.42,rh:.32,angle:0},{rx:.52,ry:.22,rw:.42,rh:.32,angle:0},{rx:.06,ry:.58,rw:.42,rh:.32,angle:0},{rx:.52,ry:.58,rw:.42,rh:.32,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Burnt amber to rust gradient
   drawGrainGradient(ctx,W,H,'#f5e0c5','#e8b87a',180,.06,62);
   // Sunburst rays behind center
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.55,36,'rgba(180,90,40,.08)');
   // Autumn leaf sprays — larger and denser
   drawBotanicalSpray(ctx,W*.04,H*.08,S*.22,-Math.PI*.12,'#b8601f');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.08,S*.22,-Math.PI*.12,'#b8601f');ctx.restore();
   drawBotanicalSpray(ctx,W*.06,H*.92,S*.18,Math.PI*.15,'#d48535');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.94,H*.92,S*.18,Math.PI*.15,'#d48535');ctx.restore();
   // Pressed leaves accent
   drawPressedFlower(ctx,W*.5,H*.5,S*.04,5,'#8b4513');
   // Wax seal "1621" nostalgic
   drawWaxSeal(ctx,W*.5,H*.1,S*.045,'#8b3a1c','G');
   // Halftone warmth from edges
   drawHalftoneDots(ctx,W*.02,H*.3,W*.06,H*.4,10,'rgba(139,69,30,.3)','right');
   ctx.save();ctx.scale(-1,1);drawHalftoneDots(ctx,-W*.08,H*.3,W*.06,H*.4,10,'rgba(139,69,30,.3)','right');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(139,69,30,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'HARVEST GATHERING',x:0.5,y:0.16,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(139,69,30,.9)',letterSpacing:'7px'}},
   {kind:'text',text:'gratitude',x:0.5,y:0.919,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(139,69,30,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Give Thanks',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b3a1c'}},
 ]},

// HOLIDAY — Easter Bloom (3 photos, pastel spring)
{id:'occ_hol_easter',name:'Easter Bloom',cat:'holiday',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.24,rw:.26,rh:.46,angle:0},{rx:.37,ry:.24,rw:.26,rh:.46,angle:0},{rx:.66,ry:.24,rw:.26,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Pastel lavender + mint gradient
   drawGrainGradient(ctx,W,H,'#f3ecf7','#e0f4e8',180,.05,33);
   // Watercolor splashes in pastel
   drawWatercolorSplash(ctx,W*.15,H*.12,S*.2,'#c8b5dc',11,.32);
   drawWatercolorSplash(ctx,W*.85,H*.15,S*.2,'#f5c6cf',22,.3);
   drawWatercolorSplash(ctx,W*.5,H*.88,S*.22,'#b8dcc9',17,.32);
   // Egg-shaped ornaments at top
   const drawEgg=(cx,cy,rx,ry,color,pattern)=>{
     ctx.save();ctx.translate(cx,cy);
     ctx.fillStyle=color;
     ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
     ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=Math.max(.8,S*.001);
     if(pattern==='dots'){
       for(let y=-ry*.7;y<ry*.7;y+=ry*.28)for(let x=-rx*.7;x<rx*.7;x+=rx*.28){
         ctx.beginPath();ctx.arc(x,y,Math.max(.8,S*.003),0,Math.PI*2);ctx.fill();
       }
     }else if(pattern==='stripes'){
       for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-rx*.9,i*ry*.25);ctx.lineTo(rx*.9,i*ry*.25);ctx.stroke();}
     }else{
       ctx.beginPath();ctx.moveTo(-rx*.7,0);ctx.quadraticCurveTo(0,-ry*.15,rx*.7,0);ctx.stroke();
       ctx.beginPath();ctx.moveTo(-rx*.6,ry*.3);ctx.quadraticCurveTo(0,ry*.15,rx*.6,ry*.3);ctx.stroke();
     }
     ctx.restore();
   };
   drawEgg(W*.2,H*.12,S*.035,S*.048,'#f5c6cf','dots');
   drawEgg(W*.5,H*.1,S*.04,S*.055,'#c8b5dc','stripes');
   drawEgg(W*.8,H*.12,S*.035,S*.048,'#b8dcc9','wave');
   // Botanical sprays
   drawBotanicalSpray(ctx,W*.04,H*.22,S*.18,-Math.PI*.2,'#8fb883');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.22,S*.18,-Math.PI*.2,'#8fb883');ctx.restore();
   // Pressed spring flowers
   drawPressedFlower(ctx,W*.5,H*.78,S*.035,6,'#e8a4b0');
   drawPressedFlower(ctx,W*.15,H*.82,S*.025,5,'#b89dd4');
   drawPressedFlower(ctx,W*.85,H*.82,S*.025,5,'#a4c8a0');
   drawOrnamentalBorder(ctx,W,H,'rgba(150,110,170,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'HAPPY EASTER',x:0.5,y:0.17,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(150,90,160,.9)',letterSpacing:'8px'}},
   {kind:'text',text:'new beginnings',x:0.5,y:0.9,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(150,90,160,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Spring Joy',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b5a9c'}},
 ]},

// HOLIDAY — Mother's Bouquet (2 photos, roses + script)
{id:'occ_hol_mom',name:"Mother's Bouquet",cat:'holiday',badge:'new',n:2,
 photoFrames:[{rx:.08,ry:.24,rw:.38,rh:.5,angle:0},{rx:.54,ry:.24,rw:.38,rh:.5,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft blush + cream gradient
   drawGrainGradient(ctx,W,H,'#fdf0ec','#f7d8d2',180,.05,44);
   // Watercolor blooms
   drawWatercolorBlob(ctx,W*.15,H*.15,S*.22,'#e89a94',.3);
   drawWatercolorBlob(ctx,W*.85,H*.85,S*.24,'#c87a74',.28);
   // Script watermark "Mama"
   drawScriptWatermark(ctx,'Mama',W*.5,H*.5,H*.22,'rgba(180,90,100,.12)');
   // Rose garland at top
   drawRose(ctx,W*.3,H*.12,S*.05,0,'#c95a5a');
   drawRose(ctx,W*.5,H*.08,S*.06,.2,'#e57373');
   drawRose(ctx,W*.7,H*.12,S*.05,0,'#c95a5a');
   drawRose(ctx,W*.38,H*.14,S*.035,-.3,'#e8a4a4');
   drawRose(ctx,W*.62,H*.14,S*.035,.3,'#e8a4a4');
   // Botanical between roses
   drawBotanicalSpray(ctx,W*.2,H*.1,S*.15,-Math.PI*.2,'#8fb883');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.8,H*.1,S*.15,-Math.PI*.2,'#8fb883');ctx.restore();
   // Rose garland at bottom
   drawRose(ctx,W*.5,H*.82,S*.06,0,'#b84545');
   drawRose(ctx,W*.42,H*.85,S*.04,.3,'#d87575');
   drawRose(ctx,W*.58,H*.85,S*.04,-.3,'#d87575');
   // Hearts scattered
   const drawHeart=(cx,cy,size,color)=>{
     ctx.save();ctx.translate(cx,cy);ctx.fillStyle=color;
     ctx.beginPath();
     ctx.moveTo(0,size*.3);
     ctx.bezierCurveTo(-size*.8,-size*.5,-size*.5,-size,0,-size*.3);
     ctx.bezierCurveTo(size*.5,-size,size*.8,-size*.5,0,size*.3);
     ctx.fill();ctx.restore();
   };
   drawHeart(W*.08,H*.5,S*.02,'rgba(200,90,90,.7)');
   drawHeart(W*.92,H*.5,S*.02,'rgba(200,90,90,.7)');
   drawOrnamentalBorder(ctx,W,H,'rgba(180,80,90,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'HAPPY MOTHERS DAY',x:0.5,y:0.185,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(180,60,70,.9)',letterSpacing:'7px'}},
   {kind:'text',text:'with love',x:0.5,y:0.9,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(180,60,70,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Love You Mom',x:0.5,y:0.93,align:'center',style:{fontSize:'26px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#b8404c'}},
 ]},

// TRAVEL — Vintage Passport (4 photos, stamps + sepia)
{id:'occ_travel_passport',name:'Passport Stamp',cat:'travel',badge:'new',n:4,
 photoFrames:[{rx:.07,ry:.2,rw:.4,rh:.3,angle:-2},{rx:.53,ry:.18,rw:.4,rh:.3,angle:2},{rx:.07,ry:.55,rw:.4,rh:.3,angle:3},{rx:.53,ry:.57,rw:.4,rh:.3,angle:-2}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sepia parchment gradient
   drawGrainGradient(ctx,W,H,'#f0e2c4','#d9bf8f',180,.08,77);
   // Faint map-dot world map
   const rng=seededRng(101);
   ctx.fillStyle='rgba(90,60,30,.12)';
   for(let i=0;i<280;i++){
     const x=rng()*W,y=rng()*H,r=S*.0008+rng()*S*.0022;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Dashed "travel route" curves
   ctx.strokeStyle='rgba(90,60,30,.45)';ctx.lineWidth=Math.max(.8,S*.0015);
   ctx.setLineDash([S*.012,S*.008]);
   ctx.beginPath();
   ctx.moveTo(W*.12,H*.3);ctx.bezierCurveTo(W*.35,H*.05,W*.65,H*.1,W*.88,H*.3);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(W*.12,H*.7);ctx.bezierCurveTo(W*.35,H*.95,W*.65,H*.9,W*.88,H*.7);
   ctx.stroke();
   ctx.setLineDash([]);
   // Multiple vintage stamps scattered
   drawStampCircle(ctx,W*.11,H*.1,S*.06,'#6b2828','PAR');
   drawStampCircle(ctx,W*.89,H*.1,S*.06,'#2a5b3a','TYO');
   drawStampCircle(ctx,W*.11,H*.9,S*.06,'#8b3a1c','NYC');
   drawStampCircle(ctx,W*.89,H*.9,S*.06,'#4a3a6b','ROM');
   // Central wax seal
   drawWaxSeal(ctx,W*.5,H*.5,S*.06,'#8b1a1a','T');
   // Washi tape on photos
   drawWashiTape(ctx,W*.2,H*.18,S*.1,S*.022,-Math.PI*.03,'#c88a4a');
   drawWashiTape(ctx,W*.7,H*.16,S*.1,S*.022,Math.PI*.03,'#6b7a5a');
   drawWashiTape(ctx,W*.2,H*.88,S*.1,S*.022,Math.PI*.03,'#8b3a1c');
   drawWashiTape(ctx,W*.7,H*.89,S*.1,S*.022,-Math.PI*.03,'#c88a4a');
   drawOrnamentalBorder(ctx,W,H,'rgba(90,60,30,.6)',Math.max(10,S*.02));
 },
 canvasElements:[
   {kind:'text',text:'THE TRAVELER S LOGBOOK',x:0.5,y:0.05,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(90,60,30,.9)',letterSpacing:'8px'}},
   {kind:'text',text:'chapter one',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(90,60,30,.75)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Stamped & Lived',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6b4226'}},
 ]},

// FAMILY — Heirloom Portrait (1 photo, rich deco)
{id:'occ_fam_heirloom',name:'Heirloom',cat:'family',badge:'new',n:1,
 photoFrames:[{rx:0.299,ry:0.306,rw:0.4,rh:0.491,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep emerald velvet gradient
   drawGrainGradient(ctx,W,H,'#0a2e22','#164433',180,.05,113);
   // Gold bokeh hinting candle glow
   drawBokeh(ctx,W,H,16,'#d4af37',55);
   // Central sunburst behind photo
   drawSunburst(ctx,W*.5,H*.5,S*.08,S*.55,42,'rgba(212,175,55,.1)');
   // Ornate arch frame around photo
   drawArchFrame(ctx,W*.22-S*.018,H*.22-S*.018,W*.56+S*.036,H*.56+S*.036,'rgba(212,175,55,.85)',Math.max(2,S*.003));
   // Gold leaf corners (sx,sy flip for mirror)
   drawGoldLeafCorner(ctx,W*.05,H*.05,S*.07,1,1,'#d4af37');
   drawGoldLeafCorner(ctx,W*.95,H*.05,S*.07,-1,1,'#d4af37');
   drawGoldLeafCorner(ctx,W*.05,H*.95,S*.07,1,-1,'#d4af37');
   drawGoldLeafCorner(ctx,W*.95,H*.95,S*.07,-1,-1,'#d4af37');
   // Double gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.75)',Math.max(10,S*.02));
   drawDecoFrame(ctx,S*.04,S*.04,W-S*.08,H-S*.08,'rgba(212,175,55,.5)',Math.max(1,S*.0015));
   // Vignette for depth
   drawVignette(ctx,W,H,.45);
 },
 canvasElements:[
   {kind:'text',text:'THE HEIRLOOM COLLECTION',x:0.5,y:0.06,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'8px'}},
   {kind:'text',text:'volume one',x:0.5,y:0.11,align:'center',style:{fontSize:'10px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(255,235,180,.7)',letterSpacing:'3px'}},
   {kind:'text',text:'our',x:0.5,y:0.85,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.8)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Treasured Ones',x:0.5,y:0.87,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
   {kind:'text',text:'EST. 2026',x:0.5,y:0.94,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.75)',letterSpacing:'7px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// NEW PREMIUM TEMPLATES — 2026 DROP 3
// Fresh aesthetics: Y2K cyber, Lunar New Year, Eid, Disco, Pop-art friends, Concert
// ═══════════════════════════════════════════════════════════════

// BIRTHDAY — Y2K Cyber (4 photos, holographic chrome aesthetic)
{id:'occ_bday_y2k',name:'Y2K Cyber',cat:'birthday',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.16,rw:.42,rh:.32,angle:0},{rx:.52,ry:.16,rw:.42,rh:.32,angle:0},{rx:.06,ry:.54,rw:.42,rh:.32,angle:0},{rx:.52,ry:.54,rw:.42,rh:.32,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Holographic gradient: cyan → pink → purple
   const g=ctx.createLinearGradient(0,0,W,H);
   g.addColorStop(0,'#00f0ff');g.addColorStop(.4,'#ff7ee5');g.addColorStop(.7,'#a07eff');g.addColorStop(1,'#5a2eff');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.12,42);
   // Iridescent shimmer streaks
   const rng=seededRng(99);
   for(let i=0;i<14;i++){
     const sy=rng()*H, sx=rng()*W*.3, sw=W*.4+rng()*W*.4;
     const sh=ctx.createLinearGradient(sx,sy,sx+sw,sy);
     sh.addColorStop(0,'rgba(255,255,255,0)');
     sh.addColorStop(.5,'rgba(255,255,255,.18)');
     sh.addColorStop(1,'rgba(255,255,255,0)');
     ctx.fillStyle=sh;ctx.fillRect(sx,sy,sw,S*.012);
   }
   // Y2K star bursts in corners
   [[W*.08,H*.08],[W*.92,H*.08],[W*.08,H*.92],[W*.92,H*.92],[W*.5,H*.5]].forEach(([x,y])=>
     drawStarburst8(ctx,x,y,S*.022,'rgba(255,255,255,.85)'));
   // Halftone band top only — bottom band removed to clear text zone
   drawHalftoneDots(ctx,W*.05,H*.02,W*.9,H*.07,12,'rgba(255,255,255,.5)','right');
   // Chrome border with double stroke
   ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(2,S*.0035);
   ctx.strokeRect(S*.018,S*.018,W-S*.036,H-S*.036);
   ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.strokeRect(S*.034,S*.034,W-S*.068,H-S*.068);
 },
 canvasElements:[
   {kind:'text',text:'★ CYBER BIRTHDAY ★',x:0.5,y:0.06,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#fff',letterSpacing:'5px'}},
   {kind:'text',text:'level up',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,255,255,.95)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Loading: AGE+1',x:0.5,y:0.94,align:'center',style:{fontSize:'18px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#fff',letterSpacing:'2px'}},
 ]},

// HOLIDAY — Lunar New Year (4 photos, red + gold prosperity)
{id:'occ_xmas_lunar',name:'Lunar New Year',cat:'holiday',badge:'new',n:4,
 photoFrames:[{rx:.08,ry:.18,rw:.4,rh:.32,angle:0},{rx:.52,ry:.18,rw:.4,rh:.32,angle:0},{rx:.08,ry:.55,rw:.4,rh:.32,angle:0},{rx:.52,ry:.55,rw:.4,rh:.32,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep crimson gradient
   drawGrainGradient(ctx,W,H,'#9c1a1a','#5c0d0d',180,.06,77);
   // Gold cloud-pattern (auspicious motif) corners
   const cloud=(cx,cy,size,col)=>{
     ctx.save();ctx.translate(cx,cy);
     ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.2,S*.002);ctx.lineCap='round';
     // Stylized swirl
     ctx.beginPath();
     ctx.arc(0,0,size*.4,0,Math.PI*1.5);
     ctx.arc(size*.3,0,size*.25,Math.PI*.5,Math.PI*1.8);
     ctx.arc(size*.5,size*.15,size*.18,0,Math.PI*1.6);
     ctx.stroke();
     ctx.restore();
   };
   cloud(W*.08,H*.08,S*.08,'rgba(212,175,55,.55)');
   ctx.save();ctx.scale(-1,1);cloud(-W*.92,H*.08,S*.08,'rgba(212,175,55,.55)');ctx.restore();
   ctx.save();ctx.scale(1,-1);cloud(W*.08,-H*.92,S*.08,'rgba(212,175,55,.55)');ctx.restore();
   ctx.save();ctx.scale(-1,-1);cloud(-W*.92,-H*.92,S*.08,'rgba(212,175,55,.55)');ctx.restore();
   // Hanging lantern silhouettes top corners
   const lantern=(cx,cy,size)=>{
     ctx.save();ctx.translate(cx,cy);
     // String
     ctx.strokeStyle='rgba(212,175,55,.65)';ctx.lineWidth=Math.max(1,S*.0015);
     ctx.beginPath();ctx.moveTo(0,-size*.8);ctx.lineTo(0,-size*.4);ctx.stroke();
     // Lantern body
     ctx.fillStyle='#d4af37';ctx.beginPath();
     ctx.ellipse(0,0,size*.42,size*.5,0,0,Math.PI*2);ctx.fill();
     // Cap top + bottom
     ctx.fillRect(-size*.32,-size*.5,size*.64,size*.08);
     ctx.fillRect(-size*.32,size*.42,size*.64,size*.08);
     // Tassel
     ctx.strokeStyle='#b89422';ctx.lineWidth=Math.max(1,S*.0012);
     for(let i=-2;i<=2;i++){
       ctx.beginPath();ctx.moveTo(i*size*.06,size*.5);ctx.lineTo(i*size*.06,size*.75);ctx.stroke();
     }
     // Vertical stripe details on body
     ctx.strokeStyle='rgba(140,60,30,.6)';ctx.lineWidth=Math.max(.8,S*.001);
     ctx.beginPath();ctx.moveTo(0,-size*.45);ctx.lineTo(0,size*.45);ctx.stroke();
     ctx.restore();
   };
   lantern(W*.18,H*.06,S*.07);
   lantern(W*.82,H*.06,S*.07);
   // Chinese knot motif at bottom center (stylized diamond)
   ctx.save();ctx.translate(W*.5,H*.95);
   ctx.strokeStyle='#d4af37';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.beginPath();ctx.moveTo(0,-S*.025);ctx.lineTo(S*.025,0);ctx.lineTo(0,S*.025);ctx.lineTo(-S*.025,0);ctx.closePath();ctx.stroke();
   ctx.beginPath();ctx.arc(0,0,S*.012,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // Gold ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.7)',Math.max(10,S*.02));
   drawDecoFrame(ctx,S*.045,S*.045,W-S*.09,H-S*.09,'rgba(212,175,55,.45)',Math.max(1,S*.0015));
 },
 canvasElements:[
   {kind:'text',text:'XIN NIAN KUAI LE',x:0.5,y:0.058,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.9)',letterSpacing:'8px'}},
   {kind:'text',text:'fortune',x:0.5,y:0.088,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,235,180,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Year of Joy',x:0.5,y:0.11,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
 ]},

// HOLIDAY — Eid Mubarak (3 photos, crescent + Islamic geometric patterns)
{id:'occ_hol_eid',name:'Eid Mubarak',cat:'holiday',badge:'new',n:3,
 photoFrames:[{rx:.08,ry:.24,rw:.26,rh:.46,angle:0},{rx:.37,ry:.24,rw:.26,rh:.46,angle:0},{rx:.66,ry:.24,rw:.26,rh:.46,angle:0}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep emerald to forest green gradient
   drawGrainGradient(ctx,W,H,'#0a3d2e','#16614a',180,.05,55);
   // Geometric Islamic 8-point star pattern across bg
   const star8=(cx,cy,r,col)=>{
     ctx.save();ctx.translate(cx,cy);
     ctx.strokeStyle=col;ctx.lineWidth=Math.max(.8,S*.0015);
     // Two overlapping squares form 8-point star
     ctx.beginPath();ctx.rect(-r,-r,r*2,r*2);ctx.stroke();
     ctx.save();ctx.rotate(Math.PI/4);ctx.beginPath();ctx.rect(-r,-r,r*2,r*2);ctx.stroke();ctx.restore();
     ctx.restore();
   };
   const tile=S*.07;
   for(let y=tile;y<H;y+=tile*1.6){
     for(let x=tile*((y/(tile*1.6))%2?.8:0);x<W;x+=tile*1.6){
       star8(x,y,tile*.35,'rgba(212,175,55,.12)');
     }
   }
   // Large crescent moon top right
   ctx.save();
   ctx.fillStyle='rgba(212,175,55,.85)';
   ctx.beginPath();ctx.arc(W*.85,H*.13,S*.075,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#0a3d2e';
   ctx.beginPath();ctx.arc(W*.87,H*.115,S*.07,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // Single small star next to crescent
   drawStarburst8(ctx,W*.73,H*.085,S*.018,'rgba(212,175,55,.95)');
   // Mosque-arch silhouette behind the photos (decorative)
   ctx.save();
   ctx.fillStyle='rgba(212,175,55,.08)';
   ctx.beginPath();
   ctx.moveTo(W*.5,H*.78);
   ctx.lineTo(W*.5,H*.4);
   ctx.arc(W*.5,H*.4,W*.04,Math.PI,0);
   ctx.lineTo(W*.58,H*.78);
   ctx.closePath();
   ctx.fill();
   ctx.restore();
   // Arabesque corner ornaments
   const arabesque=(cx,cy,size)=>{
     ctx.save();ctx.translate(cx,cy);
     ctx.strokeStyle='rgba(212,175,55,.7)';ctx.lineWidth=Math.max(1,S*.0018);ctx.lineCap='round';
     for(let i=0;i<8;i++){
       ctx.save();ctx.rotate(i*Math.PI/4);
       ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.4,-size*.25,size*.7,0);
       ctx.quadraticCurveTo(size*.4,size*.25,0,0);ctx.stroke();
       ctx.restore();
     }
     ctx.restore();
   };
   arabesque(W*.08,H*.93,S*.04);
   arabesque(W*.92,H*.93,S*.04);
   // Ornamental gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'EID MUBARAK',x:0.18,y:0.06,align:'left',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'5px'}},
   {kind:'text',text:'with',x:0.5,y:0.83,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(212,175,55,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Blessed Hearts',x:0.5,y:0.87,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
   {kind:'text',text:'EID AL FITR',x:0.5,y:0.925,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.7)',letterSpacing:'7px'}},
 ]},

// BIRTHDAY — Disco Glam (4 photos, mirror ball + neon)
{id:'occ_bday_disco',name:'Disco Glam',cat:'birthday',badge:'new',n:4,
 photoFrames:[{rx:.07,ry:.18,rw:.4,rh:.3,angle:-2},{rx:.53,ry:.18,rw:.4,rh:.3,angle:2},{rx:.07,ry:.54,rw:.4,rh:.3,angle:2},{rx:.53,ry:.54,rw:.4,rh:.3,angle:-2}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep purple-magenta gradient
   const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H));
   g.addColorStop(0,'#5e1a52');g.addColorStop(1,'#1a0922');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Stage spotlight beams from top
   ctx.save();
   const beam=(angle,col,width)=>{
     ctx.save();ctx.translate(W*.5,0);
     ctx.rotate(angle);
     const lg=ctx.createLinearGradient(0,0,0,H*1.2);
     lg.addColorStop(0,col);lg.addColorStop(1,'rgba(0,0,0,0)');
     ctx.fillStyle=lg;
     ctx.beginPath();
     ctx.moveTo(-width/2,0);ctx.lineTo(width/2,0);
     ctx.lineTo(width*1.5,H*1.2);ctx.lineTo(-width*1.5,H*1.2);
     ctx.closePath();ctx.fill();
     ctx.restore();
   };
   beam(-Math.PI*.15,'rgba(255,138,222,.18)',S*.06);
   beam(0,'rgba(173,138,255,.2)',S*.07);
   beam(Math.PI*.15,'rgba(138,210,255,.18)',S*.06);
   ctx.restore();
   // Mirror ball top center
   const ballX=W*.5,ballY=H*.1,r=S*.055;
   const mg=ctx.createRadialGradient(ballX-r*.3,ballY-r*.3,0,ballX,ballY,r);
   mg.addColorStop(0,'#fff');mg.addColorStop(.4,'#d8d8e8');mg.addColorStop(1,'#5a5a72');
   ctx.fillStyle=mg;ctx.beginPath();ctx.arc(ballX,ballY,r,0,Math.PI*2);ctx.fill();
   // Mirror ball facets (grid)
   ctx.strokeStyle='rgba(80,80,100,.7)';ctx.lineWidth=Math.max(.8,S*.001);
   for(let i=-3;i<=3;i++){
     ctx.beginPath();ctx.ellipse(ballX,ballY,r,Math.abs(i)*r/4,0,0,Math.PI*2);ctx.stroke();
     ctx.beginPath();ctx.ellipse(ballX,ballY,Math.abs(i)*r/4,r,0,0,Math.PI*2);ctx.stroke();
   }
   // String to top
   ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=Math.max(.8,S*.001);
   ctx.beginPath();ctx.moveTo(ballX,ballY-r);ctx.lineTo(ballX,0);ctx.stroke();
   // Reflected light dots scattered
   const rng=seededRng(33);
   const dotCols=['#ff8ade','#ad8aff','#8ad2ff','#fff'];
   for(let i=0;i<60;i++){
     const x=rng()*W, y=H*.18+rng()*H*.75, sz=S*.005+rng()*S*.012;
     ctx.fillStyle=dotCols[Math.floor(rng()*dotCols.length)];
     ctx.globalAlpha=.4+rng()*.5;
     ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=1;
   // Confetti ribbon — placed in the gap between photos (end y=.84) and text (y=.91)
   drawConfettiRibbon(ctx,H*.85,W,H*.05,55,['#ff6bcf','#a06bff','#6bd4ff','#fff','#d4af37']);
   // Neon-glow border
   ctx.shadowColor='#ff6bcf';ctx.shadowBlur=S*.012;
   ctx.strokeStyle='#ff6bcf';ctx.lineWidth=Math.max(1.5,S*.0025);
   const bp=Math.max(8,S*.02);
   ctx.strokeRect(bp,bp,W-bp*2,H-bp*2);
   ctx.shadowBlur=0;
 },
 canvasElements:[
   {kind:'text',text:'★ DISCO BIRTHDAY ★',x:0.5,y:0.05,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#ff8ade',letterSpacing:'5px',textShadow:'0 0 12px #ff6bcf'}},
   {kind:'text',text:'dance like',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,255,255,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Nobody is Watching',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#fff',textShadow:'0 0 16px rgba(255,138,222,.7)'}},
 ]},

// FAMILY — Pop-Art Squad (4 photos, Lichtenstein dots + comic burst)
{id:'occ_fam_popart',name:'Pop Art Squad',cat:'family',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.08,rw:.42,rh:.34,angle:-3},{rx:.54,ry:.12,rw:.4,rh:.32,angle:2},{rx:.06,ry:.5,rw:.4,rh:.32,angle:3},{rx:.54,ry:.54,rw:.4,rh:.34,angle:-2}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Bright cream
   drawGrainGradient(ctx,W,H,'#fff8e5','#ffe9b8',180,.05,42);
   // Big sunburst behind everything
   drawSunburst(ctx,W*.5,H*.5,0,W*.7,32,'rgba(255,200,80,.18)');
   // Lichtenstein-style halftone dot panel
   const dotPanel=(x,y,w,h,col,size)=>{
     ctx.save();
     ctx.fillStyle=col;
     for(let i=0;i<w;i+=size*2){
       for(let j=(((i/(size*2))%2)?size:0);j<h;j+=size*2){
         ctx.beginPath();ctx.arc(x+i,y+j,size*.5,0,Math.PI*2);ctx.fill();
       }
     }
     ctx.restore();
   };
   dotPanel(W*.04,H*.02,W*.4,H*.06,'rgba(220,40,90,.6)',S*.013);
   dotPanel(W*.56,H*.92,W*.4,H*.06,'rgba(220,40,90,.6)',S*.013);
   // Comic-book "BAM!" speech bubble top right
   ctx.save();
   ctx.fillStyle='#ffe22a';
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(2,S*.004);
   ctx.lineJoin='round';
   const burst=(cx,cy,r,points)=>{
     ctx.beginPath();
     for(let i=0;i<points*2;i++){
       const a=i*Math.PI/points;
       const rr=i%2?r:r*.65;
       const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr;
       if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
     }
     ctx.closePath();ctx.fill();ctx.stroke();
   };
   burst(W*.92,H*.5,S*.075,12);
   ctx.fillStyle='#1a1a1a';
   ctx.font=`900 ${S*.04}px 'Outfit',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('FAM!',W*.92,H*.5);
   ctx.restore();
   // Bold black border (comic frame)
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(3,S*.006);
   ctx.strokeRect(S*.012,S*.012,W-S*.024,H-S*.024);
   // Diagonal "speed lines" decoration corner
   ctx.save();ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(1.5,S*.0025);
   for(let i=0;i<6;i++){
     const o=S*.05+i*S*.025;
     ctx.beginPath();ctx.moveTo(W*.05,H*.5+o);ctx.lineTo(W*.18,H*.5+o*.4);ctx.stroke();
   }
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'★ THE FAMILY ★',x:0.75,y:0.05,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'4px'}},
   {kind:'text',text:'POW!',x:0.25,y:0.88,align:'center',style:{fontSize:'40px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',fontStyle:'italic',color:'#dc285a',letterSpacing:'-2px'}},
 ]},

// TRAVEL — Concert Festival (4 photos, festival pass aesthetic)
{id:'occ_travel_concert',name:'Festival Pass',cat:'travel',badge:'new',n:4,
 photoFrames:[{rx:.06,ry:.18,rw:.42,rh:.32,angle:-2},{rx:.52,ry:.18,rw:.42,rh:.32,angle:2},{rx:.06,ry:.55,rw:.42,rh:.32,angle:2},{rx:.52,ry:.55,rw:.42,rh:.32,angle:-2}],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sunset gradient: amber → coral → magenta
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#1a0826');g.addColorStop(.45,'#7d1a52');g.addColorStop(.8,'#e8541c');g.addColorStop(1,'#f5a020');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.08,33);
   // Big sun on horizon
   const sunY=H*.55;
   const sunG=ctx.createRadialGradient(W*.5,sunY,0,W*.5,sunY,S*.18);
   sunG.addColorStop(0,'rgba(255,235,180,.95)');sunG.addColorStop(.4,'rgba(255,180,80,.6)');sunG.addColorStop(1,'rgba(255,120,60,0)');
   ctx.fillStyle=sunG;ctx.fillRect(0,sunY-S*.2,W,S*.4);
   // Palm tree silhouettes left + right
   const palm=(cx,cy,size,sx)=>{
     ctx.save();ctx.translate(cx,cy);ctx.scale(sx,1);
     ctx.fillStyle='#1a0826';
     // Trunk (curved)
     ctx.beginPath();
     ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.05,-size*.4,size*.12,-size*.85);
     ctx.lineTo(size*.16,-size*.85);ctx.quadraticCurveTo(size*.09,-size*.4,size*.04,0);
     ctx.closePath();ctx.fill();
     // Fronds
     ctx.translate(size*.14,-size*.85);
     for(let i=0;i<7;i++){
       ctx.save();ctx.rotate(-Math.PI*.5+i*Math.PI/8-Math.PI/16);
       ctx.beginPath();
       ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.18,-size*.04,size*.32,size*.06);
       ctx.quadraticCurveTo(size*.22,size*.02,0,size*.025);
       ctx.closePath();ctx.fill();
       ctx.restore();
     }
     ctx.restore();
   };
   palm(W*.05,H*.95,S*.4,1);
   palm(W*.95,H*.95,S*.4,-1);
   // Retro grid floor (vaporwave)
   ctx.save();
   ctx.strokeStyle='rgba(255,200,120,.4)';ctx.lineWidth=Math.max(1,S*.0015);
   const horizon=H*.85;
   for(let i=0;i<10;i++){
     const t=i/10;
     const y=horizon+t*(H-horizon);
     const xL=W*.5-((W*.5)*(1+t*1.2));
     const xR=W*.5+((W*.5)*(1+t*1.2));
     ctx.beginPath();ctx.moveTo(xL,y);ctx.lineTo(xR,y);ctx.stroke();
   }
   for(let i=-6;i<=6;i++){
     const xt=W*.5+i*W*.06;
     ctx.beginPath();
     ctx.moveTo(xt,horizon);
     const dir=i>0?1:i<0?-1:0;
     ctx.lineTo(W*.5+dir*W*.9,H);
     ctx.stroke();
   }
   ctx.restore();
   // Stars in sky
   const rng=seededRng(11);
   ctx.fillStyle='rgba(255,255,255,.85)';
   for(let i=0;i<70;i++){
     const x=rng()*W, y=rng()*H*.4, r=S*.001+rng()*S*.0025;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Ticket-stub corners (washi tape)
   drawWashiTape(ctx,W*.18,H*.16,S*.1,S*.022,-Math.PI*.04,'#ffaa3a');
   drawWashiTape(ctx,W*.82,H*.16,S*.1,S*.022,Math.PI*.04,'#ff5a8a');
   drawWashiTape(ctx,W*.18,H*.87,S*.1,S*.022,Math.PI*.04,'#a060ff');
   drawWashiTape(ctx,W*.82,H*.87,S*.1,S*.022,-Math.PI*.04,'#ffaa3a');
   // Hairline white border
   ctx.strokeStyle='rgba(255,235,180,.5)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.strokeRect(S*.018,S*.018,W-S*.036,H-S*.036);
 },
 canvasElements:[
   {kind:'text',text:'★ FESTIVAL PASS ★',x:0.5,y:0.05,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,235,180,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'live music',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,235,180,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Sunset Sessions',x:0.5,y:0.94,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#ffd28a'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// SHAPE-CARD TEMPLATES — heart, star, circle, hexagon, diamond cells
// ═══════════════════════════════════════════════════════════════

// ANNIVERSARY — Hero Heart (asymmetric: 1 large + 2 small, mocha + dusty pink)
{id:'occ_ann_hearts',name:'Love Letter',cat:'anniversary',badge:'new',n:3,
 photoFrames:[
   // Hero heart center-left, two smaller satellite hearts at varied sizes/angles
   {rx:.1,ry:.18,rw:.42,rh:.5,angle:-2,shape:'heart'},
   {rx:.58,ry:.14,rw:.28,rh:.32,angle:6,shape:'heart'},
   {rx:.62,ry:.45,rw:.3,rh:.35,angle:-4,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged cream parchment with subtle warm gradient (love letter feel)
   drawGrainGradient(ctx,W,H,'#f4ede0','#e8d6c2',135,.07,87);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,80,60,.12)',6);
   // Subtle horizontal "letter lines" — the look of a handwritten note
   ctx.strokeStyle='rgba(120,80,60,.06)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let y=H*.16;y<H*.84;y+=H*.04){
     ctx.beginPath();ctx.moveTo(W*.05,y);ctx.lineTo(W*.95,y);ctx.stroke();
   }
   // Wax seal in top-right corner — "love letter" detail
   drawWaxSeal(ctx,W*.88,H*.09,S*.045,'#9c3a4a','L');
   // Vintage postage stamp top-left
   ctx.save();ctx.translate(W*.08,H*.08);ctx.rotate(-Math.PI*.06);
   ctx.fillStyle='#c4a878';ctx.fillRect(-S*.05,-S*.06,S*.1,S*.12);
   ctx.fillStyle='#8b3a4a';ctx.font=`italic 700 ${S*.018}px 'Playfair Display',serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Amour',0,0);
   ctx.fillStyle='#8b3a4a';ctx.font=`600 ${S*.012}px 'Outfit',sans-serif`;
   ctx.fillText('1¢',0,S*.04);
   ctx.restore();
   // Hand-drawn arrow-flourish connecting the hero heart to the small ones
   ctx.strokeStyle='rgba(155,90,100,.55)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.lineCap='round';ctx.setLineDash([S*.01,S*.012]);
   ctx.beginPath();
   ctx.moveTo(W*.45,H*.43);
   ctx.bezierCurveTo(W*.55,H*.35,W*.6,H*.32,W*.7,H*.32);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(W*.45,H*.55);
   ctx.bezierCurveTo(W*.58,H*.62,W*.65,H*.65,W*.74,H*.65);
   ctx.stroke();
   ctx.setLineDash([]);
   // Small arrowhead glyphs at the connection points
   const arrowhead=(x,y,a)=>{
     ctx.save();ctx.translate(x,y);ctx.rotate(a);
     ctx.fillStyle='rgba(155,90,100,.7)';
     ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-S*.012,-S*.006);ctx.lineTo(-S*.012,S*.006);ctx.closePath();ctx.fill();
     ctx.restore();
   };
   arrowhead(W*.7,H*.32,Math.PI*.05);
   arrowhead(W*.74,H*.65,-Math.PI*.05);
   // Pressed botanical sprig at bottom-left as a decorative anchor
   drawBareBranch(ctx,W*.08,H*.78,S*.16,Math.PI*.2,'#7a6042');
   drawBareBranch(ctx,W*.05,H*.92,S*.12,-Math.PI*.15,'#7a6042');
   // Faint script watermark in cream tone
   drawScriptWatermark(ctx,'Forever',W*.32,H*.93,H*.09,'rgba(120,80,60,.12)');
   // Thin double-line border (vintage stationery edge)
   ctx.strokeStyle='rgba(120,80,60,.55)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
   ctx.strokeStyle='rgba(120,80,60,.25)';
   ctx.strokeRect(m+S*.008,m+S*.008,W-(m+S*.008)*2,H-(m+S*.008)*2);
 },
 canvasElements:[
   {kind:'text',text:'a love letter',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(120,80,60,.7)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'My Dearest,',x:0.5,y:0.86,align:'center',style:{fontSize:'30px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#8b3a4a'}},
   {kind:'text',text:'EST. 2026  ·  STILL WRITING',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(120,80,60,.7)',letterSpacing:'5px'}},
 ]},

// GRADUATION — Constellation (1 hero star + 4 small in scattered constellation,
// aged cream + forest green + muted gold — academic / vintage poster aesthetic)
{id:'occ_grad_stars',name:'Constellation',cat:'graduation',badge:'new',n:5,
 photoFrames:[
   // 1 hero star top-center, 4 smaller stars in irregular constellation
   {rx:.34,ry:.08,rw:.32,rh:.32,angle:0,shape:'star'},
   {rx:.06,ry:.32,rw:.18,rh:.18,angle:0,shape:'star'},
   {rx:.76,ry:.34,rw:.18,rh:.18,angle:0,shape:'star'},
   {rx:.18,ry:.55,rw:.18,rh:.18,angle:0,shape:'star'},
   {rx:.64,ry:.58,rw:.18,rh:.18,angle:0,shape:'star'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged cream parchment — academic / vintage diploma feel
   drawGrainGradient(ctx,W,H,'#f5ecd6','#e6d3a8',180,.07,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(60,80,55,.08)',5);
   // Faint horizontal lines (notebook paper)
   ctx.strokeStyle='rgba(60,80,55,.06)';ctx.lineWidth=Math.max(.5,S*.0006);
   for(let y=H*.1;y<H*.78;y+=H*.035){
     ctx.beginPath();ctx.moveTo(W*.06,y);ctx.lineTo(W*.94,y);ctx.stroke();
   }
   // Hand-drawn dotted constellation lines connecting the stars
   ctx.strokeStyle='rgba(60,80,55,.5)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.lineCap='round';ctx.setLineDash([S*.005,S*.014]);
   const linkStars=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
   // Hero(top) → top-left → bottom-left → hero
   linkStars(W*.42,H*.24,W*.15,H*.41);
   linkStars(W*.15,H*.41,W*.27,H*.64);
   linkStars(W*.27,H*.64,W*.5,H*.4);
   // Hero → top-right → bottom-right
   linkStars(W*.58,H*.24,W*.85,H*.43);
   linkStars(W*.85,H*.43,W*.73,H*.67);
   linkStars(W*.73,H*.67,W*.5,H*.4);
   ctx.setLineDash([]);
   // Tiny twinkle stars scattered (hand-drawn 4-point sparkles, not gold sunburst)
   const sparkle=(x,y,r,col)=>{
     ctx.save();ctx.translate(x,y);ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(0,-r);ctx.lineTo(r*.18,-r*.18);ctx.lineTo(r,0);
     ctx.lineTo(r*.18,r*.18);ctx.lineTo(0,r);ctx.lineTo(-r*.18,r*.18);
     ctx.lineTo(-r,0);ctx.lineTo(-r*.18,-r*.18);ctx.closePath();ctx.fill();
     ctx.restore();
   };
   const rng=seededRng(33);
   for(let i=0;i<22;i++){
     const x=rng()*W,y=rng()*H*.85,r=S*.005+rng()*S*.011;
     sparkle(x,y,r,`rgba(125,90,30,${.4+rng()*.5})`);
   }
   // Wax seal at bottom — academic crest feel
   drawWaxSeal(ctx,W*.5,H*.86,S*.05,'#2a4a3a','★');
   // Subtle laurel sprigs flanking the seal
   drawBotanicalSpray(ctx,W*.38,H*.86,S*.07,Math.PI*.5,'rgba(60,90,55,.65)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.62,H*.86,S*.07,Math.PI*.5,'rgba(60,90,55,.65)');ctx.restore();
   // Thin double border (vintage diploma edge)
   ctx.strokeStyle='rgba(60,80,55,.6)';ctx.lineWidth=Math.max(1.2,S*.0018);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
   ctx.strokeStyle='rgba(60,80,55,.3)';
   ctx.strokeRect(m+S*.01,m+S*.01,W-(m+S*.01)*2,H-(m+S*.01)*2);
 },
 canvasElements:[
   {kind:'text',text:'graduating class',x:0.5,y:0.04,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(60,80,55,.75)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'MMXXVI',x:0.5,y:0.93,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#2a4a3a',letterSpacing:'8px'}},
 ]},

// FAMILY — Salon Wall (1 hero circle + 3 satellites — magazine editorial,
// warm sand + dusty rose + sage)
{id:'occ_fam_circles',name:'Salon Wall',cat:'family',badge:'new',n:4,
 photoFrames:[
   // Magazine-editorial: one large hero portrait + three smaller around
   {rx:.06,ry:.18,rw:.5,rh:.5,angle:0,shape:'circle'},
   {rx:.6,ry:.1,rw:.3,rh:.3,angle:0,shape:'circle'},
   {rx:.62,ry:.42,rw:.28,rh:.28,angle:0,shape:'circle'},
   {rx:.34,ry:.7,rw:.32,rh:.18,angle:0,shape:'ellipse'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm sand → bone, with a pressed-rose color story
   drawGrainGradient(ctx,W,H,'#f0e7d6','#dccab2',135,.06,42);
   drawLinenTexture(ctx,0,0,W,H,'rgba(100,90,70,.1)',5);
   // Soft dusty-rose wash bottom-right (asymmetric color anchor)
   drawWatercolorBlob(ctx,W*.85,H*.85,S*.5,'#c08077',.18);
   // Soft sage wash top-right
   drawWatercolorBlob(ctx,W*.92,H*.05,S*.35,'#8a9b73',.18);
   // Pressed flower silhouettes (botanical illustration feel — not photoreal roses)
   drawPressedFlower(ctx,W*.04,H*.7,S*.05,7,'rgba(125,75,70,.55)');
   drawPressedFlower(ctx,W*.93,H*.7,S*.04,5,'rgba(140,160,110,.6)');
   drawPressedFlower(ctx,W*.5,H*.04,S*.035,6,'rgba(140,160,110,.55)');
   // Pressed leaves trailing
   drawPineSprig(ctx,W*.04,H*.06,S*.13,Math.PI*.3,'rgba(140,160,110,.7)');
   ctx.save();ctx.scale(-1,1);drawPineSprig(ctx,-W*.96,H*.94,S*.13,Math.PI*.3,'rgba(140,160,110,.7)');ctx.restore();
   // Editorial column rule down the right side (magazine spread feel)
   ctx.strokeStyle='rgba(100,90,70,.45)';ctx.lineWidth=Math.max(.8,S*.001);
   ctx.beginPath();ctx.moveTo(W*.94,H*.18);ctx.lineTo(W*.94,H*.72);ctx.stroke();
   // Section marker at top-right of column
   ctx.fillStyle='rgba(100,90,70,.6)';
   ctx.font=`700 ${S*.013}px 'Outfit',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.save();ctx.translate(W*.97,H*.45);ctx.rotate(Math.PI/2);
   ctx.fillText('VOLUME · 01',0,0);
   ctx.restore();
   // Hairline frame (refined editorial border, not ornamental)
   ctx.strokeStyle='rgba(100,90,70,.35)';ctx.lineWidth=Math.max(.8,S*.001);
   const m=S*.018;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'the family',x:0.06,y:0.05,align:'left',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(100,90,70,.85)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'Salon',x:0.06,y:0.08,align:'left',style:{fontSize:'40px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#3d2e22',lineHeight:'1'}},
   {kind:'text',text:'a portrait collection · two thousand twenty six',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(100,90,70,.7)',letterSpacing:'4px'}},
 ]},

// WEDDING — Honeycomb (true offset honeycomb, 6 hexagons, bone + champagne + mauve)
{id:'occ_wed_honeycomb',name:'Honeycomb',cat:'wedding',badge:'new',n:6,
 photoFrames:[
   // True offset honeycomb pattern
   {rx:.15,ry:.14,rw:.22,rh:.25,angle:0,shape:'hexagon'},
   {rx:.39,ry:.14,rw:.22,rh:.25,angle:0,shape:'hexagon'},
   {rx:.63,ry:.14,rw:.22,rh:.25,angle:0,shape:'hexagon'},
   // Bottom row offset by half-hex width
   {rx:.27,ry:.46,rw:.22,rh:.25,angle:0,shape:'hexagon'},
   {rx:.51,ry:.46,rw:.22,rh:.25,angle:0,shape:'hexagon'},
   {rx:.39,ry:.78,rw:.22,rh:.25,angle:0,shape:'hexagon'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Bone white with a hint of cool mauve (refined wedding palette)
   drawGrainGradient(ctx,W,H,'#f5f0ea','#e6dad0',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,110,120,.12)',6);
   // Art deco fan corners (replaces honeycomb-pattern repeat)
   const drawFan=(cx,cy,r,sx,sy,col)=>{
     ctx.save();ctx.translate(cx,cy);ctx.scale(sx,sy);
     ctx.strokeStyle=col;ctx.lineWidth=Math.max(.8,S*.001);
     for(let i=0;i<7;i++){
       const a=i*Math.PI/14;
       ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,-Math.sin(a)*r);ctx.stroke();
     }
     for(let k=1;k<=4;k++){
       ctx.beginPath();ctx.arc(0,0,r*k/4,-Math.PI/2,0);ctx.stroke();
     }
     ctx.restore();
   };
   drawFan(0,0,S*.14,1,1,'rgba(180,140,120,.55)');
   drawFan(W,0,S*.14,-1,1,'rgba(180,140,120,.55)');
   drawFan(0,H,S*.14,1,-1,'rgba(180,140,120,.55)');
   drawFan(W,H,S*.14,-1,-1,'rgba(180,140,120,.55)');
   // Soft champagne wash behind the hexagons
   drawWatercolorBlob(ctx,W*.5,H*.5,S*.55,'#d4af9e',.15);
   // Tiny dusty-rose dots scattered (champagne bubbles feel)
   const rng=seededRng(77);
   for(let i=0;i<60;i++){
     const x=rng()*W,y=rng()*H,r=S*.0008+rng()*S*.0022;
     ctx.fillStyle=`rgba(180,140,120,${.3+rng()*.4})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Gold monogram amp behind center hex
   drawMonogram(ctx,'&',W*.5,H*.5,H*.4,'rgba(180,140,120,.16)');
   // Hairline border in dusty mauve
   ctx.strokeStyle='rgba(140,110,120,.45)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'we said yes',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(140,90,100,.8)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'mr & mrs',x:0.06,y:0.5,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,100,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'2026',x:0.94,y:0.5,align:'right',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,100,.85)',letterSpacing:'6px'}},
 ]},

// BIRTHDAY — Diamond Confetti (asymmetric diamond cluster, coral + cream + gold)
{id:'occ_bday_diamonds',name:'Confetti',cat:'birthday',badge:'new',n:5,
 photoFrames:[
   // Asymmetric cluster — one hero diamond + four scattered satellites
   {rx:.3,ry:.1,rw:.4,rh:.42,angle:0,shape:'diamond'},
   {rx:.06,ry:.25,rw:.2,rh:.21,angle:0,shape:'diamond'},
   {rx:.74,ry:.35,rw:.2,rh:.21,angle:0,shape:'diamond'},
   {rx:.16,ry:.6,rw:.22,rh:.23,angle:0,shape:'diamond'},
   {rx:.62,ry:.62,rw:.22,rh:.23,angle:0,shape:'diamond'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft coral → cream gradient (less neon, more refined party)
   const g=ctx.createLinearGradient(0,0,W,H);
   g.addColorStop(0,'#fff5ee');g.addColorStop(.5,'#fde0d4');g.addColorStop(1,'#f7c8b6');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,42);
   // Scattered confetti — small flat shapes (rectangles, circles, triangles)
   const rng=seededRng(11);
   const palette=['#e8a08a','#d4af37','#c87a90','#fff','#e8c56a'];
   for(let i=0;i<55;i++){
     const x=rng()*W,y=rng()*H,sz=S*.005+rng()*S*.011;
     const col=palette[Math.floor(rng()*palette.length)];
     const shape=Math.floor(rng()*3);
     ctx.save();ctx.translate(x,y);ctx.rotate(rng()*Math.PI*2);
     ctx.fillStyle=col;ctx.globalAlpha=.6+rng()*.35;
     if(shape===0)ctx.fillRect(-sz*.6,-sz*.18,sz*1.2,sz*.36);  // bar
     else if(shape===1){ctx.beginPath();ctx.arc(0,0,sz*.35,0,Math.PI*2);ctx.fill();} // dot
     else{ctx.beginPath();ctx.moveTo(0,-sz*.4);ctx.lineTo(sz*.4,sz*.3);ctx.lineTo(-sz*.4,sz*.3);ctx.closePath();ctx.fill();} // tri
     ctx.restore();
   }
   ctx.globalAlpha=1;
   // A single curved confetti ribbon arching across the top
   ctx.save();
   ctx.strokeStyle='rgba(216,127,144,.5)';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.lineCap='round';ctx.setLineDash([S*.012,S*.018]);
   ctx.beginPath();
   ctx.moveTo(W*.05,H*.07);
   ctx.bezierCurveTo(W*.3,H*.02,W*.7,H*.02,W*.95,H*.07);
   ctx.stroke();
   ctx.setLineDash([]);
   ctx.restore();
   // Hand-drawn squiggle accents in corners
   ctx.strokeStyle='rgba(212,175,55,.6)';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.lineCap='round';
   const squiggle=(x,y,sx,sy)=>{
     ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);
     ctx.beginPath();
     ctx.moveTo(0,0);
     ctx.bezierCurveTo(S*.02,-S*.015,S*.04,S*.015,S*.06,0);
     ctx.bezierCurveTo(S*.08,-S*.015,S*.1,S*.015,S*.12,0);
     ctx.stroke();ctx.restore();
   };
   squiggle(W*.06,H*.92,1,1);
   squiggle(W*.94,H*.92,-1,1);
   // Refined pink hairline border
   ctx.strokeStyle='rgba(216,127,144,.55)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'best day ever',x:0.5,y:0.86,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(180,90,80,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Hooray!',x:0.5,y:0.93,align:'center',style:{fontSize:'40px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#c4665c'}},
 ]},

// HOLIDAY — Two Hearts Cottagecore (sage + dusty terracotta + pressed wildflowers)
{id:'occ_hol_heartbouquet',name:'Wildflower Hearts',cat:'holiday',badge:'new',n:2,
 photoFrames:[
   // Asymmetric: slightly larger hero on left, satellite on right at offset height
   {rx:.05,ry:.15,rw:.46,rh:.55,angle:-3,shape:'heart'},
   {rx:.5,ry:.28,rw:.42,rh:.5,angle:5,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sage → butter-cream gradient (cottagecore palette, away from the rose family)
   drawGrainGradient(ctx,W,H,'#eef2dc','#e8d8b6',135,.06,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,140,90,.12)',6);
   // Soft terracotta watercolor wash
   drawWatercolorBlob(ctx,W*.18,H*.85,S*.4,'#c47a55',.18);
   drawWatercolorBlob(ctx,W*.85,H*.15,S*.32,'#b8a05a',.16);
   // Pressed wildflowers (replaces the rose garland)
   drawPressedFlower(ctx,W*.08,H*.06,S*.04,5,'rgba(155,75,55,.65)');
   drawPressedFlower(ctx,W*.18,H*.08,S*.03,7,'rgba(180,160,90,.65)');
   drawPressedFlower(ctx,W*.92,H*.92,S*.045,5,'rgba(155,75,55,.65)');
   drawPressedFlower(ctx,W*.83,H*.94,S*.03,7,'rgba(180,160,90,.65)');
   // Trailing pine sprigs along the diagonal whitespace between the two hearts
   drawPineSprig(ctx,W*.02,H*.4,S*.18,Math.PI*.15,'rgba(120,140,90,.7)');
   ctx.save();ctx.scale(-1,1);drawPineSprig(ctx,-W*.98,H*.6,S*.18,Math.PI*.15,'rgba(120,140,90,.7)');ctx.restore();
   // Two berries near the joining point
   drawBerryCluster(ctx,W*.5,H*.38,S*.025,'#9a3a3a');
   drawBerryCluster(ctx,W*.5,H*.62,S*.022,'#9a3a3a');
   // Faint script "with love" watermark in muted sage
   drawScriptWatermark(ctx,'with love',W*.5,H*.06,H*.06,'rgba(120,140,90,.45)');
   // Thin rustic border in sage
   ctx.strokeStyle='rgba(120,140,90,.55)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'gathered with love',x:0.5,y:0.86,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(100,80,55,.8)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Two Hearts, One Field',x:0.5,y:0.92,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#7a5238'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// MIXED-SHAPE TEMPLATES — multiple shape types in a single layout
// ═══════════════════════════════════════════════════════════════

// FAMILY — Memory Board (scrapbook with corkboard texture, mix of polaroid + heart
// + star + circle + ellipse like a real pinned memory wall)
{id:'occ_fam_memboard',name:'Memory Board',cat:'family',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.14,rw:.36,rh:.4,angle:-3,shape:'rect'},      // hero polaroid top-left
   {rx:.5,ry:.08,rw:.22,rh:.22,angle:5,shape:'circle'},     // small circle top-mid
   {rx:.74,ry:.18,rw:.22,rh:.24,angle:-4,shape:'star'},     // star top-right
   {rx:.46,ry:.42,rw:.3,rh:.3,angle:-2,shape:'heart'},      // heart center
   {rx:.78,ry:.55,rw:.18,rh:.12,angle:6,shape:'ellipse'},   // small oval right
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cork-board texture: warm tan grain with scattered darker fibers
   drawGrainGradient(ctx,W,H,'#dcc59a','#b89a6a',135,.1,77);
   const rng=seededRng(42);
   ctx.fillStyle='rgba(80,55,30,.18)';
   for(let i=0;i<280;i++){
     const x=rng()*W,y=rng()*H,r=S*.0008+rng()*S*.0028;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Tiny fiber strokes (cork bits)
   ctx.strokeStyle='rgba(60,40,20,.22)';
   for(let i=0;i<50;i++){
     const x=rng()*W,y=rng()*H,len=S*.008+rng()*S*.016,a=rng()*Math.PI*2;
     ctx.lineWidth=Math.max(.5,S*.0008);
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
   }
   // Washi tape strips on the polaroid + heart corners (tilted)
   drawWashiTape(ctx,W*.13,H*.11,S*.1,S*.022,-Math.PI*.06,'#d8c074');
   drawWashiTape(ctx,W*.51,H*.42,S*.08,S*.02,Math.PI*.12,'#c87a90');
   // Push-pin (red dot with highlight) at top of star + circle
   const pin=(cx,cy,col)=>{
     ctx.save();
     ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
     ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx,cy,S*.012,0,Math.PI*2);ctx.fill();
     ctx.shadowColor='transparent';
     ctx.fillStyle='rgba(255,255,255,.55)';
     ctx.beginPath();ctx.arc(cx-S*.004,cy-S*.004,S*.005,0,Math.PI*2);ctx.fill();
     ctx.restore();
   };
   pin(W*.61,H*.12,'#c83a3a');
   pin(W*.85,H*.21,'#3a8ac8');
   pin(W*.87,H*.59,'#3a8a4a');
   // Hand-drawn dotted arrow connecting heart → ellipse caption
   ctx.strokeStyle='rgba(60,40,20,.5)';ctx.lineWidth=Math.max(1,S*.0018);
   ctx.lineCap='round';ctx.setLineDash([S*.005,S*.012]);
   ctx.beginPath();ctx.moveTo(W*.72,H*.55);ctx.bezierCurveTo(W*.78,H*.6,W*.82,H*.62,W*.85,H*.62);ctx.stroke();
   ctx.setLineDash([]);
   // Small handwritten note in corner
   ctx.save();ctx.translate(W*.08,H*.78);ctx.rotate(-Math.PI*.03);
   ctx.fillStyle='#fff8e8';ctx.fillRect(0,0,S*.18,S*.1);
   ctx.fillStyle='rgba(80,55,30,.7)';ctx.font=`italic 700 ${S*.013}px 'Pacifico',cursive`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ctx.fillText('memories',S*.012,S*.025);
   ctx.fillText('to keep',S*.012,S*.05);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'pinned memories',x:0.5,y:0.04,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,55,30,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Our Story Board',x:0.5,y:0.93,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5a3a1a'}},
 ]},

// HOLIDAY — Winter Ornaments (Christmas — circles + stars hanging like ornaments
// from the top, deep forest + gold)
{id:'occ_xmas_ornaments',name:'Winter Ornaments',cat:'holiday',badge:'new',n:6,
 photoFrames:[
   {rx:.1,ry:.18,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.34,ry:.27,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.58,ry:.18,rw:.18,rh:.18,angle:0,shape:'star'},
   {rx:.78,ry:.32,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.18,ry:.5,rw:.22,rh:.22,angle:0,shape:'star'},
   {rx:.5,ry:.55,rw:.32,rh:.22,angle:0,shape:'ellipse'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep forest → midnight blue gradient
   drawGrainGradient(ctx,W,H,'#0e2a1c','#0d1a2e',135,.05,99);
   // Falling snow dots
   const rng=seededRng(33);
   for(let i=0;i<140;i++){
     const x=rng()*W,y=rng()*H,r=S*.0008+rng()*S*.0026;
     ctx.fillStyle=`rgba(255,255,255,${.4+rng()*.55})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Hanging "strings" from top of each ornament to the canvas top
   ctx.strokeStyle='rgba(212,175,55,.55)';ctx.lineWidth=Math.max(.8,S*.0015);
   const hang=(cx,topY)=>{
     ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,topY);ctx.stroke();
     // Tiny gold cap at top of ornament
     ctx.fillStyle='#d4af37';
     ctx.beginPath();ctx.ellipse(cx,topY,S*.012,S*.008,0,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='rgba(255,235,180,.7)';
     ctx.fillRect(cx-S*.004,topY-S*.012,S*.008,S*.005);
   };
   // Anchor each frame's top center to the canvas top
   const frames=[[.19,.18],[.43,.27],[.67,.18],[.86,.32],[.29,.5],[.66,.55]];
   frames.forEach(([rx,ry])=>hang(rx*W,ry*H));
   // Pine boughs across the very top
   drawPineSprig(ctx,W*.04,H*.04,S*.18,Math.PI*.5,'rgba(90,140,90,.85)');
   drawPineSprig(ctx,W*.18,H*.06,S*.16,Math.PI*.45,'rgba(110,150,90,.8)');
   drawPineSprig(ctx,W*.4,H*.04,S*.18,Math.PI*.5,'rgba(90,140,90,.85)');
   drawPineSprig(ctx,W*.62,H*.05,S*.18,Math.PI*.55,'rgba(110,150,90,.8)');
   drawPineSprig(ctx,W*.84,H*.04,S*.16,Math.PI*.45,'rgba(90,140,90,.85)');
   drawBerryCluster(ctx,W*.12,H*.07,S*.025,'#b83a3a');
   drawBerryCluster(ctx,W*.5,H*.08,S*.03,'#b83a3a');
   drawBerryCluster(ctx,W*.78,H*.07,S*.025,'#b83a3a');
   // Gold sparkles scattered
   for(let i=0;i<22;i++){
     const x=rng()*W,y=H*.35+rng()*H*.5,sz=S*.005+rng()*S*.01;
     drawStarburst8(ctx,x,y,sz,'rgba(212,175,55,.85)');
   }
   // Bottom snowdrift
   ctx.fillStyle='rgba(240,245,250,.18)';
   ctx.beginPath();
   ctx.moveTo(0,H);
   ctx.bezierCurveTo(W*.25,H*.82,W*.5,H*.92,W*.75,H*.85);
   ctx.lineTo(W,H*.9);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 },
 canvasElements:[
   {kind:'text',text:'merry & bright',x:0.5,y:0.85,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(212,175,55,.9)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Joyeux Noël',x:0.5,y:0.92,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
 ]},

// FAMILY — Periodic Family (hexagon grid like a periodic table, with one circle
// "noble gas" hero on the side. Clean ivory + slate + dusty coral accents.)
{id:'occ_fam_periodic',name:'Periodic',cat:'family',badge:'new',n:7,
 photoFrames:[
   // Six hexagons in a tight 3x2 grid (like periodic table rows)
   {rx:.06,ry:.22,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   {rx:.26,ry:.22,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   {rx:.46,ry:.22,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   {rx:.06,ry:.5,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   {rx:.26,ry:.5,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   {rx:.46,ry:.5,rw:.18,rh:.22,angle:0,shape:'hexagon'},
   // Hero circle "noble gas" right column
   {rx:.7,ry:.32,rw:.26,rh:.3,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Clean ivory with very faint grid lines (graph paper feel)
   drawGrainGradient(ctx,W,H,'#fbfaf5','#f0ece2',180,.04,11);
   ctx.strokeStyle='rgba(60,80,100,.06)';ctx.lineWidth=Math.max(.5,S*.0006);
   const gridStep=S*.03;
   for(let x=0;x<=W;x+=gridStep){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
   for(let y=0;y<=H;y+=gridStep){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
   // Heavier grid lines every 5
   ctx.strokeStyle='rgba(60,80,100,.12)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let x=0;x<=W;x+=gridStep*5){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
   for(let y=0;y<=H;y+=gridStep*5){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
   // (Atomic numbers + element symbols are editable canvasElements below.)
   // Hero circle gets a special "noble gas" highlight badge
   ctx.save();
   ctx.fillStyle='rgba(190,90,90,.12)';
   ctx.beginPath();ctx.arc(W*.83,H*.47,S*.18,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // Bold black border (lab notebook feel)
   ctx.strokeStyle='rgba(40,50,70,.85)';ctx.lineWidth=Math.max(2,S*.003);
   const m=S*.015;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'THE FAMILY ELEMENTS',x:0.5,y:0.06,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#283246',letterSpacing:'8px'}},
   {kind:'text',text:'a chemistry that just works',x:0.5,y:0.11,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(60,80,100,.7)',letterSpacing:'2px'}},
   // Editable atomic numbers + element symbols (one pair per hex).
   {kind:'text',text:'01',x:0.06,y:0.2,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Mo',x:0.06,y:0.225,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'02',x:0.26,y:0.2,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Da',x:0.26,y:0.225,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'03',x:0.46,y:0.2,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Br',x:0.46,y:0.225,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'04',x:0.06,y:0.48,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Si',x:0.06,y:0.505,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'05',x:0.26,y:0.48,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Pa',x:0.26,y:0.505,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'06',x:0.46,y:0.48,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Aun',x:0.46,y:0.505,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'07',x:0.7,y:0.3,align:'left',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,100,.7)'}},
   {kind:'text',text:'Co',x:0.7,y:0.325,align:'left',style:{fontSize:'17px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'rgba(190,90,90,.85)'}},
   {kind:'text',text:'EST · 2026',x:0.5,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#bd5a5a',letterSpacing:'7px'}},
 ]},

// HOLIDAY — Garden Bouquet (Mother's Day / spring — hearts + circles arranged like
// flowers in a garden, sage gradient with vine connections)
{id:'occ_hol_garden',name:'Garden Bouquet',cat:'holiday',badge:'new',n:5,
 photoFrames:[
   // 1 large heart "rose" hero + 2 circle "daisies" + 2 ellipse "leaves"
   {rx:.32,ry:.16,rw:.36,rh:.4,angle:0,shape:'heart'},
   {rx:.08,ry:.4,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.7,ry:.42,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.18,ry:.66,rw:.26,rh:.16,angle:-8,shape:'ellipse'},
   {rx:.56,ry:.68,rw:.26,rh:.16,angle:8,shape:'ellipse'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Sage → butter cream gradient
   drawGrainGradient(ctx,W,H,'#e8efd6','#f5e9c4',135,.06,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,140,90,.13)',6);
   // Soft watercolor washes — like garden patches
   drawWatercolorBlob(ctx,W*.5,H*.3,S*.4,'#c87a90',.18);
   drawWatercolorBlob(ctx,W*.18,H*.55,S*.28,'#a8c08a',.22);
   drawWatercolorBlob(ctx,W*.82,H*.55,S*.28,'#a8c08a',.22);
   // Vines/stems from each "flower" trailing toward the bottom (like a bouquet)
   ctx.strokeStyle='rgba(90,120,70,.7)';ctx.lineWidth=Math.max(1.4,S*.002);
   ctx.lineCap='round';
   const stem=(x1,y1,x2,y2,cp1x,cp1y,cp2x,cp2y)=>{
     ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x2,y2);ctx.stroke();
   };
   stem(W*.5,H*.56,W*.5,H*.96,W*.48,H*.7,W*.52,H*.85);                    // hero heart stem
   stem(W*.19,H*.62,W*.45,H*.94,W*.25,H*.78,W*.35,H*.88);                  // left circle stem
   stem(W*.81,H*.64,W*.55,H*.94,W*.75,H*.78,W*.65,H*.88);                  // right circle stem
   // Tiny leaves along the stems
   const leaf=(x,y,sz,a,col)=>{
     ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(0,0);ctx.quadraticCurveTo(sz*.5,-sz*.4,sz,0);ctx.quadraticCurveTo(sz*.5,sz*.4,0,0);
     ctx.closePath();ctx.fill();ctx.restore();
   };
   leaf(W*.5,H*.74,S*.025,Math.PI*.15,'#7a9a5a');
   leaf(W*.5,H*.82,S*.025,-Math.PI*.15,'#7a9a5a');
   leaf(W*.32,H*.86,S*.022,Math.PI*.3,'#7a9a5a');
   leaf(W*.68,H*.86,S*.022,-Math.PI*.3,'#7a9a5a');
   // Pressed wildflowers scattered top corners
   drawPressedFlower(ctx,W*.06,H*.08,S*.04,5,'rgba(180,80,90,.65)');
   drawPressedFlower(ctx,W*.94,H*.08,S*.045,7,'rgba(200,160,90,.65)');
   drawBerryCluster(ctx,W*.12,H*.13,S*.022,'#9a3a3a');
   // Small bow tying the bouquet at the bottom
   ctx.save();ctx.translate(W*.5,H*.96);
   ctx.fillStyle='#c87a90';
   ctx.beginPath();ctx.ellipse(-S*.025,0,S*.022,S*.012,Math.PI*.2,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.ellipse(S*.025,0,S*.022,S*.012,-Math.PI*.2,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(0,0,S*.008,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // Hairline border
   ctx.strokeStyle='rgba(90,120,70,.5)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'a garden of memories',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(90,110,55,.85)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Bouquet',x:0.5,y:0.13,align:'center',style:{fontSize:'34px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#a83a5a'}},
 ]},

// BIRTHDAY — Moonlight (1 large circle "moon" hero + small star satellites,
// peach → lavender → indigo dusk gradient with hand-drawn night sky)
{id:'occ_bday_moonlight',name:'Moonlight',cat:'birthday',badge:'new',n:4,
 photoFrames:[
   {rx:0.28,ry:0.18,rw:0.44,rh:0.44,angle:0,shape:'circle'},     // hero moon
   {rx:0.021,ry:0.191,rw:0.219,rh:0.22,angle:0,shape:'star'},
   {rx:0.773,ry:0.435,rw:0.21,rh:0.229,angle:0,shape:'star'},
   {rx:0.38,ry:0.66,rw:0.24,rh:0.18,angle:0,shape:'ellipse'},    // cloud
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusk gradient: peach → coral → lavender → deep indigo (vertical)
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#1a1238');g.addColorStop(.3,'#3a2a55');
   g.addColorStop(.55,'#a06a8a');g.addColorStop(.8,'#e89a7a');g.addColorStop(1,'#fde0c8');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.05,77);
   // Tiny twinkling stars in upper portion
   const rng=seededRng(99);
   for(let i=0;i<70;i++){
     const x=rng()*W,y=rng()*H*.5,r=S*.0008+rng()*S*.0024;
     ctx.fillStyle=`rgba(255,245,220,${.4+rng()*.55})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Larger 4-point sparkles scattered
   const sparkle=(x,y,r,col)=>{
     ctx.save();ctx.translate(x,y);ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(0,-r);ctx.lineTo(r*.18,-r*.18);ctx.lineTo(r,0);
     ctx.lineTo(r*.18,r*.18);ctx.lineTo(0,r);ctx.lineTo(-r*.18,r*.18);
     ctx.lineTo(-r,0);ctx.lineTo(-r*.18,-r*.18);ctx.closePath();ctx.fill();
     ctx.restore();
   };
   for(let i=0;i<14;i++){
     const x=rng()*W,y=rng()*H*.55,r=S*.005+rng()*S*.01;
     sparkle(x,y,r,`rgba(255,235,180,${.6+rng()*.4})`);
   }
   // Crescent moon decoration top-right (NOT a photo frame — just art)
   drawCrescent(ctx,W*.88,H*.08,S*.04,'rgba(255,235,180,.85)');
   sparkle(W*.78,H*.06,S*.012,'rgba(255,235,180,.95)');
   sparkle(W*.94,H*.18,S*.01,'rgba(255,235,180,.9)');
   // Hand-drawn dotted constellation lines connecting hero to satellites
   ctx.strokeStyle='rgba(255,235,180,.4)';ctx.lineWidth=Math.max(1,S*.0014);
   ctx.lineCap='round';ctx.setLineDash([S*.005,S*.012]);
   ctx.beginPath();ctx.moveTo(W*.16,H*.36);ctx.lineTo(W*.36,H*.4);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.64,H*.4);ctx.lineTo(W*.86,H*.46);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.5,H*.6);ctx.lineTo(W*.5,H*.7);ctx.stroke();
   ctx.setLineDash([]);
   // Soft horizon glow at bottom
   const horizon=ctx.createLinearGradient(0,H*.85,0,H);
   horizon.addColorStop(0,'rgba(255,200,150,0)');
   horizon.addColorStop(1,'rgba(255,200,150,.35)');
   ctx.fillStyle=horizon;ctx.fillRect(0,H*.85,W,H*.15);
   // Hairline cream border
   ctx.strokeStyle='rgba(255,235,180,.4)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.018;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'under the stars',x:0.5,y:0.05,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,235,180,.9)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Make a Wish',x:0.5,y:0.93,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#fde0c8'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// CONCEPT TEMPLATES — real-world objects as photo metaphors
// ═══════════════════════════════════════════════════════════════

// BIRTHDAY/FRIENDS — Mixtape (cassette tape, photos as the two reels + track strip)
{id:'occ_bday_mixtape',name:'The Mixtape',cat:'birthday',badge:'new',n:5,
 photoFrames:[
   // The two reels (circles with photos), then 3 "tracks" stacked below
   {rx:0.13,ry:0.16,rw:0.22,rh:0.22,angle:0,shape:'circle'},
   {rx:0.65,ry:0.16,rw:0.22,rh:0.22,angle:0,shape:'circle'},
   {rx:0.129,ry:0.549,rw:0.754,rh:0.16,angle:0,shape:'rect'},
   {rx:0.11,ry:0.735,rw:0.38,rh:0.13,angle:0,shape:'rect'},
   {rx:0.518,ry:0.734,rw:0.38,rh:0.13,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Off-white background — the cassette will sit on top as a prominent shape
   drawGrainGradient(ctx,W,H,'#f5ede0','#e2d4be',180,.06,55);
   // Cassette body — large rounded rectangle
   const cx=W*.05,cy=H*.08,cw=W*.9,ch=H*.84;
   ctx.save();
   ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=S*.018;ctx.shadowOffsetX=0;ctx.shadowOffsetY=S*.012;
   ctx.fillStyle='#1a1a22';
   if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(cx,cy,cw,ch,S*.018);ctx.fill();}
   else{ctx.fillRect(cx,cy,cw,ch);}
   ctx.shadowColor='transparent';
   ctx.restore();
   // Tape window — thin lighter band where the magnetic tape would show
   ctx.fillStyle='#0a0a10';
   const tw=cw*.96,th=ch*.06;
   ctx.fillRect(cx+(cw-tw)/2,cy+ch*.08,tw,th);
   // The two reel openings (ring around our circle photos)
   const reelRing=(rx,ry)=>{
     ctx.strokeStyle='#2a2a3a';ctx.lineWidth=Math.max(2,S*.004);
     ctx.beginPath();ctx.arc(rx,ry,S*.13,0,Math.PI*2);ctx.stroke();
     // Six tiny notches around the reel for the "teeth"
     ctx.fillStyle='#0a0a10';
     for(let i=0;i<6;i++){
       const a=i*Math.PI/3;
       const nx=rx+Math.cos(a)*S*.08, ny=ry+Math.sin(a)*S*.08;
       ctx.beginPath();ctx.arc(nx,ny,S*.008,0,Math.PI*2);ctx.fill();
     }
   };
   reelRing(W*.24,H*.27);
   reelRing(W*.76,H*.27);
   // Center "label" area background (cream paper feel)
   ctx.fillStyle='#f5ede0';
   const lx=cx+cw*.04, ly=cy+ch*.5, lw=cw*.92, lh=ch*.46;
   if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(lx,ly,lw,lh,S*.01);ctx.fill();}
   else{ctx.fillRect(lx,ly,lw,lh);}
   // Track lines on the label area
   ctx.strokeStyle='rgba(80,60,40,.18)';ctx.lineWidth=Math.max(.6,S*.001);
   for(let i=1;i<5;i++){
     const ly2=ly+lh*(i/5);
     ctx.beginPath();ctx.moveTo(lx+S*.015,ly2);ctx.lineTo(lx+lw-S*.015,ly2);ctx.stroke();
   }
   // "Side A" badge top-left of label
   ctx.fillStyle='#c4502c';
   const badgeX=lx+S*.02, badgeY=ly+S*.012;
   if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(badgeX,badgeY,S*.07,S*.025,S*.004);ctx.fill();}
   else{ctx.fillRect(badgeX,badgeY,S*.07,S*.025);}
   ctx.fillStyle='#fff';ctx.font=`900 ${S*.014}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('SIDE A',badgeX+S*.035,badgeY+S*.0125);
   // Track numbers (01, 02, 03) tiny on left of each track
   ctx.fillStyle='rgba(60,40,30,.55)';ctx.font=`700 ${S*.011}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   ['01','02','03'].forEach((n,i)=>{
     ctx.fillText(n,lx+S*.015,ly+lh*(.14+i*.18));
   });
 },
 canvasElements:[
   {kind:'text',text:'★ THE BEST OF YOU ★',x:0.494,y:0.104,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(245,237,224,.95)',letterSpacing:'5px'}},
   {kind:'text',text:'A Birthday Mixtape',x:0.5,y:0.93,align:'center',style:{fontSize:'14px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(245,237,224,.9)'}},
 ]},

// FAMILY/ANNIVERSARY — Recipe Card (index card with handwritten ingredient list,
// photos as the "ingredients")
{id:'occ_fam_recipe',name:'Family Recipe',cat:'family',badge:'new',n:5,
 photoFrames:[
   // Hero rect (the dish) + 3 small ingredient circles + heart for "love"
   {rx:0.523,ry:0.273,rw:0.365,rh:0.363,angle:2,shape:'rect'},
   {rx:0.08,ry:0.32,rw:0.14,rh:0.14,angle:0,shape:'circle'},
   {rx:0.08,ry:0.49,rw:0.14,rh:0.14,angle:0,shape:'circle'},
   {rx:0.08,ry:0.66,rw:0.14,rh:0.14,angle:0,shape:'circle'},
   {rx:0.43,ry:0.653,rw:0.199,rh:0.199,angle:-2,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Off-white index-card background
   drawGrainGradient(ctx,W,H,'#fdf9ed','#f5edd2',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,100,60,.1)',6);
   // Red double-line at top (classic recipe-card masthead rule)
   ctx.strokeStyle='#c4502c';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.beginPath();ctx.moveTo(W*.05,H*.13);ctx.lineTo(W*.95,H*.13);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.05,H*.16);ctx.lineTo(W*.95,H*.16);ctx.stroke();
   // Horizontal blue ruled lines (like an index card)
   ctx.strokeStyle='rgba(70,120,180,.28)';ctx.lineWidth=Math.max(.8,S*.0012);
   for(let i=0;i<14;i++){
     const y=H*.22+i*H*.05;
     ctx.beginPath();ctx.moveTo(W*.05,y);ctx.lineTo(W*.95,y);ctx.stroke();
   }
   // Vertical red margin line on the left (like notebook margin)
   ctx.strokeStyle='rgba(196,80,44,.4)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.07,H*.18);ctx.lineTo(W*.07,H*.92);ctx.stroke();
   // (Ingredient labels + "SINCE 1996" stamp text are editable canvasElements below.)
   // Stamp box outline (kept as decoration)
   ctx.save();ctx.translate(W*.86,H*.22);ctx.rotate(-Math.PI*.06);
   ctx.strokeStyle='#3a6a5a';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.strokeRect(-S*.05,-S*.025,S*.1,S*.05);
   ctx.restore();
   // Small fork & spoon icon decoration top-left
   ctx.save();ctx.translate(W*.08,H*.07);
   ctx.strokeStyle='#3a6a5a';ctx.lineWidth=Math.max(1.2,S*.002);ctx.lineCap='round';
   // Spoon
   ctx.beginPath();ctx.ellipse(0,0,S*.012,S*.018,0,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(0,S*.018);ctx.lineTo(0,S*.045);ctx.stroke();
   // Fork
   ctx.translate(S*.04,0);
   for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*S*.006,-S*.018);ctx.lineTo(i*S*.006,0);ctx.stroke();}
   ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,S*.045);ctx.stroke();
   ctx.restore();
   // Hairline border (index-card edge)
   ctx.strokeStyle='rgba(140,100,60,.45)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.018;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'OUR FAMILY RECIPE',x:0.5,y:0.05,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#c4502c',letterSpacing:'5px'}},
   {kind:'text',text:'serves: as many as we love',x:0.5,y:0.1,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(140,100,60,.7)',letterSpacing:'2px'}},
   // Editable ingredient labels (handwritten next to each circle).
   {kind:'text',text:'1 cup laughter',x:0.24,y:0.39,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(40,55,90,.7)'}},
   {kind:'text',text:'2 tbsp grace',x:0.24,y:0.56,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(40,55,90,.7)'}},
   {kind:'text',text:'a pinch of grit',x:0.24,y:0.73,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(40,55,90,.7)'}},
   {kind:'text',text:'+ a heart full of love',x:0.45,y:0.85,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(196,80,44,.9)'}},
   // Editable date stamp text — inside the rotated box.
   {kind:'text',text:'SINCE 1996',x:0.86,y:0.22,align:'center',angle:-11,style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#3a6a5a'}},
   {kind:'text',text:'Made with Love',x:0.5,y:0.95,align:'center',style:{fontSize:'22px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#3a6a5a'}},
 ]},

// TRAVEL — Vintage Atlas (aged map background, compass rose, travel route between
// "destination" photos)
{id:'occ_travel_atlas',name:'Vintage Atlas',cat:'travel',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.18,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.36,ry:.36,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.66,ry:.18,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.16,ry:.55,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.62,ry:.5,rw:.26,rh:.26,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged sepia parchment
   drawGrainGradient(ctx,W,H,'#f4e6c4','#d4b888',135,.08,77);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,80,40,.13)',6);
   // Faint latitude/longitude grid
   ctx.strokeStyle='rgba(120,70,30,.18)';ctx.lineWidth=Math.max(.5,S*.0007);
   for(let i=1;i<10;i++){
     ctx.beginPath();ctx.moveTo(W*i/10,H*.05);ctx.lineTo(W*i/10,H*.95);ctx.stroke();
     ctx.beginPath();ctx.moveTo(W*.05,H*i/10);ctx.lineTo(W*.95,H*i/10);ctx.stroke();
   }
   // Faint coastline / continent silhouettes (organic blob shapes)
   ctx.fillStyle='rgba(120,80,40,.12)';
   const continent=(cx,cy,size,seed)=>{
     ctx.save();ctx.translate(cx,cy);
     const rng=seededRng(seed);
     ctx.beginPath();
     const pts=12;
     for(let i=0;i<pts;i++){
       const a=i/pts*Math.PI*2;
       const r=size*(.7+rng()*.5);
       const x=Math.cos(a)*r,y=Math.sin(a)*r;
       if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
     }
     ctx.closePath();ctx.fill();
     ctx.restore();
   };
   continent(W*.2,H*.2,S*.1,11);
   continent(W*.8,H*.6,S*.13,22);
   continent(W*.4,H*.8,S*.09,33);
   // Map dot scatter (dotted ocean texture)
   const rng=seededRng(99);
   ctx.fillStyle='rgba(120,70,30,.2)';
   for(let i=0;i<200;i++){
     const x=rng()*W,y=rng()*H,r=S*.0006+rng()*S*.0014;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Compass rose (top-right)
   ctx.save();ctx.translate(W*.88,H*.12);
   const cR=S*.05;
   ctx.strokeStyle='rgba(110,60,20,.85)';ctx.lineWidth=Math.max(1.2,S*.002);
   // Outer + inner circle
   ctx.beginPath();ctx.arc(0,0,cR,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(0,0,cR*.45,0,Math.PI*2);ctx.stroke();
   // 8 cardinal points
   ctx.fillStyle='rgba(110,60,20,.85)';
   for(let i=0;i<8;i++){
     const a=i*Math.PI/4-Math.PI/2;
     const big=i%2===0;
     const tip=cR*(big?.95:.7);
     ctx.beginPath();
     ctx.moveTo(Math.cos(a)*tip,Math.sin(a)*tip);
     ctx.lineTo(Math.cos(a+.1)*cR*.2,Math.sin(a+.1)*cR*.2);
     ctx.lineTo(Math.cos(a-.1)*cR*.2,Math.sin(a-.1)*cR*.2);
     ctx.closePath();ctx.fill();
   }
   // N S E W letters
   ctx.fillStyle='#6e3c14';ctx.font=`900 ${cR*.32}px 'Playfair Display',serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('N',0,-cR*1.25);
   ctx.fillText('S',0,cR*1.25);
   ctx.fillText('E',cR*1.25,0);
   ctx.fillText('W',-cR*1.25,0);
   ctx.restore();
   // Dotted travel route between destinations
   ctx.strokeStyle='#9a3a3a';ctx.lineWidth=Math.max(1.3,S*.002);
   ctx.lineCap='round';ctx.setLineDash([S*.008,S*.012]);
   const route=[[.17,.29],[.47,.47],[.77,.29],[.27,.66],[.75,.63]];
   ctx.beginPath();
   route.forEach(([x,y],i)=>{const px=x*W,py=y*H;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});
   ctx.stroke();
   ctx.setLineDash([]);
   // Tiny "X marks the spot" on each waypoint
   ctx.strokeStyle='#9a3a3a';ctx.lineWidth=Math.max(1.5,S*.0025);
   route.forEach(([x,y])=>{
     const px=x*W,py=y*H;
     ctx.beginPath();ctx.moveTo(px-S*.008,py-S*.008);ctx.lineTo(px+S*.008,py+S*.008);ctx.stroke();
     ctx.beginPath();ctx.moveTo(px+S*.008,py-S*.008);ctx.lineTo(px-S*.008,py+S*.008);ctx.stroke();
   });
   // Wax seal bottom-left
   drawWaxSeal(ctx,W*.08,H*.92,S*.045,'#8b3a1c','★');
   // Faded compass-style border (double line)
   ctx.strokeStyle='rgba(110,60,20,.55)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
   ctx.strokeStyle='rgba(110,60,20,.25)';
   ctx.strokeRect(m+S*.008,m+S*.008,W-(m+S*.008)*2,H-(m+S*.008)*2);
 },
 canvasElements:[
   {kind:'text',text:'EXPEDITION  ·  MMXXVI',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(110,60,20,.85)',letterSpacing:'8px'}},
   {kind:'text',text:'Where We Have Been',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#6e3c14'}},
 ]},

// FAMILY/WEDDING — Our Universe (sun + planets orbiting on dotted orbit lines)
{id:'occ_fam_universe',name:'Our Universe',cat:'family',badge:'new',n:5,
 photoFrames:[
   // Sun — large hero circle center
   {rx:.36,ry:.32,rw:.28,rh:.28,angle:0,shape:'circle'},
   // Planets at orbital positions (each on its own ring)
   {rx:.05,ry:.4,rw:.13,rh:.13,angle:0,shape:'circle'},
   {rx:.83,ry:.3,rw:.13,rh:.13,angle:0,shape:'circle'},
   {rx:.16,ry:.7,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.7,ry:.7,rw:.16,rh:.16,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep space gradient (radial — center brighter, edges nearly black)
   const g=ctx.createRadialGradient(W*.5,H*.46,0,W*.5,H*.46,Math.max(W,H)*.7);
   g.addColorStop(0,'#1f1538');g.addColorStop(.5,'#0e0a22');g.addColorStop(1,'#04030c');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Background stars
   const rng=seededRng(33);
   for(let i=0;i<180;i++){
     const x=rng()*W,y=rng()*H,r=S*.0006+rng()*S*.0024;
     ctx.fillStyle=`rgba(255,255,255,${.4+rng()*.6})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Larger 4-point sparkles
   const sparkle=(x,y,r,col)=>{
     ctx.save();ctx.translate(x,y);ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(0,-r);ctx.lineTo(r*.18,-r*.18);ctx.lineTo(r,0);
     ctx.lineTo(r*.18,r*.18);ctx.lineTo(0,r);ctx.lineTo(-r*.18,r*.18);
     ctx.lineTo(-r,0);ctx.lineTo(-r*.18,-r*.18);ctx.closePath();ctx.fill();
     ctx.restore();
   };
   for(let i=0;i<14;i++){
     const x=rng()*W,y=rng()*H,r=S*.005+rng()*S*.012;
     sparkle(x,y,r,`rgba(255,255,255,${.6+rng()*.4})`);
   }
   // Sun glow halo behind hero circle
   const sunCx=W*.5,sunCy=H*.46;
   const halo=ctx.createRadialGradient(sunCx,sunCy,S*.14,sunCx,sunCy,S*.32);
   halo.addColorStop(0,'rgba(255,200,100,.45)');
   halo.addColorStop(1,'rgba(255,150,50,0)');
   ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
   // Orbit rings (elliptical, dotted) — one per planet
   ctx.strokeStyle='rgba(180,200,255,.32)';ctx.lineWidth=Math.max(.8,S*.0012);
   ctx.setLineDash([S*.006,S*.01]);
   const orbits=[
     {rx:S*.3,ry:S*.18,rot:-Math.PI*.05},  // outer left/right
     {rx:S*.32,ry:S*.18,rot:Math.PI*.05},
     {rx:S*.36,ry:S*.26,rot:0},            // outer bottom
     {rx:S*.34,ry:S*.24,rot:Math.PI*.1},
   ];
   orbits.forEach(o=>{
     ctx.beginPath();
     ctx.ellipse(sunCx,sunCy,o.rx,o.ry,o.rot,0,Math.PI*2);
     ctx.stroke();
   });
   ctx.setLineDash([]);
   // Tiny planet labels (Mom, Dad, Bro, etc.) near each orbit point
   ctx.fillStyle='rgba(200,210,255,.6)';
   ctx.font=`700 ${S*.012}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='top';
   const labels=[['Mercury',.115,.555],['Venus',.895,.45],['Mars',.24,.86],['Jupiter',.78,.86]];
   labels.forEach(([txt,rx,ry])=>{ctx.fillText(txt,rx*W,ry*H);});
   ctx.fillStyle='rgba(255,210,150,.85)';
   ctx.font=`900 ${S*.014}px 'Outfit',sans-serif`;
   ctx.fillText('SOL',sunCx,sunCy+S*.165);
   // Subtle nebula wash (soft purple/blue blob)
   drawWatercolorBlob(ctx,W*.15,H*.15,S*.2,'#6a4ab8',.18);
   drawWatercolorBlob(ctx,W*.85,H*.85,S*.22,'#3a4ab8',.18);
   // Cream hairline border
   ctx.strokeStyle='rgba(255,235,180,.35)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.018;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'OUR UNIVERSE',x:0.5,y:0.04,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(255,235,180,.95)',letterSpacing:'9px'}},
   {kind:'text',text:'a system held together by gravity & love',x:0.5,y:0.09,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(200,210,255,.7)',letterSpacing:'3px'}},
   {kind:'text',text:'CATALOGUED · 2026',x:0.5,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,235,180,.75)',letterSpacing:'7px'}},
 ]},

// BIRTHDAY — Trading Cards (4 photos as collectible cards in 2x2 with holo shimmer)
{id:'occ_bday_trading',name:'Trading Cards',cat:'birthday',badge:'new',n:4,
 photoFrames:[
   {rx:0.06,ry:0.18,rw:0.413,rh:0.349,angle:-2,shape:'rect'},
   {rx:0.52,ry:0.18,rw:0.421,rh:0.349,angle:2,shape:'rect'},
   {rx:0.06,ry:0.58,rw:0.419,rh:0.35,angle:2,shape:'rect'},
   {rx:0.52,ry:0.58,rw:0.418,rh:0.35,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Holographic foil background — multi-stop shimmer gradient
   const g=ctx.createLinearGradient(0,0,W,H);
   g.addColorStop(0,'#ffd6f0');g.addColorStop(.2,'#d6e4ff');g.addColorStop(.4,'#d6ffec');
   g.addColorStop(.6,'#fff5d6');g.addColorStop(.8,'#ffd6e4');g.addColorStop(1,'#e4d6ff');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,77);
   // Diagonal shimmer streaks
   const rng=seededRng(11);
   for(let i=0;i<10;i++){
     const sy=rng()*H;
     const sg=ctx.createLinearGradient(0,sy,W,sy+W*.3);
     sg.addColorStop(0,'rgba(255,255,255,0)');
     sg.addColorStop(.5,'rgba(255,255,255,.35)');
     sg.addColorStop(1,'rgba(255,255,255,0)');
     ctx.fillStyle=sg;ctx.fillRect(0,sy,W,S*.012);
   }
   // Tiny scatter sparkles (stars) all over
   const sparkle=(x,y,r,col)=>{
     ctx.save();ctx.translate(x,y);ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(0,-r);ctx.lineTo(r*.18,-r*.18);ctx.lineTo(r,0);
     ctx.lineTo(r*.18,r*.18);ctx.lineTo(0,r);ctx.lineTo(-r*.18,r*.18);
     ctx.lineTo(-r,0);ctx.lineTo(-r*.18,-r*.18);ctx.closePath();ctx.fill();
     ctx.restore();
   };
   for(let i=0;i<40;i++){
     const x=rng()*W,y=rng()*H,r=S*.005+rng()*S*.011;
     sparkle(x,y,r,`rgba(255,255,255,${.5+rng()*.45})`);
   }
   // "Card frames" — for each rect cell, draw a colored border + bottom stat bar
   const cardOuter=(rx,ry,rw,rh,angle,col)=>{
     const x=rx*W,y=ry*H,w=rw*W,h=rh*H;
     ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle*Math.PI/180);
     // Outer foil border
     ctx.strokeStyle=col;ctx.lineWidth=Math.max(2.5,S*.0042);
     if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(-w/2-S*.01,-h/2-S*.01,w+S*.02,h+S*.02,S*.012);ctx.stroke();}
     else{ctx.strokeRect(-w/2-S*.01,-h/2-S*.01,w+S*.02,h+S*.02);}
     // Inner thin gold rule
     ctx.strokeStyle='rgba(212,175,55,.85)';ctx.lineWidth=Math.max(1,S*.0015);
     if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(-w/2-S*.005,-h/2-S*.005,w+S*.01,h+S*.01,S*.008);ctx.stroke();}
     else{ctx.strokeRect(-w/2-S*.005,-h/2-S*.005,w+S*.01,h+S*.01);}
     // Stat-card "bottom band" — coloured plate sitting under the photo edge
     ctx.fillStyle=col;ctx.fillRect(-w/2,h/2-S*.006,w,S*.022);
     ctx.fillStyle='#fff';ctx.font=`900 ${S*.011}px 'Outfit',sans-serif`;
     ctx.textAlign='left';ctx.textBaseline='middle';
     ctx.fillText('LV.99',-w/2+S*.012,h/2+S*.005);
     ctx.textAlign='right';ctx.fillText('★★★★★',w/2-S*.012,h/2+S*.005);
     ctx.restore();
   };
   cardOuter(0.06,0.18,0.413,0.349,-2,'#c83a8a');
   cardOuter(0.52,0.18,0.421,0.349,2,'#3a8ac8');
   cardOuter(0.06,0.58,0.419,0.35,2,'#3ac88a');
   cardOuter(0.52,0.58,0.418,0.35,-2,'#d4af37');
   // "LIMITED EDITION" stamp (tilted) bottom right corner
   ctx.save();ctx.translate(W*.88,H*.96);ctx.rotate(-Math.PI*.08);
   ctx.strokeStyle='#c4502c';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.strokeRect(-S*.075,-S*.018,S*.15,S*.036);
   ctx.fillStyle='#c4502c';ctx.font=`900 ${S*.013}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('LIMITED ED.',0,0);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'COLLECTOR\'S EDITION',x:0.5,y:0.05,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#1a1c2e',letterSpacing:'7px',textShadow:'0 2px 6px rgba(255,255,255,.6)'}},
   {kind:'text',text:'pack of four · series 2026',x:0.5,y:0.1,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',fontStyle:'italic',color:'rgba(40,30,80,.7)',letterSpacing:'3px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// CONCEPT TEMPLATES — DROP 2 (20 new real-world metaphors)
// ═══════════════════════════════════════════════════════════════

// TRAVEL — Boarding Pass (airline ticket with stub + barcode + seat info)
{id:'occ_travel_boarding',name:'Boarding Pass',cat:'travel',badge:'new',n:4,
 photoFrames:[
   {rx:0.046,ry:0.155,rw:0.42,rh:0.32,angle:0,shape:'rect'},
   {rx:0.5,ry:0.18,rw:0.22,rh:0.22,angle:0,shape:'rect'},
   {rx:0.74,ry:0.18,rw:0.22,rh:0.22,angle:0,shape:'rect'},
   {rx:0.05,ry:0.55,rw:0.92,rh:0.22,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fffaf0','#f0e8d4',180,.04,33);
   // Airline color stripe top
   ctx.fillStyle='#1a4ec8';ctx.fillRect(0,0,W,H*.1);
   ctx.fillStyle='#d4af37';ctx.fillRect(0,H*.1,W,H*.014);
   // Perforated tear-line at 75%
   ctx.strokeStyle='rgba(60,80,120,.5)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.setLineDash([S*.01,S*.008]);
   ctx.beginPath();ctx.moveTo(W*.05,H*.82);ctx.lineTo(W*.95,H*.82);ctx.stroke();
   ctx.setLineDash([]);
   // Tiny scissors icon at the perforation
   ctx.fillStyle='rgba(60,80,120,.5)';ctx.font=`${S*.018}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='middle';
   ctx.fillText('✂',W*.94,H*.82);
   // (FROM/TO/SEAT labels + values are editable canvasElements below.)
   // Barcode at bottom
   ctx.fillStyle='#1a1c2e';
   const bx=W*.05,by=H*.86,bw=W*.6,bh=H*.08;
   const rng=seededRng(42);
   for(let x=0;x<bw;x+=S*.005){
     const w=S*.001+rng()*S*.004;
     ctx.fillRect(bx+x,by,w,bh);
   }
 },
 canvasElements:[
   {kind:'text',text:'BOARDING PASS',x:0.06,y:0.025,align:'left',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#fff',letterSpacing:'5px'}},
   {kind:'text',text:'Group A · 2026',x:0.94,y:0.025,align:'right',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,255,255,.85)',letterSpacing:'3px'}},
   // Editable flight-info labels + values
   {kind:'text',text:'FROM',x:0.05,y:0.5,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,120,.55)',letterSpacing:'2px'}},
   {kind:'text',text:'JFK',x:0.05,y:0.517,align:'left',style:{fontSize:'22px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a4ec8'}},
   {kind:'text',text:'TO',x:0.5,y:0.5,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,120,.55)',letterSpacing:'2px'}},
   {kind:'text',text:'CDG',x:0.5,y:0.517,align:'left',style:{fontSize:'22px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a4ec8'}},
   {kind:'text',text:'SEAT',x:0.74,y:0.5,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,80,120,.55)',letterSpacing:'2px'}},
   {kind:'text',text:'14A',x:0.74,y:0.517,align:'left',style:{fontSize:'22px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a4ec8'}},
   {kind:'text',text:'AB-2026-728-JFK-CDG',x:0.35,y:0.95,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(60,80,120,.7)',letterSpacing:'2px'}},
 ]},

// BIRTHDAY — Vinyl Record (large record with concentric grooves + label)
{id:'occ_bday_vinyl',name:'Vinyl Record',cat:'birthday',badge:'new',n:5,
 photoFrames:[
   {rx:.27,ry:.15,rw:.46,rh:.46,angle:0,shape:'circle'},
   {rx:.05,ry:.7,rw:.18,rh:.22,angle:0,shape:'rect'},
   {rx:.27,ry:.7,rw:.18,rh:.22,angle:0,shape:'rect'},
   {rx:.49,ry:.7,rw:.18,rh:.22,angle:0,shape:'rect'},
   {rx:.78,ry:.74,rw:.17,rh:.17,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a0a1f','#0a050d',180,.05,99);
   // Record body (black circle behind hero)
   const rcx=W*.5,rcy=H*.38,rR=S*.32;
   ctx.fillStyle='#0a0508';ctx.beginPath();ctx.arc(rcx,rcy,rR,0,Math.PI*2);ctx.fill();
   // Concentric grooves
   ctx.strokeStyle='rgba(60,40,60,.4)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let r=S*.1;r<rR;r+=S*.006){ctx.beginPath();ctx.arc(rcx,rcy,r,0,Math.PI*2);ctx.stroke();}
   // Reflective shine
   ctx.save();
   const shine=ctx.createLinearGradient(rcx-rR,rcy-rR,rcx+rR,rcy+rR);
   shine.addColorStop(0,'rgba(255,255,255,.06)');shine.addColorStop(.5,'rgba(255,255,255,0)');shine.addColorStop(1,'rgba(255,255,255,.04)');
   ctx.fillStyle=shine;ctx.beginPath();ctx.arc(rcx,rcy,rR,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // "Track listing" panel labels for the rect cells
   ctx.fillStyle='rgba(255,235,200,.5)';ctx.font=`700 ${S*.011}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ['B1','B2','B3'].forEach((n,i)=>ctx.fillText(n,(.05+i*.22)*W,H*.66));
   ctx.fillText('SIDE B',W*.78,H*.66);
 },
 canvasElements:[
   {kind:'text',text:'★ A YEAR IN VINYL ★',x:0.5,y:0.05,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(212,175,55,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'33⅓ RPM',x:0.5,y:0.95,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,235,200,.8)',letterSpacing:'5px'}},
 ]},

// GRADUATION — Yearbook Page (clean grid of headshots with names)
{id:'occ_grad_yearbook',name:'Yearbook',cat:'graduation',badge:'new',n:8,
 // Square cells so circle clip-path yields proper round circles (was rh:.22 with
 // rw:.2 — slightly elongated and the bottom looked cut off against the cell box).
 photoFrames:[
   {rx:.06,ry:.22,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.3,ry:.22,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.54,ry:.22,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.78,ry:.22,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.06,ry:.5,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.3,ry:.5,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.54,ry:.5,rw:.2,rh:.2,angle:0,shape:'circle'},
   {rx:.78,ry:.5,rw:.2,rh:.2,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf8ec','#f0e6c8',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,100,60,.1)',5);
   // School-spirit double rule top + bottom
   ctx.strokeStyle='#8b1a2a';ctx.lineWidth=Math.max(2,S*.0035);
   ctx.beginPath();ctx.moveTo(W*.05,H*.16);ctx.lineTo(W*.95,H*.16);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.05,H*.18);ctx.lineTo(W*.95,H*.18);ctx.stroke();
   // (Names below each circle are now editable canvasElements — see below.)
 },
 canvasElements:[
   {kind:'text',text:'CLASS OF 2026',x:0.5,y:0.06,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#8b1a2a',letterSpacing:'8px'}},
   {kind:'text',text:'Senior Portraits',x:0.5,y:0.11,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(120,100,60,.75)',letterSpacing:'3px'}},
   // Editable name labels — one per circle. Click to rename.
   {kind:'text',text:"ALEX · '26",x:0.16,y:0.44,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"SAM · '26",x:0.4,y:0.44,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"MIA · '26",x:0.64,y:0.44,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"JO · '26",x:0.88,y:0.44,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"LEE · '26",x:0.16,y:0.72,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"RAY · '26",x:0.4,y:0.72,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"KAI · '26",x:0.64,y:0.72,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:"TAY · '26",x:0.88,y:0.72,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.9)',letterSpacing:'2px'}},
   {kind:'text',text:'WESTBROOK HIGH · SINCE 1922',x:0.5,y:0.94,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,60,40,.7)',letterSpacing:'5px'}},
 ]},

// FAMILY — Polaroid Filmstrip (horizontal sprocket strip with sequential photos)
{id:'occ_fam_filmstrip',name:'Filmstrip',cat:'family',badge:'new',n:5,
 photoFrames:[
   {rx:.05,ry:.32,rw:.17,rh:.36,angle:0,shape:'rect'},
   {rx:.24,ry:.32,rw:.17,rh:.36,angle:0,shape:'rect'},
   {rx:.43,ry:.32,rw:.17,rh:.36,angle:0,shape:'rect'},
   {rx:.62,ry:.32,rw:.17,rh:.36,angle:0,shape:'rect'},
   {rx:.81,ry:.32,rw:.14,rh:.36,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#dcc5a8','#c8a878',180,.07,77);
   // Black filmstrip body
   ctx.fillStyle='#0a0a0a';ctx.fillRect(0,H*.22,W,H*.6);
   // Sprocket holes top and bottom
   ctx.fillStyle='#dcc5a8';
   for(let x=W*.025;x<W*.97;x+=W*.06){
     ctx.fillRect(x,H*.24,W*.04,H*.04);
     ctx.fillRect(x,H*.74,W*.04,H*.04);
   }
   // Frame numbers between sprocket holes
   ctx.fillStyle='rgba(255,235,180,.4)';ctx.font=`700 ${S*.012}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ['01','02','03','04','05'].forEach((n,i)=>ctx.fillText(n,(.13+i*.19)*W,H*.715));
   // KODAK-style brand label
   ctx.fillStyle='rgba(255,200,80,.85)';ctx.font=`900 ${S*.013}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.fillText('FAMILY · 35MM · GOLD 200',W*.025,H*.83);
 },
 canvasElements:[
   {kind:'text',text:'caught on film',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(80,55,30,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'A Roll of Memories',x:0.5,y:0.92,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#5a3a1a'}},
 ]},

// FAMILY — Newspaper Front Page (masthead + columns)
{id:'occ_fam_newspaper',name:'The Daily',cat:'family',badge:'new',n:4,
 photoFrames:[
   {rx:0.06,ry:0.2,rw:0.545,rh:0.4,angle:0,shape:'rect'},
   {rx:0.65,ry:0.2,rw:0.29,rh:0.18,angle:0,shape:'rect'},
   {rx:0.65,ry:0.42,rw:0.29,rh:0.18,angle:0,shape:'rect'},
   {rx:0.063,ry:0.658,rw:0.88,rh:0.22,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5f0e2','#e0d8c2',180,.06,55);
   // Masthead heavy black bar with title later in canvasElements
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(2.5,S*.004);
   ctx.beginPath();ctx.moveTo(W*.04,H*.16);ctx.lineTo(W*.96,H*.16);ctx.stroke();
   ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.04,H*.18);ctx.lineTo(W*.96,H*.18);ctx.stroke();
   // (Edition / date / by-line are editable canvasElements below.)
   // Column-divider lines between photos
   ctx.strokeStyle='rgba(40,40,40,.3)';ctx.lineWidth=Math.max(.6,S*.001);
   ctx.beginPath();ctx.moveTo(W*.625,H*.2);ctx.lineTo(W*.625,H*.6);ctx.stroke();
   // Column-text simulation under photos (faux text lines — non-editable decoration)
   ctx.strokeStyle='rgba(40,40,40,.45)';ctx.lineWidth=Math.max(.5,S*.0008);
   for(let i=0;i<4;i++){
     const y=H*.88+i*S*.012;
     ctx.beginPath();ctx.moveTo(W*.06,y);ctx.lineTo(W*.94,y);ctx.stroke();
   }
 },
 canvasElements:[
   {kind:'text',text:'THE DAILY MEMOIR',x:0.5,y:0.04,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'4px'}},
   // Editable masthead metadata
   {kind:'text',text:'VOL. XXVI · NO. 2026 · MORNING EDITION',x:0.04,y:0.13,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(40,40,40,.8)',letterSpacing:'2px'}},
   {kind:'text',text:'25¢ · WEATHER: SUNNY',x:0.96,y:0.13,align:'right',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(40,40,40,.8)',letterSpacing:'2px'}},
   {kind:'text',text:'BREAKING: A FAMILY MAKES MEMORIES',x:0.5,y:0.623,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'2px'}},
   {kind:'text',text:'— continued on page 2',x:0.06,y:0.95,align:'left',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'600',fontStyle:'italic',color:'rgba(40,40,40,.7)'}},
 ]},

// TRAVEL — Stamp Collection (postage stamps with perforated edges in a grid)
{id:'occ_travel_stamps',name:'Stamp Album',cat:'travel',badge:'new',n:6,
 photoFrames:[
   {rx:.07,ry:.18,rw:.26,rh:.24,angle:-3,shape:'rect'},
   {rx:.37,ry:.16,rw:.26,rh:.24,angle:2,shape:'rect'},
   {rx:.67,ry:.18,rw:.26,rh:.24,angle:-2,shape:'rect'},
   {rx:.07,ry:.5,rw:.26,rh:.24,angle:3,shape:'rect'},
   {rx:.37,ry:.52,rw:.26,rh:.24,angle:-3,shape:'rect'},
   {rx:.67,ry:.5,rw:.26,rh:.24,angle:2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f0e4cc','#d8c498',180,.07,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(110,80,40,.13)',6);
   // Perforated white border around each photo to mimic stamps
   const stamp=(rx,ry,rw,rh,angle)=>{
     const x=rx*W,y=ry*H,w=rw*W,h=rh*H;
     ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle*Math.PI/180);
     ctx.fillStyle='#fefcf3';
     ctx.fillRect(-w/2-S*.012,-h/2-S*.012,w+S*.024,h+S*.024);
     // Drop shadow
     ctx.shadowColor='rgba(60,40,20,.3)';ctx.shadowBlur=S*.008;ctx.shadowOffsetY=S*.004;
     ctx.fillStyle='#fefcf3';
     ctx.fillRect(-w/2-S*.012,-h/2-S*.012,w+S*.024,h+S*.024);
     ctx.shadowColor='transparent';
     // Perforation cutouts (small white circles around the edge)
     ctx.fillStyle=ctx.canvas.style.background||'transparent';
     // Just draw small dots ALONG the edge to look perforated
     ctx.fillStyle='rgba(110,80,40,.4)';
     const perfStep=S*.018;
     for(let px=-w/2;px<=w/2;px+=perfStep){ctx.beginPath();ctx.arc(px,-h/2-S*.012,S*.005,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(px,h/2+S*.012,S*.005,0,Math.PI*2);ctx.fill();}
     for(let py=-h/2;py<=h/2;py+=perfStep){ctx.beginPath();ctx.arc(-w/2-S*.012,py,S*.005,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(w/2+S*.012,py,S*.005,0,Math.PI*2);ctx.fill();}
     ctx.restore();
   };
   const frames=[[.07,.18,.26,.24,-3],[.37,.16,.26,.24,2],[.67,.18,.26,.24,-2],[.07,.5,.26,.24,3],[.37,.52,.26,.24,-3],[.67,.5,.26,.24,2]];
   frames.forEach(f=>stamp(...f));
   // Round postmark stamp top-right corner
   ctx.save();ctx.translate(W*.86,H*.08);
   ctx.strokeStyle='rgba(120,30,30,.7)';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.beginPath();ctx.arc(0,0,S*.05,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(0,0,S*.04,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='rgba(120,30,30,.85)';ctx.font=`900 ${S*.011}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('PARIS',0,-S*.012);ctx.fillText('2026',0,S*.012);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'POSTAL COLLECTION',x:0.5,y:0.05,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(110,60,20,.9)',letterSpacing:'8px'}},
   {kind:'text',text:'six stamps · six destinations',x:0.5,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',fontStyle:'italic',color:'rgba(110,60,20,.7)',letterSpacing:'4px'}},
 ]},

// BIRTHDAY — Concert Setlist (handwritten setlist on yellow paper)
{id:'occ_bday_setlist',name:'Setlist',cat:'birthday',badge:'new',n:5,
 photoFrames:[
   {rx:.6,ry:.18,rw:.32,rh:.32,angle:3,shape:'rect'},
   {rx:.08,ry:.3,rw:.16,rh:.14,angle:-2,shape:'rect'},
   {rx:.08,ry:.46,rw:.16,rh:.14,angle:2,shape:'rect'},
   {rx:.08,ry:.62,rw:.16,rh:.14,angle:-1,shape:'rect'},
   {rx:.6,ry:.55,rw:.32,rh:.3,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fff5b8','#f5e08a',180,.07,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,90,30,.15)',6);
   // Coffee-cup ring stain
   ctx.strokeStyle='rgba(120,80,40,.25)';ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();ctx.arc(W*.78,H*.92,S*.05,0,Math.PI*2);ctx.stroke();
   // (Track entries are now editable canvasElements below.)
   // Crossed-out track decoration (visual only — covers track 2 at y≈.408)
   ctx.strokeStyle='rgba(40,40,80,.7)';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.beginPath();ctx.moveTo(W*.27,H*.408);ctx.lineTo(W*.43,H*.406);ctx.stroke();
   // Margin doodle (star)
   ctx.fillStyle='#c4502c';
   const doodleStar=(cx,cy,r)=>{
     ctx.save();ctx.translate(cx,cy);ctx.beginPath();
     for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.4:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
     ctx.closePath();ctx.fill();ctx.restore();
   };
   doodleStar(W*.94,H*.16,S*.025);doodleStar(W*.92,H*.06,S*.018);
   // Tape strip top — the setlist is "taped" to the wall
   drawWashiTape(ctx,W*.5,H*.06,S*.16,S*.026,Math.PI*.05,'#d8c074');
 },
 canvasElements:[
   {kind:'text',text:'TONIGHT ONLY',x:0.5,y:0.103,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#c4502c',letterSpacing:'8px'}},
   {kind:'text',text:"BIRTHDAY TOUR · '26",x:0.502,y:0.13,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(40,40,80,.75)',letterSpacing:'5px'}},
   // Editable setlist track entries — double-click to rename.
   {kind:'text',text:'1.  Wake Up',x:0.28,y:0.34,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(40,40,80,.85)'}},
   {kind:'text',text:'2.  Cake Time',x:0.281,y:0.398,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(40,40,80,.85)'}},
   {kind:'text',text:'3.  Dance Floor',x:0.28,y:0.5,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(40,40,80,.85)'}},
   {kind:'text',text:'4.  Make a Wish',x:0.28,y:0.58,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(40,40,80,.85)'}},
   {kind:'text',text:'5.  Encore!',x:0.28,y:0.66,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(40,40,80,.85)'}},
   {kind:'text',text:'Headliner: YOU',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#3a4a8a'}},
 ]},

// BABY — Birth Certificate (official certificate aesthetic)
{id:'occ_baby_cert',name:'Certificate',cat:'baby',badge:'new',n:1,
 photoFrames:[
   {rx:.3,ry:.34,rw:.4,rh:.4,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf8e8','#f0e6c8',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,100,60,.13)',6);
   // Heavy ornate double border
   ctx.strokeStyle='rgba(120,100,60,.85)';ctx.lineWidth=Math.max(2,S*.0035);
   const m=S*.04;ctx.strokeRect(m,m,W-m*2,H-m*2);
   ctx.strokeStyle='rgba(212,175,55,.65)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.strokeRect(m+S*.012,m+S*.012,W-(m+S*.012)*2,H-(m+S*.012)*2);
   // Corner decorations
   [[m+S*.025,m+S*.025,1,1],[W-m-S*.025,m+S*.025,-1,1],[m+S*.025,H-m-S*.025,1,-1],[W-m-S*.025,H-m-S*.025,-1,-1]].forEach(([x,y,sx,sy])=>
     drawGoldLeafCorner(ctx,x,y,S*.04,sx,sy,'#c89a3a'));
   // Ribbon-banner under photo for "name" line
   ctx.fillStyle='#c4502c';
   ctx.beginPath();
   ctx.moveTo(W*.18,H*.78);ctx.lineTo(W*.82,H*.78);ctx.lineTo(W*.78,H*.83);ctx.lineTo(W*.82,H*.88);ctx.lineTo(W*.18,H*.88);ctx.lineTo(W*.22,H*.83);ctx.closePath();ctx.fill();
   // Wax seal top-right
   drawWaxSeal(ctx,W*.85,H*.18,S*.045,'#c4502c','♥');
   // Horizontal flourish lines flanking photo
   ctx.strokeStyle='rgba(140,110,50,.55)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.beginPath();ctx.moveTo(W*.08,H*.54);ctx.lineTo(W*.26,H*.54);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.74,H*.54);ctx.lineTo(W*.92,H*.54);ctx.stroke();
   // Tiny diamond in middle of each flourish
   ctx.fillStyle='#c89a3a';
   [W*.17,W*.83].forEach(x=>{ctx.beginPath();ctx.moveTo(x,H*.535);ctx.lineTo(x+S*.005,H*.54);ctx.lineTo(x,H*.545);ctx.lineTo(x-S*.005,H*.54);ctx.closePath();ctx.fill();});
 },
 canvasElements:[
   {kind:'text',text:'CERTIFICATE OF JOY',x:0.5,y:0.1,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#5a4020',letterSpacing:'8px'}},
   {kind:'text',text:'this is to certify that the bearer arrived',x:0.5,y:0.16,align:'center',style:{fontSize:'10px',fontFamily:"'Playfair Display','Fraunces',serif",fontStyle:'italic',color:'rgba(120,100,60,.8)',letterSpacing:'3px'}},
   {kind:'text',text:'Baby Name',x:0.5,y:0.81,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#fff',letterSpacing:'4px'}},
   {kind:'text',text:'BORN · 2026 · WEIGHT 7lb · LENGTH 20"',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(120,100,60,.85)',letterSpacing:'4px'}},
 ]},

// BIRTHDAY — Comic Book Cover (bold panels with speech bubbles)
{id:'occ_bday_comic',name:'Comic Cover',cat:'birthday',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.16,rw:.55,rh:.45,angle:0,shape:'rect'},
   {rx:.65,ry:.16,rw:.29,rh:.21,angle:0,shape:'rect'},
   {rx:.65,ry:.4,rw:.29,rh:.21,angle:0,shape:'rect'},
   {rx:.06,ry:.65,rw:.88,rh:.21,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#ffe22a','#ffaa00',135,.06,42);
   // Halftone dot pattern overlay (Lichtenstein feel)
   ctx.fillStyle='rgba(220,40,90,.35)';
   for(let y=H*.16;y<H*.86;y+=S*.012){
     for(let x=W*.04;x<W*.96;x+=S*.012){
       ctx.beginPath();ctx.arc(x,y,S*.002,0,Math.PI*2);ctx.fill();
     }
   }
   // Bold black panel borders around each photo (drawn over gaps)
   const frames=[[.06,.16,.55,.45],[.65,.16,.29,.21],[.65,.4,.29,.21],[.06,.65,.88,.21]];
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(3,S*.005);
   frames.forEach(([rx,ry,rw,rh])=>ctx.strokeRect(rx*W,ry*H,rw*W,rh*H));
   // Speech bubble in upper right with "POW!"
   ctx.save();ctx.translate(W*.85,H*.08);
   ctx.fillStyle='#fff';ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(2.5,S*.004);
   ctx.beginPath();
   for(let i=0;i<24;i++){
     const a=i/24*Math.PI*2,r=S*.05*(i%2?.75:1);
     const x=Math.cos(a)*r,y=Math.sin(a)*r;
     if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#1a1a1a';ctx.font=`900 ${S*.024}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('POW!',0,0);
   ctx.restore();
   // Speed lines from corner
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(1.5,S*.0025);
   for(let i=0;i<6;i++){
     const o=S*.03+i*S*.018;
     ctx.beginPath();ctx.moveTo(W*.04,H*.5+o);ctx.lineTo(W*.18,H*.5+o*.6);ctx.stroke();
   }
   // Bold black canvas border (comic frame)
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(4,S*.007);
   const m=S*.014;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'★ THE LEGEND OF YOU ★',x:0.5,y:0.05,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'4px'}},
   {kind:'text',text:'ISSUE #2026 · 25¢',x:0.5,y:0.93,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#dc285a',letterSpacing:'5px'}},
 ]},

// ANNIVERSARY — Botanical Specimen (scientific catalog with pressed leaves)
{id:'occ_ann_botanical',name:'Specimen',cat:'anniversary',badge:'new',n:6,
 photoFrames:[
   {rx:.08,ry:.18,rw:.24,rh:.22,angle:0,shape:'rect'},
   {rx:.38,ry:.18,rw:.24,rh:.22,angle:0,shape:'rect'},
   {rx:.68,ry:.18,rw:.24,rh:.22,angle:0,shape:'rect'},
   {rx:.08,ry:.5,rw:.24,rh:.22,angle:0,shape:'rect'},
   {rx:.38,ry:.5,rw:.24,rh:.22,angle:0,shape:'rect'},
   {rx:.68,ry:.5,rw:.24,rh:.22,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f4ecd8','#dccfb0',180,.06,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(110,90,50,.15)',6);
   // Pressed leaves in corners
   drawPineSprig(ctx,W*.04,H*.04,S*.13,Math.PI*.3,'rgba(90,110,70,.7)');
   ctx.save();ctx.scale(-1,1);drawPineSprig(ctx,-W*.96,H*.96,S*.13,Math.PI*.3,'rgba(90,110,70,.7)');ctx.restore();
   drawPressedFlower(ctx,W*.93,H*.07,S*.038,7,'rgba(140,80,80,.65)');
   drawPressedFlower(ctx,W*.07,H*.93,S*.04,5,'rgba(140,80,80,.65)');
   // Hairline frame
   ctx.strokeStyle='rgba(80,60,30,.55)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'HORTUS MEMORIAE',x:0.5,y:0.06,align:'center',style:{fontSize:'13px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#5a4020',letterSpacing:'7px'}},
   {kind:'text',text:'a garden of years grown together',x:0.5,y:0.11,align:'center',style:{fontSize:'10px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(110,90,50,.75)',letterSpacing:'3px'}},
   // Editable specimen labels — italic name + year code under each photo.
   {kind:'text',text:'Genesis',x:0.2,y:0.42,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.01',x:0.2,y:0.46,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'Bloom',x:0.5,y:0.42,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.05',x:0.5,y:0.46,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'Roots',x:0.8,y:0.42,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.10',x:0.8,y:0.46,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'Canopy',x:0.2,y:0.74,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.15',x:0.2,y:0.78,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'Forest',x:0.5,y:0.74,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.20',x:0.5,y:0.78,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'Grove',x:0.8,y:0.74,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(80,60,30,.85)'}},
   {kind:'text',text:'Yr.26',x:0.8,y:0.78,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(110,90,50,.7)',letterSpacing:'1px'}},
   {kind:'text',text:'CATALOGUED · MMXXVI',x:0.5,y:0.93,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(110,90,50,.7)',letterSpacing:'6px'}},
 ]},

// ANNIVERSARY — Movie Poster (Hollywood-style with hero photo + cast credits)
{id:'occ_ann_movie',name:'Movie Poster',cat:'anniversary',badge:'new',n:3,
 photoFrames:[
   {rx:0.18,ry:0.149,rw:0.638,rh:0.441,angle:0,shape:'rect'},
   {rx:0.179,ry:0.626,rw:0.3,rh:0.18,angle:0,shape:'rect'},
   {rx:0.52,ry:0.625,rw:0.3,rh:0.18,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a1538','#0a0820',180,.06,77);
   // Spotlight glow behind hero photo
   const glow=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,S*.5);
   glow.addColorStop(0,'rgba(255,180,80,.3)');glow.addColorStop(1,'rgba(255,180,80,0)');
   ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
   // Tagline divider lines
   ctx.strokeStyle='rgba(255,200,100,.65)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.2,H*.94);ctx.lineTo(W*.8,H*.94);ctx.stroke();
   // Star ratings
   ctx.fillStyle='rgba(255,200,100,.85)';ctx.font=`${S*.018}px sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('★ ★ ★ ★ ★',W*.5,H*.97);
   // (Producer banner, byline, star ratings are editable canvasElements below.)
   // Gold double-line hairline border
   ctx.strokeStyle='rgba(212,175,55,.7)';ctx.lineWidth=Math.max(1.2,S*.0018);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'FROM THE PRODUCERS OF "FOREVER" — A 2026 RELEASE',x:0.5,y:0.085,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,200,100,.95)',letterSpacing:'2px'}},
   {kind:'text',text:'ANNIVERSARY',x:0.5,y:0.04,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'10px'}},
   {kind:'text',text:'Together',x:0.5,y:0.836,align:'center',style:{fontSize:'42px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#fff',textShadow:'0 4px 12px rgba(255,180,80,.5)'}},
   {kind:'text',text:'A FILM BY US · BASED ON A TRUE LOVE STORY',x:0.5,y:0.91,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,235,180,.55)',letterSpacing:'2px'}},
   {kind:'text',text:'★ ★ ★ ★ ★',x:0.5,y:0.97,align:'center',style:{fontSize:'18px',fontFamily:"'Outfit','Inter',sans-serif",color:'rgba(255,200,100,.85)'}},
 ]},

// FAMILY — Cafe Chalkboard (handwritten menu with photos as menu items)
{id:'occ_fam_cafe',name:'Cafe Menu',cat:'family',badge:'new',n:4,
 photoFrames:[
   {rx:.07,ry:.22,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.07,ry:.45,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.07,ry:.68,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.6,ry:.32,rw:.34,rh:.46,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dark chalkboard
   drawGrainGradient(ctx,W,H,'#1a2820','#0a1410',180,.07,77);
   // Wood frame around chalkboard
   ctx.fillStyle='#5a3a20';
   const f=S*.025;ctx.fillRect(0,0,W,f);ctx.fillRect(0,H-f,W,f);ctx.fillRect(0,0,f,H);ctx.fillRect(W-f,0,f,H);
   // Wood grain
   ctx.strokeStyle='rgba(40,20,10,.4)';ctx.lineWidth=Math.max(.6,S*.001);
   const rng=seededRng(11);
   for(let i=0;i<20;i++){const x=rng()*W;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+rng()*S*.01-S*.005,f);ctx.stroke();ctx.beginPath();ctx.moveTo(x,H-f);ctx.lineTo(x+rng()*S*.01-S*.005,H);ctx.stroke();}
   // Chalk dust scatter
   ctx.fillStyle='rgba(255,255,255,.06)';
   for(let i=0;i<200;i++){const x=rng()*W,y=rng()*H,r=S*.0006+rng()*S*.0014;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
   // Dotted leader lines (decorative — non-editable)
   ctx.fillStyle='rgba(255,250,230,.45)';ctx.font=`${S*.014}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   for(let i=0;i<3;i++){
     ctx.fillText('. . . . . . . . . . . .',W*.55,H*(.31+i*.23));
   }
 },
 canvasElements:[
   {kind:'text',text:'~ TODAY\'S SPECIAL ~',x:0.5,y:0.08,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,235,180,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'Cafe de Famille',x:0.5,y:0.14,align:'center',style:{fontSize:'30px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,250,230,.95)'}},
   // Editable menu items (name on left, price on right) — double-click to rename.
   {kind:'text',text:"Mom's Hug Latte",x:0.27,y:0.31,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,250,230,.92)'}},
   {kind:'text',text:'$ ∞',x:0.95,y:0.31,align:'right',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,200,100,.9)'}},
   {kind:'text',text:'Dad Joke Espresso',x:0.27,y:0.54,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,250,230,.92)'}},
   {kind:'text',text:'$ 1',x:0.95,y:0.54,align:'right',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,200,100,.9)'}},
   {kind:'text',text:'Kid Hot Cocoa',x:0.27,y:0.77,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,250,230,.92)'}},
   {kind:'text',text:'$ 0',x:0.95,y:0.77,align:'right',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,200,100,.9)'}},
   {kind:'text',text:'open daily · always serving love',x:0.5,y:0.94,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(255,235,180,.7)',letterSpacing:'3px'}},
 ]},

// TRAVEL — Vintage Postcard (greeting on left + photo on right + stamp + address)
{id:'occ_travel_postcard',name:'Postcard',cat:'travel',badge:'new',n:3,
 photoFrames:[
   {rx:.5,ry:.14,rw:.45,rh:.7,angle:0,shape:'rect'},
   {rx:.06,ry:.62,rw:.18,rh:.22,angle:-3,shape:'rect'},
   {rx:.27,ry:.62,rw:.18,rh:.22,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf5e2','#e8d4b0',135,.07,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,80,40,.13)',6);
   // Vertical divider line down middle (postcard convention)
   ctx.strokeStyle='rgba(120,80,40,.55)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.beginPath();ctx.moveTo(W*.485,H*.1);ctx.lineTo(W*.485,H*.9);ctx.stroke();
   // Address-side label "ADDRESS" tiny, with horizontal lines
   ctx.fillStyle='rgba(120,80,40,.7)';ctx.font=`700 ${S*.01}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ctx.fillText('TO:',W*.06,H*.18);
   ctx.strokeStyle='rgba(120,80,40,.4)';ctx.lineWidth=Math.max(.6,S*.001);
   for(let i=0;i<3;i++){
     const y=H*.22+i*S*.02;
     ctx.beginPath();ctx.moveTo(W*.06,y);ctx.lineTo(W*.42,y);ctx.stroke();
   }
   // Postage stamp top-right of left half
   ctx.save();ctx.translate(W*.4,H*.14);ctx.rotate(-Math.PI*.05);
   ctx.fillStyle='#fefcf3';ctx.fillRect(-S*.045,-S*.058,S*.09,S*.116);
   // Perforation
   ctx.fillStyle='rgba(120,80,40,.55)';
   for(let p=-S*.045;p<=S*.045;p+=S*.009){ctx.beginPath();ctx.arc(p,-S*.058,S*.003,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p,S*.058,S*.003,0,Math.PI*2);ctx.fill();}
   for(let p=-S*.058;p<=S*.058;p+=S*.009){ctx.beginPath();ctx.arc(-S*.045,p,S*.003,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(S*.045,p,S*.003,0,Math.PI*2);ctx.fill();}
   // Stamp art — palm tree
   ctx.fillStyle='#3a8a4a';
   ctx.beginPath();ctx.moveTo(0,S*.03);ctx.lineTo(-S*.005,-S*.02);ctx.lineTo(S*.005,-S*.02);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.ellipse(0,-S*.025,S*.025,S*.012,0,0,Math.PI*2);ctx.fill();
   // Denomination
   ctx.fillStyle='#c4502c';ctx.font=`900 ${S*.013}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('5¢',0,S*.043);
   ctx.restore();
   // Circular postmark over the stamp
   ctx.save();ctx.translate(W*.32,H*.18);
   ctx.strokeStyle='rgba(120,30,30,.6)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.beginPath();ctx.arc(0,0,S*.04,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(0,0,S*.03,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='rgba(120,30,30,.7)';ctx.font=`900 ${S*.01}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('POSTMARK',0,-S*.008);ctx.fillText('2026',0,S*.008);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'wish you were here',x:0.149,y:0.101,align:'center',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#5a3a1a'}},
   {kind:'text',text:'POSTCARD',x:0.27,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(120,80,40,.85)',letterSpacing:'8px'}},
 ]},

// ANNIVERSARY — Magazine Cover (Vogue-style with hero + cover lines)
{id:'occ_ann_magazine',name:'Magazine',cat:'anniversary',badge:'new',n:1,
 photoFrames:[
   {rx:0.058,ry:0.194,rw:0.69,rh:0.629,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf3ee','#f0d5cc',135,.06,33);
   // Top color band where the magazine title sits
   ctx.fillStyle='#1a1c2e';ctx.fillRect(0,0,W,H*.16);
   // Cover lines on the right edge
   ctx.fillStyle='rgba(40,40,60,.85)';ctx.font=`700 ${S*.012}px 'Outfit',sans-serif`;
   ctx.textAlign='right';ctx.textBaseline='top';
   const lines=['LOVE NEVER GETS OLD','— The Anniversary Issue —','Inside: 26 Reasons Still','THE COUPLE OF THE YEAR','Page 12 · Their Story'];
   lines.forEach((t,i)=>ctx.fillText(t.toUpperCase(),W*.94,H*(.22+i*.05)));
   // Bottom right "barcode"
   ctx.fillStyle='#1a1c2e';
   const rng=seededRng(11);
   for(let x=0;x<W*.14;x+=S*.004){
     const w=S*.001+rng()*S*.002;
     ctx.fillRect(W*.78+x,H*.92,w,H*.05);
   }
   // Issue number top-left badge
   ctx.fillStyle='#fff';ctx.font=`700 ${S*.011}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   ctx.fillText('ISSUE 2026 · ANNIVERSARY EDITION · $9.99',W*.04,H*.13);
 },
 canvasElements:[
   {kind:'text',text:'AMOUR',x:0.5,y:0.075,align:'center',style:{fontSize:'56px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#fff',letterSpacing:'14px'}},
   {kind:'text',text:'ANNIVERSARY ISSUE',x:0.06,y:0.85,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#1a1c2e',letterSpacing:'4px'}},
   {kind:'text',text:'a celebration of us',x:0.06,y:0.89,align:'left',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#1a1c2e'}},
 ]},

// BIRTHDAY — Admit One (carnival ticket stubs with perforation)
{id:'occ_bday_ticket',name:'Admit One',cat:'birthday',badge:'new',n:4,
 photoFrames:[
   {rx:.05,ry:.18,rw:.42,rh:.32,angle:-3,shape:'rect'},
   {rx:.53,ry:.18,rw:.42,rh:.32,angle:3,shape:'rect'},
   {rx:.05,ry:.55,rw:.42,rh:.32,angle:3,shape:'rect'},
   {rx:.53,ry:.55,rw:.42,rh:.32,angle:-3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a0e2e','#080418',180,.06,77);
   // Carnival sparkles
   const rng=seededRng(11);
   for(let i=0;i<60;i++){
     const x=rng()*W,y=rng()*H,r=S*.0008+rng()*S*.002;
     ctx.fillStyle=`rgba(255,210,100,${.5+rng()*.5})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Each photo gets a "ticket stub" frame with perforated tear-edge on one side
   const stub=(rx,ry,rw,rh,angle,col,side)=>{
     const x=rx*W,y=ry*H,w=rw*W,h=rh*H;
     ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle*Math.PI/180);
     ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=S*.012;ctx.shadowOffsetY=S*.004;
     ctx.fillStyle=col;
     ctx.fillRect(-w/2-S*.01,-h/2-S*.01,w+S*.02,h+S*.02);
     ctx.shadowColor='transparent';
     // Bold black border
     ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(2,S*.003);
     ctx.strokeRect(-w/2-S*.01,-h/2-S*.01,w+S*.02,h+S*.02);
     // Perforated tear-line on one side
     ctx.fillStyle='#1a1a1a';
     const startY=-h/2,endY=h/2;
     const tx=side==='left'?-w/2+S*.02:w/2-S*.02;
     for(let py=startY;py<=endY;py+=S*.012){ctx.beginPath();ctx.arc(tx,py,S*.003,0,Math.PI*2);ctx.fill();}
     // ADMIT ONE label in tear strip
     ctx.fillStyle='#1a1a1a';ctx.font=`900 ${S*.01}px 'Outfit',sans-serif`;
     ctx.textAlign='center';ctx.textBaseline='middle';
     ctx.save();ctx.translate(side==='left'?-w/2+S*.005:w/2-S*.005,0);ctx.rotate(side==='left'?-Math.PI/2:Math.PI/2);
     ctx.fillText('ADMIT ONE · 2026',0,0);
     ctx.restore();
     ctx.restore();
   };
   stub(.05,.18,.42,.32,-3,'#ffd45a','left');
   stub(.53,.18,.42,.32,3,'#ff6bcf','right');
   stub(.05,.55,.42,.32,3,'#6bd4ff','left');
   stub(.53,.55,.42,.32,-3,'#a06bff','right');
 },
 canvasElements:[
   {kind:'text',text:'★ STEP RIGHT UP ★',x:0.5,y:0.05,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#ffd45a',letterSpacing:'6px',textShadow:'0 2px 8px rgba(255,212,90,.5)'}},
   {kind:'text',text:'The Birthday Carnival',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'#ff8ade'}},
 ]},

// ANNIVERSARY — Tarot Spread (3 mystical tarot cards, indigo + gold)
{id:'occ_ann_tarot',name:'Tarot Spread',cat:'anniversary',badge:'new',n:3,
 photoFrames:[
   {rx:.08,ry:.22,rw:.24,rh:.46,angle:-6,shape:'rect'},
   {rx:.38,ry:.18,rw:.24,rh:.46,angle:0,shape:'rect'},
   {rx:.68,ry:.22,rw:.24,rh:.46,angle:6,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a0e3a','#0a0520',180,.06,99);
   // Mystical sparkles
   const rng=seededRng(33);
   for(let i=0;i<80;i++){
     const x=rng()*W,y=rng()*H,r=S*.0006+rng()*S*.0022;
     ctx.fillStyle=`rgba(255,215,150,${.4+rng()*.55})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Crescent moon top-center
   drawCrescent(ctx,W*.5,H*.08,S*.03,'rgba(212,175,55,.85)');
   // Gold stars on crescent flanks
   drawStarburst8(ctx,W*.35,H*.07,S*.014,'rgba(212,175,55,.8)');
   drawStarburst8(ctx,W*.65,H*.07,S*.014,'rgba(212,175,55,.8)');
   // Tarot card "labels" beneath each
   ctx.fillStyle='rgba(212,175,55,.85)';ctx.font=`italic 700 ${S*.014}px 'Playfair Display',serif`;
   ctx.textAlign='center';ctx.textBaseline='top';
   const labels=['Past','Present','Future'];
   const positions=[[.2,.7],[.5,.66],[.8,.7]];
   positions.forEach(([rx,ry],i)=>ctx.fillText(labels[i],rx*W,ry*H));
   // Roman numerals above each
   ctx.fillStyle='rgba(212,175,55,.7)';ctx.font=`900 ${S*.012}px 'Outfit',sans-serif`;
   ['I','II','III'].forEach((n,i)=>ctx.fillText(n,positions[i][0]*W,positions[i][1]*H+S*.022));
   // Eye in the center bottom (mystical)
   ctx.save();ctx.translate(W*.5,H*.86);
   ctx.strokeStyle='rgba(212,175,55,.7)';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.beginPath();ctx.ellipse(0,0,S*.03,S*.015,0,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='rgba(212,175,55,.85)';
   ctx.beginPath();ctx.arc(0,0,S*.01,0,Math.PI*2);ctx.fill();
   ctx.restore();
   // Hairline gold border
   ctx.strokeStyle='rgba(212,175,55,.55)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'THE LOVERS · A SPREAD',x:0.5,y:0.04,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'8px'}},
   {kind:'text',text:'Written in the Stars',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#e8c56a'}},
 ]},

// GRADUATION — Pennant Flag (triangular school pennant)
{id:'occ_grad_pennant',name:'Pennant',cat:'graduation',badge:'new',n:1,
 photoFrames:[
   {rx:0.124,ry:0.324,rw:0.348,rh:0.35,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5ecd6','#e6d5a8',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(80,40,40,.1)',5);
   // Triangular pennant in school colors
   ctx.save();
   ctx.shadowColor='rgba(80,40,40,.3)';ctx.shadowBlur=S*.018;ctx.shadowOffsetX=S*.004;ctx.shadowOffsetY=S*.008;
   ctx.fillStyle='#8b1a2a';
   ctx.beginPath();
   ctx.moveTo(W*.06,H*.2);
   ctx.lineTo(W*.92,H*.5);
   ctx.lineTo(W*.06,H*.8);
   ctx.closePath();ctx.fill();
   ctx.restore();
   // Inner cream border
   ctx.strokeStyle='#f0e0a8';ctx.lineWidth=Math.max(2,S*.0035);
   ctx.beginPath();
   ctx.moveTo(W*.08,H*.22);
   ctx.lineTo(W*.88,H*.5);
   ctx.lineTo(W*.08,H*.78);
   ctx.closePath();ctx.stroke();
   // Hanging strings at flagpole side (left)
   ctx.strokeStyle='#5a3020';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.beginPath();ctx.moveTo(W*.06,H*.05);ctx.lineTo(W*.06,H*.2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.06,H*.8);ctx.lineTo(W*.06,H*.95);ctx.stroke();
   // Tassels at point
   ctx.fillStyle='#d4af37';
   for(let i=-2;i<=2;i++){ctx.fillRect(W*.92+S*.005,H*.5-S*.005+i*S*.005,S*.025,S*.003);}
   // Year is now an editable canvasElement so the user can change it.
 },
 canvasElements:[
   {kind:'text',text:'GRADUATING CLASS',x:0.5,y:0.06,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#8b1a2a',letterSpacing:'8px'}},
   // Year text rotated to follow the pennant edge angle. Editable — double-click to change.
   {kind:'text',text:'2026',x:0.7,y:0.5,align:'center',angle:18,style:{fontSize:'28px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#d4af37'}},
   {kind:'text',text:'GO TEAM',x:0.5,y:0.919,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#8b1a2a',letterSpacing:'8px'}},
 ]},

// FAMILY — Notebook Doodle (lined paper with hand-drawn doodles)
{id:'occ_fam_notebook',name:'Notebook',cat:'family',badge:'new',n:4,
 photoFrames:[
   {rx:0.55,ry:0.18,rw:0.36,rh:0.3,angle:-2,shape:'rect'},
   {rx:0.55,ry:0.55,rw:0.36,rh:0.28,angle:3,shape:'rect'},
   {rx:0.18,ry:0.62,rw:0.22,rh:0.22,angle:-3,shape:'circle'},
   {rx:0.02,ry:0.213,rw:0.225,rh:0.231,angle:0,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf9f0','#f0eddc',180,.04,33);
   // Spiral binding holes top
   ctx.fillStyle='#dccbb0';
   for(let x=W*.04;x<W*.96;x+=W*.06){
     ctx.beginPath();ctx.arc(x,H*.05,S*.012,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle='#a89578';
   for(let x=W*.04;x<W*.96;x+=W*.06){
     ctx.beginPath();ctx.arc(x,H*.05,S*.008,0,Math.PI*2);ctx.fill();
   }
   // Blue ruled lines
   ctx.strokeStyle='rgba(80,120,180,.35)';ctx.lineWidth=Math.max(.7,S*.001);
   for(let i=0;i<22;i++){
     const y=H*.13+i*H*.04;
     ctx.beginPath();ctx.moveTo(W*.04,y);ctx.lineTo(W*.96,y);ctx.stroke();
   }
   // Red margin line
   ctx.strokeStyle='rgba(196,80,44,.6)';ctx.lineWidth=Math.max(1,S*.0017);
   ctx.beginPath();ctx.moveTo(W*.13,H*.1);ctx.lineTo(W*.13,H*.96);ctx.stroke();
   // Doodles in margin (tiny stars + arrows)
   ctx.fillStyle='rgba(40,55,90,.7)';
   const star=(cx,cy,r)=>{
     ctx.save();ctx.translate(cx,cy);ctx.beginPath();
     for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.4:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
     ctx.closePath();ctx.fill();ctx.restore();
   };
   star(W*.07,H*.45,S*.012);
   star(W*.08,H*.78,S*.014);
   // Squiggle next to heart
   ctx.strokeStyle='rgba(196,80,44,.65)';ctx.lineWidth=Math.max(1.4,S*.0022);ctx.lineCap='round';
   ctx.beginPath();
   ctx.moveTo(W*.22,H*.32);
   ctx.bezierCurveTo(W*.27,H*.28,W*.32,H*.36,W*.4,H*.32);
   ctx.stroke();
   // (Handwritten "today we..." caption is now an editable canvasElement.)
 },
 canvasElements:[
   {kind:'text',text:'MY FAMILY DIARY',x:0.499,y:0.082,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(196,80,44,.9)',letterSpacing:'7px'}},
   {kind:'text',text:'today we...',x:0.18,y:0.5,align:'left',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(40,55,90,.8)'}},
   {kind:'text',text:'page · twenty six',x:0.94,y:0.94,align:'right',style:{fontSize:'10px',fontFamily:"'Pacifico',cursive",fontWeight:'400',fontStyle:'italic',color:'rgba(40,55,90,.7)'}},
 ]},

// GRADUATION — Awards Show (gold trophy / award certificate aesthetic)
{id:'occ_grad_awards',name:'Awards',cat:'graduation',badge:'new',n:1,
 photoFrames:[
   {rx:.27,ry:.3,rw:.46,rh:.46,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H));
   g.addColorStop(0,'#3a1a52');g.addColorStop(1,'#0d0418');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   // Spotlight beam from top
   ctx.save();
   const beam=ctx.createLinearGradient(W*.5,0,W*.5,H);
   beam.addColorStop(0,'rgba(255,200,100,.35)');beam.addColorStop(1,'rgba(255,200,100,0)');
   ctx.fillStyle=beam;
   ctx.beginPath();
   ctx.moveTo(W*.42,0);ctx.lineTo(W*.58,0);ctx.lineTo(W*.85,H);ctx.lineTo(W*.15,H);ctx.closePath();ctx.fill();
   ctx.restore();
   // Gold sparkles scattered
   const rng=seededRng(33);
   for(let i=0;i<24;i++){
     const x=rng()*W,y=rng()*H,r=S*.005+rng()*S*.012;
     drawStarburst8(ctx,x,y,r,'rgba(255,200,100,.85)');
   }
   // Gold laurel wreath around the photo
   ctx.save();ctx.translate(W*.5,H*.53);
   ctx.strokeStyle='#d4af37';ctx.lineWidth=Math.max(1.5,S*.0025);
   const wR=S*.27;
   for(let i=0;i<2;i++){
     ctx.save();if(i)ctx.scale(-1,1);
     // Laurel curve
     ctx.beginPath();
     ctx.moveTo(-wR*.95,-wR*.5);
     ctx.bezierCurveTo(-wR*1.1,0,-wR*1.1,wR*.5,-wR*.95,wR*.85);
     ctx.stroke();
     // Leaves
     for(let k=0;k<8;k++){
       const t=k/8,y=-wR*.5+t*wR*1.35;
       const x=-wR*1.05;
       ctx.fillStyle='#d4af37';
       ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI*.3);
       ctx.beginPath();ctx.ellipse(0,0,S*.024,S*.01,0,0,Math.PI*2);ctx.fill();
       ctx.restore();
     }
     ctx.restore();
   }
   ctx.restore();
   // Bow at the bottom of the wreath
   ctx.fillStyle='#c4502c';
   ctx.save();ctx.translate(W*.5,H*.82);
   ctx.beginPath();ctx.ellipse(-S*.025,0,S*.022,S*.012,Math.PI*.2,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.ellipse(S*.025,0,S*.022,S*.012,-Math.PI*.2,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(0,0,S*.008,0,Math.PI*2);ctx.fill();
   // Ribbon tails
   ctx.fillRect(-S*.012,0,S*.008,S*.04);
   ctx.fillRect(S*.005,0,S*.008,S*.04);
   ctx.restore();
   // Hairline gold border
   ctx.strokeStyle='rgba(212,175,55,.6)';ctx.lineWidth=Math.max(1,S*.0015);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'AND THE WINNER IS...',x:0.5,y:0.06,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'8px'}},
   {kind:'text',text:'Graduate of the Year',x:0.5,y:0.12,align:'center',style:{fontSize:'10px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'rgba(255,235,180,.8)',letterSpacing:'3px'}},
   {kind:'text',text:'CLASS OF 2026',x:0.5,y:0.93,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#e8c56a',letterSpacing:'8px'}},
 ]},

// BIRTHDAY — Festival Wristband (paper wristband with photos as stops)
{id:'occ_bday_wristband',name:'Wristband',cat:'birthday',badge:'new',n:5,
 photoFrames:[
   {rx:.03,ry:.42,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.22,ry:.42,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.41,ry:.42,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.60,ry:.42,rw:.16,rh:.16,angle:0,shape:'circle'},
   {rx:.79,ry:.42,rw:.16,rh:.16,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Festival sunset background
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#7d1a82');g.addColorStop(.6,'#e8541c');g.addColorStop(1,'#ffd45a');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,42);
   // The wristband body — bright pink with photos sitting in it
   ctx.save();
   ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=S*.018;ctx.shadowOffsetY=S*.008;
   ctx.fillStyle='#ff6bcf';
   ctx.fillRect(0,H*.36,W,H*.28);
   ctx.shadowColor='transparent';
   ctx.restore();
   // Diagonal stripe pattern overlay on wristband
   ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=Math.max(2,S*.004);
   for(let x=-H;x<W+H;x+=S*.03){
     ctx.beginPath();ctx.moveTo(x,H*.36);ctx.lineTo(x+H*.28,H*.64);ctx.stroke();
   }
   // Top + bottom edge lines
   ctx.strokeStyle='rgba(180,40,120,.7)';ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.beginPath();ctx.moveTo(0,H*.36);ctx.lineTo(W,H*.36);ctx.stroke();
   ctx.beginPath();ctx.moveTo(0,H*.64);ctx.lineTo(W,H*.64);ctx.stroke();
   // (FEST / 2026 + VIP stamp text are editable canvasElements below.)
   // Plastic adjuster clasp on right edge
   ctx.fillStyle='rgba(0,0,0,.6)';
   ctx.fillRect(W*.95,H*.34,S*.02,H*.32);
   // VIP stamp box outline (kept as decoration)
   ctx.save();ctx.translate(W*.5,H*.86);ctx.rotate(-Math.PI*.06);
   ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(2,S*.003);
   ctx.strokeRect(-S*.06,-S*.022,S*.12,S*.044);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'★ THE BIRTHDAY FESTIVAL ★',x:0.5,y:0.07,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(255,235,180,.95)',letterSpacing:'7px'}},
   // Editable festival logo on the wristband — name + year stacked.
   {kind:'text',text:'FEST',x:0.06,y:0.27,align:'center',style:{fontSize:'20px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#fff'}},
   {kind:'text',text:'2026',x:0.06,y:0.31,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#fff'}},
   // Editable VIP stamp text (rotated to match the box angle).
   {kind:'text',text:'VIP ★ ALL ACCESS',x:0.5,y:0.849,align:'center',angle:-11,style:{fontSize:'18px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#fff'}},
   {kind:'text',text:'three days · one icon',x:0.5,y:0.94,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,235,180,.85)',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// HOLIDAY — Snow Globe (winter scene inside a glass dome)
{id:'occ_hol_snowglobe',name:'Snow Globe',cat:'holiday',badge:'new',n:1,
 photoFrames:[
   {rx:.22,ry:.18,rw:.56,rh:.56,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#1a3258','#0a1832',180,.05,55);
   // Falling snow scattered everywhere
   const rng=seededRng(11);
   for(let i=0;i<160;i++){
     const x=rng()*W,y=rng()*H,r=S*.001+rng()*S*.0028;
     ctx.fillStyle=`rgba(255,255,255,${.5+rng()*.5})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Glass dome highlight — radial bright center, dim edges
   const cx=W*.5,cy=H*.46,r=S*.32;
   const dome=ctx.createRadialGradient(cx-S*.06,cy-S*.06,0,cx,cy,r);
   dome.addColorStop(0,'rgba(255,255,255,.18)');
   dome.addColorStop(.6,'rgba(255,255,255,.04)');
   dome.addColorStop(1,'rgba(255,255,255,0)');
   ctx.fillStyle=dome;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
   // Glass dome outline (thin white ring)
   ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.beginPath();ctx.arc(cx,cy,r+S*.012,0,Math.PI*2);ctx.stroke();
   // Wooden base under the globe
   ctx.save();
   ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=S*.018;ctx.shadowOffsetY=S*.006;
   ctx.fillStyle='#5a3520';
   const baseY=cy+r-S*.005,baseW=r*1.4,baseH=S*.06;
   ctx.beginPath();
   ctx.moveTo(cx-baseW/2,baseY);
   ctx.lineTo(cx+baseW/2,baseY);
   ctx.lineTo(cx+baseW/2*.85,baseY+baseH);
   ctx.lineTo(cx-baseW/2*.85,baseY+baseH);
   ctx.closePath();ctx.fill();
   ctx.shadowColor='transparent';
   // Wood grain
   ctx.strokeStyle='rgba(40,20,10,.4)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let i=0;i<5;i++){const yy=baseY+baseH*(.2+i*.15);ctx.beginPath();ctx.moveTo(cx-baseW/2*.95,yy);ctx.lineTo(cx+baseW/2*.95,yy);ctx.stroke();}
   ctx.restore();
   // (Engraved "❅ JOY ❅" base text is now an editable canvasElement.)
 },
 canvasElements:[
   {kind:'text',text:'A LITTLE WORLD OF WONDER',x:0.5,y:0.06,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(212,175,55,.95)',letterSpacing:'7px'}},
   {kind:'text',text:'❅ JOY ❅',x:0.5,y:0.793,align:'center',style:{fontSize:'18px',fontFamily:"'Outfit','Inter',sans-serif",color:'rgba(212,175,55,.85)',letterSpacing:'2px'}},
   {kind:'text',text:'Shake to make it snow',x:0.5,y:0.92,align:'center',style:{fontSize:'18px',fontFamily:"'Pacifico',cursive",fontWeight:'400',color:'rgba(255,255,255,.95)'}},
 ]},

// WEDDING — Vintage Invitation (rose-gold bordered formal invite)
{id:'occ_wed_invite',name:'Invitation',cat:'wedding',badge:'new',n:1,
 photoFrames:[
   {rx:.284,ry:.329,rw:.44,rh:.44,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf3ed','#f0d4c2',135,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,90,80,.13)',6);
   // Formal double-line border
   ctx.strokeStyle='rgba(180,120,100,.8)';ctx.lineWidth=Math.max(1.8,S*.003);
   const m1=S*.04;ctx.strokeRect(m1,m1,W-m1*2,H-m1*2);
   ctx.strokeStyle='rgba(180,120,100,.45)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m2=S*.052;ctx.strokeRect(m2,m2,W-m2*2,H-m2*2);
   // Rose-gold corner flourishes
   [[m1+S*.015,m1+S*.015,1,1],[W-m1-S*.015,m1+S*.015,-1,1],[m1+S*.015,H-m1-S*.015,1,-1],[W-m1-S*.015,H-m1-S*.015,-1,-1]].forEach(([x,y,sx,sy])=>
     drawGoldLeafCorner(ctx,x,y,S*.05,sx,sy,'#bd7868'));
   // Botanical sprigs flanking the photo circle
   drawBotanicalSpray(ctx,W*.18,H*.55,S*.16,Math.PI*.6,'rgba(140,160,100,.8)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.82,H*.55,S*.16,Math.PI*.6,'rgba(140,160,100,.8)');ctx.restore();
   // Tiny rose at center bottom of photo arrangement
   drawRose(ctx,W*.5,H*.84,S*.04,0,'#bd7868');
   drawRose(ctx,W*.42,H*.86,S*.025,.4,'#d49a8a');
   drawRose(ctx,W*.58,H*.86,S*.025,-.4,'#d49a8a');
   // Decorative line under "save the date"
   ctx.strokeStyle='rgba(180,120,100,.7)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.35,H*.27);ctx.lineTo(W*.65,H*.27);ctx.stroke();
   // Tiny diamond in the middle of that line
   ctx.fillStyle='#bd7868';
   ctx.beginPath();ctx.moveTo(W*.5,H*.265);ctx.lineTo(W*.505,H*.27);ctx.lineTo(W*.5,H*.275);ctx.lineTo(W*.495,H*.27);ctx.closePath();ctx.fill();
 },
 canvasElements:[
   {kind:'text',text:'TOGETHER WITH THEIR FAMILIES',x:0.5,y:0.16,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.85)',letterSpacing:'5px'}},
   {kind:'text',text:'invite you to celebrate',x:0.5,y:0.21,align:'center',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(140,90,80,.8)',letterSpacing:'2px'}},
   {kind:'text',text:'Save the Date',x:0.5,y:0.901,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#9a4a3a'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// ✨ PREMIUM SCRAPBOOK SET — overlapping cells + decorative elements
// Inspired by Canva-style sentimental layouts. Each one mixes 4-6 lightly
// rotated photo frames with hand-drawn-feeling decorations and dual-font
// editorial typography for that "card you'd actually keep" feel.
// ═══════════════════════════════════════════════════════════════

// 6-photo scrapbook with cloud doodles, washi tape, and a peach text card.
{id:'occ_bday_scrapbook',name:'Lovely Scrapbook',cat:'birthday',badge:'new',n:6,
 photoFrames:[
   {rx:.05,ry:.04,rw:.32,rh:.26,angle:-3},
   {rx:.40,ry:.02,rw:.30,rh:.24,angle:2},
   {rx:.69,ry:.10,rw:.27,rh:.32,angle:-2},
   {rx:.04,ry:.34,rw:.34,rh:.30,angle:2},
   {rx:.42,ry:.30,rw:.32,rh:.30,angle:-1},
   {rx:.05,ry:.68,rw:.42,rh:.28,angle:-2},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft cream paper with grain
   drawGrainGradient(ctx,W,H,'#fdf6ed','#f6e6d2',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,33);
   // White cloud doodles in the gaps between photos
   drawCloud(ctx,W*.78,H*.04,S*.06,'rgba(255,255,255,.95)');
   drawCloud(ctx,W*.18,H*.31,S*.05,'rgba(255,255,255,.9)');
   drawCloud(ctx,W*.50,H*.66,S*.045,'rgba(255,255,255,.92)');
   drawCloud(ctx,W*.91,H*.53,S*.05,'rgba(255,255,255,.9)');
   drawCloud(ctx,W*.85,H*.74,S*.04,'rgba(255,255,255,.85)');
   // Tiny gold sparkles
   drawSparkle(ctx,W*.34,H*.30,S*.018,'#d4a574');
   drawSparkle(ctx,W*.74,H*.43,S*.014,'#d4a574');
   drawSparkle(ctx,W*.90,H*.92,S*.016,'#d4a574');
   // Peach text card behind the title (rounded rectangle)
   ctx.save();
   ctx.fillStyle='#f9c8a8';
   const cx=W*.52,cy=H*.81,cw=W*.46,ch=H*.16,r=Math.min(cw,ch)*.08;
   ctx.beginPath();
   ctx.moveTo(cx+r,cy);ctx.lineTo(cx+cw-r,cy);ctx.quadraticCurveTo(cx+cw,cy,cx+cw,cy+r);
   ctx.lineTo(cx+cw,cy+ch-r);ctx.quadraticCurveTo(cx+cw,cy+ch,cx+cw-r,cy+ch);
   ctx.lineTo(cx+r,cy+ch);ctx.quadraticCurveTo(cx,cy+ch,cx,cy+ch-r);
   ctx.lineTo(cx,cy+r);ctx.quadraticCurveTo(cx,cy,cx+r,cy);
   ctx.closePath();ctx.fill();
   // Inner stamp border
   ctx.strokeStyle='rgba(140,75,50,.6)';ctx.lineWidth=Math.max(1,S*.0014);
   ctx.setLineDash([S*.008,S*.005]);ctx.stroke();ctx.setLineDash([]);
   ctx.restore();
   // Corner washi tapes on the bottom-left photo
   drawWashiTape(ctx,W*.06,H*.69,S*.07,S*.018,-Math.PI*.08,'#e8a87c');
 },
 canvasElements:[
   {kind:'text',text:'Happy Birthday',x:0.75,y:0.86,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#c45a2c'}},
   {kind:'text',text:'My Lovely Girl',x:0.75,y:0.92,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2618',letterSpacing:'4px',textTransform:'uppercase'}},
 ]},

// 4-photo dark luxury editorial — anniversary
{id:'occ_anniv_velvet',name:'Velvet Hour',cat:'anniversary',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.18,rw:.42,rh:.32,angle:-2},
   {rx:.52,ry:.14,rw:.42,rh:.36,angle:1},
   {rx:.04,ry:.54,rw:.46,rh:.32,angle:1},
   {rx:.54,ry:.56,rw:.42,rh:.30,angle:-2},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Deep velvet burgundy gradient
   const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);
   g.addColorStop(0,'#3a1a2a');g.addColorStop(.6,'#2a0e1c');g.addColorStop(1,'#180812');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,55);
   // Gold bokeh
   drawBokeh(ctx,W,H,28,'#d4af37',7);
   // Top + bottom gold rules
   ctx.strokeStyle='rgba(212,175,55,.7)';ctx.lineWidth=Math.max(1.2,S*.0022);
   ctx.beginPath();ctx.moveTo(W*.18,H*.085);ctx.lineTo(W*.82,H*.085);ctx.stroke();
   ctx.lineWidth=Math.max(.6,S*.0008);
   ctx.beginPath();ctx.moveTo(W*.18,H*.099);ctx.lineTo(W*.82,H*.099);ctx.stroke();
   // Small diamond ornament centered between rules
   ctx.fillStyle='#d4af37';
   ctx.beginPath();ctx.moveTo(W*.5,H*.082);ctx.lineTo(W*.508,H*.092);ctx.lineTo(W*.5,H*.102);ctx.lineTo(W*.492,H*.092);ctx.closePath();ctx.fill();
   // Brushstroke between top photo row and bottom row
   drawBrushStroke(ctx,W*.18,H*.515,W*.82,H*.515,S*.012,'#d4af37',.6);
   // Heart accents at bottom corners
   drawHeart(ctx,W*.08,H*.94,S*.022,'rgba(212,175,55,.8)');
   drawHeart(ctx,W*.92,H*.94,S*.022,'rgba(212,175,55,.8)');
   // Ornamental gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,175,55,.55)',Math.max(10,S*.020));
 },
 canvasElements:[
   {kind:'text',text:'EST. 2020 / TOGETHER',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#d4af37',letterSpacing:'7px'}},
   {kind:'text',text:'Forever',x:0.5,y:0.89,align:'center',style:{fontSize:'48px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#fff4d0'}},
   {kind:'text',text:'six years and counting',x:0.5,y:0.96,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(255,244,208,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// 5-photo botanical family — sage and cream
{id:'occ_family_garden',name:'Sunday Garden',cat:'family',badge:'new',n:5,
 photoFrames:[
   {rx:.04,ry:.18,rw:.34,rh:.28,angle:-3},
   {rx:.40,ry:.14,rw:.30,rh:.34,angle:2},
   {rx:.72,ry:.20,rw:.24,rh:.26,angle:-2},
   {rx:.06,ry:.50,rw:.42,rh:.30,angle:2},
   {rx:.52,ry:.52,rw:.42,rh:.32,angle:-1},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f4f0e3','#e6e2cf',180,.05,28);
   drawFilmGrain(ctx,W,H,.04,15);
   // Botanical sprigs in all 4 corners
   drawBotanicalSpray(ctx,W*.05,H*.05,S*.16,Math.PI*.25,'#7a8c5c');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.95,H*.05,S*.16,Math.PI*.25,'#7a8c5c');ctx.restore();
   ctx.save();ctx.scale(1,-1);drawBotanicalSpray(ctx,W*.05,-H*.95,S*.16,Math.PI*.25,'#7a8c5c');ctx.restore();
   ctx.save();ctx.scale(-1,-1);drawBotanicalSpray(ctx,-W*.95,-H*.95,S*.16,Math.PI*.25,'#7a8c5c');ctx.restore();
   // Heart accent + sparkles in the gaps
   drawHeart(ctx,W*.51,H*.46,S*.025,'#a3493d');
   drawSparkle(ctx,W*.05,H*.45,S*.014,'#bd9a5a');
   drawSparkle(ctx,W*.96,H*.5,S*.014,'#bd9a5a');
   // Washi tapes on the top photos
   drawWashiTape(ctx,W*.20,H*.16,S*.08,S*.02,-Math.PI*.05,'#a3b88a');
   drawWashiTape(ctx,W*.55,H*.13,S*.08,S*.02,Math.PI*.04,'#d4a574');
   drawWashiTape(ctx,W*.84,H*.18,S*.06,S*.018,-Math.PI*.06,'#c97a5f');
   // Subtle hairline border
   ctx.strokeStyle='rgba(120,100,70,.4)';ctx.lineWidth=Math.max(.8,S*.0012);
   const m=S*.026;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'OUR LITTLE',x:0.5,y:0.043,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#5a6e3e',letterSpacing:'8px'}},
   {kind:'text',text:'Family',x:0.5,y:0.06,align:'center',style:{fontSize:'40px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3a4a26'}},
   {kind:'text',text:'sundays well spent',x:0.5,y:0.89,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#5a6e3e'}},
   {kind:'text',text:'EST. 2026',x:0.5,y:0.94,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#7a8c5c',letterSpacing:'6px'}},
 ]},

// 4-photo travel postcard with stamps and brush strokes
{id:'occ_travel_postcard',name:'Memory Postcard',cat:'travel',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.16,rw:.40,rh:.32,angle:-3},
   {rx:.52,ry:.20,rw:.42,rh:.30,angle:2},
   {rx:.10,ry:.52,rw:.36,rh:.28,angle:2},
   {rx:.50,ry:.55,rw:.44,rh:.30,angle:-2},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged ivory paper
   drawGrainGradient(ctx,W,H,'#f5ecd9','#e8d9b8',180,.07,44);
   drawFilmGrain(ctx,W,H,.07,22);
   drawBokeh(ctx,W,H,18,'#b87a3a',8);
   // Stamp-style starbursts in corners
   drawStarburst8(ctx,W*.08,H*.08,S*.025,'#8b4538');
   drawStarburst8(ctx,W*.92,H*.08,S*.025,'#8b4538');
   drawStarburst8(ctx,W*.08,H*.92,S*.025,'#8b4538');
   drawStarburst8(ctx,W*.92,H*.92,S*.025,'#8b4538');
   // Diagonal brushstrokes for that hand-stamped postcard feel
   drawBrushStroke(ctx,W*.22,H*.14,W*.78,H*.14,S*.012,'#8b4538',.5);
   drawBrushStroke(ctx,W*.22,H*.88,W*.78,H*.88,S*.012,'#8b4538',.5);
   // Center divider — dashed line between photo rows
   ctx.strokeStyle='rgba(139,69,56,.4)';ctx.lineWidth=Math.max(.8,S*.0014);
   ctx.setLineDash([S*.015,S*.008]);
   ctx.beginPath();ctx.moveTo(W*.1,H*.515);ctx.lineTo(W*.9,H*.515);ctx.stroke();ctx.setLineDash([]);
   // Tiny travel sparkles
   drawSparkle(ctx,W*.5,H*.5,S*.018,'#b87a3a');
   // Inner double border
   ctx.strokeStyle='rgba(139,69,56,.7)';ctx.lineWidth=Math.max(1.2,S*.002);
   const m=S*.028;ctx.strokeRect(m,m,W-m*2,H-m*2);
   ctx.strokeStyle='rgba(139,69,56,.35)';ctx.lineWidth=Math.max(.5,S*.0008);
   const m2=S*.038;ctx.strokeRect(m2,m2,W-m2*2,H-m2*2);
 },
 canvasElements:[
   {kind:'text',text:'POSTCARD / MEMORIES',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#8b4538',letterSpacing:'7px'}},
   {kind:'text',text:'Adventures',x:0.5,y:0.885,align:'center',style:{fontSize:'40px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538'}},
   {kind:'text',text:'wherever we go, together',x:0.5,y:0.945,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'#a0654a',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 📱 INSTAGRAM-NATIVE SET (rebuilt 2026-04-28)
// Four templates, each with a SIGNATURE visual element that no other
// template in the library uses. Pulls from current 2026 design trends:
// 1. NAIVE DOODLE     — hand-drawn outlines, smileys, speech bubbles
// 2. BENTO BOX        — compartmental Japanese-style varied rectangles
// 3. TYPE COLLISION   — oversized brutalist serif filling the canvas
// 4. LIQUID BLOB      — organic blob-shaped photo cuts on mesh gradient
// Looks best at 1080x1080 square or 1080x1920 portrait.
// ═══════════════════════════════════════════════════════════════

// 0. MOOD FLOAT — full-canvas background photo with three smaller polaroid-
// framed photos floating on top. The 2026 "carousel cover" IG pattern. The
// first cell at (0,0,1,1) becomes the background; cells 2-4 are the
// floating overlays. Big italic serif "MOOD" headline in the upper-left,
// editable so the user can rename to whatever month / mood they want.
{id:'occ_ig_overlay',name:'Mood Float',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:0,ry:0,rw:1,rh:1,angle:0,shape:'rect'},
   {rx:.07,ry:.42,rw:.26,rh:.34,angle:-4,shape:'rect'},
   {rx:.37,ry:.50,rw:.26,rh:.34,angle:3,shape:'rect'},
   {rx:.67,ry:.42,rw:.26,rh:.34,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Backup background in case the user doesn't upload to cell 1 — moody
   // dark plum gradient that lets the headline stay legible against dark photos.
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#3a2a4a');g.addColorStop(1,'#1f1530');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,55);
 },
 canvasElements:[
   {kind:'text',text:'MOOD',x:0.10,y:0.13,align:'left',style:{fontSize:'72px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#ffffff',textShadow:'0 4px 14px rgba(0,0,0,0.45)'}},
   {kind:'text',text:'· APRIL · 26 ·',x:0.10,y:0.21,align:'left',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#ffffff',letterSpacing:'8px',textShadow:'0 2px 6px rgba(0,0,0,0.5)'}},
   {kind:'text',text:'a feeling, not a story',x:0.10,y:0.92,align:'left',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(255,255,255,.85)',textShadow:'0 2px 6px rgba(0,0,0,0.45)'}},
 ]},

// 1. NAIVE DOODLE — every decoration is hand-drawn in canvas: wavy frame
// outlines around each photo, squiggle line, smiley, hand-drawn arrow,
// speech bubble with "hi!", uneven star, doodle flower. Embraces the
// "naive design / human imperfection" 2026 trend.
{id:'occ_ig_doodle',name:'Naive Doodle',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.086,ry:.099,rw:.36,rh:.30,angle:-3,shape:'rect'},
   {rx:.560,ry:.185,rw:.36,rh:.30,angle:2,shape:'rect'},
   {rx:.083,ry:.494,rw:.36,rh:.30,angle:1,shape:'rect'},
   {rx:.532,ry:.557,rw:.39,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdfaf3','#f5efe1',180,.05,11);
   drawFilmGrain(ctx,W,H,.04,55);
   const ink='rgba(50,30,15,.85)';
   const accent='rgba(220,80,100,.9)';
   const yellow='rgba(255,180,60,.95)';
   ctx.lineCap='round';ctx.lineJoin='round';
   // ── Hand-drawn squiggle running across the top
   ctx.strokeStyle=accent;ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();
   const pts=[[.05,.10],[.18,.06],[.32,.12],[.48,.07],[.62,.13],[.76,.08]];
   pts.forEach(([sx,sy],i)=>{
     if(i===0)ctx.moveTo(sx*W,sy*H);
     else{
       const px=pts[i-1],ax=(px[0]+sx)/2,ay=(px[1]+sy)/2;
       ctx.quadraticCurveTo(ax*W,(i%2?sy-.02:sy+.02)*H,sx*W,sy*H);
     }
   });
   ctx.stroke();
   // ── Smiley face top-right
   const sx0=W*.88,sy0=H*.10,sr=S*.03;
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();ctx.arc(sx0,sy0,sr,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle=ink;
   ctx.beginPath();ctx.arc(sx0-sr*.32,sy0-sr*.18,sr*.10,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(sx0+sr*.32,sy0-sr*.18,sr*.10,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(sx0,sy0+sr*.08,sr*.42,.1,Math.PI-.1);ctx.stroke();
   // ── Hand-drawn arrow with curve, mid-canvas
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();
   ctx.moveTo(W*.46,H*.50);
   ctx.bezierCurveTo(W*.51,H*.46,W*.53,H*.41,W*.50,H*.36);
   ctx.stroke();
   const ah=W*.50,av=H*.36;
   ctx.beginPath();
   ctx.moveTo(ah,av);ctx.lineTo(ah-S*.012,av+S*.012);
   ctx.moveTo(ah,av);ctx.lineTo(ah+S*.014,av+S*.008);
   ctx.stroke();
   // ── Speech bubble bottom-left with "hi!"
   const bx=W*.04,by=H*.42,bw=S*.10,bh=S*.045;
   ctx.strokeStyle=ink;ctx.fillStyle='#fff8e1';
   ctx.beginPath();
   ctx.moveTo(bx+bw*.15,by);
   ctx.quadraticCurveTo(bx,by,bx,by+bh*.45);
   ctx.quadraticCurveTo(bx,by+bh,bx+bw*.18,by+bh);
   ctx.lineTo(bx+bw*.22,by+bh*1.4);
   ctx.lineTo(bx+bw*.32,by+bh);
   ctx.lineTo(bx+bw*.85,by+bh);
   ctx.quadraticCurveTo(bx+bw,by+bh,bx+bw,by+bh*.55);
   ctx.quadraticCurveTo(bx+bw,by,bx+bw*.85,by);
   ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle=ink;
   ctx.font=`italic 700 ${S*.022}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('hi!',bx+bw/2,by+bh*.5);
   // ── Uneven hand-drawn 5-point star, right side
   const stx=W*.94,sty=H*.45,str=S*.027;
   ctx.strokeStyle=yellow;ctx.lineWidth=Math.max(2.5,S*.0035);
   ctx.beginPath();
   for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5-Math.PI/2;
     const wob=1+(((i*7)%3)-1)*.05;
     const px=stx+Math.cos(a)*str*wob,py=sty+Math.sin(a)*str*wob;
     i?ctx.lineTo(px,py):ctx.moveTo(px,py);
     const ia=a+Math.PI/5;
     ctx.lineTo(stx+Math.cos(ia)*str*.42,sty+Math.sin(ia)*str*.42);
   }
   ctx.closePath();ctx.stroke();
   // ── Doodle flower bottom-left (5 petals + center)
   const fx=W*.04,fy=H*.91;
   ctx.fillStyle=accent;
   for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5-Math.PI/2;
     ctx.beginPath();
     ctx.arc(fx+Math.cos(a)*S*.014,fy+Math.sin(a)*S*.014,S*.013,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle=yellow;
   ctx.beginPath();ctx.arc(fx,fy,S*.009,0,Math.PI*2);ctx.fill();
   // ── Wiggly underline beneath the bottom title area
   ctx.strokeStyle=accent;ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();
   for(let i=0;i<=20;i++){
     const t=i/20,wx=W*.30+t*W*.40,wy=H*.92+Math.sin(t*Math.PI*4)*S*.006;
     i?ctx.lineTo(wx,wy):ctx.moveTo(wx,wy);
   }
   ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'PHOTO DIARY',x:0.501,y:0.031,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2618',letterSpacing:'10px'}},
   {kind:'text',text:'made with love',x:0.504,y:0.944,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#c45a2c'}},
 ]},

// 2. BENTO BOX — varied-size rectangles tightly packed in a Japanese-bento
// pattern. No overlap, no rotation — the gap between cells IS the design.
// Soft peach pastel bg shows through, plus a vertical "2026 EDITION"
// label running up the right side and small UI-style corner badges.
{id:'occ_ig_bento',name:'Bento Box',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.05,ry:.20,rw:.42,rh:.35,angle:0,shape:'rect'},
   {rx:.49,ry:.20,rw:.42,rh:.16,angle:0,shape:'rect'},
   {rx:.49,ry:.39,rw:.20,rh:.16,angle:0,shape:'rect'},
   {rx:.71,ry:.39,rw:.20,rh:.16,angle:0,shape:'rect'},
   {rx:.05,ry:.57,rw:.86,rh:.30,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft peach base
   drawGrainGradient(ctx,W,H,'#fff0e2','#f5d9c0',180,.05,7);
   drawFilmGrain(ctx,W,H,.03,17);
   // Subtle inner shadow per cell area to give the bento gap depth
   const ink='rgba(60,30,15,.10)';
   ctx.fillStyle=ink;
   const gap=S*.005;
   [[.05,.20,.42,.35],[.49,.20,.42,.16],[.49,.39,.20,.16],[.71,.39,.20,.16],[.05,.57,.86,.30]].forEach(([cx,cy,cw,ch])=>{
     ctx.fillRect(cx*W-gap,cy*H-gap,cw*W+gap*2,ch*H+gap*2);
   });
   // Coral accent rule top-left where the eyebrow text sits
   ctx.strokeStyle='#e8744d';ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();ctx.moveTo(W*.05,H*.13);ctx.lineTo(W*.20,H*.13);ctx.stroke();
   // Vertical "2026 EDITION" label running up the right margin
   ctx.save();
   ctx.translate(W*.96,H*.55);ctx.rotate(-Math.PI/2);
   ctx.fillStyle='#a04525';ctx.font=`700 ${Math.max(9,S*.013)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('2026  ·  EDITION  ·  Nº 04',0,0);
   ctx.restore();
   // Tiny corner-bracket UI mark inside each cell for that "dashboard" feel
   const mark=(cx,cy)=>{
     ctx.strokeStyle='rgba(60,30,15,.45)';ctx.lineWidth=Math.max(1,S*.0015);
     ctx.beginPath();
     ctx.moveTo(cx,cy+S*.012);ctx.lineTo(cx,cy);ctx.lineTo(cx+S*.012,cy);
     ctx.stroke();
   };
   mark(W*.07,H*.22);mark(W*.51,H*.22);mark(W*.51,H*.41);mark(W*.73,H*.41);mark(W*.07,H*.59);
 },
 canvasElements:[
   {kind:'text',text:'BENTO',x:0.05,y:0.07,align:'left',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#e8744d',letterSpacing:'8px'}},
   {kind:'text',text:'Daily Notes',x:0.05,y:0.135,align:'left',style:{fontSize:'40px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3a2618'}},
   {kind:'text',text:'a compartment for every mood',x:0.5,y:0.92,align:'center',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(80,40,20,.7)',letterSpacing:'2px'}},
 ]},

// 3. TYPE COLLISION — brutalist oversized italic serif "2026" rendered as
// the BACKGROUND ART (filling 80%+ of the canvas), photos overlap and
// break through the type. Yellow color-block stripe + black bg. The
// "design isn't about being clean" 2026 trend in one template.
{id:'occ_ig_type',name:'Type Collision',cat:'instagram',badge:'new',n:3,
 photoFrames:[
   {rx:.05,ry:.16,rw:.32,rh:.40,angle:-3,shape:'rect'},
   {rx:.34,ry:.30,rw:.32,rh:.40,angle:2,shape:'rect'},
   {rx:.63,ry:.20,rw:.32,rh:.40,angle:-1,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Pure black base
   ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.10,77);
   // Massive italic serif "2026" — the brutalist hero. Stretched to fit,
   // outlined so photos can break through and remain legible.
   ctx.save();
   ctx.font=`900 italic ${S*.85}px 'Playfair Display','Fraunces',serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   // Yellow fill
   ctx.fillStyle='#f7d534';
   ctx.fillText('2026',W*.5,H*.5);
   // Black outline for definition
   ctx.lineWidth=Math.max(2,S*.003);
   ctx.strokeStyle='rgba(0,0,0,.4)';
   ctx.strokeText('2026',W*.5,H*.5);
   ctx.restore();
   // Magenta horizontal accent stripe just under the type
   ctx.fillStyle='#ff2e75';
   ctx.fillRect(0,H*.79,W,S*.012);
   // Bottom black rule
   ctx.fillStyle='#0a0a0a';
   ctx.fillRect(0,H*.84,W,S*.005);
   // Vertical "VOL.04" running up the left margin
   ctx.save();
   ctx.translate(W*.025,H*.50);ctx.rotate(-Math.PI/2);
   ctx.fillStyle='#f7d534';ctx.font=`900 ${Math.max(10,S*.014)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('VOL · 04 · ISSUE 04',0,0);
   ctx.restore();
   // Small corner crosshairs (brutalist hallmark)
   ctx.strokeStyle='#f7d534';ctx.lineWidth=Math.max(1.5,S*.0025);
   const cross=(cx,cy)=>{
     ctx.beginPath();ctx.moveTo(cx-S*.012,cy);ctx.lineTo(cx+S*.012,cy);
     ctx.moveTo(cx,cy-S*.012);ctx.lineTo(cx,cy+S*.012);ctx.stroke();
   };
   cross(W*.06,H*.06);cross(W*.94,H*.06);cross(W*.06,H*.94);cross(W*.94,H*.94);
 },
 canvasElements:[
   {kind:'text',text:'COLLAGE / 04',x:0.05,y:0.06,align:'left',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#f7d534',letterSpacing:'6px'}},
   {kind:'text',text:'this is the moment',x:0.5,y:0.91,align:'center',style:{fontSize:'14px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#ffffff',letterSpacing:'4px',textTransform:'uppercase'}},
 ]},

// 4. LIQUID BLOB — 4 photos each cut into an ORGANIC BLOB SHAPE (the new
// 'blob' clip in CARD_SHAPES). Mesh-gradient pastel background, fluid
// squiggle accents, drip shapes. The 2026 organic-shapes / liquid-typography
// trend distilled into a template.
{id:'occ_ig_blob',name:'Liquid Blob',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.04,ry:.18,rw:.40,rh:.34,angle:-4,shape:'blob'},
   {rx:.55,ry:.16,rw:.40,rh:.34,angle:3,shape:'blob'},
   {rx:.04,ry:.55,rw:.42,rh:.34,angle:2,shape:'blob'},
   {rx:.55,ry:.57,rw:.40,rh:.34,angle:-3,shape:'blob'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft pastel mesh — three radial blobs of color overlapping
   ctx.fillStyle='#f6e8ff';ctx.fillRect(0,0,W,H);
   const mesh=(cx,cy,r,col)=>{
     const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
     g.addColorStop(0,col);g.addColorStop(1,'transparent');
     ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   };
   mesh(W*.15,H*.20,W*.55,'#ffd9c2');
   mesh(W*.85,H*.15,W*.50,'#d2f3e8');
   mesh(W*.20,H*.85,W*.55,'#c2dcff');
   mesh(W*.85,H*.85,W*.50,'#fcd2e8');
   drawFilmGrain(ctx,W,H,.04,11);
   // Long curving squiggle line running through the canvas
   ctx.strokeStyle='rgba(80,50,120,.65)';
   ctx.lineWidth=Math.max(2.5,S*.0035);
   ctx.lineCap='round';
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.50);
   ctx.bezierCurveTo(W*.20,H*.40,W*.30,H*.60,W*.50,H*.50);
   ctx.bezierCurveTo(W*.70,H*.40,W*.80,H*.60,W*.98,H*.50);
   ctx.stroke();
   // Small drip shapes (filled blobs)
   const drip=(cx,cy,r,col)=>{
     ctx.fillStyle=col;
     ctx.beginPath();
     ctx.moveTo(cx,cy-r);
     ctx.bezierCurveTo(cx+r*1.2,cy-r,cx+r*1.2,cy+r,cx,cy+r);
     ctx.bezierCurveTo(cx-r*1.2,cy+r,cx-r*1.2,cy-r,cx,cy-r);
     ctx.closePath();ctx.fill();
   };
   drip(W*.50,H*.10,S*.025,'#e91e63');
   drip(W*.06,H*.06,S*.018,'#7c4dff');
   drip(W*.94,H*.94,S*.022,'#26c6da');
   // Tiny floating dots
   ctx.fillStyle='rgba(80,50,120,.4)';
   [[.18,.93],[.82,.07],[.32,.05],[.68,.95],[.08,.42],[.92,.58]].forEach(([px,py])=>{
     ctx.beginPath();ctx.arc(px*W,py*H,S*.006,0,Math.PI*2);ctx.fill();
   });
 },
 canvasElements:[
   {kind:'text',text:'fluid',x:0.5,y:0.085,align:'center',style:{fontSize:'56px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#7c4dff',letterSpacing:'-2px'}},
   {kind:'text',text:'· soft like sunday morning ·',x:0.5,y:0.93,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'rgba(80,50,120,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🎨 ERA SET — four templates from four distinct design eras.
// Each one references a specific recognisable visual tradition so the
// library finally feels broad, not just "scrapbook in different colors".
//   1. TABLOID PRESS — mid-century newsprint (multi-column, halftone)
//   2. BAUHAUS 100   — 1920s modernism (flat geometric primary blocks)
//   3. POP ART       — 1960s comic dots + speech bursts
//   4. MAGAZINE COVER — glossy editorial cover lines + barcode
// ═══════════════════════════════════════════════════════════════

// 1. TABLOID PRESS — looks like a newspaper page. Multi-column hairline
// dividers, halftone dot band, masthead with double rule, weather strip,
// "EDITION No. 04" caps, drop-cap T pull quote, page number bottom-right.
{id:'occ_news_tabloid',name:'Tabloid Press',cat:'family',badge:'new',n:5,
 photoFrames:[
   {rx:.07,ry:.20,rw:.86,rh:.26,angle:0,shape:'rect'},
   {rx:.07,ry:.50,rw:.42,rh:.20,angle:0,shape:'rect'},
   {rx:.51,ry:.50,rw:.42,rh:.20,angle:0,shape:'rect'},
   {rx:.07,ry:.74,rw:.27,rh:.16,angle:0,shape:'rect'},
   {rx:.36,ry:.74,rw:.57,rh:.16,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged newsprint paper with grain
   drawGrainGradient(ctx,W,H,'#f5efde','#e6dec8',180,.07,49);
   drawFilmGrain(ctx,W,H,.08,33);
   // Outer page border
   ctx.strokeStyle='#1a1a1a';ctx.lineWidth=Math.max(1.5,S*.002);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
   // ── Masthead double-rule under "THE DAILY" title (the title itself is
   // an editable canvasElement so the user can rename their paper).
   ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();ctx.moveTo(W*.06,H*.135);ctx.lineTo(W*.94,H*.135);ctx.stroke();
   ctx.lineWidth=Math.max(.6,S*.0008);
   ctx.beginPath();ctx.moveTo(W*.06,H*.145);ctx.lineTo(W*.94,H*.145);ctx.stroke();
   // ── Halftone dot band fading downward — the signature print element
   drawHalftoneDots(ctx,W*.06,H*.16,W*.88,H*.04,30,'rgba(26,26,26,.55)','down');
   // ── Multi-column vertical hairlines (newspaper column gutters)
   ctx.strokeStyle='rgba(26,26,26,.18)';ctx.lineWidth=Math.max(.4,S*.0006);
   for(let c=1;c<5;c++){
     const cx=W*.07+(W*.86)*c/5;
     ctx.beginPath();ctx.moveTo(cx,H*.20);ctx.lineTo(cx,H*.92);ctx.stroke();
   }
   // ── Weather + date strip top
   ctx.fillStyle='#1a1a1a';ctx.font=`700 ${Math.max(8,S*.012)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   ctx.fillText('☀ 72°F  ·  TUE APR 28 2026',W*.06,H*.08);
   ctx.textAlign='right';
   ctx.fillText('EDITION No. 04  ·  $0.50',W*.94,H*.08);
   // ── Pull-quote drop cap T at left margin between photos
   ctx.fillStyle='#1a1a1a';ctx.font=`900 italic ${S*.10}px 'Playfair Display',serif`;
   ctx.textAlign='left';ctx.textBaseline='alphabetic';
   ctx.fillText('"',W*.085,H*.69);
   // ── Page footer with page number
   ctx.font=`700 ${Math.max(8,S*.011)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('continued on page 4  ·  WWW.PI7.ORG',W*.5,H*.95);
 },
 canvasElements:[
   {kind:'text',text:'EST. 1922  ·  TUESDAY EDITION',x:0.5,y:0.045,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(26,26,26,.7)',letterSpacing:'7px'}},
   {kind:'text',text:'THE DAILY',x:0.5,y:0.115,align:'center',style:{fontSize:'52px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'2px'}},
 ]},

// 2. BAUHAUS 100 — flat primary-color geometric blocks (red square, yellow
// triangle, blue circle) overlap with a strict black grid. Mixes a 'circle'
// shaped photo with rect ones for that "shape language" feel.
{id:'occ_bauhaus_geo',name:'Bauhaus 100',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.22,rw:.40,rh:.32,angle:0,shape:'rect'},
   {rx:.54,ry:.201,rw:.34,rh:.34,angle:0,shape:'circle'},
   {rx:.06,ry:.58,rw:.46,rh:.30,angle:0,shape:'rect'},
   {rx:.56,ry:.60,rw:.36,rh:.26,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Off-white base
   ctx.fillStyle='#f4ede0';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.04,11);
   // ── Big BLUE CIRCLE behind the top-right photo
   ctx.fillStyle='#1d4ed8';
   ctx.beginPath();ctx.arc(W*.71,H*.37,S*.30,0,Math.PI*2);ctx.fill();
   // ── Big RED SQUARE bottom-right behind small photo
   ctx.fillStyle='#dc2626';
   ctx.fillRect(W*.55,H*.07,S*.18,S*.18);
   // ── Big YELLOW TRIANGLE bottom-left
   ctx.fillStyle='#fbbf24';
   ctx.beginPath();
   ctx.moveTo(W*.04,H*.92);ctx.lineTo(W*.30,H*.92);ctx.lineTo(W*.04,H*.55);
   ctx.closePath();ctx.fill();
   // ── Bold black Mondrian-style grid lines
   ctx.strokeStyle='#0a0a0a';ctx.lineWidth=Math.max(3,S*.005);
   ctx.beginPath();ctx.moveTo(0,H*.55);ctx.lineTo(W,H*.55);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.5,0);ctx.lineTo(W*.5,H);ctx.stroke();
   ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();ctx.moveTo(W*.85,H*.55);ctx.lineTo(W*.85,H);ctx.stroke();
   // ── Numbered Roman labels (i, ii, iii, iv) inside each shape
   ctx.fillStyle='#0a0a0a';ctx.font=`900 ${Math.max(10,S*.018)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ctx.fillText('i',W*.09,H*.23);
   ctx.fillStyle='#fff';ctx.fillText('ii',W*.55,H*.21);
   ctx.fillStyle='#0a0a0a';ctx.fillText('iii',W*.07,H*.59);
   ctx.fillText('iv',W*.57,H*.61);
 },
 canvasElements:[
   {kind:'text',text:'FORM  ·  COLOR  ·  PHOTO',x:0.276,y:0.07,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#0a0a0a',letterSpacing:'8px'}},
   {kind:'text',text:'BAUHAUS',x:0.243,y:0.10,align:'center',style:{fontSize:'56px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#0a0a0a',letterSpacing:'-1px'}},
   {kind:'text',text:'a hundred years of shape',x:0.134,y:0.951,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(10,10,10,.7)'}},
 ]},

// 3. POP ART — Lichtenstein-inspired comic. Dense halftone dot field on
// bright yellow, magenta speech-burst zigzag with "POW!", thick black
// border per photo (handled via extra paint behind cells), comic-book sans.
{id:'occ_popart_comic',name:'Pop Art',cat:'birthday',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.20,rw:.42,rh:.32,angle:-2,shape:'rect'},
   {rx:.52,ry:.18,rw:.42,rh:.32,angle:2,shape:'rect'},
   {rx:.06,ry:.56,rw:.42,rh:.30,angle:1,shape:'rect'},
   {rx:.52,ry:.58,rw:.42,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Bright yellow base — pop-art primary
   ctx.fillStyle='#ffd60a';ctx.fillRect(0,0,W,H);
   // Dense halftone dot field over the yellow (the Lichtenstein look)
   ctx.fillStyle='rgba(220,30,90,.55)';
   const sp=Math.max(8,S*.014);
   for(let y=0;y<H+sp;y+=sp){
     for(let x=(y/sp)%2?sp/2:0;x<W+sp;x+=sp){
       ctx.beginPath();ctx.arc(x,y,sp*.22,0,Math.PI*2);ctx.fill();
     }
   }
   // Cyan corner halftone inset to break the field
   ctx.save();
   ctx.beginPath();ctx.arc(W*.85,H*.10,S*.18,0,Math.PI*2);ctx.clip();
   ctx.fillStyle='#22d3ee';ctx.fillRect(0,0,W,H);
   ctx.fillStyle='rgba(0,30,90,.6)';
   for(let y=0;y<H+sp;y+=sp){
     for(let x=(y/sp)%2?sp/2:0;x<W+sp;x+=sp){
       ctx.beginPath();ctx.arc(x,y,sp*.22,0,Math.PI*2);ctx.fill();
     }
   }
   ctx.restore();
   // ── Magenta speech-burst zigzag with "POW!" — the Lichtenstein hallmark
   const drawBurst=(cx,cy,r,fill)=>{
     ctx.fillStyle=fill;ctx.beginPath();
     const pts=16,inner=r*.55;
     for(let i=0;i<pts*2;i++){
       const a=i*Math.PI/pts-Math.PI/2;
       const rad=i%2?inner:r;
       const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
       i?ctx.lineTo(x,y):ctx.moveTo(x,y);
     }
     ctx.closePath();ctx.fill();
     ctx.strokeStyle='#0a0a0a';ctx.lineWidth=Math.max(2,S*.0035);ctx.stroke();
   };
   drawBurst(W*.5,H*.50,S*.07,'#ff2e75');
   ctx.fillStyle='#0a0a0a';
   ctx.font=`900 italic ${S*.038}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('POW!',W*.5,H*.50);
   // ── Thick black corner brackets — comic-panel feel
   ctx.strokeStyle='#0a0a0a';ctx.lineWidth=Math.max(4,S*.006);
   const cb=S*.04;
   const corners=[[W*.03,H*.03,1,1],[W*.97,H*.03,-1,1],[W*.03,H*.97,1,-1],[W*.97,H*.97,-1,-1]];
   corners.forEach(([cx,cy,sx,sy])=>{
     ctx.beginPath();
     ctx.moveTo(cx,cy+cb*sy);ctx.lineTo(cx,cy);ctx.lineTo(cx+cb*sx,cy);
     ctx.stroke();
   });
 },
 canvasElements:[
   {kind:'text',text:'COMIC  ·  EDITION 04',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#0a0a0a',letterSpacing:'7px'}},
   {kind:'text',text:'WOW!',x:0.489,y:0.08,align:'center',style:{fontSize:'52px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#ff2e75',letterSpacing:'2px',textShadow:'3px 3px 0 #0a0a0a'}},
   {kind:'text',text:'· what a moment ·',x:0.5,y:0.93,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#0a0a0a',letterSpacing:'4px',textTransform:'uppercase'}},
 ]},

// 4. MAGAZINE COVER — single huge hero photo + 2 smaller bottom shots, with
// glossy editorial chrome: oversized masthead, cover-line list down the
// right, faux barcode + price at bottom, "Nº 04" issue badge.
{id:'occ_mag_cover',name:'Magazine Cover',cat:'instagram',badge:'new',n:3,
 photoFrames:[
   {rx:.08,ry:.20,rw:.833,rh:.49,angle:0,shape:'rect'},
   {rx:.08,ry:.73,rw:.40,rh:.14,angle:0,shape:'rect'},
   {rx:.52,ry:.73,rw:.40,rh:.14,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cool-cream paper
   drawGrainGradient(ctx,W,H,'#f5f0e8','#e8e0d0',180,.05,21);
   drawFilmGrain(ctx,W,H,.04,55);
   // ── Cover-line list down the right margin (small caps, color accents)
   ctx.font=`700 ${Math.max(9,S*.013)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   const lines=[
     ['THE PHOTO ESSAY','#c2185b',.30],
     ['inside our archives','#3a3a3a',.34],
     ['12 ROOMS · 12 STORIES','#3a3a3a',.40],
     ['guide to slow living','#c2185b',.44],
     ['THE EDIT 2026','#3a3a3a',.50],
     ['issue four highlights','#3a3a3a',.54],
   ];
   lines.forEach(([t,col,y])=>{
     ctx.fillStyle=col;
     ctx.fillText(t,W*.65,H*y);
   });
   // ── Top-right "Nº 04" issue badge inside a circle
   ctx.fillStyle='#c2185b';
   ctx.beginPath();ctx.arc(W*.91,H*.12,S*.040,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(11,S*.016)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('Nº 04',W*.91,H*.12);
   // ── Faux barcode bottom-right (vertical lines of varying thickness)
   ctx.fillStyle='#0a0a0a';
   const bxw=S*.011,bxh=S*.05,bxx=W*.78,bxy=H*.94;
   const widths=[1,2,1,3,1,1,2,1,4,1,2,1,3,1,1,2];
   let cx0=bxx;
   widths.forEach(w=>{ctx.fillRect(cx0,bxy,w*bxw*.4,-bxh);cx0+=w*bxw*.4+bxw*.3;});
   ctx.font=`600 ${Math.max(7,S*.010)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ctx.fillText('9 770000 000004',bxx,bxy+S*.005);
   // ── Price tag bottom-left
   ctx.font=`700 ${Math.max(9,S*.013)}px 'Outfit',sans-serif`;
   ctx.fillText('$8.95  ·  £6.50  ·  €7.95',W*.08,H*.96);
   // ── Thin gold rule under the masthead
   ctx.strokeStyle='#c2185b';ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.moveTo(W*.08,H*.18);ctx.lineTo(W*.92,H*.18);ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'MARCH  ·  2026  ·  PHOTO ESSAY',x:0.08,y:0.05,align:'left',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(60,40,30,.75)',letterSpacing:'5px'}},
   {kind:'text',text:'FRAME',x:0.074,y:0.08,align:'left',style:{fontSize:'72px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#0a0a0a',letterSpacing:'-2px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 📱 IG SET v2 — eight more, each from a totally different reference
// (postcard, cassette, photobooth, sticky notes, riso print, music
// player, glitch, clapperboard). Zero overlap with the existing IG /
// scrapbook / occasion templates.
// ═══════════════════════════════════════════════════════════════

// 1. POSTCARD — vintage postcard front. Postage stamp with serrated edge,
// circular postmark with date, ruled address lines on the right, vertical
// divider, "POST CARD" header. 2 photos on the left half.
{id:'occ_ig_postcard',name:'Postcard',cat:'instagram',badge:'new',n:2,
 photoFrames:[
   {rx:.06,ry:.20,rw:.42,rh:.34,angle:0,shape:'rect'},
   {rx:.06,ry:.56,rw:.42,rh:.34,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5ecd9','#e8d9b8',180,.07,29);
   drawFilmGrain(ctx,W,H,.07,17);
   // ── "POST CARD" header with double-rule
   ctx.fillStyle='#3a2618';ctx.font=`900 ${Math.max(12,S*.018)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('POST CARD',W*.5,H*.08);
   ctx.strokeStyle='#3a2618';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.beginPath();ctx.moveTo(W*.05,H*.13);ctx.lineTo(W*.95,H*.13);ctx.stroke();
   ctx.lineWidth=Math.max(.5,S*.0008);
   ctx.beginPath();ctx.moveTo(W*.05,H*.14);ctx.lineTo(W*.95,H*.14);ctx.stroke();
   // ── Vertical divider down the middle
   ctx.lineWidth=Math.max(.8,S*.0012);
   ctx.beginPath();ctx.moveTo(W*.5,H*.18);ctx.lineTo(W*.5,H*.92);ctx.stroke();
   // ── Postage stamp top-right (serrated/perforated edge)
   const sx=W*.78,sy=H*.18,sw=S*.13,sh=S*.16;
   ctx.fillStyle='#fff';ctx.fillRect(sx,sy,sw,sh);
   ctx.strokeStyle='#3a2618';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.strokeRect(sx,sy,sw,sh);
   // serrated dots around stamp edge
   ctx.fillStyle='#f5ecd9';
   const teeth=10;
   for(let i=0;i<teeth;i++){
     ctx.beginPath();ctx.arc(sx+i*sw/(teeth-1),sy,S*.005,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.arc(sx+i*sw/(teeth-1),sy+sh,S*.005,0,Math.PI*2);ctx.fill();
   }
   for(let i=0;i<Math.round(teeth*sh/sw);i++){
     ctx.beginPath();ctx.arc(sx,sy+i*sh/(Math.round(teeth*sh/sw)-1),S*.005,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.arc(sx+sw,sy+i*sh/(Math.round(teeth*sh/sw)-1),S*.005,0,Math.PI*2);ctx.fill();
   }
   // tiny illustration inside stamp
   ctx.strokeStyle='#8b4538';ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();ctx.arc(sx+sw*.5,sy+sh*.45,sh*.18,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='#8b4538';ctx.font=`700 ${Math.max(7,S*.010)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';
   ctx.fillText('PI7',sx+sw*.5,sy+sh*.78);
   // ── Circular postmark overlapping stamp's bottom-left
   const px=sx-sw*.15,py=sy+sh*.6,pr=sh*.42;
   ctx.strokeStyle='rgba(50,30,15,.55)';ctx.lineWidth=Math.max(1.4,S*.0022);
   ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(px,py,pr*.7,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='rgba(50,30,15,.7)';ctx.font=`700 ${Math.max(7,pr*.20)}px 'Outfit',sans-serif`;
   ctx.fillText('PARIS',px,py-pr*.35);
   ctx.fillText('04 · 26',px,py+pr*.35);
   // wavy postmark cancellation lines extending right
   ctx.strokeStyle='rgba(50,30,15,.45)';ctx.lineWidth=Math.max(.8,S*.0014);
   for(let i=0;i<4;i++){
     ctx.beginPath();
     for(let t=0;t<=20;t++){
       const wx=px+pr+t*S*.008,wy=py-pr*.3+i*pr*.2+Math.sin(t*.6)*S*.004;
       t?ctx.lineTo(wx,wy):ctx.moveTo(wx,wy);
     }
     ctx.stroke();
   }
   // ── Ruled address lines on right half
   ctx.strokeStyle='rgba(50,30,15,.30)';ctx.lineWidth=Math.max(.6,S*.001);
   for(let r=0;r<6;r++){
     const ry=H*.50+r*H*.06;
     ctx.beginPath();ctx.moveTo(W*.55,ry);ctx.lineTo(W*.93,ry);ctx.stroke();
   }
 },
 canvasElements:[
   {kind:'text',text:'WISH YOU WERE HERE',x:0.74,y:0.42,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b4538',letterSpacing:'2px'}},
   {kind:'text',text:'· yours always ·',x:0.74,y:0.94,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(80,50,30,.7)',letterSpacing:'5px'}},
 ]},

// 2. CASSETTE MIXTAPE — black cassette tape body filling the canvas, two
// reels (filled circles) with tape lines, paper label centered with the
// photo, "Side A" + tracklist text.
{id:'occ_ig_cassette',name:'Mixtape',cat:'instagram',badge:'new',n:1,
 photoFrames:[
   {rx:.18,ry:.239,rw:.64,rh:.18,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Off-cream studio backdrop
   drawGrainGradient(ctx,W,H,'#fdfaf3','#ede5d2',180,.05,11);
   drawFilmGrain(ctx,W,H,.05,33);
   // ── Cassette body (rounded rect with bevel highlight)
   const bx=W*.06,by=H*.16,bw=W*.88,bh=H*.65,br=S*.025;
   ctx.fillStyle='#1a1a1a';
   ctx.beginPath();
   ctx.moveTo(bx+br,by);ctx.lineTo(bx+bw-br,by);ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+br);
   ctx.lineTo(bx+bw,by+bh-br);ctx.quadraticCurveTo(bx+bw,by+bh,bx+bw-br,by+bh);
   ctx.lineTo(bx+br,by+bh);ctx.quadraticCurveTo(bx,by+bh,bx,by+bh-br);
   ctx.lineTo(bx,by+br);ctx.quadraticCurveTo(bx,by,bx+br,by);
   ctx.closePath();ctx.fill();
   // top highlight strip
   ctx.fillStyle='rgba(255,255,255,.07)';
   ctx.fillRect(bx+br,by+S*.005,bw-br*2,S*.008);
   // ── Paper label area (where the photo will sit)
   ctx.fillStyle='#fff8e1';
   ctx.fillRect(W*.16,H*.20,W*.68,H*.24);
   ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=Math.max(.8,S*.0012);
   ctx.strokeRect(W*.16,H*.20,W*.68,H*.24);
   // "Side A" stamp on the label
   ctx.fillStyle='#dc2626';ctx.font=`900 ${Math.max(9,S*.014)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   ctx.fillText('SIDE A  ·  60 MIN',W*.18,H*.225);
   // ── Two reels (circles) with tape lines between them
   const ry=H*.55,rad=S*.072;
   [W*.30,W*.70].forEach(rx=>{
     // outer black ring
     ctx.fillStyle='#0a0a0a';ctx.beginPath();ctx.arc(rx,ry,rad,0,Math.PI*2);ctx.fill();
     // inner darker hub
     ctx.fillStyle='#2a2a2a';ctx.beginPath();ctx.arc(rx,ry,rad*.55,0,Math.PI*2);ctx.fill();
     // 6 spoke teeth
     ctx.strokeStyle='#5a5a5a';ctx.lineWidth=Math.max(2,S*.0028);
     for(let i=0;i<6;i++){
       const a=i*Math.PI/3;
       ctx.beginPath();
       ctx.moveTo(rx+Math.cos(a)*rad*.25,ry+Math.sin(a)*rad*.25);
       ctx.lineTo(rx+Math.cos(a)*rad*.50,ry+Math.sin(a)*rad*.50);
       ctx.stroke();
     }
   });
   // tape strip between reels
   ctx.fillStyle='#3a2a1a';ctx.fillRect(W*.30,ry-S*.010,W*.40,S*.020);
   // ── Tracklist below reels
   ctx.fillStyle='#fff';ctx.font=`600 ${Math.max(8,S*.012)}px 'Outfit',monospace`;
   ctx.textAlign='left';ctx.textBaseline='top';
   const tracks=['01 · the morning  3:42','02 · sunday slow  4:15','03 · together now  3:28','04 · home again  4:02'];
   tracks.forEach((t,i)=>ctx.fillText(t,W*.10,H*.68+i*S*.018));
   // Right-side track ratings
   ctx.textAlign='right';
   ['★★★★★','★★★★','★★★★★','★★★★'].forEach((s,i)=>ctx.fillText(s,W*.90,H*.68+i*S*.018));
 },
 canvasElements:[
   {kind:'text',text:'MIXTAPE  ·  Nº 04',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2618',letterSpacing:'8px'}},
   {kind:'text',text:'songs for you',x:0.502,y:0.086,align:'center',style:{fontSize:'34px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#1a1a1a'}},
 ]},

// 3. PHOTOBOOTH STRIP — black bg, vertical white photobooth strip with 4
// stacked photos, sprocket holes on each side of the strip, timestamp.
{id:'occ_ig_photobooth',name:'Photobooth',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.36,ry:.13,rw:.28,rh:.18,angle:0,shape:'rect'},
   {rx:.36,ry:.32,rw:.28,rh:.18,angle:0,shape:'rect'},
   {rx:.36,ry:.51,rw:.28,rh:.18,angle:0,shape:'rect'},
   {rx:.36,ry:.70,rw:.28,rh:.18,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Pure black background
   ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,77);
   // ── White vertical photobooth strip
   ctx.fillStyle='#fdfaf3';
   ctx.fillRect(W*.32,H*.06,W*.36,H*.88);
   // ── Sprocket holes down both sides of the strip
   ctx.fillStyle='#0a0a0a';
   const holes=18,hr=S*.008;
   for(let i=0;i<holes;i++){
     const hy=H*.08+i*H*.84/(holes-1);
     ctx.beginPath();ctx.arc(W*.335,hy,hr,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.arc(W*.665,hy,hr,0,Math.PI*2);ctx.fill();
   }
   // ── Timestamp at bottom of strip
   ctx.fillStyle='#dc2626';ctx.font=`900 ${Math.max(8,S*.012)}px 'Courier New',monospace`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('04 · 28 · 2026',W*.5,H*.91);
   ctx.fillStyle='rgba(60,40,30,.6)';
   ctx.fillText('PHOTOBOOTH Nº 04',W*.5,H*.94);
   // ── Ambient pink glow around strip (the booth's lighting)
   const glow=ctx.createRadialGradient(W*.5,H*.5,W*.2,W*.5,H*.5,W*.5);
   glow.addColorStop(0,'transparent');glow.addColorStop(1,'rgba(255,40,120,.10)');
   ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 },
 canvasElements:[
   {kind:'text',text:'us  ·  04 · 26',x:0.84,y:0.50,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#fff',letterSpacing:'4px'}},
   {kind:'text',text:'INSERT COIN',x:0.16,y:0.50,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'rgba(255,255,255,.65)',letterSpacing:'6px'}},
 ]},

// 4. STICKY NOTES — corkboard texture with multi-color sticky notes pinned
// at varied angles, push-pin in each note's center, hand-written feel.
{id:'occ_ig_stickynotes',name:'Sticky Notes',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.054,ry:.211,rw:.30,rh:.30,angle:-4,shape:'rect'},
   {rx:.394,ry:.171,rw:.26,rh:.26,angle:3,shape:'rect'},
   {rx:.694,ry:.211,rw:.26,rh:.26,angle:-3,shape:'rect'},
   {rx:.094,ry:.581,rw:.28,rh:.28,angle:4,shape:'rect'},
   {rx:.414,ry:.531,rw:.30,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cork board base — warm tan with random fiber dots
   ctx.fillStyle='#c89a6c';ctx.fillRect(0,0,W,H);
   // cork fiber speckles
   for(let i=0;i<700;i++){
     const r=Math.random();
     ctx.fillStyle=r<.5?'rgba(80,50,20,.35)':r<.8?'rgba(180,130,80,.4)':'rgba(220,180,130,.3)';
     ctx.fillRect(Math.random()*W,Math.random()*H,2,2);
   }
   drawFilmGrain(ctx,W,H,.08,99);
   // ── Yellow sticky note bottom-right with text (no photo)
   const stickyNote=(cx,cy,sw,sh,col,ang,text)=>{
     ctx.save();
     ctx.translate(cx+sw/2,cy+sh/2);ctx.rotate(ang*Math.PI/180);
     // shadow
     ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-sw/2+S*.004,-sh/2+S*.006,sw,sh);
     // note
     ctx.fillStyle=col;ctx.fillRect(-sw/2,-sh/2,sw,sh);
     // bottom shadow gradient (sticky-note curl)
     const cg=ctx.createLinearGradient(0,sh/2-S*.025,0,sh/2);
     cg.addColorStop(0,'transparent');cg.addColorStop(1,'rgba(0,0,0,.18)');
     ctx.fillStyle=cg;ctx.fillRect(-sw/2,sh/2-S*.025,sw,S*.025);
     // hand-written text
     ctx.fillStyle='rgba(50,30,15,.85)';
     ctx.font=`italic 700 ${Math.max(11,sh*.20)}px 'Caveat','Brush Script MT',cursive`;
     ctx.textAlign='center';ctx.textBaseline='middle';
     ctx.fillText(text,0,0);
     // push-pin top-center
     ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(0,-sh/2+S*.015,S*.012,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(-S*.004,-sh/2+S*.011,S*.005,0,Math.PI*2);ctx.fill();
     ctx.restore();
   };
   stickyNote(W*.74,H*.55,S*.20,S*.20,'#fff59d',-5,'love this!');
   stickyNote(W*.04,H*.05,S*.15,S*.10,'#a5d6a7',4,'04/26');
   stickyNote(W*.80,H*.04,S*.18,S*.10,'#f8bbd0',-3,'so good ♡');
   // ── Push-pins on each photo cell (drawn on top so they sit on the photos)
   const pin=(cx,cy)=>{
     ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(cx+S*.003,cy+S*.004,S*.012,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='#1d4ed8';ctx.beginPath();ctx.arc(cx,cy,S*.012,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(cx-S*.004,cy-S*.004,S*.005,0,Math.PI*2);ctx.fill();
   };
   pin(W*.21,H*.20);pin(W*.53,H*.16);pin(W*.83,H*.20);pin(W*.24,H*.57);pin(W*.57,H*.52);
 },
 canvasElements:[
   {kind:'text',text:'KEEP NOTES',x:0.5,y:0.035,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#5a3a1a',letterSpacing:'8px'}},
   {kind:'text',text:'pinboard',x:0.501,y:0.054,align:'center',style:{fontSize:'34px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3a2618'}},
   {kind:'text',text:'· bits worth keeping ·',x:0.494,y:0.956,align:'center',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'rgba(50,30,15,.7)',letterSpacing:'2px'}},
 ]},

// 5. RISOGRAPH — limited 2-color screenprint look. Off-white paper, photos
// + decorations rendered in fluo pink + cobalt blue, slight "registration
// offset" achieved with magenta blocks shifted from cyan blocks. Halftone
// dot field underlay.
{id:'occ_ig_riso',name:'Riso Print',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.07,ry:.22,rw:.40,rh:.28,angle:0,shape:'rect'},
   {rx:.53,ry:.20,rw:.40,rh:.28,angle:0,shape:'rect'},
   {rx:.07,ry:.55,rw:.40,rh:.28,angle:0,shape:'rect'},
   {rx:.53,ry:.57,rw:.40,rh:.28,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Off-white paper with strong grain
   ctx.fillStyle='#f5f0e0';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.10,55);
   // ── Pink + cyan offset blocks (the riso registration look)
   const block=(x,y,w,h,col,off)=>{
     ctx.fillStyle=col;
     ctx.fillRect(x+off,y+off,w,h);
   };
   // Big pink rectangle behind first photo, cyan offset
   ctx.globalAlpha=.65;
   block(W*.05,H*.20,W*.44,H*.32,'#ff2e75',0);
   block(W*.05,H*.20,W*.44,H*.32,'#2196f3',S*.008);
   ctx.globalAlpha=1;
   // ── Halftone dot field at top
   ctx.fillStyle='rgba(255,46,117,.40)';
   const sp=Math.max(8,S*.012);
   for(let y=0;y<H*.16;y+=sp){
     for(let x=(y/sp)%2?sp/2:0;x<W;x+=sp){
       const f=1-y/(H*.16);
       ctx.beginPath();ctx.arc(x,y,sp*.20*f,0,Math.PI*2);ctx.fill();
     }
   }
   // ── Cyan halftone bottom band
   ctx.fillStyle='rgba(33,150,243,.45)';
   for(let y=H*.86;y<H;y+=sp){
     for(let x=(y/sp)%2?sp/2:0;x<W;x+=sp){
       const f=(y-H*.86)/(H-H*.86);
       ctx.beginPath();ctx.arc(x,y,sp*.20*f,0,Math.PI*2);ctx.fill();
     }
   }
   // ── Bold pink shape: a hand at top-right (drawn with simple ovals)
   ctx.fillStyle='#ff2e75';
   ctx.save();ctx.translate(W*.85,H*.10);ctx.rotate(.3);
   for(let i=0;i<4;i++){
     ctx.fillRect(-S*.005+i*S*.012-S*.018,-S*.02,S*.008,S*.04);
   }
   ctx.fillRect(-S*.025,0,S*.05,S*.02);
   ctx.restore();
   // ── Asterisk burst (pink) bottom-left
   ctx.strokeStyle='#ff2e75';ctx.lineWidth=Math.max(2.5,S*.004);
   ctx.lineCap='round';
   const ax=W*.10,ay=H*.93,as=S*.025;
   for(let i=0;i<8;i++){
     const a=i*Math.PI/4;
     ctx.beginPath();
     ctx.moveTo(ax+Math.cos(a)*as*.3,ay+Math.sin(a)*as*.3);
     ctx.lineTo(ax+Math.cos(a)*as,ay+Math.sin(a)*as);
     ctx.stroke();
   }
   // (The "PRINTED Nº 04 · APR 2026" footer used to be baked here via
   // ctx.fillText; it now lives as an editable canvasElement below so the
   // user can change the issue number / month.)
 },
 canvasElements:[
   {kind:'text',text:'RISOGRAPH  ·  TWO COLOR',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#ff2e75',letterSpacing:'8px'}},
   {kind:'text',text:'SOFT HANDS',x:0.502,y:0.089,align:'center',style:{fontSize:'46px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#1a1a1a',letterSpacing:'1px'}},
   {kind:'text',text:'PRINTED Nº 04  ·  APR 2026',x:0.93,y:0.93,align:'right',style:{fontSize:'9px',fontFamily:"'Courier New',monospace",fontWeight:'700',color:'#1a1a1a',letterSpacing:'1px'}},
 ]},

// 6. NOW PLAYING — music player UI card. Album-art photo cell, progress
// bar with filled portion + handle dot, audio waveform vertical bars, and
// drawn play/skip icons.
{id:'occ_ig_player',name:'Now Playing',cat:'instagram',badge:'new',n:1,
 photoFrames:[
   {rx:.20,ry:.20,rw:.60,rh:.42,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft purple gradient bg
   const g=ctx.createLinearGradient(0,0,0,H);
   g.addColorStop(0,'#1a0a3a');g.addColorStop(.5,'#2d1b6e');g.addColorStop(1,'#0a0420');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.05,33);
   // Bokeh glow behind album art
   const bg=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.4);
   bg.addColorStop(0,'rgba(180,100,255,.35)');bg.addColorStop(1,'transparent');
   ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   // ── White rounded player card around the bottom controls
   ctx.fillStyle='rgba(255,255,255,.10)';
   const cx=W*.10,cy=H*.66,cw=W*.80,ch=H*.26,cr=S*.024;
   ctx.beginPath();
   ctx.moveTo(cx+cr,cy);ctx.lineTo(cx+cw-cr,cy);ctx.quadraticCurveTo(cx+cw,cy,cx+cw,cy+cr);
   ctx.lineTo(cx+cw,cy+ch-cr);ctx.quadraticCurveTo(cx+cw,cy+ch,cx+cw-cr,cy+ch);
   ctx.lineTo(cx+cr,cy+ch);ctx.quadraticCurveTo(cx,cy+ch,cx,cy+ch-cr);
   ctx.lineTo(cx,cy+cr);ctx.quadraticCurveTo(cx,cy,cx+cr,cy);
   ctx.closePath();ctx.fill();
   // ── Audio waveform (vertical bars)
   ctx.fillStyle='rgba(255,255,255,.35)';
   const heights=[.3,.5,.7,.4,.8,.6,.9,.5,.7,.4,.6,.3,.7,.5,.8,.6,.4,.7,.3,.6,.5,.8,.4,.6,.3,.5];
   const barX=W*.16,barY=H*.69,barW=W*.68/heights.length,barH=H*.04;
   heights.forEach((h,i)=>{
     ctx.fillRect(barX+i*barW,barY+barH-barH*h,barW*.6,barH*h);
   });
   // ── Progress bar
   const px=W*.16,py=H*.79,pw=W*.68;
   ctx.fillStyle='rgba(255,255,255,.20)';ctx.fillRect(px,py,pw,S*.005);
   ctx.fillStyle='#fff';ctx.fillRect(px,py,pw*.42,S*.005);
   // handle dot
   ctx.beginPath();ctx.arc(px+pw*.42,py+S*.0025,S*.012,0,Math.PI*2);ctx.fill();
   // time stamps
   ctx.font=`600 ${Math.max(8,S*.011)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   ctx.fillStyle='rgba(255,255,255,.7)';
   ctx.fillText('1:24',px,py+S*.01);
   ctx.textAlign='right';ctx.fillText('3:42',px+pw,py+S*.01);
   // ── Player controls (skip back / play / skip fwd)
   const ctrlY=H*.88,ctrlMid=W*.5;
   ctx.fillStyle='#fff';
   // skip back triangle pair
   ctx.beginPath();ctx.moveTo(ctrlMid-W*.10,ctrlY);ctx.lineTo(ctrlMid-W*.07,ctrlY-S*.014);ctx.lineTo(ctrlMid-W*.07,ctrlY+S*.014);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(ctrlMid-W*.07,ctrlY);ctx.lineTo(ctrlMid-W*.04,ctrlY-S*.014);ctx.lineTo(ctrlMid-W*.04,ctrlY+S*.014);ctx.closePath();ctx.fill();
   // play button circle + triangle
   ctx.beginPath();ctx.arc(ctrlMid,ctrlY,S*.022,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#1a0a3a';
   ctx.beginPath();ctx.moveTo(ctrlMid-S*.007,ctrlY-S*.011);ctx.lineTo(ctrlMid+S*.012,ctrlY);ctx.lineTo(ctrlMid-S*.007,ctrlY+S*.011);ctx.closePath();ctx.fill();
   // skip fwd
   ctx.fillStyle='#fff';
   ctx.beginPath();ctx.moveTo(ctrlMid+W*.04,ctrlY-S*.014);ctx.lineTo(ctrlMid+W*.07,ctrlY);ctx.lineTo(ctrlMid+W*.04,ctrlY+S*.014);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(ctrlMid+W*.07,ctrlY-S*.014);ctx.lineTo(ctrlMid+W*.10,ctrlY);ctx.lineTo(ctrlMid+W*.07,ctrlY+S*.014);ctx.closePath();ctx.fill();
 },
 canvasElements:[
   {kind:'text',text:'NOW PLAYING',x:0.5,y:0.06,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(255,255,255,.6)',letterSpacing:'8px'}},
   {kind:'text',text:'on repeat',x:0.499,y:0.09,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#fff'}},
 ]},

// 7. GLITCH — dark bg with horizontal scan lines, RGB-shift color blocks
// behind photos (cyan + magenta offset stripes), pixelated "ERROR_404"
// caption, faux dial-error overlay.
{id:'occ_ig_glitch',name:'Glitch',cat:'instagram',badge:'new',n:3,
 photoFrames:[
   {rx:.08,ry:.20,rw:.40,rh:.34,angle:0,shape:'rect'},
   {rx:.52,ry:.22,rw:.40,rh:.34,angle:0,shape:'rect'},
   {rx:.30,ry:.58,rw:.40,rh:.30,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,W,H);
   // ── RGB offset color blocks behind cell positions
   const offsetBlock=(x,y,w,h)=>{
     ctx.globalAlpha=.55;
     ctx.fillStyle='#ff00ff';ctx.fillRect(x-S*.012,y-S*.005,w,h);
     ctx.fillStyle='#00ffff';ctx.fillRect(x+S*.012,y+S*.005,w,h);
     ctx.globalAlpha=1;
   };
   offsetBlock(W*.08,H*.20,W*.40,H*.34);
   offsetBlock(W*.52,H*.22,W*.40,H*.34);
   offsetBlock(W*.30,H*.58,W*.40,H*.30);
   // ── Horizontal scan lines across the whole canvas
   ctx.fillStyle='rgba(255,255,255,.04)';
   for(let y=0;y<H;y+=4){ctx.fillRect(0,y,W,1);}
   // Heavier glitch bands
   ctx.fillStyle='rgba(255,40,160,.30)';
   ctx.fillRect(0,H*.40,W,S*.008);
   ctx.fillStyle='rgba(40,200,255,.30)';
   ctx.fillRect(0,H*.55,W,S*.005);
   // ── Pixel noise dots
   ctx.fillStyle='rgba(255,255,255,.20)';
   for(let i=0;i<200;i++){
     ctx.fillRect(Math.random()*W,Math.random()*H,2,2);
   }
   // ── Pixel-block "ERROR" stamp top-right (drawn as a 5×3 dot grid)
   const dotW=S*.006;const e='ERROR';
   const fontMap={ 'E':[1,1,1,1,0,0,1,1,1,1,0,0,1,1,1],
                   'R':[1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
                   'O':[1,1,1,1,0,1,1,0,1,1,0,1,1,1,1] };
   // Skip detailed pixel render — instead use simple monospace ERROR text
   ctx.fillStyle='#ff2e75';ctx.font=`900 ${Math.max(11,S*.018)}px 'Courier New',monospace`;
   ctx.textAlign='right';ctx.textBaseline='top';
   ctx.fillText('▌ ERROR_404',W*.94,H*.06);
   ctx.fillStyle='#22d3ee';ctx.fillText('SIGNAL_LOST',W*.94,H*.10);
   // ── Bottom corner crosshair
   ctx.strokeStyle='#ff2e75';ctx.lineWidth=Math.max(1,S*.0018);
   ctx.beginPath();
   ctx.moveTo(W*.06,H*.93);ctx.lineTo(W*.06,H*.97);
   ctx.moveTo(W*.04,H*.95);ctx.lineTo(W*.08,H*.95);
   ctx.stroke();
   ctx.fillStyle='rgba(34,211,238,.85)';ctx.font=`700 ${Math.max(8,S*.011)}px 'Courier New',monospace`;
   ctx.textAlign='left';
   ctx.fillText('// 0x4F4E20 · uplink stable',W*.10,H*.94);
 },
 canvasElements:[
   {kind:'text',text:'_GLITCHED',x:0.5,y:0.07,align:'center',style:{fontSize:'40px',fontFamily:"'Courier New',monospace",fontWeight:'900',color:'#ffffff',letterSpacing:'4px',textShadow:'-2px 0 #ff2e75, 2px 0 #22d3ee'}},
   {kind:'text',text:'· feed unstable ·',x:0.5,y:0.135,align:'center',style:{fontSize:'10px',fontFamily:"'Courier New',monospace",fontWeight:'700',color:'rgba(34,211,238,.8)',letterSpacing:'6px'}},
 ]},

// 8. CINEMA SLATE — clapperboard with diagonal black/white stripes on top,
// production info fields below, scene/take numbers, and a photo area below
// like a film frame.
{id:'occ_ig_slate',name:'Cinema Slate',cat:'instagram',badge:'new',n:2,
 photoFrames:[
   {rx:.08,ry:.40,rw:.84,rh:.34,angle:0,shape:'rect'},
   {rx:.30,ry:.78,rw:.40,rh:.10,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.05,33);
   // ── Slate top section (the clapperboard arm with diagonal stripes)
   const sx=W*.06,sy=H*.10,sw=W*.88,sh=H*.07;
   ctx.fillStyle='#fff';ctx.fillRect(sx,sy,sw,sh);
   // diagonal stripes
   ctx.fillStyle='#1a1a1a';
   const stripes=12;
   for(let i=0;i<stripes;i++){
     ctx.beginPath();
     const x1=sx+i*sw/stripes,x2=sx+(i+.5)*sw/stripes;
     ctx.moveTo(x1,sy);ctx.lineTo(x2,sy);ctx.lineTo(x1+sw/stripes,sy+sh);ctx.lineTo(x1+sw/stripes-sw/stripes/2,sy+sh);
     ctx.closePath();ctx.fill();
   }
   // ── Info fields panel below the stripe top
   ctx.fillStyle='#000';ctx.fillRect(W*.06,H*.18,W*.88,H*.20);
   ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.strokeRect(W*.06,H*.18,W*.88,H*.20);
   // field divider lines (3 columns × 2 rows)
   for(let c=1;c<3;c++){
     ctx.beginPath();ctx.moveTo(W*.06+W*.88*c/3,H*.18);ctx.lineTo(W*.06+W*.88*c/3,H*.38);ctx.stroke();
   }
   ctx.beginPath();ctx.moveTo(W*.06,H*.28);ctx.lineTo(W*.94,H*.28);ctx.stroke();
   // field labels
   ctx.fillStyle='rgba(255,255,255,.5)';ctx.font=`700 ${Math.max(8,S*.011)}px 'Outfit',sans-serif`;
   ctx.textAlign='left';ctx.textBaseline='top';
   const labels=[['PRODUCTION',W*.08,H*.19],['ROLL',W*.395,H*.19],['SCENE',W*.71,H*.19],['DIRECTOR',W*.08,H*.29],['DATE',W*.395,H*.29],['TAKE',W*.71,H*.29]];
   labels.forEach(([t,lx,ly])=>ctx.fillText(t,lx,ly));
   // field values
   ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(13,S*.022)}px 'Courier New',monospace`;
   const vals=[['PI7 STUDIO',W*.08,H*.225],['04',W*.395,H*.225],['12',W*.71,H*.225],['_______',W*.08,H*.325],['04·28·26',W*.395,H*.325],['04',W*.71,H*.325]];
   vals.forEach(([t,vx,vy])=>ctx.fillText(t,vx,vy));
   // ── Yellow accent stripe at the very top
   ctx.fillStyle='#fbbf24';ctx.fillRect(0,0,W,S*.012);
   // ── "ROLL CAMERA" text at bottom
   ctx.fillStyle='rgba(251,191,36,.8)';ctx.font=`900 ${Math.max(10,S*.014)}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('▶ ROLL  ·  ROLL  ·  CAMERA  ·  ACTION',W*.5,H*.92);
 },
 canvasElements:[
   {kind:'text',text:'CINEMA  ·  PI7 STUDIO',x:0.5,y:0.045,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'900',color:'#fbbf24',letterSpacing:'8px'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🖍️ NAIVE-DOODLE FAMILY — three sister templates to the original
// "Naive Doodle" the user liked. Same hand-drawn paper aesthetic,
// completely DIFFERENT doodle vocabularies (sun/sky, moon/night,
// botanical/garden) and palettes per template.
// ═══════════════════════════════════════════════════════════════

// 1. SUN DAY — solar / sky doodle vocabulary on cream paper.
// Unique elements: hand-drawn sun with rays, rainbow arc, two cloud puffs,
// hand-drawn tulip, sparkle asterisks, wavy horizon line.
{id:'occ_ig_doodle_sun',name:'Sun Day',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.20,rw:.42,rh:.30,angle:-3,shape:'rect'},
   {rx:.521,ry:.17,rw:.42,rh:.30,angle:2,shape:'rect'},
   {rx:.04,ry:.55,rw:.30,rh:.30,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.30,rh:.30,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.30,rh:.30,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fff8e1','#ffe8b8',180,.05,13);
   drawFilmGrain(ctx,W,H,.04,77);
   const ink='rgba(60,40,15,.85)';
   const sunC='#f97316';
   const rb=['#ef4444','#f97316','#fbbf24','#22c55e','#3b82f6','#a855f7'];
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=Math.max(2,S*.003);
   // ── Hand-drawn sun with rays (top-right corner)
   const cx=W*.92,cy=H*.10,sr=S*.025;
   ctx.fillStyle=sunC;ctx.beginPath();ctx.arc(cx,cy,sr,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=ink;
   ctx.beginPath();ctx.arc(cx,cy,sr,0,Math.PI*2);ctx.stroke();
   // 8 rays radiating outward
   for(let i=0;i<8;i++){
     const a=i*Math.PI/4;
     ctx.beginPath();
     ctx.moveTo(cx+Math.cos(a)*sr*1.4,cy+Math.sin(a)*sr*1.4);
     ctx.lineTo(cx+Math.cos(a)*sr*2.0,cy+Math.sin(a)*sr*2.0);
     ctx.stroke();
   }
   // ── Rainbow arc (left side, mid)
   const rx=W*.04,ry=H*.50,rr=S*.07;
   ctx.lineWidth=Math.max(2,S*.003);
   rb.forEach((c,i)=>{
     ctx.strokeStyle=c;
     ctx.beginPath();ctx.arc(rx,ry,rr+i*S*.005,-Math.PI*.55,0);ctx.stroke();
   });
   // ── Two hand-drawn cloud puffs (top-left + middle-right)
   const cloud=(x,y,scale)=>{
     ctx.strokeStyle=ink;ctx.fillStyle='#fff';ctx.lineWidth=Math.max(2,S*.0025);
     ctx.beginPath();
     ctx.arc(x,y,scale*.45,Math.PI,Math.PI*1.85);
     ctx.arc(x+scale*.5,y-scale*.15,scale*.35,Math.PI*.95,Math.PI*1.7);
     ctx.arc(x+scale*.95,y,scale*.45,Math.PI*1.15,Math.PI*1.95);
     ctx.lineTo(x+scale*1.4,y+scale*.05);
     ctx.lineTo(x-scale*.45,y+scale*.05);
     ctx.closePath();ctx.fill();ctx.stroke();
   };
   cloud(W*.25,H*.07,S*.045);
   cloud(W*.70,H*.50,S*.035);
   // ── Hand-drawn tulip (bottom-left edge)
   const tx=W*.03,ty=H*.92;
   // stem
   ctx.strokeStyle='#22c55e';ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+S*.005,ty-S*.025,tx-S*.002,ty-S*.045);ctx.stroke();
   // leaf
   ctx.beginPath();
   ctx.moveTo(tx+S*.003,ty-S*.018);ctx.quadraticCurveTo(tx+S*.018,ty-S*.025,tx+S*.022,ty-S*.013);
   ctx.quadraticCurveTo(tx+S*.012,ty-S*.014,tx+S*.003,ty-S*.018);
   ctx.fillStyle='rgba(34,197,94,.6)';ctx.fill();ctx.stroke();
   // tulip petals (3 cup curves)
   ctx.fillStyle='#ec407a';ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.moveTo(tx-S*.012,ty-S*.045);
   ctx.quadraticCurveTo(tx-S*.014,ty-S*.058,tx-S*.005,ty-S*.062);
   ctx.quadraticCurveTo(tx,ty-S*.067,tx+S*.005,ty-S*.062);
   ctx.quadraticCurveTo(tx+S*.014,ty-S*.058,tx+S*.012,ty-S*.045);
   ctx.quadraticCurveTo(tx,ty-S*.040,tx-S*.012,ty-S*.045);
   ctx.fill();ctx.stroke();
   // tulip notches
   ctx.beginPath();
   ctx.moveTo(tx-S*.005,ty-S*.062);ctx.lineTo(tx-S*.003,ty-S*.052);
   ctx.moveTo(tx+S*.005,ty-S*.062);ctx.lineTo(tx+S*.003,ty-S*.052);
   ctx.stroke();
   // ── Sparkle asterisks scattered (3 of them)
   const aster=(x,y,size,col)=>{
     ctx.strokeStyle=col;ctx.lineWidth=Math.max(2,S*.003);
     for(let i=0;i<6;i++){
       const a=i*Math.PI/3;
       ctx.beginPath();
       ctx.moveTo(x+Math.cos(a)*size*.3,y+Math.sin(a)*size*.3);
       ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
       ctx.stroke();
     }
   };
   aster(W*.50,H*.06,S*.018,sunC);
   aster(W*.97,H*.50,S*.014,'#ec407a');
   aster(W*.50,H*.93,S*.016,sunC);
   // ── Wavy horizon line below the photos
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();
   for(let i=0;i<=24;i++){
     const t=i/24,wx=W*.18+t*W*.64,wy=H*.92+Math.sin(t*Math.PI*5)*S*.005;
     i?ctx.lineTo(wx,wy):ctx.moveTo(wx,wy);
   }
   ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'GOOD MORNING',x:0.499,y:0.094,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2618',letterSpacing:'10px'}},
   {kind:'text',text:'sunny days',x:0.5,y:0.95,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#f97316'}},
 ]},

// 2. SWEET DREAMS — moon / night doodle vocabulary on lavender paper.
// Unique elements: crescent moon with face, four hand-drawn stars at varied
// sizes, "zZz" text, twinkle sparkles, dotted constellation line.
{id:'occ_ig_doodle_moon',name:'Sweet Dreams',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.18,rw:.36,rh:.30,angle:-3,shape:'rect'},
   {rx:.544,ry:.172,rw:.36,rh:.30,angle:2,shape:'rect'},
   {rx:.098,ry:.554,rw:.36,rh:.30,angle:1,shape:'rect'},
   {rx:.55,ry:.55,rw:.39,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f3edff','#e0d4f7',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,55);
   const ink='rgba(60,40,90,.85)';
   const lavender='#7c4dff';
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=Math.max(2,S*.0028);
   // ── Crescent moon with sleepy face (top-right)
   const mx=W*.92,my=H*.08,mr=S*.04;
   ctx.fillStyle='#fef3c7';
   ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();
   // bite out of right side to make crescent
   ctx.globalCompositeOperation='destination-out';
   ctx.beginPath();ctx.arc(mx+mr*.45,my-mr*.1,mr*.85,0,Math.PI*2);ctx.fill();
   ctx.globalCompositeOperation='source-over';
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(2,S*.0028);
   // moon outline (just the visible crescent arc)
   ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.stroke();
   // closed eye (single curve)
   ctx.beginPath();ctx.arc(mx-mr*.25,my-mr*.05,mr*.18,Math.PI*.1,Math.PI*.9);ctx.stroke();
   // smile
   ctx.beginPath();ctx.arc(mx-mr*.25,my+mr*.18,mr*.18,Math.PI*.05,Math.PI*.95);ctx.stroke();
   // ── Four hand-drawn stars at varied sizes around the canvas
   const star=(x,y,size,fill)=>{
     ctx.fillStyle=fill;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.6,S*.0022);
     ctx.beginPath();
     for(let i=0;i<5;i++){
       const a=i*Math.PI*2/5-Math.PI/2;
       const wob=1+(((i*7)%3)-1)*.06;
       const px=x+Math.cos(a)*size*wob,py=y+Math.sin(a)*size*wob;
       i?ctx.lineTo(px,py):ctx.moveTo(px,py);
       const ia=a+Math.PI/5;
       ctx.lineTo(x+Math.cos(ia)*size*.4,y+Math.sin(ia)*size*.4);
     }
     ctx.closePath();ctx.fill();ctx.stroke();
   };
   star(W*.10,H*.08,S*.024,'#fbbf24');
   star(W*.50,H*.06,S*.018,'#fef3c7');
   star(W*.04,H*.45,S*.022,'#fbbf24');
   star(W*.50,H*.93,S*.020,'#fef3c7');
   // ── "zZz" sleepy text near the moon
   ctx.fillStyle=ink;ctx.font=`italic 700 ${S*.020}px 'Caveat','Brush Script MT',cursive`;
   ctx.textAlign='left';ctx.textBaseline='middle';
   ctx.fillText('z',W*.83,H*.04);
   ctx.font=`italic 700 ${S*.026}px 'Caveat','Brush Script MT',cursive`;
   ctx.fillText('Z',W*.86,H*.02);
   ctx.font=`italic 700 ${S*.032}px 'Caveat','Brush Script MT',cursive`;
   ctx.fillText('z',W*.89,H*.005);
   // ── Twinkle sparkles (4-point)
   const twinkle=(x,y,size)=>{
     ctx.fillStyle=lavender;ctx.beginPath();
     for(let i=0;i<4;i++){
       const a=i*Math.PI/2-Math.PI/2;
       ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
       ctx.lineTo(x+Math.cos(a+Math.PI/4)*size*.25,y+Math.sin(a+Math.PI/4)*size*.25);
     }
     ctx.closePath();ctx.fill();
   };
   twinkle(W*.74,H*.50,S*.018);
   twinkle(W*.26,H*.50,S*.014);
   twinkle(W*.94,H*.93,S*.016);
   // ── Dotted constellation line connecting two stars
   ctx.strokeStyle='rgba(124,77,255,.5)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.setLineDash([S*.008,S*.006]);
   ctx.beginPath();ctx.moveTo(W*.10,H*.08);ctx.lineTo(W*.50,H*.06);ctx.lineTo(W*.92,H*.08);ctx.stroke();
   ctx.setLineDash([]);
 },
 canvasElements:[
   {kind:'text',text:'AT NIGHT',x:0.499,y:0.097,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2860',letterSpacing:'12px'}},
   {kind:'text',text:'sweet dreams',x:0.505,y:0.954,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#7c4dff'}},
 ]},

// 3. GARDEN DIARY — botanical doodle vocabulary on sage paper.
// Unique elements: hand-drawn daisy (different from tulip), sunflower head,
// curving vine with leaves, bee with motion line, watering can drip, ladybug.
{id:'occ_ig_doodle_garden',name:'Garden Diary',cat:'instagram',badge:'new',n:6,
 photoFrames:[
   {rx:.06,ry:.20,rw:.28,rh:.26,angle:-3,shape:'rect'},
   {rx:.36,ry:.18,rw:.28,rh:.26,angle:2,shape:'rect'},
   {rx:.66,ry:.20,rw:.28,rh:.26,angle:-1,shape:'rect'},
   {rx:.06,ry:.55,rw:.28,rh:.28,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.28,rh:.28,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.28,rh:.28,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f0f5e8','#dde8c8',180,.06,29);
   drawFilmGrain(ctx,W,H,.04,33);
   const ink='rgba(40,60,30,.85)';
   const sage='#65a30d';
   const coral='#f87171';
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=Math.max(2,S*.0028);
   // ── Hand-drawn daisy (top-left)
   const daisy=(x,y,size,fill)=>{
     ctx.fillStyle=fill;ctx.strokeStyle=ink;
     ctx.lineWidth=Math.max(1.5,S*.0022);
     for(let i=0;i<8;i++){
       const a=i*Math.PI/4;
       ctx.beginPath();
       ctx.ellipse(x+Math.cos(a)*size*.7,y+Math.sin(a)*size*.7,size*.4,size*.18,a,0,Math.PI*2);
       ctx.fill();ctx.stroke();
     }
     ctx.fillStyle='#fde047';
     ctx.beginPath();ctx.arc(x,y,size*.35,0,Math.PI*2);ctx.fill();ctx.stroke();
   };
   daisy(W*.04,H*.06,S*.030,'#fff');
   daisy(W*.96,H*.06,S*.024,'#fbcfe8');
   // ── Sunflower head (right edge mid)
   const sx=W*.97,sy=H*.50,ss=S*.04;
   ctx.fillStyle='#facc15';ctx.strokeStyle=ink;
   ctx.lineWidth=Math.max(1.5,S*.0022);
   for(let i=0;i<12;i++){
     const a=i*Math.PI/6;
     ctx.beginPath();
     ctx.ellipse(sx+Math.cos(a)*ss*.7,sy+Math.sin(a)*ss*.7,ss*.42,ss*.20,a,0,Math.PI*2);
     ctx.fill();ctx.stroke();
   }
   ctx.fillStyle='#92400e';
   ctx.beginPath();ctx.arc(sx,sy,ss*.42,0,Math.PI*2);ctx.fill();ctx.stroke();
   // seed dots in center
   ctx.fillStyle='#451a03';
   for(let i=0;i<8;i++){
     const a=Math.random()*Math.PI*2,r=Math.random()*ss*.30;
     ctx.beginPath();ctx.arc(sx+Math.cos(a)*r,sy+Math.sin(a)*r,ss*.04,0,Math.PI*2);ctx.fill();
   }
   // ── Curving vine with leaves running down the LEFT edge
   ctx.strokeStyle=sage;ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();
   ctx.moveTo(W*.025,H*.16);
   ctx.bezierCurveTo(W*.06,H*.30,W*.005,H*.45,W*.04,H*.60);
   ctx.bezierCurveTo(W*.06,H*.75,W*.01,H*.85,W*.04,H*.95);
   ctx.stroke();
   // 4 leaves on the vine
   const leaf=(lx,ly,ang,size)=>{
     ctx.save();ctx.translate(lx,ly);ctx.rotate(ang);
     ctx.fillStyle='rgba(101,163,13,.7)';ctx.strokeStyle=ink;
     ctx.lineWidth=Math.max(1,S*.0015);
     ctx.beginPath();
     ctx.moveTo(0,0);
     ctx.quadraticCurveTo(size*.6,-size*.4,size,0);
     ctx.quadraticCurveTo(size*.6,size*.4,0,0);
     ctx.fill();ctx.stroke();
     // center vein
     ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size,0);ctx.stroke();
     ctx.restore();
   };
   leaf(W*.045,H*.28,-.4,S*.025);
   leaf(W*.025,H*.45,.5,S*.022);
   leaf(W*.050,H*.62,-.3,S*.026);
   leaf(W*.025,H*.80,.6,S*.020);
   // ── Bee with motion line (top-middle)
   const bx=W*.50,by=H*.07;
   ctx.fillStyle='#fde047';ctx.strokeStyle=ink;
   ctx.lineWidth=Math.max(1.5,S*.0022);
   // body
   ctx.beginPath();ctx.ellipse(bx,by,S*.018,S*.012,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   // black stripes
   ctx.fillStyle='#1a1a1a';
   ctx.fillRect(bx-S*.005,by-S*.012,S*.003,S*.024);
   ctx.fillRect(bx+S*.002,by-S*.012,S*.003,S*.024);
   // wings
   ctx.fillStyle='rgba(255,255,255,.7)';
   ctx.beginPath();ctx.ellipse(bx-S*.008,by-S*.010,S*.008,S*.005,-.4,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.ellipse(bx+S*.008,by-S*.010,S*.008,S*.005,.4,0,Math.PI*2);ctx.fill();ctx.stroke();
   // motion line (dashed curve coming from left)
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.setLineDash([S*.008,S*.005]);
   ctx.beginPath();
   ctx.moveTo(W*.30,H*.04);
   ctx.bezierCurveTo(W*.36,H*.10,W*.42,H*.04,bx-S*.020,by);
   ctx.stroke();
   ctx.setLineDash([]);
   // ── Ladybug (bottom-right corner)
   const lbx=W*.94,lby=H*.94;
   ctx.fillStyle=coral;ctx.strokeStyle=ink;
   ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.arc(lbx,lby,S*.018,0,Math.PI*2);ctx.fill();ctx.stroke();
   // head (small black dome)
   ctx.fillStyle='#1a1a1a';
   ctx.beginPath();ctx.arc(lbx,lby-S*.013,S*.008,Math.PI,Math.PI*2);ctx.fill();
   // center line down the back
   ctx.beginPath();ctx.moveTo(lbx,lby-S*.010);ctx.lineTo(lbx,lby+S*.018);ctx.stroke();
   // 4 spots
   ctx.fillStyle='#1a1a1a';
   [[-S*.008,-S*.002],[S*.008,-S*.002],[-S*.006,S*.008],[S*.006,S*.008]].forEach(([dx,dy])=>{
     ctx.beginPath();ctx.arc(lbx+dx,lby+dy,S*.0035,0,Math.PI*2);ctx.fill();
   });
   // ── Tiny grass tufts along the bottom
   ctx.strokeStyle=sage;ctx.lineWidth=Math.max(1.5,S*.0025);
   for(let i=0;i<8;i++){
     const gx=W*.20+i*W*.07,gy=H*.93;
     ctx.beginPath();
     ctx.moveTo(gx,gy);ctx.lineTo(gx-S*.005,gy-S*.012);
     ctx.moveTo(gx,gy);ctx.lineTo(gx,gy-S*.018);
     ctx.moveTo(gx,gy);ctx.lineTo(gx+S*.005,gy-S*.012);
     ctx.stroke();
   }
 },
 canvasElements:[
   {kind:'text',text:'IN THE GARDEN',x:0.502,y:0.112,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#1a3a18',letterSpacing:'10px'}},
   {kind:'text',text:'things that grow',x:0.501,y:0.951,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#65a30d'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 🖍️ NAIVE-DOODLE FAMILY +10 — ten more themed doodle templates.
// Each has its OWN doodle vocabulary (coffee, beach, cabin, bakery,
// pet, music, travel, plants, movie, recipe). Same paper-and-grain
// recipe as Sun Day / Sweet Dreams / Garden Diary, totally different
// hand-drawn elements per template. No two share decorations.
// ═══════════════════════════════════════════════════════════════

// 1. COFFEE DIARY — coffee mug w/ steam, croissant, bean dots, sugar
// sprinkles, spoon, donut. Cream paper + warm brown ink + cherry red.
{id:'occ_doodle_coffee',name:'Coffee Diary',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.07,ry:.22,rw:.38,rh:.30,angle:-3,shape:'rect'},
   {rx:.55,ry:.20,rw:.38,rh:.30,angle:2,shape:'rect'},
   {rx:.05,ry:.56,rw:.38,rh:.30,angle:1,shape:'rect'},
   {rx:.55,ry:.58,rw:.40,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf3e7','#f0d9b8',180,.05,17);
   drawFilmGrain(ctx,W,H,.05,33);
   const ink='rgba(70,40,15,.85)';const cherry='#dc2626';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Coffee mug top-right with three steam squiggles
   const mx=W*.93,my=H*.10,mw=S*.05,mh=S*.05;
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;
   // mug body
   ctx.beginPath();ctx.moveTo(mx-mw/2,my-mh/2);ctx.lineTo(mx+mw/2,my-mh/2);
   ctx.lineTo(mx+mw/2-S*.003,my+mh/2);ctx.lineTo(mx-mw/2+S*.003,my+mh/2);ctx.closePath();
   ctx.fill();ctx.stroke();
   // handle
   ctx.beginPath();ctx.arc(mx+mw/2+S*.005,my,S*.012,-Math.PI/2,Math.PI/2);ctx.stroke();
   // coffee surface line
   ctx.beginPath();ctx.moveTo(mx-mw/2+S*.003,my-mh/2+S*.005);ctx.lineTo(mx+mw/2-S*.003,my-mh/2+S*.005);ctx.stroke();
   // 3 steam squiggles
   for(let i=0;i<3;i++){
     ctx.beginPath();
     const sx=mx-mw/2+i*mw/2;
     for(let t=0;t<=8;t++){
       const sy=my-mh/2-S*.005-t*S*.004,wx=sx+Math.sin(t*.8+i)*S*.004;
       t?ctx.lineTo(wx,sy):ctx.moveTo(wx,sy);
     }
     ctx.stroke();
   }
   // ── Croissant top-left (curved crescent with ridges)
   const crx=W*.07,cry=H*.07;
   ctx.fillStyle='#d97706';ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.arc(crx,cry,S*.025,Math.PI*1.2,Math.PI*1.85);
   ctx.arc(crx,cry,S*.012,Math.PI*1.85,Math.PI*1.2,true);
   ctx.closePath();ctx.fill();ctx.stroke();
   // 3 ridges
   for(let i=1;i<4;i++){
     ctx.beginPath();
     const a=Math.PI*1.2+i*Math.PI*.65/4;
     ctx.moveTo(crx+Math.cos(a)*S*.012,cry+Math.sin(a)*S*.012);
     ctx.lineTo(crx+Math.cos(a)*S*.025,cry+Math.sin(a)*S*.025);
     ctx.stroke();
   }
   // ── Donut with sprinkles bottom-right
   const dx=W*.93,dy=H*.92,dr=S*.030;
   ctx.fillStyle='#fbcfe8';ctx.strokeStyle=ink;
   ctx.beginPath();ctx.arc(dx,dy,dr,0,Math.PI*2);ctx.fill();ctx.stroke();
   // hole
   ctx.fillStyle='#fdf3e7';
   ctx.beginPath();ctx.arc(dx,dy,dr*.35,0,Math.PI*2);ctx.fill();ctx.stroke();
   // sprinkles
   const sprinkleColors=[cherry,'#22c55e','#3b82f6','#fbbf24','#a855f7'];
   for(let i=0;i<10;i++){
     const a=i*Math.PI*2/10,sr=dr*.65;
     ctx.fillStyle=sprinkleColors[i%5];ctx.save();
     ctx.translate(dx+Math.cos(a)*sr,dy+Math.sin(a)*sr);ctx.rotate(a);
     ctx.fillRect(-S*.003,-S*.001,S*.006,S*.002);ctx.restore();
   }
   // ── Coffee bean (oval with seam) middle-left
   ctx.fillStyle='#451a03';
   ctx.save();ctx.translate(W*.04,H*.45);ctx.rotate(.4);
   ctx.beginPath();ctx.ellipse(0,0,S*.018,S*.011,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='rgba(120,80,30,.9)';ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.moveTo(-S*.014,0);ctx.bezierCurveTo(-S*.003,-S*.005,S*.003,S*.005,S*.014,0);ctx.stroke();
   ctx.restore();
   // ── Spoon middle-right
   ctx.save();ctx.translate(W*.97,H*.50);ctx.rotate(-.6);
   ctx.fillStyle='#9ca3af';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.ellipse(0,0,S*.012,S*.008,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.moveTo(S*.012,0);ctx.lineTo(S*.040,S*.005);ctx.stroke();
   ctx.restore();
   // ── Sugar sprinkle dots scattered (cherry color)
   ctx.fillStyle=cherry;
   [[.50,.10],[.30,.94],[.70,.94],[.50,.51]].forEach(([px,py])=>{
     ctx.beginPath();ctx.arc(px*W,py*H,S*.005,0,Math.PI*2);ctx.fill();
   });
 },
 canvasElements:[
   {kind:'text',text:'CAFE DIARY',x:0.5,y:0.07,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#451a03',letterSpacing:'10px'}},
   {kind:'text',text:'morning brew',x:0.5,y:0.13,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#92400e'}},
   {kind:'text',text:'· always one more cup ·',x:0.5,y:0.94,align:'center',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#7c2d12'}},
 ]},

// 2. BEACH DAYS — surfboard, palm tree, wave squiggle, seashells, sun
// umbrella, anchor. Sand cream + ocean teal + coral.
{id:'occ_doodle_beach',name:'Beach Days',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.22,rw:.42,rh:.30,angle:-3,shape:'rect'},
   {rx:.52,ry:.20,rw:.42,rh:.30,angle:2,shape:'rect'},
   {rx:.04,ry:.55,rw:.30,rh:.30,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.30,rh:.30,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.30,rh:.30,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fff8e7','#ffe6b8',180,.05,21);
   drawFilmGrain(ctx,W,H,.04,33);
   const ink='rgba(20,60,80,.85)';const teal='#0891b2';const coral='#f97373';
   ctx.lineCap='round';ctx.lineJoin='round';
   // ── Wave squiggle running across the top
   ctx.strokeStyle=teal;ctx.lineWidth=Math.max(2.5,S*.004);
   ctx.beginPath();
   for(let i=0;i<=30;i++){
     const t=i/30,wx=W*.20+t*W*.55,wy=H*.06+Math.sin(t*Math.PI*4)*S*.008;
     i?ctx.lineTo(wx,wy):ctx.moveTo(wx,wy);
   }
   ctx.stroke();
   // ── Palm tree top-left
   const px=W*.05,py=H*.10;
   ctx.strokeStyle='#92400e';ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();ctx.moveTo(px,py+S*.04);ctx.quadraticCurveTo(px+S*.005,py+S*.02,px-S*.003,py);ctx.stroke();
   // 5 fronds
   ctx.strokeStyle='#22c55e';ctx.lineWidth=Math.max(2,S*.003);
   [[-.7,-.3],[-.3,-.6],[.3,-.6],[.7,-.3],[0,-.7]].forEach(([dx,dy])=>{
     ctx.beginPath();
     ctx.moveTo(px-S*.003,py);
     ctx.quadraticCurveTo(px+S*.012*dx,py+S*.005*dy,px+S*.025*dx,py+S*.018*dy);
     ctx.stroke();
   });
   // ── Surfboard top-right (rounded vertical oval with stripe)
   const sbx=W*.93,sby=H*.10;
   ctx.save();ctx.translate(sbx,sby);ctx.rotate(.4);
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.ellipse(0,0,S*.012,S*.045,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   // colored stripe
   ctx.fillStyle=coral;ctx.fillRect(-S*.003,-S*.04,S*.006,S*.08);
   ctx.restore();
   // ── Sun umbrella mid-right (alternating coral + cream wedges)
   const ux=W*.96,uy=H*.50;
   const wedges=8;
   for(let i=0;i<wedges;i++){
     const a1=Math.PI+i*Math.PI/wedges,a2=Math.PI+(i+1)*Math.PI/wedges;
     ctx.fillStyle=i%2?coral:'#fff';ctx.strokeStyle=ink;
     ctx.lineWidth=Math.max(1.2,S*.0018);
     ctx.beginPath();ctx.moveTo(ux,uy);
     ctx.arc(ux,uy,S*.030,a1,a2);ctx.closePath();ctx.fill();ctx.stroke();
   }
   // pole
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.8,S*.0028);
   ctx.beginPath();ctx.moveTo(ux,uy);ctx.lineTo(ux,uy+S*.05);ctx.stroke();
   // ── Two seashells (fan-shape) along the bottom
   const shell=(x,y,size,col)=>{
     ctx.fillStyle=col;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,S*.002);
     ctx.beginPath();ctx.moveTo(x,y);
     ctx.arc(x,y,size,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();ctx.stroke();
     // ribs
     for(let i=1;i<5;i++){
       ctx.beginPath();
       const a=Math.PI+i*Math.PI/5;
       ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);ctx.stroke();
     }
   };
   shell(W*.10,H*.92,S*.025,'#fbcfe8');
   shell(W*.92,H*.93,S*.022,'#fef3c7');
   // ── Anchor middle-left
   const anx=W*.04,any=H*.50;
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.8,S*.0028);ctx.fillStyle=ink;
   ctx.beginPath();ctx.arc(anx,any-S*.020,S*.005,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(anx,any-S*.015);ctx.lineTo(anx,any+S*.020);ctx.stroke();
   ctx.beginPath();ctx.moveTo(anx-S*.012,any-S*.005);ctx.lineTo(anx+S*.012,any-S*.005);ctx.stroke();
   ctx.beginPath();ctx.arc(anx,any+S*.010,S*.014,Math.PI*.1,Math.PI*.9);ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'BY THE SEA',x:0.498,y:0.1,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#0c4a6e',letterSpacing:'10px'}},
   {kind:'text',text:'Salt & Sun',x:0.5,y:0.94,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#0e7490'}},
 ]},

// 3. COZY CABIN — pine trees, log cabin, smoke curls, mountain peak,
// snowflakes, fireplace flame. Soft slate + pine green + ember.
{id:'occ_doodle_cabin',name:'Cozy Cabin',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.22,rw:.36,rh:.30,angle:-3,shape:'rect'},
   {rx:.55,ry:.20,rw:.36,rh:.30,angle:2,shape:'rect'},
   {rx:.06,ry:.55,rw:.36,rh:.30,angle:1,shape:'rect'},
   {rx:.55,ry:.55,rw:.39,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#e8eef2','#c8d4dc',180,.06,29);
   drawFilmGrain(ctx,W,H,.05,33);
   const ink='rgba(40,55,65,.85)';const pine='#15803d';const ember='#ea580c';
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=Math.max(2,S*.0028);
   // ── Pine tree top-left
   const pt=(x,y,size,col)=>{
     ctx.fillStyle=col;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.2,S*.0018);
     ctx.beginPath();
     ctx.moveTo(x,y);
     ctx.lineTo(x-size*.5,y+size*.4);ctx.lineTo(x-size*.3,y+size*.4);
     ctx.lineTo(x-size*.6,y+size*.7);ctx.lineTo(x-size*.4,y+size*.7);
     ctx.lineTo(x-size*.7,y+size);
     ctx.lineTo(x+size*.7,y+size);
     ctx.lineTo(x+size*.4,y+size*.7);ctx.lineTo(x+size*.6,y+size*.7);
     ctx.lineTo(x+size*.3,y+size*.4);ctx.lineTo(x+size*.5,y+size*.4);
     ctx.closePath();ctx.fill();ctx.stroke();
     // trunk
     ctx.fillStyle='#78350f';
     ctx.fillRect(x-size*.08,y+size,size*.16,size*.12);ctx.strokeRect(x-size*.08,y+size,size*.16,size*.12);
   };
   pt(W*.08,H*.04,S*.045,pine);
   pt(W*.94,H*.06,S*.035,pine);
   // ── Log cabin top-center
   const cx=W*.50,cy=H*.10;
   ctx.fillStyle='#92400e';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.fillRect(cx-S*.04,cy-S*.005,S*.08,S*.04);ctx.strokeRect(cx-S*.04,cy-S*.005,S*.08,S*.04);
   // logs (horizontal lines)
   for(let i=1;i<4;i++){
     ctx.beginPath();ctx.moveTo(cx-S*.04,cy-S*.005+i*S*.010);
     ctx.lineTo(cx+S*.04,cy-S*.005+i*S*.010);ctx.stroke();
   }
   // roof (triangle)
   ctx.fillStyle='#451a03';
   ctx.beginPath();ctx.moveTo(cx-S*.045,cy-S*.005);ctx.lineTo(cx+S*.045,cy-S*.005);ctx.lineTo(cx,cy-S*.030);ctx.closePath();
   ctx.fill();ctx.stroke();
   // chimney
   ctx.fillStyle='#525252';
   ctx.fillRect(cx+S*.020,cy-S*.025,S*.008,S*.012);ctx.strokeRect(cx+S*.020,cy-S*.025,S*.008,S*.012);
   // door
   ctx.fillStyle=ember;
   ctx.fillRect(cx-S*.006,cy+S*.020,S*.012,S*.015);ctx.strokeRect(cx-S*.006,cy+S*.020,S*.012,S*.015);
   // ── Smoke curls coming out of the chimney
   ctx.strokeStyle='rgba(80,80,80,.7)';ctx.lineWidth=Math.max(2,S*.0028);
   const smokeX=cx+S*.024;let smokeY=cy-S*.025;
   ctx.beginPath();
   for(let i=0;i<6;i++){
     const a=Math.PI*1.5+i*Math.PI*.4;
     ctx.arc(smokeX+Math.cos(a)*S*.005,smokeY,S*.008,Math.PI*1.2,Math.PI*1.8);
     smokeY-=S*.012;
   }
   ctx.stroke();
   // ── Mountain peak (V) middle-left
   ctx.fillStyle='#94a3b8';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.50);ctx.lineTo(W*.06,H*.42);ctx.lineTo(W*.10,H*.50);ctx.closePath();
   ctx.fill();ctx.stroke();
   // snow cap
   ctx.fillStyle='#fff';
   ctx.beginPath();ctx.moveTo(W*.045,H*.45);ctx.lineTo(W*.06,H*.42);ctx.lineTo(W*.075,H*.45);ctx.closePath();ctx.fill();
   // ── 6 snowflakes scattered (asterisk shape)
   ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.6,S*.0022);
   const flake=(x,y,size)=>{
     for(let i=0;i<6;i++){
       const a=i*Math.PI/3;
       ctx.beginPath();
       ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
       // tiny tip branches
       const tx=x+Math.cos(a)*size*.7,ty=y+Math.sin(a)*size*.7;
       ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(a+.4)*size*.2,ty+Math.sin(a+.4)*size*.2);
       ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(a-.4)*size*.2,ty+Math.sin(a-.4)*size*.2);
       ctx.stroke();
     }
   };
   flake(W*.95,H*.50,S*.018);
   flake(W*.30,H*.06,S*.014);
   flake(W*.70,H*.06,S*.014);
   flake(W*.40,H*.94,S*.012);
   flake(W*.60,H*.94,S*.012);
   flake(W*.05,H*.94,S*.014);
   // ── Tiny ember/flame bottom-right
   const fx=W*.96,fy=H*.94;
   ctx.fillStyle=ember;
   ctx.beginPath();ctx.moveTo(fx,fy-S*.020);
   ctx.bezierCurveTo(fx+S*.012,fy-S*.012,fx+S*.012,fy+S*.005,fx,fy+S*.005);
   ctx.bezierCurveTo(fx-S*.012,fy+S*.005,fx-S*.012,fy-S*.012,fx,fy-S*.020);
   ctx.closePath();ctx.fill();ctx.stroke();
   // inner flame
   ctx.fillStyle='#fbbf24';
   ctx.beginPath();ctx.moveTo(fx,fy-S*.012);
   ctx.bezierCurveTo(fx+S*.006,fy-S*.005,fx+S*.006,fy+S*.002,fx,fy+S*.002);
   ctx.bezierCurveTo(fx-S*.006,fy+S*.002,fx-S*.006,fy-S*.005,fx,fy-S*.012);
   ctx.closePath();ctx.fill();
 },
 canvasElements:[
   {kind:'text',text:'COZY HOURS',x:0.5,y:0.16,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#0f172a',letterSpacing:'10px'}},
   {kind:'text',text:'home is a feeling',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#15803d'}},
 ]},

// 4. BAKERY NOTES — bread loaf, cupcake, whisk, rolling pin, cherry,
// "FRESH BREAD". Buttery cream + chocolate brown + strawberry pink.
{id:'occ_doodle_bakery',name:'Bakery Notes',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.22,rw:.40,rh:.32,angle:-3,shape:'rect'},
   {rx:.52,ry:.20,rw:.40,rh:.32,angle:2,shape:'rect'},
   {rx:.06,ry:.58,rw:.40,rh:.30,angle:1,shape:'rect'},
   {rx:.54,ry:.60,rw:.40,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fef9e7','#fce8a3',180,.05,33);
   drawFilmGrain(ctx,W,H,.04,21);
   const ink='rgba(80,40,15,.85)';const choc='#78350f';const straw='#ec4899';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Bread loaf top-left (oval with diagonal cuts)
   const blx=W*.06,bly=H*.07;
   ctx.fillStyle='#fde68a';ctx.strokeStyle=ink;
   ctx.beginPath();ctx.ellipse(blx,bly,S*.04,S*.022,-.2,0,Math.PI*2);ctx.fill();ctx.stroke();
   // 3 slash cuts
   ctx.lineWidth=Math.max(1.5,S*.0022);
   for(let i=0;i<3;i++){
     ctx.beginPath();
     const slx=blx-S*.025+i*S*.020;
     ctx.moveTo(slx,bly-S*.013);ctx.lineTo(slx+S*.015,bly+S*.005);ctx.stroke();
   }
   // ── Cupcake top-right (wrapper bottom + frosting swirl)
   const cux=W*.94,cuy=H*.10;
   ctx.lineWidth=Math.max(1.8,S*.0028);
   // wrapper (trapezoid)
   ctx.fillStyle='#a78bfa';
   ctx.beginPath();
   ctx.moveTo(cux-S*.020,cuy+S*.005);ctx.lineTo(cux-S*.015,cuy+S*.025);
   ctx.lineTo(cux+S*.015,cuy+S*.025);ctx.lineTo(cux+S*.020,cuy+S*.005);
   ctx.closePath();ctx.fill();ctx.stroke();
   // wrapper ribs
   ctx.lineWidth=Math.max(1,S*.0014);
   for(let i=-2;i<=2;i++){
     ctx.beginPath();ctx.moveTo(cux+i*S*.008,cuy+S*.005);ctx.lineTo(cux+i*S*.005,cuy+S*.025);ctx.stroke();
   }
   // frosting (3 swirl bumps)
   ctx.fillStyle=straw;ctx.lineWidth=Math.max(1.8,S*.0028);
   ctx.beginPath();
   ctx.moveTo(cux-S*.020,cuy+S*.005);
   ctx.bezierCurveTo(cux-S*.020,cuy-S*.012,cux-S*.005,cuy-S*.020,cux,cuy-S*.012);
   ctx.bezierCurveTo(cux+S*.005,cuy-S*.020,cux+S*.020,cuy-S*.012,cux+S*.020,cuy+S*.005);
   ctx.closePath();ctx.fill();ctx.stroke();
   // cherry on top
   ctx.fillStyle='#dc2626';
   ctx.beginPath();ctx.arc(cux,cuy-S*.020,S*.005,0,Math.PI*2);ctx.fill();ctx.stroke();
   // stem
   ctx.strokeStyle='#15803d';ctx.lineWidth=Math.max(1.4,S*.002);
   ctx.beginPath();ctx.moveTo(cux,cuy-S*.025);ctx.lineTo(cux+S*.005,cuy-S*.030);ctx.stroke();
   // ── Whisk middle-left (handle + bulb of curved lines)
   ctx.save();ctx.translate(W*.04,H*.50);ctx.rotate(.5);
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.8,S*.0028);
   // handle
   ctx.fillStyle='#a3a3a3';
   ctx.fillRect(-S*.003,-S*.040,S*.006,S*.030);
   ctx.strokeRect(-S*.003,-S*.040,S*.006,S*.030);
   // bulb arc curves
   ctx.lineWidth=Math.max(1.4,S*.002);
   for(let i=-2;i<=2;i++){
     ctx.beginPath();ctx.moveTo(0,-S*.010);
     ctx.bezierCurveTo(i*S*.004,-S*.005,i*S*.008,S*.008,0,S*.012);
     ctx.stroke();
   }
   ctx.restore();
   // ── Rolling pin middle-right
   ctx.save();ctx.translate(W*.96,H*.50);ctx.rotate(-.6);
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.6,S*.0022);
   ctx.fillRect(-S*.030,-S*.008,S*.060,S*.016);
   ctx.strokeRect(-S*.030,-S*.008,S*.060,S*.016);
   // handles
   ctx.fillStyle='#92400e';
   ctx.fillRect(-S*.040,-S*.005,S*.010,S*.010);ctx.strokeRect(-S*.040,-S*.005,S*.010,S*.010);
   ctx.fillRect(S*.030,-S*.005,S*.010,S*.010);ctx.strokeRect(S*.030,-S*.005,S*.010,S*.010);
   ctx.restore();
   // ── Flour dust dots scattered
   ctx.fillStyle='rgba(255,255,255,.85)';
   for(let i=0;i<14;i++){
     ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*S*.005+S*.001,0,Math.PI*2);ctx.fill();
   }
   // ── Two strawberries bottom (dot pattern + leaf)
   const berry=(x,y,size)=>{
     ctx.fillStyle=straw;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,S*.002);
     ctx.beginPath();
     ctx.moveTo(x,y);ctx.bezierCurveTo(x+size,y,x+size*.5,y+size*1.2,x,y+size*1.2);
     ctx.bezierCurveTo(x-size*.5,y+size*1.2,x-size,y,x,y);
     ctx.closePath();ctx.fill();ctx.stroke();
     // seeds
     ctx.fillStyle='#fef3c7';
     for(let i=0;i<5;i++){
       ctx.beginPath();ctx.arc(x+Math.cos(i*1.3)*size*.4,y+size*.4+Math.sin(i*1.3)*size*.3,size*.06,0,Math.PI*2);ctx.fill();
     }
     // leaf
     ctx.fillStyle='#15803d';
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-size*.4,y-size*.2);ctx.lineTo(x,y-size*.1);
     ctx.lineTo(x+size*.4,y-size*.2);ctx.closePath();ctx.fill();ctx.stroke();
   };
   berry(W*.05,H*.92,S*.018);
   berry(W*.95,H*.92,S*.016);
 },
 canvasElements:[
   {kind:'text',text:'FRESH BAKED',x:0.5,y:0.105,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#78350f',letterSpacing:'10px'}},
   {kind:'text',text:'Sweet Things',x:0.5,y:0.94,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#ec4899'}},
 ]},

// 5. PET DIARY — paw prints, dog bone, fish bowl, ball of yarn,
// bird, pet collar with tag. Soft pink + warm brown + mint.
{id:'occ_doodle_pet',name:'Pet Diary',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.20,rw:.42,rh:.30,angle:-3,shape:'rect'},
   {rx:.52,ry:.18,rw:.42,rh:.30,angle:2,shape:'rect'},
   {rx:.04,ry:.55,rw:.30,rh:.30,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.30,rh:.30,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.30,rh:.30,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fff5f7','#fce4ec',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,33);
   const ink='rgba(60,30,40,.85)';const brown='#92400e';const mint='#14b8a6';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── 5 paw prints scattered (4 toe pads + heel pad)
   const paw=(x,y,size,col)=>{
     ctx.fillStyle=col;
     // 4 toe pads
     for(let i=0;i<4;i++){
       const a=-Math.PI*.5+(i-1.5)*.4;
       ctx.beginPath();
       ctx.ellipse(x+Math.cos(a)*size*.6,y+Math.sin(a)*size*.6,size*.20,size*.28,0,0,Math.PI*2);
       ctx.fill();
     }
     // heel pad (larger, bottom)
     ctx.beginPath();
     ctx.ellipse(x,y+size*.25,size*.45,size*.40,0,0,Math.PI*2);ctx.fill();
   };
   paw(W*.05,H*.07,S*.025,brown);
   paw(W*.95,H*.07,S*.022,brown);
   paw(W*.04,H*.50,S*.020,'#a78bfa');
   paw(W*.96,H*.50,S*.020,'#f87171');
   paw(W*.50,H*.93,S*.024,brown);
   // ── Dog bone top-center
   const bbx=W*.50,bby=H*.07;
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.arc(bbx-S*.025,bby,S*.010,Math.PI/2,Math.PI*1.5);
   ctx.arc(bbx-S*.025,bby-S*.005,S*.008,Math.PI*1.4,Math.PI*.6,true);
   ctx.lineTo(bbx+S*.025,bby-S*.013);
   ctx.arc(bbx+S*.025,bby-S*.005,S*.008,Math.PI*1.4,Math.PI*.6,true);
   ctx.arc(bbx+S*.025,bby,S*.010,Math.PI*1.5,Math.PI/2,true);
   ctx.arc(bbx+S*.025,bby+S*.005,S*.008,-Math.PI*.6,Math.PI*.6);
   ctx.lineTo(bbx-S*.025,bby+S*.013);
   ctx.arc(bbx-S*.025,bby+S*.005,S*.008,-Math.PI*.6,Math.PI*.6);
   ctx.closePath();ctx.fill();ctx.stroke();
   // ── Fish bowl middle-right
   const fbx=W*.95,fby=H*.93;
   ctx.fillStyle='rgba(20,184,166,.3)';ctx.strokeStyle=ink;
   ctx.beginPath();ctx.arc(fbx,fby,S*.030,0,Math.PI*2);ctx.fill();ctx.stroke();
   // water line
   ctx.strokeStyle=mint;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();
   for(let i=0;i<=10;i++){
     const t=i/10,wx=fbx-S*.025+t*S*.050,wy=fby-S*.012+Math.sin(t*Math.PI*4)*S*.002;
     i?ctx.lineTo(wx,wy):ctx.moveTo(wx,wy);
   }
   ctx.stroke();
   // tiny fish
   ctx.fillStyle='#f97316';
   ctx.beginPath();
   ctx.moveTo(fbx-S*.005,fby);ctx.lineTo(fbx+S*.012,fby-S*.005);
   ctx.lineTo(fbx+S*.018,fby);ctx.lineTo(fbx+S*.012,fby+S*.005);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(fbx-S*.005,fby);ctx.lineTo(fbx-S*.012,fby-S*.006);
   ctx.lineTo(fbx-S*.012,fby+S*.006);ctx.closePath();ctx.fill();
   // fish eye
   ctx.fillStyle='#fff';
   ctx.beginPath();ctx.arc(fbx+S*.008,fby-S*.001,S*.0025,0,Math.PI*2);ctx.fill();
   // ── Ball of yarn bottom-left
   const yx=W*.05,yy=H*.93;
   ctx.fillStyle='#fbbf24';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,S*.002);
   ctx.beginPath();ctx.arc(yx,yy,S*.025,0,Math.PI*2);ctx.fill();ctx.stroke();
   // wrap lines
   ctx.lineWidth=Math.max(1.2,S*.0018);
   for(let i=0;i<3;i++){
     ctx.beginPath();
     ctx.ellipse(yx,yy,S*.025,S*.008,i*Math.PI/3,0,Math.PI*2);
     ctx.stroke();
   }
   // dangling thread
   ctx.beginPath();
   ctx.moveTo(yx+S*.025,yy);
   ctx.bezierCurveTo(yx+S*.040,yy-S*.005,yx+S*.045,yy+S*.010,yx+S*.055,yy+S*.005);
   ctx.stroke();
   // ── Tiny bird middle-bottom (simple "M"-shape silhouettes for wings)
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.6,S*.0024);
   const bird=(x,y)=>{
     ctx.beginPath();
     ctx.moveTo(x-S*.012,y);ctx.quadraticCurveTo(x-S*.006,y-S*.008,x,y);
     ctx.quadraticCurveTo(x+S*.006,y-S*.008,x+S*.012,y);
     ctx.stroke();
   };
   bird(W*.20,H*.10);bird(W*.80,H*.10);
 },
 canvasElements:[
   {kind:'text',text:'BEST FRIEND',x:0.502,y:0.12,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#831843',letterSpacing:'10px'}},
   {kind:'text',text:'My little floof',x:0.498,y:0.956,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#be185d'}},
 ]},

// 6. MUSIC NOTES — eighth note, sixteenth note, treble clef, headphones,
// vinyl record, sound waves. Black bg + neon yellow + magenta. Different
// palette feel — darker for the music vibe.
{id:'occ_doodle_music',name:'Music Notes',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.069,ry:.182,rw:.40,rh:.30,angle:-3,shape:'rect'},
   {rx:.506,ry:.23,rw:.40,rh:.30,angle:2,shape:'rect'},
   {rx:.076,ry:.551,rw:.40,rh:.30,angle:1,shape:'rect'},
   {rx:.55,ry:.58,rw:.40,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,33);
   const yel='#facc15';const mag='#ec4899';const wh='rgba(255,255,255,.85)';
   ctx.lineCap='round';ctx.lineJoin='round';
   // ── Eighth note top-left
   const enx=W*.06,eny=H*.10;
   ctx.fillStyle=yel;ctx.strokeStyle=yel;ctx.lineWidth=Math.max(2.5,S*.0035);
   ctx.beginPath();ctx.ellipse(enx,eny+S*.030,S*.012,S*.008,-.3,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(enx+S*.012,eny+S*.030);ctx.lineTo(enx+S*.012,eny);ctx.stroke();
   // flag
   ctx.beginPath();
   ctx.moveTo(enx+S*.012,eny);
   ctx.bezierCurveTo(enx+S*.022,eny+S*.005,enx+S*.022,eny+S*.018,enx+S*.012,eny+S*.020);
   ctx.lineTo(enx+S*.012,eny+S*.012);
   ctx.closePath();ctx.fill();
   // ── Sixteenth note top-right (two flags)
   const sxx=W*.94,sxy=H*.10;
   ctx.fillStyle=mag;ctx.strokeStyle=mag;ctx.lineWidth=Math.max(2.5,S*.0035);
   ctx.beginPath();ctx.ellipse(sxx,sxy+S*.030,S*.012,S*.008,-.3,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(sxx+S*.012,sxy+S*.030);ctx.lineTo(sxx+S*.012,sxy);ctx.stroke();
   for(let i=0;i<2;i++){
     ctx.beginPath();
     const fy=sxy+i*S*.008;
     ctx.moveTo(sxx+S*.012,fy);
     ctx.bezierCurveTo(sxx+S*.022,fy+S*.003,sxx+S*.022,fy+S*.012,sxx+S*.012,fy+S*.014);
     ctx.lineTo(sxx+S*.012,fy+S*.008);
     ctx.closePath();ctx.fill();
   }
   // ── Vinyl record middle-left
   const vrx=W*.05,vry=H*.50;
   ctx.fillStyle='#1a1a1a';ctx.strokeStyle=wh;ctx.lineWidth=Math.max(1.4,S*.002);
   ctx.beginPath();ctx.arc(vrx,vry,S*.040,0,Math.PI*2);ctx.fill();
   // grooves
   for(let i=0;i<5;i++){
     ctx.beginPath();ctx.arc(vrx,vry,S*.040-i*S*.006,0,Math.PI*2);ctx.stroke();
   }
   // center label
   ctx.fillStyle=mag;
   ctx.beginPath();ctx.arc(vrx,vry,S*.012,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=yel;
   ctx.beginPath();ctx.arc(vrx,vry,S*.003,0,Math.PI*2);ctx.fill();
   // ── Headphones middle-right
   const hpx=W*.95,hpy=H*.50;
   ctx.strokeStyle=wh;ctx.lineWidth=Math.max(2.4,S*.0035);
   // headband arc
   ctx.beginPath();ctx.arc(hpx,hpy,S*.030,Math.PI,Math.PI*2);ctx.stroke();
   // earcups
   ctx.fillStyle=yel;
   ctx.beginPath();ctx.arc(hpx-S*.030,hpy,S*.012,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.arc(hpx+S*.030,hpy,S*.012,0,Math.PI*2);ctx.fill();ctx.stroke();
   // ── Sound waves at bottom (5 vertical bars varying heights)
   ctx.fillStyle=yel;
   const heights=[.4,.7,.5,.9,.6,.8,.4,.7];
   const bw=S*.008;
   heights.forEach((h,i)=>{
     ctx.fillRect(W*.40+i*bw*1.5,H*.93-S*.025*h,bw,S*.025*h);
   });
   // ── Treble clef silhouette bottom-left
   const tx=W*.05,ty=H*.93;
   ctx.strokeStyle=mag;ctx.lineWidth=Math.max(2.5,S*.0035);
   ctx.beginPath();
   ctx.moveTo(tx,ty);
   ctx.bezierCurveTo(tx-S*.012,ty-S*.012,tx-S*.012,ty-S*.030,tx,ty-S*.030);
   ctx.bezierCurveTo(tx+S*.012,ty-S*.030,tx+S*.012,ty-S*.012,tx,ty-S*.012);
   ctx.bezierCurveTo(tx-S*.012,ty-S*.012,tx-S*.012,ty+S*.005,tx,ty+S*.005);
   ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'ON REPEAT',x:0.496,y:0.096,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#facc15',letterSpacing:'12px'}},
   {kind:'text',text:'sound check',x:0.5,y:0.94,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#ec4899'}},
 ]},

// 7. TRAVEL SKETCHES — airplane, suitcase, compass, map pin, mountain
// peaks, train. Kraft paper + navy + mustard.
{id:'occ_doodle_travel',name:'Travel Sketches',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.22,rw:.42,rh:.30,angle:-3,shape:'rect'},
   {rx:.52,ry:.20,rw:.42,rh:.30,angle:2,shape:'rect'},
   {rx:.04,ry:.55,rw:.30,rh:.30,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.30,rh:.30,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.30,rh:.30,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f5e8c8','#e6c98a',180,.07,33);
   drawFilmGrain(ctx,W,H,.07,33);
   const ink='rgba(15,30,55,.85)';const navy='#1e3a8a';const must='#d97706';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Airplane top-left (with dotted contrail)
   const apx=W*.07,apy=H*.07;
   ctx.fillStyle=navy;ctx.strokeStyle=ink;
   ctx.save();ctx.translate(apx,apy);ctx.rotate(-.5);
   ctx.beginPath();
   ctx.moveTo(-S*.025,0);ctx.lineTo(S*.020,-S*.005);
   ctx.lineTo(S*.025,0);ctx.lineTo(S*.020,S*.005);ctx.closePath();ctx.fill();ctx.stroke();
   // wings
   ctx.beginPath();ctx.moveTo(-S*.005,-S*.002);ctx.lineTo(-S*.005,-S*.012);
   ctx.lineTo(S*.005,-S*.002);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.moveTo(-S*.005,S*.002);ctx.lineTo(-S*.005,S*.012);
   ctx.lineTo(S*.005,S*.002);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.restore();
   // dotted contrail
   ctx.strokeStyle='rgba(15,30,55,.4)';ctx.setLineDash([S*.005,S*.005]);
   ctx.beginPath();
   ctx.moveTo(W*.04,H*.10);ctx.bezierCurveTo(W*.20,H*.05,W*.30,H*.12,W*.40,H*.08);
   ctx.stroke();ctx.setLineDash([]);
   // ── Compass top-right (circle + N E S W + needle)
   const cpx=W*.94,cpy=H*.10,cpr=S*.030;
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.arc(cpx,cpy,cpr,0,Math.PI*2);ctx.fill();ctx.stroke();
   // N E S W marks
   ctx.fillStyle=ink;ctx.font=`900 ${S*.015}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ['N','E','S','W'].forEach((d,i)=>{
     const a=-Math.PI/2+i*Math.PI/2;
     ctx.fillText(d,cpx+Math.cos(a)*cpr*.7,cpy+Math.sin(a)*cpr*.7);
   });
   // needle (red top, white bottom)
   ctx.fillStyle='#dc2626';
   ctx.beginPath();ctx.moveTo(cpx,cpy-cpr*.5);ctx.lineTo(cpx+S*.004,cpy);ctx.lineTo(cpx-S*.004,cpy);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#fff';
   ctx.beginPath();ctx.moveTo(cpx,cpy+cpr*.5);ctx.lineTo(cpx+S*.004,cpy);ctx.lineTo(cpx-S*.004,cpy);ctx.closePath();ctx.fill();ctx.stroke();
   // ── Suitcase middle-left
   const ssx=W*.05,ssy=H*.50;
   ctx.fillStyle=must;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.fillRect(ssx-S*.020,ssy-S*.012,S*.040,S*.025);
   ctx.strokeRect(ssx-S*.020,ssy-S*.012,S*.040,S*.025);
   // handle
   ctx.beginPath();ctx.arc(ssx,ssy-S*.015,S*.008,Math.PI,Math.PI*2);ctx.stroke();
   // strap stripe
   ctx.fillStyle='rgba(0,0,0,.3)';
   ctx.fillRect(ssx-S*.020,ssy-S*.002,S*.040,S*.005);
   // ── Map pin middle-right (teardrop with circle)
   const mpx=W*.97,mpy=H*.50;
   ctx.fillStyle='#dc2626';ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.arc(mpx,mpy-S*.012,S*.012,Math.PI*1.2,Math.PI*1.8);
   ctx.lineTo(mpx,mpy+S*.012);
   ctx.closePath();ctx.fill();ctx.stroke();
   // inner dot
   ctx.fillStyle='#fff';
   ctx.beginPath();ctx.arc(mpx,mpy-S*.012,S*.005,0,Math.PI*2);ctx.fill();ctx.stroke();
   // ── Mountain peaks bottom-left + right
   const peaks=(x,y,size)=>{
     ctx.fillStyle='#7c5e3a';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
     ctx.beginPath();
     ctx.moveTo(x-size,y);
     ctx.lineTo(x-size*.5,y-size*.6);
     ctx.lineTo(x-size*.2,y-size*.3);
     ctx.lineTo(x+size*.2,y-size*.7);
     ctx.lineTo(x+size,y);
     ctx.closePath();ctx.fill();ctx.stroke();
     // snow
     ctx.fillStyle='#fff';
     ctx.beginPath();ctx.moveTo(x-size*.5,y-size*.6);ctx.lineTo(x-size*.4,y-size*.5);
     ctx.lineTo(x-size*.6,y-size*.5);ctx.closePath();ctx.fill();
     ctx.beginPath();ctx.moveTo(x+size*.2,y-size*.7);ctx.lineTo(x+size*.3,y-size*.6);
     ctx.lineTo(x+size*.1,y-size*.6);ctx.closePath();ctx.fill();
   };
   peaks(W*.10,H*.93,S*.04);
   peaks(W*.92,H*.93,S*.04);
 },
 canvasElements:[
   {kind:'text',text:'ITINERARY',x:0.5,y:0.118,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#1e3a8a',letterSpacing:'10px'}},
   {kind:'text',text:'Wherever, Together',x:0.5,y:0.94,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#1e3a8a'}},
 ]},

// 8. PLANT MOM — monstera leaf, succulent rosette, watering can,
// terracotta pot, hanging vine. Soft sage + emerald + terracotta.
{id:'occ_doodle_plants',name:'Plant Mom',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.10,ry:.22,rw:.36,rh:.30,angle:-3,shape:'rect'},
   {rx:.55,ry:.20,rw:.36,rh:.30,angle:2,shape:'rect'},
   {rx:.08,ry:.55,rw:.36,rh:.30,angle:1,shape:'rect'},
   {rx:.55,ry:.55,rw:.39,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#f0f5e8','#c8d8b8',180,.06,29);
   drawFilmGrain(ctx,W,H,.04,33);
   const ink='rgba(30,60,30,.85)';const emr='#059669';const terra='#c2410c';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Monstera leaf top-left (heart-shape with notches)
   const mlx=W*.06,mly=H*.07;
   ctx.fillStyle=emr;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();
   ctx.moveTo(mlx,mly-S*.025);
   ctx.bezierCurveTo(mlx+S*.030,mly-S*.025,mlx+S*.030,mly+S*.020,mlx,mly+S*.025);
   ctx.bezierCurveTo(mlx-S*.030,mly+S*.020,mlx-S*.030,mly-S*.025,mlx,mly-S*.025);
   ctx.fill();ctx.stroke();
   // 3 notches (cuts inward)
   ctx.fillStyle='#f0f5e8';
   for(let i=0;i<3;i++){
     ctx.beginPath();
     const a=Math.PI*.3+i*Math.PI*.5;
     ctx.moveTo(mlx+Math.cos(a)*S*.025,mly+Math.sin(a)*S*.020);
     ctx.lineTo(mlx+Math.cos(a)*S*.005,mly+Math.sin(a)*S*.005);
     ctx.lineTo(mlx+Math.cos(a-.3)*S*.025,mly+Math.sin(a-.3)*S*.020);
     ctx.closePath();ctx.fill();
   }
   // center vein
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();ctx.moveTo(mlx,mly-S*.020);ctx.lineTo(mlx,mly+S*.020);ctx.stroke();
   // ── Succulent rosette top-right (concentric petals)
   const sux=W*.94,suy=H*.10;
   for(let layer=3;layer>=0;layer--){
     const r=S*.030-layer*S*.005;
     for(let i=0;i<6;i++){
       const a=i*Math.PI/3+layer*.3;
       ctx.fillStyle=`rgba(${22+layer*30},${163-layer*20},${74-layer*15},.95)`;
       ctx.beginPath();
       ctx.ellipse(sux+Math.cos(a)*r*.5,suy+Math.sin(a)*r*.5,r*.3,r*.5,a,0,Math.PI*2);
       ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1,S*.0014);ctx.stroke();
     }
   }
   // ── Watering can middle-left (rounded body + spout + handle)
   const wcx=W*.05,wcy=H*.50;
   ctx.fillStyle='#a3a3a3';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.fillRect(wcx-S*.020,wcy-S*.012,S*.040,S*.025);
   ctx.strokeRect(wcx-S*.020,wcy-S*.012,S*.040,S*.025);
   // spout
   ctx.beginPath();
   ctx.moveTo(wcx-S*.020,wcy-S*.005);ctx.lineTo(wcx-S*.040,wcy-S*.020);
   ctx.lineTo(wcx-S*.035,wcy-S*.025);ctx.lineTo(wcx-S*.018,wcy-S*.012);
   ctx.closePath();ctx.fill();ctx.stroke();
   // handle
   ctx.beginPath();ctx.arc(wcx+S*.018,wcy,S*.008,-Math.PI/2,Math.PI/2);ctx.stroke();
   // water drops below
   ctx.fillStyle=emr;
   for(let i=0;i<3;i++){
     ctx.beginPath();
     ctx.arc(wcx-S*.040+i*S*.005,wcy-S*.015+i*S*.008,S*.003,0,Math.PI*2);ctx.fill();
   }
   // ── Terracotta pot middle-right (trapezoid with rim)
   const ptx=W*.96,pty=H*.50;
   ctx.fillStyle=terra;ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.moveTo(ptx-S*.022,pty);ctx.lineTo(ptx-S*.018,pty+S*.030);
   ctx.lineTo(ptx+S*.018,pty+S*.030);ctx.lineTo(ptx+S*.022,pty);
   ctx.closePath();ctx.fill();ctx.stroke();
   // rim
   ctx.fillStyle='#9a3412';
   ctx.fillRect(ptx-S*.024,pty-S*.005,S*.048,S*.008);ctx.strokeRect(ptx-S*.024,pty-S*.005,S*.048,S*.008);
   // sprout (3 simple leaves)
   ctx.fillStyle=emr;
   for(let i=-1;i<=1;i++){
     ctx.beginPath();
     ctx.ellipse(ptx+i*S*.008,pty-S*.015,S*.003,S*.012,i*.4,0,Math.PI*2);
     ctx.fill();ctx.stroke();
   }
   // ── Hanging vine bottom (curving line with leaves)
   ctx.strokeStyle=emr;ctx.lineWidth=Math.max(2,S*.003);
   ctx.beginPath();
   ctx.moveTo(W*.20,H*.92);
   ctx.bezierCurveTo(W*.30,H*.96,W*.45,H*.91,W*.55,H*.95);
   ctx.bezierCurveTo(W*.65,H*.99,W*.80,H*.92,W*.85,H*.96);
   ctx.stroke();
   // leaves on vine
   ctx.fillStyle=emr;
   [[.28,.94],[.42,.93],[.58,.96],[.72,.94],[.82,.96]].forEach(([px,py])=>{
     ctx.beginPath();
     ctx.ellipse(px*W,py*H,S*.005,S*.012,Math.random()*Math.PI,0,Math.PI*2);ctx.fill();
   });
 },
 canvasElements:[
   {kind:'text',text:'GROW WILD',x:0.501,y:0.065,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#14532d',letterSpacing:'10px'}},
   {kind:'text',text:'Leaf & Limb',x:0.498,y:0.098,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#059669'}},
 ]},

// 9. MOVIE NIGHT — popcorn bucket, film reel, ticket stub, soda cup,
// 3D glasses, marquee bulb. Popcorn yellow + cinema red + black.
{id:'occ_doodle_movie',name:'Movie Night',cat:'instagram',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.22,rw:.40,rh:.30,angle:-3,shape:'rect'},
   {rx:.52,ry:.20,rw:.40,rh:.30,angle:2,shape:'rect'},
   {rx:.06,ry:.56,rw:.40,rh:.30,angle:1,shape:'rect'},
   {rx:.54,ry:.58,rw:.40,rh:.30,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fff7d6','#fde68a',180,.05,21);
   drawFilmGrain(ctx,W,H,.04,33);
   const ink='rgba(40,5,10,.85)';const red='#dc2626';const wh='#fff';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Popcorn bucket top-left (red+white striped trapezoid + popcorn)
   const pbx=W*.06,pby=H*.10;
   const stripes=8;
   for(let i=0;i<stripes;i++){
     ctx.fillStyle=i%2?red:wh;
     const wL=S*.025,wR=S*.030;
     const x1=pbx-wL+i*(wL*2)/stripes;
     const x2=x1+(wL*2)/stripes;
     const x3=pbx-wR+(i+1)*(wR*2)/stripes;
     const x4=pbx-wR+i*(wR*2)/stripes;
     ctx.beginPath();
     ctx.moveTo(x1,pby-S*.015);ctx.lineTo(x2,pby-S*.015);
     ctx.lineTo(x3,pby+S*.025);ctx.lineTo(x4,pby+S*.025);
     ctx.closePath();ctx.fill();
   }
   ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.moveTo(pbx-S*.025,pby-S*.015);ctx.lineTo(pbx+S*.025,pby-S*.015);
   ctx.lineTo(pbx+S*.030,pby+S*.025);ctx.lineTo(pbx-S*.030,pby+S*.025);
   ctx.closePath();ctx.stroke();
   // popcorn pieces (cloud-like pops)
   ctx.fillStyle=wh;
   for(let i=0;i<6;i++){
     const x=pbx-S*.025+i*S*.010,y=pby-S*.020-((i%2)*S*.005);
     ctx.beginPath();ctx.arc(x,y,S*.006,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.arc(x+S*.004,y-S*.004,S*.005,0,Math.PI*2);ctx.fill();
   }
   // ── Film reel top-right
   const frx=W*.94,fry=H*.10,frr=S*.030;
   ctx.fillStyle='#1a1a1a';ctx.strokeStyle=ink;
   ctx.beginPath();ctx.arc(frx,fry,frr,0,Math.PI*2);ctx.fill();ctx.stroke();
   // 5 holes in the reel
   ctx.fillStyle='#fde68a';
   for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5;
     ctx.beginPath();
     ctx.arc(frx+Math.cos(a)*frr*.55,fry+Math.sin(a)*frr*.55,frr*.18,0,Math.PI*2);ctx.fill();
   }
   // center hub
   ctx.fillStyle=red;
   ctx.beginPath();ctx.arc(frx,fry,frr*.20,0,Math.PI*2);ctx.fill();
   // ── Ticket stub middle-left (with perforated edge)
   const tkx=W*.05,tky=H*.50;
   ctx.save();ctx.translate(tkx,tky);ctx.rotate(-.15);
   ctx.fillStyle=red;ctx.strokeStyle=ink;
   ctx.fillRect(-S*.025,-S*.012,S*.050,S*.024);ctx.strokeRect(-S*.025,-S*.012,S*.050,S*.024);
   // perforated divider
   ctx.fillStyle='#fde68a';
   for(let i=-2;i<=2;i++){
     ctx.beginPath();ctx.arc(S*.005,i*S*.006,S*.002,0,Math.PI*2);ctx.fill();
   }
   // ADMIT ONE text
   ctx.fillStyle='#fff';ctx.font=`900 ${S*.008}px 'Outfit',sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('ADMIT',-S*.012,0);ctx.fillText('ONE',S*.018,0);
   ctx.restore();
   // ── Soda cup middle-right (with straw)
   const scx=W*.96,scy=H*.50;
   ctx.fillStyle=wh;ctx.strokeStyle=ink;
   ctx.beginPath();
   ctx.moveTo(scx-S*.018,scy-S*.020);ctx.lineTo(scx-S*.014,scy+S*.020);
   ctx.lineTo(scx+S*.014,scy+S*.020);ctx.lineTo(scx+S*.018,scy-S*.020);
   ctx.closePath();ctx.fill();ctx.stroke();
   // soda surface
   ctx.fillStyle=red;
   ctx.fillRect(scx-S*.017,scy-S*.018,S*.034,S*.008);
   // straw
   ctx.strokeStyle=red;ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();ctx.moveTo(scx-S*.005,scy-S*.020);ctx.lineTo(scx,scy-S*.035);ctx.stroke();
   // ── 3D glasses bottom-center (red + cyan lenses)
   const gx=W*.50,gy=H*.93;
   ctx.fillStyle='rgba(220,38,38,.7)';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.beginPath();ctx.ellipse(gx-S*.018,gy,S*.014,S*.010,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.fillStyle='rgba(34,211,238,.7)';
   ctx.beginPath();ctx.ellipse(gx+S*.018,gy,S*.014,S*.010,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   // bridge
   ctx.beginPath();ctx.moveTo(gx-S*.005,gy);ctx.lineTo(gx+S*.005,gy);ctx.stroke();
   // arms
   ctx.beginPath();ctx.moveTo(gx-S*.030,gy-S*.005);ctx.lineTo(gx-S*.040,gy-S*.012);
   ctx.moveTo(gx+S*.030,gy-S*.005);ctx.lineTo(gx+S*.040,gy-S*.012);ctx.stroke();
   // ── Marquee bulbs scattered (tiny yellow circles with glow)
   ctx.fillStyle='#fbbf24';
   [[.30,.06],[.45,.04],[.60,.06],[.75,.04],[.20,.94],[.85,.94]].forEach(([px,py])=>{
     ctx.beginPath();ctx.arc(px*W,py*H,S*.006,0,Math.PI*2);ctx.fill();
     ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.2,S*.0018);ctx.stroke();
   });
 },
 canvasElements:[
   {kind:'text',text:'NOW SHOWING',x:0.491,y:0.096,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#7f1d1d',letterSpacing:'10px'}},
   {kind:'text',text:'Movie night in',x:0.488,y:0.121,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#dc2626'}},
 ]},

// 10. RECIPE BOOK — wooden spoon, herb sprig, garlic, lemon slice,
// pepper grinder, salt shaker. Eggshell + olive + tomato.
{id:'occ_doodle_recipe',name:'Recipe Book',cat:'instagram',badge:'new',n:5,
 photoFrames:[
   {rx:.06,ry:.22,rw:.42,rh:.30,angle:-3,shape:'rect'},
   {rx:.52,ry:.20,rw:.42,rh:.30,angle:2,shape:'rect'},
   {rx:.04,ry:.55,rw:.30,rh:.30,angle:1,shape:'rect'},
   {rx:.36,ry:.57,rw:.30,rh:.30,angle:-2,shape:'rect'},
   {rx:.66,ry:.55,rw:.30,rh:.30,angle:3,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf3df','#ecdfb8',180,.06,29);
   drawFilmGrain(ctx,W,H,.05,33);
   const ink='rgba(60,40,20,.85)';const olive='#65a30d';const tom='#dc2626';
   ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,S*.0028);
   // ── Wooden spoon top-left
   const wsx=W*.05,wsy=H*.07;
   ctx.save();ctx.translate(wsx,wsy);ctx.rotate(.5);
   ctx.fillStyle='#92400e';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   // bowl
   ctx.beginPath();ctx.ellipse(0,0,S*.014,S*.010,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   // handle
   ctx.fillRect(S*.012,-S*.003,S*.040,S*.006);ctx.strokeRect(S*.012,-S*.003,S*.040,S*.006);
   ctx.restore();
   // ── Herb sprig (rosemary-style) top-right
   const hsx=W*.94,hsy=H*.10;
   ctx.strokeStyle=olive;ctx.lineWidth=Math.max(2,S*.0028);
   ctx.beginPath();ctx.moveTo(hsx,hsy-S*.030);ctx.lineTo(hsx,hsy+S*.020);ctx.stroke();
   // 8 leaves alternating sides
   for(let i=0;i<8;i++){
     ctx.beginPath();
     ctx.moveTo(hsx,hsy-S*.025+i*S*.006);
     ctx.lineTo(hsx+(i%2?S*.012:-S*.012),hsy-S*.030+i*S*.006);
     ctx.stroke();
   }
   // ── Garlic bulb middle-left
   const gbx=W*.05,gby=H*.50;
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,S*.002);
   // 3 cloves
   for(let i=-1;i<=1;i++){
     ctx.beginPath();
     ctx.ellipse(gbx+i*S*.008,gby+S*.005,S*.011,S*.018,i*.2,0,Math.PI*2);
     ctx.fill();ctx.stroke();
   }
   // green stem
   ctx.strokeStyle=olive;ctx.lineWidth=Math.max(1.8,S*.0028);
   ctx.beginPath();ctx.moveTo(gbx,gby-S*.012);ctx.lineTo(gbx,gby-S*.025);ctx.stroke();
   // ── Lemon slice middle-right
   const lmx=W*.95,lmy=H*.50,lmr=S*.025;
   ctx.fillStyle='#fbbf24';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.4,S*.002);
   ctx.beginPath();ctx.arc(lmx,lmy,lmr,0,Math.PI*2);ctx.fill();ctx.stroke();
   // pith ring
   ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(1.5,S*.002);
   ctx.beginPath();ctx.arc(lmx,lmy,lmr*.75,0,Math.PI*2);ctx.stroke();
   // 8 segment lines
   ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1,S*.0014);
   for(let i=0;i<8;i++){
     const a=i*Math.PI/4;
     ctx.beginPath();
     ctx.moveTo(lmx+Math.cos(a)*lmr*.75,lmy+Math.sin(a)*lmr*.75);
     ctx.lineTo(lmx+Math.cos(a)*lmr*.95,lmy+Math.sin(a)*lmr*.95);
     ctx.stroke();
   }
   // ── Pepper grinder bottom-left (chunky cylinder)
   const pgx=W*.05,pgy=H*.93;
   ctx.fillStyle='#1a1a1a';ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,S*.0022);
   ctx.fillRect(pgx-S*.012,pgy-S*.030,S*.024,S*.030);
   ctx.strokeRect(pgx-S*.012,pgy-S*.030,S*.024,S*.030);
   // top knob
   ctx.fillStyle='#525252';
   ctx.fillRect(pgx-S*.008,pgy-S*.038,S*.016,S*.008);ctx.strokeRect(pgx-S*.008,pgy-S*.038,S*.016,S*.008);
   // ridges
   for(let i=1;i<5;i++){
     ctx.beginPath();ctx.moveTo(pgx-S*.012,pgy-S*.030+i*S*.006);ctx.lineTo(pgx+S*.012,pgy-S*.030+i*S*.006);ctx.stroke();
   }
   // ── Salt shaker bottom-right
   const stx=W*.95,sty=H*.93;
   ctx.fillStyle='#fff';ctx.strokeStyle=ink;
   ctx.fillRect(stx-S*.012,sty-S*.030,S*.024,S*.030);
   ctx.strokeRect(stx-S*.012,sty-S*.030,S*.024,S*.030);
   // top cap with holes
   ctx.fillStyle='#a3a3a3';
   ctx.fillRect(stx-S*.014,sty-S*.038,S*.028,S*.008);ctx.strokeRect(stx-S*.014,sty-S*.038,S*.028,S*.008);
   ctx.fillStyle=ink;
   for(let i=0;i<4;i++){
     ctx.beginPath();ctx.arc(stx-S*.009+i*S*.006,sty-S*.034,S*.002,0,Math.PI*2);ctx.fill();
   }
   // "S" label
   ctx.fillStyle=tom;ctx.font=`900 italic ${S*.014}px 'Playfair Display',serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('S',stx,sty-S*.014);
 },
 canvasElements:[
   {kind:'text',text:'FROM THE KITCHEN',x:0.481,y:0.947,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3f2a1a',letterSpacing:'8px'}},
   {kind:'text',text:'A Little Something',x:0.495,y:0.079,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#7c2d12'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// 📸 30-PHOTO LAYOUTS — milestone collages (birthday, anniversary, recap)
// ═══════════════════════════════════════════════════════════════

// 30-photo polaroid wall — 6 rows × 5 cols of rotated polaroids on cream paper.
// Generic "any-occasion" wall for trips, friend groups, year-in-review.
{id:'polaroid_stack_30',name:'Polaroid Wall',cat:'any',badge:'new',n:30,
 photoFrames:(()=>{
   const arr=[];
   const rotations=[-7,4,-3,6,-5,2,-8,5,-2,7,-4,3,-6,5,-3,4,-5,2,-7,6,-4,3,-2,5,-6,4,-3,2,-5,7];
   for(let r=0;r<6;r++)for(let c=0;c<5;c++){
     const i=r*5+c;
     arr.push({rx:.018+c*.196, ry:.025+r*.16, rw:.17, rh:.13, angle:rotations[i]});
   }
   return arr;
 })(),
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf6ed','#f6e6d2',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,33);
   drawSparkle(ctx,W*.04,H*.96,S*.02,'#d4a574');
   drawSparkle(ctx,W*.96,H*.04,S*.02,'#d4a574');
   drawSparkle(ctx,W*.96,H*.96,S*.018,'#d4a574');
 },
 canvasElements:[]
},

// 12-photo year-in-review scrapbook — 4×3 polaroid grid on cream paper.
// Built for "12 photo collage" intent — works for year-in-review, family yearbook, baby's
// first year, friend group recap, Christmas card. Script "12 MONTHS" headline.
{id:'occ_year_12',name:'12 Months',cat:'family',badge:'new',n:12,
 photoFrames:(()=>{
   const arr=[];
   const rotations=[-3,2,-2,3,-1,4,-3,2,-2,5,-3,2];
   for(let r=0;r<4;r++)for(let c=0;c<3;c++){
     const i=r*3+c;
     arr.push({rx:.054+c*.306, ry:.155+r*.185, rw:.27, rh:.155, angle:rotations[i]});
   }
   return arr;
 })(),
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fdf6ed','#f0e8d2',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,33);
   // Sage cloud doodles
   drawCloud(ctx,W*.08,H*.05,S*.045,'rgba(255,255,255,.92)');
   drawCloud(ctx,W*.92,H*.93,S*.05,'rgba(255,255,255,.9)');
   drawCloud(ctx,W*.50,H*.96,S*.04,'rgba(255,255,255,.88)');
   // Sparkles
   drawSparkle(ctx,W*.92,H*.06,S*.018,'#7a9b6a');
   drawSparkle(ctx,W*.06,H*.94,S*.016,'#7a9b6a');
   drawSparkle(ctx,W*.50,H*.04,S*.014,'#7a9b6a');
   // Washi tape behind the headline
   drawWashiTape(ctx,W*.50,H*.06,S*.12,S*.022,Math.PI*.03,'#a8c89c');
 },
 canvasElements:[
   {kind:'text',text:'12 Months',x:0.50,y:0.075,align:'center',style:{fontSize:'40px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#2f5a3a'}},
   {kind:'text',text:'OF MEMORIES',x:0.50,y:0.97,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a4a30',letterSpacing:'5px'}},
 ]},

// 30-photo birthday scrapbook — 5×6 polaroid grid + script "30" headline + cloud doodles.
// Built specifically for "30th birthday photo collage" intent (high-volume keyword).
{id:'occ_bday_30',name:'30 Years',cat:'birthday',badge:'new',n:30,
 photoFrames:(()=>{
   const arr=[];
   const rotations=[-3,2,-1,3,-2,4,-2,5,-3,1,-4,2,-1,4,-3,2,-5,3,-2,1,-4,3,-1,5,-3,2,-1,4,-2,3];
   for(let r=0;r<5;r++)for(let c=0;c<6;c++){
     const i=r*6+c;
     arr.push({rx:.018+c*.1666, ry:.16+r*.155, rw:.13, rh:.12, angle:rotations[i]});
   }
   return arr;
 })(),
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cream paper bg
   drawGrainGradient(ctx,W,H,'#fdf6ed','#f6e6d2',180,.05,17);
   drawFilmGrain(ctx,W,H,.04,33);
   // Cloud doodles in margins
   drawCloud(ctx,W*.05,H*.50,S*.05,'rgba(255,255,255,.9)');
   drawCloud(ctx,W*.95,H*.30,S*.04,'rgba(255,255,255,.85)');
   drawCloud(ctx,W*.50,H*.96,S*.045,'rgba(255,255,255,.92)');
   // Sparkles
   drawSparkle(ctx,W*.10,H*.04,S*.018,'#d4a574');
   drawSparkle(ctx,W*.92,H*.97,S*.018,'#d4a574');
   drawSparkle(ctx,W*.05,H*.92,S*.014,'#d4a574');
   // Washi tape behind the "30" headline
   drawWashiTape(ctx,W*.50,H*.06,S*.10,S*.022,Math.PI*.04,'#e8a87c');
 },
 canvasElements:[
   {kind:'text',text:'30',x:0.50,y:0.07,align:'center',style:{fontSize:'56px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',fontStyle:'italic',color:'#c45a2c'}},
   {kind:'text',text:'YEARS / OF MEMORIES',x:0.50,y:0.97,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#3a2618',letterSpacing:'5px'}},
 ]},

// Mis Quince Baroque — single oval portrait in an ornate gold filigree frame crowned by a jeweled tiara, on a deep rose-velvet backdrop
{id:'occ_bday_quince_baroque', name:'Mis Quince', cat:'birthday', badge:'new', n:1,
 photoFrames:[
   {rx:.24, ry:.18, rw:.52, rh:.60, angle:0, shape:'ellipse'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const rng=seededRng(41);

   // 1. backdrop — deep rose radial to wine edges
   const bgGrad=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,H*.75);
   bgGrad.addColorStop(0,'#5a1836'); bgGrad.addColorStop(1,'#3a0f24');
   ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);

   // 2. atmosphere — champagne bokeh + velvet grain
   drawBokeh(ctx,W,H,20,'#d4a94a',7);
   drawFilmGrain(ctx,W,H,.05,11);

   // 3. faint script watermark behind everything
   drawScriptWatermark(ctx,'Quinceañera',W*.5,H*.5,S*.28,'rgba(212,169,74,.08)');

   // frame geometry
   const fx=W*.24, fy=H*.18, fw=W*.52, fh=H*.60;
   const cx=fx+fw/2, cy=fy+fh/2, rx=fw/2, ry=fh/2;

   // 4. ornate oval frame — outer thick gold ring
   ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
   ctx.strokeStyle='#d4a94a'; ctx.lineWidth=Math.max(2,S*.012); ctx.stroke();

   // inner thin ivory ring, offset inward
   const inset=S*.010;
   ctx.beginPath(); ctx.ellipse(cx,cy,rx-inset,ry-inset,0,0,Math.PI*2);
   ctx.strokeStyle='#f8f1e4'; ctx.lineWidth=Math.max(.5,S*.002); ctx.stroke();

   // pearl-dot garland along outer ring
   const pearlN=40;
   for(let i=0;i<pearlN;i++){
     const a=(i/pearlN)*Math.PI*2;
     const px=cx+Math.cos(a)*(rx+S*.006);
     const py=cy+Math.sin(a)*(ry+S*.006);
     ctx.beginPath(); ctx.arc(px,py,S*.005,0,Math.PI*2);
     ctx.fillStyle='#f8f1e4'; ctx.fill();
   }

   // 5. corner filigree at bounding-rect corners
   drawGoldLeafCorner(ctx,fx,fy,S*.10,1,1,'#d4a94a');
   drawGoldLeafCorner(ctx,fx+fw,fy,S*.10,-1,1,'#d4a94a');
   drawGoldLeafCorner(ctx,fx,fy+fh,S*.10,1,-1,'#d4a94a');
   drawGoldLeafCorner(ctx,fx+fw,fy+fh,S*.10,-1,-1,'#d4a94a');

   // 6. tiara at top-center of frame
   const tCx=cx, tCy=fy;
   ctx.save();
   ctx.strokeStyle='#d4a94a'; ctx.lineWidth=Math.max(1.5,S*.006); ctx.lineCap='round';
   // base band connecting peaks
   ctx.beginPath();
   ctx.moveTo(tCx-S*.11,tCy);
   ctx.quadraticCurveTo(tCx,tCy+S*.012,tCx+S*.11,tCy);
   ctx.stroke();
   // three peaks: left, center (tallest), right — curved arcs
   const peaks=[[-S*.08,S*.05],[0,S*.09],[S*.08,S*.05]];
   peaks.forEach(([dx,h])=>{
     const px=tCx+dx, py=tCy-h;
     ctx.beginPath();
     ctx.moveTo(px-S*.02,tCy);
     ctx.quadraticCurveTo(px,py,px+S*.02,tCy);
     ctx.stroke();
     // gem at peak tip
     ctx.beginPath(); ctx.arc(px,py,S*.008,0,Math.PI*2);
     ctx.fillStyle='#f8f1e4'; ctx.fill();
     ctx.strokeStyle='#d4a94a'; ctx.lineWidth=Math.max(1,S*.003); ctx.stroke();
   });
   // center diamond gem above tallest peak
   const dCx=tCx, dCy=tCy-S*.09-S*.02;
   ctx.beginPath();
   ctx.moveTo(dCx,dCy-S*.02);
   ctx.lineTo(dCx+S*.013,dCy);
   ctx.lineTo(dCx,dCy+S*.02);
   ctx.lineTo(dCx-S*.013,dCy);
   ctx.closePath();
   ctx.fillStyle='#f8f1e4'; ctx.fill();
   ctx.strokeStyle='#d4a94a'; ctx.lineWidth=Math.max(1,S*.003); ctx.stroke();
   // sparkle dots either side of diamond
   drawSparkle(ctx,dCx-S*.03,dCy+S*.01,S*.010,'#f8f1e4');
   drawSparkle(ctx,dCx+S*.03,dCy+S*.01,S*.010,'#f8f1e4');
   ctx.restore();

   // 7. rose sprays lower corners
   drawRose(ctx,W*.10,H*.82,S*.09,-20,'#a02248');
   drawBotanicalSpray(ctx,W*.10,H*.82,S*.11,-30,'#7a4b3a');
   drawRose(ctx,W*.90,H*.82,S*.09,20,'#a02248');
   drawBotanicalSpray(ctx,W*.90,H*.82,S*.11,210,'#7a4b3a');

   // 8. subtle outer ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(212,169,74,.35)',S*.03);

   // seeded sparkle dust for extra shimmer
   for(let i=0;i<14;i++){
     drawSparkle(ctx,rng()*W,rng()*H*.15,S*.008+rng()*S*.006,'rgba(212,169,74,.5)');
   }
 },
 canvasElements:[
   {kind:'text', text:'CELEBRATING',      x:0.5, y:0.86, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif",
           fontWeight:'700', color:'#d4a94a', letterSpacing:'8px', textTransform:'uppercase'}},
   {kind:'text', text:'Mis Quince Años',  x:0.5, y:0.891, align:'center',
    style:{fontSize:'32px', fontFamily:"'Playfair Display','Fraunces',serif",
           fontWeight:'700', fontStyle:'italic', color:'#f8f1e4', letterSpacing:'2px'}},
 ]},

// Cake Tier Stack — the 3 photos ARE the tiers of a stacked birthday cake, separated by piped frosting drips and topped with lit candles
{id:'occ_bday_cake_tiers', name:'Cake Tier Stack', cat:'birthday', badge:'new', n:3,
 photoFrames:[
   {rx:.30, ry:.28, rw:.40, rh:.14, angle:0}, // top tier (smallest)
   {rx:.22, ry:.47, rw:.56, rh:.15, angle:0}, // middle tier
   {rx:.14, ry:.66, rw:.72, rh:.16, angle:0}, // bottom tier (widest)
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const rng=seededRng(19);

   // 1. warm cream backdrop
   drawGrainGradient(ctx,W,H,'#fbf3e4','#f4e2c9',90,.05,3);

   // 2. sprinkle field
   const sprinkleCols=['#f4c1c4','#b8e0d2','#f7d67a','#e2a5c1'];
   for(let i=0;i<80;i++){
     const x=rng()*W, y=rng()*H, ang=rng()*Math.PI*2;
     ctx.save();
     ctx.translate(x,y); ctx.rotate(ang);
     ctx.fillStyle=sprinkleCols[Math.floor(rng()*sprinkleCols.length)];
     ctx.fillRect(-S*.0008,-S*.003,S*.0016,S*.006);
     ctx.restore();
   }

   // 3. tier frosting bands (drawn ABOVE each photo band)
   const tiers=[
     {x:.30,y:.28,w:.40, col:'#f4c1c4'},
     {x:.22,y:.47,w:.56, col:'#fff0ef'},
     {x:.14,y:.66,w:.72, col:'#b8e0d2'},
   ];
   tiers.forEach(t=>{
     const tx=W*t.x, ty=H*t.y, tw=W*t.w, th=S*.03;
     // frosting base rect just above the tier band
     ctx.fillStyle=t.col;
     ctx.fillRect(tx,ty-th,tw,th);
     // scalloped top edge
     const bumps=Math.max(6,Math.round(tw/(S*.045)));
     const bw=tw/bumps;
     ctx.beginPath();
     ctx.moveTo(tx,ty-th);
     for(let i=0;i<bumps;i++){
       const cx=tx+bw*(i+.5);
       ctx.arc(cx,ty-th,bw*.5,Math.PI,0,false);
     }
     ctx.lineTo(tx+tw,ty-th);
     ctx.closePath();
     ctx.fillStyle=t.col;
     ctx.fill();
     // drip strokes hanging into photo area
     const drips=6+Math.floor(rng()*2);
     for(let i=0;i<drips;i++){
       const dx=tx+tw*(.08+.84*(i/(drips-1)))+ (rng()-.5)*S*.01;
       const dh=S*.012+rng()*S*.014;
       ctx.beginPath();
       ctx.moveTo(dx-S*.008,ty);
       ctx.quadraticCurveTo(dx,ty+dh, dx, ty+dh);
       ctx.quadraticCurveTo(dx,ty+dh, dx+S*.008,ty);
       ctx.closePath();
       ctx.fillStyle=t.col;
       ctx.fill();
     }
     // pearl dragees along seam
     const pearls=6+Math.floor(rng()*3);
     for(let i=0;i<pearls;i++){
       const px=tx+tw*(.06+.88*(i/(pearls-1)));
       ctx.beginPath();
       ctx.arc(px,ty-th*.4,S*.004,0,Math.PI*2);
       ctx.fillStyle='#d4a94a';
       ctx.fill();
     }
   });

   // 4. cake plate + pedestal below bottom tier
   const plateY=H*.84;
   ctx.save();
   ctx.fillStyle='#e8ddc4';
   ctx.beginPath();
   ctx.ellipse(W*.5,plateY,W*.30,S*.02,0,0,Math.PI*2);
   ctx.fill();
   // pedestal
   ctx.fillStyle='#e8ddc4';
   ctx.fillRect(W*.47,H*.82,W*.06,H*.02);
   // wider base
   ctx.beginPath();
   ctx.ellipse(W*.5,H*.845+S*.01,W*.10,S*.012,0,0,Math.PI*2);
   ctx.fill();
   ctx.restore();
   drawStar(ctx,W*.5,plateY,S*.02,'#d4a94a',.6);

   // 5. candles on top tier
   const candleY=H*.28;
   const candleCols=['#f4c1c4','#b8e0d2','#f7d67a'];
   const candleCount=5;
   for(let i=0;i<candleCount;i++){
     const cx=W*.30+W*.40*((i+.5)/candleCount);
     const cw=S*.008, ch=S*.06;
     ctx.fillStyle=candleCols[i%candleCols.length];
     ctx.fillRect(cx-cw/2,candleY-ch,cw,ch);
     // flame glow
     const g=ctx.createRadialGradient(cx,candleY-ch-S*.012,0,cx,candleY-ch-S*.012,S*.02);
     g.addColorStop(0,'rgba(255,211,81,.55)');
     g.addColorStop(1,'rgba(255,211,81,0)');
     ctx.fillStyle=g;
     ctx.beginPath(); ctx.arc(cx,candleY-ch-S*.012,S*.02,0,Math.PI*2); ctx.fill();
     // flame teardrop
     ctx.fillStyle='#ffd351';
     ctx.beginPath();
     ctx.ellipse(cx,candleY-ch-S*.012,S*.006,S*.010,0,0,Math.PI*2);
     ctx.fill();
     ctx.fillStyle='#ff8a3d';
     ctx.beginPath();
     ctx.ellipse(cx,candleY-ch-S*.008,S*.003,S*.005,0,0,Math.PI*2);
     ctx.fill();
   }

   // 6. balloon accents in upper corners
   drawBalloon(ctx,W*.08,H*.10,S*.05,'#f4c1c4',true);
   drawBalloon(ctx,W*.90,H*.09,S*.05,'#b8e0d2',true);

   // 7. confetti ribbon at very top
   drawConfettiRibbon(ctx,H*.02,W,S*.03,17,['#f4c1c4','#b8e0d2','#f7d67a','#d4a94a']);
 },
 canvasElements:[
   {kind:'text', text:'MAKE A WISH',       x:.5, y:.90, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif",
           fontWeight:'700', color:'#6b3a1e', letterSpacing:'6px', textTransform:'uppercase'}},
   {kind:'text', text:'Happy Birthday',    x:.5, y:0.927, align:'center',
    style:{fontSize:'28px', fontFamily:"'Playfair Display','Fraunces',serif",
           fontWeight:'700', fontStyle:'italic', color:'#b04a6a'}},
 ]},

// Giant Number Milestone — an enormous outlined display-serif "40" fills the canvas center, laurel wreath below, four tilted photos framed in the corners
{id:'occ_bday_giant_num', name:'Milestone Number', cat:'birthday', badge:'new', n:4,
 photoFrames:[
   {rx:.04, ry:.06, rw:.26, rh:.32, angle:-3},
   {rx:.70, ry:.06, rw:.26, rh:.32, angle: 3},
   {rx:.04, ry:.62, rw:.26, rh:.32, angle: 2},
   {rx:.70, ry:.62, rw:.26, rh:.32, angle:-2},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // warm cream/oat gradient backdrop
   drawGrainGradient(ctx,W,H,'#f4ede0','#eadfc9',80,.06,5);
   // soft terracotta halftone wash across bottom half
   drawHalftoneDots(ctx,0,H*.5,W,H*.5,.6,'rgba(176,74,42,.14)','down');
   // laurel wreath behind lower text
   drawLaurel(ctx,W*.5,H*.82,S*.28,'#7e8a6a');
   // giant outlined numeral "40" center canvas
   ctx.save();
   ctx.font = `900 ${S*.72}px 'Playfair Display', 'Fraunces', serif`;
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ctx.lineWidth = S*.022;
   ctx.strokeStyle = '#c99a3f';
   ctx.strokeText('40', W*.5, H*.5);
   ctx.lineWidth = S*.006;
   ctx.strokeStyle = '#b04a2a';
   ctx.strokeText('40', W*.5, H*.5);
   ctx.fillStyle = 'rgba(201,154,63,.10)';
   ctx.fillText('40', W*.5, H*.5);
   ctx.restore();
   // sparkles inside the numeral counters (hand-picked points inside "4" and "0" holes)
   const innerPts = [
     [W*.395,H*.44],[W*.41,H*.52],[W*.38,H*.48],
     [W*.60,H*.50],[W*.615,H*.44],[W*.585,H*.56],
     [W*.42,H*.40],[W*.63,H*.58],[W*.40,H*.58],[W*.62,H*.40],
   ];
   innerPts.forEach(([x,y])=>drawSparkle(ctx,x,y,S*.014,'#c99a3f'));
   // confetti stars scattered around numeral, avoiding photo corners
   const rng = seededRng(40);
   let placed = 0, tries = 0;
   while(placed < 12 && tries < 200){
     tries++;
     const x = W*(.30 + rng()*.40);
     const y = H*(.06 + rng()*.86);
     // keep clear of the four photo-frame zones
     const inLeft = x < W*.32;
     const inRight = x > W*.68;
     const inTopBand = y < H*.40;
     const inBotBand = y > H*.60;
     if((inLeft||inRight) && (inTopBand||inBotBand)) continue;
     drawStar(ctx, x, y, S*.012, '#b04a2a', .7);
     placed++;
   }
   // corner ticks tying photos to the number
   const cornerPts = [
     [W*.31,H*.20],[W*.69,H*.20],
     [W*.31,H*.78],[W*.69,H*.78],
   ];
   cornerPts.forEach(([x,y])=>drawSparkle(ctx,x,y,S*.010,'#c99a3f'));
 },
 canvasElements:[
   {kind:'text', text:'MILESTONE MOMENT',    x:.5, y:.03, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif",
           fontWeight:'700', color:'#6b3a1e', letterSpacing:'8px', textTransform:'uppercase'}},
   {kind:'text', text:'Fabulous at Forty',  x:0.491, y:0.061, align:'center',
    style:{fontSize:'24px', fontFamily:"'Playfair Display','Fraunces',serif",
           fontWeight:'700', fontStyle:'italic', color:'#1a1815'}},
 ]},

// Vaudeville marquee stage: chunky "BDAY" letters outlined in glowing warm-white bulbs on a deep velvet backdrop, with staggered polaroid-style snapshots lined up below like backstage photos.
{id:'occ_bday_marquee', name:'Marquee Lights', cat:'birthday', badge:'new', n:5,
 photoFrames:[
   {rx:.03, ry:.55, rw:.185, rh:.30, angle:-4},
   {rx:.222, ry:.60, rw:.185, rh:.30, angle: 3},
   {rx:.408, ry:.55, rw:.185, rh:.30, angle:-2},
   {rx:.594, ry:.60, rw:.185, rh:.30, angle: 4},
   {rx:.780, ry:.55, rw:.185, rh:.30, angle:-3},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const rng=seededRng(41);

   // 1. velvet backdrop
   const bgG=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,H*.9);
   bgG.addColorStop(0,'#1d1128'); bgG.addColorStop(1,'#0a0710');
   ctx.fillStyle=bgG; ctx.fillRect(0,0,W,H);

   // 2. curtain-drape stripes
   ctx.save();
   for(let i=0;i<20;i++){
     const x=(i/20)*W;
     ctx.fillStyle='rgba(0,0,0,.04)';
     ctx.fillRect(x, 0, W/40, H);
   }
   ctx.restore();

   // 3. warm bokeh, upper half
   drawBokeh(ctx, W, H*.6, 25, '#fff0c4', 9);

   // 4. faint pink accent glow, top-left
   {
     const pg=ctx.createRadialGradient(W*.12,H*.10,0,W*.12,H*.10,S*.5);
     const rgb=colToRGB('#ff4c8a');
     pg.addColorStop(0,`rgba(${rgb},.12)`); pg.addColorStop(1,`rgba(${rgb},0)`);
     ctx.fillStyle=pg; ctx.fillRect(0,0,W,H);
   }

   // helper: draw a warm bulb with halo
   function bulb(x,y,r){
     const halo=ctx.createRadialGradient(x,y,0,x,y,r*2.5);
     halo.addColorStop(0,'rgba(255,240,196,.6)');
     halo.addColorStop(1,'rgba(255,240,196,0)');
     ctx.fillStyle=halo;
     ctx.beginPath(); ctx.arc(x,y,r*2.5,0,Math.PI*2); ctx.fill();
     ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='#fff0c4'; ctx.fill();
     ctx.beginPath(); ctx.arc(x,y,r*.4,0,Math.PI*2); ctx.fillStyle='#ffffff'; ctx.fill();
   }

   // 5. marquee letters "BDAY" spelled across top ~45%
   const letters=['B','D','A','Y'];
   const letterW=W*.20;
   const startX=W*.5-(letters.length*letterW)/2;
   const topY=H*.08, letterH=H*.32;
   const fontSize=S*.30;

   ctx.textAlign='center'; ctx.textBaseline='middle';
   ctx.font=`900 ${fontSize}px 'Outfit', sans-serif`;

   letters.forEach((ch,i)=>{
     const cx=startX+letterW*(i+.5);
     const cy=topY+letterH*.5;
     // letter block
     ctx.lineJoin='round';
     ctx.lineWidth=S*.004;
     ctx.strokeStyle='#c99a3f';
     ctx.fillStyle='#1a0e22';
     ctx.fillText(ch,cx,cy);
     ctx.strokeText(ch,cx,cy);

     // bulb outline: trace an inflated rounded-rect silhouette around the letter's cell
     const bw=letterW*.62, bh=letterH*.86;
     const rx=cx-bw/2, ry=cy-bh/2;
     const rr=S*.02;
     const perim=2*bw+2*bh;
     const nBulbs=28;
     for(let b=0;b<nBulbs;b++){
       const t=(b/nBulbs)*perim;
       let bx,by;
       if(t<bw){ bx=rx+t; by=ry; }
       else if(t<bw+bh){ bx=rx+bw; by=ry+(t-bw); }
       else if(t<bw*2+bh){ bx=rx+bw-(t-bw-bh); by=ry+bh; }
       else { bx=rx; by=ry+bh-(t-bw*2-bh); }
       bulb(bx,by,S*.008);
     }
   });

   // 6. ground bulb strip
   const gy=H*.50;
   const nGround=30;
   for(let g=0;g<nGround;g++){
     bulb((g+.5)/nGround*W, gy, S*.007);
   }

   // 7. star accents, seeded upper-canvas
   for(let s=0;s<6;s++){
     const sx=W*.08+rng()*W*.84;
     const sy=H*.05+rng()*H*.30;
     drawStar(ctx, sx, sy, S*.014, '#fff0c4', .8);
   }
 },
 canvasElements:[
   {kind:'text', text:'TONIGHT ONLY',   x:0.5, y:0.93, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif", fontWeight:'700',
           color:'#fff0c4', letterSpacing:'8px', textTransform:'uppercase'}},
   {kind:'text', text:'Happy Birthday', x:0.5, y:0.955, align:'center',
    style:{fontSize:'26px', fontFamily:"'Playfair Display','Fraunces',serif", fontWeight:'700',
           fontStyle:'italic', color:'#ffffff', letterSpacing:'3px'}},
 ]},

// Six round photo-balloons float upward on curly strings from a corner ribbon knot, against a sunny sky with clouds and confetti.
{id:'occ_bday_balloons', name:'Balloon Bouquet', cat:'birthday', badge:'new', n:6,
 photoFrames:[
   { rx:.06, ry:.06, rw:.22, rh:.22, angle:0, shape:'circle' },
   { rx:.36, ry:.02, rw:.24, rh:.24, angle:0, shape:'circle' },
   { rx:.66, ry:.08, rw:.22, rh:.22, angle:0, shape:'circle' },
   { rx:.18, ry:.30, rw:.22, rh:.22, angle:0, shape:'circle' },
   { rx:.46, ry:.32, rw:.22, rh:.22, angle:0, shape:'circle' },
   { rx:.70, ry:.36, rw:.22, rh:.22, angle:0, shape:'circle' },
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const rng=seededRng(624);
   const palette=['#ff6f8f','#ffd351','#96e0c0'];

   // 1. sky gradient
   const sky=ctx.createLinearGradient(0,0,0,H);
   sky.addColorStop(0,'#eaf6fc'); sky.addColorStop(1,'#cfe8f5');
   ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

   // 2. clouds
   drawCloud(ctx,W*.12,H*.18,S*.09,'#ffffff');
   drawCloud(ctx,W*.82,H*.24,S*.08,'#ffffff');
   drawCloud(ctx,W*.55,H*.66,S*.07,'#f8fcff');

   // 3. confetti dots
   for(let i=0;i<60;i++){
     const c=palette[Math.floor(rng()*palette.length)];
     ctx.globalAlpha=.5;
     ctx.beginPath();
     ctx.arc(rng()*W, rng()*H, S*.003+rng()*S*.004, 0, Math.PI*2);
     ctx.fillStyle=c; ctx.fill();
     ctx.globalAlpha=1;
   }

   // 4. streamer arches, top corners
   const drawStreamer=(x0,y0,col)=>{
     ctx.beginPath();
     ctx.moveTo(x0,y0);
     ctx.bezierCurveTo(x0+S*.12,y0+S*.10, x0+S*.02,y0+S*.28, x0+S*.16,y0+S*.34);
     ctx.strokeStyle=col; ctx.lineWidth=S*.006; ctx.lineCap='round'; ctx.stroke();
     for(let t=0.15;t<1;t+=0.22){
       const px=x0+(x0+S*.16-x0)*t, py=y0+(y0+S*.34-y0)*t;
       ctx.fillStyle=col;
       ctx.fillRect(px-S*.006,py,S*.012,S*.02);
     }
   };
   drawStreamer(W*.02,H*.02,'#ff6f8f');
   drawStreamer(W*.98-S*.16,H*.02,'#ffd351');

   // 5. balloon knots + strings toward a bottom-right knot origin
   const K={x:W*.85,y:H*.96};
   const frames=[
     {cx:W*(.06+.11),cy:H*(.06+.11)},
     {cx:W*(.36+.12),cy:H*(.02+.12)},
     {cx:W*(.66+.11),cy:H*(.08+.11)},
     {cx:W*(.18+.11),cy:H*(.30+.11)},
     {cx:W*(.46+.11),cy:H*(.32+.11)},
     {cx:W*(.70+.11),cy:H*(.36+.11)},
   ];
   frames.forEach((f,i)=>{
     const col=palette[i%palette.length];
     const r=S*.11;
     const bx=f.cx, by=f.cy+r; // bottom of circle

     // rim gloss highlight (behind photo layer, subtle bloom)
     const glossRad=ctx.createRadialGradient(f.cx-r*.4,f.cy-r*.4,0,f.cx-r*.4,f.cy-r*.4,r*.6);
     const rgb=colToRGB(col);
     glossRad.addColorStop(0,`rgba(255,255,255,.35)`);
     glossRad.addColorStop(1,`rgba(${rgb},0)`);
     ctx.fillStyle=glossRad;
     ctx.beginPath(); ctx.arc(f.cx,f.cy,r*1.05,0,Math.PI*2); ctx.fill();

     // curly string down to knot origin
     const wob1x=bx+(rng()-.5)*S*.12, wob1y=by+(K.y-by)*.35;
     const wob2x=K.x+(rng()-.5)*S*.10, wob2y=by+(K.y-by)*.7;
     ctx.beginPath();
     ctx.moveTo(bx,by);
     ctx.bezierCurveTo(wob1x,wob1y, wob2x,wob2y, K.x,K.y);
     ctx.strokeStyle='rgba(60,60,80,.55)';
     ctx.lineWidth=S*.0025;
     ctx.stroke();

     // small knot triangle at balloon base
     ctx.beginPath();
     ctx.moveTo(bx-S*.007,by);
     ctx.lineTo(bx+S*.007,by);
     ctx.lineTo(bx,by+S*.014);
     ctx.closePath();
     ctx.fillStyle=col; ctx.fill();
   });

   // 6. ribbon bow at knot origin
   const bowCol='#ff6f8f';
   ctx.save();
   ctx.translate(K.x,K.y);
   [ -1, 1 ].forEach(dir=>{
     ctx.beginPath();
     ctx.moveTo(0,0);
     ctx.quadraticCurveTo(dir*S*.05,-S*.03, dir*S*.09,0);
     ctx.quadraticCurveTo(dir*S*.05,S*.03, 0,0);
     ctx.closePath();
     ctx.fillStyle=bowCol; ctx.fill();
     ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=S*.002; ctx.stroke();
   });
   ctx.beginPath();
   ctx.arc(0,0,S*.012,0,Math.PI*2);
   ctx.fillStyle=bowCol; ctx.fill();
   // tails
   ctx.beginPath();
   ctx.moveTo(-S*.01,S*.01); ctx.lineTo(-S*.03,S*.09); ctx.lineTo(-S*.005,S*.07); ctx.closePath();
   ctx.fillStyle=bowCol; ctx.fill();
   ctx.beginPath();
   ctx.moveTo(S*.01,S*.01); ctx.lineTo(S*.03,S*.09); ctx.lineTo(S*.005,S*.07); ctx.closePath();
   ctx.fillStyle=bowCol; ctx.fill();
   ctx.restore();

   // 7. grass-line hint
   ctx.globalAlpha=.15;
   ctx.fillStyle='#96e0c0';
   ctx.fillRect(0,H*.94,W,H*.04);
   ctx.globalAlpha=1;
 },
 canvasElements:[
   {kind:'text', text:'HIP HIP HOORAY',     x:0.5, y:0.904, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif",
           fontWeight:'700', color:'#3a6d8a', letterSpacing:'7px', textTransform:'uppercase'}},
   {kind:'text', text:'Happy Birthday',     x:.5, y:.935, align:'center',
    style:{fontSize:'28px', fontFamily:"'Playfair Display','Fraunces',serif",
           fontWeight:'700', fontStyle:'italic', color:'#ff6f8f'}},
 ]},

// Piñata Burst: a cracked star-piñata at top-center explodes outward, spraying candy, streamers, and confetti while 7 photos radiate across the canvas.
{id:'occ_bday_pinata', name:'Piñata Burst', cat:'birthday', badge:'new', n:7,
 photoFrames:[
   { rx:.36, ry:.06, rw:.28, rh:.24, angle: 0 },   // top-center HERO
   { rx:.04, ry:.24, rw:.22, rh:.22, angle:-14 },  // upper-left
   { rx:.74, ry:.24, rw:.22, rh:.22, angle: 14 },  // upper-right
   { rx:.02, ry:.54, rw:.24, rh:.24, angle: -8 },  // mid-left
   { rx:.74, ry:.54, rw:.24, rh:.24, angle:  8 },  // mid-right
   { rx:.18, ry:.72, rw:.26, rh:.22, angle: -4 },  // bottom-left
   { rx:.56, ry:.72, rw:.26, rh:.22, angle:  4 },  // bottom-right
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const PAL=['#ff4c8a','#ffd351','#3fc8d1','#a4e04a','#b13aa8'];
   const rng=seededRng(823);

   // 1. Backdrop — peach to lavender vertical gradient
   const bgGrad=ctx.createLinearGradient(0,0,0,H);
   bgGrad.addColorStop(0,'#fff1e0'); bgGrad.addColorStop(1,'#f0e6ff');
   ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);

   const B={x:W*.5, y:H*.18};

   // 2. Sunburst rays behind everything
   drawSunburst(ctx, B.x, B.y, S*.05, S*.90, 24, 'rgba(255,211,81,.35)');

   // 3. Piñata body — layered star silhouette
   const drawStarPath=(cx,cy,rOuter,rInner,rot)=>{
     ctx.beginPath();
     for(let i=0;i<10;i++){
       const ang=rot+(Math.PI/5)*i - Math.PI/2;
       const r=(i%2===0)?rOuter:rInner;
       const px=cx+Math.cos(ang)*r, py=cy+Math.sin(ang)*r;
       if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
     }
     ctx.closePath();
   };
   // main body
   ctx.save();
   drawStarPath(B.x,B.y,S*.16,S*.075,0);
   ctx.fillStyle='#ff4c8a'; ctx.fill();
   ctx.restore();
   // concentric fringe-layer outlines
   const fringeCols=['#ffd351','#3fc8d1','#a4e04a','#b13aa8'];
   fringeCols.forEach((c,i)=>{
     const rO=S*.16 + S*.018*(i+1), rI=S*.075 + S*.012*(i+1);
     ctx.save();
     drawStarPath(B.x,B.y,rO,rI,0);
     ctx.strokeStyle=c; ctx.lineWidth=S*.008; ctx.stroke();
     ctx.restore();
   });
   // fringe rectangles sprinkled radially around the star edge
   for(let i=0;i<40;i++){
     const ang=(Math.PI*2/40)*i + rng()*.15;
     const rr=S*.20 + rng()*S*.03;
     const fx=B.x+Math.cos(ang)*rr, fy=B.y+Math.sin(ang)*rr;
     ctx.save();
     ctx.translate(fx,fy); ctx.rotate(ang+Math.PI/2);
     ctx.fillStyle=fringeCols[i%fringeCols.length];
     ctx.fillRect(-S*.003,0,S*.006,S*.020);
     ctx.restore();
   }
   // crack line — jagged polyline through the star
   ctx.save();
   ctx.beginPath();
   const cx1=B.x-S*.10, cy1=B.y-S*.10, cx2=B.x+S*.11, cy2=B.y+S*.11;
   ctx.moveTo(cx1,cy1);
   for(let t=1;t<=6;t++){
     const tt=t/6;
     const jx=cx1+(cx2-cx1)*tt + (rng()-.5)*S*.02;
     const jy=cy1+(cy2-cy1)*tt + (rng()-.5)*S*.02;
     ctx.lineTo(jx,jy);
   }
   ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=S*.014; ctx.lineJoin='round'; ctx.stroke();
   ctx.strokeStyle='#ffffff'; ctx.lineWidth=S*.010; ctx.stroke();
   ctx.restore();
   // bat/stick leaning in from upper-right
   ctx.save();
   ctx.translate(B.x+S*.24, B.y-S*.18);
   ctx.rotate(Math.PI*.62);
   ctx.fillStyle='#6b3a1e';
   ctx.fillRect(-S*.01, 0, S*.02, S*.28);
   ctx.fillStyle='#f4c1c4';
   ctx.fillRect(-S*.011, S*.20, S*.022, S*.05);
   ctx.restore();

   // 4. Candy shower — seeded burst of particles emanating from B
   for(let i=0;i<120;i++){
     const ang=rng()*Math.PI*2;
     const radiusFactor=Math.pow(rng(),1.6); // denser near piñata
     const rr=S*.05 + radiusFactor*S*.85;
     const px=B.x+Math.cos(ang)*rr, py=B.y+Math.sin(ang)*rr*.85 + rr*.15; // slight downward bias
     if(px<-S*.05||px>W+S*.05||py<-S*.05||py>H+S*.05) continue;
     const col=PAL[Math.floor(rng()*PAL.length)];
     const alpha=.7+rng()*.3;
     const kind=i%4;
     ctx.save();
     ctx.globalAlpha=alpha;
     ctx.fillStyle=col;
     if(kind===0){
       ctx.beginPath(); ctx.arc(px,py,S*.010,0,Math.PI*2); ctx.fill();
     } else if(kind===1){
       // hexagon
       ctx.beginPath();
       for(let k=0;k<6;k++){
         const a=(Math.PI/3)*k;
         const hx=px+Math.cos(a)*S*.010, hy=py+Math.sin(a)*S*.010;
         if(k===0) ctx.moveTo(hx,hy); else ctx.lineTo(hx,hy);
       }
       ctx.closePath(); ctx.fill();
     } else if(kind===2){
       drawStar(ctx,px,py,S*.009,col,alpha);
     } else {
       ctx.beginPath(); ctx.ellipse(px,py,S*.012,S*.006,rng()*Math.PI,0,Math.PI*2); ctx.fill();
     }
     ctx.restore();
   }

   // 5. Streamers — curly ribbons from B to canvas edges
   const streamerTargets=[
     {x:0,y:0},{x:W,y:0},{x:0,y:H*.5},{x:W,y:H*.5},{x:W*.2,y:H},{x:W*.8,y:H}
   ];
   streamerTargets.forEach((t,i)=>{
     const col=PAL[i%PAL.length];
     const midX=(B.x+t.x)/2 + (rng()-.5)*S*.15;
     const midY=(B.y+t.y)/2 + (rng()-.5)*S*.15;
     ctx.save();
     ctx.beginPath();
     ctx.moveTo(B.x,B.y);
     ctx.quadraticCurveTo(midX,midY,t.x,t.y);
     ctx.strokeStyle=col; ctx.lineWidth=S*.006; ctx.globalAlpha=.55; ctx.stroke();
     // tissue-fringe rectangles hanging from midpoint
     ctx.globalAlpha=.7;
     ctx.translate(midX,midY);
     ctx.fillStyle=col;
     for(let f=-1;f<=1;f++){
       ctx.fillRect(f*S*.012, 0, S*.006, S*.018);
     }
     ctx.restore();
   });

   // 6. Sparkle accents around burst
   for(let i=0;i<10;i++){
     const ang=rng()*Math.PI*2;
     const rr=S*.22+rng()*S*.5;
     const sx=B.x+Math.cos(ang)*rr, sy=B.y+Math.sin(ang)*rr*.7;
     drawSparkle(ctx,sx,sy,S*.018,'#ffd351');
   }

   // 7. Bottom banner confetti strip
   drawConfettiRibbon(ctx,H*.94,W,S*.04,23,['#ff4c8a','#ffd351','#3fc8d1','#a4e04a','#b13aa8']);
 },
 canvasElements:[
   {kind:'text', text:'BREAK IT OPEN',      x:0.131, y:0.032, align:'center',
    style:{fontSize:'11px', fontFamily:"'Outfit','Inter',sans-serif",
           fontWeight:'800', color:'#b13aa8', letterSpacing:'7px', textTransform:'uppercase'}},
   {kind:'text', text:'Party Time!',        x:0.517, y:0.949, align:'center',
    style:{fontSize:'30px', fontFamily:"'Playfair Display','Fraunces',serif",
           fontWeight:'800', fontStyle:'italic', color:'#ff4c8a'}},
 ]},

// ===============================================================
// FAMILY TREE TEMPLATES - 3 premium designs (botanical / heritage / monogram)
// Researched against 2026 Canva, Etsy, and Mixbook family-tree references.
// ===============================================================

// 7-photo botanical family tree - sage and cream with curved branch lines + leaf clusters
{id:'fam_tree_botanical',name:'Botanical Roots',cat:'family',badge:'new',n:7,
 photoFrames:[
   {rx:.35,ry:.13,rw:.30,rh:.20,angle:0},
   {rx:.13,ry:.42,rw:.24,rh:.19,angle:-3},
   {rx:.63,ry:.42,rw:.24,rh:.19,angle:3},
   {rx:.03,ry:.72,rw:.18,rh:.17,angle:-6},
   {rx:.26,ry:.70,rw:.18,rh:.18,angle:-2},
   {rx:.55,ry:.70,rw:.18,rh:.18,angle:2},
   {rx:.78,ry:.72,rw:.18,rh:.17,angle:6},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#F5F1E8','#ECE5D5',180,.04,17);
   drawFilmGrain(ctx,W,H,.03,21);
   const sage='#A8B5A0', leaf='#6B7F5C', gold='#C9A875';
   ctx.strokeStyle=sage;
   ctx.lineWidth=Math.max(1.2,S*.0028);
   ctx.lineCap='round';
   // root -> 2 parents
   ctx.beginPath();ctx.moveTo(W*.50,H*.34);ctx.quadraticCurveTo(W*.40,H*.38,W*.25,H*.42);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.50,H*.34);ctx.quadraticCurveTo(W*.60,H*.38,W*.75,H*.42);ctx.stroke();
   // left parent -> 2 children
   ctx.beginPath();ctx.moveTo(W*.25,H*.62);ctx.quadraticCurveTo(W*.16,H*.66,W*.12,H*.72);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.25,H*.62);ctx.quadraticCurveTo(W*.27,H*.66,W*.35,H*.70);ctx.stroke();
   // right parent -> 2 children
   ctx.beginPath();ctx.moveTo(W*.75,H*.62);ctx.quadraticCurveTo(W*.73,H*.66,W*.65,H*.70);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.75,H*.62);ctx.quadraticCurveTo(W*.84,H*.66,W*.88,H*.72);ctx.stroke();
   // leaf clusters at 3 junction points
   const drawLeafCluster=(cx,cy,size,col,base=0)=>{
     ctx.fillStyle=col;
     for(let i=-1;i<=1;i++){
       ctx.save();
       ctx.translate(cx,cy);
       ctx.rotate(base+i*Math.PI/5);
       ctx.beginPath();
       ctx.ellipse(0,-size*.6,size*.22,size*.55,0,0,Math.PI*2);
       ctx.fill();
       ctx.restore();
     }
     ctx.strokeStyle=col;
     ctx.lineWidth=Math.max(.6,S*.0008);
     ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy+size*.3);ctx.stroke();
   };
   drawLeafCluster(W*.50,H*.36,S*.028,leaf,0);
   drawLeafCluster(W*.25,H*.62,S*.024,leaf,-Math.PI*.08);
   drawLeafCluster(W*.75,H*.62,S*.024,leaf,Math.PI*.08);
   // gold accent dots at branch endpoints
   ctx.fillStyle=gold;
   [[.50,.34],[.25,.42],[.75,.42],[.12,.72],[.35,.70],[.65,.70],[.88,.72]].forEach(([x,y])=>{
     ctx.beginPath();ctx.arc(W*x,H*y,S*.0045,0,Math.PI*2);ctx.fill();
   });
   // small heart at root connector
   drawHeart(ctx,W*.50,H*.36,S*.014,'#A0673A');
 },
 canvasElements:[
   {kind:'text',text:'THE FAMILY',x:0.50,y:0.05,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'600',color:'#3E4E3A',letterSpacing:'8px'}},
   {kind:'text',text:'rooted in love',x:0.50,y:0.95,align:'center',style:{fontSize:'18px',fontFamily:"'Caveat','Dancing Script',cursive",fontWeight:'500',fontStyle:'italic',color:'#6B7F5C'}},
 ]},

// 9-photo heritage pedigree chart - sepia + gold with ornaments, ribbon banner, wax seal
{id:'fam_tree_heritage',name:'Heritage Pedigree',cat:'family',badge:'new',n:9,
 photoFrames:[
   {rx:.40,ry:.11,rw:.20,rh:.14,angle:0},
   {rx:.20,ry:.30,rw:.20,rh:.14,angle:0},
   {rx:.60,ry:.30,rw:.20,rh:.14,angle:0},
   {rx:.20,ry:.50,rw:.20,rh:.13,angle:0},
   {rx:.60,ry:.50,rw:.20,rh:.13,angle:0},
   {rx:.05,ry:.72,rw:.18,rh:.13,angle:0},
   {rx:.28,ry:.72,rw:.18,rh:.13,angle:0},
   {rx:.54,ry:.72,rw:.18,rh:.13,angle:0},
   {rx:.77,ry:.72,rw:.18,rh:.13,angle:0},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const ink='#3E2A1F', gold='#C9A875', sepia='#8B5E3C';
   drawGrainGradient(ctx,W,H,'#F2E8D5','#E8DCC0',180,.05,33);
   drawFilmGrain(ctx,W,H,.06,55);
   ctx.strokeStyle=gold;
   // double-rule dividers between tiers
   const drawDoubleRule=(y)=>{
     ctx.lineWidth=Math.max(1,S*.0014);
     ctx.beginPath();ctx.moveTo(W*.12,H*y);ctx.lineTo(W*.88,H*y);ctx.stroke();
     ctx.lineWidth=Math.max(.5,S*.0008);
     ctx.beginPath();ctx.moveTo(W*.12,H*(y+.012));ctx.lineTo(W*.88,H*(y+.012));ctx.stroke();
   };
   drawDoubleRule(.27);
   drawDoubleRule(.47);
   drawDoubleRule(.67);
   // connecting lines between tiers
   ctx.lineWidth=Math.max(.8,S*.0012);
   const connect=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.lineTo(W*x2,H*y2);ctx.stroke();};
   connect(.50,.25,.30,.30);
   connect(.50,.25,.70,.30);
   connect(.30,.44,.30,.50);
   connect(.70,.44,.70,.50);
   connect(.30,.63,.14,.72);
   connect(.30,.63,.37,.72);
   connect(.70,.63,.63,.72);
   connect(.70,.63,.86,.72);
   // corner ornaments (arc + dot motif at all 4 corners)
   const drawCorner=(cx,cy,scale,rotation)=>{
     ctx.save();
     ctx.translate(cx,cy);
     ctx.rotate(rotation);
     ctx.strokeStyle=gold;
     ctx.lineWidth=Math.max(.8,S*.0014);
     ctx.beginPath();
     ctx.arc(0,0,S*.025*scale,Math.PI*.5,Math.PI);
     ctx.stroke();
     ctx.beginPath();
     ctx.arc(S*.015*scale,S*.015*scale,S*.012*scale,Math.PI,Math.PI*1.5);
     ctx.stroke();
     ctx.fillStyle=gold;
     ctx.beginPath();
     ctx.arc(S*.025*scale,0,S*.0035*scale,0,Math.PI*2);
     ctx.fill();
     ctx.restore();
   };
   drawCorner(W*.06,H*.06,1.5,0);
   drawCorner(W*.94,H*.06,1.5,Math.PI*.5);
   drawCorner(W*.94,H*.94,1.5,Math.PI);
   drawCorner(W*.06,H*.94,1.5,Math.PI*1.5);
   // wax seal stamp bottom-right
   ctx.save();
   ctx.translate(W*.85,H*.92);
   ctx.fillStyle=sepia;
   ctx.beginPath();ctx.arc(0,0,S*.028,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=gold;
   ctx.lineWidth=Math.max(.7,S*.001);
   ctx.beginPath();ctx.arc(0,0,S*.024,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='#F2E8D5';
   ctx.font=`700 ${S*.018}px 'Playfair Display','Fraunces',serif`;
   ctx.textAlign='center';
   ctx.textBaseline='middle';
   ctx.fillText('FT',0,0);
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'THE HOUSE OF FAMILY',x:0.50,y:0.05,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',color:'#3E2A1F',letterSpacing:'6px'}},
   {kind:'text',text:'Anno Domini MMXXVI',x:0.50,y:0.93,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#8B5E3C',letterSpacing:'4px'}},
 ]},

// 6-photo monogram manor - ivory + navy + brass with giant background monogram letter
{id:'fam_tree_monogram',name:'Monogram Manor',cat:'family',badge:'new',n:6,
 photoFrames:[
   {rx:.05,ry:.20,rw:.35,rh:.30,angle:0},
   {rx:.60,ry:.20,rw:.35,rh:.30,angle:0},
   {rx:.04,ry:.60,rw:.22,rh:.28,angle:0},
   {rx:.28,ry:.60,rw:.22,rh:.28,angle:0},
   {rx:.52,ry:.60,rw:.22,rh:.28,angle:0},
   {rx:.76,ry:.60,rw:.22,rh:.28,angle:0},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const ivory='#F8F5EE', navy='#0F1F3D', brass='#C9A24B';
   ctx.fillStyle=ivory;
   ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.025,17);
   // giant background monogram letter at 8% opacity
   ctx.save();
   ctx.fillStyle=navy;
   ctx.globalAlpha=.08;
   ctx.font=`900 ${Math.min(W,H)*.55}px 'Cinzel','Playfair Display','Fraunces',serif`;
   ctx.textAlign='center';
   ctx.textBaseline='middle';
   ctx.fillText('B',W*.50,H*.52);
   ctx.restore();
   // thin gold hairline above footer
   ctx.strokeStyle=brass;
   ctx.lineWidth=Math.max(.6,S*.001);
   ctx.beginPath();ctx.moveTo(W*.35,H*.93);ctx.lineTo(W*.65,H*.93);ctx.stroke();
   // brass dots above surname (3 tiny dots)
   ctx.fillStyle=brass;
   [.46,.50,.54].forEach(x=>{
     ctx.beginPath();ctx.arc(W*x,H*.13,S*.004,0,Math.PI*2);ctx.fill();
   });
   // brass dots below footer
   [.48,.50,.52].forEach(x=>{
     ctx.beginPath();ctx.arc(W*x,H*.97,S*.003,0,Math.PI*2);ctx.fill();
   });
 },
 canvasElements:[
   {kind:'text',text:'B R O O K S',x:0.50,y:0.09,align:'center',style:{fontSize:'30px',fontFamily:"'Cinzel','Playfair Display','Fraunces',serif",fontWeight:'700',color:'#0F1F3D',letterSpacing:'10px'}},
   {kind:'text',text:'ESTABLISHED MCMLII',x:0.50,y:0.955,align:'center',style:{fontSize:'11px',fontFamily:"'Cinzel','Playfair Display',serif",fontWeight:'500',color:'#0F1F3D',letterSpacing:'5px'}},
 ]},

// ===============================================================
// WEDDING TEMPLATES - 5 structurally distinct layouts
// Each one uses a fundamentally different geometry per
// feedback_template_design_variety.md (no color/decoration variations
// on the same skeleton).
// ===============================================================

// W1: ARCH STACK - single vertical axis, 3 photos stacked top-to-bottom
// with arched ornaments crowning each photo
{id:'occ_wed_arch',name:'Arch Stack',cat:'wedding',badge:'new',n:3,
 photoFrames:[
   {rx:.22,ry:.10,rw:.56,rh:.26,angle:0},
   {rx:.25,ry:.42,rw:.50,rh:.22,angle:0},
   {rx:.28,ry:.70,rw:.44,rh:.18,angle:0},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const cream='#F4EFE6', ink='#2D2A26', gold='#A8896C', taupe='#C9B89A';
   drawGrainGradient(ctx,W,H,cream,'#EBE4D5',180,.04,17);
   drawFilmGrain(ctx,W,H,.025,21);
   // Arch ornaments above each photo (half-circle drawn as arc)
   ctx.strokeStyle=gold;
   ctx.lineWidth=Math.max(1.4,S*.0024);
   const drawArchCrown=(cx,cy,radius)=>{
     ctx.beginPath();
     ctx.arc(cx,cy,radius,Math.PI,Math.PI*2);
     ctx.stroke();
     // inner thin rule
     ctx.lineWidth=Math.max(.7,S*.0012);
     ctx.beginPath();
     ctx.arc(cx,cy,radius-S*.012,Math.PI,Math.PI*2);
     ctx.stroke();
     ctx.lineWidth=Math.max(1.4,S*.0024);
   };
   drawArchCrown(W*.50,H*.10,W*.28);
   drawArchCrown(W*.50,H*.42,W*.25);
   drawArchCrown(W*.50,H*.70,W*.22);
   // Olive sprig above top arch (3 small leaves)
   ctx.fillStyle=taupe;
   for(let i=-1;i<=1;i++){
     ctx.save();
     ctx.translate(W*.50,H*.05);
     ctx.rotate(i*Math.PI/6);
     ctx.beginPath();
     ctx.ellipse(0,-S*.014,S*.008,S*.018,0,0,Math.PI*2);
     ctx.fill();
     ctx.restore();
   }
   // Tiny star dingbats between sections
   ctx.fillStyle=gold;
   const drawStar=(cx,cy,r)=>{
     ctx.beginPath();
     for(let i=0;i<5;i++){
       const a=i*Math.PI*2/5-Math.PI/2;
       const x=cx+Math.cos(a)*r;
       const y=cy+Math.sin(a)*r;
       if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
       const a2=a+Math.PI/5;
       ctx.lineTo(cx+Math.cos(a2)*r*.4,cy+Math.sin(a2)*r*.4);
     }
     ctx.closePath();ctx.fill();
   };
   drawStar(W*.50,H*.385,S*.006);
   drawStar(W*.50,H*.665,S*.005);
 },
 canvasElements:[
   {kind:'text',text:'Maya & Daniel',x:0.506,y:0.906,align:'center',style:{fontSize:'38px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#2D2A26'}},
   {kind:'text',text:'TWELVE JUNE TWO THOUSAND TWENTY SIX',x:0.501,y:0.972,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#A8896C',letterSpacing:'5px'}},
 ]},

// W2: EDITORIAL FEATURE - asymmetric magazine spread, 1 hero + 3 sidebar
// Reads like a Vogue/Brides feature page
{id:'occ_wed_magazine',name:'Editorial Feature',cat:'wedding',badge:'new',n:4,
 photoFrames:[
   {rx:.04,ry:.18,rw:.50,rh:.72,angle:0},
   {rx:.60,ry:.18,rw:.36,rh:.22,angle:0},
   {rx:.60,ry:.43,rw:.36,rh:.22,angle:0},
   {rx:.60,ry:.68,rw:.36,rh:.22,angle:0},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const paper='#FFFFFF', ink='#0F0F0F', accent='#B91C1C', grey='#8A8A8A';
   ctx.fillStyle=paper;
   ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.012,11);
   // Top folio rule
   ctx.strokeStyle=ink;
   ctx.lineWidth=Math.max(.7,S*.001);
   ctx.beginPath();ctx.moveTo(W*.04,H*.08);ctx.lineTo(W*.96,H*.08);ctx.stroke();
   // Bottom rule
   ctx.beginPath();ctx.moveTo(W*.04,H*.94);ctx.lineTo(W*.96,H*.94);ctx.stroke();
   // Red accent square (folio dot)
   ctx.fillStyle=accent;
   ctx.fillRect(W*.04,H*.04,S*.022,S*.022);
 },
 canvasElements:[
   {kind:'text',text:'ISSUE 06 / SUMMER 2026',x:0.078,y:0.043,align:'left',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#0F0F0F',letterSpacing:'3px'}},
   {kind:'text',text:'page 12',x:0.96,y:0.058,align:'right',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',color:'#8A8A8A',letterSpacing:'2px'}},
   {kind:'text',text:'THE MORENOS',x:0.50,y:0.104,align:'center',style:{fontSize:'42px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'900',color:'#0F0F0F',letterSpacing:'2px'}},
   {kind:'text',text:'How a rainy Tuesday in Lisbon became forever.',x:0.803,y:0.962,align:'center',style:{fontSize:'12px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'400',fontStyle:'italic',color:'#8A8A8A'}},
   {kind:'text',text:'VOL. I - 06.12.2026',x:0.139,y:0.964,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#B91C1C',letterSpacing:'4px'}},
 ]},

// W3: WREATH PORTRAIT - single circular photo with drawn floral wreath
// The only radial composition in the wedding pack
{id:'occ_wed_wreath',name:'Wreath Portrait',cat:'wedding',badge:'new',n:1,
 photoFrames:[
   {rx:.275,ry:.235,rw:.45,rh:.45,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const ivory='#F0EDE3', sage='#5E6B4A', terracotta='#C97B63', champagne='#D4AF7A', ink='#3A3530';
   drawGrainGradient(ctx,W,H,ivory,'#E8E2D0',160,.04,17);
   drawFilmGrain(ctx,W,H,.025,33);
   // Wreath: draw leaves and small blossoms in a ring
   const cx=W*.50, cy=H*.46, ringR=S*.30;
   // Outer leaves (sage olive)
   const numLeaves=24;
   for(let i=0;i<numLeaves;i++){
     const angle=i*Math.PI*2/numLeaves+Math.PI*.5;
     // skip a gap at the top for headline
     if(angle>Math.PI*1.35 && angle<Math.PI*1.65)continue;
     const lx=cx+Math.cos(angle)*ringR;
     const ly=cy+Math.sin(angle)*ringR;
     ctx.save();
     ctx.translate(lx,ly);
     ctx.rotate(angle+Math.PI*.5);
     ctx.fillStyle=sage;
     // leaf pair
     ctx.beginPath();
     ctx.ellipse(-S*.012,0,S*.005,S*.018,0,0,Math.PI*2);
     ctx.fill();
     ctx.beginPath();
     ctx.ellipse(S*.012,0,S*.005,S*.018,0,0,Math.PI*2);
     ctx.fill();
     ctx.restore();
   }
   // Eucalyptus sprigs - 4 longer sprigs at cardinal-ish positions
   const sprigAngles=[Math.PI*.2,Math.PI*.8,Math.PI*1.2,Math.PI*1.8];
   sprigAngles.forEach(angle=>{
     const sx=cx+Math.cos(angle)*ringR;
     const sy=cy+Math.sin(angle)*ringR;
     ctx.save();
     ctx.translate(sx,sy);
     ctx.rotate(angle+Math.PI*.5);
     ctx.strokeStyle=sage;
     ctx.lineWidth=Math.max(.8,S*.0012);
     ctx.beginPath();
     ctx.moveTo(0,-S*.035);
     ctx.lineTo(0,S*.035);
     ctx.stroke();
     ctx.fillStyle=sage;
     for(let j=-2;j<=2;j++){
       ctx.save();
       ctx.translate(0,j*S*.014);
       ctx.rotate((j%2===0?1:-1)*Math.PI*.35);
       ctx.beginPath();
       ctx.ellipse(S*.006,0,S*.004,S*.010,0,0,Math.PI*2);
       ctx.fill();
       ctx.restore();
     }
     ctx.restore();
   });
   // Terracotta blossoms - 3 small clusters
   const blossomPos=[Math.PI*.15,Math.PI*.55,Math.PI*1.45];
   blossomPos.forEach(angle=>{
     const bx=cx+Math.cos(angle)*ringR;
     const by=cy+Math.sin(angle)*ringR;
     ctx.fillStyle=terracotta;
     for(let p=0;p<5;p++){
       const pa=p*Math.PI*2/5;
       ctx.beginPath();
       ctx.arc(bx+Math.cos(pa)*S*.008,by+Math.sin(pa)*S*.008,S*.005,0,Math.PI*2);
       ctx.fill();
     }
     ctx.fillStyle=champagne;
     ctx.beginPath();
     ctx.arc(bx,by,S*.004,0,Math.PI*2);
     ctx.fill();
   });
   // Inner gold ring just outside photo edge
   ctx.strokeStyle=champagne;
   ctx.lineWidth=Math.max(.8,S*.0014);
   ctx.beginPath();
   ctx.arc(cx,cy,ringR*.78,0,Math.PI*2);
   ctx.stroke();
 },
 canvasElements:[
   {kind:'text',text:'Maya & Daniel',x:0.504,y:0.047,align:'center',style:{fontSize:'36px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'500',fontStyle:'italic',color:'#3A3530'}},
   {kind:'text',text:'JOIN US - JUNE 12, 2026',x:0.504,y:0.86,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#5E6B4A',letterSpacing:'4px'}},
   {kind:'text',text:'villa rosa - amalfi',x:0.503,y:0.92,align:'center',style:{fontSize:'11px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'400',fontStyle:'italic',color:'#8B7A6E',letterSpacing:'3px'}},
 ]},

// W4: POLAROID FLATLAY - 7 rotated overlapping polaroids on linen background
// The only template using z-stack overlap + heavy rotation
{id:'occ_wed_flatlay',name:'Polaroid Flatlay',cat:'wedding',badge:'new',n:7,
 photoFrames:[
   {rx:.08,ry:.12,rw:.26,rh:.30,angle:-8},
   {rx:.30,ry:.08,rw:.24,rh:.28,angle:5},
   {rx:.52,ry:.14,rw:.26,rh:.30,angle:-3},
   {rx:.70,ry:.36,rw:.26,rh:.30,angle:11},
   {rx:.04,ry:.42,rw:.26,rh:.30,angle:-6},
   {rx:.28,ry:.46,rw:.28,rh:.32,angle:2},
   {rx:.46,ry:.56,rw:.28,rh:.32,angle:7},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const linen='#E8DFD2', washiOrange='#D97757', washiSage='#7BA098', ink='#3D3A35';
   drawGrainGradient(ctx,W,H,linen,'#DDD2BF',150,.06,29);
   drawFilmGrain(ctx,W,H,.045,55);
   // Washi tape strips at random angles holding polaroids down
   drawWashiTape(ctx,W*.20,H*.10,S*.05,S*.014,-Math.PI*.18,washiOrange);
   drawWashiTape(ctx,W*.42,H*.07,S*.05,S*.014,Math.PI*.12,washiSage);
   drawWashiTape(ctx,W*.78,H*.36,S*.05,S*.014,Math.PI*.24,washiOrange);
   drawWashiTape(ctx,W*.16,H*.42,S*.05,S*.014,-Math.PI*.14,washiSage);
   drawWashiTape(ctx,W*.58,H*.56,S*.05,S*.014,Math.PI*.16,washiOrange);
   // Confetti dots
   ctx.fillStyle=washiOrange;
   for(let i=0;i<12;i++){
     const x=W*(.05+(i*.083)%.92);
     const y=H*(.88+(i%3)*.025);
     ctx.beginPath();
     ctx.arc(x,y,S*.004,0,Math.PI*2);
     ctx.fill();
   }
   ctx.fillStyle=washiSage;
   for(let i=0;i<10;i++){
     const x=W*(.08+(i*.097)%.86);
     const y=H*(.92+(i%2)*.018);
     ctx.beginPath();
     ctx.arc(x,y,S*.003,0,Math.PI*2);
     ctx.fill();
   }
 },
 canvasElements:[
   {kind:'text',text:'the wedding of maya & daniel',x:0.50,y:0.919,align:'center',style:{fontSize:'22px',fontFamily:"'Caveat','Dancing Script',cursive",fontWeight:'500',fontStyle:'italic',color:'#3D3A35'}},
   {kind:'text',text:'06 - 12 - 26',x:0.499,y:0.962,align:'center',style:{fontSize:'14px',fontFamily:"'Caveat','Dancing Script',cursive",fontWeight:'500',color:'#7BA098',letterSpacing:'4px'}},
 ]},

// W5: GARLAND LINE - 5 photos hanging from a drawn curved rope
// The only template where photo positions follow a Bezier curve
{id:'occ_wed_garland',name:'Garland Line',cat:'wedding',badge:'new',n:5,
 photoFrames:[
   {rx:.036,ry:.327,rw:.14,rh:.20,angle:-4},
   {rx:.23,ry:.36,rw:.14,rh:.20,angle:-2},
   {rx:.43,ry:.40,rw:.14,rh:.20,angle:0},
   {rx:.63,ry:.36,rw:.14,rh:.20,angle:2},
   {rx:.821,ry:.327,rw:.14,rh:.20,angle:4},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   const parchment='#FAF7F0', greenery='#6B7F4A', ink='#2E2A24', kraft='#D4B896', rope='#9B7B5E';
   drawGrainGradient(ctx,W,H,parchment,'#F0EBE0',180,.04,17);
   drawFilmGrain(ctx,W,H,.025,21);
   // Draw the rope catenary curve (Bezier) sagging across upper-middle
   ctx.strokeStyle=rope;
   ctx.lineWidth=Math.max(2.4,S*.004);
   ctx.lineCap='round';
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.22);
   ctx.bezierCurveTo(W*.30,H*.40,W*.70,H*.40,W*.98,H*.22);
   ctx.stroke();
   // Thinner inner line for braid effect
   ctx.strokeStyle='#7C5F44';
   ctx.lineWidth=Math.max(1,S*.0016);
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.22);
   ctx.bezierCurveTo(W*.30,H*.40,W*.70,H*.40,W*.98,H*.22);
   ctx.stroke();
   // Anchor leaf clusters at rope endpoints
   const drawLeafCluster=(cx,cy)=>{
     ctx.fillStyle=greenery;
     for(let i=0;i<7;i++){
       const a=i*Math.PI*2/7;
       const lx=cx+Math.cos(a)*S*.018;
       const ly=cy+Math.sin(a)*S*.018;
       ctx.save();
       ctx.translate(lx,ly);
       ctx.rotate(a);
       ctx.beginPath();
       ctx.ellipse(0,0,S*.005,S*.014,0,0,Math.PI*2);
       ctx.fill();
       ctx.restore();
     }
   };
   drawLeafCluster(W*.04,H*.22);
   drawLeafCluster(W*.96,H*.22);
   // Tiny clothespin shapes on top of each photo (thin dark rectangle)
   ctx.fillStyle='#5A4632';
   const photoPos=[
     {x:.036,y:.327},
     {x:.23,y:.36},
     {x:.43,y:.40},
     {x:.63,y:.36},
     {x:.821,y:.327},
   ];
   photoPos.forEach((p,i)=>{
     const px=W*(p.x+.07);
     const py=H*p.y;
     ctx.save();
     ctx.translate(px,py);
     ctx.rotate((i-2)*.04);
     ctx.fillRect(-S*.008,-S*.006,S*.016,S*.012);
     ctx.restore();
   });
   // Falling leaves drifting near bottom
   ctx.fillStyle=greenery;
   const leafFall=[[.15,.78],[.35,.85],[.55,.80],[.75,.86],[.88,.78]];
   leafFall.forEach(([x,y])=>{
     ctx.save();
     ctx.translate(W*x,H*y);
     ctx.rotate(Math.random()*Math.PI*2);
     ctx.beginPath();
     ctx.ellipse(0,0,S*.005,S*.012,0,0,Math.PI*2);
     ctx.fill();
     ctx.restore();
   });
 },
 canvasElements:[
   {kind:'text',text:'save the date',x:0.501,y:0.205,align:'center',style:{fontSize:'18px',fontFamily:"'Caveat','Dancing Script',cursive",fontWeight:'500',fontStyle:'italic',color:'#6B7F4A'}},
   {kind:'text',text:'MAYA + DANIEL',x:0.501,y:0.675,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',color:'#2E2A24',letterSpacing:'6px'}},
   {kind:'text',text:'JUNE 12, 2026 - AMALFI COAST',x:0.499,y:0.75,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'#9B7B5E',letterSpacing:'5px'}},
 ]},

// HOLIDAY — Christmas Wreath (6 photos arranged in a circular ring around a
// center holiday greeting; pine wreath foliage + red berries + gold bow at top)
{id:'occ_xmas_wreath',name:'Christmas Wreath',cat:'holiday',badge:'new',n:6,
 photoFrames:[
   {rx:.39,ry:.11,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.633,ry:.25,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.633,ry:.53,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.39,ry:.67,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.147,ry:.53,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.147,ry:.25,rw:.22,rh:.22,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   drawGrainGradient(ctx,W,H,'#fbf6ea','#f0e8d5',180,.04,21);
   const cx=W*.5,cy=H*.5,R=S*.34;
   // Outer pine ring (18 sprigs around)
   for(let i=0;i<18;i++){
     const a=(i/18)*Math.PI*2;
     drawPineSprig(ctx,cx+Math.cos(a)*R*1.08,cy+Math.sin(a)*R*1.08,S*.08,a+Math.PI/2,'rgba(58,90,55,.85)');
   }
   // Inner pine ring (14 darker sprigs, offset rotation)
   for(let i=0;i<14;i++){
     const a=(i/14)*Math.PI*2+.1;
     drawPineSprig(ctx,cx+Math.cos(a)*R*.78,cy+Math.sin(a)*R*.78,S*.052,a-Math.PI/2,'rgba(76,108,68,.7)');
   }
   // Red berry clusters scattered on the wreath
   [.3,.95,1.6,2.3,3.1,3.8,4.5,5.2,5.9].forEach(a=>{
     drawBerryCluster(ctx,cx+Math.cos(a)*R*.96,cy+Math.sin(a)*R*.96,S*.018,'#b83a3a');
   });
   // Gold bow at top of wreath
   ctx.save();
   ctx.translate(cx,cy-R*1.12);
   ctx.fillStyle='#c9b87a';
   // Left loop
   ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-S*.055,-S*.028);ctx.lineTo(-S*.055,S*.028);ctx.closePath();ctx.fill();
   // Right loop
   ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(S*.055,-S*.028);ctx.lineTo(S*.055,S*.028);ctx.closePath();ctx.fill();
   // Center knot
   ctx.fillStyle='#a89865';ctx.fillRect(-S*.009,-S*.014,S*.018,S*.028);
   // Ribbon tails
   ctx.fillStyle='#c9b87a';
   ctx.beginPath();ctx.moveTo(-S*.013,S*.014);ctx.lineTo(-S*.024,S*.055);ctx.lineTo(-S*.004,S*.055);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(S*.013,S*.014);ctx.lineTo(S*.024,S*.055);ctx.lineTo(S*.004,S*.055);ctx.closePath();ctx.fill();
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'merry',x:0.5,y:0.46,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(120,80,40,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Christmas',x:0.504,y:0.491,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3a5a37'}},
   {kind:'text',text:'2 0 2 6',x:0.501,y:0.553,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(120,80,40,.7)',letterSpacing:'5px'}},
 ]},

// HOLIDAY — Christmas Tree (6 photos arranged in a pyramid tree shape: 1 top +
// 2 middle + 3 bottom; gold star at top, wooden trunk, presents at base)
{id:'occ_xmas_tree',name:'Christmas Tree',cat:'holiday',badge:'new',n:6,
 photoFrames:[
   // Row 1 (top): 1 photo
   {rx:.41,ry:.12,rw:.18,rh:.18,angle:0,shape:'circle'},
   // Row 2 (middle): 2 photos
   {rx:.29,ry:.32,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.53,ry:.32,rw:.18,rh:.18,angle:0,shape:'circle'},
   // Row 3 (bottom): 3 photos
   {rx:.17,ry:.52,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.41,ry:.52,rw:.18,rh:.18,angle:0,shape:'circle'},
   {rx:.65,ry:.52,rw:.18,rh:.18,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Midnight blue starry sky
   drawGrainGradient(ctx,W,H,'#0e1a32','#06101f',180,.05,77);
   const rng=seededRng(42);
   // Stars scattered
   for(let i=0;i<80;i++){
     const x=rng()*W,y=rng()*H*.85,r=S*.0008+rng()*S*.0022;
     ctx.fillStyle=`rgba(255,255,255,${.4+rng()*.55})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Tree silhouette behind the photos (deep forest green triangle)
   ctx.save();
   ctx.fillStyle='rgba(28,58,38,.55)';
   ctx.beginPath();
   ctx.moveTo(W*.5,H*.08);
   ctx.lineTo(W*.86,H*.7);
   ctx.lineTo(W*.14,H*.7);
   ctx.closePath();
   ctx.fill();
   ctx.restore();
   // Gold star at top
   drawStarburst8(ctx,W*.5,H*.08,S*.025,'#e8c56a');
   drawStarburst8(ctx,W*.5,H*.08,S*.014,'#fff5d0');
   // Tree trunk (wooden rectangle below the tree)
   ctx.fillStyle='#5a3520';
   const trunkW=S*.08,trunkH=S*.06;
   ctx.fillRect(W*.5-trunkW/2,H*.72,trunkW,trunkH);
   // Trunk grain lines
   ctx.strokeStyle='rgba(40,20,10,.5)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let i=0;i<3;i++){
     const yy=H*.72+trunkH*(.25+i*.25);
     ctx.beginPath();ctx.moveTo(W*.5-trunkW/2*.9,yy);ctx.lineTo(W*.5+trunkW/2*.9,yy);ctx.stroke();
   }
   // Presents at base (3 small colored boxes)
   const presents=[
     [W*.30,H*.82,S*.06,S*.05,'#b83a3a','#c9b87a'],
     [W*.42,H*.85,S*.08,S*.06,'#3a5a37','#c9b87a'],
     [W*.58,H*.83,S*.07,S*.055,'#c9b87a','#b83a3a'],
   ];
   presents.forEach(([x,y,w,h,boxC,ribC])=>{
     ctx.fillStyle=boxC;ctx.fillRect(x,y,w,h);
     ctx.fillStyle=ribC;
     ctx.fillRect(x+w*.45,y,w*.1,h);
     ctx.fillRect(x,y+h*.45,w,h*.1);
   });
   // Snow on ground
   ctx.fillStyle='rgba(240,245,250,.4)';
   ctx.beginPath();
   ctx.moveTo(0,H);
   ctx.bezierCurveTo(W*.3,H*.92,W*.7,H*.94,W,H*.91);
   ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 },
 canvasElements:[
   {kind:'text',text:'family christmas',x:0.5,y:0.74,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(232,197,106,.9)',letterSpacing:'6px',textTransform:'uppercase'}},
   {kind:'text',text:'Joy to All',x:0.5,y:0.94,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#f0e8d5'}},
 ]},

// HOLIDAY — Holiday Postcard (1 large photo in a vintage 5x7 postcard format
// with a stamp, postmark, and address-line accents on the right side)
{id:'occ_xmas_postcard',name:'Holiday Postcard',cat:'holiday',badge:'new',n:1,
 photoFrames:[
   {rx:.07,ry:.18,rw:.42,rh:.64,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged paper background (sepia cream)
   drawGrainGradient(ctx,W,H,'#f7eed8','#e8dab8',180,.07,33);
   // Paper texture spots
   const rng=seededRng(91);
   for(let i=0;i<50;i++){
     const x=rng()*W,y=rng()*H,r=S*.002+rng()*S*.005;
     ctx.fillStyle=`rgba(140,100,60,${.04+rng()*.05})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Center divider line (vertical, postcard convention)
   ctx.strokeStyle='rgba(107,44,24,.4)';ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();ctx.moveTo(W*.52,H*.18);ctx.lineTo(W*.52,H*.82);ctx.stroke();
   // Stamp box in top-right
   const stx=W*.84,sty=H*.18,stw=S*.13,sth=S*.16;
   ctx.fillStyle='#fef9e9';ctx.fillRect(stx,sty,stw,sth);
   ctx.strokeStyle='#b83a3a';ctx.lineWidth=Math.max(1.5,S*.002);
   // Perforated edge (dashed)
   ctx.setLineDash([S*.005,S*.003]);
   ctx.strokeRect(stx,sty,stw,sth);
   ctx.setLineDash([]);
   // Stamp content - small Christmas tree icon
   ctx.fillStyle='#3a5a37';
   ctx.beginPath();
   ctx.moveTo(stx+stw/2,sty+sth*.2);
   ctx.lineTo(stx+stw*.78,sty+sth*.7);
   ctx.lineTo(stx+stw*.22,sty+sth*.7);
   ctx.closePath();ctx.fill();
   ctx.fillStyle='#5a3520';
   ctx.fillRect(stx+stw*.42,sty+sth*.7,stw*.16,sth*.12);
   ctx.fillStyle='#c9b87a';
   ctx.font=`bold ${Math.max(7,S*.014)}px sans-serif`;
   ctx.textAlign='center';
   ctx.fillText('1c',stx+stw/2,sty+sth*.96);
   // Postmark (circular ink stamp, faded)
   ctx.save();
   ctx.strokeStyle='rgba(107,44,24,.55)';ctx.lineWidth=Math.max(1.5,S*.002);
   const pcx=W*.7,pcy=H*.28,pr=S*.07;
   ctx.beginPath();ctx.arc(pcx,pcy,pr,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(pcx,pcy,pr*.7,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle='rgba(107,44,24,.55)';
   ctx.font=`bold ${Math.max(8,S*.013)}px sans-serif`;
   ctx.textAlign='center';
   ctx.fillText('DEC 24',pcx,pcy-pr*.15);
   ctx.fillText('2026',pcx,pcy+pr*.25);
   ctx.restore();
   // Address lines (right side, lower half)
   ctx.strokeStyle='rgba(107,44,24,.35)';ctx.lineWidth=Math.max(.8,S*.001);
   const lineX1=W*.58,lineX2=W*.95;
   for(let i=0;i<4;i++){
     const yy=H*.52+i*S*.05;
     ctx.beginPath();ctx.moveTo(lineX1,yy);ctx.lineTo(lineX2,yy);ctx.stroke();
   }
   // Pine sprig accent in top-left
   drawPineSprig(ctx,W*.05,H*.08,S*.1,Math.PI*.55,'rgba(58,90,55,.7)');
   drawBerryCluster(ctx,W*.08,H*.11,S*.018,'#b83a3a');
   // Ornamental border around the whole postcard
   drawOrnamentalBorder(ctx,W,H,'rgba(107,44,24,.55)',Math.max(10,S*.016));
 },
 canvasElements:[
   {kind:'text',text:'POSTCARD',x:0.74,y:0.13,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',color:'rgba(107,44,24,.85)',letterSpacing:'10px'}},
   {kind:'text',text:'Greetings from',x:0.74,y:0.42,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontWeight:'500',fontStyle:'italic',color:'rgba(107,44,24,.85)'}},
   {kind:'text',text:'Our Family',x:0.74,y:0.48,align:'center',style:{fontSize:'22px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#3a5a37'}},
 ]},

// HOLIDAY — Cozy Mantel (3 LARGE photos on a wooden mantel, brick fireplace
// below, pine garland with gold lights and red berries across the top, three
// hanging stockings below)
{id:'occ_xmas_mantel',name:'Cozy Mantel',cat:'holiday',badge:'new',n:3,
 photoFrames:[
   {rx:.05,ry:.18,rw:.28,rh:.36,angle:0,shape:'rect'},
   {rx:.36,ry:.18,rw:.28,rh:.36,angle:0,shape:'rect'},
   {rx:.67,ry:.18,rw:.28,rh:.36,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm cream wall background
   drawGrainGradient(ctx,W,H,'#fbf3e4','#f0e4c8',180,.04,21);
   // Pine garland across the top (overlapping sprigs)
   for(let i=0;i<12;i++){
     const x=W*.04+i*W*.08;
     const y=H*.08+Math.sin(i*.8)*S*.012;
     drawPineSprig(ctx,x,y,S*.075,Math.PI/2+(i%2?-.18:.18),'rgba(58,90,55,.85)');
   }
   // Red berry clusters in the garland
   [.12,.32,.52,.72,.92].forEach(x=>{
     drawBerryCluster(ctx,W*x,H*.10,S*.02,'#b83a3a');
   });
   // Tiny gold lights woven through garland
   ctx.fillStyle='#f0d878';
   for(let i=0;i<18;i++){
     const x=W*.04+i*W*.053;
     const y=H*.13;
     ctx.beginPath();ctx.arc(x,y,S*.005,0,Math.PI*2);ctx.fill();
   }
   // Wooden mantel ledge (horizontal shelf)
   const mantelY=H*.56,mantelH=S*.045;
   ctx.fillStyle='#5a3520';
   ctx.fillRect(0,mantelY,W,mantelH);
   // Mantel shadow underneath
   ctx.fillStyle='rgba(0,0,0,.18)';
   ctx.fillRect(0,mantelY+mantelH,W,S*.008);
   // Wood grain lines on mantel
   ctx.strokeStyle='rgba(30,15,5,.35)';ctx.lineWidth=Math.max(.6,S*.0008);
   for(let i=0;i<3;i++){
     const yy=mantelY+mantelH*(.25+i*.25);
     ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();
   }
   // Brick fireplace below the mantel
   const brickY=mantelY+mantelH+S*.008;
   ctx.fillStyle='#8b3a2e';
   ctx.fillRect(0,brickY,W,H-brickY);
   ctx.strokeStyle='rgba(50,15,10,.5)';ctx.lineWidth=Math.max(.8,S*.001);
   const brickW=W*.085,brickH=S*.05;
   for(let row=0;row<10;row++){
     const yy=brickY+row*brickH;
     if(yy>H)break;
     const offset=(row%2)?brickW/2:0;
     for(let col=-1;col*brickW+offset<W;col++){
       ctx.strokeRect(col*brickW+offset,yy,brickW,brickH);
     }
   }
   // Three stockings hanging from the mantel
   const stkColors=['#b83a3a','#3a5a37','#c9b87a'];
   const stkX=[.19,.5,.81];
   stkX.forEach((sx,i)=>{
     const cx=W*sx,cy=brickY+S*.005;
     ctx.fillStyle=stkColors[i];
     // Stocking body
     ctx.beginPath();
     ctx.moveTo(cx-S*.04,cy);
     ctx.lineTo(cx-S*.04,cy+S*.13);
     ctx.bezierCurveTo(cx-S*.04,cy+S*.17,cx-S*.085,cy+S*.17,cx-S*.085,cy+S*.145);
     ctx.lineTo(cx-S*.05,cy+S*.145);
     ctx.lineTo(cx-S*.05,cy+S*.15);
     ctx.lineTo(cx+S*.04,cy+S*.15);
     ctx.lineTo(cx+S*.04,cy);
     ctx.closePath();
     ctx.fill();
     // White fluffy cuff at top
     ctx.fillStyle='#f4ede0';
     ctx.fillRect(cx-S*.045,cy-S*.002,S*.085,S*.022);
     // Cuff shadow line
     ctx.strokeStyle='rgba(0,0,0,.1)';ctx.lineWidth=Math.max(.6,S*.0008);
     ctx.beginPath();ctx.moveTo(cx-S*.045,cy+S*.02);ctx.lineTo(cx+S*.04,cy+S*.02);ctx.stroke();
   });
   // Subtle ornament shadow under each photo on the mantel (decorative)
   ctx.fillStyle='rgba(0,0,0,.08)';
   [.19,.5,.81].forEach(x=>{
     ctx.beginPath();
     ctx.ellipse(W*x,mantelY-S*.005,S*.08,S*.008,0,0,Math.PI*2);
     ctx.fill();
   });
 },
 canvasElements:[
   {kind:'text',text:'home for the holidays',x:0.499,y:0.576,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(248,238,213,.95)',letterSpacing:'7px',textTransform:'uppercase'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// HEART TEMPLATES — single-shape (all heart-cell) layouts for the
// /heart-photo-collage landing page. Six structurally distinct
// arrangements: solo, pair, trio, 2x3 grid, scattered cluster,
// polaroid corkboard.
// ═══════════════════════════════════════════════════════════════

// ANNIVERSARY — Heart Solo (1 large heart center, rose petals + gold border)
{id:'occ_heart_solo',name:'Heart Solo',cat:'anniversary',badge:'new',n:1,
 photoFrames:[
   {rx:.22,ry:.16,rw:.56,rh:.6,angle:0,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft blush + cream gradient
   drawGrainGradient(ctx,W,H,'#fbe9e7','#f5d6cf',135,.06,33);
   // Scattered rose petals (small ellipses with rotation)
   const rng=seededRng(17);
   for(let i=0;i<22;i++){
     const x=rng()*W,y=rng()*H,r=S*.014+rng()*S*.012;
     const a=rng()*Math.PI*2;
     ctx.save();ctx.translate(x,y);ctx.rotate(a);
     ctx.fillStyle=`rgba(${180+rng()*40|0},${80+rng()*30|0},${80+rng()*20|0},${.3+rng()*.3})`;
     ctx.beginPath();ctx.ellipse(0,0,r,r*.6,0,0,Math.PI*2);ctx.fill();
     ctx.restore();
   }
   // Soft glow behind heart
   const glow=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,S*.45);
   glow.addColorStop(0,'rgba(255,220,210,.4)');
   glow.addColorStop(1,'rgba(255,220,210,0)');
   ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
   // Thin gold ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(200,150,80,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'with all my love',x:0.5,y:0.085,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Forever Yours',x:0.5,y:0.86,align:'center',style:{fontSize:'30px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'~ 2026 ~',x:0.5,y:0.93,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(160,100,80,.7)',letterSpacing:'6px'}},
 ]},

// ANNIVERSARY — Heart Pair (2 symmetric hearts side-by-side, joined by "us")
{id:'occ_heart_pair',name:'Heart Pair',cat:'anniversary',badge:'new',n:2,
 photoFrames:[
   {rx:.05,ry:.20,rw:.42,rh:.55,angle:0,shape:'heart'},
   {rx:.53,ry:.20,rw:.42,rh:.55,angle:0,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm cream linen background
   drawGrainGradient(ctx,W,H,'#f7ecda','#eedcc4',180,.06,21);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,100,70,.10)',6);
   // Small connecting heart in the middle gap
   ctx.save();
   drawHeart(ctx,W*.5,H*.46,S*.045,'#c8635c');
   ctx.restore();
   // Tiny sparkles around the connecting heart
   const sparks=[[-0.06,-0.04],[0.06,-0.04],[-0.04,0.06],[0.04,0.06],[0,-0.08]];
   sparks.forEach(([dx,dy])=>{
     drawStarburst8(ctx,W*(.5+dx),H*(.46+dy),S*.008,'rgba(200,150,80,.85)');
   });
   // Botanical sprigs in corners
   drawBotanicalSpray(ctx,W*.05,H*.05,S*.12,Math.PI*.3,'rgba(140,140,100,.6)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.95,H*.05,S*.12,Math.PI*.3,'rgba(140,140,100,.6)');ctx.restore();
   drawBotanicalSpray(ctx,W*.05,H*.92,S*.12,-Math.PI*.3,'rgba(140,140,100,.6)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.95,H*.92,S*.12,-Math.PI*.3,'rgba(140,140,100,.6)');ctx.restore();
   // Thin border
   ctx.strokeStyle='rgba(140,100,70,.4)';ctx.lineWidth=Math.max(1,S*.0012);
   const m=S*.025;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'just',x:0.378,y:0.475,align:'center',style:{fontSize:'12px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.85)'}},
   {kind:'text',text:'us',x:0.622,y:0.475,align:'center',style:{fontSize:'12px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.85)'}},
   {kind:'text',text:'YOU & ME',x:0.5,y:0.88,align:'center',style:{fontSize:'13px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'#8b4538',letterSpacing:'9px'}},
   {kind:'text',text:'a quiet kind of forever',x:0.5,y:0.935,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(140,100,70,.75)',letterSpacing:'2px'}},
 ]},

// ANNIVERSARY — Heart Trio (3 hearts in a row, center slightly larger)
{id:'occ_heart_trio',name:'Heart Trio',cat:'anniversary',badge:'new',n:3,
 photoFrames:[
   {rx:.04,ry:.27,rw:.30,rh:.30,angle:-3,shape:'heart'},
   {rx:.36,ry:.22,rw:.30,rh:.30,angle:0,shape:'heart'},
   {rx:.68,ry:.27,rw:.30,rh:.30,angle:3,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusty pink gradient
   drawGrainGradient(ctx,W,H,'#f8e3dc','#e8c5bd',180,.06,42);
   // Watercolor brush stroke across the middle
   drawWatercolorBlob(ctx,W*.5,H*.5,S*.55,'#f0c0b3',.22);
   // Botanical wreath bottom
   drawBotanicalSpray(ctx,W*.18,H*.85,S*.18,Math.PI*.05,'rgba(140,140,100,.6)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.82,H*.85,S*.18,Math.PI*.05,'rgba(140,140,100,.6)');ctx.restore();
   drawRose(ctx,W*.5,H*.86,S*.055,0,'#c8635c');
   drawRose(ctx,W*.42,H*.89,S*.038,.3,'#d88377');
   drawRose(ctx,W*.58,H*.89,S*.038,-.3,'#d88377');
   // Subtle script "love" watermark top
   drawScriptWatermark(ctx,'love',W*.5,H*.08,H*.08,'rgba(180,100,90,.35)');
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,90,.5)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'three favourite moments',x:0.493,y:0.124,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.75)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Then. Now. Always.',x:0.5,y:0.74,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
 ]},

// ANNIVERSARY — Heart Grid (6 hearts in 2 rows of 3, family/friends collage)
{id:'occ_heart_grid',name:'Heart Grid',cat:'anniversary',badge:'new',n:6,
 photoFrames:[
   // Row 1
   {rx:.04,ry:.16,rw:.28,rh:.30,angle:0,shape:'heart'},
   {rx:.36,ry:.16,rw:.28,rh:.30,angle:0,shape:'heart'},
   {rx:.68,ry:.16,rw:.28,rh:.30,angle:0,shape:'heart'},
   // Row 2
   {rx:.04,ry:.52,rw:.28,rh:.30,angle:0,shape:'heart'},
   {rx:.36,ry:.52,rw:.28,rh:.30,angle:0,shape:'heart'},
   {rx:.68,ry:.52,rw:.28,rh:.30,angle:0,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Clean ivory background
   drawGrainGradient(ctx,W,H,'#fbf7ee','#f2eada',180,.04,11);
   // Subtle pink wash horizontal stripe in the middle (separator feel)
   ctx.save();ctx.globalAlpha=.15;
   ctx.fillStyle='#f5c4ba';
   ctx.fillRect(0,H*.46,W,H*.06);
   ctx.restore();
   // Small heart icons as row separators
   drawHeart(ctx,W*.2,H*.49,S*.018,'#c8635c');
   drawHeart(ctx,W*.5,H*.49,S*.022,'#a04848');
   drawHeart(ctx,W*.8,H*.49,S*.018,'#c8635c');
   // Botanical accents in corners
   drawBotanicalSpray(ctx,W*.04,H*.04,S*.09,Math.PI*.25,'rgba(140,140,100,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.04,S*.09,Math.PI*.25,'rgba(140,140,100,.55)');ctx.restore();
   drawBotanicalSpray(ctx,W*.04,H*.96,S*.09,-Math.PI*.25,'rgba(140,140,100,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.96,S*.09,-Math.PI*.25,'rgba(140,140,100,.55)');ctx.restore();
   ctx.strokeStyle='rgba(160,120,90,.35)';ctx.lineWidth=Math.max(.8,S*.001);
   const m=S*.022;ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'all my favourite people',x:0.5,y:0.08,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,80,80,.8)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'Loved Ones',x:0.5,y:0.92,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
 ]},

// ANNIVERSARY — Heart Cluster (5 hearts at varied sizes scattered, painterly)
{id:'occ_heart_cluster',name:'Heart Cluster',cat:'anniversary',badge:'new',n:5,
 photoFrames:[
   // Large hero heart left of center
   {rx:.06,ry:.20,rw:.40,rh:.50,angle:-4,shape:'heart'},
   // Medium heart top-right
   {rx:.52,ry:.08,rw:.28,rh:.34,angle:6,shape:'heart'},
   // Medium heart middle-right
   {rx:.62,ry:.36,rw:.30,rh:.36,angle:-3,shape:'heart'},
   // Small heart bottom-left
   {rx:.18,ry:.66,rw:.20,rh:.24,angle:8,shape:'heart'},
   // Small heart bottom-right
   {rx:.48,ry:.70,rw:.22,rh:.26,angle:-7,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Painterly blush + peach + sage palette
   drawGrainGradient(ctx,W,H,'#f9e4d8','#f0d2c0',135,.06,55);
   // Multiple watercolor splashes
   drawWatercolorSplash(ctx,W*.2,H*.15,S*.22,'#c8635c',11,.28);
   drawWatercolorSplash(ctx,W*.85,H*.85,S*.24,'#b87b73',22,.25);
   drawWatercolorSplash(ctx,W*.85,H*.18,S*.16,'#d8a87a',33,.22);
   // Hand-drawn dotted curve connecting the heart cluster
   ctx.strokeStyle='rgba(160,90,80,.55)';ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.lineCap='round';ctx.setLineDash([S*.008,S*.012]);
   ctx.beginPath();
   ctx.moveTo(W*.4,H*.45);
   ctx.bezierCurveTo(W*.55,H*.30,W*.65,H*.20,W*.70,H*.20);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(W*.4,H*.55);
   ctx.bezierCurveTo(W*.55,H*.60,W*.65,H*.55,W*.75,H*.50);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(W*.28,H*.62);
   ctx.bezierCurveTo(W*.32,H*.75,W*.32,H*.80,W*.30,H*.78);
   ctx.stroke();
   ctx.setLineDash([]);
   // Botanical accents
   drawBotanicalSpray(ctx,W*.02,H*.05,S*.14,Math.PI*.2,'rgba(140,140,100,.6)');
   drawBotanicalSpray(ctx,W*.92,H*.96,S*.14,-Math.PI*.2,'rgba(140,140,100,.6)');
   // Faint script "always" watermark
   drawScriptWatermark(ctx,'always',W*.78,H*.08,H*.07,'rgba(180,100,90,.4)');
 },
 canvasElements:[
   {kind:'text',text:'moments we hold close',x:0.5,y:0.04,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.75)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'Always',x:0.78,y:0.94,align:'center',style:{fontSize:'26px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// COUPLE TEMPLATES — designed specifically for couple photo
// collages for the /couple-photo-collage landing page. Six
// structurally distinct layouts: Then & Now, Timeline, Monogram,
// Film Reel, Heartstrings, Date Night.
// ═══════════════════════════════════════════════════════════════

// ANNIVERSARY — Then & Now (2 large photos side-by-side with vintage arrow)
{id:'occ_couple_thenow',name:'Then & Now',cat:'anniversary',badge:'new',n:2,
 photoFrames:[
   {rx:.05,ry:.20,rw:.40,rh:.50,angle:0,shape:'rect'},
   {rx:.55,ry:.20,rw:.40,rh:.50,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged parchment background
   drawGrainGradient(ctx,W,H,'#f5ecda','#e8d6b8',135,.06,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,100,70,.10)',6);
   // Dotted arrow arcing from left photo to right photo in the gap
   ctx.strokeStyle='rgba(160,90,80,.65)';
   ctx.lineWidth=Math.max(1.5,S*.0025);
   ctx.lineCap='round';
   ctx.setLineDash([S*.012,S*.014]);
   ctx.beginPath();
   ctx.moveTo(W*.46,H*.50);
   ctx.bezierCurveTo(W*.50,H*.36,W*.50,H*.36,W*.54,H*.50);
   ctx.stroke();
   ctx.setLineDash([]);
   // Arrowhead at right end of arc
   ctx.fillStyle='rgba(160,90,80,.85)';
   ctx.beginPath();
   ctx.moveTo(W*.54,H*.50);
   ctx.lineTo(W*.52,H*.475);
   ctx.lineTo(W*.535,H*.50);
   ctx.closePath();
   ctx.fill();
   // Small connecting heart at the top of the arc
   drawHeart(ctx,W*.5,H*.31,S*.024,'#a04848');
   // Botanical sprigs in upper corners
   drawBotanicalSpray(ctx,W*.03,H*.06,S*.11,Math.PI*.3,'rgba(140,140,100,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.06,S*.11,Math.PI*.3,'rgba(140,140,100,.55)');ctx.restore();
   // Ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,90,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'our story',x:0.5,y:0.07,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'10px',textTransform:'uppercase'}},
   {kind:'text',text:'Then',x:0.25,y:0.81,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'2018',x:0.25,y:0.88,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.75)',letterSpacing:'7px'}},
   {kind:'text',text:'Now',x:0.75,y:0.81,align:'center',style:{fontSize:'28px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'2026',x:0.75,y:0.88,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.75)',letterSpacing:'7px'}},
 ]},

// ANNIVERSARY — Love Story Timeline (5 photos in a horizontal row, twine + date labels)
{id:'occ_couple_timeline',name:'Love Story Timeline',cat:'anniversary',badge:'new',n:5,
 photoFrames:[
   {rx:.03,ry:.30,rw:.16,rh:.20,angle:-3,shape:'rect'},
   {rx:.22,ry:.32,rw:.16,rh:.20,angle:2,shape:'rect'},
   {rx:.42,ry:.30,rw:.16,rh:.20,angle:-2,shape:'rect'},
   {rx:.62,ry:.32,rw:.16,rh:.20,angle:3,shape:'rect'},
   {rx:.81,ry:.30,rw:.16,rh:.20,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Warm cream paper
   drawGrainGradient(ctx,W,H,'#fbf6ea','#f0e8d5',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(160,140,100,.08)',6);
   // Hand-drawn horizontal twine
   ctx.strokeStyle='rgba(140,100,70,.6)';
   ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.55);
   ctx.bezierCurveTo(W*.3,H*.53,W*.7,H*.57,W*.98,H*.55);
   ctx.stroke();
   // Small hearts along the twine between photos
   [.20,.40,.60,.80].forEach(x=>{
     drawHeart(ctx,W*x,H*.555,S*.014,'#c8635c');
   });
   // Botanical sprigs at bottom corners
   drawBotanicalSpray(ctx,W*.03,H*.88,S*.16,Math.PI*.1,'rgba(140,140,100,.5)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.88,S*.16,Math.PI*.1,'rgba(140,140,100,.5)');ctx.restore();
   // Thin border
   ctx.strokeStyle='rgba(160,120,90,.4)';
   ctx.lineWidth=Math.max(.8,S*.001);
   const m=S*.022;
   ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'our love story',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,80,80,.85)',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'a timeline in five chapters',x:0.5,y:0.13,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(140,100,80,.7)',letterSpacing:'2px'}},
   {kind:'text',text:'first date',x:0.11,y:0.66,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.9)'}},
   {kind:'text',text:'2018',x:0.11,y:0.72,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.7)',letterSpacing:'5px'}},
   {kind:'text',text:'moved in',x:0.30,y:0.66,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.9)'}},
   {kind:'text',text:'2020',x:0.30,y:0.72,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.7)',letterSpacing:'5px'}},
   {kind:'text',text:'engaged',x:0.50,y:0.66,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.9)'}},
   {kind:'text',text:'2022',x:0.50,y:0.72,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.7)',letterSpacing:'5px'}},
   {kind:'text',text:'married',x:0.70,y:0.66,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.9)'}},
   {kind:'text',text:'2024',x:0.70,y:0.72,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.7)',letterSpacing:'5px'}},
   {kind:'text',text:'today',x:0.89,y:0.66,align:'center',style:{fontSize:'13px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(140,90,80,.9)'}},
   {kind:'text',text:'2026',x:0.89,y:0.72,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(140,90,80,.7)',letterSpacing:'5px'}},
 ]},

// ANNIVERSARY — Monogram (2 circle photos + big serif ampersand + initials)
{id:'occ_couple_monogram',name:'Monogram',cat:'anniversary',badge:'new',n:2,
 photoFrames:[
   {rx:.03,ry:.118,rw:.377,rh:.367,angle:0,shape:'circle'},
   {rx:.596,ry:.372,rw:.377,rh:.367,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cream + warm linen
   drawGrainGradient(ctx,W,H,'#fbf3e4','#ede0c2',180,.06,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(160,140,100,.10)',6);
   // Big serif ampersand in the center between the two photos
   ctx.save();
   ctx.font=`italic 800 ${S*.18}px 'Playfair Display', 'Fraunces', serif`;
   ctx.textAlign='center';
   ctx.textBaseline='middle';
   ctx.fillStyle='#b89860';
   ctx.fillText('&',W*.5,H*.42);
   ctx.restore();
   // Decorative gold flourishes on both sides of the ampersand
   const flourish=(x,y,dir)=>{
     ctx.save();
     ctx.translate(x,y);
     ctx.scale(dir,1);
     ctx.strokeStyle='rgba(184,152,96,.75)';
     ctx.lineWidth=Math.max(1,S*.0015);
     ctx.beginPath();
     ctx.moveTo(0,0);
     ctx.bezierCurveTo(S*.04,-S*.008,S*.07,S*.005,S*.10,0);
     ctx.stroke();
     ctx.fillStyle='rgba(184,152,96,.85)';
     ctx.beginPath();ctx.arc(S*.10,0,S*.005,0,Math.PI*2);ctx.fill();
     ctx.restore();
   };
   flourish(W*.43,H*.42,-1);
   flourish(W*.57,H*.42,1);
   // Botanical accent below the monogram area
   drawBotanicalSpray(ctx,W*.5,H*.76,S*.14,Math.PI,'rgba(140,140,100,.55)');
   // Ornamental gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(184,152,96,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'forever',x:0.5,y:0.09,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.9)',letterSpacing:'10px',textTransform:'uppercase'}},
   {kind:'text',text:'M & J',x:0.497,y:0.853,align:'center',style:{fontSize:'34px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'est. 2024',x:0.497,y:0.923,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'7px',textTransform:'uppercase'}},
 ]},

// ANNIVERSARY — Film Reel (4 horizontal photos stacked like a 35mm filmstrip with sprocket holes)
{id:'occ_couple_cinema',name:'Film Reel',cat:'anniversary',badge:'new',n:4,
 photoFrames:[
   {rx:.16,ry:.10,rw:.68,rh:.18,angle:0,shape:'rect'},
   {rx:.16,ry:.30,rw:.68,rh:.18,angle:0,shape:'rect'},
   {rx:.16,ry:.50,rw:.68,rh:.18,angle:0,shape:'rect'},
   {rx:.16,ry:.70,rw:.68,rh:.18,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Solid black filmstrip background
   ctx.fillStyle='#0a0a0a';
   ctx.fillRect(0,0,W,H);
   drawFilmGrain(ctx,W,H,.06,77);
   // White sprocket holes along the left and right margins
   ctx.fillStyle='#f5f0e0';
   const holeW=S*.045,holeH=S*.028;
   const cols=[W*.06,W*.94];
   for(let row=0;row<14;row++){
     const yy=H*.045+row*S*.072;
     if(yy+holeH>H*.96)break;
     cols.forEach(cx=>{
       ctx.fillRect(cx-holeW/2,yy,holeW,holeH);
     });
   }
   // Thin separators between frames
   ctx.strokeStyle='rgba(200,190,170,.4)';
   ctx.lineWidth=Math.max(.8,S*.001);
   [.28,.48,.68,.88].forEach(y=>{
     ctx.beginPath();
     ctx.moveTo(W*.16,H*y);
     ctx.lineTo(W*.84,H*y);
     ctx.stroke();
   });
 },
 canvasElements:[
   {kind:'text',text:'our love story',x:0.5,y:0.04,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'#e8c56a',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'Reel 01 - The Highlights',x:0.5,y:0.96,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'600',color:'rgba(255,235,180,.85)',letterSpacing:'4px'}},
 ]},

// ANNIVERSARY — Heartstrings (5 heart photos scattered along a dotted S-curve trail)
{id:'occ_couple_heartstrings',name:'Heartstrings',cat:'anniversary',badge:'new',n:5,
 photoFrames:[
   {rx:.001,ry:.03,rw:.30,rh:.30,angle:-6,shape:'heart'},
   {rx:.323,ry:.155,rw:.30,rh:.30,angle:4,shape:'heart'},
   {rx:.595,ry:.39,rw:.30,rh:.30,angle:-3,shape:'heart'},
   {rx:.151,ry:.573,rw:.30,rh:.30,angle:5,shape:'heart'},
   {rx:.631,ry:.689,rw:.32,rh:.32,angle:-4,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft blush + cream
   drawGrainGradient(ctx,W,H,'#fbe9e7','#f5e1d6',180,.05,33);
   // Hand-drawn dotted S-curve trail connecting the 5 heart centers
   ctx.strokeStyle='rgba(160,90,80,.65)';
   ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.lineCap='round';
   ctx.setLineDash([S*.008,S*.012]);
   ctx.beginPath();
   ctx.moveTo(W*.19,H*.21);
   ctx.bezierCurveTo(W*.30,H*.30,W*.36,H*.30,W*.43,H*.37);
   ctx.bezierCurveTo(W*.56,H*.44,W*.64,H*.51,W*.69,H*.53);
   ctx.bezierCurveTo(W*.58,H*.62,W*.46,H*.66,W*.41,H*.69);
   ctx.bezierCurveTo(W*.52,H*.76,W*.64,H*.80,W*.74,H*.81);
   ctx.stroke();
   ctx.setLineDash([]);
   // Small hearts along the visible trail arcs (between big hearts)
   [[W*.31,H*.29],[W*.56,H*.46],[W*.50,H*.65],[W*.58,H*.76]].forEach(([x,y])=>{
     drawHeart(ctx,x,y,S*.020,'#c8635c');
   });
 },
 canvasElements:[
   {kind:'text',text:'paths that keep crossing',x:0.5,y:0.035,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'every detour led here',x:0.5,y:0.965,align:'center',style:{fontSize:'17px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(160,90,90,.9)'}},
 ]},

// ANNIVERSARY — Date Night (4 polaroid photos scattered on a wooden table with cup + glass)
{id:'occ_couple_datenight',name:'Date Night',cat:'anniversary',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.10,rw:.32,rh:.34,angle:-6,shape:'rect'},
   {rx:.50,ry:.06,rw:.32,rh:.34,angle:5,shape:'rect'},
   {rx:.10,ry:.50,rw:.32,rh:.34,angle:4,shape:'rect'},
   {rx:.54,ry:.52,rw:.34,rh:.36,angle:-5,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Wooden table background (warm walnut)
   drawGrainGradient(ctx,W,H,'#7a4a30','#5a3520',180,.10,55);
   // Horizontal wood grain lines
   ctx.strokeStyle='rgba(40,20,10,.25)';
   ctx.lineWidth=Math.max(.6,S*.0008);
   for(let i=0;i<10;i++){
     const yy=i*H*.10+Math.sin(i*1.7)*S*.01;
     ctx.beginPath();
     ctx.moveTo(0,yy);
     ctx.lineTo(W,yy+Math.cos(i)*S*.005);
     ctx.stroke();
   }
   // Polaroid backings under each photo position (cream rectangles with shadow + slight rotation)
   const polaroids=[
     {cx:.22,cy:.30,a:-Math.PI*.04},
     {cx:.66,cy:.26,a:Math.PI*.03},
     {cx:.26,cy:.70,a:Math.PI*.025},
     {cx:.71,cy:.74,a:-Math.PI*.03},
   ];
   polaroids.forEach(p=>{
     ctx.save();
     ctx.translate(W*p.cx,H*p.cy);
     ctx.rotate(p.a);
     ctx.shadowColor='rgba(0,0,0,.4)';
     ctx.shadowBlur=S*.012;
     ctx.shadowOffsetY=S*.005;
     ctx.fillStyle='#f8f4e8';
     ctx.fillRect(-S*.20,-S*.22,S*.40,S*.46);
     ctx.shadowColor='transparent';
     ctx.restore();
   });
   // Coffee cup doodle (saucer + cup) bottom-left
   ctx.save();
   ctx.translate(W*.10,H*.93);
   ctx.fillStyle='rgba(245,235,210,.85)';
   ctx.beginPath();
   ctx.ellipse(0,S*.008,S*.045,S*.012,0,0,Math.PI*2);
   ctx.fill();
   ctx.fillStyle='#3a2418';
   ctx.beginPath();
   ctx.ellipse(0,0,S*.030,S*.010,0,0,Math.PI*2);
   ctx.fill();
   ctx.fillStyle='#5a3a28';
   ctx.beginPath();
   ctx.ellipse(0,-S*.001,S*.025,S*.007,0,0,Math.PI*2);
   ctx.fill();
   ctx.restore();
   // Wine glass doodle bottom-right
   ctx.save();
   ctx.translate(W*.90,H*.91);
   ctx.strokeStyle='rgba(245,235,210,.8)';
   ctx.lineWidth=Math.max(.8,S*.0011);
   // Glass bowl
   ctx.beginPath();
   ctx.arc(0,-S*.018,S*.022,Math.PI*.15,Math.PI*.85);
   ctx.stroke();
   ctx.fillStyle='rgba(160,40,60,.7)';
   ctx.beginPath();
   ctx.arc(0,-S*.018,S*.019,Math.PI*.22,Math.PI*.78);
   ctx.fill();
   // Stem
   ctx.beginPath();
   ctx.moveTo(0,S*.005);
   ctx.lineTo(0,S*.030);
   ctx.stroke();
   // Base
   ctx.beginPath();
   ctx.moveTo(-S*.016,S*.034);
   ctx.lineTo(S*.016,S*.034);
   ctx.stroke();
   ctx.restore();
 },
 canvasElements:[
   {kind:'text',text:'date night',x:0.138,y:0.035,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'800',color:'rgba(248,238,213,.95)',letterSpacing:'10px',textTransform:'uppercase'}},
   {kind:'text',text:'just the two of us',x:0.234,y:0.963,align:'center',style:{fontSize:'16px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(255,235,180,.92)'}},
 ]},

// ═══════════════════════════════════════════════════════════════
// ANNIVERSARY MILESTONE TEMPLATES — for the /anniversary-photo-collage
// landing page. Six structurally distinct year-milestone layouts:
// Milestone Year, Forever Ring, Wedding Day vs Today, Years Counted,
// Vintage Album, Vow Renewal Card.
// ═══════════════════════════════════════════════════════════════

// ANNIVERSARY — Milestone Year (1 large photo + HUGE serif anniversary number)
{id:'occ_anniv_milestone',name:'Milestone Year',cat:'anniversary',badge:'new',n:1,
 photoFrames:[
   {rx:.06,ry:.18,rw:.42,rh:.62,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Soft champagne + silver gradient (luxe anniversary palette)
   drawGrainGradient(ctx,W,H,'#f5ecd6','#e0d4b8',135,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(160,130,80,.10)',6);
   // (The HUGE "25" on the right is now an editable canvasElement so the user
   // can change it to 10, 30, 50 or any year they are celebrating.)
   // Decorative gold flourish under the big number
   ctx.strokeStyle='rgba(184,152,96,.75)';
   ctx.lineWidth=Math.max(1.2,S*.002);
   ctx.beginPath();
   ctx.moveTo(W*.56,H*.70);
   ctx.bezierCurveTo(W*.65,H*.68,W*.79,H*.72,W*.88,H*.70);
   ctx.stroke();
   ctx.fillStyle='rgba(184,152,96,.85)';
   ctx.beginPath();ctx.arc(W*.56,H*.70,S*.005,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(W*.88,H*.70,S*.005,0,Math.PI*2);ctx.fill();
   // Small ornaments in corners
   drawBotanicalSpray(ctx,W*.04,H*.05,S*.10,Math.PI*.3,'rgba(160,140,80,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.95,S*.10,Math.PI*.3,'rgba(160,140,80,.55)');ctx.restore();
   // Ornamental gold border
   drawOrnamentalBorder(ctx,W,H,'rgba(184,152,96,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'celebrating',x:0.726,y:0.361,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'25',x:0.725,y:0.372,align:'center',style:{fontSize:'160px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',color:'#b89860'}},
   {kind:'text',text:'years together',x:0.727,y:0.743,align:'center',style:{fontSize:'13px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'since 1999',x:0.724,y:0.803,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'6px',textTransform:'uppercase'}},
 ]},

// ANNIVERSARY — Forever Ring (6 photos in a circular ring around a center year)
{id:'occ_anniv_ring',name:'Forever Ring',cat:'anniversary',badge:'new',n:6,
 photoFrames:[
   {rx:.39,ry:.06,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.66,ry:.20,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.66,ry:.58,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.39,ry:.72,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.12,ry:.58,rw:.22,rh:.22,angle:0,shape:'circle'},
   {rx:.12,ry:.20,rw:.22,rh:.22,angle:0,shape:'circle'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Cream + gold linen
   drawGrainGradient(ctx,W,H,'#fbf3e4','#f0e4c8',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(160,140,100,.10)',6);
   // Big gold ring connecting the 6 photos (drawn behind the photos)
   ctx.save();
   ctx.strokeStyle='rgba(184,152,96,.6)';
   ctx.lineWidth=Math.max(2,S*.0035);
   const cx=W*.5,cy=H*.5,R=S*.27;
   ctx.beginPath();
   ctx.arc(cx,cy,R,0,Math.PI*2);
   ctx.stroke();
   // Inner thinner ring (double-band look)
   ctx.strokeStyle='rgba(184,152,96,.4)';
   ctx.lineWidth=Math.max(1,S*.0015);
   ctx.beginPath();
   ctx.arc(cx,cy,R*.85,0,Math.PI*2);
   ctx.stroke();
   ctx.restore();
   // (The big "25" in the center is now an editable canvasElement so the user
   // can change it to 10, 30, 50 or any year they are celebrating.)
   // Botanical accents in corners
   drawBotanicalSpray(ctx,W*.04,H*.04,S*.10,Math.PI*.3,'rgba(140,140,100,.5)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.04,S*.10,Math.PI*.3,'rgba(140,140,100,.5)');ctx.restore();
   drawBotanicalSpray(ctx,W*.04,H*.96,S*.10,-Math.PI*.3,'rgba(140,140,100,.5)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.96,S*.10,-Math.PI*.3,'rgba(140,140,100,.5)');ctx.restore();
   // Ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(184,152,96,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'twenty five years',x:0.5,y:0.4,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.85)',letterSpacing:'7px',textTransform:'uppercase'}},
   {kind:'text',text:'25',x:0.499,y:0.392,align:'center',style:{fontSize:'140px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',color:'#b89860'}},
   {kind:'text',text:'together',x:0.494,y:0.612,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.85)',letterSpacing:'8px',textTransform:'uppercase'}},
   {kind:'text',text:'1999 - 2024',x:0.5,y:0.95,align:'center',style:{fontSize:'11px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.8)',letterSpacing:'8px'}},
 ]},

// ANNIVERSARY — Wedding Day vs Today (2 photos stacked vertically with year labels)
{id:'occ_anniv_thenwed',name:'Wedding Day & Today',cat:'anniversary',badge:'new',n:2,
 photoFrames:[
   {rx:.18,ry:.10,rw:.64,rh:.36,angle:0,shape:'rect'},
   {rx:.18,ry:.52,rw:.64,rh:.36,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged ivory parchment
   drawGrainGradient(ctx,W,H,'#f5ecda','#e8d6b8',180,.06,55);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,100,70,.10)',6);
   // Vintage stamp accent top-left (over the wedding photo header area)
   drawWaxSeal(ctx,W*.10,H*.08,S*.04,'#9c3a4a','25');
   // Small ornamental script "25 years" between the two photos
   // (rendered via canvasElements)
   // Horizontal divider line between the photos with small heart
   ctx.strokeStyle='rgba(160,90,80,.6)';
   ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();
   ctx.moveTo(W*.20,H*.495);
   ctx.lineTo(W*.42,H*.495);
   ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(W*.58,H*.495);
   ctx.lineTo(W*.80,H*.495);
   ctx.stroke();
   // Small heart in the divider gap
   drawHeart(ctx,W*.5,H*.495,S*.024,'#a04848');
   // Botanical sprigs in side margins
   drawBotanicalSpray(ctx,W*.04,H*.30,S*.10,Math.PI*.5,'rgba(140,140,100,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.30,S*.10,Math.PI*.5,'rgba(140,140,100,.55)');ctx.restore();
   drawBotanicalSpray(ctx,W*.04,H*.72,S*.10,-Math.PI*.5,'rgba(140,140,100,.55)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.96,H*.72,S*.10,-Math.PI*.5,'rgba(140,140,100,.55)');ctx.restore();
   drawOrnamentalBorder(ctx,W,H,'rgba(180,140,90,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'wedding day',x:0.5,y:0.05,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'1999',x:0.5,y:0.464,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'and today',x:0.5,y:0.92,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'2024',x:0.499,y:0.938,align:'center',style:{fontSize:'14px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
 ]},

// ANNIVERSARY — Years Counted (5 photos in a row with milestone year labels)
{id:'occ_anniv_counted',name:'Years Counted',cat:'anniversary',badge:'new',n:5,
 photoFrames:[
   {rx:.03,ry:.30,rw:.16,rh:.22,angle:-2,shape:'rect'},
   {rx:.22,ry:.30,rw:.16,rh:.22,angle:2,shape:'rect'},
   {rx:.42,ry:.30,rw:.16,rh:.22,angle:-2,shape:'rect'},
   {rx:.62,ry:.30,rw:.16,rh:.22,angle:2,shape:'rect'},
   {rx:.81,ry:.30,rw:.16,rh:.22,angle:-2,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Champagne cream gradient
   drawGrainGradient(ctx,W,H,'#fbf3e4','#ede0c2',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(160,140,100,.08)',6);
   // Horizontal twine across the middle of the photos
   ctx.strokeStyle='rgba(140,100,70,.55)';
   ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();
   ctx.moveTo(W*.02,H*.58);
   ctx.bezierCurveTo(W*.3,H*.56,W*.7,H*.60,W*.98,H*.58);
   ctx.stroke();
   // Small gold dots along the twine (anniversary "milestones")
   ctx.fillStyle='#b89860';
   [.20,.40,.60,.80].forEach(x=>{
     ctx.beginPath();ctx.arc(W*x,H*.58,S*.008,0,Math.PI*2);ctx.fill();
   });
   // Botanical sprigs at bottom
   drawBotanicalSpray(ctx,W*.03,H*.88,S*.16,Math.PI*.1,'rgba(140,140,100,.5)');
   ctx.save();ctx.scale(-1,1);drawBotanicalSpray(ctx,-W*.97,H*.88,S*.16,Math.PI*.1,'rgba(140,140,100,.5)');ctx.restore();
   // Thin border
   ctx.strokeStyle='rgba(160,120,90,.4)';
   ctx.lineWidth=Math.max(.8,S*.001);
   const m=S*.022;
   ctx.strokeRect(m,m,W-m*2,H-m*2);
 },
 canvasElements:[
   {kind:'text',text:'years counted',x:0.5,y:0.08,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.85)',letterSpacing:'10px',textTransform:'uppercase'}},
   {kind:'text',text:'one photo per milestone',x:0.5,y:0.13,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'500',fontStyle:'italic',color:'rgba(160,120,80,.7)',letterSpacing:'2px'}},
   {kind:'text',text:'1st',x:0.11,y:0.66,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'year',x:0.11,y:0.73,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'5th',x:0.30,y:0.66,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'year',x:0.30,y:0.73,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'10th',x:0.50,y:0.66,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'year',x:0.50,y:0.73,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'15th',x:0.70,y:0.66,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'year',x:0.70,y:0.73,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
   {kind:'text',text:'25th',x:0.89,y:0.66,align:'center',style:{fontSize:'18px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a08040'}},
   {kind:'text',text:'year',x:0.89,y:0.73,align:'center',style:{fontSize:'9px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,60,.75)',letterSpacing:'5px',textTransform:'uppercase'}},
 ]},

// ANNIVERSARY — Vintage Album (4 photos in a 2x2 album spread with ornaments)
{id:'occ_anniv_album',name:'Vintage Album',cat:'anniversary',badge:'new',n:4,
 photoFrames:[
   {rx:.08,ry:.18,rw:.36,rh:.32,angle:0,shape:'rect'},
   {rx:.56,ry:.18,rw:.36,rh:.32,angle:0,shape:'rect'},
   {rx:.08,ry:.55,rw:.36,rh:.32,angle:0,shape:'rect'},
   {rx:.56,ry:.55,rw:.36,rh:.32,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Aged cream + brown vintage album background
   drawGrainGradient(ctx,W,H,'#f0e4c8','#d8c4a0',135,.07,77);
   drawLinenTexture(ctx,0,0,W,H,'rgba(120,80,50,.12)',6);
   // Center fold line (book spine)
   ctx.fillStyle='rgba(80,50,30,.18)';
   ctx.fillRect(W*.49,0,W*.02,H);
   ctx.strokeStyle='rgba(80,50,30,.3)';
   ctx.lineWidth=Math.max(.8,S*.001);
   ctx.beginPath();ctx.moveTo(W*.5,0);ctx.lineTo(W*.5,H);ctx.stroke();
   // Decorative scrollwork corners
   const corner=(x,y,a)=>{
     ctx.save();
     ctx.translate(x,y);
     ctx.rotate(a);
     ctx.strokeStyle='rgba(160,110,60,.7)';
     ctx.lineWidth=Math.max(1,S*.0015);
     ctx.beginPath();
     ctx.moveTo(0,0);
     ctx.bezierCurveTo(S*.025,-S*.005,S*.045,S*.008,S*.06,0);
     ctx.bezierCurveTo(S*.07,-S*.012,S*.085,S*.005,S*.10,0);
     ctx.stroke();
     ctx.fillStyle='rgba(160,110,60,.85)';
     ctx.beginPath();ctx.arc(S*.10,0,S*.005,0,Math.PI*2);ctx.fill();
     ctx.restore();
   };
   corner(W*.06,H*.13,0);
   corner(W*.94,H*.13,Math.PI);
   corner(W*.06,H*.90,0);
   corner(W*.94,H*.90,Math.PI);
   // Photo corner brackets (vintage album style) at each photo corner
   const bracket=(x,y,a)=>{
     ctx.save();
     ctx.translate(x,y);
     ctx.rotate(a);
     ctx.strokeStyle='rgba(80,50,30,.55)';
     ctx.lineWidth=Math.max(.8,S*.001);
     ctx.beginPath();
     ctx.moveTo(0,S*.014);
     ctx.lineTo(0,0);
     ctx.lineTo(S*.014,0);
     ctx.stroke();
     ctx.restore();
   };
   const photoCorners=[
     [.08,.18],[.44,.18],[.08,.50],[.44,.50],
     [.56,.18],[.92,.18],[.56,.50],[.92,.50],
     [.08,.55],[.44,.55],[.08,.87],[.44,.87],
     [.56,.55],[.92,.55],[.56,.87],[.92,.87],
   ];
   const rotations=[0,Math.PI/2,-Math.PI/2,Math.PI];
   photoCorners.forEach(([x,y],i)=>{
     bracket(W*x,H*y,rotations[i%4]);
   });
   // Ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(160,110,60,.6)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'our anniversary album',x:0.5,y:0.07,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(120,80,50,.85)',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'25 Years of Us',x:0.5,y:0.93,align:'center',style:{fontSize:'24px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#8b5a2b'}},
 ]},

// ANNIVERSARY — Vow Renewal (3 photos in vertical column + formal vow text)
{id:'occ_anniv_vows',name:'Vow Renewal',cat:'anniversary',badge:'new',n:3,
 photoFrames:[
   {rx:.55,ry:.08,rw:.40,rh:.26,angle:0,shape:'rect'},
   {rx:.55,ry:.37,rw:.40,rh:.26,angle:0,shape:'rect'},
   {rx:.55,ry:.66,rw:.40,rh:.26,angle:0,shape:'rect'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Dusty rose + cream gradient (formal anniversary card)
   drawGrainGradient(ctx,W,H,'#f5e1d6','#e8c5b9',180,.05,33);
   drawLinenTexture(ctx,0,0,W,H,'rgba(140,80,70,.10)',6);
   // Soft watercolor wash
   drawWatercolorBlob(ctx,W*.25,H*.5,S*.35,'#f0c0b3',.25);
   // Decorative gold vertical line separator between text panel and photos
   ctx.strokeStyle='rgba(184,152,96,.65)';
   ctx.lineWidth=Math.max(1.2,S*.0018);
   ctx.beginPath();
   ctx.moveTo(W*.50,H*.12);
   ctx.lineTo(W*.50,H*.88);
   ctx.stroke();
   // Small heart at the top and bottom of the separator
   drawHeart(ctx,W*.50,H*.08,S*.020,'#a04848');
   drawHeart(ctx,W*.50,H*.92,S*.020,'#a04848');
   // Botanical accents in the text panel area
   drawBotanicalSpray(ctx,W*.04,H*.05,S*.12,Math.PI*.3,'rgba(140,140,100,.55)');
   drawBotanicalSpray(ctx,W*.04,H*.92,S*.12,-Math.PI*.3,'rgba(140,140,100,.55)');
   // Ornamental border
   drawOrnamentalBorder(ctx,W,H,'rgba(184,152,96,.55)',Math.max(10,S*.018));
 },
 canvasElements:[
   {kind:'text',text:'still choosing',x:0.25,y:0.34,align:'center',style:{fontSize:'12px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,80,80,.85)',letterSpacing:'9px',textTransform:'uppercase'}},
   {kind:'text',text:'You',x:0.25,y:0.42,align:'center',style:{fontSize:'56px',fontFamily:"'Playfair Display','Fraunces',serif",fontWeight:'700',fontStyle:'italic',color:'#a04848'}},
   {kind:'text',text:'twenty five years on',x:0.25,y:0.549,align:'center',style:{fontSize:'12px',fontFamily:"'Caveat','Dancing Script',cursive",fontStyle:'italic',color:'rgba(160,100,80,.85)'}},
   {kind:'text',text:'~ 1999 - 2024 ~',x:0.25,y:0.64,align:'center',style:{fontSize:'10px',fontFamily:"'Outfit','Inter',sans-serif",fontWeight:'700',color:'rgba(160,100,80,.75)',letterSpacing:'6px'}},
 ]},

// ANNIVERSARY — Heart Polaroid (4 heart photos pinned to a corkboard with washi tape)
{id:'occ_heart_polaroid',name:'Heart Pinboard',cat:'anniversary',badge:'new',n:4,
 photoFrames:[
   {rx:.06,ry:.10,rw:.40,rh:.42,angle:-4,shape:'heart'},
   {rx:.55,ry:.06,rw:.38,rh:.40,angle:5,shape:'heart'},
   {rx:.04,ry:.56,rw:.38,rh:.40,angle:6,shape:'heart'},
   {rx:.52,ry:.52,rw:.42,rh:.44,angle:-3,shape:'heart'},
 ],
 drawBg:(ctx,W,H)=>{
   const S=Math.min(W,H);
   // Corkboard tan + tiny dots for cork texture
   drawGrainGradient(ctx,W,H,'#d8b890','#c8a576',180,.10,55);
   const rng=seededRng(91);
   for(let i=0;i<200;i++){
     const x=rng()*W,y=rng()*H,r=S*.0015+rng()*S*.0028;
     ctx.fillStyle=`rgba(${100+rng()*50|0},${60+rng()*30|0},${30+rng()*15|0},${.18+rng()*.2})`;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   }
   // Washi tape strips at the top of each heart (drawn over the photos visually)
   const tapes=[
     {cx:.18,cy:.10,a:-Math.PI*.08,col:'rgba(232,180,140,.85)'},
     {cx:.72,cy:.06,a:Math.PI*.1,col:'rgba(212,170,200,.85)'},
     {cx:.18,cy:.56,a:Math.PI*.12,col:'rgba(180,212,170,.85)'},
     {cx:.70,cy:.52,a:-Math.PI*.06,col:'rgba(232,200,150,.85)'},
   ];
   tapes.forEach(t=>{
     ctx.save();
     ctx.translate(W*t.cx,H*t.cy);
     ctx.rotate(t.a);
     ctx.fillStyle=t.col;
     ctx.fillRect(-S*.06,-S*.013,S*.12,S*.026);
     // Tape stripe pattern
     ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=Math.max(.6,S*.0008);
     ctx.setLineDash([S*.006,S*.005]);
     ctx.beginPath();ctx.moveTo(-S*.055,0);ctx.lineTo(S*.055,0);ctx.stroke();
     ctx.setLineDash([]);
     ctx.restore();
   });
   // Pushpins near each tape strip
   tapes.forEach(t=>{
     ctx.fillStyle='#b03a3a';
     ctx.beginPath();ctx.arc(W*t.cx,H*t.cy,S*.008,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='rgba(255,255,255,.5)';
     ctx.beginPath();ctx.arc(W*t.cx-S*.002,H*t.cy-S*.002,S*.0028,0,Math.PI*2);ctx.fill();
   });
 },
 canvasElements:[
 ]},

];

if(typeof window.onOccTemplatesReady==="function")window.onOccTemplatesReady();
