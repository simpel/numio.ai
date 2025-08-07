# Web App Performance Audit

This document outlines key performance issues and potential pitfalls discovered during an audit of the `@apps/web` Next.js application. The findings are categorized by area of concern, with specific file references and recommendations for improvement.

## 1. Data Fetching Inefficiencies

The most significant performance bottlenecks are related to how data is fetched from the server. The application suffers from several data-fetching waterfalls and N+1 query problems, leading to slow page loads and delayed UI updates.

### 1.1. Sequential Data Fetching (Waterfalls)

Multiple pages fetch data sequentially for independent resources, where they could be fetched in parallel. This blocks rendering until the entire chain of requests is complete.

-   **Affected Files**:
    -   `apps/web/app/(withSidebar)/chat/[id]/page.tsx`
    -   `apps/web/app/(withSidebar)/profile/page.tsx`
    -   `apps/web/app/(withSidebar)/layout.tsx`

-   **Issue**: In `chat/[id]/page.tsx`, the page `await`s `checkProfile()`, then `getChat()`, then `getProviders()`, and finally `getInitialModel()`. These calls are independent and should be parallelized. A similar pattern exists on the `profile` page.

-   **Recommendation**: Use `Promise.all` to fetch independent resources concurrently. This will significantly reduce the total data fetching time for the page.

    ```javascript
    // Example for profile/page.tsx
    const [profile, instructions, companies, models] = await Promise.all([
      checkProfile({ redirectTo: '/profile' }),
      db.modelInstruction.findUnique({ where: { profileId: profile?.id } }), // This one depends on profile, but others don't
      db.company.findMany({ orderBy: { name: 'asc' } }),
      db.model.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } })
    ]);
    ```
    *Note: Adjust for dependencies. Data that depends on a prior fetch must still wait, but all independent fetches should be grouped.*

### 1.2. Client-Side N+1 Query Problem

The chat history in the sidebar is a major source of performance issues due to how titles are fetched.

-   **Affected File**: `apps/web/src/components/sidebar-chat-title.tsx`
-   **Issue**: The component uses a `useSWR` hook to fetch the title for *each chat* individually if the title is missing. If a user has 20 chats in their history, this triggers 20 separate API requests on the client, overwhelming the browser and server.
-   **Recommendation**:
    1.  **Server-Side Generation**: The best solution is to generate and save the chat title to the database when the chat session concludes. This avoids fetching it on the client entirely. The `generateTitle` helper already exists.
    2.  **Batch Fetching**: If server-side generation isn't feasible, create a single API endpoint that accepts an array of chat IDs and returns all their titles in one request. This would reduce 20 requests to just one.

### 1.3. Inefficient API Route Logic

The primary chat API route has high latency due to multiple sequential database queries.

-   **Affected File**: `apps/web/app/api/chat/route.ts`
-   **Issue**: The `POST` handler performs a series of `await` calls to the database for verifying the session, fetching the model, fetching the chat, and storing messages before it begins streaming the AI response. Each `await` adds latency.
-   **Recommendation**: Optimize the database queries. Combine fetches where possible (e.g., fetch user profile and model in parallel). Reduce the number of queries needed before the stream starts to improve the "time-to-first-token".

## 2. Frontend & Rendering Performance

### 2.1. Unoptimized Images

The application consistently uses the standard `<img>` tag instead of the Next.js `<Image>` component.

-   **Affected Files**:
    -   `apps/web/src/components/search-results-image.tsx`
    -   `apps/web/src/components/video-search-results.tsx`
    -   `apps/web/src/components/model-selector.tsx`
    -   `apps/web/src/components/nav-user.tsx`
-   **Issue**: Using `<img>` bypasses critical Next.js optimizations, including automatic resizing, format conversion (e.g., WebP), and lazy loading. This leads to larger-than-necessary image downloads and slower page loads.
-   **Recommendation**: Replace all `<img>` tags with `next/image`. Ensure that `width`, `height`, and `alt` props are correctly provided. If the image source is external, configure the remote patterns in `next.config.mjs`.

