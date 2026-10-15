# Portfólio

Site de portfólio com duas faces (programação e marketing) e um painel em `/admin` para editar tudo sem mexer em código.

- **Next.js** para o site e o painel
- **Supabase** (gratuito) para guardar o conteúdo, os prints e os vídeos
- **Vercel** (gratuito) para hospedar, com endereço grátis `seu-nome.vercel.app`

## Rodar no seu computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O painel fica em http://localhost:3000/admin, com a senha que está em `.env.local` (`ADMIN_PASSWORD`).

Sem Supabase configurado, o site roda em **modo local**: o que você salvar no painel vai para `data/content.local.json` e os arquivos para `data/uploads/`. O conteúdo inicial (exemplos) está em `data/seed.json`.

## Colocar no ar (tudo gratuito)

### 1. Supabase (banco e arquivos)

1. Crie uma conta em https://supabase.com e um projeto novo.
2. No menu **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria a tabela do conteúdo e o bucket `media` para os prints.
3. Em **Project Settings › API**, copie:
   - a **Project URL** → vai em `SUPABASE_URL`
   - a chave **service_role** (secreta) → vai em `SUPABASE_SERVICE_ROLE_KEY`

> A chave `service_role` dá acesso total ao seu banco. Ela só fica nas variáveis do servidor (Vercel) e nunca deve ir para o código ou para o GitHub.

### 2. GitHub

Crie um repositório (pode ser privado) e envie o projeto:

```bash
git init
git add .
git commit -m "Portfólio"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portfolio.git
git push -u origin main
```

O `.gitignore` já impede que `.env.local` e os arquivos do modo local subam.

### 3. Vercel (hospedagem)

1. Crie uma conta em https://vercel.com entrando com o GitHub.
2. **Add New › Project**, escolha o repositório e, antes de clicar em Deploy, abra **Environment Variables** e adicione:

| Nome | Valor |
| --- | --- |
| `ADMIN_PASSWORD` | uma senha forte, diferente da de teste |
| `SESSION_SECRET` | um texto aleatório longo (32+ caracteres) |
| `SUPABASE_URL` | do passo 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | do passo 1 |
| `SUPABASE_BUCKET` | `media` |

3. Clique em **Deploy**. Em um ou dois minutos o site está em `nome-do-projeto.vercel.app`.
4. Para trocar o endereço: **Settings › Domains**. Se comprar um domínio depois (`.com.br` custa cerca de R$ 40/ano no registro.br), é só adicioná-lo ali.

Depois disso, entre em `seu-site.vercel.app/admin`, troque os projetos de exemplo pelos seus e salve. A cada `git push` a Vercel publica a versão nova do código; o conteúdo editado no painel não depende de deploy.

## Onde mexer

| O quê | Onde |
| --- | --- |
| Textos, projetos, cursos, contato | Painel `/admin` |
| Cores das duas faces | `src/app/globals.css`, blocos `html[data-face="dev"]` e `html[data-face="mkt"]` |
| Desenhos do fundo | `src/components/Marks.tsx` |
| Página inicial | `src/app/(site)/page.tsx` |
| Páginas de projetos | `src/components/ProjectsView.tsx` e `src/app/(site)/projeto/[slug]/page.tsx` |

## Dicas para os projetos

- **Prints:** PNG ou JPG com até ~2 MB cada. O primeiro print vira a capa (dá para trocar no painel).
- **Vídeos:** os curtos podem subir direto (o plano grátis do Supabase aceita até 50 MB por arquivo). Para vídeos maiores, suba no YouTube como “não listado” e cole o link no painel.
- **Sem print ainda?** O site desenha uma capa automática com o principal resultado ou as tecnologias do projeto.
