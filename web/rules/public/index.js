const search = new Set();

function updateRuleCount() {
  let counter = 0;
  for (const rule of document.getElementById("rules").children) {
    if (rule.classList.contains("hidden") === false) {
      counter++;
    }
  }
  document.getElementById("rules_count").innerHTML = counter;
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

  for (const rule of document.getElementById("rules").children) {
    rule.classList.remove("hidden");
    for(const v of search.values()) {
      if (rule.innerHTML.includes(v) === false) {
        rule.classList.add("hidden");
      }
    }
  }

  updateRuleCount();
}

for (const chip of document.getElementsByClassName("chip")) {
  chip.onclick = (e) => clickChip(e, chip);
}

////////////////////////////////////////////////////////

const form = document.getElementById("input");
let delayedSearch;
const fuse = new Fuse(list, {
  threshold: 0.2,
  keys: ["key", "title", "shortDescription", "extendedInformation"],
});

function renderVisual(result) {
  console.dir("render");
  console.dir(result);
  document.getElementById("chipsDiv").classList.add("hidden");

  for (const rule of document.getElementById("rules").children) {
    rule.classList.add("hidden");
  }

  for(const v of result) {
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