### 2.2. Heavy Client-Side Dependencies

The application bundle size is likely inflated by heavy libraries that are not code-split.

-   **Affected File**: `apps/web/src/components/codeblock.tsx`
-   **Issue**: `react-syntax-highlighter` is a large library that is loaded on the initial page load, even if no code blocks are present.
-   **Recommendation**: Use `next/dynamic` to lazy-load the `CodeBlock` component. This will ensure the syntax highlighting library is only downloaded when it's actually needed.

    ```javascript
    import dynamic from 'next/dynamic'

    const CodeBlock = dynamic(() => import('./codeblock').then(mod => mod.CodeBlock), {
      ssr: false, // Or provide a loading skeleton
    })
    ```

### 2.3. Unnecessary Overhead on 404 Page

The 404 page is unnecessarily slow because it makes a server call to an AI model to generate a "creative" message.

-   **Affected File**: `apps/web/app/not-found.tsx`
-   **Issue**: This introduces a network request and a slow, potentially failing AI call for a simple error page. This is poor user experience and adds unnecessary load.
-   **Recommendation**: Replace the dynamic message with a static one. The goal of a 404 page is to be fast and helpful, not to showcase AI that might fail or be slow.

### 2.4. Inefficient Scrolling Logic

-   **Affected File**: `apps/web/src/components/chat-messages.tsx`
-   **Issue**: The component uses `setInterval` to repeatedly call `scrollIntoView` during message streaming. This is inefficient and can cause layout jank.
-   **Recommendation**: Remove the `setInterval`. The `useEffect` hook is already dependent on `messages.length`, which is sufficient to scroll to the bottom when a new message is added. For streaming, a `MutationObserver` on the message content `div` would be a more performant way to trigger scrolling as new text chunks arrive.

### 2.5. Confusing Font Configuration

-   **Affected Files**: `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, `apps/web/tailwind.config.ts`
-   **Issue**: The project seems to import and configure three different fonts (`Inter`, `geist`, and a generic `system-ui` stack) in three different places. This is confusing and can lead to unexpected font loading behavior or flashes of unstyled text.
-   **Recommendation**: Consolidate the font strategy. Choose a single font, import it correctly using `next/font` in the root layout, and configure `tailwind.config.ts` to use the corresponding CSS variable. Remove the conflicting `@font-face` or `font-family` definitions from `globals.css`.

## 3. General Code Health

### 3.1. Missing Suspense Boundaries for Data Fetching

-   **Affected File**: `apps/web/app/(withSidebar)/layout.tsx`
-   **Issue**: The layout fetches data (`checkProfile`, `db.chat.findMany`) *outside* of its `Suspense` boundary. This means the entire layout, including the sidebar and main content area, is blocked from rendering until these initial data fetches are complete.
-   **Recommendation**: Move the data-fetching logic into specific components that are wrapped in `<Suspense>`. For example, the chat history fetch could be moved into the `NavHistory` component, which would then be wrapped in Suspense in the layout, allowing the rest of the page to render while history loads.

## 4. Advanced Performance & Code Health Findings

This section covers more nuanced issues found during a deeper analysis of the codebase, focusing on architectural patterns, state management, and bundle size optimizations.

### 4.1. Redundant SWR Hooks and State Management

-   **Affected Files**:
    -   `apps/web/src/lib/db/chat/chat-settings.hook.ts`
    -   `apps/web/src/components/chat-panel/chat-panel.tsx`
-   **Issue**: The application defines three separate custom hooks (`useChatVisibility`, `useChatSearchMode`, `useChatModel`) that each use an `SWR` call to fetch data from the *exact same* API endpoint (`/api/operations/chat/[chatId]`). While SWR deduplicates the network requests, this pattern leads to multiple subscriptions to the same data source, causing redundant re-renders and overly complex state management in the `ChatPanel` component.
-   **Recommendation**: Consolidate the three hooks into a single `useChatSettings` hook. This hook would fetch the data once and return an object containing all settings (`isPublic`, `searchModeEnabled`, `modelId`) and their respective update functions. This centralizes the logic, simplifies the `ChatPanel` component, and reduces the number of SWR subscriptions, leading to better rendering performance.

### 4.2. Inefficient Authentication Session Handling

-   **Affected File**: `apps/web/src/lib/auth/auth.ts`
-   **Issue**: The `session` callback in `NextAuth` configuration performs a database lookup (`db.userProfile.findUnique`) every time a session is checked. This is highly inefficient, as it adds database latency to any authenticated action or page load.
-   **Recommendation**: Optimize session management by enriching the JSON Web Token (JWT). During the `jwt` callback (which runs on sign-in), fetch the user's profile data once and encode essential, non-sensitive information (like `profileId`, `hasDoneIntro`, `role`) into the token itself. The `session` callback can then read this data directly from the token, eliminating the need for a database call on every session verification.

### 4.3. Uncached Database Calls in Helpers

-   **Affected File**: `apps/web/src/lib/db/chat/chat.helpers.ts`
-   **Issue**: The `generateTitle` helper function fetches the default AI model from the database every time it is called. This model data is unlikely to change frequently, and repeated database calls are unnecessary.
-   **Recommendation**: Cache this database call. Use a simple in-memory cache with a Time-to-Live (TTL) or leverage Next.js's `unstable_cache` or `React.cache` to cache the default model lookup. This will prevent redundant database queries and speed up title generation.

### 4.4. React Anti-Pattern: Unstable `key` Prop

-   **Affected File**: `apps/web/src/components/bot-message.tsx`
-   **Issue**: The `CodeBlock` component is rendered with `key={Math.random()}`. Using a random or unstable value for a `key` is a React anti-pattern. It forces React to unmount and re-mount the component on every render, destroying its internal state (e.g., scroll position, copied state) and causing unnecessary performance overhead.
-   **Recommendation**: Replace `Math.random()` with a stable key. The component's index within the `map` function (`key={\`code-block-${index}\`}`) is a much better and more performant choice.

