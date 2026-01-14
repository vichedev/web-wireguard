import { useState } from "react";
import { Server, Smartphone, ArrowLeft, Shield, Activity } from "lucide-react";
import MikroTikConfig from "./MikroTikConfig";
import AppConfig from "./AppConfig";

const WireGuardGenerator = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState("mikrotik");
  const [sharedState, setSharedState] = useState({
    port: "",
    clientIp: "",
    endpointIp: "",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-10">
          <button
            onClick={onBackToHome}
            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-medium text-sm"
          >
            <div className="p-2 rounded-full group-hover:bg-slate-200 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Volver al Panel
          </button>

          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Generador Seguro
            </span>
          </div>
        </nav>

        {/* Header Section */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Configuración de Túnel
          </h1>
          <p className="text-slate-500 text-lg">
            Define los parámetros de red para tu instancia de WireGuard.
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* Custom Tabs */}
          <div className="flex p-2 bg-slate-100/50 gap-2">
            <button
              onClick={() => setActiveTab("mikrotik")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                activeTab === "mikrotik"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Server
                size={20}
                className={
                  activeTab === "mikrotik" ? "text-blue-600" : "text-slate-400"
                }
              />
              MikroTik Server
            </button>
            <button
              onClick={() => setActiveTab("app")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${
                activeTab === "app"
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Smartphone
                size={20}
                className={
                  activeTab === "app" ? "text-emerald-600" : "text-slate-400"
                }
              />
              Dispositivo Cliente
            </button>
          </div>

          <div className="p-8 md:p-12">
            {activeTab === "mikrotik" ? (
              <MikroTikConfig
                sharedState={sharedState}
                setSharedState={setSharedState}
              />
            ) : (
              <AppConfig sharedState={sharedState} />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Activity size={14} className="text-blue-500" /> Iniguality
          </span>
          <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
          <span>Vice</span>
        </div>
      </div>
    </div>
  );
};

export default WireGuardGenerator;
