import json
# SFX gunung-akar: tiap gerak kamera, label, judul, dan pukulan dapat bunyi. Tanpa musik.
c=json.load(open('film-remotion/public/cues.json'))
S=[s['start'] for s in c['scenes']]; S1,S2,S3,S4,S5,S6=S[1:7]; END=S[7]
K={l.split(':')[0]:float(l.split(':')[1]) for l in open('shots/k.txt') if ':' in l}
sfx=[]
def a(t,kind,gain,**k): sfx.append(dict(t=round(t,2),kind=kind,gain=gain,**k))
def move(t0,t1,g=0.03):   # dorong/tarik kamera halus
    a(t0-0.05,'whoosh',g,dur=max(0.5,t1-t0+0.3)); a(t0,'riser',g*0.4,until=t1)
def whip(t0,t1,g=0.05):   # whip cepat
    a(t0-0.08,'whoosh',g,dur=0.55); a(t1,'thunk',g*0.6); a(t1+0.01,'drop',g*0.4,dur=0.4)
def title(t,p=1.0,g=0.03): a(t-0.06,'whoosh',g*0.6,dur=0.35); a(t,'pop',g,pitch=p)
def label(t,p=1.2,g=0.022): a(t,'klik',g,pitch=p); a(t+0.04,'plip',g*0.8,pitch=p)
# transisi adegan
for s in [S1,S2,S3,S4,S5,S6]:
    a(s-0.5,'riser',0.012,until=s-0.02); a(s,'drop',0.018,dur=0.5)

# 1 hook: angin malam pegunungan, teks hook, "?" di bawah tanah
a(0.0,'room',0.02,until=S1-0.1); a(0.05,'whoosh',0.05,dur=1.6); a(0.1,'powerup',0.025,dur=0.8)
a(0.35,'pop',0.03,pitch=0.9); a(0.6,'clink',0.02,pitch=1.4); a(0.8,'thunk',0.03)
a(1.0,'hiss',0.012,dur=2.5); a(1.6,'plip',0.02,pitch=0.8); a(2.4,'plip',0.018,pitch=0.7)
a(1.2,'riser',0.014,until=S1-0.1)

# 2a-2e: puncak, whip ke bawah tanah, akar, 1855, gempa
move(K['cam_peak_start'],K['cam_peak_end'],0.035)
title(K['title_lihat'],1.0); label(K['label_puncak'],1.3)
a(K['label_puncak']+0.15,'clink',0.018,pitch=1.7)
whip(K['cam_whip_down'],K['cam_whip_down_end'],0.055)
a(K['ground_curtain_open'],'crunch',0.03,size=1.2); a(K['ground_curtain_open']+0.05,'scrape',0.025,dur=0.6)
title(K['title_tersembunyi'],0.85)
a(K['cam_track_root_start'],'whoosh',0.03,dur=K['cam_track_root_end']-K['cam_track_root_start']+0.4)
a(K['root_grow_start'],'scrape',0.025,dur=K['cam_track_root_end']-K['root_grow_start'])
a(K['root_grow_start'],'rattle',0.012,dur=K['cam_track_root_end']-K['root_grow_start'],rate=5)
a(K['root_grow_start'],'riser',0.016,until=K['cam_track_root_end'])
title(K['title_akar'],0.8,0.035); label(K['label_akar'],1.1)
for i in range(6): a(K['label_akar']+0.2+i*0.18,'klik',0.012,pitch=0.7+i*0.08)   # penggaris kedalaman berdetak
label(K['label_puluhan_km'],0.9,0.026); a(K['cam_track_root_end'],'thunk',0.035); a(K['cam_track_root_end']+0.02,'impact',0.025)
move(K['cam_pullout_wide'],K['cam_pullout_wide_end'],0.03)
a(K['card_airy']-0.05,'slide',0.028,dur=0.6); a(K['title_1855'],'clack',0.03)
a(K['n1855_lands'],'impact',0.035); a(K['n1855_lands']+0.03,'snap',0.025); a(K['n1855_lands']+0.1,'clink',0.02,pitch=1.3)
for i in range(4): a(K['title_1855']+0.1+i*0.14,'key',0.014)
title(K['title_gempa'],0.75,0.03)
for i,w in enumerate(['wave1','wave2','wave3']):
    a(K[w],'drop',0.03,dur=0.6); a(K[w]+0.02,'thunk',0.02+i*0.005); a(K[w]+0.05,'rattle',0.01,dur=0.35,rate=12)
a(K['shake_gempa'],'impact',0.05); a(K['shake_gempa']+0.01,'rattle',0.02,dur=0.8,rate=14); a(K['shake_gempa']+0.03,'crunch',0.025,size=1.4)
a(K['root_flash'],'zap',0.02,dur=0.35); a(K['root_flash']+0.05,'powerup',0.025,dur=0.6)
a(K['title_terbukti'],'snap',0.035); a(K['title_terbukti']+0.02,'impact',0.035); a(K['title_terbukti']+0.08,'clink',0.025,pitch=1.6)

