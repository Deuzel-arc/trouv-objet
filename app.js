(() => {
  const $ = (id) => document.getElementById(id);
  const STORE = new URLSearchParams(location.search).has("dev") ? "trouvobjet-dev-v1" : "trouvobjet-demo-v2";
  const conditions = ["", "Correct", "Bon", "Très bon", "Neuf"];
  const demo = {
    inventory: [
      {id:"demo-ps5",title:"PlayStation 5",condition:3,price:280,city:"Montpellier",delivery:"either",demo:true},
      {id:"demo-coffee",title:"Cafetière expresso",condition:2,price:45,city:"Montpellier",delivery:"pickup",demo:true},
      {id:"demo-books",title:"Lot de livres",condition:2,price:20,city:"Montpellier",delivery:"either",demo:true}
    ],
    requests: [{id:"demo-request",title:"PlayStation 5",budget:300,condition:2,city:"Montpellier",delivery:"either",demo:true}],
    offers: [
      {id:"demo-offer-1",title:"PS5 + une manette",price:280,condition:2,city:"Montpellier",details:"Manette incluse · Remise en main propre",requestId:"demo-request",demo:true},
      {id:"demo-offer-2",title:"PS5 + un jeu",price:295,condition:3,city:"Montpellier",details:"Un jeu inclus · Livraison possible",requestId:"demo-request",demo:true},
      {id:"demo-offer-3",title:"PS5 seule",price:245,condition:1,city:"Montpellier",details:"Prix négociable · Retrait à proximité",requestId:"demo-request",demo:true}
    ]
  };
  let state = load();
  let pending = [];
  let currentPhoto = 0;
  let toastTimer;
  const clone = value => JSON.parse(JSON.stringify(value));
  function load(){
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if(saved && Array.isArray(saved.inventory) && Array.isArray(saved.requests) && Array.isArray(saved.offers)) {
        return {...clone(demo), ...saved, interested: Array.isArray(saved.interested) ? saved.interested : []};
      }
    } catch {}
    return {...clone(demo), interested:[]};
  }
  function save(){
    try { localStorage.setItem(STORE,JSON.stringify(state)); }
    catch { notify("Stockage plein : certaines photos sont peut-être trop volumineuses."); }
    render();
  }
  function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function notify(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
  function switchView(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name+"View"))}
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
  function render(){
    $("sellerCount").textContent=state.inventory.filter(x=>!x.demo).length;
    $("offerCount").textContent=state.offers.length;
    $("inventoryCount").textContent=state.inventory.length+" objet"+(state.inventory.length>1?"s":"");
    $("inventoryList").innerHTML=state.inventory.length?state.inventory.map(x=>'<div class="inventory-item">'+(x.image?'<img src="'+x.image+'" alt="">':'<div class="thumb">📦</div>')+'<div class="item-copy"><b>'+escapeHTML(x.title)+'</b><small>'+conditions[x.condition]+' · '+(x.price?x.price+" €":"Prix à discuter")+(x.demo?" · Exemple":"")+'</small></div><button class="remove-item" data-remove="'+x.id+'" aria-label="Retirer '+escapeHTML(x.title)+'">×</button></div>').join(""):'<div class="empty">Aucun objet pour le moment. Ajoute les photos de ce que tu souhaites vendre.</div>';
    document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{state.inventory=state.inventory.filter(x=>x.id!==b.dataset.remove);save();notify("Objet retiré de ta liste.")}));
    const requests=state.requests.filter(r=>state.inventory.some(i=>matches(i,r)));
    $("sellerRequests").innerHTML=requests.length?requests.map(r=>'<div class="request-item"><div class="request-copy"><b>'+escapeHTML(r.title)+'</b><small>Budget max '+r.budget+' € · '+escapeHTML(r.city)+' · État min. '+conditions[r.condition]+'</small></div><button class="button primary" data-reply="'+r.id+'">Proposer un prix</button></div>').join(""):'<div class="empty">Aucune demande correspondante pour le moment.</div>';
    document.querySelectorAll("[data-reply]").forEach(b=>b.addEventListener("click",()=>makeOffer(b.dataset.reply)));
    const visibleOffers = state.offers.filter(o=>!o.dismissed);
    $("offersList").innerHTML=visibleOffers.length?visibleOffers.map(o=>{
      const interested=state.interested.includes(o.id);
      return '<article class="offer-card" data-offer-card="'+o.id+'"><div class="offer-top"><b>'+escapeHTML(o.title)+'</b><span class="status-pill">'+(interested?"Intérêt envoyé":(o.demo?"Exemple":"Proposition"))+'</span></div><div class="offer-price">'+o.price+' €</div><p>'+conditions[o.condition]+' état déclaré · '+escapeHTML(o.city)+'<br>'+escapeHTML(o.details||"Détails à confirmer")+'</p><div class="offer-actions"><button class="button primary" data-interest="'+o.id+'" '+(interested?'disabled':'')+'>'+(interested?"Intérêt envoyé":"Ça m'intéresse")+'</button><button class="button quiet" data-decline="'+o.id+'">Passer</button></div></article>';
    }).join(""):'<div class="panel empty">Aucune proposition à afficher. Tu peux réinitialiser les données de test pour recommencer.</div>';
    document.querySelectorAll("[data-interest]").forEach(b=>b.addEventListener("click",()=>{
      if(!state.interested.includes(b.dataset.interest)) state.interested.push(b.dataset.interest);
      save();notify("Intérêt enregistré dans la démo. Aucun achat ni contact réel.");
    }));
    document.querySelectorAll("[data-decline]").forEach(b=>b.addEventListener("click",()=>{
      if(!confirm("Masquer cette proposition ?")) return;
      const offer=state.offers.find(o=>o.id===b.dataset.decline);
      if(offer) offer.dismissed=true;
      save();notify("Proposition masquée. Tu peux réinitialiser la démo pour la retrouver.");
    }));
    // Glisser une carte : droite = intéressé, gauche = passer. Les boutons restent accessibles.
    document.querySelectorAll("[data-offer-card]").forEach(card=>{
      let startX=0,startY=0,dragging=false;
      card.addEventListener("pointerdown",e=>{
        if(e.target.closest("button"))return;
        startX=e.clientX;startY=e.clientY;dragging=true;card.setPointerCapture(e.pointerId);card.classList.add("swiping");
      });
      card.addEventListener("pointermove",e=>{
        if(!dragging)return;
        const dx=e.clientX-startX,dy=e.clientY-startY;
        if(Math.abs(dx)>Math.abs(dy)){card.style.transform="translateX("+dx+"px) rotate("+(dx/24)+"deg)";card.style.opacity=String(Math.max(.55,1-Math.abs(dx)/360));}
      });
      const finish=e=>{
        if(!dragging)return;dragging=false;card.classList.remove("swiping");
        const dx=e.clientX-startX;
        card.style.transform="";card.style.opacity="";
        if(Math.abs(dx)>95){
          const id=card.dataset.offerCard;
          if(dx>0){
            if(!state.interested.includes(id)) state.interested.push(id);
            save();notify("Intérêt enregistré. Aucun achat n'est engagé.");
          } else if(confirm("Masquer cette proposition ?")){
            const offer=state.offers.find(o=>o.id===id);
            if(offer) offer.dismissed=true;
            save();notify("Proposition masquée.");
          }
        }
      };
      card.addEventListener("pointerup",finish);card.addEventListener("pointercancel",()=>{dragging=false;card.classList.remove("swiping");card.style.transform="";card.style.opacity="";});
    });
  }
  function matches(item,request){
    const title=String(item.title||"").toLocaleLowerCase("fr");
    const wanted=String(request.title||"").toLocaleLowerCase("fr");
    const sameCity=!item.city||!request.city||item.city.toLocaleLowerCase("fr")===request.city.toLocaleLowerCase("fr")||item.city==="À préciser";
    const deliveryOk=request.delivery==="either"||item.delivery==="either"||item.delivery===request.delivery;
    return (title.includes(wanted)||wanted.includes(title)) &&
      (!item.price||item.price<=request.budget) &&
      Number(item.condition)>=Number(request.condition) && sameCity && deliveryOk;
  }
  $("requestForm").addEventListener("submit",e=>{
    e.preventDefault();
    const request={id:"r-"+Date.now(),title:$("requestName").value.trim(),budget:Number($("requestBudget").value),condition:Number($("requestCondition").value),city:$("requestCity").value.trim(),delivery:$("requestDelivery").value};
    if(!request.title||!request.city||!request.budget||request.budget<1){notify("Vérifie l'objet, le budget et la ville.");return}
    state.requests.unshift(request);save();
    const count=state.inventory.filter(i=>matches(i,request)).length;
    $("requestResult").hidden=false;
    $("requestResult").innerHTML='<b>Recherche enregistrée !</b><br>'+count+' objet(s) correspondent dans les données de cette démo. Les vendeurs ne sont pas réellement notifiés.';
    notify("Ta recherche est prête dans cette démonstration.");
  });
  let files=[];
  $("photoInput").addEventListener("change",e=>{
    files=Array.from(e.target.files||[]).map(file=>({file,url:URL.createObjectURL(file),name:file.name}));
    currentPhoto=0;renderPhotoEditor();renderPhotoQueue();
  });
  function renderPhotoQueue(){$("photoQueue").innerHTML=files.map((f,i)=>'<img class="photo-chip '+(i===currentPhoto?"selected":"")+'" src="'+f.url+'" alt="Photo '+(i+1)+'" data-photo="'+i+'">').join("");document.querySelectorAll("[data-photo]").forEach(el=>el.addEventListener("click",()=>{currentPhoto=Number(el.dataset.photo);renderPhotoEditor();renderPhotoQueue()}))}
  function renderPhotoEditor(){
    const f=files[currentPhoto];$("photoEditor").hidden=!f;if(!f)return;
    $("photoFileName").textContent=f.name;$("photoLarge").src=f.url;$("photoLarge").alt="Aperçu de "+f.name;
    $("productTitle").value=f.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase());$("productPrice").value="";
  }
  function finishPhoto(keep){
    const f=files[currentPhoto];if(!f)return;
    if(keep){const title=$("productTitle").value.trim();if(!title){notify("Ajoute un nom à cet objet.");return}
      const canvas=document.createElement("canvas"),img=$("photoLarge"),max=720,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
      const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);
      state.inventory.unshift({id:"p-"+Date.now()+"-"+currentPhoto,title,condition:Number($("productCondition").value),price:Number($("productPrice").value)||0,city:$("requestCity").value.trim()||"À préciser",delivery:"either",image:canvas.toDataURL("image/jpeg",.72)});
    }
    URL.revokeObjectURL(f.url);files.splice(currentPhoto,1);if(currentPhoto>=files.length)currentPhoto=Math.max(0,files.length-1);
    renderPhotoQueue();renderPhotoEditor();save();if(!files.length){$("photoInput").value="";notify(keep?"Objet ajouté à tes objets.":"Photo ignorée.")}
  }
  $("confirmPhoto").addEventListener("click",()=>finishPhoto(true));$("skipPhoto").addEventListener("click",()=>finishPhoto(false));
  function makeOffer(requestId){
    const req=state.requests.find(r=>r.id===requestId);if(!req)return;
    const candidates=state.inventory.filter(i=>matches(i,req));if(!candidates.length){notify("Aucun objet ne correspond à cette demande.");return}
    const item=candidates[0],raw=prompt("Quel prix veux-tu proposer pour "+item.title+" ? Budget acheteur : "+req.budget+" €",String(item.price||req.budget));
    if(raw===null)return;const price=Number(raw);if(!Number.isFinite(price)||price<=0){notify("Entre un prix valide.");return}
    const details=prompt("Ajoute un avantage ou une précision (facultatif) :","Remise en main propre possible")||"Détails à confirmer";
    state.offers.unshift({id:"o-"+Date.now(),title:item.title,price,condition:item.condition,city:item.city||req.city,details,requestId});
    save();switchView("offers");notify("Ta proposition a été ajoutée à la démo.");
  }
  const resetButton=$("resetDemo");
  if(resetButton) resetButton.addEventListener("click",()=>{
    if(!confirm("Réinitialiser la démo ? Tes recherches, objets et propositions de test seront effacés.")) return;
    state={...clone(demo),interested:[]};
    try { localStorage.removeItem(STORE); } catch {}
    save();$("requestResult").hidden=true;notify("Démo réinitialisée avec les exemples.");
  });
  render();
})();