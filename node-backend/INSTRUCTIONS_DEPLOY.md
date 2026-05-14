# Guía de Despliegue al Servidor Cloud - Hablemos de YHWH

Esta guía te ayudará a subir tu proyecto local al servidor en línea, incluyendo la base de datos actualizada.

## 1. Preparar la Base de Datos
He generado un archivo llamado `hablemos_yhwh.sql` dentro de la carpeta `database` en la raíz del proyecto. Este archivo contiene **toda** la estructura actual y los datos de tu sitio.

**Pasos:**
1. Entra al **phpMyAdmin** o panel de base de datos de tu servidor cloud.
2. Crea una base de datos llamada `hablemos_yhwh` (o el nombre que prefieras).
3. Selecciona la pestaña **Importar** y sube el archivo `database/hablemos_yhwh.sql`.

## 2. Configurar las Variables de Entorno
En tu servidor, debes crear un archivo `.env` en la raíz de la carpeta `node-backend` con los datos de conexión de tu servidor cloud:

```env
PORT=3000
DB_HOST=tu_host_cloud (ej: localhost o una IP)
DB_USER=tu_usuario_db
DB_PASS=tu_password_db
DB_NAME=hablemos_yhwh
SESSION_SECRET=una_clave_secreta_larga
```

## 3. Subir los Archivos
Sube todo el contenido de la carpeta del proyecto a tu servidor. Puedes usar FTP, Git o el gestor de archivos de tu hosting.

**Carpetas importantes a incluir:**
- `node-backend/` (El servidor)
- `Calendar/` (El calendario interactivo)
- `public/` (Archivos estáticos)

## 4. Instalación de Dependencias
Una vez en el servidor, abre una terminal en la carpeta `node-backend` y ejecuta:

```bash
npm install
```

## 5. Iniciar el Servidor
Para que el sitio se mantenga siempre en línea, te recomiendo usar **PM2**:

```bash
# Instalar PM2 globalmente si no está
npm install -g pm2

# Iniciar la aplicación
pm2 start app.js --name "hablemos-yhwh"

# Configurar para que inicie con el servidor
pm2 save
pm2 startup
```

---
¡Excelente trabajo! Con estos pasos tendrás tu plataforma de raíces hebreas funcionando para todo el mundo.
