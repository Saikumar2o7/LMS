// types/globals.d.ts
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// For side-effect imports (like globals.css)
declare module "*.css" {
  const content: string;
  export default content;
}
