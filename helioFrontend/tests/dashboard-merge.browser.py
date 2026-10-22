"""Integration checks against 5187/5188 Vite servers. All API/socket traffic is mocked."""
import base64
import json
import re
import subprocess
import time
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

subject = 'a' * 24
checks = []


def token(role):
    encode = lambda value: base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip('=')
    return encode({'alg': 'HS256'}) + '.' + encode({'id': subject, 'role': 'clinicAdmin' if role == 'clinic' else role, 'exp': int(time.time()) + 3600}) + '.synthetic'


def fixture(role, search=''):
    code = "import {generateDashboardDemo} from './src/api/dashboardDemoData.js';console.log(JSON.stringify(generateDashboardDemo(JSON.parse(process.argv[1]))))"
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code, json.dumps(
        {'kind': role, 'subjectId': subject, 'search': search})], text=True))


clinics = fixture('doctor')['clinics']
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for demo, port in [(False, 5188), (True, 5187)]:
        context = browser.new_context(viewport={'width': 1900, 'height': 1100})
        page = context.new_page()
        errors, calls = [], []
        page.on('pageerror', lambda error: errors.append({'message': str(error), 'stack': error.stack, 'url': page.url}))
        page.on('console', lambda message: print('REACT ERROR:', message.text, flush=True) if message.type == 'error' and ('useEffect' in message.text or 'destroy' in message.text) else None)
        state = {'role': 'doctor', 'holdClinics': not demo, 'held': None}

        def intercept(route):
            url = urlparse(route.request.url)
            path, query = url.path, parse_qs(url.query)
            calls.append((path, query))
            role = state['role']
            if path.endswith('/login'):
                field = {'doctor': 'doctor', 'patient': 'user', 'clinic': 'clinic'}[role]
                route.fulfill(json={'accessToken': token(role), 'refreshToken': 'synthetic', field: {
                    '_id': subject, 'name': 'Dr. Integration Account' if role == 'doctor' else 'Integration Account',
                    'clinicName': 'Integration Clinic', 'specialization': 'Cardiology', 'email': 'integration@example.test'}})
            elif path == '/api/doctor-auth/clinics':
                if state['holdClinics']:
                    state['held'] = route
                    return
                route.fulfill(json={'success': True, 'clinics': [{'doctorId': subject, 'clinicId': clinic} for clinic in clinics]})
            elif path.startswith('/api/dashboard/'):
                route.fulfill(json=fixture(path.rsplit('/', 1)[-1], url.query))
            elif path.startswith('/api/queue/doctor/my-queue/'):
                route.fulfill(json={'success': True, 'entries': [{'_id': 'd' * 24, 'queueNumber': 3, 'status': 'waiting',
                    'appointmentId': {'_id': 'e' * 24, 'reason': 'Synthetic follow-up'}, 'userId': {'_id': 'b' * 24, 'name': 'Synthetic Queue Patient'},
                    'clinicId': {'_id': clinics[1]['_id'], 'clinicName': clinics[1]['clinicName']}, 'doctorId': subject}]})
            elif path == '/api/messages/conversations':
                route.fulfill(json={'conversations': [{'counterpart': clinic} for clinic in clinics]})
            elif path.startswith('/api/messages/'):
                route.fulfill(json={'success': True, 'messages': []})
            elif path == '/api/clinic/public':
                route.fulfill(json={'success': True, 'clinics': clinics})
            elif path.startswith('/api/clinic/public/'):
                route.fulfill(json={'success': True, 'clinic': clinics[0], 'doctors': []})
            else:
                route.fulfill(json={'success': True, 'appointments': [], 'prescriptions': [], 'entries': []})

        context.route(re.compile(r'^https?://[^/]+/api/'), intercept)
        context.route('**/socket.io/**', lambda route: route.abort())
        context.route('**/images.unsplash.com/**', lambda route: route.abort())
        context.add_init_script("localStorage.setItem('apiBase',location.origin)")
        base = f'http://127.0.0.1:{port}'

        def login(role):
            state['role'] = role
            page.goto(base + f'/{role}/signup?mode=login')
            page.locator('input[name=email]').fill('integration@example.test')
            page.locator('input[name=password]').fill('synthetic-password')
            page.get_by_role('button', name='Login', exact=True).click()
            expect(page).to_have_url(base + f'/{role}/dashboard')
            expect(page.locator('.weekly-chart-bar')).to_have_count(10)

        def select_second():
            page.locator('main').get_by_role('button').filter(has_text='General').first.click()
            page.get_by_role('button', name=clinics[1]['clinicName'], exact=True).click()

        login('doctor')
        if demo:
            # Local provider and dashboard use the same synthetic clinics; profile
            # also remains local while actual login identity is retained.
            page.locator('aside').first.get_by_text('Profile', exact=True).click()
            expect(page.locator('main')).to_contain_text('Dr. Integration Account')
            expect(page.locator('main')).to_contain_text('MBBS, MD (Demo)')
            assert not any(path in ['/api/doctor-auth/clinics', '/api/doctor-auth/me'] or path.startswith('/api/dashboard/') for path, _ in calls)
            assert page.evaluate("localStorage.getItem('doctorSelectedClinicId')") is None
            checks.append('demo provider/profile/dashboard use local data without API calls or persisting fictional clinic IDs')
        else:
            select_second()
            assert state['held'], 'Affiliation request must remain pending for the request-order regression'
            state['holdClinics'] = False
            state['held'].fulfill(json={'success': True, 'clinics': [{'doctorId': subject, 'clinicId': clinic} for clinic in clinics]})
            page.wait_for_function("id=>localStorage.getItem('doctorSelectedClinicId')===id", arg=clinics[1]['_id'])
            page.wait_for_timeout(150)
            assert any(path == '/api/dashboard/doctor' and query.get('clinicId') == [clinics[1]['_id']] for path, query in calls)
            checks.append('doctor selector updates shared clinic context even when dashboard response arrives before clinic affiliations')
            page.locator('main').get_by_role('button').filter(has_text=clinics[1]['clinicName']).first.click()
            page.get_by_role('button', name='General', exact=True).click()
            page.wait_for_timeout(150)
            assert [query for path, query in calls if path == '/api/dashboard/doctor'][-1].get('clinicId') is None
            assert page.evaluate("localStorage.getItem('doctorSelectedClinicId')") == clinics[1]['_id']
            checks.append('General clears dashboard scope without clearing queue/prescription clinic')
            sidebar = page.locator('aside').first
            sidebar.get_by_text('Queues', exact=True).click()
            expect(page.locator('main')).to_contain_text('Synthetic Queue Patient')
            assert any(path.startswith('/api/queue/doctor/my-queue/') and query.get('clinicId') == [clinics[1]['_id']] for path, query in calls)
            checks.append('latest doctor queue route receives selected clinic and renders intercepted records')
            with page.expect_request(lambda request: urlparse(request.url).path == '/api/prescription/doctor/appointments'):
                page.get_by_role('button', name='Write Prescription', exact=True).click()
            expect(page).to_have_url(base + '/doctor/prescription')
            page.wait_for_timeout(150)
            assert any(path == '/api/prescription/doctor/appointments' and query.get('clinicId') == [clinics[1]['_id']] for path, query in calls)
            checks.append('queue-to-prescription navigation and clinic-filtered appointment endpoint retained')
            with page.expect_request(lambda request: urlparse(request.url).path == '/api/prescription/doctor/my-prescriptions'):
                sidebar.get_by_text('Prescriptions', exact=True).click()
            expect(page.get_by_role('heading', name='Written Prescriptions', exact=True)).to_be_visible()
            assert any(path == '/api/prescription/doctor/my-prescriptions' and query.get('clinicId') == [clinics[1]['_id']] for path, query in calls)
            checks.append('latest prescription list route and selected clinic retained')
            with page.expect_request(lambda request: urlparse(request.url).path == '/api/messages/' + clinics[1]['_id']):
                sidebar.get_by_text('Messages', exact=True).click()
            expect(page.locator('main')).to_contain_text('CLINIC MESSAGES')
            page.wait_for_timeout(150)
            assert any(path == '/api/messages/' + clinics[1]['_id'] for path, _ in calls)
            checks.append('latest doctor messaging selects the shared clinic conversation')
            page.get_by_role('button', name=re.compile('Sign Out')).click()
            login('patient')
            page.evaluate("v=>{localStorage.setItem('patientBookingContext',JSON.stringify(v));window.dispatchEvent(new Event('patient-booking-context'))}",
                          {'clinicId': clinics[0]['_id'], 'clinicName': clinics[0]['clinicName'], 'doctor': {'doctorId': {'_id': subject, 'name': 'Booking Doctor'}}})
            expect(page.locator('aside').first).to_contain_text('Booking Doctor')
            page.locator('aside').first.get_by_text('Clinics', exact=True).click()
            expect(page.locator('main')).to_contain_text(clinics[0]['clinicName'])
            with page.expect_request(lambda request: urlparse(request.url).path == f"/api/clinic/public/{clinics[0]['_id']}/doctors"):
                page.get_by_role('button', name='Book visit', exact=True).click()
            expect(page).to_have_url(base + '/patient/clinic-doctors')
            page.wait_for_timeout(150)
            assert any(path == f"/api/clinic/public/{clinics[0]['_id']}/doctors" for path, _ in calls)
            checks.append('patient public clinic browsing, booking navigation and selected-doctor sidebar retained')
            page.locator('aside').first.get_by_text('Prescriptions', exact=True).click()
            expect(page.locator('main')).to_contain_text('No prescriptions yet')
            assert any(path == '/api/prescription/patient/my-prescriptions' for path, _ in calls)
            page.locator('aside').first.get_by_text('Live Queue', exact=True).click()
            expect(page).to_have_url(base + '/patient/queue')
            checks.append('latest patient prescriptions and live queue routes retained')
            page.get_by_role('button', name=re.compile('Sign Out')).click()
            login('clinic')
            page.locator('aside').first.get_by_text('Store queue', exact=True).click()
            expect(page.get_by_role('heading', name='Prescription store queue')).to_be_visible()
            assert any(path == '/api/prescription/store/queue' for path, _ in calls)
            checks.append('latest clinic pharmacy store queue route retained')
        assert not errors, errors
        context.close()
    browser.close()
print(json.dumps({'passed': len(checks), 'checks': checks}, indent=2))
