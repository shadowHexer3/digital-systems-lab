const $ = (s) => document.querySelector(s);

const valueInput = $("#value");
const fromSystem = $("#fromSystem");
const toSystem = $("#toSystem");
const results = $("#results");
const stepsPanel = $("#stepsPanel");
const explanation = $("#explanation");
const error = $("#error");
const stepLabel = $("#step-label");

const labels = { 2:"Binary", 8:"Octal", 10:"Decimal", 16:"Hexadecimal" };

function getData() {
  const value = valueInput.value;
  const from = Number(fromSystem.value);
  const to = Number(toSystem.value);
  return { value, from, to };
}

function validateInput(value, from) {
  const message = NumberSystems.validate(value, from);
  error.textContent = message;
  valueInput.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

function renderResults(data) {
  const values = NumberSystems.all(data.value, data.from);
  const order = [10, 2, 8, 16];
  results.innerHTML = order.map(base => `
    <article class="result-card ${labels[base].toLowerCase()}">
      <div class="name">${labels[base]} (${base})</div>
      <div class="value">${values[base]}</div>
    </article>
  `).join("");
}

function renderSteps(data) {
  const result = NumberSystems.steps(data.value, data.from, data.to);
  stepLabel.textContent = `${labels[data.from]} → ${labels[data.to]}`;

  stepsPanel.innerHTML = result.rows.map((row, i) => `
    <div class="step">
      <span class="step-num">${i + 1}</span>
      <span>${row.text}</span>
      <span class="rem">${row.rem || ""}</span>
    </div>
  `).join("");

  if (data.from !== data.to) {
    stepsPanel.insertAdjacentHTML("beforeend",
      `<div class="final-result">Result: ${result.result}<sub>${data.to}</sub></div>`
    );
  }
}

function renderExplanation(data) {
  const direction = `${labels[data.from]} → ${labels[data.to]}`;
  explanation.innerHTML = `
    <p><strong>${direction}</strong></p>
    <ol>
      <li>The input is validated against the selected source base.</li>
      <li>The value is interpreted as a number in base ${data.from}.</li>
      <li>The same numeric value is represented in base ${data.to}.</li>
      <li>The exact conversion steps are shown beside the result.</li>
    </ol>
    <p>This module is fully local: no Internet connection or external service is required.</p>
  `;
}

function convert() {
  const data = getData();
  if (!validateInput(data.value, data.from)) {
    results.innerHTML = "";
    stepsPanel.innerHTML = "";
    explanation.innerHTML = "";
    return;
  }
  renderResults(data);
  renderSteps(data);
  renderExplanation(data);
}

$("#convert").addEventListener("click", convert);
$("#all").addEventListener("click", convert);
$("#steps").addEventListener("click", () => {
  const data = getData();
  if (validateInput(data.value, data.from)) renderSteps(data);
});
$("#swap").addEventListener("click", () => {
  const oldFrom = fromSystem.value;
  fromSystem.value = toSystem.value;
  toSystem.value = oldFrom;
  convert();
});
$("#reset").addEventListener("click", () => {
  valueInput.value = "";
  fromSystem.value = "10";
  toSystem.value = "2";
  error.textContent = "";
  results.innerHTML = "";
  stepsPanel.innerHTML = "";
  explanation.innerHTML = "";
  valueInput.focus();
});
valueInput.addEventListener("keydown", e => {
  if (e.key === "Enter") convert();
});
[fromSystem, toSystem].forEach(el => el.addEventListener("change", () => {
  const data = getData();
  if (valueInput.value.trim() && validateInput(data.value, data.from)) convert();
}));

convert();


const methodBadge = $("#method-badge");
const methodContent = $("#method-content");
const practiceQuestion = $("#practice-question");
const practiceAnswer = $("#practice-answer");
const practiceFeedback = $("#practice-feedback");

function renderMethod(data) {
  const from = labels[data.from];
  const to = labels[data.to];
  methodBadge.textContent = `${from} → ${to}`;

  let title = `${from} → ${to}`;
  let body = "";
  let example = "";

  if (data.from === 10 && data.to !== 10) {
    body = `Starting from Decimal, repeatedly divide by the target base and keep each remainder. Continue until the quotient reaches 0.`;
    example = `Read the remainders from bottom to top to build the final ${to} value.`;
  } else if (data.to === 10 && data.from !== 10) {
    body = `Starting from ${from}, each digit is multiplied by a power of ${data.from}. The powers start at 0 from the rightmost digit.`;
    example = `Add all positional values to obtain the Decimal value.`;
  } else {
    body = `The system first interprets the source value as a numeric value, then represents that same value in the target base.`;
    example = `For learning, the intermediate Decimal representation is shown when it helps explain the conversion.`;
  }

  methodContent.innerHTML = `
    <strong>${title}</strong>
    <p>${body}</p>
    <div class="method-example">${example}</div>
  `;
}

const practicePool = [
  { value: "10", from: 10, to: 2 },
  { value: "42", from: 10, to: 16 },
  { value: "101101", from: 2, to: 10 },
  { value: "77", from: 8, to: 10 },
  { value: "2F", from: 16, to: 10 },
  { value: "255", from: 10, to: 2 },
  { value: "10101010", from: 2, to: 16 },
  { value: "64", from: 10, to: 8 }
];

let currentPractice = practicePool[0];

function newPracticeQuestion() {
  currentPractice = practicePool[Math.floor(Math.random() * practicePool.length)];
  practiceQuestion.textContent =
    `Convert ${currentPractice.value} from ${labels[currentPractice.from]} to ${labels[currentPractice.to]}.`;
  practiceAnswer.value = "";
  practiceFeedback.textContent = "";
  practiceFeedback.className = "practice-feedback";
}

$("#check-answer").addEventListener("click", () => {
  const answer = practiceAnswer.value.trim().toUpperCase();
  const expected = NumberSystems.convert(
    currentPractice.value,
    currentPractice.from,
    currentPractice.to
  );

  if (!answer) {
    practiceFeedback.textContent = "Enter an answer first.";
    practiceFeedback.className = "practice-feedback fail";
    return;
  }

  if (answer === expected) {
    practiceFeedback.textContent = "✓ Correct!";
    practiceFeedback.className = "practice-feedback success";
  } else {
    practiceFeedback.textContent = `✗ Not quite. Try again.`;
    practiceFeedback.className = "practice-feedback fail";
  }
});

$("#new-question").addEventListener("click", newPracticeQuestion);
practiceAnswer.addEventListener("keydown", e => {
  if (e.key === "Enter") $("#check-answer").click();
});

const originalRender = renderExplanation;
renderExplanation = function(data) {
  originalRender(data);
  renderMethod(data);
};

newPracticeQuestion();
renderMethod(getData());


/* ---------------- Boolean Logic Module ---------------- */
const booleanSection = $("#boolean-section");
const numberSection = $("#number-systems-section");
const numberWorkspace = document.querySelector(".workspace");
const gatesSection = $("#gates-section");
const gateBuilderSection = $("#gate-builder-section");
const sequentialSection = $("#sequential-section");
const registersSection = $("#registers-section");
const numberOnlySections = document.querySelectorAll(".number-only");
const booleanExpression = $("#booleanExpression");
const booleanError = $("#booleanError");
const booleanVariables = $("#booleanVariables");
const booleanResult = $("#booleanResult");
const booleanStructure = $("#booleanStructure");
const truthTable = $("#truthTable");
const truthTableInfo = $("#truthTableInfo");
const booleanFeedback = $("#booleanFeedback");

function normalizeBooleanExpression(expr) {
  return expr
    .replace(/[·*]/g, "&")
    .replace(/[∨|]/g, "+")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function tokenizeBoolean(expr) {
  const s = normalizeBooleanExpression(expr);
  const tokens = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/[A-Z]/.test(ch) || ch === "0" || ch === "1" || ch === "'" ||
        ch === "+" || ch === "&" || ch === "(" || ch === ")") {
      tokens.push(ch);
    } else {
      throw new Error(`Unsupported character: ${ch}`);
    }
  }
  return tokens;
}

function injectAnd(tokens) {
  const out = [];
  const canEnd = t => /^[A-Z01]$/.test(t) || t === ")" || t === "'";
  const canStart = t => /^[A-Z01]$/.test(t) || t === "(";
  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    out.push(a);
    if (b && canEnd(a) && canStart(b)) out.push("&");
  }
  return out;
}

function parseBoolean(expr) {
  let tokens = injectAnd(tokenizeBoolean(expr));
  let pos = 0;

  function primary() {
    const t = tokens[pos];
    if (t === "(") {
      pos++;
      const node = orExpr();
      if (tokens[pos] !== ")") throw new Error("Missing closing parenthesis.");
      pos++;
      return node;
    }
    if (/^[A-Z01]$/.test(t || "")) {
      pos++;
      let node = { type: "value", value: t };
      while (tokens[pos] === "'") {
        pos++;
        node = { type: "not", child: node };
      }
      return node;
    }
    throw new Error("Invalid expression.");
  }

  function andExpr() {
    let node = primary();
    while (tokens[pos] === "&") {
      pos++;
      node = { type: "and", left: node, right: primary() };
    }
    return node;
  }

  function orExpr() {
    let node = andExpr();
    while (tokens[pos] === "+") {
      pos++;
      node = { type: "or", left: node, right: andExpr() };
    }
    return node;
  }

  const tree = orExpr();
  if (pos !== tokens.length) throw new Error("Unexpected token.");
  return tree;
}

function variablesFromTree(node, set = new Set()) {
  if (node.type === "value" && /^[A-Z]$/.test(node.value)) set.add(node.value);
  if (node.child) variablesFromTree(node.child, set);
  if (node.left) variablesFromTree(node.left, set);
  if (node.right) variablesFromTree(node.right, set);
  return [...set].sort();
}

function evalTree(node, vars) {
  if (node.type === "value") {
    if (node.value === "0" || node.value === "1") return Number(node.value);
    return vars[node.value];
  }
  if (node.type === "not") return evalTree(node.child, vars) ? 0 : 1;
  if (node.type === "and") return evalTree(node.left, vars) & evalTree(node.right, vars);
  if (node.type === "or") return evalTree(node.left, vars) | evalTree(node.right, vars);
}

function treeText(node) {
  if (node.type === "value") return node.value;
  if (node.type === "not") return `NOT (${treeText(node.child)})`;
  const op = node.type === "and" ? "AND" : "OR";
  return `(${treeText(node.left)} ${op} ${treeText(node.right)})`;
}

