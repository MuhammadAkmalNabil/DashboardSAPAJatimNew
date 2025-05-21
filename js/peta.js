// Inisialisasi Peta
var map = L.map("map").setView([-7.5666, 112.2384], 8);

// Tambahkan Tile Layer
// OpenStreetMap Standard
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '© <a href="https://www.openstreetmap.org/copyright">BAPPENAS</a> - Direktorat Regional I',
}).addTo(map);

// OpenStreetMap HOT (Humanitarian)
var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});

// 1. Esri World Imagery (Satelit)
var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// 2. Lapisan Label dan Batas Esri
var esriReferenceLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ',
    minZoom: 0,
    maxZoom: 19,
    pane: 'overlayPane' // PENTING: agar label digambar di atas citra
});
// Satelit (Esri)
var esriImageryLabels = L.layerGroup([esriWorldImagery,esriReferenceLabels]);

// Gabungkan keduanya menjadi satu layer "Imagery Hybrid"
var esriImageryHybridEsriPlugin = L.esri.basemapLayer('ImageryTransportation');
var esriImageryHybridCombined = L.layerGroup([esriWorldImagery, esriReferenceLabels, esriImageryHybridEsriPlugin]);

// CartoDB Positron (Light Theme)
var cartoDBPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

// CartoDB Dark Matter (Dark Theme)
var cartoDBDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

var indikatorStunting = L.layerGroup(); // Ganti dengan L.geoJSON(...) jika sudah ada
var indikatorPangan = L.layerGroup();   // Ganti dengan L.geoJSON(...) jika sudah ada
var batasWilayah = L.layerGroup();     // Ganti dengan L.geoJSON(...) jika sudah ada

// 4. Kelompokkan Base Layers dan Overlay Layers
var baseMaps = {
    "OpenStreetMap": osm,
    "Satelit (Esri)": esriImageryLabels,
    "Imagery Hybrid (Esri)": esriImageryHybridCombined,
    "OSM Humanitarian": osmHOT,
    "Terang (CartoDB)": cartoDBPositron,
    "Gelap (CartoDB)": cartoDBDarkMatter
    // "Google Streets": googleStreets, // Jika menggunakan Google
    // "Google Satellite": googleSatellite // Jika menggunakan Google
};

// var overlayMaps = {
//     // Nama yang akan muncul di checkbox : variabel layer
//     "Indikator Stunting": indikatorStunting,
//     "Indikator Pangan": indikatorPangan,
//     "Batas Wilayah": batasWilayah // Contoh
// };

// ---- BARU: Definisikan URL Thumbnail untuk Setiap Base Map ----
const baseMapThumbnails = {
    "OpenStreetMap": "image/layer/osm.png", // GANTI DENGAN PATH GAMBAR ANDA
    "OSM Humanitarian": "image/layer/osmHOT.png", // GANTI DENGAN PATH GAMBAR ANDA
    "Imagery Hybrid (Esri)": "image/layer/esriImageryHybridCombined.png", // GANTI DENGAN PATH GAMBAR ANDA
    "Satelit (Esri)": "image/layer/esriWorldImagery.png", // GANTI DENGAN PATH GAMBAR ANDA
    "Terang (CartoDB)": "image/layer/cartoDBPositron.png", // GANTI DENGAN PATH GAMBAR ANDA
    "Gelap (CartoDB)": "image/layer/cartoDBDarkMatter.png"  // GANTI DENGAN PATH GAMBAR ANDA
}

// --- Kode Baru untuk Kontrol Layer Custom ---

const customLayerSwitcherButton = document.getElementById('custom-layer-switcher-button');
const customLayerPanel = document.getElementById('custom-layer-panel');
const closeLayerPanelButton = document.getElementById('close-layer-panel-button');
const baseLayerCardsContainer = document.querySelector('#custom-layer-panel .base-layer-cards-container');

let currentActiveBaseLayer = osm; // Layer default yang aktif
let currentActiveCard = null;

