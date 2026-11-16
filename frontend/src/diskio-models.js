// support 磁盘 IO 定时扫描。三格按通用方法。图按 srv_support/internal/diskio 现在的代码。

const actors = ["闹钟", "Runner", "管理库", "ZK", "机器", "判断", "unoc"];
const col = 148;
const pad = 24;
const cx = (name) => pad + actors.indexOf(name) * col + col / 2;
const seqWidth = pad * 2 + actors.length * col;

function message(from, to, label, y, dash) {
  const x1 = cx(from);
  const x2 = cx(to);
  const dir = Math.sign(x2 - x1) || 1;
  return {
    d: `M ${x1} ${y} L ${x2 - dir * 11} ${y}`,
    label,
    lx: (x1 + x2) / 2,
    ly: y - 14,
    dash: !!dash,
  };
}

function buildSeq() {
  const edges = [];
  const frames = [];
  const tags = [];
  let y = 86;

  function add(from, to, label, dash) {
    edges.push(message(from, to, label, y, dash));
    y += 48;
  }

  add("闹钟", "Runner", "时间到了，开始这一轮", false);
  add("Runner", "管理库", "把正在运行的 MySQL 列出来", false);
  add("管理库", "Runner", "先返回全量名单", true);

  const loopTop = y;
  y += 40;
  add("Runner", "ZK", "宿主机路径对应哪个 IP", false);
  add("ZK", "Runner", "返回 IP", true);
  add("Runner", "机器", "在这台机器上执行 iostat", false);
  add("机器", "Runner", "同一 IP 这一轮只打一次", true);
  add("Runner", "判断", "这个毫秒数要不要告警", false);

  function alt(title, rows) {
    const top = y;
    y += 40;
    for (const [from, to, label, dash] of rows) add(from, to, label, dash);
    frames.push({ kind: "frame", x: 40, y: top, w: seqWidth - 80, h: y - top + 4 });
    tags.push({ text: title, x: 48, y: top + 8 });
    y += 18;
  }

  alt("alt  有盘超过 400 毫秒", [
    ["判断", "Runner", "要发出。主库先 P2，满 3 次升 P1。备库保持 P2", true],
    ["Runner", "unoc", "带上这台库的编号，发出告警", false],
  ]);
  alt("alt  上次异常已超过 60 秒，这次正常", [
    ["判断", "Runner", "要收回", true],
    ["Runner", "unoc", "用同一个编号把告警关掉", false],
  ]);
  alt("alt  连续失败满 12 次", [
    ["判断", "Runner", "另发一条。不改 await 的连续次数", true],
    ["Runner", "unoc", "带上这台库的编号发出", false],
  ]);
  alt("alt  没超过 400，失败次数还没满", [["判断", "Runner", "这一次不发告警", true]]);

  frames.unshift({ kind: "frame", x: 16, y: loopTop, w: seqWidth - 32, h: y - loopTop + 10 });
  tags.unshift({ text: "loop  工人领到一台库", x: 24, y: loopTop + 8 });

  const height = y + 28;
  const lifelines = actors.map((name) => ({ kind: "life", x: cx(name), y1: 58, y2: height - 12 }));

  return {
    type: "picture",
    caption: "时序。从左到右是参与者，从上到下是一轮。虚线是返回，或这一轮不一定走。",
    width: seqWidth,
    height,
    guides: [...frames, ...lifelines],
    tags,
    nodes: actors.map((name) => ({
      id: name,
      kind: "head",
      x: cx(name) - 52,
      y: 10,
      w: 104,
      h: 40,
      lines: [name],
    })),
    edges,
  };
}

