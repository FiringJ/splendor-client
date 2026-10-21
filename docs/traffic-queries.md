# 访问统计查询（`public.pageviews`）

自建 PV 写入同一 Supabase 项目 `uigrwmnytwduejcqnoow` 的 `public.pageviews`。
浏览器只用 **anon key** 插入；下面的聚合查询需要 **service_role**（绕过 RLS 读全表）。

## 拿 service_role

```bash
supabase projects api-keys --project-ref uigrwmnytwduejcqnoow --output json
```

在返回里取 `name` / `id` 为 `service_role` 的那条 `api_key`。
**不要**把它放进任何 `NEXT_PUBLIC_*` 变量或客户端代码。

用 PostgREST / SQL editor / `psql` 均可；下面以 SQL Editor 为例。

## 按天 PV / UV

```sql
select
  date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  count(*) as pv,
  count(distinct session_id) as uv
from public.pageviews
group by 1
order by 1 desc;
```

预期输出格式：

| day        | pv  | uv |
| ---------- | --- | -- |
| 2026-10-22 | 12  | 5  |
| 2026-10-21 | 3   | 2  |

## 按 path 排行

```sql
select
  path,
  count(*) as pv,
  count(distinct session_id) as uv
from public.pageviews
group by path
order by pv desc
limit 50;
```

## 区分本人流量与外部流量

本人（已登录且 `user_id` 有值）vs 匿名/外部：

```sql
select
  case when user_id is null then 'external_or_anon' else 'signed_in' end as traffic_kind,
  count(*) as pv,
  count(distinct session_id) as uv
from public.pageviews
group by 1
order by 1;
```

若只想看「明确不是自己」的路径级排行，先排除已知本人 `user_id`（把 UUID 换成你的）：

```sql
select
  path,
  count(*) as pv,
  count(distinct session_id) as uv
from public.pageviews
where user_id is distinct from '00000000-0000-0000-0000-000000000000'::uuid
group by path
order by pv desc
limit 50;
```

（客户端当前不上报 `user_id`，行里多为 `null`；有登录态后再按 `user_id` 过滤即可。）