// Fungsi untuk membuat dan menambahkan kartu base map
function createBaseLayerCards() {
    if (!baseLayerCardsContainer) {
        console.error("Elemen .base-layer-cards-container tidak ditemukan di dalam #custom-layer-panel.");
        return;
    }
    baseLayerCardsContainer.innerHTML = '';

    for (const layerName in baseMaps) {
        if (baseMaps.hasOwnProperty(layerName)) {
            const layer = baseMaps[layerName];
            const thumbnailUrl = baseMapThumbnails[layerName] || 'https://via.placeholder.com/100x60.png?text=No+Preview';

            const card = document.createElement('div');
            card.className = 'layer-card';
            card.dataset.layerName = layerName;

            const img = document.createElement('img');
            img.src = thumbnailUrl;
            img.alt = layerName + ' pratinjau';

            const p = document.createElement('p');
            p.textContent = layerName;

            card.appendChild(img);
            card.appendChild(p);
            baseLayerCardsContainer.appendChild(card);

            if (map.hasLayer(layer)) {
                card.classList.add('active');
                currentActiveCard = card;
            }

            card.addEventListener('click', function() {
                if (currentActiveBaseLayer !== layer) {
                    if (map.hasLayer(currentActiveBaseLayer)) { // Pastikan layer ada sebelum dihapus
                        map.removeLayer(currentActiveBaseLayer);
                    }
                    map.addLayer(layer);
                    currentActiveBaseLayer = layer;

                    if (currentActiveCard) {
                        currentActiveCard.classList.remove('active');
                    }
                    this.classList.add('active');
                    currentActiveCard = this;
                }
                customLayerPanel.classList.remove('visible');
            });
        }
    }
}

// Event Listener untuk Tombol Pemicu dan Tombol Tutup Panel (TETAP SAMA)
if (customLayerSwitcherButton && customLayerPanel) {
    customLayerSwitcherButton.addEventListener('click', (e) => {
        e.preventDefault();
        customLayerPanel.classList.toggle('visible');
    });
}

if (closeLayerPanelButton && customLayerPanel) {
    closeLayerPanelButton.addEventListener('click', () => {
        customLayerPanel.classList.remove('visible');
    });
}

// --- Inisialisasi Layer Default dan Panggil Fungsi (TETAP SAMA) ---
if (map && osm) { // Pastikan map dan osm sudah ada
    osm.addTo(map); 
    createBaseLayerCards();
} else {
    console.error("Variabel 'map' atau layer default 'osm' belum diinisialisasi sebelum digunakan.");
}


// --- BAGIAN MANAJEMEN OVERLAY DARI PANEL CUSTOM DIHAPUS ---
// Semua kode yang mereferensikan panelCheckboxStunting, panelCheckboxPangan, panelCheckboxBatas,
// dan fungsi syncCheckboxes (jika hanya untuk panel custom) telah dihapus.

// Event listener map.on('overlayadd', ...) dan map.on('overlayremove', ...)
// mungkin masih berguna jika Anda ingin melakukan sesuatu saat overlay dari KONTROL ATAS
// ditambahkan/dihapus, tetapi mereka tidak perlu lagi memperbarui checkbox di panel custom.
map.on('overlayadd', function(e) {
    console.log('Overlay added (dari kontrol atas atau programatik):', e.layer);
    // Logika lain jika diperlukan, misal update legenda umum
});

map.on('overlayremove', function(e) {
    console.log('Overlay removed (dari kontrol atas atau programatik):', e.layer);
    // Logika lain jika diperlukan
});

// // Tambahkan Kontrol Layer ke Peta
// var layersControl = L.control.layers(baseMaps, overlayMaps, {
//     collapsed: true,
//     position: 'topleft'
// }).addTo(map);

// // Tambahkan Base Layer Default ke Peta
// osm.addTo(map); // Pastikan layer default ditambahkan SETELAH kontrol layer dibuat jika Anda ingin thumbnail muncul dengan benar saat awal

// // ---- BARU: Fungsi untuk menambahkan thumbnail ke kontrol layer ----
// function addThumbnailsToLayerControl(controlInstance, thumbnails) {
//     const baseLayersContainer = controlInstance.getContainer().querySelector('.leaflet-control-layers-base');
//     if (!baseLayersContainer) {
//         console.warn("Container untuk base layers tidak ditemukan di kontrol layer.");
//         return;
//     }

//     const labels = baseLayersContainer.getElementsByTagName('label');

//     for (let i = 0; i < labels.length; i++) {
//         const label = labels[i];
//         const spanWithText = label.querySelector('span'); // Leaflet menempatkan teks nama layer dalam span

//         if (spanWithText) {
//             const layerName = spanWithText.textContent.trim();
//             if (thumbnails[layerName]) {
//                 const thumbImg = document.createElement('img');
//                 thumbImg.src = thumbnails[layerName];
//                 thumbImg.alt = layerName + " pratinjau";
//                 thumbImg.className = 'layer-control-thumbnail';