# 3 crane ke langit, panel ayat An-Naba 6-7
a(K['cam_crane_up']-0.05,'whoosh',0.04,dur=K['cam_crane_up_end']-K['cam_crane_up']+0.5)
a(K['cam_crane_up'],'riser',0.02,until=K['cam_crane_up_end']); a(K['cam_crane_up_end'],'powerup',0.025,dur=0.8)
a(K['cam_crane_up_end']+0.1,'hiss',0.01,dur=2.0)
for i in range(5): a(K['cam_crane_up_end']+0.15+i*0.11,'clink',0.012,pitch=1.6+i*0.12)   # bintang berkelip
a(K['title_1400']-0.05,'whoosh',0.03,dur=0.4); a(K['title_1400'],'impact',0.04); a(K['title_1400']+0.03,'snap',0.025)
for i in range(4): a(K['title_1400']+0.1+i*0.07,'klik',0.014,pitch=1.0+i*0.15)
a(K['pill_annaba'],'slide',0.022,dur=0.5); a(K['pill_annaba']+0.1,'plip',0.022,pitch=1.1)
a(K['panel_ayat']-0.1,'whoosh',0.025,dur=0.5); a(K['panel_ayat'],'powerup',0.025,dur=1.0); a(K['panel_ayat']+0.15,'clink',0.02,pitch=1.2)
for k,p in [('tr_bukankah',1.2),('tr_hamparan',1.35),('tr_gunung',1.5)]: a(K[k],'plip',0.018,pitch=p); a(K[k]+0.05,'klik',0.012,pitch=p)
a(K['tr_pasak']-0.3,'riser',0.014,until=K['tr_pasak']); a(K['tr_pasak'],'pop',0.03,pitch=0.9)
a(K['pasak_glow'],'powerup',0.03,dur=0.8); a(K['pasak_glow']+0.1,'clink',0.025,pitch=1.8)

# 4 perkemahan: pasak dipukul, tilt ke bawah, morph pasak -> akar
whip(K['whip_side_to_camp'],K['whip_side_end'],0.05)
a(K['whip_side_end']+0.1,'room',0.015,until=K['morph_start'])
title(K['title_apa_pasak'],1.1); a(K['title_apa_pasak']+0.2,'thread',0.014,dur=0.8,rate=20)   # tali tenda
move(K['cam_closeup_peg'],K['cam_closeup_peg_end'],0.03)
title(K['title_kelihatan'],1.0); label(K['label_ujung'],1.25)
for i,h in enumerate(['hit1','hit2','hit3']):
    a(K[h]-0.12,'whoosh',0.02,dur=0.2); a(K[h],'thunk',0.05+i*0.005); a(K[h]+0.005,'clack',0.035); a(K[h]+0.02,'crunch',0.015,size=0.6)
a(K['cam_tilt_peg'],'slide',0.025,dur=K['cam_tilt_peg_end']-K['cam_tilt_peg']); a(K['cam_tilt_peg'],'whoosh',0.025,dur=1.1)
a(K['ground_see_through'],'hiss',0.015,dur=0.6); a(K['ground_see_through']+0.05,'powerup',0.02,dur=0.6)
a(K['shaft_glow'],'clink',0.022,pitch=1.4); title(K['title_tertanam'],0.85)
a(K['morph_start']-0.35,'riser',0.02,until=K['morph_end']); a(K['morph_start'],'whoosh',0.04,dur=0.8)
a(K['morph_start']+0.1,'thread',0.012,dur=0.5,rate=40); a(K['morph_end'],'impact',0.04); a(K['morph_end']+0.03,'powerup',0.025,dur=0.7)
label(K['label_pasak'],1.2); a(K['label_gunung']+0.12,'klik',0.022,pitch=1.0); a(K['label_gunung']+0.16,'plip',0.018,pitch=1.0)
a(K['title_mirip'],'snap',0.03); a(K['title_mirip']+0.02,'pop',0.03,pitch=1.0); a(K['check_mirip']+0.1,'clink',0.025,pitch=1.6); a(K['check_mirip']+0.22,'clink',0.02,pitch=2.0)

