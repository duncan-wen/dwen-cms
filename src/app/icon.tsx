import { ImageResponse } from "next/og";
import { lightColours } from "@/og/light-colours";
import { serifFont } from "@/og/serif-font";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The favicon: the 「溫」 seal, in the light theme's colours. */
export default async function Icon() {
  const colours = await lightColours();
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        borderRadius: 6,
        background: colours.accent,
        color: colours["on-accent"],
        fontFamily: "Noto Serif TC",
        fontSize: 46,
        fontWeight: 900,
      }}
    >
      溫
    </div>,
    { ...size, fonts: [await serifFont(900, "溫")] },
  );
}
