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

# ── Frankenstein-kortti ──────────────────────────────────────────────
# Paquette, Game Cards 101: ennen visuaalin lukitsemista tehdään testikortti
# jossa JOKAINEN kenttä on äärimmillään. Jos kehys kestää tämän, se kestää
# koko pakan eikä typografiaa tarvitse kutistaa loppumetreillä.
#
# Äärimmäiset arvot tässä koodikannassa:
#   verbi       'Aikatauluta'  — pisin SPLIT_VERBS-alkio (11 merkkiä)
#   est         8              — suurin liukusäätimen arvo (mkCostPips romauttaa
#                                >4 muotoon "1 pallo ×N"; mittari ei romauta)
#   quad        q3             — vaalein taide, tarvitsee vahvimman scrimin
#   lisatiedot  2 riviä        — työntää meta-rivin alas
#   schedule    toistuva       — fmtSchedule() lisää oman rivinsä lisätietoihin
#   + frog + handForced + projectId + linkki yhtä aikaa
FRANK_TEXT = ('Aikatauluta moniammatillinen verkostopalaveri asiakkaan '
              'kotikäynnin jatkotoimista')
FRANK_NOTES = ('Muista varata neuvotteluhuone ja lähettää esityslista '
               'osallistujille viimeistään kaksi arkipäivää ennen tapaamista.')

def frank(id, **kw):
    """Maksimikuormitettu kortti. kw:llä siirretään se areenalle/rataan/käteen."""
    t = mk(id, FRANK_TEXT, 'q3', 8,
           verbi='Aikatauluta',
           kuvaus=FRANK_TEXT[len('Aikatauluta '):],
           frog=True, handForced=True, projectId=1, pomos=3,
           lisatiedot=FRANK_NOTES,
           linkki='https://example.invalid/verkostopalaveri',
           schedule={'type': 'repeat', 'time': '08:15', 'days': [1, 2, 3, 4, 5]})
    t.update(kw); return t

# Kolme kappaletta, koska kortti renderöityy eri moodissa joka paikassa:
# 'arena' (täysi runko + napit), 'lane' ja 'hand' (kompakti .tcg-card--hand).
# projects-avain tarvitaan tai projektinimi jää piirtymättä.
FRANK_TASKS = [
    frank(1),                       # areenalle (active=1)
    frank(2, frog=False),           # rataan (turn)
    frank(3, frog=False, quad='q1'),  # käteen
    frank(4, frog=False, quad='q2'),
    frank(5, frog=False, quad='q1'),
]
FRANK_PROJECTS = [{"id": 1, "name": "Lastensuojelun jälkihuolto", "color": "#a84c28"}]


def seed_js(active=1, turn=(2,3), tasks=None, extra="", projects=None):
    data = dict(tasks=tasks if tasks is not None else TASKS,
                active=active, turn=list(turn), nid=100)
    if projects is not None:
        data["projects"] = projects
        data["pnid"] = max([p["id"] for p in projects] or [0]) + 1
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
