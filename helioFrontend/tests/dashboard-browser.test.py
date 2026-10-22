# Synthetic browser checks only; never connects to a live database.
# Run from helioFrontend with Python Playwright and Chromium already available.
# Prerequisites: demo-enabled Vite on 5187, disabled Vite on 5188, and dist
# built with VITE_DASHBOARD_DEMO_MODE=true. This script serves dist on 5186.

import json,re,base64,time
from playwright.sync_api import sync_playwright,expect
base='http://127.0.0.1:5187';roles=['clinic','doctor','patient'];results=[]
enc=lambda v:base64.b64encode(json.dumps(v).encode()).decode().rstrip('=')
def token(role,expired=False):return enc({'alg':'HS256'})+'.'+enc({'id':'abcdef0123456789abcdef01','role':'clinicAdmin' if role=='clinic' else role,'exp':int(time.time())+(-60 if expired else 3600)})+'.synthetic'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for role in roles:
  c=browser.new_context(viewport={'width':1900,'height':1100});page=c.new_page();errors=[];network=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def intercept(r):
   network.append(r.request.url)
   if urlpath(r.request.url).endswith('/login'):
    field={'doctor':'doctor','clinic':'clinic','patient':'user'}[role]
    r.fulfill(json={'accessToken':token(role),'refreshToken':'synthetic-refresh',field:{'id':'abcdef0123456789abcdef01','name':'Dr. Authenticated Account','clinicName':'Authenticated Clinic','email':'account@example.test','specialization':'Endocrinology'}})
   else:r.abort()
  from urllib.parse import urlparse
  def urlpath(url):return urlparse(url).path
  c.route(re.compile(r'^https?://[^/]+/api/'),intercept);c.add_init_script("localStorage.setItem('apiBase',location.origin)")
  page.goto(base+'/'+role+'/signup?mode=login');page.locator('input[name=email]').fill('demo@example.test');page.locator('input[name=password]').fill('synthetic');page.get_by_role('button',name='Login',exact=True).click();expect(page).to_have_url(base+'/'+role+'/dashboard');expect(page.get_by_text('Demo Data',exact=True)).to_be_visible()
  response=page.evaluate("async(role)=>{const m=await import('/src/api/dashboardRequest.js');return m.requestDashboard('GET','/api/dashboard/'+role,null,localStorage.getItem(role+'AccessToken'))}",role)
  assert response['success'];assert len(response['trend10Days'])==10
  if role=='doctor':expect(page.locator('aside').first).to_contain_text('Dr. Authenticated Account')
  expect(page.locator('.weekly-chart-bar')).to_have_count(10);page.wait_for_timeout(2100)
  values=page.locator('.weekly-chart-bar').evaluate_all("bars=>bars.map(b=>Number(b.parentElement.previousElementSibling.textContent))")
  assert values==[row['completed' if role=='patient' else 'patients'] for row in response['trend10Days']],(role,values)
  assert page.get_by_text('Demo Data',exact=True).evaluate("e=>getComputedStyle(e).position")=='fixed'
  for width in [1900,1024]:
   page.set_viewport_size({'width':width,'height':1100})
   assert page.locator('.weekly-chart-bar').first.evaluate("e=>e.closest('[class~=\"h-[335px]\"]').getBoundingClientRect().height")==335
  page.set_viewport_size({'width':1900,'height':1100})
  options=response.get('doctors')or response.get('clinics')or response.get('selectorClinics')
  key='doctorId' if role=='clinic' else 'clinicId';name=options[0].get('name')or options[0].get('clinicName')
  selector=page.locator('main').get_by_role('button').filter(has_text='General').first;selector.click();page.get_by_role('button',name=name,exact=True).click()
  page.locator('main').get_by_role('button').filter(has_text=name).first.click()
  for option in options:expect(page.get_by_role('button',name=option.get('name')or option.get('clinicName'),exact=True)).to_be_visible()
  page.get_by_role('button',name='General',exact=True).click();expect(page.locator('.weekly-chart-bar')).to_have_count(10)
  panel=page.locator('main aside');panel.get_by_text('23',exact=True).click();page.wait_for_timeout(150)
  old=panel.inner_text();panel.locator('button').nth(1).click();page.wait_for_timeout(150);assert panel.inner_text()!=old
  assert not any('/api/dashboard/'in u for u in network),network
  page.get_by_role('button',name=re.compile('Sign Out')).click();expect(page).to_have_url(base+'/'+role+'/signup?mode=login');expect(page.get_by_role('heading',name=re.compile('Welcome back'))).to_be_visible()
  assert page.evaluate("(r)=>!localStorage.getItem(r+'AccessToken')&&!localStorage.getItem(r+'RefreshToken')",role)
  page.go_back();expect(page.get_by_role('button',name=re.compile('Sign Out'))).to_have_count(0)
  assert not errors,errors
  # Expiry and wrong-role errors are local, not a network fallback.
  for bad,code in [(token(role,True),401),(token('patient' if role!='patient' else 'doctor'),403),('',401)]:
   status=page.evaluate("async({r,t})=>{try{await(await import('/src/api/dashboardRequest.js')).requestDashboard('GET','/api/dashboard/'+r,null,t);return 200}catch(e){return e.response.status}}",{'r':role,'t':bad});assert status==code
  results.append({'role':role,'result':'PASS','checks':['mock original login/logout','local populated response','10 bars match records','stable selector and General reset','calendar date/month','fixed badge','zero dashboard network calls','expiry/wrong role/missing token','Back protection'],'pageErrors':errors});c.unroute_all(behavior='wait');c.close()
 print(json.dumps(results));browser.close()