# 5 Makkah malam: siapa yang memberi tahu? -> Allah
whip(K['whip_up_to_makkah'],K['whip_up_end'],0.05)
a(K['whip_up_end']+0.1,'room',0.016,until=K['whip_down_to_root']); a(K['whip_up_end']+0.2,'hiss',0.01,dur=2.5)
title(K['title_siapa'],0.8,0.032)
a(K['chip_mata'],'pop',0.025,pitch=1.1); a(K['chip_alat'],'pop',0.025,pitch=1.25)
a(K['strike_chips'],'scrape',0.03,dur=0.4); a(K['strike_chips']+0.2,'scrape',0.025,dur=0.4); a(K['strike_chips'],'thunk',0.025)
a(K['chips_out'],'whoosh',0.025,dur=0.5); a(K['chips_out']+0.05,'powerdown',0.015,dur=0.6)
a(K['cam_push_light']-0.4,'riser',0.02,until=K['cam_push_light']+0.6); a(K['cam_push_light'],'whoosh',0.03,dur=0.9)
a(K['light_descends'],'powerup',0.035,dur=1.2); a(K['light_descends']+0.05,'hum',0.01,until=K['whip_down_to_root']-0.1)
a(K['title_allah'],'impact',0.03); for_p=[1.4,1.6,1.8]
for i,p in enumerate(for_p): a(K['title_allah']+0.08+i*0.1,'clink',0.02,pitch=p)
a(K['sub_menciptakan'],'slide',0.02,dur=0.5); a(K['sub_menciptakan']+0.1,'plip',0.02,pitch=1.0)

# 6 pelajaran: akar IMAN, cabang shalat/doa/kebaikan, KOKOH
whip(K['whip_down_to_root'],K['whip_down_end'],0.055)
a(K['whip_down_end']+0.02,'crunch',0.025,size=1.0)
title(K['title_kuat'],0.8,0.035); a(K['title_kuat']+0.03,'thunk',0.025)
move(K['cam_push_akarnya'],K['cam_push_akarnya']+0.8,0.03); label(K['label_akar6'],1.0)
a(K['cam_pull_kita']-0.05,'whoosh',0.03,dur=0.9); a(K['cam_pull_kita'],'drop',0.015,dur=0.6)
title(K['title_hati'],1.0); a(K['title_hati']+0.15,'blub',0.015,size=0.8,pitch=0.9)
a(K['label_iman']-0.35,'riser',0.018,until=K['label_iman']); a(K['label_iman'],'impact',0.035)
a(K['label_iman']+0.03,'powerup',0.03,dur=1.0); a(K['label_iman']+0.12,'clink',0.025,pitch=1.5); a(K['label_iman']+0.24,'clink',0.02,pitch=1.9)
title(K['title_tanam'],1.05); a(K['title_tanam']+0.1,'crunch',0.015,size=0.6)
for k,p in [('branch_shalat',1.0),('branch_doa',1.2),('branch_kebaikan',1.4)]:
    a(K[k]-0.1,'thread',0.014,dur=0.45,rate=26); a(K[k],'pop',0.03,pitch=p); a(K[k]+0.05,'clink',0.02,pitch=p*1.3); a(K[k]+0.1,'whoosh',0.015,dur=0.3)
move(K['cam_pullout_kokoh'],K['cam_pullout_kokoh']+0.8,0.035)
a(K['wind_start'],'hiss',0.02,dur=1.4); a(K['wind_start']+0.1,'whoosh',0.025,dur=1.4); a(K['wind_start']+0.3,'rattle',0.008,dur=0.8,rate=6)
a(K['title_kokoh'],'impact',0.045); a(K['title_kokoh']+0.02,'thunk',0.035); a(K['title_kokoh']+0.05,'powerup',0.025,dur=0.8)

# 7 CTA
a(K['cam_crane_cta']-0.05,'whoosh',0.035,dur=0.8); a(K['cam_crane_cta'],'riser',0.012,until=K['cam_crane_cta']+0.45)
title(K['title_tulis'],1.1); a(K['card_komentar'],'slide',0.022,dur=0.5)
for i in range(11): a(K['card_komentar']+0.25+i*0.09,'key',0.016)   # mengetik "Subhanallah"
a(K['card_komentar']+1.3,'klik',0.025,pitch=1.2)
a(K['btn_simpan'],'pop',0.035,pitch=1.0); a(K['btn_simpan']+0.05,'clink',0.02,pitch=1.5)
a(K['btn_bagikan'],'pop',0.035,pitch=1.2); a(K['btn_bagikan']+0.05,'clink',0.02,pitch=1.8)
a(END-0.15,'whoosh',0.05,dur=1.0); a(END,'powerup',0.035,dur=0.8)
for i in range(3): a(END+0.15+i*0.1,'clink',0.02,pitch=1.5+i*0.2)

json.dump(dict(duration=c['duration'],narration=dict(file='voice/narasi.wav',at=0),beats=[dict(at=0)],bed=dict(drops=[]),sfx=sorted(sfx,key=lambda x:x['t'])),open('film/timeline.json','w'),indent=1)
print('sfx',len(sfx))
