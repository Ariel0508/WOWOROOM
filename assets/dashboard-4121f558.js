import{a as o}from"./axios-968179a1.js";const n=window.config.adminApi,i=window.config.apiPath,c=window.config.token;let u=[];const p=document.querySelector(".orderList"),l=async()=>{try{u=(await o.get(`${n}/${i}/orders`,{headers:{Authorization:`${c}`}})).data.orders,h(),$()}catch(e){console.log(e)}},$=()=>{let e={};u.forEach(a=>{a.products.forEach(s=>{e[s.title]=(e[s.title]||0)+s.price*s.quantity})});const t=Object.entries(e);let r=[];if(r=t.sort((a,s)=>s[1]-a[1]),r.length>3){let a=0;r.forEach((s,d)=>{d>2&&(a+=s[1])}),r.splice(3,r.length-1),r.push(["其他",a])}c3.generate({bindto:"#chart",data:{type:"pie",columns:r},color:{pattern:["#DACBFF","#9D7FEA","#5434A7","#301E5F"]}})},h=()=>{const e=u.map(t=>{const r=t.products.map(d=>`<p>${d.title} * ${d.quantity}</p>`).join(""),a=t.paid?"已處理":"未處理",s=new Date(t.createdAt*1e3).toLocaleDateString();return`
  <tr>
            <td>${t.id}</td>
            <td>
              <p>${t.user.name}</p>
              <p>${t.user.tel}</p>
            </td>
            <td>${t.user.address}</td>
            <td>${t.user.email}</td>
            <td>
              <p>${r}</p>
            </td>
            <td>${s}</td>
            <td class="orderStatus">
              <a href="#" class="status" data-status="${t.paid}" data-id="${t.id}">${a}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${t.id}">
            </td>
          </tr>
  `}).join("");p.innerHTML=e},g=async(e,t,r)=>{const a=e!=="true";try{await o.put(`${n}/${i}/orders`,{data:{id:t,paid:a}},{headers:{Authorization:`${c}`}}),l()}catch(s){console.log(s)}finally{r.classList.remove("disabled")}},f=async(e,t)=>{try{await o.delete(`${n}/${i}/orders/${e}`,{headers:{Authorization:`${c}`}}),l()}catch(r){console.log(r)}finally{t.classList.remove("disabled")}},y=document.querySelector(".discardAllBtn");y.addEventListener("click",e=>{e.preventDefault();const t=e.target;t.classList.add("disabled"),A(t)});const A=async e=>{try{await o.delete(`${n}/${i}/orders`,{headers:{Authorization:`${c}`}}),l()}catch(t){console.log(t)}finally{e.classList.remove("disabled")}};p.addEventListener("click",e=>{e.preventDefault();const t=e.target,r=t.getAttribute("data-id");if(t.classList.contains("delSingleOrder-Btn")&&(t.classList.add("disabled"),f(r,t)),t.classList.contains("status")){const a=t.getAttribute("data-status");t.classList.add("disabled"),g(a,r,t)}});const L=()=>{l()};L();
