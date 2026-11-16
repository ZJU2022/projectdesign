// pg 插件三格。业务里只有一张时序、一张状态机，版式对齐 img/55 和 img/33。

const actors = ["业务库", "管控服务", "运营平台", "运营库", "US3临时桶", "US3线上桶", "OA审批流"];
const col = 132;
const pad = 18;
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
    ly: y - 13,
    dash: !!dash,
  };
}

function buildSeq() {
  const groups = [
    {
      title: "插件上传",
      messages: [
        ["运营平台", "US3临时桶", "预签名上传，上海和圣保罗各一份"],
        ["运营平台", "运营库", "落库，状态直接是测试中"],
      ],
    },
    {
      title: "插件测试",
      messages: [
        ["运营平台", "管控服务", "按操作系统创建测试实例"],
        ["管控服务", "运营平台", "等到 Running", true],
        ["运营平台", "管控服务", "InstallExtensionCustom"],
        ["管控服务", "运营平台", "安装任务 Success", true],
        ["运营平台", "管控服务", "停掉并删除测试实例"],
        ["运营平台", "运营库", "改为待提交审批"],
      ],
    },
    {
      title: "OA审批流",
      messages: [
        ["运营平台", "OA审批流", "CreateUxiaoTicket"],
        ["运营平台", "运营库", "记下单号，状态审批中"],
        ["运营平台", "OA审批流", "轮询工单，直到真人批完"],
        ["运营平台", "运营库", "通过则改为待发布"],
      ],
    },
    {
      title: "审批通过后点击确认发布",
      messages: [
        ["运营平台", "US3临时桶", "Promote：临时区复制到桶根"],
        ["US3临时桶", "US3线上桶", "Fanout：复制到各地域桶"],
        ["运营平台", "管控服务", "先写元数据，再写包"],
        ["管控服务", "业务库", "写入本地域业务库"],
      ],
    },
  ];

  const edges = [];
  const guides = actors.map((name) => ({ kind: "life", x: cx(name), y1: 58, y2: 0 }));
  const tags = [];
  let y = 78;
  for (const group of groups) {
    const top = y;
    const names = new Set();
    y += 42;
    for (const [from, to, label, dash] of group.messages) {
      names.add(from);
      names.add(to);
      edges.push(message(from, to, label, y, dash));
      y += 46;
    }
    const xs = [...names].map(cx);
    const left = Math.min(...xs) - 62;
    const right = Math.max(...xs) + 62;
    guides.push({ kind: "frame", x: left, y: top, w: right - left, h: y - top + 6 });
    tags.push({ text: group.title, x: left + 8, y: top + 6 });
    y += 28;
  }
  const height = y + 8;
  guides.forEach((guide) => {
    if (guide.kind === "life") guide.y2 = height - 12;
  });

  return {
    type: "picture",
    caption: "时序。从左到右是参与者，从上到下是时间。一条版本只走这一张。",
    width: seqWidth,
    height,
    guides,
    tags,
    nodes: actors.map((name) => ({
      id: name,
      kind: "head",
      x: cx(name) - 56,
      y: 10,
      w: 112,
      h: 42,
      lines: [name],
    })),
    edges,
  };
}

