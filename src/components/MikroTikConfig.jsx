import { useState } from "react";
import { Copy, Check, Terminal, Info, Zap, Server, Dices } from "lucide-react";
import { usePersistentState } from "../hooks/useSessionState";

// --- Utilidades de red ---
const ipToInt = (ip) =>
  ip.split(".").reduce((acc, octet) => acc * 256 + (parseInt(octet, 10) || 0), 0);

const intToIp = (n) =>
  [
    Math.floor(n / 16777216) % 256,
    Math.floor(n / 65536) % 256,
    Math.floor(n / 256) % 256,
    n % 256,
  ].join(".");

const isValidCidr = (cidr) => {
  const [ip, prefixStr] = (cidr || "").split("/");
  const prefix = parseInt(prefixStr, 10);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) return false;
  const parts = ip.split(".");
  return (
    parts.length === 4 &&
    parts.every((p) => p !== "" && !isNaN(p) && +p >= 0 && +p <= 255)
  );
};

// Calcula la dirección de red real respetando el prefijo (no solo /24)
const calcNetwork = (cidr) => {
  if (!isValidCidr(cidr)) return "";
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const net = (ipToInt(ip) & mask) >>> 0;
  return intToIp(net) + "/" + prefix;
};

// Siguiente IP disponible a partir del gateway (10.0.0.1/24 -> 10.0.0.2/32)
const nextClientIp = (cidr) => {
  if (!isValidCidr(cidr)) return "";
  const [ip] = cidr.split("/");
  const next = (ipToInt(ip) + 1) >>> 0;
  return intToIp(next) + "/32";
};

// Puerto aleatorio en rango alto (evita los bien conocidos)
const randomPort = () =>
  String(Math.floor(Math.random() * (65535 - 10000 + 1)) + 10000);

const DEFAULT_CONFIG = {
  iface: "",
  port: "",
  wgIp: "",
  network: "",
  natOutType: "interface",
  wan: "",
  wanList: "WAN",
  wanCustom: "",
  natMode: "masquerade",
  srcNatIp: "",
  peerName: "",
  peerKey: "",
  clientIp: "",
  peerAllowed: "",
};

