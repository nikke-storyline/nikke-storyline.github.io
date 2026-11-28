// 3-column lanes: EVENT | CHAPTER.xx | everything else.
function laneOf(category = "") {
  if (category === "EVENT") return "event";
  if (category.startsWith("CHAPTER")) return "chapter";
  return "other";
}

// "2022-11-04" -> <span>2022</span>-11-04, followed by a rule (CSS).
function dateSeparator(release, row) {
  const sep = document.createElement("div");
  sep.className = "date-sep";
  sep.style.setProperty("--row", row);

  const [year, ...rest] = release.split("-");
  const yearEl = document.createElement("span");
  yearEl.className = "date-sep-year";
  yearEl.textContent = year;
  sep.append(yearEl, rest.length ? `-${rest.join("-")}` : "");
  return sep;
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
    let row = 0;
    let lastRelease = null;

    for (const item of releases) {
      if (item.release && item.release !== lastRelease) {
        fragment.appendChild(dateSeparator(item.release, ++row));
        lastRelease = item.release;
      }

      const pane = document.createElement("div");
      pane.className = `pane colored-corners pane--${laneOf(item.category)}`;
      pane.style.setProperty("--row", ++row);

      const img = document.createElement("img");
      img.className = "pane-thumbnail";
      img.src = item.thumbnail || "";
      img.alt = item.text ? `${item.category || ""} ${item.text}`.trim() : "Thumbnail";
      img.loading = "lazy"; // Helpful when rendering hundreds of panes

      const meta = document.createElement("div");
      meta.className = "pane-meta";

      const categoryEl = document.createElement("div");
      categoryEl.className = "pane-category";
      categoryEl.textContent = item.category ?? "";

      const textEl = document.createElement("div");
      textEl.className = "pane-text";
      textEl.textContent = item.text ?? "";

      meta.append(categoryEl, textEl);

      if (item.comment) {
        const commentEl = document.createElement("div");
        commentEl.className = "pane-comment";
        commentEl.textContent = item.comment;
        meta.append(commentEl);
      }

      pane.append(img, meta);
      fragment.appendChild(pane);
    }

    grid.replaceChildren(fragment);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="grid-status">스토리 데이터를 불러오지 못했습니다.</p>`;
  }
}

renderReleases();