//                 // Masukkan gambar thumbnail sebelum teks nama layer di dalam span
//                 spanWithText.prepend(thumbImg);
//             }
//         } else {
//             console.warn("Tidak dapat menemukan span dengan nama layer di label:", label);
//         }
//     }
// }

// // Panggil fungsi untuk menambahkan thumbnail setelah kontrol layer ada di peta
// addThumbnailsToLayerControl(layersControl, baseMapThumbnails);


// // Event listeners (tidak berubah)
// map.on('baselayerchange', function (e) {
//     console.log('Base layer changed to: ' + e.name);
// });

// map.on('overlayadd', function (e) {
//     console.log('Overlay added: ' + e.name);
// });

// map.on('overlayremove', function (e) {
//     console.log('Overlay removed: ' + e.name);
// });


let geojsonLayer = null;
let originalGeojsonData = null;


// --- Fungsi Warna Stunting (Tidak Berubah) ---
const getStuntingColor = (rate) => {
    if (rate === undefined || rate === null) return 'transparent';
    return rate > 30 ? "red" : rate > 20 ? "orange" : "green";
};

// --- Fungsi untuk Menerjemahkan Skor Pangan ke Status Teks (Opsional, untuk Popup/Info) ---
const getPanganStatusText = (score) => {
    if (score === undefined || score === null) return 'N/A';
    if (score <= 30) return "Rawan";
    if (score <= 70) return "Cukup";
    return "Aman";
};

// --- Fungsi Warna Pangan (Berdasarkan Skor Angka) ---
const getPanganColor = (score) => {
    if (score === undefined || score === null) return 'transparent';
    if (score <= 30) return 'purple'; // Rawan
    if (score <= 70) return 'dodgerblue'; // Cukup
    return 'lightseagreen'; // Aman
};


function initialStyle(feature) { /* ... (Tidak Berubah) ... */
    return {
        weight: 1.5,
        opacity: 1,
        color: "grey",
        dashArray: "3",
        fillOpacity: 0,
    };
}

function applyFiltersAndStyles() {
    if (!geojsonLayer) return;

    const stuntingTinggiChecked = document.getElementById('stuntingTinggi').checked;
    const stuntingSedangChecked = document.getElementById('stuntingSedang').checked;
    const stuntingRendahChecked = document.getElementById('stuntingRendah').checked;

    const panganRawanChecked = document.getElementById('panganRawan').checked;
    const panganCukupChecked = document.getElementById('panganCukup').checked;
    const panganAmanChecked = document.getElementById('panganAman').checked;

    const anyStuntingFilterActive = stuntingTinggiChecked || stuntingSedangChecked || stuntingRendahChecked;
    const anyPanganFilterActive = panganRawanChecked || panganCukupChecked || panganAmanChecked;

    geojsonLayer.eachLayer(function (layer) {
        const properties = layer.feature.properties;
        let fillColor = 'transparent';
        let fillOpacity = 0;
        let activeColorSource = null;

        if (anyStuntingFilterActive) {
            const rate = properties.stunting_rate;
            // ... (Logika stunting tidak berubah) ...
            if (stuntingTinggiChecked && rate > 30) {
                fillColor = getStuntingColor(rate);
                fillOpacity = 0.7;
                activeColorSource = 'stunting';
            } else if (stuntingSedangChecked && rate > 20 && rate <= 30) {
                fillColor = getStuntingColor(rate);
                fillOpacity = 0.7;
                activeColorSource = 'stunting';
            } else if (stuntingRendahChecked && rate <= 20 && rate !== undefined && rate !== null) {
                fillColor = getStuntingColor(rate);
                fillOpacity = 0.7;
                activeColorSource = 'stunting';
            }
        }

        if ((activeColorSource !== 'stunting' || !anyStuntingFilterActive) && anyPanganFilterActive) {
            const panganScore = properties.pangan_score; // Menggunakan pangan_score (angka)
            if (panganScore !== undefined && panganScore !== null) {
                if (panganRawanChecked && panganScore <= 30) {
                    fillColor = getPanganColor(panganScore);
                    fillOpacity = 0.7;
                } else if (panganCukupChecked && panganScore > 30 && panganScore <= 70) {
                    fillColor = getPanganColor(panganScore);
                    fillOpacity = 0.7;
                } else if (panganAmanChecked && panganScore > 70) {
                    fillColor = getPanganColor(panganScore);
                    fillOpacity = 0.7;
                }
            }
        }

        if (fillOpacity > 0) {
            layer.setStyle({
                fillColor: fillColor,
                weight: 2,
                opacity: 1,
                color: "white",
                dashArray: "3",
                fillOpacity: fillOpacity,
            });
        } else {
            layer.setStyle(initialStyle(layer.feature));
        }
    });
}