function evaluateBooleanModule() {
  try {
    const expr = booleanExpression.value;
    const tree = parseBoolean(expr);
    const vars = variablesFromTree(tree);

    if (vars.length > 8) throw new Error("Maximum supported variables in this module is 8.");

    const assignments = {};
    vars.forEach(v => assignments[v] = 0);
    const result = evalTree(tree, assignments);

    booleanError.textContent = "";
    renderBooleanVariables(vars, tree);
    booleanResult.textContent = result;
    booleanStructure.innerHTML = `<div class="structure-code">${treeText(tree)}</div>`;
    renderTruthTable(vars, tree);
  } catch (e) {
    booleanError.textContent = e.message;
    booleanVariables.innerHTML = "";
    booleanResult.textContent = "—";
    booleanStructure.innerHTML = `<div class="structure-placeholder">Fix the expression to see its logic structure.</div>`;
    truthTable.innerHTML = `<div class="structure-placeholder">No truth table available.</div>`;
    truthTableInfo.textContent = "—";
  }
}

function renderBooleanVariables(vars, tree) {
  booleanVariables.innerHTML = vars.map(v => `
    <div class="variable-chip">
      <strong>${v}</strong>
      <button type="button" data-var="${v}">0</button>
    </div>
  `).join("");

  booleanVariables.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.textContent = btn.textContent === "0" ? "1" : "0";
      const assignments = {};
      booleanVariables.querySelectorAll("button").forEach(b => {
        assignments[b.dataset.var] = Number(b.textContent);
      });
      booleanResult.textContent = evalTree(tree, assignments);
    });
  });
}

