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

let couponName = document.getElementById("couponName");
let coupIdError = document.getElementById("coupIdError");
let couponDate = document.getElementById("couponDate");
let coupDateError = document.getElementById("coupDateError");
let coupForm = document.getElementById("coupon-form");

couponName.addEventListener("focus", () => {
  couponName.style.border = "solid 1px #007bff";
  coupIdError.style.display = "none";
});

couponName.addEventListener("blur", () => {
  couponValidation();
});

function couponValidation() {
  couponName.style.border = "";

  if (couponName.value.length !== 8 && couponName.value !== "") {
    coupIdError.style.display = "inline";
    return false;
  } else {
    coupIdError.style.display = "none";
    return true;
  }
}

coupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!couponValidation()) {
    return;
  }
  if (!couponDate.value) {
    coupDateError.innerText = "Date is required.";
    coupDateError.style.display = "block";
    return;
  } else {
    coupDateError.style.display = "none";
  }

  let couponNameValue = couponName.value.trim();
  let couponDateValue = couponDate.value.trim();

  if (couponNameValue && couponDateValue) {
    await writeCouponData(couponNameValue, couponDateValue);
    coupForm.reset();
  } else {
    if (!couponNameValue) {
      coupIdError.style.display = "inline";
    }
    if (!couponDateValue) {
      coupDateError.innerText = "Date is required.";
      coupDateError.style.display = "block";
    }
  }
});

window.deleteCoupon = function (couponId) {
  let couponRef = ref(db, `coupons/${couponId}`);

  get(couponRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        remove(couponRef)
          .then(async () => {
            let Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
            Toast.fire({
              icon: "success",
              title: "Deleted Successfully",
            });
            getCoupons();
          })
          .catch((error) => {
            console.error("Error deleting coupon:", error);
            Swal.fire({
              title: "Error!",
              text: `There was an error deleting the coupon: ${error.message}`,
              icon: "error",
              confirmButtonText: "Try Again",
            });
          });
      } else {
        Swal.fire({
          icon: "info",
          title: "Coupon Not Found",
          text: "The coupon you are trying to delete does not exist.",
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching coupon data:", error);
      Swal.fire({
        title: "Error!",
        text: `There was an error retrieving the coupon data: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    });
};

async function writeCouponData(couponName, couponDate) {
  if (couponName.length !== 8) {
    document.getElementById("coupIdError").style.display = "block";
    return;
  } else {
    document.getElementById("coupIdError").style.display = "none";
  }

  const currentDate = new Date();
  const expirationDate = new Date(couponDate);
  currentDate.setHours(0, 0, 0, 0);
  expirationDate.setHours(0, 0, 0, 0);

  if (expirationDate < currentDate) {
    document.getElementById("coupDateError").innerText =
      "Expiration date cannot be in the past.";
    document.getElementById("coupDateError").style.display = "block";
    return;
  } else {
    document.getElementById("coupDateError").style.display = "none";
  }

  try {
    let couponsRef = ref(db, "coupons/");
    const snapshot = await get(couponsRef);

    if (snapshot.exists()) {
      let coupons = snapshot.val();
      let isDuplicated = Object.values(coupons).some(
        (coupon) => coupon.name.toLowerCase() === couponName.toLowerCase()
      );
      if (isDuplicated) {
        Swal.fire({
          title: "Duplicate Coupon!",
          text: `"${couponName}" already exists.`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    const id = Date.now();
    await set(ref(db, "coupons/" + id), {
      id: id,
      name: couponName,
      date: couponDate,
    });

    Swal.fire({
      icon: "success",
      title: "Coupon added successfully!",
      showConfirmButton: false,
      timer: 1500,
    });
    getCoupons();
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: `There was an error adding the coupon: ${error.message}`,
      icon: "error",
      confirmButtonText: "Try Again",
    });
  }
}

function getCoupons() {
  const couponTableBody = document.querySelector("#tCouponsBody");

  if (!couponTableBody) {
    console.error("Coupon table body not found!");
    return;
  }

  let couponsRef = ref(db, "coupons/");
  couponTableBody.innerHTML = "";

  get(couponsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let coupons = snapshot.val();
        console.log("Fetched coupons:", coupons);
        let count = 0;

        Object.keys(coupons).forEach((key) => {
          count++;
          const coupon = coupons[key];
          let row = document.createElement("tr");

          row.innerHTML = `
            <td>${count}</td>
            <td>${coupon.name}</td>
            <td>${coupon.date}</td>
            <td>
              <button onclick="deleteCoupon('${key}')" class="delete-btn">Delete</button>
            </td>
          `;

          couponTableBody.appendChild(row);
        });
      } else {
        let row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" style="text-align:center;font-size:20px">No Coupons Found</td>`;
        couponTableBody.appendChild(row);
      }
    })
    .catch((error) => {
      console.error("Error fetching coupons:", error);
      Swal.fire({
        title: "Error!",
        text: `Unable to fetch coupons: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    });
}

getCoupons();
