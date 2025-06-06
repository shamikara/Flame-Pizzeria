// types/navigation.d.ts

import React from "react";

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon?: React.ReactNode;
  secondary?: boolean;
  items?: IRoute[]; // optional nested routes
}
