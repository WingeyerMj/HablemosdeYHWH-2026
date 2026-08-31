$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$outDir = 'C:\xampp\htdocs\HablemosdeYHWH-2026\video-output'
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('Microsoft Pablo')
$voice.Rate = -1
$voice.Volume = 100
$voice.SetOutputToWaveFile((Join-Path $outDir 'narracion.wav'))

$texto = @'
¿Sentís a veces que el ruido del mundo te desconecta de lo esencial? Bienvenidos a Hablemos de YHWH, un espacio para redescubrir las raíces hebreas de nuestra fe.

No somos una institución ni una denominación. Somos una comunidad de buscadores, personas que desean acercarse al Creador con una mirada sincera, consciente y comprometida.

Nuestro calendario lunisolar bíblico nos ayuda a reconocer los tiempos señalados: Shavuot, Yom Teruah y cada encuentro que nos invita a detenernos, recordar y celebrar.

Cada semana compartimos las parashot y nuevas enseñanzas. Estudios para vivir el Shabbat, comprender el contexto de las Escrituras y llevar la Torah a la vida cotidiana.

También está Semillas de Torah, el espacio creado por Elva Ávila para que niños y familias aprendan de una manera alegre, visual y cercana.

En Identidad profundizamos quiénes somos. Y con la aplicación Torah Viviente podés acceder a las Escrituras, fuentes textuales y contenidos para seguir estudiando desde tu dispositivo.

Desde Caucete, San Juan, Argentina, te invitamos a recorrer la página, suscribirte y ser parte de esta comunidad. Hablemos de YHWH. Comencemos.
'@

$voice.Speak($texto)
$voice.Dispose()
Write-Output (Join-Path $outDir 'narracion.wav')
