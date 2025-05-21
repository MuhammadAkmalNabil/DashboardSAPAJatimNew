// Variabel global
let map; // ASUMSI SUDAH ADA: Inisialisasi peta Anda di sini atau di tempat lain
// Contoh inisialisasi peta (sesuaikan dengan Anda):
// map = L.map('mapDivId').setView([-7.5, 112.0], 8);
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


let originalGeojsonData = null;
let kabupatenData = [];
let geojsonLayer = null;
let hoverPopup = null;

// --- Referensi ke Checkbox Anda (GANTI ID JIKA PERLU) ---
const checkboxStunting = document.getElementById('petaIndikatorStunting');
const checkboxPangan = document.getElementById('petaIndikatorPangan');

// --- Fungsi Warna ---
const getStuntingColor = (rate) => {
    if (rate === undefined || rate === null || rate === '') return 'transparent';
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate)) return 'transparent';
    return numericRate > 30 ? "red" : numericRate > 20 ? "orange" : "green";
};

const getPanganStatusText = (score) => {
    if (score === undefined || score === null || score === '') return 'N/A';
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return 'N/A';
    if (numericScore <= 30) return "Rawan";
    if (numericScore <= 70) return "Cukup";
    return "Aman";
};

const getPanganColor = (score) => {
    if (score === undefined || score === null || score === '') return 'transparent';
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return 'transparent';
    if (numericScore <= 30) return 'purple';
    if (numericScore <= 70) return 'dodgerblue';
    return 'lightseagreen';
};

// --- FUNGSI STYLE DINAMIS UTAMA ---
function getDynamicFeatureStyle(feature) {
    let fillColor = 'transparent';
    let fillOpacity = 0;

    // Cek status checkbox untuk menentukan warna
    // Prioritaskan stunting jika keduanya aktif, atau sesuaikan logika prioritas Anda
    if (checkboxStunting && checkboxStunting.checked) {
        fillColor = getStuntingColor(feature.properties.stunting_rate);
        if (fillColor !== 'transparent') {
            fillOpacity = 0.6; // Opasitas default untuk layer aktif
        }
    } else if (checkboxPangan && checkboxPangan.checked) {
        fillColor = getPanganColor(feature.properties.pangan_score);
        if (fillColor !== 'transparent') {
            fillOpacity = 0.6;
        }
    }
    // Jika tidak ada checkbox yang aktif, fillColor akan 'transparent' dan fillOpacity = 0

    return {
        weight: 1.5,
        opacity: 1,
        color: "grey",
        dashArray: "3",
        fillOpacity: fillOpacity,
        fillColor: fillColor
    };
}

fetch("data/coba.geojson") // PASTIKAN PATH INI BENAR
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        originalGeojsonData = data;

        kabupatenData = originalGeojsonData.features.map((feature) => {
            let centroid;
            if (feature.properties.WADMKK === "Gresik") centroid = [112.565, -7.155];
            else if (feature.properties.WADMKK === "Situbondo") centroid = [114.009, -7.706];
            else if (feature.properties.WADMKK === "Sumenep") centroid = [113.875, -7.0];
            else if (feature.geometry) {
                try {
                    if (typeof turf !== 'undefined') {
                        centroid = turf.pointOnFeature(feature).geometry.coordinates;
                    } else {
                        // Fallback sederhana jika Turf.js tidak ada
                        console.warn("Turf.js tidak tersedia, menggunakan fallback centroid.");
                        if (feature.geometry.type === "Polygon" && feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0].length > 0) {
                            centroid = feature.geometry.coordinates[0][0]; // Ambil titik pertama dari polygon luar
                        } else if (feature.geometry.type === "MultiPolygon" && feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0][0] && feature.geometry.coordinates[0][0].length > 0) {
                            centroid = feature.geometry.coordinates[0][0][0]; // Ambil titik pertama dari multipolygon pertama
                        } else {
                            centroid = [0,0]; // Default buruk jika tidak bisa dapatkan titik
                        }
                    }
                } catch (e) {
                    console.warn(`Gagal menghitung centroid untuk: ${feature.properties.WADMKK}`, e);
                    if (feature.geometry.type === "Polygon" && feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0].length > 0) centroid = feature.geometry.coordinates[0][0];
                    else if (feature.geometry.type === "MultiPolygon" && feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0][0] && feature.geometry.coordinates[0][0].length > 0) centroid = feature.geometry.coordinates[0][0][0];
                    else centroid = [0, 0];
                }
            } else {
                console.warn(`Fitur tidak memiliki geometri: ${feature.properties.WADMKK}`);
                centroid = [0, 0];
            }
            if (!Array.isArray(centroid) || centroid.length !== 2 || typeof centroid[0] !== 'number' || typeof centroid[1] !== 'number') {
                console.error(`Centroid tidak valid untuk: ${feature.properties.WADMKK}`, "Nilai:", centroid, "Menggunakan [0,0]");
                centroid = [0,0];
            }
            return {
                name: feature.properties.WADMKK,
                province: feature.properties.WADMPR,
                stunting_rate: feature.properties.stunting_rate,
                pangan_score: feature.properties.pangan_score,
                main_commodity: feature.properties.main_commodity,
                icon_image: feature.properties.icon_image,
                coords: [centroid[1], centroid[0]], // Lat, Lon
                categories: feature.properties.categories || {},
            };
        });

        if (!map) {
            console.error("Variabel 'map' Leaflet belum diinisialisasi!");
            return;
        }

        geojsonLayer = L.geoJson(originalGeojsonData, {
            style: getDynamicFeatureStyle,
            onEachFeature: onEachFeature,
        }).addTo(map);

        // --- Event Listener untuk Checkbox ---
        if (checkboxStunting) {
            checkboxStunting.addEventListener('change', refreshMapColors);
        } else {
            console.warn("Checkbox Stunting dengan ID 'petaIndikatorStunting' tidak ditemukan.");
        }
        if (checkboxPangan) {
            checkboxPangan.addEventListener('change', refreshMapColors);
        } else {
            console.warn("Checkbox Pangan dengan ID 'petaIndikatorPangan' tidak ditemukan.");
        }

        // Panggil refreshMapColors sekali saat awal untuk menerapkan state awal checkbox
        refreshMapColors();

        // if (typeof setupChecklistEventListeners === 'function') {
        //     setupChecklistEventListeners();
        // }
    })
    .catch((error) => console.error("Error memuat atau memproses GeoJSON:", error));


