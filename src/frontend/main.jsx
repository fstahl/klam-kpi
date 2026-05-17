import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/dashboard.css';
import './styles/admin.css';

async function init() {
  const [kpiRes, configRes, fieldsRes] = await Promise.all([
    fetch('/api/board-kpi'),
    fetch('/api/config'),
    fetch('/api/kpi-fields'),
  ]);

  if (!kpiRes.ok) {
    document.getElementById('root').innerHTML =
      `<div style="font-family:sans-serif;padding:48px;color:#b91c1c">
        <strong>Could not load KPI data.</strong><br>
        Make sure <code>data.xlsx</code> exists and the server is running.
      </div>`;
    return;
  }

  const [kpiData, config, kpiFields] = await Promise.all([
    kpiRes.json(),
    configRes.json(),
    fieldsRes.json(),
  ]);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <App kpiData={kpiData} config={config} kpiFields={kpiFields.fields} />
  );
}

init();
