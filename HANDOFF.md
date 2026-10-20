# CJYTD 网站交接文件

更新日期：2026-10-20  
项目：中日青年人才发展协会（青发协）中文单页网站

## 1. 当前状态与接手入口

当前修改已完成，网页已发布，网站代码已同步至 GitHub。没有尚未完成的用户修改要求。后续在这一版基础上继续修改，保留已经确认的内容和交互。

| 项目 | 位置 / 状态 |
| --- | --- |
| GitHub 仓库 | https://github.com/yangdyjp-glitch/CJYTD |
| 工作分支 | `main` |
| 线上网站 | https://cjytd-youth-exchange.phd-yang.chatgpt.site/ |
| 网页内容基线提交（新增本交接文件之前） | `c58eec38f47acc6d1d88ff1bc7031c5a3aa3ca78` |
| 技术形式 | 静态 HTML + CSS + 原生 JavaScript，无构建步骤，无第三方运行依赖 |
| 网站发布目录 | `dist` |
| 已有说明 | `README.md`：运行方法；`DESIGN.md`：设计和资料口径；本文件：继续工作的完整上下文 |

仓库包含当前网页所需的图片、Logo、二维码与代码。换电脑后可以直接克隆仓库预览，无需依赖原电脑的桌面路径。

### 新电脑开始工作

```sh
git clone https://github.com/yangdyjp-glitch/CJYTD.git
cd CJYTD
git status
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

打开 http://127.0.0.1:8000/ 。Windows 若使用 Python Launcher，可把最后一行的 `python` 换成 `py`。没有 Python 时，也可以直接打开 `dist/index.html` 浏览；修改和交互检查建议使用本地静态服务器。

如果新电脑已经有该仓库，先检查并保存当地未提交的工作，再拉取更新；不要直接覆盖未提交的修改。

给新的编程助手的接手提示：

> 继续修改 CJYTD 网站。请先阅读仓库根目录的 HANDOFF.md、DESIGN.md 和 README.md，再检查当前代码。保持已经确认的三主题结构、颜色、图片顺序、裁剪比例和手机端缩放效果。后续设计继续使用 UI UX Pro Max 与 Frontend Design 两个技能。每轮按我的具体要求修改、检查；先同步 GitHub，再更新原有 Sites 站点。

## 2. 已确认的设计与内容要求

网站只做一个落地页。主线是“青年、人才、发展”，不改成多页网站、图片影像集或单独相册。

主要视觉参考是 https://www.wg-plc.com/ 的 LAND / SEA / AIR 三主题逻辑，分别对应青年 / 人才 / 发展；另外参考过 https://www.localyzer.io/ 和 https://www.semiqon.com/ 。借鉴主题切换与大幅影像的组织方式，网站使用协会自己的品牌及真实活动照片。

用户明确指定使用 **UI UX Pro Max** 和 **Frontend Design** 两个技能。之前的设计已经应用这两个技能；换电脑后需核实当地是否已安装，技能文件不随本网站仓库分发。

页面顺序为：

1. 首屏三主题、对应活动背景与浏览入口。
2. 协会介绍与成果数据。
3. 青年、人才、发展三个章节。
4. 合作流程。
5. 联系协会、电话、微信二维码及需求整理窗口。

### 三个章节

| 章节 | 三项分类及顺序 | 颜色 | 图片数量 |
| --- | --- | --- | --- |
| 青年 Youth | 青年活动 → 论坛对话 → 联谊交流 | 原有绿色 | 5 |
| 人才 Talent | 企业纳新 → 城市引才 → 高校招聘 | 青色 | 6 |
| 发展 Development | 圆桌交流 → 合作站点 → 创新创业 | 协会深蓝色 | 6 |

每章所有照片集中在文案旁的一处区域，直接在本页显示。青年、发展照片在左，人才照片在右；850px 及以下改成文案在上、照片在下。保留章节主标题和简介，分类下面不再列举具体活动说明。

### 颜色与文字

| 用途 | 当前值 |
| --- | --- |
| 协会主蓝 / 发展主题 | `#0E3A9B` |
| 深色背景 | `#09172E` |
| 青年标题、分类图标与指示线 | `#385439` |
| 青年图标浅底 | `#E7EDDD` |
| 青年照片高亮 / 首屏点缀 | `#D3EC83` |
| 人才主题色 | `#53D6D2` |
| 人才图标深青底 | `#10313C` |
| 正文 / 辅助文字 | `#162844` / `#58687C` |
| 青年章节背景 | `#F4F6F8` |

