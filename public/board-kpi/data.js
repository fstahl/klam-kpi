// KPI data is loaded from the server, which reads kpi-template.xlsx.
// window.KPI_DATA is populated before React renders.
window.KPI_DATA = null;

window.__kpiDataReady = fetch("/api/board-kpi")
  .then(r => {
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  })
  .then(data => { window.KPI_DATA = data; })
  .catch(err => {
    console.error("Failed to load KPI data:", err);
    // Surface error in the UI
    document.getElementById("root").innerHTML =
      `<div style="font-family:sans-serif;padding:48px;color:#b91c1c">
        <strong>Could not load KPI data.</strong><br>
        ${err.message}<br><br>
        Make sure <code>kpi-template.xlsx</code> exists in the project root and the server is running.
      </div>`;
  });
