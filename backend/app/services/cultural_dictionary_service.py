import re
from app import db
from app.models.cultural_expression import CulturalExpression

class CulturalDictionaryService:
    """
    Servicio de Inteligencia Cultural Guatemalteca 🇬🇹 para EquilibrIA.
    Clasifica expresiones en 3 niveles de seguridad:
    1. ALLOWED (🟢 Permitidas): Modismos cotidianos apropiados (uso sutil y moderado).
    2. EXPLAINABLE (🟡 Solo Explicables): Términos con posible doble sentido (explicar si se pregunta, no usar para dirigirse al usuario).
    3. RESTRICTED (🔴 Restringidas): Lenguaje vulgar u ofensivo (nunca usar, explicar neutralmente si se consulta).
    """

    # Expresiones Semilla Iniciales
    SEED_EXPRESSIONS = [
        # 🟢 NIVEL 1 — PERMITIDAS (ALLOWED)
        {"term": "cabal", "meaning": "Exactamente, correcto, justo o coincidente.", "example": "Cabal, eso era lo que teníamos pendiente.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Uso coloquial positivo y de afirmación."},
        {"term": "cabalito", "meaning": "Exactamente en el punto o en la medida justa.", "example": "Cabalito a tiempo terminamos el proyecto.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Diminutivo afectivo de cabal."},
        {"term": "chilero", "meaning": "Muy bueno, bonito, agradable o de calidad.", "example": "Qué chilero te quedó el informe.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Expresión de aprobación y entusiasmo."},
        {"term": "chilera", "meaning": "Bonita, agradable o bien hecha.", "example": "Qué chilera la actividad de integración.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Femenino de chilero."},
        {"term": "patojo", "meaning": "Niño, joven, adolescente o muchacho.", "example": "Los patojos de primer ingreso se adaptaron rápido.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Trato común para jóvenes en Guatemala."},
        {"term": "patoja", "meaning": "Niña, joven o muchacha.", "example": "La patoja es muy dedicada a sus estudios.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Femenino de patojo."},
        {"term": "pisto", "meaning": "Dinero, fondos o recursos económicos.", "example": "Hay que presupuestar bien el pisto para la semana.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Sinónimo informal de dinero."},
        {"term": "clavo", "meaning": "Problema, dificultad, contratiempo o pendiente.", "example": "Tengo un clavo con una entrega, pero lo estoy resolviendo.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Uso común para referirse a problemas o pendientes."},
        {"term": "chamba", "meaning": "Trabajo, empleo u ocupación.", "example": "Hoy hubo bastante chamba en la oficina.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Sinónimo de trabajo."},
        {"term": "chambear", "meaning": "Trabajar o realizar una labor.", "example": "Toca chambear con ganas para sacar el semestre.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Verbo coloquial de trabajar."},
        {"term": "buena onda", "meaning": "Amable, comprensivo, empático o de actitud positiva.", "example": "Tu equipo es muy buena onda y solidario.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Expresión de aprecio por buen trato."},
        {"term": "mala onda", "meaning": "Desconsiderado, antipático o de mala actitud.", "example": "Qué mala onda que se canceló la sesión.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Opuesto a buena onda."},
        {"term": "pilas", "meaning": "Estar atento, ágil, despierto o proactivo.", "example": "Hay que ponerse pilas con las tareas de esta semana.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Motivación a la proactividad."},
        {"term": "echar ganas", "meaning": "Esforzarse, poner empeño y dedicación.", "example": "Vamos a echarle ganas para alcanzar las metas.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Ánimo y motivación."},
        {"term": "cuate", "meaning": "Amigo, compañero de confianza o colega cercano.", "example": "Hablé con un cuate para pedirle orientación.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Trato afectuoso entre amigos."},
        {"term": "muchá", "meaning": "Vocativo grupal para referirse a compañeros o amigos presentes.", "example": "Muchá, recuerden tomarse un descanso entre entregas.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Llamado informal a un grupo."},
        {"term": "vos", "meaning": "Pronombre de segunda persona informal de uso generalizado en Guatemala.", "example": "Contame vos cómo te has sentido estos días.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Voseo guatemalteco respetuoso y cercano."},
        {"term": "mano", "meaning": "Hermano, amigo o vocativo de confianza.", "example": "Tranquilo mano, todo se va a ir ordenando.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Abreviatura de hermano usada en confianza."},
        {"term": "tranqui", "meaning": "Con calma, relajado o sin prisas.", "example": "Llevátela tranqui y priorizá tu descanso.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Diminutivo de tranquilo."},
        {"term": "chapín", "meaning": "Guatemalteco/a, gentilicio coloquial y de identidad nacional.", "example": "El ingenio chapín se nota en cómo resolvemos retos.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Identidad guatemalteca positiva."},
        {"term": "chapina", "meaning": "Mujer guatemalteca.", "example": "Una líder chapina comprometida con su comunidad.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Femenino de chapín."},
        {"term": "refacción", "meaning": "Merienda, refrigerio o comida ligera entre horas.", "example": "Aprovechá la refacción para despejar la mente.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Momento de pausa y alimentación."},
        {"term": "cachito", "meaning": "Un poco, una pequeña porción o un breve instante.", "example": "Dame un cachito de tiempo para revisar.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Expresión de cantidad pequeña o tiempo corto."},
        {"term": "fijate", "meaning": "Muletilla de conversación para llamar la atención sobre un punto.", "example": "Fijate que hoy me sentí mucho más aliviado.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Conector conversacional muy común."},
        {"term": "aguas", "meaning": "Advertencia para tener precaución o cuidado.", "example": "Aguas con el exceso de cafeína antes de dormir.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Consejo preventivo."},
        {"term": "chamusca", "meaning": "Partido informal de fútbol en la calle o cancha comunitaria.", "example": "Hacer una chamusca el fin de semana ayuda a desestresarse.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Actividad deportiva y de esparcimiento."},
        {"term": "shute", "meaning": "Curioso, entrometido o que le gusta averiguar cosas ajenas.", "example": "No es por ser shute, pero ¿cómo seguiste de salud?", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Término informal para curiosidad."},
        {"term": "canche", "meaning": "Persona rubia o de cabello castaño claro.", "example": "El patojo canche del equipo.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Descripción física común en Guatemala."},
        {"term": "camioneta", "meaning": "Autobús urbano o extraurbano de transporte colectivo.", "example": "El tráfico de la camioneta estuvo pesado.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Término para transporte público en GT."},
        {"term": "simón", "meaning": "Afirmación coloquial equivalente a sí.", "example": "Simón, ya registré mis tareas del día.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Afirmación informal."},
        {"term": "nel", "meaning": "Negación coloquial equivalente a no.", "example": "Nel, hoy no me desvelé.", "safety_level": "ALLOWED", "can_use": True, "can_explain": True, "category": "GUATEMALTEQUISMO", "context_notes": "Negación informal."},

        # 🟡 NIVEL 2 — SOLO EXPLICABLES (EXPLAINABLE)
        {"term": "mula", "meaning": "Coloquialismo para referirse a alguien torpe, terco o despistado según el tono.", "example": "Qué mula fui al olvidar la clave.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Puede resultar despectivo o rudo según el contexto."},
        {"term": "baboso", "meaning": "Expresión coloquial para alguien ingenuo o poco atento.", "example": "Por baboso se me pasó la hora.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "No apropiado para que la IA se dirija al usuario."},
        {"term": "fregado", "meaning": "Complicado, difícil, enfermo o en situación apretada.", "example": "El examen estuvo fregado.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Coloquial de dificultad; no usar ofensivamente."},
        {"term": "fregadera", "meaning": "Broma insistente, molestia continua o desorden.", "example": "Basta de tanta fregadera.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Explicar como broma insistente."},
        {"term": "chingadera", "meaning": "Broma pesada, molestia o desorden.", "example": "Estaban en pura chingadera.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Informal de confianza entre amigos."},
        {"term": "jodido", "meaning": "Difícil, agotado o en situación precaria.", "example": "Estuvo jodida la semana.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Explicar neutralmente como sinónimo de difícil."},
        {"term": "ahuevado", "meaning": "Asustado, temeroso o intimidado ante una situación.", "example": "Estaba ahuevado por la presentación.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Coloquial para asustado; evitar uso directo por la IA."},
        {"term": "ahuevada", "meaning": "Susto, miedo o intimidación.", "example": "Qué buena ahuevada me llevé.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Explicar como susto o miedo."},
        {"term": "casaca", "meaning": "Mentira, exageración o charla persuasiva.", "example": "Pura casaca lo que contó.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Explicar como mentira o charla informal."},
        {"term": "talega", "meaning": "Cansancio extremo, golpe o borrachera según el contexto.", "example": "Qué talega de trabajo.", "safety_level": "EXPLAINABLE", "can_use": False, "can_explain": True, "category": "COLOQUIAL", "context_notes": "Término informal con múltiples sentidos."},

        # 🔴 NIVEL 3 — RESTRINGIDAS / VULGARES (RESTRICTED)
        {"term": "cerote", "meaning": "Vulgaridad guatemalteca utilizada como insulto o vocativo de extrema confianza entre amigos muy cercanos.", "example": "Explicación neutral de origen coloquial.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Palabra vulgar. La IA nunca debe usarla."},
        {"term": "cerota", "meaning": "Femenino de la vulgaridad cerote.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Palabra vulgar restrictiva."},
        {"term": "pisado", "meaning": "Vulgaridad e insulto guatemalteco; también usado para referirse a alguien en mala situación.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Vulgaridad de alta severidad. No permitida."},
        {"term": "pizado", "meaning": "Variante ortográfica de pisado.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Vulgaridad no permitida."},
        {"term": "huevón", "meaning": "Vulgaridad para referirse a alguien perezoso o como vocativo informal rudo.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Expresión vulgar. La IA no la usa."},
        {"term": "huevear", "meaning": "Vulgaridad para robar, hurtar o holgazanear según contexto.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Expresión vulgar."},
        {"term": "cabrón", "meaning": "Insulto rudo o descripción de alguien abusivo o astuto.", "example": "Explicación neutral.", "safety_level": "RESTRICTED", "can_use": False, "can_explain": True, "category": "JERGA", "context_notes": "Palabra ofensiva. Nunca dirigida al usuario."}
    ]

    @classmethod
    def seed_initial_expressions(cls):
        """Precarga inicial de las expresiones guatemaltecas si la tabla está vacía."""
        try:
            if CulturalExpression.query.count() == 0:
                for item in cls.SEED_EXPRESSIONS:
                    expr = CulturalExpression(
                        term=item["term"],
                        meaning=item["meaning"],
                        example=item["example"],
                        category=item["category"],
                        safety_level=item["safety_level"],
                        can_use=item["can_use"],
                        can_explain=item["can_explain"],
                        context_notes=item["context_notes"],
                        active=True
                    )
                    db.session.add(expr)
                db.session.commit()
                print(f"[CULTURE] Precargadas {len(cls.SEED_EXPRESSIONS)} expresiones guatemaltecas.")
        except Exception as e:
            db.session.rollback()
            print(f"[CULTURE] Error sembrando expresiones: {e}")

    @classmethod
    def get_allowed_vocabulary_prompt(cls):
        """Retorna una guía concisa de expresiones permitidas para inyectar en el prompt de Gemini."""
        allowed = CulturalExpression.query.filter_by(safety_level='ALLOWED', active=True, can_use=True).limit(25).all()
        terms_list = [f"{e.term} ({e.meaning})" for e in allowed]
        return ", ".join(terms_list)

    @classmethod
    def detect_inquiry_about_expression(cls, user_message):
        """
        Detecta si el usuario está preguntando específicamente por el significado de un guatemaltequismo.
        Ej: '¿Qué significa cabal?', 'qué quiere decir pisto', 'qué es chilero?'
        """
        msg_clean = user_message.lower().strip()
        pattern = r'(?:qué|que)\s+(?:significa|quiere\s+decir|es)\s+["\'«]?(.*?)["\'»\?\.]?$'
        match = re.search(pattern, msg_clean)
        if match:
            candidate = match.group(1).strip()
            # Limpiar signos
            candidate = re.sub(r'[^\w\s]', '', candidate).strip()
            expr = CulturalExpression.query.filter(
                db.func.lower(CulturalExpression.term) == candidate.lower(),
                CulturalExpression.active == True
            ).first()
            if expr:
                return expr
        return None

    @classmethod
    def format_explanation_response(cls, expr):
        """Genera una explicación respetuosa y contextualizada del término solicitado."""
        if expr.safety_level == 'ALLOWED':
            return (
                f"En Guatemala usamos '{expr.term}' para expresar: **{expr.meaning}**\n\n"
                f"💡 **Ejemplo de uso:** *\"{expr.example}\"*\n\n"
                f"Es una expresión coloquial cotidiana muy común y amigable en nuestra cultura chapina. 🇬🇹"
            )
        elif expr.safety_level == 'EXPLAINABLE':
            return (
                f"En el habla coloquial guatemalteca, '{expr.term}' se refiere a: **{expr.meaning}**\n\n"
                f"⚠️ **Nota de contexto:** Es una expresión informal que puede sonar algo ruda o fuera de lugar dependiendo de la situación. "
                f"Por esa razón, en EquilibrIA no la utilizamos para dirigirnos a las personas."
            )
        else: # RESTRICTED
            return (
                f"'{expr.term}' es un modismo o vulgaridad popular en Guatemala que describe: *{expr.meaning}*\n\n"
                f"🛡️ **Nota de respeto:** Debido a su naturaleza vulgar u ofensiva, en EquilibrIA cuidamos la dignidad y el respeto en todo momento, "
                f"por lo que evitamos utilizar este tipo de expresiones en nuestras conversaciones."
            )

    @classmethod
    def contains_restricted_language(cls, text):
        """Verifica si un texto contiene términos catalogados como restringidos."""
        text_lower = text.lower()
        restricted_terms = [e.term for e in CulturalExpression.query.filter_by(safety_level='RESTRICTED', active=True).all()]
        for t in restricted_terms:
            if re.search(rf'\b{re.escape(t)}\b', text_lower):
                return True
        return False
