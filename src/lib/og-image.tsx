import { ImageResponse } from "next/og";

export const ogImageAlt =
  "Python Lists Playground — Learn Python list methods visually";
export const ogImageSize = {
  width: 1200,
  height: 630,
};
export const ogImageContentType = "image/png";

export function createOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#fffaf6",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: "2px solid #d6c8ba",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: "#ff6b00",
              }}
            />
          </div>
          <div style={{ fontSize: 24, color: "#5c5c5c" }}>
            Python Lists Playground
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 600,
            color: "#171717",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Learn Python lists by playing with them.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            color: "#5c5c5c",
            maxWidth: 820,
          }}
        >
          Visualize append, pop, insert, sort, and more in real time.
        </div>
      </div>
    ),
    {
      ...ogImageSize,
    },
  );
}
