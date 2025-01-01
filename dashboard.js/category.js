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

function writeCategoryData(categoryName) {
  if (categoryName.length < 3 || categoryName.length > 20) {
    document.getElementById("catError").style.display = "block";
    return;
  } else {
    document.getElementById("catError").style.display = "none";
  }
  let categoriesRef = ref(db, "categories/");
  get(categoriesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let categories = snapshot.val();
        let isDuplicated = Object.values(categories).some(
          (category) =>
            category.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (isDuplicated) {
          Swal.fire({
            title: "Duplicate Category!",
            text: `The "${categoryName}" already exists.`,
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
      }
      const id = Date.now(); // Use current timestamp for a unique ID
      set(ref(db, "categories/" + id), {
        id: id,
        name: categoryName,
      })
        .then(() => {
          let Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: "success",
            title: "Category added successfully!",
          });
          getCategories();
        })
        .catch((error) => {
          Swal.fire({
            title: "Error!",
            text: `There was an error adding the category: ${error.message}`,
            icon: "error",
            confirmButtonText: "Try Again",
          });
        });
    })
    .catch((error) => {
      Swal.fire({
        title: "Error!",
        text: `Unable to fetch categories: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    });
}

let categoryName = document.getElementById("categoryName");
let catError = document.getElementById("catError");
categoryName.addEventListener("focus", () => {
  categoryName.style.border = "solid 1px #007bff";
});
categoryName.addEventListener("blur", () => {
  textValidation();
});
function textValidation() {
  categoryName.style.border = "";
  if (categoryName.value.length < 3 && categoryName.value != "") {
    catError.style.display = "inline";
    return false;
  } else {
    catError.style.display = "none";
    return true;
  }
}

let catForm = document.getElementById("category-form");
catForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (textValidation()) {
    let categoryNameValue = categoryName.value.trim();
    if (categoryNameValue !== "") {
      writeCategoryData(categoryNameValue);
      catForm.reset();
    } else {
      catError.style.display = "inline";
    }
  }
});

catForm.addEventListener("submit", function (event) {
  event.preventDefault();
  catForm.reset();
});

window.editCategory = function (id) {
  let updateBtn = document.getElementById("updateBtn");
  const db = getDatabase();
  const categoryRef = ref(db, "categories/" + id);

  get(categoryRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const categoryData = snapshot.val();
        const categoryName = categoryData.name;
        document.getElementById("categoryName").value = categoryName;
        window.scrollTo({ top: 0, behavior: "smooth" });

        const submitBtn = document.getElementById("submitBtn");
        submitBtn.style.display = "none";
        updateBtn.style.display = "flex";
        window.scrollTo(0, 0);

        updateBtn.onclick = async function (e) {
          e.preventDefault();

          const newCategoryName = document
            .getElementById("categoryName")
            .value.trim();
          if (!newCategoryName) {
            Swal.fire({
              icon: "warning",
              title: "Invalid Input",
              text: "Category name cannot be empty.",
              confirmButtonText: "OK",
            });
            return;
          }

          if (newCategoryName === categoryName) {
            Swal.fire({
              icon: "info",
              title: "No changes detected",
              text: "The category name remains the same.",
              confirmButtonText: "OK",
            });
            return;
          }

          try {
            const categoriesRef = ref(db, "categories");
            const snapshot = await get(categoriesRef);

            if (snapshot.exists()) {
              const allCategories = snapshot.val();
              for (let key in allCategories) {
                if (allCategories[key].name === newCategoryName) {
                  Swal.fire({
                    icon: "warning",
                    title: "Duplicate Category",
                    text: "This category name already exists.",
                    confirmButtonText: "OK",
                  });
                  return;
                }
              }
            }

            await update(ref(db, "categories/" + id), {
              name: newCategoryName,
            });

            Swal.fire({
              icon: "success",
              title: "Updated Successfully",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });

            getCategories();
            document.getElementById("category-form").reset();
            submitBtn.style.display = "flex";
            updateBtn.style.display = "none";
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text:
                "There was an error updating the category: " + error.message,
              icon: "error",
              confirmButtonText: "Try Again",
            });
          }
        };
      } else {
        Swal.fire({
          icon: "error",
          title: "Category not found",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error retrieving category data",
        text: error.message,
        confirmButtonText: "OK",
      });
    });
};

window.deleteCategory = function (id) {
  const db = getDatabase();
  const categoryRef = ref(db, "categories/" + id);
  get(categoryRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const categoryData = snapshot.val();
        const categoryName = categoryData.name;
        remove(categoryRef)
          .then(() => {
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
            getCategories();
          })
          .catch((error) => {
            console.error("Error deleting category:", error);
            Swal.fire({
              title: "Error!",
              text:
                "There was an error deleting the category: " + error.message,
              icon: "error",
              confirmButtonText: "Try Again",
            });
          });
      } else {
        console.log("No such category found!");
      }
    })
    .catch((error) => {
      console.error("Error fetching category data:", error);
    });
};

function getCategories() {
  var categoryTableBody = document.querySelector(".responsive-table tbody");
  let categoriesRef = ref(db, "categories/");
  categoryTableBody.innerHTML = "";
  get(categoriesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let categories = snapshot.val();
        let arr = [];
        for (let key in categories) {
          arr.push({
            id: key,
            name: categories[key]?.name || "Unnamed Category",
          });
        }
        arr.sort((a, b) => a.name.localeCompare(b.name));
        let count = 0;
        arr.forEach((category) => {
          let row = document.createElement("tr");
          count++;
          row.innerHTML = `
            <td>${count}</td>
            <td>${category.name}</td>
            <td>
              <button onclick="editCategory('${category.id}')" class="update-btn">Edit</button>
              <button onclick="deleteCategory('${category.id}')" class="delete-btn">Delete</button>
            </td>
          `;
          categoryTableBody.appendChild(row);
        });
      } else {
        let row = document.createElement("tr");
        row.innerHTML = `<td style="text-align:center;font-size:20px" colspan="3">No Categories Found</td>`;
        categoryTableBody.appendChild(row);
      }
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}

  getCategories();
