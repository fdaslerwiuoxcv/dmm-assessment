import { useState, useEffect, useRef, Component } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070F26", fontFamily: "'Outfit', sans-serif", padding: 40 }}>
          <div style={{ maxWidth: 520, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "40px 44px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: "white", fontFamily: "'Fraunces', serif", fontSize: 22, margin: "0 0 12px" }}>Something went wrong</h2>
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, margin: "0 0 28px" }}>Your assessment data has been saved and will still be available after refreshing.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "linear-gradient(135deg,#0072BC,#009AA4)", border: "none", borderRadius: 10, padding: "12px 28px", color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
            >
              ↺ Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Font Injection ──────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap";
document.head.appendChild(fontLink);

// ─── NTT Data Logos (base64 embedded) ───────────────────────────────────────
const LOGO_WHITE_B64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDE1OTYuNyA0MzkuMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTU5Ni43IDQzOS4zOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2Rpc3BsYXk6bm9uZTt9Cgkuc3Qxe2Rpc3BsYXk6aW5saW5lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCS5zdDJ7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojRkZGRkZGO30KCS5zdDN7ZmlsbDojRkZGRkZGO30KPC9zdHlsZT4KPGcgaWQ9IuODrOOCpOODpOODvF8yIiBjbGFzcz0ic3QwIj4KCTxyZWN0IHg9IjAuNSIgeT0iMC41IiBjbGFzcz0ic3QxIiB3aWR0aD0iMTU5NS43IiBoZWlnaHQ9IjQzOC4zIi8+CjwvZz4KPGcgaWQ9IuODrOOCpOODpOODvF8xIj4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0zMTguMyw4NS41Yy0xMi44LDAtMjUuNCwyLjgtMzQuMyw2LjRjLTguOS0zLjYtMjEuNS02LjQtMzQuMy02LjRjLTU2LjQsMC0xMDcuNCw1My40LTEwNy40LDEyNi42CgkJCWMwLDc5LjgsNjUuMiwxNDEuNiwxNDEuNywxNDEuNmM3Ni41LDAsMTQxLjctNjEuNywxNDEuNy0xNDEuNkM0MjUuNywxMzguOSwzNzQuNyw4NS41LDMxOC4zLDg1LjVMMzE4LjMsODUuNXogTTI4NCwxMjkKCQkJYzEwLjksNi41LDI1LjIsMjUuMiwyNS4yLDQ2LjRjMCwxNS41LTEwLjIsMjcuNy0yNS4yLDI3LjdjLTE1LDAtMjUuMi0xMi4yLTI1LjItMjcuN0MyNTguNywxNTQuMiwyNzMuMSwxMzUuNSwyODQsMTI5TDI4NCwxMjl6CgkJCSBNMjg0LDMxOC44Yy01OC41LDAtMTA2LjktNDcuMS0xMDYuOS0xMDcuNGMwLTU1LjEsMzkuOC05Mi43LDcxLTkxLjNjLTE0LjgsMTQuNy0yMy44LDM2LjItMjMuOCw1N2MwLDM1LjgsMjguNCw2MC45LDU5LjcsNjAuOQoJCQljMzEuMywwLDU5LjctMjUuMSw1OS43LTYwLjljMC0yMC44LTktNDIuMy0yMy44LTU3YzMxLjItMS40LDcxLDM2LjIsNzEsOTEuM0MzOTAuOSwyNzEuOCwzNDIuNSwzMTguOCwyODQsMzE4Ljh6Ii8+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik02MjkuOCwxNDYuNnYyOS4yYzAsMCw0MS4zLDAsNDQuNSwwYzAsMy4yLDAsMTA5LjUsMCwxMDkuNWgzMS41YzAsMCwwLTEwNi4yLDAtMTA5LjVjMy4xLDAsNDQuNSwwLDQ0LjUsMAoJCQkJdi0yOS4ySDYyOS44eiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMTE0OC4xLDE0Ni42aC03OS4zVjE3Nmg3Ny4yYzExLjMsMCwxNS43LDUuMiwxNS43LDE4LjRjMCwwLjEsMCwzLjgsMCw0LjljLTMuMiwwLTY0LDAtNjQsMAoJCQkJYy0yNC4zLDAtMzYuNCwxMi4yLTM2LjQsMzkuN3Y2LjVjMCwyOC4zLDEyLjUsMzkuNiwzNy44LDM5LjZoOTMuOHYtOTEuMUMxMTkzLDE1OS4yLDExODEuNCwxNDYuNiwxMTQ4LjEsMTQ2LjZ6IE0xMTAyLjQsMjU1LjYKCQkJCWMtNC44LDAtMTAuMS0yLjQtMTAuMS0xNC4zYzAtMTEuOSw1LjMtMTQsMTAuMS0xNGMwLDAsNTYuMiwwLDU5LjQsMHYyOC4zQzExNTguNiwyNTUuNiwxMTAyLjQsMjU1LjYsMTEwMi40LDI1NS42eiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMTQwOS42LDE0Ni42aC03OS4zVjE3Nmg3Ny4yYzExLjMsMCwxNS43LDUuMiwxNS43LDE4LjRjMCwwLjEsMCwzLjgsMCw0LjljLTMuMiwwLTY0LDAtNjQsMAoJCQkJYy0yNC4zLDAtMzYuNCwxMi4yLTM2LjQsMzkuN3Y2LjVjMCwyOC4zLDEyLjUsMzkuNiwzNy44LDM5LjZoOTMuOHYtOTEuMUMxNDU0LjQsMTU5LjIsMTQ0Mi45LDE0Ni42LDE0MDkuNiwxNDYuNnogTTEzNjMuOSwyNTUuNgoJCQkJYy00LjgsMC0xMC4xLTIuNC0xMC4xLTE0LjNjMC0xMS45LDUuMy0xNCwxMC4xLTE0YzAsMCw1Ni4yLDAsNTkuNCwwdjI4LjNDMTQyMC4xLDI1NS42LDEzNjMuOSwyNTUuNiwxMzYzLjksMjU1LjZ6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik03NjAuMiwxNDYuNnYyOS4yYzAsMCw0MS40LDAsNDQuNSwwYzAsMy4yLDAsMTA5LjUsMCwxMDkuNWgzMS41YzAsMCwwLTEwNi4yLDAtMTA5LjVjMy4xLDAsNDQuNSwwLDQ0LjUsMAoJCQkJdi0yOS4ySDc2MC4yeiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMTE5OS4zLDE0Ni42djI5LjJjMCwwLDQxLjMsMCw0NC41LDBjMCwzLjIsMCwxMDkuNSwwLDEwOS41aDMxLjVjMCwwLDAtMTA2LjIsMC0xMDkuNWMzLjEsMCw0NC41LDAsNDQuNSwwCgkJCQl2LTI5LjJIMTE5OS4zeiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMTA0OS4yLDIzNi43di00MS41YzAtMzYuMy0xNC4xLTQ4LjYtNDUuOS00OC42SDkxOXYxMzguNmg4NS44QzEwMzguNSwyODUuMiwxMDQ5LjIsMjY4LjUsMTA0OS4yLDIzNi43egoJCQkJIE0xMDE3LDIzNy4zYzAsMTMuMy00LjUsMTguNC0xNS44LDE4LjRjMCwwLTQ3LjYsMC01MC43LDB2LTc5LjZjMy4xLDAsNTAuNywwLDUwLjcsMGMxMS4zLDAsMTUuOCw1LjIsMTUuOCwxOC40CgkJCQlDMTAxNywxOTQuNywxMDE3LDIzNy4zLDEwMTcsMjM3LjN6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik01ODUuNCwyNTIuMmMtMC43LTEuMy00Mi44LTgzLjMtNDcuOS05MS4zYy01LjktOS4zLTEzLjItMTUuOC0yNy0xNS44Yy0xMi45LDAtMjguMSw1LjctMjguMSwzNi42djEwMy43CgkJCQloMzEuMWMwLDAsMC04MC4yLDAtODYuNWMwLTYuMi0wLjQtMTUuNC0wLjUtMTcuMmMtMC4xLTEuNSwwLTMsMC44LTMuNGMwLjktMC41LDEuOCwwLjMsMi40LDEuNWMwLjYsMS4yLDM5LjYsNzguMyw0Ny45LDkxLjMKCQkJCWM1LjksOS4zLDEzLjIsMTUuOCwyNywxNS44YzEyLjgsMCwyOC4xLTUuNywyOC4xLTM2LjZWMTQ2LjZoLTMxYzAsMCwwLDgwLjIsMCw4Ni41YzAsNi4yLDAuNCwxNS40LDAuNSwxNy4zYzAuMSwxLjUsMCwzLTAuOCwzLjQKCQkJCUM1ODYuOSwyNTQuMiw1ODYsMjUzLjQsNTg1LjQsMjUyLjJ6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=";
const LOGO_BLACK_B64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDE1OTUuNyA0MzguMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTU5NS43IDQzOC4zOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6bm9uZTt9Cgkuc3Qxe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO30KPC9zdHlsZT4KPGcgaWQ9IuODrOOCpOODpOODvF8yIj4KPC9nPgo8ZyBpZD0i44Os44Kk44Ok44O8XzEiPgoJPHJlY3QgY2xhc3M9InN0MCIgd2lkdGg9IjE1OTUuNyIgaGVpZ2h0PSI0MzguMyIvPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTMxNy44LDg1Yy0xMi44LDAtMjUuNCwyLjgtMzQuMyw2LjRjLTguOS0zLjYtMjEuNS02LjQtMzQuMy02LjRjLTU2LjQsMC0xMDcuNCw1My40LTEwNy40LDEyNi42CgkJCWMwLDc5LjgsNjUuMiwxNDEuNiwxNDEuNywxNDEuNmM3Ni41LDAsMTQxLjctNjEuNywxNDEuNy0xNDEuNkM0MjUuMiwxMzguNCwzNzQuMiw4NSwzMTcuOCw4NUwzMTcuOCw4NXogTTI4My41LDEyOC41CgkJCWMxMC45LDYuNSwyNS4yLDI1LjIsMjUuMiw0Ni40YzAsMTUuNS0xMC4yLDI3LjctMjUuMiwyNy43Yy0xNSwwLTI1LjItMTIuMi0yNS4yLTI3LjdDMjU4LjIsMTUzLjcsMjcyLjYsMTM1LDI4My41LDEyOC41CgkJCUwyODMuNSwxMjguNXogTTI4My41LDMxOC4zYy01OC41LDAtMTA2LjktNDcuMS0xMDYuOS0xMDcuNGMwLTU1LjEsMzkuOC05Mi43LDcxLTkxLjNjLTE0LjgsMTQuNy0yMy44LDM2LjItMjMuOCw1NwoJCQljMCwzNS44LDI4LjQsNjAuOSw1OS43LDYwLjljMzEuMywwLDU5LjctMjUuMSw1OS43LTYwLjljMC0yMC44LTktNDIuMy0yMy44LTU3YzMxLjItMS40LDcxLDM2LjIsNzEsOTEuMwoJCQlDMzkwLjQsMjcxLjMsMzQyLDMxOC4zLDI4My41LDMxOC4zeiIvPgoJCTxnPgoJCQk8cGF0aCBkPSJNNjI5LjMsMTQ2LjF2MjkuMmMwLDAsNDEuMywwLDQ0LjUsMGMwLDMuMiwwLDEwOS41LDAsMTA5LjVoMzEuNWMwLDAsMC0xMDYuMiwwLTEwOS41YzMuMSwwLDQ0LjUsMCw0NC41LDB2LTI5LjJINjI5LjN6IgoJCQkJLz4KCQkJPHBhdGggZD0iTTExNDcuNiwxNDYuMWgtNzkuM3YyOS40aDc3LjJjMTEuMywwLDE1LjcsNS4yLDE1LjcsMTguNGMwLDAuMSwwLDMuOCwwLDQuOWMtMy4yLDAtNjQsMC02NCwwCgkJCQljLTI0LjMsMC0zNi40LDEyLjItMzYuNCwzOS43djYuNWMwLDI4LjMsMTIuNSwzOS42LDM3LjgsMzkuNmg5My44di05MS4xQzExOTIuNSwxNTguNywxMTgwLjksMTQ2LjEsMTE0Ny42LDE0Ni4xeiBNMTEwMS45LDI1NS4xCgkJCQljLTQuOCwwLTEwLjEtMi40LTEwLjEtMTQuM2MwLTExLjksNS4zLTE0LDEwLjEtMTRjMCwwLDU2LjIsMCw1OS40LDB2MjguM0MxMTU4LjEsMjU1LjEsMTEwMS45LDI1NS4xLDExMDEuOSwyNTUuMXoiLz4KCQkJPHBhdGggZD0iTTE0MDkuMSwxNDYuMWgtNzkuM3YyOS40aDc3LjJjMTEuMywwLDE1LjcsNS4yLDE1LjcsMTguNGMwLDAuMSwwLDMuOCwwLDQuOWMtMy4yLDAtNjQsMC02NCwwCgkJCQljLTI0LjMsMC0zNi40LDEyLjItMzYuNCwzOS43djYuNWMwLDI4LjMsMTIuNSwzOS42LDM3LjgsMzkuNmg5My44di05MS4xQzE0NTMuOSwxNTguNywxNDQyLjQsMTQ2LjEsMTQwOS4xLDE0Ni4xeiBNMTM2My40LDI1NS4xCgkJCQljLTQuOCwwLTEwLjEtMi40LTEwLjEtMTQuM2MwLTExLjksNS4zLTE0LDEwLjEtMTRjMCwwLDU2LjIsMCw1OS40LDB2MjguM0MxNDE5LjYsMjU1LjEsMTM2My40LDI1NS4xLDEzNjMuNCwyNTUuMXoiLz4KCQkJPHBhdGggZD0iTTc1OS43LDE0Ni4xdjI5LjJjMCwwLDQxLjQsMCw0NC41LDBjMCwzLjIsMCwxMDkuNSwwLDEwOS41aDMxLjVjMCwwLDAtMTA2LjIsMC0xMDkuNWMzLjEsMCw0NC41LDAsNDQuNSwwdi0yOS4ySDc1OS43eiIKCQkJCS8+CgkJCTxwYXRoIGQ9Ik0xMTk4LjgsMTQ2LjF2MjkuMmMwLDAsNDEuMywwLDQ0LjUsMGMwLDMuMiwwLDEwOS41LDAsMTA5LjVoMzEuNWMwLDAsMC0xMDYuMiwwLTEwOS41YzMuMSwwLDQ0LjUsMCw0NC41LDB2LTI5LjJIMTE5OC44CgkJCQl6Ii8+CgkJCTxwYXRoIGQ9Ik0xMDQ4LjcsMjM2LjJ2LTQxLjVjMC0zNi4zLTE0LjEtNDguNi00NS45LTQ4LjZoLTg0LjN2MTM4LjZoODUuOEMxMDM4LDI4NC43LDEwNDguNywyNjgsMTA0OC43LDIzNi4yeiBNMTAxNi41LDIzNi44CgkJCQljMCwxMy4zLTQuNSwxOC40LTE1LjgsMTguNGMwLDAtNDcuNiwwLTUwLjcsMHYtNzkuNmMzLjEsMCw1MC43LDAsNTAuNywwYzExLjMsMCwxNS44LDUuMiwxNS44LDE4LjQKCQkJCUMxMDE2LjUsMTk0LjIsMTAxNi41LDIzNi44LDEwMTYuNSwyMzYuOHoiLz4KCQkJPHBhdGggZD0iTTU4NC45LDI1MS43Yy0wLjctMS4zLTQyLjgtODMuMy00Ny45LTkxLjNjLTUuOS05LjMtMTMuMi0xNS44LTI3LTE1LjhjLTEyLjksMC0yOC4xLDUuNy0yOC4xLDM2LjZ2MTAzLjdoMzEuMQoJCQkJYzAsMCwwLTgwLjIsMC04Ni41YzAtNi4yLTAuNC0xNS40LTAuNS0xNy4yYy0wLjEtMS41LDAtMywwLjgtMy40YzAuOS0wLjUsMS44LDAuMywyLjQsMS41YzAuNiwxLjIsMzkuNiw3OC4zLDQ3LjksOTEuMwoJCQkJYzUuOSw5LjMsMTMuMiwxNS44LDI3LDE1LjhjMTIuOCwwLDI4LjEtNS43LDI4LjEtMzYuNlYxNDYuMWgtMzFjMCwwLDAsODAuMiwwLDg2LjVjMCw2LjIsMC40LDE1LjQsMC41LDE3LjNjMC4xLDEuNSwwLDMtMC44LDMuNAoJCQkJQzU4Ni40LDI1My43LDU4NS41LDI1Mi45LDU4NC45LDI1MS43eiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K";

// React logo components
const NttLogoWhite = ({ height = 28 }) => (
  <img src={`data:image/svg+xml;base64,${LOGO_WHITE_B64}`} alt="NTT DATA" style={{ height, width: "auto", display: "block" }} />
);
const NttLogoBlack = ({ height = 28 }) => (
  <img src={`data:image/svg+xml;base64,${LOGO_BLACK_B64}`} alt="NTT DATA" style={{ height, width: "auto", display: "block" }} />
);
// HTML string versions for use inside dangerouslySetInnerHTML / buildReportHTML
const nttLogoWhiteHTML = (h = 28) => `<img src="data:image/svg+xml;base64,${LOGO_WHITE_B64}" alt="NTT DATA" style="height:${h}px;width:auto;display:block;" />`;
const nttLogoBlackHTML = (h = 28) => `<img src="data:image/svg+xml;base64,${LOGO_BLACK_B64}" alt="NTT DATA" style="height:${h}px;width:auto;display:block;" />`;

// ─── CMMI Scale ──────────────────────────────────────────────────────────────
const CMMI = {
  1: { label: "Performed",  color: "#B22000", bg: "#FDECEA", desc: "Ad-hoc & inconsistent" },
  2: { label: "Managed",    color: "#E42600", bg: "#FDE8E4", desc: "Planned & tracked" },
  3: { label: "Defined",    color: "#CC7700", bg: "#FFF5CC", desc: "Standardized org-wide" },
  4: { label: "Measured",   color: "#0072BC", bg: "#DAEEF9", desc: "Quantitatively managed" },
  5: { label: "Optimized",  color: "#068941", bg: "#E0F5EC", desc: "Continuously improving" },
};