function buildMachine() {
  const box = (id, x, y, w, text) => ({ id, kind: "fixed", x, y, w, h: 44, lines: [text] });
  const chip = (id, x, y, w, h, lines) => ({ id, kind: "chip fixed", x, y, w, h, lines });
  return {
    type: "picture",
    caption: "状态机。一条版本同一时间只有一格。灰底是运维点的按钮。",
    width: 960,
    height: 980,
    nodes: [
      { id: "dot", kind: "dot", x: 446, y: 8, w: 14, h: 14, lines: ["开始"] },
      chip("up", 338, 36, 230, 34, ["运维「测试并上传」"]),
      box("testing", 368, 104, 170, "测试中"),
      box("tfail", 28, 230, 150, "测试失败"),
      box("wait", 620, 210, 180, "待提交审批"),
      chip("submit", 560, 292, 300, 52, ["运维「提交审批」", "（必须已选地域）"]),
      box("approving", 635, 378, 150, "审批中"),
      box("ppub", 635, 500, 150, "待发布"),
      chip("go", 650, 572, 120, 32, ["运维「发布」"]),
      box("publishing", 635, 632, 150, "发布中"),
      box("pfail", 28, 860, 150, "发布异常"),
      box("done", 720, 860, 150, "已发布"),
    ],
    edges: [
      { d: "M 453 22 L 453 36" },
      { d: "M 453 70 L 453 104" },
      { d: "M 400 148 L 400 208 L 103 208 L 103 230", label: "测试/上传失败或超时", lx: 250, ly: 196 },
      { d: "M 58 252 L 58 176 L 368 176", label: "运维再测", lx: 180, ly: 164, dash: true },
      { d: "M 538 126 L 710 126 L 710 210", label: "安装成功", lx: 620, ly: 112 },
      { d: "M 710 254 L 710 292" },
      { d: "M 710 344 L 710 378" },
      { d: "M 710 422 L 710 500", label: "OA 通过", lx: 760, ly: 460 },
      { d: "M 635 400 L 540 400 L 540 232 L 620 232", label: "驳回或终止", lx: 470, ly: 360 },
      { d: "M 710 544 L 710 572" },
      { d: "M 710 604 L 710 632" },
      { d: "M 635 654 L 420 654 L 420 882 L 178 882", label: "任地域失败或超时", lx: 500, ly: 640 },
      { d: "M 785 676 L 795 676 L 795 860", label: "全部地域扇出成功", lx: 640, ly: 760 },
      { d: "M 28 904 L 12 904 L 12 710 L 710 710 L 710 676", label: "再点发布", lx: 360, ly: 930, dash: true },
      { d: "M 870 882 L 940 882 L 940 654 L 785 654", label: "补发还没成功的地域", lx: 760, ly: 800, dash: true },
    ],
  };
}

const seqPicture = buildSeq();
const statePicture = buildMachine();

const placeFlow = {
  type: "flow",
  caption: "文件走桶，状态走运营库。管控库只在扇出成功后写。",
  width: 880,
  height: 280,
  nodes: [
    { id: "tmp", name: "临时区", text: "上海、圣保罗各一份", x: 16, y: 24, w: 180 },
    { id: "pub", name: "桶根正式区", text: "键名就是 file_name", x: 250, y: 24, w: 200 },
    { id: "reg", name: "各地域桶", text: "Fanout 复制过去", x: 520, y: 24, w: 180 },
    { id: "ops", name: "运营库 opstool", text: "状态在 pg_extension_file", x: 16, y: 160, w: 220 },
    { id: "gw", name: "内部网关", text: "ops 调 API", x: 300, y: 160, w: 180 },
    { id: "biz", name: "本地域业务库", text: "srv_core 写入", x: 540, y: 160, w: 220 },
  ],
  edges: [
    { from: "tmp", to: "pub", label: "发布前 Promote", at: 0.5, side: -1 },
    { from: "pub", to: "reg", label: "按地域 Fanout", at: 0.5, side: -1 },
    { from: "ops", to: "gw", label: "扇出", at: 0.5, side: -1 },
    { from: "gw", to: "biz", label: "只写已发布", at: 0.5, side: -1 },
  ],
};

export const pgBizModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法里，业务最先画时序，再画状态机。这个系统慢的是测试、审批和往各地域发文件。核心是一条插件小版本的状态不要转错。

时序只有一张：谁先叫谁，按时间从上往下读。状态机也只有一张：这一行现在停在哪一格，下一步能去哪。

方案的范围是：运营平台的 Pgsql 运维新增插件管理。可以新增插件，也可以给插件新增小版本；可以查看元数据和版本详情；按唯一环境纬度分发到各个地域。这个纬度是【操作系统 - PG 版本 - 插件小版本】。本次改动的服务是 ops-toolkit。`,
    },
    seqPicture,
    {
      type: "text",
      text: `【对着这张时序】
参与者还是这七个。临时桶现在有两份：上海一份，圣保罗一份，对象键相同。线上桶在图上代表发布时的正式区，以及各地域自己的桶。

插件上传。运营平台先要一个预签名地址，前端往上海、圣保罗各传一份。落库时服务端算 md5，状态直接写成测试中，并立刻开始测试。常量里还有「待测试」，这条链路没有写入它。

插件测试。按包上的操作系统选环境：CentOS 在上海二建实例，Rocky 9.7 在圣保罗建实例。等到实例 Running，安装前先把插件元数据同步到管控，再调 InstallExtensionCustom。安装任务变成 Success 才算过。无论成败，都会先停实例再删掉。成功把运营库改成待提交审批。

