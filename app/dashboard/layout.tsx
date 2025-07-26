import React from "react";
import "../globals.css";

function layout({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-body">{children}</div>;
}

export default layout;
