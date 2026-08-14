const path = require('path');
const db = require('./src/config/db');

async function fix() {
  const [tables] = await db.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  
  console.log('Tables found:', tableNames.join(', '));

  for (const table of tableNames) {
    if (table === 'users' || table === 'section_permissions') continue;
    
    const [cols] = await db.query(`DESCRIBE \`${table}\``);
    const textCols = cols.filter(c => c.Type.includes('varchar') || c.Type.includes('text')).map(c => c.Field);
    
    if (textCols.length === 0) continue;

    const [rows] = await db.query(`SELECT id, ${textCols.map(c => '`' + c + '`').join(', ')} FROM \`${table}\``);
    
    for (const row of rows) {
      for (const col of textCols) {
        let val = row[col];
        if (typeof val === 'string') {
          let original = val;

          // 1. Fix double UTF-8 / Mojibake
          try {
            if (/Ã[¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(val) || /â€[™œžš“]/.test(val)) {
              let decoded = Buffer.from(val, 'latin1').toString('utf8');
              if (!decoded.includes('')) {
                val = decoded;
              }
            }
          } catch(e) {}

          // 2. Fix specific corrupted Spanish characters from previous encoding errors
          val = val
            .replace(/â€“/g, '–')
            .replace(/â€”/g, '—')
            .replace(/â€œ/g, '“')
            .replace(/â€\x9d/g, '”')
            .replace(/â€/g, '”')
            .replace(/â€˜/g, '‘')
            .replace(/â€™/g, '’')
            .replace(/GÃ©nesis/g, 'Génesis')
            .replace(/GÃ[\u0080-\u00bf]nesis/g, 'Génesis')
            .replace(/GÃ©/g, 'Gé')
            .replace(/G\u00c3\u00a9/g, 'Gé')
            .replace(/apareciÃ³/g, 'apareció')
            .replace(/ense±a/g, 'enseña')
            .replace(/dise±o/g, 'diseño')
            .replace(/se±al/g, 'señal')
            .replace(/a±o/g, 'año')
            .replace(/peque±/g, 'pequeñ')
            .replace(/espa±ol/g, 'español')
            .replace(/oto±o/g, 'otoño')
            .replace(/enga±/g, 'engañ')
            .replace(/ense┬▒a/g, 'enseña')
            .replace(/dise┬▒o/g, 'diseño')
            .replace(/se┬▒al/g, 'señal')
            .replace(/a┬▒o/g, 'año')
            .replace(/peque┬▒/g, 'pequeñ')
            .replace(/espa┬▒ol/g, 'español')
            .replace(/ßrea/g, 'área')
            .replace(/prßctica/g, 'práctica')
            .replace(/├ƒrea/g, 'área')
            .replace(/pr├ƒctica/g, 'práctica')
            .replace(/car├ƒcter/g, 'carácter')
            .replace(/b├Øblica/g, 'bíblica')
            .replace(/religi┬¥n/g, 'religión')
            .replace(/perdi┬¥/g, 'perdió')
            .replace(/prop┬¥sito/g, 'propósito')
            .replace(/direcci┬¥n/g, 'dirección')
            .replace(/lecci┬¥n/g, 'lección')
            .replace(/confusi┬¥n/g, 'confusión')
            .replace(/oraci┬¥n/g, 'oración')
            .replace(/te┬¥rico/g, 'teórico')
            .replace(/├╣/g, '—')
            .replace(/ù([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '—$1')
            .replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])ù/g, '$1—')
            .replace(/Ã©/g, 'é')
            .replace(/Ã¡/g, 'á')
            .replace(/Ã­/g, 'í')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã /g, 'Á')
            .replace(/Ã‰/g, 'É')
            .replace(/Ã /g, 'Í')
            .replace(/Ã“/g, 'Ó')
            .replace(/Ãš/g, 'Ú')
            .replace(/Ã‘/g, 'Ñ');

          if (val !== original) {
            console.log(`[UPDATED] ${table} (ID: ${row.id}) [${col}]:`);
            console.log('   Old:', original.substring(0, 100));
            console.log('   New:', val.substring(0, 100));
            await db.query(`UPDATE \`${table}\` SET \`${col}\` = ? WHERE id = ?`, [val, row.id]);
          }
        }
      }
    }
  }

  console.log('--- REPARACIÓN DE CODIFICACIÓN COMPLETADA ---');
  process.exit(0);
}

fix().catch(err => {
  console.error('Error en fix:', err);
  process.exit(1);
});
