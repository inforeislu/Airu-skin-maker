# Airu Skin Maker PWA

Editor web progressivo para criar, validar e exportar temas Airu. Funciona no navegador, guarda os dados localmente e pode ser instalado em dispositivos compatíveis.

## Funcionalidades

- Biblioteca local de temas, edição de cores e metadados, pesquisa, duplicação e importação/exportação JSON.
- Pré-visualização adaptável do tema e atalhos para paletas.
- Harmonizador cromático, extração de paleta por fotografia e auditoria local de contraste WCAG.
- Snapshots locais com restauro e comparação A/B.
- Geração de CSS, configuração Tailwind, manifesto Airu e cartão Showcase PNG 1200 × 750.
- Cache offline via service worker.

Os temas e snapshots ficam no armazenamento do navegador. Não são sincronizados entre dispositivos. As ferramentas do PWA não substituem os estúdios nativos de áudio, transmissão, hardware ou a integração com os ficheiros locais do macOS.

## Testar localmente

Com Python 3 instalado:

```bash
python3 -m http.server 4173
```

Abre `http://localhost:4173`. O service worker funciona em `localhost` e em alojamentos HTTPS.

## Publicar no GitHub Pages

1. Cria no GitHub um repositório **público vazio** chamado `airu-skin-maker`. Não seleciones a criação automática de README, licença ou `.gitignore`.
2. No Terminal, entra na pasta local do PWA:

   ```bash
   cd "/caminho/para/SkinMaker/PWA"
   ```

   Substitui o caminho pelo local onde guardaste a pasta `PWA/`.

3. Se ainda não inicializaste o Git nesta pasta, configura a identidade Git (se necessário) e cria o primeiro commit:

   ```bash
   git init -b main
   git add .
   git commit -m "Prepare Airu Skin Maker PWA for GitHub Pages"
   ```

4. Liga o repositório local ao endereço HTTPS que o GitHub mostrar na página do repositório e envia o branch:

   ```bash
   git remote add origin https://github.com/TEU-UTILIZADOR/airu-skin-maker.git
   git push -u origin main
   ```

   Substitui `TEU-UTILIZADOR` pelo teu nome de utilizador GitHub. Não partilhes nem coloques tokens de acesso em ficheiros ou mensagens.

5. O workflow tenta ativar o GitHub Pages e selecionar GitHub Actions automaticamente. Se a organização ou as permissões da conta impedirem essa ativação, abre **Settings → Pages** e define **Build and deployment → Source → GitHub Actions**.
6. Em **Actions**, confirma que a execução “Publish PWA” terminou com sucesso. O endereço será:

   ```text
   https://TEU-UTILIZADOR.github.io/airu-skin-maker/
   ```

Cada `git push` para `main` publica a atualização seguinte. A primeira publicação pode demorar alguns minutos.

## Atualizar a publicação

Depois de alterar o PWA:

```bash
git add .
git commit -m "Describe the PWA update"
git push
```
