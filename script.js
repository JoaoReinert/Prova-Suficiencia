document.addEventListener("DOMContentLoaded", () => {
  getPhotos();
});

const table = document.querySelector(".table tbody");
const modal = document.querySelector(".modal");
const registerButton = document.querySelector(".registerButton");
const saveButton = document.querySelector(".saveButton");
const cancelButton = document.querySelector(".cancelButton");
const modalFields = document.querySelectorAll(".modal_field");
const backButton = document.querySelector(".backButton");
const nextButton = document.querySelector(".nextButton");
const numberPage = document.querySelector(".numberPage");

let photos = [];
let currentPage = 1;
const itemsPerPage = 8;
let editID = null;

function getPhotos() {
  photos = JSON.parse(localStorage.getItem("photos")) || [];

  if (photos.length === 0) {
    fetch("https://jsonplaceholder.typicode.com/photos?_limit=30")
      .then((response) => response.json())
      .then((photos) => {
        localStorage.setItem("photos", JSON.stringify(photos));
        renderTable(photos);
      });
  } else {
    renderTable(photos);
  }
}

function renderTable(photos) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const currentPagePhotos = photos.slice(start, end);

  table.innerHTML = "";
  currentPagePhotos.forEach((element) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${element.id}</td>
        <td>${element.title}</td>
        <td><a href="${element.url}" target="_blank">${element.url}</a></td>
            <td><img src="${element.thumbnailUrl}" width="50"></td>
        <td>
            <button class="editButton btn btn-primary" onclick="editPhoto(${element.id})">Editar</button>
            <button class="deleteButton btn btn-danger" onclick="deletePhoto(${element.id})">Excluir</button>
        </td>
    `;
    table.appendChild(row);
  });

  numberPage.textContent = `Página ${currentPage}`;
  backButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * itemsPerPage >= photos.length;
}

function openModal(boleano) {
  if (!boleano) {
    modalFields[0].style.display = "none";
  } else {
    modalFields[0].style.display = "flex";
  }

  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
  modalFields.forEach((field) => (field.value = ""));
  editID = null;
}

function savePhoto() {
  const title = modalFields[1].value.trim();
  const url = modalFields[2].value.trim();
  const thumbnailUrl = modalFields[3].value.trim();

  if (!title) {
    alert("titulo não informado");
    return;
  }
  if (!url) {
    alert("url não informado");
    return;
  }
  if (!thumbnailUrl) {
    alert("url da thumb não informado");
    return;
  }

  let photos = JSON.parse(localStorage.getItem("photos")) || [];
  let incrementID = 1;

  for (let i = 0; i < photos.length; i++) {
    if (photos[i].id >= incrementID) {
      incrementID = photos[i].id + 1;
    }
  }

  if (editID) {
    photos = photos.map((photo) =>
      photo.id == editID
        ? { id: editID, title, url, thumbnailUrl: thumbnailUrl }
        : photo
    );
    const editPhoto = photos.find(photo => photo.id == editID); 
    updatePhotoApi(editPhoto);
  } else {
    const newPhoto = {
      id: incrementID,
      title: title,
      url: url,
      thumbnailUrl: thumbnailUrl,
    };
    photos.push(newPhoto);
    addPhotoApi(newPhoto);
  }

  localStorage.setItem("photos", JSON.stringify(photos));
  getPhotos();
  closeModal();
}

function addPhotoApi(newPhoto) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify({
      id: newPhoto.id,
      title: newPhoto.title,
      url: newPhoto.url,
      thumbnailUrl: newPhoto.thumbnailUrl,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function updatePhotoApi(photo) {
  fetch(`https://jsonplaceholder.typicode.com/posts/${photo.id}`, {
    method: "PUT",
    body: JSON.stringify({
      id: photo.id,
      title: photo.title,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function deletePhotoApi(id) {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      });
}

function deletePhoto(id) {
  let photos = JSON.parse(localStorage.getItem("photos")) || [];
  photos = photos.filter((photo) => photo.id != id);
  localStorage.setItem("photos", JSON.stringify(photos));
  deletePhotoApi(id)
  getPhotos();
}

function editPhoto(id) {
  let photos = JSON.parse(localStorage.getItem("photos")) || [];
  const photo = photos.find((photo) => photo.id == id);

  if (photo) {
    modalFields[0].value = photo.id;
    modalFields[1].value = photo.title;
    modalFields[2].value = photo.url;
    modalFields[3].value = photo.thumbnailUrl;
    editID = id;
    openModal(true);
  }
}

function backPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(photos);
  }
}

function nextPage() {
  if (currentPage * itemsPerPage < photos.length) {
    currentPage++;
    renderTable(photos);
  }
}
