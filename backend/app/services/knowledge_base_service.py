import re
from sqlalchemy import or_
from app import db
from app.models.knowledge_document import KnowledgeDocument
from app.models.resource import Resource

class KnowledgeBaseService:
    """
    Servicio de Base de Conocimiento RAG para EquilibrIA.
    Organiza y recupera documentos técnicos y formativos basados en fuentes confiables
    (OMS, OPS, MSPAS de Guatemala, UNICEF, UNESCO y literatura científica).
    """

    SEED_DOCUMENTS = [
        {
            "title": "Manejo Integral del Estrés Laboral y Académico",
            "category": "estres",
            "concept": "Respuesta psicofisiológica ante demandas que superan los recursos percibidos.",
            "definition": "El estrés es una reacción natural del organismo ante desafíos o sobrecargas. Cuando se vuelve crónico, puede afectar la concentración, el sueño y el rendimiento general.",
            "signals": "Tensión muscular, irritabilidad, dificultad para concentrarse, alteraciones en el patrón de descanso y fatiga constante.",
            "associated_factors": "Sobrecarga de tareas, fechas límite acumuladas, falta de descansos programados y ausencia de pausas activas.",
            "protective_factors": "Organización del tiempo por bloques, técnicas de respiración diafragmática, límites entre actividades laborales/académicas y descanso, redes de apoyo.",
            "recommendations": "Implementar la técnica Pomodoro (25 min de foco y 5 min de descanso), priorizar tareas con la matriz urgente/importante, mantener hidratación constante y realizar caminatas breves.",
            "when_to_refer_professional": "Cuando los niveles de tensión interfieran significativamente con las actividades cotidianas, provoquen síntomas físicos continuos o persistan por más de 3 semanas consecutivas.",
            "source": "Organización Mundial de la Salud (OMS) • Guías de Gestión del Estrés",
            "url": "https://www.who.int/es/news-room/questions-and-answers/item/stress",
            "author": "Departamento de Salud Mental y Abuso de Sustancias de la OMS",
            "reliability_level": "Oficial",
            "tags": "estrés, sobrecarga, manejo del tiempo, respiración, prevención"
        },
        {
            "title": "Prevención y Afrontamiento del Agotamiento (Burnout)",
            "category": "agotamiento",
            "concept": "Síndrome derivado del estrés crónico prolongado que no ha sido gestionado con éxito.",
            "definition": "El burnout se caracteriza por tres dimensiones: sentimientos de agotamiento o agotamiento de energía, mayor distanciamiento mental del trabajo o estudios, y sensación de ineficacia o falta de realización.",
            "signals": "Agotamiento emocional profundo, cinismo o apatía hacia las responsabilidades habituales, desmotivación persistente y disminución en el sentido de logro.",
            "associated_factors": "Jornadas laborales/académicas excesivas sin periodos de recuperación, desconexión digital inexistente y falta de reconocimiento.",
            "protective_factors": "Higiene de sueño rigurosa, límites claros al finalizar la jornada, actividades recreativas no vinculadas a metas y espacios institucionales de escucha.",
            "recommendations": "Establecer una rutina estricta de cierre diario de actividades, desconectar notificaciones fuera de horario y agendar al menos un bloque diario para actividades personales placenteras.",
            "when_to_refer_professional": "Si existe desapego emocional severo, incapacidad para reanudar labores o afectación del estado anímico general sostenido en el tiempo.",
            "source": "Organización Panamericana de la Salud (OPS) / CIE-11",
            "url": "https://www.paho.org/es/temas/salud-mental",
            "author": "División de Bienestar y Salud Ocupacional OPS/OMS",
            "reliability_level": "Científica",
            "tags": "burnout, agotamiento, descanso, desconexión digital, energía"
        },
        {
            "title": "Salud Emocional y Autocuidado Comunitario en Guatemala",
            "category": "bienestar_emocional",
            "concept": "Enfoque integral de bienestar biopsicosocial adaptado al contexto sociocultural guatemalteco.",
            "definition": "La salud emocional implica reconocer, aceptar y canalizar las emociones de forma constructiva, fortaleciendo los lazos comunitarios, institucionales y familiares característicos de la sociedad guatemalteca.",
            "signals": "Capacidad de disfrute, equilibrio ante contratiempos cotidianos, relaciones interpersonales sanas y sentido de propósito.",
            "associated_factors": "Apoyo de compañeros ('buena onda'), convivencia respetuosa, equilibrio entre esfuerzo y recreación familiar o comunitaria.",
            "protective_factors": "Solidaridad grupal, expresión abierta de inquietudes, pausas reflexivas y acceso a orientación psicológica institucional.",
            "recommendations": "Fomentar espacios de diálogo sincero entre pares, participar en actividades recreativas o deportivas (como chamuscas saludables) y celebrar pequeños logros cotidianos.",
            "when_to_refer_professional": "Ante pérdida prolongada de interés por actividades cotidianas, aislamiento voluntario o crisis personales complejas.",
            "source": "Ministerio de Salud Pública y Asistencia Social (MSPAS) de Guatemala • Programa Nacional de Salud Mental",
            "url": "https://saludmental.mspas.gob.gt",
            "author": "Comisión Nacional de Salud Mental MSPAS Guatemala",
            "reliability_level": "Oficial",
            "tags": "bienestar, salud emocional, Guatemala, autocuidado, comunidad, MSPAS"
        },
        {
            "title": "Guía de Primeros Auxilios Psicológicos y Protocolo de Crisis",
            "category": "senales_de_alerta",
            "concept": "Intervención inicial de apoyo inmediato, empático y no invasivo para personas en angustia aguda.",
            "definition": "Consiste en brindar escucha activa sin juzgar, evaluar necesidades básicas inmediatas, acompañar en la estabilización y conectar con recursos profesionales y líneas de emergencia institucionales.",
            "signals": "Desbordamiento emocional agudo, llanto incontrolable, expresiones de desesperanza profunda, desorientación o ideación de autolesión.",
            "associated_factors": "Pérdidas repentinas, eventos traumáticos, crisis personales o agotamiento extremo.",
            "protective_factors": "Presencia de redes de apoyo seguras, acceso inmediato a líneas de ayuda y derivación a profesionales de salud mental.",
            "recommendations": "Escuchar con atención plena, validar la emoción sin emitir juicios, garantizar un entorno seguro y facilitar el contacto con el equipo de apoyo psicológico institucional o líneas de emergencia 1515 / 1540.",
            "when_to_refer_professional": "SIEMPRE e INMEDIATAMENTE ante cualquier sospecha o manifestación de ideación suicida, autolesión o crisis descompensada.",
            "source": "UNICEF / OMS • Guía de Primeros Auxilios Psicológicos",
            "url": "https://www.unicef.org/lac/primeros-auxilios-psicologicos",
            "author": "Equipo de Protección y Salud Mental de UNICEF",
            "reliability_level": "Oficial",
            "tags": "primeros auxilios psicológicos, crisis, contención, emergencia, derivación"
        },
        {
            "title": "Higiene del Sueño y Restauración Cognitiva",
            "category": "autocuidado",
            "concept": "Prácticas y hábitos conductuales que facilitan un descanso reparador indispensable para la salud cerebral.",
            "definition": "El sueño de calidad permite la consolidación de la memoria, la regulación neuroquímica del estado de ánimo y la recuperación de la energía para las exigencias diarias.",
            "signals": "Despertar renovado, niveles estables de energía durante el día y claridad para la toma de decisiones.",
            "associated_factors": "Exposición a pantallas con luz azul antes de dormir, consumo de café en horarios nocturnos y horarios irregulares de descanso.",
            "protective_factors": "Horarios consistentes para acostarse y levantarse, ambiente oscuro y silencioso, y ritual de desconexión.",
            "recommendations": "Evitar pantallas al menos 45 minutos antes de dormir, limitar la cafeína después de las 4:00 PM y mantener una temperatura fresca en la habitación.",
            "when_to_refer_professional": "En caso de insomnio crónico que persista más de 4 semanas o somnolencia diurna severa.",
            "source": "UNESCO • Salud y Bienestar en la Educación",
            "url": "https://es.unesco.org/themes/educacion-salud-bienestar",
            "author": "Cátedra UNESCO de Bienestar y Educación para la Salud",
            "reliability_level": "Científica",
            "tags": "sueño, descanso, higiene del sueño, recuperación, energía"
        }
    ]

    @classmethod
    def seed_initial_knowledge(cls):
        """Precarga inicial de la base de conocimiento si la tabla está vacía."""
        try:
            if KnowledgeDocument.query.count() == 0:
                for item in cls.SEED_DOCUMENTS:
                    doc = KnowledgeDocument(
                        title=item["title"],
                        category=item["category"],
                        concept=item["concept"],
                        definition=item["definition"],
                        signals=item.get("signals"),
                        associated_factors=item.get("associated_factors"),
                        protective_factors=item.get("protective_factors"),
                        recommendations=item.get("recommendations"),
                        when_to_refer_professional=item.get("when_to_refer_professional"),
                        source=item["source"],
                        url=item.get("url"),
                        author=item.get("author"),
                        reliability_level=item.get("reliability_level", "Oficial"),
                        tags=item.get("tags"),
                        is_active=True
                    )
                    db.session.add(doc)
                db.session.commit()
                print(f"[KNOWLEDGE] Precargados {len(cls.SEED_DOCUMENTS)} documentos técnicos de salud mental y bienestar.")
        except Exception as e:
            db.session.rollback()
            print(f"[KNOWLEDGE] Error sembrando base de conocimiento: {e}")

    @classmethod
    def retrieve_relevant_context(cls, query_text, limit=2):
        """
        Recuperación RAG selectiva: busca los documentos más afines a la consulta o estado del usuario.
        """
        query_lower = query_text.lower()
        
        # Mapeo de términos clave a categorías
        matched_categories = []
        if any(w in query_lower for w in ['estres', 'estrés', 'presion', 'presión', 'parcial', 'examen', 'tiempo', 'tarea', 'sobrecarga']):
            matched_categories.append('estres')
        if any(w in query_lower for w in ['cansado', 'cansada', 'agotado', 'agotada', 'burnout', 'fatiga', 'sin energía', 'abrumado']):
            matched_categories.append('agotamiento')
        if any(w in query_lower for w in ['sueño', 'dormir', 'insomnio', 'noche', 'desvelo', 'descanso']):
            matched_categories.append('autocuidado')
        if any(w in query_lower for w in ['triste', 'mal', 'desesperado', 'desesperanza', 'ayuda', 'crisis', 'llorar', 'grave']):
            matched_categories.append('senales_de_alerta')
        if any(w in query_lower for w in ['guatemala', 'chapin', 'chapín', 'comunidad', 'cultura', 'patojo', 'chamba']):
            matched_categories.append('bienestar_emocional')

        docs = []
        if matched_categories:
            docs = KnowledgeDocument.query.filter(
                KnowledgeDocument.category.in_(matched_categories),
                KnowledgeDocument.is_active == True
            ).limit(limit).all()

        if not docs:
            # Fallback general a bienestar emocional
            docs = KnowledgeDocument.query.filter_by(is_active=True).limit(limit).all()

        # Recuperar también recursos reales publicados en el Centro de Recursos
        real_resources = []
        try:
            res_query = Resource.query.filter_by(is_published=True, allow_ai_recommendation=True)
            if matched_categories:
                res_query = res_query.filter(or_(*[Resource.category.ilike(f"%{c}%") for c in matched_categories] + [Resource.tags.ilike(f"%{c}%") for c in matched_categories]))
            real_resources = res_query.limit(2).all()
        except Exception:
            pass

        # Construir resumen de contexto con fuentes
        context_snippets = []
        citations = []
        for d in docs:
            snippet = (
                f"[Documento Técnico: '{d.title}' | Categoría: {d.category}]\n"
                f"• Concepto: {d.concept or d.definition}\n"
                f"• Recomendaciones Técnicas: {d.recommendations}\n"
                f"• Cuándo orientar a profesional: {d.when_to_refer_professional}\n"
                f"• Fuente Oficial: {d.source}"
            )
            context_snippets.append(snippet)
            citations.append({
                'title': d.title,
                'source': d.source,
                'url': d.url
            })

        for r in real_resources:
            snippet = (
                f"[Recurso Disponible en Centro de Recursos de EquilibrIA: '{r.title}']\n"
                f"• Tipo: {r.resource_type} | Nivel: {r.level} | Duración: {r.reading_time_minutes} min\n"
                f"• Resumen: {r.description}\n"
                f"• Contenido Clave: {r.content[:250]}...\n"
                f"• Fuente / Autor: {r.source_institution or r.author}"
            )
            context_snippets.append(snippet)
            citations.append({
                'title': r.title,
                'source': r.source_institution or r.author,
                'url': r.source_url or '/mi-bienestar'
            })

        return {
            'context_text': "\n\n".join(context_snippets),
            'citations': citations
        }
