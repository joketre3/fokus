import json

def mk(id, text, quad='q1', est=1, **kw):
    t = dict(id=id, text=text, verbi=text.split(' ')[0], kuvaus=' '.join(text.split(' ')[1:]),
             quad=quad, important=quad in ('q1','q2'), urgent=quad in ('q1','q3'),
             est=est, done=False, frog=False, waiting=False, schedule=None,
             scheduled_hidden=False, projectId=None, pomos=0, doneAt=None,
             tags=[], lisatiedot=None, linkki=None,
             chainId=None, chainPosition=None, chainTotal=None, isChained=False)
    t.update(kw); return t

TASKS = [
    mk(1, 'Soita asiakkaalle A', 'q1', 2, frog=True),
    mk(2, 'Kirjaa muistio B',    'q1', 1),
    mk(3, 'Sovi tapaaminen C',   'q2', 3),
    mk(4, 'Tarkista raportti D', 'q2', 0.5),
    mk(5, 'Vie posti E',         'q3', 0.5),
    mk(6, 'Selvita asia F',      'q4', 1),
    mk(7, 'Tee pikajuttu G',     'q3', 0),   # quick task (2 min rule)
    mk(8, 'Varaa tila H',        'q2', 1),
    mk(9, 'Odottava I',          'q1', 1, waiting=True),
    mk(10,'Valmis J',            'q1', 2, done=True, pomos=2, doneAt='2026-08-07T10:00:00.000Z'),
]

def seed_js(active=1, turn=(2,3), tasks=None, extra=""):
    data = dict(tasks=tasks if tasks is not None else TASKS,
                active=active, turn=list(turn), nid=100)
    return (
      "localStorage.setItem('fap_onboarded','1');\n"
      "localStorage.setItem('fap_active_ws','work');\n"
      "localStorage.setItem('fap_workspaces', %s);\n"
      "localStorage.setItem('eis_v5_work', %s);\n"
      "localStorage.setItem('fap_timer_settings', %s);\n%s"
      % (json.dumps(json.dumps([{"id":"work","name":"Työ"}])),
         json.dumps(json.dumps(data)),
         json.dumps(json.dumps({"work":25,"sbrk":5,"lbrk":15})),
         extra)
    )
