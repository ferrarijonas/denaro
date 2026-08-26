# Padrão ouro 2026 — Pesquisa: custo de queima (forno) em ateliês do Japão, Alemanha, EUA e Itália

Pesquisa de estado-da-arte (agosto/2026) sobre **como ateliês renomados calculam e cobram a queima** — a parte que falta no modelo de precificação do Alice. Complementa `padrao-ouro-2026-pesquisa.md` (§4–8 cobrem frete/canais/imposto; este documento cobre **só a queima**). Inclui os 3 cenários da Alice: **queimar no próprio forno**, **queimar fora (serviço externo)** e **peças sem queima**.

---

## 1. O consenso central: a queima tem DUAS camadas (nunca confundir)

Em todos os 4 países, ateliês sérios separam duas perguntas (ClayCalc EUA, Brennkostenrechner DE, tabelas japonesas de 貸窯/窯使用料, prezzari italianos):

```
Custo direto da queima  = energia + desgaste (elementos/resistência/termostato) + mão de obra da queima
Preço/tarifa da queima  = custo direto + rateio de overhead + reserva de risco + margem
```

- **A conta de energia é uma coisa; a decisão de quanto cobrar é outra.** A tarifa cobre muito mais que a luz.
- Reservas separadas recomendadas: (a) elementos/controles, (b) prateleiras/pinos/utensílios, (c) amortização/reposição do forno. Revisar anualmente.
- Exemplo real consolidado (Lakeside Pottery EUA): energia €13,48 + ventilador €1 + amortização forno €6,25 + manutenção €5,75 + espaço €21,60 + seguro €20 + miscelânea €2 = **~$70 por queima** — energia é ~20% do custo real.

**Decisão para o Alice:** o custo de queima de uma peça NUNCA é "só a energia". O forno tem custo de desgaste, mão de obra de carregar/descarregar e participação do overhead — mesmo que a conta de luz não apareça.

---

## 2. A conta de energia é universal (mesma fórmula nos 4 países)

Fórmula idêntica na literatura dos EUA (Ardent Seller, Kiln Frog, Soul Ceramics, Lakeside), Alemanha (Formwerk Berlin, Brennkostenrechner) e implícita nas tarifas japonesas por kW do forno:

```
Energia (kWh) = potência do forno (kW) × horas de queima × ciclo de trabalho (duty cycle)
Custo energia  = kWh × preço do kWh
```

- **Duty cycle** (fração do tempo em que as resistências estão ligadas): **bisque ~35–50%**, **queima de esmalte ~60–65%**, **pré-aquecimento (candling) ~15%**, vidro ~75%. Resistências velhas → duty cycle sobe.
- Preferível **medir com medidor de kWh** que estimar pela placa (varia por carga, temperatura, tensão, idade das resistências).
- **Referência de custo por queima (2026, forno médio 7–11 kW):**
  - EUA: $8–25 de energia (cone 6); custo real total $15–40 por queima. Exemplo KM-1027 (11,5kW): bisque 51,8 kWh → $9,24; glaze 86,4 kWh → $15,41; ciclo completo $24,65 (US$0,178/kWh).
  - Alemanha: €2–4 (pequeno 230V ~2,5kW), €7–12 (médio ~7kW, 1.280°C), €14–22 (grande ~12kW). A 0,32€/kWh.
  - Japão: tarifas por **tamanho do forno** (elétrico 3/4/5/12/15 kW): bisque ¥1.360–7.770, queima principal ¥1.620–9.070 por carga (Shigaraki Share Studio).
  - Itália: não publica energia, cobra direto por kg/peça/forno.

**Decisão para o Alice:** entrada poka-yoke = "qual é o teu forno?" (potência kW ou medido em kWh) + "quanto custa teu kWh" + tipo de queima → o app calcula a energia. Quem não sabe o kW → default sugerido de forno médio.

---

## 3. O ciclo é sempre dividido em bisque + esmalte (e conta os DOIS)

Nenhum ateliê sério trata "queima" como uma coisa só. Todos separam **1ª queima (bisque)** e **2ª queima (esmalte/alta)**:

| País | 1ª queima (bisque) | 2ª queima (esmalte) |
| ---- | ------------------ | ------------------- |
| EUA | bisque cone 04/06, 40–60% mais barato | glaze cone 6, ~65% duty cycle |
| Japão | 素焼 (suyaki) | 本焼 (honyaki) — sempre tabela separada |
| Alemanha | Schrühbrand 900–950°C | Glasurbrand baixo 1.050°C / alto 1.220–1.280°C |
| Itália | biscotto 950–980°C | smalto bassa 1.020–1.040°C / alta gres 1.210–1.280°C |

