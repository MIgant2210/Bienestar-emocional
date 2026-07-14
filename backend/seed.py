from app import create_app, db
from app.models.institution import Institution
from app.models.user import User

app = create_app()

with app.app_context():
    print("Iniciando siembra de base de datos (Database Seeding)...")
    
    # 1. Crear tablas si no existen (en caso de no usar Flask-Migrate directamente)
    db.create_all()
    print("[Tablas] Creadas o validadas correctamente.")
    
    # 2. Crear instituciones de demostración
    inst_edu = Institution.query.filter_by(name="Universidad Nacional (Demo)").first()
    if not inst_edu:
        inst_edu = Institution(name="Universidad Nacional (Demo)", type="educativa")
        db.session.add(inst_edu)
        print("[Institución] Creada: Universidad Nacional (Demo)")
        
    inst_lab = Institution.query.filter_by(name="Tecnologías del Futuro S.A.").first()
    if not inst_lab:
        inst_lab = Institution(name="Tecnologías del Futuro S.A.", type="laboral")
        db.session.add(inst_lab)
        print("[Institución] Creada: Tecnologías del Futuro S.A.")
        
    db.session.commit()
    
    # 3. Crear Super Administrador
    admin_email = "superadmin@bienestar.com"
    super_admin = User.query.filter_by(email=admin_email).first()
    if not super_admin:
        super_admin = User(
            email=admin_email,
            first_name="Administrador",
            last_name="General",
            role="superadmin"
        )
        super_admin.set_password("AdminBienestar2026*")
        db.session.add(super_admin)
        db.session.commit()
        print(f"[Usuario] Superadmin creado exitosamente.")
        print(f"  Correo: {admin_email}")
        print(f"  Contraseña: AdminBienestar2026*")
    else:
        print("[Usuario] El Superadmin ya existe en la base de datos.")
        
    print("\n[ÉXITO] ¡Siembra de base de datos completada!")
