# ?? SECURITY v6.1

## PRINC赤PIOS FUNDAMENTAIS (sempre aplicar)

- **Defesa em Profundidade**: Cada camada (frontend, backend, banco, storage, auth) deve ser segura de forma independente. Falha em uma camada n?o deve comprometer o sistema inteiro.
- **Nunca confie no frontend**: Toda valida??o, autoriza??o, sanitiza??o e checagem de ownership **deve** acontecer no backend.
- **Zero secrets no c車digo**: Nunca hardcode chaves, senhas, tokens ou credenciais. Sempre use vari芍veis de ambiente + `.env.example` + `.gitignore`.
- **Seguran?a > Funcionalidade**: Se houver conflito, priorize seguran?a.
- **IA amplifica**: Se voc那 n?o guiar bem, a IA vai amplificar falhas. Sempre force regras expl赤citas.

## AUTENTICA??O

- Use **Argon2id** (preferencial) ou bcrypt com custo alto.
- Implemente **rate limiting diferenciado** (login, reset senha e 2FA mais restritos).
- Respostas gen谷ricas: nunca revele se e-mail/usu芍rio existe (evite enumera??o).
- Prefira solu??es maduras: Supabase Auth, Clerk, Auth0 ou Firebase Auth em vez de criar do zero.
- JWT: implemente revoga??o/blacklist + tempo curto de expira??o + refresh token seguro.

## AUTORIZA??O

- Valide **ownership** explicitamente em **todo** recurso (IDOR protection).
- Controle de acesso baseado em roles + ownership + contexto.
- Proteja contra Broken Access Control (OWASP A01:2025) 〞 o risco #1.

## VALIDA??O DE INPUT & UPLOADS

- Valide **todo** input no backend usando schemas (Zod ou equivalente).
- Limite tamanho em todos os campos (texto, JSON, arquivos).
- Uploads: valide **MIME type + magic bytes** (file signature). Escaneie por malware quando poss赤vel.
- Nunca permita URLs externas arbitr芍rias em campos de imagem/arquivo (evita trackers, SSRF e stored XSS).
- Sanitize outputs para prevenir XSS + defina CSP headers fortes.

## PROTE??ES CONTRA OWASP TOP 10 2025 (obrigat車rio)

- **A01** Broken Access Control ↙ ownership + autoriza??o expl赤cita
- **A02** Security Misconfiguration ↙ configura??es seguras por padr?o, headers de seguran?a
- **A03** Software Supply Chain Failures ↙ auditoria de depend那ncias, use apenas vers?es atualizadas
- **A04** Cryptographic Failures ↙ Argon2id, TLS 1.3, sem algoritmos obsoletos
- **A05** Injection ↙ prepared statements / ORM parametrizado, sanitize inputs
- **A06** Insecure Design ↙ proteja l車gica de neg車cio contra abusos
- **A07** Authentication Failures ↙ seguir regras de auth acima
- **A10** Mishandling of Exceptional Conditions ↙ n?o exponha stack traces ou dados sens赤veis em erros

## CR赤TICO 每 L車GICA DE NEG車CIO E CONCORR那NCIA

- Descreva **explicitamente** todas as regras de neg車cio no prompt.
- Proteja contra abusos comuns:
  - Reembolso + saque/comiss?o = dinheiro infinito
  - Manipula??o de saldo, estoque ou likes
- **Race Conditions**: Use transa??es at?micas do banco + locks quando necess芍rio (especialmente em opera??es financeiras, curtidas, reembolsos, saques).
- Limites de taxa + limites de tamanho para prevenir DoS.

## PROCESSO OBRIGAT車RIO DE SEGURAN?A (depois de gerar c車digo)

1. Gerar testes automatizados focados em seguran?a (IDOR, injection, race condition, l車gica abusiva).
2. **Red Teaming**: ※Atue como pentester profissional. Tente hackear este sistema de todas as formas poss赤veis. Liste todas as vulnerabilidades encontradas e corrija cada uma.§ (repita 2x).
3. Auditoria final: ※Fa?a uma revis?o completa de seguran?a seguindo OWASP Top 10 2025§.
4. Verificar secrets, depend那ncias desatualizadas e configura??es expostas.

## DICAS EXTRAS PARA VIBE CODING SEGURO

- Sempre inclua no prompt inicial: ※Aplique defesa em profundidade e siga OWASP Top 10 2025§.
- Pe?a para a IA gerar um **threat model** simples do sistema antes de come?ar.
- Se o projeto envolver dinheiro, afiliados, saldo ou dados sens赤veis ↙ redobre o red teaming.

---

**Como usar este arquivo:**
Cole ele logo ap車s o `core.md` e `anti-regression.md` quando o projeto tiver autentica??o, pagamentos, uploads ou dados de usu芍rios.