章节中文标签桌面 28px、英文 18px；手机分别为 24px、16px。使用中文系统无衬线字体（Microsoft YaHei / PingFang SC 等）与 Segoe UI。标题标签、分类图标、选中指示线和照片高亮采用各章节的主题色。

首屏人才指示线为青色；发展指示线为协会深蓝，带浅色细边，确保在深色背景上可辨认。

## 3. 图片清单与固定顺序

所有下列文件均位于 `dist/assets/events/`。表内顺序即 HTML 中的显示顺序，桌面按从左到右、从上到下排列。图片名称写在图片内部下方，以白字和暗色渐变保证可读性。

照片使用 `object-fit: cover` 裁剪，不扩充背景、不拉伸。各图的 `--photo-focus` 已设置构图焦点，替换图片后可微调 `object-position`，避免遮住人物和主要活动内容。

### 青年：5 张

| 顺序 | 图片内名称 | 文件 | 分类键 |
| --- | --- | --- | --- |
| 1 | 当归青年薪职口脍脱口秀 | `danggui-youth-talk-show.webp` | `activity` |
| 2 | 中日文化交流论坛 | `china-japan-culture-forum.webp` | `forum` |
| 3 | 5G智能城市高端论坛 | `5g-smart-city-forum.webp` | `forum` |
| 4 | 全日本学联交流会 | `japan-students-exchange.webp` | `exchange` |
| 5 | 东京青年菁英酒会 | `tokyo-youth-reception.webp` | `exchange` |

酒会照片位于最后并横跨两列；脱口秀位于左上。全日本学联交流会与 5G 论坛的位置已经按用户要求互换，不要再次交换。同一脱口秀活动只展示一张，未采用重复的观众现场照片。

### 人才：6 张

| 顺序 | 图片内名称 | 文件 | 分类键 |
| --- | --- | --- | --- |
| 1 | 顺丰科技招聘会 | `sf-tech-recruitment.webp` | `enterprise` |
| 2 | 美的集团招聘会 | `midea-recruitment.webp` | `enterprise` |
| 3 | 杭州市人社局招聘会 | `hangzhou-recruitment.webp` | `city` |
| 4 | 西安电子科技大学招聘会 | `xidian-recruitment.webp` | `university` |
| 5 | 重庆医科大学招聘会 | `chongqing-medical-recruitment.webp` | `university` |
| 6 | 西安交大招聘会 | `xian-jiaotong-recruitment.webp` | `university` |

分类按钮和图片都按企业、城市、高校的顺序组织。

### 发展：6 张

| 顺序 | 图片内名称 | 文件 | 分类键 |
| --- | --- | --- | --- |
| 1 | 海聚英才青年圆桌派 | `young-talent-roundtable.webp` | `roundtable` |
| 2 | 西安电子科技大学挂牌仪式 | `xidian-station-ceremony.webp` | `station` |
| 3 | 中国矿业大学挂牌仪式 | `mining-university-station-ceremony.webp` | `station` |
| 4 | 赛创未来挂牌仪式 | `saichuang-station-ceremony.webp` | `station` |
| 5 | 西电全球校友双创大赛 | `xidian-alumni-innovation.webp` | `innovation` |
| 6 | 杭州万亩千亿双创大赛 | `hangzhou-innovation-contest.webp` | `innovation` |

**海聚英才青年圆桌派归入发展，同时作为首屏“发展”的背景。** 当前标题按用户提供的文件名保留，没有自行改写为照片中可能出现的其他活动全称。

### 首屏背景与品牌素材

| 用途 | 文件 |
| --- | --- |
| 首屏青年背景 | `dist/assets/events/tokyo-youth-reception.webp` |
| 首屏人才背景 | `dist/assets/events/xidian-recruitment.webp` |
| 首屏发展背景 | `dist/assets/events/young-talent-roundtable.webp` |
| 导航横版 Logo | `dist/assets/association-logo-long.jpg` |
| 方形 Logo / 网站图标 | `dist/assets/association-logo.jpg` |
| 联系二维码 | `dist/assets/contact-wechat.png` |

横版 Logo 在深色导航中通过现有样式与 SVG 滤镜展示为白色，原始品牌文件保留。`assets/` 下还有早期版本图片，当前是否使用以 `index.html` 的引用为准。

