# CLi.ng Instructions for Amokka Coffee Quiz

## General Coding Style

*   **Use functional components with hooks:**  Always prefer functional components over class components.
*   **Use `const` and `let`:**  Never use `var`.
*   **Use strict equality (`===`):** Avoid loose equality (`==`).
*   **Consistent indentation:** Use 2 spaces for indentation.
*   **Descriptive variable and function names:** Use camelCase for variables and functions (e.g., `currentQuestionIndex`, `handleAnswerClick`).
*   **Comments:** Add concise comments to explain *why* code is written a certain way, especially for complex logic. Do *not* comment on the obvious.
*   **Error Handling:** Implement proper error handling (e.g., `try...catch` blocks) where appropriate, especially for asynchronous operations (like fetching data from Supabase).

## React-Specific Rules

*   **Component Structure:** Organize components into a `src/components` directory. Each component should have its own file (e.g., `Question.js`, `Answer.js`).
*   **Prop Types:**  Always define prop types for your components. Use the `prop-types` library.
*   **State Management:**  Use the React Context API with `useReducer` (or Zustand) for managing application state.  Create a separate context file (e.g., `src/context/QuizContext.js`) to define the context and reducer.
*   **Styling:** Use Tailwind CSS classes for styling.  Avoid inline styles.  Refer to the Amokka brand guidelines (you'll need to provide these to CLi.ng separately) for color palettes and typography.
*   **Avoid Unnecessary Re-renders:**  Use `React.memo` to prevent unnecessary re-renders of components when their props haven't changed.
*   **Hooks:** Follow the rules of hooks (only call hooks at the top level of your components, not inside loops, conditions, or nested functions).

## Supabase-Specific Rules

*   **Use the Supabase JavaScript library:**  Do not attempt to use raw SQL queries directly.
*   **Serverless Functions:** All interactions with Supabase should happen within serverless functions (in the `api` directory).  Do not access Supabase directly from client-side components.
*   **Error Handling:** Always handle potential errors from Supabase API calls (e.g., network errors, database errors).

## Tailwind CSS Specific

*	**Spacing:** Use spacing utilities like `m-2`, `p-4`, `mt-8`, etc., rather than defining custom margins and padding in pixels.
* **Responsiveness:** Use responsive modifiers like `sm:`, `md:`, `lg:`, and `xl:` to create a responsive design that works on all screen sizes. For example: `md:w-1/2` (width 50% on medium screens and up).
* **Consistency:** Stick to the default Tailwind color palette and spacing scale as much as possible.

## Web Scraping (Serverless Functions)

*   **Use Cheerio (or Puppeteer/Playwright if necessary):** Prefer Cheerio for simpler HTML structures.
*   **Robust Selectors:** Use specific and robust CSS selectors to target the correct elements on the Amokka website.  Avoid brittle selectors that are likely to break if the website's structure changes slightly.
*   **Error Handling:** Implement error handling to gracefully handle cases where the website structure changes or the website is unavailable.
*   **Rate Limiting:** Be mindful of the Amokka website's terms of service and avoid making too many requests in a short period. Implement rate limiting if necessary.

## File and Directory Naming Conventions

* **Component files:** `PascalCase.js` (e.g., `Question.js`, `AnswerButton.js`).
* **Serverless function files:** `kebab-case.js` (e.g., `get-coffees.js`, `submit-quiz.js`).
* **Utility functions:** `camelCase.js` (e.g., `calculateRecommendation.js`).
* **Context file** `QuizContext.js`
