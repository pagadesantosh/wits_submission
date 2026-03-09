# Username Availability Checker

**Live demo:** https://pagadesantosh.github.io/wits_submission/

An Angular 19 app that lets a user pick a unique username before registering. It checks availability in real time as you type and shows instant feedback.

## Features

- Real-time username availability check with debounce (400 ms)
- Sync validation: required, min/max length, alphanumeric + underscore only
- Async validator hitting a mock service that simulates network latency and occasional failures
- Signals + OnPush change detection throughout
- Bootstrap 5 styling, no custom CSS
- Two routes — standalone page (`/`) and registration page (`/register`) that reuses the same component
- `UserAvailabilityComponent` supports `[embedded]` input and `(usernameRegistered)` output for reuse

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `UserAvailabilityComponent` | Standalone full-page username checker |
| `/register` | `RegistrationComponent` | Registration page that embeds the username component |

## Project Structure

```
src/
  app/
    core/services/
      username-checker.service.ts          # mock availability API
    shared/validator/
      username-availability.validator.ts   # async validator factory
    features/
      user-availability/
        user-availability.component.ts     # reusable component (embedded input + usernameRegistered output)
        user-availability.component.html
      registration/
        registration.component.ts          # consumes UserAvailabilityComponent
        registration.component.html
    app.component.ts                       # navbar + router-outlet
    app.routes.ts                          # route definitions
    app.config.ts                          # app providers
```

## Getting Started

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

## Running Tests

```bash
ng test
```

## Build

```bash
ng build
```

Output goes to `dist/wits/`.

## Deploying to GitHub Pages

Install the deploy tool (first time only):

```bash
npm install angular-cli-ghpages --save-dev
```

Build with the correct base href — use `MSYS_NO_PATHCONV=1` to prevent Git Bash from converting the path on Windows:

```bash
MSYS_NO_PATHCONV=1 npx ng build --base-href /wits_submission/
```

Deploy to the `gh-pages` branch:

```bash
npx angular-cli-ghpages --dir=dist/wits/browser
```

Then go to **Settings → Pages** in the GitHub repo, set the source branch to `gh-pages`, and save. The app will be live at:

**https://pagadesantosh.github.io/wits_submission/**

## Demo Usernames

These are pre-seeded as taken: `admin`, `john_doe`, `superuser`, `test`, `angular_dev`, `root`, `guest`

---

## Architectural Decisions

### State management — why Signals?

I used Angular Signals for the component state (`checkStatus`, `isSubmitting`, `submittedPayload`) rather than BehaviorSubjects. The main reason is that Signals work naturally with OnPush — the template re-evaluates only when a signal it reads actually changes, with no extra plumbing needed. `statusLabel` is a computed signal derived from `checkStatus`, so it stays in sync automatically without me having to manage a separate subscription.

For an app this size, a store like NgRx would be overkill. If this were shared across multiple routes I'd lift the state into a shared Signal store, but keeping it local to the component is the right call here.

### Validator — why a factory function?

Angular's DI doesn't inject services into plain functions, so the cleanest way to get the `UsernameCheckerService` into the validator is to pass it as an argument through a factory. It keeps the validator stateless and easy to test — I just pass in a spy. Attaching it to the class would have tied the validator to this one component.

The debounce is handled with `timer(debounceMs)` inside the validator itself. Angular automatically cancels the previous validator observable whenever the control value changes, which gives debounce behaviour for free without subscribing to `valueChanges` separately.

### Change detection — OnPush

Combined with Signals, OnPush means the component won't re-render on every parent change cycle. It only updates when an input reference changes or a signal read in the template emits a new value. For a form that's doing async work on every keystroke this matters.

### Service design

`UsernameCheckerService` is `providedIn: 'root'` so it's a singleton. The taken-usernames set stays consistent regardless of how many times the component is mounted. Swapping the mock for a real `HttpClient` call later means only changing the internals of `checkAvailability` — the rest of the app doesn't care.

### Component reusability — `embedded` input + `usernameRegistered` output

`UserAvailabilityComponent` works in two modes:

- **Standalone** (`[embedded]="false"`, default) — renders its own full-page wrapper, card, and header. Used on the `/` route.
- **Embedded** (`[embedded]="true"`) — renders just the form fields with no outer layout. Used inside `RegistrationComponent` on `/register`.

The `(usernameRegistered)` output emits the registered username string when the form is submitted successfully, so the parent component can react without knowing any internals.

---

## Section B — Generative AI & Productivity

**1. Project Experience**

On a recent dashboard project I used GitHub Copilot mainly for boilerplate — setting up reactive form groups, writing RxJS pipe chains, and scaffolding unit test cases. It saved a lot of time on the repetitive parts.

**2. Impact Analysis**

The biggest benefit was speed on things I already knew how to do. The challenge is that suggestions can look correct but miss edge cases — for example Copilot once suggested a switchMap where a mergeMap was the right operator, which would have caused a race condition. I caught it in code review. You can't just accept suggestions without understanding what they're doing.

**3. Workflow Integration**

I treat it like autocomplete with a longer reach. I write the function signature and the first line, then let it suggest the body. I always read the suggestion before accepting, and if something looks off I Google the behaviour rather than just trusting it.

**4. Case Study**

Writing Jasmine specs is where it gave me the most leverage. Once I had one `fakeAsync` test written the way I wanted, Copilot could generate the structure of the next three tests pretty accurately. I still had to adjust the tick values and the exact expectations, but the scaffolding was mostly right.

**5. Validation Strategy**

I run the tests. If the generated code is logic-heavy I step through it mentally or with a debugger. For anything touching security or API contracts I always read the implementation line by line regardless of the source.

**6. Quality Standards**

Generated code goes through the same PR review process as anything else. I specifically check for: missing error handling, incorrect operator usage in RxJS, and any place where the suggestion used a pattern that would work in a simple case but break under load or with real async timing.

---

## Section C — Angular Architecture

**1. Large-Scale Design**

I follow a feature-based folder structure — each feature is a self-contained folder with its own components, services, and routes. Shared utilities go in a `shared/` module and things like HTTP interceptors or auth guards sit in `core/`. This makes it easy to lazy-load features and keeps the initial bundle small.

**2. State Management, Modularisation, Reusability**

For smaller apps or isolated features I use component-level Signals, as in this project. For anything that needs to be shared across routes I use a Signal-based service (or NgRx for teams that are already using it). I keep components dumb where possible — they receive data and emit events, and the service handles the actual logic. Validators and pipes go in `shared/` so they can be reused without importing a full feature module.

**3. Performance**

OnPush change detection everywhere by default. Lazy loading for feature routes — the router only loads a module when a user navigates to it. For lists I always check whether `trackBy` is needed to avoid unnecessary DOM churn. I use the Angular DevTools profiler to find components that re-render more than expected, and Chrome's Performance panel for any runtime bottlenecks.

**4. Advanced Features**

I've built custom attribute directives for things like auto-focus on modal open and a tooltip that reads from a config object. For dynamic component loading I've used `ViewContainerRef.createComponent()` to build a notification system where toasts are rendered into a portal outlet at the app root. For DI, I've used `InjectionToken` to provide environment config (API base URLs, feature flags) so components don't import environment files directly and the same code works across environments without changes.
