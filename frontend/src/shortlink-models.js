// 短链三格。先按通用方法提问，图是这一问的答案骨架，图下面用课程原话对着讲。
// 课程：https://liwenzhou.com/courses/go-micro-service/short-url/

const createFlow = {
  type: "flow",
  caption: "转链时序。时间从上往下。右边分出去的，是这条路走不成。",
  width: 880,
  height: 860,
  nodes: [
    { id: "in", name: "1. 调用方", text: "送来一个长网址", x: 300, y: 12, w: 230 },
    { id: "check", name: "2. 校验链接是否有效", text: "打不开就拒绝", x: 300, y: 108, w: 230 },
    { id: "same", name: "3. 相同长链", text: "按 md5 查已有短链", x: 300, y: 210, w: 230 },
    { id: "back", name: "返回原来的短链", text: "不再发新号", x: 620, y: 210, w: 210 },
    { id: "loop", name: "4. 循环转链", text: "送来的已经是短链？", x: 300, y: 330, w: 230 },
    { id: "stop", name: "拒绝", text: "不要短链套短链", x: 620, y: 330, w: 210 },
    { id: "seq", name: "5. 发号器", text: "取一个递增序号", x: 300, y: 450, w: 230 },
    { id: "b62", name: "6. 62 进制", text: "1234567890 → 1ly7vk", x: 300, y: 560, w: 230 },
    { id: "bad", name: "禁用词", text: "丢掉这个号，再取下一个", x: 620, y: 560, w: 220 },
    { id: "save", name: "7. 写入映射", text: "长链接 ↔ 短链接", x: 300, y: 680, w: 230 },
    { id: "out", name: "8. 返回", text: "q1mi.cn/1ly7vk", x: 300, y: 780, w: 230 },
  ],
  edges: [
    { from: "in", to: "check", label: "" },
    { from: "check", to: "same", label: "有效才继续" },
    { from: "same", to: "back", label: "查到了", at: 0.5, side: -1 },
    { from: "same", to: "loop", label: "没有" },
    { from: "loop", to: "stop", label: "已经是短链", at: 0.5, side: -1 },
    { from: "loop", to: "seq", label: "不是" },
    { from: "seq", to: "b62", label: "" },
    { from: "b62", to: "bad", label: "敏感词或保留路径", at: 0.45, side: -1 },
    { from: "b62", to: "save", label: "通过" },
    { from: "save", to: "out", label: "" },
  ],
};

const openFlow = {
  type: "flow",
  caption: "查看时序。和转链分开画。点击不改这条映射。",
  width: 860,
  height: 400,
  nodes: [
    { id: "click", name: "用户", text: "点击短网址", x: 250, y: 16, w: 220 },
    { id: "find", name: "按标识符查", text: "1ly7vk 对应原来的长网址", x: 230, y: 130, w: 260 },
    { id: "go", name: "302", text: "临时重定向到长网址", x: 230, y: 260, w: 260 },
    { id: "log", name: "点击数据", text: "以后用 access.log 做报表", x: 590, y: 130, w: 230 },
    { id: "no301", name: "不用 301", text: "浏览器缓存后不再打过来", x: 590, y: 260, w: 240, old: true },
  ],
  edges: [
    { from: "click", to: "find", label: "" },
    { from: "find", to: "go", label: "查到长链" },
    { from: "find", to: "log", label: "顺带记下这次访问", at: 0.55, side: -1 },
    { from: "go", to: "no301", label: "若用 301 就丢数据", dash: true, at: 0.5, side: 1 },
  ],
};

const stateFlow = {
  type: "flow",
  caption: "状态机。一条映射同一时间只有一个状态。虚线那格这一版不存在。",
  width: 860,
  height: 300,
  nodes: [
    { id: "none", name: "还没有", text: "这条长链没转过", x: 16, y: 70, w: 180 },
    { id: "ok", name: "正常", text: "is_del = 0，长期有效", x: 310, y: 70, w: 210 },
    { id: "del", name: "已删除", text: "is_del = 1，手动标记", x: 630, y: 70, w: 210 },
    { id: "exp", name: "过期", text: "这一版不设这个状态", x: 310, y: 200, w: 210, old: true },
  ],
  edges: [
    { from: "none", to: "ok", label: "转链成功，写入映射", at: 0.5, side: -1 },
    { from: "ok", to: "del", label: "手动标记删除", at: 0.5, side: -1 },
    { from: "ok", to: "exp", label: "有明确要求再加", dash: true, at: 0.55, side: 1 },
  ],
};