// ─── Full Assessment Data ────────────────────────────────────────────────────
const AREAS = {
  "Data Governance": {
    short: "DG", color: "#0072BC", icon: "⚖️",
    topics: [
      {
        name: "Governance Management",
        goals: [
          "A process is established and followed for aligning data governance with business priorities, including ongoing evaluation and refinement to address changes in the business such as the need to encompass new functions and domains.",
          "Data governance ensures that all relevant stakeholders are included, and that roles, responsibilities, and authorities are clearly defined and established.",
          "Compliance and control mechanisms with appropriate policies, processes, and standards are established and followed.",
        ],
        questions: [
          "Does data governance provide mechanisms to facilitate collaboration and decision making across lines of business and IT functions?",
          "Does the data governance structure clearly delineate defined responsibilities and accountability for data domains?",
          "How does the organization define roles and responsibilities and ensure that all relevant stakeholders are involved?",
          "Does data governance provide a mechanism for definition of priorities and resolution of competing priorities?",
          "Does data governance effectively provide a process for defining, escalating, and resolving issues?",
          "How does the executive sponsor(s) of data governance actively support the effort?",
          "How are the executive sponsor(s) informed of data governance efforts?",
          "Has the organization instituted an effective compliance program across the data lifecycle?",
          "Does the organization have a process in place to review the governance structure and activities?",
          "Is there appropriate training in place for staff involved in data governance?",
          "What is the compliance process to carry out the decisions of the data governance body?",
        ],
      },
      {
        name: "Business Glossary",
        goals: [
          "The language that represents the data is unambiguously aligned with the language of the business.",
          "The organization has created a comprehensive, approved business glossary.",
          "The organization follows the standards for naming, definitions, and metadata associated with business terms.",
          "Organization-wide access to the business glossary allows all stakeholders to achieve a common understanding of standard business terms.",
          "Data governance facilitates the review, approval, and consistent usage of business terms.",
          "A compliance and enforcement process ensures consistent application of business terms as new data requirements and projects arise.",
          "The organization has a communication plan and process in place for continuous feedback on the usefulness of the glossary to data users and other stakeholders.",
        ],
        questions: [
          "Is there a policy mandating use of and reference to the business glossary?",
          "How are organization-wide business terms, definitions, and corresponding metadata created, approved, verified, and managed?",
          "Is the business glossary promulgated and made accessible to all stakeholders?",
          "Are business terms referenced as the first step in the design of application data stores and repositories?",
          "Does the organization perform cross-referencing and mapping of business specific terms to standardized business terms?",
          "How is the organization's business glossary enhanced and maintained to reflect changes and additions?",
          "What role does data governance perform in creating, approving, managing, and updating business terms?",
          "Is a compliance process implemented to ensure that business units and projects are correctly applying business terms?",
          "Does the organization employ a defined process for stakeholders to provide feedback about business terms?",
        ],
      },
      {
        name: "Metadata Management",
        goals: [
          "The contents of the metadata repository span all relevant categories and classifications of data assets under management, and accurately reflect the implemented data layer of the organization.",
          "Internal and selected external standards of importance to the organization are incorporated into metadata and aligned with organizational processes and standards.",
        ],
        questions: [
          "Is the metadata strategy defined and aligned with internal and selected external standards?",
          "How is the scope of metadata to be addressed for inclusion within the metadata repository defined?",
          "Are all relevant stakeholders involved in defining metadata categories and properties?",
          "What is the method for developing and evaluating standards and processes for metadata management?",
          "What is the method for maintaining or updating the metadata repository?",
          "Are metadata management processes defined and followed?",
          "Are roles and responsibilities clearly defined for the capture, updating, and use of metadata?",
        ],
      },
    ],
  },
  "Data Quality": {
    short: "DQ", color: "#009AA4", icon: "✅",
    topics: [
      {
        name: "Data Quality Strategy",
        goals: [
          "A data quality strategy, collaboratively developed with lines of business, is aligned with business goals.",
          "Data quality priorities and goals are translated into actionable criteria, and are aligned with organizational objectives.",
          "An organization-wide data quality program is defined, and corresponding roles and responsibilities are established to meet program needs.",
          "Data quality processes are integrated and aligned with the data quality strategy.",
        ],
        questions: [
          "Is data quality emphasized in all initiatives involving the data stores?",
          "How does the organization measure data quality program process?",
          "What organizational unit is responsible for maintaining the data quality strategy?",
          "What organizational units are tasked with data quality initiatives? How are the decisions made about standards, methods, and techniques?",
          "Are roles, responsibilities, and accountability clearly defined to foster improved quality of data assets?",
          "Is the data quality strategy widely distributed, communicated, and promulgated?",
          "Does the data quality strategy clearly describe objectives, policies, and processes?",
          "Is data quality integrated with the systems development lifecycle?",
          "How is data quality improvement integrated with business process improvement efforts?",
        ],
      },
      {
        name: "Data Profiling",
        goals: [
          "A standard set of methods, tools, and processes for data profiling is established and followed.",
          "Produce recommendations for improving data quality improvements to data assets.",
          "Physical data representation is factual, understandable, and enhances business understanding of the set of data under management.",
        ],
        questions: [
          "Does the organization have a standard method for profiling data?",
          "Has the organization trained or acquired staff resources with expertise in data profiling tools and techniques?",
          "Does the organization apply statistical models to analyze data profiling reports?",
          "Do policies and processes specify the criteria for a data store to undergo profiling?",
          "Is data profiling scheduled based on defined events, considerations, or triggers?",
        ],
      },
      {
        name: "Data Quality Assessment",
        goals: [
          "Establish and sustain a business-driven function to evaluate and improve the quality of data assets.",
          "Standardize data quality assessment objectives, targets, and thresholds according to industry accepted techniques and processes.",
          "Adopt standard data quality dimensions across domains for development of thresholds, targets, and metrics.",
          "Establish an empirical method for statistical evaluation of data quality.",
          "Establish standard data quality assessment reporting, utilizing scorecards, dashboards, and other analytical reports.",
          "Utilize the results and conclusions of data quality assessments to develop and enhance data quality improvement plans.",
        ],
        questions: [
          "Are standard data quality assessment techniques and methods documented and followed?",
          "How are data quality assessments conducted, and are they scheduled or event-driven?",
          "Are standard data quality rules developed for core data attributes?",
          "Are data quality rules engines or assessment tools employed?",
          "Are the business, technical, and cost impacts of data quality issues analyzed and used as input to data quality improvement priorities?",
        ],
      },
      {
        name: "Data Cleansing",
        goals: [
          "A reusable, standardized set of data cleansing processes is established to resolve data quality issues at the source.",
          "Root cause analysis is systematically applied to cleansing activities to prevent recurring data quality issues.",
          "ROI and risk considerations are incorporated into decisions about data cleansing investments.",
        ],
        questions: [
          "Does the organization have a reusable set of data cleansing processes (automated and manual) to resolve data quality issues?",
          "Is there a defined process for verifying corrections and assessing effectiveness?",
          "How does the organization cleanse duplicate records?",
          "Are corrections implemented at the source of capture?",
          "Are data cleansing processes followed through to analysis of root causes?",
          "Have lines of business established quality thresholds and tolerance limits?",
          "Has the organization deployed a consistent toolset to support data cleansing?",
          "Does ROI incorporate data cleansing costs?",
          "Does the organization apply considerations of operational and reputational risk to determine what data cleansing activities to fund?",
          "How does the organization define, institutionalize, and monitor the data cleansing process?",
        ],
      },
    ],
  },
  "Data Mgmt Strategy": {
    short: "DMS", color: "#005B96", icon: "🎯",
    topics: [
      {
        name: "Data Management Strategy",
        goals: [
          "Establish, maintain, and follow a data management strategy that is aligned with organizational strategy, approved by all relevant stakeholders, communicated across the organization, and reflected in architecture, technology, and business planning.",
          "Maintain the data management strategy for all business areas, through data governance.",
          "Stakeholders set data management program priorities and objectives based on the business value of data and a shared vision for data management.",
          "Develop, monitor, and measure an effective sequence plan for guiding the data management program implementation.",
        ],
        questions: [
          "Do executive stakeholders visibly and actively support the data management strategy?",
          "Is the sequence plan aligned with business priorities and milestones?",
          "Is there sufficient understanding and agreement among executives and operational, IT and business stakeholders to support a long-term sustainable data management program?",
          "How are projects aligned with the sequence plan that guides implementation of the data management program?",
          "Are staff capabilities and resources in place to architect, design, and lead the data management program?",
          "Is there a commitment to provide training to enable maturity of the data management program?",
        ],
      },
      {
        name: "Communications",
        goals: [
          "The data management communications strategy ensures that the right messages about the program are understood by the right people, at the right time.",
          "Industry or regulatory guidance that impacts data management is promulgated internally in a timely manner.",
          "Stakeholders participate in the development of data management communications.",
        ],
        questions: [
          "How are policies, standards, and processes for data management promulgated?",
          "How does the organization keep stakeholders informed about data management plans and projects?",
          "How is bidirectional communication accomplished among business, IT, data management, and executive management about data management priorities, approaches, and deliverables?",
        ],
      },
      {
        name: "Data Management Function",
        goals: [
          "Establish and follow role definitions, responsibilities, authorities, and accountability to provide consistency in decisions and interactions related to data management.",
          "Institutionalize the process for executive oversight of data management, to ensure the adoption of consistent policies, processes, and standards.",
          "The data management function is aligned with data governance on data management priorities and decisions.",
          "Develop, evaluate, and reward data management staff based on organization-wide criteria.",
        ],
        questions: [
          "Is the data management function defined such that it is clear to all relevant stakeholders?",
          "Is the data management function aligned to the data management strategy, as demonstrated by measures and metrics?",
          "What role do executives play in the design and oversight of the data management function?",
        ],
      },
      {
        name: "Business Case",
        goals: [
          "Business cases justify and help to ensure sustainable financing for data management initiatives.",
          "Business cases for data management are comparable to approved business cases for other organization-wide investments.",
          "Priorities and criteria for both discretionary and nondiscretionary investment are established and followed.",
          "Sustainable program funding methods for making cost and benefit allocations, managing expenditures, and establishing priorities are defined and followed.",
        ],
        questions: [
          "How does the organization determine the level of investment required for the data management program?",
          "How does the organization decide whether to develop one umbrella business case or multiple, linked business cases?",
          "What are the success criteria for the business case?",
          "Who needs to be involved? Who needs to approve?",
          "Does the business case reflect the objectives and priorities of the data management strategy?",
          "Does the business case reflect the data management sequence plan?",
          "Has the Data Management Strategy sequence plan been reviewed and approved by data management sponsors?",
          "Does the business case methodology satisfy Program Funding criteria?",
        ],
      },
      {
        name: "Program Funding",
        goals: [
          "Program funding reflects business objectives and organizational priorities.",
        ],
        questions: [
          "Is there an approved set of investment criteria and priorities for data management?",
          "How does data governance provide oversight for data management funding?",
          "Was the program funding approach developed, evaluated, and approved by relevant stakeholders?",
          "Does the funding model reflect the organization's business models, priorities, and financial decision processes?",
          "Are there defined and approved cost-benefit allocation methods, defined expense management practices, and business cases across the organization?",
        ],
      },
    ],
  },
  "Data Operations": {
    short: "DO", color: "#068941", icon: "⚙️",
    topics: [
      {
        name: "Data Requirements Definition",
        goals: [
          "Data requirements definitions consistently satisfy business objectives.",
          "All relevant stakeholders have a common understanding of data requirements.",
          "Approved standards are followed for data names, definitions, and representations in requirements definitions as appropriate.",
        ],
        questions: [
          "How are business and technical data requirements solicited, captured, evaluated, adjudicated, and verified with stakeholders?",
          "How are the data requirements mapped to the business objectives?",
          "How are approved data requirements validated against standard data definitions as well as logical and physical representations?",
        ],
      },
      {
        name: "Data Lifecycle Management",
        goals: [
          "The data lifecycle pertaining to selected business processes is defined and maintained to reflect changes.",
          "Business processes are mapped to data flows based on a framework for identifying and prioritizing shared data flows; this mapping extends through the data lifecycle at the attribute level.",
          "Mapping of data impacts, dependencies, and interdependencies are defined and maintained.",
        ],
        questions: [
          "What activities, milestones, and products are defined for mapping business processes to the data created and maintained in support of these processes?",
          "Has the organization established clear roles and responsibilities for creating and maintaining a mapping of business processes to data?",
          "Are standard process modeling methods and tools employed to model and define business processes?",
          "Does governance have a role in the management and orchestration of business process data needs, mapping and prioritization?",
        ],
      },
      {
        name: "Provider Management",
        goals: [
          "Data requirements for sourcing, procurement, and provider management, including data quality criteria, are assessed according to a documented process.",
          "Selecting, contracting, monitoring, and managing data providers is performed according to a standard data source selection and control process.",
          "Potential sources and providers, including their services, data scope, processes, and technologies are identified, documented, and understood.",
          "Standard service level agreements address all business requirements and are employed to manage data providers.",
        ],
        questions: [
          "How are data sourcing requirements captured, validated and prioritized?",
          "Are requirements for data sourcing specific, unambiguous, driven by business requirements, and feasibly procurable?",
          "Is there a mechanism that ensures business approval of sourcing requirements?",
          "How are the data attributes mapped to data sources and downstream applications?",
          "How is the data source selection process managed?",
          "How are the service and content quality from data providers monitored?",
          "Do providers comply with applicable standards?",
          "Is there a repeatable process for managing issues that includes responsible points of contact?",
        ],
      },
    ],
  },
  "Platform & Architecture": {
    short: "PA", color: "#FF7A00", icon: "🏗️",
    topics: [
      {
        name: "Architectural Approach",
        goals: [
          "The approved architectural approach is consistent with business needs and architectural standards.",
          "The transition plan from the 'As-is' to the 'To-Be' state is consistently monitored to ensure that projects are aligned with long-term objectives.",
          "The architectural approach is approved and adopted by all relevant stakeholders.",
          "Platform and technical capability decisions are aligned with the architectural approach and approved by stakeholders.",
          "Metrics and measures are used by business and IT stakeholders, approved by the senior governance body, and monitored by the appropriate data governance group.",
        ],
        questions: [
          "How does the organization approach architecting information assets?",
          "Is the architectural approach consistently followed, and are project-level decisions aligned with the approach?",
          "What is the rationalization method employed for synchronizing, consolidating, or eliminating duplicate data?",
          "How does the organization ensure the sustained progress of the transition plan to the target-state in response to deadlines, tight schedules, and other pressures?",
          "Does the organization have an approved data technology stack, and corresponding governance applied to modifications, additions, and sunsetting?",
          "Has the organization documented and approved the technical capabilities and requirements to satisfy operational business continuity?",
        ],
      },
      {
        name: "Architectural Standards",
        goals: [
          "Develop a comprehensive set of data standards aligned with the architectural approach and the data management strategy.",
          "Institute a sustainable standards development and maintenance process involving business and IT stakeholders.",
          "Establish effective governance and auditing processes for standards adherence and exceptions.",
          "Define and enforce a data distribution standard for requests and approvals.",
          "Define and enforce approved data access methods across platforms.",
        ],
        questions: [
          "What are the categories of standards required for the organization's target data architecture, and how are they scoped and defined?",
          "How does the organization determine business need and technology strategy for developing approved, standard data access and provisioning?",
          "How are data models approved, maintained, and governed?",
          "How has the organization defined architecturally aligned, standard data access methods and criteria for determining which methods to apply?",
          "How does the organization promulgate, audit, and enforce standards?",
        ],
      },
      {
        name: "Data Management Platform",
        goals: [
          "The platforms satisfy the approved requirements and architecture.",
          "Processes exist and are followed for effective platform management to meet business needs.",
          "The platform is supported by adequately trained and skilled personnel.",
          "The platform provides trusted data.",
          "Establish and follow a consistent process to ensure ongoing business and technology alignment for data integration.",
        ],
        questions: [
          "How are the authoritative data sources defined, selected, and integrated into particular portions of the platform?",
          "How does the organization address overlapping platforms and data duplication?",
          "Does the organization have a process for making 'build versus buy' decisions?",
          "How does the organization address platform scalability, security, and resiliency in accordance with anticipated growth of data, users, and overall complexity?",
          "What forms of data, data exchange, and interfaces are supported by the platform?",
        ],
      },
      {
        name: "Data Integration",
        goals: [
          "Establish and follow a consistent process to ensure ongoing business and technology alignment for data integration.",
          "Data integration is performed utilizing standard processes and tool sets that enable compliance with data architecture standards and data quality requirements.",
          "Proactively research and evaluate integration technologies for application and adoption.",
          "Establish and manage data conversion, transformation, and enrichment disciplines so that the data is fully processed and meets quality standards before entering the integration environment.",
        ],
        questions: [
          "How are data consolidation needs assessed?",
          "How is future redundancy minimized?",
          "How does the organization consolidate data effectively where redundancy exists?",
          "Do data integration standards exist, and are they reviewed, monitored, approved, and enforced?",
          "Describe the compliance processes employed to enforce integration standards.",
          "How are data quality thresholds and targets applied to sources of data at ingestion and integration?",
          "Are the processes to identify missing data automated, and does tracking against defects or gaps support remediation?",
          "How is adequate staffing ensured for monitoring, managing, and sustaining data quality for ingestion and integration?",
        ],
      },
      {
        name: "Historical Data & Retention",
        goals: [
          "An approved process for determining when and how data should be archived is followed, containing defined activity steps.",
          "Data retention periods are consistent with both legal and regulatory requirements.",
          "Data archives reflect organizational and regulatory requirements.",
          "Historical data is managed consistently, leveraging common standards.",
          "Business needs for capturing and storing historical data are met.",
        ],
        questions: [
          "What are the architectural standards and conventions applied to the structure and management of historical data?",
          "How is data retention for the required length of time assured?",
          "How is the integrity of archived data maintained?",
          "Is there a consistent approach for the retrieval and integration of archived historical data with current data?",
          "How is an audit trail for data changes monitored and managed?",
          "What considerations are applied to determine when archived data can be deleted?",
        ],
      },
    ],
  },
  "Supporting Processes": {
    short: "SP", color: "#00CB5D", icon: "🔧",
    topics: [
      {
        name: "Measurement & Analysis",
        goals: [
          "A set of metrics that measures the satisfaction of the data management program's objectives is established and used.",
          "The process of measuring data management capabilities and improvements based on defined metrics is established and used.",
          "Stakeholders are kept well informed about the status of the data management program and its component processes based on measurements and analysis.",
          "Organization-wide access to data management measurements and analysis results is provided.",
        ],
        questions: [
          "What measures and analyses exist to determine if data management goals and objectives are being met?",
          "How does the organization define, measure, analyze, and report on data management?",
          "How are the measurements and analyses integrated into data management processes?",
        ],
      },
      {
        name: "Process Management",
        goals: [
          "The organization operates according to its set of standard processes.",
          "The organization follows defined methods for maintaining their processes to accommodate changes in business requirements, standards, and methodology.",
          "Process measures, process assets, and examples are maintained in a repository.",
        ],
        questions: [
          "How are processes, methods, procedures, policies, and standards maintained?",
          "How is process performance measured?",
          "How does the organization measure process compliance?",
          "How does the organization ensure that improvements are identified, pursued, and implemented?",
          "How does the organization validate that proposed improvements enhance performance before they are deployed?",
        ],
      },
      {
        name: "Process Quality Assurance",
        goals: [
          "Management has visibility into the quality of the process and products.",
          "Noncompliance issues are addressed at the appropriate level.",
          "Process and product quality have become an embedded discipline at all levels in the organization.",
        ],
        questions: [
          "Are process noncompliance issues raised to an appropriate level?",
          "Are quality issues analyzed for positive trending?",
          "Do all relevant stakeholders have visibility into the quality of the process and products?",
        ],
      },
      {
        name: "Risk Management",
        goals: [
          "The organization is operating with an understanding of its current level of risk.",
          "The organization is pursuing risk mitigation plans to limit the potential damage from identified risks.",
          "Risks are continually identified, analyzed, and monitored.",
        ],
        questions: [
          "Does the organization know the amount of risk it is operating under?",
          "Has the organization identified and implemented risk mitigation and contingency plans?",
          "Does the organization periodically monitor risks and take appropriate update actions?",
        ],
      },
      {
        name: "Configuration Management",
        goals: [
          "Maintain the integrity of defined data and other data management assets as changes occur.",
          "Define and implement a configuration management system.",
        ],
        questions: [
          "How is configuration management implemented and measured?",
          "How are data changes planned and controlled across the data lifecycle?",
        ],
      },
    ],
  },
};

