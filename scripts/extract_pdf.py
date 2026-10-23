"""Rebuild the offline reading data from the user's PDF; requires pypdf."""
from pathlib import Path
from pypdf import PdfReader
import re, json, bisect

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '傅佩荣解读易经.pdf'
reader = PdfReader(SOURCE)
pages = []
for page in reader.pages:
    text = page.extract_text()
    text = re.sub(r'第\s*\d+\s*页\s*共\s*\d+\s*页', '', text)
    text = re.sub(r'PDF 文件使用.*?www\.fineprint\.cn', '', text)
    pages.append(text.strip())
starts, full = [], ''
for text in pages:
    starts.append(len(full))
    full += text + '\n\n'
def page_at(pos): return bisect.bisect_right(starts, pos)

names='乾 坤 屯 蒙 需 讼 师 比 小畜 履 泰 否 同人 大有 谦 豫 随 蛊 临 观 噬嗑 贲 剥 复 无妄 大畜 颐 大过 坎 离 咸 恒 遯 大壮 晋 明夷 家人 睽 蹇 解 损 益 夬 姤 萃 升 困 井 革 鼎 震 艮 渐 归妹 丰 旅 巽 兑 涣 节 中孚 小过 既济 未济'.split()
# Upper/lower trigrams, checked against each chapter heading in the supplied PDF.
pairs='乾乾 坤坤 坎震 艮坎 坎乾 乾坎 坤坎 坎坤 巽乾 乾兑 坤乾 乾坤 乾离 离乾 坤艮 震坤 兑震 艮巽 坤兑 巽坤 离震 艮离 艮坤 坤震 乾震 艮乾 艮震 兑巽 坎坎 离离 兑艮 震巽 乾艮 震乾 离坤 坤离 巽离 离兑 坎艮 震坎 艮兑 巽震 兑乾 乾巽 兑坤 坤巽 兑坎 坎巽 兑离 离巽 震震 艮艮 巽艮 震兑 震离 离艮 巽巽 兑兑 巽坎 坎兑 巽兑 震艮 坎离 离坎'.split()
trigrams=[
 {'name':'乾','nature':'天','quality':'健','bits':[1,1,1],'pinyin':'qián','description':'天行不息，以刚健为象。','id':1},
 {'name':'坤','nature':'地','quality':'顺','bits':[0,0,0],'pinyin':'kūn','description':'大地承载，以柔顺为象。','id':2},
 {'name':'震','nature':'雷','quality':'动','bits':[1,0,0],'pinyin':'zhèn','description':'雷声振起，以行动为象。','id':51},
 {'name':'巽','nature':'风','quality':'入','bits':[0,1,1],'pinyin':'xùn','description':'风行无隙，以进入为象。','id':57},
 {'name':'坎','nature':'水','quality':'陷','bits':[0,1,0],'pinyin':'kǎn','description':'水流于险，以坎陷为象。','id':29},
 {'name':'离','nature':'火','quality':'丽','bits':[1,0,1],'pinyin':'lí','description':'火有所附，以附丽为象。','id':30},
 {'name':'艮','nature':'山','quality':'止','bits':[0,0,1],'pinyin':'gèn','description':'山体静立，以知止为象。','id':52},
 {'name':'兑','nature':'泽','quality':'悦','bits':[1,1,0],'pinyin':'duì','description':'泽润万物，以喜悦为象。','id':58}
]
tri={t['name']:t for t in trigrams}
keywords='刚健 柔顺 初生 启蒙 等待 争讼 统众 亲比 积蓄 履行 通泰 闭塞 同心 丰有 谦逊 和乐 随时 整治 临近 观照 咬合 文饰 剥落 返回 无妄 蓄养 养正 过盛 习险 附丽 感应 恒久 退避 壮盛 晋进 藏明 齐家 乖离 阻难 缓解 减损 增益 决断 相遇 会聚 上升 困境 井养 变革 鼎新 震动 知止 渐进 归嫁 丰盛 羁旅 逊入 和悦 离散 节制 诚信 小过 已成 未成'.split()
headings=list(re.finditer(r'《易经》\s*第[一二三四五六七八九十]+卦[^\n]*',full))
assert len(headings)==64
end64=full.index('正文·系辞 上', headings[-1].end())
section_re=re.compile(r'^((?:初[六九]|[六九][二三四五]|上[六九]|用[六九])(?:曰)?\s*[:：。]|彖曰\s*[:：]|象曰\s*[:：]|文言曰\s*[:：]|潜龙勿用，阳在下也)')
extra_markers={'乾龙勿用，下也':'文言 · 时位','乾龙勿用，阳气潜藏':'文言 · 阳气','乾元者，始而亨者也':'文言 · 四德','君子以成德为行':'文言 · 君子','积善之家，必有馀庆':'文言 · 初六','直其正也，方其义也':'文言 · 六二','阴虽有美，含之':'文言 · 六三','天地变化，草木蕃':'文言 · 六四','君子黄中通理':'文言 · 六五','阴疑於阳，必战':'文言 · 上六','彖（tuan）曰':'彖传'}
def clean(t):
    paras=re.split(r'\n\s*\n',t.strip())
    return '\n\n'.join(re.sub(r'[ \t]*\n[ \t]*','',p).strip() for p in paras if p.strip() and not re.fullmatch(r'[-—.\s]+',p))
