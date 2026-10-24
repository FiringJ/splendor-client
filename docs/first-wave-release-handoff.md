# 第一波发布交接（所有者审阅）

本文档供所有者审阅后执行发布相关操作。Daily Loop 禁止生产部署；本任务**不能**使线上入口恢复，生产入口与统计仍待所有者发布。

背景诊断见 **FJ-31**（线上仍为旧构建、Fly 构建缺统计参数）。本文不重复全面诊断，只做版本核对与发布交接。

部署通则见 [fly-deploy.md](./fly-deploy.md)。聚合查询口径见 [traffic-queries.md](./traffic-queries.md)。

---

## 1. 已合并版本（仓库元数据，非线上）

**采样时间（UTC）：** `2026-10-24T01:04:39Z`

| 来源 | 值 |
| --- | --- |
| `git rev-parse origin/master` | `bdc4569f192761ccddd918320361b19ccabecd9d` |

| PR | state | mergedAt (UTC) | mergeCommit | 是否为 `origin/master` 祖先 |
| --- | --- | --- | --- | --- |
| [PR #7](https://github.com/FiringJ/splendor-client/pull/7)（SEO / robots / sitemap） | MERGED | 2026-10-21T17:49:49Z | `d50b9d341b9b6c43072ba30f08aeb619ec2ceccd` | 是（`git merge-base --is-ancestor` 退出 0） |
| [PR #8](https://github.com/FiringJ/splendor-client/pull/8)（pageview 上报） | MERGED | 2026-10-21T17:46:09Z | `3737fd2afa7c9955e808f3dcd2eea7f221e54336` | 是 |
| [PR #9](https://github.com/FiringJ/splendor-client/pull/9)（`/welcome` 与房间分享） | MERGED | 2026-10-21T17:40:57Z | `0556e6665d92eddb0790fd4e6f3c8f5dc7eb4b28` | 是 |

核对命令（本任务已跑；所有者可复跑）：

```bash
git fetch origin master
git rev-parse origin/master
gh pr view 7 --repo FiringJ/splendor-client --json url,state,mergedAt,mergeCommit
gh pr view 8 --repo FiringJ/splendor-client --json url,state,mergedAt,mergeCommit
gh pr view 9 --repo FiringJ/splendor-client --json url,state,mergedAt,mergeCommit
git merge-base --is-ancestor d50b9d341b9b6c43072ba30f08aeb619ec2ceccd origin/master
git merge-base --is-ancestor 3737fd2afa7c9955e808f3dcd2eea7f221e54336 origin/master
git merge-base --is-ancestor 0556e6665d92eddb0790fd4e6f3c8f5dc7eb4b28 origin/master
```

**合并不等于线上发布。** `master` 含上述 merge commit，只说明 GitHub 默认分支已纳入代码；Fly 上跑的镜像是否由这些 commit 构建，必须以发布后的 HTTP / 统计核验为准（见第 4 节）。本任务不复查 PR diff。

---

## 2. 发布前置缺口（当前仓库事实）

对照根目录 `Dockerfile` 与 `fly.toml`（只读核对，未改文件）：

| 构建期变量 | `Dockerfile` ARG/ENV | `fly.toml` `[build.args]` | 结论 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 有（默认 sibling server） | 有 | 现有路径可注入 |
| `NEXT_PUBLIC_SOCKET_URL` | 有（可选） | 无 | 可选；未设则走 API URL 逻辑（见 fly-deploy.md） |
| `NEXT_PUBLIC_SUPABASE_URL` | **无** | **无** | 构建期未传入 → 浏览器包内为空 → pageview 静默跳过 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **无** | **无** | 同上 |

要点：

1. 现有 `Dockerfile` / `fly.toml` **只注入部分** `NEXT_PUBLIC_*`（API，及 Dockerfile 里可选的 SOCKET）。
2. `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY` **必须在构建期**写入浏览器包；当前 Dockerfile **尚不接收**这两项 ARG。
3. Fly **runtime env / secrets 不能补救**已构建包里的 `NEXT_PUBLIC_*`（见 fly-deploy.md）。改完构建参数后必须重新构建并部署镜像。
4. **不要**把带 `--build-arg NEXT_PUBLIC_API_URL=...` 的现有示例命令直接复制后宣称「统计缺口已修」——那只覆盖 API URL，**不含** Supabase 两项。
5. 浏览器构建 **禁止** 使用 `service_role`。写入 `pageviews` 只用 **anon** key；`service_role` 仅供所有者在服务端 / SQL 侧做聚合（见 traffic-queries.md）。**禁止把 service_role 当 anon 塞进 `NEXT_PUBLIC_*`。**

占位（真实值由所有者从 Supabase 项目取出，本文不写密钥）：

```text
NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

旧 GitHub Actions 工作流曾在 CI 环境注入过 anon 相关变量；那与当前 Fly `Dockerfile` 构建路径无关，不能当作 Fly 已具备统计构建参数的证据。

---

## 3. 所有者待办与人工发布步骤

责任人：**所有者**。本任务代理不执行 `fly deploy`、不改生产资源、不碰 DNS。

### 3.1 待所有者授权的配置修正（发布前）

- [ ] 授权修改构建管线：让 Fly 用的 `Dockerfile`（及必要时 `fly.toml` `[build.args]`）在 **build 阶段**接收并注入 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`（仅 anon；永不注入 service_role）。
- [ ] 授权在 Fly 侧配置上述构建参数的真实值（密钥管理方式由所有者决定；勿写入本仓库明文）。
- [ ] 确认 sibling `splendor-server` 已部署且 CORS / Socket origin 允许客户端域名（见 fly-deploy.md）。
- [ ] 若使用自定义域名：授权 DNS 指向与证书操作（具体记录与命令由所有者确认；本仓库文档未给出已验证的 DNS 步骤）。

### 3.2 前置未满足时

在 3.1 未完成前：

1. **不要**为了「上线第一波入口」而对当前 Dockerfile 执行仅含 `NEXT_PUBLIC_API_URL` 的 `fly deploy` 并宣称统计已就绪。
2. 可继续用第 4 节只读 HTTP 命令观察**当前线上**表现（预期可能仍是旧构建；失败条件见下）。
3. 配置修正 PR / 构建参数变更由所有者安排；本交接文档不替代那次改动。

### 3.3 前置满足后的人工步骤（示意，非已验证剧本）

所有者完成 3.1 后，再按 fly-deploy.md 的部署顺序操作，语义上应为：

1. 使用**已包含 Supabase ARG** 的构建定义，重新 `fly deploy`（构建参数含 API URL + Supabase URL/anon；值用所有者保管的真实配置，不用本文占位符原文）。
2. 跑第 4 节 HTTP 核验；全部断言通过后再谈推广。
3. 用 traffic-queries.md 的聚合 SQL（**service_role 只在服务端查询侧**）看上报是否开始出现行。

具体 `fly` 子命令以所有者环境与当时 `fly` CLI / 应用名为准。本文**不**粘贴一套「复制即部署且已修好缺口」的完整命令行。

### 3.4 回退

仓库内 `docs/fly-deploy.md` 与 `fly.toml` **没有**已验证的回退（previous release / volume pin）命令证据。

**回退：未验证。** 所有者若需回退，请先确认至少以下信息后再执行（本任务不代执行）：

- 当前 Fly app 名与机器上正在跑的 release / image 标识
- 可回退到的上一 release 或镜像标签是否仍存在
- 回退后是否接受「再次失去第一波入口 / SEO / 统计」的产品后果

---

## 4. 发布后有限时只读核验

基址：`https://splendor-client.fly.dev`。下列为 **只读 HTTP**；限时建议 `curl --max-time 15`。本任务**未**在交付时替你执行线上 curl 并填写结果——避免虚构执行结果。发布后由所有者（或 Reviewer 在授权范围内）实跑。

**说明：** 响应 HTML 可以证明路由与服务端渲染文案是否出现；**无法证明**客户端水合后的房间号预填或 Socket 连通。`/?room=ABCD` 的预填逻辑在客户端/`initialRoomId` 路径上，应用 `pnpm exec jest --runInBand` 覆盖 `parseRoomQueryParam` 等单测，而不是用 curl HTML 断言输入框值。

### 4.1 HTTP 断言

```bash
# /welcome — 预期：HTTP 200；body 含「璀璨宝石」或「开始游戏」
curl -sS -o /tmp/splendor-welcome.html -w "%{http_code}\n" --max-time 15 \
  https://splendor-client.fly.dev/welcome
grep -E '璀璨宝石|开始游戏' /tmp/splendor-welcome.html

# / — 预期：HTTP 200（首页游戏壳）
curl -sS -o /tmp/splendor-root.html -w "%{http_code}\n" --max-time 15 \
  https://splendor-client.fly.dev/

# /?room=ABCD — 预期：HTTP 200；HTML 不能证明预填，仅证明页面可打开
curl -sS -o /tmp/splendor-room.html -w "%{http_code}\n" --max-time 15 \
  "https://splendor-client.fly.dev/?room=ABCD"

# /robots.txt — 预期：HTTP 200；含 Allow 与 sitemap 行
curl -sS -o /tmp/splendor-robots.txt -w "%{http_code}\n" --max-time 15 \
  https://splendor-client.fly.dev/robots.txt
grep -E 'Allow:|/sitemap.xml' /tmp/splendor-robots.txt

# /sitemap.xml — 预期：HTTP 200；含 splendor-client.fly.dev 的 url 条目
curl -sS -o /tmp/splendor-sitemap.xml -w "%{http_code}\n" --max-time 15 \
  https://splendor-client.fly.dev/sitemap.xml
grep -F 'splendor-client.fly.dev' /tmp/splendor-sitemap.xml
```

### 4.2 仓库内回归（发布前也可跑）

```bash
pnpm exec jest --runInBand
pnpm build
```

### 4.3 统计口径（引用 traffic-queries.md）

在 Supabase 用 **service_role（仅查询侧）** 按 [traffic-queries.md](./traffic-queries.md) 查看：

| 口径 | 含义 |
| --- | --- |
| 按天 PV / UV | `count(*)` vs `count(distinct session_id)` |
| 按 path | 各 path 的 PV/UV 排行 |
| 转化（产品层） | 例如 `/welcome` → `/` 或带 `room` 的访问是否出现；需结合 path 排行解读，不是单行 SQL 魔法字段 |
| 上报健康 | 发布并正确注入 anon 构建参数后，应开始出现新行；请求失败在客户端被吞掉，零新行要查构建参数与 RLS/表权限，**不要把零记录解释成「没有用户需求」** |

### 4.4 失败即停推广（责任人：所有者）

任一条成立则 **停止后续推广**（分享外链、公告、SEO 扩散等），先修发布/配置：

| 条件 | 动作 |
| --- | --- |
| `/welcome`、`/`、`/robots.txt`、`/sitemap.xml` 非 2xx 或正文缺关键断言 | 停止推广；查 Fly 发布与路由 |
| 发布后合理时间窗口内 `pageviews` 仍无新行，且构建未注入 Supabase anon 变量 | 停止宣称「统计已上」；回到 3.1 |
| 误把 service_role 打进浏览器包 | **立即**视为事故：撤发布 / 轮换密钥；责任人所有者 |

---

## 5. 本任务交付边界

- 交付物：本文件 + `fly-deploy.md` 中的链接；可选文档-only PR。
- **未做：** 生产部署、DNS、读/写 pageviews、打印凭据、merge、改 Dockerfile / fly.toml / workflow。
- **结论：** 第一波代码已在 `origin/master`；**生产入口和统计仍待所有者按本文发布。** 不能写「已恢复上线」。
