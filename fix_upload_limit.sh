#!/bin/bash
echo "============================================="
echo "⚙️ Configurando límite de subidas a 500MB en Nginx y Servidor..."
echo "============================================="

# 1. Crear configuración global en conf.d
echo "client_max_body_size 500M;" > /etc/nginx/conf.d/custom_upload.conf

# 2. Modificar nginx.conf principal
if grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    sed -i 's/client_max_body_size .*/client_max_body_size 500M;/g' /etc/nginx/nginx.conf
else
    sed -i '/http {/a \    client_max_body_size 500M;' /etc/nginx/nginx.conf
fi

# 3. Modificar todas las configuraciones de sitios
if [ -d "/etc/nginx/sites-available" ]; then
    for f in /etc/nginx/sites-available/*; do
        if [ -f "$f" ]; then
            if grep -q "client_max_body_size" "$f"; then
                sed -i 's/client_max_body_size .*/client_max_body_size 500M;/g' "$f"
            else
                sed -i '/server {/a \    client_max_body_size 500M;' "$f"
            fi
        fi
    done
fi

if [ -d "/etc/nginx/sites-enabled" ]; then
    for f in /etc/nginx/sites-enabled/*; do
        if [ -f "$f" ]; then
            if grep -q "client_max_body_size" "$f"; then
                sed -i 's/client_max_body_size .*/client_max_body_size 500M;/g' "$f"
            else
                sed -i '/server {/a \    client_max_body_size 500M;' "$f"
            fi
        fi
    done
fi

echo "🔍 Probando configuración de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 Reiniciando Nginx..."
    systemctl restart nginx
    echo "✅ Nginx reiniciado correctamente con límite de 500MB."
else
    echo "❌ Hubo un error en la configuración de Nginx."
fi

echo "🔄 Actualizando código y reiniciando Node.js..."
cd /var/www/hablemos_yhwh || exit
git pull origin main
pm2 restart hablemos-web
pm2 status

echo "============================================="
echo "🎉 ¡LISTO! Ya puedes subir videos de hasta 500MB."
echo "============================================="