let kabupatenData = [];

fetch("data/coba.geojson")
    .then((response) => response.json())
    .then((data) => {
        originalGeojsonData = data;

        kabupatenData = originalGeojsonData.features.map((feature) => {
            let centroid;
            // ... (Logika centroid tidak berubah, pastikan error handling tetap ada) ...
            if (feature.properties.WADMKK === "Gresik") {
                centroid = [112.565, -7.155];
            } else if (feature.properties.WADMKK === "Situbondo") {
                centroid = [114.009, -7.706];
            } else if (feature.properties.WADMKK === "Sumenep") {
                centroid = [113.875, -7.0];
            } else if (feature.geometry) {
                try {
                    centroid = turf.pointOnFeature(feature).geometry.coordinates;
                } catch (e) {
                    console.warn("Gagal menghitung centroid untuk:", feature.properties.WADMKK, "Error:", e);
                    if (feature.geometry.type === "Polygon" && feature.geometry.coordinates && feature.geometry.coordinates[0]) {
                        centroid = feature.geometry.coordinates[0][0];
                    } else if (feature.geometry.type === "MultiPolygon" && feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0][0]) {
                        centroid = feature.geometry.coordinates[0][0][0];
                    } else {
                        centroid = [0, 0];
                    }
                }
            } else {
                console.warn("Fitur tidak memiliki geometri:", feature.properties.WADMKK);
                centroid = [0, 0];
            }
            let coords = [centroid[1], centroid[0]];

            return {
                name: feature.properties.WADMKK,
                province: feature.properties.WADMPR,
                stunting_rate: feature.properties.stunting_rate,
                pangan_score: feature.properties.pangan_score, // Ganti ke pangan_score
                main_commodity: feature.properties.main_commodity,
                icon_image: feature.properties.icon_image,
                coords: coords,
                categories: feature.properties.categories || {},
            };
        });

        geojsonLayer = L.geoJson(originalGeojsonData, {
            style: initialStyle,
            onEachFeature: onEachFeature,
        }).addTo(map);

        setupChecklistEventListeners();
    })
    .catch((error) => console.error("Error memuat GeoJSON:", error));

function onEachFeature(feature, layer) {
    layer.on("click", function () {
        showLayerPanel(feature.properties);
    });
    if (feature.properties) {
        const panganStatusText = getPanganStatusText(feature.properties.pangan_score); // Dapatkan teks status pangan
        const popupContent = `
            <div style="text-align: center;">
                <img src="${feature.properties.icon_image || 'image/default.jpg'}" style="width:100px; height:100px; border-radius:5px; margin-bottom:10px;"><br>
                <b style="font-size: 17px;">${feature.properties.WADMKK || 'Nama Wilayah'}</b><br>
                <b>Provinsi:</b> ${feature.properties.WADMPR || 'N/A'}<br>
                <b>Tingkat Stunting:</b> ${feature.properties.stunting_rate !== undefined ? feature.properties.stunting_rate + '%' : 'N/A'}<br>
                <b>Status Pangan:</b> ${panganStatusText} ${feature.properties.pangan_score !== undefined ? '(' + feature.properties.pangan_score + '%)' : ''}
            </div>
        `;
        layer.bindPopup(popupContent);
    }
}


// ... (showLayerPanel, updateChart, setupChecklistEventListeners, Pencarian Kustom tidak berubah) ...
// Saya akan sertakan lagi untuk kelengkapan jika ada perubahan minor di sana

