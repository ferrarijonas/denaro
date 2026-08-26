# Alice Concept Spec

O que o sistema é, pra quem, e onde começa e termina. Concept Spec diz **o porquê**; Eng Spec diz **a estrutura**; Stack Spec diz **com o quê**; ZenSpec diz **o comportamento**; código diz **como**.

---

## Intenção

Este sistema existe para que **Alice e sua ajudante** consigam **definir o preço certo de cada peça de cerâmica** sem precisar de **planilhas, contas de cabeça ou medo de cobrar errado**.

Metáfora: é uma **etiquetadora de preços** — você põe os dados da peça, e ela imprime o preço de venda na hora.

---

## O que é

O **Alice** é um **precificador de peças de cerâmica artesanal** que roda como **aplicação web na nuvem** (hospedagem estática gratuita) e é acessado pelo **celular de qualquer lugar**, sem instalar nada.

Ele calcula o **custo da peça** (material + mão de obra) a partir de poucos dados e mostra o **preço de venda sugerido em várias margens de lucro**, além de guardar os **custos de referência** (argila, esmaltes, hora de trabalho) e permitir **reaproveitar peças já calculadas**.

Metáfora: uma **calculadora de costureira** — poucos números entram, o preço justo sai.

---

## Para quem é (e não é)

- **Para quem é**: Alice (ceramista) e **1 ajudante** que precisam precificar peças de cerâmica com rapidez e consistência.  
- **Para quem não é**: lojas com estoque e vendas, equipes grandes, empresas que precisam de ERP ou controle financeiro completo.

Metáfora: serve para **um ateliê**, não para **uma fábrica**.

---

## Problema

Hoje, precificar uma peça depende de:

- contas manuais que esquecem **custo do esmalte** ou **tempo de trabalho**;
- medo de **cobrar barato demais** (prejuízo) ou caro demais (perde venda);
- margens definidas "no chute", sem saber o quanto se ganha;
- custos de argila e esmaltes que mudam e ficam **desatualizados na cabeça**.

Metáfora: é precificar como **cozinhar sem receita** — às vezes sai bom, às vezes sai caro.

---

## Diferencial

| Aspecto                | Alice                                                        | Alternativas comuns                       |
| ---------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Local de uso           | **Celular, na rede de casa**, em poucos toques               | Planilha no computador, contas em papel   |
| Dados necessários      | **4 entradas** (peso, custo do esmalte %, dificuldade, tempo) | Formulários longos de ERP                 |
| Resultado              | **Preço em várias margens** de uma vez                       | Uma única conta, sem comparação           |
| Simplicidade           | **Feito para quem não é contador**                           | Planilhas com fórmulas frágeis            |
| Dados guardados        | **Custos de referência + peças reaproveitáveis**             | "Na cabeça" ou papel solto                |

Metáfora: em vez de abrir a **planilha no computador**, a Alice abre o **celular e precifica no corredor do ateliê**.

---

## Promessas

### Escopo inicial (v1)

- **Precificação em poucos toques**: peso da argila, custo do esmalte em %, dificuldade artística e tempo de execução viram o custo da peça.  
- **Preço em cada margem**: a mesma peça mostra o preço de venda em várias margens de lucro, pra Alice escolher.  
- **Parte de custos**: cadastro e edição simples dos custos de referência (preço do kg de argila, custo dos esmaltes, valor da hora de trabalho).  
- **Peças salvas**: cada peça calculada pode ser salva e reaproveitada depois.  
- **Acesso pelo celular**: funciona no navegador do celular, sem instalar nada, de qualquer lugar (basta o link).

### Escopo futuro (planejado)

- **Importar das planilhas atuais** (custos de aquarelas/esmaltes já existentes).  
- **Lista de peças com filtro** por material, dificuldade ou data.  
- **Cliente acompanhando orçamento** por link compartilhado.

Metáfora: começa como uma **etiquetadora de preços**, evolui para um **caderno de receitas do ateliê**.

---

## Princípios

- **Simplicidade máxima.** Cada tela resolve uma coisa e cabe no celular.  
  Metáfora: interface de **micro-ondas**, não de **painel de avião**.

- **Mobile-first.** A Alice usa no celular; o desktop é opcional.  
  Metáfora: o ateliê anda, o sistema anda junto.

- **Grátis e em qualquer lugar.** Hospedagem estática gratuita (GitHub Pages) + dados e fotos na nuvem gratuita (Firestore + Storage Spark), com cache no aparelho.  
  Metáfora: uma **etiquetadora que cabe no bolso** — sem máquina para manter.

- **Preço auditável.** Dá pra ver exatamente **de onde veio cada valor** do preço final.  
  Metáfora: **conta mostrada na lousa**, não mágica no bolso.

- **Documentação como contrato.** Spec antes de código, seguindo o ZenSpecKit.  
  Metáfora: construir com **planta aprovada**, não "puxadinho" improvisado.

---

## Fronteiras

O Alice **não é**:

- um ERP, sistema de estoque ou de vendas;  
- um sistema financeiro/contábil completo;  
- uma loja virtual ou app de e-commerce;  
- um sistema que exige servidor pago para funcionar (Firestore Spark e GitHub Pages são gratuitos; sem máquina para manter).

O Alice **não cobre** (neste conceito base):

- controle de estoque ou compras;  
- emissão de nota fiscal ou financeiro;  
- gerenciamento de clientes e pedidos.

Metáfora: é o **cérebro do preço**, não o **corpo da empresa**.

---

## Decisões

- **Foco em precificação** → porque é a dor imediata da Alice, e o resto (estoque, vendas) fica para depois.  
- **Web app acessível de qualquer lugar** → porque a Alice quer abrir o precificador no celular com o link, sem depender de rede local ou servidor ligado.  
- **Hospedagem estática gratuita (GitHub Pages) + dados na nuvem (Firestore + Storage)** → porque coloca o app no ar com custo zero e sincroniza os custos, o histórico de preços e as fotos entre os aparelhos de Alice e da ajudante, sem nada se perder.
- **Custo = material + mão de obra** → material vem de argila e esmalte; mão de obra vem de tempo × valor da hora (ajustado pela dificuldade).  
- **Margem exibida como múltiplos preços** → porque a Alice quer comparar e escolher quanto cobrar, não ser presa a uma única margem.  
- **Custos de referência centralizados** → porque argila e esmaltes mudam de preço e precisam ser atualizados num lugar só.  
- **Integração com as planilhas atuais só no futuro** → porque hoje o que vale é precificar rápido; importar planilha vem depois, sem bloquear o v1.

---

## Seções opcionais

### Mapa de contexto

`Alice / Ajudante` → **celular (navegador)** → `GitHub Pages (UI)` → `Firestore (dados na nuvem)` + `Storage (fotos)` + `localStorage (cache)`

Metáfora: o celular é o **balcão**; a nuvem é a **gaveta de arquivos** que Alice e a ajudante dividem, com as fotos na mesma gaveta.

### Origem

O Alice nasce do trabalho manual de precificar peças de cerâmica com planilhas e contas de cabeça, que deixava a Alice insegura sobre quanto cobrar. A ideia é dar a ela um **caminho rápido e auditável do custo ao preço**, sem sair do ateliê.

### Nome

"Alice" é o nome da ceramista — o sistema carrega o nome de quem ele serve, como uma **ferramenta de bancada personalizada**.
