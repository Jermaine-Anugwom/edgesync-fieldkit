"use client";

import { useMemo, useState } from "react";

type Mode = "online" | "degraded" | "offline" | "empty";

const devices = [
  { id: "FIELD-07", zone: "North culvert", state: "SYNCED" },
  { id: "FIELD-12", zone: "Pump station", state: "OFFLINE" },
  { id: "FIELD-03", zone: "West crossing", state: "CONFLICT" },
];

const modeCopy: Record<Mode, { title: string; signal: string; note: string }> = {
  online: { title: "All routes are carrying evidence.", signal: "LINK STABLE", note: "Acknowledgements returned in sequence." },
  degraded: { title: "Two records need deliberate recovery.", signal: "PACKET LOSS 18%", note: "Safe retries continue; conflicts remain held." },
  offline: { title: "The field keeps working without the network.", signal: "RADIO SILENCE", note: "Four signed records are sealed on FIELD-12." },
  empty: { title: "No field devices are assigned.", signal: "NO ACTIVE SHIFT", note: "Assign a synthetic fixture to begin a run." },
};

export default function Page() {
  const [mode, setMode] = useState<Mode>("degraded");
  const [selected, setSelected] = useState("FIELD-03");
  const active = useMemo(() => devices.find((device) => device.id === selected) ?? devices[0], [selected]);
  const copy = modeCopy[mode];

  return (
    <main>
      <a className="skip" href="#network">Skip to network map</a>
      <header>
        <a className="brand" href="#network" aria-label="EdgeSync FieldKit home"><span>ES</span> EdgeSync FieldKit</a>
        <nav aria-label="Network simulation state">
          {(Object.keys(modeCopy) as Mode[]).map((item) => (
            <button key={item} aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>
          ))}
        </nav>
        <strong>SYNTHETIC / NO EXTERNAL ACTIONS</strong>
      </header>

      <section className="signal-strip" aria-live="polite">
        <span>{copy.signal}</span>
        <h1>{copy.title}</h1>
        <p>{copy.note}</p>
      </section>

      {mode === "empty" ? (
        <section className="empty-state" id="network">
          <span aria-hidden="true">＋</span>
          <h2>No active field shift</h2>
          <p>The simulator is quiet. Choose another state to inspect retry, queue, and conflict behavior.</p>
        </section>
      ) : (
        <section className="instrument" id="network">
          <aside className="device-bank" aria-label="Field devices">
            <p className="section-label">DEVICE BANK</p>
            {devices.map((device) => (
              <button key={device.id} className="device" data-active={device.id === selected} onClick={() => setSelected(device.id)}>
                <span><strong>{device.id}</strong><small>{device.zone}</small></span>
                <span className={`state state-${device.state.toLowerCase()}`}>{device.state}</span>
              </button>
            ))}
            <dl>
              <div><dt>Signed locally</dt><dd>12</dd></div>
              <div><dt>Queued</dt><dd>{mode === "online" ? 0 : 6}</dd></div>
              <div><dt>Held conflicts</dt><dd>{mode === "online" ? 0 : 1}</dd></div>
            </dl>
          </aside>

          <section className="topology" aria-label="Synchronization topology">
            <div className="topology-head">
              <p className="section-label">ROUTE TOPOLOGY / SHIFT 084</p>
              <span>Last deterministic tick 14:32:08</span>
            </div>
            <div className={`network network-${mode}`}>
              <svg aria-hidden="true" viewBox="0 0 800 420" preserveAspectRatio="none">
                <path d="M88 110 C230 110 255 205 392 205 S560 110 713 110" />
                <path d="M88 320 C225 320 245 205 392 205 S565 320 713 320" />
                <path className="fault" d="M392 205 C475 210 525 276 713 320" />
              </svg>
              <button className="node field-07" onClick={() => setSelected("FIELD-07")}><b>07</b><span>SYNCED</span></button>
              <button className="node field-12" onClick={() => setSelected("FIELD-12")}><b>12</b><span>{mode === "offline" ? "SEALED" : "QUEUED"}</span></button>
              <div className="node repeater"><b>R</b><span>REPEATER</span></div>
              <button className="node field-03" onClick={() => setSelected("FIELD-03")}><b>03</b><span>CONFLICT</span></button>
              <div className="node command"><b>HQ</b><span>LEDGER</span></div>
            </div>
            <div className="packet-tape" aria-label="Packet route history">
              <span>R-112 <b>ACK</b></span><i>→</i><span>R-113 <b>RETRY 2</b></span><i>→</i><span>R-114 <b>HELD</b></span>
            </div>
          </section>

          <aside className="resolver">
            <p className="section-label">SELECTED RECORD</p>
            <span className="record-id">{active.id} / R-114</span>
            <h2>{active.state === "CONFLICT" ? "Two edits share one sequence." : active.state === "OFFLINE" ? "Evidence is sealed locally." : "Evidence reached the ledger."}</h2>
            <div className="lineage">
              <span>14:29:51</span><p>Operator signed inspection</p>
              <span>14:31:06</span><p>Sequence collision detected</p>
              <span>14:32:08</span><p>Automatic merge refused</p>
            </div>
            <div className="decision">
              <small>NEXT SAFE ACTION</small>
              <strong>{active.state === "CONFLICT" ? "Compare the two signed values" : "Continue deterministic replay"}</strong>
              <p>No consequential field is guessed or silently overwritten.</p>
            </div>
            <button className="disabled-action" disabled>Resolve externally</button>
          </aside>
        </section>
      )}

      <footer><span>Offline-first field operations laboratory</span><span>Deterministic fixtures · Keyboard operable · No API key</span></footer>
      <script type="application/json" data-impeccable-contract dangerouslySetInnerHTML={{ __html: JSON.stringify({
        core_job: "Make synchronization failure visible and recoverable to a field operator.",
        hero_action: "Inspect the route, select a device, and identify the next safe action.",
        required_states: ["online", "degraded", "offline", "empty"],
        forbidden_shortcuts: ["generic dashboard cards", "hidden conflicts", "automatic destructive merge"],
        visual_commitment: "A tense field topology instrument derived from concept seed 40ecb42a."
      }) }} />
    </main>
  );
}
