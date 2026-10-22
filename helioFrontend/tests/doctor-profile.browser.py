"""Run from helioFrontend; all API traffic is intercepted, never sent to a database."""
import base64
import json
import http.server
import os
import pathlib
import re
import subprocess
import time
import threading
import urllib.request
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect


def token(index):
    encode = lambda value: base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip('=')
    return encode({'alg': 'HS256'}) + '.' + encode({'id': 'ab'[index] * 24, 'role': 'doctor', 'exp': int(time.time()) + 3600}) + '.synthetic'


def account(index):
    return {'_id': 'ab'[index] * 24, 'name': ['Dr. Nisha Rao', 'Dr. Kabir Sen'][index],
            'specialization': ['Neurology', 'Cardiology'][index], 'email': f'doctor{index}@example.test',
            'phone': f'900000000{index}', 'role': 'doctor',
            'schedule': {'day': 'Tuesday', 'startTime': '10:00', 'endTime': '14:00'}}


processes = []
checks = []
root = pathlib.Path('dist').resolve()


class ProductionHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def do_GET(self):
        if not (root / self.path.lstrip('/').split('?')[0]).is_file():
            self.path = '/index.html'
        super().do_GET()

    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(('127.0.0.1', 5193), ProductionHandler)
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    for demo, port in [('true', 5191), ('false', 5192)]:
        env = dict(os.environ, VITE_DASHBOARD_DEMO_MODE=demo)
        processes.append(subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', str(port), '--strictPort'],
                                          env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        for attempt in range(100):
            try:
                urllib.request.urlopen(f'http://127.0.0.1:{port}', timeout=1)
                break
            except OSError:
                time.sleep(.2)
        else:
            raise RuntimeError('Vite did not start')

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        for demo, port in [(False, 5192), (True, 5191), (False, 5193)]:
            context = browser.new_context(viewport={'width': 1900, 'height': 1100})
            page = context.new_page()
            state = {'index': 0, 'status': 200, 'missing': False, 'clinicError': False, 'calls': [], 'held': [], 'hold': False}
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def intercept(route):
                path = urlparse(route.request.url).path
                state['calls'].append(path)
                doctor = account(state['index'])
                if state['missing']:
                    doctor = {'_id': doctor['_id'], 'role': 'doctor'}
                if path.endswith('/login'):
                    route.fulfill(json={'accessToken': token(state['index']), 'refreshToken': 'synthetic', 'doctor': doctor})
                elif path.endswith('/me'):
                    if state['hold']:
                        state['held'].append((route, doctor))
                        return
                    route.fulfill(status=state['status'], json={'success': state['status'] == 200, 'doctor': doctor})
                elif path.endswith('/clinics'):
                    route.fulfill(status=500 if state['clinicError'] else 200, json={'success': True, 'clinics': [
                        {'doctorId': doctor['_id'], 'clinicId': {'_id': 'c' * 24, 'clinicName': 'Synthetic Authorized Clinic', 'isActive': True}}]})
                elif path == '/api/dashboard/doctor':
                    code = "import {generateDashboardDemo} from './src/api/dashboardDemoData.js'; console.log(JSON.stringify(generateDashboardDemo(JSON.parse(process.argv[1]))))"
                    data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code, json.dumps(
                        {'kind': 'doctor', 'subjectId': doctor['_id'], 'search': urlparse(route.request.url).query, 'profile': doctor})], text=True))
                    route.fulfill(json=data)
                else:
                    route.fulfill(json={'success': True, 'data': []})

            context.route(re.compile(r'^https?://[^/]+/api/'), intercept)
            context.add_init_script("localStorage.setItem('apiBase',location.origin)")
            base = f'http://127.0.0.1:{port}'

            def login(index):
                state['index'] = index
                page.goto(base + '/doctor/signup?mode=login')
                page.locator('input[name=email]').fill('synthetic@example.test')
                page.locator('input[name=password]').fill('synthetic-password')
                page.get_by_role('button', name='Login', exact=True).click()
                expect(page).to_have_url(base + '/doctor/dashboard')
                expect(page.locator('.weekly-chart-bar')).to_have_count(10)
                page.goto(base + '/doctor/profile')

            for index in [0, 1]:
                login(index)
                expect(page.locator('h2').filter(has_text=account(index)['name'])).to_have_count(1)
                expect(page.locator('main')).to_contain_text(account(index)['email'])
                expect(page.locator('main')).to_contain_text(account(index)['specialization'])
                expect(page.get_by_role('button', name='Edit Profile unavailable')).to_be_disabled()
                expect(page.get_by_alt_text('Profile photo not provided')).to_have_attribute('src', re.compile('^data:image/svg'))
                if demo:
                    expect(page.locator('main')).to_contain_text('MBBS, MD (Demo)')
                    expect(page.get_by_text('Demo Data', exact=True)).to_have_count(1)
                else:
                    expect(page.locator('main')).to_contain_text('Synthetic Authorized Clinic')
                    expect(page.locator('main')).to_contain_text('10:00 — 14:00')
                    expect(page.locator('main')).not_to_contain_text('MBBS')
                for width in [1900, 1024]:
                    page.set_viewport_size({'width': width, 'height': 1100})
                    box = page.get_by_alt_text('Profile photo not provided').bounding_box()
                    assert box['width'] == 330 and box['height'] == 430, box
                    assert page.locator('main > div > div').nth(0).bounding_box()['height'] == 82
                page.get_by_role('button', name=re.compile('Sign Out')).click()
                expect(page).to_have_url(base + '/doctor/signup?mode=login')
                assert page.evaluate("!localStorage.getItem('doctorAccessToken')&&!sessionStorage.getItem('clinq.doctor.identity.v1')")
                page.go_back()
                expect(page).to_have_url(base + '/doctor/signup?mode=login')
                checks.append(f'{demo=}: account {index}, dashboard, profile, layout 1900/1024, logout, Back')

            state['missing'] = True
            login(0)
            expect(page.locator('main')).to_contain_text('Doctor unavailable')
            expect(page.locator('main')).not_to_contain_text(account(1)['name'])
            checks.append(f'{demo=}: missing identity neutral')
            state['missing'] = False
            if port == 5193:
                assert any(path.endswith('/me') for path in state['calls'])
                expect(page.get_by_text('Demo Data', exact=True)).to_have_count(0)
                assert not errors, errors
                checks.append('production: real profile API used; development demo mode locked out')
                context.close()
                continue
            if demo:
                assert not any(path.endswith(('/me', '/clinics')) or path == '/api/dashboard/doctor' for path in state['calls']), state['calls']
                checks.append('demo: no profile/dashboard API requests')
            else:
                for status, text in [(401, 'expired or is invalid'), (403, 'Access denied'), (404, 'not found'), (500, 'Unable to load')]:
                    state['status'] = status
                    page.reload()
                    expect(page.locator('main')).to_contain_text(text)
                    expect(page.locator('main')).not_to_contain_text(account(0)['email'])
                    checks.append(f'normal: error {status} clears profile')
                state['status'] = 200
                state['clinicError'] = True
                page.reload()
                expect(page.locator('main')).to_contain_text('Clinic affiliations could not be loaded')
                expect(page.locator('main')).to_contain_text(account(0)['name'])
                expect(page.locator('main')).not_to_contain_text('Synthetic Authorized Clinic')
                checks.append('normal: partial clinic failure preserves verified account only')

            # Mount the profile alone in StrictMode to exercise mounted account
            # changes independently of the application's route guard.
            state.update(status=200, clinicError=False, index=0)
            page.goto(base + '/doctor/signup?mode=login')
            page.evaluate("""async t=>{
                localStorage.setItem('doctorAccessToken',t);
                const reactModule=await import('/node_modules/.vite/deps/react.js');
                const React=reactModule.default||reactModule;
                const module=await import('/node_modules/.vite/deps/react-dom_client.js');
                const createRoot=module.createRoot||module.default.createRoot;
                const {default:Profile}=await import('/src/components/doctorFrontend/DoctorProfile.jsx');
                const node=document.createElement('section');node.id='profile-test';document.body.prepend(node);
                window.testProfileRoot=createRoot(node);window.testProfileRoot.render(React.createElement(React.StrictMode,null,React.createElement(Profile)));
            }""", token(0))
            section = page.locator('#profile-test')
            expect(section).to_contain_text(account(0)['name'] if not demo else 'Doctor unavailable')
            state['index'] = 1
            page.evaluate("t=>{localStorage.setItem('doctorAccessToken',t);window.dispatchEvent(new Event('doctor-auth-changed'))}", token(1))
            expect(section).to_contain_text(account(1)['name'] if not demo else 'Doctor unavailable')
            expect(section).not_to_contain_text(account(0)['name'])
            if not demo:
                for late_status in [200, 401]:
                    state.update(index=0, hold=True)
                    page.evaluate("t=>{localStorage.setItem('doctorAccessToken',t);window.dispatchEvent(new Event('doctor-auth-changed'))}", token(0))
                    expect(section).to_contain_text('Loading doctor profile')
                    page.wait_for_timeout(100)
                    assert len(state['held']) == 1, 'StrictMode must not duplicate profile requests'
                    state.update(index=1, hold=False)
                    page.evaluate("t=>{localStorage.setItem('doctorAccessToken',t);window.dispatchEvent(new Event('doctor-auth-changed'))}", token(1))
                    expect(section).to_contain_text(account(1)['name'])
                    for route, old_doctor in state['held']:
                        route.fulfill(status=late_status, json={'success': late_status == 200, 'doctor': old_doctor})
                    state['held'].clear()
                    page.wait_for_timeout(100)
                    expect(section).to_contain_text(account(1)['name'])
                    expect(section).not_to_contain_text(account(0)['name'])
                    checks.append(f'normal: delayed {late_status} from previous account ignored')
            page.evaluate("localStorage.removeItem('doctorAccessToken');window.dispatchEvent(new Event('doctor-auth-changed'))")
            expect(section).to_contain_text('Sign in to view your doctor profile')
            expect(section).not_to_contain_text(account(1)['name'])
            if not demo:
                state.update(index=0, hold=True)
                page.evaluate("t=>{localStorage.setItem('doctorAccessToken',t);window.dispatchEvent(new Event('doctor-auth-changed'))}", token(0))
                expect(section).to_contain_text('Loading doctor profile')
                page.wait_for_timeout(100)
            page.evaluate('window.testProfileRoot.unmount()')
            for route, old_doctor in state['held']:
                route.fulfill(json={'success': True, 'doctor': old_doctor})
            page.wait_for_timeout(100)
            assert not errors, errors
            checks.append(f'{demo=}: StrictMode, mounted token replacement/removal, unmount')
            context.close()
        browser.close()
    print(json.dumps({'passed': len(checks), 'checks': checks}, indent=2))
finally:
    server.shutdown()
    server.server_close()
    for process in processes:
        process.terminate()
    for process in processes:
        process.wait(timeout=10)
