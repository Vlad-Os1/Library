const DEFAULT_DATA = [
  {
    title: "1984",
    author: "George Orwell",
    pages: 328,
    isRead: true,
  },
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    pages: 	156,
    isRead: false,
  }
]

const myLibrary = [];
const bookElements = {};

const bookForm = document.getElementById("bookForm");
const modal = document.getElementById("modal");
const bookContainer = document.querySelector(".main-content");

const title = document.getElementById("title");
const author = document.getElementById("author");
const pages = document.getElementById("pages");
const isRead = document.getElementById("isRead");

function generateUniqueID() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

function Book(title, author, pages, isRead) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.isRead = isRead;
  this.id = generateUniqueID();
}

Book.prototype.toggleReadStatus = function() {
  this.isRead = !this.isRead;
};

function getBook(title) {
  return myLibrary.find((book) => book.title === title)
}

function isInLibrary(book) {
  return myLibrary.some(existingBook => existingBook.title === book.title);
}

function addBookToLibrary(title, author, pages, isRead) {
  let newBook = new Book(title, author, pages, isRead);
  if (!isInLibrary(newBook)){
    myLibrary.push(newBook);
  
    // let bookContainer = document.querySelector(".main-content");
    let card = document.createElement("div");
    card.className = "main-card";
    
    card.innerHTML = `
      <p>${title}</p>
      <p>${author}</p>
      <p>${pages}</p>
      <div class="card-buttons">
        <button class="readBtn ${newBook.isRead ? "isRead" : "notRead"}" >${newBook.isRead ? "Read" : "Not Read"}</button>
        <button class="removeBtn">Remove</button>
      </div>`;
    
    bookContainer.appendChild(card);
    bookElements[newBook.id] = card;
  }
}

DEFAULT_DATA.forEach(book => {
  addBookToLibrary(book.title, book.author, book.pages, book.isRead); 
});



function removeBook(bookId) {
  const index = myLibrary.findIndex(book => book.id === bookId);
  if (index !== -1) {
    myLibrary.splice(index, 1);
  }

  let cardToRemove = bookElements[bookId];
  if (cardToRemove) {
    cardToRemove.remove();
    delete bookElements[bookId];
  }
}

function changeIsRead(bookId){
  let book = myLibrary.find(book => book.id === bookId);
  if(book){
    book.toggleReadStatus();
  }

  let card = bookElements[bookId];
  let readBtn = card.querySelector(".readBtn");

  if (book.isRead) {
    readBtn.textContent = "Read";
    readBtn.classList.add("isRead");
    readBtn.classList.remove("notRead");
  } else {
    readBtn.textContent = "Not Read";
    readBtn.classList.add("notRead");
    readBtn.classList.remove("isRead");
  }
}

bookContainer.addEventListener("click", function(event){
  let card = event.target.closest(".main-card");
  let bookId = Object.keys(bookElements).find(id => bookElements[id] === card);
  if(event.target.classList.contains("removeBtn")){
    removeBook(bookId);
  } else if(event.target.classList.contains("readBtn")) {
    changeIsRead(bookId);
  }
});

bookForm.addEventListener("submit", function(event){
  event.preventDefault();
  let errorMsg = document.getElementById("errorMsg");

  if(getBook(title.value)) {
    errorMsg.classList.add("active");
    return
  }
  errorMsg.classList.remove("active");
  
  addBookToLibrary(title.value, author.value, pages.value, isRead.checked);
  bookForm.reset();
  modal.classList.remove("active");
  overlay.classList.remove("active");
});



// Modal
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
  
  title.value = null;
  author.value = null;
  pages.value = null;
  isRead.checked = false
}