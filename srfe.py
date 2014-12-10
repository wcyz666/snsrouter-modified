# -*- coding: utf-8 -*-

import sys
import os
sys.path.append('bottle')
sys.path.append('snsapi')
from bottle import route, run, template, static_file, view, Bottle, request, response, redirect
from snsapi.snspocket import SNSPocket
from snsapi.snslog import SNSLog as logger
from snsapi import utils as snsapi_utils
from snsapi.utils import json
import time
import sqlite3
import webbrowser
from srfequeue import SRFEQueue
import threading
import hashlib
import platform as plat

srfe = Bottle()
TOKEN_VALID_PERIOD = 400000
if plat.platform().lower() == "windows":
    delimeter = "\\"
else:
    delimeter = "/"

class AuthProxy(object):
    def __init__(self):
        super(AuthProxy, self).__init__()
        self.code_url = "((null))"
        self.requested_url = None
        self.current_channel = None

    def fetch_code(self):
        logger.warning(str(self))
        return self.code_url

    def request_url(self, url):
        self.requested_url = url
        self.code_url = "((null))"
        
class TimeRecorder(object):

    def __init__(self):
        super(TimeRecorder, self).__init__()
        self.timesnap = time.time()

    def time_freeze(self):
        self.timesnap = time.time()



class InputThread(threading.Thread):
    def __init__(self, queue, sp, k):
        super(InputThread, self).__init__()
        self.queue = queue
        self.keep_running = True
        self.sp = sp
        self.user_id = k

    def run(self):    
        #webbrowser.open("http://127.0.0.1:8080/login")
        while (self.keep_running):
            self.queue.input()
            try:
                logger.debug("Invoke input() on queue")
                os.chdir("." + delimeter + "User" + delimeter + str(self.user_id))
                p = os.getcwd()
                self.sp.save_config(fn_channel= p + delimeter + "conf" + delimeter + "channel.json",fn_pocket= p + delimeter + "conf" + delimeter + "pocket.json")
                os.chdir(".." + delimeter + ".." + delimeter)
                time.sleep(INPUT_GAP) 
            except Exception as e:
                logger.warning("Catch Exception in InputThread: %s", e)

def check_login(func):
    '''
    A decorator to check login. 
    Put it bef ore those URLs where login is required. 
    '''
    def wrapper_check_login(*al, **ad):
        logger.warning(str(user))
        token = request.get_cookie("token")
        if not check_token(token):
            redirect('/login')
        else:
            return func(*al, **ad)
    return wrapper_check_login

@srfe.route('/logout')
@view('logout')
@check_login
def logout_get():
    token = request.get_cookie("token")
    for (k,v) in user.items():
        if v["token"] == token:
            v["token"] = ""
            cur = con.cursor()
            cur.execute("UPDATE user SET token = NULL ,generate_time = NULL WHERE id = ?", (k, ))
            con.commit();
    response.set_cookie("token", "")
    return {}

@srfe.route('/login', method = 'GET')
@view('login')
def login_get():
    return {"state": "new"}

@srfe.route('/login', method = 'POST')
def login_post():
    username = request.forms.get('username')
    password = request.forms.get('password')
    for (k,v) in user.items():
        if username == v['username'] and password == v["password"]:
            v["token"] = hashlib.new('md5', username + password + str(time.time())).hexdigest()
            v["generate_time"] = time.time()
            cur = con.cursor()
            cur.execute("UPDATE user SET token = ?, generate_time = ? WHERE id = ?", (v["token"], v["generate_time"], k))
            con.commit();
            response.set_cookie("token", v["token"], httponly="on", max_age = TOKEN_VALID_PERIOD)
            return {"state": "succ"}
    return {"state": "fail"}

@srfe.route('/static/<filename:path>')
@check_login
def send_static(filename):
    return static_file(filename, root='./views/static/')
    
@srfe.route('/del/<filename:path>')
@check_login
def del_channel(filename):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    os.chdir("." + delimeter + "User" + delimeter + str(k))
    del(sp[filename])
    p = os.getcwd()
    sp.save_config(fn_channel= p + delimeter + "conf" + delimeter + "channel.json",fn_pocket= p + delimeter + "conf" + delimeter + "pocket.json")
    os.chdir(".." + delimeter + ".." + delimeter)
    return
    
