import{a as d}from"./axios-4b953329.js";const i=window.config.adminApi,c=window.config.apiPath,l=window.config.token;let o=[];const h=document.querySelector(".orderList"),u=async()=>{try{o=(await d.get(`${i}/${c}/orders`,{headers:{Authorization:`${l}`}})).data.orders,$(),f()}catch(e){console.log(e)}},f=()=>{let e={};o.forEach(s=>{s.products.forEach(a=>{e[a.title]=(e[a.title]||0)+a.price*a.quantity})});const t=Object.entries(e);let r=[];if(r=t.sort((s,a)=>a[1]-s[1]),r.length>3){let s=0;r.forEach((a,n)=>{n>2&&(s+=a[1])}),r.splice(3,r.length-1),r.push(["其他",s])}c3.generate({bindto:"#chart",data:{type:"pie",columns:r},color:{pattern:["#DACBFF","#9D7FEA","#5434A7","#301E5F"]}})},p=document.querySelector(".discardAllBtn"),$=()=>{const e=o.map(t=>{const r=t.products.map(n=>`<p>${n.title} * ${n.quantity}</p>`).join(""),s=t.paid?"已處理":"未處理",a=new Date(t.createdAt*1e3).toLocaleDateString();return`
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
            <td>${a}</td>
            <td class="orderStatus">
              <a href="#" class="status" data-status="${t.paid}" data-id="${t.id}">${s}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${t.id}">
            </td>
          </tr>
  `}).join("");h.innerHTML=e,o.length===0?p.classList.add("d-none"):p.classList.remove("d-none")},g=async(e,t,r)=>{const s=e!=="true";try{await d.put(`${i}/${c}/orders`,{data:{id:t,paid:s}},{headers:{Authorization:`${l}`}}),u()}catch(a){console.log(a)}finally{r.classList.remove("disabled")}},L=async(e,t)=>{try{await d.delete(`${i}/${c}/orders/${e}`,{headers:{Authorization:`${l}`}}),u()}catch(r){console.log(r)}finally{t.classList.remove("disabled")}};p.addEventListener("click",e=>{e.preventDefault();const t=e.target;if(e.target.classList.contains("discardAllBtn"))Swal.fire({title:"您確定要刪除全部訂單?",text:"刪除後將無法恢復！",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",cancelButtonText:"取消",confirmButtonText:"確定刪除"}).then(r=>{r.isConfirmed&&(Swal.fire({title:"已成功刪除全部訂單",text:"訂單已清空",icon:"success"}),t.classList.add("disabled"),A(t))});else return});const A=async e=>{try{await d.delete(`${i}/${c}/orders`,{headers:{Authorization:`${l}`}}),u()}catch(t){console.log(t)}finally{e.classList.remove("disabled")}};h.addEventListener("click",e=>{e.preventDefault();const t=e.target,r=t.getAttribute("data-id");if(t.classList.contains("delSingleOrder-Btn")&&(t.classList.add("disabled"),L(r,t)),t.classList.contains("status")){const s=t.getAttribute("data-status");t.classList.add("disabled"),g(s,r,t)}});const y=()=>{u()};y();