function showLayerPanel(properties) {
    const panel = document.getElementById("layerPanel");
    const content = document.getElementById("layerContent");

    panel.style.display = "block";
    const namaKabupaten = properties.name || properties.WADMKK || "Tidak Diketahui";

    let headerHTML = `<h3>${namaKabupaten}</h3>`;

    // Menampilkan status pangan di panel info juga
    // if (properties.pangan_score !== undefined) {
    //     headerHTML += `<p><strong>Status Pangan:</strong> ${getPanganStatusText(properties.pangan_score)} (Skor: ${properties.pangan_score})</p>`;
    // }

    if (properties.categories && Object.keys(properties.categories).length > 0) {
        headerHTML += `<p><strong>Komoditas Utama:</strong></p>`;
    } else if (properties.main_commodity && properties.main_commodity !== "-") {
        headerHTML += `<p><strong>Komoditas Utama:</strong> ${properties.main_commodity}</p>`;
    } else if (!(properties.categories && Object.keys(properties.categories).length > 0)) { // Hanya tampilkan jika tidak ada kategori
        headerHTML += `<p><em>Tidak ada data komoditas utama atau kategori.</em></p>`;
    }
    content.innerHTML = headerHTML;


    const oldCloseBtn = panel.querySelector(".close-btn");
    if (oldCloseBtn) oldCloseBtn.remove();

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.className = "close-btn";
    closeButton.onclick = function () {
        panel.style.display = "none";
    };
    panel.appendChild(closeButton);

    const categories = properties.categories || {};

    if (Object.keys(categories).length > 0) {
        for (const [category, items] of Object.entries(categories)) {
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("category");

            const categoryToggle = document.createElement("span");
            categoryToggle.innerHTML = "+";
            categoryToggle.classList.add("toggle-button");
            categoryToggle.setAttribute("data-category", category);

            const categoryLabel = document.createElement("span");
            categoryLabel.innerHTML = `<strong>${category}</strong>`;
            categoryLabel.classList.add("category-label");

            categoryDiv.appendChild(categoryToggle);
            categoryDiv.appendChild(categoryLabel);

            const itemsDiv = document.createElement("div");
            itemsDiv.classList.add("items");
            itemsDiv.style.display = "none";

            items.forEach((item) => {
                const itemDiv = document.createElement("div");
                itemDiv.innerText = ` ${item.name} (${item.value})`;
                itemDiv.classList.add(`item-${category}`);
                itemsDiv.appendChild(itemDiv);
            });

            categoryDiv.appendChild(itemsDiv);
            content.appendChild(categoryDiv);

            categoryToggle.addEventListener("click", function () {
                const isExpanded = itemsDiv.style.display === "block";
                itemsDiv.style.display = isExpanded ? "none" : "block";
                this.innerHTML = isExpanded ? "+" : "−";
            });
        }
    }

    let chartContainer = document.getElementById("chartContainer");
    if (!chartContainer) {
        chartContainer = document.createElement("div");
        chartContainer.id = "chartContainer";
        chartContainer.innerHTML = `<p><strong>Grafik Stunting</strong></p>
                                    <canvas id="stuntingChart"></canvas>`;
        chartContainer.style =
            "margin-top: 5px; width: 90%; max-height: 250px; background: white; padding: 10px; border-radius: 5px; margin-bottom:25px";
        content.appendChild(chartContainer);
    }
    updateChart([
        { name: namaKabupaten, stunting_rate: properties.stunting_rate },
    ]);
}

let stuntingChart = null;
function updateChart(data) { /* ... (Tidak Berubah) ... */
    const ctx = document.getElementById("stuntingChart").getContext("2d");

    if (stuntingChart) {
        stuntingChart.destroy();
    }

    stuntingChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Rata-Rata Jatim", ...data.map((d) => d.name)],
            datasets: [
                {
                    label: "Tingkat Stunting (%)",
                    data: [19.13, ...data.map((d) => d.stunting_rate)],
                    backgroundColor: [
                        "rgba(0, 0, 255, 0.7)",
                        ...data.map((d) => {
                            if (d.stunting_rate > 30) return "rgba(255, 0, 0, 0.7)";
                            else if (d.stunting_rate > 20)
                                return "rgba(255, 165, 0, 0.7)";
                            else return "rgba(0, 128, 0, 0.7)";
                        }),
                    ],
                    borderColor: [
                        "rgba(0, 0, 255, 1)",
                        ...data.map((d) => {
                            if (d.stunting_rate > 30) return "rgba(255, 0, 0, 1)";
                            else if (d.stunting_rate > 20) return "rgba(255, 165, 0, 1)";
                            else return "rgba(0, 128, 0, 1)";
                        }),
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                },
            },
        },
    });
}

// ... (Kode Inisialisasi Peta, TileLayer, getStuntingColor, getPanganStatusText, getPanganColor, initialStyle, applyFiltersAndStyles tetap sama) ...
// ... (kabupatenData, fetch GeoJSON, onEachFeature, showLayerPanel, updateChart tetap sama) ...