function buildMachine() {
  const box = (id, x, y, w, h, lines) => ({ id, kind: "fixed", x, y, w, h, lines });
  return {
    type: "picture",
    caption: "状态机。一台库的主或备，同一时间只有一格。次数记在这台 support 的内存里。",
    width: 960,
    height: 680,
    nodes: [
      { id: "dot", kind: "dot", x: 448, y: 14, w: 16, h: 16, lines: ["开始"] },
      box("idle", 360, 52, 190, 52, ["未告警"]),
      box("p2", 36, 230, 220, 64, ["告警累计中", "备库一直停在 P2"]),
      box("fail", 700, 230, 210, 64, ["采集失败", "没满 12 次只计数"]),
      box("p1", 360, 430, 190, 52, ["主库 P1"]),
      box("back", 360, 570, 190, 52, ["已收回"]),
    ],
    edges: [
      { d: "M 456 30 L 456 52", label: "", lx: 0, ly: 0 },
      { d: "M 360 78 L 146 230", label: "某块盘 await 超过 400 毫秒", lx: 220, ly: 150 },
      { d: "M 550 78 L 805 230", label: "登录或命令失败", lx: 720, ly: 150 },
      { d: "M 700 230 L 700 168 L 256 168 L 256 230", label: "备库每满 12 次，记成 P2", lx: 478, ly: 188 },
      { d: "M 146 294 L 360 456", label: "主库，60 秒内累计到 3 次", lx: 200, ly: 390 },
      { d: "M 805 294 L 550 456", label: "主库每满 12 次", lx: 760, ly: 390 },
      { d: "M 455 482 L 455 570", label: "超过 60 秒，且本轮正常", lx: 620, ly: 520 },
      { d: "M 36 262 L 16 262 L 16 596 L 360 596", label: "P2 同样可以收回", lx: 90, ly: 470 },
      { d: "M 550 596 L 940 596 L 940 78 L 550 78", label: "删掉这条内存记录", lx: 820, ly: 500 },
    ],
  };
}

const placeFlow = {
  type: "flow",
  caption: "读管理库，次数放内存，告警交给 UNOC。这边不落一张新表。",
  width: 900,
  height: 180,
  nodes: [
    { id: "db", name: "管理库", text: "三张已有表，只读", x: 24, y: 36, w: 220 },
    { id: "mem", name: "本进程内存", text: "连续次数。重启从 0 开始", x: 330, y: 36, w: 240 },
    { id: "unoc", name: "UNOC", text: "告警在那边。这边不存正文", x: 650, y: 36, w: 220 },
  ],
  edges: [
    { from: "db", to: "mem", label: "读出要扫的实例", at: 0.5, side: -1 },
    { from: "mem", to: "unoc", label: "要发或要收回时才送", at: 0.5, side: -1 },
  ],
};

export const diskBizModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
这个需求没有用户点按钮。support 自己每隔一会儿，看本地域正在跑的 MySQL，磁盘等得厉不厉害。厉害了就告警，好了就把告警收回。

规则是从 Mongo 的磁盘巡检套过来的。Mongo 用 iowait 和读写次数，MySQL 这一版只用每块盘的 await。iowait 采回来了，当前不参与告警。`,
    },
    buildSeq(),
    {
      type: "text",
      text: `【对着这张时序】
闹钟只负责叫醒 Run，间隔 20 秒。Run 入口用 running 做单轮互斥：上一轮的 goroutine 还没退出，这一轮直接返回。

Runner 先向管理库要全量名单。SQL 只取 state = 40 的 MySQL（db_cluster_id = 1），每条带 parent_name 和高可用角色。仲裁节点没有业务盘，不在这个列表里。同一台库如果关联出多行，留下带主备角色的那一行。

名单交给工人池。池的大小是 min(100, 实例数)，共用一个无缓冲 channel。都在处理时，主流程继续往里放会堵住，所以同时执行 checkOne 的实例不超过 100 个。处理完一个再取下一个，本轮结束 goroutine 就退出。

循环里每个实例先把 parent_name 换成虚拟机 IP。parent_name 是这台库所在 UHost 的 ZK 路径，本地域 ZK 上这个节点的 Ip 才是要登录的地址。SSH 端口用 22，不用节点里登记的端口。virtual_ip 不参与。同一个路径解析过之后留在内存里。