// ─── Sample Demo Data ─────────────────────────────────────────────────────────
const SAMPLE_DATA = {
  // ── DATA GOVERNANCE ──────────────────────────────────────────────────────────
  // Topic 0: Governance Management — Goal 0 intentionally blank for live demo
  "Data Governance__0__goal__1": { score: 2.7, comment: "We have a Data Governance Council that meets monthly, with representatives from Finance, Risk, Operations, and IT. Roles such as Data Owner, Data Steward, and Data Custodian are formally defined in our RACI matrix. However, some business units are still onboarding to the model and accountability enforcement is inconsistent outside of core domains.", rationale: "The organization has established formal governance roles and a cross-functional council with documented RACI assignments, indicating standardized practices at the organizational level. However, inconsistent participation and onboarding gaps in peripheral business units suggest the model is defined but not yet uniformly enforced, which is characteristic of Level 3 — Defined rather than the full adoption required for Level 4." },
  "Data Governance__0__goal__2": { score: 2.8, comment: "Data governance policies are published in our internal knowledge base and aligned to regulatory requirements (SOX, GDPR). Stewards are required to complete annual compliance sign-offs. We conduct quarterly reviews to assess adherence, though remediation of policy violations tends to be reactive rather than proactive.", rationale: "Formal compliance mechanisms including documented policies, regulatory alignment, and periodic reviews are present, reflecting a Defined maturity. The reactive nature of violation remediation and absence of continuous monitoring controls prevents advancement to Level 4, where quantitative measurement of compliance effectiveness would be expected." },
  "Data Governance__0__q__0": { comment: "Cross-functional collaboration is facilitated through our Data Governance Council and domain working groups. Decision escalation paths are documented, though informal channels often bypass formal processes in practice." },
  "Data Governance__0__q__1": { comment: "Data domain ownership is assigned in our governance charter. Each domain has a named Data Owner at the VP level and designated stewards at the operational level." },

  // Topic 1: Business Glossary
  "Data Governance__1__goal__0": { score: 2.3, comment: "We have a business glossary in Collibra covering roughly 400 terms across our core financial and risk domains. Definitions were developed collaboratively with business SMEs. However, there are known inconsistencies between the glossary and how terms are used in legacy reporting systems and upstream source databases.", rationale: "A business glossary exists with SME-developed definitions, but documented inconsistencies with operational systems indicate the language alignment is not yet fully realized across the data landscape. This reflects Level 2 — Managed, where basic glossary management is in place but standardization and cross-system enforcement are still maturing." },
  "Data Governance__1__goal__1": { score: 2.2, comment: "The glossary covers approximately 60% of our enterprise data assets. Coverage is strong in Finance and Risk, but Marketing, HR, and Operations domains are underrepresented. We have a roadmap to expand coverage but no committed timeline.", rationale: "Partial glossary coverage with strong depth in priority domains but significant gaps in others indicates managed but incomplete implementation. A defined expansion roadmap without committed timelines signals Level 2 — Managed maturity, where planning exists but organizational-wide comprehensiveness has not been achieved." },
  "Data Governance__1__goal__2": { score: 2.4, comment: "Naming conventions and metadata standards are documented and applied to new glossary entries. Legacy terms were added without consistent metadata tagging, creating gaps in search and discoverability.", rationale: "Standards exist and are applied prospectively to new entries, but retroactive application to legacy content is incomplete. This inconsistency across the full glossary inventory is consistent with Level 2 — Managed, where standards are established but enforcement and remediation are not yet comprehensive." },
  "Data Governance__1__goal__3": { score: 2.1, comment: "The glossary is accessible to all employees via our intranet. Awareness is growing but adoption is uneven — power users in Finance actively reference it, while other departments are largely unaware of its existence.", rationale: "Technical accessibility is in place, but limited awareness and uneven adoption across the organization indicate that democratized usage is a work in progress. Universal stakeholder access and active utilization are hallmarks of Level 3 — Defined, which has not yet been achieved." },
  "Data Governance__1__goal__4": { score: 1.3, comment: "Governance review of new or updated business terms is informal. Terms are sometimes submitted via email to the governance team, reviewed ad hoc, and approved without a formal workflow. There is no SLA for term approval.", rationale: "The absence of a structured review and approval workflow, reliance on informal email-based submissions, and lack of SLAs for governance responses are consistent with Level 1 — Performed. While intent to govern terminology exists, the process is reactive and undocumented at a procedural level." },
  "Data Governance__1__goal__5": { score: 1.1, comment: "There is no formal compliance process for ensuring business terms are applied in new projects or application designs. Data architects occasionally reference the glossary but it is not mandated in project intake or design review checkpoints.", rationale: "Without a mandated compliance gate in project or application development workflows, consistent application of business terms is left to individual discretion. This reflects Level 1 — Performed, where good intentions exist but no repeatable enforcement mechanism has been established." },
  "Data Governance__1__goal__6": { score: 1.2, comment: "We do not have a formal feedback mechanism for glossary users. Feedback is occasionally received informally via the governance team's inbox but there is no structured channel or process to collect, triage, or act on stakeholder input.", rationale: "The lack of a structured feedback loop for glossary improvement reflects Level 1 — Performed. Continuous improvement of data definitions requires a documented stakeholder feedback process, which is currently absent beyond informal channels." },

  // Topic 2: Metadata Management
  "Data Governance__2__goal__0": { score: 2.2, comment: "Our metadata repository in Collibra currently covers data assets in our core data warehouse and three critical source systems. Technical metadata (schemas, lineage) is auto-harvested. Business metadata coverage is manually maintained and limited to high-priority domains. Coverage of operational databases, APIs, and unstructured data is minimal.", rationale: "The existence of a metadata repository with automated technical metadata harvesting demonstrates managed practices. However, limited business metadata coverage and significant gaps in peripheral systems and data types indicate the repository does not yet comprehensively represent the full organizational data landscape, placing this at Level 2 — Managed." },
  "Data Governance__2__goal__1": { score: 2.1, comment: "We reference DAMA-DMBOK and internal data architecture standards when defining metadata properties. ISO 11179 is aspirationally aligned but not formally adopted. Alignment between metadata standards and day-to-day data management processes is inconsistent.", rationale: "Partial adoption of external standards and aspirational alignment without formal adoption or enforcement reflects a developing but immature standards integration approach. The gap between aspirational and operational alignment is characteristic of Level 2 — Managed rather than the fully institutionalized standards adoption expected at Level 3." },

  // ── DATA QUALITY ─────────────────────────────────────────────────────────────
  // Topic 0: DQ Strategy
  "Data Quality__0__goal__0": { score: 3.0, comment: "Our Data Quality strategy was formally approved by the CDO in 2023 and is embedded in our Enterprise Data Strategy. It outlines DQ principles, target state, and a 3-year roadmap. The strategy is reviewed annually and updated to reflect shifts in business priorities such as our ongoing cloud migration.", rationale: "A formally approved, CDO-sponsored DQ strategy with an active roadmap and annual review cycle reflects strong Level 3 — Defined practices. The strategy is documented, organizationally endorsed, and actively maintained. Advancement to Level 4 would require quantitative measurement of strategy effectiveness and performance against defined targets." },
  "Data Quality__0__goal__1": { score: 2.9, comment: "DQ requirements are captured during project intake as part of our data requirements template. Business owners sign off on acceptability thresholds for critical data elements. Requirements are logged in Jira and traced through to testing.", rationale: "Systematic capture of DQ requirements in project intake, with business sign-off and traceability, indicates a defined and repeatable process. The structured template and tooling demonstrate Level 3 — Defined. To reach Level 4, quantitative thresholds would need to be tracked and managed against measured outcomes over time." },
  "Data Quality__0__goal__2": { score: 2.3, comment: "We have assigned Data Quality Stewards for Finance and Risk domains. A DQ working group meets biweekly. However, the function lacks dedicated resources and relies heavily on part-time contributors from business units. There is no formal DQ team at the enterprise level.", rationale: "The existence of stewardship roles and a working group demonstrates managed DQ governance. The reliance on part-time resources without a dedicated enterprise DQ function limits organizational capacity and consistency, which is characteristic of Level 2 — Managed rather than the resource-adequate, formally structured function expected at Level 3." },
  "Data Quality__0__goal__3": { score: 2.0, comment: "Communication about DQ issues is primarily reactive — we issue incident reports when data quality problems impact downstream reports or regulatory filings. There is no proactive DQ communication plan or regular stakeholder reporting cadence for DQ performance.", rationale: "Reactive incident-based communication without a structured stakeholder reporting cadence reflects Level 2 — Managed, where communication occurs but is not systematically planned or proactive. A defined DQ communications plan with regular performance reporting would be required to advance to Level 3." },

  // Topic 1: Data Profiling
  "Data Quality__1__goal__0": { score: 3.1, comment: "Data profiling is executed as a standard step in our data onboarding process using Informatica DQ. Profiling results are documented and reviewed by Data Stewards before new datasets are onboarded to the data warehouse. Ad hoc profiling is also performed when data quality incidents are reported.", rationale: "Profiling is institutionalized in the onboarding workflow with tool support and steward review, reflecting Level 3 — Defined. The combination of systematic and reactive profiling demonstrates organizational discipline. Advancement to Level 4 would require profiling results to feed into quantitative quality benchmarks and trend analysis." },
  "Data Quality__1__goal__1": { score: 2.2, comment: "Profiling results are stored in Informatica and summarized in a profiling report template. Reports are reviewed by the data steward and project team but are not systematically shared with business data owners or incorporated into a centralized quality dashboard.", rationale: "Profiling outputs are documented and reviewed within the immediate project team but lack enterprise-level visibility and integration with broader quality monitoring. Limited distribution and absence of dashboard integration indicate Level 2 — Managed practices." },
  "Data Quality__1__goal__2": { score: 2.4, comment: "We have documented data profiling standards that cover completeness, uniqueness, and format checks. Standards are applied to structured relational data. Semi-structured and unstructured data sources are not yet covered by profiling standards.", rationale: "Documented profiling standards applied to structured data sources reflect managed practices. The exclusion of semi-structured and unstructured data from coverage creates gaps that prevent full Level 3 alignment, which would require comprehensive standards applicable across all relevant data types." },

  // Topic 2: DQ Assessment
  "Data Quality__2__goal__0": { score: 3.2, comment: "We conduct formal data quality assessments for critical data elements tied to regulatory reporting (BCBS 239, CCAR). Assessments use a defined scoring rubric across six dimensions: completeness, accuracy, consistency, timeliness, validity, and uniqueness. Results are reported to the Chief Data Officer quarterly.", rationale: "Formal, multi-dimensional assessments of critical regulatory data elements with executive reporting demonstrate Level 3 — Defined practices. The scoring rubric, dimensional framework, and quarterly CDO reporting indicate institutionalized assessment processes. Level 4 would require quantitative thresholds and statistical process control across a broader data scope." },
  "Data Quality__2__goal__1": { score: 2.3, comment: "DQ assessment results are documented in a shared repository accessible to stewards and the data governance team. Business stakeholders receive findings through governance committee presentations but do not have self-service access to assessment history or trend data.", rationale: "Documentation and governance-channel communication of assessment findings reflects managed practices. The absence of self-service access and trend analytics for business stakeholders limits transparency and proactive quality management, indicating Level 2 — Managed." },
  "Data Quality__2__goal__2": { score: 2.3, comment: "We track data quality issues in Jira with severity classifications and assigned owners. Remediation progress is reviewed in biweekly steward meetings. However, root cause analysis is not consistently performed for recurring issues and there is no formal issue escalation SLA.", rationale: "Structured issue tracking with severity classification and ownership exists, reflecting managed remediation practices. The absence of consistent root cause analysis and formal escalation SLAs indicates that the process is not yet fully defined, positioning the organization at Level 2 — Managed." },

  // Topic 3: Data Cleansing
  "Data Quality__3__goal__0": { score: 2.1, comment: "Data cleansing is performed on an ad hoc basis, typically triggered by data quality incidents or project needs. We have documented cleansing procedures for customer master data and product data, but no enterprise-wide cleansing strategy or scheduled cleansing cadence.", rationale: "Documented cleansing procedures for specific domains alongside ad hoc execution reflect managed but not systematically defined practices. Without an enterprise strategy, scheduled cadence, or broad domain coverage, the organization is at Level 2 — Managed for data cleansing." },
  "Data Quality__3__goal__1": { score: 1.4, comment: "Cleansed data is validated manually by the requesting team before being promoted to production. There is no standardized validation methodology, automated validation controls, or formal sign-off process. Validation quality depends heavily on individual team knowledge.", rationale: "Manual, team-dependent validation without standardized methodology or automated controls reflects Level 1 — Performed. The ad hoc nature of cleansing validation introduces significant risk of inconsistent outcomes and makes it difficult to demonstrate repeatable quality assurance practices." },
  "Data Quality__3__goal__2": { score: 2.2, comment: "We use Informatica Data Quality for cleansing workflows in our Finance and customer domains. Other domains rely on manual SQL scripts maintained by individual developers. There is no enterprise standard for cleansing tooling across the organization.", rationale: "Partial tooling adoption with a significant reliance on individually maintained scripts indicates fragmented implementation. While a capable tool is in use for priority domains, the lack of enterprise standardization is characteristic of Level 2 — Managed." },

  // ── DATA MANAGEMENT STRATEGY ─────────────────────────────────────────────────
  // Topic 0: DM Strategy
  "Data Management Strategy__0__goal__0": { score: 3.1, comment: "Our Enterprise Data Strategy was published in 2022 and is reviewed annually by the CDO's office. It covers data governance, quality, architecture, and literacy as strategic pillars. The strategy is aligned to business objectives and presented to the Executive Leadership Team annually.", rationale: "A formally published, annually reviewed Enterprise Data Strategy aligned to business objectives and with executive-level visibility reflects Level 3 — Defined. The strategy is institutionalized with CDO ownership. Advancement to Level 4 would require quantitative measurement of strategy realization and defined performance indicators." },
  "Data Management Strategy__0__goal__1": { score: 2.0, comment: "Business cases for data management investments are developed on a project basis but there is no standardized business case template or ROI measurement framework. Value realization from past investments is tracked informally through anecdotal evidence rather than quantified outcomes.", rationale: "Project-level business case development without standardization or outcome measurement reflects Level 2 — Managed. The absence of a DM investment value framework prevents the organization from demonstrating quantitative returns, which would be needed to achieve Level 3 alignment." },
  "Data Management Strategy__0__goal__2": { score: 2.9, comment: "Data management principles are documented in our governance charter and referenced in architecture review board decisions. Principles are communicated during onboarding and in data governance training. Adherence is periodically reviewed by the governance team.", rationale: "Documented principles embedded in governance processes, communicated through training, and periodically reviewed indicate Level 3 — Defined maturity. The integration of principles into architectural decision-making is a strong indicator of organizational adoption." },

  // Topic 1: Communications
  "Data Management Strategy__1__goal__0": { score: 2.0, comment: "Data governance updates are communicated through quarterly newsletters, intranet posts, and governance council meeting minutes. There is no formal communications plan for data management, and messaging is inconsistent across channels and audiences.", rationale: "Multiple communication channels exist but operate without a coordinated plan, consistent messaging framework, or audience segmentation strategy. This reflects Level 2 — Managed, where communications happen reactively rather than as part of a planned, stakeholder-targeted approach." },
  "Data Management Strategy__1__goal__1": { score: 2.1, comment: "Leadership engagement with data management is largely driven by regulatory requirements. The CFO and CRO are actively engaged due to BCBS 239 obligations. Broader executive engagement beyond regulatory-driven participation is limited and not systematically cultivated.", rationale: "Regulatory-driven executive engagement without a broader stakeholder engagement strategy reflects managed but externally motivated leadership involvement. Systematic cultivation of data management sponsorship across the full leadership team would be required for Level 3." },

  // Topic 2: DM Function
  "Data Management Strategy__2__goal__0": { score: 3.3, comment: "The CDO organization was established in 2021 with dedicated functions for Data Governance, Data Architecture, Data Quality, and BI/Analytics. The CDO reports directly to the CEO. Roles and responsibilities are documented and regularly communicated to the business.", rationale: "A formally established CDO organization with documented functions, direct CEO reporting, and communicated role clarity reflects Level 3 — Defined maturity. The structural foundation for enterprise data management is in place and organizationally visible." },
  "Data Management Strategy__2__goal__1": { score: 2.2, comment: "Data management processes are documented for core activities (governance, quality assessment, architecture review). Documentation is stored in Confluence. However, process adherence monitoring is informal and documentation currency is not consistently maintained — some processes reflect outdated workflows.", rationale: "Process documentation exists and is centrally stored, but irregular maintenance and informal adherence monitoring indicate Level 2 — Managed. Consistent process currency and structured adherence monitoring would be required to advance to Level 3." },
  "Data Management Strategy__2__goal__2": { score: 2.0, comment: "Data management staff participate in external conferences and vendor briefings, but there is no formal training curriculum or competency framework for the data management function. Professional development is largely self-directed.", rationale: "Informal professional development without a structured curriculum or competency framework reflects Level 2 — Managed. A defined training program aligned to role-based competency requirements would be characteristic of Level 3 — Defined." },

  // Topic 3: Business Case
  "Data Management Strategy__3__goal__0": { score: 2.0, comment: "We have developed informal benefit articulations for major data initiatives, primarily framed around regulatory compliance and cost avoidance. We have not developed a formal ROI methodology or systematically tracked realized benefits from data management investments.", rationale: "Informal benefit articulation without a structured ROI methodology or benefits realization tracking reflects Level 2 — Managed. A defined business case framework with quantified, tracked outcomes would be required for Level 3 advancement." },
  "Data Management Strategy__3__goal__1": { score: 1.2, comment: "We do not systematically measure or report on the financial impact of poor data quality. Anecdotal estimates are occasionally cited in governance discussions but no formal cost-of-poor-data-quality (CPDQ) analysis has been conducted.", rationale: "The absence of structured CPDQ measurement reflects Level 1 — Performed. Without quantified cost impact data, the organization cannot make data-driven investment decisions for data quality improvement, which is a fundamental requirement for more mature levels." },

  // Topic 4: Program Funding
  "Data Management Strategy__4__goal__0": { score: 2.2, comment: "Data management activities are funded through a mix of project-based budgets and the CDO office's operational budget. There is no dedicated enterprise data management program fund. Funding for cross-domain initiatives is negotiated annually and is subject to competing priorities.", rationale: "A mix of project-based and operational funding without a dedicated program fund reflects Level 2 — Managed. Sustainable, dedicated data management program funding independent of annual budget cycles would be characteristic of Level 3 — Defined." },
  "Data Management Strategy__4__goal__1": { score: 1.1, comment: "There is no formal TCO model for our data management platform or operations. Costs are tracked at a high level within the CDO budget but not broken down by capability area, function, or cost driver. We lack visibility into the true operational cost of our data environment.", rationale: "Absence of a TCO model with cost visibility at the capability level reflects Level 1 — Performed. Quantitative understanding of data management costs is foundational for investment optimization and would be required to advance to Level 2 — Managed." },

  // ── DATA OPERATIONS ───────────────────────────────────────────────────────────
  // Topic 0: Data Requirements Definition
  "Data Operations__0__goal__0": { score: 3.2, comment: "Data requirements are captured using a standardized template as part of our SDLC. The template covers source systems, transformation rules, business definitions, quality expectations, and retention requirements. Requirements are reviewed by the data architecture team and approved before development begins.", rationale: "Standardized data requirements capture integrated into the SDLC with architecture review and approval reflects Level 3 — Defined. The consistent process, template usage, and governance checkpoint demonstrate institutionalized practice." },
  "Data Operations__0__goal__1": { score: 3.0, comment: "Data requirements are traceable from business needs through technical specifications to implemented solutions using our Jira/Confluence toolchain. Traceability is reviewed during project closure. Gaps in traceability for legacy systems remain but are being addressed in a remediation program.", rationale: "Systematic requirements traceability using an established toolchain with project-closure review reflects Level 3 — Defined. Active remediation of legacy gaps demonstrates continuous improvement intent, though full traceability across all systems has not yet been achieved." },
  "Data Operations__0__goal__2": { score: 2.2, comment: "Data requirements from regulatory programs are incorporated into our data management planning, but the integration is primarily driven by compliance deadlines rather than a systematic business-requirements-to-data-needs translation process.", rationale: "Regulatory requirements are addressed but driven reactively by compliance timelines rather than through a proactive, systematic integration process. This reflects Level 2 — Managed, where requirements are met but the approach is not yet fully institutionalized." },

  // Topic 1: Data Lifecycle Management
  "Data Operations__1__goal__0": { score: 2.3, comment: "Data lifecycle policies are defined for regulated data classes (personal data, financial records) in compliance with GDPR and SOX. Policies cover retention, archival, and deletion timelines. For unregulated data classes, lifecycle management is largely undocumented and left to individual system owners.", rationale: "Lifecycle policies exist for regulated data driven by compliance requirements, but the absence of policies for unregulated data leaves significant gaps. This compliance-driven, partial coverage reflects Level 2 — Managed rather than a comprehensive, defined lifecycle management program." },
  "Data Operations__1__goal__1": { score: 2.4, comment: "A data classification scheme with four tiers (Public, Internal, Confidential, Restricted) is documented and published. Classification has been applied to data in our core financial systems and some cloud applications. Broad application across all data assets is in progress with an estimated 45% coverage rate.", rationale: "A documented classification scheme with partial application reflects managed progress. The 45% coverage rate and in-progress remediation indicate the classification program is advancing but not yet comprehensively applied, which is characteristic of Level 2 — Managed." },
  "Data Operations__1__goal__2": { score: 1.3, comment: "We do not have a formalized data archival or disposal process. Archiving is performed on an ad hoc basis by system administrators when storage thresholds are hit. Disposal of physical media follows IT asset disposal procedures but data-layer deletion is not systematically verified.", rationale: "Ad hoc archiving triggered by storage constraints and unverified data-layer disposal reflect Level 1 — Performed practices. Without formal archival and disposal processes, the organization faces compliance and security risk and cannot demonstrate repeatable data lifecycle management." },

  // Topic 2: Provider Management
  "Data Operations__2__goal__0": { score: 2.4, comment: "We maintain a register of external data providers including market data vendors (Bloomberg, Refinitiv) and reference data providers. Contracts include basic data quality and availability SLAs. Vendor performance is reviewed annually during contract renewal rather than on an ongoing basis.", rationale: "A vendor register with contractual SLAs reflects managed data provider oversight. Annual-only performance reviews without ongoing monitoring limit the organization's ability to proactively address data quality or availability issues, which is characteristic of Level 2 — Managed." },
  "Data Operations__2__goal__1": { score: 2.2, comment: "Data lineage from external providers is documented for our top five critical data feeds. For the remaining external feeds, lineage is partial or undocumented. We are implementing a lineage tool (Collibra Lineage) to automate capture but rollout is approximately 30% complete.", rationale: "Partial lineage documentation for critical feeds with an in-progress automation program reflects Level 2 — Managed. The active tool implementation demonstrates advancement intent, but the current coverage gap prevents Level 3 alignment." },

  // ── PLATFORM & ARCHITECTURE ───────────────────────────────────────────────────
  // Topic 0: Architectural Approach
  "Platform & Architecture__0__goal__0": { score: 3.3, comment: "Our enterprise data architecture is governed by an Architecture Review Board (ARB) that reviews all significant data platform decisions. A reference architecture is documented and updated annually. The architecture follows a medallion lakehouse pattern on Azure with a defined data mesh evolution roadmap.", rationale: "A governed architectural approach with ARB oversight, documented reference architecture, and an active evolution roadmap reflects Level 3 — Defined. The combination of architectural governance, documentation, and forward planning demonstrates institutional maturity in this domain." },
  "Platform & Architecture__0__goal__1": { score: 3.1, comment: "Architecture decisions are documented as Architecture Decision Records (ADRs) in Confluence. ADRs include context, decision rationale, and implications. Compliance with architectural standards is reviewed at project milestones.", rationale: "Structured ADR documentation with milestone-based compliance review reflects Level 3 — Defined architectural governance. The systematic approach to capturing and enforcing architectural decisions ensures consistency and institutional knowledge retention." },
  "Platform & Architecture__0__goal__2": { score: 2.3, comment: "We have a technology roadmap for our data platform covering the next 24 months. The roadmap is updated semiannually and shared with senior leadership. However, roadmap execution is frequently disrupted by unplanned work and the roadmap does not include quantitative benefit projections for planned investments.", rationale: "A maintained technology roadmap with leadership visibility reflects managed forward planning. Frequent disruption from unplanned work and the absence of quantitative benefit projections limit the roadmap's effectiveness and indicate Level 2 — Managed maturity in strategic platform planning." },

  // Topic 1: Architectural Standards
  "Platform & Architecture__1__goal__0": { score: 3.2, comment: "Data architecture standards covering naming conventions, data modeling patterns, API design, and integration standards are documented in our Architecture Standards Catalog. Standards are mandatory for new development and reviewed by the ARB. Legacy exceptions are tracked in a technical debt register.", rationale: "Comprehensive, mandatory architectural standards with ARB enforcement and a tracked legacy exception process reflect Level 3 — Defined. The technical debt register demonstrates organizational awareness of standards compliance gaps and active management of remediation." },
  "Platform & Architecture__1__goal__1": { score: 2.2, comment: "Standards are communicated through onboarding documentation and architecture forums. Awareness among senior engineers and architects is high. However, standards awareness among junior developers and cross-functional project teams is inconsistent, and we do not measure standards adoption rates.", rationale: "Standards communication exists but reaches audiences unevenly and lacks adoption measurement. Inconsistent awareness and absence of quantitative adoption tracking reflect Level 2 — Managed, where standards exist but penetration and effectiveness have not been fully institutionalized." },

  // Topic 2: DM Platform
  "Platform & Architecture__2__goal__0": { score: 3.0, comment: "Our data management platform stack includes Azure Data Lake Storage Gen2, Azure Databricks, Azure Synapse Analytics, and Collibra for governance. The platform is deployed in production and supports our core analytics, reporting, and regulatory workloads. A cloud-native migration from on-premises Informatica CDGC to Microsoft Purview is planned for H2 2025.", rationale: "An established, production-grade cloud data platform supporting critical workloads reflects Level 3 — Defined. The planned Purview migration demonstrates continued platform evolution. The upcoming migration will be an important maturity inflection point for governance tooling integration." },
  "Platform & Architecture__2__goal__1": { score: 2.2, comment: "Platform performance monitoring is implemented for our data warehouse and core pipelines using Azure Monitor and Databricks observability tools. Data quality monitoring is primarily manual — there is no automated data observability layer for anomaly detection or pipeline health scoring.", rationale: "Infrastructure monitoring is in place but data observability at the semantic and quality layer remains manual. The absence of automated anomaly detection and data health scoring reflects Level 2 — Managed, where operational monitoring is present but does not extend to proactive data quality surveillance." },
  "Platform & Architecture__2__goal__2": { score: 2.0, comment: "Platform capacity is managed reactively based on storage and compute utilization alerts. We do not have a formal capacity planning process that incorporates projected data volume growth or new workload demand forecasting.", rationale: "Reactive capacity management without demand-driven forecasting or formal planning processes reflects Level 2 — Managed. Proactive capacity planning aligned to data growth projections would be required for Level 3 advancement." },

  // Topic 3: Data Integration
  "Platform & Architecture__3__goal__0": { score: 3.1, comment: "Data integration standards including design patterns (batch, micro-batch, streaming), error handling, logging, and SLA definitions are documented and applied to all new integration development. Legacy integrations are being brought into compliance through a modernization program.", rationale: "Documented and enforced integration standards with an active legacy modernization program reflect Level 3 — Defined. The combination of prospective standards enforcement and retroactive compliance remediation demonstrates institutional commitment to integration discipline." },
  "Platform & Architecture__3__goal__1": { score: 2.9, comment: "End-to-end data lineage for our regulatory reporting pipelines is documented in Collibra. Lineage captures source-to-target transformations and is used for impact analysis during change management. Coverage for analytical pipelines is in progress at approximately 65% completion.", rationale: "Documented regulatory lineage with active use in change management and ongoing expansion to analytical pipelines reflects Level 3 — Defined. The 65% analytical coverage demonstrates systematic progress toward comprehensive lineage." },
  "Platform & Architecture__3__goal__2": { score: 2.4, comment: "Integration testing includes automated regression tests for critical pipelines and manual validation for less critical feeds. Test coverage is estimated at 70% for production pipelines. We do not have a formal integration testing strategy that mandates coverage thresholds or test types across the entire integration portfolio.", rationale: "Partial automated testing with manual validation for lower-priority integrations reflects Level 2 — Managed. Without a formal testing strategy mandating coverage thresholds, testing quality is inconsistent and gaps are not systematically tracked." },

  // Topic 4: Historical Data & Retention
  "Platform & Architecture__4__goal__0": { score: 2.3, comment: "Data retention schedules are defined for regulated data classes and enforced through automated archiving rules for our Azure storage tier. Non-regulated data retention is largely undefined and governed by default storage quotas.", rationale: "Retention schedules and automation for regulated data with gaps for non-regulated data reflect Level 2 — Managed. A comprehensive retention framework applicable to all data classes regardless of regulatory status would be required for Level 3." },
  "Platform & Architecture__4__goal__1": { score: 2.2, comment: "Historical data is available in our data lake for financial data going back 7 years. Accessibility for older data requires manual retrieval from cold storage by the engineering team. Business users do not have self-service access to historical archives.", rationale: "Historical data availability with technical accessibility reflects managed data preservation. The lack of business self-service access to historical archives limits utility and indicates Level 2 — Managed maturity in historical data management." },

  // ── SUPPORTING PROCESSES ──────────────────────────────────────────────────────
  // Topic 0: Measurement & Analysis
  "Supporting Processes__0__goal__0": { score: 2.3, comment: "We track a set of data governance KPIs including glossary coverage rate, DQ assessment completion %, and issue resolution SLA adherence. These are reported quarterly to the governance council. However, targets for most metrics are not formally defined and trend analysis is not consistently performed.", rationale: "Defined metrics with quarterly reporting reflect Level 2 — Managed. The absence of formal targets and inconsistent trend analysis prevent the organization from managing these measures quantitatively, which would be required for Level 3 — Defined advancement." },
  "Supporting Processes__0__goal__1": { score: 2.1, comment: "Measurement results inform governance council discussions and CDO reporting but are not systematically used to drive process improvement decisions. The link between metric performance and specific process improvement actions is informal and not documented.", rationale: "Measurement results are communicated but not systematically acted upon through a defined improvement cycle. The informal link between metrics and actions is characteristic of Level 2 — Managed, where measurement exists but its influence on management decisions is not institutionalized." },

  // Topic 1: Process Management
  "Supporting Processes__1__goal__0": { score: 2.3, comment: "Core data management processes (governance, quality assessment, architecture review) are documented in Confluence. Process documentation follows a standard template. However, documentation coverage is incomplete — several operational processes for data operations and lifecycle management are undocumented.", rationale: "Documented core processes with a standard template reflect managed practice. Incomplete coverage of operational processes indicates Level 2 — Managed, where documentation effort is underway but not yet comprehensive across all data management functions." },
  "Supporting Processes__1__goal__1": { score: 2.0, comment: "Process improvement is driven by governance council discussions and post-incident reviews. We do not have a formal process improvement program or structured retrospective cadence. Improvements are implemented on an ad hoc basis without documented change rationale or outcome tracking.", rationale: "Informal, incident-driven process improvement without a structured program reflects Level 2 — Managed. A defined improvement cycle with documented rationale and outcome tracking would be required to advance to Level 3 — Defined." },

  // Topic 2: Process Quality Assurance
  "Supporting Processes__2__goal__0": { score: 2.1, comment: "Quality assurance for data management processes is performed informally through governance council reviews and peer review of deliverables. There is no dedicated process QA function or structured quality gate framework for data management activities.", rationale: "Informal quality assurance through governance reviews without a structured framework reflects Level 2 — Managed. A dedicated QA function with defined quality gates and documented standards would be required for Level 3 advancement." },
  "Supporting Processes__2__goal__1": { score: 1.3, comment: "Non-conformance to data management standards and processes is not systematically tracked or reported. Issues are identified and addressed informally when they surface but there is no formal non-conformance register or escalation process.", rationale: "The absence of a systematic non-conformance tracking and escalation mechanism reflects Level 1 — Performed. Without visible accountability for process adherence, the organization cannot demonstrate consistent standards compliance or drive improvement through corrective action." },

  // Topic 3: Risk Management
  "Supporting Processes__3__goal__0": { score: 3.1, comment: "Data risks are identified and tracked in our Enterprise Risk Management system. Data risk assessments are conducted annually for critical data assets. The CDO participates in the Enterprise Risk Committee and data risks are formally escalated through the ERM framework.", rationale: "Integration of data risks into the enterprise risk management framework with formal committee participation and annual assessments reflects Level 3 — Defined. Systematic identification, documentation, and escalation of data risks through established channels demonstrates institutional risk management maturity." },
  "Supporting Processes__3__goal__1": { score: 2.3, comment: "Risk mitigation actions for identified data risks are assigned to owners and tracked in our ERM system. However, risk mitigation progress reporting is limited to annual reviews and interim progress is not consistently monitored or escalated between review cycles.", rationale: "Risk mitigation ownership and tracking in the ERM system reflects managed practice. Limited interim monitoring between annual reviews reduces the organization's ability to respond to emerging risk events, indicating Level 2 — Managed rather than continuous risk management." },
  "Supporting Processes__3__goal__2": { score: 2.3, comment: "Data-related risks are included in our Business Continuity Plan for tier-1 systems. Recovery Time Objectives and Recovery Point Objectives are defined for critical data assets. BCP testing for data systems is conducted annually. Coverage for non-tier-1 systems is incomplete.", rationale: "BCP integration for critical systems with defined recovery objectives and annual testing reflects managed business continuity for data. Incomplete coverage for non-tier-1 systems indicates Level 2 — Managed maturity in data risk and continuity planning." },

  // Topic 4: Configuration Management
  "Supporting Processes__4__goal__0": { score: 3.4, comment: "Data platform configuration is managed through infrastructure-as-code (Terraform, Azure Bicep) stored in Azure DevOps. All configuration changes require peer review and are deployed through an automated CI/CD pipeline. Environment configurations for dev, test, and production are maintained consistently.", rationale: "Infrastructure-as-code with peer review, automated deployment pipelines, and consistent environment management reflects Level 3 — Defined configuration management practices. The combination of version control, review gates, and automation demonstrates institutional engineering discipline." },
  "Supporting Processes__4__goal__1": { score: 2.3, comment: "Change control for data platform changes follows our IT change management process with CAB approval for high-impact changes. Data content changes (transformations, business rules) follow a lighter-weight change process that lacks the same rigor as infrastructure changes.", rationale: "Tiered change control with formal CAB governance for infrastructure reflects managed practices. The lower rigor applied to data content changes creates a governance gap that could allow undocumented changes to business logic and data rules, indicating Level 2 — Managed overall maturity in change control." },
  "Supporting Processes__4__goal__2": { score: 2.1, comment: "Configuration audits are performed annually as part of our IT general controls testing. Data-layer configuration (business rules, transformation logic, data quality rules) is not included in audit scope. We rely on version control history as a proxy for configuration auditability.", rationale: "Annual configuration audits with IT controls scope but exclusion of data-layer configuration reflects partial audit coverage. Reliance on version control history as the primary audit mechanism for data configuration is characteristic of Level 2 — Managed rather than a formal, comprehensive audit program." },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rKey = (area, tIdx, type, idx) => `${area}__${tIdx}__${type}__${idx}`;

// ─── Scoring Helpers ─────────────────────────────────────────────────────────
// Area average = average of topic averages (each topic weighted equally,
// regardless of how many goals it contains). This is consistent with CMMI DMM
// methodology and matches what the radar charts display.
const getAreaAvg = (areaName, responses) => {
  const topicScores = getTopicScores(areaName, responses).filter(t => t.score > 0);
  if (topicScores.length === 0) return null;
  return topicScores.reduce((a, b) => a + b.score, 0) / topicScores.length;
};

const getStats = (responses) => {
  let totalGoals = 0, scoredGoals = 0;
  const areaStats = {};
  const scoredAreaAvgs = [];

  Object.entries(AREAS).forEach(([aName, area]) => {
    let at = 0, as_ = 0;
    area.topics.forEach((topic, tIdx) => {
      topic.goals.forEach((_, gIdx) => {
        at++; totalGoals++;
        if (responses[rKey(aName, tIdx, "goal", gIdx)]?.score) { as_++; scoredGoals++; }
      });
    });
    // Area avg = average of topic averages (topic-weighted, not goal-weighted)
    const avg = getAreaAvg(aName, responses);
    areaStats[aName] = { total: at, scored: as_, avg };
    if (avg !== null) scoredAreaAvgs.push(avg);
  });

  // Overall avg = average of area averages (each area weighted equally)
  const avg = scoredAreaAvgs.length > 0
    ? scoredAreaAvgs.reduce((a, b) => a + b, 0) / scoredAreaAvgs.length
    : null;

  return {
    totalGoals, scoredGoals,
    pct: totalGoals > 0 ? Math.round((scoredGoals / totalGoals) * 100) : 0,
    avg,
    areaStats,
  };
};

// ─── Topic Score Helpers ──────────────────────────────────────────────────────
const getTopicScores = (areaName, responses) => {
  return AREAS[areaName].topics.map((topic, tIdx) => {
    const scored = topic.goals
      .map((_, gIdx) => responses[rKey(areaName, tIdx, "goal", gIdx)]?.score)
      .filter(Boolean);
    return {
      topic: topic.name.replace(/\n/g, " "),
      score: scored.length > 0 ? scored.reduce((a, b) => a + b, 0) / scored.length : 0,
      scoredCount: scored.length,
      totalCount: topic.goals.length,
    };
  });
};

const getAllAreaScores = (responses) =>
  Object.entries(AREAS).map(([aName, area]) => {
    const topicScores = getTopicScores(aName, responses);
    const scored = topicScores.filter(t => t.score > 0);
    return {
      area: aName,
      short: area.short,
      score: scored.length > 0 ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0,
      color: area.color,
    };
  });

// ─── Custom Radar Dot ────────────────────────────────────────────────────────
const CustomRadarDot = ({ cx, cy, fill, payload }) => {
  if (!payload || payload.score === 0) return null;
  return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="white" strokeWidth={1.5} />;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const RadarTooltip = ({ active, payload, labelKey = "topic" }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d || d.score === 0) return null;
  const lvl = Math.round(d.score);
  const cmmi = CMMI[lvl] || CMMI[1];
  return (
    <div style={{ background: "white", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}>
      <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13, marginBottom: 4 }}>{d[labelKey]}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: cmmi.color, display: "inline-block" }} />
        <span style={{ fontSize: 13, color: cmmi.color, fontWeight: 700 }}>{d.score.toFixed(1)}</span>
        <span style={{ fontSize: 12, color: "#64748B" }}>— {cmmi.label}</span>
      </div>
      {d.scoredCount != null && (
        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{d.scoredCount}/{d.totalCount} goals scored</div>
      )}
    </div>
  );
};

