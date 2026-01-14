import React from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Terminal,
  Globe,
  Cpu,
} from "lucide-react";
import ParticlesBackground from "./ParticlesBackground";

const WelcomePage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Fondo de partículas */}
      <ParticlesBackground />

      {/* Decoración de Luces de Fondo (Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Badge Superior */}
        <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-medium text-blue-300 uppercase tracking-widest">
            Optimizado para RouterOS v7+
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-10 inline-block group">
            <div className="relative transform transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900 border border-white/10 p-7 rounded-[2.5rem] shadow-2xl">
                <Shield size={58} className="text-blue-400" strokeWidth={1.2} />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8">
            WireGuard
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500">
              Config Generator
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            La forma más elegante y segura de desplegar túneles VPN. Genera
            scripts de{" "}
            <span className="text-blue-400 font-medium">MikroTik</span> y
            perfiles de cliente en un clic.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-16 px-4">
            <FeatureCard
              icon={<Zap className="text-amber-400" />}
              title="Instantáneo"
              desc="Configuración completa lista en menos de 30 segundos."
            />
            <FeatureCard
              icon={<Lock className="text-emerald-400" />}
              title="Privacidad Total"
              desc="Generación Client-Side. Tus llaves nunca salen de aquí."
            />
            <FeatureCard
              icon={<Terminal className="text-blue-400" />}
              title="MikroTik Ready"
              desc="Scripts optimizados para copiar directamente a la terminal."
            />
          </div>

          {/* Botón de Acción Principal */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={onGetStarted}
              className="group relative flex items-center gap-4 bg-white text-slate-950 px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:bg-blue-50 hover:scale-105 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            >
              <span>Empezar Configuración</span>
              <ArrowRight
                className="group-hover:translate-x-2 transition-transform"
                size={24}
              />
            </button>

            <div className="flex items-center gap-8 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Globe size={16} /> Multi-plataforma
              </span>
              <span className="flex items-center gap-2">
                <Cpu size={16} /> Alto Rendimiento
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para las tarjetas de características para mantener el código limpio
const FeatureCard = ({ icon, title, desc }) => (
  <div className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl transition-all duration-500 hover:border-blue-500/50 hover:bg-slate-800/60 text-center">
    <div className="mb-5 inline-flex p-4 rounded-2xl bg-slate-950 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-white font-bold text-xl mb-3 leading-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed font-light">{desc}</p>
  </div>
);

export default WelcomePage;
