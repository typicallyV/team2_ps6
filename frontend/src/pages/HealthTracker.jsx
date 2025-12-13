import React, { useRef, useState, useEffect } from "react";
import { API_BASE } from "../config";
const THEME = {
  sage: "#DCE4C9",      // accent only
  beige: "#F5F5DC",     // primary surface
  taupe: "#B6A28E",
  orange: "#E07B39",
  text: "#4A4A4A",
  neutralLight: "#F6F3EC", // light neutral for cards
};

export default function HealthTracker() {
  // refs for scrolling
  const refs = {
    lifestyle: useRef(null),
    genetics: useRef(null),
    conditions: useRef(null),
    allergies: useRef(null),
    vaccinations: useRef(null),
  };

  // section data states
  const [lifestyles, setLifestyles] = useState([]);
  const [genetics, setGenetics] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  // modal state
  const [openModal, setOpenModal] = useState(null); // 'lifestyle'|'genetics'|'conditions'|'allergy'|'vaccination' | null

  // generic helper to add entries
  const addEntry = (type, entry) => {
    const timestamp = new Date().toLocaleString();
    const item = { id: Date.now(), ...entry, timestamp };
    if (type === "lifestyle") setLifestyles((s) => [item, ...s]);
    if (type === "genetics") setGenetics((s) => [item, ...s]);
    if (type === "conditions") setConditions((s) => [item, ...s]);
    if (type === "allergy") setAllergies((s) => [item, ...s]);
    if (type === "vaccination") setVaccinations((s) => [item, ...s]);
    setOpenModal(null);
  };

  // scroll handler
  const scrollTo = (key) => {
    const ref = refs[key];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // close modal on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: THEME.sage, display: "flex", gap: 20, padding: 20, color: THEME.text, fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
      {/* SIDEBAR: use beige surface, keep small sage accents inside items */}
      <aside style={{ width: 260, background: THEME.sage, borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: THEME.text, marginBottom: 12 }}>Profile</div>

        <SidebarItem label="Medications & Supplements" onClick={() => scrollTo("meds")} icon="💊" />
        <SidebarItem label="Conditions & Injuries" onClick={() => scrollTo("conditions")} icon="🩹" />
        <SidebarItem label="Allergies" onClick={() => scrollTo("allergies")} icon="❗" />
        <SidebarItem label="Vaccinations" onClick={() => scrollTo("vaccinations")} icon="💉" />
        <SidebarItem label="Genetics" onClick={() => scrollTo("genetics")} icon="🧬" />
        <SidebarItem label="Lifestyle" onClick={() => scrollTo("lifestyle")} icon="🏃‍♂️" />
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
       { /*medications*/}
       <section ref={refs.genetics}>
          <Card header="Medication and Supplements" icon="">
            <p style={{ marginTop: 4 }}>{genetics.length === 0 ? "" : null}</p>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("genetics")} label="Add Medicines" />
            </div>

            <div style={{ marginTop: 14 }}>
              {genetics.map((it) => <EntryCard key={it.id} title={`${it.relative}: ${it.condition}`} subtitle={it.timestamp} notes={it.notes} />)}
            </div>
          </Card>
        </section>
        {/* --- Lifestyle */}
        <section ref={refs.lifestyle}>
          <Card header="Lifestyle" icon="🏃‍♂️">
            <p style={{ marginTop: 4 }}>{lifestyles.length === 0 ? "No current lifestyle habits" : null}</p>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("lifestyle")} label="Add Lifestyle Habit" />
            </div>

            {/* list */}
            <div style={{ marginTop: 14 }}>
              {lifestyles.map((it) => <EntryCard key={it.id} title={it.habit} subtitle={`${it.frequency} • ${it.timestamp}`} notes={it.notes} />)}
            </div>
          </Card>
        </section>

        {/* --- Genetics */}
        <section ref={refs.genetics}>
          <Card header="Genetics" icon="🧬">
            <p style={{ marginTop: 4 }}>{genetics.length === 0 ? "No family history reported" : null}</p>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("genetics")} label="Add Family History" />
            </div>

            <div style={{ marginTop: 14 }}>
              {genetics.map((it) => <EntryCard key={it.id} title={`${it.relative}: ${it.condition}`} subtitle={it.timestamp} notes={it.notes} />)}
            </div>
          </Card>
        </section>

        {/* --- Conditions & Injuries */}
        <section ref={refs.conditions}>
          <Card header="Conditions & Injuries" icon="🩹">
            <p style={{ marginTop: 4 }}>
              Import your conditions by <span style={{ color: THEME.orange }}>connecting to providers</span> or entering them.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("conditions")} label="Add Condition" />
              <PrimaryButton onClick={() => setOpenModal("conditions")} label="Add Injury" />
            </div>

            <div style={{ marginTop: 14 }}>
              {conditions.map((it) => <EntryCard key={it.id} title={it.name} subtitle={`${it.onset || "No date"} • ${it.timestamp}`} notes={it.notes} />)}
            </div>
          </Card>
        </section>

        {/* --- Allergies & Intolerances */}
        <section ref={refs.allergies}>
          <Card header="Allergies & Intolerances" icon="❗">
            <p style={{ marginTop: 4 }}>
              Import your allergies by uploading test results or entering them.
            </p>

            <div style={{ marginTop: 10 }}>
              <a style={{ color: THEME.orange, fontWeight: 600, cursor: "pointer" }}>Upload Test Result</a>
            </div>

            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("allergy")} label="Add Allergy" />
            </div>

            <div style={{ marginTop: 14 }}>
              {allergies.map((it) => (
                <EntryCard
                  key={it.id}
                  title={it.substance}
                  subtitle={`${it.type}${it.lifeThreat ? " • Life-threatening" : ""} • ${it.timestamp}`}
                  notes={`Severity: ${it.severity} • Category: ${it.category}${it.notes ? ` • Notes: ${it.notes}` : ""}`}
                />
              ))}
            </div>
          </Card>
        </section>

        {/* --- Vaccinations */}
        <section ref={refs.vaccinations}>
          <Card header="Vaccinations" icon="💉">
            <p style={{ marginTop: 4 }}>{vaccinations.length === 0 ? "No vaccinations recorded." : null}</p>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={() => setOpenModal("vaccination")} label="Add Vaccination" />
            </div>

            <div style={{ marginTop: 14 }}>
              {vaccinations.map((it) => <EntryCard key={it.id} title={it.name} subtitle={`${it.date || "No date"} • ${it.timestamp}`} notes={it.notes} />)}
            </div>
          </Card>
        </section>
      </main>

      {/* MODALS */}
      {openModal === "lifestyle" && (
        <Modal title="Add Lifestyle Habit" onClose={() => setOpenModal(null)}>
          <LifestyleForm onAdd={(data) => addEntry("lifestyle", data)} onCancel={() => setOpenModal(null)} theme={THEME} />
        </Modal>
      )}

      {openModal === "genetics" && (
        <Modal title="Add Family History" onClose={() => setOpenModal(null)}>
          <GeneticsForm onAdd={(data) => addEntry("genetics", data)} onCancel={() => setOpenModal(null)} theme={THEME} />
        </Modal>
      )}

      {openModal === "conditions" && (
        <Modal title="Add Condition / Injury" onClose={() => setOpenModal(null)}>
          <ConditionForm onAdd={(data) => addEntry("conditions", data)} onCancel={() => setOpenModal(null)} theme={THEME} />
        </Modal>
      )}

      {openModal === "allergy" && (
        <Modal title="Add Allergy" onClose={() => setOpenModal(null)}>
          <AllergyForm onAdd={(data) => addEntry("allergy", data)} onCancel={() => setOpenModal(null)} theme={THEME} />
        </Modal>
      )}

      {openModal === "vaccination" && (
        <Modal title="Add Vaccination" onClose={() => setOpenModal(null)}>
          <VaccinationForm onAdd={(data) => addEntry("vaccination", data)} onCancel={() => setOpenModal(null)} theme={THEME} />
        </Modal>
      )}
    </div>
  );
}

