const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============================================================
// Generador nativo de iconos PNG (sin dependencias externas)
// Dibuja un emblema oscuro y dorado con luna creciente y grilla
// ============================================================

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcInput = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generateCalendarPngBuffer(size) {
    const raw = Buffer.alloc(size * (size * 4 + 1));
    const center = size / 2;
    const scale = size / 512;

    for (let y = 0; y < size; y++) {
        const rowStart = y * (size * 4 + 1);
        raw[rowStart] = 0; // filtro PNG None

        for (let x = 0; x < size; x++) {
            const px = rowStart + 1 + x * 4;
            const nx = x / scale;
            const ny = y / scale;

            // Fondo base oscuro con ligero gradiente diagonal
            const t = (nx + ny) / 1024;
            let r = Math.round(13 + t * 18);
            let g = Math.round(24 + t * 4);
            let b = Math.round(42 - t * 24);
            let a = 255;

            // Borde dorado exterior
            const margin = 20;
            const borderW = 8;
            if (
                (nx >= margin && nx <= 512 - margin && ny >= margin && ny <= 512 - margin) &&
                (nx < margin + borderW || nx > 512 - margin - borderW || ny < margin + borderW || ny > 512 - margin - borderW)
            ) {
                r = 212; g = 168; b = 83;
            }

            // Caja del calendario (x: 72..440, y: 108..436)
            if (nx >= 72 && nx <= 440 && ny >= 108 && ny <= 436) {
                if (nx < 78 || nx > 434 || ny < 114 || ny > 430) {
                    // Marco dorado de la tarjeta
                    r = 225; g = 182; b = 96;
                } else if (ny < 182) {
                    // Cabecera marrón/dorado oscuro
                    r = 38; g = 29; b = 18;
                    if (ny > 176) {
                        r = 212; g = 168; b = 83;
                    }
                } else {
                    // Interior del calendario
                    r = 22; g = 26; b = 34;

                    // Cuadrícula sutil
                    const gx = (nx - 78) % 52;
                    const gy = (ny - 182) % 50;
                    if (gx < 2 || gy < 2) {
                        r = 36; g = 43; b = 56;
                    }
                }
            }

            // Anillos superiores del calendario
            if (((nx >= 144 && nx <= 166) || (nx >= 346 && nx <= 368)) && ny >= 78 && ny <= 130) {
                r = 240; g = 198; b = 110;
            }

            // Luna creciente dorada central (centrada en 256, 308)
            const dx1 = nx - 246;
            const dy1 = ny - 308;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            const dx2 = nx - 274;
            const dy2 = ny - 294;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (dist1 <= 78 && dist2 > 62) {
                // Luna creciente dorada brillante
                const glow = Math.max(0, 1 - dist1 / 78);
                r = Math.min(255, Math.round(218 + glow * 37));
                g = Math.min(255, Math.round(175 + glow * 65));
                b = Math.min(255, Math.round(85 + glow * 95));
            }

            // Punto / estrella cian de Shabat dentro del arco lunar (292, 286)
            const sdx = Math.abs(nx - 292);
            const sdy = Math.abs(ny - 286);
            if (sdx + sdy < 22 || (sdx < 6 && sdy < 26) || (sdy < 6 && sdx < 26)) {
                r = 79; g = 195; b = 255;
            }

            raw[px] = r;
            raw[px + 1] = g;
            raw[px + 2] = b;
            raw[px + 3] = a;
        }
    }

    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // color type RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const idatData = zlib.deflateSync(raw, { level: 6 });

    return Buffer.concat([
        signature,
        makeChunk('IHDR', ihdr),
        makeChunk('IDAT', idatData),
        makeChunk('IEND', Buffer.alloc(0))
    ]);
}

const iconCache = {};

function getIconBuffer(size) {
    if (!iconCache[size]) {
        iconCache[size] = generateCalendarPngBuffer(size);
    }
    return iconCache[size];
}

function ensureCalendarPwaIconsOnDisk() {
    try {
        const dirs = [
            path.join(__dirname, '../../../public/assets/calendar/icons'),
            path.join(__dirname, '../../../Calendar/icons')
        ];
        const sizes = [
            { name: 'icon-192.png', size: 192 },
            { name: 'icon-512.png', size: 512 },
            { name: 'apple-touch-icon.png', size: 180 }
        ];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            for (const item of sizes) {
                const filePath = path.join(dir, item.name);
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, getIconBuffer(item.size));
                }
            }
        }
    } catch (err) {
        console.warn('⚠️ No se pudieron escribir iconos PWA en disco:', err.message);
    }
}

module.exports = {
    getIconBuffer,
    ensureCalendarPwaIconsOnDisk
};

