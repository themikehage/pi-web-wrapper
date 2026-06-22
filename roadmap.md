# Pi Web Wrapper — Roadmap

> Contexto: copiloto + piloto autónomo para flujo freelance multi-proyecto con Cloudflare, Neon, Coolify, GitHub, Notion, servicios de imagen.
> Referentes: Claude Code, Codex CLI, Lovable, Cursor.

---

## Estado actual

El wrapper tiene una base sólida:
- Auth JWT, multi-sesión WebSocket, streaming en tiempo real
- Workspace aislado por usuario con modo global y modo repo
- Skills library, file explorer, provider/model manager
- Dashboard de repos (crear / clonar)
- Deploy en Coolify vía Docker

Lo que falta es la capa que convierte esto de **"chat con contexto"** a **"agente autónomo que completa proyectos de principio a fin"**.

---

## 5 Features de Alto Impacto

### 1. Sistema de Tareas con Estado Persistente (Task Runner)

**El gap más grande frente a Claude Code / Codex.**

El agente ejecuta un prompt y termina. No hay forma de decirle "completa este proyecto" y dejar que opere por horas con checkpoints. Lo que necesitas:

- **`tasks.json` por repo** — lista de tareas con estado (`pending | running | done | failed`), paso actual, y log parcial
- **Endpoint `POST /api/sessions/:id/task`** — acepta una lista de subtareas o un objetivo de alto nivel y las descompone
- **Auto-continuación**: cuando el agente termina un paso, el backend dispara el siguiente prompt automáticamente (loop supervisor)
- **UI**: panel lateral "Tasks" con progress tracker visual y botón pause/resume

**Por qué primero:** Es el salto de copiloto a piloto. Lovable y Bolt son tan efectivos porque el agente itera solo hasta que funciona. Tu flujo freelance multiproyecto necesita exactamente esto — dejar tareas corriendo y volver a ver resultados.

---

### 2. Tool Permissions por Sesión + Modo Read-Only

**Seguridad y control antes de darle el timón al agente.**

Hoy el agente tiene acceso completo al sistema de archivos y bash sin restricciones. Necesitas:

- **Panel "Session Tools"** en el sidebar: checkboxes para activar/desactivar `bash`, `write`, `edit`, `read`
- **Preset "Review Mode"** — solo lectura, ideal para code reviews con un cliente
- **Preset "Autopilot"** — todos los tools, para tareas largas autónomas
- Llamar `session.setActiveToolsByName()` del SDK antes de cada run
- Persistir la configuración en `metadata.json` del session

**Por qué segundo:** Sin esto, darle autonomía completa al agente en un entorno con repos de clientes es un riesgo inaceptable. Es prerequisito para el Task Runner.

---

### 3. Integrations Hub — Acciones Autónomas de Infraestructura

**Donde pi se diferencia de cualquier chat UI.**

Tu stack ya tiene skills para Cloudflare, Neon, Coolify, GitHub, Notion. El problema es que el agente los invoca a ciegas vía bash/scripts. Lo que necesitas es una capa de integración first-class:

- **`/api/integrations`** — registro de integraciones configuradas (tokens, endpoints)
- **UI de Integrations** en Settings: conectar GitHub (OAuth o PAT), Cloudflare API token, Neon API key, Coolify API key, Notion token
- **Panel de contexto por repo**: muestra el proyecto de Coolify vinculado, el repo de GitHub, la DB de Neon, la página de Notion asociada
- **Acciones rápidas**: "Deploy to Coolify", "Create GitHub PR", "Create Neon branch" — botones que el agente puede invocar via tool calls con credenciales ya configuradas, sin necesidad de que el usuario pegue tokens en el chat

**Por qué tercero:** Esto multiplica el valor del agente. En lugar de "el agente sabe que tiene una skill de Cloudflare", el agente opera directamente sobre infraestructura real con contexto del proyecto activo.

---

### 4. Context Window Meter + Message Queueing

**Productividad táctica durante runs largos.**

Dos problemas concretos que frenan el flujo hoy:

**Context Meter:**
- Barra de progreso en el footer del chat: `68% de 200k tokens`
- Botón "Compact" manual (el SDK ya lo soporta con `compact()`)
- Warning cuando se acerca al límite