@srfe.route('/newchannel', method="GET")
@check_login
def config_channel():
    return "Error"
    
@srfe.route('/newchannel', method="POST")
@check_login
def config_channel():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    pf = request.forms.get('channel_platform')
    new = sp.new_channel()
    new["channel_name"] = request.forms.get("channel_name")
    new['platform'] = pf
    
    if pf in ["RenrenFeed","SinaWeiboStatus","TencentWeiboStatus", "TwitterStatus", "FacebookFeed", "InstagramFeed"]:
        new["app_key"] = request.forms.get('channel_key')
        new["app_secret"] = request.forms.get('channel_secret')
        if pf == "TwitterStatus":
            new["access_key"] = request.forms.get('channel_key_access')
            new["access_secret"] = request.forms.get('channel_secret_access')
        else:
            new["auth_info"]["callback_url"] = "http://snsapi.ie.cuhk.edu.hk/aux/auth.php"
            if (pf == "FacebookFeed"):
                new["access_token"] = request.forms.get('channel_token')
    elif pf == "Email":
        new["username"] = request.forms.get('channel_username')
        new["password"] = request.forms.get('channel_password')
        new["address"] = request.forms.get('channel_addr')
        new["imap_host"] = request.forms.get('channel_imap_host')
        new["imap_port"] = request.forms.get('channel_imap_port')
        new["smtp_host"] = request.forms.get('channel_smtp_host')
        new["smtp_port"] = request.forms.get('channel_smtp_port')
    elif pf == "RSS":
        new["method"] = request.forms.get('channel_method')
        new["url"] = request.forms.get('channel_url')
    os.chdir("." + delimeter + "User" + delimeter + str(k))
    sp.add_channel(new)
    sp[new["channel_name"]].request_url = lambda url: ap.request_url(url)
    sp[new["channel_name"]].fetch_code = lambda : ap.fetch_code()
    q.toggle_open(pf);
    os.chdir(".." + delimeter + ".." + delimeter)
    redirect("/auth/first/" + new["channel_name"])
    return "added!" 

@srfe.route('/register', method="GET")
def reg_direct():
    return static_file("reg.html", root='./views/html/')

@srfe.route('/register', method="POST")
def register():
    username = request.forms.get('username')
    password = request.forms.get('password') 
    v = {}
    v["username"] = username
    v['password'] = password
    v["token"] = hashlib.new('md5', username + password + str(time.time())).hexdigest()
    v["generate_time"] = time.time()
    cur = con.cursor()
    cur.execute("INSERT INTO user VALUES(null, ?, ?, ?, ?)", (v["username"], v["password"], v["token"], v["generate_time"]))
    con.commit(); 
    r = cur.execute("SELECT id FROM user WHERE username = ?", (v["username"], ))
    for m in r:
        k = m[0]
        user[str(k)] = v
        build_user_dir(str(m[0]))
        p = build_user_dir(k)
        os.chdir("." + delimeter + "User" + delimeter + str(k))
        ap = AuthProxy()
        sp = SNSPocket()
        sp.load_config(fn_channel= p + delimeter + "conf" + delimeter + "channel.json",fn_pocket= p + delimeter + "conf" + delimeter + "pocket.json")
        for c in sp.values():
            c.request_url = lambda url: ap.request_url(url)
            c.fetch_code = lambda : ap.fetch_code()
            c.auth()
        q = SRFEQueue(sp)
        q.connect()
        q.refresh_tags()
        ith = InputThread(q, sp, k)
        ith.daemon=True
        ith.start()
        user_sp[str(k)] = {"sp" : sp, "ap" : ap, "q" : q}
        os.chdir("../../")
    response.set_cookie("token", v["token"], httponly="on", max_age = TOKEN_VALID_PERIOD)
 
    return "Reg success"
    
@srfe.route('/js/<filename:path>')
def js_serve(filename):
    return     static_file(filename, root='./views/js/')

@srfe.route('/css/<filename:path>')
def css_serve(filename):
    return     static_file(filename, root='./views/css/')
    
@srfe.route('/images/<filename:path>')
def img_serve(filename):
    return static_file(filename, root='./views/static/')
    
