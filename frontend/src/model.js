// 总链五站不再改：基础、骨架、设计、测试、部署运维。
// 01、02 按《Build修炼》研发模块和七米《微服务概览》写细。
// 一个节点带着自己的 model。写着「展开」的，里面还有一层。

import { diskAccessModel, diskBizModel, diskStoreModel } from "./diskio-models.js";
import { pgAccessModel, pgBizModel, pgStoreModel } from "./pg-models.js";
import { testModel } from "./test-models.js";
import { shortAccessModel, shortBizModel, shortStoreModel } from "./shortlink-models.js";

export const book = {
  title: "工程设计原理",
  thesis: "基础和骨架是动手之前的印象。设计里做系统和业务。然后测试，再部署与运维。",
  nodes: [
    {
      id: "base",
      name: "基础",
      hint: "算法 + 数据结构",
      model: {
        kind: "fork",
        lead: "开发就是设计一个新系统，或者维护一个老系统。程序等于算法加数据结构。左边处理数据，右边存放数据。Go 语法先走通这两边。",
        left: {
          name: "处理数据",
          note: "选择、重复、起名字，以及让数据同时流动、送到另一台机器。",
          down: true,
          steps: [
            { id: "if", name: "if / else", text: "条件成立走一条，否则走另一条。" },
            { id: "for", name: "for / while", text: "同一段步骤重复做，直到条件变了。" },
            { id: "fn", name: "函数", text: "给一段步骤起名字。调用的时候才执行。" },
            { id: "go", name: "并发", text: "几段步骤同时往前走，不必一个做完再做下一个。" },
            { id: "ch", name: "channel", text: "并发的步骤之间传数据的管道。一边放进去，另一边取出来。" },
            { id: "ptr", name: "指针", text: "不复制那份值，拿着它的地址，改的是原来那一份。" },
            { id: "ref", name: "反射", text: "程序跑起来之后，才去看一个值的类型和字段。" },
            { id: "net", name: "网络", text: "把数据送到另一台机器上的另一个程序。" },
          ],
        },
        right: {
          name: "存放数据",
          note: "一个值、一串值、按键去找、把相关字段捆在一起。",
          down: true,
          steps: [
            { id: "var", name: "变量", text: "一个有名字的值。算法要变它，先得有地方放。" },
            { id: "arr", name: "数组", text: "长度一开始就定好的一串值。" },
            { id: "list", name: "链表", text: "每一节只记得下一节在哪。中间插入不必整串搬家。" },
            { id: "map", name: "map", text: "用键取出对应的值，不必从头逐个看。" },
            { id: "hash", name: "hash", text: "把键变成一个位置。map 靠它来找。" },
            { id: "struct", name: "结构体", text: "把相关字段放进同一个类型。models 层放的就是这种形状。" },
          ],
        },
        gates: {
          name: "怎么练",
          note: "手艺在项目里。注释先写对，再敲小例子，然后做一个完整项目。",
          steps: [
            { id: "note", name: "先写注释", text: "遇事不决先写注释。注释对了，思路就对了。" },
            { id: "demo", name: "先做 demo", text: "Web 基础自己敲几个小程序，同时看进阶课。" },
            { id: "bell", name: "再做 bluebell", text: "从零写一个项目，把路由、分层、数据库放进同一次练习。" },
          ],
        },
      },
    },
    {
      id: "frame",
      name: "骨架",
      hint: "程序骨架，微服务骨架",
      model: {
        kind: "chains",
        lead: "语法会了还接不住项目。先认清一个 Web 程序怎么搭，再认清微服务由哪些零件组成。用到再深入，但每一块要能指给人看。",
        chains: [
          {
            name: "一个 Web 程序",
            note: "请求从路由进来，穿过分层，用脚手架上的零件完成。bluebell 就是按这个骨架写的。",
            steps: [
              {
                id: "gin",
                name: "请求怎么进来",
                text: "Gin 管住一件事：什么地址、什么方法，执行哪个函数。",
                model: {
                  kind: "steps",
                  lead: "创建路由引擎，就是规定访问哪个地址、执行哪个函数。",
                  steps: [
                    { id: "engine", name: "路由引擎", text: "gin.Default() 拿出这个管理者。后面所有路径都登记在它上面。" },
                    { id: "rest", name: "资源和动作", text: "URL 表示资源，例如 /users。GET、POST、PUT、DELETE 表示对这个资源查、增、改、删。" },
                    { id: "ctx", name: "这一次请求", text: "gin.Context 装着这次 HTTP 的请求和响应。函数里通过它取数据、交回数据。" },
                    { id: "in", name: "四种取参", text: "路径用 Param，问号用 Query，表单用 PostForm，JSON 体绑定到结构体。" },
                    { id: "out", name: "交回 JSON", text: "c.JSON 把结果交回去。gin.H 就是 map[string]interface{}，用来随手组一份 JSON。" },
                  ],
                },
              },
              {
                id: "layers",
                name: "目录怎么分",
                text: "router 到 controller，再到 logic、dao。models 只放形状。",
                model: {
                  kind: "steps",
                  lead: "社区列表那个接口就是按这个顺序加出来的。新项目可以把 web_app 整份搬过去。",
                  steps: [
                    { id: "main", name: "main", text: "程序从这里启动。打开配置，挂上路由，开始监听。" },
                    { id: "router", name: "router", text: "路径登记在这里。/community 和 /community/:id 各自进自己的 controller。" },
                    { id: "ctl", name: "controller", text: "校验参数，然后调用 logic。业务计算不堆在这一层。" },
                    { id: "logic", name: "logic", text: "真正的业务在这里。它调用 dao，自己不写 SQL。" },
                    { id: "dao", name: "dao", text: "封装对 MySQL 或 Redis 的操作。" },
                    { id: "models", name: "models", text: "定义结构体。它不在调用链上干活，只说明数据长什么样。" },
                    { id: "logger", name: "logger", text: "日志用 zap。出问题先看这里。" },
                    { id: "settings", name: "settings", text: "Viper 把配置文件读进结构体。flag 可以在命令行指定这份文件的路径。" },
                  ],
                },
              },
              {
                id: "parts",
                name: "脚手架零件",
                text: "数据库、缓存、日志、配置、文档、采样。每个只要先知道它站在哪。",
                model: {
                  kind: "steps",
                  lead: "goweb_pro 里 mysql_demo、redis_demo、zap_demo 各是一个零件的练习。",
                  steps: [
                    { id: "sql", name: "MySQL", text: "database/sql 是标准库。sqlx 在它上面，少写把一行扫进结构体的代码。" },
                    { id: "redis", name: "Redis", text: "go-redis。要排序、要集合的数据放这里，例如帖子时间和谁投过票。" },
                    { id: "zap", name: "zap", text: "日志库。可以接到 Gin 上，让每个请求留下记录。" },
                    { id: "bye", name: "优雅关机", text: "进程退出前，把已经接住的请求做完，再关端口。" },
                    {
                      id: "swagger",
                      name: "Swagger",
                      text: "接口文档从注释生成，不参与业务。",
                      model: {
                        kind: "steps",
                        lead: "前端和测试打开网页就能看到有哪些接口、要什么参数、返回什么，还能试着调一次。",
                        steps: [
                          { id: "c1", name: "注释写在哪", text: "main 上写标题和地址。Handler 上写摘要、路径、参数、成功时的返回。" },
                          { id: "c2", name: "生成", text: "swag init 生成 docs。命令版本要和 go.mod 里的 swag 一致。" },
                          { id: "c3", name: "挂上路由", text: "router 里注册 /swagger/*any，网页才能打开这份文档。" },
                          { id: "c4", name: "改接口之后", text: "改完注释再生成一次。文档跟着接口走，不用口头再对一遍。" },
                        ],
                      },
                    },
                    { id: "pprof", name: "pprof", text: "程序在负载高的时候采样，才能看出热点。压测怎么安排，看测试那一站的性能测试。" },
                  ],
                },
              },
            ],
          },
          {
            name: "微服务长什么样",
            note: "七米概览里的演进、定义、好处、难处和划分。选型没有哪个更好，只有合适不合适。",
            steps: [
              {
                id: "evo",
                name: "四种架构",
                text: "单体，垂直，SOA，微服务。按阶段选，不按名词的新旧选。",
                model: {
                  kind: "steps",
                  lead: "架构的选型只有合适与不合适。",
                  steps: [
                    { id: "mono", name: "单体", text: "项目初期。增删改查在一个进程里做完。" },
                    { id: "vert", name: "垂直", text: "按业务把系统拆开。每一块仍是比较完整的一块。" },
                    { id: "soa", name: "SOA", text: "再做成组件。功能独立，通过服务彼此配合。" },
                    { id: "micro", name: "微服务", text: "服务化。每个服务是自己的进程，可以单独部署。" },
                  ],
                },
              },
              {
                id: "def",
                name: "一句定义拆开",
                text: "把一个单体做成一套小服务。下面六句是这个定义里的六个点。",
                model: {
                  kind: "steps",
                  lead: "James Lewis 和 Martin Fowler，2014。",
                  steps: [
                    { id: "small", name: "小型服务", text: "一个单体应用，拆成一套小服务来开发。" },
                    { id: "proc", name: "自己的进程", text: "每个服务在自己的进程里跑。" },
                    { id: "http", name: "轻量通信", text: "服务之间用轻的方式说话，通常是 HTTP 这一类 API。" },
                    { id: "biz", name: "围绕业务", text: "按业务能力来切，不是按技术层次来切。" },
                    { id: "ship", name: "独立部署", text: "可以单独发布。发布靠自动化，不必整包一起上。" },
                    { id: "free", name: "可以不同", text: "语言可以不同，存储也可以不同。" },
                  ],
                },
              },
              {
                id: "good",
                name: "快、准、狠",
                text: "敏捷和持续交付，粒度小所以质量好管，迭代周期短。",
                model: {
                  kind: "steps",
                  lead: "这是选用微服务时期望得到的。",
                  steps: [
                    { id: "fast", name: "快", text: "更注重敏捷开发和持续交付。" },
                    { id: "exact", name: "准", text: "服务粒度小，质量可以管得比较准。" },
                    { id: "hard", name: "狠", text: "产品迭代周期更短，适合变化快的时候。" },
                  ],
                },
              },
              {
                id: "hard",
                name: "难在哪",
                text: "拆开之后，复杂、依赖、一致性、测试和基础设施都会变难。",
                model: {
                  kind: "steps",
                  lead: "这些难处在后面的设计和测试里都会再碰到。",
                  steps: [
                    { id: "dist", name: "分布式", text: "一次请求要穿过多个进程，失败和延迟都要单独想。" },
                    { id: "dep", name: "依赖", text: "服务之间谁调用谁，要有地方登记，不能写死。" },
                    { id: "data", name: "一致性", text: "数据散在不同存储里，改一处要考虑另一处。" },
                    { id: "qa", name: "测试", text: "服务一多，集成和边界都比单体难。" },
                    { id: "ops", name: "DevOps", text: "独立部署要有自动化的构建、发布和监控。" },
                  ],
                },
              },
              {
                id: "cut",
                name: "怎么划分",
                text: "按职能切，按业务边界切，或者把命令和查询分开。",
                model: {
                  kind: "steps",
                  lead: "划分的依据是业务问题，不是文件夹好不好看。",
                  steps: [
                    { id: "cap", name: "业务职能", text: "按部门提供的职能切。客户服务是一块，财务是另一块。" },
                    { id: "bc", name: "限界上下文", text: "按要解决的不同业务问题划边界。边界里面用同一套领域语言。" },
                    { id: "cqrs", name: "命令和查询", text: "命令会改数据，就是增删改。查询不改数据。两类可以拆成两个服务，也可以只是同一程序里的不同接口。" },
                  ],
                },
              },
            ],
          },
          {
            name: "核心零件",
            note: "第一代微服务图上的那些框，收成六件。第二代把其中一部分放进旁边的代理。",
            steps: [
              { id: "gw", name: "API 网关", text: "外面只打一个入口。由它转到里面的服务，也可以在这里做校验。" },
              {
                id: "reg",
                name: "注册中心",
                text: "服务不写死对方的地址。按名字找到活着的实例。",
                model: {
                  kind: "steps",
                  lead: "hello 这种名字表示「这是什么服务」。127.0.0.1:8081 表示「这一台在哪」。",
                  steps: [
                    { id: "name", name: "名字和实例", text: "一个名字后面有很多 ip:port。生产里注册中心常是 3 到 5 个节点。" },
                    { id: "pick", name: "发现再挑选", text: "按名字拿到健康实例，再用一种策略选一台。最简单是轮流选。也可以由边车或网格帮你选。" },
                    { id: "two", name: "两种落地", text: "一种是代码用 SDK 向 consul 或 etcd 注册。一种是交给 Kubernetes，平台做查询和路由，业务代码不用改。" },
                    { id: "seen", name: "你见过的一种", text: "地址写进 etcd，support 启动时读出来用。要换地址就再写一次并重启，不会自动摘掉坏地址。Devops 只调用 support，不负责发现下游地址。" },
                  ],
                },
              },
              { id: "cfg", name: "配置中心", text: "配置不打进每个服务的包里。改配置时改这一处，服务来读。" },
              {
                id: "rpc",
                name: "服务通信",
                text: "像调用本地函数一样调用远程函数。gRPC 是其中一种框架。",
                model: {
                  kind: "steps",
                  lead: "stub 把结构体变成字节发出去。对端把字节还原，再调用真正的业务。",
                  steps: [
                    { id: "what", name: "RPC", text: "调用方觉得自己在调一个函数。中间其实走了网络。" },
                    { id: "proto", name: "proto", text: "用 proto 描述服务和方法。工具生成客户端 stub、请求和响应的类型。" },
                    { id: "srv", name: "服务端五步", text: "监听端口，创建 gRPC 服务器，实现 proto 里的函数，注册上去，然后 Serve。没实现的方法嵌入 Unimplemented，避免以后 proto 加了方法就编译失败。" },
                    { id: "cli", name: "客户端", text: "Dial 连上服务器，用生成的 stub 发请求。stub 负责序列化、等待、再反序列化。" },
                    { id: "stream", name: "流", text: "客户端可以连续发多个请求。服务端也可以分批返回多个消息。" },
                  ],
                },
              },
              { id: "gov", name: "服务治理", text: "熔断和限流放在这里。下游已经不健康时，不要继续把请求打过去。" },
              { id: "mon", name: "服务监控", text: "监控、链路追踪、日志、告警。一次请求穿过了哪些服务，要能查回来。" },
              { id: "mesh", name: "第二代", text: "Service Mesh，例如 istio。通信、发现、治理放进业务进程旁边的代理，业务代码少碰这些。" },
            ],
          },
          {
            name: "三套框架",
            note: "学的是设计思路和一个能跑的 demo，这样才说得清你要哪一种。日志、tracing、metrics 只能多，不能少。",
            steps: [
              { id: "ginf", name: "Gin", text: "路由和分层自己写。bluebell 是这种：router、controller、logic、dao 都在你手里。" },
              {
                id: "kit",
                name: "go-kit",
                text: "一堆零件。你主要写业务。传输、插头、服务分成三层。",
                model: {
                  kind: "steps",
                  lead: "换 HTTP 或 gRPC，动的是 Transport。业务方法的形状先被 Endpoint 收成同一种。",
                  steps: [
                    { id: "tr", name: "Transport", text: "协议和结构体互转，再加上路由。进来先解码，调用 Endpoint，再把结果编码出去。" },
                    { id: "ep", name: "Endpoint", text: "把 Sum(a, b) 这种不同形状，收成同一种：(上下文, 请求) 返回 (响应, 错误)。日志、限流、熔断作为中间件挂在这一层外面。" },
                    { id: "svc", name: "Service", text: "纯业务。只认入参、出参和 error。不认 HTTP 头，也不认 gRPC 的错误码。上游依赖的是接口，不是具体的结构体。" },
                  ],
                },
              },
              {
                id: "zero",
                name: "go-zero",
                text: "约定加代码生成。不是手写全部路由，也不是自己拼三层。",
                model: {
                  kind: "steps",
                  lead: "API 是入口，RPC 是干活的下游，Etcd 做发现。这和 support 转发、下游干活是同一种形状。",
                  steps: [
                    { id: "flow", name: "调用链", text: "HTTP 的 API，到 logic 做编排，经 Etcd 发现，到 gRPC 的 RPC，再到 logic，再到 Model 和 MySQL。旁边可以有 Redis 缓存。API 不直接写库。" },
                    { id: "edit", name: "你改哪里", text: ".api、.proto、.sql 是源头。业务写在 internal/logic。svc 在启动时把 RPC 客户端和 Model 装好，logic 只通过它来用。" },
                    { id: "gen", name: "生成的不手改", text: "handler、types、routes、server、pb、model_gen 当固定层。定义改了就再生成，然后填 logic。" },
                    { id: "vs", name: "对照 Gin", text: "手写 router，换成由 .api 生成 routes。手写 dao，换成 goctl 生成的 model。" },
                  ],
                },
              },
              { id: "must", name: "至少三件", text: "日志、tracing、metrics。一个微服务框架至少提供这三样。" },
            ],
          },
        ],
      },
    },
    {
      id: "design",
      name: "设计",
      hint: "系统、业务、链路",
      model: {
        kind: "chains",
        lead: "从这里开始才是开发。系统设计先记通用方法，再点开一个项目。项目里面还是业务、存储、访问。再加上开发细节和架构链路。",
        aside: "想方案时，先看别人怎么拆这三块：知乎、GitHub、code.flickr、GeeksforGeeks、designgurus，以及阿里云、腾讯云、Amazon、Google 的技术方案。",
        chains: [
          {
            name: "系统架构链路",
            note: "点开下面这一格，才是调用图。方框是服务，箭头上的字是这一跳在做什么。",
            steps: [
              {
                id: "arch",
                name: "系统架构链路",
                text: "DevOps 进 spt-api，再进该地域的 srv_support。etcd、ZK、udb-config，以及 udb_spt、udb-support-python 都在这张图上。",
                model: {
                  kind: "flow",
                  lead: "实线是一次真正发出去的调用。虚线只在 spt-api 启动时走一次。切主备时，support 先问 MySQL Core；Sentinel 架构走 Sentinel，HAProxy 架构走 UDBAccess。容灾怎么做，是这两个下游自己的事。",
                  width: 1080,
                  height: 1120,
                  captions: [
                    { x: 36, y: 820, text: "上一辈，虚线方框。长节点 ID 直接扫上面的管理库，不经过 spt-api。" },
                  ],
                  nodes: [
                    { id: "repo", name: "udb-config 仓库", text: "YAML 模板", x: 36, y: 16 },
                    { id: "etcd", name: "etcd", text: "udb-config/zone/", x: 420, y: 16 },
                    { id: "devops", name: "DevOps", text: "只传 CompanyId + DBId", x: 36, y: 156 },
                    { id: "api", name: "spt-api", text: "全局一份", x: 420, y: 156 },
                    { id: "mgr", name: "各地域管理库", text: "查出实例属于哪个 zone", x: 36, y: 360 },
                    { id: "zk", name: "地域 ZK", text: "/NS/udb/set{zone}/UDBSupportGo", x: 230, y: 360, w: 250 },
                    { id: "support", name: "srv_support", text: "该地域一份", x: 640, y: 360 },
                    { id: "access", name: "UDBAccess", text: "HAProxy 架构切主备", x: 16, y: 680 },
                    { id: "sentinel", name: "Sentinel", text: "Sentinel 架构切主备", x: 230, y: 680 },
                    { id: "core", name: "MySQL Core", text: "切主备前先问它", x: 444, y: 680 },
                    { id: "host", name: "数据库宿主机", text: "直连这台机器", x: 658, y: 680 },
                    { id: "cloud", name: "云平台接口", text: "地址写在代码里", x: 872, y: 680 },
                    { id: "pyspt", name: "udb_spt", text: "旧的全局入口", x: 36, y: 870, old: true },
                    { id: "pysup", name: "udb-support-python", text: "旧的地域侧", x: 360, y: 870, w: 200, old: true },
                    { id: "ures", name: "UResource", text: "短资源 ID 问 zone", x: 36, y: 1000, old: true },
                  ],
                  edges: [
                    { from: "repo", to: "etcd", label: "同步 YAML 模板", at: 0.5, side: -1 },
                    { from: "etcd", to: "api", label: "启动时加载每个地域的 ZK", dash: true, at: 0.5, side: -1 },
                    { from: "devops", to: "api", label: "", at: 0.5 },
                    { from: "api", to: "mgr", label: "1. 用 DBId 查管理库，得到 zone", lx: 150, ly: 275 },
                    { from: "api", to: "zk", label: "2. 查出 support 地址", lx: 500, ly: 300 },
                    { from: "api", to: "support", label: "3. HTTP POST", at: 0.4, side: -1 },
                    { from: "support", to: "access", label: "UMessage\n地址来自本地域 ZK", lx: 175, ly: 640 },
                    { from: "support", to: "sentinel", label: "UMessage\n地址来自本地域 ZK", lx: 300, ly: 575 },
                    { from: "support", to: "core", label: "gRPC\n注册中心是本地域 ZK", lx: 530, ly: 575 },
                    { from: "support", to: "host", label: "ZK 节点换成 IP\n再直连", at: 0.55, side: -1 },
                    { from: "support", to: "cloud", label: "HTTP\n地址写死在代码里", at: 0.62, side: -1 },
                    { from: "pyspt", to: "pysup", label: "库调用，不经 HTTP", at: 0.5, side: -1 },
                    { from: "pyspt", to: "ures", label: "短资源 ID", at: 0.5, side: -1 },
                  ],
                },
              },
            ],
          },
          {
            name: "系统设计 · 通用方法",
            note: "这一行只记方法。换一个项目，还是这三格。具体的表和接口在下面那一行里，点开项目才看到。",
            steps: [
              {
                id: "method-biz",
                name: "业务",
                text: "不同业务不一样。先画时序和状态机，再写约束、表从哪来、方案对比和接口。扩展放在最后，有明确要求再做。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: `【核心业务逻辑】
不同业务不一样，以这里【转链】为例子，那么自然应该思考转链如何实现，长链路通过什么算法专成短链路才能让短链路不重复，且避免敏感词；然乎就是在hash，mursahash，
递增主键，发号器等具体的技术方案中选择；这里技术人员要对于不同方案的优劣做到心中有数

- 这里参考【pg插件方案】
- 核心业务逻辑关键在于以下几点
1. 最重要：时序图与状态机 
2. 时序图与状态机梳理好整体流程和逻辑后，要思考【约束与边界条件】
3. 数据库表结构设计，要讲清楚设计几张表，唯一键定位，每一个字段数据来源
4. API粗略设计：当前API命名，功能，写入哪里的数据库，是否调用下游服务
5. API详细设计与实现：字段；逻辑任务编排
5. [约束和边界]
完成基本的系统设计实现后，需要对于一些特殊问题进行考虑，扩展系统的边界

一般进行工程项目系统设计的时候，而不仅仅是这个项目，我应该从哪些方面考虑呢？
 ==〉这里通常是有明确触发条件再扩展的，比如业务需要，领导要求等；然后加一些自定义能力、过期、多地域、更高吞吐——有明确触发条件再上
常见的问题比如【更高的延迟-优化网络/加缓存/存储层修改数据结构表结构啥】【更高的吞吐量-扩展节点用来序号分片】【业务定制需求-如自定义短链，定期删除等】`,
                    },
                  ],
                },
              },
              {
                id: "method-store",
                name: "存储",
                text: "换个系统也是这几问。数据放哪个组件，表怎么建，要占多大，怎么删，一台挂了怎么办。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: `【存储】
存储比较通用，不同的业务和系统实现总是大同小异，无非是组件选择的区别，其他组件没用过，大部分使用mysql，这里以mysql为例（注：作为技术人员要清楚知道不同组件之间优劣对比，方便业务选择）

- 首先我们要思考数据库表结构设计，需要哪些字段，每个字段数据来源，什么类型，这张表用处是什么；比如这个需求中这张表保存原始长链接与短链接的对应关系；这里要专业dba审核
- 在确定表结构后，我们要确定这张表要存多大的数据量，这样才好规划需要的存储空间和数据库数量，比如一条数据占据多少byte？每秒写入多少条数据？数据冗余存储怎么设计，是一主一备还是一主两备？
- 还要确定数据怎么删除，定期过期删除？手动删除？
- 性能优化方案： 常见的优化性能的方式，最常见的就是加缓存，其他还有优化并发逻辑，建立索引表，更改访问方式，优化网络性能等
- 最后就是确认下部署方案，如何保证高可用；是上云？还是分片部署？还是胯可用区部署等等
比如是否读写拆成两个微服务，写主库、读从库，很常见；具体cmd；
在「读 QPS 远高于写、要独立扩缩容」时才常见，短链正是读多写少：查链可能上万～十万 QPS，转链通常小得多。业内大厂也常把 redirect 服务 和 create 服务 分开部署。但对你这个锻炼项目，更稳妥的路径是：
[] 先单体：一个服务里两个接口（转链 API + 302 跳转），Nginx 路由区分：/api/create → 转链；/[短码] → 查链
[] 真觉得查链扛不住了，再把查链拆出去单独扩容，拆两个微服务的代价：两套发布、两套监控、共享同一张映射表/缓存的一致性，复杂度立刻上去。QPS 目标可以靠 缓存 + 多副本横向扩 先扛住。`,
                    },
                    {
                      type: "image",
                      src: "/img/11.PNG",
                      alt: "创建短链经过校验和转短链，发号器参与，结果进入 MySQL 和 Redis。查看短链经过过滤器查链接，并采集访问信息做成统计报表。",
                      caption: "11.png",
                    },
                    {
                      type: "image",
                      src: "/img/22.png",
                      alt: "请求从负载均衡进入 shortener，再经过布隆过滤器和缓存，到达一主两备。发号器上面是分片。",
                      caption: "22.png",
                    },
                  ],
                },
              },
              {
                id: "method-access",
                name: "访问",
                text: "谁能调、慢在哪、读和写差多少。读远大于写，先加缓存和副本。读写都很少，就先一个服务。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: `一般都是标准访问流程，不需要额外设计；如果要设计可以考虑下列

如果是对外服务

IP限制请求数

用户限制转链额度

记录已转链的URL缓存防止刷光ID （适用于相同的URL可转为不同的短链的场景）

LRU缓存URL
布隆过滤器
校验链接是否有效`,
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
                      text: `如果是内部服务则需要考虑

权限认证
账户每日限额
校验链接是否有效`,
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "系统设计 · 三个项目",
            note: "点开一个项目，里面还是业务、存储、访问。",
            steps: [
              {
                id: "proj-short",
                name: "短链项目",
                text: "转链和查看。展开后是业务、存储、访问。",
                model: {
                  kind: "chains",
                  lead: "按通用方法问一遍。时序和状态机画在业务里。图下面的句子来自短链课程。",
                  chains: [
                    {
                      steps: [
                        {
                          id: "short-biz",
                          name: "业务",
                          text: "先画转链和查看两条时序，再画映射的状态。发号、约束、接口写在图下面。",
                          model: shortBizModel,
                        },
                        {
                          id: "short-store",
                          name: "存储",
                          text: "两张表的字段和唯一键、大约 20TB、手动标记删除，以及主备和缓存。",
                          model: shortStoreModel,
                        },
                        {
                          id: "short-access",
                          name: "访问",
                          text: "这一版是内部服务：权限、每日限额、校验长链。对外清单课程里有，先不启用。",
                          model: shortAccessModel,
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: "proj-pg",
                name: "pg插件项目",
                text: "上传、测试、审批、发布。展开后是业务、存储、访问。",
                model: {
                  kind: "chains",
                  lead: "按通用方法问一遍。时序和状态机画在业务里。图下面按现在的实现改过。",
                  chains: [
                    {
                      steps: [
                        {
                          id: "pg-biz",
                          name: "业务",
                          text: "一张时序，一张状态机。表和接口写在图下面。",
                          model: pgBizModel,
                        },
                        {
                          id: "pg-store",
                          name: "存储",
                          text: "运营库三张表。临时区 Promote 到桶根，再 Fanout 到各地域桶。",
                          model: pgStoreModel,
                        },
                        {
                          id: "pg-access",
                          name: "访问",
                          text: "七个 Action。测试和审批是服务自己轮询，没有单独的结果回调。",
                          model: pgAccessModel,
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: "proj-disk",
                name: "support 磁盘 IO",
                text: "一轮巡检。展开后是业务、存储、访问。",
                model: {
                  kind: "chains",
                  lead: "按通用方法问一遍。时序和状态机画在业务里。时序按 66 那张图。",
                  chains: [
                    {
                      steps: [
                        {
                          id: "disk-biz",
                          name: "业务",
                          text: "一张时序，一张状态机。没有新接口。告警次数记在内存里。",
                          model: diskBizModel,
                        },
                        {
                          id: "disk-store",
                          name: "存储",
                          text: "不建新表。读管理库，次数放内存，告警交给 UNOC。",
                          model: diskStoreModel,
                        },
                        {
                          id: "disk-access",
                          name: "访问",
                          text: "内部通道：管理库、ZK、SSH、unoc。没有对外接口。",
                          model: diskAccessModel,
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "开发细节",
            note: "代码要能顺着读。主流程只编排。",
            steps: [
              {
                id: "craft",
                name: "代码怎么写",
                text: "代码设计经验总结。代码要可读性强，注释要清晰。",
                model: {
                  kind: "outline",
                  lead: "代码设计经验总结。代码要可读性强，注释要清晰。",
                  items: [
                    {
                      name: "主流程不要堆 if/else，新增逻辑要抽象出去",
                      example: "这次把「是否创建工单」的判断抽到 createUxTicketWithPolicy，而不是在 CreateMission 里到处写 if company_id == 6025。",
                    },
                    {
                      name: "业务规则配置化，不要硬编码",
                      example: "6025 不写死在代码里，改成 conf.yaml 的 approval.bypass_company_ids，启动时加载到 map。后续新增 7001 只改配置，不改代码。",
                    },
                    {
                      name: "解耦和模块化封装",
                      children: [
                        {
                          name: "解耦：把「规则判断」从「流程执行」里拆开",
                          text: "原则：流程代码不直接写业务规则分支。",
                          example: "CreateMission 不直接判断「6025 要不要审批」，而是调用策略函数 needApproval / createUxTicketWithPolicy。",
                        },
                        {
                          name: "解耦：把「外部副作用」封装成独立模块",
                          text: "原则：对外部系统的调用（建工单）不要散落在主流程。",
                          example: "uxiao.CreateUxiaoTicket 被包进 createUxTicketWithPolicy，主流程只调用一个入口。",
                        },
                        {
                          name: "模块化：按职责拆模块，不按代码行数拆",
                          text: "原则：一个模块只做一类事。",
                          example: "approval_policy.go 只做审批规则。CreateMission.go 只做创建流程编排。settings 只做配置加载。",
                        },
                        {
                          name: "模块化：把可变业务点做成配置模块",
                          text: "原则：经常变化的业务数据（白名单）从代码移到配置。",
                          example: "approval.bypass_company_ids 由 InitConfig 加载到集合。规则模块只读集合，不关心配置文件细节。",
                        },
                        {
                          name: "模块化：统一出口，减少分支复制",
                          text: "原则：同一业务动作只保留一个调用入口。",
                          example: "创建工单和跳过工单都走 createUxTicketWithPolicy，避免在多个 if/else 里重复写状态赋值。",
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: "review",
                name: "代码Review",
                text: "现在代码都是 AI 看，人都不咋看了。可以给 AI 的 review 设一个限制，让 AI 自己改；觉得合理的，也可以自己改。",
              },
              {
                id: "branch",
                name: "分支",
                text: "开发分支合并到 dev，再合并到 master。gitlab-ci 可能只认 feature/ 开头。gitignore 里的文件不会进仓库。",
              },
              {
                id: "ticket",
                name: "变更单",
                text: "发布前出变更单。审批之后，手动发，或在部署平台一键发。",
              },
              {
                id: "joint",
                name: "联调",
                text: "和前端走一条真实请求，对上字段和错误码。参考过运营平台开发问题合集。",
                model: {
                  kind: "tables",
                  lead: "联调卡住时先翻表。第一张是个人速查，第二张是 PG 插件里踩过的坑。",
                  tables: [
                    {
                      name: "联调问题个人速查表（可随时翻）",
                      note: "用法：联调卡住时，先对「典型信号」那一列扫一眼；对上了再看「立刻怎么做」。翻表顺序：1 代码/镜像（#1、#20）→ 2 公网还是内网、Action（#2、#3）→ 3 字段、类型、账号（#5、#6、#7、#4）→ 4 同步还是异步（#8、#10）→ 5 地域/桶/版本（#11、#12、#16）→ 6 配置、密钥、IP、权限、Pod（#17、#18、#19）。",
                      columns: ["#", "类型", "一句话（这到底是啥）", "典型信号（你会看到什么）", "为什么会这样", "立刻怎么做（按顺序）", "口诀（写进脑子）"],
                      rows: [
                        ["1", "分支 / 代码认错", "你改的、看的、跑的，不是同一套代码", "接口行为对不上文档；「明明合过了」线上没有；搜 Action 搜不到或搜到旧实现", "多分支并行（如别的需求分支 vs 当前功能分支）；看错仓库/看错 commit", "①确认仓库 ②git branch / git log -5 ③用 Action 名全局搜 ④对照镜像 tag 是否等于该 commit", "先锁分支，再谈联调"],
                        ["2", "公网 / 内网混用", "两个入口，鉴权与路由规则完全不同", "创建实例通、安装/查任务不通（或反过来）；同样字段一套成功一套失败", "公网要 Signature；内网靠 Backend+Action 转发；客户端不能共用一套 Post", "①每个 Action 标注走公网还是内网 ②公网/内网分两套封装 ③对照已跑通的 curl", "一个 Post 打不了天下"],
                        ["3", "网关 Action 未挂", "请求还没进业务，网关就不认这个动作", "gateway-api action is invalid；或类似「未知 Action」", "内网网关未注册；Action 名写错；Backend 选错", "①确认 Action 字符串一字不差 ②确认 Backend ③拿最小 JSON curl 内网网关 ④仍失败就甩给网关/管控", "先通路，再谈参数"],
                        ["4", "参数丢失 / 校验假空", "你明明传了，对方结构体里是空的", "日志 payload 有字段，仍报 required；错误里可写 (sent Xxx=...) 自证", "网关白名单旧字段被剥；JSON 名与绑定名不一致；form/query 与 body 绑定方式不同", "①打全量请求体日志 ②错误回显「已发送值」 ③同 body 用 curl 复现 ④证明发出去仍 required → 找中间层/管控", "已发送仍 required = 查中间层"],
                        ["5", "字段名 / 命名规则", "同一业务概念，三处名字不一样", "库里有值、API 报空；带下划线的名字（如 pg_cron）解析错；包名拆错扩展名", "库用蛇形、管控用帕斯卡；文件名从右解析版本/OS/PG", "①列出：库字段 / API 字段 / 文件名规则 ②以对方文档+成功样例为准 ③解析逻辑加单测", "名字要对齐三层"],
                        ["6", "字段类型 / 格式", "值「看起来对」，类型或写法不对", "签名过了业务仍拒；数字/字符串不一致；Normal vs normal", "文档写 int、线上收 string；枚举大小写敏感", "①把成功请求 JSON 当唯一样板 ②逐字段对比类型与大小写 ③先抄通再抽象常量", "先抄通的请求，再封装"],
                        ["7", "账号 / 组织归属", "调的是 A 的密钥，动的是 B 的实例", "account/organization 不匹配；Install 报账号不符", "CompanyID、AccountID 必须与实例所有者一致；测账号换了常量没换", "①查实例归属账号 ②Install 请求里组织字段与之对齐 ③换测试号时整套一起改", "身份跟资源走"],
                        ["8", "异步当同步", "接口返回成功 ≠ 事情做完", "有 TaskID 但插件没装上；过早删实例；把「轮询 40 次」当成「40 秒」", "管控任务异步；终态要再查；超时=次数×间隔", "①拿到 TaskID ②轮询任务列表 ③只认 Success/Failed ④终态后再清理资源", "拿 ID → 查状态 → 再定成败"],
                        ["9", "资源状态机", "云资源有生命周期，不能跳步", "删除报 invalid state: 40；Running 直接删失败", "要先停再删；状态码/状态名要对文档", "①查当前 State ②Stop ③等到 Stopped ④再 Delete", "先停再删，别跳步"],
                        ["10", "生命周期收尾", "临时资源没有「有始有终」", "测试机残留占配额；或任务没结束实例已被删", "只建不删；或成功立刻删不等异步结束", "①成败都安排清理 ②清理放在任务终态之后 ③清理失败单独记，不盖主错误", "有创建就有收尾，收尾看依赖"],
                        ["11", "版本 / 参数组矩阵", "用户侧「大版本」≠ 创建侧「小版本+参数组」", "某 PG 版本建实例失败；参数组 ID 张冠李戴", "包标 14，创建要 postgresql-14.x + 对应 ParamGroupID；且可能随地域变", "①维护大版本→DBVersion+GroupID 表 ②换地域重新拉参数组列表 ③缺映射直接报错不猜", "映射表，不靠猜"],
                        ["12", "地域三件套", "「能选这个地域」≠「这条链路真能跑通」", "勾了新地域发不过去；测试在伦敦、桶却在别处搞混", "需要同时：前端/后端枚举、US3 密钥表一行、下游管控支持；测试桶≠发布目标", "①分清：临时桶 / 测试实例 / 发布目标 ②新地域查：枚举+密钥表+下游 ③改测试环境时桶与实例常量一起核对", "加地域是三件套"],
                        ["13", "前后端枚举不同步", "页面能点的，后端不一定允", "下拉有某地域，发布被拒；或后端已支持前端没有", "前端写死名单；或后端改了枚举，桶表没行", "①枚举以后端接口为准 ②发布用落库的允许集合二次校验", "以后端+落库为准"],
                        ["14", "发布二次校验", "审批勾选必须在后端再挡一道", "能发到没审批过的地域；状态不对仍往下走", "只信前端；允许集合没写入 publishing_regions", "①审批时落库允许地域 ②发布时再校验集合 ③非法明确报错", "关键动作必须后端再校验"],
                        ["15", "CORS（浏览器→桶）", "浏览器跨域被桶拒绝", "控制台 CORS / preflight 失败；本地 Postman 上传却可能成功", "桶未配置允许的 Origin/Method；预检 OPTIONS 未放行", "①看浏览器 Network 是 OPTIONS 还是 PUT 挂 ②配桶 CORS（含 DevOps 域名）", "人访问桶先查 CORS"],
                        ["16", "对象存储可达 / 签名混用", "文件在桶里，但调用方拉不下来", "安装失败因 FileUrl；Pod 内 curl 不通；PUT 签名拿去 GET", "内网 endpoint 集群不可达；上传签名≠下载签名；过期", "①分清 Presign PUT vs GET ②在业务 Pod 内 curl FileUrl ③测同地域内网可达性", "上传≠下载；先证明拉得下"],
                        ["17", "密钥 / 配置编码", "配置「看起来填了」，进程里是错的或空的", "缺密钥、签名失败、非法 Base64；改完 ConfigMap 没变化", "Base64 丢 =；YAML 未加引号；没重启 Pod；把哈希当可逆加密", "①读回 ConfigMap 原文 ②解码验证 ③重启 Pod ④再打日志看实际值", "写入→读回→解码→重启"],
                        ["18", "IP 白名单", "密钥对，但来源 IP 不被接受", "Access ip denied；换网络/出口后突然好或挂", "API Key 绑了出口 IP；Pod NAT 变了", "①查当前出口 IP ②找管理员加白 ③记录 Key↔IP 对应关系", "出口 IP 也是配置"],
                        ["19", "集群权限 / kube 环境", "不是资源没有，是你没权限或不在该集群", "Forbidden；get/apply 失败", "kubeconfig 指错集群；账号无 namespace 权限", "①确认当前 context ②确认 namespace ③换有权限的配置再操作", "Forbidden 先查身份"],
                        ["20", "镜像是否真生效", "代码合了、镜像也发了，跑的仍是旧逻辑", "行为像旧版；没有新日志关键字", "看错容器；滚动未完成；请求没打到新 Pod", "①看容器名与 image tag/commit ②搜新版本才有的日志指纹 ③没有指纹=新逻辑没跑到", "日志指纹 > 口头保证"],
                        ["21", "OA / 人工审批", "系统状态卡在等人，或等人批了系统不知道", "一直 PENDING_APPROVAL；创建人错误；批了状态不走", "creator 配错；未轮询工单终态；预发/生产工单环境不一致", "①核对创建人配置 ②工单号落库 ③轮询到通过/驳回再改状态", "系统状态要和单据对账"],
                        ["22", "文档滞后 / 猜接口", "按文档做，线上另有一套；或配置里有莫名字段", "按文档仍缺字段；占位配置从未被读", "文档未同步；联调前先猜 Action/字段", "①以成功 curl + 报错结构体为准 ②无正式文档不写死配置 ③占位标清，有文档立刻替换", "合同是成功样例，不是 Markdown"],
                        ["23", "主错误被清理错误淹没", "真正失败原因被「删实例失败」盖住", "error_message 很长，分不清哪段是主因", "业务失败后又拼接清理失败", "①错误信息主因在前 ②清理失败单独标注 ③先修主因再修清理", "先看分号/前半段主错误"],
                      ],
                      foot: "每踩一个新坑，按同一 7 列加一行：类型 / 一句话 / 信号 / 原因 / 步骤 / 口诀。以后翻表就会越来越心里有数。",
                    },
                    {
                      name: "PG 插件联调问题速查表（合并版）",
                      columns: ["问题类型", "典型现象", "常见根因", "怎么排查 / 解决", "经验沉淀"],
                      rows: [
                        ["CORS 跨域", "浏览器上传失败，控制台报 CORS", "临时桶未放行前端域名的 PUT/OPTIONS", "查桶 CORS；分清浏览器 PUT 与管控 GET", "先问「谁访问桶」：人要 CORS，机器要内网与权限"],
                        ["地域 / 资源映射", "建实例失败、拉包失败、测/发搞混", "临时桶地域、测试实例地域、发布目标地域混用", "维护 region→桶/VPC/Subnet/Project/参数组对照表", "同名 Region ≠ 同一套资源"],
                        ["字段 / 命名", "包名解析错、pg_cron 等下划线名异常", "文件名拆分规则、库字段与 API 字段不一致", "统一命名规则；对外以管控字段名为准", "分清库字段 / API JSON / 展示文案三层"],
                        ["网关 Action", "gateway-api action is invalid", "内网未注册该 Action 或名字不对", "向网关/管控确认 Action 与 Backend", "通不通先看路由，再看参数"],
                        ["接口校验 / 丢字段", "已传 ExtensionName 仍报 required", "网关白名单旧、转发丢字段、绑定名不一致", "打全量 payload；错误回显 sent 值；curl 复现", "「已发送仍 required」优先查中间层"],
                        ["账号 / 组织校验", "account / organization 不匹配", "CompanyID、AccountID 与实例归属不一致", "与创建实例的账号对齐后再调 Install", "身份字段是资源归属的一部分"],
                        ["密钥 / 配置加密", "签名失败、配置解密失败、提示不是合法 Base64", "Base64 缺 padding、密钥未注入、放错位置；误把 SHA1 当可逆", "密钥走 ConfigMap/Secret；去空白并补填充；改配置后重启 Pod", "摘要不可逆；要做「写入→读回→解码→重启」闭环"],
                        ["实例状态机", "删除报 state 40；失败后实例消失", "Running 不能直接删；测试设计成败都清理", "Stop→Stopped→Delete；分清业务错与清理错", "清理失败不要盖住业务主错误"],
                        ["版本 / 参数组", "某 PG 版本建实例失败；参数组不匹配", "大版本未映射小版本与 ParamGroupID；写死某一版组 ID", "建「大版本→DBVersion+默认参数组」表；缺版本直接报错", "资源 ID 按地域配置，勿当全局常量"],
                        ["镜像 / 调度生效", "以为发了新版，行为仍像旧码", "看错容器、滚动未完成、新逻辑未执行", "对镜像 commit；用新日志指纹验证", "日志指纹 > 口头保证"],
                        ["异步任务轮询", "有 TaskID 但不知成败；误把次数当秒数", "把同步返回当完成；轮询参数理解错", "按 TaskID 轮询到 Success/Failed；超时=次数×间隔", "异步三件套：提交凭证、查询口、终态字典"],
                        ["OA 审批流", "卡在待审批、创建人不对", "creator 配置错、工单状态未轮询到位", "核对 ConfigMap 创建人；工单号落库对账", "系统状态与 OA 状态要可对账"],
                        ["文档与线上不一致", "按文档传参仍缺字段", "文档滞后于线上校验", "以成功 curl 与报错结构体为准", "联调合同是可复现样例，不是 Markdown"],
                        ["分支 / 代码认错", "对着一堆代码改，联调接口对不上；功能「明明合了却没有」", "看错分支（如 devopsv9 vs pgextension）；把别的需求提交当成当前需求", "先确认仓库+分支+最近 commit；用 Action 名搜代码；对照 git log/git diff", "联调前先锁「接口清单+分支」，再改配置或读代码"],
                        ["字段类型 / 格式", "签名过了业务仍失败；同一字段前端能选后端拒", "文档是数字、线上样例是字符串；大小写不一致（如 normal）", "以真实成功请求 JSON 为样板逐字段对比；按下游实际类型写", "字段联调优先「抄通的请求」，再抽象成常量/结构体"],
                        ["发布地域二次校验", "能发布到审批没选过的地域；状态不对仍能往下走", "只信前端勾选；后端未二次校验；允许集合没落库", "审批写入 publishing_regions；发布再校验是否在允许集合内", "关键操作以后端状态+落库集合为准，前端只是展示"],
                        ["公网 / 内网网关混用", "同一套参数一个接口通、一个不通", "创建实例走公网签名，安装/任务走内网；混用客户端", "每个 Action 先确认网关与是否要 Signature；公网/内网分开封装", "「一个 Post 打天下」最容易在联调时翻车"],
                        ["集群权限 / 环境", "configmaps ... Forbidden；改不到线上配置", "kubeconfig/账号无目标 namespace 权限", "换有权限的 kubeconfig；确认 namespace；再 get/apply", "Forbidden 先查身份与配置文件，不要当资源不存在"],
                        ["资源生命周期顺序", "测试实例残留；任务还在跑实例已被删", "只建不删；成功就删、不等异步结束", "成功失败都尽量清理；删实例放在任务终态之后", "有创建就有收尾；收尾顺序要尊重依赖关系"],
                        ["前后端枚举不同步", "页面可选地域和后端允许不一致；新地域勾了发不过去", "前端写死名单；后端枚举已改但桶密钥表没有对应行", "枚举以后端接口返回为准；新地域检查：枚举+US3 密钥表+下游是否支持", "加地域是「三件套」，不是只改一个下拉框"],
                        ["猜测接口 / 半成品占位", "配置里出现莫名字段；和正式文档对不上", "文档未到先猜 Action/配置项", "没有正式文档不写死配置；占位逻辑标清楚，有文档立刻替换", "联调以正式接口文档为准，猜测的字段优先删掉"],
                        ["对象存储可达性", "临时包下载失败；安装拿不到包", "集群访问不了内网 endpoint；复用上传 PUT 签名去做下载", "读走可达域名；下载单独 Presign GET；在 Pod 内 curl 验证 URL", "上传签名 ≠ 下载签名；先验证链路上能不能把文件拉下来"],
                      ],
                      foot: "使用顺序建议：先锁分支与请求样板 → 分清公网/内网与异步 → 再查配置编码、权限、桶可达与 Pod 是否重启。",
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "业务开发-经验总结",
            note: "按系统分成方框。点开一个方框，只看这个系统里的需求。",
            steps: [
              {
                id: "compass",
                name: "罗盘",
                text: "罗盘上的两个需求：一批实例怎么查，脏资源从哪份配置里拿掉。",
                model: {
                  kind: "outline",
                  lead: "一条需求一句经验。",
                  items: [
                    {
                      name: "罗盘接口性能优化",
                      text: "一次只查一个的接口，批量用时要限住同时发出的个数，相同结果只查一次，失败的单独返回。",
                      example: "罗盘要一次展示很多实例，GetUDBInstanceInfo 每次只能传一个实例 ID。一批去查时，同时进行的个数设一个上限，避免把下游打满。同一个可用区的信息只查一次。某个 ID 查失败，放进单独的列表，其他实例照常返回。",
                    },
                    {
                      name: "罗盘脏资源问题优化",
                      text: "页面上多出来的数据，先改配置里的统计范围，再确认正在跑的进程读到了新配置。",
                      example: "罗盘上仍能看到已删除的实例和临时库，是因为 udb-sre 的配置还把它们算进统计范围。改的是这份配置。配置在 ConfigMap 里时，重启 Pod 后再刷新罗盘，这些实例应该消失。",
                    },
                  ],
                },
              },
              {
                id: "devopsbiz",
                name: "devops",
                text: "DevOps 上做过的需求。点开后每个需求单独一条。",
                model: {
                  kind: "outline",
                  lead: "一条需求一句经验。",
                  items: [
                    {
                      name: "重做备库支持不上传 US3",
                      text: "用户勾了跳过的那一步，就不要放进任务链。这个字段每一跳都要还在，名字保持一致。",
                      example: "重做从库原来一定有「从库数据备份」，这一步会把备份上传到 US3。勾选跳过后，tasker 不把这一步放进任务列表。字段叫 skip_slave_backup，页面、ops、tasker 都要有它。中间丢了，tasker 会当成没勾选，仍会上传。",
                    },
                    {
                      name: "DevOps 支持绑定 VIP",
                      text: "会改线上、而且要等一会儿的操作，交给原来的任务去跑。真正改之前，先查出要改的那个节点，和库里记的对上。",
                      example: "用户在页面上填的是实例和 VIP。绑定接口要的是节点 ID，高可用要取主库那个节点。预检只查、不绑定：用实例查出节点 ID，再和库里保存的节点比一下。一致了，才由 tasker 调用 InternalBindVIP。这一步可能要几分钟，所以记成一条任务，页面不用一直等。",
                    },
                    {
                      name: "DevOps 支持存活性检测",
                      text: "只查看、几秒出结果的功能，单独放一个入口，别和会改数据的任务放在一起。返回里某个角色可能没有，没有就空着显示。",
                      example: "存活性检测是问主库还活着没有、备库还活着没有，不修改实例，也不用审批。放进「实例任务」会让人以为这是一次要执行很久的变更。单点实例没有备库，接口里备节点是空的。页面先看这个节点有没有，没有就显示空。直接读空节点上的字段，详情页会崩。",
                    },
                    {
                      name: "DevOps 支持审批白名单",
                      text: "会变的名单放进配置，程序启动时收成集合再查。主流程不动，只把「做不做这件事」收成一个函数。",
                      example: "6025 这类内部公司做运维任务不用审批。公司号写在 approval.bypass_company_ids，启动时放进集合里查。有的任务类型没有公司号，要明确说没有，不能当成公司 0。0 不在白名单里，就会错误地去建审批单。",
                    },
                    {
                      name: "迁移任务支持越过 6025",
                      text: "同一条规则到了另一个服务，意思对齐，配置各自加载。一批里面有一个不满足，整批按严格的办。",
                      example: "迁移任务在 thanos，不走 ops 的创建流程，所以免审名单要在 thanos 再配一份。一个迁移任务里有多个实例。只要有一个实例的公司不在白名单，整单仍要审批。一个公司号都解析不到，也要审批，避免名单丢了却直接执行。",
                    },
                    {
                      name: "单点实例容灾，页面崩溃",
                      text: "页面崩了，先用实例 ID 和时间对日志，看请求实际到了哪个接口。取对象里面的字段之前，先看这个对象是不是空。",
                      example: "对单点实例点容灾预检查，页面崩了。单点没有高可用的主备信息。用当时的实例 ID 和时间去看日志，只看到查实例信息，没有走到切换接口。下游如果收到单点，要先看高可用信息是不是空，空就返回「只能切换高可用」，再去取主节点和备节点。",
                    },
                  ],
                },
              },
              {
                id: "qimi",
                name: "qimi",
                text: "两个练习项目：bluebell，签到系统。",
                model: {
                  kind: "outline",
                  lead: "两个项目分开。每条仍是一句经验，例子把这件事说完。",
                  items: [
                    {
                      name: "bluebell",
                      text: "三个作业用的是同一套分层。先把「一个接口要改哪几层」走通，再碰到投票这种要自己设计存法和算法的需求。",
                      children: [
                        {
                          name: "社区列表和社区详情",
                          text: "加一个查询接口，就按路由、校验、业务、SQL 这个顺序加文件。表和 Go 里的结构体先对上。",
                          example: "router 里 /community 和 /community/:id 进 controller。controller 只校验参数，然后调 logic。logic 调 dao 去查 MySQL。models 里写 community 结构体，字段和表一致。create_table.sql 是建表稿，要自己在 MySQL 里执行。程序启动不会自动跑它。",
                        },
                        {
                          name: "创建帖子和帖子详情",
                          text: "会改数据、又必须知道是谁做的，从登录凭证里取用户。不要让请求自己填作者。",
                          example: "注册和登录不用凭证。创建帖子要先过 JWT 中间件，从 token 里取出用户 ID，再写成作者。这样发帖的人不能假装是别人。帖子 ID 用雪花算法生成。看详情、看列表按帖子 ID 查，不要求只能看自己的帖。",
                        },
                        {
                          name: "投票",
                          text: "换一条业务规则，主要改数据怎么存、分数怎么算。路由那一层的写法不变。",
                          example: "用户对帖子投赞成、反对或取消。Redis 里用有序集合记下发帖时间、热度分数、谁投了什么票。超过 7 天不能投，同一票再投一次就拒绝。改票时按新旧票的差值改分数，并用一组命令一起提交，避免改了一半。帖子正文在 MySQL。发帖时同时在 Redis 里放好时间和初始分数。投票只改 Redis。",
                        },
                        {
                          name: "掌握到哪一层",
                          text: "你要能说清链路、选型、接口和分层，关键规则自己想清楚。每一行可以让 AI 写，你负责看它改对了哪一层、边界是否成立。",
                          example: "社区和发帖，要知道文件加在路由、校验、业务、SQL 的哪一层。投票要能讲清每个 key 存什么、7 天怎么判断、改票分数怎么算。语法和样板代码读得懂、改得动、能跑通即可。",
                        },
                      ],
                    },
                    {
                      name: "签到系统项目实战",
                      text: "项目虽小，四段都要自己过一遍：产品方案、技术方案、做出来自己用、最后能讲清楚。",
                      children: [
                        {
                          name: "先设计表和接口",
                          text: "写代码之前，先列出每个功能靠什么数据来承载，接口叫什么、字段是什么。",
                          example: "签到也是这样。表和 API 定下来，功能点就拆开了。目标说清楚之后，可以让 AI 整理一版表和接口，你再改。设计定了，剩下才是按这个设计去实现。",
                        },
                        {
                          name: "手搓一遍，是为了知道每一环产出什么",
                          text: "第一遍自己写产品文档和技术方案。方案稳定后，让 AI 按你的说明写代码并部署，你自己试用。",
                          example: "手搓是为了建立每一环的框架：产品要写清给谁用、完成什么；技术要写清表、接口和选型；做完要能自己点一遍。以后你出的是方案，代码可以让 AI 写。你要能看懂它改的是哪一层。",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: "test",
      name: "测试",
      hint: "效率、质量、成本",
      model: testModel,
    },
    {
      id: "ops",
      name: "部署运维",
      hint: "镜像、配置、每一跳",
      model: {
        kind: "chains",
        lead: "变更单过了之后，用打过 tag 的镜像上线。线上读的是容器里的配置，不是仓库里的文件。",
        chains: [
          {
            name: "发出去的那一份",
            steps: [
              { id: "image", name: "镜像", text: "push 之后进入镜像仓库。merge 后打 tag，线上用这个 tag 当 image。" },
              {
                id: "cm",
                name: "ConfigMap",
                text: "线上读容器里的文件，例如 /data/tasker/config.ini，内容来自 ConfigMap。改完要重启 Pod。改库里一条数据，也先从这里拿地址。",
                marks: ["udb-sre"],
              },
              { id: "back", name: "回退", text: "留下上一份文件和上一个镜像。出问题就换回去。" },
            ],
          },
          {
            name: "每一跳怎么发",
            note: "链还是设计里那一条。这里只写每一跳用什么办法换上新版本。",
            steps: [
              { id: "fe", name: "前端", text: "多半在 GitLab 上点一下。注意 npm 依赖版本。" },
              { id: "gw", name: "网关", text: "新接口要先注册。网关一改，相关接口通常要回归。网关由别的部门维护。" },
              { id: "up", name: "上游", text: "Kubernetes 上的服务用 set image。代码推进去之后，镜像仓库里会有对应的包。" },
              { id: "mid", name: "support", text: "spt-api 转到各地域。support 用平台发，或先登录一个小可用区替换镜像。" },
              { id: "down", name: "下游", text: "micro 这类管控常常手动发。先备份旧文件，再替换。" },
            ],
          },
          {
            name: "机器上要会的",
            note: "登录到机器上才会用。点开看常用命令。",
            steps: [
              {
                id: "ps",
                name: "查进程",
                text: "程序在不在，编号是多少，端口是谁占的。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: "进程就是正在跑的那个程序。PID 是它的编号，停掉、再起都靠这个编号。\n\n先按名字找。名字对上了，再看它占的端口是不是你要的那个。",
                    },
                    {
                      type: "code",
                      text: "# 按名字找。第二列是 PID，也就是进程编号\nps aux | grep 程序名\n\n# 只列出匹配到的进程，连同启动时的整行命令\npgrep -af 程序名\n\n# 看某个端口是谁在听。把 8080 换成你要查的端口\nss -lntp | grep 8080",
                    },
                  ],
                },
              },
              {
                id: "kill",
                name: "停掉再起",
                text: "先停掉，换完文件再按原来的方式拉起来。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: "机器上常见两种起法。用 systemd 管的，用 systemctl。自己用命令拉起来的，先按 PID 停，再用原来的启动命令拉起来。\n\n先发 15，让程序自己把活干完再退。等几秒还在，才用 9 强制停。",
                    },
                    {
                      type: "code",
                      text: "# 用 systemd 管的服务\nsystemctl status 服务名\nsystemctl stop 服务名\nsystemctl start 服务名\n\n# 自己拉起来的进程。PID 从「查进程」里抄\nkill -15 PID\n\n# 等几秒，ps 里还看得到，才强制停\nkill -9 PID\n\n# 再按原来的启动命令拉起来。日志写到旁边的文件\nnohup ./程序名 > 程序名.log 2>&1 &",
                    },
                  ],
                },
              },
              {
                id: "bak",
                name: "备份旧文件",
                text: "换新文件之前，先把旧的复制到旁边。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: "手动替换二进制或配置时，先复制一份旧的，文件名带上时间。新的换上去之后出了问题，把这份拷回去就能回退。\n\n先确认备份在、大小对，再覆盖旧文件。",
                    },
                    {
                      type: "code",
                      text: "# 复制一份到旁边。-a 连同权限一起拷\ncp -a 旧文件 旧文件.bak.$(date +%Y%m%d%H%M)\n\n# 看一眼，确认备份在，大小也对\nls -l 旧文件 旧文件.bak.*\n\n# 再把新文件换上去\ncp 新文件 旧文件",
                    },
                  ],
                },
              },
              {
                id: "net",
                name: "看网络通不通",
                text: "主机通不通，端口开没开，分开看。",
                model: {
                  kind: "sheet",
                  blocks: [
                    {
                      type: "text",
                      text: "先看能不能走到那台机器，再看那个端口开没开。有的环境不让 ping，ping 不通时，还是要用端口那两条再确认一次。",
                    },
                    {
                      type: "code",
                      text: "# 机器之间通不通。发 3 个包就停\nping -c 3 主机\n\n# 看对方那个端口开没开\nnc -vz 主机 端口\n\n# 机器上没有 nc 时，看一个 HTTP 地址。3 秒超时\ncurl -m 3 -I http://主机:端口/路径\n\n# 看本机有没有在听这个端口\nss -lntp | grep 端口",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