然后 Runner 让这台虚拟机执行 iostat -cdxy 1 1。同一个 IP 这一轮只打一次，其余堵在这次结果上，拿到同一份 await。不同 IP 才会并行打。单次 checkOne 的超时是 3 秒，包含等 ZK、等同 IP 的这次采集、以及命令本身。SSH 长连接按这个 IP 保存，同一条连接上不会同时跑两条命令。loop、ram、光驱、软驱跳过。

判断看这组毫秒数，再决定找不找 unoc。有盘 await 大于 400 毫秒就发出：主库先 P2，60 秒内连续满 3 次升 P1，备库保持 P2。上次异常已超过 60 秒且这次正常，用同一个编号收回。登录或命令连续失败满 12 次另发一条，这本账不改 await 的连续次数。编号是 MysqlDiskIOCheck.实例编号.primary 或 .replica。没超过 400，或者失败次数还没满，这一次不发。`,
    },
    buildMachine(),
    {
      type: "text",
      text: `【对着这张状态机】
格子是一台库的主库或备库，不是整机。次数记在本进程的 map 里，键就是上面那个编号。进程重启后次数从 0 开始，和 Mongo 一样。

未告警往左：某一块盘的 await 超过 400 毫秒，进入告警累计中，这一次先发 P2。60 秒内再出现，次数加一。主库累计到 3 次，升到主库 P1。备库次数再多也停在 P2。两次异常隔了 60 秒以上，累计从 1 重新数，级别回到 P2。

未告警往右：登录失败、命令超时、iostat 里没有盘，都算采集失败。失败不推进左边的 await 次数。没满 12 次只计数。主库每满 12 次发 P1，备库每满 12 次记成 P2。

收回：距离上次异常已经超过 60 秒，并且这一轮是正常的，就删掉这条内存记录，同时调 RecoverUnom。100 到 400 毫秒之间只打日志，不改这张图上的格子，也不发告警。

单点实例没有集群编号，按主库算。高可用里角色 2 是主库，3 是备库。高可用但成员表没有角色时，按备库算，最高 P2。

告警正文先改内存，再调 UNOC。UNOC 没送成功，次数已经记下了，这一次不会自动重发。收回也是先删内存再调。收回的请求失败了，内存里已经没有这条，下一轮不会再补一次收回。`,
    },
    {
      type: "text",
      text: `【约束与边界】
- 只扫正在运行的 MySQL。别的数据库类型、没在跑的、仲裁节点，这一轮看不见。
- 上一轮没结束就跳过，不排队。
- 同一台宿主机这一轮只采一次 iostat。SSH 按机器留一条长连接，命令失败才把这条连接丢掉。
- 命令默认 3 秒超时。整轮被取消时，这一台不再记失败。
- await 告警线 400 毫秒，日志线 100 毫秒。窗口 60 秒，主库 P1 要 3 次。失败每 12 次告一次。这些是评审给的默认值，配置里写了更大的正数才会覆盖。
- 开关 disk_io_enabled 默认是开。配置文件里还没有这些键，不写就用代码里的默认值。
- parent_name 是 UHost 的 ZK 路径。本地域 ZK 上的 Ip 才是登录地址，端口固定 22，virtual_ip 不参与。路径解析过就留在内存里。parent_name 为空时，这一台记成采集失败。`,
    },
    {
      type: "text",
      text: `【表：几张、唯一键、字段从哪来】
不新建表。巡检只读管理库里已经有的三张：

- t_db_instance：实例编号、集群编号、公司、宿主机 parent_name、state、role。这些是实例创建和变更时写进去的，巡检不改。
- t_db_factory：用 db_cluster_id 认出 MySQL。1 才要。
- t_ha_cluster_member：role。2 是主库，3 是备库。没有成员行时 SQL 给 0。

同一台库的唯一识别是实例编号加上主或备，不是表上的唯一键，是内存 map 的键。iostat 的数字不入库。`,
    },
    {
      type: "text",
      text: `【API 粗】
