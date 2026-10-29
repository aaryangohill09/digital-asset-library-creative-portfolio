
"use strict";

/* ---------------------------------------
   FrameVault — Digital Asset Library
   Frontend prototype using vanilla JS
---------------------------------------- */

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024;

const $ = (selector) => document.querySelector(selector);

const elements = {
  sidebar: $("#sidebar"),
  mobileMenu: $("#mobile-menu"),
  breadcrumb: $("#breadcrumb-current"),
  assetCount: $("#asset-count"),
  navAssetCount: $("#nav-asset-count"),
  imageCount: $("#image-count"),
  collectionCount: $("#collection-count"),
  storageTotal: $("#storage-total"),
  storageUsed: $("#storage-used"),
  storageFill: $("#storage-fill"),
  storagePercent: $("#storage-percent"),
  recentGrid: $("#recent-grid"),
  assetGrid: $("#asset-grid"),
  searchInput: $("#search-input"),
  typeFilter: $("#type-filter"),
  sortFilter: $("#sort-filter"),
  resultsSummary: $("#results-summary"),
  emptyState: $("#empty-state"),
  clearFiles: $("#clear-files"),
  fileInput: $("#file-input"),
  dropzone: $("#dropzone"),
  uploadMessage: $("#upload-message"),
  collectionForm: $("#collection-form"),
  collectionName: $("#collection-name"),
  collectionList: $("#collection-list"),
  overviewCollections: $("#overview-collections"),
  portfolioForm: $("#portfolio-form"),
  portfolioName: $("#portfolio-name"),
  portfolioBio: $("#portfolio-bio"),
  previewName: $("#preview-name"),
  previewBio: $("#preview-bio"),
  portfolioAssets: $("#portfolio-assets"),
  toast: $("#toast"),
  helpButton: $("#help-button")
};

const demoAssets = [
  {
    id: "demo-1",
    name: "Botanical Study",
    type: "image",
    size: 2.4 * 1024 * 1024,
    date: "2026-10-27T10:20:00",
    category: "Photography",
    visual: "botanical",
    color: "#dce8d5"
  },
  {
    id: "demo-2",
    name: "Brand Moodboard",
    type: "image",
    size: 3.1 * 1024 * 1024,
    date: "2026-10-26T15:10:00",
    category: "Design",
    visual: "moodboard",
    color: "#eee2d3"
  },
  {
    id: "demo-3",
    name: "Studio Portraits",
    type: "image",
    size: 4.8 * 1024 * 1024,
    date: "2026-10-25T12:30:00",
    category: "Photography",
    visual: "portrait",
    color: "#e8d9d3"
  },
  {
    id: "demo-4",
    name: "Packaging Concepts",
    type: "image",
    size: 1.7 * 1024 * 1024,
    date: "2026-10-24T09:45:00",
    category: "Branding",
    visual: "packaging",
    color: "#e7e6d8"
  },
  {
    id: "demo-5",
    name: "Autumn Campaign",
    type: "image",
    size: 5.2 * 1024 * 1024,
    date: "2026-10-23T11:15:00",
    category: "Campaign",
    visual: "autumn",
    color: "#e9d6bc"
  },
  {
    id: "demo-6",
    name: "Colour Experiments",
    type: "image",
    size: 1.2 * 1024 * 1024,
    date: "2026-10-22T14:00:00",
    category: "Design",
    visual: "colour",
    color: "#e2e2f0"
  },
  {
    id: "demo-7",
    name: "Project Notes.pdf",
    type: "document",
    size: 620 * 1024,
    date: "2026-10-21T16:00:00",
    category: "Documents",
    visual: "document",
    color: "#f2eadb"
  },
  {
    id: "demo-8",
    name: "Creative Reel.mp4",
    type: "video",
    size: 18 * 1024 * 1024,
    date: "2026-10-20T13:00:00",
    category: "Video",
    visual: "video",
    color: "#e0e6f0"
  }
];

