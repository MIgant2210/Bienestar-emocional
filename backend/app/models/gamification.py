import uuid
from datetime import datetime
from app import db

class XpTransaction(db.Model):
    __tablename__ = 'xp_transactions'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    action_type = db.Column(db.String(60), nullable=False)
    xp_amount = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    reference_id = db.Column(db.String(100), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('xp_transactions', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'action_type': self.action_type,
            'xp_amount': self.xp_amount,
            'description': self.description,
            'reference_id': self.reference_id,
            'created_at': self.created_at.isoformat()
        }

class UserActivityDay(db.Model):
    __tablename__ = 'user_activity_days'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    activity_date = db.Column(db.Date, nullable=False)
    activity_type = db.Column(db.String(60), nullable=False, default='participation')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'activity_date', name='uq_user_activity_day'),
    )
    
    user = db.relationship('User', backref=db.backref('activity_days', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'activity_date': self.activity_date.strftime('%Y-%m-%d'),
            'activity_type': self.activity_type,
            'created_at': self.created_at.isoformat()
        }

class Badge(db.Model):
    __tablename__ = 'badges'
    
    id = db.Column(db.String(50), primary_key=True) # e.g. 'primer_paso', 'constancia', 'compromiso', 'explorador', 'bienestar', 'inspiracion'
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), nullable=False, default='Award')
    color = db.Column(db.String(30), nullable=False, default='#8b5cf6')
    criterion_type = db.Column(db.String(60), nullable=False)
    criterion_value = db.Column(db.Integer, nullable=False, default=1)
    rarity = db.Column(db.String(30), nullable=False, default='Común')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'criterion_type': self.criterion_type,
            'criterion_value': self.criterion_value,
            'rarity': self.rarity
        }

class UserBadge(db.Model):
    __tablename__ = 'user_badges'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    badge_id = db.Column(db.String(50), db.ForeignKey('badges.id', ondelete='CASCADE'), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'badge_id', name='uq_user_badge'),
    )

    badge = db.relationship('Badge', lazy=True)
    user = db.relationship('User', backref=db.backref('user_badges', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'badge_id': self.badge_id,
            'badge': self.badge.to_dict() if self.badge else None,
            'unlocked_at': self.unlocked_at.isoformat()
        }

class XpRule(db.Model):
    __tablename__ = 'xp_rules'
    
    action_type = db.Column(db.String(60), primary_key=True)
    xp_amount = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        return {
            'action_type': self.action_type,
            'xp_amount': self.xp_amount,
            'description': self.description
        }