OA 审批流。提交时必须带上地域，这些地域记在 publishing_regions。工单用 CreateUxiaoTicket 创建，创建人是当前登录人。ops-toolkit 自己轮询工单，没有单独的审批回调。通过才改成待发布。驳回、终止，或轮询失败，都退回待提交审批，图上这条回头路在状态机里。

审批通过后点击发布。先 Promote：把临时区的对象复制到上海桶的桶根，键名就是 file_name。再按地域 Fanout：从桶根复制到该地域的桶。每个地域先 CreateUPgSQLExtensionMetaData，再 CreateUPgSQLExtensionFile。某个地域做完就立刻把结果写回运营库。`,
    },
    statePicture,
    {
      type: "text",
      text: `【对着这张状态机】
从上往下是主路，左右是分叉。灰底方框是运维要点的按钮，白底方框才是库存状态。

落库之后就是测试中。常量里的待测试没有被写入。
测试或上传失败，或者实例、安装超时，到左边的测试失败。重新上传这一行，虚线回到测试中。
安装成功，到待提交审批。
点「提交审批」时必须带地域，然后进入审批中。待发布时也可以再次提交，用来改本次要发的地域。
OA 通过，往下到待发布。驳回或终止，回到上面的待提交审批，不进发布异常。
点「发布」，进入发布中。待发布、已发布、发布异常都可以点。
这一轮地域全部成功，到右下的已发布。有地域失败，到发布异常。成功的地域已经记在 regions 里，失败的记在 publish_failed_regions，原因按地域拼进 error_message。
发布异常再点发布，虚线直接进发布中，只发还没成功、并且审批时选过的地域。
已发布之后如果审批里还有没发完的地域，再点发布也是直接进发布中。多出来的地域会被拒绝。

库存是大写，页面中文在后：
PENDING 待测试（常量有，这条链路不写）
TESTING 测试中
TEST_FAILED 测试失败
PENDING_APPROVAL 待提交审批
APPROVING 审批中
APPROVED 待发布
PUBLISHING 发布中
PUBLISHED 已发布
PUBLISH_FAILED 发布异常

【约束与边界】
1. 一行包用四个字段定位：extension_name、version、pg_version、os_version。列表也要带当前的 PG 和操作系统。
2. 发布部分地域失败：成功地域追加进 regions，失败地域追加进 publish_failed_regions。这一轮发完，没有失败就是已发布，有失败就是发布异常。
3. 再次发布不用重新审批。只能发审批时选过、并且还没出现在 regions 里的地域。
4. 测试实例或安装超时，记测试失败。审批轮询超过 7 天，退回待提交审批。包超过 200MB 在落库时就被拒绝。
5. 发布顺序：先 Promote 到桶根，再按地域 Fanout，然后先元数据、后包文件。

【表：几张、唯一键、字段从哪来】
字段从哪来，先看 PRD 的页面：列表、新增插件、新增版本、发布抽屉。页面上用户能填的，就是用户输入。页面上只读的，就是当前环境带过来的。页面上固定画横线的，库里没有这个字段。剩下的值不是人填的，是上传、测试、审批、发布这些步骤写回来的。

运营库是 opstool。业务表两张，外加一张桶配置。

pg_extension_meta，一个插件一行。PRD 的新增插件表单：
- extension_name、category、description、need_restart、preload_config、tutorial_url：用户填。extension_name 创建后当作这一行的标识。
- can_uninstall：创建请求里有，和上面那些一起交给接口。
列表上插件这一行的版本、状态、已发布地域、更新时间，PRD 固定显示横线。这些列不在 meta 上。

pg_extension_file，一个包一行。PRD 的新增版本：
- version：用户填。
- os_version、pg_version：只读，取当前环境。一行包就是这一个操作系统乘这一个 PG。
- file_name：服务端拼，形如扩展名_版本_pg大版本_操作系统.tar.gz。
- checksum：PRD 写成用户填。现在的代码在落库时自己算 md5，不再让人填。
- object_key：上传接口发的临时对象键，不是 PRD 里的公共桶路径。
定位一行就是 extension_name、version、pg_version、os_version。测试中、审批中、待发布、发布中、已发布不能被重新上传覆盖。

