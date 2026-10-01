/**
 * SINGLE WEBGL SPLIT POINT — every `dynamic(ssr: false)` GL mount must import
 * from THIS module, never from a scene file directly. Separate dynamic entry
 * points each bundle their own copy of Three.js (~230KB gzipped per copy);
 * one shared entry means one Three.js chunk site-wide, fetched once.
 */

export { default as StatementGL } from "./StatementGL";
