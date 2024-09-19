class Book{
  constructor (title, author, pages, isRead){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
    this.id = this.generateUniqueID();
  }

  toggleReadStatus(){
    this.isRead = !this.isRead
  }

  generateUniqueID(){
    return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }
}

class Library{
  constructor(){
    this.books = [];
    this.bookElements = {};

    this.handleBookContainerClick = this.#handleBookContainerClick.bind(this);
    this.handleBookFormSubmit = this.#handleBookFormSubmit.bind(this);
     
    this.#init();
  }

  isInLibrary(book) {
    return this.books.some(existingBook => existingBook.title === book.title);
  }

  getBook(title) {
    return this.books.find((book) => book.title === title);
  }

  addBookToLibrary(title, author, pages, isRead) {
    const newBook = new Book(title, author, pages, isRead);
    if (!this.isInLibrary(newBook)) {
      this.books.push(newBook);
      this.#renderBook(newBook);
    }
  }

  #renderBook(book) {
    if(!book.id) return
    const bookContainer = document.querySelector(".main-content");
    const card = document.createElement("div");
    card.className = "main-card";
    
    card.innerHTML = `
      <p>${book.title}</p>
      <p>${book.author}</p>
      <p>${book.pages}</p>
      <div class="card-buttons">
        <button class="readBtn ${book.isRead ? "isRead" : "notRead"}" >${book.isRead ? "Read" : "Not Read"}</button>
        <button class="removeBtn">Remove</button>
      </div>`;
    
    bookContainer.appendChild(card);
    this.bookElements[book.id] = card;
  }

  removeBook(bookId) {
    const index = this.books.findIndex(book => book.id === bookId);
    if (index !== -1) {
      this.books.splice(index, 1);
    }
  
    let cardToRemove = this.bookElements[bookId];
    if (cardToRemove) {
      cardToRemove.remove();
      delete this.bookElements[bookId];
    }
  }

  changeIsRead(bookId) {
    let book = this.books.find(book => book.id === bookId);
    if(book){
      book.toggleReadStatus();
    }
  
    let card = this.bookElements[bookId];
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

  #init(){
    const bookContainer = document.querySelector(".main-content");
    const bookForm = document.getElementById("bookForm");

    bookContainer.removeEventListener("click", this.handleBookContainerClick);
    bookForm.removeEventListener("submit", this.handleBookFormSubmit);

    bookContainer.addEventListener("click", this.handleBookContainerClick);
    bookForm.addEventListener("submit", this.handleBookFormSubmit);
  }

  #handleBookContainerClick(event) {
    let card = event.target.closest(".main-card");
    let bookId = Object.keys(this.bookElements).find(id => this.bookElements[id] === card);
    if (event.target.classList.contains("removeBtn")) {
      this.removeBook(bookId);
    } else if (event.target.classList.contains("readBtn")) {
      this.changeIsRead(bookId);
    }
  }

  #handleBookFormSubmit(event) {
    event.preventDefault();
    let errorMsg = document.getElementById("errorMsg");

    const title = document.getElementById("title");
    const author = document.getElementById("author");
    const pages = document.getElementById("pages");
    const isRead = document.getElementById("isRead");
    const modal = document.getElementById("modal")
    const overlay = document.getElementById("overlay")

    if (this.getBook(title.value)) {
      errorMsg.classList.add("active");
      return;
    }
    errorMsg.classList.remove("active");

    this.addBookToLibrary(title.value, author.value, pages.value, isRead.checked);
    bookForm.reset();
    modal.classList.remove("active");
    overlay.classList.remove("active");
  }
}

class Modal{
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
    overlay.addEventListener("click", () => {
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
    
    document.getElementById("bookForm").reset();
  }
}

const library = new Library();
const modal = new Modal();

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
DEFAULT_DATA.forEach(book => {
  library.addBookToLibrary(book.title, book.author, book.pages, book.isRead); 
});

