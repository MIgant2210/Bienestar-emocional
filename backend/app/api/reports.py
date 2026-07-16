from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import db
from app.models.reflection import Reflection
from app.models.alert import Alert
from app.models.user import User
from app.utils.decorators import token_required, roles_accepted

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/export', methods=['GET'])
@token_required
@roles_accepted('admin_institucion', 'superadmin')
def export_aggregate_data(current_user):
    """
    Retorna los datos consolidados agregados de la institución listos para ser exportados como CSV o PDF por el frontend.
    Respeta el anonimato ya que solo incluye promedios y recuentos consolidados.
    """
    institution_id = current_user.institution_id
    if not institution_id:
        return jsonify({'message': 'Se requiere una institución vinculada.'}), 400
        
    # Averages
    averages = db.session.query(
        func.avg(Reflection.stress_score).label('avg_stress'),
        func.avg(Reflection.motivation_score).label('avg_motivation'),
        func.avg(Reflection.burnout_score).label('avg_burnout'),
        func.count(Reflection.id).label('total_reflections')
    ).filter(Reflection.institution_id == institution_id).first()
    
    # Sentiments
    sentiment_distribution = db.session.query(
        Reflection.dominant_sentiment,
        func.count(Reflection.id).label('count')
    ).filter(Reflection.institution_id == institution_id).group_by(Reflection.dominant_sentiment).all()
    
    sentiment_data = {'Positivo': 0, 'Neutro': 0, 'Negativo': 0}
    for item in sentiment_distribution:
        sentiment_data[item.dominant_sentiment] = item.count
        
    # Alerts Count
    total_alerts = Alert.query.filter_by(institution_id=institution_id).count()
    attended_alerts = Alert.query.filter_by(institution_id=institution_id, status='atendida').count()
    pending_alerts = total_alerts - attended_alerts
    
    # Members
    total_members = User.query.filter_by(institution_id=institution_id, role='miembro').count()
    
    export_payload = {
        'institucion': current_user.institution.name if current_user.institution else "Demo",
        'fecha_generacion': func.now(), # SQLAlchemy helper or standard ISO string
        'metricas_clave': {
            'estres_promedio_percent': round(float(averages.avg_stress), 1) if averages.avg_stress else 0,
            'motivacion_promedio_percent': round(float(averages.avg_motivation), 1) if averages.avg_motivation else 0,
            'burnout_promedio_percent': round(float(averages.avg_burnout), 1) if averages.avg_burnout else 0,
            'total_reflexiones_registradas': averages.total_reflections or 0
        },
        'sentimientos': sentiment_data,
        'alertas': {
            'totales': total_alerts,
            'pendientes': pending_alerts,
            'atendidas': attended_alerts
        },
        'usuarios': {
            'total_miembros': total_members
        }
    }
    
    return jsonify(export_payload), 200