let assets = demoAssets.map((asset) => ({ ...asset, demo: true }));
let collections = [
  { id: "collection-1", name: "Brand identity", count: 3 },
  { id: "collection-2", name: "Photography", count: 2 },
  { id: "collection-3", name: "Inspiration board", count: 3 }
];

let nextAssetId = 1;
let nextCollectionId = 4;
let toastTimeout;
const objectUrls = new Map();

/* ---------- General helpers ---------- */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 MB";

  const megabytes = bytes / (1024 * 1024);

  if (megabytes < 1) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(2)} GB`;
  }

  return `${megabytes.toFixed(1)} MB`;
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Recently added";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getFileExtension(name) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

function getTypeFromFile(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";

  const extension = getFileExtension(file.name).toLowerCase();

  const documentExtensions = [
    "pdf", "doc", "docx", "txt", "rtf",
    "xls", "xlsx", "ppt", "pptx", "csv"
  ];

  if (documentExtensions.includes(extension)) {
    return "document";
  }

  return "other";
}

function showToast(message) {
  if (!elements.toast) return;

  clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2800);
}

function getTotalStorage() {
  return assets.reduce((total, asset) => total + asset.size, 0);
}

function getImageCount() {
  return assets.filter((asset) => asset.type === "image").length;
}

/* ---------- Asset rendering ---------- */

function getVisualMarkup(asset) {
  if (asset.url && asset.type === "image") {
    return `<img src="${escapeHTML(asset.url)}" alt="${escapeHTML(asset.name)}">`;
  }

  if (asset.demo && asset.type === "image") {
    const visualStyles = {
      botanical: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#dce8d5"/>
          <circle cx="185" cy="35" r="46" fill="#c5d7bd"/>
          <path d="M120 160 Q119 85 78 32" fill="none" stroke="#6d8a64" stroke-width="4"/>
          <path d="M105 118 Q42 106 45 55 Q94 62 105 118" fill="#789b72"/>
          <path d="M117 90 Q114 40 162 22 Q168 68 117 90" fill="#52764e"/>
          <path d="M120 160 Q152 108 197 95" fill="none" stroke="#78916c" stroke-width="4"/>
          <path d="M157 123 Q160 79 206 76 Q203 113 157 123" fill="#93aa83"/>
        </svg>`,
      moodboard: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#efe4d4"/>
          <rect x="14" y="14" width="100" height="61" rx="2" fill="#bf9273"/>
          <rect x="122" y="14" width="104" height="61" rx="2" fill="#d8c6ad"/>
          <rect x="14" y="83" width="61" height="63" rx="2" fill="#9baf91"/>
          <rect x="83" y="83" width="61" height="63" rx="2" fill="#f7f2e8"/>
          <rect x="152" y="83" width="74" height="63" rx="2" fill="#b3a1b5"/>
          <circle cx="180" cy="44" r="18" fill="#a27b68"/>
          <path d="M28 60 L54 28 L91 60Z" fill="#e4c4a3"/>
          <path d="M93 143 Q106 91 135 98 Q127 131 93 143" fill="#748d69"/>
        </svg>`,
      portrait: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#e8d9d3"/>
          <rect x="20" y="12" width="200" height="148" rx="5" fill="#d2b6a9"/>
          <circle cx="120" cy="62" r="28" fill="#b98267"/>
          <path d="M91 57 Q87 21 121 23 Q153 22 149 60 L141 44 Q114 33 98 50Z" fill="#4b453e"/>
          <path d="M66 160 Q70 91 120 91 Q170 91 174 160" fill="#647665"/>
          <path d="M111 77 Q120 83 129 77" fill="none" stroke="#805a4b" stroke-width="2"/>
        </svg>`,
      packaging: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#e8e7d9"/>
          <ellipse cx="120" cy="139" rx="77" ry="9" fill="#c5c7b7"/>
          <path d="M54 50 L114 30 L114 115 L54 130Z" fill="#c7a97d"/>
          <path d="M114 30 L181 50 L181 129 L114 115Z" fill="#e2cba5"/>
          <path d="M54 50 L114 69 L181 50 L114 30Z" fill="#f0e0c0"/>
          <path d="M114 69 L114 115" stroke="#b09269" stroke-width="2"/>
          <circle cx="116" cy="82" r="11" fill="#819277"/>
          <path d="M116 92 L116 103" stroke="#819277" stroke-width="2"/>
        </svg>`,
      autumn: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#e9d6bc"/>
          <circle cx="177" cy="38" r="23" fill="#f4e8c9"/>
          <path d="M0 124 Q54 84 98 124 T240 109 V160 H0Z" fill="#c48d5e"/>
          <path d="M0 142 Q68 105 131 143 T240 133 V160 H0Z" fill="#a96f4d"/>
          <path d="M43 100 Q73 51 95 24" fill="none" stroke="#78664a" stroke-width="5"/>
          <ellipse cx="61" cy="57" rx="17" ry="9" transform="rotate(-35 61 57)" fill="#b77a47"/>
          <ellipse cx="83" cy="43" rx="18" ry="9" transform="rotate(35 83 43)" fill="#d1a06a"/>
          <ellipse cx="44" cy="86" rx="17" ry="9" transform="rotate(30 44 86)" fill="#d29a55"/>
        </svg>`,
      colour: `
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect width="240" height="160" fill="#e3e2f0"/>
          <circle cx="72" cy="72" r="51" fill="#8d91c4"/>
          <circle cx="134" cy="63" r="42" fill="#c5a4c5"/>
          <circle cx="159" cy="106" r="39" fill="#e7c4a6"/>
          <circle cx="88" cy="122" r="27" fill="#9bb5a0"/>
        </svg>`
    };

    return visualStyles[asset.visual] || "";
  }

  const icon = asset.type === "video"
    ? "▶"
    : asset.type === "document"
      ? "▤"
      : "▧";

  return `<div class="asset-placeholder" aria-hidden="true">${icon}</div>`;
}

