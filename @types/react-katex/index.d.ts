/// <reference types="node" />

declare module "react-katex" {
  import React from "react";
  export const InlineMath: React.ComponentType<{
    children?: string;
    errorColor?:'string',
    math?: string;
  }>;
}