/* =================== SMALL REUSABLE UI =================== */

function SidebarItem({ icon, label, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "8px 6px", borderRadius: 8 }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Card({ header, icon, children }) {
  return (
    <div style={{ background: THEME.neutralLight, padding: 22, borderRadius: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        <h3 style={{ margin: 0, color: THEME.orange }}>{header}</h3>
      </div>
      <div style={{ marginTop: 10, color: THEME.text }}>{children}</div>
    </div>
  );
}

function PrimaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: THEME.taupe,
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      + {label}
    </button>
  );
}

function EntryCard({ title, subtitle, notes }) {
  return (
    <div style={{ background: "white", padding: 14, borderRadius: 10, marginBottom: 10, border: `1px solid ${THEME.taupe}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: THEME.text }}>{title}</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{subtitle}</div>
        </div>
      </div>
      {notes && <div style={{ marginTop: 10, fontSize: 14, color: THEME.text }}>{notes}</div>}
    </div>
  );
}

/* =================== MODAL (simple accessible) =================== */

function Modal({ title, children, onClose }) {
  useEffect(() => {
    // trap scroll
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.18)",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 680, background: THEME.neutralLight, borderRadius: 14, padding: 18, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onClose} style={{ background: THEME.taupe, color: "white", border: "none", borderRadius: "999px", width: 40, height: 40, fontSize: 18, cursor: "pointer" }}>←</button>
            <h2 style={{ margin: 0, color: THEME.orange }}>{title}</h2>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

/* =================== FORMS (specialized) =================== */

/* Lifestyle form */
function LifestyleForm({ onAdd, onCancel, theme }) {
  const [habit, setHabit] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [notes, setNotes] = useState("");

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>Habit</label>
      <input value={habit} onChange={(e)=>setHabit(e.target.value)} placeholder="e.g. Morning walk" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Frequency</label>
      <select value={frequency} onChange={(e)=>setFrequency(e.target.value)} style={{ ...inputStyle, padding: 10 }}>
        <option>Daily</option>
        <option>Weekly</option>
        <option>Monthly</option>
        <option>Occasionally</option>
      </select>

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Notes</label>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={()=>{ if(!habit) return alert("Please enter habit"); onAdd({ habit, frequency, notes }); }} style={modalAddStyle}>Add</button>
        <button onClick={onCancel} style={modalCancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* Genetics form */
function GeneticsForm({ onAdd, onCancel }) {
  const [relative, setRelative] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>Relative</label>
      <input value={relative} onChange={(e)=>setRelative(e.target.value)} placeholder="e.g. Mother" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Condition</label>
      <input value={condition} onChange={(e)=>setCondition(e.target.value)} placeholder="e.g. Diabetes" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Notes</label>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={()=>{ if(!relative || !condition) return alert("Fill relative and condition"); onAdd({ relative, condition, notes }); }} style={modalAddStyle}>Add</button>
        <button onClick={onCancel} style={modalCancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* Condition form */
function ConditionForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [onset, setOnset] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>Condition / Injury</label>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Hypertension" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Date of Onset</label>
      <input type="date" value={onset} onChange={(e)=>setOnset(e.target.value)} style={{ ...inputStyle, padding: 8 }} />

      <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontWeight: 700 }}>Notes</label>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={()=>{ if(!name) return alert("Please add condition name"); onAdd({ name, onset, notes }); }} style={modalAddStyle}>Add</button>
        <button onClick={onCancel} style={modalCancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* Allergy form (more fields) */
function AllergyForm({ onAdd, onCancel }) {
  const [substance, setSubstance] = useState("");
  const [type, setType] = useState("Allergy"); // Allergy or Intolerance
  const [lifeThreat, setLifeThreat] = useState(false);
  const [severity, setSeverity] = useState("Low");
  const [category, setCategory] = useState("Other");
  const [notes, setNotes] = useState("");

  const categories = ["Drug", "Food", "Environment / Animal", "Other"];
  const severities = ["Low", "Moderate", "High", "Very High"];

  return (
    <div>
      <label style={{ fontWeight: 700 }}>Substance</label>
      <input value={substance} onChange={(e)=>setSubstance(e.target.value)} placeholder="e.g. Penicillin" style={inputStyle} />

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={()=>setType("Allergy")} style={toggleButton(type==="Allergy")}>Allergy</button>
        <button onClick={()=>setType("Intolerance")} style={toggleButton(type==="Intolerance")}>Intolerance</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={lifeThreat} onChange={(e)=>setLifeThreat(e.target.checked)} /> Life-threatening (e.g. Anaphylaxis)
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>Estimated Severity</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {severities.map(s => (
            <button key={s} onClick={()=>setSeverity(s)} style={severity === s ? activePillStyle : pillStyle}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>Category</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={()=>setCategory(c)} style={category===c ? activePillStyle : pillStyle}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>Notes</label>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 84 }} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={()=>{ if(!substance) return alert("Please add substance"); onAdd({ substance, type, lifeThreat, severity, category, notes }); }} style={modalAddStyle}>Add</button>
        <button onClick={onCancel} style={modalCancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* Vaccination form */
function VaccinationForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [protects, setProtects] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div>
      <label style={{ fontWeight: 700 }}>Vaccination Name</label>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Influenza (2024)" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>Protects Against (optional)</label>
      <input value={protects} onChange={(e)=>setProtects(e.target.value)} placeholder="e.g. Influenza virus" style={inputStyle} />

      <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>Date Administered</label>
      <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} style={{ ...inputStyle, padding: 8 }} />

      <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>Notes</label>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={()=>{ if(!name) return alert("Please enter vaccine name"); onAdd({ name, protects, date, notes }); }} style={modalAddStyle}>Add</button>
        <button onClick={onCancel} style={modalCancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* =================== STYLES =================== */

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid rgba(0,0,0,0.12)`,
  fontSize: 15,
  boxSizing: "border-box",
  marginTop: 6,
  background: "white",
  color: "#333"
};

const modalAddStyle = {
  background: THEME.taupe,
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15
};

const modalCancelStyle = {
  background: "#eee",
  color: THEME.text,
  border: "none",
  padding: "10px 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 15
};

const pillStyle = {
  background: "#eee",
  border: "1px solid rgba(0,0,0,0.08)",
  padding: "8px 12px",
  borderRadius: 999,
  cursor: "pointer",
  color: THEME.text,
  fontWeight: 600
};

const activePillStyle = {
  ...pillStyle,
  background: THEME.taupe,
  color: "white",
  border: "none"
};

const toggleButton = (isActive) => isActive ? activePillStyle : pillStyle;
