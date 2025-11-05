# Metodologia de Desenvolvimento: Features Independentes

**Data**: November 5, 2025
**Última Atualização**: Planejamento pós-lançamento estruturado (4 fases)
**Contexto**: Estratégia de desenvolvimento modular para projetos complexos
**Baseado em**: Speckit framework + melhores práticas ágeis

## 🎯 Visão Geral

Esta metodologia define **estratégias de desenvolvimento** com features independentes, complementando as funcionalidades nativas do Speckit. Foca em decisões estratégicas, processos customizados e integração com ferramentas específicas do projeto.

**Nota**: Este documento NÃO inclui funcionalidades nativas do Speckit como estrutura de specs, formato de tasks, ou processos padrão. Consulte a documentação do Speckit para essas informações.

## �️ Tecnologias Ativas

- **Frontend**: TypeScript 5.x + React 18+ + shadcn/ui (16 componentes)
- **Backend**: Firebase (Firestore, Auth, Hosting, Functions)
- **Styling**: Tailwind CSS 4.x + CSS Variables + Dark Mode
- **Build**: CRACO + PostCSS + TypeScript strict mode
- **Testing**: Jest + React Testing Library + Contract tests
- **CI/CD**: GitHub Actions + Firebase CLI + Lighthouse CI

## �📋 Princípios Fundamentais

### **1. Features como Unidades Independentes**
Cada feature deve ser:
- **Autônoma**: Pode ser desenvolvida, testada e lançada independentemente
- **Valor Agregado**: Fornece valor mensurável aos usuários
- **Baixo Acoplamento**: Mínimas dependências com outras features
- **Alta Coesão**: Funcionalidades relacionadas agrupadas

### **2. Desenvolvimento Modular**
- **Specs Separadas**: Cada feature tem sua própria documentação completa
- **Branches Isoladas**: Desenvolvimento paralelo sem conflitos
- **Releases Independentes**: Deploy de features individualmente
- **Testes Isolados**: Validação independente de cada feature

### **3. Priorização por Valor**
- **MVP First**: Começar com a feature de maior valor/prioridade
- **Releases Frequentes**: Valor entregue incrementalmente
- **Feedback Contínuo**: Validação com usuários em cada release
- **Pivô Rápido**: Ajustes baseados em dados reais

## 🚀 Estratégias de Desenvolvimento

### **Opção A: Branches Separadas** (Recomendado para Times)
```
main/
├── specs/001-core-ecommerce/     # Branch: feature/001-core-ecommerce
├── specs/002-social-commerce/    # Branch: feature/002-social-commerce
├── specs/003-ai-automation/      # Branch: feature/003-ai-automation
└── specs/004-marketing-tools/    # Branch: feature/004-marketing-tools
```

**Quando Usar:**
- Times com 3+ desenvolvedores
- Desenvolvimento verdadeiramente paralelo
- Releases independentes frequentes
- Alto grau de incerteza técnica

**Vantagens:**
- ✅ Paralelização máxima
- ✅ Merge independente
- ✅ Rollback isolado
- ✅ Equipes especializadas

### **Opção B: Desenvolvimento Sequencial** (Recomendado para Início)
```
main/
└── specs/001-core-ecommerce/     # Trabalhar até completar
```
Depois:
```
main/
└── specs/002-social-commerce/    # Próxima feature
```

**Quando Usar:**
- Times pequenos (1-2 devs)
- Foco no aprendizado inicial
- Menos complexidade de coordenação
- Desenvolvimento mais previsível

**Vantagens:**
- ✅ Simplicidade de gestão
- ✅ Foco total em uma feature
- ✅ Menos overhead de branches
- ✅ Aprendizado progressivo

### **Opção C: Specs Planejadas** (Híbrido) - ATUAL
```
specs/
├── 001-core-ecommerce/     # ✅ Ativa (desenvolvendo)
└── [002-social-commerce]/  # 📝 Planejada (criar após conclusão da 001)
```