import http.server,threading,pathlib,json,re,base64,time,subprocess
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
root=pathlib.Path('dist').resolve()
class H(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(root),**k)
 def do_GET(self):
  if not(root/self.path.lstrip('/').split('?')[0]).is_file():self.path='/index.html'
  super().do_GET()
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',5186),H);threading.Thread(target=server.serve_forever,daemon=True).start()
roles=['clinic','doctor','patient'];results=[];subject='abcdef0123456789abcdef01'
enc=lambda v:base64.b64encode(json.dumps(v).encode()).decode().rstrip('=')
def token(role,expired=False):return enc({'alg':'HS256'})+'.'+enc({'id':subject,'role':'clinicAdmin'if role=='clinic'else role,'exp':int(time.time())+(-60 if expired else 3600)})+'.synthetic'
def fixture(role,search='',empty=False):
 code="import {generateDashboardDemo,createDashboardDemoDataset} from './src/api/dashboardDemoData.js';const o=JSON.parse(process.argv[1]);if(o.empty){o.dataset=createDashboardDemoDataset(new Date(),o);o.dataset.appointments=[];o.dataset.queues=[]}console.log(JSON.stringify(generateDashboardDemo(o)))"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code,json.dumps({'kind':role,'subjectId':subject,'search':search,'empty':empty})],text=True))
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for mode,port in [('disabled',5188),('production-flag-true',5186)]:
  for role in roles:
   base='http://127.0.0.1:'+str(port);c=browser.new_context(viewport={'width':1900,'height':1100});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));s={'case':'populated','requests':[],'held':None}
   def route(r):
    path=urlparse(r.request.url).path
    if not path.startswith('/api/dashboard/'):r.fulfill(json={'success':True,'data':[]});return
    s['requests'].append(r.request.url)
    if s['case']in['loading','hold']:s['held']=r;return
    if s['case']in['401','403','404','500']:r.fulfill(status=int(s['case']),json={'message':'Synthetic failure'});return
    if s['case']=='network':r.abort('failed');return
    data=fixture(role,urlparse(r.request.url).query,s['case']=='zero')
    if s['case']=='missing':
     data.pop('stats',None)
     for key in ['todayAppointments','upcomingAppointments','upcomingAppointmentsList','appointmentHistory']:
      for row in data.get(key,[]):row.update(userId=None,doctorId=None,clinicId=None,appointmentDate='malformed')
     for row in data['selectedDay']['appointments']:row.update(userId=None,doctorId=None,clinicId=None,appointmentDate=None)
     for row in data['dailyQueue']['queueEntries']:row.update(userId=None,doctorId=None,clinicId=None,queueNumber=None,appointmentTime=None,estimatedStartTime=None)
    r.fulfill(json=data)
   c.route(re.compile(r'^https?://[^/]+/api/'),route)
   c.add_init_script("localStorage.setItem('apiBase',location.origin);if(!localStorage.getItem('testSeed')){localStorage.setItem('testSeed','yes');localStorage.setItem('healioIdentity','"+role+"');localStorage.setItem('"+role+"AccessToken',"+json.dumps(token(role))+")}")
   dash=base+'/'+role+'/dashboard';page.goto(dash);expect(page.locator('.weekly-chart-bar')).to_have_count(10);expect(page.get_by_text('Demo Data',exact=True)).to_have_count(0)
   page.wait_for_function("document.querySelectorAll('.weekly-chart-bar').length===10&&[...document.querySelectorAll('.weekly-chart-bar')].some(e=>parseFloat(e.style.height)>0)")
   assert len(s['requests'])==1,(mode,role,s['requests'])
   checks=['normal API used once','demo badge absent','populated 10 bars']
   if mode=='disabled':
    data=fixture(role);options=data.get('doctors')or data.get('clinics')or data.get('selectorClinics');name=options[0].get('name')or options[0].get('clinicName');key='doctorId'if role=='clinic'else'clinicId'
    def openGeneral():page.locator('main').get_by_role('button').filter(has_text='General').first.click()
    openGeneral();page.get_by_role('button',name=name,exact=True).click();page.wait_for_timeout(200);assert parse_qs(urlparse(s['requests'][-1]).query)[key]==[options[0]['_id']]
    page.locator('main').get_by_role('button').filter(has_text=name).first.click();page.get_by_role('button',name='General',exact=True).click();page.wait_for_timeout(200);assert key not in parse_qs(urlparse(s['requests'][-1]).query)
    panel=page.locator('main aside');panel.get_by_text('23',exact=True).click();page.wait_for_timeout(200);assert parse_qs(urlparse(s['requests'][-1]).query)['date'][0].endswith('-23')
    panel.locator('button').nth(1).click();page.wait_for_timeout(200);assert parse_qs(urlparse(s['requests'][-1]).query)['month'][0]!=data['calendar']['month']
    checks+=['selector filter','General reset','date request','month navigation']
    # Superseded success and error must not replace the latest General scope.
    for delayed in ['success','error']:
     page.goto(dash);page.wait_for_timeout(200);s['case']='hold';s['held']=None;openGeneral();page.get_by_role('button',name=name,exact=True).click();page.wait_for_timeout(100);assert s['held']
     old=s['held'];s['case']='populated';page.locator('main').get_by_role('button').filter(has_text=name).first.click();page.get_by_role('button',name='General',exact=True).click();page.wait_for_timeout(200)
     if delayed=='error':old.fulfill(status=500,json={'message':'STALE ERROR SHOULD NOT APPEAR'})
     else:
      stale=fixture(role);stale['stats']={k:98765 for k in stale['stats']};old.fulfill(json=stale)
     page.wait_for_timeout(100);expect(page.locator('main')).not_to_contain_text('98765');expect(page.locator('main')).not_to_contain_text('STALE ERROR SHOULD NOT APPEAR')
    checks+=['stale success ignored','stale error ignored']
    for case in ['zero','missing','401','403','404','500','network','loading']:
     page.evaluate("({r,t})=>localStorage.setItem(r+'AccessToken',t)",{'r':role,'t':token(role,case=='401')})
     s['case']=case;s['held']=None;page.goto(dash);expect(page.locator('.weekly-chart-bar')).to_have_count(10)
     if case=='zero':
      page.wait_for_function("[...document.querySelectorAll('.weekly-chart-bar')].every(e=>e.style.height==='0%')");expect(page.locator('main')).not_to_contain_text('NaN')
     elif case=='missing':page.wait_for_timeout(200);expect(page.locator('main')).to_contain_text('unavailable')
     elif case=='loading':
      expect(page.locator('main')).to_contain_text(re.compile('Loading',re.I));assert s['held'];held=s['held'];page.get_by_role('button',name=re.compile('Sign Out')).click();held.fulfill(json=fixture(role));expect(page).to_have_url(base+'/'+role+'/signup?mode=login');expect(page.get_by_role('button',name=re.compile('Sign Out'))).to_have_count(0)
     else:expect(page.locator('main')).to_contain_text(re.compile('expired|invalid|denied|not found|Unable|Synthetic|Network',re.I))
     checks.append(case+' state'+(' and unmount cleanup'if case=='loading'else''))
    assert not errors,errors
   results.append({'mode':mode,'role':role,'result':'PASS','checks':checks,'pageErrors':errors});c.unroute_all(behavior='wait');c.close()
 print(json.dumps(results));browser.close()