function createAssetCard(asset) {
  const extension = getFileExtension(asset.name);
  const imageLabel = asset.type === "image"
    ? "IMAGE"
    : asset.type === "video"
      ? "VIDEO"
      : asset.type === "document"
        ? extension
        : "FILE";

  return `
    <article class="asset-card" data-asset-id="${escapeHTML(asset.id)}">
      <div class="asset-preview" data-kind="${escapeHTML(asset.type)}">
        ${getVisualMarkup(asset)}
        <span class="asset-badge">${escapeHTML(imageLabel)}</span>
      </div>
      <div class="asset-details">
        <h3 class="asset-name" title="${escapeHTML(asset.name)}">${escapeHTML(asset.name)}</h3>
        <div class="asset-meta">
          <span>${escapeHTML(asset.category || "Uncategorized")}</span>
          <span>${escapeHTML(formatBytes(asset.size))}</span>
        </div>
        <div class="asset-actions">
          <button type="button" data-action="details" data-id="${escapeHTML(asset.id)}">File details</button>
          ${asset.demo
            ? `<span aria-label="Sample asset" title="Sample asset">Demo</span>`
            : `<button class="delete-asset" type="button" data-action="delete" data-id="${escapeHTML(asset.id)}">Remove</button>`
          }
        </div>
      </div>
    </article>
  `;
}

function renderGrid(container, list) {
  if (!container) return;
  container.innerHTML = list.map(createAssetCard).join("");
}

function getFilteredAssets() {
  const query = (elements.searchInput?.value || "").trim().toLowerCase();
  const type = elements.typeFilter?.value || "all";
  const sort = elements.sortFilter?.value || "recent";

  const filtered = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(query) ||
      (asset.category || "").toLowerCase().includes(query) ||
      asset.type.toLowerCase().includes(query);

    const matchesType = type === "all" || asset.type === type;

    return matchesSearch && matchesType;
  });

  filtered.sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sort === "size") {
      return b.size - a.size;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return filtered;
}