@srfe.route('/')
@view('index')
@check_login
def index():
    return {}

@srfe.route('/config')
@view('config')
@check_login
def config():
    info = {}
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    pr = get_preference(k)
    if sp is None:
        return {"info": {}, "sp": {}, "ap": {}, "q": {}}
    for ch in sp:
        info[ch] = sp[ch].jsonconf
        info[ch]['expire_after'] = int(sp[ch].expire_after())
        info[ch]['is_authed'] = sp[ch].is_authed()
        info[ch]['need_auth'] = sp[ch].need_auth()
 
    con_user = sqlite3.connect("." + delimeter + "User" + delimeter + str(k) + delimeter + "srfe_queue.db", check_same_thread = False)
    con_user.isolation_level = None
    cur_user = con_user.cursor()
    r = cur_user.execute("SELECT platform, toggle FROM msg_toggle WHERE toggle <> 2")
    for m in r:
        for ch in info.values():
            logger.warning(str(ch))
            logger.warning(str(m[0]))
            if ch["platform"] == m[0]:
                ch["toggle"] = m[1]
    r = cur_user.execute("SELECT id, username, platform, toggle FROM user_toggle")
    bu = {}
    for m in r:
        bu[str(m[0])] = {
            "id": m[0],
            "username": m[1],
            "platform": m[2],
            "toggle": m[3]
        }
    
    return {"info": info, "sp": sp, "ap": ap, "q": q, "pr":pr, "bu": bu}

@srfe.route('/input')
@view('result')
@check_login
def input_new():
    q = token_to_user_queue(request.get_cookie('token'))
    q.input()
    redirect('/home_timeline')

@srfe.route('/operation')
@view('operation')
@check_login
def operation():
    # A stub
    return {}

@srfe.route('/operation/weight/reweight_all/:younger_than')
@view('result')
@check_login
def operation_weight_reweight_all(younger_than):
    q = token_to_user_queue(request.get_cookie('token'))
    younger_than = int(younger_than)
    op = "reweight messages younger than %d seconds" % younger_than
    re = q.reweight_all(younger_than) 
    return {"operation": op, "result": re}

@srfe.route('/operation/weight/prepare_training_data')
@view('result')
@check_login
def operation_prepare_training_data():
    q = token_to_user_queue(request.get_cookie('token'))
    op = "Prepare training data" 
    re = q.prepare_training_data() 
    return {"operation": op, "result": re}

@srfe.route('/operation/weight/train/:step')
@view('result')
@check_login
def operation_train(step):
    q = token_to_user_queue(request.get_cookie('token'))
    step = int(step)
    op = "Train for %s steps" % step
    re = q.train(step) 
    return {"operation": op, "result": re}

@srfe.route('/config/tag/toggle/:tag_id')
@check_login
def config_tag_toggle(tag_id):
    q = token_to_user_queue(request.get_cookie('token'))
    q.tag_toggle(int(tag_id))
    return

@srfe.route('/config/tag/add', method = 'POST')
@check_login
def config_tag_add():
    q = token_to_user_queue(request.get_cookie('token'))
    name = request.forms.get('name').strip()
    return {"result": q.tag_add(name)}
    
@srfe.route('/config/preference', method="POST")
@check_login
def config_preference_add():
    k = token_to_user_key(request.get_cookie('token'))
    for (w,l) in zip(request.forms.getall("winner"), request.forms.getall("loser")):
        if not [w,l] in user_sp[k]["pr"]["preference"] and w != l: 
            user_sp[str(k)]["pr"]["preference"].append([w, l])
    try:
        json.dump(user_sp[str(k)]["pr"], open('." + delimeter + "User" + delimeter + "' + str(k) + '" + delimeter + "conf" + delimeter + "autoweight.json', "w"))
    except Exception as e:
        logger.warning("Catch Exception in InputThread: %s", e)
    return "Preference has been added!"

@srfe.route('/config/preference/del', method="POST")
@check_login
def config_preference_del():
    return
    

@srfe.route('/auth/first/:channel_name')
@view('result')
@check_login
def auth_first(channel_name):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    op = "auth_first for %s" % (channel_name)
    ap.current_channel = channel_name
    sp[channel_name].auth_first()
    result = "request url: %s" % ap.requested_url
    redirect(ap.requested_url)
    return {'operation': op, 'result': result}

