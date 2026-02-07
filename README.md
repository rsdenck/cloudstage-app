# cloudstage ☁️

Plataforma de documentação moderna, minimalista e poderosa, inspirada no GitBook, focada em performance e facilidade de publicação multi-domínio.

## 🚀 Funcionalidades

- **Design Minimalista**: Interface escura com tons de verde, focada no conteúdo.
- **Gestão Hierárquica**: Organização intuitiva de pastas e documentos.
- **Publicação Multi-domínio**: Decida exatamente em qual domínio cada coleção de documentos será publicada.
- **Editor Markdown**: Suporte completo a Markdown com renderização elegante.
- **Painel Admin**: Controle total sobre o conteúdo e configurações de domínio.
- **Segurança**: Acesso ao painel administrativo restrito a usuários autorizados.

## 🛠️ Tecnologias

- **Framework**: Next.js 15+ (App Router)
- **Estilização**: Tailwind CSS 4
- **Banco de Dados**: Prisma ORM com SQLite
- **Autenticação**: NextAuth.js
- **Ícones**: Lucide React

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/rsdenck/cloudstage-app.git
   cd cloudstage-app
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` na raiz:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="seu-secret-aqui"
   NEXTAUTH_URL="http://100.100.1.1:3000"
   ```

4. **Preparar o banco de dados**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

5. **Iniciar em modo desenvolvimento**:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
   *Nota: O parâmetro `-H 0.0.0.0` é necessário para tornar o servidor acessível via rede externa (IP).*

## 🔒 Configuração Nginx (Proxy Reverso + SSL Privado)

Para rodar em produção com segurança usando SSL privado (auto-assinado ou de CA interna), utilize a configuração abaixo.

### 1. Gerar Certificados Privados (Exemplo)
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/cloudstage.key \
  -out /etc/nginx/ssl/cloudstage.crt
```

### 2. Configuração do Nginx
Crie um arquivo em `/etc/nginx/sites-available/cloudstage`:

```nginx
server {
    listen 80;
    server_name 100.100.1.1;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 100.100.1.1;

    # Certificados Privados
    ssl_certificate /etc/nginx/ssl/cloudstage.crt;
    ssl_certificate_key /etc/nginx/ssl/cloudstage.key;

    # Otimizações SSL
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📄 Licença
MIT - Veja o arquivo [LICENSE](LICENSE) para detalhes.