const placeFlow = {
  type: "flow",
  caption: "映射怎么摆，发号器怎么拆成两台。",
  width: 860,
  height: 340,
  nodes: [
    { id: "w", name: "转链", text: "写入主库", x: 24, y: 24, w: 160 },
    { id: "m", name: "主库", text: "short_url_map", x: 280, y: 24, w: 180 },
    { id: "s1", name: "备库", text: "第一份副本", x: 580, y: 0, w: 160 },
    { id: "s2", name: "备库", text: "第二份副本", x: 580, y: 110, w: 160 },
    { id: "r", name: "查看", text: "可以读从库", x: 280, y: 140, w: 180 },
    { id: "a", name: "发号器 1", text: "offset=1，发 1、3、5", x: 24, y: 250, w: 220 },
    { id: "b", name: "发号器 2", text: "offset=2，发 2、4、6", x: 360, y: 250, w: 220 },
  ],
  edges: [
    { from: "w", to: "m", label: "写", at: 0.5, side: -1 },
    { from: "m", to: "s1", label: "副本", at: 0.5, side: -1 },
    { from: "m", to: "s2", label: "副本", at: 0.55, side: 1 },
    { from: "s2", to: "r", label: "读", at: 0.5, side: 1 },
    { from: "a", to: "b", label: "步长都是 2", at: 0.5, side: -1 },
  ],
};

const cacheFlow = {
  type: "flow",
  caption: "查看变慢时，请求从左到右。布隆过滤器说没有，就不要再往后打。",
  width: 860,
  height: 160,
  nodes: [
    { id: "q", name: "查看请求", text: "短链标识符", x: 8, y: 36, w: 150 },
    { id: "bloom", name: "布隆过滤器", text: "没有就一定没有", x: 190, y: 36, w: 170 },
    { id: "cache", name: "缓存", text: "Redis，或先放本地", x: 400, y: 36, w: 180 },
    { id: "db", name: "MySQL", text: "按短链查长链", x: 630, y: 36, w: 170 },
  ],
  edges: [
    { from: "q", to: "bloom", label: "", at: 0.5 },
    { from: "bloom", to: "cache", label: "可能有", at: 0.5, side: -1 },
    { from: "cache", to: "db", label: "没有再查库", at: 0.5, side: -1 },
  ],
};

export const shortBizModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法里，业务最先画时序，再画状态机。短链有两件不同的事，不要画进同一张图。
一件是把长网址换成短网址。一件是有人点开短网址。

先用课程里的定位，卡住这两张图能画成什么样：
公司内部业务使用的短网址服务，只接收公司内部的长链转短链需求。（不对外提供短链功能。）
基本在国内使用（点击链接的用户绝大多数为国内用户）。
输入一个长网址得到一个唯一的短网址。用户点击短网址能够正常跳转到对应的网址。为了保证业务的延续性，短网址长期有效。
这是一个典型的读多写少的系统。数据写入后基本不会改变。可以放心大胆地使用缓存来提高读的效率。`,
    },
    createFlow,
    {
      type: "text",
      text: `【对着转链这张图】
1. 调用方把长网址送进来。课程要的就是：输入一个长网址得到一个唯一的短网址。
2. 校验链接是否有效。大约 1 秒超时去请求这个地址，打不开就停在这一步。这段代码放在访问那一格，因为通用方法把「谁能调、链接验不验」算进访问。
3. 相同的长链要转为同一个短链。长链接不适合直接做索引，用它的 md5 去查。查到了，走右边，返回原来的短链，不再发新号。
4. 没有旧记录，先看是不是循环转链：把已经是短链的再拿来转短链。是，就拒绝。
5. 不是，才找发号器。每收到一个转链请求，就生成递增的序号（1、2、3、4…）。
6. 把序号转为 62 进制，拼到短域名后面。序号 1234567890 转为 1ly7vk，得到 q1mi.cn/1ly7vk。62 进制就是数字 0-9 加上大小写字母 a-zA-Z，因为字母和数字能组成合法的 URL，浏览器能认识。
右边那格：需要避免某些不合适的词（例如 f**k、stupid），也要避免 version、health 这种已有含义的路径。落上去就把这个号丢掉，回到第 5 步再取。
7. 保存原始长链接与短链接的对应关系。
8. 把短网址返回给调用方。

