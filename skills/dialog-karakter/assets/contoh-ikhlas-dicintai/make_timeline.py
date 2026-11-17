import json
# SFX ikhlas-dicintai: tiap gerak kamera, whip, judul, label, balon dialog, kartu hadits, langkah pasukan, api, angin. Tanpa musik.
# SFX diredam (×0,35) selama run suara PRAJURIT & IMAM supaya dialog tidak tertutup.
c=json.load(open('film-remotion/public/cues.json'))
S=[s['start'] for s in c['scenes']]; S1,S2,S3,S4,S5,S6,S7,S8,S9=S[1:10]; END=S[10]
K={l.split(':')[0]:float(l.split(':')[1]) for l in open('shots/k.txt') if ':' in l}
RUNS=[(r['s'],r['e']) for r in c['speech'] if r['spk']!='NARATOR']
def inrun(t,pad=0.12): return any(a-pad<=t<=b+pad for a,b in RUNS)
sfx=[]
def a(t,kind,gain,**k):
    g=gain*(0.35 if inrun(t) else 1.0)
    sfx.append(dict(t=round(t,2),kind=kind,gain=round(g,4),**k))
def bed(t0,t1,kind,gain,**k):   # bunyi panjang, dipecah di sekitar run dialog
    cuts=[t0]
    for s,e in RUNS:
        if t0<s<t1: cuts.append(s-0.1)
        if t0<e<t1: cuts.append(e+0.1)
    cuts.append(t1); cuts=sorted(cuts)
    for x,y in zip(cuts,cuts[1:]):
        if y-x<0.15: continue
        mid=(x+y)/2; g=gain*(0.35 if inrun(mid,0) else 1.0)
        if kind in ('room','riser'): sfx.append(dict(t=round(x,2),kind=kind,gain=round(g,4),until=round(y,2),**k))
        else: sfx.append(dict(t=round(x,2),kind=kind,gain=round(g,4),dur=round(y-x,2),**k))
def move(t0,t1,g=0.03):
    a(t0-0.05,'whoosh',g,dur=max(0.5,t1-t0+0.3)); a(t0,'riser',g*0.4,until=t1)
def whip(t0,t1,g=0.05):
    a(t0-0.08,'whoosh',g,dur=0.55); a(t1,'thunk',g*0.6); a(t1+0.01,'drop',g*0.4,dur=0.4)
def title(t,p=1.0,g=0.03): a(t-0.06,'whoosh',g*0.6,dur=0.35); a(t,'pop',g,pitch=p)
def label(t,p=1.2,g=0.022): a(t,'klik',g,pitch=p); a(t+0.04,'plip',g*0.8,pitch=p)
def ticks(t0,t1,n,g=0.012,p0=0.8,dp=0.05,kind='klik'):
    for i in range(n): a(t0+(t1-t0)*i/max(1,n-1),kind,g,pitch=p0+dp*i)
def word(t,p=1.3,g=0.02): a(t,'clink',g,pitch=p); a(t+0.02,'plip',g*0.5,pitch=p*0.8)
def slide(t,g=0.024): a(t-0.05,'slide',g,dur=0.55); a(t+0.1,'plip',g*0.7,pitch=1.1)
def impact(t,g=0.045): a(t,'impact',g); a(t+0.01,'drop',g*0.5,dur=0.6)
def steps(t0,t1,dt=0.27,g=0.012,heavy=False):
    n=int((t1-t0)/dt)
    for i in range(n):
        x=t0+i*dt
        a(x,'thunk',g*(1.2 if heavy else 1.0)); a(x+0.02,'scrape',g*0.5,dur=0.12)
def bubble(t,p=1.0):   # balon dialog muncul: pop + tick "voice-in"
    sfx.append(dict(t=round(t,2),kind='pop',gain=0.03,pitch=p)); sfx.append(dict(t=round(t+0.05,2),kind='klik',gain=0.022,pitch=1.6*p))
    sfx.append(dict(t=round(t-0.06,2),kind='whoosh',gain=0.018,dur=0.3)); sfx.append(dict(t=round(t+0.12,2),kind='plip',gain=0.016,pitch=1.4*p))

# transisi adegan
for s in [S1,S2,S3,S4,S5,S6,S7,S8,S9]:
    a(s-0.5,'riser',0.012,until=s-0.02); a(s,'drop',0.016,dur=0.5)

# 1 hook: kemah malam, api unggun
bed(0.0,K['whip_madinah'],'room',0.016); bed(0.05,K['whip_madinah'],'sizzle',0.010); bed(0.2,K['whip_madinah'],'hiss',0.007)
a(0.02,'whoosh',0.05,dur=1.4); a(0.08,'powerup',0.022,dur=0.9)
for i in range(14): a(0.4+i*0.62+0.2*((i*7)%3),'klik',0.008,pitch=0.6+0.05*(i%4))   # kayu api berderak
a(K['hi_spam'],'pop',0.034,pitch=1.15); a(K['hi_spam']+0.02,'thunk',0.025)
a(2.6,'rattle',0.006,dur=1.6,rate=5.0)   # gumam pasukan
a(K['hi_mencintai']-0.3,'riser',0.02,until=K['hi_mencintai']); impact(K['hi_mencintai'],0.04); a(K['hi_mencintai']+0.03,'powerup',0.03,dur=1.0)
for i in range(4): a(K['hi_mencintai']+0.15+i*0.1,'clink',0.018,pitch=1.6+i*0.15)
move(K['cam_hook']+0.5,K['cam_hook_end'],0.018)