function renderLibrary() {
  const filtered = getFilteredAssets();

  renderGrid(elements.assetGrid, filtered);

  if (elements.resultsSummary) {
    elements.resultsSummary.textContent =
      `Showing ${filtered.length} of ${assets.length} assets`;
  }

  elements.emptyState?.classList.toggle("hidden", filtered.length > 0);
  elements.assetGrid?.classList.toggle("hidden", filtered.length === 0);
}

function renderRecentAssets() {
  const recent = [...assets]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  renderGrid(elements.recentGrid, recent);
}

function renderPortfolioAssets() {
  if (!elements.portfolioAssets) return;

  const images = assets.filter((asset) => asset.type === "image").slice(0, 3);

  elements.portfolioAssets.innerHTML = images.map((asset) => `
    <div class="mini-asset">
      ${getVisualMarkup(asset)}
    </div>
  `).join("");
}

/* ---------- Stats and storage ---------- */

function renderStats() {
  const total = getTotalStorage();
  const percentage = Math.min((total / STORAGE_LIMIT) * 100, 100);

  if (elements.assetCount) {
    elements.assetCount.textContent = assets.length;
  }

  if (elements.navAssetCount) {
    elements.navAssetCount.textContent = assets.length;
  }

  if (elements.imageCount) {
    elements.imageCount.textContent = getImageCount();
  }

  if (elements.collectionCount) {
    elements.collectionCount.textContent = collections.length;
  }

  if (elements.storageTotal) {
    elements.storageTotal.textContent = formatBytes(total);
  }

  if (elements.storageUsed) {
    elements.storageUsed.textContent = formatBytes(total);
  }

  if (elements.storageFill) {
    elements.storageFill.style.width = `${percentage}%`;
  }

  if (elements.storagePercent) {
    elements.storagePercent.textContent =
      `${percentage.toFixed(1)}% of demo storage capacity`;
  }
}

/* ---------- Collections ---------- */

function createCollectionMarkup(collection) {
  return `
    <div class="collection-row">
      <div class="collection-swatch" aria-hidden="true">▦</div>
      <div class="collection-info">
        <strong>${escapeHTML(collection.name)}</strong>
        <span>${collection.count} ${collection.count === 1 ? "asset" : "assets"} · Collection</span>
      </div>
      ${collection.demo
        ? ""
        : `<button class="delete-collection" type="button" data-delete-collection="${escapeHTML(collection.id)}" aria-label="Delete ${escapeHTML(collection.name)}">Remove</button>`
      }
    </div>
  `;
}

function renderCollections() {
  const markup = collections.map(createCollectionMarkup).join("");

  if (elements.collectionList) {
    elements.collectionList.innerHTML = markup ||
      `<p class="muted-copy">No collections yet. Create one above to get started.</p>`;
  }

  if (elements.overviewCollections) {
    elements.overviewCollections.innerHTML = markup ||
      `<p class="muted-copy">Your collections will appear here.</p>`;
  }

  renderStats();
}

/* ---------- Navigation ---------- */

const pageNames = {
  overview: "Overview",
  library: "Asset library",
  collections: "Collections",
  portfolio: "My portfolio",
  sharing: "Shared links",
  versions: "Version history",
  upload: "Upload assets"
};

