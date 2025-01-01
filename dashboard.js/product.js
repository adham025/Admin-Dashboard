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

/* LAPTOPS */

async function toUploadImage(productImg) {
  const errorElement = productImg.nextElementSibling;
  errorElement.textContent = "";
  if (!productImg || !productImg.files || productImg.files.length === 0) {
    errorElement.textContent = "Please select an image file to upload.";
    return null;
  }
  try {
    const file = productImg.files[0];
    const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validFileTypes.includes(file.type)) {
      errorElement.textContent =
        "Invalid file type. Please upload an image (JPG, PNG, GIF).";
      return null;
    }

    const sanitizedFileName = file.name.replace(/[^\w.-]/g, "_"); // Sanitize the file name
    const storageRef = imageRef(storage, "images/" + sanitizedFileName);
    const uploadTask = uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL((await uploadTask).ref);
    return downloadURL;
  } catch (error) {
    errorElement.textContent = `Failed to upload image. Please try again. Error: ${error.message}`;
    console.error("Image upload error:", error);
    return null;
  }
}

window.deleteProduct = function (id) {
  const db = getDatabase();
  const productRef = ref(db, "products/" + id);

  get(productRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        remove(productRef)
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
            await renderTable();
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            Swal.fire({
              title: "Error!",
              text: `There was an error deleting the product: ${error.message}`,
              icon: "error",
              confirmButtonText: "Try Again",
            });
          });
      } else {
        Swal.fire({
          icon: "info",
          title: "Product Not Found",
          text: "The product you are trying to delete does not exist.",
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching product data:", error);
      Swal.fire({
        title: "Error!",
        text: `There was an error retrieving the product data: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    });
};

let category1 = document.getElementById("category");
let arr = [];
const categoryList = ref(db, "categories/");

onValue(categoryList, async (snapshot) => {
  let data = await snapshot.val();

  for (let key in data) {
    arr.push(data[key].name);
  }
  arr.sort().forEach(function (el) {
    category1.innerHTML += `<option value="${el}">${el}</option>`;
  });
});

document.getElementById("category").addEventListener("change", function () {
  const brandSelect = document.getElementById("brand");
  const selectedCategory = this.value;

  const brands = {
    Headphones: ["Audio", "Bose", "JBL", "Sony"],
    Laptops: ["Acer", "Asus", "Dell", "Lenovo", "MacBook", "MSI"],
    Mobiles: ["Apple", "Huawei", "Oppo", "Realme", "Samsung"],
    Monitors: ["Asus", "Dell", "LG", "Samsung", "Tornado"],
    Smartwatches: ["Apple", "Huawei", "Realme", "Samsung"],
  };

  brandSelect.innerHTML =
    '<option value="" disabled selected>Select The Brand</option>';
  // Populate the new options
  if (brands[selectedCategory]) {
    brands[selectedCategory].forEach((brand) => {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });
  }
});

async function writeUserData(
  imgSrc,
  proname,
  color,
  brand,
  category,
  price,
  quantity,
  description
) {
  const db = getDatabase();
  const id = Date.now(); // Unique ID based on timestamp

  try {
    await set(ref(db, "products/" + id), {
      id: id,
      image: imgSrc,
      name: proname,
      color: color,
      brand: brand,
      category: category,
      price: price,
      quantity: quantity,
      description: description,
    });

    let Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: "success",
      title: "Product added successfully!",
    });
    await renderTable();
  } catch (error) {
    console.error("Error adding product:", error);

    Swal.fire({
      title: "Error!",
      text: `There was an error adding the product: ${error.message}`,
      icon: "error",
      confirmButtonText: "Try Again",
    });
  }
}

const links = document.querySelectorAll(".sidebar a");
for (let i = 0; i < links.length; i++) {
  links[i].addEventListener("click", function (e) {
    for (let j = 0; j < links.length; j++) {
      links[j].classList.remove("active");
    }
    links[i].classList.add("active");
  });
}

var prodForm = document.getElementById("product-form");
let add = document.getElementById("add");
let errorMessage = document.getElementsByClassName("error");

add.addEventListener("click", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(
    "#product-form input, #product-form select"
  );
  const productImg = document.getElementById("productImage");
  const proname = document.getElementById("name").value.trim();
  const color = document.getElementById("color").value.trim();
  const brand = document.getElementById("brand").value;
  const category = document.getElementById("category").value;
  const price = parseFloat(document.getElementById("price").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const description = document.getElementById("description").value.trim();
  let isValid = true;

  inputs.forEach((input) => {
    const errorDiv = input.nextElementSibling;

    input.addEventListener("input", () => {
      errorDiv.style.display = "none";
      input.classList.remove("error-input");
    });

    if (
      input.value.trim() === "" ||
      (input.type === "select-one" && input.value === "")
    ) {
      errorDiv.textContent = "This field is required.";
      errorDiv.style.display = "block";
      input.classList.add("error-input");
      isValid = false;
    }
  });

  const priceInput = document.getElementById("price");
  const priceError = document.getElementById("priceError");
  priceInput.addEventListener("input", () => {
    if (parseFloat(priceInput.value) <= 0) {
      priceError.textContent = "Price must be more than zero.";
      priceError.style.display = "block";
      priceInput.classList.add("error-input");
    } else {
      priceError.style.display = "none";
      priceInput.classList.remove("error-input");
    }
  });

  const quantityInput = document.getElementById("quantity");
  const quantityError = document.getElementById("quantityError");
  quantityInput.addEventListener("input", () => {
    if (parseInt(quantityInput.value) <= 0) {
      quantityError.textContent = "Quantity must be more than zero.";
      quantityError.style.display = "block";
      quantityInput.classList.add("error-input");
    } else {
      quantityError.style.display = "none";
      quantityInput.classList.remove("error-input");
    }
  });

  const imageError = document.getElementById("imageError");
  const imgSrc = await toUploadImage(productImg);
  if (!imgSrc) {
    imageError.textContent = "Upload an appropriate image for your product.";
    imageError.style.display = "block";
    productImg.classList.add("error-input");
    return;
  } else {
    imageError.style.display = "none";
    productImg.classList.remove("error-input");
  }

  if (!isValid) {
    return;
  }
  await writeUserData(
    imgSrc,
    proname,
    color,
    brand,
    category,
    price,
    quantity,
    description
  );

  document.getElementById("product-form").reset();
});

const productsData = ref(db, "products");
const tbody = document.querySelector("#tbody");

async function getData() {
  return new Promise((resolve, reject) => {
    onValue(productsData, (snapshot) => {
      const productsBacked = snapshot.val();
      if (!productsBacked) {
        reject("No data found at this path.");
      } else {
        resolve(productsBacked);
      }
    });
  });
}

async function renderTable() {
  try {
    const productsBacked = await getData();
    let count = 0;
    tbody.innerHTML = "";
    for (let key in productsBacked) {
      count++;
      tbody.innerHTML += `
          <tr>
            <td>${count}</td>
            <td class="image-cell">
              <img class="previewImage" src="${productsBacked[key].image}" alt="Product Image" />
            </td>
            <td>${productsBacked[key].name}</td>
            <td>${productsBacked[key].color}</td>
            <td>${productsBacked[key].brand}</td>
            <td>${productsBacked[key].category}</td>
            <td>${productsBacked[key].price} EGP</td>
            <td>${productsBacked[key].quantity}</td>
            <td><button onclick="updateProFun('${productsBacked[key].id}')" class="update-btn">Update</button></td>
            <td><button onclick="deleteProduct('${productsBacked[key].id}')" class="delete-btn">Delete</button></td>
          </tr>
        `;
    }
  } catch (error) {
    console.error(error);
    tbody.innerHTML = "<tr><td colspan='10'>Error loading products.</td></tr>";
  }
}
renderTable();

let productId;

let test = await getData();

window.updateProFun = (id) => {
  if (test.length === 0) {
    console.error("Product data is not available yet.");
    return;
  }

  // Smoothly scroll to the top (if that's your intention)
  window.scrollTo({ top: 0, behavior: "smooth" });

  document
    .getElementById("product-form")
    .scrollIntoView({ behavior: "smooth" });

  document.getElementById("add").style.display = "none";
  document.getElementById("update").style.display = "block";

  document.getElementById("productImage").setAttribute("disabled", "true");

  document.getElementById("name").value = test[id].name;
  document.getElementById("color").value = test[id].color;
  document.getElementById("category").value = test[id].category;
  document.getElementById("brand").value = test[id].brand;
  document.getElementById("price").value = test[id].price;
  document.getElementById("quantity").value = test[id].quantity;
  document.getElementById("description").value = test[id].description;

  productId = id;
};

let updateBtn = document.getElementById("update");

updateBtn.addEventListener("click", () => {
  document.getElementById("productImage").removeAttribute("disabled", "false");
  document.getElementById("add").style.display = "block";
  document.getElementById("update").style.display = "none";

  update(ref(db, "products/" + productId), {
    img: document.getElementById("productImage"),
    name: document.getElementById("name").value,
    color: document.getElementById("color").value,
    category: document.getElementById("category").value,
    brand: document.getElementById("brand").value,
    price: parseFloat(document.getElementById("price").value),
    quantity: parseInt(document.getElementById("quantity").value),
    description: document.getElementById("description").value,
  })
    .then(() => {
      console.log("Product updated successfully!");
      let Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: "Updated Successfully",
      });
      renderTable();
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      Swal.fire({
        title: "Error!",
        text: "There was an error updating the product: " + error.message,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    });

  prodForm.reset();
});


