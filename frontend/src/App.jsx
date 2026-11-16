// 整页是一张图。
// 最上面一条链永远在。点哪个节点，下面就展开那个节点自己的模型。
// 模型里若还有「展开」，再点一次，下一层模型接在同一张图上。
import { useId, useLayoutEffect, useRef, useState } from "react";
import { book } from "./model.js";

export default function App() {
  const [path, setPath] = useState(["base"]);
  const station = book.nodes.find((node) => node.id === path[0]) ?? book.nodes[0];
  const index = book.nodes.findIndex((node) => node.id === station.id);

  return (
    <main className="sheet">
      <header className="mast">
        <p className="kicker">图 1 · 总链</p>
        <h1>{book.title}</h1>
        <p className="thesis">{book.thesis}</p>
      </header>

      <div
        className="rail"
        style={{ gridTemplateColumns: `repeat(${book.nodes.length}, minmax(0, 1fr))` }}
      >
        <div className="rail-line" />
        {book.nodes.map((node, i) => (
          <button
            key={node.id}
            type="button"
            className={node.id === station.id ? "node on" : "node"}
            onClick={() => setPath([node.id])}
          >
            <span className="dot">{String(i + 1).padStart(2, "0")}</span>
            <span className="node-name">{node.name}</span>
            <span className="node-hint">{node.hint}</span>
          </button>
        ))}
      </div>

      <div
        className="stem-row"
        style={{ gridTemplateColumns: `repeat(${book.nodes.length}, minmax(0, 1fr))` }}
      >
        <span className="stem" style={{ gridColumn: index + 1 }} />
      </div>

      <section className="opened" aria-label={station.name}>
        <p className="opened-name">{station.name}</p>
        <p className="lead">{station.model.lead}</p>
        <Drill model={station.model} path={path} depth={1} setPath={setPath} />
        {station.model.aside && <p className="aside">{station.model.aside}</p>}
      </section>

      <p className="sign">角上写着「展开」的节点，里面还有它自己的一层模型。再点一次收起。</p>
    </main>
  );
}

function Drill({ model, path, depth, setPath }) {
  const activeId = path[depth] ?? null;
  const step = findStep(model, activeId);

  function onPick(id) {
    if (path[depth] === id) setPath(path.slice(0, depth));
    else setPath(path.slice(0, depth).concat(id));
  }

  return (
    <>
      <ModelView model={model} activeId={activeId} onPick={onPick} />
      {step?.model && (
        <div className="deeper">
          <p className="opened-name">{step.name}</p>
          {step.model.lead && <p className="lead">{step.model.lead}</p>}
          <Drill model={step.model} path={path} depth={depth + 1} setPath={setPath} />
          {step.model.aside && <p className="aside">{step.model.aside}</p>}
        </div>
      )}
    </>
  );
}

function ModelView({ model, activeId, onPick }) {
  if (model.kind === "flow") {
    return <Flow model={model} />;
  }
  if (model.kind === "outline") {
    return <Outline items={model.items} />;
  }
  if (model.kind === "sheet") {
    return <Sheet blocks={model.blocks} />;
  }
  if (model.kind === "tables") {
    return <Tables tables={model.tables} />;
  }
  if (model.kind === "cross") {
    return (
      <>
        <Cross model={model} activeId={activeId} onPick={onPick} />
        {model.foot && <Chain chain={model.foot} activeId={activeId} onPick={onPick} />}
      </>
    );
  }
  if (model.kind === "fork") {
    return (
      <div className="fork">
        <Chain chain={model.left} activeId={activeId} onPick={onPick} />
        <Chain chain={model.right} activeId={activeId} onPick={onPick} />
        <div className="span">
          <Chain chain={model.gates} activeId={activeId} onPick={onPick} />
        </div>
      </div>
    );
  }
  if (model.kind === "chains") {
    return (
      <div className="chains">
        {model.chains.map((chain) => (
          <Chain key={chain.name} chain={chain} activeId={activeId} onPick={onPick} />
        ))}
      </div>
    );
  }
  return <Chain chain={{ steps: model.steps }} activeId={activeId} onPick={onPick} />;
}