function navigateToSection(sectionId) {
  const targetId = pageNames[sectionId] ? sectionId : "overview";

  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("hidden-section", section.id !== targetId);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.getAttribute("href") === `#${targetId}`;
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (elements.breadcrumb) {
    elements.breadcrumb.textContent = pageNames[targetId];
  }

  elements.sidebar?.classList.remove("mobile-open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (targetId === "library") renderLibrary();
}

function handleNavigation(event) {
  const link = event.target.closest('a[href^="#"]');

  if (!link) return;

  const sectionId = link.getAttribute("href").slice(1);

  if (!pageNames[sectionId]) return;

  event.preventDefault();
  history.replaceState(null, "", `#${sectionId}`);
  navigateToSection(sectionId);
}

/* ---------- File upload ---------- */

function showUploadMessage(message, isError = false) {
  if (!elements.uploadMessage) return;

  elements.uploadMessage.textContent = message;
  elements.uploadMessage.style.color = isError ? "#a15d53" : "";
}

function addFiles(fileList) {
  const files = Array.from(fileList || []);

  if (files.length === 0) return;

  let added = 0;
  let rejected = 0;
  const errors = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      rejected++;
      errors.push(`${file.name}: exceeds the 15 MB limit`);
      continue;
    }

    if (assets.some((asset) =>
      !asset.demo &&
      asset.name === file.name &&
      asset.size === file.size
    )) {
      rejected++;
      errors.push(`${file.name}: already added`);
      continue;
    }

    const type = getTypeFromFile(file);
    const url = URL.createObjectURL(file);
    const id = `upload-${nextAssetId++}`;

    objectUrls.set(id, url);

    assets.unshift({
      id,
      name: file.name,
      type,
      size: file.size,
      date: new Date().toISOString(),
      category: type === "image"
        ? "Uploaded image"
        : type === "video"
          ? "Uploaded video"
          : type === "document"
            ? "Uploaded document"
            : "Other file",
      url,
      demo: false
    });

    added++;
  }

  renderAll();

  if (added > 0 && rejected === 0) {
    showUploadMessage(
      `${added} file${added === 1 ? "" : "s"} added to this browser session.`
    );
    showToast(`${added} file${added === 1 ? "" : "s"} added successfully.`);
  } else if (added > 0) {
    showUploadMessage(
      `${added} file(s) added. ${rejected} file(s) skipped. ${errors.join("; ")}`,
      true
    );
    showToast(`${added} file(s) added; ${rejected} skipped.`);
  } else {
    showUploadMessage(
      errors.join("; ") || "No files were added.",
      true
    );
    showToast("No files were added. Check the file size or duplicates.");
  }

  if (elements.fileInput) {
    elements.fileInput.value = "";
  }
}

function removeAsset(assetId) {
  const asset = assets.find((item) => item.id === assetId);

  if (!asset) return;

  if (asset.demo) {
    showToast("Sample assets cannot be removed in this demo.");
    return;
  }

  const url = objectUrls.get(assetId);

  if (url) {
    URL.revokeObjectURL(url);
    objectUrls.delete(assetId);
  }

  assets = assets.filter((item) => item.id !== assetId);

  renderAll();
  showToast("Asset removed from this session.");
}

function clearUploadedAssets() {
  const uploaded = assets.filter((asset) => !asset.demo);

  if (uploaded.length === 0) {
    showToast("There are no uploaded files to clear.");
    return;
  }

  const confirmed = window.confirm(
    `Remove all ${uploaded.length} uploaded file(s) from this browser session?`
  );

  if (!confirmed) return;

  uploaded.forEach((asset) => {
    const url = objectUrls.get(asset.id);

    if (url) URL.revokeObjectURL(url);

    objectUrls.delete(asset.id);
  });

  assets = assets.filter((asset) => asset.demo);

  renderAll();
  showUploadMessage("Uploaded files cleared. Sample assets remain available.");
  showToast("Uploaded files cleared.");
}

/* ---------- Asset details ---------- */

function showAssetDetails(assetId) {
  const asset = assets.find((item) => item.id === assetId);

  if (!asset) return;

  const details = [
    `Name: ${asset.name}`,
    `Type: ${asset.type}`,
    `Size: ${formatBytes(asset.size)}`,
    `Category: ${asset.category || "Uncategorized"}`,
    `Added: ${formatDate(asset.date)}`,
    asset.demo
      ? "Source: Sample asset"
      : "Source: Local browser session"
  ];

  window.alert(details.join("\n"));
}

/* ---------- Portfolio ---------- */