@srfe.route('/auth/second/')
@view('result')
@check_login
def auth_second():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    op = "auth_second for %s" % (ap.current_channel)
    qs = request.query_string
    # For compatibility with lower level interface. 
    # The snsbase parses code from the whole url. 
    ap.code_url = "http://snsapi.snsapi/auth/second/auth?%s" % qs
    sp[ap.current_channel].auth_second()
    logger.warning("c")
    os.chdir("." + delimeter + "User" + delimeter + str(k))
    sp[ap.current_channel].save_token()
    os.chdir(".." + delimeter + ".." + delimeter)
    logger.warning("d")
    result = "done: %s" % qs
    return {'operation': op, 'result': result}

@srfe.route('/raw/:msg_id')
@view('result')
@check_login
def raw(msg_id):
    q = token_to_user_queue(request.get_cookie('token'))
    op = "check raw of message %s" % (msg_id)
    result = q.raw(msg_id)
    return {'operation': op, 'result': result}

@srfe.route('/why/:msg_id')
@view('result')
@check_login
def raw(msg_id):
    q = token_to_user_queue(request.get_cookie('token'))
    op = "check why of message %s" % (msg_id)
    result = q.why(msg_id)
    return {'operation': op, 'result': result}

@srfe.route('/flag/:fl/:msg_id')
@view('result')
@check_login
def flag(fl, msg_id):
    q = token_to_user_queue(request.get_cookie('token'))
    op = "flag %s as %s" % (msg_id, fl)
    result = q.flag(msg_id, fl)
    return {'operation': op, 'result': result}

@srfe.route('/tag/:tg/:msg_id')
@view('result')
@check_login
def tag(tg, msg_id):
    q = token_to_user_queue(request.get_cookie('token'))
    op = "tag %s as %s" % (msg_id, tg)
    result = q.tag(msg_id, tg)
    return {'operation': op, 'result': result}

@srfe.route('/home_timeline/toggle_close/<platform>')
@check_login
def toggle_close(platform):
    q = token_to_user_queue(request.get_cookie('token'))
    q.toggle_close(platform)
    return

@srfe.route('/home_timeline/toggle_open/<platform>')
@check_login
def toggle_open(platform):
    q = token_to_user_queue(request.get_cookie('token'))
    q.toggle_open(platform)
    return

@srfe.route('/home_timeline/msg_num/:num')
@check_login
def page_per_number(num):
    q = token_to_user_queue(request.get_cookie('token'))
    q.inputnum = num
    return
    
@srfe.route('/wc.html')
@view('message')
@check_login
def home_timeline_ajax():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    if q.condLast > 1000:
        cond = "msg.time < " + str(q.condLast)
        (sl, tl) = q.output(count = q.inputnum, condition = cond)
    else:
        q.condLast = 0.0001 if q.condLast == 0.0 else q.condLast
        cond = "msg.weight <= " + str(q.condLast)
        logger.warning(cond)
        (sl, tl) = q.output_ranked(count = q.inputnum, younger_than = 86400, condition = cond)
        
    meta = {
            "unseen_count": q.get_unseen_count()
            }
    mp = {}
    logger.warning(str(len(sl)))
    if len(sl) > 0:
        q.condLast = sl[-1].parsed.time if q.condLast > 1000 else sl[-1].weight 
    q.condLast = 0.0001 if q.condLast == 0.0 else q.condLast
    logger.warning(str(q.condLast))
    for (s,v) in sp.items():
        mp[s] = q.msgMapping[v.platform]
    return {'sl': sl, 'mp': mp, 'tl': tl,  'snsapi_utils': snsapi_utils, 'tags': q.get_tags(), 'meta': meta, "token" : request.get_cookie('token')}

@srfe.route('/home_timeline')
@view('home_timeline')
@check_login
def home_timeline():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    (sl, tl) = q.output(q.inputnum)
    logger.warning(str(len(tl)))
    meta = {
            "unseen_count": q.get_unseen_count()
            }
    if len(sl) > 0:
        q.condLast = sl[-1].parsed.time
    mp = {}
    for (s,v) in sp.items():
        mp[s] = q.msgMapping[v.platform]
    return {'sl': sl, 'mp': mp, 'tl': tl,  'snsapi_utils': snsapi_utils, 'tags': q.get_tags(), 'meta': meta, "token" : request.get_cookie('token')}