function Tables({ tables }) {
  return (
    <div className="data-tables">
      {tables.map((table) => (
        <section key={table.name} className="data-table">
          <h2>{table.name}</h2>
          {table.note && <p className="note">{table.note}</p>}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {table.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={index}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.foot && <p className="note">{table.foot}</p>}
        </section>
      ))}
    </div>
  );
}

function lineKind(line) {
  if (line.startsWith("【")) return "title";
  if (line.startsWith("如果是")) return "subhead";
  if (/^\d+\.\s/.test(line)) return "num";
  if (line.startsWith("- ")) return "bullet";
  if (line.startsWith("[]")) return "check";
  if (line.trimStart().startsWith("==")) return "answer";
  return "line";
}

function SheetText({ text }) {
  return (
    <div className="sheet-prose">
      {text.split("\n").map((line, index) =>
        line.trim() === "" ? (
          <div className="sheet-gap" key={index} />
        ) : (
          <p className={lineKind(line)} key={index}>
            {line}
          </p>
        ),
      )}
    </div>
  );
}

function Sheet({ blocks }) {
  return (
    <div className="sheet-note">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre className="sheet-code" key={index}>
              {block.text}
            </pre>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={block.src}>
              <img src={block.src} alt={block.alt} />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          );
        }
        if (block.type === "flow") {
          return (
            <div className="sheet-flow" key={block.caption || index}>
              {block.caption && <p className="sheet-flow-title">{block.caption}</p>}
              <Flow model={block} />
            </div>
          );
        }
        if (block.type === "picture") {
          return <Picture model={block} key={block.caption || index} />;
        }
        return <SheetText text={block.text} key={index} />;
      })}
    </div>
  );
}

function Outline({ items }) {
  return (
    <ol className="outline">
      {items.map((item) => (
        <li key={item.name}>
          <strong>{item.name}</strong>
          {item.text && <p>{item.text}</p>}
          {item.example && <p className="ex">例子：{item.example}</p>}
          {item.children && <Outline items={item.children} />}
        </li>
      ))}
    </ol>
  );
}

