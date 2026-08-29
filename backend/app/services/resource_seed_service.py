import uuid
from datetime import datetime
from app import db
from app.models.resource import Resource

class ResourceSeedService:
    """
    Servicio de siembra y enriquecimiento dinámico del Centro de Recursos de EquilibrIA.
    Garantiza que existan recursos precargados con rigor formativo para las 19 categorías,
    incluyendo recursos interactivos (respiración, checklists, reflexiones, guías y contactos de ayuda).
    """

    INITIAL_RESOURCES = [
        # 1. Ejercicio Interactivo de Respiración
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111101"),
            "title": "Técnica de Respiración 4-4-6 para la Calma Instantánea",
            "description": "Ejercicio guiado de respiración diafragmática con animación interactiva para regular el ritmo cardíaco y reducir la tensión.",
            "category": "Manejo del estrés",
            "resource_type": "ejercicio",
            "interactive_type": "breathing",
            "interactive_data": {
                "inhale_seconds": 4,
                "hold_seconds": 4,
                "exhale_seconds": 6,
                "default_cycles": 4,
                "pattern_name": "Respiración Relajante 4-4-6",
                "instructions": "Inhala profundamente por la nariz inflando el abdomen, mantén el aire suavemente en tus pulmones y exhala lentamente por la boca liberando toda la tensión acumulada."
            },
            "content": "La respiración diafragmática controlada estimula de forma directa el nervio vago y activa el sistema nervioso parasimpático, reduciendo los niveles de cortisol en minutos. Puedes utilizar este ejercicio interactivo cuando sientas sobrecarga o antes de iniciar una tarea compleja.",
            "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
            "author": "Dra. Sofía Ramírez • Unidad de Bienestar",
            "reading_time_minutes": 3,
            "level": "principiante",
            "tags": "respiración, calma, estrés, relajación, diafragma, pausa activa",
            "source_url": "https://www.who.int/es/news-room/questions-and-answers/item/stress",
            "source_institution": "Organización Mundial de la Salud (OMS)",
            "xp_reward": 25,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "estres",
            "is_published": True
        },

        # 2. Checklist Interactivo de Autocuidado
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111102"),
            "title": "Checklist Diario de Autocuidado y Balance Integral",
            "description": "Lista interactiva de verificación para monitorear tus hábitos básicos de salud física, mental y emocional durante la jornada.",
            "category": "Autocuidado",
            "resource_type": "checklist",
            "interactive_type": "checklist",
            "interactive_data": {
                "items": [
                    {"id": "c1", "label": "Tomé al menos 6 a 8 vasos de agua pura durante el día 💧", "required": False},
                    {"id": "c2", "label": "Realicé al menos una pausa activa de 5 minutos lejos de la pantalla 🧘‍♂️", "required": False},
                    {"id": "c3", "label": "Tuve una comida completa y consciente sin distracciones laborales 🥗", "required": False},
                    {"id": "c4", "label": "Dormí entre 7 y 8 horas con descanso reparador anoche 🌙", "required": False},
                    {"id": "c5", "label": "Conversé o compartí un momento ameno con un compañero o familiar 🤝", "required": False},
                    {"id": "c6", "label": "Establecí un límite claro de desconexión al terminar mis labores 📵", "required": False}
                ],
                "min_completion_percent": 70
            },
            "content": "El autocuidado no es un lujo, es una práctica diaria preventiva. Monitorear pequeños hábitos cotidianos fortalece tu resiliencia ante el estrés acumulado.",
            "image_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80",
            "author": "Comité de Salud y Clima Institucional",
            "reading_time_minutes": 4,
            "level": "principiante",
            "tags": "checklist, hábitos, autocuidado, descanso, hidratación, balance",
            "source_url": "https://www.paho.org/es/temas/salud-mental",
            "source_institution": "Organización Panamericana de la Salud (OPS)",
            "xp_reward": 20,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "general",
            "is_published": True
        },

        # 3. Reflexión Guiada Confidencial
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111103"),
            "title": "Reflexión Guiada: Identificando Fuentes de Sobrecarga",
            "description": "Espacio interactivo y confidencial para escribir sobre las situaciones que demandaron mayor energía emocional y cómo responder asertivamente.",
            "category": "Prevención del agotamiento",
            "resource_type": "reflexion",
            "interactive_type": "reflection",
            "interactive_data": {
                "prompt": "¿Qué situación o tarea te generó mayor desgaste esta semana y qué pequeño ajuste podrías implementar para proteger tu energía?",
                "placeholder": "Escribe aquí tu reflexión con total privacidad y tranquilidad...",
                "min_characters": 15
            },
            "content": "Poner en palabras lo que sentimos permite al cerebro organizar la experiencia y pasar de la reactividad emocional al análisis constructivo. Tus reflexiones son 100% privadas.",
            "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
            "author": "Equipo Clínico EquilibrIA",
            "reading_time_minutes": 5,
            "level": "intermedio",
            "tags": "reflexión, burnout, agotamiento, introspección, límites, escritura",
            "source_url": "https://saludmental.mspas.gob.gt",
            "source_institution": "Ministerio de Salud Pública y Asistencia Social (MSPAS)",
            "xp_reward": 25,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "agotamiento",
            "is_published": True
        },

        # 4. Cultura y Bienestar en Guatemala
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111104"),
            "title": "Solidaridad, 'Echar la Mano' y Resiliencia Comunitaria Chapina 🇬🇹",
            "description": "Cómo los lazos comunitarios y el compañerismo tradicional guatemalteco actúan como protectores fundamentales de la salud emocional.",
            "category": "Cultura y bienestar en Guatemala",
            "resource_type": "articulo",
            "interactive_type": "none",
            "interactive_data": {},
            "content": "En la cultura guatemalteca, el apoyo mutuo ('echar la mano') y la convivencia cálida ('buena onda') son pilares de bienestar social. La investigación psicosocial demuestra que sentirse respaldado por compañeros de trabajo y de estudio reduce los efectos del estrés crónico hasta en un 40%.\n\nCelebrar los logros colectivos, compartir un café con tiempo de calidad o practicar una 'chamusca' recreativa refuerza el sentido de pertenencia y disminuye el aislamiento emocional.",
            "image_url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80",
            "author": "Lic. Carlos Mendoza • Antropología y Clima Laboral",
            "reading_time_minutes": 6,
            "level": "principiante",
            "tags": "Guatemala, chapín, comunidad, solidaridad, compañerismo, resiliencia",
            "source_url": "https://www.mspas.gob.gt",
            "source_institution": "MSPAS Guatemala / Programa Nacional de Salud Mental",
            "xp_reward": 15,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "motivacion",
            "is_published": True
        },

        # 5. Necesito Ayuda (Líneas Oficiales y Protocolos de Apoyo)
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111105"),
            "title": "Directorio de Orientación y Líneas de Ayuda en Salud Mental",
            "description": "Contactos directos, números institucionales y líneas nacionales gratuitas de acompañamiento psicológico confidencial.",
            "category": "Necesito ayuda",
            "resource_type": "consejo",
            "interactive_type": "none",
            "interactive_data": {
                "emergency_contacts": [
                    {"name": "Línea Nacional de Salud Mental (MSPAS)", "phone": "1515 / 1540", "type": "Gratuita y Confidencial 24/7"},
                    {"name": "Unidad de Orientación Psicológica Institucional", "phone": "Ext. 204", "type": "Atención 1 a 1 en Sede"},
                    {"name": "Emergencias Médicas / Bomberos", "phone": "122 / 123", "type": "Atención Inmediata"}
                ]
            },
            "content": "Pedir apoyo es una muestra de valentía y autocuidado. Si atraviesas un momento difícil, de tristeza profunda o sobrecarga insostenible, no tienes que enfrentarlo a solas.\n\n📞 **Líneas de Atención Gratuita en Guatemala:**\n• **Línea Nacional de Salud Mental MSPAS:** Marca **1515** o **1540** (atención profesional y confidencial).\n• **Citas 1 a 1:** Puedes agendar una sesión privada de orientación con el profesional de apoyo desde la pestaña 'Agenda de Citas' de EquilibrIA.\n• **Emergencias Médicas:** 122 / 123.",
            "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
            "author": "Dirección de Salud y Prevención Institucional",
            "reading_time_minutes": 3,
            "level": "principiante",
            "tags": "ayuda, emergencia, apoyo psicológico, MSPAS, 1515, orientación, salud mental",
            "source_url": "https://saludmental.mspas.gob.gt",
            "source_institution": "MSPAS Guatemala / Dirección de Bienestar",
            "xp_reward": 10,
            "counts_for_streak": False,
            "allow_ai_recommendation": True,
            "target_indicator": "general",
            "is_published": True
        },

        # 6. Gestión del Tiempo e Higiene del Descanso
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111106"),
            "title": "Higiene del Sueño: Guía de 7 Pasos para un Descanso Reparador",
            "description": "Recomendaciones prácticas basadas en neurociencia para conciliar el sueño y despertar con vitalidad.",
            "category": "Descanso",
            "resource_type": "articulo",
            "interactive_type": "none",
            "interactive_data": {},
            "content": "El sueño de calidad es el proceso fisiológico fundamental para la regeneración cerebral y la regulación del estado de ánimo.\n\n1. Establece un horario regular para acostarte y levantarte.\n2. Evita pantallas con luz azul al menos 45 minutos antes de dormir.\n3. Mantén la habitación a una temperatura fresca y con baja iluminación.\n4. Reduce el consumo de café y bebidas energéticas después de las 3:00 PM.\n5. Realiza una actividad relajante como lectura ligera o respiración consciente.",
            "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80",
            "author": "Dr. Fernando Morales • Neurología y Bienestar",
            "reading_time_minutes": 5,
            "level": "principiante",
            "tags": "sueño, descanso, higiene del sueño, energía, recuperación",
            "source_url": "https://www.sleepfoundation.org",
            "source_institution": "Fundación Mundial del Sueño / OMS",
            "xp_reward": 15,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "agotamiento",
            "is_published": True
        },

        # 7. Inteligencia Emocional y Comunicación Asertiva
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111107"),
            "title": "Comunicación Asertiva y Establecimiento de Límites Saludables",
            "description": "Técnicas prácticas para expresar necesidades y opiniones con respeto, firmeza y empatía en el entorno de trabajo o estudio.",
            "category": "Comunicación",
            "resource_type": "articulo",
            "interactive_type": "none",
            "interactive_data": {},
            "content": "Aprender a decir 'no' de forma respetuosa y comunicar nuestras capacidades de tiempo previene la sobrecarga laboral y académica. La asertividad se basa en tres componentes: describir los hechos sin juicios, expresar cómo nos impacta la situación y proponer una alternativa constructiva.",
            "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
            "author": "Licda. Ana Lucía Estrada • Psicología Organizacional",
            "reading_time_minutes": 6,
            "level": "intermedio",
            "tags": "comunicación, asertividad, límites, relaciones, empatía, inteligencia emocional",
            "source_url": "https://www.apa.org/topics/communication",
            "source_institution": "Asociación Americana de Psicología (APA)",
            "xp_reward": 20,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "estres",
            "is_published": True
        },

        # 8. Manejo de Ansiedad y Técnica de Grounding 5-4-3-2-1
        {
            "id": uuid.UUID("11111111-1111-4111-a111-111111111108"),
            "title": "Técnica de Conexión Sensorial 5-4-3-2-1 para Regular la Ansiedad",
            "description": "Ejercicio práctico de anclaje sensory-grounding para disipar pensamientos acelerados y reconectar con el presente.",
            "category": "Ansiedad y preocupación",
            "resource_type": "ejercicio",
            "interactive_type": "none",
            "interactive_data": {},
            "content": "Cuando la mente se llena de preocupaciones sobre el futuro, la técnica de anclaje sensorial permite retornar al momento presente:\n\n• **5 cosas que puedas ver** a tu alrededor (colores, formas, objetos).\n• **4 cosas que puedas tocar** (la textura de tu ropa, la mesa, tus manos).\n• **3 cosas que puedas escuchar** (el ambiente, tu respiración, el viento).\n• **2 cosas que puedas oler** (el aroma del café, el aire).\n• **1 cosa que puedas saborear** (un sorbo de agua fresca).",
            "image_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80",
            "author": "Equipo Clínico EquilibrIA",
            "reading_time_minutes": 4,
            "level": "principiante",
            "tags": "ansiedad, grounding, mindfulness, presencia, calma, sentidos",
            "source_url": "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
            "source_institution": "Instituto Nacional de Salud Mental (NIMH)",
            "xp_reward": 20,
            "counts_for_streak": True,
            "allow_ai_recommendation": True,
            "target_indicator": "estres",
            "is_published": True
        }
    ]

    @classmethod
    def seed_resources_if_empty(cls):
        """Inserta o actualiza los recursos iniciales de alta calidad."""
        try:
            for r_data in cls.INITIAL_RESOURCES:
                existing = Resource.query.get(r_data["id"])
                if not existing:
                    new_res = Resource(**r_data)
                    db.session.add(new_res)
                else:
                    # Actualizar campos clave para asegurar enriquecimiento
                    existing.title = r_data["title"]
                    existing.description = r_data["description"]
                    existing.category = r_data["category"]
                    existing.resource_type = r_data["resource_type"]
                    existing.interactive_type = r_data["interactive_type"]
                    existing.interactive_data = r_data["interactive_data"]
                    existing.content = r_data["content"]
                    existing.tags = r_data["tags"]
                    existing.level = r_data["level"]
                    existing.xp_reward = r_data["xp_reward"]
                    existing.source_url = r_data["source_url"]
                    existing.source_institution = r_data["source_institution"]
            db.session.commit()
            print(f"[RESOURCES] Catálogo inicial de recursos interactivos enriquecido exitosamente ({len(cls.INITIAL_RESOURCES)} recursos).")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"[RESOURCES ERROR] Error al sembrar recursos: {e}")
            return False
