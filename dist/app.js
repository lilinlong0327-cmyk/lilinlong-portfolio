
"use strict";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const roleData = {
  admin: {label:"总仓管理员",title:"高频任务，\n集中处理。",copy:"将待审批申请、今日仓配和总仓库存放在同一入口，按日常任务组织页面。",src:"assets/role-admin.png",alt:"管理员工作台测试页面"},
  boss: {label:"老板工作台",title:"跨店状态，\n一眼有数。",copy:"优先展示门店概况、库存预警和协作入口，方便从整体状态找到需要处理的事项。",src:"assets/role-boss.png",alt:"老板工作台测试页面"},
  store: {label:"门店员工",title:"关注当班，\n看见本店。",copy:"从今日排班、本店概览和申请动态出发，减少与当前门店无关的信息。",src:"assets/role-store.png",alt:"门店员工工作台测试页面"}
};
const flowData = [
  ["“岩茶、茉莉茶、乌龙茶各 1 包。”","支持员工习惯的自然表达，再把商品、数量和单位整理为可核对的信息。"],
  ["“是哪个门店？这次是要货还是入库？”","门店、物料或操作不明确时先询问，避免把“记录库存”与“新增入库”混淆。"],
  ["先核对商品、数量、单位，再确认。","将整理后的信息展示给用户。未识别或有歧义的条目标记出来，确认前不修改库存。"],
  ["明确确认后，进入对应业务流程。","结合身份、角色权限和业务规则处理请求。取得真实处理结果后，再向用户反馈。"]
];
Object.values(roleData).forEach(data => {const img = new Image();img.src = data.src;});
let roleKey = "admin";
const animations = new WeakMap();
function fade(element) {
  animations.get(element)?.cancel();
  if (reduceMotion.matches) return;
  animations.set(element,element.animate([{opacity:.35,transform:"translateY(4px)"},{opacity:1,transform:"none"}],{duration:240,easing:"cubic-bezier(.22,.8,.3,1)"}));
}
function setupTabs(selector,onChange) {
  const group = document.querySelector(selector);
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  function select(tab) {
    if(tab.getAttribute("aria-selected")==="true") return;
    tabs.forEach(t=>{const active=t===tab;t.setAttribute("aria-selected",String(active));t.tabIndex=active?0:-1;});
    onChange(tab);
  }
  tabs.forEach(tab=>{
    tab.addEventListener("click",()=>select(tab));
    tab.addEventListener("keydown",event=>{
      let index=tabs.indexOf(tab);
      if(event.key==="ArrowRight") index=(index+1)%tabs.length;
      else if(event.key==="ArrowLeft") index=(index-1+tabs.length)%tabs.length;
      else if(event.key==="Home") index=0;
      else if(event.key==="End") index=tabs.length-1;
      else return;
      event.preventDefault();tabs[index].focus();select(tabs[index]);
    });
  });
}
setupTabs(".role-tabs",tab=>{
  roleKey=tab.dataset.role;const data=roleData[roleKey];
  document.querySelector("#role-image").src=data.src;
  document.querySelector("#role-image").alt=data.alt;
  document.querySelector("#role-label").textContent=data.label;
  const title=document.querySelector("#role-title");
  title.replaceChildren(...data.title.split("\n").flatMap((line,index)=>index?[document.createElement("br"),document.createTextNode(line)]:[document.createTextNode(line)]));
  document.querySelector("#role-copy").textContent=data.copy;
  document.querySelector("#role-panel").setAttribute("aria-labelledby",tab.id);
  document.querySelector("#role-zoom").setAttribute("aria-label","放大"+data.alt);
  fade(document.querySelector("#role-panel"));
});
setupTabs(".flow-tabs",tab=>{
  const data=flowData[Number(tab.dataset.step)];
  document.querySelector("#flow-example").textContent=data[0];
  document.querySelector("#flow-description").textContent=data[1];
  document.querySelector("#flow-panel").setAttribute("aria-labelledby",tab.id);
  fade(document.querySelector("#flow-panel"));
});
const panelAnimations=new WeakMap();
document.querySelectorAll(".case-trigger").forEach(button=>{
  const panel=document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click",()=>{
    const willOpen=button.getAttribute("aria-expanded")!=="true";
    const from=panel.hidden?0:panel.getBoundingClientRect().height;
    panelAnimations.get(panel)?.cancel();
    button.setAttribute("aria-expanded",String(willOpen));
    panel.hidden=false;panel.inert=!willOpen;
    const to=willOpen?panel.scrollHeight:0;
    if(reduceMotion.matches){panel.hidden=!willOpen;return;}
    const animation=panel.animate([{height:from+"px",opacity:willOpen?.35:1},{height:to+"px",opacity:willOpen?1:0}],{duration:280,easing:"cubic-bezier(.22,.8,.3,1)"});
    panelAnimations.set(panel,animation);
    animation.finished.then(()=>{
      if(panelAnimations.get(panel)!==animation)return;
      panel.hidden=button.getAttribute("aria-expanded")!=="true";
      panelAnimations.delete(panel);
    }).catch(()=>{});
  });
});
const dialog=document.querySelector("#image-dialog");
const largeImage=document.querySelector("#large-image");
const closeButton=document.querySelector("#close-dialog");
let opener=null;
let closeAnimation=null;
function openImage(src,caption,trigger) {
  if(dialog.open)return;
  opener=trigger;largeImage.src=src;largeImage.alt=caption;
  document.querySelector("#image-dialog-title").textContent=caption;
  document.body.classList.add("modal-open");
  dialog.showModal();
  document.querySelector(".dialog-image-area").scrollTop=0;
  closeButton.focus({preventScroll:true});
  if(!reduceMotion.matches)dialog.animate([{opacity:0,transform:"translateY(7px)"},{opacity:1,transform:"none"}],{duration:200,easing:"ease-out"});
}
async function closeImage(){
  if(!dialog.open||closeAnimation)return;
  if(!reduceMotion.matches){
    closeAnimation=dialog.animate([{opacity:1},{opacity:0}],{duration:150,easing:"ease-in"});
    await closeAnimation.finished.catch(()=>{});
  }
  dialog.close();document.body.classList.remove("modal-open");
  closeAnimation=null;opener?.focus({preventScroll:true});
}
document.querySelector("#role-zoom").addEventListener("click",event=>openImage(roleData[roleKey].src,roleData[roleKey].alt+"｜试用或合成数据",event.currentTarget));
document.querySelectorAll("[data-lightbox]").forEach(button=>button.addEventListener("click",()=>openImage(button.dataset.lightbox,button.dataset.caption,button)));
closeButton.addEventListener("click",closeImage);
dialog.addEventListener("cancel",event=>{event.preventDefault();closeImage();});
dialog.addEventListener("click",event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeImage();
});
dialog.addEventListener("close",()=>document.body.classList.remove("modal-open"));
const navLinks=[...document.querySelectorAll("nav a")];
function updateNav(){
  let current=null;
  navLinks.forEach(link=>{const section=document.querySelector(link.getAttribute("href"));if(section.getBoundingClientRect().top<=150)current=link;});
  navLinks.forEach(link=>{if(link===current)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
}
let navPending=false;
window.addEventListener("scroll",()=>{if(navPending)return;navPending=true;requestAnimationFrame(()=>{updateNav();navPending=false;});},{passive:true});
updateNav();

