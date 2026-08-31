$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$root = 'C:\xampp\htdocs\HablemosdeYHWH-2026\video-output\mejorado'
$clips = Join-Path $root 'voz_guion_usuario'
New-Item -ItemType Directory -Force -Path $clips | Out-Null

$textos = @(
  'Yud. Hei. Vav. Hei. El nombre que inspira este espacio.',
  '¿Sentís a veces que el ruido cotidiano te aleja de lo esencial? Bienvenidos a Hablemos de Yud Hei Vav Hei, una comunidad para redescubrir las raíces hebreas de nuestra fe.',
  'En Quiénes somos, vas a conocer el propósito de la comunidad: no una institución ni una denominación, sino personas que buscan acercarse al Creador con sinceridad.',
  'Torá Viviente lleva el estudio a tu dispositivo. La aplicación reúne fuentes textuales, contenidos de la Torá y del Brit Hadashá, y herramientas para acompañar la lectura cotidiana.',
  'El calendario lunisolar bíblico permite consultar los tiempos señalados y comprender celebraciones como Shavuot, Yom Teruaj, Yom Kipur y Sucot.',
  'En Aliyot encontrarás las lecturas diarias de la Parashá de la semana en audios, y una breve reseña y análisis de la lectura. También encontrarás en texto los versículos leídos, en español, en hebreo y su fonética para descargar y compartir.',
  'En Parashot podés seguir las porciones semanales, abrir cada lectura y profundizar en su contexto.',
  'La sección Enseñanzas amplía ese recorrido con estudios y recursos para vivir el Shabat y aplicar la Torá cada día.',
  'Semillas de Torá es el espacio infantil: materiales visuales, alegres y pedagógicos para que los niños y las familias conozcan los valores bíblicos y las fiestas del Creador.',
  'La página también reúne contenido sobre identidad, testimonios, novedades y formas de participar. Cada sección está pensada para que el aprendizaje no quede solo en palabras, sino que se transforme en una manera de vivir.',
  'Tenés también un área dedicada a la Identidad. La serie completa enseña que la identidad del creyente no se construye desde emociones, cultura, religión o experiencias personales, sino desde lo que Yud Hei Vav Hei declara en Su Palabra.',
  'Desde el área de contacto podés enviar tu mensaje, suscribirte y mantenerte al tanto de las nuevas publicaciones.',
  'Te invitamos a recorrer www punto hablemos de Y H W H punto com. Hablemos de Yud Hei Vav Hei. Comencemos.'
)

for ($i = 0; $i -lt $textos.Count; $i++) {
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.SelectVoice('Microsoft Pablo')
  $voice.Rate = 0
  $voice.Volume = 100
  $name = ('{0:D2}.wav' -f ($i + 1))
  $voice.SetOutputToWaveFile((Join-Path $clips $name))
  $voice.Speak($textos[$i])
  $voice.Dispose()
}

Write-Output $clips
