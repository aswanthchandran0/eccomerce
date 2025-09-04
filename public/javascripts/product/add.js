import { ajaxRequest } from "../ajax.js";

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form); // works for text + files

  const result = await ajaxRequest("/admin/products", "POST", formData, true);

  if (result.success) {
    window.location.href = "/admin/products"; // redirect to product list
  } else {
    // Clear previous errors
    ["name","description","price","brand","category","variants"].forEach(id => {
      const el = document.getElementById(id + "Error");
      if (el) el.innerText = "";
    });

    if (result.errors && typeof result.errors === "object") {
      for (const field in result.errors) {
        const errorElement = document.getElementById(field + "Error");
        if (errorElement) {
          errorElement.innerText = result.errors[field];
        }
      }
    } else {
      Toastify({
        text: result.message || "Something went wrong",
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "red"
      }).showToast();
    }
  }
});