import os
import json
import re
from google import genai
from google.genai import types
from app.services.cultural_dictionary_service import CulturalDictionaryService
from app.services.knowledge_base_service import KnowledgeBaseService

class GeminiService:
    """
    Servicio de Inteligencia Artificial para EquilibrIA.
    
    PRINCIPIOS FUNDAMENTALES:
    1. Gemini NO calcula ni inventa puntuaciones emocionales: recibe los resultados estructurados del EvaluationEngineService.
    2. Gemini NO realiza diagnósticos clínicos, no prescribe medicamentos ni etiqueta trastornos.
    3. Actúa como Asistente de Bienestar, Interpretador y Orientador Formativo.
    4. Utiliza RAG con fuentes oficiales (OMS, OPS, MSPAS Guatemala, UNICEF).
    5. Respeta el consentimiento y preferencias del usuario (formal, cercano, guatemalteco).
    6. Incorpora protocolo de seguridad ante señales de crisis o autolesión.
    """

    CRISIS_KEYWORDS = [
        "suicid", "matarme", "quitarme la vida", "no quiero vivir", "morirme",
        "autolesion", "cortarme", "desaparecer de este mundo", "acabar con todo",
        "ya no aguanto vivir", "hacerme daño"
    ]

    @classmethod
    def detect_crisis_risk(cls, text):
        """Detecta si el mensaje contiene indicadores de crisis emocional o riesgo inmediato."""
        text_lower = (text or '').lower()
        for kw in cls.CRISIS_KEYWORDS:
            if kw in text_lower:
                return True
        return False

    @classmethod
    def get_emergency_response(cls, user_message):
        """Genera una respuesta empática de contención inmediata ante situaciones de crisis."""
        return (
            "💜 **Estoy contigo y tu bienestar es lo más importante en este momento.**\n\n"
            "Lo que sientes es muy valioso, pero ante situaciones de tanto dolor no tienes que estar a solas. "
            "Por favor comunícate de inmediato con profesionales y líneas de ayuda preparadas para acompañarte:\n\n"
            "📞 **Líneas de Apoyo y Emergencia en Guatemala:**\n"
            "• **Línea Nacional de Salud Mental (MSPAS):** Marca al **1515** o **1540** (Gratuita y confidencial).\n"
            "• **Apoyo Psicológico Institucional:** Acude a la unidad de bienestar o profesional de apoyo de tu sede.\n"
            "• **Emergencias Médicas / Bomberos:** **122** o **123**.\n\n"
            "Por favor acércate a una persona de confianza o a un servicio de salud cercano. Hay personas listas para escucharte y apoyarte con calidez."
        )

    @classmethod
    def interpret_evaluation(cls, structured_data, user_context=None):
        """
        Gemini interpreta cualitativamente los resultados calculados por el motor de evaluación.
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            print("WARNING: Usando interpretación simulada (Mock) porque GEMINI_API_KEY no está configurada.")
            return cls._mock_evaluation_interpretation(structured_data)

        try:
            client = genai.Client(api_key=api_key)

            # Recuperar RAG context relevante según los niveles calculados
            rag = KnowledgeBaseService.retrieve_relevant_context(
                f"Estrés {structured_data.get('stress_score')} Agotamiento {structured_data.get('burnout_score')}", limit=2
            )

            prompt = (
                "Eres el asistente de bienestar y orientación de EquilibrIA para instituciones en Guatemala.\n"
                "Tu objetivo es INTERPRETAR los siguientes resultados objetivos calculados por el sistema y redactar "
                "una explicación formativa y recomendaciones constructivas para la persona y la institución.\n\n"
                "DATOS ESTRUCTURADOS DEL TEST (Calculados por EquilibrIA, no los modifiques):\n"
                f"{json.dumps(structured_data, ensure_ascii=False, indent=2)}\n\n"
                "BASE DE CONOCIMIENTO TÉCNICA (Fuentes verificadas OMS/OPS/MSPAS):\n"
                f"{rag['context_text']}\n\n"
                "INSTRUCCIONES ESTRICTAS:\n"
                "1. NO realices diagnósticos clínicos ni menciones trastornos médicos o psiquiátricos.\n"
                "2. Explica los niveles de forma constructiva, empática y clara en español.\n"
                "3. Genera una sugerencia organizacional para el bienestar institucional.\n"
                "4. Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura:\n"
                "{\n"
                "  \"interpretation_summary\": \"<Resumen cualitativo en 2-3 párrafos orientadores>\",\n"
                "  \"institution_suggestion\": \"<Sugerencia institucional breve y preventiva>\",\n"
                "  \"key_recommendations\": [\"<Recomendación 1>\", \"<Recomendación 2>\", \"<Recomendación 3>\"],\n"
                "  \"citations\": " + json.dumps(rag['citations'], ensure_ascii=False) + "\n"
                "}"
            )

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )

            data = json.loads(response.text)
            return {
                'interpretation_summary': data.get('interpretation_summary', 'Reflexión evaluada de forma constructiva.'),
                'institution_suggestion': data.get('institution_suggestion', 'Promover pausas activas y comunicación periódica.'),
                'key_recommendations': data.get('key_recommendations', ['Establecer límites de descanso', 'Planificar prioridades']),
                'citations': data.get('citations', rag['citations'])
            }

        except Exception as e:
            print(f"[GEMINI] Error en interpretación: {e}")
            return cls._mock_evaluation_interpretation(structured_data)

    @classmethod
    def _mock_evaluation_interpretation(cls, structured_data):
        """Generador simulado para pruebas locales."""
        stress = structured_data.get('stress_score', 50)
        burnout = structured_data.get('burnout_score', 50)
        motivation = structured_data.get('motivation_score', 50)

        rag = KnowledgeBaseService.retrieve_relevant_context(f"Estrés {stress} Agotamiento {burnout}", limit=2)

        if stress >= 70 or burnout >= 70:
            summary = (
                f"Tus respuestas indican un nivel de sobrecarga {structured_data.get('overall_level', 'ELEVADO')} "
                f"(Estrés: {stress}%, Agotamiento: {burnout}%). Es completamente comprensible sentirse cargado ante "
                f"periodos de alta exigencia académica o laboral. Te recomendamos priorizar la recuperación de energía "
                f"y conversar con el equipo de apoyo institucional si la tensión persiste."
            )
            suggestion = "Monitorear las fechas de entrega colectivas e impulsar talleres breves de manejo de la sobrecarga."
            recs = [
                "Implementar pausas de desconexión digital de al menos 15 minutos entre bloques de estudio o trabajo.",
                "Aplicar la técnica de respiración diafragmática 4-7-8 al identificar picos de tensión.",
                "Agendar una sesión de orientación con el profesional de apoyo de la institución."
            ]
        else:
            summary = (
                f"Tus respuestas reflejan un balance favorable y motivador (Bienestar: {structured_data.get('wellbeing_score', 70)}%, "
                f"Motivación: {motivation}%). Mantener este ritmo te permitirá consolidar tus metas sin descuidar tu salud física y mental."
            )
            suggestion = "Reconocer los logros del equipo y mantener los canales de colaboración activa."
            recs = [
                "Mantener la rutina de descanso y organización diaria.",
                "Compartir buenas prácticas de equilibrio con tus compañeros de área.",
                "Dedicar tiempo a actividades recreativas o deportivas durante la semana."
            ]

        return {
            'interpretation_summary': summary,
            'institution_suggestion': suggestion,
            'key_recommendations': recs,
            'citations': rag['citations']
        }

    @classmethod
    def get_chat_response(cls, user_message, user_context=None, user_preferences=None):
        """
        Genera una respuesta conversacional con RAG, respeto de consentimientos y tono cultural guatemalteco adaptado.
        """
        # 1. Filtro de Seguridad de Crisis Inmediata
        if cls.detect_crisis_risk(user_message):
            return {
                'reply': cls.get_emergency_response(user_message),
                'is_emergency': True,
                'citations': []
            }

        # 2. Detección de Consulta sobre Expresiones Guatemaltecas
        expr_inquiry = CulturalDictionaryService.detect_inquiry_about_expression(user_message)
        if expr_inquiry:
            return {
                'reply': CulturalDictionaryService.format_explanation_response(expr_inquiry),
                'is_emergency': False,
                'citations': [{'title': 'Diccionario Cultural Guatemalteco EquilibrIA', 'source': 'EquilibrIA 🇬🇹', 'url': None}]
            }

        # 3. Recuperar RAG de la Base de Conocimiento
        rag = KnowledgeBaseService.retrieve_relevant_context(user_message, limit=2)

        # 4. Configurar Contexto de Usuario según Consentimiento
        user_context_str = "No hay datos previos de bienestar compartidos por el usuario."
        if user_context and user_context.get('use_wellbeing_data', True):
            levels = user_context.get('levels', {})
            user_context_str = (
                f"Nivel de estrés general: {levels.get('stress_level', 'Moderado')} ({levels.get('stress_score', 40)}%), "
                f"Nivel de motivación: {levels.get('motivation_level', 'Adecuado')} ({levels.get('motivation_score', 65)}%), "
                f"Agotamiento: {levels.get('burnout_level', 'Bajo')} ({levels.get('burnout_score', 30)}%). "
                f"Última reflexión: '{user_context.get('last_text', 'Buen desempeño general')}'"
            )

        # 5. Configurar Estilo Cultural
        comm_style = (user_preferences or {}).get('ai_communication_style', 'guatemalteco')
        use_gt_expr = (user_preferences or {}).get('use_guatemalan_expressions', True)

        gt_guidelines = ""
        if comm_style == 'guatemalteco' and use_gt_expr:
            gt_vocabulary = CulturalDictionaryService.get_allowed_vocabulary_prompt()
            gt_guidelines = (
                "ESTILO CULTURAL GUATEMALTECO 🇬🇹:\n"
                "• Utiliza un tono cálido, cercano, empático y respetuoso propio de Guatemala (voseo respetuoso opcional, natural y sutil).\n"
                "• Puedes incluir ocasionalmente expresiones guatemaltecas PERMITIDAS como: " + gt_vocabulary + ".\n"
                "• REGLA DE ORO: NO abuses de los chapinismos ni coloques uno en cada frase; debe sonar completamente orgánico y natural.\n"
                "• NUNCA utilices vulgaridades, insultos ni expresiones restringidas para dirigirte al usuario."
            )
        elif comm_style == 'formal':
            gt_guidelines = "ESTILO FORMAL:\n• Comunícate en español neutro, profesional, respetuoso y formal (trato de usted), sin modismos coloquiales."
        else:
            gt_guidelines = "ESTILO CERCANO:\n• Comunícate de forma amigable, cálida y cercana en español estándar sin modismos locales marcados."

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            print("WARNING: Usando chat simulado (Mock) porque GEMINI_API_KEY no está configurada.")
            return cls._mock_chat_response(user_message, user_context_str, comm_style, rag)

        try:
            client = genai.Client(api_key=api_key)

            prompt = (
                "Eres Equi, el Asistente Inteligente de Bienestar y Autocuidado de EquilibrIA en Guatemala.\n\n"
                f"{gt_guidelines}\n\n"
                "REGLAS ÉTICAS Y DE SEGURIDAD:\n"
                "1. NO eres médico ni psiquiatra. NUNCA realices diagnósticos clínicos ni recetes medicamentos.\n"
                "2. Si el usuario experimenta malestar intenso o persistente, sugiérele con empatía contactar a los profesionales de apoyo de su institución o a las líneas de ayuda del MSPAS.\n"
                "3. Basa tus recomendaciones en la siguiente Base de Conocimiento y fuentes verificadas.\n\n"
                "BASE DE CONOCIMIENTO (Fuentes verificadas OMS/OPS/MSPAS/UNICEF):\n"
                f"{rag['context_text']}\n\n"
                "CONTEXTO AUTORIZADO DEL USUARIO (Respeta la privacidad):\n"
                f"{user_context_str}\n\n"
                "MENSAJE DEL USUARIO:\n"
                f"\"{user_message}\"\n\n"
                "Responde de forma clara, empática y estructurada (máximo 3 párrafos). "
                "Si utilizas recomendaciones de la base de conocimiento, menciona brevemente la fuente (ej. 'Según recomendaciones de la OMS...')."
            )

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )

            return {
                'reply': response.text,
                'is_emergency': False,
                'citations': rag['citations']
            }

        except Exception as e:
            print(f"[GEMINI CHAT] Error: {e}")
            return cls._mock_chat_response(user_message, user_context_str, comm_style, rag)

    @classmethod
    def _mock_chat_response(cls, user_message, user_context_str, comm_style, rag):
        """Respuesta conversacional simulada que refleja la contextualización y RAG."""
        msg_lower = user_message.lower()

        # Saludo inicial según estilo
        if comm_style == 'guatemalteco':
            greeting = "¡Hola! Qué buena onda que me escribas."
            tip_intro = "Cabal, entiendo lo que estás pasando."
        elif comm_style == 'formal':
            greeting = "Estimado/a usuario/a, es un placer saludarle."
            tip_intro = "Comprendo la situación que describe."
        else:
            greeting = "¡Hola! Gracias por escribirme."
            tip_intro = "Entiendo perfectamente cómo te sientes."

        if any(w in msg_lower for w in ["estres", "estrés", "examen", "parcial", "tarea", "presion", "presión", "tiempo", "sobrecarga"]):
            body = (
                f"{greeting} {tip_intro} Cuando se nos juntan las entregas y pendientes, es fácil sentir que la presión nos sobrepasa. "
                "De acuerdo con las guías de gestión del estrés de la OMS, una de las mejores estrategias es dividir las tareas grandes en bloques pequeños "
                "de 25 minutos con pausas activas para respirar y estirarse. "
                "¿Te gustaría que organicemos juntos tus prioridades de hoy?"
            )
        elif any(w in msg_lower for w in ["cansado", "cansada", "agotado", "agotada", "sueño", "desvelo", "sin energía"]):
            body = (
                f"{greeting} El cansancio acumulado nos pasa factura si no le damos al cuerpo el descanso que necesita. "
                "Según estudios de la OPS y UNESCO sobre higiene del sueño, desconectar de las pantallas al menos 40 minutos antes de dormir "
                "y mantener un horario fijo para acostarse ayuda a que el descanso sea verdaderamente restaurador. "
                "Llevátela con calma hoy y date permiso para pausar."
            )
        elif any(w in msg_lower for w in ["triste", "desanimado", "desanimada", "mal", "solo", "sola"]):
            body = (
                f"{greeting} Siento mucho que estés atravesando este momento difícil. Es totalmente válido sentirse así a veces y no tienes que exigir estar al 100% todos los días. "
                "Recuerda que cuentas con el equipo de apoyo psicológico de tu institución. "
                "Date un cachito de tiempo para hacer algo que te reconforte hoy y conversa con alguien de confianza."
            )
        else:
            body = (
                f"{greeting} Estoy aquí para acompañarte en tu bienestar, organización y salud emocional. "
                "Podemos platicar sobre cómo te has sentido en la semana, revisar técnicas de autocuidado o explorar los resultados de tus evaluaciones. "
                "¿De qué te gustaría hablar hoy?"
            )

        return {
            'reply': body,
            'is_emergency': False,
            'citations': rag['citations']
        }
