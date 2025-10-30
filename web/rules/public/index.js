const search = new Set();
const FILTER_SEPARATOR = "-";

function updateRuleCount() {
  let counter = 0;
  for (const rule of document.getElementById("rules").children) {
    if (rule.classList.contains("hidden") === false) {
      counter++;
    }
  }
  document.getElementById("rules_count").innerHTML = counter;
}

function updateURL() {
  const params = new URLSearchParams();
  if (search.size > 0) {
    params.set("filters", Array.from(search).join(FILTER_SEPARATOR));
  }
  const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, "", newURL);
}

function applyFilters() {
  for (const rule of document.getElementById("rules").children) {
    rule.classList.remove("hidden");
    for (const v of search.values()) {
      if (rule.innerHTML.includes(v) === false) {
        rule.classList.add("hidden");
      }
    }
  }
  updateRuleCount();
}

function clickChip(_event, chip) {
  for (const child of chip.children) {
    child.classList.toggle("chip-content-enabled");
    child.classList.toggle("chip-content-disabled");
  }
  chip.classList.toggle("shadow1");
  chip.classList.toggle("shadow2");

  if (search.has(chip.title)) {
    search.delete(chip.title);
  } else {
    search.add(chip.title);
  }

  applyFilters();
  updateURL();
}

function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const filters = params.get("filters");
  if (filters) {
    const filterArray = filters.split(FILTER_SEPARATOR);
    for (const filter of filterArray) {
      search.add(filter);
      // Find and toggle the corresponding chip
      for (const chip of document.getElementsByClassName("chip")) {
        if (chip.title === filter) {
          for (const child of chip.children) {
            child.classList.toggle("chip-content-enabled");
            child.classList.toggle("chip-content-disabled");
          }
          chip.classList.toggle("shadow1");
          chip.classList.toggle("shadow2");
          break;
        }
      }
    }
    applyFilters();
  }
}

for (const chip of document.getElementsByClassName("chip")) {
  chip.onclick = (e) => clickChip(e, chip);
}

// Load filters from URL on page load
loadFiltersFromURL();

////////////////////////////////////////////////////////

const form = document.getElementById("input");
let delayedSearch;
const fuse = new Fuse(list, {
  threshold: 0.3,
  keys: ["key", "title", "shortDescription", "extendedInformation"],
});

function renderVisual(result) {
  document.getElementById("chipsDiv").classList.add("hidden");

  for (const rule of document.getElementById("rules").children) {
    rule.classList.add("hidden");
  }

  for (const v of result) {
    document.getElementById("rule-" + v.item.key).classList.remove("hidden");
  }

  updateRuleCount();
}

function resetSearch() {
  document.getElementById("chipsDiv").classList.remove("hidden");
  for (const rule of document.getElementById("rules").children) {
    rule.classList.remove("hidden");
  }
  updateRuleCount();
}

function doSearch() {
  if (form.value === "") {
    resetSearch();
  } else {
    const resultJSON = fuse.search(form.value);
    renderVisual(resultJSON);
  }
}

form.addEventListener("input", () => {
  if (delayedSearch) {
    clearTimeout(delayedSearch);
  }
  delayedSearch = setTimeout(doSearch, 150);
});

form.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  form.value = "";
  resetSearch();
});