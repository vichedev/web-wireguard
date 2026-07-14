import {
  Server,
  Smartphone,
  ArrowLeft,
  Shield,
  LogOut,
  Save,
  FileSignature,
} from "lucide-react";
import MikroTikConfig from "./MikroTikConfig";
import AppConfig from "./AppConfig";
import ThemeToggle from "./ThemeToggle";
import { usePersistentState, clearSession } from "../hooks/useSessionState";

const WireGuardGenerator = ({ onBackToHome, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = usePersistentState("activeTab", "mikrotik");
  const [sharedState, setSharedState] = usePersistentState("shared", {
    sessionName: "",
    port: "",
    clientIp: "",
    endpointIp: "",
    network: "",
    serverPrivateKey: "",
    serverPublicKey: "",
    clientPrivateKey: "",
    clientPublicKey: "",
  });

  const handleEndSession = () => {
    const ok = window.confirm(
      "¿Terminar la sesión? Se borrarán todas las configuraciones guardadas."
    );
    if (ok) {
      clearSession();
      window.location.reload();
    }
  };

  const isMikrotik = activeTab === "mikrotik";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 py-8 px-4 md:px-8 relative overflow-hidden transition-colors">
      {/* Glows de fondo (solo modo oscuro) */}
      <div className="hidden dark:block absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[140px]" />
      <div className="hidden dark:block absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[140px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <button
            onClick={onBackToHome}
            className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium text-sm"
          >
            <div className="p-2 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Volver al Panel
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {/* Indicador de sesión */}
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <Save size={14} />
              <span className="text-xs font-semibold">Sesión guardada</span>
            </div>

            <button
              onClick={handleEndSession}
              className="flex items-center gap-2 text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-500/20 transition-colors"
            >
              <LogOut size={14} />
              <span className="text-xs font-semibold">Terminar Sesión</span>
            </button>
          </div>
        </nav>

        {/* Header Section */}
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Configuración de Túnel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Define los parámetros de red para tu instancia de WireGuard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Generador Seguro
            </span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          {/* Nombre de la sesión (se usa como nombre del archivo .conf) */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/5 flex-wrap">
            <label
              htmlFor="session-name"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
            >
              <FileSignature size={16} /> Nombre de la sesión
            </label>
            <input
              id="session-name"
              type="text"
              value={sharedState.sessionName}
              onChange={(e) =>
                setSharedState({ ...sharedState, sessionName: e.target.value })
              }
              placeholder="wg-client"
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Se usa como nombre del archivo .conf
            </span>
          </div>

          {/* Tabs */}
          <div className="flex p-2 bg-slate-100/70 dark:bg-black/20 gap-2 border-b border-slate-200 dark:border-white/5">
            <button
              onClick={() => setActiveTab("mikrotik")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                isMikrotik
                  ? "bg-white dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 shadow-sm ring-1 ring-slate-200 dark:ring-blue-500/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Server size={20} />
              MikroTik Server
            </button>
            <button
              onClick={() => setActiveTab("app")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                !isMikrotik
                  ? "bg-white dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm ring-1 ring-slate-200 dark:ring-emerald-500/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Smartphone size={20} />
              Dispositivo Cliente
            </button>
          </div>

          <div className="p-6 md:p-10">
            {isMikrotik ? (
              <MikroTikConfig
                sharedState={sharedState}
                setSharedState={setSharedState}
              />
            ) : (
              <AppConfig
                sharedState={sharedState}
                setSharedState={setSharedState}
              />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Guardado automático activo
          </span>
        </div>
      </div>
    </div>
  );
};

export default WireGuardGenerator;