@srfe.route('/block/:msg_id')
@check_login
def block_user(msg_id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    result = q.user_toggle(msg_id)
    return

@srfe.route('/block_toggle/:id')
@check_login
def block_user(id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    result = q.user_conf(id)
    return


@srfe.route('/ranked_timeline')
@view('home_timeline')
@check_login
def ranked_timeline():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    (sl, tl) = q.output_ranked(q.inputnum, 86400)
    meta = {
            "unseen_count": q.get_unseen_count()
            }
    logger.warning(str(q.condLast))
    if len(sl) > 0:
        if str(sl[-1]["weight"]) == "0.0":
            q.condLast = 0.0001  
        else:
            q.condLast = sl[-1]["weight"]
    logger.warning(str(q.condLast))
    mp = {}
    for (s,v) in sp.items():
        mp[s] = q.msgMapping[v.platform]
    return {'sl': sl, 'mp': mp, 'tl': tl,  'snsapi_utils': snsapi_utils, 'tags': q.get_tags(), 'meta': meta, "token" : request.get_cookie('token')}

@srfe.route('/sql', method = "GET")
@view('sql')
@check_login
def sql_get():
    return {}

@srfe.route('/sql', method = "POST")
@view('sql')
@check_login
def sql_post():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    condition = request.forms.get('condition').strip()
    sl = q.sql(condition)
    return {'sl': sl, 'snsapi_utils': snsapi_utils, \
            'tags': q.get_tags(), 'submit': True, 'condition': condition}

@srfe.route('/update', method = 'GET')
@view('update')
@check_login
def update_get():
    return {}

@srfe.route('/update', method = 'POST')
@view('update')
@check_login
def update_post():
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    os.chdir("." + delimeter + "User" + delimeter + str(k))
    sp.auth()
    status = request.forms.get('status')
    status = snsapi_utils.console_input(status)
    result = sp.update(status)
    os.chdir(".." + delimeter + ".." + delimeter)
    return {'result': result, 'status': status, 'submit': True}

@srfe.route('/forward/:msg_id', method = 'POST')
@check_login
def forward_post(msg_id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    os.chdir("." + delimeter + "User" + delimeter + str(k))
    sp.auth()
    comment = request.forms.get('comment')
    ch = request.forms.getall("platform")
    comment = snsapi_utils.console_input(comment)
    op = "forward status '%s' with comment '%s'" % (msg_id, comment)
    result = q.forward(msg_id, comment, channel=ch)
    os.chdir(".." + delimeter + ".." + delimeter)
    return {'result': result, 'operation': op}

@srfe.route('/reply/:msg_id', method = 'POST')
@check_login
def reply_post(msg_id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    sp.auth()
    comment = request.forms.get('comment')
    ch = request.forms.get("platform")
    comment = snsapi_utils.console_input(comment)
    op = "reply status '%s' with comment '%s'" % (msg_id, comment)
    result = q.reply(msg_id, comment, channel=ch)
    return {'result': result, 'operation': op}

@srfe.route('/like/:msg_id', method = 'POST')
@check_login
def like_post(msg_id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    sp.auth()
    comment = request.forms.get('comment')
    ch = request.forms.get("platform")
    comment = snsapi_utils.console_input(comment)
    op = "like status '%s'" % (msg_id, )
    result = q.like(msg_id, channel=ch)
    return {'result': result}

@srfe.route('/reply/:msg_id', method = 'POST')
@check_login
def unlike_post(msg_id):
    (k, sp, ap, q) = token_to_user(request.get_cookie('token'))
    sp.auth()
    comment = request.forms.get('comment')
    ch = request.forms.get("platform")
    comment = snsapi_utils.console_input(comment)
    op = "unlike status '%s'" % (msg_id, )
    result = q.unlike(msg_id, channel=ch)
    return {'result': result}
    
def build_dir():
    path = os.getcwd() + delimeter + "User"
    if not os.path.exists(path):
        os.makedirs(path)
    return
    
def build_user_dir(k):
    path = os.getcwd() + delimeter + "User" + delimeter + ""+ str(k)
    if not os.path.exists(path):
        os.makedirs(path)
    path = os.getcwd() + delimeter + "User" + delimeter + ""+ str(k) + delimeter + "conf"
    if not os.path.exists(path):
        os.makedirs(path)
    path = os.getcwd() + delimeter + "User" + delimeter + ""+ str(k) + delimeter + "save"
    if not os.path.exists(path):
        os.makedirs(path)
    return os.getcwd() + delimeter + "User" + delimeter + ""+ str(k)

def build_db():
    cur = con.cursor()
    try:
        cur.execute("CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, username text, passwd text, token text, generate_time INT)")  
        con.commit()
    except sqlite3.OperationalError, e:
        if e.message == "table user already exists":
            return 
        else:
            raise e
    return
    
def set_usermsg():
    user={}
    cur = con.cursor()  
    r = cur.execute("SELECT * FROM user")
    for m in r:
        user[m[0]] = {"username": m[1], "password": m[2], "token" : m[3], "generate_time" : m[4]}
    return user 
    
def begin_user_thread(user):
    user_sp = {}
    ap = AuthProxy()
    for (k,v) in user.items():
        p = build_user_dir(k)
        os.chdir("." + delimeter + "User" + delimeter + str(k))
        sp = SNSPocket()
        sp.load_config(fn_channel= p + delimeter + "conf" + delimeter + "channel.json",fn_pocket= p + delimeter + "conf" + delimeter + "pocket.json")
        for c in sp.values():
            c.request_url = lambda url: ap.request_url(url)
            c.fetch_code = lambda : ap.fetch_code()
            c.auth()
        q = SRFEQueue(sp)
        q.connect()
        q.refresh_tags()
        ith = InputThread(q, sp, k)
        ith.daemon=True
        ith.start()
        user_sp[str(k)] = {"sp" : sp, "ap" : ap, "q" : q}
        os.chdir(".." + delimeter + ".." + delimeter)
    return user_sp
        
def check_token(token):
    if token is None:
        return False
    for (k, v) in user.items():
        if token == v["token"]:
            if time.time() - v["generate_time"] < TOKEN_VALID_PERIOD:
                return True
            else:
                v["token"] = ""
                cur = con.cursor()
                cur.execute("UPDATE user SET token = NULL, generate_time = NULL WHERE id = ?", (k, ))
                con.commit();
    return False
 
def token_to_user(token):     
    for (k, v) in user.items():
        if token == v["token"]:
            return (k, user_sp[str(k)]["sp"], user_sp[str(k)]["ap"], user_sp[str(k)]["q"])

def token_to_user_queue(token):     
    for (k, v) in user.items():
        if token == v["token"]:
            return user_sp[str(k)]["q"]

def token_to_user_key(token):     
    for (k, v) in user.items():
        if token == v["token"]:
            return str(k)
            
def get_preference(k):
    json_autoweight = json.load(open('.' + delimeter + "User" + delimeter + str(k)  + delimeter + 'conf' + delimeter + 'autoweight.json'))
    preference = json_autoweight['preference'] if not json_autoweight is None else {}
    user_sp[str(k)]["pr"] = json_autoweight
    return preference 
    

con = sqlite3.connect("srfe_queue.db", check_same_thread = False)
con.isolation_level = None
    
build_db();
build_dir();
user = set_usermsg()

if __name__ == '__main__':

    con = sqlite3.connect("srfe_queue.db", check_same_thread = False)
    con.isolation_level = None
    build_db();
    build_dir();
    user = set_usermsg()
    user_sp = begin_user_thread(user)
    jsonconf={}
    INPUT_GAP = jsonconf.get('input_gap', 60 * 5) # 5 Minutes per fetch
    #logger.debug("INPUT_GAP: %s", INPUT_GAP)

    # Use the line to disable catching "Internal Server Erros"

    jsonconf={}
    srfe.run(host = jsonconf.get('host', '127.0.0.1'),
            port = jsonconf.get('port', 8080),
            debug = jsonconf.get('debug', True),
            reloader = jsonconf.get('reloader', False)
            )
    