**Quando Usar:**
- Planejamento detalhado necessário
- Equipe quer visão completa
- Desenvolvimento sequencial mas planejamento paralelo

## 📋 Processo Customizado por Feature

### **Fase 1: Planejamento Estratégico** (1-2 dias)
1. **Definir Escopo**: User stories e requisitos claros
2. **Análise de Dependências**: Features requeridas vs opcionais
3. **Estimativa de Esforço**: Tamanho e complexidade técnica
4. **Definição de Métricas**: KPIs específicos da feature

### **Fase 2: Desenvolvimento Guiado por Speckit** (1-4 semanas) 🚀 EM ANDAMENTO
1. **Setup**: Ambiente e infraestrutura (usar quickstart.md) ✅ CONCLUÍDO
2. **Implementação**: Seguir tasks.md checklist gerado pelo Speckit ✅ PRONTO PARA INÍCIO
3. **Testes**: TDD com cobertura >80% (contratos + integração)
4. **Refinamento**: Performance e UX baseada em métricas

### **Fase 3: Validação Integrada** (2-3 dias)
1. **Testes Cross-Feature**: Integração com features existentes
2. **QA Especializado**: Testes manuais em dispositivos reais
3. **Performance Benchmarking**: Comparação com SLAs definidos
4. **Security Review**: Análise de vulnerabilidades específicas

### **Fase 4: Release Controlado** (1 dia)
1. **Deploy Gradual**: Feature flag para controle de exposição
2. **Monitoring Ativo**: Métricas em tempo real durante rollout
3. **Rollback Plan**: Estratégia documentada de reversão
4. **Knowledge Transfer**: Documentação para equipe de suporte

## 🎯 Critérios de Pronto Customizados

### **Feature Completa** (Checklist do Speckit + Custom)
- ✅ **Código**: Todas tasks do Speckit implementadas
- ✅ **Testes**: Cobertura >80%, contratos passando
- ✅ **Performance**: Benchmarks atendendo SLAs específicos
- ✅ **Analytics**: Métricas de negócio instrumentadas
- ✅ **Mobile**: Testado em iOS Safari + Chrome Android

### **Feature Lançável** (Integração + Business)
- ✅ **Integração**: APIs compatíveis com features existentes
- ✅ **Monitoramento**: Alertas configurados no DataDog
- ✅ **Documentação**: Runbook para operações atualizado
- ✅ **Suporte**: Equipe treinada para cenários críticos
- ✅ **Business**: Métricas de sucesso definidas e trackeadas

## 📊 Métricas de Sucesso Específicas

### **Por Feature (Business + Technical)**
- **Lead Time**: <2 semanas do commit ao deploy
- **Business Value**: Métrica principal (ex: conversão, retenção)
- **Performance**: <10% degradação vs baseline
- **Quality**: <5% bugs em produção (30 dias)
- **User Satisfaction**: >4.0/5.0 em feedback qualificado

### **Por Release (DevOps + Product)**
- **Deploy Frequency**: 1-2 releases por semana
- **MTTR**: <1 hora para incidentes P1
- **Feature Usage**: >X% adoção em 30 dias
- **Conversion Impact**: Aumento mensurável vs baseline

## ⚠️ Riscos e Mitigações Específicas

### **Riscos Técnicos do Projeto**
- **Firebase Scaling**: Mitigação - Monitoramento de quotas, cache inteligente
- **API Rate Limits**: Mitigação - Circuit breakers, fallback strategies
- **Mobile Performance**: Mitigação - PWA optimization, service workers
- **Real-time Updates**: Mitigação - WebSocket fallbacks, offline-first

### **Riscos de Processo**
- **Escopo Creep**: Mitigação - Features "done" vs "perfect", timeboxing
- **Coordenação Distribuída**: Mitigação - Daily standups, shared dashboards
- **Motivação Remota**: Mitigação - Reconhecimento público, milestones visíveis
- **Knowledge Silos**: Mitigação - Pair programming, documentação obrigatória