【发号器为什么是这张图的第 5 步】
hash 也能当短链标识符。优势是简单。缺点是数据量大之后会出现哈希冲突。
MurmurHash 是一种非加密型哈希函数，对规律性较强的 key 随机分布更好。Redis、Memcached、Cassandra、HBase、Lucene 都用过它。算得快。它仍然是 hash，冲突还在。
发号器的优势是生成的 id 递增，理论上容量足够。缺点是高并发下的发号器设计是难点。

课程拿来比过的四种发号器：
1. uuid。优势：不会重复、性能好。劣势：数字太大了，32 位 16 进制数。短链会很长。
2. redis。优势：高性能。劣势：需搭建高可用架构并考虑持久化。
3. 雪花算法。优势：高性能、高可用。劣势：实现复杂，依赖时钟。
4. MySQL 自增主键。优势：简单、可靠。劣势：依赖 MySQL，性能会成为瓶颈，但可通过分片扩展。

这里采用基于 MySQL 主键的发号器。表很瘦，没有很多其他字段。每来一次转链，就在这一行上替换出新的自增 id。`,
    },
    {
      type: "code",
      text: `CREATE TABLE \`sequence\` (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`stub\` varchar(1) NOT NULL,
  \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_uniq_stub\` (\`stub\`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT = '序号表';

REPLACE INTO sequence (stub) VALUES ('a');
SELECT LAST_INSERT_ID();`,
    },
    {
      type: "text",
      text: `REPLACE 的工作方式和 INSERT 一样，只是 stub 的唯一键上已经有 'a' 这一行，就先删掉旧行再插入，于是得到一个新的自增 id。紧接着 SELECT LAST_INSERT_ID() 把这个号拿回来。

为了避免单点故障，发号器分成奇数和偶数，分别放在两台 MySQL 上。两台的 auto-increment-increment 都是 2。server1 的 auto-increment-offset = 1，发 1、3、5、7、9。server2 的 offset = 2，发 2、4、6、8。存储那一格有这张摆法的图。`,
    },
    openFlow,
    {
      type: "text",
      text: `【对着查看这张图】
用户点击短网址。根据短链标识符查到原始长链接，然后返回重定向响应。课程示例里，标识符 1ly7vk 对应 https://liwenzhou.com/posts/go/golang-menu。

返回用 302，不用 301。需要记录访问数据。如果用 301 永久重定向，下一次访问时浏览器有缓存，就不再请求短链服务器了，点击数据会丢。302 是临时重定向，每次访问短链都会再请求短链服务器（除非响应里用 Cache-Control 或 Expired 让浏览器缓存）。右边虚线那格就是这个原因。

右边实线那格是后续需求：可能要采集并统计请求头数据。可以通过 Nginx 的 access.log 来统计，例如用 EFK 采集日志做报表。这一版先把查看走通，报表有要求再做。

点击本身不改变映射。所以这张图上没有「把状态改掉」的一步。状态在下一张图。`,
    },
    stateFlow,
    {
      type: "text",
      text: `【对着状态机】
还没有：这组长链和短链的对应关系不在表里。转链成功并写入映射之后，变成正常。
正常：is_del = 0。短网址长期有效。有人点击，走上一张查看图，状态停在正常。
已删除：is_del = 1。本项目不设置过期时间，所有的删除都是手动标记删除。行还在，只是标记变了。
过期：虚线，从正常指下来，表示有明确要求才加。基本方案里不要提前做。过期以后怎么删，写在这一格最后的扩展里。

【约束与边界】
上面两张时序里分出去的支路，就是约束。课程把转链模块收成这几条：
1. 相同的长链要转为同一个短链
2. 生成的短链为尽量短的字符，例如 q1mi.cn/p6Yo7Z
3. 需要避免某些不合适的词
4. 避免生成的短链出现 version、health 等已有含义的词
5. 避免循环转链（把已经是短链的再拿来转短链）

【表：几张、唯一键、字段从哪来】
两张表。类型、容量、怎么删，放到存储。
sequence：只负责发号。id 是自增主键，来自发号这一下。stub 固定写成 'a'，用来撞上唯一键，让 REPLACE 换出新 id。timestamp 是这一行最后被替换的时间。
short_url_map：保存原始长链接与短链接的对应关系，并能按短链接找到长链接。
lurl 来自调用方送来的长网址。
md5 由这条长链算出来，创建前用它判断「转过没有」。
surl 由发号器的序号转成 62 进制得来，查看时按它查。
is_del 默认 0，删除时人手改成 1。
create_at、create_by 由服务在写入时填上。

课程正文写过「lurl 和 surl 都唯一」。建表语句里，唯一键是 md5 和 surl。长链本身太长，不拿 lurl 做唯一索引，用 md5 代替。

【接口：先粗后细】
粗：两个接口。
转链。作用是收入长网址、写出短网址。写入 short_url_map，发号写入 sequence。不调用别的业务服务。校验长链是否打得开，算访问上的检查。
查看。作用是按标识符查出长链并跳转。不改库。

细：课程给出的查看示例是按标识符查长链，再 302。转链的字段编排就是上面那张时序的 1 到 8。`,
    },
    {
      type: "code",
      text: `// 按标识符查到长链接。1ly7vk 这个例子直接对上课程里的长网址。
if req.ShortURL == "1ly7vk" {
    return &types.Response{LongURL: "https://liwenzhou.com/posts/go/golang-menu"}, nil
}

// 返回重定向，而不是把 JSON 交回去。
http.Redirect(w, r, resp.LongURL, http.StatusFound)`,
    },
    {
      type: "text",
      text: `【扩展：有触发再做】
基本方案能转、能跳之后，下面这些等业务明确要求，或延迟、吞吐已经不够，再加。

1. 自定义短链。维护一个已经使用的序号，后续生成序号时判断是否已经被分配。
2. 过期时间。映射上再记一个过期时间，到期后删除。三种删法：延迟删除，每次请求时发现过期再删，实现简单，过期数据可能一直占着；定时删除，创建时按过期时间设定时器，删得及时，占内存；轮询删除，低峰用脚本扫表，兼顾效率和磁盘。
3. 吞吐量。水平扩展多节点，根据序号分片。
4. 延迟。存储可以改成键值，因为对应关系很简单；存储节点可以按短链分片；缓存先本地再 Redis；让用户访问离得近的节点。

没有这些触发，就保持长期有效、手动标记删除、发号用 MySQL。`,
    },
  ],
};

