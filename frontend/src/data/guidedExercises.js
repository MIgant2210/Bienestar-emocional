/**
 * Biblioteca Oficial de 14 Ejercicios Guiados e Interactivos de EquilibrIA
 * Estructura estándar con pasos, duraciones, animaciones de Colibrí, instrucciones de voz y precauciones.
 */

export const GUIDED_EXERCISES_LIBRARY = [
  // ============================================================================
  // RESPIRACIÓN (4 Ejercicios Guiados por el Colibrí Morado)
  // ============================================================================
  {
    id: 'resp_446',
    title: 'Respiración Relajante 4-4-6',
    category: 'Manejo del estrés',
    resource_type: 'respiracion',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 20,
    total_cycles: 3,
    description: 'Ejercicio de respiración diafragmática para desacelerar el ritmo cardíaco y activar la respuesta parasimpática de calma en pocos minutos.',
    precautions: 'Si sientes mareo o hiperventilación, detén el ejercicio y respira a tu ritmo natural.',
    steps: [
      { step: 1, name: 'INHALA', type: 'inhale', duration: 4, text: 'Inhala suavemente por la nariz llenando tus pulmones y abdomen de aire fresco.', voice: 'Inhala lentamente por la nariz.' },
      { step: 2, name: 'MANTÉN', type: 'hold', duration: 4, text: 'Sostén el aire con calma, sintiendo el centro de tu equilibrio.', voice: 'Mantén la respiración.' },
      { step: 3, name: 'EXHALA', type: 'exhale', duration: 6, text: 'Exhala despacio por la boca liberando toda la tensión acumulada.', voice: 'Exhala suavemente.' }
    ]
  },
  {
    id: 'resp_cuadrada',
    title: 'Respiración Cuadrada 4-4-4-4 (Box Breathing)',
    category: 'Ansiedad y preocupación',
    resource_type: 'respiracion',
    guide_character: 'colibri',
    stage_theme: 'serene_blue',
    level: 'principiante',
    reading_time_minutes: 4,
    xp_reward: 25,
    total_cycles: 4,
    description: 'Técnica de control de la atención y autorregulación emocional utilizada para estabilizar el sistema nervioso ante momentos de alta exigencia.',
    precautions: 'Mantén los hombros relajados y la espalda recta sin forzar los tiempos.',
    steps: [
      { step: 1, name: 'INHALA', type: 'inhale', duration: 4, text: 'Inhala en 4 segundos sintiendo la expansión de tu pecho.', voice: 'Inhala en 4 segundos.' },
      { step: 2, name: 'MANTÉN', type: 'hold', duration: 4, text: 'Mantén los pulmones llenos con serenidad durante 4 segundos.', voice: 'Mantén el aire.' },
      { step: 3, name: 'EXHALA', type: 'exhale', duration: 4, text: 'Exhala todo el aire suavemente en 4 tiempos.', voice: 'Exhala lentamente.' },
      { step: 4, name: 'PAUSA', type: 'hold_out', duration: 4, text: 'Pausa con los pulmones vacíos antes del siguiente ciclo.', voice: 'Pausa y siente la calma.' }
    ]
  },
  {
    id: 'resp_478',
    title: 'Técnica de Respiración 4-7-8 para Conciliar el Sueño',
    category: 'Descanso',
    resource_type: 'respiracion',
    guide_character: 'colibri',
    stage_theme: 'twilight_calm',
    level: 'intermedio',
    reading_time_minutes: 4,
    xp_reward: 25,
    total_cycles: 4,
    description: 'Sedante natural del sistema nervioso. Reduce la sobreactivación mental antes de dormir o en situaciones de tensión intensa.',
    precautions: 'Realiza el ejercicio sentado o acostado en un entorno tranquilo.',
    steps: [
      { step: 1, name: 'INHALA', type: 'inhale', duration: 4, text: 'Inhala por la nariz silenciosamente durante 4 segundos.', voice: 'Inhala por la nariz.' },
      { step: 2, name: 'MANTÉN', type: 'hold', duration: 7, text: 'Mantén la respiración durante 7 segundos con absoluta serenidad.', voice: 'Mantén el aire con calma.' },
      { step: 3, name: 'EXHALA', type: 'exhale', duration: 8, text: 'Exhala completamente por la boca produciendo un suave silbido de alivio.', voice: 'Exhala despacio y suelta.' }
    ]
  },
  {
    id: 'resp_diafragmatica',
    title: 'Respiración Diafragmática Profunda',
    category: 'Bienestar emocional',
    resource_type: 'respiracion',
    guide_character: 'colibri',
    stage_theme: 'warm_sunrise',
    level: 'principiante',
    reading_time_minutes: 5,
    xp_reward: 20,
    total_cycles: 5,
    description: 'Reeducación de la respiración profunda para maximizar la oxigenación celular y reducir el cortisol.',
    precautions: 'Coloca una mano sobre el pecho y otra sobre el abdomen para verificar el movimiento.',
    steps: [
      { step: 1, name: 'INHALA', type: 'inhale', duration: 5, text: 'Inhala lento haciendo que solo tu abdomen se eleve, el pecho permanece quieto.', voice: 'Inhala expandiendo el abdomen.' },
      { step: 2, name: 'EXHALA', type: 'exhale', duration: 5, text: 'Exhala contrayendo suavemente el abdomen hacia la columna.', voice: 'Exhala vaciando el abdomen.' }
    ]
  },

  // ============================================================================
  // RELAJACIÓN (3 Ejercicios Guiados por el Colibrí)
  // ============================================================================
  {
    id: 'relaj_hombros',
    title: 'Relajación y Liberación de Hombros',
    category: 'Prevención del agotamiento',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Secuencia breve para soltar la carga y contractura acumulada en hombros y trapecios durante el trabajo de escritorio.',
    precautions: 'Realiza movimientos suaves sin forzar articulaciones.',
    steps: [
      { step: 1, name: 'ELEVACIÓN', type: 'step', duration: 15, text: 'Eleva los hombros suavemente hacia las orejas contrayendo sin dolor.', voice: 'Eleva los hombros despacio.' },
      { step: 2, name: 'SOLTADO', type: 'step', duration: 15, text: 'Suelta los hombros de golpe con una exhalación profunda de alivio.', voice: 'Suelta los hombros y respira.' },
      { step: 3, name: 'ROTACIÓN', type: 'step', duration: 30, text: 'Realiza giros circulares amplios y fluidos hacia atrás y adelante.', voice: 'Gira los hombros en círculos.' }
    ]
  },
  {
    id: 'relaj_cervical',
    title: 'Relajación Cervical y Base del Cráneo',
    category: 'Autocuidado',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Disminuye la fatiga de cuello y previene cefaleas tensionales provocadas por posturas fijas prolongadas.',
    precautions: 'No des tirones bruscos. Respeta los límites naturales de tu cuello.',
    steps: [
      { step: 1, name: 'INCLINACIÓN DERECHA', type: 'step', duration: 20, text: 'Inclina la oreja derecha hacia el hombro derecho manteniendo la espalda recta.', voice: 'Inclina la cabeza a la derecha.' },
      { step: 2, name: 'INCLINACIÓN IZQUIERDA', type: 'step', duration: 20, text: 'Cambia suavemente hacia el hombro izquierdo con respiración pausada.', voice: 'Inclina la cabeza a la izquierda.' },
      { step: 3, name: 'FLEXIÓN FRONTAL', type: 'step', duration: 20, text: 'Deja caer el mentón hacia el pecho sintiendo el estiramiento en la nuca.', voice: 'Baja el mentón al pecho con suavidad.' }
    ]
  },
  {
    id: 'relaj_progresiva',
    title: 'Relajación Muscular Progresiva Breve',
    category: 'Manejo del estrés',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'warm_sunrise',
    level: 'intermedio',
    reading_time_minutes: 5,
    xp_reward: 25,
    total_cycles: 1,
    description: 'Método Jacobson adaptado: tensar suavemente grupos musculares por 5s y distenderlos para reconocer la relajación somática.',
    precautions: 'No tenses con fuerza excesiva si sufres dolores musculares agudos.',
    steps: [
      { step: 1, name: 'MANOS Y BRAZOS', type: 'step', duration: 25, text: 'Cierra los puños, tensa los antebrazos 5s y luego abre las manos liberando todo.', voice: 'Tensa puños y antebrazos, y suelta.' },
      { step: 2, name: 'ROSTRO Y MANDÍBULA', type: 'step', duration: 25, text: 'Frunce el ceño y aprieta suavemente los labios 5s, luego relaja la expresión por completo.', voice: 'Tensa el rostro y relaja la mandíbula.' },
      { step: 3, name: 'HOMBRO Y ESPALDA', type: 'step', duration: 25, text: 'Lleva los omóplatos hacia atrás 5s y suelta sintiendo el descanso en la espalda.', voice: 'Abre el pecho y relaja la espalda.' }
    ]
  },

  // ============================================================================
  // PAUSAS ACTIVAS Y ESTIRAMIENTO (4 Ejercicios con Colibrí y Posturas)
  // ============================================================================
  {
    id: 'pausa_rotacion_hombros',
    title: 'Rotación de Hombros y Apertura Torácica',
    category: 'Ambiente laboral',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Pausa activa ideal cada 60 minutos de trabajo frente a pantallas para oxigenar la parte superior del cuerpo.',
    precautions: 'Mantén una postura erguida y respira con fluidez.',
    steps: [
      { step: 1, name: 'APERTURA DE PECHO', type: 'step', duration: 25, text: 'Entrelaza los dedos detrás de la espalda, estira los brazos y abre el pecho mirando arriba.', voice: 'Abre el pecho y estira los brazos hacia atrás.' },
      { step: 2, name: 'CIRCUNFERENCIA DE HOMBROS', type: 'step', duration: 25, text: 'Gira ambos hombros hacia atrás en movimientos lentos y coordinados.', voice: 'Gira los hombros hacia atrás.' }
    ]
  },
  {
    id: 'pausa_estiramiento_cuello',
    title: 'Estiramiento Guiado de Cuello y Trapecio',
    category: 'Autocuidado',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 2,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Alivia la tensión generada por la postura inclinada hacia teléfonos y monitores.',
    precautions: 'Realiza el estiramiento sentado con ambos pies planos sobre el piso.',
    steps: [
      { step: 1, name: 'ESTIRAMIENTO LATERAL DERECHO', type: 'step', duration: 20, text: 'Coloca la mano derecha suavemente sobre la cabeza guiando la oreja al hombro.', voice: 'Estira suavemente el lado izquierdo del cuello.' },
      { step: 2, name: 'ESTIRAMIENTO LATERAL IZQUIERDO', type: 'step', duration: 20, text: 'Cambia de mano y guía la cabeza hacia el lado izquierdo con tranquilidad.', voice: 'Estira el lado derecho del cuello.' }
    ]
  },
  {
    id: 'pausa_brazos_munecas',
    title: 'Estiramiento de Brazos, Muñecas y Dedos',
    category: 'Ambiente laboral',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 2,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Previene el síndrome del túnel carpiano y la fatiga por digitación continua.',
    precautions: 'No ejerzas fuerza excesiva sobre las muñecas.',
    steps: [
      { step: 1, name: 'EXTENSIÓN DE PALMA', type: 'step', duration: 20, text: 'Extiende el brazo derecho al frente con la palma mirando adelante y jala suavemente los dedos hacia ti.', voice: 'Extiende la palma y estira los dedos.' },
      { step: 2, name: 'EXTENSIÓN CONTRALATERAL', type: 'step', duration: 20, text: 'Repite el movimiento con el brazo izquierdo respirando profundo.', voice: 'Cambia al otro brazo y estira.' },
      { step: 3, name: 'ROTACIÓN DE MUÑECAS', type: 'step', duration: 20, text: 'Entrelaza los dedos y rota ambas muñecas en círculos suaves hacia ambos lados.', voice: 'Gira las muñecas en círculos.' }
    ]
  },
  {
    id: 'pausa_movilidad_espalda',
    title: 'Movilidad Suave de Columna y Espalda',
    category: 'Hábitos saludables',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 20,
    total_cycles: 1,
    description: 'Descomprime las vértebras lumbares y dorsales tras periodos prolongados en posición sedente.',
    precautions: 'Realiza la torsión sin despegar la pelvis de la silla.',
    steps: [
      { step: 1, name: 'EXTENSIÓN HACIA EL TECHO', type: 'step', duration: 25, text: 'Entrelaza las manos, voltea las palmas hacia el techo y estira la columna lo más alto posible.', voice: 'Estira la columna hacia arriba.' },
      { step: 2, name: 'TORSIÓN DERECHA', type: 'step', duration: 20, text: 'Gira suavemente el torso hacia la derecha apoyando la mano en el respaldo.', voice: 'Gira el torso hacia la derecha.' },
      { step: 3, name: 'TORSIÓN IZQUIERDA', type: 'step', duration: 20, text: 'Gira suavemente hacia la izquierda con la espalda erguida.', voice: 'Gira el torso hacia la izquierda.' }
    ]
  },

  // ============================================================================
  // BIENESTAR Y MINDFULNESS (3 Ejercicios Guiados por el Colibrí)
  // ============================================================================
  {
    id: 'bienestar_pausa_consciente',
    title: 'Pausa Consciente de 2 Minutos',
    category: 'Bienestar emocional',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'serene_blue',
    level: 'principiante',
    reading_time_minutes: 2,
    xp_reward: 15,
    total_cycles: 1,
    description: 'Un momento para detener el piloto automático, chequear tu estado interno y regresar con claridad.',
    precautions: 'Puedes cerrar los ojos o fijar la mirada en el colibrí.',
    steps: [
      { step: 1, name: 'DETENTE (STOP)', type: 'step', duration: 30, text: 'Interrumpe lo que estás haciendo y acomoda tu postura con pies en la tierra.', voice: 'Detén tus tareas y respira.' },
      { step: 2, name: 'OBSERVA', type: 'step', duration: 45, text: 'Nota tus sensaciones corporales, tu respiración y el fluir de tus pensamientos sin juzgar.', voice: 'Observa lo que sientes con amabilidad.' },
      { step: 3, name: 'PROCEDE', type: 'step', duration: 45, text: 'Haz una respiración profunda y retoma tus actividades con intención renovada.', voice: 'Respira hondo y continúa con calma.' }
    ]
  },
  {
    id: 'bienestar_grounding_54321',
    title: 'Técnica de Grounding Sensorial 5-4-3-2-1',
    category: 'Ansiedad y preocupación',
    resource_type: 'grounding',
    guide_character: 'colibri',
    stage_theme: 'zen_garden',
    level: 'principiante',
    reading_time_minutes: 4,
    xp_reward: 20,
    total_cycles: 1,
    description: 'Ancla tu mente en el presente a través de los cinco sentidos para desactivar crisis de ansiedad y rumiación.',
    precautions: 'Tómate el tiempo necesario para detallar cada objeto o sensación.',
    steps: [
      { step: 1, name: '5 COSAS QUE VES', type: 'step', duration: 25, text: 'Observa 5 cosas a tu alrededor con atención (colores, formas, sombras).', voice: 'Identifica 5 cosas que puedes ver.' },
      { step: 2, name: '4 COSAS QUE SIENTES', type: 'step', duration: 25, text: 'Siente 4 texturas: tu ropa, la mesa, tus pies en el suelo o la temperatura del aire.', voice: 'Siente 4 texturas en tu cuerpo o entorno.' },
      { step: 3, name: '3 COSAS QUE ESCUCHAS', type: 'step', duration: 20, text: 'Escucha 3 sonidos distintos en tu ambiente presente.', voice: 'Presta atención a 3 sonidos distintos.' },
      { step: 4, name: '2 COSAS QUE HUELEN', type: 'step', duration: 20, text: 'Identifica 2 aromas o respira profundo percibiendo el aire.', voice: 'Identifica 2 aromas o siente el aire fresco.' },
      { step: 5, name: '1 COSA QUE SABOREAS', type: 'step', duration: 15, text: 'Nota un sabor en tu boca o bebe un pequeño sorbo de agua consciente.', voice: 'Conecta con un sabor y siente tu presencia aquí y ahora.' }
    ]
  },
  {
    id: 'bienestar_atencion_plena',
    title: 'Atención Plena Breve y Escaneo de Calma',
    category: 'Salud mental',
    resource_type: 'ejercicio',
    guide_character: 'colibri',
    stage_theme: 'warm_sunrise',
    level: 'principiante',
    reading_time_minutes: 3,
    xp_reward: 20,
    total_cycles: 1,
    description: 'Micro-meditación para reenfocar la mente en el presente y soltar la hiperactividad cognitiva.',
    precautions: 'No intentes vaciar la mente; solo observa y acompaña la respiración.',
    steps: [
      { step: 1, name: 'ANCLAJE', type: 'step', duration: 40, text: 'Fija tu atención en el aire que entra y sale de tu nariz sintiendo el vuelo suave del colibrí.', voice: 'Enfoca tu atención en el aire entrando y saliendo.' },
      { step: 2, name: 'EXPANSIÓN', type: 'step', duration: 50, text: 'Expande tu atención a todo tu cuerpo como un campo de serenidad y equilibrio.', voice: 'Siente la calma expandiéndose por todo tu cuerpo.' },
      { step: 3, name: 'CIERRE CONSCIENTE', type: 'step', duration: 30, text: 'Agradece este instante que te has regalado para cuidar de ti.', voice: 'Agradece este momento de bienestar y paz.' }
    ]
  }
];

export default GUIDED_EXERCISES_LIBRARY;
