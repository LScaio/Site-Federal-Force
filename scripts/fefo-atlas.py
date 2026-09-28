"""
Gera os atlas do Fefo (public/fefo/fefo-esq.webp e fefo-dir.webp) a partir do
vídeo "Coruja_Decolagem" (1920x1080, 30 fps, fundo liso e legenda no canto).

  python3 scripts/fefo-atlas.py caminho/Coruja_Decolagem_1.mp4
  (requer ffmpeg no PATH ou em $FFMPEG, e: pip install numpy scipy pillow)

Recorta a coruja do fundo (inclusive a sombra no chão), escolhe os quadros de
cada fase pelas legendas do vídeo e monta um atlas de 8 colunas por sentido:
  0–11 decolagem · 12–23 bater de asas (loop) · 24–38 aproximação do pouso ·
  39–50 toque no chão e retorno à pose (o último é o Fefo pousado).
Se mudar a geometria, atualize ATLAS/FOOT_Y em src/components/ui/Fefo.tsx.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
BG=np.array([239,237,234])
def matte(i):
    im=Image.open(os.path.join(RAW, f'f_{i+1:04d}.png')).convert('RGB')
    a=np.asarray(im).astype(int)
    R,G,B=a[...,0],a[...,1],a[...,2]
    bgd=np.abs(a-BG).max(2)
    neutral=(np.abs(R-G)<=3)&(R-B>=-1)&(R-B<=7)&(R<=243)
    yy=np.arange(a.shape[0])[:,None]
    ground=(yy>880)&(np.abs(R-G)<=5)&(R-B>=-3)&(R-B<=10)&(R<=246)&(R>=150)
    loose=neutral|(bgd<=6)|ground
    m=Image.fromarray((loose*255).astype(np.uint8))
    h,w=loose.shape
    m2=Image.new('L',(w+2,h+2),255); m2.paste(m,(1,1))
    ImageDraw.floodfill(m2,(0,0),128)
    bgm=(np.asarray(m2)[1:-1,1:-1]==128)|(bgd<=3)
    owl=Image.fromarray(((~bgm)*255).astype(np.uint8))
    owl=owl.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    owl=owl.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    o=np.asarray(owl)>127
    lab,n=ndimage.label(o)
    if n>1:
        sizes=ndimage.sum(o,lab,range(1,n+1))
        keep=np.isin(lab,1+np.where(sizes>=sizes.max()*0.02)[0])
        o=keep
    owl=Image.fromarray((o*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba=im.copy(); rgba.putalpha(owl)
    return rgba

RAW = tempfile.mkdtemp()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'fefo')
os.makedirs(OUT, exist_ok=True)
# quadros inteiros, sem a faixa da legenda
subprocess.run([os.environ.get('FFMPEG', 'ffmpeg'), '-loglevel', 'error', '-y', '-i', sys.argv[1],
                '-vf', 'crop=1920:980:0:0', os.path.join(RAW, 'f_%04d.png')], check=True)

def lin(a,b,n): return [int(round(v)) for v in np.linspace(a,b,n)]
SEQ={
 'esq': dict(takeoff=[96,99,102,105,111,114,117,119,121,123,125,127],
             flap=list(range(164,188,2)),
             landing=list(range(219,248,3))+[249,251,253,255,257],
             touchdown=[259]+lin(278,298,11)),
 'dir': dict(takeoff=[420,424,428,435,437,439,441,443,445,447,449,451],
             flap=list(range(488,512,2)),
             landing=list(range(543,572,3))+[573,575,577,579,581],
             touchdown=[583]+lin(602,614,11)),
}
order=['takeoff','flap','landing','touchdown']
frames={d:[i for k in order for i in SEQ[d][k]] for d in SEQ}
print({d:len(v) for d,v in frames.items()}, {k:len(SEQ['esq'][k]) for k in order})
mats={d:[matte(i) for i in frames[d]] for d in frames}
# caixa comum
boxes=[m.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox() for d in mats for m in mats[d]]
x0=min(b[0] for b in boxes); y0=min(b[1] for b in boxes); x1=max(b[2] for b in boxes); y1=max(b[3] for b in boxes)
print('union',x0,y0,x1,y1)
# âncora: pés no quadro pousado (último)
anch={}
for d in mats:
    A=np.asarray(mats[d][-1].getchannel('A'))>128
    ys,xs=np.where(A)
    foot=ys.max(); cx=(xs.min()+xs.max())/2
    top=ys.min()
    anch[d]=(cx,foot,top)
print('anchors',anch)
# anchor x per direction differ; keep a single box but pad so both anchors fit. Use per-direction horizontal box centered on its anchor.
pad=6
SCALE=0.36
res={}
for d in mats:
    cx,foot,top=anch[d]
    half=max(cx-x0,x1-cx)+pad
    bx0=int(cx-half); bx1=int(cx+half)
    by0=y0-pad; by1=max(y1,foot)+pad
    res[d]=(bx0,by0,bx1,by1)
W=max(r[2]-r[0] for r in res.values()); H=max(r[3]-r[1] for r in res.values())
fw,fh=int(round(W*SCALE)),int(round(H*SCALE))
print('frame box',W,H,'->',fw,fh)
cols=8
meta={}
for d in mats:
    cx,foot,top=anch[d]
    bx0=int(round(cx-W/2)); by0=res[d][1]
    n=len(mats[d]); rows=(n+cols-1)//cols
    atlas=Image.new('RGBA',(cols*fw,rows*fh),(0,0,0,0))
    for k,m in enumerate(mats[d]):
        c=m.crop((bx0,by0,bx0+W,by0+H)).resize((fw,fh),Image.LANCZOS)
        atlas.paste(c,((k%cols)*fw,(k//cols)*fh))
    atlas.save(os.path.join(OUT, f'fefo-{d}.webp'),'WEBP',quality=76,alpha_quality=85,method=6)
    meta[d]=dict(footY=(foot-by0)/H, topY=(top-by0)/H)
meta.update(fw=fw,fh=fh,cols=cols,counts={k:len(SEQ['esq'][k]) for k in order})
print(json.dumps(meta))
