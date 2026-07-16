import os
import json
from google import genai
from google.genai import types

class GeminiService:
    @staticmethod
    def analyze_text(text):
        """
        Analiza el bienestar emocional de un texto usando Gemini 2.5 Flash.
        Si la API Key no está configurada, utiliza un procesador simulado para desarrollo.
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            print("WARNING: Usando respuestas simuladas (Mock) porque GEMINI_API_KEY no está configurada.")
            return GeminiService._mock_response(text)
            
        try:
            # Inicializar cliente de Gemini usando el SDK oficial (google-genai)
            client = genai.Client(api_key=api_key)
            
            prompt = (
                "Analiza el siguiente texto redactado por un miembro de una organización o institución. "
                "Extrae métricas cuantitativas y cualitativas de su estado emocional. "
                "Devuelve la respuesta estrictamente en formato JSON válido con los siguientes campos:\n"
                "{\n"
                "  \"stress_score\": <entero de 0 a 100 que representa el nivel de estrés>,\n"
                "  \"motivation_score\": <entero de 0 a 100 que representa el nivel de motivación>,\n"
                "  \"burnout_score\": <entero de 0 a 100 que representa el nivel de agotamiento o burnout>,\n"
                "  \"dominant_sentiment\": <\"Positivo\" | \"Neutro\" | \"Negativo\">,\n"
                "  \"institution_suggestion\": <\"Sugerencia organizacional corta redactada en español, indicando acciones preventivas o formativas colectivas sin diagnósticos clínicos\">\n"
                "}\n\n"
                "Texto a analizar:\n"
                f"\"{text}\"\n\n"
                "REGLAS IMPORTANTES:\n"
                "1. NO realices diagnósticos clínicos ni médicos.\n"
                "2. NO utilices nombres de trastornos psicológicos o psiquiátricos (depresión, ansiedad clínica, etc.).\n"
                "3. La sugerencia debe enfocarse en mejorar el entorno colectivo institucional y el soporte de bienestar."
            )
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            
            # Parsear respuesta JSON de la API
            data = json.loads(response.text)
            
            # Saneamiento y validación de tipos
            return {
                'stress_score': max(0, min(100, int(data.get('stress_score', 50)))),
                'motivation_score': max(0, min(100, int(data.get('motivation_score', 50)))),
                'burnout_score': max(0, min(100, int(data.get('burnout_score', 50)))),
                'dominant_sentiment': data.get('dominant_sentiment', 'Neutro'),
                'institution_suggestion': data.get('institution_suggestion', 'Mantener canales de comunicación activa.')
            }
            
        except Exception as e:
            print(f"Error llamando a Gemini API: {str(e)}")
            return GeminiService._mock_response(text)

    @staticmethod
    def _mock_response(text):
        """
        Generador simulado para pruebas locales sin costo ni claves de API.
        """
        text_lower = text.lower()
        
        stress = 30
        motivation = 70
        burnout = 20
        sentiment = "Positivo"
        suggestion = "Promover pausas activas y talleres de organización del tiempo para consolidar el bienestar."
        
        # Análisis simple por palabras clave para simular reactividad
        if any(w in text_lower for w in ["cansado", "cansada", "agotado", "agotada", "sueño", "fatiga", "abrumado", "abrumada"]):
            burnout += 45
            stress += 20
            motivation -= 25
            
        if any(w in text_lower for w in ["estres", "estrés", "presión", "parciales", "exámenes", "entregas", "apurado", "apurada"]):
            stress += 50
            burnout += 15
            motivation -= 10
            
        if any(w in text_lower for w in ["triste", "mal", "llorar", "solo", "sola", "decepcionado", "enojado", "enojada"]):
            sentiment = "Negativo"
            stress += 25
            motivation -= 35
            suggestion = "Ofrecer espacios interactivos de escucha activa y apoyo emocional grupal."
            
        if any(w in text_lower for w in ["feliz", "bien", "excelente", "motivado", "motivada", "logré", "contento", "contenta"]):
            sentiment = "Positivo"
            motivation += 25
            stress -= 15
            
        # Limitar resultados entre 0 y 100
        stress = max(0, min(100, stress))
        motivation = max(0, min(100, motivation))
        burnout = max(0, min(100, burnout))
        
        if stress > 60 or burnout > 60:
            if sentiment != "Negativo":
                sentiment = "Neutro"
            suggestion = "Monitorear las cargas de tareas académicas y laborales de la semana para evitar picos de fatiga."
            
        return {
            'stress_score': stress,
            'motivation_score': motivation,
            'burnout_score': burnout,
            'dominant_sentiment': sentiment,
            'institution_suggestion': suggestion
        }

    @staticmethod
    def get_chat_response(history_text, user_message):
        """
        Genera una respuesta conversacional de apoyo emocional basándose en el historial de reflexiones del usuario.
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            print("WARNING: Usando chat simulado (Mock) porque GEMINI_API_KEY no está configurada.")
            return GeminiService._mock_chat_response(history_text, user_message)
            
        try:
            # Inicializar cliente de Gemini
            client = genai.Client(api_key=api_key)
            
            prompt = (
                "Actúas como un Asistente Emocional Virtual enfocado en el bienestar y el autocuidado. "
                "Tu objetivo es entablar una conversación constructiva, empática y de apoyo. "
                "\n"
                "CONTEXTO DEL USUARIO:\n"
                f"Historial de estados de ánimo o reflexiones recientes: {history_text}\n"
                "\n"
                "MENSAJE ACTUAL DEL USUARIO:\n"
                f"\"{user_message}\"\n"
                "\n"
                "INSTRUCCIONES CLAVE:\n"
                "1. Sé empático, cálido y ofrece consejos prácticos de manejo del estrés, organización o inteligencia emocional.\n"
                "2. NO realices diagnósticos clínicos, no recetes medicamentos, ni uses terminología psiquiátrica formal.\n"
                "3. Mantén tus respuestas en un tono amigable, en español, y con una longitud máxima de 3 párrafos cortos.\n"
                "4. Si el usuario te hace preguntas no relacionadas con su bienestar o tareas, guíalo amablemente de vuelta al tema."
            )
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            
            return response.text
            
        except Exception as e:
            print(f"Error llamando a Gemini Chat: {str(e)}")
            return GeminiService._mock_chat_response(history_text, user_message)

    @staticmethod
    def _mock_chat_response(history_text, user_message):
        msg_lower = user_message.lower()
        
        reply = (
            "¡Hola! Gracias por compartir esto conmigo. Es fundamental tener un espacio para expresar lo que sentimos. "
            "Revisando tus reflexiones, veo que estás enfrentando retos diarios de estudio o trabajo. "
            "Te sugiero planificar tu jornada dividiendo tus metas en pequeños pasos de 25 minutos (técnica Pomodoro) "
            "y no dudar en tomar descansos cortos para estirarte y tomar agua. Estoy aquí para acompañarte."
        )
        
        if any(w in msg_lower for w in ["triste", "mal", "siento solo", "sola", "deprimido", "deprimida"]):
            reply = (
                "Lamento mucho escuchar que te sientes así hoy. Sentirse de esta manera es completamente válido, "
                "y a veces el primer paso es simplemente reconocerlo. Recuerda que no tienes que pasar por esto a solas; "
                "siempre puedes acudir a los canales de apoyo de tu institución o conversar con alguien de confianza. "
                "Intenta hacer algo pequeño que disfrutes hoy, como escuchar tu canción favorita o dar una caminata breve."
            )
        elif any(w in msg_lower for w in ["estres", "estrés", "examen", "parcial", "tarea", "presion", "presión", "trabajo", "cansado", "cansada"]):
            reply = (
                "Entiendo perfectamente esa sensación de presión y cansancio. Las temporadas de entregas o exámenes suelen ser agotadoras. "
                "Intenta hacer una lista de tus tres tareas prioritarias para hoy y enfócate únicamente en ellas. "
                "Recuerda también programar descansos conscientes: alejarte de las pantallas por 10 minutos puede devolverte claridad mental."
            )
        elif any(w in msg_lower for w in ["gracias", "adios", "hola"]):
            reply = (
                "¡Hola! De nada, es un gusto poder acompañarte. Recuerda que este espacio es para ti. "
                "¿Hay algún tema específico sobre tu bienestar, organización o manejo de tareas que te gustaría conversar hoy?"
            )
            
        return reply
