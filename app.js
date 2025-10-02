// ------------------ データ管理 ------------------
const quizDataFiles = {
  "情報": ["questions/informatics_kiso.json", "questions/informatics_processor.json", "questions/information_programming.json", "questions/information_systemconfig.json", "questions/information_systemdevelop.json", "questions/information_network.json"],
  "機械": ["questions/mechanics_kiso.json"]
};

let questions= [];
let currentIndex = 0;
let correctCount = 0;
let totalCount = 0;

// ------------------ UI要素 ------------------
const subjectSelect = document.getElementById("subjectSelect");
const unitSelect = document.getElementById("unitSelect");
const subjectRandomBtn = document.getElementById("subjectRandomBtn");
const unitRandomBtn = document.getElementById("unitRandomBtn");
const allRandomBtn = document.getElementById("allRandomBtn");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreDisplay = document.getElementById("score");

// ------------------ 初期化 ------------------
// 科目セレクト作成
for (const subject in quizDataFiles) {
  const option = document.createElement("option");
  option.value = subject;
  option.textContent = subject;
  subjectSelect.appendChild(option);
}

// 単元更新
async function updateUnitOptions() {
  const subject = subjectSelect.value;
  unitSelect.innerHTML = "";
  var data
  for (const file of quizDataFiles[subject]){
    const scriptTag = document.getElementById(file);
    if (scriptTag){
      data = JSON.parse(scriptTag.textContent);
    }else{
      const res = await fetch(file);
      data = await res.json();
    } 
    const option = document.createElement("option");
    option.value = file;
    // option.textContent = `${data.title} (${data.tag})`;
    option.textContent = `${data.title}`;
    unitSelect.appendChild(option);
  }
}

updateUnitOptions();
subjectSelect.onchange = updateUnitOptions;

// ------------------ スコア更新 ------------------
function updateScore() {
  const percent = totalCount ? Math.round(correctCount / totalCount * 100) : 0;
  scoreDisplay.textContent = `正答数: ${correctCount} / ${totalCount} (${percent}%)`;
}

// ------------------ 問題表示 ------------------
function showQuestion() {
  if (!questions.length) return;
  const q = questions[currentIndex];
  document.getElementById("question").textContent = q.quiz;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "choice";
    btn.onclick = () => checkAnswer(idx);
    choicesDiv.appendChild(btn);

    // フォント調整
    adjustChoiceFontSize(btn);
  });

  document.getElementById("explanation").textContent = "";
  document.getElementById("nextBtn").style.display = "none";
}

// ------------------ 回答チェック ------------------
function checkAnswer(selected) {
  const q = questions[currentIndex];
  const choices = document.querySelectorAll("#choices button");
  choices.forEach((btn, idx) => {
    if (idx === q.answer) btn.classList.add("correct");
    else if (idx === selected) btn.classList.add("wrong");
    btn.disabled = true;
  });

  // document.getElementById("explanation").textContent = "解説：\n" + q.explanation + "\n\n 問題番号 " + q.id;
  document.getElementById("explanation").innerHTML = "解説：\n" + q.explanation + "\n\n 問題番号 " + q.id;

  totalCount++;
  if (selected === q.answer) correctCount++;
  updateScore();

  document.getElementById("nextBtn").style.display = "block";
}

document.getElementById("nextBtn").onclick = () => {
  currentIndex++;
  if (currentIndex < questions.length) showQuestion();
  else alert("終了！全問題解答済みです 🎉");
};

// ------------------ JSON読み込み ------------------
async function loadJSON(file) {
  const scriptTag = document.getElementById(file);
  if (scriptTag){
    return JSON.parse(scriptTag.textContent)
  }else{
    const res = await fetch(file);
    return await res.json();
  }
}

// ------------------ 配列シャッフル ------------------
function shuffleArray(array) {
  for (let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}

// ------------------ 単元選択出題 ------------------
unitSelect.onchange = async () => {
  const file = unitSelect.value;
  const data = await loadJSON(file);
  questions = data.questions;
  shuffleArray(questions);
  currentIndex = 0;
  showQuestion();
};

// ------------------ 単元ランダム出題 ------------------
unitRandomBtn.onclick = async () => {
  const file = unitSelect.value;
  const data = await loadJSON(file);
  questions = data.questions;
  shuffleArray(questions);
  currentIndex = 0;
  showQuestion();
};

// ------------------ 科目ランダム出題 ------------------
subjectRandomBtn.onclick = async () => {
  const subject = subjectSelect.value;
  const files = quizDataFiles[subject];
  const allquestions = [];
  for (const f of files){
    const data = await loadJSON(f)
    allquestions.push(...data.questions)
  }
  questions= allquestions;
  shuffleArray(questions);
  currentIndex = 0;
  showQuestion();
};

// ------------------ 全問題ランダム出題 ------------------
allRandomBtn.onclick = async () => {
  const allFiles = Object.values(quizDataFiles).flat();
  const allquestions= [];
  const results = await Promise.all(allFiles.map(f => loadJSON(f)));
  results.forEach(arr => allquestions.push(...arr.questions));
  questions= allquestions;
  shuffleArray(questions);
  currentIndex = 0;
  showQuestion();
};

// ------------------ 問題番号検索 ------------------
searchBtn.onclick = () => {
  const id = parseInt(document.getElementById("searchId").value);
  const index = questions.findIndex(q => q.id === id);
  if (index >= 0) {
    currentIndex = index;
    showQuestion();
  } else {
    alert("該当する問題がありません");
  }
};

// ------------------ リセット ------------------
resetBtn.onclick = () => {
  currentIndex = 0;
  correctCount = 0;
  totalCount = 0;
  updateScore();
  shuffleArray(questions);
  showQuestion();
};

// ------------------ 問題文の文字サイズの調整 ------------------
function adjustChoiceFontSize(button, maxFontSize = 14, minFontSize = 8) {
  let fontSize = maxFontSize;
  button.style.fontSize = fontSize + "px";

  while (button.scrollWidth > button.clientWidth && fontSize > minFontSize) {
    fontSize--;
    button.style.fontSize = fontSize + "px";
  }
}