function updatePortfolioPreview(event) {
  if (event) event.preventDefault();

  const name = elements.portfolioName?.value.trim() || "Creative Portfolio";
  const bio = elements.portfolioBio?.value.trim() ||
    "A creative professional exploring new ideas.";

  if (elements.previewName) {
    elements.previewName.textContent = name;
  }

  if (elements.previewBio) {
    elements.previewBio.textContent = bio;
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const avatar = document.querySelector(".preview-avatar");

  if (avatar) {
    avatar.textContent = initials || "CV";
  }

  renderPortfolioAssets();

  if (event) {
    showToast("Portfolio preview updated.");
  }
}

/* ---------- Event listeners ---------- */

function setupEvents() {
  document.addEventListener("click", handleNavigation);

  elements.mobileMenu?.addEventListener("click", () => {
    elements.sidebar?.classList.toggle("mobile-open");
  });

  elements.searchInput?.addEventListener("input", renderLibrary);
  elements.typeFilter?.addEventListener("change", renderLibrary);
  elements.sortFilter?.addEventListener("change", renderLibrary);

  elements.assetGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const assetId = button.dataset.id;

    if (action === "delete") {
      removeAsset(assetId);
    } else if (action === "details") {
      showAssetDetails(assetId);
    }
  });

  elements.recentGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    if (button.dataset.action === "details") {
      showAssetDetails(button.dataset.id);
    } else if (button.dataset.action === "delete") {
      removeAsset(button.dataset.id);
    }
  });

  elements.clearFiles?.addEventListener("click", clearUploadedAssets);

  elements.fileInput?.addEventListener("change", (event) => {
    addFiles(event.target.files);
  });

  elements.dropzone?.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("dragover");
  });

  elements.dropzone?.addEventListener("dragleave", (event) => {
    if (!elements.dropzone.contains(event.relatedTarget)) {
      elements.dropzone.classList.remove("dragover");
    }
  });

  elements.dropzone?.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropzone.classList.remove("dragover");
    addFiles(event.dataTransfer.files);
  });

  elements.collectionForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = elements.collectionName?.value.trim();

    if (!name) {
      showToast("Please enter a collection name.");
      return;
    }

    const duplicate = collections.some(
      (collection) => collection.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      showToast("A collection with that name already exists.");
      return;
    }

    collections.push({
      id: `collection-${nextCollectionId++}`,
      name,
      count: 0,
      demo: false
    });

    elements.collectionForm.reset();
    renderCollections();
    showToast("Collection created.");
  });

  elements.collectionList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-collection]");

    if (!button) return;

    const collectionId = button.dataset.deleteCollection;
    const collection = collections.find((item) => item.id === collectionId);

    if (!collection || collection.demo) return;

    collections = collections.filter((item) => item.id !== collectionId);
    renderCollections();
    showToast("Collection removed.");
  });

  elements.portfolioForm?.addEventListener("submit", updatePortfolioPreview);

  elements.helpButton?.addEventListener("click", () => {
    window.alert(
      "FrameVault frontend prototype\n\n" +
      "• Upload: add files up to 15 MB each.\n" +
      "• Asset library: search, filter, sort and view file details.\n" +
      "• Collections: create and remove demo-session collections.\n" +
      "• Portfolio: edit the local preview.\n\n" +
      "Files and changes are not saved to a server. " +
      "Refresh the page to reset the demo."
    );
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement;

    if (event.key === "/" && !typing) {
      const libraryIsVisible = !$("#library")?.classList.contains("hidden-section");

      if (libraryIsVisible && elements.searchInput) {
        event.preventDefault();
        elements.searchInput.focus();
      }
    }

    if (event.key === "Escape") {
      elements.sidebar?.classList.remove("mobile-open");
    }
  });

  window.addEventListener("hashchange", () => {
    const sectionId = window.location.hash.slice(1);
    navigateToSection(sectionId);
  });

  window.addEventListener("beforeunload", () => {
    for (const url of objectUrls.values()) {
      URL.revokeObjectURL(url);
    }
  });
}

/* ---------- Application rendering ---------- */

function renderAll() {
  renderStats();
  renderLibrary();
  renderRecentAssets();
  renderCollections();
  renderPortfolioAssets();
}

function init() {
  setupEvents();
  renderAll();
  updatePortfolioPreview();

  const initialSection = window.location.hash.slice(1);
  navigateToSection(pageNames[initialSection] ? initialSection : "overview");
}

document.addEventListener("DOMContentLoaded", init);