// ─── Area Radar Chart ─────────────────────────────────────────────────────────
function AreaRadarChart({ areaName, responses }) {
  const area = AREAS[areaName];
  const data = getTopicScores(areaName, responses);
  const hasAnyScore = data.some(d => d.score > 0);

  if (!hasAnyScore) {
    return (
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <polygon points="18,4 32,28 4,28" stroke={area.color} strokeWidth="1.5" fill={`${area.color}10`} strokeDasharray="3 2" />
        </svg>
        <span style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center" }}>Score goals to<br />populate radar</span>
      </div>
    );
  }

  // Abbreviate long topic names for axis labels
  const abbreviated = data.map(d => ({
    ...d,
    topic: d.topic.length > 18 ? d.topic.slice(0, 16) + "…" : d.topic,
    fullTopic: d.topic,
  }));

  return (
    <ResponsiveContainer width="100%" height={190}>
      <RadarChart data={abbreviated} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
        <PolarGrid stroke={`${area.color}20`} />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fill: "#64748B", fontSize: 10.5, fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
          tickLine={false}
        />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <Radar
          dataKey="score"
          stroke={area.color}
          fill={area.color}
          fillOpacity={0.15}
          strokeWidth={2}
          dot={<CustomRadarDot fill={area.color} />}
        />
        <Tooltip content={<RadarTooltip labelKey="fullTopic" />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Master Radar Chart (all 6 areas) ─────────────────────────────────────────
function MasterRadarChart({ responses }) {
  const data = getAllAreaScores(responses);
  const hasAnyScore = data.some(d => d.score > 0);

  if (!hasAnyScore) {
    return (
      <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 44,36 4,36" stroke="#19A3FC" strokeWidth="1.5" fill="rgba(25,163,252,.08)" strokeDasharray="4 3" />
          <polygon points="24,14 36,34 12,34" stroke="#19A3FC" strokeWidth="1" fill="rgba(25,163,252,.05)" strokeDasharray="3 2" />
        </svg>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.25)", textAlign: "center", lineHeight: 1.6 }}>Score goals across areas<br />to see the overall radar</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 12, right: 30, bottom: 12, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,.08)" />
        <PolarAngleAxis
          dataKey="short"
          tick={({ x, y, payload, index }) => {
            const d = data[index];
            return (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,.55)" fontSize={11} fontFamily="'Outfit', sans-serif" fontWeight={600}>
                {payload.value}
              </text>
            );
          }}
        />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <Radar
          dataKey="score"
          stroke="#19A3FC"
          fill="#19A3FC"
          fillOpacity={0.2}
          strokeWidth={2.5}
          dot={({ cx, cy, payload }) => payload.score > 0
            ? <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={payload.color} stroke="white" strokeWidth={2} />
            : <circle key={`empty-${cx}-${cy}`} cx={cx} cy={cy} r={0} />
          }
        />
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const d = payload[0]?.payload;
          if (!d || d.score === 0) return null;
          const lvl = Math.round(d.score);
          const cmmi = CMMI[lvl] || CMMI[1];
          return (
            <div style={{ background: "#070F26", border: "1px solid rgba(25,163,252,.3)", borderRadius: 10, padding: "10px 14px", fontFamily: "'Outfit', sans-serif" }}>
              <div style={{ fontWeight: 700, color: "white", fontSize: 13, marginBottom: 4 }}>{d.area}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: cmmi.color, display: "inline-block" }} />
                <span style={{ fontSize: 13, color: cmmi.color, fontWeight: 700 }}>{d.score.toFixed(1)}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>— {cmmi.label}</span>
              </div>
            </div>
          );
        }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim() || !org.trim()) { setErr("Please enter your name and organization."); return; }
    onLogin(name.trim(), org.trim(), role.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #070F26 0%, #0A1E3D 50%, #070F26 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 24 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .login-input { background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 16px; color:white; font-size:15px; font-family:inherit; width:100%; outline:none; transition:border-color .2s; }
        .login-input:focus { border-color:rgba(99,102,241,.7); }
        .login-input::placeholder { color:rgba(255,255,255,.3); }
        .login-btn { background:linear-gradient(135deg,#0072BC,#009AA4); border:none; border-radius:10px; padding:14px; color:white; font-size:16px; font-weight:600; font-family:inherit; cursor:pointer; width:100%; transition:opacity .2s,transform .1s; }
        .login-btn:hover { opacity:.9; transform:translateY(-1px); }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp .6s ease" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <NttLogoWhite height={36} />
          </div>
          <div style={{ width: 40, height: 1, background: "rgba(255,255,255,.12)", margin: "0 auto 20px" }} />
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: "white", fontFamily: "'Fraunces', serif", lineHeight: 1.2 }}>Data Maturity<br /><span style={{ color: "#19A3FC" }}>Assessment</span></h1>
          <p style={{ color: "rgba(255,255,255,.45)", marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>AI-powered CMMI DMM evaluation toolkit<br />for data governance practitioners</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 36, backdropFilter: "blur(12px)" }}>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 20, marginTop: 0 }}>SIGN IN TO BEGIN ASSESSMENT</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Your Name</label>
              <input className="login-input" placeholder="e.g. Jane Smith" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Organization</label>
              <input className="login-input" placeholder="e.g. Acme Financial Corp" value={org} onChange={e => setOrg(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Your Role <span style={{ color: "rgba(255,255,255,.25)" }}>(optional)</span></label>
              <input className="login-input" placeholder="e.g. Data Governance Lead" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            {err && <p style={{ color: "#F87171", fontSize: 13, margin: 0 }}>{err}</p>}
            <button className="login-btn" onClick={submit} style={{ marginTop: 8 }}>Begin Assessment →</button>
          </div>
        </div>

        {/* CMMI legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
          {Object.entries(CMMI).map(([lvl, c]) => (
            <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.05)", borderRadius: 20, padding: "4px 10px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>L{lvl} {c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score, size = "md" }) {
  if (!score) return null;
  const lvl = Math.min(5, Math.max(1, Math.round(score)));
  const c = CMMI[lvl];
  const pad = size === "lg" ? "8px 16px" : "4px 10px";
  const fs = size === "lg" ? 14 : 12;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1.5px solid ${c.color}40`, borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: size === "lg" ? 16 : 13 }}>●</span> {score.toFixed(1)} — {c.label}
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 64, stroke = 5, color = "#0072BC" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
    </svg>
  );
}

// ─── SVG Radar Chart Generator (for PDF export) ───────────────────────────────
function polarToXY(angleDeg, r, cx, cy) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarSVG({ spokes, size = 280, rings = 5, fillColor = "#0072BC", labelColor = "#334155", bgDark = false }) {
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.36;
  const n = spokes.length;
  if (n < 3) return "";

  const angleStep = 360 / n;
  const gridColor = bgDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
  const gridLabelColor = bgDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const spokeLineColor = bgDark ? "rgba(255,255,255,0.08)" : "#f1f5f9";

  // Grid rings
  const ringsSVG = [1,2,3,4,5].map(i => {
    const r = (i / rings) * maxR;
    const pts = Array.from({length:n}, (_,k) => {
      const p = polarToXY(k * angleStep, r, cx, cy);
      return `${p.x},${p.y}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="${gridColor}" stroke-width="${i === 5 ? 1.5 : 0.8}" />`;
  }).join("\n");

  // Ring level labels (1-5) on first spoke
  const ringLabels = [1,2,3,4,5].map(i => {
    const r = (i / rings) * maxR;
    const p = polarToXY(0, r, cx, cy);
    return `<text x="${p.x + 3}" y="${p.y - 2}" font-size="8" fill="${gridLabelColor}" font-family="Outfit,sans-serif">${i}</text>`;
  }).join("\n");

  // Spoke lines
  const spokeLines = Array.from({length:n}, (_,i) => {
    const p = polarToXY(i * angleStep, maxR, cx, cy);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${spokeLineColor}" stroke-width="1" />`;
  }).join("\n");

  // Data polygon
  const dataPoints = spokes.map((s, i) => {
    const score = Math.min(5, Math.max(0, s.score || 0));
    const r = (score / 5) * maxR;
    return polarToXY(i * angleStep, r, cx, cy);
  });
  const polyPts = dataPoints.map(p => `${p.x},${p.y}`).join(" ");
  const hexFill = fillColor;

  // Score dots on each spoke
  const dots = dataPoints.map((p, i) => {
    if (!spokes[i].score) return "";
    return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${hexFill}" stroke="white" stroke-width="1.5" />`;
  }).join("\n");

  // Spoke labels
  const labelPad = 22;
  const labels = spokes.map((s, i) => {
    const angle = i * angleStep;
    const p = polarToXY(angle, maxR + labelPad, cx, cy);
    const anchor = p.x < cx - 4 ? "end" : p.x > cx + 4 ? "start" : "middle";
    // Truncate long labels
    const label = s.label.length > 14 ? s.label.slice(0, 13) + "…" : s.label;
    const scoreText = s.score ? s.score.toFixed(1) : "—";
    return `
      <text x="${p.x}" y="${p.y - 4}" text-anchor="${anchor}" font-size="10" font-weight="600" fill="${s.color || labelColor}" font-family="Outfit,sans-serif">${label}</text>
      <text x="${p.x}" y="${p.y + 8}" text-anchor="${anchor}" font-size="9" fill="${bgDark ? "rgba(255,255,255,0.5)" : "#94a3b8"}" font-family="Outfit,sans-serif">${scoreText}</text>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${ringsSVG}
    ${ringLabels}
    ${spokeLines}
    <polygon points="${polyPts}" fill="${hexFill}22" stroke="${hexFill}" stroke-width="2" stroke-linejoin="round" />
    ${dots}
    ${labels}
  </svg>`;
}

function masterRadarSVG(responses, size = 300) {
  const spokes = Object.entries(AREAS).map(([aName, area]) => {
    const ts = getTopicScores(aName, responses).filter(t => t.score > 0);
    const avg = ts.length > 0 ? ts.reduce((a,b) => a + b.score, 0) / ts.length : 0;
    return { label: area.short, score: avg || null, color: area.color };
  });
  return radarSVG({ spokes, size, fillColor: "#0072BC", bgDark: true, labelColor: "rgba(255,255,255,0.8)" });
}

function areaRadarSVG(aName, responses, size = 300, projectedScores = null) {
  const area = AREAS[aName];
  const C_LEVELS = { 1:"Performed", 2:"Managed", 3:"Defined", 4:"Measured", 5:"Optimized" };
  const C_COLORS = { 1:"#B22000", 2:"#E42600", 3:"#CC7700", 4:"#0072BC", 5:"#068941" };

  const spokes = area.topics.map((topic, tIdx) => {
    const scored = topic.goals.map((_,gIdx) => responses[rKey(aName,tIdx,"goal",gIdx)]?.score).filter(Boolean);
    const avg = scored.length > 0 ? scored.reduce((a,b) => a+b,0) / scored.length : 0;
    const proj = projectedScores ? (projectedScores[topic.name] ?? projectedScores[Object.keys(projectedScores).find(k => k.toLowerCase().includes(topic.name.toLowerCase().slice(0,6))) ?? ""] ?? null) : null;
    return { label: String(tIdx + 1), fullLabel: topic.name, score: avg || null, projected: proj, color: area.color };
  });

  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.36;
  const n = spokes.length;
  const angleStep = 360 / n;

  const ringsSVG = [1,2,3,4,5].map(i => {
    const r = (i / 5) * maxR;
    const pts = Array.from({length:n}, (_,k) => { const p = polarToXY(k * angleStep, r, cx, cy); return `${p.x},${p.y}`; }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="${i === 5 ? 1.5 : 0.8}" />`;
  }).join("\n");

  const ringLabels = [1,2,3,4,5].map(i => {
    const r = (i / 5) * maxR;
    const p = polarToXY(0, r, cx, cy);
    return `<text x="${p.x + 3}" y="${p.y - 2}" font-size="8" fill="#94a3b8" font-family="Outfit,sans-serif">${i}</text>`;
  }).join("\n");

  const spokeLines = Array.from({length:n}, (_,i) => {
    const p = polarToXY(i * angleStep, maxR, cx, cy);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#f1f5f9" stroke-width="1" />`;
  }).join("\n");

  // Current state polygon
  const dataPoints = spokes.map((s, i) => polarToXY(i * angleStep, (Math.min(5, Math.max(0, s.score || 0)) / 5) * maxR, cx, cy));
  const polyPts = dataPoints.map(p => `${p.x},${p.y}`).join(" ");
  const dots = dataPoints.map((p, i) =>
    spokes[i].score ? `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${area.color}" stroke="white" stroke-width="1.5" />` : ""
  ).join("\n");

  // Projected state polygon (dashed, lighter)
  const hasProjections = spokes.some(s => s.projected !== null);
  const projPoints = hasProjections
    ? spokes.map((s, i) => polarToXY(i * angleStep, (Math.min(5, Math.max(0, s.projected ?? s.score ?? 0)) / 5) * maxR, cx, cy))
    : [];
  const projPts = projPoints.map(p => `${p.x},${p.y}`).join(" ");
  const projDots = hasProjections ? projPoints.map((p, i) =>
    spokes[i].projected !== null ? `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="white" stroke="${area.color}" stroke-width="2" stroke-dasharray="2,1" opacity="0.85" />` : ""
  ).join("\n") : "";

  const labelPad = 18;
  const labels = spokes.map((s, i) => {
    const p = polarToXY(i * angleStep, maxR + labelPad, cx, cy);
    const anchor = p.x < cx - 4 ? "end" : p.x > cx + 4 ? "start" : "middle";
    return `<text x="${p.x}" y="${p.y + 4}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="${area.color}" font-family="Outfit,sans-serif">${s.label}</text>`;
  }).join("\n");

  const chartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${ringsSVG}
    ${ringLabels}
    ${spokeLines}
    <polygon points="${polyPts}" fill="${area.color}22" stroke="${area.color}" stroke-width="2" stroke-linejoin="round" />
    ${hasProjections ? `<polygon points="${projPts}" fill="${area.color}0a" stroke="${area.color}" stroke-width="1.5" stroke-dasharray="5,3" stroke-linejoin="round" opacity="0.7" />` : ""}
    ${dots}
    ${projDots}
    ${labels}
  </svg>`;

  // Legend header
  const legendHeader = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid #e2e8f0;">
    <span style="width:16px;flex-shrink:0;"></span>
    <span style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;font-family:'Outfit',sans-serif;flex:1;">TOPIC</span>
    <span style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;font-family:'Outfit',sans-serif;min-width:36px;text-align:right;">NOW</span>
    ${hasProjections ? `<span style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;font-family:'Outfit',sans-serif;min-width:70px;text-align:right;">PROJECTED</span>` : ""}
    <span style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;font-family:'Outfit',sans-serif;min-width:80px;padding-left:8px;">LEVEL</span>
  </div>`;

  const legendRows = spokes.map(s => {
    const scoreText = s.score ? s.score.toFixed(1) : "—";
    const lvl = s.score ? Math.min(5, Math.max(1, Math.round(s.score))) : null;
    const lvlColor = lvl ? C_COLORS[lvl] : "#94a3b8";

    // Projected score + delta
    const projScore = s.projected !== null ? s.projected : null;
    const projLvl = projScore ? Math.min(5, Math.max(1, Math.round(projScore))) : null;
    const projLvlLabel = projLvl ? C_LEVELS[projLvl] : "";
    const projLvlColor = projLvl ? C_COLORS[projLvl] : "#94a3b8";
    const delta = (projScore && s.score) ? (projScore - s.score) : null;
    const deltaStr = delta !== null ? (delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : "";

    const levelDisplay = hasProjections && projScore
      ? `<div style="display:flex;flex-direction:column;gap:1px;min-width:80px;padding-left:8px;">
          <span style="font-size:10px;font-weight:600;color:${lvlColor};font-family:'Outfit',sans-serif;">${lvl ? C_LEVELS[lvl] : ""}</span>
          <span style="font-size:9px;color:${projLvlColor};font-family:'Outfit',sans-serif;">→ ${projLvlLabel}</span>
        </div>`
      : `<span style="font-size:10px;font-weight:600;color:${lvlColor};font-family:'Outfit',sans-serif;min-width:80px;padding-left:8px;">${lvl ? C_LEVELS[lvl] : ""}</span>`;

    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <span style="width:16px;height:16px;border-radius:3px;background:${area.color};color:white;font-size:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Outfit',sans-serif;">${s.label}</span>
      <span style="font-size:11px;color:#334155;font-family:'Outfit',sans-serif;flex:1;">${s.fullLabel}</span>
      <span style="font-size:11px;font-weight:700;color:${area.color};font-family:'Outfit',sans-serif;min-width:36px;text-align:right;">${scoreText}</span>
      ${hasProjections ? `<span style="font-size:11px;font-weight:700;color:${projLvlColor ?? area.color};font-family:'Outfit',sans-serif;min-width:70px;text-align:right;">${projScore ? projScore.toFixed(1) : "—"}${deltaStr ? ` <span style="font-size:9px;color:#94a3b8;">(${deltaStr})</span>` : ""}</span>` : ""}
      ${levelDisplay}
    </div>`;
  }).join("");

  // Disclaimer note if projections are shown
  const disclaimer = hasProjections ? `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;font-family:'Outfit',sans-serif;font-style:italic;line-height:1.4;">
    ⚠ Projected scores are estimated illustrations of potential improvement if recommendations are implemented. They are not guaranteed outcomes and should be treated as directional guidance only.
  </div>` : "";

  // Chart legend key
  const chartKey = hasProjections ? `<div style="display:flex;gap:16px;justify-content:center;margin-bottom:6px;">
    <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#64748b;font-family:'Outfit',sans-serif;">
      <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="${area.color}" stroke-width="2"/></svg> Current state
    </div>
    <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#64748b;font-family:'Outfit',sans-serif;">
      <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="${area.color}" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.7"/></svg> Projected (post-recommendation)
    </div>
  </div>` : "";

  return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;">
    ${chartKey}
    ${chartSVG}
    <div style="width:100%;max-width:520px;margin-top:6px;padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      ${legendHeader}
      ${legendRows}
      ${disclaimer}
    </div>
  </div>`;
}

// ─── Payoff Matrix SVG ────────────────────────────────────────────────────────
function payoffMatrixSVG(recs, size = 480) {
  const pad = { top: 36, right: 24, bottom: 52, left: 52 };
  const w = size, h = size * 0.72;
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Quadrant fills
  const quads = [
    { x: pad.left,              y: pad.top,              w: plotW/2, h: plotH/2, fill: "#DAEEF9", label: "STRATEGIC\nINVESTMENTS", lx: pad.left + plotW*0.25,        ly: pad.top + 14 },
    { x: pad.left + plotW/2,    y: pad.top,              w: plotW/2, h: plotH/2, fill: "#E0F5EC", label: "QUICK\nWINS",            lx: pad.left + plotW*0.75,        ly: pad.top + 14 },
    { x: pad.left,              y: pad.top + plotH/2,    w: plotW/2, h: plotH/2, fill: "#f8fafc", label: "DEPRIORITIZE",           lx: pad.left + plotW*0.25,        ly: pad.top + plotH/2 + 14 },
    { x: pad.left + plotW/2,    y: pad.top + plotH/2,    w: plotW/2, h: plotH/2, fill: "#FFF5CC", label: "FILL-INS",               lx: pad.left + plotW*0.75,        ly: pad.top + plotH/2 + 14 },
  ];

  const quadRects = quads.map(q =>
    `<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" fill="${q.fill}" />
     <text x="${q.lx}" y="${q.ly}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#94a3b8" font-family="Outfit,sans-serif" letter-spacing="0.8">${q.label.replace("\n", `</text><text x="${q.lx}" y="${q.ly + 11}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#94a3b8" font-family="Outfit,sans-serif" letter-spacing="0.8">`)}</text>`
  ).join("\n");

  // Grid lines
  const gridLines = `
    <line x1="${pad.left}" y1="${pad.top + plotH/2}" x2="${pad.left + plotW}" y2="${pad.top + plotH/2}" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="${pad.left + plotW/2}" y1="${pad.top}" x2="${pad.left + plotW/2}" y2="${pad.top + plotH}" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    <rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="4"/>`;

  // Axis labels
  const axisLabels = `
    <text x="${pad.left - 10}" y="${pad.top + plotH/2}" text-anchor="middle" font-size="9" fill="#64748b" font-family="Outfit,sans-serif" transform="rotate(-90,${pad.left-10},${pad.top + plotH/2})">BUSINESS VALUE →</text>
    <text x="${pad.left}" y="${h - 8}" font-size="9" fill="#94a3b8" font-family="Outfit,sans-serif">Low</text>
    <text x="${pad.left + plotW - 14}" y="${h - 8}" font-size="9" fill="#94a3b8" font-family="Outfit,sans-serif">High</text>
    <text x="${pad.left}" y="${pad.top + plotH + 2}" font-size="9" fill="#94a3b8" font-family="Outfit,sans-serif" dominant-baseline="hanging">Low</text>
    <text x="${pad.left}" y="${pad.top - 6}" font-size="9" fill="#94a3b8" font-family="Outfit,sans-serif">High</text>
    <text x="${pad.left + plotW/2}" y="${h - 8}" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b" font-family="Outfit,sans-serif">IMPLEMENTATION EFFORT →</text>`;

  // Dot colors by quadrant
  const dotColor = (effort, value) => {
    const highVal = value >= 3;
    const lowEff = effort <= 3;
    if (highVal && lowEff)  return "#068941";  // Quick Win — green
    if (highVal && !lowEff) return "#0072BC";  // Strategic — blue
    if (!highVal && lowEff) return "#CC7700";  // Fill-in — amber
    return "#94a3b8";                           // Deprioritize — grey
  };

  // Jitter overlapping dots slightly
  const placed = [];
  const dots = recs.map((r, i) => {
    // effort 1-5 → x, value 1-5 → y (inverted: high value = top)
    let bx = pad.left + ((r.effort - 1) / 4) * plotW;
    let by = pad.top + ((5 - r.value) / 4) * plotH;
    // nudge if overlapping
    let attempts = 0;
    while (placed.some(p => Math.abs(p.x - bx) < 18 && Math.abs(p.y - by) < 18) && attempts < 12) {
      bx += (Math.random() - 0.5) * 20;
      by += (Math.random() - 0.5) * 20;
      attempts++;
    }
    // clamp within plot
    bx = Math.max(pad.left + 12, Math.min(pad.left + plotW - 12, bx));
    by = Math.max(pad.top + 12, Math.min(pad.top + plotH - 12, by));
    placed.push({ x: bx, y: by });
    const dc = dotColor(r.effort, r.value);
    return `<circle cx="${bx}" cy="${by}" r="12" fill="${dc}" opacity="0.9"/>
            <text x="${bx}" y="${by + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="white" font-family="Outfit,sans-serif">${i+1}</text>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${quadRects}
    ${gridLines}
    ${axisLabels}
    ${dots}
  </svg>`;
}

// ─── Recommendations HTML Section ─────────────────────────────────────────────
function recommendationsSectionHTML(recs) {
  const priorityColor = (effort, value) => {
    if (value >= 3 && effort <= 3) return { color: "#068941", bg: "#E0F5EC", label: "Quick Win" };
    if (value >= 3 && effort > 3)  return { color: "#0072BC", bg: "#DAEEF9", label: "Strategic Investment" };
    if (value < 3  && effort <= 3) return { color: "#CC7700", bg: "#FFF5CC", label: "Fill-in" };
    return { color: "#94a3b8", bg: "#f8fafc", label: "Deprioritize" };
  };
  const effortLabel = e => ["","Low","Low-Med","Medium","Med-High","High"][e] || "Medium";
  const valueLabel  = v => ["","Low","Low-Med","Medium","Med-High","High"][v] || "Medium";

  // Safari PDF engine reliable pattern:
  // - No border-radius on block containers (creates clip region that stops paint)
  // - No page-break-inside:avoid on multi-line blocks (causes PDF truncation)
  // - Each card is a top-level <div> sibling with only left-border accent, no rounded box
  const cards = recs.map((r, i) => {
    const p = priorityColor(r.effort, r.value);
    return `<div style="margin:0 28px 12px;padding:14px 16px;background:#fafafa;border:1px solid #e2e8f0;border-left:4px solid ${p.color};">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px;">
        <div style="display:flex;align-items:flex-start;gap:8px;flex:1;">
          <span style="width:22px;height:22px;background:${p.color};color:white;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Outfit',sans-serif;">${i+1}</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;margin-bottom:2px;">${r.title}</div>
            <div style="font-size:10px;color:#94a3b8;font-family:'Outfit',sans-serif;">${r.area}</div>
          </div>
        </div>
        <span style="background:${p.bg};color:${p.color};padding:2px 9px;font-size:10px;font-weight:700;white-space:nowrap;flex-shrink:0;font-family:'Outfit',sans-serif;">${p.label}</span>
      </div>
      <p style="margin:0 0 8px;font-size:12px;color:#334155;line-height:1.6;font-family:'Outfit',sans-serif;">${r.description}</p>
      <div style="background:white;padding:8px 12px;border:1px solid #e2e8f0;margin-bottom:8px;">
        <div style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:1px;margin-bottom:3px;font-family:'Outfit',sans-serif;">BUSINESS VALUE</div>
        <div style="font-size:11px;color:#334155;line-height:1.55;font-family:'Outfit',sans-serif;">${r.business_value}</div>
      </div>
      <div style="display:flex;gap:16px;">
        <div style="font-size:11px;color:#64748b;font-family:'Outfit',sans-serif;">Effort: <strong style="color:#0f172a;">${effortLabel(r.effort)}</strong></div>
        <div style="font-size:11px;color:#64748b;font-family:'Outfit',sans-serif;">Value: <strong style="color:#0f172a;">${valueLabel(r.value)}</strong></div>
      </div>
    </div>`;
  }).join("\n");

  return `
    <div style="page-break-before:always;padding:44px 28px 24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1.5px solid #f1f5f9;">
        ${nttLogoBlackHTML(24)}
        <span style="font-size:10px;font-weight:700;color:#cbd5e1;letter-spacing:2px;font-family:'Outfit',sans-serif;">CMMI DMM ASSESSMENT REPORT</span>
      </div>
      <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:2px;margin:0 0 6px;font-family:'Outfit',sans-serif;">RECOMMENDATIONS</p>
      <h2 style="font-family:'Fraunces',serif;font-size:30px;font-weight:700;color:#0f172a;margin:0 0 24px;">Prioritized Action Plan</h2>
      <div style="padding:20px 24px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:4px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 14px;font-family:'Outfit',sans-serif;">VALUE vs. EFFORT PAYOFF MATRIX</p>
        <div style="display:flex;justify-content:center;">${payoffMatrixSVG(recs, 460)}</div>
        <div style="display:flex;gap:14px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
          ${[["#068941","#E0F5EC","Quick Win"],["#0072BC","#DAEEF9","Strategic Investment"],["#CC7700","#FFF5CC","Fill-in"],["#94a3b8","#f1f5f9","Deprioritize"]].map(([c,bg,l]) =>
            `<div style="display:flex;align-items:center;gap:5px;background:${bg};padding:3px 9px;">
              <span style="width:9px;height:9px;background:${c};display:inline-block;"></span>
              <span style="font-size:10px;font-weight:600;color:${c};font-family:'Outfit',sans-serif;">${l}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>
    ${cards}
    <div style="height:32px;"></div>`;
}

// ─── PDF Report Builder ───────────────────────────────────────────────────────
function buildAreaPages(responses, areaSummaries, C, badge, bar, stats, projectedScores = null) {
  return Object.entries(AREAS).map(([aName, area]) => {
    const as_ = stats.areaStats[aName];
    const areaAvg = as_.avg;
    const topicScores = getTopicScores(aName, responses);

    // ── Topic score table ──────────────────────────────────────────────────────
    // ── Area radar SVG ────────────────────────────────────────────────────────
    const areaProjections = projectedScores ? (projectedScores[aName] ?? null) : null;
    const radarSvg = areaRadarSVG(aName, responses, 320, areaProjections);

    // ── AI topic narratives ───────────────────────────────────────────────────
    const areaNarratives = areaSummaries ? (areaSummaries[aName] || areaSummaries[Object.keys(areaSummaries).find(k => k.toLowerCase().includes(aName.toLowerCase().slice(0,6))) || ""] || null) : null;

    const priorityColors = { high: { color: "#B22000", bg: "#FDECEA" }, medium: { color: "#CC7700", bg: "#FFF5CC" }, low: { color: "#068941", bg: "#E0F5EC" } };

    const narrativeSection = area.topics.map((topic, tIdx) => {
      const scored = topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean);
      if (scored.length === 0) return "";
      const topicAvg = scored.reduce((a, b) => a + b, 0) / scored.length;

      // Support both old shape (string) and new shape ({ narrative, recommendation, priority })
      const rawEntry = areaNarratives
        ? (areaNarratives[topic.name] || areaNarratives[Object.keys(areaNarratives).find(k => k.toLowerCase().includes(topic.name.toLowerCase().slice(0,6))) || ""] || null)
        : null;
      const narrative       = rawEntry ? (typeof rawEntry === "string" ? rawEntry : rawEntry.narrative || null) : null;
      const recommendation  = rawEntry && typeof rawEntry === "object" ? rawEntry.recommendation || null : null;
      const priority        = rawEntry && typeof rawEntry === "object" ? rawEntry.priority || null : null;
      const pc              = priority ? priorityColors[priority] : null;

      const recBlock = recommendation ? `
        <div style="margin-top:12px;padding:10px 14px;border-radius:8px;background:${pc ? pc.bg : "#f8fafc"};border:1.5px solid ${pc ? pc.color + "30" : "#e2e8f0"};display:flex;align-items:flex-start;gap:10px;">
          <div style="flex:1;">
            <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:${pc ? pc.color : "#94a3b8"};font-family:'Outfit',sans-serif;margin-bottom:4px;">RECOMMENDATION${pc ? ` • ${priority.toUpperCase()} PRIORITY` : ""}</div>
            <p style="margin:0;font-size:12.5px;color:#334155;line-height:1.6;font-family:'Outfit',sans-serif;">${recommendation}</p>
          </div>
        </div>` : "";

      return `<div style="margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1.5px solid ${area.color}20;">
          <span style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;">${topic.name}</span>
          ${badge(topicAvg)}
        </div>
        ${narrative
          ? `<p style="margin:0;font-size:13px;color:#334155;line-height:1.75;font-family:'Outfit',sans-serif;">${narrative}</p>`
          : `<p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;font-family:'Outfit',sans-serif;">AI assessment pending.</p>`
        }
        ${recBlock}
      </div>`;
    }).join("");

    return `<div style="padding:44px 28px;page-break-before:always;overflow:visible;">

      <!-- Page header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1.5px solid #f1f5f9;">
        ${nttLogoBlackHTML(20)}
        <span style="font-size:10px;font-weight:700;color:#cbd5e1;letter-spacing:2px;font-family:'Outfit',sans-serif;">CMMI DMM ASSESSMENT REPORT</span>
      </div>

      <!-- Area title -->
      <div style="background:linear-gradient(135deg,${area.color}12,${area.color}04);border-radius:12px;padding:20px 26px;margin-bottom:24px;border:1.5px solid ${area.color}1a;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:14px;">
            <span style="font-size:28px;">${area.icon}</span>
            <div>
              <h2 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;font-family:'Fraunces',serif;">${aName}</h2>
              <p style="margin:4px 0 0;font-size:12px;color:#64748b;font-family:'Outfit',sans-serif;">${area.topics.length} topics · ${as_.total} goals · ${as_.scored} scored</p>
            </div>
          </div>
          ${areaAvg ? `<div style="text-align:right;">${badge(areaAvg)}<div style="font-size:10px;color:#94a3b8;margin-top:5px;font-family:'Outfit',sans-serif;">Area average</div></div>` : ""}
        </div>
      </div>

      <!-- Centered radar chart + legend -->
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 10px;font-family:'Outfit',sans-serif;">MATURITY PROFILE</p>
        ${radarSvg}
      </div>

      <!-- AI Assessment section -->
      <div style="border-top:1.5px solid #f1f5f9;padding-top:22px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 18px;font-family:'Outfit',sans-serif;">ASSESSMENT &amp; RECOMMENDATIONS — BY TOPIC</p>
        ${narrativeSection || '<p style="color:#94a3b8;font-size:12px;font-family:Outfit,sans-serif;">No goals have been scored for this area yet.</p>'}
      </div>

    </div>`;
  }).join("");
}

function buildReportHTML(user, responses, aiSummary = null, recommendations = null, areaSummaries = null, projectedScores = null) {
  const stats = getStats(responses);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const overallLevel = stats.avg ? Math.min(5, Math.max(1, Math.round(stats.avg))) : null;
  const overallCmmi = overallLevel ? CMMI[overallLevel] : null;

  const C = {
    1: { color: "#B22000", bg: "#FDECEA", label: "Performed" },
    2: { color: "#E42600", bg: "#FDE8E4", label: "Managed" },
    3: { color: "#CC7700", bg: "#FFF5CC", label: "Defined" },
    4: { color: "#0072BC", bg: "#DAEEF9", label: "Measured" },
    5: { color: "#068941", bg: "#E0F5EC", label: "Optimized" },
  };

  const badge = (score) => {
    if (!score) return `<span style="color:#94a3b8;font-size:12px;font-family:'Outfit',sans-serif;">Not scored</span>`;
    const lvl = Math.min(5, Math.max(1, Math.round(score)));
    const c = C[lvl];
    return `<span style="background:${c.bg};color:${c.color};border:1.5px solid ${c.color}50;border-radius:20px;padding:3px 11px;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;white-space:nowrap;">${score.toFixed(1)} — ${c.label}</span>`;
  };

  const bar = (score, width = 100) => {
    if (!score) return "";
    const lvl = Math.min(5, Math.max(1, Math.round(score)));
    const c = C[lvl];
    return `<div style="background:#f1f5f9;border-radius:4px;height:7px;width:${width}px;display:inline-block;vertical-align:middle;margin-left:8px;"><div style="width:${(score/5)*100}%;background:${c.color};height:7px;border-radius:4px;"></div></div>`;
  };

  const areaRows = Object.entries(AREAS).map(([aName, area]) => {
    const as_ = stats.areaStats[aName];
    const avg = as_.avg;
    const pct = as_.total > 0 ? Math.round((as_.scored / as_.total) * 100) : 0;
    return `<tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:11px 16px;font-weight:600;color:#0f172a;font-size:13px;font-family:'Outfit',sans-serif;">${area.icon} ${aName}</td>
      <td style="padding:11px 16px;text-align:center;">${avg ? badge(avg) : '<span style="color:#cbd5e1;font-size:13px;">—</span>'}</td>
      <td style="padding:11px 16px;text-align:center;font-size:12px;color:#64748b;font-family:'Outfit',sans-serif;">${as_.scored}/${as_.total}</td>
      <td style="padding:11px 16px;"><div style="background:#f1f5f9;border-radius:4px;height:8px;width:${Math.max(pct,2)}px;max-width:120px;"><div style="width:100%;background:${area.color};height:8px;border-radius:4px;"></div></div></td>
    </tr>`;
  }).join("");

  const areaDetailPages = buildAreaPages(responses, areaSummaries, C, badge, bar, stats, projectedScores);

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:wght@400;600;700&display=swap');
      * { box-sizing:border-box; }
      @media print {
        @page { margin:14mm 8mm 16mm; size:A4; }
        @page { @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: 'Outfit', sans-serif; font-size: 9pt; color: #94a3b8; } }
        body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      }
    </style>

    <!-- COVER -->
    <div style="page-break-after:always;display:flex;flex-direction:column;justify-content:center;padding:56px 60px;min-height:100%;background:white;">
      <div style="margin-bottom:44px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:36px;">
          ${nttLogoBlackHTML(32)}
          <div style="width:1px;height:32px;background:#e2e8f0;"></div>
          <span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;font-family:'Outfit',sans-serif;">CMMI DMM ASSESSMENT REPORT</span>
        </div>
        <h1 style="font-family:'Fraunces',serif;font-size:48px;font-weight:700;color:#0f172a;line-height:1.1;margin:0 0 10px;">${user.org}</h1>
        <h2 style="font-family:'Fraunces',serif;font-size:24px;font-weight:400;color:#0072BC;font-style:italic;margin:0;">Data Management Maturity Evaluation</h2>
      </div>
      <div style="display:flex;gap:44px;margin-bottom:56px;align-items:flex-end;">
        ${stats.avg ? `<div>
          <div style="font-size:10px;color:#94a3b8;font-weight:600;letter-spacing:1.5px;margin-bottom:6px;font-family:'Outfit',sans-serif;">OVERALL MATURITY SCORE</div>
          <div style="font-family:'Fraunces',serif;font-size:68px;font-weight:700;color:#0f172a;line-height:1;">${stats.avg ? stats.avg.toFixed(1) : "—"}</div>
          <div style="font-size:15px;color:#0072BC;margin-top:5px;font-family:'Outfit',sans-serif;">out of 5.0 — ${overallCmmi?.label || ""}</div>
        </div>` : ""}
        <div style="border-left:1px solid #e2e8f0;padding-left:44px;padding-bottom:6px;">
          <div style="font-size:10px;color:#94a3b8;font-weight:600;letter-spacing:1.5px;margin-bottom:10px;font-family:'Outfit',sans-serif;">ASSESSMENT COVERAGE</div>
          <div style="font-size:30px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;">${stats.scoredGoals}<span style="font-size:15px;color:#94a3b8;font-weight:400;"> / ${stats.totalGoals} goals</span></div>
          <div style="font-size:13px;color:#94a3b8;margin-top:3px;font-family:'Outfit',sans-serif;">${stats.pct}% complete</div>
        </div>
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:28px;display:flex;gap:44px;">
        <div><div style="font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:4px;font-family:'Outfit',sans-serif;">PREPARED BY</div><div style="font-size:14px;color:#0f172a;font-weight:500;font-family:'Outfit',sans-serif;">${user.name}</div>${user.role?`<div style="font-size:11px;color:#64748b;font-family:'Outfit',sans-serif;">${user.role}</div>`:""}</div>
        <div><div style="font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:4px;font-family:'Outfit',sans-serif;">DATE</div><div style="font-size:14px;color:#0f172a;font-weight:500;font-family:'Outfit',sans-serif;">${date}</div></div>
        <div><div style="font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:4px;font-family:'Outfit',sans-serif;">FRAMEWORK</div><div style="font-size:14px;color:#0f172a;font-weight:500;font-family:'Outfit',sans-serif;">CMMI DMM</div></div>
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div style="padding:44px 28px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1.5px solid #f1f5f9;">
        ${nttLogoBlackHTML(24)}
        <span style="font-size:10px;font-weight:700;color:#cbd5e1;letter-spacing:2px;font-family:'Outfit',sans-serif;">CMMI DMM ASSESSMENT REPORT</span>
      </div>
      <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:2px;margin:0 0 6px;font-family:'Outfit',sans-serif;">EXECUTIVE SUMMARY</p>

      ${aiSummary ? (() => {
        // Strip any markdown title lines (lines starting with ** or #) that Claude sometimes prepends
        const cleaned = aiSummary
          .split('\n')
          .filter(line => !/^\*\*.*\*\*$/.test(line.trim()) && !/^#+\s/.test(line.trim()))
          .join('\n')
          .trim();
        // Split into paragraphs and render
        const paragraphStyle = `margin:12px 0 0;font-size:14px;color:rgba(255,255,255,.88);line-height:1.85;font-family:Outfit,sans-serif;`;
        const paras = cleaned.split(/\n\n+/).filter(Boolean);
        const body = paras.map((p, i) =>
          `<p style="${i === 0 ? 'margin:0;' : 'margin:14px 0 0;'}font-size:14px;color:rgba(255,255,255,.88);line-height:1.85;font-family:Outfit,sans-serif;">${p.replace(/\n/g, '<br/>')}</p>`
        ).join('');
        return `
      <div style="margin-bottom:32px;padding:32px 36px;background:linear-gradient(135deg,#070F26,#005B96);border-radius:14px;color:white;">
        <h3 style="font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:white;margin:0 0 20px;line-height:1.2;">Executive Assessment: Data Management Maturity</h3>
        ${body}
      </div>`;
      })() : ""}

      <div style="page-break-inside:avoid;">
        <div style="background:#f8fafc;border-radius:12px;padding:14px 22px;margin-bottom:20px;border:1.5px solid #e2e8f0;">
          <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 10px;font-family:'Outfit',sans-serif;">CMMI DMM MATURITY SCALE</p>
          <div style="display:flex;gap:8px;flex-wrap:nowrap;">
            ${Object.entries(C).map(([lvl,c]) => `<div style="display:flex;align-items:center;gap:6px;background:${c.bg};border:1.5px solid ${c.color}40;border-radius:8px;padding:5px 10px;flex:1;min-width:0;">
              <span style="width:18px;height:18px;border-radius:4px;background:${c.color};color:white;font-size:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;flex-shrink:0;">${lvl}</span>
              <span style="font-size:11px;font-weight:600;color:${c.color};font-family:'Outfit',sans-serif;white-space:nowrap;">${c.label}</span>
            </div>`).join("")}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px;">
          <thead><tr style="background:#f8fafc;">
            <th style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.2px;font-family:'Outfit',sans-serif;">ASSESSMENT AREA</th>
            <th style="padding:11px 16px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.2px;font-family:'Outfit',sans-serif;">MATURITY SCORE</th>
            <th style="padding:11px 16px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.2px;font-family:'Outfit',sans-serif;">GOALS SCORED</th>
            <th style="padding:11px 16px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.2px;font-family:'Outfit',sans-serif;">COMPLETION</th>
          </tr></thead>
          <tbody>${areaRows}</tbody>
        </table>

        <div style="background:linear-gradient(160deg,#070F26,#0A1E3D);border-radius:16px;padding:24px 32px;display:flex;flex-direction:column;align-items:center;gap:14px;">
          <p style="font-size:10px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:2px;margin:0;font-family:'Outfit',sans-serif;">MATURITY PROFILE — ALL ASSESSMENT AREAS</p>
          ${masterRadarSVG(responses, 240)}
          <div style="display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;max-width:500px;">
            ${Object.entries(AREAS).map(([aName, area]) => {
              const ts = getTopicScores(aName, responses).filter(t => t.score > 0);
              const avg = ts.length > 0 ? ts.reduce((a,b) => a + b.score, 0) / ts.length : null;
              return `<div style="display:flex;align-items:center;gap:6px;">
                <span style="width:9px;height:9px;border-radius:50%;background:${area.color};display:inline-block;flex-shrink:0;"></span>
                <span style="font-size:10px;color:rgba(255,255,255,.55);font-family:'Outfit',sans-serif;">${area.short} — ${aName}</span>
                ${avg ? `<span style="font-size:10px;font-weight:700;color:${area.color};font-family:'Outfit',sans-serif;">${avg.toFixed(1)}</span>` : ""}
              </div>`;
            }).join("")}
          </div>
        </div>
      </div>

    <!-- AREA PAGES -->
    ${areaDetailPages}

    <!-- RECOMMENDATIONS (optional) -->
    ${recommendations && recommendations.length > 0 ? recommendationsSectionHTML(recommendations) : ""}
  `;
}

// ─── Projected Scores Generator ───────────────────────────────────────────────
async function generateSingleAreaProjection(aName, responses) {
  const area = AREAS[aName];

  const topicBlocks = area.topics.map((topic, tIdx) => {
    const scored = topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean);
    if (scored.length === 0) return null;
    const avg = (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1);

    const goalLines = topic.goals.map((goalText, gIdx) => {
      const r = responses[rKey(aName, tIdx, "goal", gIdx)];
      if (!r?.score) return null;
      const lines = [`    Goal ${gIdx + 1} (${r.score}/5): ${goalText}`];
      if (r.comment)   lines.push(`      Current state: ${r.comment}`);
      if (r.rationale) lines.push(`      Rationale: ${r.rationale}`);
      return lines.join("\n");
    }).filter(Boolean);

    return `  Topic: ${topic.name} (current avg ${avg}/5)\n${goalLines.join("\n")}`;
  }).filter(Boolean);

  if (topicBlocks.length === 0) return null;

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are a senior CMMI DMM assessor estimating realistic maturity improvements for a client report.

For each topic below, estimate the projected maturity score (on the 1.0–5.0 CMMI scale) achievable if targeted recommendations are implemented. Apply these rules strictly:

RULES:
- Be conservative. A single round of improvements typically advances a topic by 0.3–0.8 points, rarely more than 1.0
- Never project above 5.0 or below the current score
- Base projections only on the evidence in the comments and rationales — do not assume capabilities not described
- If the current score is already ≥ 4.0, cap projected improvement at 0.3 unless there is clear evidence of near-readiness for the next level
- If a topic has no scored goals, omit it from the response

AREA: ${aName}
${topicBlocks.join("\n\n")}

Return ONLY a valid JSON object mapping topic name to projected score (a number). No preamble, no markdown:
{ "Topic Name": 2.8 }`
      }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.content.map(c => c.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(clean);
  // Validate: ensure all values are numbers within range
  const validated = {};
  Object.entries(parsed).forEach(([k, v]) => {
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 1.0 && n <= 5.0) validated[k] = Math.round(n * 10) / 10;
  });
  return Object.keys(validated).length > 0 ? validated : null;
}

async function generateProjectedScores(responses) {
  const results = await Promise.allSettled(
    Object.keys(AREAS).map(aName =>
      generateSingleAreaProjection(aName, responses).then(result => ({ aName, result }))
    )
  );

  const projections = {};
  results.forEach(r => {
    if (r.status === "fulfilled" && r.value?.result) {
      projections[r.value.aName] = r.value.result;
    } else if (r.status === "rejected") {
      console.error("Projection failed for area:", r.reason?.message || r.reason);
    }
  });

  return Object.keys(projections).length > 0 ? projections : null;
}

// ─── Area Summaries Generator ─────────────────────────────────────────────────
async function generateSingleAreaSummary(aName, responses) {
  const area = AREAS[aName];

  const topicBlocks = area.topics.map((topic, tIdx) => {
    const goalLines = topic.goals.map((goalText, gIdx) => {
      const r = responses[rKey(aName, tIdx, "goal", gIdx)];
      if (!r?.score) return null;
      const lines = [`    Goal ${gIdx + 1} (${r.score}/5): ${goalText}`];
      if (r.comment)   lines.push(`      Current state: ${r.comment}`);
      if (r.rationale) lines.push(`      Rationale: ${r.rationale}`);
      return lines.join("\n");
    }).filter(Boolean);
    if (goalLines.length === 0) return null;
    const scored = topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean);
    const avg = (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1);
    return `  Topic: ${topic.name} (avg ${avg}/5)\n${goalLines.join("\n")}`;
  }).filter(Boolean);

  if (topicBlocks.length === 0) return null;

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are a senior CMMI DMM data governance consultant authoring a formal assessment report.

For each topic below, provide three things:

1. NARRATIVE: A concise paragraph (3–5 sentences) that:
   - Characterizes the organization's current maturity based on the goal scores and evidence
   - References specific observations from the assessor comments and rationales
   - Identifies the key gap or risk
   - Uses professional language appropriate for an executive audience
   - Flowing prose only — no bullets, headers, or markdown

2. RECOMMENDATION: One specific, actionable recommendation (max 25 words) that directly addresses the most critical gap revealed by the goal-level evidence. Ground it in the specific comments and rationales provided.

3. PRIORITY: "high" if avg score < 1.8, "medium" if < 2.5, "low" if ≥ 2.5

AREA: ${aName}
${topicBlocks.join("\n\n")}

Return ONLY a valid JSON object. No preamble, no markdown fences. Structure:
{ "Topic Name": { "narrative": "paragraph text", "recommendation": "actionable recommendation text", "priority": "high|medium|low" } }`
      }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.content.map(c => c.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

async function generateAreaSummaries(responses) {
  const results = await Promise.allSettled(
    Object.keys(AREAS).map(aName =>
      generateSingleAreaSummary(aName, responses).then(result => ({ aName, result }))
    )
  );

  const areaSummaries = {};
  results.forEach(r => {
    if (r.status === "fulfilled" && r.value?.result) {
      areaSummaries[r.value.aName] = r.value.result;
    } else if (r.status === "rejected") {
      console.error("Area summary failed:", r.reason?.message || r.reason);
    }
  });

  return Object.keys(areaSummaries).length > 0 ? areaSummaries : null;
}

// ─── Report Overlay ───────────────────────────────────────────────────────────
async function generateAISummary(user, responses) {
  const stats = getStats(responses);

  // Compact digest: area averages + topic scores only (no full goal text or rationales)
  const digest = Object.entries(AREAS).map(([aName, area]) => {
    const ts = getTopicScores(aName, responses).filter(t => t.score > 0);
    if (ts.length === 0) return null;
    const avg = (ts.reduce((a, b) => a + b.score, 0) / ts.length).toFixed(1);
    const topicLines = ts.map(t => `  • ${t.name}: ${t.score.toFixed(1)}/5`).join("\n");
    return `${aName} (avg ${avg}/5):\n${topicLines}`;
  }).filter(Boolean).join("\n\n");

  const overallAvg = stats.avg ? stats.avg.toFixed(1) : "N/A";

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are a senior data governance advisor preparing a formal executive assessment narrative for a client report. Based on the CMMI DMM assessment results below, write a polished 3–4 paragraph executive summary in natural language.

Organization: ${user.org}
Assessor: ${user.name}${user.role ? ` (${user.role})` : ""}
Overall Maturity Score: ${overallAvg}/5.0 (CMMI 1–5 scale)
Goals Scored: ${stats.scoredGoals} of ${stats.totalGoals}

ASSESSMENT RESULTS:
${digest}

Write the narrative with these guidelines:
- Open with a concise overall characterization of the organization's data management maturity
- Highlight 2–3 relative strengths (highest scoring areas/topics) with specific supporting observations
- Identify 2–3 priority gaps or improvement areas (lowest scoring), framing them constructively as opportunities
- Close with a forward-looking paragraph on recommended focus areas to advance maturity
- Use a professional, authoritative tone appropriate for a C-suite or board-level audience
- Do NOT use bullet points, headers, or markdown — write in flowing prose paragraphs only
- Do NOT mention CMMI level numbers directly; instead use their labels (Performed, Managed, Defined, Measured, Optimized) where relevant`
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`Anthropic error: ${data.error.message || JSON.stringify(data.error)}`);
  if (!data.content) throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  return data.content.map(c => c.text || "").join("").trim();
}

async function generateRecommendations(user, responses) {
  const stats = getStats(responses);

  const scoreSummary = Object.entries(AREAS).map(([aName, area]) => {
    const ts = getTopicScores(aName, responses).filter(t => t.score > 0);
    const avg = ts.length > 0 ? (ts.reduce((a,b) => a + b.score, 0) / ts.length).toFixed(1) : null;
    const topicLines = ts.map(t => `  - ${t.name}: ${t.score.toFixed(1)}/5`).join("\n");
    return avg ? `${aName} (avg ${avg}/5):\n${topicLines}` : null;
  }).filter(Boolean).join("\n\n");

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `You are a senior data governance consultant at NTT DATA preparing a prioritized recommendation plan for a client's CMMI DMM assessment report.

Organization: ${user.org}
Overall Maturity Score: ${stats.avg ? stats.avg.toFixed(1) : "N/A"}/5.0

AREA AND TOPIC SCORES:
${scoreSummary}

Generate 6–8 specific, actionable recommendations based on the lowest-scoring areas and most impactful improvement opportunities. Focus on practical steps this organization can actually take.

Respond ONLY with a valid JSON array. No preamble, no markdown, no explanation. Each object must have exactly these fields:
- "title": short recommendation title (max 8 words)
- "area": the primary CMMI DMM area it addresses
- "description": 2–3 sentence description of the specific action to take (concrete and realistic)
- "business_value": 1–2 sentences on the tangible business outcome or risk reduction this delivers
- "effort": integer 1–5 (1=very low effort, 5=very high effort)
- "value": integer 1–5 (1=low business value, 5=very high business value)

Calibrate effort and value scores realistically — not everything should be high value. Spread scores across the matrix so the payoff chart is meaningful.`
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`Anthropic error: ${data.error.message || JSON.stringify(data.error)}`);
  if (!data.content) throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  const raw = data.content.map(c => c.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─── Print Helpers ────────────────────────────────────────────────────────────
function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function openPrintWindow(html, title) {
  const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
<style>
  @media print { @page { margin:14mm 8mm 16mm; size:A4; } @page { @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: 'Outfit', sans-serif; font-size: 9pt; color: #94a3b8; } } body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; } }
  * { box-sizing:border-box; } body { margin:0; padding:0; background:white; font-family:'Outfit',sans-serif; }
</style></head><body>${html}
<script>window.addEventListener('load',function(){ setTimeout(function(){ window.print(); },2500); });<\/script>
</body></html>`;
  const blob = new Blob([full], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) alert("Please allow popups for this site, then try again.");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Full assessment report
function printReport(html) { openPrintWindow(html, `${dateStamp()}_NTT_DATA_Assessment`); }

// Standalone recommendations PDF — simple flat HTML, no complex layout
function printRecsOnly(recs, user) {
  if (!recs || !recs.length) return;
  const priorityColor = (effort, value) => {
    if (value >= 3 && effort <= 3) return { color: "#068941", bg: "#E0F5EC", label: "Quick Win" };
    if (value >= 3 && effort > 3)  return { color: "#0072BC", bg: "#DAEEF9", label: "Strategic Investment" };
    if (value < 3  && effort <= 3) return { color: "#CC7700", bg: "#FFF5CC", label: "Fill-in" };
    return { color: "#94a3b8", bg: "#f8fafc", label: "Deprioritize" };
  };
  const effortLabel = e => ["","Low","Low-Med","Medium","Med-High","High"][e] || "Medium";
  const valueLabel  = v => ["","Low","Low-Med","Medium","Med-High","High"][v] || "Medium";
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  const cards = recs.map((r, i) => {
    const p = priorityColor(r.effort, r.value);
    return `<div style="margin:0 0 10px;padding:14px 16px;border-left:4px solid ${p.color};border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background:#fafafa;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div style="display:flex;gap:8px;align-items:flex-start;flex:1;">
          <span style="background:${p.color};color:white;font-size:10px;font-weight:700;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Outfit',sans-serif;">${i+1}</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;">${r.title}</div>
            <div style="font-size:10px;color:#94a3b8;font-family:'Outfit',sans-serif;">${r.area}</div>
          </div>
        </div>
        <span style="background:${p.bg};color:${p.color};font-size:10px;font-weight:700;padding:2px 8px;white-space:nowrap;font-family:'Outfit',sans-serif;">${p.label}</span>
      </div>
      <p style="margin:0 0 8px;font-size:11.5px;color:#334155;line-height:1.6;font-family:'Outfit',sans-serif;">${r.description}</p>
      <div style="background:white;padding:7px 10px;border:1px solid #e2e8f0;margin-bottom:6px;">
        <div style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:1px;margin-bottom:2px;font-family:'Outfit',sans-serif;">BUSINESS VALUE</div>
        <div style="font-size:11px;color:#334155;line-height:1.5;font-family:'Outfit',sans-serif;">${r.business_value}</div>
      </div>
      <div style="font-size:10px;color:#64748b;font-family:'Outfit',sans-serif;">Effort: <strong>${effortLabel(r.effort)}</strong> &nbsp; Value: <strong>${valueLabel(r.value)}</strong></div>
    </div>`;
  }).join("");

  const matrixSVG = payoffMatrixSVG(recs, 460);
  const legendHTML = [
    ["#068941","#E0F5EC","Quick Win"],
    ["#0072BC","#DAEEF9","Strategic Investment"],
    ["#CC7700","#FFF5CC","Fill-in"],
    ["#94a3b8","#f1f5f9","Deprioritize"]
  ].map(([c,bg,l]) =>
    `<div style="display:inline-flex;align-items:center;gap:5px;background:${bg};padding:3px 9px;margin:2px;">
      <span style="width:9px;height:9px;background:${c};display:inline-block;flex-shrink:0;"></span>
      <span style="font-size:10px;font-weight:700;color:${c};font-family:'Outfit',sans-serif;">${l}</span>
    </div>`
  ).join("");

  const html = `
    <div style="padding:48px 52px 24px;font-family:'Outfit',sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #e2e8f0;padding-bottom:16px;margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;color:#0072BC;letter-spacing:1px;">NTT DATA</div>
        <div style="font-size:10px;color:#94a3b8;letter-spacing:1.5px;font-weight:700;">CMMI DMM ASSESSMENT REPORT</div>
      </div>
      <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:2px;margin-bottom:4px;">RECOMMENDATIONS</div>
      <div style="font-size:26px;font-weight:700;color:#0f172a;margin-bottom:4px;">Prioritized Action Plan</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:20px;">${user.org} &nbsp;·&nbsp; ${date}</div>
      <div style="padding:18px 20px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:24px;">
        <div style="font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin-bottom:12px;font-family:'Outfit',sans-serif;">VALUE vs. EFFORT PAYOFF MATRIX</div>
        <div style="display:flex;justify-content:center;">${matrixSVG}</div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;margin-top:10px;">${legendHTML}</div>
      </div>
      ${cards}
    </div>`;

  openPrintWindow(html, `${dateStamp()}_NTT_DATA_Action_Plan`);
}

function ReportOverlay({ user, responses, onClose, cachedSummary, cachedRecs, cachedAreaSummaries, cachedProjectedScores, onSummaryGenerated, onRecsGenerated, onAreaSummariesGenerated, onProjectedScoresGenerated }) {
  const [status, setStatus] = useState("generating");
  const [errorMsg, setErrorMsg] = useState("");
  const [aiError, setAiError] = useState("");
  const [includeRecs, setIncludeRecs] = useState(true);
  const [html, setHtml] = useState("");
  const summaryRef         = useRef(null);
  const recsRef            = useRef(null);
  const areaSummariesRef   = useRef(null);
  const projectedScoresRef = useRef(null);

  const rebuild = (summary, recs, withRecs, areaSummaries, projectedScores) => {
    try {
      setHtml(buildReportHTML(user, responses, summary, withRecs ? recs : null, areaSummaries, projectedScores));
    } catch (e) {
      console.error("buildReportHTML failed:", e);
      setErrorMsg(e.message || String(e));
      setStatus("error");
    }
  };

  useEffect(() => {
    try {
      setHtml(buildReportHTML(user, responses, null, null, null, null));
    } catch (e) {
      setErrorMsg(e.message || String(e));
      setStatus("error");
      return;
    }

    // If all four cached values exist, skip all API calls
    if (cachedSummary && cachedRecs && cachedAreaSummaries && cachedProjectedScores) {
      summaryRef.current         = cachedSummary;
      recsRef.current            = cachedRecs;
      areaSummariesRef.current   = cachedAreaSummaries;
      projectedScoresRef.current = cachedProjectedScores;
      try {
        setHtml(buildReportHTML(user, responses, cachedSummary, null, cachedAreaSummaries, cachedProjectedScores));
        setStatus("ready");
      } catch (e) {
        setErrorMsg(e.message || String(e));
        setStatus("error");
      }
      return;
    }

    const summaryCall      = cachedSummary          ? Promise.resolve(cachedSummary)          : generateAISummary(user, responses);
    const recsCall         = cachedRecs              ? Promise.resolve(cachedRecs)              : generateRecommendations(user, responses);
    const areaSummaryCall  = cachedAreaSummaries     ? Promise.resolve(cachedAreaSummaries)     : generateAreaSummaries(responses);
    const projectionCall   = cachedProjectedScores   ? Promise.resolve(cachedProjectedScores)   : generateProjectedScores(responses);

    Promise.allSettled([summaryCall, recsCall, areaSummaryCall, projectionCall]).then(([sRes, rRes, asRes, pRes]) => {
      const summary        = (sRes.status  === "fulfilled" && sRes.value)  ? sRes.value  : null;
      const recs           = (rRes.status  === "fulfilled" && rRes.value)  ? rRes.value  : null;
      const areaSummaries  = (asRes.status === "fulfilled" && asRes.value) ? asRes.value : null;
      const projectedScores = (pRes.status === "fulfilled" && pRes.value)  ? pRes.value  : null;

      if (sRes.status  === "rejected") { console.error("AI summary error:",      sRes.reason?.message  || sRes.reason);  setAiError(`Summary failed: ${sRes.reason?.message || "unknown"}`); }
      if (rRes.status  === "rejected") console.error("AI recs error:",           rRes.reason?.message  || rRes.reason);
      if (asRes.status === "rejected") console.error("AI area summaries error:", asRes.reason?.message || asRes.reason);
      if (pRes.status  === "rejected") console.error("AI projections error:",    pRes.reason?.message  || pRes.reason);

      summaryRef.current         = summary;
      recsRef.current            = recs;
      areaSummariesRef.current   = areaSummaries;
      projectedScoresRef.current = projectedScores;

      if (summary        && !cachedSummary         && onSummaryGenerated)         onSummaryGenerated(summary);
      if (recs           && !cachedRecs            && onRecsGenerated)            onRecsGenerated(recs);
      if (areaSummaries  && !cachedAreaSummaries   && onAreaSummariesGenerated)   onAreaSummariesGenerated(areaSummaries);
      if (projectedScores && !cachedProjectedScores && onProjectedScoresGenerated) onProjectedScoresGenerated(projectedScores);

      try {
        setHtml(buildReportHTML(user, responses, summary, null, areaSummaries, projectedScores));
        setStatus("ready");
      } catch (e) {
        console.error("buildReportHTML (with AI) failed:", e);
        setErrorMsg(e.message || String(e));
        setStatus("error");
      }
    }).catch(e => {
      console.error("Unexpected error in report generation:", e);
      setErrorMsg(e.message || String(e));
      setStatus("error");
    });

    return () => { const el = document.getElementById("dmm-print-style"); if (el) el.remove(); };
  }, []);

  const handleToggle = (val) => {
    setIncludeRecs(val);
    if (status === "ready") rebuild(summaryRef.current, null, false, areaSummariesRef.current, projectedScoresRef.current);
  };

  // ── Error screen ─────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div id="dmm-report-overlay" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f0f4f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 40 }}>
        <div style={{ maxWidth: 560, width: "100%", background: "white", borderRadius: 16, padding: "40px 44px", boxShadow: "0 8px 40px rgba(0,0,0,.12)", border: "1.5px solid #fee2e2" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Fraunces', serif" }}>Report Generation Failed</h2>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Something went wrong while building the report. This is usually caused by a missing or invalid Anthropic API key, or a network issue reaching the API.</p>
          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", letterSpacing: 1, marginBottom: 4 }}>ERROR DETAILS</div>
              <code style={{ fontSize: 12, color: "#991b1b", fontFamily: "monospace", wordBreak: "break-all" }}>{errorMsg}</code>
            </div>
          )}
          <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>Open your browser's Developer Tools (F12 → Console tab) for full details. Confirm your Anthropic API key was set correctly when the app was built — see Step 4c of the deployment guide.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setStatus("generating"); setErrorMsg(""); setHtml(""); }}
              style={{ background: "linear-gradient(135deg,#0072BC,#009AA4)", border: "none", borderRadius: 9, padding: "10px 22px", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
            >↺ Try Again</button>
            <button
              onClick={onClose}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 9, padding: "10px 20px", color: "#475569", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}
            >✕ Close</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal overlay ────────────────────────────────────────────────────────────
  return (
    <div id="dmm-report-overlay" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f0f4f8", overflowY: "auto", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @media print { #dmm-report-overlay { position:static!important; overflow:visible!important; } }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "rgba(7,15,38,.97)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, animation: "slideUp .25s ease" }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <NttLogoWhite height={20} />
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.15)" }} />
          <span style={{ color: "#7BCFFF", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>REPORT PREVIEW</span>
          {status === "generating" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(25,163,252,.12)", border: "1px solid rgba(25,163,252,.25)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 10, height: 10, border: "2px solid rgba(25,163,252,.3)", borderTop: "2px solid #19A3FC", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <span style={{ color: "#7BCFFF", fontSize: 11, animation: "pulse 1.5s ease infinite" }}>Generating AI content…</span>
            </div>
          )}
          {aiError && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(178,32,0,.2)", border: "1px solid rgba(178,32,0,.4)", borderRadius: 20, padding: "4px 12px", maxWidth: 420 }}>
              <span style={{ color: "#ff9980", fontSize: 11 }}>⚠ AI failed — {aiError}</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => printReport(html)}
            disabled={status !== "ready"}
            style={{ display: "flex", alignItems: "center", gap: 8, background: status !== "ready" ? "rgba(0,114,188,.4)" : "linear-gradient(135deg,#0072BC,#009AA4)", border: "none", borderRadius: 9, padding: "9px 20px", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: status !== "ready" ? "not-allowed" : "pointer", opacity: status !== "ready" ? 0.6 : 1, whiteSpace: "nowrap" }}
          >
            🖨 Print Assessment
          </button>
          <button
            onClick={() => printRecsOnly(recsRef.current, user)}
            disabled={status !== "ready" || !recsRef.current}
            title="Export just the Prioritized Action Plan as a standalone PDF"
            style={{ display: "flex", alignItems: "center", gap: 8, background: status !== "ready" || !recsRef.current ? "rgba(6,137,65,.3)" : "linear-gradient(135deg,#068941,#00a86b)", border: "none", borderRadius: 9, padding: "9px 20px", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: status !== "ready" || !recsRef.current ? "not-allowed" : "pointer", opacity: status !== "ready" || !recsRef.current ? 0.5 : 1, whiteSpace: "nowrap" }}
          >
            📋 Print Action Plan
          </button>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: "9px 16px", color: "rgba(255,255,255,.6)", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}
          >✕ Close</button>
        </div>
      </div>

      {/* Report — shows static content immediately, updates when AI finishes */}
      <div style={{ background: "white", maxWidth: 900, margin: "56px auto 40px", boxShadow: "0 8px 40px rgba(0,0,0,.12)", borderRadius: 4 }}>
        {html ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            {status === "generating" && (
              <div style={{ padding: "20px 40px", background: "linear-gradient(135deg,#070F26,#0A1E3D)", display: "flex", alignItems: "center", gap: 14, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(25,163,252,.3)", borderTop: "2px solid #19A3FC", borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "#7BCFFF", fontSize: 13, margin: 0 }}>AI narrative &amp; recommendations generating — report will update automatically when ready…</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "60px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(0,114,188,.15)", borderTop: "3px solid #0072BC", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Building report…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Topic Recs Generator ─────────────────────────────────────────────────────

// ─── Dashboard Summary ────────────────────────────────────────────────────────
function Dashboard({ responses, onNavigate, user, onExport }) {
  const stats = getStats(responses);
  const areaList = getAllAreaScores(responses);
  const overallLevel = stats.avg ? Math.round(stats.avg) : null;
  const overallCmmi = overallLevel ? CMMI[overallLevel] : null;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
          Assessment Dashboard
        </div>
        <div style={{ fontSize: 14, color: "#64748B" }}>
          {user.org} · CMMI DMM Maturity Overview
        </div>
      </div>

      {/* Top KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {/* Overall score */}
        <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#94A3B8", marginBottom: 10 }}>OVERALL SCORE</div>
          {stats.avg ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: overallCmmi?.color }}>{stats.avg.toFixed(1)}</span>
              <span style={{ fontSize: 14, color: "#94A3B8" }}>/ 5.0</span>
            </div>
          ) : (
            <div style={{ fontSize: 24, fontWeight: 700, color: "#CBD5E1" }}>—</div>
          )}
          {overallCmmi && (
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: overallCmmi.bg, borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: overallCmmi.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: overallCmmi.color }}>{overallCmmi.label}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#94A3B8", marginBottom: 10 }}>COMPLETION</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#0072BC" }}>{stats.pct}%</span>
          </div>
          <div style={{ marginTop: 8, background: "#EFF6FF", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${stats.pct}%`, background: "linear-gradient(90deg, #0072BC, #009AA4)", height: "100%", borderRadius: 4, transition: "width .6s" }} />
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{stats.scoredGoals} of {stats.totalGoals} goals scored</div>
        </div>

        {/* Areas summary */}
        <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#94A3B8", marginBottom: 10 }}>AREAS ASSESSED</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#0F172A" }}>
              {areaList.filter(a => a.score > 0).length}
            </span>
            <span style={{ fontSize: 14, color: "#94A3B8" }}>/ {areaList.length}</span>
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
            {areaList.filter(a => a.score > 0).length === areaList.length
              ? "All areas have scores"
              : `${areaList.length - areaList.filter(a => a.score > 0).length} area(s) pending`}
          </div>
        </div>
      </div>

      {/* Radar + Area cards */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* Radar */}
        <div style={{ background: "#070F26", borderRadius: 14, padding: "20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: 1.2, marginBottom: 10 }}>MATURITY RADAR</div>
          <MasterRadarChart responses={responses} />
        </div>

        {/* Area score cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {areaList.map(({ area, score, color }) => {
            const lvl = score > 0 ? Math.round(score) : null;
            const cmmi = lvl ? CMMI[lvl] : null;
            const areaProgress = stats.areaStats[area];
            const pct = areaProgress?.total > 0 ? Math.round((areaProgress.scored / areaProgress.total) * 100) : 0;
            return (
              <button
                key={area}
                onClick={() => onNavigate(area)}
                style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, transition: "box-shadow .15s, border-color .15s", fontFamily: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor = color; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: score > 0 ? color : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>{Object.values(AREAS).find((_, i) => Object.keys(AREAS)[i] === area)?.icon || "📊"}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>{area}</div>
                  <div style={{ background: "#F1F5F9", borderRadius: 3, height: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 3, transition: "width .6s" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {score > 0 ? (
                    <>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cmmi?.color }}>{score.toFixed(1)}</div>
                      <div style={{ fontSize: 11, color: cmmi?.color, fontWeight: 600 }}>{cmmi?.label}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600 }}>Not scored</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export CTA */}
      {stats.scoredGoals > 0 && (
        <div style={{ marginTop: 24, background: "linear-gradient(135deg, #0072BC, #009AA4)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>Ready to export your report?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>Generate a full AI-powered PDF with recommendations and projections.</div>
          </div>
          <button
            onClick={onExport}
            style={{ background: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#0072BC", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
          >
            ⬇ Export PDF Report
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
function MainApp({ user, responses, analyzing, onGoalComment, onQuestionComment, onAnalyze, onLogout, onClearAICache }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [showReport, setShowReport] = useState(false);
  const [reportSummary, setReportSummary] = useState(null);
  const [reportRecs, setReportRecs] = useState([]);
  const [reportAreaSummaries, setReportAreaSummaries] = useState({});
  const [reportProjectedScores, setReportProjectedScores] = useState(null);

  // Expose cache-clear to parent
  useEffect(() => {
    if (onClearAICache) {
      onClearAICache(() => {
        setReportSummary(null);
        setReportRecs([]);
        setReportAreaSummaries({});
        setReportProjectedScores(null);
      });
    }
  }, [onClearAICache]);

  const stats = getStats(responses);
  const overallLevel = stats.avg ? Math.round(stats.avg) : null;
  const overallCmmi = overallLevel ? CMMI[overallLevel] : null;

  // Load cached report AI content from storage on mount
  useEffect(() => {
    (async () => {
      try { const s = await window.storage.get("dmm_report_summary");          if (s?.value) setReportSummary(s.value); } catch (e) {}
      try { const r = await window.storage.get("dmm_report_recs");             if (r?.value) { const p = JSON.parse(r.value); if (Array.isArray(p)) setReportRecs(p); } } catch (e) {}
      try { const a = await window.storage.get("dmm_report_area_summaries");   if (a?.value) { const p = JSON.parse(a.value); if (p && typeof p === "object") setReportAreaSummaries(p); } } catch (e) {}
      try { const j = await window.storage.get("dmm_report_projections");      if (j?.value) { const p = JSON.parse(j.value); if (p && typeof p === "object") setReportProjectedScores(p); } } catch (e) {}
    })();
  }, []);

  const navItem = (label, view, icon, color) => {
    const active = activeView === view;
    return (
      <button key={view} onClick={() => setActiveView(view)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: "none", background: active ? "rgba(255,255,255,.1)" : "none", color: active ? "white" : "rgba(255,255,255,.45)", fontFamily: "inherit", fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: "pointer", width: "100%", textAlign: "left", transition: "all .15s" }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: active ? color : "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "background .15s", flexShrink: 0 }}>{icon}</span>
        {label}
        {view !== "dashboard" && stats.areaStats[view]?.scored > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 10, background: "rgba(255,255,255,.12)", borderRadius: 20, padding: "2px 7px", color: "rgba(255,255,255,.7)" }}>
            {stats.areaStats[view]?.avg ? stats.areaStats[view].avg.toFixed(1) : "—"}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Outfit', sans-serif", background: "#F0F4F8" }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 240, background: "#070F26", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        {/* Brand */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ marginBottom: 14 }}>
            <NttLogoWhite height={22} />
          </div>
          <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ color: "white", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{user.name}</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{user.org}</div>
            {user.role && <div style={{ color: "rgba(165,180,252,.6)", fontSize: 11, marginTop: 2 }}>{user.role}</div>}
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>OVERALL PROGRESS</span>
            <span style={{ fontSize: 11, color: "#19A3FC", fontWeight: 700 }}>{stats.pct}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 4, height: 4 }}>
            <div style={{ width: `${stats.pct}%`, background: "linear-gradient(90deg, #0072BC, #009AA4)", height: 4, borderRadius: 4, transition: "width .6s ease" }} />
          </div>
          {stats.avg && <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 6 }}>Avg score: <strong style={{ color: "rgba(255,255,255,.7)" }}>{stats.avg.toFixed(1)}</strong> / 5.0</div>}
        </div>

        {/* Nav */}
        <div style={{ padding: "14px 10px", flex: 1 }}>
          {navItem("Dashboard", "dashboard", "◉", "#0072BC")}
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.2)", letterSpacing: 1.5, padding: "12px 14px 6px" }}>ASSESSMENT AREAS</div>
          {Object.entries(AREAS).map(([name, area]) => navItem(name, name, area.icon, area.color))}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => setShowReport(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,114,188,.2)", border: "1px solid rgba(0,114,188,.3)", borderRadius: 8, padding: "8px 12px", color: "#7BCFFF", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", width: "100%", transition: "background .15s" }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(0,114,188,.35)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(0,114,188,.2)"}
          >
            <span>⬇</span> Export PDF Report
          </button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "left" }}>← Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeView === "dashboard"
          ? <Dashboard responses={responses} onNavigate={v => setActiveView(v)} user={user} onExport={() => setShowReport(true)} />
          : <AssessmentView
              areaName={activeView}
              responses={responses}
              analyzing={analyzing}
              onGoalComment={onGoalComment}
              onQuestionComment={onQuestionComment}
              onAnalyze={onAnalyze}
            />
        }
      </div>

      {/* Report overlay */}
      {showReport && (
        <ReportOverlay
          user={user}
          responses={responses}
          onClose={() => setShowReport(false)}
          cachedSummary={reportSummary}
          cachedRecs={reportRecs}
          cachedAreaSummaries={reportAreaSummaries}
          cachedProjectedScores={reportProjectedScores}
          onSummaryGenerated={s => {
            setReportSummary(s);
            try { window.storage.set("dmm_report_summary", s); } catch (e) {}
          }}
          onRecsGenerated={r => {
            setReportRecs(r);
            try { window.storage.set("dmm_report_recs", JSON.stringify(r)); } catch (e) {}
          }}
          onAreaSummariesGenerated={a => {
            setReportAreaSummaries(a);
            try { window.storage.set("dmm_report_area_summaries", JSON.stringify(a)); } catch (e) {}
          }}
          onProjectedScoresGenerated={p => {
            setReportProjectedScores(p);
            try { window.storage.set("dmm_report_projections", JSON.stringify(p)); } catch (e) {}
          }}
        />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [responses, setResponses] = useState({});
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await window.storage.get("dmm_user");
        if (u) setUser(JSON.parse(u.value));
        const r = await window.storage.get("dmm_responses");
        if (r) setResponses(JSON.parse(r.value));
      } catch (e) {}
      setScreen(user ? "app" : "login");
    })();
  }, []);

  // Recheck screen after user loads
  useEffect(() => {
    if (screen === "loading") {
      if (user !== null) setScreen("app");
      else setScreen("login");
    }
  }, [user, screen]);

  const clearAICacheRef = useRef(null);

  const saveResponses = async (r) => {
    setResponses(r);
    try { await window.storage.set("dmm_responses", JSON.stringify(r)); } catch (e) {}
    // Invalidate all cached AI content so it reflects new scores
    try { await window.storage.delete("dmm_report_summary"); } catch (e) {}
    try { await window.storage.delete("dmm_report_recs"); } catch (e) {}
    try { await window.storage.delete("dmm_report_area_summaries"); } catch (e) {}
    try { await window.storage.delete("dmm_report_projections"); } catch (e) {}
    // Also clear in-memory recs in MainApp
    if (clearAICacheRef.current) clearAICacheRef.current();
  };

  const handleLogin = async (name, org, role) => {
    const u = { name, org, role };
    setUser(u);
    setScreen("app");
    try { await window.storage.set("dmm_user", JSON.stringify(u)); } catch (e) {}
    // Pre-populate sample data if no responses have been saved yet
    try {
      const existing = await window.storage.get("dmm_responses");
      if (!existing) {
        setResponses(SAMPLE_DATA);
        await window.storage.set("dmm_responses", JSON.stringify(SAMPLE_DATA));
      }
    } catch (e) {
      setResponses(SAMPLE_DATA);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setScreen("login");
    try { await window.storage.delete("dmm_user"); } catch (e) {}
  };

  const handleGoalComment = (area, tIdx, gIdx, val) => {
    const k = rKey(area, tIdx, "goal", gIdx);
    saveResponses({ ...responses, [k]: { ...responses[k], comment: val } });
  };

  const handleQuestionComment = (area, tIdx, qIdx, val) => {
    const k = rKey(area, tIdx, "q", qIdx);
    saveResponses({ ...responses, [k]: { comment: val } });
  };

  const handleAnalyze = async (area, tIdx, gIdx) => {
    const k = rKey(area, tIdx, "goal", gIdx);
    const comment = responses[k]?.comment || "";
    if (!comment.trim()) return;

    const goalText = AREAS[area].topics[tIdx].goals[gIdx];
    const analyzeKey = `${area}__${tIdx}__${gIdx}`;
    setAnalyzing(analyzeKey);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a CMMI Data Management Maturity (DMM) assessment specialist with deep expertise in evaluating organizational data management capabilities.

CMMI DMM MATURITY SCALE:
• Level 1 — Performed: Processes are ad-hoc, reactive, and inconsistently applied. No formal documentation, repeatable approach, or defined ownership.
• Level 2 — Managed: Processes are planned, documented, and tracked. Basic discipline, accountability, and project-level control exist.
• Level 3 — Defined: Processes are standardized and enforced across the organization with executive sponsorship, consistent methods, and formal training.
• Level 4 — Measured: Processes are quantitatively managed with KPIs and statistical controls. Performance is predictable and data-driven.
• Level 5 — Optimized: Continuous process improvement is systematic and innovation-driven. Industry benchmarks and external best practices are actively incorporated.

GOAL BEING ASSESSED:
${goalText}

ORGANIZATION'S RESPONSE:
${comment}

Carefully evaluate the response. Consider what is explicitly stated, what is implied to be absent or informal, and the maturity indicators in the language used (e.g., "sometimes" vs. "always", "project-level" vs. "organization-wide", "working on" vs. "established and followed").

Respond ONLY with a valid JSON object — no preamble, no markdown:
{"score": <integer 1-5>, "level": "<Performed|Managed|Defined|Measured|Optimized>", "rationale": "<2-3 sentences citing specific evidence from the response that justify the assigned score>"}`
          }]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      if (!data.content) throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const updated = { ...responses, [k]: { ...responses[k], score: parsed.score, rationale: parsed.rationale } };
      saveResponses(updated);
    } catch (e) {
      console.error("AI analysis error:", e);
      alert(`AI analysis failed: ${e.message || e}\n\nCheck that your API key was correctly set when the app was built. See the browser Console (F12) for details.`);
    } finally {
      setAnalyzing(null);
    }
  };

  if (screen === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070F26" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(25,163,252,.2)", borderTop: "3px solid #19A3FC", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;

  return (
    <ErrorBoundary>
      <MainApp
        user={user}
        responses={responses}
        analyzing={analyzing}
        onGoalComment={handleGoalComment}
        onQuestionComment={handleQuestionComment}
        onAnalyze={handleAnalyze}
        onLogout={handleLogout}
        onClearAICache={fn => { clearAICacheRef.current = fn; }}
      />
    </ErrorBoundary>
  );
}
