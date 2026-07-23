export * as Components from "./src/components";
export * as Layout from "./src/layout";
export * as Navigation from "./src/navigation";
export type { ToolCategory } from "./src/components/category-tag";

// NOTE: do not re-export the stylesheet from this barrel. `export * from
// "./styles/toolshare.css"` made every consumer that imports a component
// pull the CSS in as a second entry point, and since that file imports
// tailwindcss, the bundler emitted a whole extra @layer
// theme/base/components/utilities build — two copies of every utility.
// Apps import the stylesheet once, explicitly:
//   @import '@toolshare/ui/styles/toolshare.css';