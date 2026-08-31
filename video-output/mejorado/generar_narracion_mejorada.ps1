$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$outDir = 'C:\xampp\htdocs\HablemosdeYHWH-2026\video-output\mejorado'
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('Microsoft Pablo')
$voice.Rate = 1
$voice.Volume = 100
$voice.SetOutputToWaveFile((Join-Path $outDir 'narracion_mejorada.wav'))

$texto = @'
Y H W H. Yud. Hei. Vav. Hei. El nombre que inspira este espacio.

¿Sentís a veces que el ruido cotidiano te aleja de lo esencial? Bienvenidos a Hablemos de Yud Hei Vav Hei, una comunidad nacida en Caucete, San Juan, para redescubrir las raíces hebreas de nuestra fe.

En la portada comienza un recorrido pensado para estudiar, reflexionar y volver a las Escrituras. En Quiénes somos vas a conocer el propósito de la comunidad: no una institución ni una denominación, sino personas que buscan acercarse al Creador con sinceridad.

Torah Viviente lleva el estudio a tu dispositivo. La aplicación reúne fuentes textuales, contenidos de la Torah y del Brit Hadashá, y herramientas para acompañar la lectura cotidiana.

El calendario lunisolar bíblico permite consultar los tiempos señalados y comprender celebraciones como Shavuot, Yom Teruah, Yom Kippur y Sukkot.

En Parashot podés seguir las porciones semanales, abrir cada lectura y profundizar en su contexto. La sección Enseñanzas amplía ese recorrido con estudios, reflexiones y recursos para vivir el Shabbat y aplicar la Torah cada día.

Semillas de Torah es el espacio infantil de Elva Ávila: materiales visuales, alegres y pedagógicos para que niños y familias conozcan los valores bíblicos y las fiestas del Creador.

La página también reúne contenidos sobre identidad, testimonios, novedades y formas de participar. Cada sección está pensada para que el aprendizaje no quede sólo en palabras, sino que se transforme en una manera de vivir.

Desde el área de contacto podés enviar tu mensaje, suscribirte y mantenerte al tanto de las nuevas publicaciones.

Te invitamos a recorrer www punto hablemos de yud hei vav hei punto com. Hablemos de Y H W H. Yud. Hei. Vav. Hei. Comencemos.
'@

$voice.Speak($texto)
$voice.Dispose()
Write-Output (Join-Path $outDir 'narracion_mejorada.wav')