- **Custo por peça = (custo bisque ÷ peças na carga de bisque) + (custo esmalte ÷ peças na carga de esmalte).** As cargas raramente têm o mesmo tamanho — calcular separado (Ardent Seller).
- Single-fire (esmalte no cru) ou raku = **1 ciclo**; padrão = **2 ciclos**. O multiplicador de ciclos é a regra (ClayCalc Unit Cost): `custo queima/peça = (custo da queima ÷ peças na carga) × nº de ciclos`.
- **Peça sem queima = zero ciclos = custo de queima 0.** Nunca confundir com "queima grátis" — simplesmente não há queima.

**Decisão para o Alice:** o app pergunta "quantas queimas essa peça leva?" → 0 (sem queima), 1 (single-fire/raku), 2 (bisque+esmalte). Cada ciclo com sua carga própria de peças.

---

## 4. Unidade de rateio: 4 padrões consagrados (escolher e PUBLICAR)

Ateliês de todos os países rateiam o custo do forno por uma destas unidades — qualquer uma funciona se aplicada **de forma consistente e publicada** (ClayCalc):

### 4.1 Por peso (kg) — o mais comum em Alemanha, Itália e Japão (代焼/daiyaki)
| País | 1ª queima | 2ª queima |
| ---- | --------- | --------- |
| Alemanha | €3–9/kg | €4–16/kg (mais comum: ~6 / 10 / 15 €/kg nas 3 faixas) |
| Itália | €3–7/kg (MUD €3, Kumi €7) | €9–12/kg |
| Japão | ¥100/80g (Yokohama), ¥400/100g | mesmo preço por peso |
| EUA | $0,50–1,50/lb em estúdios comunitários (~$1,10–3,30/kg) | — |

### 4.2 Por volume (cm³ ou pol³) — padrão dos estúdios comunitários dos EUA e de fornos públicos do Japão
- EUA: $0,06–0,10/pol³ (caneca 60 pol³ → ~$3,60; 2 queimas inclusas e uso de esmaltes). "Firing box" de Gailanna Pottery = grade 3D de medição.
- Japão (municipal de Chofu): tabela por cm³ — ¥200 (≤400cm³) até ¥8.300 (27.000cm³); medição por caixa envolvente, mínimo 3cm, máx 30cm.
- Japão (hokekyo-an, Izu, 4 artistas residentes): `(diâmetro + altura) × ¥66/cm` → ochoko ¥550, yunomi ¥880, chawan ¥1.100, donburi ¥1.650. "Sem contar a argila excedente → justo."

### 4.3 Por peça com faixas de tamanho — padrão japonês de 窯元 e italianos
- Japão (Hiryugama 飛龍窯): faixas por maior dimensão — bisque ¥300–1.700, queima ¥400–2.500 (passos de 10cm).
- Itália (Mosca Bianca): peça única por dimensões cm → €8–56 (baixa) e €9–56 (alta). (Ceramica Ostile: a partir de €3/7/10 por faixa de temperatura.)

### 4.4 Forno inteiro / fração (fração, metade, inteiro) — universal
- EUA: quarter/half/full kiln $70–350; forno inteiro $60–175 (Potters Shop).
- Alemanha: forno inteiro €35–190; "Exklusivbrand" €49–179 conforme tamanho do forno.
- Japão: aluguel de forno ¥4.000–53.550 por queima (artclay: gás 0,25m³ bisque ¥17.850 / main ¥53.550; comondo: ¥7.500/¥12.500; Marunuma até ¥108.450 set).
- Itália: forno inteiro €45–80 (Ceramica Ostile 45/55/70; Mosca Bianca 65/80).

**Regra de ouro (ClayCalc):** por-peça é ruim quando caneca e escultura dividem o mesmo preço. Usar faixas de tamanho + mínimo de manuseio, ou volume/peso, ou fração de forno. **Publicar a regra** e usar espaço útil (depois de prateleiras, pinos e folgas).

**Decisão para o Alice:** o app deixa escolher a unidade (kg, volume, faixa de peça, fração de forno) uma vez por configuração, e usa sempre a mesma. Para peças da própria Alice, o custo sai da fração de forno que a peça ocupa × custo por queima — não por "chute".

---

## 5. Quem queima comigo (compartilhado) vs quem queima fora (serviço externo)

