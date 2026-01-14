import React, { useState } from "react";
import { Copy, Check, Terminal, Info, Zap, Server } from "lucide-react";

const MikroTikConfig = ({ sharedState, setSharedState }) => {
  const [config, setConfig] = useState({
    iface: "",
    port: "",
    wgIp: "",
    network: "10.8.0.0/24",
    natOutType: "interface",
    wan: "",
    natMode: "masquerade",
    srcNatIp: "",
    peerName: "",
    peerKey: "",
    clientIp: "",
    peerAllowed: "10.8.0.2/32",
  });

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const calcNetwork = (wgIp) => {
    const parts = wgIp.split("/");
    if (parts.length === 2) {
      const ip = parts[0].split(".");
      if (ip.length === 4) {
        ip[3] = "0";
        return ip.join(".") + "/" + parts[1];
      }
    }
    return "";
  };

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };

    if (field === "wgIp") {
      newConfig.network = calcNetwork(value);
    }
    if (field === "port") {
      setSharedState({ ...sharedState, port: value });
    }
    if (field === "clientIp") {
      newConfig.peerAllowed = value;
      setSharedState({ ...sharedState, clientIp: value });
    }
    if (field === "srcNatIp") {
      setSharedState({ ...sharedState, endpointIp: value });
    }

    setConfig(newConfig);
  };

  const generateConfig = () => {
    const out =
      config.natOutType === "list"
        ? `out-interface-list=${config.wan}`
        : `out-interface=${config.wan}`;

    const nat =
      config.natMode === "masquerade"
        ? `add chain=srcnat src-address=${config.network} ${out} action=masquerade`
        : `add chain=srcnat src-address=${config.network} ${out} action=src-nat to-addresses=${config.srcNatIp}`;

    const result = `# --- WireGuard Server Configuration ---
/interface/wireguard/add name=${config.iface} listen-port=${config.port}

/ip address
add address=${config.wgIp} interface=${config.iface}

/ip firewall filter
add chain=input protocol=udp dst-port=${config.port} action=accept comment="Allow WireGuard" place-before=0
add chain=input src-address=${config.network} action=accept comment="Allow WireGuard Traffic" place-before=0

/ip firewall nat
${nat}

/interface/wireguard/peers/add \\
name=${config.peerName} \\
interface=${config.iface} \\
public-key="${config.peerKey}" \\
allowed-address=${config.peerAllowed}`;

    setOutput(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Sección Servidor */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Server size={18} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Parámetros del Servidor
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InputField
            label="Nombre de Interfaz"
            placeholder="wg0"
            value={config.iface}
            onChange={(v) => handleChange("iface", v)}
          />
          <InputField
            label="Puerto de Escucha"
            type="number"
            placeholder="51820"
            value={config.port}
            onChange={(v) => handleChange("port", v)}
          />
          <InputField
            label="IP WireGuard (Gateway)"
            placeholder="10.0.0.1/24"
            value={config.wgIp}
            onChange={(v) => handleChange("wgIp", v)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Red Detectada
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm">
              {config.network || "Esperando IP..."}
            </div>
          </div>
          <SelectField
            label="Salida WAN"
            value={config.natOutType}
            onChange={(v) => handleChange("natOutType", v)}
            options={[
              { label: "Interfaz", value: "interface" },
              { label: "Lista (Interface List)", value: "list" },
            ]}
          />
          <InputField
            label="Nombre WAN"
            placeholder="ether1"
            value={config.wan}
            onChange={(v) => handleChange("wan", v)}
          />
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Sección Peer */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap size={18} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Configuración del Peer
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InputField
            label="Nombre Peer"
            placeholder="iphone-client"
            value={config.peerName}
            onChange={(v) => handleChange("peerName", v)}
          />
          <InputField
            label="IP Cliente"
            placeholder="10.8.0.2/32"
            value={config.clientIp}
            onChange={(v) => handleChange("clientIp", v)}
          />
          <div className="md:col-span-2">
            <InputField
              label="Public Key del Cliente"
              placeholder="Public Key..."
              value={config.peerKey}
              onChange={(v) => handleChange("peerKey", v)}
              mono
            />
          </div>
        </div>
      </section>

      <button
        onClick={generateConfig}
        className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg"
      >
        <Terminal size={20} /> Generar Script MikroTik
      </button>

      {output && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Info size={14} /> Terminal Commands
            </span>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                copied
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} /> Copiado
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar Código
                </>
              )}
            </button>
          </div>
          <pre className="bg-[#0F172A] text-blue-100 p-6 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800 shadow-2xl">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

// --- Componentes Auxiliares ---
const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  mono = false,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all ${
        mono ? "font-mono text-[11px]" : "text-slate-800"
      }`}
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default MikroTikConfig;