export const shortStoreModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法里，存储接着问五件事：数据放哪个组件，字段是什么类型，要占多大，怎么删，一台挂了怎么办。性能和部署也写在这一格。
业务那一格已经定了两张表各自干什么、字段从哪来。这里把类型和摆法补上。`,
    },
    {
      type: "text",
      text: `【放在哪个组件】
长短链的对应关系要落盘，还要唯一约束，放 MySQL。发号也放 MySQL，就是业务里那张 sequence。
Redis 用来加速查看，不当唯一账本。数据量放得进内存时，也可以在程序启动时加载到本地内存。
这不是搜索。拿短链精确查出那一条长链，不用搜索引擎。`,
    },
    {
      type: "code",
      text: `CREATE TABLE \`short_url_map\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
    \`create_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    \`create_by\` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建者',
    \`is_del\` tinyint UNSIGNED NOT NULL DEFAULT '0' COMMENT '是否删除：0正常1删除',
    \`lurl\` varchar(2048) DEFAULT NULL COMMENT '长链接',
    \`md5\` char(32) DEFAULT NULL COMMENT '长链接MD5',
    \`surl\` varchar(11) DEFAULT NULL COMMENT '短链接',
    PRIMARY KEY (\`id\`),
    INDEX(\`is_del\`),
    UNIQUE(\`md5\`),
    UNIQUE(\`surl\`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COMMENT = '长短链映射表';`,
    },
    {
      type: "text",
      text: `【每个字段】
id：主键，只标识这一行，不拿它当短链。
create_at / create_by：创建时间和创建者。
is_del：0 正常，1 删除。软删除。单独建了普通索引。
lurl：长链接，varchar(2048)，来自调用方。
md5：char(32)，长链算出来的。唯一键。长链接数据量大，不适合直接建索引，所以用 md5。
surl：短链接，varchar(11)。另一个唯一键。查看时按它查。

可以采用读写分离：写主库、读从库。`,
    },
    placeFlow,
    {
      type: "text",
      text: `【对着这张摆法】
转链写入主库。一主两备，一共三份。查看可以读从库。
下面两台是发号器，不是映射表。步长都是 2。左边发奇数，右边发偶数。一台挂了，另一台还能继续发号。

【容量】
1. 一条长链加短链，按 200 字节估。
2. 假设每个业务线每秒写入 100 条，10 条业务线是每秒 1000 条。
3. 一主两备共三份，索引等再按 1.5 倍冗余。
课程用这些数估存储，结果写成大约 20T。这个数交给 DBA 复核，用来决定要几台库。

【怎么删】
因为不设置过期时间，删除都是手动把 is_del 标成 1。不物理删行。过期后的三种删法在业务的扩展里，这里不启用。`,
    },
    cacheFlow,
    {
      type: "text",
      text: `【读慢了再加缓存】
基本方案是查看时直接查 MySQL，再 302。要提高性能，就按上图从左到右加。
缓存可以是 Redis 集群。内存放得下时，用 LRU 丢掉最近最少用到的 key。甚至可以加本地缓存，程序启动时加载到内存。

缓存一起失效，叫雪崩：大量短链同时过期，请求会一起打到 MySQL。过期时间不要设成同一个值。
一个热点刚好过期，叫击穿。处理是把过期时间设长，加锁，并用 singleflight 把同时来的相同查询并成一次。
有人大量请求根本不存在的短链，缓存和库都没有，每次都打到库，叫穿透。布隆过滤器挡在前面：它说没有，就一定没有。它不保存原始数据，只判断某个元素在不在，用来省空间。

布谷鸟过滤器支持删除。短链不会重复添加同一个短链，这个限制影响不大。已删除的短链相对总数很少，过滤器偶尔放行，后面还有 is_del。查看这里不必为了删除改用布谷鸟过滤器。

【部署】
课程推荐把短链服务放在 Nginx 后面，和别的业务隔开。用 Nginx 的 access.log 统计访问，例如 EFK。
课程的架构图把转链和查看拆开：转链单独一个服务，别的服务用 REST 或再做一个 RPC 来调用，并且要接公司的鉴权。查看也单独一个服务，Nginx 把 /[0-9a-zA-Z]* 转进来。
按通用方法，锻炼项目先不要拆。一个服务里两个接口：/api/create 做转链，短码路径做查看。真觉得查看扛不住了，再把查看拆出去。拆开要两套发布、两套监控，还要保证两边看的是同一张映射表、同一份缓存。在这之前，用缓存加上多份相同副本先扛。`,
    },
  ],
};