function renderTruthTable(vars, tree) {
  const rows = [];
  const count = 2 ** vars.length;

  for (let n = 0; n < count; n++) {
    const assignment = {};
    const cells = vars.map((v, i) => {
      const bit = (n >> (vars.length - i - 1)) & 1;
      assignment[v] = bit;
      return bit;
    });
    const out = evalTree(tree, assignment);
    rows.push({ cells, out });
  }

  truthTableInfo.textContent = `${count} combinations`;

  truthTable.innerHTML = `
    <table class="truth-table">
      <thead>
        <tr>${vars.map(v => `<th>${v}</th>`).join("")}<th>F</th></tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.cells.map(v => `<td>${v}</td>`).join("")}
            <td class="${row.out ? "output-one" : "output-zero"}">${row.out}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

$("#evaluateBoolean").addEventListener("click", evaluateBooleanModule);
$("#generateTruthTable").addEventListener("click", evaluateBooleanModule);
$("#clearBoolean").addEventListener("click", () => {
  booleanExpression.value = "AB + C";
  booleanError.textContent = "";
  evaluateBooleanModule();
});

booleanExpression.addEventListener("keydown", e => {
  if (e.key === "Enter") evaluateBooleanModule();
});

document.querySelectorAll(".bool-answer").forEach(btn => {
  btn.addEventListener("click", () => {
    const answer = btn.dataset.answer;
    // For F = AB + C with A=1, B=0, C=1, expected output is 1.
    if (answer === "1") {
      booleanFeedback.textContent = "✓ Correct!";
      booleanFeedback.className = "practice-feedback success";
    } else {
      booleanFeedback.textContent = "✗ Not quite. Recheck the OR term C.";
      booleanFeedback.className = "practice-feedback fail";
    }
  });
});

/* Combinational Circuits — Half Adder */
const combinationalSection = $("#combinational-section");
const haA = $("#haA");
const haB = $("#haB");
const haSum = $("#haSum");
const haCarry = $("#haCarry");
const haWireA = $("#haWireA");
const haWireB = $("#haWireB");
const haPracticeFeedback = $("#haPracticeFeedback");

function renderHalfAdder(){
  const a = Number(haA.dataset.value);
  const b = Number(haB.dataset.value);
  const sum = a ^ b;
  const carry = a & b;
  haA.textContent = a; haB.textContent = b;
  haA.classList.toggle("is-one", a === 1); haB.classList.toggle("is-one", b === 1);
  haWireA.textContent = a; haWireB.textContent = b;
  haSum.textContent = sum; haCarry.textContent = carry;
}
haA.addEventListener("click",()=>{ setBit(haA); renderHalfAdder(); });
haB.addEventListener("click",()=>{ setBit(haB); renderHalfAdder(); });
document.querySelectorAll("#haPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok = btn.dataset.sum === "0" && btn.dataset.carry === "1";
  haPracticeFeedback.textContent = ok ? "✓ Correct! 1 + 1 = Sum 0 with Carry 1." : "✗ Not quite. Check the Half Adder truth table.";
  haPracticeFeedback.className = "practice-feedback " + (ok ? "success" : "fail");
}));
renderHalfAdder();


/* Full Adder */
const faA = $("#faA"), faB = $("#faB"), faCin = $("#faCin");
const faSum = $("#faSum"), faCarry = $("#faCarry");
const faWireA = $("#faWireA"), faWireB = $("#faWireB"), faWireCin = $("#faWireCin");
const faPracticeFeedback = $("#faPracticeFeedback");

function renderFullAdder(){
  const a = Number(faA.dataset.value), b = Number(faB.dataset.value), cin = Number(faCin.dataset.value);
  const sum = a ^ b ^ cin;
  const carry = (a & b) | (a & cin) | (b & cin);
  [ [faA,a], [faB,b], [faCin,cin] ].forEach(([el,v])=>{
    el.textContent=v;
    el.classList.toggle("is-one",v===1);
  });
  faWireA.textContent=a; faWireB.textContent=b; faWireCin.textContent=cin;
  faSum.textContent=sum; faCarry.textContent=carry;
}
[faA,faB,faCin].forEach(el=>el.addEventListener("click",()=>{ setBit(el); renderFullAdder(); }));
document.querySelectorAll("#faPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok = btn.dataset.sum === "1" && btn.dataset.carry === "1";
  faPracticeFeedback.textContent = ok ? "✓ Correct! 1 + 1 + 1 = Sum 1 with Carry-out 1." : "✗ Not quite. Check the Full Adder truth table.";
  faPracticeFeedback.className = "practice-feedback " + (ok ? "success" : "fail");
}));
renderFullAdder();

/* 2:1 Multiplexer */
const muxD0 = $("#muxD0"), muxD1 = $("#muxD1"), muxS = $("#muxS");
const muxWireD0 = $("#muxWireD0"), muxWireD1 = $("#muxWireD1"), muxWireS = $("#muxWireS");
const muxOutput = $("#muxOutput"), muxSelected = $("#muxSelected"), muxSelectionText = $("#muxSelectionText");
const muxPracticeFeedback = $("#muxPracticeFeedback");

function renderMux(){
  const d0=Number(muxD0.dataset.value), d1=Number(muxD1.dataset.value), sel=Number(muxS.dataset.value);
  const y=sel===0?d0:d1;
  [[muxD0,d0],[muxD1,d1],[muxS,sel]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  muxWireD0.textContent=d0; muxWireD1.textContent=d1; muxWireS.textContent=sel; muxOutput.textContent=y;
  muxSelected.textContent=`S = ${sel} → D${sel} selected`;
  muxSelectionText.textContent=`D${sel}`;
}
[muxD0,muxD1,muxS].forEach(el=>el.addEventListener("click",()=>{setBit(el);renderMux();}));
document.querySelectorAll("#muxPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok=btn.dataset.answer==="1";
  muxPracticeFeedback.textContent=ok?"✓ Correct! S = 1 selects D1, so Y = 1.":"✗ Not quite. When S = 1, the MUX selects D1.";
  muxPracticeFeedback.className="practice-feedback "+(ok?"success":"fail");
}));
renderMux();

const countersSection = $("#counters-section");
const circuitLabSection = $("#circuit-lab-section");
const circuitBuilderSection = $("#circuit-builder-section");
const homeSection = $("#home-section");
const topbar = document.querySelector(".topbar");

function hideAllSections(){
  homeSection.classList.remove("visible");
  booleanSection.classList.remove("visible");
  gatesSection.classList.remove("visible");
  gateBuilderSection.classList.remove("visible");
  combinationalSection.classList.remove("visible");
  sequentialSection.classList.remove("visible");
  registersSection.classList.remove("visible");
  countersSection.classList.remove("visible");
  circuitLabSection.classList.remove("visible");
  circuitBuilderSection.classList.remove("visible");
  numberSection.classList.remove("visible");
  numberWorkspace.style.display = "none";
  numberOnlySections.forEach(el => el.style.display = "none");
  topbar.style.display = "none";
}

function setActiveNav(section, scrollTarget=null){
  document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.toggle("active", n.dataset.section === section));
  const submenuMap = {
    combinational: "combNavSubmenu",
    sequential: "seqNavSubmenu",
    registers: "regNavSubmenu",
    counters: "counterNavSubmenu"
  };
  document.querySelectorAll(".nav-submenu").forEach(menu => menu.classList.remove("expanded"));
  document.querySelectorAll(".nav-subitem").forEach(item => item.classList.toggle("active-sub", item.dataset.section === section && (!scrollTarget || item.dataset.scrollTarget === scrollTarget)));
  const submenu = submenuMap[section] ? document.getElementById(submenuMap[section]) : null;
  if(submenu) submenu.classList.add("expanded");
}


/* ---------------- Sequential Circuits Module ---------------- */
function toggleSeqButton(id, callback){
  const el = $(id);
  if(!el) return;
  el.addEventListener("click", () => {
    const next = el.dataset.value === "1" ? 0 : 1;
    el.dataset.value = String(next);
    el.textContent = String(next);
    callback();
  });
}

let srQ = 0;
let dLatchQ = 0;
let srFfQ = 0;
let srFfClockCount = 0;
let jkQ = 0;
let jkClockCount = 0;
let dFfQ = 0;
let dFfClockCount = 0;

function renderSRLatch(){
  const S = Number($("#srS")?.dataset.value || 0);
  const R = Number($("#srR")?.dataset.value || 0);
  const prev = srQ;
  let next = prev;
  let status = "Hold";
  if(S === 0 && R === 1){ next = 0; status = "Reset"; }
  else if(S === 1 && R === 0){ next = 1; status = "Set"; }
  else if(S === 1 && R === 1){ status = "Invalid"; }
  srQ = next;
  $("#srPrevQ").textContent = prev;
  $("#srNextQ").textContent = next;
  $("#srNextQbar").textContent = S === 1 && R === 1 ? "—" : 1-next;
  $("#srStatus").textContent = status;
  $("#srStatus").className = status === "Invalid" ? "seq-invalid" : "";
}

function renderDLatch(){
  const D = Number($("#dLatchD")?.dataset.value || 0);
  const E = Number($("#dLatchE")?.dataset.value || 0);
  const prev = dLatchQ;
  if(E === 1) dLatchQ = D;
  $("#dPrevQ").textContent = prev;
  $("#dNextQ").textContent = dLatchQ;
  $("#dNextQbar").textContent = 1-dLatchQ;
  $("#dStatus").textContent = E === 1 ? "Transparent" : "Hold";
}

function renderClockedSR(){
  const S = Number($("#srFfS")?.dataset.value || 0);
  const R = Number($("#srFfR")?.dataset.value || 0);
  $("#srFfQ").textContent = srFfQ;
  $("#srFfQbar").textContent = 1 - srFfQ;
  $("#srFfClocks").textContent = srFfClockCount;
}

function clockedSR(){
  const S = Number($("#srFfS")?.dataset.value || 0);
  const R = Number($("#srFfR")?.dataset.value || 0);
  srFfClockCount++;
  if(S === 0 && R === 1){ srFfQ = 0; $("#srFfStatus").textContent = "Reset"; }
  else if(S === 1 && R === 0){ srFfQ = 1; $("#srFfStatus").textContent = "Set"; }
  else if(S === 0 && R === 0){ $("#srFfStatus").textContent = "No Change"; }
  else { $("#srFfStatus").textContent = "Not allowed"; }
  renderClockedSR();
}

function renderJK(){
  $("#jkQ").textContent = jkQ;
  $("#jkQbar").textContent = 1 - jkQ;
  $("#jkClocks").textContent = jkClockCount;
}

function clockJK(){
  const J = Number($("#jkJ")?.dataset.value || 0);
  const K = Number($("#jkK")?.dataset.value || 0);
  jkClockCount++;
  if(J === 0 && K === 0) $("#jkStatus").textContent = "No Change";
  else if(J === 0 && K === 1){ jkQ = 0; $("#jkStatus").textContent = "Reset"; }
  else if(J === 1 && K === 0){ jkQ = 1; $("#jkStatus").textContent = "Set"; }
  else { jkQ = 1 - jkQ; $("#jkStatus").textContent = "Toggle"; }
  renderJK();
}

function renderDFF(){
  $("#dFfQ").textContent = dFfQ;
  $("#dFfQbar").textContent = 1 - dFfQ;
  $("#dFfClocks").textContent = dFfClockCount;
}

function clockDFF(){
  const D = Number($("#dFfD")?.dataset.value || 0);
  dFfClockCount++;
  dFfQ = D;
  $("#dFfStatus").textContent = "Q = D";
  renderDFF();
}

let sequentialInitialized = false;
function initSequentialModule(){
  if(sequentialInitialized){ renderSRLatch(); renderDLatch(); renderClockedSR(); renderJK(); renderDFF(); return; }
  sequentialInitialized = true;
  toggleSeqButton("#srS", renderSRLatch);
  toggleSeqButton("#srR", renderSRLatch);
  toggleSeqButton("#dLatchD", renderDLatch);
  toggleSeqButton("#dLatchE", renderDLatch);
  toggleSeqButton("#srFfS", renderClockedSR);
  toggleSeqButton("#srFfR", renderClockedSR);
  toggleSeqButton("#jkJ", renderJK);
  toggleSeqButton("#jkK", renderJK);
  toggleSeqButton("#dFfD", renderDFF);
  $("#srFfClock")?.addEventListener("click", clockedSR);
  $("#jkClock")?.addEventListener("click", clockJK);
  $("#dFfClock")?.addEventListener("click", clockDFF);
  document.querySelectorAll("#srPracticeOptions button").forEach(btn => btn.addEventListener("click", () => {
    const fb = $("#srPracticeFeedback");
    fb.textContent = btn.dataset.answer === "1" ? "✓ Correct! S=1, R=0 sets Q to 1." : "✗ Try again. S=1 is Set and R=0 is not Reset.";
    fb.className = "practice-feedback " + (btn.dataset.answer === "1" ? "success" : "fail");
  }));
  renderSRLatch();
  renderDLatch();
}


/* ---------------- Module Page Navigation ---------------- */
const modulePageConfig = {
  "combinational-section": { defaultLabel: "Half Adder" },
  "sequential-section": { defaultLabel: "Overview" },
  "registers-section": { defaultLabel: "Overview" },
  "counters-section": { defaultLabel: "Overview" }
};
const modulePageState = {};

function getModulePages(sectionEl){
  if(!sectionEl) return [];
  const groups = [];
  sectionEl.querySelectorAll("[data-page-group]").forEach(el => {
    const group = el.dataset.pageGroup;
    if(group && !groups.includes(group)) groups.push(group);
  });
  return groups;
}

function showModulePage(sectionId, group, options = {}){
  const sectionEl = document.getElementById(sectionId);
  if(!sectionEl) return;
  const pages = getModulePages(sectionEl);
  if(!pages.length) return;
  const safeGroup = pages.includes(group) ? group : pages[0];
  const index = pages.indexOf(safeGroup);
  modulePageState[sectionId] = index;

  sectionEl.querySelectorAll("[data-page-group]").forEach(el => {
    const active = el.dataset.pageGroup === safeGroup;
    el.classList.toggle("lesson-page-hidden", !active);
    el.classList.toggle("lesson-page-active", active);
  });

  const bar = sectionEl.querySelector("[data-pagebar]");
  if(bar){
    const activeEls = Array.from(sectionEl.querySelectorAll("[data-page-group]")).filter(el => el.dataset.pageGroup === safeGroup);
    const label = activeEls[0]?.dataset.pageLabel || "Lesson";
    const current = bar.querySelector("[data-page-current]");
    const count = bar.querySelector("[data-page-count]");
    const prev = bar.querySelector("[data-page-prev]");
    const next = bar.querySelector("[data-page-next]");
    if(current) current.textContent = label;
    if(count) count.textContent = `${index + 1} / ${pages.length}`;
    if(prev) prev.disabled = index <= 0;
    if(next) next.disabled = index >= pages.length - 1;
  }

  if(options.scroll !== false){
    window.scrollTo({top:0, behavior: options.smooth === false ? "auto" : "smooth"});
  }
}

function setupModulePageNavigation(){
  Object.keys(modulePageConfig).forEach(sectionId => {
    const sectionEl = document.getElementById(sectionId);
    if(!sectionEl) return;
    const pages = getModulePages(sectionEl);
    if(!pages.length) return;
    showModulePage(sectionId, pages[0], {scroll:false});
    const bar = sectionEl.querySelector("[data-pagebar]");
    if(!bar) return;
    bar.querySelector("[data-page-prev]")?.addEventListener("click", () => {
      const idx = modulePageState[sectionId] ?? 0;
      const target = pages[Math.max(0, idx - 1)];
      showModulePage(sectionId, target);
    });
    bar.querySelector("[data-page-next]")?.addEventListener("click", () => {
      const idx = modulePageState[sectionId] ?? 0;
      const target = pages[Math.min(pages.length - 1, idx + 1)];
      showModulePage(sectionId, target);
    });
  });
}

function pageGroupFromTarget(section, target){
  if(!target) return null;
  const el = document.getElementById(target) || document.querySelector("." + target);
  return el?.dataset?.pageGroup || null;
}

function showSection(section, scrollTarget=null){
  hideAllSections();
  setActiveNav(section, scrollTarget);

  if(section === "home"){
    homeSection.classList.add("visible");
    window.scrollTo({top:0, behavior:"smooth"});
    return;
  }

  if(section === "number-systems"){
    numberSection.classList.add("visible");
    numberWorkspace.style.display = "block";
    numberOnlySections.forEach(el => el.style.display = "block");
    topbar.style.display = "flex";
    window.scrollTo({top:0, behavior:"smooth"});
    return;
  }

  if(section === "boolean"){
    booleanSection.classList.add("visible");
    evaluateBooleanModule();
  } else if(section === "gates"){
    gatesSection.classList.add("visible");
    renderGate();
  } else if(section === "gate-builder"){
    gateBuilderSection.classList.add("visible");
    renderGateBuilder();
  } else if(section === "combinational"){
    combinationalSection.classList.add("visible");
    renderHalfAdder();
    renderFullAdder();
    renderDecoder();
    const group = pageGroupFromTarget(section, scrollTarget) || getModulePages(combinationalSection)[0];
    showModulePage("combinational-section", group, {scroll:false});
  } else if(section === "sequential"){
    sequentialSection.classList.add("visible");
    initSequentialModule();
    const group = pageGroupFromTarget(section, scrollTarget) || getModulePages(sequentialSection)[0];
    showModulePage("sequential-section", group, {scroll:false});
  } else if(section === "registers"){
    registersSection.classList.add("visible");
    initRegistersModule();
    const group = pageGroupFromTarget(section, scrollTarget) || getModulePages(registersSection)[0];
    showModulePage("registers-section", group, {scroll:false});
  } else if(section === "counters"){
    countersSection.classList.add("visible");
    initCountersModule();
    const group = pageGroupFromTarget(section, scrollTarget) || getModulePages(countersSection)[0];
    showModulePage("counters-section", group, {scroll:false});
  } else if(section === "circuit-lab"){
    circuitLabSection.classList.add("visible");
    initCircuitLab();
  } else if(section === "circuit-builder"){
    circuitBuilderSection.classList.add("visible");
    initCircuitBuilder();
  }

  requestAnimationFrame(() => window.scrollTo({top:0, behavior:"smooth"}));
}

document.querySelectorAll(".nav-item[data-section]").forEach(item => {
  item.addEventListener("click", () => showSection(item.dataset.section));
});

document.querySelectorAll(".nav-subitem[data-section]").forEach(item => {
  item.addEventListener("click", () => {
    if(item.disabled) return;
    showSection(item.dataset.section, item.dataset.scrollTarget || null);
  });
});

document.querySelectorAll("[data-open-section]").forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.openSection));
});

setupModulePageNavigation();
showSection("home");
evaluateBooleanModule();

/* Boolean Simplification Lab */
const simplifyExpression = $("#simplifyExpression");
const simplifyButton = $("#simplifyBoolean");
const simplifyError = $("#simplifyError");
const simplifyResult = $("#simplifyResult");

function cloneNode(n) {
  return JSON.parse(JSON.stringify(n));
}
function isConst(n, v = null) { return n.type === "value" && (n.value === "0" || n.value === "1") && (v === null || n.value === String(v)); }
function isVar(n) { return n.type === "value" && /^[A-Z]$/.test(n.value); }
function sameNode(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function notNode(n) { return { type: "not", child: n }; }
function andNode(a,b) { return { type: "and", left:a, right:b }; }
function orNode(a,b) { return { type: "or", left:a, right:b }; }
function nodeText(n) {
  if (n.type === "value") return n.value;
  if (n.type === "not") {
    const inner = nodeText(n.child);
    return isVar(n.child) ? `${inner}'` : `(${inner})'`;
  }
  if (n.type === "and") {
    const l = n.left.type === "or" ? `(${nodeText(n.left)})` : nodeText(n.left);
    const r = n.right.type === "or" ? `(${nodeText(n.right)})` : nodeText(n.right);
    return `${l}${r}`;
  }
  return `${nodeText(n.left)} + ${nodeText(n.right)}`;
}
function flatten(n, type, out=[]) {
  if (n.type === type) { flatten(n.left, type, out); flatten(n.right, type, out); }
  else out.push(n);
  return out;
}
function literalKey(n) {
  if (isVar(n)) return n.value;
  if (n.type === "not" && isVar(n.child)) return `${n.child.value}'`;
  return null;
}
function termLiterals(n) {
  const factors = flatten(n, "and");
  const keys = factors.map(literalKey);
  return keys.every(Boolean) ? [...new Set(keys)] : null;
}
function makeLiteral(key) {
  return key.endsWith("'") ? notNode({type:"value", value:key[0]}) : {type:"value", value:key};
}
function makeAndTerm(keys) {
  return keys.map(makeLiteral).reduce((a,b)=>a?andNode(a,b):b,null);
}
function makeOrTerms(terms) {
  return terms.map(t=>t.node).reduce((a,b)=>a?orNode(a,b):b,null);
}