// --- Setup Event Listener untuk Checkbox Kontrol Layer ---
function setupChecklistEventListeners() {
    // Checkbox utama untuk toggle detail
    const toggleStuntingCheckbox = document.getElementById('toggleStuntingDetails');
    const togglePanganCheckbox = document.getElementById('togglePanganDetails');
    const stuntingDetailsContainer = document.getElementById('stuntingItemsContainer');
    const panganDetailsContainer = document.getElementById('panganItemsContainer');

    // Sub-checkbox (hanya yang berdasarkan 'name' sekarang)
    const stuntingSubCheckboxes = document.querySelectorAll('#stuntingItemsContainer input[name="stunting"]');
    const panganSubCheckboxes = document.querySelectorAll('#panganItemsContainer input[name="pangan"]');

    // Event untuk toggle Stunting Details
    toggleStuntingCheckbox.addEventListener('change', function () {
        const isChecked = this.checked;
        stuntingDetailsContainer.style.display = isChecked ? 'flex' : 'none'; // atau 'block'

        // Centang/batalkan semua sub-item stunting sesuai status checkbox utama
        stuntingSubCheckboxes.forEach(cb => cb.checked = isChecked);

        // Perbarui peta
        applyFiltersAndStyles();

        // Jika checkbox utama tidak dicentang, pastikan sub-item tidak tercentang
        // Ini sudah ditangani oleh baris di atas: stuntingSubCheckboxes.forEach(cb => cb.checked = isChecked);
    });

    // Event untuk toggle Pangan Details
    togglePanganCheckbox.addEventListener('change', function () {
        const isChecked = this.checked;
        panganDetailsContainer.style.display = isChecked ? 'flex' : 'none'; // atau 'block'

        // Centang/batalkan semua sub-item pangan sesuai status checkbox utama
        panganSubCheckboxes.forEach(cb => cb.checked = isChecked);

        // Perbarui peta
        applyFiltersAndStyles();
    });


    // Event listener untuk sub-item Stunting (jika pengguna mengubahnya secara manual setelah grup utama aktif)
    stuntingSubCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFiltersAndStyles();
            // Periksa apakah SEMUA sub-item stunting tidak tercentang, jika iya, batalkan centang toggleStuntingCheckbox
            let allStuntingUnchecked = true;
            stuntingSubCheckboxes.forEach(cb => {
                if (cb.checked) allStuntingUnchecked = false;
            });
            if (allStuntingUnchecked && toggleStuntingCheckbox.checked) { // Hanya jika grup utama sedang aktif
                // toggleStuntingCheckbox.checked = false; // Opsi 1: Otomatis uncheck grup utama
                // stuntingDetailsContainer.style.display = 'none'; // Sembunyikan lagi detailnya
                // Atau biarkan pengguna yang uncheck grup utama secara manual jika mereka ingin.
                // Untuk saat ini, kita biarkan grup utama tetap tercentang jika detailnya terbuka.
            } else if (!allStuntingUnchecked && !toggleStuntingCheckbox.checked && stuntingDetailsContainer.style.display === 'flex') {
                // Jika ada sub-item yang tercentang tapi grup utama tidak, ini kondisi aneh, sebaiknya sinkronkan.
                // Namun, idealnya, jika grup utama tidak tercentang, detailnya tersembunyi dan sub-item tidak tercentang.
            }
        });
    });

    // Event listener untuk sub-item Pangan (jika pengguna mengubahnya secara manual)
    panganSubCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFiltersAndStyles();
            // Logika serupa untuk Pangan jika diperlukan (opsional)
            let allPanganUnchecked = true;
            panganSubCheckboxes.forEach(cb => {
                if (cb.checked) allPanganUnchecked = false;
            });
            if (allPanganUnchecked && togglePanganCheckbox.checked) {
                // togglePanganCheckbox.checked = false;
                // panganDetailsContainer.style.display = 'none';
            }
        });
    });

    // Panggil sekali untuk memastikan state awal benar
    // (detail tersembunyi jika toggle utama tidak checked saat load)
    if (!toggleStuntingCheckbox.checked) {
        stuntingDetailsContainer.style.display = 'none';
        stuntingSubCheckboxes.forEach(cb => cb.checked = false); // Pastikan sub-item juga tidak tercentang
    } else { // Jika toggle utama tercentang saat load (misalnya dari state sebelumnya)
        stuntingSubCheckboxes.forEach(cb => cb.checked = true); // Centang semua sub-item
    }

    if (!togglePanganCheckbox.checked) {
        panganDetailsContainer.style.display = 'none';
        panganSubCheckboxes.forEach(cb => cb.checked = false);
    } else {
        panganSubCheckboxes.forEach(cb => cb.checked = true);
    }
    applyFiltersAndStyles(); // Terapkan filter awal berdasarkan state checkbox
}

