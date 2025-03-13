document.addEventListener("DOMContentLoaded", function () {
  const notesList = document.getElementById("notesList");
  const noteEditor = document.getElementById("noteEditor");
  const notesContainer = document.getElementById("notesContainer");
  const noteArea = document.getElementById("noteArea");
  const noteTitle = document.getElementById("noteTitle");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const backBtn = document.getElementById("backBtn");
  const saveBtn = document.getElementById("saveBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");

  let currentNote = null;

  function loadNotes() {
    chrome.storage.sync.get("notes", function (data) {
      let notes = data.notes || {};
      notesContainer.innerHTML = "";

      Object.keys(notes).forEach((title) => {
        let listItem = document.createElement("li");
        listItem.textContent = title;
        listItem.style.cursor = "pointer";
        listItem.style.padding = "10px";
        listItem.style.borderBottom = "1px solid #D5CEA3";
        listItem.style.borderRadius = "5px";
        listItem.style.background = "#D5CEA3";
        listItem.style.marginBottom = "5px";
        listItem.style.textAlign = "left";
        listItem.style.color = "#000";

        listItem.addEventListener("click", function () {
          openNote(title, notes[title]);
        });

        notesContainer.appendChild(listItem);
      });
    });
  }

  function openNote(title, content) {
    currentNote = title;
    noteTitle.textContent = title;
    noteArea.value = content;
    notesList.style.display = "none";
    noteEditor.style.display = "block";
  }

  function goBack() {
    currentNote = null;
    notesList.style.display = "block";
    noteEditor.style.display = "none";
  }

  function deleteNote(title) {
    chrome.storage.sync.get("notes", function (data) {
      let notes = data.notes || {};
      delete notes[title];

      chrome.storage.sync.set({ notes }, function () {
        goBack();
        loadNotes();
      });
    });
  }

  saveBtn.addEventListener("click", function () {
    if (!currentNote) return;

    chrome.storage.sync.get("notes", function (data) {
      let notes = data.notes || {};
      notes[currentNote] = noteArea.value;
      chrome.storage.sync.set({ notes }, function () {
        alert("Note saved!");
      });
    });
  });

  deleteBtn.addEventListener("click", function () {
    if (!currentNote) return;
    if (confirm(`Delete note "${currentNote}"?`)) {
      deleteNote(currentNote);
    }
  });

  backBtn.addEventListener("click", goBack);

  // Load dark mode setting
  chrome.storage.sync.get("darkMode", function (data) {
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
      darkModeToggle.checked = true;
    }
  });

  darkModeToggle.addEventListener("change", function () {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    chrome.storage.sync.set({ darkMode: isDarkMode });
  });

  const addNoteModal = document.getElementById("addNoteModal");
  const noteTitleInput = document.getElementById("noteTitleInput");
  const confirmAddNote = document.getElementById("confirmAddNote");
  const cancelAddNote = document.getElementById("cancelAddNote");

  addNoteBtn.addEventListener("click", function () {
    noteTitleInput.value = ""; // Clear input
    addNoteModal.style.display = "flex"; // Show modal
  });

  // Handle adding note
  confirmAddNote.addEventListener("click", function () {
    let newTitle = noteTitleInput.value.trim();
    if (!newTitle) return;

    chrome.storage.sync.get("notes", function (data) {
      let notes = data.notes || {};
      if (notes[newTitle]) {
        alert("A note with this title already exists!");
        return;
      }

      notes[newTitle] = "";
      chrome.storage.sync.set({ notes }, function () {
        loadNotes();
        addNoteModal.style.display = "none"; // Hide modal
      });
    });
  });

  // Handle cancel button
  cancelAddNote.addEventListener("click", function () {
    addNoteModal.style.display = "none";
  });

  loadNotes(); // Load titles when popup opens
});