## 🛠️ Integração com Stack Específico

### **Ferramentas Customizadas**
- **Firebase**: Realtime DB, Auth, Hosting, Functions
- **shadcn/ui**: Component library completa (16+ componentes) com design system consistente
- **Analytics**: GA4 + Meta Pixel + CAPI + Custom events
- **Payments**: Mercado Pago integration com webhooks
- **Shipping**: Melhor Envio API com fallbacks
- **AI**: LangChain para product descriptions
- **CDN**: Firebase Hosting + service workers

### **CI/CD Customizado**
- **Branch Strategy**: GitFlow com feature branches protegidas
- **Testing Strategy**: Contract tests + E2E + Performance + TypeScript strict checking
- **Deploy Strategy**: Blue-green com feature flags + GitHub Actions workflow
- **Security**: Actions permitidas específicas via GitHub settings
- **Monitoring**: Custom dashboards por feature + Lighthouse CI para performance
- **Quality Gates**: ESLint, Prettier, test coverage >80%, PWA validation

### **Documentação Específica**
- **API Contracts**: OpenAPI 3.0 com exemplos reais
- **Mobile Considerations**: PWA + app detection
- **Performance Budgets**: Core Web Vitals targets
- **Security**: Firebase rules + input validation
- **UI Components**: shadcn/ui setup guide + custom variants

## 🛠️ Processo de Desenvolvimento Técnico

### **Setup de Infraestrutura**
1. **Firebase Configuration**: Hosting público alterado para 'public', Firestore com localização nam5, Cloud Functions com predeploy hooks
2. **shadcn/ui Implementation**: 16 componentes base instalados, design system com CSS variables, dark mode support, path aliases configurados
3. **TypeScript Setup**: Strict mode, path aliases (@/components, @/lib, @/ui), isolated modules
4. **Build Optimization**: CRACO para configuração customizada, PostCSS + Tailwind CSS

### **Workflow de Correção de Bugs**
1. **Identificação**: TypeScript errors, missing dependencies, incorrect prop types
2. **Análise**: Verificar tipos de dados, estrutura de componentes, dependências instaladas
3. **Correção**: Fix prop destructuring, install missing packages, update type definitions
4. **Validação**: Build testing, linting, type checking antes do commit
5. **Documentação**: Registrar padrões encontrados para evitar recorrência

### **Protocolo de Commits & Git Workflow**

#### **Quando Sugerir Commit (Agente AI)**
O agente deve **proativamente sugerir commits** nos seguintes momentos:

**✅ SEMPRE Sugerir Commit:**
1. **Feature Completa**: Task do `tasks.md` totalmente implementada e validada
2. **Bug Fix Validado**: Correção aplicada + testes passando + sem regressões
3. **Refactoring Estável**: Código refatorado + testes passando + comportamento preservado
4. **Documentação Crítica**: README, API contracts, ou guias de setup atualizados
5. **Config Changes**: Alterações em CI/CD, Firebase, ou infraestrutura validadas
6. **Breaking Point**: Antes de iniciar mudanças significativas (checkpoint de segurança)
7. **End of Session**: Fim de sessão de desenvolvimento com trabalho estável

**⚠️ AVISAR Antes de Commit:**
1. **Testes Faltando**: Código novo sem cobertura de testes adequada
2. **Linting Errors**: ESLint ou TypeScript errors presentes
3. **Build Failing**: `npm run build` com erros
4. **Incomplete Feature**: Task parcialmente implementada
5. **TODO Comments**: Comentários TODO críticos não resolvidos

**❌ NÃO Sugerir Commit:**
1. **Código Quebrado**: Qualquer erro de compilação ou runtime
2. **Work in Progress**: Implementação no meio de lógica complexa
3. **Experimental Code**: Código de teste/exploração não validado
4. **Conflitos Não Resolvidos**: Merge conflicts pendentes

#### **Formato de Sugestão de Commit**

