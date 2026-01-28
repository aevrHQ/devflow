# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.13](https://github.com/miracleonyenma/devflow/compare/v0.2.12...v0.2.13) (2026-01-28)

### [0.2.12](https://github.com/miracleonyenma/devflow/compare/v0.2.10...v0.2.12) (2026-01-28)

### [0.2.10](https://github.com/miracleonyenma/devflow/compare/v0.2.9...v0.2.10) (2026-01-28)


### Documentation

* **README:** Update documentation after GitHub Copilot CLI Challenge announcement. ([2bd604a](https://github.com/miracleonyenma/devflow/commit/2bd604ad88ef46055b6b44a86ce7cd5e99834dd6))

### [0.2.9](https://github.com/miracleonyenma/devflow/compare/v0.2.8...v0.2.9) (2026-01-28)

### [0.2.8](https://github.com/miracleonyenma/devflow/compare/v0.2.7...v0.2.8) (2026-01-28)


### Features

* **api/user/settings:** Add groq api key management to user settings. ([aa8ac6b](https://github.com/miracleonyenma/devflow/commit/aa8ac6be1955f22102252202fbe8d71027eac5d2))
* Display dynamic user statistics in settings and integrate Next.js top loader, alongside refactoring UI colors to a neutral palette. ([1435303](https://github.com/miracleonyenma/devflow/commit/1435303c37ab71ffab7ec234a394c2e066506a04))
* **emails:** Add email sending infrastructure and templates. ([61b7581](https://github.com/miracleonyenma/devflow/commit/61b7581139b7fa1bbdb18c8cad91a613b0313250))
* Implement agent deletion functionality with a new API route and a delete button in the agent list. ([b8389f1](https://github.com/miracleonyenma/devflow/commit/b8389f182a546a1f68ea7013225d705451ce8394))
* Implement dynamic agent status (online, stale, offline) based on last heartbeat and refactor agent data fetching. ([dd84b08](https://github.com/miracleonyenma/devflow/commit/dd84b08527c2b169119c372a91da7c8bab207780))
* Implement mobile bottom navigation, integrate Iconsax for icons, and refine UI styling by removing unnecessary shadows. ([a863fae](https://github.com/miracleonyenma/devflow/commit/a863faece1805ca9ec2356fa0841339edc9d40c8))
* Implement responsive settings display using a Dialog for desktop and a Drawer for mobile, and adjust settings content maximum width. ([8fa3cea](https://github.com/miracleonyenma/devflow/commit/8fa3ceaf2d39fd310e91059b49f651bf41789452))
* Implement session management, add task stopping functionality, and introduce agent offline detection with auto-fail. ([8a833d4](https://github.com/miracleonyenma/devflow/commit/8a833d415bacd1b3a986b6f63a4291bccde88f77))
* Introduce a custom animated `Loader` component and replace all `lucide-react` `Loader2` instances throughout the application. ([eb303c8](https://github.com/miracleonyenma/devflow/commit/eb303c8e1dd70e5114cdc0224da20dc7eeb4b1cc))
* Introduce and integrate Radix UI Checkbox component into TaskList. ([7234bef](https://github.com/miracleonyenma/devflow/commit/7234beff2afcd441f0f44fb36b286e3df97969be))
* Rename "Pinga" to "Devflow" in the dashboard navigation and update package-lock.json. ([08805e6](https://github.com/miracleonyenma/devflow/commit/08805e68ba0c0aeb34c7f8b79c35a2edc4767cd0))
* **settings:** Reorder and flatten imports. ([c65a57b](https://github.com/miracleonyenma/devflow/commit/c65a57be5aad666803598a18451a1e6a5705be43))
* Update agent README and web marketing page to emphasize GitHub Copilot CLI and SDK integration. ([5e9bf1c](https://github.com/miracleonyenma/devflow/commit/5e9bf1c840afa7bb3141bdd6c2f16e801d0035de))
* **web/app:** Update landing page metadata and UI. ([437c388](https://github.com/miracleonyenma/devflow/commit/437c38860510b3c2cdc282bacfb91afd56d8587d))


### Bug Fixes

* **auth:** Update dashboard and page layouts to use SiteLayout component. ([9b6dd54](https://github.com/miracleonyenma/devflow/commit/9b6dd547b9432b98091cfd9bd399058cebc09a4c))
* **web:** Add mobile menu and desktop navigation. ([f4d2ab4](https://github.com/miracleonyenma/devflow/commit/f4d2ab4b0be8bfd2fb876b3c9bce2417dee369e4))
* **web:** Update landing page UI and add agent capabilities. ([c9d6504](https://github.com/miracleonyenma/devflow/commit/c9d650462756a9aa12e88655a482dd9a1b3ea273))


### Code Refactoring

* Decouple `ProfileHeader` from `SettingsContent` via a prop, standardize settings component imports, and update the `next` dependency. ([e201f07](https://github.com/miracleonyenma/devflow/commit/e201f07f98578faa8761e3ef0e223731ade303ca))
* Migrate settings drawers to a new `ResponsiveDialog` component and standardize button usage across settings forms. ([608ecc5](https://github.com/miracleonyenma/devflow/commit/608ecc56797ec0e4f795fd1639a39a903857b0bb))
* Reimplemented the settings page using modular components and a drawer-based UI. ([c3612a1](https://github.com/miracleonyenma/devflow/commit/c3612a13a72a6c54aab2e614483badb2d8ac0748))


### Documentation

* **assets:** Add web app icons. ([87d1877](https://github.com/miracleonyenma/devflow/commit/87d1877a7b27e34e72c17efe55564ce7da390005))
* Update project branding to Devflow. ([25787dd](https://github.com/miracleonyenma/devflow/commit/25787dd2fb9a6e1c4c9664e5411406accec33816))

### [0.2.7](https://github.com/miracleonyenma/devflow/compare/v0.2.6...v0.2.7) (2026-01-28)

### Features

- Add comprehensive task management with filtering, sorting, and bulk actions, alongside agent listing and status tracking. ([64571aa](https://github.com/miracleonyenma/devflow/commit/64571aa8a09391c6195d8f9ea295cee6232c197a))
- Extract dashboard navigation into a new component with active link styling and an added Agents link. ([010012a](https://github.com/miracleonyenma/devflow/commit/010012a95fea086b298cdab8607458b3dd4eb891))
- hide disconnect button for offline agents ([f37bd02](https://github.com/miracleonyenma/devflow/commit/f37bd0226f3bd5dea94fc00609730fc5b325d42b))
- rename product from Devflow to DevFlow across documentation and code. ([a850c4b](https://github.com/miracleonyenma/devflow/commit/a850c4b8b477ca97284c0abf0cee7a9b986d3305))

### [0.2.6](https://github.com/miracleonyenma/devflow/compare/v0.2.5...v0.2.6) (2026-01-28)

### Features

- Add remote agent disconnection, task termination, Telegram task management, and project description. ([eac4f8d](https://github.com/miracleonyenma/devflow/commit/eac4f8dbf7cda8210e00f2fbd8250c7ee346e866))
- Increase copilot session timeout to 10 minutes and gracefully handle timeout errors by returning a warning. ([3e61a4b](https://github.com/miracleonyenma/devflow/commit/3e61a4b49194ae4729e331fd4e53b984c98cd54d))
- Synchronize user channels by deleting those not present in the update request. ([805df04](https://github.com/miracleonyenma/devflow/commit/805df041a9971926930645a603949705e1775aa7))

### Bug Fixes

- await route parameters in API handlers to correctly extract IDs. ([b7cf527](https://github.com/miracleonyenma/devflow/commit/b7cf52757b38cad3b284900d0f29e9d5c240a879))
- **lib/notification:** Strip markdown formatting from messages sent to Telegram. ([79dbc78](https://github.com/miracleonyenma/devflow/commit/79dbc78f332b1aa3ba844bcaee360956c4f80778))
- **models:** Add support for task assignment status of 'cancelled'. ([af0797e](https://github.com/miracleonyenma/devflow/commit/af0797e9426bcdbad4521128689855650e2f7619))

### Documentation

- **api:** Remove markdown from telegram webhook messages. ([6eec6e1](https://github.com/miracleonyenma/devflow/commit/6eec6e1fc9ecab99c35679a32854f6f96ce09031))
- **telegram-apis:** Remove markdown/HTML parsing for plain text messages. ([4cda446](https://github.com/miracleonyenma/devflow/commit/4cda4463646f6c48edd30353996527ccadc08c38))

### Code Refactoring

- enhance Telegram missing credentials warning message to specify which credential is missing. ([c9a5b97](https://github.com/miracleonyenma/devflow/commit/c9a5b97f5e13ee79c201fb0edbb31ebeea290721))

### [0.2.5](https://github.com/miracleonyenma/devflow/compare/v0.2.4...v0.2.5) (2026-01-27)

### Features

- `decrypt` method now returns input directly when encryption key is missing, treating it as pre-decrypted. ([234f41c](https://github.com/miracleonyenma/devflow/commit/234f41c60c1751d0c6360883ac95024d82c16e8e))
- Add comprehensive logging and error handling for Copilot client session events and requests. ([d5f915f](https://github.com/miracleonyenma/devflow/commit/d5f915f9e6719cdb868a318c5312f47f3d8ab216))
- add detailed logging for decryption attempts, successes, and failures including key index and hash. ([ccba711](https://github.com/miracleonyenma/devflow/commit/ccba711edd443dd66a119dcd89930589dc5ce9e5))
- add workingDirectory to agent model and persistent task notifications ([cb26c9d](https://github.com/miracleonyenma/devflow/commit/cb26c9d0231762c0ab6f16d97f090c8390b7c0f7))
- Allow explicit Devflow API configuration for the progress update tool and standardize Copilot model defaults. ([6b3a114](https://github.com/miracleonyenma/devflow/commit/6b3a1147f48d0a1ede6226973845991d7fab5181))
- **auth:** Support GitHub Personal Access Token authentication. ([16d78c9](https://github.com/miracleonyenma/devflow/commit/16d78c923614f7ae6812c4d3fa68eb2ae5197ee9))
- **dashboard:** fix stats, add pagination, use [@aevr](https://github.com/aevr) components ([0c1cf38](https://github.com/miracleonyenma/devflow/commit/0c1cf38642d3d9616392fa01c42edaffe7f896a3))
- Decrypt and pass GitHub credentials to agent commands, and set `GITHUB_TOKEN` for workflow execution. ([827474b](https://github.com/miracleonyenma/devflow/commit/827474bed44720d3077e4fb9976547efee85d6ef))
- Differentiate feature implementation workflow steps and guidelines based on local or remote context. ([4608eff](https://github.com/miracleonyenma/devflow/commit/4608effc421a69c70889762db78f0977dd258cf7))
- Enhance decryption to support both AES-256-GCM and legacy AES-256-CBC algorithms by detecting the algorithm based on IV length. ([c876169](https://github.com/miracleonyenma/devflow/commit/c876169908cec99050f4b99b0b6d74773b2b9994))
- Enhance decryption to support multiple encryption keys and add authentication failure logging. ([1d74d19](https://github.com/miracleonyenma/devflow/commit/1d74d19e581271c7835e5b50f6f2a7672c222f1c))
- Expand `deriveKeys` function to include SHA-256 hashing and raw buffer derivation for broader compatibility. ([ee4d308](https://github.com/miracleonyenma/devflow/commit/ee4d3082f07e78244abde67b888cf9f4e688754b))
- Handle unknown workflow intents by falling back to FeatureWorkflow and logging a message instead of throwing an error. ([d8e2030](https://github.com/miracleonyenma/devflow/commit/d8e20306b64b690c93a6dfbc043b01b785357b88))
- Implement a new AI agent using the Copilot SDK, introducing various workflows and tools, and updating the web API for agent authentication. ([0bb4e06](https://github.com/miracleonyenma/devflow/commit/0bb4e064aba942f93efe659b5a9326c318b54745))
- implement managed SaaS credential flow (storage, UI, agent) ([ed0a6b4](https://github.com/miracleonyenma/devflow/commit/ed0a6b4a873b6f894e098820060155e45ad31290))
- Implement task deletion and enhance Copilot SDK integration with dynamic token support and detailed session events. ([18cd47d](https://github.com/miracleonyenma/devflow/commit/18cd47d70183ff03d0911b3f4c43af78017871bb))
- Introduce copilot functionality with AI-driven workflows and supporting tools for code generation, review, and explanation. ([779e06f](https://github.com/miracleonyenma/devflow/commit/779e06f14a7f9dd92865ba725f88eba528026f1b))
- Introduce structured logging for invalid token errors during verification. ([f7e5e75](https://github.com/miracleonyenma/devflow/commit/f7e5e751fd656f7a702b4be58b4abb73e40fabd2))
- **telegram:** optimize agents command to skip LLM ([5a4c5da](https://github.com/miracleonyenma/devflow/commit/5a4c5da07719a9ca1d26217fdc3db11a7f76884f))

### Bug Fixes

- **agent:** propagate workflow errors to Devflow platform ([d24c0ba](https://github.com/miracleonyenma/devflow/commit/d24c0baa898f80d22f99f5a1dfc4bf1e15fbe6e9))
- **agents:** Implement auto-progress tracking for workflow executor. ([5ad4a82](https://github.com/miracleonyenma/devflow/commit/5ad4a82a314ede0ff39d10a32403440cdc74ffef))
- **auth:** Migrate SaaS mode to fetch GitHub credentials from platform. ([1a77aad](https://github.com/miracleonyenma/devflow/commit/1a77aad530b0b2709382fac25464a52128c439b0))
- Change default copilot model from gpt-4 to gpt-3.5-turbo. ([51df6a0](https://github.com/miracleonyenma/devflow/commit/51df6a01bb6cabee2ed2f4ed0167d8e1bd7b7f55))
- Change default Copilot model from gpt-4.1 to gpt-4. ([5476478](https://github.com/miracleonyenma/devflow/commit/54764788ddde562e4ef7ba4ca538b4f402039c91))
- lint errors and agent command dispatch credentials ([de5d10a](https://github.com/miracleonyenma/devflow/commit/de5d10a565aa48bc8c182e78a75dec4fec1d17a3))
- repair broken import syntax ([122681a](https://github.com/miracleonyenma/devflow/commit/122681ace9b0a57216325920b659068d6f65c79c))
- simplify noParamsSchema for Groq tool call compatibility ([f774cd2](https://github.com/miracleonyenma/devflow/commit/f774cd25a105d613c3bbbdc9d5944ba33905302b))
- syntax error in set-commands route ([161dd3d](https://github.com/miracleonyenma/devflow/commit/161dd3dc1984e5d118429af65e5c96b7352dd28a))
- **telegram:** restore system bot token fallback for notifications ([09bcba4](https://github.com/miracleonyenma/devflow/commit/09bcba43e6a709ec595c1c9948395d346e13aef9))
- **verify-full-flow:** Add explicit type annotations to sendLog method. ([5c9db03](https://github.com/miracleonyenma/devflow/commit/5c9db0396a0f9707061fde85f0a16bb6ef8062e9))

### Code Refactoring

- remove legacy telegram configuration (user fields, settings, webhooks) ([f3f1319](https://github.com/miracleonyenma/devflow/commit/f3f1319d5bb0a7a12ec26c07b5e6a661f3dd368e))
- replace `decrypt` with `decryptCredentials` for GitHub token decryption. ([0526edb](https://github.com/miracleonyenma/devflow/commit/0526edb85a99126a988d4a07002f501164af931b))

### [0.2.4](https://github.com/miracleonyenma/devflow/compare/v0.2.3...v0.2.4) (2026-01-25)

### Features

- enable .env.local override for environment variables ([b6cdd9c](https://github.com/miracleonyenma/devflow/commit/b6cdd9c226978c2f559db817930f33356a6d5075))

### [0.2.3](https://github.com/miracleonyenma/devflow/compare/v0.2.2...v0.2.3) (2026-01-25)

### Features

- Add agent host URL configuration option to the CLI and agent configuration. ([1e11cb9](https://github.com/miracleonyenma/devflow/commit/1e11cb9e6c9b671453228af249f5a36c5ac688d5))
- Add debug error logging to CLI task failures and switch chat assistant to `openai/gpt-oss-20b` model. ([cfbcdab](https://github.com/miracleonyenma/devflow/commit/cfbcdab81e36b5ebec55ad9dd909589821b45a10))
- Add debug logging to agent CLI heartbeat and polling, and make `noParamsSchema` optional/nullable in web agent tools. ([0467224](https://github.com/miracleonyenma/devflow/commit/04672246cd506eb518fe18d6c5db64136ae3fcf0))
- Add request logging middleware to agent-host and switch agent CLI to use axios for enhanced error handling. ([b60bcc5](https://github.com/miracleonyenma/devflow/commit/b60bcc5c8ed6e019dcf07ebdf186b9487cc6ea4f))
- add telegram commands registration endpoint ([1f493ab](https://github.com/miracleonyenma/devflow/commit/1f493abb6e7f877ede98696fd73bab1292e0079a))
- Update chat assistant agent to use Llama-3.3-70b-versatile and remove a specific instruction regarding tool tag output. ([fad5692](https://github.com/miracleonyenma/devflow/commit/fad569206f81562ba61e91a87f547d3193010097))
- Update Devflow help text with new commands and dashboard links, and refine agent task dispatch logic to delegate completion reporting to the host. ([fa9ffcc](https://github.com/miracleonyenma/devflow/commit/fa9ffccf556bc02675ba43f558616aa976740737))

### Bug Fixes

- add optional chaining for aiResponse in /agents handler ([c9b35f3](https://github.com/miracleonyenma/devflow/commit/c9b35f3ba048dcc7e7b1a61d1c54462c4e576ee1))
- telegram slash commands and help formatting ([7da34dc](https://github.com/miracleonyenma/devflow/commit/7da34dc83a771f7d5c4abb980db35519bced9b5b))

### Code Refactoring

- convert agent capabilities from MongooseArray to a plain array. ([81508a2](https://github.com/miracleonyenma/devflow/commit/81508a23fade81ec3a32e1ff296c42e88d7892d5))

### [0.2.2](https://github.com/miracleonyenma/devflow/compare/v0.2.1...v0.2.2) (2026-01-25)

### Features

- **agents:** add new DevFlow Agent API endpoints and UI dashboard connections ([b51e8b9](https://github.com/miracleonyenma/devflow/commit/b51e8b98d5ab98a9987b0466791af12696235313))
- **backend-communication:** add logging mechanism for task execution ([cacc485](https://github.com/miracleonyenma/devflow/commit/cacc485b486cc6d0f9096369d4e11ff6dd1cb3e6))
- Implement dashboard task management, including dedicated list and detail pages, notification utilities, and APIs for task progress and completion. ([d504396](https://github.com/miracleonyenma/devflow/commit/d5043969c13a222d9e518138ff8f3213ff7c0df3))
- Introduce 'Connected Agents' help guide, refine Telegram user lookup logic, and add a Telegram authentication debug script. ([99cb42c](https://github.com/miracleonyenma/devflow/commit/99cb42c09664e37f21bf28446604b8c517191817))

### Bug Fixes

- **agents:** heartbeat stale agent detection and automatic status update ([2baa542](https://github.com/miracleonyenma/devflow/commit/2baa542d2302a77e895042162c71672314399829))
- **api/webhook, docs/content/web:** update Telegram bot username to thedevflowbot ([8db87da](https://github.com/miracleonyenma/devflow/commit/8db87da9089b0a217c7d2d9a39d57050ffb639b1))
- **auth:** update OAuth token response handling to snake case ([f50aa2d](https://github.com/miracleonyenma/devflow/commit/f50aa2ddfa87cb66430c0857a9a0e95f7af8e7d1))
- **copilot:** add localPath to workflow context and related functions ([b1b8ccc](https://github.com/miracleonyenma/devflow/commit/b1b8ccc812a21ea4050a9167a806e607dbaf3960))

### Code Refactoring

- Normalize Telegram webhook history content to string for chat response generation. ([a671a0d](https://github.com/miracleonyenma/devflow/commit/a671a0ddc7a6dfac30ed2def7558757309f91752))

### 0.2.1 (2026-01-25)

### Features

- Add CLI OAuth authentication endpoints (/auth/agent, /api/auth/callback, /api/auth/github/callback) ([3b77949](https://github.com/miracleonyenma/devflow/commit/3b779494f1481c923dfd6bcf7dc847a380cc4b89))
- add multi-mode login supporting magic link, OTP verification, and PIN, and apply cursor pointer to the sign out button. ([8caed83](https://github.com/miracleonyenma/devflow/commit/8caed8328fe150d5aba1796cfcbca5842e3c630b))
- Add POST handler to /api/auth/callback for CLI token exchange ([b3696cb](https://github.com/miracleonyenma/devflow/commit/b3696cb49d5f0cf2b1aca7e018153cebfe4de8fe))
- **agent-host:** integrate github copilot sdk with real sdk ([009730c](https://github.com/miracleonyenma/devflow/commit/009730c2d397c98bf9344343116663c2f5f5bd5d))
- **agents:** update client registration logic to set token before use ([b0ff8de](https://github.com/miracleonyenma/devflow/commit/b0ff8decee3cafe82fe9c0601e54f92d6d2e33a6))
- **api/auth:** enhance magic link request logging and error handling ([049826e](https://github.com/miracleonyenma/devflow/commit/049826e6283f37fdbb3986c4d9c5a62bb178f01e))
- **api:** add channels model and refactor user schema and related code ([da2b351](https://github.com/miracleonyenma/devflow/commit/da2b35144a67b18dfbe4475dab51514d2a8e111e))
- **api:** add user ID to telegram webhook response and enhance bot tools setup ([2a4c511](https://github.com/miracleonyenma/devflow/commit/2a4c5116a3962d59de97db82b3facf004a2fd265))
- **api:** log more detailed error messages when linking Telegram channels ([cbd9739](https://github.com/miracleonyenma/devflow/commit/cbd97394d7ca158c9183ef96238a4fdf8a67f119))
- **app:** remove prose code styling from help page ([6076d1a](https://github.com/miracleonyenma/devflow/commit/6076d1a97cece0fa7cc2cf8921d18eb01d1df1b8))
- **auth:** add help section and integrate source listing ([a26c90d](https://github.com/miracleonyenma/devflow/commit/a26c90d937c62dd0e69b68266327f50b2af4bd5c))
- **auth:** enhance GitHub OAuth callback handling for CLI and web auth ([d577442](https://github.com/miracleonyenma/devflow/commit/d5774426499761af1921c9cae9875aed6996cad2))
- **auth:** enhance local auth server for improved security ([f974070](https://github.com/miracleonyenma/devflow/commit/f974070a8d78ba1e0f41616b804fcef72a8e7361))
- **copilot:** add copilot SDK with new workflow interface ([c2ad6b3](https://github.com/miracleonyenma/devflow/commit/c2ad6b319e78668105f7d37adbd8bc0f2e804c88))
- **copilot:** upgrade client to real COPILot SDK and enable agent-host API interactions ([6823936](https://github.com/miracleonyenma/devflow/commit/68239363ec1fc14ece957a4420f9d7324fa4e1af))
- **devflow:** introduce @github/copilot-sdk for devflow integration ([4a6c49b](https://github.com/miracleonyenma/devflow/commit/4a6c49ba63397d9d365f97e88fffd1871a6d40f9))
- Implement user-specific webhook routing via `userId` parameter and display Render integration URL in settings. ([54694f9](https://github.com/miracleonyenma/devflow/commit/54694f97ca05f7b15fd96dc723826087664e74c7))
- Introduce /help command and refine Telegram bot's onboarding experience with detailed setup instructions and group welcome messages. ([4e96f3d](https://github.com/miracleonyenma/devflow/commit/4e96f3d21793a471c379fc4a99971186dd68e499))
- introduce multi-channel notification support, user preferences, and AI event summarization. ([7b6c105](https://github.com/miracleonyenma/devflow/commit/7b6c10561f16b212f78d9b892e0d5604084acf9a))
- **landing:** add WebhookInfo component for developer information ([1a6f567](https://github.com/miracleonyenma/devflow/commit/1a6f56773409dce20402d3199b1616b0187cd76d))
- **landing:** update landing page UI and documentation ([35f20f8](https://github.com/miracleonyenma/devflow/commit/35f20f850163701e8b065526009f1efabc05eb23))
- **lib:** migrate to markdown highlighter with highlighted code ([7b7edcb](https://github.com/miracleonyenma/devflow/commit/7b7edcbf9df86e45f0949046462a99cab2bab1a1))
- **notification-service:** add support for webhook rules and filtering ([9758870](https://github.com/miracleonyenma/devflow/commit/97588708b6439177b9cb274812a634ecd51911b7))
- **notification:** add Webhook as a new notification channel ([2b858d4](https://github.com/miracleonyenma/devflow/commit/2b858d4cb437cd3b14e7c181de116783c0c555d2))
- **notification:** update discord and telegram channels to return channel result ([4b14f02](https://github.com/miracleonyenma/devflow/commit/4b14f0268f4a9db8688fffeba6ae5f09f42abf0b))
- **platform:** add agent token authentication and MongoDB database connections ([4fb02c6](https://github.com/miracleonyenma/devflow/commit/4fb02c6c1d9e612eb97899e392365f7999c3aaf0))
- **web:** add tailwindcss typography plugin and install dependency ([c364d1a](https://github.com/miracleonyenma/devflow/commit/c364d1a38bf34f8ef3a31018f5309770812ea9d0))
- **webhook:** add support for storing and displaying user chat history in webhooks ([cfddd1b](https://github.com/miracleonyenma/devflow/commit/cfddd1b910b78bf03a0ae9f1984d5aacf96f8dae))
- **webhook:** add transcription support to Telegram webhooks and create new transcription library ([d72e09c](https://github.com/miracleonyenma/devflow/commit/d72e09cfc1d4d16834f43c244b5da80d4c9f0316))
- **webhook:** enhance slack webhook logging for debugging and monitoring ([7266718](https://github.com/miracleonyenma/devflow/commit/7266718168d32917c68726de8ab42ae808e394ee))

### Bug Fixes

- add tsconfig.json and src to Docker build context ([352da60](https://github.com/miracleonyenma/devflow/commit/352da60d0c5b6da32f6e48975370d9c5f47569ac))
- **api, lib:** add slack and notification support, including slack webhook and dashboard settings ([7553ae8](https://github.com/miracleonyenma/devflow/commit/7553ae8b5753bcb1b6b307ff033b11ab5f753b24))
- **api/auth:** improve otp verification input validation ([921a84e](https://github.com/miracleonyenma/devflow/commit/921a84e88005daa92dcff1fed8a164b7ad3d745c))
- **api/webhook-telegram:** enhance webhook logging and handling of commands ([d96b743](https://github.com/miracleonyenma/devflow/commit/d96b74349b47f81b8b1730eac647153eb6f237f9))
- **api/webhook/slack:** add user ID to Slack POST payload ([79e57aa](https://github.com/miracleonyenma/devflow/commit/79e57aa45daf9991b76d11c44c7b719ad61da71c))
- **api/webhook:** add replyToMessageId option to telegram send messages ([610dbee](https://github.com/miracleonyenma/devflow/commit/610dbee33964660452dad3866fcf64afd455e9c8))
- **api/webhook:** log ChatAssistant results and handle errors ([1627cc3](https://github.com/miracleonyenma/devflow/commit/1627cc3fe9863b365787013e1ca8895a2a4210c9))
- **api:** add GitHub token validation and user info fetching ([f679d4b](https://github.com/miracleonyenma/devflow/commit/f679d4b447d15053ac2d285c663b04e46fa2b86e))
- **api:** add loud logging for Telegram webhook updates and improve logging consistency ([d1fa57b](https://github.com/miracleonyenma/devflow/commit/d1fa57b688f685177258f592fd4d40e0864bb3c4))
- **arch:** update platform URL to web app and fix devflow-agent CLI ([d34003a](https://github.com/miracleonyenma/devflow/commit/d34003a9d1fbe8ecafb2ba3dcb313b3c1835db38))
- **auth:** add OTP validation and return_to support ([69e8507](https://github.com/miracleonyenma/devflow/commit/69e85076596edecf1bcf4f8b5e95fe16668809a0))
- **auth:** add support for managed SaaS mode with encrypted user credentials ([458a452](https://github.com/miracleonyenma/devflow/commit/458a452833841897a5b7c5c598f3ace9502fe276))
- **auth:** improved notification logging ([44eb5a1](https://github.com/miracleonyenma/devflow/commit/44eb5a13021c074cda7db8593bf45d6122baae8c))
- **auth:** update CLI name and commands from devflow-agent to devflow ([fe7918e](https://github.com/miracleonyenma/devflow/commit/fe7918e522883989535da8198c65887e99938278))
- Await searchParams in Next.js 15+ async server component ([70c099c](https://github.com/miracleonyenma/devflow/commit/70c099c1561d8963fe473dfb21385ed99ee605d9))
- **backend/api:** add auto-save on notification channels update ([5441fd6](https://github.com/miracleonyenma/devflow/commit/5441fd6bb13f1d7e78bca4b4b71e36394af4b955))
- **chore:** add devflow-agent and setup dependencies ([c7f1689](https://github.com/miracleonyenma/devflow/commit/c7f16890e446e5c86d36f868b8ed34c974d2fc5b))
- **cli:** replace 'devflow-agent' command with 'devflow' alias in CLI output and usage ([1c6a8c9](https://github.com/miracleonyenma/devflow/commit/1c6a8c9431288d32737a8e140277ae29c3b70b61))
- Convert agent auth page to server component for reliable redirect ([9018ca7](https://github.com/miracleonyenma/devflow/commit/9018ca7458c7ed88033aeff253aa15bf9b246cc6))
- **deps:** add missing dependencies for vercel build ([41e9112](https://github.com/miracleonyenma/devflow/commit/41e9112c76a25fac317ac5606ac6e4c35f6078a0))
- **Docker:** update health checks and dependencies in agent-host Dockerfile ([a654ea7](https://github.com/miracleonyenma/devflow/commit/a654ea7344b68c3419f861cc20eac83474885591))
- **event_summary:** update event summary with new exciting greeting options ([742d6b6](https://github.com/miracleonyenma/devflow/commit/742d6b64b1ae366d71b7a5be67ce450bf8cc0487))
- **eventSummary:** prevent outputting function tags in chat text and improve webhook event summary tone ([8bf080b](https://github.com/miracleonyenma/devflow/commit/8bf080b490dffa17332297a255e3ad5af9a7661e))
- Improve Docker health check with curl and longer startup grace period ([672b209](https://github.com/miracleonyenma/devflow/commit/672b20919159e657c52036203a4be50e69d79949))
- **lib/agents:** refine eventSummary's exciting greeting ([b5cf36f](https://github.com/miracleonyenma/devflow/commit/b5cf36fed01e3fb905206d4827d16c62d45252da))
- **lib/agents:** update chat assistant with new AI model and configuration ([d25ea83](https://github.com/miracleonyenma/devflow/commit/d25ea83bc35b9ddaa87b1beedfecb9d97b54b50d))
- **lib/agents:** update event summary system messages to match new Devflow personality ([b49ce3e](https://github.com/miracleonyenma/devflow/commit/b49ce3e35ec0f360a63b7c5eec4320f35a8ab1b1))
- **lib/notification:** add error logging and debug information for webhooks ([285c381](https://github.com/miracleonyenma/devflow/commit/285c38146498a0b9cf4fb54f340f6357dc7d514b))
- **lib/webhook:** switch to using new sendPlainMessage function for telegram notifications ([c0227fb](https://github.com/miracleonyenma/devflow/commit/c0227fbac57e24d7edc3d09ff7df6fd1d631be23))
- **notification:** preserve raw error details from failed API requests ([ecc511d](https://github.com/miracleonyenma/devflow/commit/ecc511dd4d41a1a544c5075f121bdea4d3b32943))
- Remove dumb-init, simplify Docker entrypoint - container now starts successfully ([db49e91](https://github.com/miracleonyenma/devflow/commit/db49e9162cc5dba090a497489e203f7d90bd2668))
- remove shell operators from COPY command ([4b5d484](https://github.com/miracleonyenma/devflow/commit/4b5d484f8379f8a0e6e5b101d887260001637edd))
- Replace axios with fetch API for OAuth endpoints ([9b4f369](https://github.com/miracleonyenma/devflow/commit/9b4f369caec585381b42acec1cf957b4f4bf80e4))
- update Dockerfile for Render root directory deployment ([5e04222](https://github.com/miracleonyenma/devflow/commit/5e04222b1fc0846f1655605bf93bdc96b9762282))
- Use GitHub App configured callback URL for CLI OAuth ([767db86](https://github.com/miracleonyenma/devflow/commit/767db86c2a4f7985c9dd327ed63971d196d3085f))
- use npm install instead of npm ci in Dockerfile ([6f26b9b](https://github.com/miracleonyenma/devflow/commit/6f26b9b669e616c9c92c42906b9d07ef3695862c))
- **web:** display installation pending message with troubleshooting steps ([ac77f46](https://github.com/miracleonyenma/devflow/commit/ac77f4636b5bab6905b8db6dd97e7e69fa7616bd))
- **webhook-telegram-route:** correct emoji and message escaping in Telegram notification ([e254460](https://github.com/miracleonyenma/devflow/commit/e2544605e2b5ac75b734cde1bd9620ba30b61b32))
- **webhook:** implement Slack event handling and link channels to Slack ([384ffa0](https://github.com/miracleonyenma/devflow/commit/384ffa0413fc0c5efd46ebd10d992521af674737))
- **web:** remove unnecessary icon and simplify SecurityItem layout ([ed376c7](https://github.com/miracleonyenma/devflow/commit/ed376c729837556bd47807003cbf709aae9c957c))
- **web:** resolve params.slug as promise ([cf6412b](https://github.com/miracleonyenma/devflow/commit/cf6412bdf4251d5efd5b3a58d13fca60bc17f876))
- **web:** update chat assistant model to use llama-3.3-70b-versatile model ([f5b4c5e](https://github.com/miracleonyenma/devflow/commit/f5b4c5e492d8e62c78fbaa07e8407ff606cdd612))
- **web:** update URL for telegram bot link in settings form ([dfe1c85](https://github.com/miracleonyenma/devflow/commit/dfe1c85ba2c87032582d04420c1379e38a0e6a43))
- **web:** upgrade mongoose model import and notification channel error handling ([75be04a](https://github.com/miracleonyenma/devflow/commit/75be04a49017558019b1a467796c3e5f3ee9fe77))

### Code Refactoring

- **auth:** add database connection and models for user, installation, and magic link tokens ([879c75c](https://github.com/miracleonyenma/devflow/commit/879c75cd958d528803a9b8de660165fb70112a71))
- **orchestrator:** refactor environment variable handling for platform and authentication configurations ([8b61523](https://github.com/miracleonyenma/devflow/commit/8b61523c2e3f990baa8c0f9a2b85b040b891f41c))
- refine notification channel configuration types and add spacing to form fields. ([c09d315](https://github.com/miracleonyenma/devflow/commit/c09d31576a58b6a1a877148f54ce0328ba97fa7f))

### Documentation

- add new project documentation files ([e0e1d95](https://github.com/miracleonyenma/devflow/commit/e0e1d957ed2e4fe89b507f0fd3a2ae496af28cba))
- **apps/web:** adjust UI and copy buttons in WebhookInfo component and page.tsx ([0aa1641](https://github.com/miracleonyenma/devflow/commit/0aa16417c5680b0e732ab263d9822921cc119e99))
- **lib:** upgrade marked version to v15.0.4 ([fe95b9f](https://github.com/miracleonyenma/devflow/commit/fe95b9f2271c6d682f3c06cfd8cb6a259bfbc7cd))
- **README:** update main documentation and structure ([cc7638b](https://github.com/miracleonyenma/devflow/commit/cc7638b5cbf3352c5e9fa805062f8b9f6c9f8bd0))
- **README:** update README for new release format and updated repository information ([311237f](https://github.com/miracleonyenma/devflow/commit/311237ffc35095fa2fb5de16e43df0f9c89959cd))
- **tools:** add copilot tools API documentation and tool collection ([a8269f9](https://github.com/miracleonyenma/devflow/commit/a8269f930a9e19cff57c9eefa02b506cb4da9da5))
- **tools:** add Telegram webhook documentation and script ([3362c31](https://github.com/miracleonyenma/devflow/commit/3362c31b3224cdd2f42438e02d90daf6c3678883))
- update documentation and guide links to reflect new Slack and Telegram feature coverage ([4110f22](https://github.com/miracleonyenma/devflow/commit/4110f22cac858954b54df0b22de1d413669eae43))
- update Telegram bot integration and chat assistant ([a1a24e2](https://github.com/miracleonyenma/devflow/commit/a1a24e2ea63790b57a781e49742b442c2264d7c6))

## [0.2.0] - 2025-01-24

### Features

- Real Copilot SDK integration (@github/copilot-sdk@0.1.16)
- Two-tier architecture (SaaS platform + self-hosted CLI agent)
- 4 AI-powered workflows (fix-bug, feature, explain, review-pr)
- 7 integrated tools (git, files, tests, GitHub API, progress, utils)
- OAuth 2.0 authentication with 30-day JWT tokens
- Secure configuration management (mode 0o600)
- Task polling every 5 seconds
- Real-time progress reporting

### Added

- Initial release with complete production-ready platform
- CLI commands: init, start, status
- 11 REST API endpoints
- Comprehensive documentation (60,000+ words)
- E2E testing guide with scenarios
- Production deployment guide
- GitHub Copilot CLI Challenge submission

### Documentation

- Getting Started Guide
- API Reference
- E2E Testing Guide
- Troubleshooting Guide
- Production Deployment Guide
- Package Rebranding Guide

### Build

- TypeScript strict mode compilation
- All 3 applications compile with 0 errors
- npm package ready for distribution

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new features (backwards compatible)
- **PATCH** version for bug fixes (backwards compatible)

## Release Process

### Creating a Release

Use npm scripts for semantic versioning:

```bash
# For bug fixes (PATCH: 0.2.0 → 0.2.1)
npm run release:patch

# For new features (MINOR: 0.2.0 → 0.3.0)
npm run release:minor

# For breaking changes (MAJOR: 0.2.0 → 1.0.0)
npm run release:major

# Auto-detect based on commits
npm run release
```

### What Happens

Each release command will:

1. ✅ Analyze conventional commits since last tag
2. ✅ Update version in package.json
3. ✅ Generate/append to CHANGELOG.md
4. ✅ Create git commit with tag
5. ✅ Ready to push and publish

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
perf: improve performance
docs: update documentation
refactor: refactor code
test: add tests
chore: maintenance tasks
```

Example:

```bash
git commit -m "feat: add new workflow type"
git commit -m "fix: correct agent polling interval"
git commit -m "docs: update API reference"
```

## Publishing

After creating a release:

```bash
# Push changes and tags
git push origin main --follow-tags

# Publish to npm (in apps/agent)
npm publish --access public
```

---

Generated by [standard-version](https://github.com/conventional-changelog/standard-version)
