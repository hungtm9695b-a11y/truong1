let ecg_json = "";

// ===============================
// Điều hướng giữa các bước UI
// ===============================
function nextStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step" + step).classList.remove("hidden");
}

// ===============================
// Upload ECG & gọi API phân tích ECG
// ===============================
async function uploadECG() {
  const fileInput = document.getElementById("ecg");
  const loading = document.getElementById("loading_ecg");

  if (!fileInput.files[0]) {
    alert("Hãy chọn ảnh ECG!");
    return;
  }

  loading.innerHTML = "🔄 Đang phân tích ECG...";

  const formData = new FormData();
  formData.append("ecg_file", fileInput.files[0]);

  try {
    const response = await fetch("/analyze-ecg", {
      method: "POST",
      body: formData
    });

    ecg_json = await response.text();
    loading.innerHTML = "✔ Hoàn tất!";

    nextStep(3);

  } catch (error) {
    console.error(error);
    loading.innerHTML = "❌ Lỗi phân tích ECG.";
  }
}

// ===============================
// Tính HEAR Score tự động
// ===============================
function calcHEAR() {
  const h = parseInt(document.getElementById("history").value);
  const e = parseInt(document.getElementById("hear_ecg").value);
  const a = parseInt(document.getElementById("hear_age").value);
  const r = parseInt(document.getElementById("hear_risk").value);

  return h + e + a + r;
}

// ===============================
// Gửi triệu chứng + HEAR + ECG tới AI
// ===============================
async function analyzeClinical() {
  const loading = document.getElementById("loading_clinical");
  loading.innerHTML = "🔄 Đang tổng hợp AI...";

  const symptoms_text = document.getElementById("symptoms").value;
  const hear_score = calcHEAR();

  const formData = new FormData();
  formData.append("ecg_data", ecg_json);
  formData.append("symptoms", symptoms_text + ` | HEAR Score: ${hear_score}`);

  try {
    const response = await fetch("/analyze-clinical", {
      method: "POST",
      body: formData
    });

    const final_json = await response.text();
    document.getElementById("result_box").innerText = final_json;

    loading.innerHTML = "";
    nextStep(4);

  } catch (error) {
    console.error(error);
    loading.innerHTML = "❌ Lỗi tổng hợp AI.";
  }
}
