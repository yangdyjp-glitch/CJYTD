"""Generate the directly-openable Japanese page without runtime dependencies."""
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TRANSLATIONS = json.loads((ROOT / 'locales/ja.json').read_text(encoding='utf-8'))


class JapanesePage(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.missing = set()

    def translate(self, value):
        key = value.strip()
        if key in TRANSLATIONS:
            return value.replace(key, TRANSLATIONS[key], 1)
        if re.search(r'[\u4e00-\u9fff]', key) and key not in ('中文', '日本語'):
            self.missing.add(key)
        return value

    def handle_starttag(self, tag, attrs):
        raw = self.get_starttag_text()
        for key, value in attrs:
            if key in ('alt', 'aria-label', 'placeholder', 'content') and value:
                translated = escape(self.translate(value), quote=True)
                raw = raw.replace(f'{key}="{escape(value, quote=True)}"', f'{key}="{translated}"')
        if tag == 'html':
            raw = raw.replace('lang="zh-CN"', 'lang="ja"')
        if tag == 'a' and 'data-language-link' in dict(attrs):
            raw = raw.replace(' aria-current="page"', '')
            if dict(attrs).get('lang') == 'ja':
                raw = raw[:-1] + ' aria-current="page">'
        self.output.append(raw)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        self.output.append(f'</{tag}>')

    def handle_data(self, data):
        self.output.append(self.translate(data))

    def handle_entityref(self, name):
        self.output.append(f'&{name};')

    def handle_charref(self, name):
        self.output.append(f'&#{name};')

    def handle_decl(self, decl):
        self.output.append(f'<!{decl}>')

    def handle_comment(self, data):
        self.output.append(f'<!--{data}-->')


parser = JapanesePage()
parser.feed((ROOT / 'dist/index.html').read_text(encoding='utf-8'))
if parser.missing:
    raise SystemExit('Missing translations: ' + repr(sorted(parser.missing)))
page = ''.join(parser.output)
# Keep the existing emblem, and typeset the association name in Japanese.
page = re.sub(
    r'(<a class="brand"[^>]*>)<img[^>]+>',
    r'\1<span class="brand-mark" aria-hidden="true"><img src="assets/association-logo-long.jpg" alt=""></span>'
    r'<span class="brand-japanese"><strong>中日青年<wbr>人材発展協会</strong>'
    r'<small>若者の力と知恵で、ともに未来へ</small></span>',
    page,
    count=1,
)
(ROOT / 'dist/ja.html').write_text(page, encoding='utf-8', newline='\r\n')
print('Generated dist/ja.html; all source text and accessibility labels are covered.')
