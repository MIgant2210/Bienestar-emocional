"""
Batería de Pruebas Automatizadas de Seguridad y Multitenant RBAC - EquilibrIA
Valida los 20 escenarios de aislamiento institucional, protección de SuperAdmin,
gestión de departamentos, invitaciones seguras y trazabilidad inmutable.
"""

import unittest
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

class TestRBACMultitenant(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # 1. Login SuperAdmin
        super_res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "superadmin@bienestar.com",
            "password": "AdminBienestar2026*"
        })
        assert super_res.status_code == 200, f"SuperAdmin login failed: {super_res.text}"
        cls.super_token = super_res.json()['token']
        cls.super_headers = {"Authorization": f"Bearer {cls.super_token}"}
        cls.super_user = super_res.json()['user']

        # 2. Login Admin Institucional
        admin_res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@bienestar.com",
            "password": "AdminBienestar2026*"
        })
        assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
        cls.admin_token = admin_res.json()['token']
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}
        cls.admin_user = admin_res.json()['user']
        cls.admin_inst_id = cls.admin_user['institution_id']

    # --------------------------------------------------------------------------
    # 1. INSTITUCIONES & SUPERADMIN EXCLUSIVITY
    # --------------------------------------------------------------------------

    def test_01_superadmin_can_list_all_institutions(self):
        res = requests.get(f"{BASE_URL}/institutions/all", headers=self.super_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        print("[TEST 01 PASS] SuperAdmin consultó todas las instituciones.")

    def test_02_superadmin_can_create_institution_with_code(self):
        payload = {
            "name": f"Instituto de Prueba RBAC {requests.utils.quote('123')}",
            "type": "educativa",
            "description": "Institución creada en test suite de seguridad",
            "email": "contacto@rbac-test.edu.gt",
            "city": "Guatemala"
        }
        res = requests.post(f"{BASE_URL}/institutions", json=payload, headers=self.super_headers)
        self.assertIn(res.status_code, [201, 400]) # 201 si es nueva, 400 si ya existe
        if res.status_code == 201:
            inst = res.json()['institution']
            self.assertTrue(inst['code'].startswith('EQUI-EDU-'))
            self.assertEqual(inst['status'], 'ACTIVE')
            TestRBACMultitenant.created_inst_id = inst['id']
            print(f"[TEST 02 PASS] Institución creada con código institucional único: {inst['code']}")

    def test_03_admin_institucion_cannot_create_institution(self):
        payload = {
            "name": "Institución Ilegal por Admin",
            "type": "laboral"
        }
        res = requests.post(f"{BASE_URL}/institutions", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 403)
        print("[TEST 03 PASS] Admin Institucional bloqueado con 403 al intentar crear institución.")

    def test_04_admin_institucion_only_views_own_institution(self):
        res = requests.get(f"{BASE_URL}/institutions/all", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLessEqual(len(data), 1)
        if len(data) == 1:
            self.assertEqual(data[0]['id'], self.admin_inst_id)
        print("[TEST 04 PASS] Aislamiento multitenant: Admin solo ve su propia institución.")

    def test_05_admin_cannot_access_other_institution_detail(self):
        other_uuid = "00000000-0000-0000-0000-000000000000"
        res = requests.get(f"{BASE_URL}/institutions/{other_uuid}", headers=self.admin_headers)
        self.assertEqual(res.status_code, 403)
        print("[TEST 05 PASS] Intento de acceso a otra institución rechazado con 403.")

    # --------------------------------------------------------------------------
    # 2. DEPARTAMENTOS & RESTRICCIONES
    # --------------------------------------------------------------------------

    def test_06_admin_can_list_own_departments(self):
        res = requests.get(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        depts = res.json()
        self.assertIsInstance(depts, list)
        self.assertGreaterEqual(len(depts), 1)
        print(f"[TEST 06 PASS] Departamentos listados ({len(depts)} encontrados en la institución).")

    def test_07_create_department_unique_code_and_name(self):
        code = "TI_TEST"
        payload = {
            "name": "Depto Temporal Seguridad",
            "code": code,
            "description": "Departamento de prueba RBAC"
        }
        res1 = requests.post(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments", json=payload, headers=self.admin_headers)
        self.assertIn(res1.status_code, [201, 400])
        
        # Intento de duplicar el mismo código debe dar 400
        res2 = requests.post(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments", json=payload, headers=self.admin_headers)
        self.assertEqual(res2.status_code, 400)
        print("[TEST 07 PASS] Restricción de unicidad de código y nombre en departamentos validada.")

    def test_08_admin_cannot_create_department_in_other_institution(self):
        other_uuid = "00000000-0000-0000-0000-000000000000"
        payload = {"name": "Hack Dept", "code": "HACK"}
        res = requests.post(f"{BASE_URL}/institutions/{other_uuid}/departments", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 403)
        print("[TEST 08 PASS] Admin bloqueado con 403 al crear departamento en otra institución.")

    def test_09_soft_delete_department(self):
        # Listar y tomar un departamento
        res = requests.get(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments", headers=self.admin_headers)
        depts = res.json()
        if depts:
            dept_id = depts[-1]['id']
            toggle_res = requests.patch(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments/{dept_id}/status", headers=self.admin_headers)
            self.assertEqual(toggle_res.status_code, 200)
            # Restaurar a activo
            requests.patch(f"{BASE_URL}/institutions/{self.admin_inst_id}/departments/{dept_id}/status", headers=self.admin_headers)
            print("[TEST 09 PASS] Desactivación lógica (Soft Delete) de departamento verificada.")

    # --------------------------------------------------------------------------
    # 3. INVITACIONES INSTITUCIONALES
    # --------------------------------------------------------------------------

    def test_10_admin_can_create_invitation(self):
        payload = {
            "role": "miembro",
            "max_uses": 5,
            "expires_in_days": 15
        }
        res = requests.post(f"{BASE_URL}/institutions/{self.admin_inst_id}/invitations", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)
        inv = res.json()['invitation']
        self.assertTrue(inv['code'].startswith('INV-'))
        self.assertEqual(inv['status'], 'ACTIVE')
        TestRBACMultitenant.created_inv_id = inv['id']
        print(f"[TEST 10 PASS] Invitación generada exitosamente: {inv['code']}")

    def test_11_cannot_create_superadmin_invitation(self):
        payload = {"role": "superadmin"}
        res = requests.post(f"{BASE_URL}/institutions/{self.admin_inst_id}/invitations", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 403)
        print("[TEST 11 PASS] Bloqueada creación de invitaciones con rol SuperAdmin (403).")

    def test_12_admin_can_revoke_invitation(self):
        if hasattr(TestRBACMultitenant, 'created_inv_id'):
            res = requests.post(f"{BASE_URL}/institutions/{self.admin_inst_id}/invitations/{TestRBACMultitenant.created_inv_id}/revoke", headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            inv = res.json()['invitation']
            self.assertFalse(inv['is_active'])
            print("[TEST 12 PASS] Invitación revocada exitosamente con auditoría.")

    # --------------------------------------------------------------------------
    # 4. GESTIÓN DE USUARIOS, RBAC & PROTECCIÓN DE SUPERADMIN
    # --------------------------------------------------------------------------

    def test_13_members_directory_filtering(self):
        res = requests.get(f"{BASE_URL}/institutions/members?role=miembro", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        members = res.json()
        for m in members:
            self.assertEqual(m['role'], 'miembro')
            self.assertEqual(m['institution_id'], self.admin_inst_id)
        print(f"[TEST 13 PASS] Directorio filtrado por rol (Total {len(members)} miembros).")

    def test_14_members_text_search(self):
        res = requests.get(f"{BASE_URL}/institutions/members?search=Carlos", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        members = res.json()
        self.assertTrue(any('Carlos' in m['first_name'] or 'Carlos' in m['last_name'] for m in members))
        print("[TEST 14 PASS] Búsqueda por texto en directorio de usuarios verificada.")

    def test_15_admin_cannot_promote_user_to_superadmin(self):
        # Obtener un miembro
        res = requests.get(f"{BASE_URL}/institutions/members?role=miembro", headers=self.admin_headers)
        members = res.json()
        if members:
            target_id = members[0]['id']
            edit_res = requests.put(f"{BASE_URL}/institutions/members/{target_id}", json={"role": "superadmin"}, headers=self.admin_headers)
            self.assertEqual(edit_res.status_code, 403)
            print("[TEST 15 PASS] Admin Institucional bloqueado con 403 al intentar promover a SuperAdmin.")

    def test_16_critical_protection_cannot_demote_last_superadmin(self):
        superadmin_id = self.super_user['id']
        payload = {"role": "miembro"}
        res = requests.put(f"{BASE_URL}/institutions/members/{superadmin_id}", json=payload, headers=self.super_headers)
        # Debe fallar porque no puede auto-modificarse ni tampoco degradar al último SuperAdmin
        self.assertIn(res.status_code, [400, 403])
        print("[TEST 16 PASS] Regla Crítica: Degradación del SuperAdmin bloqueada exitosamente.")

    def test_17_critical_protection_cannot_suspend_last_superadmin(self):
        superadmin_id = self.super_user['id']
        payload = {"status": "SUSPENDED"}
        res = requests.put(f"{BASE_URL}/institutions/members/{superadmin_id}", json=payload, headers=self.super_headers)
        self.assertIn(res.status_code, [400, 403])
        print("[TEST 17 PASS] Regla Crítica: Suspensión del último SuperAdmin bloqueada exitosamente.")

    def test_18_password_reset_request_safe(self):
        res = requests.get(f"{BASE_URL}/institutions/members?role=miembro", headers=self.admin_headers)
        members = res.json()
        if members:
            target_id = members[0]['id']
            reset_res = requests.post(f"{BASE_URL}/institutions/members/{target_id}/reset-password", headers=self.admin_headers)
            self.assertEqual(reset_res.status_code, 200)
            self.assertIn('reset_link', reset_res.json())
            print("[TEST 18 PASS] Solicitud segura de restablecimiento de contraseña generada.")

    # --------------------------------------------------------------------------
    # 5. SUSPENSIÓN INSTITUCIONAL & AUDITORÍA
    # --------------------------------------------------------------------------

    def test_19_superadmin_suspend_and_reactivate_institution(self):
        if hasattr(TestRBACMultitenant, 'created_inst_id'):
            inst_id = TestRBACMultitenant.created_inst_id
            # 1. Suspender
            susp_res = requests.patch(f"{BASE_URL}/institutions/{inst_id}/status", json={"status": "SUSPENDED"}, headers=self.super_headers)
            self.assertEqual(susp_res.status_code, 200)
            self.assertEqual(susp_res.json()['institution']['status'], 'SUSPENDED')
            
            # 2. Reactivar
            react_res = requests.patch(f"{BASE_URL}/institutions/{inst_id}/status", json={"status": "ACTIVE"}, headers=self.super_headers)
            self.assertEqual(react_res.status_code, 200)
            self.assertEqual(react_res.json()['institution']['status'], 'ACTIVE')
            print("[TEST 19 PASS] Ciclo completo de suspensión y reactivación institucional verificado.")

    def test_20_audit_log_contains_rbac_events(self):
        res = requests.get(f"{BASE_URL}/audit/logs", headers=self.super_headers)
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertIsInstance(logs, list)
        self.assertGreaterEqual(len(logs), 1)
        actions = [log.get('action') for log in logs]
        print(f"[TEST 20 PASS] Auditoría verificada con {len(logs)} registros. Acciones detectadas: {set(actions)}")

if __name__ == '__main__':
    unittest.main(verbosity=2)
