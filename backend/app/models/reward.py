import uuid
from datetime import datetime
from app import db

class Reward(db.Model):
    __tablename__ = 'rewards'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cost_xp = db.Column(db.Integer, nullable=False, default=100)
    category = db.Column(db.String(50), nullable=False, default='Reconocimiento')
    icon = db.Column(db.String(10), nullable=False, default='🎁')
    institution_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'cost_xp': self.cost_xp,
            'category': self.category,
            'icon': self.icon,
            'institution_id': str(self.institution_id),
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat()
        }

class RewardRedemption(db.Model):
    __tablename__ = 'reward_redemptions'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reward_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('rewards.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='canjeado') # 'canjeado', 'entregado'
    redeemed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reward = db.relationship('Reward', lazy=True)
    user = db.relationship('User', lazy=True)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'user_name': f"{self.user.first_name} {self.user.last_name}" if self.user else "Usuario",
            'reward_id': str(self.reward_id),
            'reward_title': self.reward.title if self.reward else "Recompensa",
            'reward_icon': self.reward.icon if self.reward else "🎁",
            'cost_xp': self.reward.cost_xp if self.reward else 0,
            'status': self.status,
            'redeemed_at': self.redeemed_at.isoformat()
        }