**Message Queueing durante streaming:**
- El input permanece activo durante streaming
- `Enter` durante streaming = evento WebSocket `steer` (corrección en caliente)
- `Shift+Enter` = `follow_up` (tarea adicional que se ejecuta al terminar)
- El backend ya soporta estos eventos, solo falta la UI

**Por qué cuarto:** Sin esto, cada run largo es una caja negra. No puedes corregir el rumbo sin abortar. Claude Code y Codex tienen steering nativo — es un diferenciador de UX notable.

---

### 5. Session Export + Share to Gist / Notion

**El output del trabajo tiene que salir del chat.**

Cuando terminas un proyecto o una sesión de debug larga, el resultado queda atrapado en el chat. Necesitas:

- **Export HTML/JSONL**: botón en el header de sesión que descarga la conversación completa con tool calls y outputs formateados
- **Share to Gist**: llama a la GitHub API con el token ya configurado en el Integration Hub, crea un Gist privado/público con la sesión exportada
- **Push to Notion**: crea una página en un workspace de Notion con el resumen de la sesión (ideal para documentar decisiones técnicas de proyectos con clientes)
- **El agente puede auto-documentar**: al final de una tarea completada, el Task Runner puede triggear un export automático a Notion

**Por qué quinto:** Cierra el loop de valor. El trabajo del agente se convierte en documentación entregable para clientes o en referencia para proyectos futuros.

---

## 5 Nice-to-Have Features

### 6. Live Preview Panel (HTML/React)

Render en tiempo real de lo que el agente genera. Cuando el agente escribe un componente React o una página HTML, un panel lateral lo renderiza instantáneamente (iframe con hot-reload vía WebSocket). Similar a Lovable/Bolt. Requiere un pequeño servidor de preview embebido.

---

### 7. Multi-Agente Paralelo (Split View)

Dos sesiones corriendo en paralelo en split-view. Útil para: un agente escribe el backend, otro escribe el frontend. O uno refactoriza mientras otro escribe tests. El dashboard muestra ambas sessiones con sus estados de streaming en tiempo real.

---

### 8. Diff Viewer Integrado + Approval Flow

Antes de que el agente aplique cambios destructivos (sobreescribir archivos, ejecutar migraciones), mostrar un diff unificado y pedir aprobación explícita. Integra con el Tool Permission system. Eleva la confianza del usuario para darle más autonomía al agente.

---

### 9. Repo Intelligence Panel

Panel que se genera al abrir un repo por primera vez: el agente analiza la estructura, identifica el stack, lee los README y genera un resumen indexado. Luego ese contexto se carga automáticamente en cada nueva sesión de ese repo (vía `memories/repos/`). Reduce drásticamente el tiempo de onboarding a proyectos que no has tocado en semanas.

---

### 10. Workspace Activity Feed + Notifications

Feed cronológico de actividad del workspace: "agente completó 3 archivos en `my-saas`", "PR abierto en GitHub", "deploy completado en Coolify", "DB branch creado en Neon". Con notificaciones push (Web Notifications API) para cuando el agente termina una tarea larga en background. Esencial para el flujo multiproyecto donde tienes varias cosas corriendo.

---

## Orden de Implementación Sugerido

```
Phase 13: Tool Permissions (prereq de todo lo autónomo)
  └── 13.1 API: setActiveTools por sesión
  └── 13.2 UI: Session Tools panel + presets

Phase 14: Context Meter + Message Queueing
  └── 14.1 Footer: token usage bar + compact button
  └── 14.2 Input: steer/follow_up durante streaming

Phase 15: Task Runner
  └── 15.1 Backend: tasks.json schema + supervisor loop
  └── 15.2 API: /api/sessions/:id/task
  └── 15.3 UI: Tasks panel con progress tracker

Phase 16: Integrations Hub
  └── 16.1 Backend: integration registry + credential store
  └── 16.2 UI: Settings > Integrations (GitHub, CF, Neon, Coolify, Notion)
  └── 16.3 Repo context panel con acciones rápidas

Phase 17: Export + Share
  └── 17.1 Export HTML/JSONL
  └── 17.2 Share to Gist
  └── 17.3 Push to Notion
```

---

> [!IMPORTANT]
> El Task Runner (Feature 1) es el mayor multiplicador de valor, pero necesita Tool Permissions (Feature 2) implementado primero para ser seguro. Empieza por el Phase 13.