Este é o ponto mais rico da pesquisa e casa direto com o cenário da Alice (pessoas que queimam com ela / pessoas que queimam fora).

### 5.1 Diferencial membro vs externo: **universal, 1,5–2×**
Todos os 4 países cobram mais de quem é de fora do que de quem participa do estúdio:
- **Japão:** Shigaraki Share Studio — externos pagam ~1,8×; SCCP Saitama — fora da província = **2×**.
- **EUA:** BKLYN CLAY — não-membro 8¢ vs membro 4¢/pol³ (**2×**); Potters Studio — contrato $35–43,5/pé³ vs membros $19,55–22,55 (**~1,8×**).
- **Alemanha:** Ceramic Kingdom Berlin — interno 9€/kg + 5€ material vs externo 15€/kg (**~1,7×**).
- **Itália:** menos explícito, mas membresia/coworking sempre dá desconto nas cotture.

### 5.2 Estrutura japonesa de compartilhamento (o modelo mais maduro do mundo)
O Japão institucionalizou em duas formas — **貸窯 (kashigama = aluguel de forno)** e **代焼 (daiyaki = queimar por terceiros)**:
- Tabela por **tipo de forno × tipo de queima × status (interno/externo)**, com preço fixo por carga (Shigaraki, Saitama, artclay).
- Fornos grandes (登り窯/anagama) compartilhados por cooperativa — o kama-share da TOMOS (registro imóvel com 52 câmaras). Tradição: em Kyoto, ceramistas vizinhos enchiam o mesmo forno juntos.
- Peça solta: por peso (¥100/80g) ou tamanho, **mínimo por pedido**, prazo de devolução (até 4 meses, espera lotar a carga — Yokohama).

### 5.3 Regra prática consolidada para "cobrar quem queima comigo"
1. Calcule o **custo real por queima** (energia + desgaste + mão de obra de carregar).
2. Defina a **unidade de rateio** (kg, volume, fração de forno) e publique.
3. Aplique **margem + overhead + risco** sobre o custo → vira a **tarifa**.
4. **Membro/parceiro = 1× a tarifa-base; externo = 1,5–2×.** 
5. **Forno cheio = preço fixo** (quando 1 pessoa ocupa tudo); **compartilhado = rateio por unidade**.
6. **Mínimo por pedido** para cobrir manuseio (receber, medir, carregar, avisar).

### 5.4 Quando a Alice queima FORA (serviço externo)
O custo é **o preço do serviço** (por kg/volume/fração) — entra no custo da peça como **custo direto de queima**, igual a matéria-prima. Não inventar: usar a tarifa real do fornecedor.

**Decisão para o Alice:** a queima tem dois papéis na mesma tela:
- **"Queimo no meu forno"** → custo interno (energia+desgaste+MO ÷ peças na carga × ciclos) entra no custo da peça.
- **"Queimo fora"** → custo = tarifa do serviço externo (por kg ou peça) entra no custo.
- **"Alguém queima no meu forno"** → não é custo de peça, é **receita do forno**: tarifa (custo × margem, externo 2×) cobrada de quem traz peça. Não entra no preço das peças dela — mas **enche o forno** e dilui o custo por peça das cargas dela.
- **"Peça sem queima"** → custo de queima = 0 (zero ciclos).

---

## 6. Mão de obra, mínimo e políticas de risco (o que a tarifa inclui)

### 6.1 Mão de obra é cobrada ou incluída — nunca invisível
A queima consome trabalho antes do botão: agendar, checar secura/esmalte, carregar, programar, cones de testemunha, descarregar, separar, comunicar, limpar. Tarifas sérias precificam isso (Potters Shop "includes loading and unloading"; Gut Moor lista as 5 etapas; Werkstatt Kinderhaus soma as horas de bestücken/ausladen/lagern). **Mínimo por pedido** para pequenas cargas: Alemanha €5–20; EUA $1/peça e $15/ordem; Itália mínimo por peça €3–10.

### 6.2 Políticas de risco e dano (padrão em todos)
- **Identificação obrigatória do material** (marca da argila + faixa de queima) para aceitar trabalho — EUA (Mud Clay, BKLYN CLAY exigem aprovação) e Alemanha (Gut Moor recusa sem dados).
- **Dano ao forno é do cliente:** prateleira arranhada por gotejamento $20 (Iris & Stone); reparo de placa €15–180 (Gut Moor); responsabilidade por fusão/terraglia (Mosca Bianca).
- **Perda/quebra é normal e NÃO é indenizada:** 5–15% de uma carga normal (Beancount), peças complexas até 20–30%. Japão declara abertamente "peças quebradas não serão indenizadas".
- **Reserva de risco** embutida na tarifa (ClayCalc) — cobre perda ordinária, não negligência.
- **Requeima/refire e 3º fogo custam extra** (EUA re-fire 3¢/pol³; Itália terzo fuoco separado; Japão 本焼RF = queima de redução com ágio ~1,3×).

