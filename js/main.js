const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#nav-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const books = document.querySelectorAll(".book");
const chapter = document.querySelector("#chapter-panel");

const chapters = {
  school: {
    title: "School",
    text: "I finished high school at Turkish Diyanet Foundation Baku Turkish Lyceum. Now I am a 17-year-old student at ADA University."
  },
  reading: {
    title: "Reading",
    text: "I have read over 50 books from detective, history, classics, and philosophy. Nowadays I am more into reading philosophy, because it forces me to think and question."
  },
  games: {
    title: "Games",
    text: "If I am not reading or studying, I probably play games. I don’t like competitive games that much. Story games are my favorite."
  }
};

books.forEach((book) => {
  book.addEventListener("click", () => {
    const key = book.dataset.chapter;
    const entry = chapters[key];
    if (!entry || !chapter) return;

    books.forEach((item) => item.setAttribute("aria-selected", "false"));
    book.setAttribute("aria-selected", "true");
    chapter.innerHTML = `<h3>${entry.title}</h3><p>${entry.text}</p>`;
    chapter.setAttribute("aria-labelledby", book.id);
  });
});
