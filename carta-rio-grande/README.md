# Carta do Rio Grande pelo Brasil — site

Site estático (HTML, CSS e JS puros, sem build) com 4 abas: **A Carta**, **Referências**,
**Assinaturas** e **Contato**. O visual segue o selo da carta: tinta azul sobre papel.

## Ver no computador
**Jeito mais fácil:** dê dois cliques em `carta-rio-grande-arquivo-unico.html`. Ele já tem as cores, as imagens e as funções dentro dele e funciona até se for copiado sozinho para outro lugar (só as fontes precisam de internet).

A versão em pastas (`public/`) é a que vai para o ar. Para ver essa versão, **descompacte o zip primeiro**. Abra `public/index.html` no navegador, ou rode `cd public && python3 -m http.server 8080`
e acesse http://localhost:8080.

## Publicar
- **Netlify (mais fácil):** acesse https://app.netlify.com/drop e arraste a pasta `public`.
- **Vercel:** importe o repositório e escolha a pasta `carta-rio-grande` como Root Directory.

Cada aba tem seu próprio link: `#carta`, `#referencias`, `#assinaturas` e `#contato`.

## Assinar
Os botões **Assinar** (topo) e **Assinar a carta** (fim da carta) abrem o Google Forms em nova aba.

## Contato
A aba **Contato** mostra o Instagram (@riograndepelobrasil) e o e-mail (riograndepelobrasil@gmail.com), que também aparecem no rodapé.

## Lista de assinaturas
O site lê as colunas B, D e H da planilha de respostas. Para funcionar, a planilha precisa estar compartilhada como **"Qualquer pessoa com o link → Leitor"**.

## Editar textos
- **Carta:** parágrafos dentro de `<div class="letter-body">` no `index.html`.
- **Referências:** itens `<li>` dentro de `<ol class="refs">`. A numeração e o filtro são automáticos.

## Domínio
O site está em https://riograndepelobrasil.com.br/ — a imagem de prévia (WhatsApp/redes) já usa esse endereço.
