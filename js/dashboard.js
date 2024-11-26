import axios from "axios";
const adminApi = window.config.adminApi;
const apiPath = window.config.apiPath;
const token = window.config.token;

// 獲取訂單
let orderData = [];
const orderList = document.querySelector(".orderList");
const getOrderList = async () => {
  try {
    const res = await axios.get(`${adminApi}/${apiPath}/orders`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    orderData = res.data.orders;
    renderOrderList();
    renderChart();
  } catch (error) {
    console.log(error);
  }
};
// 渲染圖表
const renderChart = () => {
  // 計算每個分類的總銷售額
  // c3 LV 1
  // let total = {};
  // orderData.forEach((item) => {
  //   item.products.forEach((product) => {
  //     total[product.category] =
  //       (total[product.category] || 0) + product.price * product.quantity;
  //   });
  // });
  // const newArr = Object.entries(total);
  let obj = {};
  orderData.forEach((item) => {
    item.products.forEach((product) => {
      obj[product.title] =
        (obj[product.title] || 0) + product.price * product.quantity;
    });
  });
  
  const newArr = Object.entries(obj);
  
  let sortArr = [];
  // 判斷是否超過四筆，並排序，只顯示前三其餘歸為其他
  sortArr = newArr.sort((a, b) => b[1] - a[1]);
  if (sortArr.length > 3) {
    let otherTotal = 0;
    sortArr.forEach((item, index) => {
      if (index > 2) {
        otherTotal += item[1];
      }
    });
    sortArr.splice(3, sortArr.length - 1);
    sortArr.push(["其他", otherTotal]);
  }
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      // c3 LV 1
      // columns: newArr,
      columns: sortArr,
    },
    // c3 LV 1
    // colors: {
    //   床架: "#DACBFF",
    //   窗簾: "#9D7FEA",
    //   收納: "#5434A7",
    //   其他: "#301E5F",
    // },
    color:{
      pattern:["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
    },
  });
};
// 渲染訂單
const renderOrderList = () => {
  const orderListHtml = orderData
    .map((item) => {
      // 產品
      const orderProductHtml = item.products
        .map((product) => {
          return `<p>${product.title} * ${product.quantity}</p>`;
        })
        .join("");

      // 訂單狀態
      const orderStatus = item.paid ? "已處理" : "未處理";

      // 格式化日期
      const orderDate = new Date(item.createdAt * 1000).toLocaleDateString();

      return `
  <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${orderProductHtml}</p>
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
              <a href="#" class="status" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
            </td>
          </tr>
  `;
    })
    .join("");
  orderList.innerHTML = orderListHtml;
};
// 修改訂單
const updateOrder = async (status, id, btn) => {
  // 若 status 為 true，改為 false
  const paid = status === "true" ? false : true;
  try {
    await axios.put(
      `${adminApi}/${apiPath}/orders`,
      {
        data: {
          id,
          paid,
        },
      },
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    getOrderList();
  } catch (error) {
    console.log(error);
  } finally {
    btn.classList.remove("disabled");
  }
};
// 刪除訂單
const discardOrder = async (id, btn) => {
  try {
    await axios.delete(`${adminApi}/${apiPath}/orders/${id}`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    getOrderList();
  } catch (error) {
    console.log(error);
  } finally {
    btn.classList.remove("disabled");
  }
};
// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target;
  btn.classList.add("disabled");
  discardAllOrder(btn);
});
const discardAllOrder = async (btn) => {
  try {
    await axios.delete(`${adminApi}/${apiPath}/orders`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    getOrderList();
  } catch (error) {
    console.log(error);
  } finally {
    btn.classList.remove("disabled");
  }
};
// 監聽修改、刪除單一訂單
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target;
  const id = btn.getAttribute("data-id");
  if (btn.classList.contains("delSingleOrder-Btn")) {
    btn.classList.add("disabled");
    discardOrder(id, btn);
  }
  if (btn.classList.contains("status")) {
    const status = btn.getAttribute("data-status");
    btn.classList.add("disabled");
    updateOrder(status, id, btn);
  }
});

const init = () => {
  getOrderList();
};

init();