这些不是表单填的，是流程写回来的：
- status：落库写成测试中，后面按测试、审批、发布改。
- publishing_regions：发布抽屉里用户多选的地域，提交审批时记下。地域名单来自配置，不是用户现编的。
- regions、publish_failed_regions、error_message：每个地域发布完追加。
- oa_ticket_id：建完 OA 工单写下单号。
- test_instance_id、test_task_id：测试建实例、装插件时写下。

pg_extension_us3_key 不在 PRD 的业务页面里。它是各地域桶的地址和密钥，运维配在库里。region 为 ops 是上海运营桶，ops-hw 是圣保罗运营桶。

【接口】
现在注册的是这七个，都走 ops-toolkit 原来的 Action：
CreateExtensionMeta，写插件并同步管控。
ListExtensionMeta，按 pg_version、os_version 列插件和包。
CreateExtensionUploadTicket，返回上海、圣保罗两个上传地址。
CreateExtensionFile，校验临时对象、落库，并启动测试。
ListExtensionFile，列出一个插件的全部包。
CreateExtensionApproval，提交审批。
PublishExtensionFile，发布或补发。

测试和审批都是服务自己轮询，没有单独的结果回调接口。`,
    },
  ],
};

export const pgStoreModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法接着问：数据放哪个组件，字段什么类型，要占多大，怎么删，一台挂了怎么办。
这份方案写清了库和桶，没有写一条多少字节、每秒多少条，也没有写删除。容量和删除不编。`,
    },
    placeFlow,
    {
      type: "text",
      text: `【对着这张图】
上面一行是文件。上传落在临时区 tmp/，上海和圣保罗各有一份，键相同。发布前 Promote 把上海这份复制到桶根，键名改成 file_name。再按地域 Fanout，从桶根复制到该地域的桶。实现是把对象读出来再写到目标桶。
下面一行是库。状态和地域集合在 pg_extension_file。每个地域先写管控元数据，再写包。桶的密钥在第三张表 pg_extension_us3_key，region 为 ops 是上海运营桶，ops-hw 是圣保罗运营桶。

【pg_extension_meta】
一个插件一行。extension_name 是业务标识。还有 category、description、need_restart、preload_config、can_uninstall、tutorial_url。创建时写入，并同步到管控。

【pg_extension_file】
一个包一行。extension_name、version、pg_version、os_version 四个字段定位这一行。
file_name 服务端生成。checksum 是服务端算的 md5。object_key 指向临时区。
status 是上面那组大写状态。regions 是已成功地域，publishing_regions 是这一轮要发的，publish_failed_regions 是失败地域。
另外有 oa_ticket_id、error_message、test_instance_id、test_task_id。

【容量和删除】
方案没有给一条多少字节，也没有给每秒写入多少。先不要估磁盘。
方案没有删除接口，也没有 is_del。不要自己加软删。

【高可用】
代码没有写一主几备，也没有写 ops-toolkit 要部署几份。写清楚的是：状态在运营库，文件先在临时区，发布时进桶根再进各地域桶，管控元数据和包按地域各写一次。`,
    },
  ],
};

export const pgAccessModel = {
  kind: "sheet",
  blocks: [
    {
      type: "text",
      text: `【这一步在问什么】
通用方法说，访问大多是标准流程，不必单独做一套。短链那种对外限 IP、对内每日限额，这份方案没有写。不要从短链抄过来。

要单独说清的是：页面打进来的是哪几个 Action，哪些会离开 ops。谁先做、谁后做，已经画在业务的时序里。`,
    },
    {
      type: "text",
      text: `【页面打进来的】
ListExtensionMeta、ListExtensionFile 只读运营库。列表要带 pg_version 和 os_version。
CreateExtensionUploadTicket 只发两个预签名地址，包是前端自己传进桶。
CreateExtensionFile 读临时桶、落库，然后在后台做测试。
CreateExtensionMeta 写运营库，并立刻同步管控。
CreateExtensionApproval 写审批中，后台去建 OA 工单并轮询。
PublishExtensionFile 把状态改成发布中，后台做 Promote、Fanout 和写管控。

【没有单独回调】
测试结果、OA 结果都是 ops-toolkit 自己轮询写回运营库，没有 Report 开头的接口给外面调。

【这一版不写的】
没有 IP 限制，也没有账户每日限额。包的校验是体积、包名和压缩包内容，checksum 由服务端计算。`,
    },
  ],
};