# 2 Madinah → pasukan berangkat → kemah
whip(K['whip_madinah'],K['whip_madinah_end'],0.055)
bed(K['whip_madinah_end'],K['march_end']+0.3,'room',0.018); bed(K['whip_madinah_end'],K['march_end'],'hiss',0.009)
a(K['door_glow'],'powerup',0.028,dur=0.9); a(K['door_glow']+0.1,'clink',0.02,pitch=1.4); a(K['door_glow']+0.2,'clink',0.016,pitch=1.8)
label(K['label_madinah'],1.1)
title(K['title_utus'],0.95,0.03)
a(K['march_start'],'clack',0.02); a(K['march_start']+0.1,'clack',0.016)   # tombak diangkat
steps(K['march_start']+0.15,K['march_end'],0.26,0.014,True)
a(K['march_start']+0.3,'whoosh',0.024,dur=K['march_end']-K['march_start']); a(K['march_start']+0.4,'hiss',0.01,dur=2.0)
label(K['label_imam_march'],1.25)
move(K['cam_camp'],K['cam_camp_end'],0.035)
bed(K['cam_camp_end'],K['whip_back'],'room',0.016); bed(K['cam_camp_end'],K['whip_back'],'sizzle',0.011)
for i in range(6): a(K['cam_camp_end']+0.3+i*0.7,'klik',0.008,pitch=0.6+0.07*(i%3))
label(K['label_kemah'],1.0); a(K['label_kemah']+0.2,'slide',0.012,dur=0.4)   # kain tenda
title(K['title_imam'],1.0,0.03); label(K['label_imam_camp'],1.3)
a(K['cam_push_imam']-0.05,'whoosh',0.04,dur=0.75); a(K['cam_push_imam'],'riser',0.022,until=K['cam_push_imam_end'])
title(K['title_ditutup'],1.05,0.03)
a(K['qul_glow']+0.25,'powerup',0.035,dur=1.2)
for i in range(4): a(K['qul_glow']+0.3+i*0.12,'clink',0.02,pitch=1.3+i*0.15)
a(K['hi_ikhlas2'],'impact',0.035); a(K['hi_ikhlas2']+0.02,'clink',0.024,pitch=2.0)

# 3 kembali ke Madinah, prajurit melapor
whip(K['whip_back'],K['whip_back_end'],0.06)
bed(K['whip_back_end'],K['flash_zoom'],'room',0.016); bed(K['whip_back_end'],K['flash_zoom'],'hiss',0.006)
title(K['title_lapor'],0.95,0.03)
steps(K['group_arrive'],K['group_arrive']+1.2,0.3,0.012,True); a(K['group_arrive']+0.1,'clack',0.016)
steps(K['group_arrive']+0.1,K['cam_push_pr']+0.05,0.36,0.012)   # prajurit melangkah ke pintu
move(K['cam_push_pr'],K['cam_push_pr_end'],0.03)
bubble(K['bubble_p1'],1.0); a(K['bubble_p1_out'],'whoosh',0.014,dur=0.3)

# 4 sabda: tanyakan
a(K['cam_tilt_light'],'whoosh',0.028,dur=0.8); a(K['cam_tilt_light_end']-0.1,'powerup',0.02,dur=0.8)
slide(K['card_tanya'],0.026); word(K['card_tanya']+0.6,1.3); word(K['card_tanya']+0.75,1.6)
a(K['pill_hadits']+0.1,'plip',0.022,pitch=1.0)

# 5 prajurit bertanya pada imam
whip(K['whip_dialog'],K['whip_dialog_end'],0.05)
steps(K['whip_dialog']+0.1,K['whip_dialog_end']+0.1,0.15,0.012)
bubble(K['bubble_p2'],1.05); a(K['bubble_p2_out'],'whoosh',0.012,dur=0.3)

# 6 imam menjawab
move(K['cam_push_imam6'],K['cam_push_imam6_end'],0.028)
bubble(K['bubble_i1'],0.85)
slide(K['card_imam'],0.022); word(K['card_imam']+0.3,1.2,0.016); word(K['card_imam2'],1.4,0.016)
a(K['bubble_i1_out'],'whoosh',0.014,dur=0.3)