## 4. 当前交互与缩放参数

分类区是三项横向图标导航。鼠标经过时预览对应照片，点击锁定分类，再次点击或在分类区按 Escape 取消；指针离开后恢复已锁定状态。选中时图标反色、轻微上移，指示线移动，对应照片加边框和标题前的小圆点并放大。照片一直全部可见，不进行隐藏或重新排序。

| 屏宽 | 照片外框缩放 | 图片内部缩放 | 网格间距 |
| --- | --- | --- | --- |
| 电脑 ≥851px | `scale(1.10)`，放大 10% | `scale(1.06)` | `clamp(26px, 2.8vw, 42px)` |
| 平板 651–850px | `scale(1.05)` | `scale(1.04)` | 18px |
| 手机 ≤650px | `scale(1.025)`，放大 2.5% | `scale(1.035)` | 10px |

用户最新要求是只加强电脑端的放大幅度，**手机端保持原样**。外框与内部缩放是两层效果，不能把手机参数也统一成电脑参数。

桌面照片比例为 16:9；手机小图为 4:3，青年末尾跨列酒会图保持 16:9。放大不改变图片比例。

顶部“暂停动效”开关会关闭缩放、投影与其他动态；系统 `prefers-reduced-motion` 同样受到支持，仍保留颜色和边框反馈。键盘和读屏支持应保留：真实按钮、可见焦点、`aria-pressed`、`aria-controls` 和 `.category-status`。

首屏三主题支持悬停、点击、焦点及左右方向键切换，联动背景、文字与浏览入口。页面还保留轻微视差、进入效果、成果数字变化、阅读进度和手机导航。

### 已明确删除的内容

- “点选分类，点亮对应现场”三处提示，以及对应的 `aria-describedby` 引用。
- 分类下方的具体活动名称清单。
- 章节内“咨询活动合作”等咨询入口。
- “据协会宣传资料整理，展示资料所载累计成果。”说明文字。

不要把这些内容从旧版本恢复。图片内的活动标题、读屏状态消息、底部联系区与需求窗口仍保留。

## 5. 文件修改位置

| 修改内容 | 文件 / 关键位置 |
| --- | --- |
| 文案、图片顺序、图片标题、分类分组 | `dist/index.html` |
| 配色、布局、比例、裁剪、缩放与手机适配 | `dist/styles.css` |
| 主题切换、分类联动、暂停动效、菜单、需求摘要 | `dist/app.js` |
| 图片和品牌文件 | `dist/assets/` |
| 设计要求与后续决策记录 | `DESIGN.md`、`HANDOFF.md` |

图片节点 `.chapter-photo` 上的 `data-category-photo` 与分类按钮的 `data-category` 配对；请同时核对，避免换了图片却高亮错组。

CSS 经过多轮迭代，靠近文件末尾的规则覆盖早期规则。检索 `.chapter-layout`、`--category-color`、`.chapter-photo.is-category-match` 和相关媒体查询，可以找到当前生效的主题与缩放规则。不要只改文件前部的旧布局规则。

当前缓存版本为 `styles.css?v=9`、`app.js?v=7`。修改相应文件后在 `index.html` 更新版本号，便于线上加载新内容。

## 6. 同步代码与更新线上网站

**GitHub 仓库和 Sites 托管源码是两套存储。向 GitHub 推送不会自动更新当前线上站点。**

用户已要求：完成修改和检查后，**先同步到指定 GitHub 仓库，再更新现有网页**。后续仍沿用这一顺序。

普通代码同步可在新电脑的克隆目录中完成，例如：

```sh
git diff --check
git add dist/index.html dist/styles.css dist/app.js DESIGN.md HANDOFF.md
git commit -m "Describe the website update"
git push origin main
```

按实际改动选择暂存文件；新增图片也应加入。推送前检查远程最新内容，避免覆盖另一台电脑的工作。

### 继续使用当前 Sites 网址

需要在新电脑登录有该站点权限的账号，并连接 Sites 与 GitHub。依照新电脑当前安装的 `sites:sites` 技能及工具执行，不使用旧电脑临时凭据或缓存脚本。