没有给用户或 DevOps 的新接口。这一轮自己发起这些调用：

- 读管理库：ListRunningMySQLDiskTargets，只查，不写。
- 读本地域 ZK：用 parent_name 换虚拟机 IP。
- 上宿主机：SSH 执行那一条 iostat。
- 告警：unoc 的 AddUnomInfo 和 RecoverUnom。`,
    },
    {
      type: "text",
      text: `【API 细】
AddUnomInfo 的正文有这些字段：Action、title、source、happen_time、info_type、desc、source_id、show_level。

title 形如「mysql 磁盘异常|实例编号|主库」。desc 里有 ZoneId、实例、集群、角色、公司、宿主机、原因。info_type 默认 udb_mysql_disk_io，source 默认「UDB运营系统」。级别只有 P1 和 P2，空的按 P2 送。

RecoverUnom 只带 Action、source_id、recover_time。

HTTP 超时 5 秒。对方要 success 为真且 code 为 200，否则当失败，只打日志。

地址来自配置 disk_io_unoc_url。ZoneId 会写进 desc，LoadConfig 没有从配置文件读它，没人赋值时是 0。`,
    },
    {
      type: "text",
      text: `【扩展】
有明确要求再加。代码注释已经留了口子：以后要加指标，把字段加进同一条 iostat 的输出里，不要再开一轮定时任务。

iowait 就是这样先采着、先不用。100 毫秒的日志线也已经在，只是不告警。闹钟叫醒 Run 已经画在上面的时序里。`,
    },
  ],
};

export const diskStoreModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
数据放哪个组件，要不要新表，占多大，怎么删，一轮扫不过来怎么办，挂了次数还在不在。`,
    },
    placeFlow,
    {
      type: "text",
      text: `【对着这张图】
实例名单在本地域管理库，用的是 MySQL，support 本来就连着它。不新开一种存储。三张表只读，字段和来源写在业务那一格。

连续次数放在本进程的内存 map。一条记录只有失败次数、await 累计次数、上次异常的时间。不估磁盘容量，因为 iostat 的原文不保存。正在异常的实例才有内容，收回时把这条删掉。从没告警过的，map 里会留下一条空计数，收回条件要「以前告警过」，所以空计数不会被清掉。

一轮要扫的台数代码里没有写死，就是本地域所有正在跑的 MySQL。工人默认 100。上一轮没完就整轮跳过，用来挡住堆叠。同一台机器只采一次，SSH 连接按机器复用。

部署在每个地域的 support 进程里，不是单独再起一个服务。代码里没有跨进程的锁。这台进程重启，次数从 0 开始，已经发出的告警要等新进程再次判定恢复，才会收回。`,
    },
  ],
};

export const diskAccessModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
谁在调谁。这是内部巡检，没有对外页面，所以不去套 IP 限额、用户每日额度那一套。要看的是时序上这几条内部通道慢在哪、凭什么能调。`,
    },
    {
      type: "text",
      text: `【对着时序里的通道】
管理库：走 support 已经有的库连接。这一条只读，先拿全量正在运行的 MySQL。慢的话慢在实例多，不在单次写入。

ZK：parent_name 是 UHost 的路径，读本地域这个节点的 Ip。解析过的路径留在内存里。端口用 22，不用节点里登记的端口，virtual_ip 不参与。

宿主机：SSH，默认用户 root，端口 22，用密钥登录，不在页面上写密码。单次 checkOne 超时 3 秒，里面包含等 ZK、等同一 IP 的这次采集、以及命令本身。连接按 IP 留着，同一条连接上不会同时跑两条命令，失败才丢掉重连。

UNOC：HTTP，JSON，超时 5 秒。没有每日额度。送失败只打日志，不把这一轮卡住。

读远多于写：每 20 秒读一遍实例名单和 iostat，只有越线或恢复才写 UNOC。不需要为它再拆一个服务，就放在本地域 support 里。`,
    },
  ],
};
