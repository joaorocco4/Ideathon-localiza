// Servidor de pré-visualização local, sem dependências externas.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const port = Number(process.env.PERFIL_PORT || 4174);
const addresses = () => Object.values(os.networkInterfaces()).flat().filter(n => n.family === 'IPv4' && !n.internal).map(n => `http://${n.address}:${port}`);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}); return res.end(); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end('Requisição inválida'); }
  if (pathname === '/acesso.html') {
    const links = addresses();
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    return res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Abrir no celular — Perfil Certo</title><link rel="stylesheet" href="styles.css"><body style="padding:32px;max-width:720px;margin:auto"><span class="eyebrow">PERFIL CERTO · DEMONSTRAÇÃO LOCAL</span><h1>Leve a experiência para o celular.</h1><p>Conecte o celular à mesma rede Wi-Fi do computador. Abra um destes endereços no navegador do celular:</p>${links.map(url=>`<p><a class="button" href="${url}">${url}</a></p>`).join('')||'<p>Não foi encontrado um endereço de rede. Conecte o computador ao Wi-Fi.</p>'}<p>Mantenha este computador e o servidor ligados. O celular não deve usar localhost: esse endereço aponta para o próprio aparelho.</p><p>Se não conectar, confira se a rede permite comunicação entre aparelhos e se o Windows permite o Node.js na rede privada. Não é necessário desativar o firewall.</p><a class="text-link" href="/">Voltar ao protótipo</a></body></html>`);
  }
  const target = path.resolve(__dirname, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(__dirname + path.sep)) { res.writeHead(403); return res.end('Acesso negado'); }
  fs.readFile(target, (error, content) => { if (error) { res.writeHead(404); return res.end('Arquivo não encontrado'); } res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' }); res.end(content); });
}).listen(port, '0.0.0.0', () => { console.log(`Perfil Certo: http://localhost:${port}`); console.log('No celular, na mesma rede:', addresses().join(' ou ')); console.log(`Instruções: http://localhost:${port}/acesso.html`); });
