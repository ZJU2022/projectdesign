# 工程设计原理

一张图。一条链五个节点：基础、骨架、设计、测试、部署运维。点开某个节点，就是它自己的模型。

代码在 GitHub：https://github.com/ZJU2022/projectdesign

这台机器上要先有 Git 和 Node.js 18 或更新。两个都装好之后，用下面两条看版本：

```bash
git --version
node -v
```

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

终端里出现 `Local: http://localhost:8082` 就说明已经跑起来了。这个地址只在云主机自己里面能打开。

人在自己的电脑上、通过 SSH 连着这台云主机时，在自己电脑另开一个终端，把云主机的 8082 接到自己电脑的 8082：

```bash
ssh -L 8082:127.0.0.1:8082 用户名@云主机地址
```

这条 SSH 保持不要关。然后在自己电脑的浏览器打开 http://127.0.0.1:8082

想用云主机的公网地址直接打开时，启动要改成听所有网卡，云厂商的安全组放行 TCP 8082：

```bash
npm run dev -- --host 0.0.0.0
```

浏览器打开 http://云主机公网IP:8082 。页面没有登录。不需要给别人看时，用上面的 SSH 转发即可。