// HAPUS FUNGSI updateSelectAllState
// function updateSelectAllState(masterCheckbox, childCheckboxesGroup) { ... }


// ... (Sisa kode Anda: Fungsi Pencarian Kustom, dll. tetap sama) ...

// --- Fungsi Pencarian Kustom ---
const searchContainer = document.createElement("div"); /* ... (Tidak Berubah) ... */
searchContainer.style =
    "position: fixed; top: 85px; right: 20px; z-index: 1000; width: 330px;display: flex; align-items: center;";

const searchInput = document.createElement("input"); /* ... (Tidak Berubah) ... */
searchInput.type = "text";
searchInput.placeholder = "Cari Kabupaten/Kota Jawa Timur...";
searchInput.style = "width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;";

const clearButton = document.createElement("span"); /* ... (Tidak Berubah) ... */
clearButton.innerHTML = "×";
clearButton.style =
    "position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 20px; display: none; color: gray;";

const resultContainer = document.createElement("ul"); /* ... (Tidak Berubah) ... */
resultContainer.className = "search-results";
resultContainer.style =
    "position: fixed; top: 125px; right: 20px; z-index: 1000; width: 330px; background: white; list-style: none; padding: 0; margin: 0; border: 1px solid #ddd; border-top: none; max-height: 300px; overflow-y: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: none;";

searchContainer.appendChild(searchInput);
searchContainer.appendChild(clearButton);
document.body.appendChild(searchContainer);
document.body.appendChild(resultContainer);

searchInput.addEventListener("input", function () { /* ... (Tidak Berubah, tapi pastikan `kabupaten.pangan_score` ada jika ingin ditampilkan di search result atau popup dari search) ... */
    const query = this.value.toLowerCase();
    resultContainer.innerHTML = "";
    clearButton.style.display = query ? "block" : "none";

    if (query && kabupatenData.length > 0) {
        resultContainer.style.display = 'block';
        let found = false;
        kabupatenData.forEach((kabupaten) => {
            if (kabupaten.name && kabupaten.name.toLowerCase().includes(query)) {
                found = true;
                const li = document.createElement("li");
                li.textContent = kabupaten.name;
                li.style = "padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;";
                li.addEventListener("mouseover", () => li.style.backgroundColor = "#f0f0f0");
                li.addEventListener("mouseout", () => li.style.backgroundColor = "white");

                li.addEventListener("click", () => {
                    map.setView(kabupaten.coords, 10);
                    const panganStatusTextFromSearch = getPanganStatusText(kabupaten.pangan_score);
                    const popupContent = `
                        <div style="text-align: center;">
                            <img src="${kabupaten.icon_image || 'image/default.jpg'}" style="width:100px; height:100px; border-radius:5px; margin-bottom:10px;"><br>
                            <b style="font-size: 17px;">${kabupaten.name}</b><br>
                            <b>Provinsi:</b> ${kabupaten.province}<br>
                            <b>Tingkat Stunting:</b> ${kabupaten.stunting_rate !== undefined ? kabupaten.stunting_rate + '%' : 'N/A'}<br>
                            <b>Status Pangan:</b> ${panganStatusTextFromSearch} ${kabupaten.pangan_score !== undefined ? '(' + kabupaten.pangan_score + '%)' : ''}
                        </div>
                    `;
                    L.popup()
                        .setLatLng(kabupaten.coords)
                        .setContent(popupContent)
                        .openOn(map);

                    showLayerPanel({ // Kirim semua properti yang dibutuhkan
                        name: kabupaten.name,
                        province: kabupaten.province,
                        stunting_rate: kabupaten.stunting_rate,
                        pangan_score: kabupaten.pangan_score, // Kirim skor pangan
                        main_commodity: kabupaten.main_commodity,
                        icon_image: kabupaten.icon_image,
                        categories: kabupaten.categories || {},
                    });

                    resultContainer.innerHTML = "";
                    resultContainer.style.display = 'none';
                    searchInput.value = kabupaten.name;
                    clearButton.style.display = "block";
                });
                resultContainer.appendChild(li);
            }
        });
        if (!found) {
            const li = document.createElement("li");
            li.textContent = "Tidak ada hasil ditemukan";
            li.style = "padding: 10px; color: grey; font-style: italic;";
            resultContainer.appendChild(li);
        }
    } else {
        resultContainer.style.display = 'none';
    }
});