export const shortAccessModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法说，访问大多是标准流程，不必单独做一套。要做的话，对外和内部分开列。
短链的产品定位是内部服务，不对外提供短链功能。所以这一版走内部那张清单。对外那张照课程写上，但不启用。
谁先做、谁后做，已经画在业务的两张时序里。这里只回答：谁可以调，怎样才不会被刷。`,
    },
    {
      type: "text",
      text: `【如果是内部服务则需要考虑】
权限认证
账户每日限额
校验链接是否有效

这一版就是这三项。权限认证接公司内部已有的方式。每个账号有每日限额。创建前要确认长网址打得开。

【如果是对外服务】
这一版不做。方法要求把清单分开，所以照课程列在下面，避免以后改成对外时漏项。
IP限制请求数
用户限制转链额度
记录已转链的 URL 缓存，防止刷光发号器。这只适用于「相同的 URL 可以转成不同短链」的场景。本项目要求相同长链得到同一个短链，发号器不会因为同一条长链被反复消耗。
记住的方式可以是 LRU，也可以用布隆过滤器。
校验链接是否有效。课程给的写法是 1 秒超时：`,
    },
    {
      type: "code",
      text: `timeout := time.Duration(1 * time.Second)
client := http.Client{
    Timeout: timeout,
}
resp, err := client.Get("http://google.com")`,
    },
    {
      type: "text",
      text: `转链时序的第 2 步调用的就是这段。打不开，就不进入发号。`,
    },
  ],
};