const MikroTikConfig = ({ sharedState, setSharedState }) => {
  const [config, setConfig] = usePersistentState("mikrotik", DEFAULT_CONFIG);

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    const next = { ...config, [field]: value };
    const sharedUpdates = {};

    if (field === "wgIp") {
      next.network = calcNetwork(value);
      const client = nextClientIp(value);
      if (client) {
        next.clientIp = client;
        next.peerAllowed = client;
      }
      sharedUpdates.clientIp = next.clientIp;
      sharedUpdates.network = next.network;
    }
    if (field === "port") {
      sharedUpdates.port = value;
    }
    if (field === "clientIp") {
      next.peerAllowed = value;
      sharedUpdates.clientIp = value;
    }
    if (field === "srcNatIp") {
      sharedUpdates.endpointIp = value;
    }

    setConfig(next);
    if (Object.keys(sharedUpdates).length) {
      setSharedState({ ...sharedState, ...sharedUpdates });
    }
  };

  const generateConfig = () => {
    // Puerto aleatorio si el usuario no definió uno
    let port = config.port;
    if (!port) {
      port = randomPort();
      handleChange("port", port);
    }

    const wanName =
      config.natOutType === "list"
        ? config.wanList === "custom"
          ? config.wanCustom
          : config.wanList
        : config.wan;

    const out =
      config.natOutType === "list"
        ? `out-interface-list=${wanName}`
        : `out-interface=${wanName}`;

    // IP pública para el src-nat: la del campo propio o la sincronizada del cliente
    const publicIp = config.srcNatIp || sharedState.endpointIp || "";

    const nat =
      config.natMode === "srcnat"
        ? `add chain=srcnat src-address=${config.network} ${out} action=src-nat to-addresses=${publicIp} place-before=0`
        : `add chain=srcnat src-address=${config.network} ${out} action=masquerade place-before=0`;

    // Si el usuario eligió crear una lista nueva, añadimos el comando de creación
    const listCreation =
      config.natOutType === "list" && config.wanList === "custom" && wanName
        ? `\n/interface/list\nadd name=${wanName} comment="Lista creada por WG Generator"\n`
        : "";

    const result = `# --- WireGuard Server Configuration ---
/interface/wireguard/add name=${config.iface} listen-port=${port}

/ip address
add address=${config.wgIp} interface=${config.iface}
${listCreation}
/ip firewall filter
add chain=input protocol=udp dst-port=${port} action=accept comment="Allow WireGuard" place-before=0
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
    <div className="space-y-10">
      {/* Sección Servidor */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/20">
            <Server size={18} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
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

          {/* Puerto con botón de aleatorio */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Puerto de Escucha
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={config.port}
                onChange={(e) => handleChange("port", e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="Aleatorio si se deja vacío"
              />
              <button
                type="button"
                onClick={() => handleChange("port", randomPort())}
                title="Generar puerto aleatorio"
                className="px-4 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors flex items-center justify-center"
              >
                <Dices size={18} />
              </button>
            </div>
          </div>

          <InputField
            label="IP WireGuard (Gateway)"
            placeholder="10.0.0.1/24"
            value={config.wgIp}
            onChange={(v) => handleChange("wgIp", v)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Red Detectada
            </label>
            <div className="px-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 font-mono text-sm">
              {config.network || "Esperando IP..."}
            </div>
          </div>

          {/* Salida WAN inteligente */}
          <SelectField
            label="Tipo de Salida WAN"
            value={config.natOutType}
            onChange={(v) => handleChange("natOutType", v)}
            options={[
              { label: "Interfaz", value: "interface" },
              { label: "Lista (Interface List)", value: "list" },
            ]}
          />

          {config.natOutType === "interface" ? (
            <InputField
              label="Interfaz WAN"
              placeholder="ether1"
              value={config.wan}
              onChange={(v) => handleChange("wan", v)}
            />
          ) : (
            <SelectField
              label="Lista de Interfaz"
              value={config.wanList}
              onChange={(v) => handleChange("wanList", v)}
              options={[
                { label: "WAN", value: "WAN" },
                { label: "LAN", value: "LAN" },
                { label: "Crear nueva...", value: "custom" },
              ]}
            />
          )}

          {config.natOutType === "list" && config.wanList === "custom" && (
            <div className="md:col-span-2">
              <InputField
                label="Nombre de la nueva lista"
                placeholder="MI_WAN"
                value={config.wanCustom}
                onChange={(v) => handleChange("wanCustom", v)}
              />
            </div>
          )}

          {/* Tipo de NAT para la red privada */}
          <SelectField
            label="Tipo de NAT"
            value={config.natMode}
            onChange={(v) => handleChange("natMode", v)}
            options={[
              { label: "Masquerade (automático)", value: "masquerade" },
              { label: "Src-NAT a IP pública", value: "srcnat" },
            ]}
          />

          {config.natMode === "srcnat" && (
            <InputField
              label="IP Pública (NAT)"
              placeholder="203.0.113.1"
              value={config.srcNatIp || sharedState.endpointIp}
              onChange={(v) => handleChange("srcNatIp", v)}
            />
          )}
        </div>
      </section>

      <hr className="border-slate-100 dark:border-white/5" />

      {/* Sección Peer */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-500/20">
            <Zap size={18} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              IP Cliente (auto)
            </label>
            <input
              type="text"
              value={config.clientIp}
              onChange={(e) => handleChange("clientIp", e.target.value)}
              className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Se calcula desde la IP Gateway"
            />
            <p className="text-xs text-slate-500">
              Siguiente IP disponible tras el gateway. Puedes editarla.
            </p>
          </div>
          <div className="md:col-span-2">
            <InputField
              label="Public Key del Cliente (WireGuard Windows)"
              placeholder="Pega aquí la Public Key de tu WireGuard..."
              value={config.peerKey}
              onChange={(v) => handleChange("peerKey", v)}
              mono
            />
          </div>
        </div>
      </section>

      <button
        onClick={generateConfig}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
      >
        <Terminal size={20} /> Generar Script MikroTik
      </button>

      {output && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <Info size={14} /> Terminal Commands
            </span>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                copied
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
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
          <pre className="bg-[#0F172A] dark:bg-black/50 text-blue-100 p-6 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800 dark:border-white/10 shadow-2xl">
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
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all ${
        mono ? "font-mono text-[11px]" : ""
      }`}
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default MikroTikConfig;
