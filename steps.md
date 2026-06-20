# Pi Web Wrapper - Development Steps

## Phase 1: Research & Design
- [x] 1.0 Brainstorming requirements
- [x] 1.1 Research pi SDK integration
- [x] 1.2 Design system (palette, typography)
- [x] 1.3 Architecture design (API, components, data flow)

## Phase 2: Critical Files
- [x] 2.1 Create about.md
- [x] 2.2 Create steps.md
- [ ] 2.3 Create AGENTS.md

## Phase 3: Project Setup
- [ ] 3.1 Initialize monorepo structure
- [ ] 3.2 Setup root package.json
- [ ] 3.3 Setup server (Hono + pi SDK)
- [ ] 3.4 Setup client (React + Vite + Tailwind)
- [ ] 3.5 Setup shared package
- [ ] 3.6 Install dependencies
- [ ] 3.7 Validate builds

## Phase 4: Authentication
- [ ] 4.1 Backend auth routes (login, me)
- [ ] 4.2 JWT middleware
- [ ] 4.3 Frontend AuthContext
- [ ] 4.4 Login page component
- [ ] 4.5 Protected routes

## Phase 5: WebSocket Integration
- [ ] 5.1 Backend WebSocket handler
- [ ] 5.2 Frontend WebSocket client
- [ ] 5.3 Event types and handlers
- [ ] 5.4 Reconnection logic

## Phase 6: Pi SDK Integration
- [ ] 6.1 Session manager (create, get, destroy)
- [ ] 6.2 Prompt endpoint
- [ ] 6.3 Event streaming
- [ ] 6.4 Abort functionality

## Phase 7: Frontend UI
- [ ] 7.1 Layout components (Header, Sidebar, Main)
- [ ] 7.2 Chat components (MessageList, InputArea)
- [ ] 7.3 Message rendering (user, assistant, tool calls)
- [ ] 7.4 Streaming UI
- [ ] 7.5 Session management UI
- [ ] 7.6 Model selector

## Phase 8: Polish
- [ ] 8.1 Responsive design (375px, 768px, 1280px)
- [ ] 8.2 Loading states
- [ ] 8.3 Error handling
- [ ] 8.4 Keyboard shortcuts
- [ ] 8.5 Accessibility

## Phase 9: Docker & Deployment
- [ ] 9.1 Create Dockerfile
- [ ] 9.2 Create docker-compose.yml (dev)
- [ ] 9.3 Deploy to Coolify
- [ ] 9.4 Configure environment variables
- [ ] 9.5 Verify deployment
