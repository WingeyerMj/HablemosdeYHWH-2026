// A self-contained Windows package: offline HTML + icon + per-user installer.
export const WINDOWS_INSTALLER = `@echo off\r
setlocal\r
set "CALENDAR_PACKAGE_DIR=%~dp0"\r
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; $source=$env:CALENDAR_PACKAGE_DIR; $dest=Join-Path $env:LOCALAPPDATA 'CalendarioYHWH'; New-Item -ItemType Directory -Force -Path $dest | Out-Null; foreach($name in @('Calendario Lunisolar YHWH.html','calendar.ico')) { Copy-Item -LiteralPath (Join-Path $source $name) -Destination (Join-Path $dest $name) -Force }; $shell=New-Object -ComObject WScript.Shell; foreach($folder in @([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs'))) { $link=$shell.CreateShortcut((Join-Path $folder 'Calendario YHWH.lnk')); $link.TargetPath=Join-Path $dest 'Calendario Lunisolar YHWH.html'; $link.WorkingDirectory=$dest; $link.IconLocation=(Join-Path $dest 'calendar.ico')+',0'; $link.Description='Calendario Lunisolar YHWH - funciona sin internet'; $link.Save() }; Write-Output 'Calendario instalado con su logo en el Escritorio y el menu Inicio.'"\r
if errorlevel 1 (\r
 echo No se pudo instalar el calendario.\r
 if /I not "%~1"=="/quiet" pause\r
 exit /b 1\r
)\r
if /I not "%~1"=="/quiet" pause\r
`;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let value = n;
  for (let bit = 0; bit < 8; bit++) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  return value >>> 0;
});
const crc32 = data => {
  let value = 0xffffffff;
  for (const byte of data) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};

// ZIP STORE needs no CDN, compressor or external package, and works offline.
export function buildWindowsCalendarPackage(html, icon) {
  const encoder = new TextEncoder();
  const files = [
    ['Calendario Lunisolar YHWH.html', encoder.encode(html)],
    ['calendar.ico', new Uint8Array(icon)],
    ['Instalar Calendario.cmd', encoder.encode(WINDOWS_INSTALLER)],
    ['LEEME.txt', encoder.encode('CALENDARIO YHWH PARA WINDOWS\r\n\r\n1. Extrae todos los archivos del ZIP en una carpeta.\r\n2. Abre Instalar Calendario.cmd.\r\n3. Usa el acceso Calendario YHWH del Escritorio o del menu Inicio.\r\n\r\nEl acceso tiene el logo del calendario y funciona sin internet.\r\nNo necesita permisos de administrador. El HTML y el icono se guardan en %LOCALAPPDATA%\\CalendarioYHWH.\r\nNo abras solo el HTML si quieres ver el logo en el escritorio: usa el acceso que crea el instalador.\r\n')]
  ];
  const parts = [], directory = []; let offset = 0;
  for (const [filename, data] of files) {
    const name = encoder.encode(filename), checksum = crc32(data);
    const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x800, true);
    lv.setUint32(14, checksum, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true); local.set(name, 30);
    const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true);
    cv.setUint32(16, checksum, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
    parts.push(local, data); directory.push(central); offset += local.length + data.length;
  }
  const size = directory.reduce((sum, entry) => sum + entry.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: 'application/zip' });
}
