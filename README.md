# Site DEKOLE — projeto standalone

Este é o site do Centro de Ensino DEKOLE pronto para rodar fora do Claude, em qualquer hospedagem própria.

## Rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Gerar a versão de produção

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos finais (HTML, CSS, JS) prontos para publicar em qualquer hospedagem estática.

## Publicar com domínio próprio

Qualquer uma dessas opções funciona bem para este projeto (é um site estático):

- **Vercel**: crie uma conta em vercel.com, importe este projeto (ou arraste a pasta), e clique em publicar. O Vercel detecta o Vite automaticamente.
- **Netlify**: mesma ideia — importe o projeto ou arraste a pasta `dist/` depois do build. Comando de build: `npm run build`, pasta de publicação: `dist`.
- **Hospedagem própria**: depois do `npm run build`, envie o conteúdo da pasta `dist/` para qualquer servidor de arquivos estáticos (cPanel, Hostinger, etc.).

Em qualquer uma dessas opções, você pode apontar seu domínio próprio (ex: `www.dekole.com.br`) normalmente, sem nenhuma marca do Claude no resultado final.

## Como os dados são salvos

O site guarda os cursos e as configurações (telefone, Instagram, textos, etc.) no **localStorage do navegador** — ou seja, ficam salvos no navegador de quem está usando o painel ADM. Isso significa:

- Funciona perfeitamente para um único administrador testando ou administrando pelo mesmo navegador/computador.
- **Não sincroniza automaticamente entre pessoas ou dispositivos diferentes** — se você editar um curso no computador da loja e depois abrir o painel no celular, as alterações não aparecem lá, porque são dois "bancos de dados" (dois navegadores) separados.

Para múltiplos administradores ou acesso de qualquer lugar com os mesmos dados, o próximo passo é conectar um banco de dados real (veja abaixo).

## Sobre a segurança do painel ADM

O acesso ao painel hoje é protegido por uma senha simples, guardada e conferida no próprio navegador. Isso é adequado como uma barreira básica, mas **não é uma autenticação segura de verdade** — qualquer pessoa com conhecimento técnico pode inspecionar o código do site e contornar essa senha, e todos os cursos (inclusive os ocultos) chegam ao navegador de qualquer visitante, mesmo sem login.

Quando o site estiver publicado com domínio próprio e uso real, o recomendado é:

1. Criar um backend simples com autenticação de verdade — opções fáceis de configurar: [Supabase](https://supabase.com) (Postgres + autenticação prontos) ou [Firebase](https://firebase.google.com/) (Auth + Firestore).
2. Mover os dados dos cursos desse backend para um banco de dados real, em vez do localStorage.
3. Proteger as rotas de edição para que só um usuário autenticado consiga alterar os cursos.

Esse é um passo de desenvolvimento adicional — se quiser, posso ajudar a estruturar essa parte depois.

## Sobre a função "Adicionar curso por link"

Essa função usa a API da Anthropic para tentar ler e estruturar automaticamente as informações de uma página. Dentro do Claude.ai, isso funciona sem configuração. **Fora do Claude, ela deixa de funcionar sozinha**, porque exige uma chave de API própria da Anthropic — e essa chave nunca deve ficar exposta direto no código do navegador.

Para manter essa função funcionando depois de hospedar o site fora do Claude, você precisaria:

1. Criar uma pequena API própria (por exemplo, uma função serverless na Vercel/Netlify) que recebe o link ou o texto colado.
2. Essa API chama a API da Anthropic usando sua chave, guardada em segredo no servidor (nunca no navegador).
3. O painel ADM passa a chamar essa sua API em vez de chamar a Anthropic diretamente.

Até que isso seja implementado, use a opção de colar as informações manualmente no formulário do curso — ela sempre funciona, com ou sem essa função de importação automática.

## Estrutura do projeto

```
dekole-project/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx      → ponto de entrada do React
│   └── App.jsx        → todo o site (público + painel ADM)
└── README.md
```

Todo o site — páginas públicas e painel administrativo — está em `src/App.jsx`, em um único arquivo para facilitar a leitura e a manutenção. Se o projeto crescer bastante, vale considerar separar em arquivos menores (dados, componentes, páginas).