function dnfSimplify(root) {
  const terms = flatten(root, "or").map(n => ({ node:n, lits:termLiterals(n) }));
  if (terms.some(t => t.lits === null)) return null;
  if (terms.some(t => t.lits.includes("1"))) return {node:{type:"value",value:"1"}, changed:!isConst(root,1), rule:"Domination / identity"};
  const cleaned = [];
  for (const t of terms) {
    const s = new Set(t.lits);
    let contradiction = false;
    for (const k of s) {
      if (k.endsWith("'") ? s.has(k[0]) : s.has(`${k}'`)) { contradiction=true; break; }
    }
    if (!contradiction) cleaned.push([...s].sort());
  }
  if (!cleaned.length) return {node:{type:"value",value:"0"}, changed:true, rule:"Complement rule"};
  const unique = [];
  for (const t of cleaned) if (!unique.some(u=>u.join("|")===t.join("|"))) unique.push(t);
  let absorbed = unique.filter(t => !unique.some(u => u !== t && u.every(x=>t.includes(x))));
  // Consensus theorem: xy + x'z + yz = xy + x'z.
  let consensusRemoved = false;
  outer: for (let i=0;i<absorbed.length;i++) {
    for (let j=i+1;j<absorbed.length;j++) {
      const a=absorbed[i], b=absorbed[j];
      const common=a.filter(x=>b.includes(x));
      const da=a.filter(x=>!b.includes(x));
      const db=b.filter(x=>!a.includes(x));
      let compA=null, compB=null;
      for (const x of da) {
        const opposite = x.endsWith("'") ? x[0] : `${x}'`;
        if (db.includes(opposite)) { compA=x; compB=opposite; break; }
      }
      if (compA) {
        const consensusLits=[
          ...common,
          ...da.filter(x=>x!==compA),
          ...db.filter(x=>x!==compB)
        ].sort();
        const idx=absorbed.findIndex(t=>
          t.length===consensusLits.length && consensusLits.every(x=>t.includes(x))
        );
        if(idx>=0) {
          absorbed.splice(idx,1);
          consensusRemoved=true;
          break outer;
        }
      }
    }
  }
  const resultTerms=absorbed.map(lits=>({node:makeAndTerm(lits),lits}));
  const node=makeOrTerms(resultTerms);
  const changed=!sameNode(node,root);
  if (!changed) return null;
  return {node,changed:true,rule:consensusRemoved?"Consensus theorem":"Idempotent / absorption rule"};
}

function applyLocalBooleanRules(root) {
  function rec(n) {
    if (n.type === "not") {
      n.child=rec(n.child);
      if (n.child.type === "not") return rec(n.child.child);
      if (isConst(n.child,"0")) return {type:"value",value:"1"};
      if (isConst(n.child,"1")) return {type:"value",value:"0"};
      return n;
    }
    if (n.type === "and" || n.type === "or") {
      n.left=rec(n.left); n.right=rec(n.right);
      const a=n.left,b=n.right;
      if (n.type === "and") {
        if (isConst(a,"0")||isConst(b,"0")) return {type:"value",value:"0"};
        if (isConst(a,"1")) return b; if (isConst(b,"1")) return a;
        if (sameNode(a,b)) return a;
        if ((a.type==="not"&&sameNode(a.child,b))||(b.type==="not"&&sameNode(b.child,a))) return {type:"value",value:"0"};
        // x(x+y)=x
        for (const [x,y] of [[a,b],[b,a]]) {
          if (y.type==="or" && (sameNode(y.left,x)||sameNode(y.right,x))) return x;
        }
        // (x+y)(x+z)=x+yz
        if (a.type==="or" && b.type==="or") {
          const aa=flatten(a,"or"), bb=flatten(b,"or");
          for (const x of aa) for (const y of bb) {
            if (sameNode(x,y)) {
              const restA=aa.filter(z=>!sameNode(z,x));
              const restB=bb.filter(z=>!sameNode(z,x));
              if (restA.length===1 && restB.length===1) return orNode(x,andNode(restA[0],restB[0]));
            }
          }
        }
      } else {
        if (isConst(a,"1")||isConst(b,"1")) return {type:"value",value:"1"};
        if (isConst(a,"0")) return b; if (isConst(b,"0")) return a;
        if (sameNode(a,b)) return a;
        if ((a.type==="not"&&sameNode(a.child,b))||(b.type==="not"&&sameNode(b.child,a))) return {type:"value",value:"1"};
        // x + xy = x
        for (const [x,y] of [[a,b],[b,a]]) {
          if (y.type==="and" && flatten(y,"and").some(z=>sameNode(z,x))) return x;
        }
        // x + x'y = x+y
        for (const [x,y] of [[a,b],[b,a]]) {
          if (y.type==="and") {
            const fs=flatten(y,"and");
            const nx=fs.find(z=>z.type==="not"&&sameNode(z.child,x));
            if(nx) {
              const rest=fs.filter(z=>z!==nx);
              if(rest.length===1) return orNode(x,rest[0]);
            }
          }
        }
      }
    }
    return n;
  }
  return rec(cloneNode(root));
}