// 时序或状态机。线和方框的位置在数据里写好，用来对齐一张完整的图。
function Picture({ model }) {
  const markerId = `pic-${useId().replace(/:/g, "")}`;
  return (
    <div className="sheet-flow">
      {model.caption && <p className="sheet-flow-title">{model.caption}</p>}
      <div className="flow-scroll">
        <div className="flow" style={{ width: model.width, height: model.height }}>
          <svg className="flow-svg" width={model.width} height={model.height}>
            <defs>
              <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#1c1915" />
              </marker>
            </defs>
            {(model.guides || []).map((guide, index) =>
              guide.kind === "frame" ? (
                <rect
                  key={index}
                  x={guide.x}
                  y={guide.y}
                  width={guide.w}
                  height={guide.h}
                  fill="#f7f4ee"
                  stroke="#1c1915"
                  strokeWidth="1.25"
                />
              ) : (
                <line
                  key={index}
                  x1={guide.x}
                  y1={guide.y1}
                  x2={guide.x}
                  y2={guide.y2}
                  stroke="#1c1915"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                />
              ),
            )}
            {(model.edges || []).map((edge, index) => (
              <path
                key={index}
                d={edge.d}
                fill="none"
                stroke="#1c1915"
                strokeWidth="1.5"
                strokeDasharray={edge.dash ? "5 4" : undefined}
                markerEnd={`url(#${markerId})`}
              />
            ))}
          </svg>
          {(model.tags || []).map((tag) => (
            <p key={tag.text} className="flow-cap pic-tag" style={{ left: tag.x, top: tag.y }}>
              {tag.text}
            </p>
          ))}
          {(model.nodes || []).map((node) => (
            <div
              key={node.id || node.lines[0]}
              className={node.kind ? `gnode ${node.kind}` : "gnode"}
              style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
            >
              {node.lines.map((line) => (
                <strong key={line}>{line}</strong>
              ))}
            </div>
          ))}
          {(model.edges || []).map((edge, index) =>
            edge.label ? (
              <div key={`l-${index}`} className="flow-chip wide" style={{ left: edge.lx, top: edge.ly }}>
                <span>{edge.label}</span>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

// 一张真正的调用图。方框是服务，线上的字是这一跳在做什么。
// 实线是请求发出去。虚线只在进程启动时走一次。
function Flow({ model }) {
  const box = useRef(null);
  const nodes = useRef({});
  const [drawn, setDrawn] = useState([]);
  const markerId = `arrow-${useId().replace(/:/g, "")}`;

  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;

    function measure() {
      const base = root.getBoundingClientRect();
      const boxOf = {};
      for (const node of model.nodes) {
        const el = nodes.current[node.id];
        if (!el) return;
        const r = el.getBoundingClientRect();
        boxOf[node.id] = {
          left: r.left - base.left,
          right: r.right - base.left,
          top: r.top - base.top,
          bottom: r.bottom - base.top,
          cx: r.left - base.left + r.width / 2,
          cy: r.top - base.top + r.height / 2,
        };
      }
      setDrawn(
        model.edges.map((edge) => {
          const a = boxOf[edge.from];
          const b = boxOf[edge.to];
          let x1;
          let y1;
          let x2;
          let y2;
          let path;
          if (edge.bend === "margin") {
            x1 = a.left;
            y1 = a.cy;
            x2 = b.left;
            y2 = b.cy;
            path = `M ${x1} ${y1} L 8 ${y1} L 8 ${y2} L ${x2} ${y2}`;
          } else {
            const dx = b.cx - a.cx;
            const dy = b.cy - a.cy;
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) {
                x1 = a.right;
                y1 = a.cy;
                x2 = b.left;
                y2 = b.cy;
              } else {
                x1 = a.left;
                y1 = a.cy;
                x2 = b.right;
                y2 = b.cy;
              }
            } else if (dy > 0) {
              x1 = a.cx;
              y1 = a.bottom;
              x2 = b.cx;
              y2 = b.top;
            } else {
              x1 = a.cx;
              y1 = a.top;
              x2 = b.cx;
              y2 = b.bottom;
            }
            const dx2 = x2 - x1;
            const dy2 = y2 - y1;
            const len = Math.hypot(dx2, dy2) || 1;
            x2 -= (dx2 / len) * 8;
            y2 -= (dy2 / len) * 8;
            path = `M ${x1} ${y1} L ${x2} ${y2}`;
          }
          const at = edge.at ?? 0.55;
          let lx = x1 + (x2 - x1) * at;
          let ly = y1 + (y2 - y1) * at;
          if (typeof edge.lx === "number") {
            lx = edge.lx;
            ly = edge.ly;
          } else if (edge.bend === "margin") {
            lx = 28;
            ly = (y1 + y2) / 2;
          } else {
            const pdx = x2 - x1;
            const pdy = y2 - y1;
            const plen = Math.hypot(pdx, pdy) || 1;
            const side = edge.side ?? 1;
            lx += (-pdy / plen) * 18 * side;
            ly += (pdx / plen) * 18 * side;
          }
          return {
            key: `${edge.from}-${edge.to}`,
            path,
            dash: !!edge.dash,
            lines: edge.label ? edge.label.split("\n") : [],
            lx,
            ly,
          };
        }),
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [model]);

  return (
    <div className="flow-scroll">
      <div className="flow" ref={box} style={{ width: model.width, height: model.height }}>
        <svg className="flow-svg" width={model.width} height={model.height}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#1c1915" />
            </marker>
          </defs>
          {drawn.map((edge) => (
            <g key={edge.key}>
              <path
                d={edge.path}
                fill="none"
                stroke={edge.dash ? "#9c341f" : "#1c1915"}
                strokeWidth="1.5"
                strokeDasharray={edge.dash ? "5 4" : undefined}
                markerEnd={`url(#${markerId})`}
              />
            </g>
          ))}
        </svg>
        {drawn.map((edge) =>
          edge.lines.length === 0 ? null : (
            <div key={edge.key} className={edge.dash ? "flow-chip dash" : "flow-chip"} style={{ left: edge.lx, top: edge.ly }}>
              {edge.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ),
        )}
        {model.captions?.map((caption) => (
          <p key={caption.text} className="flow-cap" style={{ left: caption.x, top: caption.y }}>
            {caption.text}
          </p>
        ))}
        {model.nodes.map((node) => (
          <div
            key={node.id}
            ref={(el) => {
              nodes.current[node.id] = el;
            }}
            className={node.old ? "gnode old" : "gnode"}
            style={{ left: node.x, top: node.y, width: node.w }}
          >
            <strong>{node.name}</strong>
            <span>{node.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chain({ chain, activeId, onPick }) {
  const compact = !!chain.compact;
  const down = !!chain.down;
  const className = `chain${compact ? " compact" : ""}${down ? " down" : ""}`;
  return (
    <div className={chain.quiet ? "chain-block quiet" : "chain-block"}>
      {chain.name && <h2>{chain.name}</h2>}
      {chain.note && <p className="note">{chain.note}</p>}
      <div className={className}>
        {chain.steps.map((step, index) => (
          <div className="plate-wrap" key={step.id}>
            {index > 0 && <span className="joint" />}
            <Plate step={step} on={step.id === activeId} onPick={onPick} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cross({ model, activeId, onPick }) {
  const plate = (step) => (
    <Plate key={step.id} step={step} on={step.id === activeId} onPick={onPick} />
  );
  return (
    <div className="cross">
      {plate(model.main[0])}
      <span className="h-link" />
      {plate(model.main[1])}
      <span className="h-link" />
      {plate(model.main[2])}
      <span />
      <span />
      <span className="v-link" />
      <span />
      <span className="v-link" />
      <span />
      <span />
      {plate(model.down[0])}
      <span />
      {plate(model.down[1])}
    </div>
  );
}

function Plate({ step, on, onPick, compact }) {
  if (compact) {
    return <span className="token">{step.name}</span>;
  }
  const className = `plate${on ? " on" : ""}${step.model ? " has-model" : ""}`;
  const body = (
    <>
      <strong>{step.name}</strong>
      <p>{step.text}</p>
      {step.marks?.length > 0 && (
        <span className="marks">
          {step.marks.map((mark) => (
            <em key={mark}>{mark}</em>
          ))}
        </span>
      )}
      {step.model && <span className="more">{on ? "收起" : "展开"}</span>}
    </>
  );
  if (!step.model) return <div className={className}>{body}</div>;
  return (
    <button type="button" className={className} onClick={() => onPick(step.id)}>
      {body}
    </button>
  );
}

// 在这一层模型的所有链里，按 id 找到被点中的那一格。
function findStep(model, id) {
  if (!model || !id) return null;
  const groups = [];
  if (model.steps) groups.push(model.steps);
  if (model.main) groups.push(model.main);
  if (model.down) groups.push(model.down);
  if (model.foot) groups.push(model.foot.steps);
  if (model.chains) {
    for (const chain of model.chains) groups.push(chain.steps);
  }
  if (model.left) groups.push(model.left.steps);
  if (model.right) groups.push(model.right.steps);
  if (model.gates) groups.push(model.gates.steps);
  for (const list of groups) {
    const hit = list.find((step) => step.id === id);
    if (hit) return hit;
  }
  return null;
}