server.shutdown();server.server_close()

import http.server,threading,pathlib,json,re,base64,time
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
root=pathlib.Path('dist').resolve()
class H(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(root),**k)
 def do_GET(self):
  if not(root/self.path.lstrip('/').split('?')[0]).is_file():self.path='/index.html'
  super().do_GET()
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',5186),H);threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:5186'
enc=lambda v:base64.b64encode(json.dumps(v).encode()).decode().rstrip('=')
def jwt(role):return enc({'alg':'HS256'})+'.'+enc({'id':'1'*24,'role':'clinicAdmin' if role=='clinic' else role,'exp':int(time.time())+3600})+'.synthetic'
roles=['doctor','clinic','patient'];results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for role in roles:
  c=browser.new_context(viewport={'width':1900,'height':1100});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));state={'gets':0,'logins':0,'hold':False,'held':None};loginPath=base+'/'+role+'/signup?mode=login';dash=base+'/'+role+'/dashboard'
  def fixture(url):
   q=parse_qs(urlparse(url).query);date=q.get('date',['2026-10-22'])[0]
   data={'success':True,'dashboard':role,'appliedFilters':{},'stats':{'totalAppointments':1,'appointmentsToday':1},'trend10Days':[],'calendar':{'month':date[:7],'days':[]},'dailyQueue':{'date':date,'queueEntries':[]},'selectedDay':{'date':date,'appointments':[],'queueEntries':[]},'clinics':[],'doctors':[],'selectorClinics':[],'appointmentHistory':[],'upcomingAppointmentsList':[],'queueEntries':[]}
   if role=='doctor':data.update(doctor={'_id':'1'*24,'name':'Dr. Synthetic Owner','specialization':'Synthetic specialty'},appliedFilters={'doctorId':'1'*24})
   return data
  def route(r):
   path=urlparse(r.request.url).path
   if path.endswith('/login'):
    state['logins']+=1;r.fulfill(json={'accessToken':jwt(role),'refreshToken':'synthetic-'+role});return
   if path.startswith('/api/dashboard/'):
    state['gets']+=1
    if state['hold']:state['held']=(r,fixture(r.request.url));return
    r.fulfill(json=fixture(r.request.url));return
   r.fulfill(json={'success':True,'data':[],'clinics':[]})
  c.route('**/api/**',route);c.add_init_script("localStorage.setItem('apiBase',location.origin)")
  page.goto(loginPath)
  def original():
   expect(page).to_have_url(loginPath);expect(page.get_by_role('heading',name=re.compile('Welcome back'))).to_be_visible();expect(page.get_by_role('button',name='Continue with Google')).to_be_visible();expect(page.locator('body')).not_to_contain_text('Healthcare that moves at your pace.')
  def login():
   original();page.locator('input[name=email]').fill('synthetic@example.test');page.locator('input[name=password]').fill('synthetic-password');page.get_by_role('button',name='Login',exact=True).click();expect(page).to_have_url(dash);expect(page.get_by_role('button',name=re.compile('Sign Out'))).to_be_visible();page.wait_for_timeout(120)
   assert page.evaluate("(role)=>!!localStorage.getItem(role+'AccessToken')&&!!localStorage.getItem(role+'RefreshToken')",role)
  login();assert not errors,errors
  # Keep real-looking other sessions so a global identity mismatch cannot delete them.
  other={k:jwt(k) for k in roles if k!=role}
  page.evaluate("""({role,other})=>{for(const [k,v]of Object.entries(other)){localStorage.setItem(k+'AccessToken',v);localStorage.setItem(k+'RefreshToken','keep-'+k);sessionStorage.setItem(k+'AccessToken',v);sessionStorage.setItem(k+'RefreshToken','keep-'+k)}localStorage.setItem('theme','keep-theme');sessionStorage.setItem('unrelated','keep-session');sessionStorage.setItem(role+'AccessToken','synthetic');sessionStorage.setItem(role+'RefreshToken','synthetic');window.authEvents=0;window.addEventListener(role+'-auth-changed',()=>window.authEvents++)}""",{'role':role,'other':other})
  # Leave a protected doctor/patient/clinic URL in browser history.
  if role=='doctor':
   page.get_by_role('button',name=re.compile('02.*Clinics')).click();expect(page).to_have_url(base+'/doctor/clinics');page.get_by_role('button',name=re.compile('01.*Dashboard')).click();expect(page).to_have_url(dash)
  elif role=='patient':
   page.get_by_role('button',name=re.compile('02.*Clinics')).click();expect(page).to_have_url(base+'/patient/clinics');page.get_by_role('button',name=re.compile('01.*Dashboard')).click();expect(page).to_have_url(dash)
  else:
   page.get_by_role('button',name=re.compile('02.*Doctors')).click();expect(page).to_have_url(base+'/clinic/doctors');page.get_by_role('button',name=re.compile('01.*Dashboard')).click();expect(page).to_have_url(dash)
  page.get_by_role('button',name=re.compile('Sign Out')).click();original()
  assert page.evaluate("""({role,other})=>!localStorage.getItem(role+'AccessToken')&&!localStorage.getItem(role+'RefreshToken')&&!sessionStorage.getItem(role+'AccessToken')&&!sessionStorage.getItem(role+'RefreshToken')&&Object.entries(other).every(([k,v])=>localStorage.getItem(k+'AccessToken')===v&&localStorage.getItem(k+'RefreshToken')==='keep-'+k&&sessionStorage.getItem(k+'AccessToken')===v&&sessionStorage.getItem(k+'RefreshToken')==='keep-'+k)&&localStorage.getItem('theme')==='keep-theme'&&sessionStorage.getItem('unrelated')==='keep-session'&&window.authEvents===1""",{'role':role,'other':other})
  count=state['gets'];page.go_back();original();assert state['gets']==count
  page.goto(dash);original();assert state['gets']==count;page.reload();original()
  login();page.get_by_role('button',name=re.compile('Sign Out')).click();original();assert state['logins']==2
  page.goto(base+'/'+role+'/signup');expect(page.locator('input[name=password]')).to_have_attribute('placeholder','Create Password');page.get_by_role('button',name='Login',exact=True).click();expect(page.get_by_role('heading',name=re.compile('Welcome back'))).to_be_visible()
  assert not errors,errors
  results.append({'role':role,'result':'PASS','logins':state['logins'],'checks':['original login and registration toggle','logout role destination','access/refresh removed both stores','other role tokens/preferences preserved','role auth event','Back protection','direct URL/reload protection','fresh re-login'],'pageErrors':errors});c.unroute_all(behavior='wait');c.close()
 print(json.dumps(results));browser.close()
server.shutdown();server.server_close()

print('PASS: 12 browser flows (3 demo, 3 disabled, 3 production, 3 login/logout)')