function simplifyBooleanExpression(expr) {
  let current=parseBoolean(expr);
  const steps=[{node:cloneNode(current), rule:"Original expression"}];
  for(let i=0;i<12;i++) {
    let next=applyLocalBooleanRules(current);
    if(!sameNode(next,current)) { current=next; steps.push({node:cloneNode(current),rule:"Boolean algebra rule"}); continue; }
    const dnf=dnfSimplify(current);
    if(dnf && !sameNode(dnf.node,current)) { current=dnf.node; steps.push({node:cloneNode(current),rule:dnf.rule}); continue; }
    break;
  }
  // Give more specific labels for common lecture transformations.
  for(let i=1;i<steps.length;i++) {
    const prev=nodeText(steps[i-1].node), cur=nodeText(steps[i].node);
    if (/^A \+ AB$/.test(prev) && cur==="A") steps[i].rule="Absorption: A + AB = A";
    else if (/^A \+ A'B$/.test(prev) && cur==="A + B") steps[i].rule="Reduction: A + A'B = A + B";
    else if (/^\(A \+ B\)\(A \+ C\)$/.test(prev) && cur==="A + BC") steps[i].rule="Distributive reduction: (A+B)(A+C) = A+BC";
    else if (/AB \+ A'C \+ BC/.test(prev) && cur==="AB + A'C") steps[i].rule="Consensus theorem";
  }
  return steps;
}

function renderSimplification() {
  try {
    const expr=simplifyExpression.value;
    const steps=simplifyBooleanExpression(expr);
    simplifyError.textContent="";
    const finalText=nodeText(steps[steps.length-1].node);
    simplifyResult.innerHTML=`
      <div class="simplify-final">Simplified: ${finalText}</div>
      <div class="simplify-steps">
        ${steps.map((s,i)=>`<div class="simplify-step"><span class="step-no">${i+1}</span><span class="step-expression">${nodeText(s.node)}</span><span class="step-rule">${s.rule}</span></div>`).join("")}
      </div>`;
  } catch(e) {
    simplifyError.textContent=e.message;
    simplifyResult.innerHTML='<div class="structure-placeholder">Fix the expression to see the simplification steps.</div>';
  }
}

simplifyButton.addEventListener("click", renderSimplification);
simplifyExpression.addEventListener("keydown", e => { if(e.key==="Enter") renderSimplification(); });
renderSimplification();

/* SOP / POS + De Morgan Module */
const formsExpression = $("#formsExpression");
const generateForms = $("#generateForms");
const formsError = $("#formsError");
const formsResult = $("#formsResult");
const demorganExpression = $("#demorganExpression");
const applyDeMorgan = $("#applyDeMorgan");
const demorganError = $("#demorganError");
const demorganResult = $("#demorganResult");

function literalText(v, bit, mode) {
  if (mode === "min") return bit ? v : `${v}'`;
  return bit ? `${v}'` : v;
}
function canonicalMinterm(vars, bits) {
  return bits.map((b,i)=>literalText(vars[i],b,"min")).join("");
}
function canonicalMaxterm(vars, bits) {
  return `(${bits.map((b,i)=>literalText(vars[i],b,"max")).join(" + ")})`;
}
function generateCanonicalForms(expr) {
  const tree = parseBoolean(expr);
  const vars = variablesFromTree(tree);
  if (!vars.length) {
    const value = evalTree(tree, {});
    return {vars, rows:[{bits:[],out:value}], sop:String(value), pos:String(value)};
  }
  if (vars.length > 8) throw new Error("Maximum supported variables in this module is 8.");
  const rows=[];
  const ones=[]; const zeros=[];
  const count=2**vars.length;
  for(let n=0;n<count;n++) {
    const bits=vars.map((v,i)=>(n >> (vars.length-i-1)) & 1);
    const assignment={}; vars.forEach((v,i)=>assignment[v]=bits[i]);
    const out=evalTree(tree,assignment);
    rows.push({bits,out});
    (out?ones:zeros).push(n);
  }
  const sop = ones.length ? ones.map(n=>canonicalMinterm(vars, rows[n].bits)).join(" + ") : "0";
  const pos = zeros.length ? zeros.map(n=>canonicalMaxterm(vars, rows[n].bits)).join("") : "1";
  return {vars,rows,sop,pos,ones,zeros};
}
function renderForms() {
  try {
    const data=generateCanonicalForms(formsExpression.value);
    formsError.textContent="";
    if(!data.vars.length) {
      formsResult.innerHTML=`<div class="form-block"><span class="form-label">Constant function</span><span class="form-expression">F = ${data.rows[0].out}</span></div>`;
      return;
    }
    formsResult.innerHTML=`
      <div class="form-block">
        <span class="form-label">Canonical SOP — Sum of Products</span>
        <span class="form-expression">F = ${data.sop}</span>
        <div class="form-meta">Minterms: Σm(${data.ones.join(", ")})</div>
      </div>
      <div class="form-block">
        <span class="form-label">Canonical POS — Product of Sums</span>
        <span class="form-expression">F = ${data.pos}</span>
        <div class="form-meta">Maxterms: ΠM(${data.zeros.join(", ")})</div>
      </div>`;
  } catch(e) {
    formsError.textContent=e.message;
    formsResult.innerHTML='<div class="structure-placeholder">Fix the expression to generate SOP/POS.</div>';
  }
}

generateForms.addEventListener("click",renderForms);
formsExpression.addEventListener("keydown",e=>{if(e.key==="Enter")renderForms();});

function deMorganTransform(root, steps=[]) {
  function walk(n) {
    if(n.type==="not") {
      n.child=walk(n.child);
      if(n.child.type==="not") {
        steps.push({node:cloneNode(n.child.child),rule:"Double negation: (X')' = X"});
        return cloneNode(n.child.child);
      }
      if(n.child.type==="or") {
        const a=notNode(cloneNode(n.child.left));
        const b=notNode(cloneNode(n.child.right));
        const result=andNode(a,b);
        steps.push({node:cloneNode(result),rule:"De Morgan: (A + B)' = A'B'"});
        return walk(result);
      }
      if(n.child.type==="and") {
        const a=notNode(cloneNode(n.child.left));
        const b=notNode(cloneNode(n.child.right));
        const result=orNode(a,b);
        steps.push({node:cloneNode(result),rule:"De Morgan: (AB)' = A' + B'"});
        return walk(result);
      }
      return n;
    }
    if(n.type==="and" || n.type==="or") {
      n.left=walk(n.left); n.right=walk(n.right);
    }
    return n;
  }
  const out=walk(cloneNode(root));
  return out;
}
function renderDeMorgan() {
  try {
    const tree=parseBoolean(demorganExpression.value);
    const steps=[{node:cloneNode(tree),rule:"Original expression"}];
    const finalTree=deMorganTransform(tree,steps);
    if(!sameNode(steps[steps.length-1].node,finalTree)) steps.push({node:cloneNode(finalTree),rule:"Result"});
    demorganError.textContent="";
    demorganResult.innerHTML=`<div class="simplify-steps">${steps.map((s,i)=>`<div class="demorgan-step"><span class="step-no">${i+1}</span><span class="step-expression">${nodeText(s.node)}</span><span class="demorgan-rule">${s.rule}</span></div>`).join("")}</div>`;
  } catch(e) {
    demorganError.textContent=e.message;
    demorganResult.innerHTML='<div class="structure-placeholder">Fix the expression to apply De Morgan transformations.</div>';
  }
}
applyDeMorgan.addEventListener("click",renderDeMorgan);
demorganExpression.addEventListener("keydown",e=>{if(e.key==="Enter")renderDeMorgan();});
renderForms();
renderDeMorgan();


/* Logic Gates Module */
const gateSelect = $("#gateSelect");
const gateA = $("#gateA");
const gateB = $("#gateB");
const gateBWrap = $("#gateBWrap");
const wireBWrap = $("#wireBWrap");
const wireA = $("#wireA");
const wireB = $("#wireB");
const gateOutput = $("#gateOutput");
const gateShape = $("#gateShape");
const gateName = $("#gateName");
const gateFormula = $("#gateFormula");
const gateMeaning = $("#gateMeaning");
const gateTruthTitle = $("#gateTruthTitle");
const gateTruthTable = $("#gateTruthTable");
const gatePracticeQuestion = $("#gatePracticeQuestion");
const gatePracticeFeedback = $("#gatePracticeFeedback");

const gateInfo = {
  AND:{formula:"F = A · B",meaning:"Output is 1 only when both inputs are 1."},
  OR:{formula:"F = A + B",meaning:"Output is 1 when at least one input is 1."},
  NOT:{formula:"F = A'",meaning:"The inverter changes 0 to 1 and 1 to 0."},
  NAND:{formula:"F = (A · B)'",meaning:"NAND is the inverse of AND."},
  NOR:{formula:"F = (A + B)'",meaning:"NOR is the inverse of OR."},
  XOR:{formula:"F = A ⊕ B",meaning:"Output is 1 when the two inputs are different."},
  XNOR:{formula:"F = A ⊙ B",meaning:"Output is 1 when the two inputs are the same."}
};

function gateEval(type,a,b){
  if(type==='AND') return a & b;
  if(type==='OR') return a | b;
  if(type==='NOT') return a ? 0 : 1;
  if(type==='NAND') return (a & b) ? 0 : 1;
  if(type==='NOR') return (a | b) ? 0 : 1;
  if(type==='XOR') return a ^ b;
  return (a === b) ? 1 : 0;
}
function setBit(btn){
  const next=btn.dataset.value==='0'?'1':'0';
  btn.dataset.value=next; btn.textContent=next;
  btn.classList.toggle('is-one',next==='1');
}
function renderGate(){
  const type=gateSelect.value; const a=Number(gateA.dataset.value); const b=Number(gateB.dataset.value);
  const info=gateInfo[type]; const out=gateEval(type,a,b);
  const isNot=type==='NOT';
  gateBWrap.style.display=isNot?'none':''; wireBWrap.style.display=isNot?'none':'';
  wireA.textContent=a; wireB.textContent=b; gateOutput.textContent=out; gateName.textContent=type;
  gateFormula.textContent=info.formula; gateMeaning.textContent=info.meaning; gateTruthTitle.textContent=type;
  gateShape.className='gate-shape gate-'+type.toLowerCase();
  renderGateTruth(type);
  gatePracticeQuestion.textContent = type==='NOT' ? 'For NOT: A = 0. What is F?' : `For ${type}: A = 1, B = 0. What is F?`;
  gatePracticeFeedback.textContent=''; gatePracticeFeedback.className='practice-feedback';
}
function renderGateTruth(type){
  const rows=type==='NOT'?[[0,gateEval(type,0,0)],[1,gateEval(type,1,0)]]:[[0,0,gateEval(type,0,0)],[0,1,gateEval(type,0,1)],[1,0,gateEval(type,1,0)],[1,1,gateEval(type,1,1)]];
  gateTruthTable.innerHTML=type==='NOT'
    ? `<div class="gate-row gate-head"><span>A</span><span>F</span></div>${rows.map(r=>`<div class="gate-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}`
    : `<div class="gate-row gate-head"><span>A</span><span>B</span><span>F</span></div>${rows.map(r=>`<div class="gate-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}`;
}
gateA.addEventListener('click',()=>{setBit(gateA);renderGate();});
gateB.addEventListener('click',()=>{setBit(gateB);renderGate();});
gateSelect.addEventListener('change',renderGate);
document.querySelectorAll('#gatePracticeOptions button').forEach(btn=>btn.addEventListener('click',()=>{
  const type=gateSelect.value; const expected=type==='NOT'?gateEval(type,0,0):gateEval(type,1,0);
  const ok=Number(btn.dataset.answer)===expected; gatePracticeFeedback.textContent=ok?'✓ Correct!':'✗ Try again. Check the truth table.';
  gatePracticeFeedback.className='practice-feedback '+(ok?'success':'fail');
}));
renderGate();
/* Boolean Expression -> Logic Gates Module */
const gateBuilderExpression = $("#gateBuilderExpression");
const gateBuilderError = $("#gateBuilderError");
const gateBuilderFormula = $("#gateBuilderFormula");
const gateBuilderDiagram = $("#gateBuilderDiagram");
const gateBuilderSteps = $("#gateBuilderSteps");
const gateBuilderTruth = $("#gateBuilderTruth");

function gateNodeLabel(n){
  if(n.type === "value") return n.value;
  if(n.type === "not") return "NOT";
  if(n.type === "and") return "AND";
  if(n.type === "or") return "OR";
  return "?";
}

function gateNodeTree(n){
  if(n.type === "value") {
    return `<div class="gb-node"><div class="gb-input">${n.value}</div></div>`;
  }
  if(n.type === "not") {
    return `<div class="gb-node"><div class="gb-children"><div>${gateNodeTree(n.child)}</div><div class="gb-connector"></div><div class="gb-gate not">NOT</div></div></div>`;
  }
  const cls=n.type === "and" ? "and" : "or";
  return `<div class="gb-node"><div class="gb-children"><div>${gateNodeTree(n.left)}</div><div class="gb-connector"></div><div class="gb-gate ${cls}">${n.type.toUpperCase()}</div><div class="gb-connector"></div><div>${gateNodeTree(n.right)}</div></div></div>`;
}

function collectGateSteps(n, steps=[]){
  if(n.type === "value") return steps;
  if(n.type === "not") {
    collectGateSteps(n.child, steps);
  } else {
    collectGateSteps(n.left, steps);
    collectGateSteps(n.right, steps);
  }
  const inputText = n.type === "not"
    ? nodeText(n.child)
    : `${nodeText(n.left)} , ${nodeText(n.right)}`;
  steps.push(`${gateNodeLabel(n)} gate: ${inputText} → ${nodeText(n)}`);
  return steps;
}

function renderBuilderTruth(root, vars){
  const rows=[];
  const count=2 ** vars.length;
  for(let i=0;i<count;i++){
    const env={};
    vars.forEach((v,j)=>env[v]=(i >> (vars.length-j-1)) & 1);
    rows.push([...vars.map(v=>env[v]), evalTree(root,env)]);
  }
  const cols=vars.length+1;
  gateBuilderTruth.innerHTML = `<div class="gb-truth">` +
    `<div class="gb-truth-row gb-truth-head" style="--cols:${cols}">${vars.map(v=>`<span>${v}</span>`).join("")}<span>F</span></div>` +
    rows.map(r=>`<div class="gb-truth-row" style="--cols:${cols}">${r.map(x=>`<span>${x}</span>`).join("")}</div>`).join("") +
    `</div>`;
}

function renderGateBuilder(){
  try {
    const expr=gateBuilderExpression.value.trim();
    if(!expr) throw new Error("Enter a Boolean expression first.");
    const root=parseBoolean(expr);
    const vars=variablesFromTree(root);
    if(vars.length>8) throw new Error("Use up to 8 variables for the truth table.");

    gateBuilderError.textContent="";
    gateBuilderFormula.textContent=`F = ${nodeText(root)}`;
    gateBuilderDiagram.innerHTML=`<div class="gb-tree"><div>${gateNodeTree(root)}</div><div class="gb-connector"></div><div class="gb-gate">OUTPUT</div></div>`;

    const steps=collectGateSteps(root);
    gateBuilderSteps.innerHTML=steps.length
      ? steps.map((x,i)=>`<div class="gb-step"><span class="gb-step-no">${i+1}</span><span class="gb-step-text">${x}</span></div>`).join("")
      : '<div class="gb-empty">This expression is a single input, so no gate is required.</div>';

    renderBuilderTruth(root,vars);
  } catch(e) {
    gateBuilderError.textContent=e.message;
    gateBuilderDiagram.innerHTML='<div class="gb-empty">Fix the expression to build the gate structure.</div>';
    gateBuilderSteps.innerHTML="";
    gateBuilderTruth.innerHTML="";
  }
}

$("#buildGateCircuit").addEventListener("click", renderGateBuilder);
gateBuilderExpression.addEventListener("keydown", e => {
  if(e.key === "Enter") renderGateBuilder();
});
renderGateBuilder();


/* 4:1 Multiplexer */
const mux4D0 = $("#mux4D0"), mux4D1 = $("#mux4D1"), mux4D2 = $("#mux4D2"), mux4D3 = $("#mux4D3");
const mux4S1 = $("#mux4S1"), mux4S0 = $("#mux4S0");
const mux4StageA = $("#mux4StageA"), mux4StageB = $("#mux4StageB"), mux4Output = $("#mux4Output"), mux4SelectionText = $("#mux4SelectionText");
const mux4PracticeFeedback = $("#mux4PracticeFeedback");
function renderMux4(){
  const d0=Number(mux4D0.dataset.value), d1=Number(mux4D1.dataset.value), d2=Number(mux4D2.dataset.value), d3=Number(mux4D3.dataset.value);
  const s1=Number(mux4S1.dataset.value), s0=Number(mux4S0.dataset.value);
  const first = s0===0 ? d0 : d1;
  const second = s0===0 ? d2 : d3;
  const y = s1===0 ? first : second;
  [[mux4D0,d0],[mux4D1,d1],[mux4D2,d2],[mux4D3,d3],[mux4S1,s1],[mux4S0,s0]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  mux4StageA.textContent=first; mux4StageB.textContent=second; mux4Output.textContent=y;
  const selected = (s1*2+s0); mux4SelectionText.textContent=`D${selected}`;
}
[mux4D0,mux4D1,mux4D2,mux4D3,mux4S1,mux4S0].forEach(el=>el.addEventListener("click",()=>{setBit(el);renderMux4();}));
document.querySelectorAll("#mux4PracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok=btn.dataset.answer==="D2";
  mux4PracticeFeedback.textContent=ok?"✓ Correct! S1S0 = 10 selects D2.":"✗ Not quite. The select code 10 points to D2.";
  mux4PracticeFeedback.className="practice-feedback "+(ok?"success":"fail");
}));
renderMux4();

/* 2-to-4 Decoder */
const decA1 = $("#decA1"), decA0 = $("#decA0");
const decD0 = $("#decD0"), decD1 = $("#decD1"), decD2 = $("#decD2"), decD3 = $("#decD3");
const decWireA1 = $("#decWireA1"), decWireA0 = $("#decWireA0");
const decD0Diagram = $("#decD0Diagram"), decD1Diagram = $("#decD1Diagram"), decD2Diagram = $("#decD2Diagram"), decD3Diagram = $("#decD3Diagram");
const decoderPracticeFeedback = $("#decoderPracticeFeedback");
function renderDecoder(){
  const a1=Number(decA1.dataset.value), a0=Number(decA0.dataset.value);
  const d0=(a1===0 && a0===0)?1:0;
  const d1=(a1===0 && a0===1)?1:0;
  const d2=(a1===1 && a0===0)?1:0;
  const d3=(a1===1 && a0===1)?1:0;
  [[decA1,a1],[decA0,a0]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  decWireA1.textContent=a1; decWireA0.textContent=a0;
  [[decD0,d0],[decD1,d1],[decD2,d2],[decD3,d3],[decD0Diagram,d0],[decD1Diagram,d1],[decD2Diagram,d2],[decD3Diagram,d3]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
}
[decA1,decA0].forEach(el=>el.addEventListener("click",()=>{setBit(el);renderDecoder();}));
document.querySelectorAll("#decoderPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok=btn.dataset.answer==="D2";
  decoderPracticeFeedback.textContent=ok?"✓ Correct! A1A0 = 10 activates D2.":"✗ Not quite. The input combination 10 activates D2.";
  decoderPracticeFeedback.className="practice-feedback "+(ok?"success":"fail");
}));
renderDecoder();

/* 4-to-2 Encoder */
const encD0 = $("#encD0"), encD1 = $("#encD1"), encD2 = $("#encD2"), encD3 = $("#encD3");
const encA1 = $("#encA1"), encA0 = $("#encA0"), encCode = $("#encCode");
const encWireD0 = $("#encWireD0"), encWireD1 = $("#encWireD1"), encWireD2 = $("#encWireD2"), encWireD3 = $("#encWireD3");
const encoderPracticeFeedback = $("#encoderPracticeFeedback");
function renderEncoder(){
  const d0=Number(encD0.dataset.value), d1=Number(encD1.dataset.value), d2=Number(encD2.dataset.value), d3=Number(encD3.dataset.value);
  const a0=(d1||d3)?1:0;
  const a1=(d2||d3)?1:0;
  [[encD0,d0],[encD1,d1],[encD2,d2],[encD3,d3]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  [[encWireD0,d0],[encWireD1,d1],[encWireD2,d2],[encWireD3,d3]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  [[encA1,a1],[encA0,a0]].forEach(([el,v])=>{el.textContent=v;el.classList.toggle("is-one",v===1);});
  encCode.textContent=`${a1}${a0}`;
}
[encD0,encD1,encD2,encD3].forEach(el=>el.addEventListener("click",()=>{
  [encD0,encD1,encD2,encD3].forEach(x=>{x.dataset.value="0";});
  el.dataset.value="1";
  renderEncoder();
}));
document.querySelectorAll("#encoderPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
  const ok=btn.dataset.answer==="10";
  encoderPracticeFeedback.textContent=ok?"✓ Correct! D2 active gives binary output 10.":"✗ Not quite. D2 corresponds to binary 10.";
  encoderPracticeFeedback.className="practice-feedback "+(ok?"success":"fail");
}));
renderEncoder();


/* Registers — Stage 4.3 */
let registersInitialized = false;
let registerQ = [0,0,0,0];
let registerClockCount = 0;
let shiftQ = [0,0,0,0];
let shiftCount = 0;

function bitValue(id){ return Number($(id)?.dataset.value || 0); }
function renderRegisterInputs(){
  const ids=["#regD3","#regD2","#regD1","#regD0","#regLoad"];
  ids.forEach(id=>{ const el=$(id); if(el){ const v=bitValue(id); el.textContent=v; el.classList.toggle("is-one",v===1); }});
  const input=[bitValue("#regD3"),bitValue("#regD2"),bitValue("#regD1"),bitValue("#regD0")].join("");
  $("#regInputValue").textContent=input;
}
function renderRegister(){
  renderRegisterInputs();
  $("#regOutputValue").textContent=registerQ.join("");
  $("#regClockCount").textContent=registerClockCount;
}
function clockParallelRegister(){
  registerClockCount++;
  if(bitValue("#regLoad")===1){
    registerQ=[bitValue("#regD3"),bitValue("#regD2"),bitValue("#regD1"),bitValue("#regD0")];
    $("#regStatus").textContent="Loaded D inputs";
  } else {
    $("#regStatus").textContent="Hold — Load = 0";
  }
  renderRegister();
}
function renderShift(){
  ["#shiftQ3","#shiftQ2","#shiftQ1","#shiftQ0"].forEach((id,i)=>$(id).textContent=shiftQ[i]);
  $("#shiftValue").textContent=shiftQ.join("");
  $("#shiftCount").textContent=shiftCount;
  const el=$("#shiftInput"); const v=bitValue("#shiftInput"); el.textContent=v; el.classList.toggle("is-one",v===1);
}
function shiftClock(){
  const serial=bitValue("#shiftInput");
  shiftQ=[serial,shiftQ[0],shiftQ[1],shiftQ[2]];
  shiftCount++;
  $("#shiftStatus").textContent=`Shifted serial bit ${serial}`;
  renderShift();
}
function resetShift(){ shiftQ=[0,0,0,0]; shiftCount=0; $("#shiftStatus").textContent="Reset to 0000"; renderShift(); }
function initRegistersModule(){
  if(registersInitialized){ renderRegister(); renderShift(); return; }
  registersInitialized=true;
  ["#regD3","#regD2","#regD1","#regD0","#regLoad","#shiftInput"].forEach(id=>{
    $(id)?.addEventListener("click",()=>{ setBit($(id)); renderRegister(); renderShift(); });
  });
  $("#regClock")?.addEventListener("click",clockParallelRegister);
  $("#shiftClock")?.addEventListener("click",shiftClock);
  $("#shiftReset")?.addEventListener("click",resetShift);
  document.querySelectorAll("#registerPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
    const ok=btn.dataset.answer==="hold";
    const fb=$("#registerPracticeFeedback");
    fb.textContent=ok?"✓ Correct! Load = 0 means the previous register values are retained.":"✗ Not quite. Parallel loading occurs when Load = 1 at the clock pulse.";
    fb.className="practice-feedback "+(ok?"success":"fail");
  }));
  renderRegister(); renderShift();
}