| Sites 信息 | 当前值 |
| --- | --- |
| 现有 project_id | `appgprj_6ad5fadcaac081918e3de316596d6d5e` |
| 最后已发布的 Sites 源码提交 | `58a9e18e42e8aab4203ff7c2f17abcd08df65651` |
| 最后已成功部署的版本 | `appgprj_6ad5fadcaac081918e3de316596d6d5e~appgver_4da7890c9c348191a2df4e925338ba7e` |
| 最近部署结果 | `succeeded`，2026-10-20 |
| 访问范围 | 上次核实为仅站点所有者可访问；继续发布前读取实际权限并保持现状，除非用户明确更改 |

Sites 管理的工作副本使用以下 `.openai/hosting.json`：

```json
{
  "project_id": "appgprj_6ad5fadcaac081918e3de316596d6d5e",
  "static": {
    "directory": "dist"
  }
}
```

GitHub 的可移植网站仓库没有收录这份托管配置。继续发布时应先通过 Sites 工具检查并打开这个既有项目，在其管理的工作副本中保留或恢复正确配置；不要另建同名站点，也不要把 GitHub 的远程地址替换成 Sites 的源码远程地址。

推荐操作顺序：

1. 读取 GitHub 最新状态和本交接文件，检查工作区是否有未提交修改。
2. 使用 Sites 查询既有项目与权限，按当前技能取得新的临时源码写入凭据，打开其源码工作副本。
3. 同步并修改所需文件，在本地预览，完成针对性检查。
4. 把网站代码及必要资源提交到 GitHub，确认远程已收到。
5. 在 Sites 工作副本中推送同一份网站内容，并从那个精确提交生成包含托管配置与 `dist` 的部署包。
6. 保存并部署该提交，确认最终状态为 `succeeded`，再向用户报告网页已更新。

Sites 的 `commit_sha` 必须来自 Sites 自己已推送的源码提交，不能直接填 GitHub 的提交 SHA。仅新增或更新交接文档不改变网页内容，无需为了文档再次部署网站。

本文件不包含任何访问令牌、临时签名下载地址、认证信息或发布凭据。若新电脑暂时没有 Sites，仍可克隆并完成本地修改、预览与 GitHub 同步；此时应说明线上网页尚未更新。

## 7. 已验证结果与继续修改时的检查

最近一轮实际检查结果：

- 三章主题色分别为绿色、青色与协会深蓝，分类和照片高亮同步。
- 17 张活动照片、9 个分类按钮，顺序与上述清单一致。
- 桌面选中照片外框为 1.10、内部图像为 1.06。
- 1920px 宽屏检查未发现照片相互覆盖或页面横向溢出。
- 375px 手机视口下外框为 1.025、内部图像为 1.035，间距 10px，无横向溢出；手机缩放规则与之前版本完全一致。
- “暂停动效”后照片缩放为 `none`；减少动态效果的 CSS 分支保留。
- 三处操作提示已删除，没有留下指向已删除提示的无效 `aria-describedby`。
- 本地图片引用有效，浏览器未记录脚本错误。
- GitHub 当时的 35 个网站文件与导出内容一致；加入本交接文件后文件数增加。
- Sites 部署已返回成功。

继续修改时按改动范围检查桌面、手机、图片标题、分类配对、暂停动效与资源加载即可，无需为纯文案修改引入测试框架或构建工具。

## 8. 资料口径与功能边界

内容来自用户之前提供的协会材料、宣传册、Logo 和活动照片。原始参考材料包括：

- `中日青年人才发展协会网站翻译 7.8（参考）.pdf`
- `途洋文化宣传册.pdf`
- `【0425】（修改）中日青年人才发展协会宣传册文案.pdf`
- 协会横版与方形 Logo，以及用户提供的活动原图。

原始 PDF 和高分辨率原图没有随这份可移植网站仓库完整分发；仓库已有运行网站所需的处理后素材。如后续要重写事实性介绍或核对数字，请补充读取原始材料，不自行编造日期、主办方、规模或活动成果。

用户已确认可以直接采用途洋文化宣传册中的联系入口。当前网页保留相应日本电话、地址和程老师微信二维码，无需因换电脑重新询问相同事项。

合作需求窗口只在访问者浏览器中生成、复制或下载摘要，没有后端提交、邮件发送或数据库存储。不要把“生成需求摘要”描述为“报名成功”或“已发送给协会”。

如果在 ChatGPT 项目镜像目录中工作，`sources/` 下的同步项目资料应保持只读，不编辑、移动或删除。网页代码在可编辑工作副本中维护。
