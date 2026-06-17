import { useState } from "react";
import { Download, Copy, Check, Smartphone, KeyRound } from "lucide-react";
import { usePersistentState } from "../hooks/useSessionState";

const DEFAULT_CONFIG = {
  privateKey: "",
  serverKey: "",
  allowed: "0.0.0.0/0",
  endpointIp: "",
};

const AppConfig = ({ sharedState }) => {
  const [config, setConfig] = usePersistentState("appclient", DEFAULT_CONFIG);

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const buildConfig = () => `[Interface]
PrivateKey = ${config.privateKey}
Address = ${sharedState.clientIp || "10.0.0.2/32"}
DNS = 8.8.8.8

[Peer]
PublicKey = ${config.serverKey}
AllowedIPs = ${config.allowed}
Endpoint = ${config.endpointIp || sharedState.endpointIp}:${
    sharedState.port || "51820"
  }`;

  const generateConfig = () => {
    setOutput(buildConfig());
  };

  const downloadConfig = () => {
    const blob = new Blob([buildConfig()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wg-client.conf";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("No se pudo copiar al portapapeles. Copia el texto manualmente.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/20">
          <Smartphone size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Perfil del Cliente</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <Label>PrivateKey (App)</Label>
          <input
            type="text"
            value={config.privateKey}
            onChange={(e) => handleChange("privateKey", e.target.value)}
            className={inputCls + " font-mono text-sm"}
            placeholder="Pega la Private Key de tu WireGuard (Windows)"
          />
        </div>

        <div>
          <Label>IP Cliente</Label>
          <input
            type="text"
            value={sharedState.clientIp}
            readOnly
            className={readonlyCls}
            placeholder="10.0.0.2/32"
          />
          <Hint>Se sincroniza desde la configuración MikroTik</Hint>
        </div>

        <div>
          <Label>Endpoint Puerto</Label>
          <input
            type="text"
            value={sharedState.port}
            readOnly
            className={readonlyCls}
            placeholder="51820"
          />
          <Hint>Se sincroniza desde el puerto seteado en el servidor</Hint>
        </div>

        <div className="md:col-span-2">
          <Label>PublicKey MikroTik</Label>
          <input
            type="text"
            value={config.serverKey}
            onChange={(e) => handleChange("serverKey", e.target.value)}
            className={inputCls + " font-mono text-sm"}
            placeholder="PublicKeyDelServidor=="
          />
        </div>

        <div className="md:col-span-2">
          <Label>AllowedIPs</Label>
          <input
            type="text"
            list="allowed-suggestions"
            value={config.allowed}
            onChange={(e) => handleChange("allowed", e.target.value)}
            className={inputCls}
          />
          <datalist id="allowed-suggestions">
            <option value="0.0.0.0/0" label="Todo el tráfico (VPN completa)" />
            {sharedState.network && (
              <option
                value={sharedState.network}
                label="Solo la red VPN (split tunnel)"
              />
            )}
          </datalist>
          <div className="flex flex-wrap gap-2 mt-2">
            <Chip onClick={() => handleChange("allowed", "0.0.0.0/0")}>
              Todo el tráfico
            </Chip>
            {sharedState.network && (
              <Chip onClick={() => handleChange("allowed", sharedState.network)}>
                Solo red VPN ({sharedState.network})
              </Chip>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Endpoint (IP pública del servidor / MikroTik)</Label>
          <input
            type="text"
            value={config.endpointIp || sharedState.endpointIp}
            onChange={(e) => handleChange("endpointIp", e.target.value)}
            className={inputCls}
            placeholder="Ej: 203.0.113.1 (IP pública de tu MikroTik)"
          />
          <Hint>
            Aquí va la dirección IP pública (o dominio DDNS) por la que se accede
            a tu servidor.
          </Hint>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={generateConfig}
          className="flex-1 bg-emerald-600 text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          Generar Configuración
        </button>
        <button
          onClick={downloadConfig}
          className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 py-3.5 px-6 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Descargar .conf
        </button>
      </div>

      {output && (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <pre className="bg-[#0F172A] dark:bg-black/50 text-emerald-300 p-6 rounded-2xl overflow-x-auto text-sm font-mono border border-slate-800 dark:border-white/10 shadow-2xl">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

// --- Estilos y subcomponentes ---
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all";

const readonlyCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400";

const Label = ({ children }) => (
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
    {children}
  </label>
);

const Hint = ({ children }) => (
  <p className="text-xs text-slate-500 mt-1.5">{children}</p>
);

const Chip = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition"
  >
    {children}
  </button>
);

export default AppConfig;