/* Counters — Stage 5 */
let countersInitialized = false;
let rippleState = 0, rippleClocks = 0;
let syncState = 0, syncClocks = 0;
let upDownState = 0, upDownClocks = 0;
let modState = 0, modClocks = 0;

function threeBit(n){ return n.toString(2).padStart(3,"0"); }
function renderCounters(){
  $("#rippleValue").textContent=threeBit(rippleState); $("#rippleDecimal").textContent=rippleState; $("#rippleCount").textContent=rippleClocks;
  $("#syncValue").textContent=threeBit(syncState); $("#syncDecimal").textContent=syncState; $("#syncCount").textContent=syncClocks;
  const dir=bitValue("#counterDirection");
  $("#counterDirection").textContent=dir?"UP":"DOWN"; $("#upDownDirectionLabel").textContent=dir?"UP":"DOWN";
  $("#upDownValue").textContent=threeBit(upDownState); $("#upDownDecimal").textContent=upDownState; $("#upDownCount").textContent=upDownClocks;
  $("#modValue").textContent=modState; $("#modCount").textContent=modClocks;
  const seq=[]; for(let i=0;i<8;i++) seq.push(`<span class="${i===rippleState?'current':''}">${threeBit(i)}</span>`); $("#rippleSequence").innerHTML=seq.join('<i>→</i>');
}
function clockRipple(){ rippleState=(rippleState+1)%8; rippleClocks++; $("#rippleStatus").textContent=`State advanced to ${threeBit(rippleState)}`; renderCounters(); }
function resetRipple(){ rippleState=0; rippleClocks=0; $("#rippleStatus").textContent="Reset to 000"; renderCounters(); }
function clockSync(){ syncState=(syncState+1)%8; syncClocks++; $("#syncStatus").textContent=`All stages advanced to ${threeBit(syncState)}`; renderCounters(); }
function resetSync(){ syncState=0; syncClocks=0; $("#syncStatus").textContent="Reset to 000"; renderCounters(); }
function clockUpDown(){ const up=bitValue("#counterDirection"); upDownState=up?(upDownState+1)%8:(upDownState+7)%8; upDownClocks++; renderCounters(); }
function resetUpDown(){ upDownState=0; upDownClocks=0; renderCounters(); }
function clockMod(){ modState=(modState+1)%10; modClocks++; $("#modStatus").textContent=`State = ${modState}`; renderCounters(); }
function resetMod(){ modState=0; modClocks=0; $("#modStatus").textContent="Reset to 0"; renderCounters(); }
function initCountersModule(){
  if(countersInitialized){ renderCounters(); return; }
  countersInitialized=true;
  $("#rippleClock")?.addEventListener("click",clockRipple); $("#rippleReset")?.addEventListener("click",resetRipple);
  $("#syncClock")?.addEventListener("click",clockSync); $("#syncReset")?.addEventListener("click",resetSync);
  $("#counterDirection")?.addEventListener("click",()=>{ setBit($("#counterDirection")); renderCounters(); });
  $("#upDownClock")?.addEventListener("click",clockUpDown); $("#upDownReset")?.addEventListener("click",resetUpDown);
  $("#modClock")?.addEventListener("click",clockMod); $("#modReset")?.addEventListener("click",resetMod);
  document.querySelectorAll("#counterPracticeOptions button").forEach(btn=>btn.addEventListener("click",()=>{
    const ok=btn.dataset.answer==="111", fb=$("#counterPracticeFeedback");
    fb.textContent=ok?"✓ Correct! 110 + 1 = 111.":"✗ Not quite. The next state after 110 is 111.";
    fb.className="practice-feedback "+(ok?"success":"fail");
  }));
  renderCounters();
}