def sections_for(text, offset):
    sections=[]
    current={'title':'卦辞','page':page_at(offset),'blocks':[]}
    kind='original'; buffer=[]; pos=0
    def flush():
        value=clean(''.join(buffer))
        if value: current['blocks'].append({'type':kind,'text':value})
        buffer.clear()
    for line in text.splitlines(keepends=True):
        stripped=line.strip()
        tag=re.match(r'^(白话|解读)\s*[:：]?(.*)$',stripped)
        marker=section_re.match(stripped)
        special=next((label for start,label in extra_markers.items() if stripped.startswith(start)),None)
        if tag:
            flush()
            kind='translation' if tag.group(1)=='白话' else 'commentary'
            if tag.group(2): buffer.append(tag.group(2)+'\n')
        elif (marker or special) and kind=='commentary':
            flush(); sections.append(current)
            name=re.sub(r'\s|[:：。]','',marker.group(1)) if marker else special
            title={'彖曰':'彖传','象曰':'象传','文言曰':'文言传','潜龙勿用，阳在下也':'小象传'}.get(name,name)
            current={'title':title,'page':page_at(offset+pos),'blocks':[]}
            kind='original'; buffer.append(line)
        else: buffer.append(line)
        pos+=len(line)
    flush(); sections.append(current)
    return sections
chapters=[]
for i,m in enumerate(headings):
    end=headings[i+1].start() if i<63 else end64
    raw=full[m.end():end]
    # Skip wrapped chapter heading until the first statement before 白话.
    first_white=re.search(r'(?m)^\s*白话',raw)
    pre=raw[:first_white.start()]
    candidates=list(re.finditer(r'(?m)^\s*[^\n]{1,60}[:：]',pre))
    assert candidates,(i+1,pre)
    begin=candidates[-1].start()
    body=raw[begin:]
    sections=sections_for(body,m.end()+begin)
    upper,lower=pairs[i]
    title=(upper+'为'+tri[upper]['nature']) if upper==lower else tri[upper]['nature']+tri[lower]['nature']+names[i]
    intro=sections[0]['blocks']
    chapters.append({'id':i+1,'name':names[i],'title':title,'keyword':keywords[i], 'upper':upper,'lower':lower,'bits':tri[lower]['bits']+tri[upper]['bits'], 'page':page_at(m.start()),'endPage':page_at(end-1),'sections':sections,'judgment':next((b['text'] for b in intro if b['type']=='original'),''),'translation':next((b['text'] for b in intro if b['type']=='translation'),'')})
supplements=[]
extra=list(re.finditer(r'正文·(系辞 上|系辞 下|说卦|序卦|杂卦)',full))
for i,m in enumerate(extra):
    end=extra[i+1].start() if i+1<len(extra) else len(full)
    supplements.append({'title':m.group(1).replace(' ',''),'page':page_at(m.start()),'text':clean(full[m.end():end]).removesuffix('End').strip()})
data={'title':'傅佩荣解读易经','pdf':'傅佩荣解读易经.pdf','pages':len(pages),'trigrams':trigrams,'chapters':chapters,'supplements':supplements,'preface':{'title':'前言 · 易经这本书与易经的魅力','page':1,'text':clean(full[:headings[0].start()])}}
for c in chapters:
    lines=[s['title'] for s in c['sections'] if re.fullmatch(r'初[六九]|[六九][二三四五]|上[六九]',s['title'])]
    print(f"{c['id']:2}. {c['name']} · p.{c['page']}-{c['endPage']} · {len(c['sections'])} sections · {len(lines)} line sections")
    assert c['judgment'] and c['translation'], c['id']
    assert not c['judgment'].startswith(('彖','象','初')), c['id']
    for section in c['sections']:
        assert section['blocks'][0]['type']=='original', (c['id'], section['title'])
        for a,b in zip(section['blocks'],section['blocks'][1:]):
            assert not (a['type']=='commentary' and b['type']=='translation'), (c['id'],section['title'])
    assert len(lines)>=6,(c['id'],lines)
assert len({tuple(c['bits']) for c in chapters})==64
(ROOT/'assets'/'book-data.js').write_text('window.YIJING_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'assets'/'pages-data.js').write_text('window.YIJING_PAGES = '+json.dumps(pages,ensure_ascii=False,separators=(',',':'))+';\n')
print('Created 64 chapters and',len(supplements),'supplements.')