```markdown
🔄 **Momento de Commit Detectado**

**Contexto**: [Descrição do que foi implementado]
**Validações**:
- ✅ TypeScript compilation: OK
- ✅ ESLint: No errors
- ✅ Tests: Passing (coverage: X%)
- ✅ Build: Successful

**Mensagem de Commit Sugerida**:
```
<type>(<scope>): <description>

<body com detalhes se necessário>
```

**Ações Sugeridas**:
1. [ ] Review changes: `git diff`
2. [ ] Stage files: `git add <files>`
3. [ ] Commit: `git commit -m "<message>"`
4. [ ] Push (se apropriado): `git push origin <branch>`

Deseja prosseguir com o commit?
```

#### **Conventional Commits (Obrigatório)**

**Formato**: `<type>(<scope>): <description>`

**Types:**
- `feat`: Nova feature (trigger CI/CD deploy)
- `fix`: Bug fix (trigger CI/CD deploy)
- `refactor`: Refatoração sem mudança de comportamento
- `docs`: Documentação apenas
- `test`: Adição/modificação de testes
- `chore`: Configs, deps, build tools
- `perf`: Performance improvements
- `style`: Formatação de código (não afeta lógica)
- `ci`: Mudanças em CI/CD workflows
- `build`: Mudanças no sistema de build

**Scopes Comuns:**
- `core`: Funcionalidades core do e-commerce
- `ui`: Componentes UI (shadcn/ui)
- `api`: Integrações de API
- `auth`: Autenticação/autorização
- `checkout`: Fluxo de checkout
- `admin`: Painel administrativo
- `analytics`: Tracking e analytics
- `infra`: Infraestrutura/Firebase

**Exemplos:**
```bash
feat(checkout): add Mercado Pago payment integration
fix(cart): resolve quantity update race condition
refactor(ui): extract ProductCard to shadcn component
docs(api): update Firebase contract examples
test(checkout): add e2e tests for payment flow
chore(deps): update Firebase SDK to v10.7.0
perf(catalog): implement lazy loading for product images
ci(workflow): add Lighthouse performance checks
```

#### **Git Workflow com CI/CD**

**Branch Strategy (GitFlow):**
```
main (production)
  ↑
001-core-ecommerce (feature branch - staging)
  ↑
feature/specific-task (optional - development)
```

**Workflow de Desenvolvimento:**

1. **Começar Task**:
   ```bash
   git checkout 001-core-ecommerce
   git pull origin 001-core-ecommerce
   # Opcional: criar branch específica
   git checkout -b feature/task-name
   ```

2. **Durante Desenvolvimento**:
   - Commits frequentes (a cada subtask completa)
   - Mensagens descritivas seguindo Conventional Commits
   - Validar testes antes de cada commit

3. **Finalizar Task**:
   ```bash
   # Validar tudo está OK
   npm run type-check
   npm run lint
   npm run test:ci
   npm run build
   
   # Commit final
   git add .
   git commit -m "feat(scope): complete task description"
   
   # Push para branch feature
   git push origin 001-core-ecommerce
   ```

4. **Trigger CI/CD**:
   - Push para `001-core-ecommerce` → Deploy automático staging
   - PR para `main` → Deploy production (após approval)

**Checklist Pré-Commit:**
- [ ] `npm run type-check` - Zero TypeScript errors
- [ ] `npm run lint` - Zero ESLint errors  
- [ ] `npm run test:ci` - All tests passing
- [ ] `npm run build` - Build successful
- [ ] Code review próprio - Diff faz sentido?
- [ ] Commit message - Segue Conventional Commits?
- [ ] Specs atualizadas - `tasks.md` reflete progresso?

**Checklist Pré-Push:**
- [ ] Todos commits locais são atômicos e descritivos?
- [ ] Branch atualizada com origin?
- [ ] CI/CD vai passar? (testes locais OK)
- [ ] Breaking changes documentadas?
- [ ] Secrets/tokens não commitados?