/* Visual Circuit Lab — integrated Gate → D Flip-Flop → Register path */
let circuitLabInitialized = false;
let labA = 0, labB = 0, labDffQ = 0, labRegQ = [0,0,0,0];
function renderCircuitLab(){
  const andOut = labA & labB;
  $("#labAValue").textContent=labA; $("#labBValue").textContent=labB;
  $("#labAValue").classList.toggle("is-one",labA===1); $("#labBValue").classList.toggle("is-one",labB===1);
  $("#labAndValue").textContent=andOut; $("#labAndState").textContent=andOut;
  $("#labDffValue").textContent=labDffQ; $("#labDffState").textContent=labDffQ;
  const reg=labRegQ.join(""); $("#labRegValue").textContent=reg; $("#labRegState").textContent=reg; $("#labOutValue").textContent=reg;
  const wires={wireA:labA,wireB:labB,wireAndD:andOut,wireDffReg:labDffQ,wireRegOut:labRegQ.some(Boolean)};
  Object.entries(wires).forEach(([id,on])=>$("#"+id)?.classList.toggle("active",!!on));
  document.querySelectorAll(".output-lights i").forEach((el,i)=>el.classList.toggle("on",labRegQ[i]===1));
  $("#labInputA").textContent=`A = ${labA}`; $("#labInputB").textContent=`B = ${labB}`;
}
function initCircuitLab(){
  if(circuitLabInitialized){renderCircuitLab();return;}
  circuitLabInitialized=true;
  $("#labInputA")?.addEventListener("click",()=>{labA=labA?0:1;renderCircuitLab();$("#labStatus").textContent=`A changed to ${labA}`;});
  $("#labInputB")?.addEventListener("click",()=>{labB=labB?0:1;renderCircuitLab();$("#labStatus").textContent=`B changed to ${labB}`;});
  $("#labDffClock")?.addEventListener("click",()=>{labDffQ=labA&labB;renderCircuitLab();$("#labStatus").textContent=`D Flip-Flop captured D = ${labDffQ}`;});
  $("#labRegClock")?.addEventListener("click",()=>{labRegQ=[0,0,0,labDffQ];renderCircuitLab();$("#labStatus").textContent=`Register stored ${labRegQ.join("")}`;});
  $("#labReset")?.addEventListener("click",()=>{labA=0;labB=0;labDffQ=0;labRegQ=[0,0,0,0];$("#labStatus").textContent="Circuit reset";renderCircuitLab();});
  renderCircuitLab();
}

/* Interactive Circuit Builder */
let builderInitialized = false;
let builderId = 0;
let builderComponents = [];
let builderConnections = [];
let builderSelected = null;
let builderPendingSource = null;
let builderSelectedWire = null;
let builderClockCount = 0;