function onEachFeature(feature, layer) {
    const props = feature.properties;

    // 1. POPUP SAAT KLIK (Menggunakan style inline Anda yang sudah ada)
    if (props) {
        const panganStatusTextOnClick = getPanganStatusText(props.pangan_score);
        const clickPopupContent = `
            <div style="text-align: center;">
                <img src="${props.icon_image || 'image/default.jpg'}" alt="${props.WADMKK || 'Wilayah'}" style="width:100px; height:100px; border-radius:5px; margin-bottom:10px; object-fit: cover;"><br>
                <b style="font-size: 17px;">${props.WADMKK || 'Nama Wilayah'}</b><br>
                <b style="font-size: 0.95em;">Provinsi:</b> <span style="font-size: 0.95em;">${props.WADMPR || 'N/A'}</span><br>
                <b style="font-size: 0.95em;">Tingkat Stunting:</b> <span style="font-size: 0.95em;">${props.stunting_rate !== undefined ? props.stunting_rate + '%' : 'N/A'}</span><br>
                <b style="font-size: 0.95em;">Status Pangan:</b> <span style="font-size: 0.95em;">${panganStatusTextOnClick} ${props.pangan_score !== undefined ? '(' + props.pangan_score + '%)' : ''}</span>
            </div>
        `;
        layer.bindPopup(clickPopupContent);

        layer.on("click", function () {
            // if (typeof showLayerPanel === 'function') {
            //     showLayerPanel(props);
            // }
            // Jika popup klik terbuka, tutup hoverPopup jika masih ada
            if (hoverPopup && map.hasLayer(hoverPopup)) {
                map.closePopup(hoverPopup);
                hoverPopup = null;
            }
        });
    }

    // 2. POPUP SAAT HOVER (Mengikuti kursor)
    layer.on({
        mouseover: function (e) {
            const targetLayer = e.target;

            if (layer.isPopupOpen()) { // Jangan tampilkan hover jika popup klik sudah terbuka
                return;
            }

            // Simpan style asli sebelum diubah untuk hover
            // Ini penting agar kita bisa kembali ke state yang benar,
            // bukan hanya memanggil getDynamicFeatureStyle yang mungkin sudah berubah karena interaksi checkbox lain
            // (Meskipun dengan resetStyle(), ini mungkin tidak selalu krusial jika getDynamicFeatureStyle selalu benar)
            // targetLayer.options.originalGeoJsonStyle = getDynamicFeatureStyle(feature);


            targetLayer.setStyle({
                weight: 3,
                color: '#FF8C00',
                // Untuk fillColor, gunakan warna yang sudah ada tapi dengan opasitas lebih tinggi
                fillColor: getDynamicFeatureStyle(feature).fillColor, // Ambil warna dasar dari fungsi style utama
                fillOpacity: 0.85 // Tingkatkan opasitas saat hover
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                targetLayer.bringToFront();
            }

            const panganStatusTextHover = getPanganStatusText(props.pangan_score);
            const hoverContent = `
                <div style="text-align: center;">
                    <img src="${props.icon_image || 'image/default.jpg'}" alt="${props.WADMKK || 'Wilayah'}" style="width:100px; height:100px; border-radius:5px; margin-bottom:10px; object-fit: cover;"><br>
                    <b style="font-size: 17px;">${props.WADMKK || 'Nama Wilayah'}</b><br>
                    <b style="font-size: 0.95em;">Provinsi:</b> <span style="font-size: 0.95em;">${props.WADMPR || 'N/A'}</span><br>
                    <b style="font-size: 0.95em;">Tingkat Stunting:</b> <span style="font-size: 0.95em;">${props.stunting_rate !== undefined ? props.stunting_rate + '%' : 'N/A'}</span><br>
                    <b style="font-size: 0.95em;">Status Pangan:</b> <span style="font-size: 0.95em;">${panganStatusTextHover} ${props.pangan_score !== undefined ? '(' + props.pangan_score + '%)' : ''}</span>
                </div>
            `;

            if (hoverPopup && map.hasLayer(hoverPopup)) {
                map.closePopup(hoverPopup);
            }
            hoverPopup = null; // Reset sebelum membuat yang baru

            hoverPopup = L.popup({
                    closeButton: false,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'leaflet-hover-popup-custom', // Anda perlu CSS untuk kelas ini
                    offset: L.point(10, -20) // Sesuaikan offset agar nyaman
                })
                .setLatLng(e.latlng)
                .setContent(hoverContent)
                .openOn(map);
        },
        mouseout: function (e) {
            // Kembalikan ke style yang ditentukan oleh getDynamicFeatureStyle
            if (geojsonLayer) {
                geojsonLayer.resetStyle(e.target);
            }

            // Logika penutupan popup hover yang lebih hati-hati
            if (hoverPopup) {
                const toElement = e.originalEvent.relatedTarget;
                const popupElement = hoverPopup.getElement();

                if (popupElement && toElement && popupElement.contains(toElement)) {
                    // Mouse bergerak ke dalam popup, pasang listener untuk mouseout dari popup
                    L.DomEvent.on(popupElement, 'mouseout', function handlePopupMouseOut(ev) {
                        const related = ev.relatedTarget;
                        if (popupElement && (!related || !popupElement.contains(related))) {
                            if (map.hasLayer(hoverPopup)) {
                                map.closePopup(hoverPopup);
                            }
                            hoverPopup = null;
                            L.DomEvent.off(popupElement, 'mouseout', handlePopupMouseOut); // Hapus listener setelah digunakan
                        }
                    });
                    return; // Jangan tutup popup dulu
                }
                // Jika tidak pindah ke popup, atau popup tidak ada, tutup
                if (map.hasLayer(hoverPopup)) {
                    map.closePopup(hoverPopup);
                }
                hoverPopup = null;
            }
        },
        mousemove: function (e) {
            if (hoverPopup && !layer.isPopupOpen()) {
                hoverPopup.setLatLng(e.latlng);
            }
        }
    });
}

// --- Fungsi untuk Me-refresh Warna Peta Berdasarkan Checkbox ---
function refreshMapColors() {
    if (geojsonLayer) {
        geojsonLayer.eachLayer(function (layer) {
            layer.setStyle(getDynamicFeatureStyle(layer.feature));
        });
    }
}

// --- CSS minimal untuk popup hover (letakkan di file CSS Anda atau tag <style>) ---
// <style>
// .leaflet-hover-popup-custom .leaflet-popup-content-wrapper {
//     background: rgba(255, 255, 255, 0.95) !important;
//     color: #333 !important;
//     border-radius: 8px !important;
//     box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
//     padding: 0 !important; /* Wrapper tidak perlu padding jika konten sudah lengkap */
//     border: 1px solid #ddd !important;
// }
// .leaflet-hover-popup-custom .leaflet-popup-content {
//     margin: 0 !important; /* Konten di dalam wrapper */
//     /* Anda bisa mengatur padding konten jika perlu, atau biarkan style inline yang bekerja */
// }
// .leaflet-hover-popup-custom .leaflet-popup-tip-container {
//     display: none !important; /* Sembunyikan panah tip */
// }
// </style>



// CSS
/* Styling untuk popup hover yang mengikuti kursor */
.leaflet-hover-popup-custom .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.9); /* Latar semi transparan */
    color: #333;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    padding: 5px 8px !important; /* Padding kecil */
    border: 1px solid #ccc;
}

.leaflet-hover-popup-custom .leaflet-popup-content {
    margin: 0 !important;
    font-size: 0.9em; /* Font lebih kecil */
    line-height: 1.3;
    min-width: auto !important; /* Biarkan konten menentukan lebar */
    white-space: nowrap; /* Agar tidak wrap jika hanya nama */
}

/* Sembunyikan tip (panah) untuk popup hover jika mau */
.leaflet-hover-popup-custom .leaflet-popup-tip-container {
    display: none;
}

/* Contoh styling jika Anda menggunakan .basic-hover-popup atau .detailed-hover-popup */
.basic-hover-popup {
    /* Tidak perlu style khusus jika sudah cukup dari .leaflet-hover-popup-custom */
}
.detailed-hover-popup h4 {
    margin: 0 0 3px 0;
    font-size: 1.1em;
}
.detailed-hover-popup p {
    margin: 2px 0;
    font-size: 0.9em;
}