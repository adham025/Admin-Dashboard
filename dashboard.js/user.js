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

let usersRef = ref(db, "users/");
get(usersRef).then((snapshot) => {
  let data = snapshot.val();
  printData(data);
});

function printData(data) {
  let count = 0;
  let tbody = document.getElementById("tUsersBody");
  let box = "";

  for (let key in data) {
    const { firstName, lastName, email, role = "user" } = data[key];
    box += `
        <tr>
            <td>${++count}</td>
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${email}</td>
            <td>
              <select data-current-role="${role}"
                      onchange="changeRole(event,'${key}')"
                      aria-label="Change role for ${firstName} ${lastName}">
                  <option value="user" ${
                    role === "user" ? "selected" : ""
                  }>User</option>
                  <option value="admin" ${
                    role === "admin" ? "selected" : ""
                  }>Admin</option>
              </select>
            </td>
        </tr>
      `;
  }
  tbody.innerHTML = box;
}

window.changeRole = async (e, id) => {
  e.preventDefault();
  console.log(id);

  let newRole = e.target.value;
  let currentRole = e.target.getAttribute("data-current-role");

  if (newRole === currentRole) {
    console.log("No change in role detected.");
    return;
  }

  let userConfirmed = await sweetAlertUsers();
  console.log(userConfirmed);

  if (userConfirmed) {
    update(ref(db, "users/" + id), { role: newRole })
      .then(() => {
        console.log("Role updated successfully.");
        Swal.fire({
          title: "Role updated successfully!",
          icon: "success",
        });
        e.target.setAttribute("data-current-role", newRole);
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        Swal.fire({
          title: "Error updating role",
          text: error.message || "An error occurred.",
          icon: "error",
        });
        e.target.value = currentRole;
      });
  } else {
    e.target.value = currentRole;
  }
};

async function sweetAlertUsers() {
  const result = await Swal.fire({
    title: "Are you sure you want to change the role for this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, change it!",
  });

  return result.isConfirmed;
}
