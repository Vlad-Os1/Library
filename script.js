class Book {
  constructor (title, author, pages, isRead, id = null){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
    this.id = id || this.generateUniqueID();
  }

  toggleReadStatus(){
    this.isRead = !this.isRead;
  }

  generateUniqueID(){
    return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }
}

class Library {
  constructor(storage){
    this.storage = storage;
    this.books = this.storage.loadBooks() || [];
  }

  isInLibrary(book) {
    return this.books.some(existingBook => existingBook.title === book.title);
  }

  getBook(id) {
    return this.books.find((book) => book.id === id);
  }

  getBookByTitle(title) {
    return this.books.find((book) => book.title === title);
  }

  addBookToLibrary(title, author, pages, isRead) {
    const newBook = new Book(title, author, pages, isRead);
    if (!this.isInLibrary(newBook)) {
      this.books.push(newBook);
      this.storage.saveBooks(this.books);
    }
  }

  removeBook(bookId) {
    this.books = this.books.filter(book => book.id !== bookId);
    this.storage.saveBooks(this.books);
  }

  toggleReadStatus(bookId) {
    let book = this.books.find(book => book.id === bookId);
    if(book){
      book.toggleReadStatus();
      this.storage.saveBooks(this.books);
    }
  }
}   

class Storage {
  constructor(storageKey = "library.books") {
    this.storageKey = storageKey;
  }

  loadBooks() {
    const storedBooks = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    return storedBooks.map(book => new Book(book.title, book.author, book.pages, book.isRead, book.id));
  }

  saveBooks(books){
    localStorage.setItem(this.storageKey, JSON.stringify(books));
  }
}

class UI {
  constructor(library) {
    this.library = library;
    this.bookElements = {};
    this.handleBookContainerClick = this.#handleBookContainerClick.bind(this);
    this.init();
  }

  init() {
    const bookContainer = document.querySelector(".main-content");  
    bookContainer.addEventListener("click", this.handleBookContainerClick);
  }

  renderBook(book) {
    const bookContainer = document.querySelector(".main-content");
    const card = document.createElement("div");
    card.className = "main-card";

    card.innerHTML = `
      <p>${book.title}</p>
      <p>${book.author}</p>
      <p>${book.pages}</p>
      <div class="card-buttons">
        <button class="readBtn ${book.isRead ? "isRead" : "notRead"}">${book.isRead ? "Read" : "Not Read"}</button>
        <button class="removeBtn">Remove</button>
      </div>
    `;
    bookContainer.appendChild(card);
    this.bookElements[book.id] = card;
  }

  removeBookFromUI(bookId) {
    const card = this.bookElements[bookId];
    if (card) {
      card.remove();
      delete this.bookElements[bookId];
    }
  }

  updateReadStatus(bookId, isRead) {
    const card = this.bookElements[bookId];
    if (card) {
      const readBtn = card.querySelector(".readBtn");
      readBtn.textContent = isRead ? "Read" : "Not Read";
      readBtn.classList.toggle("isRead", isRead);
      readBtn.classList.toggle("notRead", !isRead);
    }
  }

  #handleBookContainerClick(event) {
    const card = event.target.closest(".main-card");
    const bookId = Object.keys(this.bookElements).find(id => this.bookElements[id] === card);
    if (event.target.classList.contains("removeBtn")) {
      this.library.removeBook(bookId);
      this.removeBookFromUI(bookId);
    } else if (event.target.classList.contains("readBtn")) {
      this.library.toggleReadStatus(bookId);
      this.updateReadStatus(bookId, this.library.getBook(bookId).isRead);
    }
  }
}

class Form {
  constructor(library, ui) {
    this.library = library;
    this.ui = ui;
    this.form = document.getElementById("bookForm");
    this.errorMsg = document.getElementById("errorMsg");
    this.modal = document.getElementById("modal");
    this.overlay = document.getElementById("overlay");
    this.handleBookFormSubmit = this.#handleBookFormSubmit.bind(this);
    
    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleBookFormSubmit);
  }

  #handleBookFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const pages = document.getElementById("pages").value;
    const isRead = document.getElementById("isRead").checked;

    if (this.library.getBookByTitle(title)) {
      this.errorMsg.classList.add("active");
      return;
    }

    this.errorMsg.classList.remove("active");

    this.library.addBookToLibrary(title, author, pages, isRead);
    const newBook = this.library.getBookByTitle(title);
    this.ui.renderBook(newBook);  

    this.form.reset();
    this.modal.classList.remove("active");
    this.overlay.classList.remove("active");
  }
}

class Modal {
  constructor(){
    this.overlay = document.getElementById("overlay");
    this.init();
  }
  
  init(){
    const openModalButtons = document.querySelectorAll("[data-modal-target]")
    const closeModalButtons = document.querySelectorAll("[data-close-button]")

    openModalButtons.forEach(button => {
      button.addEventListener("click", () => {
        const modal = document.querySelector(button.dataset.modalTarget);
        this.openModal(modal);
      })
    })
    this.overlay.addEventListener("click", () => {
      const modals = document.querySelectorAll(".modal.active")
      modals.forEach(modal => {
        this.closeModal(modal);
      })
    })
    closeModalButtons.forEach(button => {
      button.addEventListener("click", () => {
        const modal = button.closest(".modal")
        this.closeModal(modal)
      })
    })
  }
  openModal(modal) {
    if (modal == null) return
    modal.classList.add("active")
    this.overlay.classList.add("active")
  }

  closeModal(modal) {
    if (modal == null) return
    modal.classList.remove("active")
    this.overlay.classList.remove("active")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const storage = new Storage();
  const library = new Library(storage);
  const ui = new UI(library);
  const form = new Form(library, ui);
  const modal = new Modal();

  library.books.forEach(book => ui.renderBook(book));
});

