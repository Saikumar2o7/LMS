"use client";

import { NotificationProvider as AntNotificationProvider } from "antd/es/notification/interface";
import { App } from "antd";
import { ReactNode } from "react";

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <App>{children}</App>;
}
