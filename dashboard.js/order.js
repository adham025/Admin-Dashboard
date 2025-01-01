import { firebaseConfig } from "../config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as imageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getDatabase();

let ordersRef = ref(db, "finalOrders/");
get(ordersRef)
  .then((snapshot) => {
    let data = snapshot.val();

    if (data) {
      display(data);
    } else {
      console.log("No orders found or data is undefined");
      document.getElementById("tOrdersBody").innerHTML =
        "<tr><td colspan='7' style='text-align: center;'>No orders found.</td></tr>";
    }
  })
  .catch((error) => {
    console.error("Error fetching orders:", error);
  });

function display(data) {
  let tbody = document.getElementById("tOrdersBody");
  let categoriesSection = document.querySelector(".categoriesSection");
  let count = 0;
  let box = "";
  console.log(data);

  if (data) {
    for (let key in data) {
      const order = data[key];

      for (let item in order) {
        console.log(order[item]);

        let productList = order[item].products
          .map(
            (product) => `
          <div class="itemo">
            <div>
              <img src="${product.image}"/>
            </div>
            <div class="first">
                <div>
              <h4>${product.name}</h4>
              <section>
                <strong>Total: ${order[item].finalTotalToReceive}</strong>
              </section>
              <section>
                <strong>Shipping: ${order[item].finalShippingToReceive}</strong>
              </section>
              <section>
                <strong>Order Date: ${order[item].orderDate}</strong>
              </section>
            </div>
            
            
            </div>
          </div>
        `
          )
          .join("");

        box += `
            <div class="orderBorder">
              <div class="orderTitle">
                    <article>
                      <span>
                        Order Id:
                      </span>
                      <h4>${item}</h4>
                  </article>

                  <article>
                      <span>
                        Username:
                      </span>
                      <h4>${order[item].firstName}</h4>
                  </article>

                  <article>
                      <span>
                        User email:
                      </span>
                      <h4>${order[item].email}</h4>
                  </article>

                  <article>
                      <span>
                        Address:
                      </span>
                      <h4>${order[item].town}</h4>
                  </article>
                  <article>
                      <span>
                        Total:
                      </span>
                      <h4>${order[item].finalTotalToReceive}</h4>
                  </article>
                  <select data-current-status="${
                    order[item].orderStatus
                  }" onchange="changeStatus(event, '${key}' ,'${item}')">
                    <option value="pending" ${
                      order[item].orderStatus === "pending" ? "selected" : ""
                    }>Pending</option>
                    <option value="approved" ${
                      order[item].orderStatus === "approved" ? "selected" : ""
                    }>Approved</option>
                    <option value="declined" ${
                      order[item].orderStatus === "declined" ? "selected" : ""
                    }>Declined</option>
                  </select>
              </div>
              
              
              <div class="d-flexa">${productList}</div>

            </div>`;
      }

      categoriesSection.innerHTML = box;
    }
  } else {
    categoriesSection.innerHTML =
      "<h2 style='text-align: center'>No orders found.</h2>";
  }
}

window.changeStatus = async (e, usrId, orderId) => {
  const newStatus = e.target.value;
  console.log(orderId);

  const orderRef = ref(db, `finalOrders/${usrId}/${orderId}`);
  update(orderRef, { orderStatus: newStatus })
    .then(() => {
      sweetOrder();
    })
    .catch((error) => {
      console.error("Error updating status:", error);
    });
};

function sweetOrder() {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: "success",
    title: "order status changed successfully",
  });
}

window.onload = () => {
  get(ordersRef)
    .then((snapshot) => {
      let data = snapshot.val();

      if (data) {
        display(data);
      } else {
        console.log("No orders found or data is undefined");
        document.getElementById("tOrdersBody").innerHTML =
          "<tr><td colspan='7' style='text-align: center;'>No orders found.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
    });
};
