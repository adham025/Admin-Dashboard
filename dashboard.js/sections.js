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

const items = document.querySelectorAll(".page .side-bar ul li");
items.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove 'selected' class from all items
    items.forEach((i) => i.classList.remove("selected"));
    // Add 'selected' class to the clicked item
    item.classList.add("selected");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = item.getAttribute("data-section");
      showSection(sectionId);
    });
  });
});

function showSection(sectionId) {
  const sections = document.querySelectorAll("section");

  // Hide all sections
  sections.forEach((section) => {
    section.style.display = "none";
  });

  // Remove active class from all sidebar menu items
  const menuItems = document.querySelectorAll(".side-bar .menu-item");
  menuItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to the corresponding menu item
  const activeItem = document.querySelector(
    `.menu-item[data-section="${sectionId}"]`
  );
  if (activeItem) {
    activeItem.classList.add("active");
  }

  // Show the selected section
  const activeSection = document.querySelector(`section.${sectionId}`);
  if (activeSection) {
    activeSection.style.display = "block";
  }
}

// Optional: Automatically show the first section on page load
const defaultSection = document.querySelector(".menu-item.active");
if (defaultSection) {
  const sectionId = defaultSection.getAttribute("data-section");
  showSection(sectionId);
}

// Add click event listeners to sidebar menu items
const menuItems = document.querySelectorAll(".side-bar .menu-item");
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const sectionId = item.getAttribute("data-section");
    showSection(sectionId);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  showSection("cats");
});
