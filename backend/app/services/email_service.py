import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class EmailService:
    """
    Servicio centralizado de envío de correos electrónicos institucionales para EquilibrIA.
    Soporta SMTP estándar (STARTTLS / SSL) y genera plantillas HTML responsive
    con la identidad visual de EquilibrIA (Morado #6366F1, Naranja #FF7A00).
    En caso de no contar con credenciales SMTP en entornos de desarrollo local,
    registra de forma segura el mensaje y el enlace en los logs para facilitar pruebas.
    """

    @classmethod
    def get_smtp_config(cls):
        host = os.environ.get('SMTP_HOST', os.environ.get('SMTP_SERVER', '')).strip()
        port_raw = os.environ.get('SMTP_PORT', '587').strip()
        try:
            port = int(port_raw)
        except ValueError:
            port = 587
        user = os.environ.get('SMTP_USER', os.environ.get('SMTP_USERNAME', '')).strip()
        password = os.environ.get('SMTP_PASSWORD', '').strip()
        from_email = os.environ.get('SMTP_FROM', os.environ.get('SMTP_FROM_EMAIL', user or 'no-reply@equilibria.bienestar.com')).strip()
        from_name = os.environ.get('SMTP_FROM_NAME', 'EquilibrIA Bienestar').strip()
        use_tls = os.environ.get('SMTP_USE_TLS', 'true').lower() in ['true', '1', 'yes']
        use_ssl = os.environ.get('SMTP_USE_SSL', 'false').lower() in ['true', '1', 'yes'] or port == 465

        return {
            'server': host,
            'port': port,
            'username': user,
            'password': password,
            'from_email': from_email,
            'from_name': from_name,
            'use_tls': use_tls,
            'use_ssl': use_ssl,
            'frontend_url': os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        }

    @classmethod
    def is_smtp_configured(cls):
        cfg = cls.get_smtp_config()
        return bool(cfg['server'] and cfg['username'] and cfg['password'])

    @classmethod
    def send_email(cls, to_email, subject, html_content, text_content=None):
        """
        Envía un correo electrónico multipart (HTML + Texto plano).
        Retorna (True, None) si el envío fue exitoso, o (False, error_msg) en caso de fallo.
        """
        config = cls.get_smtp_config()
        
        # Validar si SMTP está configurado
        if not config['server'] or not config['username'] or not config['password']:
            logger.warning(
                f"[EMAIL SERVICE] Servidor SMTP no configurado en .env. "
                f"Destinatario: {to_email} | Asunto: '{subject}'"
            )
            return True, "Email registrado (SMTP no configurado)."

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"
            msg['To'] = to_email

            if text_content:
                part_text = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part_text)

            part_html = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(part_html)

            server_port = config['port']
            if server_port == 465:
                # Conexión SSL directa
                with smtplib.SMTP_SSL(config['server'], server_port, timeout=15) as server:
                    server.login(config['username'], config['password'])
                    server.sendmail(config['from_email'], [to_email], msg.as_string())
            else:
                # Conexión STARTTLS (puerto 587 o estándar)
                with smtplib.SMTP(config['server'], server_port, timeout=15) as server:
                    if config['use_tls']:
                        server.starttls()
                    server.login(config['username'], config['password'])
                    server.sendmail(config['from_email'], [to_email], msg.as_string())

            logger.info(f"Correo enviado exitosamente a {to_email} con asunto '{subject}'.")
            return True, None
        except Exception as e:
            err_msg = f"Error al enviar correo SMTP a {to_email}: {str(e)}"
            logger.error(err_msg)
            print(f"[EMAIL ERROR] {err_msg}")
            return False, err_msg

    @classmethod
    def _build_html_template(cls, title, preheader, body_content, button_text=None, button_url=None, footer_note=None):
        """
        Construye una plantilla HTML responsiva, institucional y elegante para EquilibrIA.
        """
        button_html = ""
        if button_text and button_url:
            button_html = f"""
            <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                    <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
                        <a href="{button_url}" target="_blank" style="font-size: 14px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block;">
                            {button_text} &rarr;
                        </a>
                    </td>
                </tr>
            </table>
            """

        footer_text = footer_note or "Si tú no solicitaste esta acción, puedes ignorar este mensaje de forma segura. Tu cuenta permanece protegida."

        return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
    <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        {preheader}
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 15px;">
        <tr>
            <td align="center">
                <!-- Main Container Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    <!-- Header with Gradient Bar & Logo -->
                    <tr>
                        <td style="height: 6px; background: linear-gradient(90deg, #6366F1 0%, #FF7A00 100%);"></td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 36px 20px 36px; text-align: center;">
                            <div style="display: inline-block; padding: 10px 18px; border-radius: 50px; background-color: #EEF2FF; margin-bottom: 12px;">
                                <span style="font-size: 15px; font-weight: 800; color: #4F46E5; letter-spacing: -0.3px;">
                                    🧠 EquilibrIA
                                </span>
                            </div>
                            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
                                {title}
                            </h1>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">
                                Sistema Inteligente de Análisis del Bienestar Emocional
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 10px 36px 30px 36px; font-size: 14.5px; line-height: 1.65; color: #334155;">
                            {body_content}
                            {button_html}
                            <div style="background-color: #F1F5F9; border-radius: 12px; padding: 14px 18px; font-size: 12.5px; color: #64748B; margin-top: 24px; border-left: 4px solid #6366F1;">
                                🔒 <strong>Aviso de Seguridad:</strong> {footer_text}
                            </div>
                        </td>
                    </tr>

                    <!-- Institutional Footer -->
                    <tr>
                        <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 36px; text-align: center; font-size: 11.5px; color: #94A3B8; line-height: 1.5;">
                            <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748B;">
                                EquilibrIA &bull; Plataforma Universitaria e Institucional de Salud Emocional
                            </p>
                            <p style="margin: 0;">
                                Mensaje automático confidencial. Por favor no responder directamente a este correo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    @classmethod
    def send_password_reset_email(cls, to_email, user_name, reset_url):
        """
        Envía el correo oficial para el restablecimiento de contraseña.
        """
        subject = "Recuperación de Contraseña — EquilibrIA"
        preheader = "Restablece la contraseña de tu cuenta institucional en EquilibrIA."
        
        body_content = f"""
        <p style="margin-top: 0;">Hola <strong>{user_name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta institucional en <strong>EquilibrIA</strong>.</p>
        <p>Para crear una nueva contraseña segura y recuperar el acceso a tu espacio de bienestar, haz clic en el siguiente botón:</p>
        """

        footer_note = "Este enlace es de uso único y tiene una validez de <strong>1 hora</strong> por motivos de seguridad. Si tú no solicitaste este cambio, puedes ignorar este mensaje con total tranquilidad."

        text_content = f"""Hola {user_name},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en EquilibrIA.
Para crear una nueva contraseña, ingresa al siguiente enlace seguro:

{reset_url}

Este enlace expirará en 1 hora y solo puede utilizarse una vez.
Si tú no realizaste esta solicitud, puedes ignorar este correo de forma segura.

Atentamente,
Equipo de Soporte y Seguridad de EquilibrIA
"""

        html_content = cls._build_html_template(
            title="Recuperar Contraseña",
            preheader=preheader,
            body_content=body_content,
            button_text="Restablecer mi Contraseña",
            button_url=reset_url,
            footer_note=footer_note
        )

        return cls.send_email(to_email, subject, html_content, text_content)

    @classmethod
    def send_password_changed_email(cls, to_email, user_name):
        """
        Envía notificación de seguridad cuando la contraseña ha sido actualizada con éxito.
        """
        subject = "Seguridad: Tu contraseña ha sido actualizada — EquilibrIA"
        preheader = "Confirmación de cambio de contraseña exitoso en tu cuenta de EquilibrIA."
        config = cls.get_smtp_config()
        login_url = f"{config['frontend_url']}/login"

        body_content = f"""
        <p style="margin-top: 0;">Hola <strong>{user_name}</strong>,</p>
        <p>Te confirmamos que la contraseña de tu cuenta en <strong>EquilibrIA</strong> fue modificada y actualizada exitosamente.</p>
        <p>A partir de este momento, todas tus sesiones previas han sido aseguradas y puedes iniciar sesión con tu nueva contraseña.</p>
        """

        footer_note = "Si no reconoces este cambio o sospechas de actividad no autorizada, comunícate de inmediato con el Administrador o profesional de apoyo de tu institución."

        text_content = f"""Hola {user_name},

Te confirmamos que la contraseña de tu cuenta en EquilibrIA ha sido actualizada exitosamente.
Puedes acceder a tu espacio de bienestar en: {login_url}

Si tú no realizaste este cambio, comunícate de inmediato con la administración de tu institución.

Atentamente,
Equipo de Seguridad de EquilibrIA
"""

        html_content = cls._build_html_template(
            title="Contraseña Actualizada",
            preheader=preheader,
            body_content=body_content,
            button_text="Iniciar Sesión",
            button_url=login_url,
            footer_note=footer_note
        )

        return cls.send_email(to_email, subject, html_content, text_content)

    @classmethod
    def send_welcome_email(cls, to_email, user_name, verification_url=None):
        """
        Envía correo de bienvenida tras registrarse en EquilibrIA.
        """
        subject = "¡Bienvenido a EquilibrIA! — Tu espacio de bienestar emocional"
        preheader = "Tu cuenta en EquilibrIA ha sido creada con éxito."
        config = cls.get_smtp_config()
        login_url = verification_url or f"{config['frontend_url']}/login"

        body_content = f"""
        <p style="margin-top: 0;">Hola <strong>{user_name}</strong>,</p>
        <p>¡Te damos una cálida bienvenida a <strong>EquilibrIA</strong>! Tu plataforma integral para el seguimiento emocional, desarrollo de hábitos saludables y acompañamiento institucional.</p>
        <p>Aquí podrás realizar pausas activas, reflexionar sobre tu jornada, completar chequeos de bienestar y recibir orientación oportuna.</p>
        """

        text_content = f"""Hola {user_name},

¡Bienvenido a EquilibrIA! Tu espacio institucional de bienestar y acompañamiento emocional.
Para acceder a tu cuenta ingresa a: {login_url}

Atentamente,
Equipo de EquilibrIA
"""

        html_content = cls._build_html_template(
            title="¡Bienvenido a EquilibrIA!",
            preheader=preheader,
            body_content=body_content,
            button_text="Comenzar mi Experiencia",
            button_url=login_url
        )

        return cls.send_email(to_email, subject, html_content, text_content)
