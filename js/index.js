import axios from "axios";
import validate from "validate.js";
import { formatNumber, Toast } from "./util.js";


document.addEventListener("DOMContentLoaded", function () {
  const ele = document.querySelector(".recommendation-wall");
  ele.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function (e) {
    ele.style.cursor = "grabbing";
    ele.style.userSelect = "none";

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };
  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener("mousedown", mouseDownHandler);
});
// menu 切換
let menuOpenBtn = document.querySelector(".menuToggle");
let linkBtn = document.querySelectorAll(".topBar-menu a");
let menu = document.querySelector(".topBar-menu");
menuOpenBtn.addEventListener("click", menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener("click", closeMenu);
});

function menuToggle() {
  if (menu.classList.contains("openMenu")) {
    menu.classList.remove("openMenu");
  } else {
    menu.classList.add("openMenu");
  }
}
function closeMenu() {
  menu.classList.remove("openMenu");
}

// 獲取資料
const customerApi = window.config.customerApi;
const apiPath = window.config.apiPath;
let products = [];
let carts = [];
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartsList = document.querySelector(".shoppingCart-body");
const shoppingCartFoot = document.querySelector(".shoppingCart-foot");
// 取得產品資料
const getData = async () => {
  try {
    const res = await axios.get(`${customerApi}/${apiPath}/products`);
    products = res.data.products;
    renderProduct(products);
  } catch (err) {
    console.log(err);
  }
};
// 渲染產品
const renderProduct = (productsToRender) => {
  const productHtml = productsToRender
    .map((item) => {
      return `
     <li class="productCard">
        <h4 class="productType">${item.category}</h4>
        <img src="${item.images}" alt="${item.title}">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${formatNumber(item.origin_price)}</del>
        <p class="nowPrice">NT$${formatNumber(item.price)}</p>
     </li>`;
    })
    .join("");

  productList.innerHTML = productHtml;
};
// 篩選產品
productSelect.addEventListener("change", (e) => {
  const category = e.target.value;
  if (category === "全部") {
    renderProduct(products);
    return;
  }

  const filteredProducts = products.filter(
    (item) => item.category === category
  );
  renderProduct(filteredProducts); // 傳遞篩選後的數組
});
//取得購物車
const getCarts = async () => {
  try {
    const res = await axios.get(`${customerApi}/${apiPath}/carts`);
    carts = res.data;
    // carts = res.data.carts;
    renderCarts(carts);
  } catch (err) {
    console.log(err);
  }
};
// 渲染購物車
const renderCarts = (cartsToRender) => {
  const cartsHtml = cartsToRender.carts
    .map((item) => {
      return `
      <tr>
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="${item.product.title}">
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${formatNumber(item.product.price)}</td>
              <td>
              <button type="button" class="decreaseBtn" data-id="${
                item.id
              }" data-quantity="${item.quantity}">-</button>
              ${item.quantity}
              <button type="button" class="increaseBtn" data-id="${
                item.id
              }" data-quantity="${item.quantity}">+</button>
              </td>
              <td>NT$${formatNumber(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                  clear
                </a>
              </td>
            </tr>
    `;
    })
    .join("");
  cartsList.innerHTML = cartsHtml;

  if (cartsToRender.carts.length === 0) {
    shoppingCartFoot.innerHTML = `<tr>
    <td colspan='5' class='emptyCart'>
    購物車還沒有商品呦！
    </td>
    </tr>`;
  } else {
    shoppingCartFoot.innerHTML = `
     <tr>
              <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td>NT$${formatNumber(cartsToRender.finalTotal)}</td>
            </tr>
    `;
  }
};
// 加入購物車
const addCart = async (id, btn) => {
  let qty = 1;
  // 檢查購物車是否有已有該產品，有就+1沒有就為1
  const isExist = carts.carts.find((item) => item.product.id === id);
  if (isExist) {
    qty = isExist.quantity += 1;
  }
  const data = {
    data: {
      productId: id,
      quantity: qty,
    },
  };
  try {
    await axios.post(`${customerApi}/${apiPath}/carts`, data);
    Toast.fire({
      icon: "success",
      title: "成功加入購物車"
    });
    getCarts();
  } catch (err) {
    console.log(err);
  } finally {
    btn.classList.remove("disabled");
  }
};
productList.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target;
  if (e.target.classList.contains("addCardBtn")) {
    const id = e.target.getAttribute("data-id");
    btn.classList.add("disabled");
    addCart(id, btn);
  }
});
// 編輯購物車產品數量
const updateCart = async (id, quantity, btn) => {
  const data = {
    data: {
      id,
      quantity,
    },
  };
  try {
    await axios.patch(`${customerApi}/${apiPath}/carts`, data);
    getCarts();
  } catch (err) {
    console.log(err);
  } finally {
    btn.classList.remove("disabled"); // 請求完成後啟用按鈕
  }
};
cartsList.addEventListener("click", (e) => {
  const btn = e.target;

  if (
    !btn.classList.contains("increaseBtn") &&
    !btn.classList.contains("decreaseBtn")
  )
    return;

  const id = btn.getAttribute("data-id");
  let qty = parseInt(btn.getAttribute("data-quantity"), 10);

  if (btn.classList.contains("increaseBtn")) {
    qty += 1; // 增加數量
  } else if (btn.classList.contains("decreaseBtn")) {
    if (qty <= 1) {
      discardItem(id); // 刪除商品
      return;
    }
    qty -= 1; // 減少數量
  }

  btn.setAttribute("data-quantity", qty); // 更新 DOM 的數量屬性
  btn.classList.add("disabled"); // 禁用按鈕
  updateCart(id, qty, btn); // 發送更新請求
});
// 刪除購物車單一品項
const discardItem = async (id, btn) => {
  try {
    await axios.delete(`${customerApi}/${apiPath}/carts/${id}`);
    btn.classList.remove("disabled");
    getCarts();
  } catch (err) {
    console.log(err);
  }
};
cartsList.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target;
  if (e.target.classList.contains("material-icons")) {
    const id = e.target.getAttribute("data-id");
    btn.classList.add("disabled");
    discardItem(id, btn);
  }
});
// 刪除購物車全部品項
const discardAll = async (btn) => {
  try {
    await axios.delete(`${customerApi}/${apiPath}/carts`);
    btn.classList.remove("disabled");
    getCarts();
  } catch (err) {
    console.log(err);
  }
};
shoppingCartFoot.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target;
  if (e.target.classList.contains("discardAllBtn")) {
    Swal.fire({
      title: "您確定要刪除所有品項?",
      text: "刪除後將無法恢復！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "取消",
      confirmButtonText: "確定刪除"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "已成功刪除所有品項",
          text: "購物車已清空",
          icon: "success"
        });
        btn.classList.add("disabled");
        discardAll(btn);
      }
    });
   
  } else {
    return;
  }
});
// 送出訂單
const orderInfoForm = document.querySelector(".orderInfo-form");
// 表單驗證函數
const checkValue = () => {
  const constraints = {
    姓名: {
      presence: {
        message: "是必填欄位",
      },
    },
    電話: {
      presence: {
        message: "是必填欄位",
      },
      format: {
        pattern: /^(09)[0-9]{8}$/,
        message: "號碼格式錯誤",
      },
    },
    Email: {
      presence: {
        message: "是必填欄位",
      },
      email: {
        message: "格式有誤",
      },
    },
    寄送地址: {
      presence: { message: "是必填欄位" },
      format: {
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s,.-]{5,}$/,
        message: "請輸入詳細地址（包含街道、門牌號等）",
      },
    },
  };
  const errors = validate(orderInfoForm, constraints);
  console.log(errors);

  displayErrors(errors);
  return errors;
};
// 顯示錯誤信息
const displayErrors = (errors) => {
  const errorAry = Object.keys(errors || {});
  errorAry.forEach((item) => {
    const message = document.querySelector(`[data-message="${item}"]`);
    message.textContent = errors[item][0];
  });
};
// 監聽輸入變化的事件
const inputs = document.querySelectorAll("input[name]");
inputs.forEach((item) => {
  item.addEventListener("change", () => {
    item.nextElementSibling.textContent = "";
    checkValue();
  });
});
// 送出訂單
const sendOrder = async () => {
  try {
    await axios.post(`${customerApi}/${apiPath}/orders`, {
      data: {
        user: {
          name: document.querySelector("#customerName").value.trim(),
          tel: document.querySelector("#customerPhone").value.trim(),
          email: document.querySelector("#customerEmail").value.trim(),
          address: document.querySelector("#customerAddress").value.trim(),
          payment: document.querySelector("#tradeWay").value.trim(),
        },
      },
    });
    // SweetAlert 成功提示
    Swal.fire({
      icon: "success",
      title: "成功送出訂單",
      text: "感謝您的訂購！我們將盡快處理您的訂單。",
      confirmButtonText: "確定",
    });
    orderInfoForm.reset();
    getCarts();
  } catch (err) {
    console.log(err);
  }
};
orderInfoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (carts.carts.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "購物車內無商品",
      text: "請先將商品加入購物車再送出訂單。",
      confirmButtonText: "確定",
    });
    return;
  }
  if (checkValue()) return;
  sendOrder();
});

const init = () => {
  getData();
  getCarts();
};

init();
