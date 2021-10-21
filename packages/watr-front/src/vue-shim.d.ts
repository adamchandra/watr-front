declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'splitpanes' {
  export declare class Splitpanes extends Vue {}
  export declare class Pane extends Vue {}
}