const builderDefs = {
  INPUT:{label:"INPUT", kind:"SOURCE", inputs:0, outputs:1},
  AND:{label:"AND", kind:"GATE", inputs:2, outputs:1},
  OR:{label:"OR", kind:"GATE", inputs:2, outputs:1},
  NOT:{label:"NOT", kind:"GATE", inputs:1, outputs:1},
  XOR:{label:"XOR", kind:"GATE", inputs:2, outputs:1},
  NAND:{label:"NAND", kind:"GATE", inputs:2, outputs:1},
  NOR:{label:"NOR", kind:"GATE", inputs:2, outputs:1},
  XNOR:{label:"XNOR", kind:"GATE", inputs:2, outputs:1},
  DFF:{label:"D FLIP-FLOP", kind:"MEMORY", inputs:1, outputs:1},
  JKFF:{label:"JK FLIP-FLOP", kind:"MEMORY", inputs:2, outputs:1},
  REG:{label:"4-BIT REGISTER", kind:"STORAGE", inputs:4, outputs:4},
  OUTPUT:{label:"OUTPUT", kind:"OUTPUT", inputs:1, outputs:0}
};
function builderPortKey(id,index){return id+":"+index;}
function builderGet(id){return builderComponents.find(c=>c.id===id);}
function builderValueText(c){
  if(c.type==="REG") return (c.stateBits||[0,0,0,0]).join("");
  return String(c.value||0);
}
function builderPortHTML(c){
  const d=builderDefs[c.type]; let h="";
  for(let i=0;i<d.inputs;i++) h+=`<button class="builder-port input-port" data-port="in" data-index="${i}" title="Input ${i+1}"></button>`;
  for(let i=0;i<d.outputs;i++) h+=`<button class="builder-port output-port" data-port="out" data-index="${i}" title="Output ${i+1}"></button>`;
  return h;
}
function builderAdd(type){
  const d=builderDefs[type];
  const n=builderComponents.length;
  const c={id:`c${++builderId}`,type,x:60+(n%4)*210,y:55+Math.floor(n/4)*145,value:0,state:0,stateBits:[0,0,0,0],prevClock:0};
  if(type==="INPUT") c.value=0;
  builderComponents.push(c);
  renderBuilder();
  selectBuilderComponent(c.id);
}
function renderBuilder(){
  const canvas=$("#builderCanvas"), svg=$("#builderWires"), empty=$("#builderEmpty");
  if(!canvas||!svg) return;
  canvas.querySelectorAll(".builder-node").forEach(e=>e.remove());
  if(empty) empty.style.display=builderComponents.length?"none":"grid";
  builderComponents.forEach(c=>{
    const d=builderDefs[c.type], node=document.createElement("div");
    node.className="builder-node"+(builderSelected===c.id?" selected":""); node.dataset.id=c.id;
    node.style.left=c.x+"px"; node.style.top=c.y+"px";
    node.innerHTML=`<span class="builder-kind">${d.kind}</span><strong>${d.label}</strong><span class="builder-node-value">${builderValueText(c)}</span>${c.type==="INPUT"?`<button class="builder-bit" data-action="toggle-input">0</button>`:""}${builderPortHTML(c)}`;
    canvas.appendChild(node);
  });
  drawBuilderWires();
  $("#builderConnections").textContent=builderConnections.length;
  $("#builderSelected").textContent=builderSelected?(builderGet(builderSelected)?.type||"None"):"None";
}
function portPoint(c,dir,index){
  const d=builderDefs[c.type];
  const count=dir==="in"?d.inputs:d.outputs;
  const nodeW=150;
  const y=c.y+62+(index-(count-1)/2)*22;
  return {x:c.x+(dir==="in"?0:nodeW),y};
}
function drawBuilderWires(){
  const svg=$("#builderWires"); if(!svg) return;
  svg.innerHTML="";
  builderConnections.forEach((conn,i)=>{
    const a=builderGet(conn.fromId), b=builderGet(conn.toId); if(!a||!b)return;
    const p1=portPoint(a,"out",conn.fromIndex),p2=portPoint(b,"in",conn.toIndex);
    const dx=Math.max(40,Math.abs(p2.x-p1.x)*0.45);
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",`M ${p1.x} ${p1.y} C ${p1.x+dx} ${p1.y}, ${p2.x-dx} ${p2.y}, ${p2.x} ${p2.y}`);
    path.setAttribute("class","builder-wire"+(conn.active?" active":"")+(builderSelectedWire===i?" selected":"")); path.dataset.index=i; svg.appendChild(path);
  });
}
function selectBuilderComponent(id){builderSelected=id; builderSelectedWire=null; renderBuilder();}
function selectBuilderWire(index){builderSelectedWire=Number(index); builderSelected=null; renderBuilder();}
function deleteSelectedBuilder(){
  if(!builderSelected){$("#builderStatus").textContent="Select a component first";return;}
  const id=builderSelected;
  builderComponents=builderComponents.filter(c=>c.id!==id);
  builderConnections=builderConnections.filter(c=>c.fromId!==id&&c.toId!==id);
  builderSelected=null; builderPendingSource=null; renderBuilder();
  $("#builderStatus").textContent="Component deleted";
}
function deleteSelectedBuilderWire(){
  if(builderSelectedWire===null){$("#builderStatus").textContent="Select a wire first";return;}
  builderConnections.splice(builderSelectedWire,1);
  builderSelectedWire=null; renderBuilder();
  $("#builderStatus").textContent="Connection deleted";
}
function builderConnect(fromId,fromIndex,toId,toIndex){
  if(fromId===toId) return;
  builderConnections=builderConnections.filter(c=>!(c.toId===toId&&c.toIndex===toIndex));
  builderConnections.push({fromId,fromIndex,toId,toIndex,active:false});
  builderPendingSource=null; renderBuilder(); $("#builderStatus").textContent="Connection added";
}
function handleBuilderPort(port){
  const node=port.closest(".builder-node"), id=node?.dataset.id, dir=port.dataset.port, index=Number(port.dataset.index);
  if(!id)return;
  if(dir==="out"){
    builderPendingSource={id,index};
    $("#builderStatus").textContent="Output selected — choose an input port";
    document.querySelectorAll(".builder-port.input-port").forEach(p=>p.classList.add("ready"));
  }else if(dir==="in"&&builderPendingSource){
    builderConnect(builderPendingSource.id,builderPendingSource.index,id,index);
    document.querySelectorAll(".builder-port.input-port").forEach(p=>p.classList.remove("ready"));
  }
}
function incoming(c,index=0){return builderConnections.find(conn=>conn.toId===c.id&&conn.toIndex===index);}
function builderSourceValue(c,index=0){
  if(c.type==="INPUT") return c.value||0;
  if(c.type==="REG") return (c.stateBits||[0,0,0,0])[index]||0;
  return c.value||0;
}
function propagateCombinational(){
  for(let pass=0;pass<8;pass++){
    builderComponents.forEach(c=>{
      if(c.type==="INPUT"||c.type==="DFF"||c.type==="REG") return;
      const ins=[];
      for(let i=0;i<builderDefs[c.type].inputs;i++){
        const link=incoming(c,i), src=link&&builderGet(link.fromId); ins[i]=src?builderSourceValue(src):0;
      }
      if(c.type==="AND") c.value=ins[0]&ins[1];
      else if(c.type==="OR") c.value=ins[0]|ins[1];
      else if(c.type==="NOT") c.value=ins[0]?0:1;
      else if(c.type==="XOR") c.value=ins[0]^ins[1];
      else if(c.type==="NAND") c.value=(ins[0]&ins[1])?0:1;
      else if(c.type==="NOR") c.value=(ins[0]|ins[1])?0:1;
      else if(c.type==="XNOR") c.value=(ins[0]^ins[1])?0:1;
      else if(c.type==="OUTPUT") c.value=ins[0]||0;
    });
  }
}
function builderInputFor(c,index=0){
  const link=incoming(c,index), src=link&&builderGet(link.fromId);
  return src?builderSourceValue(src, link.fromIndex||0):0;
}
function settleMemoryOnClock(){
  propagateCombinational();
  builderComponents.forEach(c=>{
    if(c.type==="DFF") c.value=builderInputFor(c,0);
    if(c.type==="JKFF"){
      const j=builderInputFor(c,0), k=builderInputFor(c,1), q=c.value||0;
      if(j===0&&k===0) c.value=q; else if(j===0&&k===1) c.value=0; else if(j===1&&k===0) c.value=1; else c.value=q?0:1;
    }
  });
  propagateCombinational();
  builderComponents.forEach(c=>{
    if(c.type==="REG") c.stateBits=[0,1,2,3].map(i=>builderInputFor(c,i));
  });
  propagateCombinational();
}
function markBuilderConnections(){
  builderConnections.forEach(conn=>{const s=builderGet(conn.fromId);conn.active=!!(s&&builderSourceValue(s,conn.fromIndex||0));});
}
function evaluateBuilder(){
  propagateCombinational();
  markBuilderConnections();
  renderBuilder();
  $("#builderStatus").textContent="Circuit tested — combinational signals propagated";
}
function builderClockPulse(){
  settleMemoryOnClock();
  builderClockCount++;
  markBuilderConnections();
  renderBuilder();
  $("#builderClockCount").textContent=builderClockCount;
  $("#builderStatus").textContent="Clock pulse applied — memory elements updated";
}
function generateBuilderTruthTable(){
  const inputs=builderComponents.filter(c=>c.type==="INPUT");
  const outputs=builderComponents.filter(c=>c.type==="OUTPUT");
  const wrap=$("#builderTruthTableWrap");
  if(!wrap)return;
  if(!inputs.length||!outputs.length){wrap.innerHTML='<div class="practice-feedback">Add at least one INPUT and one OUTPUT.</div>';return;}
  if(inputs.length>3){wrap.innerHTML='<div class="practice-feedback">Truth Table is limited to 3 INPUT components.</div>';return;}
  const savedInputs=inputs.map(c=>c.value);
  const savedDffs=builderComponents.filter(c=>c.type==="DFF").map(c=>[c,c.value]);
  const savedRegs=builderComponents.filter(c=>c.type==="REG").map(c=>[c,c.state]);
  const rows=[]; const total=2**inputs.length;
  for(let n=0;n<total;n++){
    inputs.forEach((c,i)=>c.value=(n>>(inputs.length-1-i))&1);
    propagateCombinational();
    const vals=outputs.map(o=>builderSourceValue(o,0));
    rows.push({bits:inputs.map(c=>c.value),vals});
  }
  inputs.forEach((c,i)=>c.value=savedInputs[i]);
  savedDffs.forEach(([c,v])=>c.value=v); savedRegs.forEach(([c,v])=>c.state=v);
  propagateCombinational(); markBuilderConnections(); renderBuilder();
  let h='<table class="builder-truth-table"><thead><tr>'+inputs.map((c,i)=>`<th>IN${i+1}</th>`).join('')+outputs.map((c,i)=>`<th>OUT${i+1}</th>`).join('')+'</tr></thead><tbody>';
  rows.forEach(r=>{h+='<tr>'+r.bits.map(v=>`<td class="${v?'truth-one':''}">${v}</td>`).join('')+r.vals.map(v=>`<td class="${v?'truth-one':''}">${v}</td>`).join('')+'</tr>';});
  h+='</tbody></table>'; wrap.innerHTML=h; $("#builderStatus").textContent="Truth Table generated";
}
function builderReset(){builderComponents=[];builderConnections=[];builderSelected=null;builderSelectedWire=null;builderPendingSource=null;builderId=0;builderClockCount=0;$("#builderStatus").textContent="Canvas cleared";$("#builderClockCount").textContent="0";$("#builderTruthTableWrap").innerHTML="";renderBuilder();}
function initCircuitBuilder(){
  if(builderInitialized){renderBuilder();return;}
  builderInitialized=true;
  document.querySelectorAll(".builder-add").forEach(btn=>btn.addEventListener("click",()=>builderAdd(btn.dataset.addType)));
  $("#builderTest")?.addEventListener("click",evaluateBuilder);
  $("#builderClock")?.addEventListener("click",builderClockPulse);
  $("#builderDelete")?.addEventListener("click",deleteSelectedBuilder);
  $("#builderDeleteWire")?.addEventListener("click",deleteSelectedBuilderWire);
  $("#builderTruthTable")?.addEventListener("click",generateBuilderTruthTable);
  $("#builderReset")?.addEventListener("click",builderReset);
  $("#builderConnect")?.addEventListener("click",()=>{$("#builderStatus").textContent=builderPendingSource?"Select an input port on the canvas":"Click an output port first";});
  $("#builderCanvas")?.addEventListener("click",e=>{
    const wire=e.target.closest(".builder-wire");
    if(wire){selectBuilderWire(wire.dataset.index);return;}
    const port=e.target.closest(".builder-port"); if(port){handleBuilderPort(port);return;}
    const toggle=e.target.closest("[data-action='toggle-input']");
    if(toggle){const node=toggle.closest(".builder-node"),c=builderGet(node.dataset.id);c.value=c.value?0:1;toggle.textContent=c.value;renderBuilder();return;}
    const node=e.target.closest(".builder-node"); if(node) selectBuilderComponent(node.dataset.id);
  });
  // Lightweight pointer dragging; ports/buttons remain clickable.
  let drag=null;
  $("#builderCanvas")?.addEventListener("pointerdown",e=>{
    const node=e.target.closest(".builder-node");
    if(!node||e.target.closest("button"))return;
    const c=builderGet(node.dataset.id); drag={c,ox:e.clientX-c.x,oy:e.clientY-c.y}; node.setPointerCapture?.(e.pointerId);
  });
  $("#builderCanvas")?.addEventListener("pointermove",e=>{
    if(!drag)return;
    const rect=$("#builderCanvas").getBoundingClientRect();
    drag.c.x=Math.max(8,Math.min(rect.width-158,e.clientX-rect.left-drag.ox));
    drag.c.y=Math.max(8,Math.min(rect.height-120,e.clientY-rect.top-drag.oy));
    const node=$("#builderCanvas").querySelector(`.builder-node[data-id="${drag.c.id}"]`);
    if(node){node.style.left=drag.c.x+"px";node.style.top=drag.c.y+"px";drawBuilderWires();}
  });
  $("#builderCanvas")?.addEventListener("pointerup",()=>{drag=null;});
  renderBuilder();
}


/* ---------------- Startup Loader ---------------- */
window.addEventListener("load", () => {
  const loader = document.getElementById("app-loader");
  if(!loader) return;
  setTimeout(() => loader.classList.add("loaded"), 850);
  setTimeout(() => loader.remove(), 1550);
});

