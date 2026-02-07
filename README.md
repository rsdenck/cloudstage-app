<div align="center">
  <h1 style="color: #00ff00; background-color: #000000; padding: 15px; border: 2px solid #00ff00; border-radius: 10px; display: inline-block;">cloudstage | Documentação Moderna | Multi-domínio</h1>
  <p style="font-size: 1.2em; color: #00ff00;">Minimalismo. Performance. Publicação GitBook-Style.</p>
  <p style="color: #00ff00; font-style: italic;">"Sua documentação, em qualquer domínio, com a elegância do Cloudstage."</p>

  [![GitHub Repo](https://img.shields.io/badge/Repo-cloudstage--app-00ff00?style=for-the-badge&logo=github&logoColor=black&labelColor=black)](https://github.com/rsdenck/cloudstage-app)
  [![Stack](https://img.shields.io/badge/Stack-Next.js_15-00ff00?style=for-the-badge&logo=nextdotjs&logoColor=black&labelColor=black)](https://nextjs.org/)
  [![Database](https://img.shields.io/badge/DB-Prisma_SQLite-00ff00?style=for-the-badge&logo=prisma&logoColor=black&labelColor=black)](https://www.prisma.io/)
</div>

---

## **O que é o cloudstage?**
O **cloudstage** é uma plataforma de documentação inspirada no GitBook, focada em simplicidade e controle total para o administrador. Diferente de outras ferramentas, o cloudstage permite que você decida exatamente em qual **domínio customizado** cada coleção de documentos responderá, mantendo uma interface minimalista e profissional.

### **Destaques do Sistema:**
- ![Next.js](https://img.shields.io/badge/-black?style=flat-square&logo=nextdotjs&logoColor=00ff00) **Core**: Next.js 15+ com App Router para máxima performance.
- ![Tailwind](https://img.shields.io/badge/-black?style=flat-square&logo=tailwindcss&logoColor=00ff00) **Estilo**: Tailwind CSS 4 com tema Dark/Green exclusivo.
- ![Prisma](https://img.shields.io/badge/-black?style=flat-square&logo=prisma&logoColor=00ff00) **Dados**: Prisma ORM com SQLite para persistência simples e eficaz.
- ![Multi-domain](https://img.shields.io/badge/-black?style=flat-square&logo=internetexplorer&logoColor=00ff00) **Publicação**: Controle granular de domínios via Host Headers.
- ![Markdown](https://img.shields.io/badge/-black?style=flat-square&logo=markdown&logoColor=00ff00) **Editor**: Suporte completo a Markdown com renderização otimizada.

---

## **Stack Técnica**

| Categoria | Tecnologias |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, NextAuth.js |
| **Persistência** | Prisma ORM, SQLite |
| **Infraestrutura** | Nginx (Proxy Reverso), SSL Privado |

---

## **Instalação & Configuração**

### **Core Components**
![Node](https://img.shields.io/badge/Node.js-black?style=for-the-badge&logo=nodedotjs&logoColor=00ff00)
![Prisma](https://img.shields.io/badge/Prisma-black?style=for-the-badge&logo=prisma&logoColor=00ff00)
![NextAuth](https://img.shields.io/badge/NextAuth-black?style=for-the-badge&logo=auth0&logoColor=00ff00)

### **Guia Rápido**
1. **Clonagem e Dependências**:
   ```bash
   git clone https://github.com/rsdenck/cloudstage-app.git
   npm install
   ```

2. **Banco de Dados**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

3. **Execução**:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

---

## **Nginx & SSL Privado**

### ![Nginx](https://img.shields.io/badge/-black?style=flat-square&logo=nginx&logoColor=00ff00) **Configuração de Proxy**
O cloudstage foi desenhado para rodar atrás de um proxy reverso Nginx com certificados SSL privados (sem Certbot).

```nginx
server {
    listen 443 ssl http2;
    server_name 100.100.1.1;

    ssl_certificate /etc/nginx/ssl/cloudstage.crt;
    ssl_certificate_key /etc/nginx/ssl/cloudstage.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## **GitHub Stats (Cloudstage Context)**

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=rsdenck&show_icons=true&theme=react&bg_color=000000&title_color=00ff00&text_color=00ff00&icon_color=00ff00&border_color=00ff00&hide_border=false" alt="rsdenck GitHub Stats" />
</div>

---

## **Filosofia do Projeto**
- *"Design é o que resta quando você remove o desnecessário."*
- *"A documentação deve ser tão rápida quanto o código que ela descreve."*
- *"Simplicidade é o último grau de sofisticação."*

---

<div align="center">
  <p style="color: #00ff00; background-color: #000000; padding: 15px; border-top: 2px solid #00ff00; border-radius: 0 0 10px 10px;">
    <b>cloudstage | Documentação Moderna</b><br>
    Construído para desenvolvedores que valorizam clareza e controle.<br>
    <a href="https://github.com/rsdenck/cloudstage-app" style="color: #00ff00;">Repositório Oficial</a>
  </p>
</div>
