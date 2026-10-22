# Run from helioFrontend. Requires the same 5187/5188 Vite servers and production
# build as dashboard-browser.test.py. Every backend request is intercepted.
import base64
import http.server
import json
import pathlib
import re
import subprocess
import threading
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

root = pathlib.Path('dist').resolve()

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)
    def do_GET(self):
        if not (root / self.path.lstrip('/').split('?')[0]).is_file():
            self.path = '/index.html'
        super().do_GET()
    def log_message(self, *args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 5186), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
results = []

def token(role, index):
    encode = lambda value: base64.b64encode(json.dumps(value).encode()).decode().rstrip('=')
    claims = {'id': 'abc'[index] * 24, 'role': 'clinicAdmin' if role == 'clinic' else role,
              'exp': int(time.time()) + 3600, 'name': 'JWT Impostor', 'email': 'jwt@example.test'}
    return encode({'alg': 'HS256'}) + '.' + encode(claims) + '.synthetic'

def profile(role, index):
    names = {'doctor': ['Dr. Anika Rao', 'Dr. Ritesh Menon'],
             'clinic': ['Sahaj Clinic', 'Avani Family Care'], 'patient': ['Asha Patil', 'Kunal Sen']}
    result = {'id': 'abc'[index] * 24}
    if index < 2:
        result.update(name=names[role][index], email=f'account{index}@example.test',
                      specialization=['Neurology', 'Endocrinology'][index])
        if role == 'clinic':
            result['clinicName'] = result.pop('name')
    return result

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for mode, port in [('demo', 5187), ('normal', 5188), ('production', 5186)]:
        for role in ['doctor', 'clinic', 'patient']:
            base = f'http://127.0.0.1:{port}'
            context = browser.new_context(viewport={'width': 1900, 'height': 1100})
            page = context.new_page()
            state = {'account': 0, 'dashboardCalls': 0}
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def intercept(route):
                path = urlparse(route.request.url).path
                if path.endswith('/login'):
                    field = {'doctor': 'doctor', 'clinic': 'clinic', 'patient': 'user'}[role]
                    route.fulfill(json={'accessToken': token(role, state['account']),
                                        'refreshToken': 'synthetic-refresh', field: profile(role, state['account'])})
                elif path.startswith('/api/dashboard/'):
                    if urlparse(route.request.url).port == port:
                        state['dashboardCalls'] += 1
                    options = {'kind': role, 'subjectId': 'abc'[state['account']] * 24,
                               'search': urlparse(route.request.url).query, 'profile': profile(role, state['account'])}
                    code = "import {generateDashboardDemo} from './src/api/dashboardDemoData.js';console.log(JSON.stringify(generateDashboardDemo(JSON.parse(process.argv[1]))))"
                    data = json.loads(subprocess.check_output(
                        ['node', '--input-type=module', '-e', code, json.dumps(options)], text=True))
                    route.fulfill(json=data)
                else:
                    route.fulfill(json={'success': True, 'data': []})

            context.route(re.compile(r'^https?://[^/]+/api/'), intercept)
            context.add_init_script("localStorage.setItem('apiBase',location.origin)")
            sidebar = page.locator('aside').first
            login_url = base + f'/{role}/signup?mode=login'
            dashboard_url = base + f'/{role}/dashboard'

            def check_identity(index):
                account = profile(role, index)
                name = account.get('clinicName') or account.get('name')
                heading = sidebar.locator('h3')
                if name:
                    expect(heading).to_have_text(name)
                    parts = re.sub(r'^Dr\.?\s+', '', name).split()
                    initials = parts[0][0] + (parts[-1][0] if len(parts) > 1 else '')
                    expect(sidebar.locator('[class~="min-w-[42px]"]')).to_have_text(initials.upper())
                    if role == 'doctor':
                        expect(sidebar).to_contain_text(account['specialization'])
                    cache = page.evaluate("r=>JSON.parse(sessionStorage.getItem('clinq.'+r+'.identity.v1'))", role)
                    assert cache['profile']['email'] == account['email']
                else:
                    expect(heading).to_have_text({'doctor': 'Doctor unavailable', 'clinic': 'Clinic', 'patient': 'Patient'}[role])
                    expect(sidebar.locator('[class~="min-w-[42px]"]')).to_have_text('?')
                expect(sidebar).not_to_contain_text('JWT Impostor')
                expect(sidebar).not_to_contain_text('Dr. Meera Kulkarni')

            page.goto(login_url)
            for index in [0, 1, 2]:
                state['account'] = index
                page.locator('input[name=email]').fill('login@example.test')
                page.locator('input[name=password]').fill('synthetic-password')
                page.get_by_role('button', name='Login', exact=True).click()
                expect(page).to_have_url(dashboard_url)
                check_identity(index)
                expect(page.locator('.weekly-chart-bar')).to_have_count(10)
                page.wait_for_function("[...document.querySelectorAll('.weekly-chart-bar')].some(e=>parseFloat(e.style.height)>0)")
                expect(page.get_by_text('Demo Data', exact=True)).to_have_count(1 if mode == 'demo' else 0)
                page.reload()
                check_identity(index)
                if index == 1:
                    expect(sidebar).not_to_contain_text(profile(role, 0).get('name') or profile(role, 0)['clinicName'])
                    if mode != 'production':
                        # Model restarting the same frontend with the other flag:
                        # retain the exact browser session and its display cache.
                        saved = page.evaluate("()=>({local:{...localStorage},session:{...sessionStorage}})")
                        other_base = 'http://127.0.0.1:' + ('5188' if mode == 'demo' else '5187')
                        page.evaluate("url=>window.location.replace(url)", other_base + f'/{role}/signup?mode=login')
                        page.wait_for_url(other_base + f'/{role}/signup?mode=login')
                        page.evaluate("s=>{localStorage.clear();sessionStorage.clear();for(const[k,v]of Object.entries(s.local))localStorage.setItem(k,v);for(const[k,v]of Object.entries(s.session))sessionStorage.setItem(k,v);localStorage.setItem('apiBase',location.origin)}", saved)
                        page.evaluate("url=>window.location.replace(url)", other_base + f'/{role}/dashboard')
                        page.wait_for_url(other_base + f'/{role}/dashboard')
                        check_identity(index)
                        expect(page.get_by_text('Demo Data', exact=True)).to_have_count(0 if mode == 'demo' else 1)
                        page.evaluate("url=>window.location.replace(url)", dashboard_url)
                        page.wait_for_url(dashboard_url)
                        check_identity(index)
                page.get_by_role('button', name=re.compile('Sign Out')).click()
                expect(page).to_have_url(login_url)
                assert page.evaluate("r=>!sessionStorage.getItem('clinq.'+r+'.identity.v1')&&!localStorage.getItem(r+'AccessToken')", role)
                page.go_back()
                expect(page).to_have_url(login_url)

            # Replacing a token while mounted without a profile must immediately
            # discard the previous identity, even when JWT claims contain a name.
            state['account'] = 0
            page.locator('input[name=email]').fill('login@example.test')
            page.locator('input[name=password]').fill('synthetic-password')
            page.get_by_role('button', name='Login', exact=True).click()
            check_identity(0)
            state['account'] = 2
            page.evaluate("({r,t})=>{localStorage.setItem(r+'AccessToken',t);window.dispatchEvent(new Event(r+'-auth-changed'))}",
                          {'r': role, 't': token(role, 2)})
            check_identity(2)
            page.evaluate("r=>{localStorage.removeItem(r+'AccessToken');window.dispatchEvent(new Event(r+'-auth-changed'))}", role)
            check_identity(2)
            assert not errors, errors
            if mode == 'demo':
                assert state['dashboardCalls'] == 0
            results.append({'mode': mode, 'role': role, 'result': 'PASS', 'checks': [
                'two authenticated accounts', 'correct initials/email/specialization', 'populated charts',
                'reload identity', 'logout and Back', 'missing profile neutral', 'mounted token replacement/removal',
                'JWT identity ignored', 'saved-session demo mode transition', 'demo production lockout']})
            context.unroute_all(behavior='wait')
            context.close()
    browser.close()

server.shutdown()
server.server_close()
print(json.dumps(results))
print('PASS: 9 identity browser flows (3 roles x demo/normal/production)')
