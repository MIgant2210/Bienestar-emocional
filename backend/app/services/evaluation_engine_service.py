import re
import json

class EvaluationEngineService:
    """
    Motor de Evaluación Determinista de EquilibrIA.
    Calcula puntuaciones numéricas, dimensiones e indicadores mediante reglas y ponderaciones objetivas.
    Gemini NO determina estos puntajes; Gemini los recibe ya estructurados para su interpretación y orientación.
    """

    # Rangos de Clasificación de Niveles de Bienestar / Carga
    LEVEL_RANGES = {
        'BAJO': (0, 29),
        'MODERADO': (30, 49),
        'ATENCIÓN': (50, 69),
        'ELEVADO': (70, 84),
        'RIESGO': (85, 100)
    }

    @classmethod
    def get_level(cls, score):
        """Retorna el nivel estandarizado según el puntaje (0 a 100)."""
        score = max(0, min(100, int(score)))
        for level, (min_val, max_val) in cls.LEVEL_RANGES.items():
            if min_val <= score <= max_val:
                return level
        return 'MODERADO'

    @classmethod
    def evaluate_payload(cls, raw_text, evaluation=None):
        """
        Procesa el payload o texto de respuestas de una evaluación.
        Calcula dimensiones: estrés, motivación, agotamiento y bienestar general.
        """
        stress = 30
        motivation = 70
        burnout = 25
        wellbeing = 70
        sentiment = 'Neutro'
        detected_factors = []

        text_lower = (raw_text or '').lower()

        # 1. Análisis de Escalas Numéricas o Emojis en el texto formateado
        # Extraer pares P1 [Pregunta]: Respuesta
        matches = re.findall(r'P\d+\s*\[(.*?)\]:\s*(.*?)(?=\s*\|\s*P\d+|$)', raw_text, re.DOTALL)
        
        scale_values = []
        for q_title, ans_str in matches:
            ans_clean = ans_str.strip().lower()
            
            # Buscar valores 1-5 o 1-10
            num_match = re.search(r'\b(10|[1-9])\b', ans_clean)
            if num_match:
                val = int(num_match.group(1))
                scale_values.append(val)
                # Si la pregunta habla de sobrecarga o estrés
                if any(w in q_title.lower() for w in ['sobrecarga', 'presión', 'estrés', 'estres', 'tensión', 'cansancio', 'fatiga']):
                    if val >= 4:
                        stress += val * 7
                        burnout += val * 6
                        detected_factors.append(f"Alta sobrecarga reportada ({val}/5 o 10)")
                    elif val <= 2:
                        stress -= 10
                        burnout -= 10
                elif any(w in q_title.lower() for w in ['motivad', 'energía', 'ánimo', 'entusiasmo', 'metas']):
                    if val >= 4:
                        motivation += val * 6
                        wellbeing += 15
                    elif val <= 2:
                        motivation -= 20
                        wellbeing -= 15
                        detected_factors.append("Baja motivación reportada")

            # Buscar escala de emojis
            if '😡' in ans_clean or 'molesto' in ans_clean:
                stress += 25
                burnout += 20
                motivation -= 15
                detected_factors.append("Estado de ánimo tenso / molesto")
            elif '🙁' in ans_clean or 'agotado' in ans_clean:
                burnout += 30
                stress += 15
                motivation -= 15
                detected_factors.append("Fatiga acumulada reportada")
            elif '🙂' in ans_clean or 'tranquilo' in ans_clean:
                wellbeing += 15
                stress -= 10
            elif '😁' in ans_clean or 'excelente' in ans_clean:
                wellbeing += 25
                motivation += 20
                stress -= 15

        # 2. Análisis Semántico Cualitativo Complementario
        fatigue_keywords = ["cansado", "cansada", "agotado", "agotada", "sueño", "fatiga", "abrumado", "abrumada", "desvelado", "desvelada", "sin energía"]
        if any(w in text_lower for w in fatigue_keywords):
            burnout += 25
            stress += 15
            motivation -= 15
            detected_factors.append("Manifestación expresa de fatiga física o mental")

        stress_keywords = ["estres", "estrés", "presión", "presion", "parciales", "exámenes", "examenes", "entregas", "apurado", "apurada", "angustia", "sobrecarga"]
        if any(w in text_lower for w in stress_keywords):
            stress += 30
            burnout += 10
            detected_factors.append("Presión por carga académica o laboral")

        positive_keywords = ["feliz", "bien", "excelente", "motivado", "motivada", "tranquilo", "tranquila", "logré", "contento", "contenta", "satisfecho", "satisfecha", "ánimo", "buena onda"]
        if any(w in text_lower for w in positive_keywords):
            motivation += 20
            wellbeing += 20
            stress -= 15

        negative_keywords = ["triste", "mal", "llorar", "solo", "sola", "decepcionado", "decepcionada", "desesperado", "desesperada", "desánimo"]
        if any(w in text_lower for w in negative_keywords):
            stress += 20
            motivation -= 25
            wellbeing -= 25
            detected_factors.append("Sentimientos de desánimo o aislamiento")

        # 3. Normalización Matemática a Rangos 0-100
        stress_score = max(0, min(100, stress))
        motivation_score = max(0, min(100, motivation))
        burnout_score = max(0, min(100, burnout))
        wellbeing_score = max(0, min(100, int((motivation_score * 0.45) + ((100 - stress_score) * 0.3) + ((100 - burnout_score) * 0.25))))

        # Determinar Sentimiento Dominante
        if wellbeing_score >= 65 and stress_score < 50:
            sentiment = 'Positivo'
        elif stress_score >= 70 or burnout_score >= 70 or wellbeing_score < 40:
            sentiment = 'Negativo'
        else:
            sentiment = 'Neutro'

        # Clasificación de Niveles por Dimensión
        dimensions = {
            'stress': {
                'score': stress_score,
                'level': cls.get_level(stress_score),
                'label': 'Nivel de Estrés'
            },
            'motivation': {
                'score': motivation_score,
                'level': cls.get_level(motivation_score),
                'label': 'Nivel de Motivación'
            },
            'burnout': {
                'score': burnout_score,
                'level': cls.get_level(burnout_score),
                'label': 'Nivel de Agotamiento'
            },
            'wellbeing': {
                'score': wellbeing_score,
                'level': cls.get_level(wellbeing_score),
                'label': 'Bienestar Integral'
            }
        }

        # Nivel General del Test
        overall_level = cls.get_level(max(stress_score, burnout_score)) if (stress_score > 65 or burnout_score > 65) else cls.get_level(100 - wellbeing_score)

        return {
            'test_title': evaluation.title if evaluation else 'Evaluación de Bienestar',
            'test_category': evaluation.category if evaluation else 'Bienestar Integral',
            'overall_score': wellbeing_score,
            'overall_level': overall_level,
            'stress_score': stress_score,
            'motivation_score': motivation_score,
            'burnout_score': burnout_score,
            'wellbeing_score': wellbeing_score,
            'dominant_sentiment': sentiment,
            'dimensions': dimensions,
            'detected_factors': detected_factors
        }
