// declare module '*.vue' {
//   import Vue from 'vue'
//   export default Vue
// }

declare module 'splitpanes' {
  export declare class Splitpanes extends Vue {}
  export declare class Pane extends Vue {}
}


// eslint-disable-next-line no-restricted-exports
// export { default } from 'vue';
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