### 6.3 Eficiência de carga é a alavanca nº 1
Forno cheio vs meio cheio custa o MESMO. Custo/peça cai com densidade: $15,41 numa carga de 35 canecas = $0,44/peça; com 15 = $1,03 (Kiln Shed). Compartilhar o forno (o cenário da Alice) é exatamente o mecanismo que reduz o custo/peça de todos.

**Decisão para o Alice:** a tela de queima pergunta pouco: forno (ou serviço externo), nº de peças na carga, nº de ciclos (0/1/2). **Mão de obra de queima, desgaste, mínimo e risco ficam embutidos na tarifa configurada** — nunca somados à mão visível à usuária.

---

## 7. O padrão ouro consolidado (Japão + Alemanha + EUA + Itália)

1. **Duas camadas:** custo direto (energia + desgaste + mão de obra) e tarifa (custo + overhead + risco + margem) — mantidas visíveis separadamente.
2. **Energia por fórmula única** (kW × horas × duty cycle × preço kWh) ou medição real; bisque 40–60% mais barato que esmalte.
3. **Sempre 2 queimas no padrão** (bisque + esmalte), contadas separadamente; single-fire = 1; sem queima = 0.
4. **Rateio por unidade publicada** (kg, volume, faixa de tamanho ou fração de forno), consistente; por-peça só com faixas + mínimo.
5. **Membro 1× / externo 1,5–2×**; forno cheio = preço fixo; mínimo por pedido para manuseio.
6. **Políticas explícitas:** material identificado, dano do cliente, perda não indenizada, refire/3º fogo/redução extra.
7. **Eficiência de carga manda** — compartilhar o forno reduz custo/peça de todos.

---

## Decisões registradas (para os ZenSpecs)

- **R19 — Queima em duas camadas:** `custoQueimaDireto = energia + desgaste + mão de obra de queima`; `tarifaQueima = custoDireto + overhead + risco + margem`. Configurável em `costsPanel`, nunca digitada na tela da peça.
- **R20 — Ciclos de queima:** peça pergunta "quantas queimas?" → **0** (sem queima), **1** (single-fire/raku), **2** (bisque + esmalte, padrão). `custoQueimaPeça = (custoDaQueima ÷ peçasNaCarga) × ciclos`; sem queima = 0.
- **R21 — Cenários de forno (poka-yoke):** (a) **"Queimo no meu forno"** → custo interno entra no custo; (b) **"Queimo fora"** → custo = tarifa do serviço externo (kg/peça) digitada; (c) **"Alguém queima comigo"** → não é custo de peça, é receita do forno (tarifa base × margem, externo 1,5–2×, mínimo por pedido); enche a carga e dilui o custo das peças dela. Regra: nunca somar receita de forno no preço de peça.
- **R22 — Rateio por unidade publicada:** escolher uma vez (kg, volume, faixa de tamanho, fração de forno) e usar sempre; por-peça exige faixas + mínimo de manuseio.
- **R23 — Forno configurável:** potência kW (ou kWh medido) + preço do kWh + duty cycle por tipo de queima (bisque 0,35–0,5 / esmalte 0,6–0,65); default de forno médio para quem não sabe.
- **R24 — Estimador de carga (TDAH-friendly):** nunca perguntar "quantas peças cabem?" em branco. Estimar **por peso** por padrão (`capacidadeKg do forno ÷ kgsArgila da peça` — sem pergunta nova) e **por tamanho** para peças largas (prato/travessa: diâmetro + altura → área de prateleira × nº de níveis). Resultado como **sugestão com slider**, nunca pergunta fria. Motivo: "quantas cabem" é raciocínio espacial (déficit do TDAH), e pratos são limitados por área, não por peso.
- **R25 — Avançado em fase futura:** desgaste (elementos/prateleiras), mão deobra da queima, overhead, margem da tarifa, depreciação do forno e o bloco "Quem queima comigo" (receita) ficam para uma fase posterior — estrutura conceitual definida nesta pesquisa (§1, §5), campos fora do v1.