### 4.5. Eager Loading of Offscreen Video iFrames

-   **Affected File**: `apps/web/src/components/video-search-results.tsx`
-   **Issue**: The component renders a carousel of YouTube videos using `<iframe>` tags. All iframes are rendered in the DOM at once, even those that are not visible. This is extremely resource-intensive, slowing down the initial render of the dialog and consuming significant memory.
-   **Recommendation**: Lazy-load the iframes. Only render the `<iframe>` for the currently active carousel slide. For all other slides, display a lightweight placeholder (e.g., the video thumbnail). When the user navigates to a new slide, dynamically render its iframe and destroy the previous one.

### 4.6. Aggressive SWR Revalidation on Focus

-   **Affected Files**:
    -   `apps/web/src/components/sidebar-chat-title.tsx`
    -   `apps/web/src/components/header.tsx`
-   **Issue**: Multiple components use `useSWR` without setting `revalidateOnFocus: false`. By default, SWR re-fetches data whenever the window or tab regains focus. In this application, this can trigger a "request storm" where many components try to refresh their data simultaneously, leading to a sluggish UI and unnecessary backend load.
-   **Recommendation**: Globally configure SWR to set `revalidateOnFocus: false` by default, or apply this setting individually to all `useSWR` hooks where the data is not expected to change in real-time. This is a critical optimization for applications with many independent data-fetching components.

### 4.7. Unnecessary Re-renders in Form Components

-   **Affected File**: `apps/web/src/components/forms/instructions-form.tsx`
-   **Issue**: The `refreshTraits` function creates a new shuffled array and sets the state, causing a re-render. The subsequent `useEffect` filters this array and sets state again, causing a second re-render.
-   **Recommendation**: Combine these operations. The `refreshTraits` function should calculate the new traits and set the state in a single operation. Furthermore, the `addTrait` function can be optimized by using a functional state update with `setUsedTraitIds` to avoid stale state issues, and the filtering logic could be memoized with `useMemo` to prevent re-calculation on every render if the source `instructionTraits` array were to become large or dynamic.
