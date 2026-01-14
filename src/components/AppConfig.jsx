import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';

const AppConfig = ({ sharedState }) => {
  const [config, setConfig] = useState({
    privateKey: '',
    serverKey: '',
    allowed: '0.0.0.0/0',
    endpointIp: ''
  });

  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const generateConfig = () => {
    const conf = `[Interface]
PrivateKey = ${config.privateKey}
Address = ${sharedState.clientIp || '10.77.77.2/32'}
DNS = 8.8.8.8

[Peer]
PublicKey = ${config.serverKey}
AllowedIPs = ${config.allowed}
Endpoint = ${config.endpointIp || sharedState.endpointIp}:${sharedState.port || '51820'}`;

    setOutput(conf);
  };

  const downloadConfig = () => {
    const conf = `[Interface]
PrivateKey = ${config.privateKey}
Address = ${sharedState.clientIp || '10.77.77.2/32'}
DNS = 8.8.8.8

[Peer]
PublicKey = ${config.serverKey}
AllowedIPs = ${config.allowed}
Endpoint = ${config.endpointIp || sharedState.endpointIp}:${sharedState.port || '51820'}`;

    const blob = new Blob([conf], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wg-client.conf';
    a.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PrivateKey (App)
          </label>
          <input
            type="text"
            value={config.privateKey}
            onChange={(e) => handleChange('privateKey', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-mono text-sm"
            placeholder="PrivateKeyDelCliente=="
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            IP Cliente
          </label>
          <input
            type="text"
            value={sharedState.clientIp}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            placeholder="10.77.77.2/32"
          />
          <p className="text-xs text-gray-500 mt-1">Se sincroniza desde la configuración MikroTik</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PublicKey MikroTik
          </label>
          <input
            type="text"
            value={config.serverKey}
            onChange={(e) => handleChange('serverKey', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-mono text-sm"
            placeholder="PublicKeyDelServidor=="
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AllowedIPs
          </label>
          <input
            type="text"
            value={config.allowed}
            onChange={(e) => handleChange('allowed', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Endpoint IP
          </label>
          <input
            type="text"
            value={config.endpointIp || sharedState.endpointIp}
            onChange={(e) => handleChange('endpointIp', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            placeholder="203.0.113.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Endpoint Puerto
          </label>
          <input
            type="text"
            value={sharedState.port}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            placeholder="51820"
          />
          <p className="text-xs text-gray-500 mt-1">Se sincroniza desde la configuración MikroTik</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={generateConfig}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Generar Configuración
        </button>
        <button
          onClick={downloadConfig}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Download size={18} />
          Descargar .conf
        </button>
      </div>

      {output && (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm font-mono">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AppConfig;