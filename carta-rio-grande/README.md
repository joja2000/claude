# Carta do Rio Grande pelo Brasil — site

Site estático (HTML, CSS e JS puros, sem build) com 4 abas: **A Carta**, **Referências**,
**Assinaturas** e **Instagram**. O visual segue o selo da carta: tinta azul sobre papel.

## Ver no computador
**Jeito mais fácil:** dê dois cliques em `carta-rio-grande-arquivo-unico.html`. Ele já tem as cores, as imagens e as funções dentro dele e funciona até se for copiado sozinho para outro lugar (só as fontes precisam de internet).

A versão em pastas (`public/`) é a que vai para o ar. Para ver essa versão, **descompacte o zip primeiro**. Abra `public/index.html` no navegador, ou rode `cd public && python3 -m http.server 8080`
e acesse http://localhost:8080.

## Publicar
- **Netlify (mais fácil):** acesse https://app.netlify.com/drop e arraste a pasta `public`.
- **Vercel:** importe o repositório e escolha a pasta `carta-rio-grande` como Root Directory.

Cada aba tem seu próprio link: `#carta`, `#referencias`, `#assinaturas` e `#instagram`.

## Quando o Google Forms ficar pronto
Abra `public/assets/js/main.js` e preencha no topo:

```js
var FORM_URL = 'https://docs.google.com/forms/d/e/SEU_ID/viewform';
```

O formulário aparece embutido na aba **Assinaturas**, com um botão para abrir em nova aba.
A lista "Quem já assinou" ainda é só um espaço visual. Para mostrar os nomes, dá para ligar
a planilha de respostas do Forms ao site depois.

## Quando o Instagram existir
No mesmo arquivo:

```js
var INSTAGRAM_URL = 'https://www.instagram.com/seuperfil/';
var INSTAGRAM_HANDLE = '@seuperfil';
```

O botão "Em breve" vira "Seguir no Instagram". Os 6 quadrados são prévias com frases da carta.

## Editar textos
- **Carta:** parágrafos dentro de `<div class="letter-body">` no `index.html`.
- **Referências:** itens `<li>` dentro de `<ol class="refs">`. A numeração e o filtro são automáticos.

## Antes de divulgar
- Troque `og:image` no `index.html` pelo endereço completo depois de publicar
  (ex.: `https://seusite.com.br/assets/img/og-image.png`). Assim a prévia aparece no WhatsApp e nas redes.


> O `carta-rio-grande-arquivo-unico.html` é uma cópia gerada a partir de `public/`. Se você editar o site, gere de novo ou edite os dois.