#### **Integração com Speckit**

**Sincronizar `tasks.md` com Commits:**
- Cada task completada = 1+ commits
- Marcar tasks como `[x]` em commit separado tipo `docs`
- Adicionar link de commit relevante em tasks complexas

**Exemplo de Fluxo:**
```bash
# Implementar task
git commit -m "feat(checkout): implement payment validation logic"

# Atualizar progress
git commit -m "docs(spec): mark task 3.2 as complete in tasks.md"

# Push para trigger CI/CD staging
git push origin 001-core-ecommerce
```

#### **Situações Especiais**

**Hotfix em Production:**
```bash
git checkout main
git checkout -b hotfix/critical-bug
# Fix + test
git commit -m "fix(critical): resolve payment processing timeout"
git push origin hotfix/critical-bug
# PR direto para main (fast-track approval)
```

**Rollback de Deploy:**
```bash
# Via GitHub Actions manual workflow
# Ou reverter commit específico
git revert <commit-hash>
git push origin main
```

**Stash para Context Switch:**
```bash
# Salvar trabalho incompleto
git stash push -m "WIP: implementing feature X"

# Trabalhar em outra coisa...

# Retomar trabalho
git stash pop
```

## 🎯 Benefícios Estratégicos

### **Business Agility**
- **Time to Market**: 60-80% mais rápido vs desenvolvimento tradicional
- **Risk Mitigation**: Feature failure não compromete produto
- **Market Adaptation**: Releases frequentes permitem pivôs
- **Revenue Acceleration**: Valor entregue incrementalmente

## 🎯 Benefícios Estratégicos

### **Business Agility**
- **Time to Market**: 60-80% mais rápido vs desenvolvimento tradicional
- **Risk Mitigation**: Feature failure não compromete produto
- **Market Adaptation**: Releases frequentes permitem pivôs
- **Revenue Acceleration**: Valor entregue incrementalmente

### **Technical Excellence**
- **Code Quality**: Features isoladas facilitam refatoração
- **Scalability**: Arquitetura modular suporta crescimento
- **Maintainability**: Dependências claras e documentadas
- **Innovation**: Equipes podem experimentar sem risco
- **UI Consistency**: shadcn/ui garante design system unificado

### **Team Productivity**
- **Parallel Work**: Múltiplos devs em features diferentes
- **Focus**: Cada um responsável por entrega completa
- **Learning**: Especialização progressiva em domínios
- **Motivation**: Conquistas frequentes e visíveis
- **Developer Experience**: Hot reload, TypeScript strict, componentes reutilizáveis

## 📝 Casos de Uso no Ogni

### **Sequência Recomendada**
1. **001-core-ecommerce**: Fundamento (catálogo, checkout, admin)
2. **002-social-commerce**: Engajamento (feed, likes, comentários)
3. **003-ai-automation**: Eficiência (recomendações, banners)
4. **004-marketing-tools**: Crescimento (cupons, indicações)
5. **005-advanced-analytics**: Otimização (contabilidade, previsões)
6. **006-marketplace-integration**: Escalabilidade (marketplaces externos)
7. **007-mobile-native**: Mobile-first (apps nativas)

### **Dependências Críticas**
- **001** deve ser primeira (base para tudo)
- **002-004** podem ser paralelas após 001
- **005** depende de dados das features anteriores
- **006** requer APIs estáveis
- **007** pode ser independente (mobile separado)

## � Planejamento Pós-Lançamento

### **Priorização: MVP First, Then Polish**
Após conclusão da **001-core-ecommerce**, focar em features que agregam valor imediato sem comprometer a estabilidade do produto.

### **Fase 1: UX/UI Enhancements (Pós-MVP Imediato)**
1. **Dark Mode Implementation**
   - **Escopo**: Toggle de tema com persistência localStorage
   - **Valor**: Melhor experiência noturna, redução de fadiga visual
   - **Esforço**: 2-3 dias (infraestrutura já preparada)
   - **Dependências**: CSS variables já configurados em `index.css`
   - **Métricas**: >30% adoção, feedback positivo >4.5/5.0

