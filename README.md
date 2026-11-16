# 工程设计原理

一张图。一条链五个节点：基础、骨架、设计、测试、部署运维。点开某个节点，就是它自己的模型。

代码在 GitHub：https://github.com/ZJU2022/projectdesign

这台机器上要先有 Git 和 Node.js 18 或更新。两个都装好之后，用下面两条看版本：

```bash
git --version
node -v
```

`package.json` 在 `frontend` 目录里。人已经站在 `projectdesign` 里时，要先 `cd frontend`，再 `npm install`。在仓库根目录直接装，会报找不到 `package.json`。

## 在自己电脑上跑

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:8082

`npm install` 只在第一次、或者依赖变了之后再跑。已经装过就直接 `npm run dev`。项目根目录也可以 `make run`，它做的是同一件事。

## 在一台云主机上跑

先把仓库克隆下来。`clone` 是把 GitHub 上的这份代码复制到这台机器。

```bash
git clone https://github.com/ZJU2022/projectdesign.git
cd projectdesign/frontend
npm install
npm run dev
```

`npm run dev` 会一直占着这个终端，等浏览器来访问。窗口停在那里是正常的，不是卡住。这样退出 SSH 时，页面会一起停。

要退出机器后还继续跑，先在当前窗口按 `Ctrl+C` 停掉这一次。确认人在 `frontend` 目录里，再执行：

```bash
setsid nohup npm run dev -- --host 0.0.0.0 > dev.log 2>&1 < /dev/null &
```

这条会把页面放到后台。`setsid` 让它脱离这次 SSH，退出登录也不会被关掉。输出写在 `frontend/dev.log`。看最后几行，出现 `Local` 或 `Network` 就说明起来了：

```bash
tail -n 20 dev.log
```

然后可以 `exit` 离开这台机器。安全组放行 TCP 8082 之后，浏览器打开 http://云主机IP:8082 。页面没有登录。

以后要停掉后台这次：

```bash
pgrep -af vite
kill 这里打印出来的PID
```
