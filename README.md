# ZKTeco PUSH Server (Node.js + TypeScript)

Este projeto é uma implementação do protocolo PUSH da ZKTeco, permitindo a comunicação bidirecional com equipamentos de controle de acesso e ponto.

## Características
- **Protocolo PUSH Nativo**: Implementa `/iclock/cdata`, `/iclock/getrequest`, `/iclock/devicecmd`.
- **CRUD Real-time**: Operações de usuário (Listar, Criar, Deletar) são executadas diretamente no equipamento via comandos PUSH.
- **SQLite Persistence**: Logs, comandos e status de jobs são persistidos localmente.
- **Job System**: Sistema de correlação para aguardar respostas assíncronas dos dispositivos.

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o ambiente:
   ```bash
   cp .env.example .env
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Testando com CURL

### 1. Listar Usuários (Dispara comando no device)
```bash
curl "http://localhost:3000/api/usuarios?sn=SEU_SN_AQUI"
```
*Se o device responder rápido, você recebe o JSON. Se demorar, recebe um `jobId`.*

### 2. Criar Usuário
```bash
curl -X POST "http://localhost:3000/api/usuarios?sn=SEU_SN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{"pin": "100", "name": "Joao Silva", "privilege": 0}'
```

### 3. Consultar Status de um Job
```bash
curl "http://localhost:3000/api/jobs/ID_DO_JOB"
```

## Fluxo PUSH
1. O dispositivo faz um GET em `/iclock/cdata` para handshake.
2. O dispositivo faz um GET em `/iclock/getrequest` para buscar comandos pendentes.
3. O servidor entrega o comando (ex: `DATA QUERY user`).
4. O dispositivo executa e responde em `/iclock/devicecmd` ou `/iclock/cdata` (POST).
5. O servidor captura a resposta, atualiza o banco e finaliza o Job correspondente.