2. **Mobile Responsiveness Optimization**
   - **Escopo**: Melhorar PWA experience, touch interactions
   - **Valor**: Aumento conversão mobile (+40% esperado)
   - **Esforço**: 1-2 dias de refinamentos
   - **Dependências**: shadcn/ui já responsivo

3. **Loading States & Micro-interactions**
   - **Escopo**: Skeletons, loading spinners, hover effects
   - **Valor**: Melhor percepção de performance
   - **Esforço**: 1 dia por componente crítico

### **Fase 2: Feature Enhancements (Pós-MVP +1 mês)**
1. **Advanced Search & Filters**
   - **Escopo**: Busca facetada, filtros avançados, sorting
   - **Valor**: Redução bounce rate, aumento conversão
   - **Esforço**: 3-5 dias
   - **Dependências**: Dados de produtos já estruturados

2. **User Personalization**
   - **Escopo**: Recomendações baseadas em histórico
   - **Valor**: Aumento cross-sell/up-sell
   - **Esforço**: 4-6 dias
   - **Dependências**: Analytics já implementado

3. **Wishlist & Favorites**
   - **Escopo**: Salvar produtos, notificações de preço
   - **Valor**: Aumento retenção, repeat visits
   - **Esforço**: 2-3 dias

### **Fase 3: Technical Debt & Performance (Pós-MVP +2 meses)**
1. **Performance Optimization**
   - **Escopo**: Code splitting, lazy loading, caching avançado
   - **Valor**: Core Web Vitals otimizados
   - **Esforço**: 1-2 semanas
   - **Métricas**: Lighthouse score >90

2. **Advanced Analytics**
   - **Escopo**: Funnels de conversão, cohort analysis
   - **Valor**: Insights para decisões de produto
   - **Esforço**: 3-5 dias
   - **Dependências**: GA4 já configurado

3. **A/B Testing Infrastructure**
   - **Escopo**: Framework para testes de features
   - **Valor**: Otimização baseada em dados
   - **Esforço**: 1 semana

### **Fase 4: Business Growth (Pós-MVP +3 meses)**
1. **002-social-commerce**: Feed, likes, comentários
2. **003-ai-automation**: Recomendações, banners dinâmicos
3. **004-marketing-tools**: Cupons, programa de indicações
4. **005-advanced-analytics**: Contabilidade, previsões

### **Critérios para Adição de Features**
- **Business Value**: ROI claro mensurável
- **Technical Feasibility**: Alinhado com stack atual
- **User Demand**: Validado por dados/analytics
- **Effort Estimation**: <2 semanas para implementação
- **Risk Assessment**: Baixo risco para produto estável

## �🔄 Evolução Baseada em Dados

Esta metodologia evolui através de:
- **Retrospectives**: Lições aprendidas por feature
- **Metrics Analysis**: O que funciona vs não funciona
- **Team Feedback**: Adaptação ao tamanho/experiência da equipe
- **Technology Changes**: Novas ferramentas e frameworks
- **Market Changes**: Ajustes baseados em user behavior

---

**Nota**: Este documento complementa o Speckit, não substitui. Foca em decisões estratégicas específicas do projeto Ogni e equipe.

**Atualizações Recentes (Nov 5, 2025)**:
- ✅ Implementação completa do shadcn/ui (16 componentes)
- ✅ Configuração Firebase otimizada (hosting público, Firestore nam5)
- ✅ Workflow CI/CD com GitHub Actions e Lighthouse CI
- ✅ Processo de correção de bugs documentado
- ✅ Design system unificado com dark mode support
- ✅ Planejamento pós-lançamento estruturado (4 fases)
- ✅ GitHub Actions permissions configuradas para actions específicas
- ✅ Protocolo de commits & Git workflow com sugestões proativas do agente AI