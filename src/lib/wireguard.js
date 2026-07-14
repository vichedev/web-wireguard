import nacl from "tweetnacl";

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));

// Genera un par de llaves Curve25519 (X25519), igual que `wg genkey` / `wg pubkey`.
// Todo ocurre en el navegador: las llaves nunca salen de aquí.
export function generateKeyPair() {
  const priv = nacl.randomBytes(32);

  // "Clamping" que aplica WireGuard a la clave privada
  priv[0] &= 248;
  priv[31] &= 127;
  priv[31] |= 64;

  const pub = nacl.scalarMult.base(priv);

  return {
    privateKey: toBase64(priv),
    publicKey: toBase64(pub),
  };
}

// Genera los dos pares necesarios: el del servidor (MikroTik) y el del cliente.
export function generateTunnelKeys() {
  const server = generateKeyPair();
  const client = generateKeyPair();
  return {
    serverPrivateKey: server.privateKey,
    serverPublicKey: server.publicKey,
    clientPrivateKey: client.privateKey,
    clientPublicKey: client.publicKey,
  };
}