# 7 Allah mencintainya
a(K['cam_back_light']-0.05,'whoosh',0.04,dur=0.8); a(K['cam_back_light'],'riser',0.016,until=K['cam_back_light_end'])
a(K['cam_back_light_end'],'powerup',0.02,dur=0.9)
slide(K['card_cinta'],0.026); word(K['card_cinta']+0.6,1.3); word(K['card_cinta']+0.75,1.6)
a(K['cam_pull_wide7']-0.05,'whoosh',0.04,dur=1.0); a(K['burst']-0.45,'riser',0.03,until=K['burst'])
impact(K['burst'],0.055); a(K['burst']+0.03,'powerup',0.045,dur=1.6); a(K['burst']+0.05,'pop',0.032,pitch=0.85)
ticks(K['burst']+0.1,K['burst']+1.0,10,0.016,1.4,0.1,'clink')
title(K['hi_cinta']+0.02,1.1,0.026)
a(K['flash_zoom'],'whoosh',0.05,dur=0.8); a(K['flash_zoom'],'riser',0.03,until=K['flash_peak'])
impact(K['flash_peak'],0.05); a(K['flash_peak']+0.02,'powerup',0.035,dur=1.0)

# 8 lembar Al-Ikhlas: 4 sifat
bed(K['page_in'],S8-0.1,'room',0.014); bed(K['page_in']+0.2,S8-0.2,'hiss',0.006)
title(K['title_sifat'],1.0,0.03)
for i in range(4): a(K['markers']+i*0.12,'pop',0.028,pitch=1.0+0.12*i); a(K['markers']+i*0.12+0.03,'clink',0.014,pitch=1.4+0.15*i)
title(K['title_4ayat'],0.95,0.03)
for i,(m0,m1,tt) in enumerate([('cam_l1','cam_l1_end','title_esa'),('cam_l2','cam_l2_end','title_meminta'),('cam_l3','cam_l3_end','title_beranak'),('cam_l4','cam_l4_end','title_setara')]):
    move(K[m0],K[m1],0.032); title(K[tt],0.9+0.08*i,0.03)
for i in range(15): word(K[f'w{i}'],1.1+0.06*i,0.017)
a(K['cam_page_out']-0.2,'riser',0.02,until=K['cam_page_out']); impact(K['cam_page_out'],0.04); a(K['cam_page_out']+0.02,'powerup',0.035,dur=1.0)
ticks(K['cam_page_out'],K['cam_page_out']+0.7,15,0.012,1.1,0.07,'clink')
a(K['fade_to_imam'],'whoosh',0.04,dur=0.9)

# 9 pelajaran
bed(S8+0.1,K['matchcut'],'room',0.015)
a(K['aura_imam']+0.2,'powerup',0.026,dur=1.2); ticks(K['aura_imam']+0.3,K['aura_imam']+1.4,6,0.012,1.5,0.1,'clink')
title(K['title_dicintai'],1.0,0.03); a(K['hi_dicintai']+0.05,'clink',0.022,pitch=1.7)
title(K['title_mencintai'],1.05,0.03); a(K['hi_mencintai9']+0.05,'clink',0.02,pitch=1.9)
a(K['matchcut']-0.05,'whoosh',0.045,dur=0.8); a(K['matchcut'],'riser',0.02,until=K['matchcut_end']); a(K['matchcut_end'],'drop',0.022,dur=0.6)
bed(K['matchcut_end'],END-0.2,'room',0.014); bed(K['matchcut_end']+0.2,END-0.3,'hiss',0.005)
title(K['title_bacalah'],1.0,0.03)
a(K['hafalan_lines'],'thread',0.01,dur=1.5,rate=26.0); ticks(K['hafalan_lines']+0.1,K['title_cinta9']-0.1,9,0.009,0.7,0.0,'klik')
title(K['title_hafalan'],0.8,0.028); a(K['hi_hafalan']+0.05,'powerdown',0.014,dur=0.6)
title(K['title_cinta9'],1.1,0.03)
a(K['mushaf_glow']-0.25,'riser',0.02,until=K['mushaf_glow']); a(K['mushaf_glow'],'powerup',0.04,dur=1.3); impact(K['mushaf_glow'],0.03)
ticks(K['mushaf_glow']+0.1,K['mushaf_glow']+1.3,8,0.014,1.6,0.1,'clink')

# 10 CTA
a(K['crane_window']-0.05,'whoosh',0.04,dur=1.0); a(K['crane_window'],'riser',0.014,until=K['crane_window_end'])
title(K['title_tulis'],1.1); a(K['card_komentar'],'slide',0.022,dur=0.5)
for i in range(19): a(K['card_komentar']+0.06+i*0.063,'key',0.015)   # mengetik "Aku cinta Al-Ikhlas"
a(K['card_komentar']+1.3,'klik',0.025,pitch=1.2)
a(K['btn_simpan'],'pop',0.035,pitch=1.0); a(K['btn_simpan']+0.05,'clink',0.02,pitch=1.5)
a(K['btn_bagikan'],'pop',0.035,pitch=1.2); a(K['btn_bagikan']+0.05,'clink',0.02,pitch=1.8)
a(END-0.15,'whoosh',0.05,dur=1.0); a(END,'powerup',0.035,dur=0.8)
for i in range(3): a(END+0.15+i*0.1,'clink',0.02,pitch=1.5+i*0.2)

json.dump(dict(duration=c['duration'],narration=dict(file='voice/narasi.wav',at=0),beats=[dict(at=0)],bed=dict(drops=[]),sfx=sorted(sfx,key=lambda x:x['t'])),open('film/timeline.json','w'),indent=1)
print('sfx',len(sfx))