clearButton.addEventListener("click", function () { /* ... (Tidak Berubah) ... */
    searchInput.value = "";
    resultContainer.innerHTML = "";
    resultContainer.style.display = 'none';
    clearButton.style.display = "none";
    searchInput.focus();
});

document.addEventListener('click', function (event) { /* ... (Tidak Berubah) ... */
    if (!searchContainer.contains(event.target) && !resultContainer.contains(event.target)) {
        resultContainer.style.display = 'none';
    }
});

// function showLayerPanelWithCategories(properties) {
//     // console.log('Properties diterima:', properties);  // <-- Ini wajib untuk debugging

//     const panel = document.getElementById('layerPanel');
//     const content = document.getElementById('layerContent');

//     // Tampilkan panel
//     panel.style.display = 'block';
//     const namaKabupaten = properties.name || properties.WADMKK || 'Tidak Diketahui';
//     content.innerHTML = `<h3>${namaKabupaten}</h3><p><strong>Komoditas Utama</strong></p>`;

//     // Bersihkan tombol close sebelumnya biar gak dobel
//     const oldCloseBtn = panel.querySelector('.close-btn');
//     if (oldCloseBtn) oldCloseBtn.remove();

//     // Buat tombol close (X)
//     const closeButton = document.createElement('button');
//     closeButton.innerHTML = '&times;';
//     closeButton.className = 'close-btn';

//     closeButton.style.position = 'absolute';
//     closeButton.style.top = '5px';
//     closeButton.style.right = '5px';
//     closeButton.style.background = 'transparent';
//     closeButton.style.border = 'none';
//     closeButton.style.fontSize = '20px';
//     closeButton.style.cursor = 'pointer';

//     closeButton.onclick = function() {
//         panel.style.display = 'none';
//     };

//     panel.appendChild(closeButton);

//     const categories = properties.categories || {};

//     // Kalau tidak ada kategori, tampilkan pesan
//     if (Object.keys(categories).length === 0) {
//         content.innerHTML = `<p><em>Tidak ada data kategori.</em></p>`;
//         return;
//     }

//     // Loop kategori dan tampilkan checkbox + sub-item
//     for (const [category, items] of Object.entries(categories)) {
//         const categoryDiv = document.createElement('div');
//         categoryDiv.classList.add('category');

//         // Checkbox kategori
//         const categoryLabel = document.createElement('label');
//         categoryLabel.innerHTML = `<input type="checkbox" class="category-checkbox" data-category="${category}"> <strong>${category}</strong>`;
//         categoryDiv.appendChild(categoryLabel);

//         // Tempat sub-item (hidden by default)
//         const itemsDiv = document.createElement('div');
//         itemsDiv.classList.add('items');
//         itemsDiv.style.display = 'none';

//         items.forEach(item => {
//             const itemDiv = document.createElement('div');
//             itemDiv.innerText = `- ${item.name} (${item.value})`;
//             itemDiv.classList.add(`item-${category}`);
//             itemsDiv.appendChild(itemDiv);
//         });

//         categoryDiv.appendChild(itemsDiv);
//         content.appendChild(categoryDiv);
//     }

//     // Event listener untuk expand/collapse saat checkbox diklik
//     document.querySelectorAll('.category-checkbox').forEach(checkbox => {
//         checkbox.addEventListener('change', function () {
//             const category = this.getAttribute('data-category');
//             const itemsDiv = document.querySelectorAll(`.item-${category}`);
//             itemsDiv.forEach(itemDiv => {
//                 itemDiv.style.display = this.checked ? 'block' : 'none';
//             });
//         });
//     });
// }

// // Custom Zoom Control
// const customZoomControl = L.control({ position: 'bottomright' });
// customZoomControl.onAdd = function () {
//     const container = L.DomUtil.create('div', 'custom-zoom');
//     const zoomInButton = L.DomUtil.create('button', '', container);
//     zoomInButton.innerHTML = '+';
//     const zoomOutButton = L.DomUtil.create('button', '', container);
//     zoomOutButton.innerHTML = '-';

//     zoomInButton.onclick = function () {
//         map.zoomIn();
//     };
//     zoomOutButton.onclick = function () {
//         map.zoomOut();
//     };

//     return container;
// };
// customZoomControl.addTo(map);
