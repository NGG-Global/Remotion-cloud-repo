import React from "react";

type AssetPlaceholderProps = {
  readonly component: string;
  readonly assetId: string;
};

/** Visible stand-in. Never renders the text "undefined". */
export const AssetPlaceholder: React.FC<AssetPlaceholderProps> = ({
  component,
  assetId,
}) => {
  const label = assetId.length > 0 ? assetId : "(no asset id)";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 80,
        boxSizing: "border-box",
        background: "#3a1212",
        color: "#ffd7d7",
        border: "4px solid #ff5c5c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        lineHeight: 1.25,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 22 }}>MISSING {component}</div>
      <div style={{ fontSize: 28 }}>{label}</div>
    </div>
  );
};
