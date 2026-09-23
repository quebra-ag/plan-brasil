# Proposta para Concorrência dos 30 anos da Plan Brasil — Agência Quebra

Hotpage estática, pronta para GitHub Pages (`quebra-ag.github.io/<repo>/`).

## Estrutura
```
index.html              página completa
assets/css/style.css    estilos (tokens, header/footer, seções 01–12)
assets/js/main.js       navegação, abertura, acordeões, cases scroll-driven
assets/js/gsap.min.js + ScrollTrigger.min.js (hospedados localmente)
assets/fonts/           Bricolage Grotesque + Manrope (woff2 variáveis)
assets/img/             IM_01–IM_22 otimizadas (webp/png) + logos Quebra
assets/docs/            Case Minidoc Aceleradas.pdf (21 MB)
```

## Publicar
1. Suba a pasta inteira na raiz do repositório (ou na branch `gh-pages`).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Sem build, sem dependências externas: fontes, GSAP e imagens estão no próprio repositório.

## Notas
- `<meta name="robots" content="noindex">` está ativo por ser proposta nominal a cliente. Remova se quiser indexação.
- Cases: scroll-driven (pin + snap) só no desktop (≥ 961 px) e sem `prefers-reduced-motion`; no mobile a seção rola normalmente.
- Âncoras estáveis: `#contexto`, `#leitura-estrategica`, `#nossa-visao`, `#por-que-a-quebra`, `#proposta-comercial`, `#vamos-juntos`.
