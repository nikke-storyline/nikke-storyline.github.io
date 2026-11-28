// Which column a card belongs to in the 3-column layout:
// 1st = EVENT, 2nd = CHAPTER.xx, 3rd = everything else (BOND, BLABLA, OUTPOST, ...).
function laneOf(category = "") {
  if (category === "EVENT") return "event";
  if (category.startsWith("CHAPTER")) return "chapter";
  return "other";
}

async function renderReleases() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  try {
    const response = await fetch("data/releases.json");
    if (!response.ok) {
      throw new Error(`Failed to load data/releases.json (${response.status})`);
    }

    const releases = await response.json();
    const fragment = document.createDocumentFragment();

    releases.forEach((item, index) => {
      const pane = document.createElement("div");
      pane.className = `pane colored-corners pane--${laneOf(item.category)}`;
      // One card per row in the 3-column layout (see style.css).
      pane.style.setProperty("--row", index + 1);

      const img = document.createElement("img");
      img.className = "pane-thumbnail";
      img.src = item.thumbnail || "";
      img.alt = item.text ? `${item.category || ""} ${item.text}`.trim() : "Thumbnail";
      img.loading = "lazy"; // Helpful when rendering hundreds of panes

      const meta = document.createElement("div");
      meta.className = "pane-meta";

      const releaseEl = document.createElement("div");
      releaseEl.className = "pane-release";
      releaseEl.textContent = item.release ?? "";

      const categoryEl = document.createElement("div");
      categoryEl.className = "pane-category";
      categoryEl.textContent = item.category ?? "";

      const textEl = document.createElement("div");
      textEl.className = "pane-text";
      textEl.textContent = item.text ?? "";

      meta.append(releaseEl, categoryEl, textEl);
      pane.append(img, meta);
      fragment.appendChild(pane);
    });

    grid.replaceChildren(fragment);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="grid-status">스토리 데이터를 불러오지 못했습니다.</p>`;
  }
}

// Script is loaded with `defer`, so the DOM is already parsed at this point.
renderReleases();
