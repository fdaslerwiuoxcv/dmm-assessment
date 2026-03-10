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
const DMM_RUBRIC = {
  "Data Governance": {
    "Governance Management": [{"score":1.1,"desc":"Data governance functions are performed for at least one project"},{"score":1.2,"desc":"Ownership, stewardship, and accountability for data sets are primarily project-based assignments"},{"score":2.1,"desc":"A defined and documented data governance structure is in place"},{"score":2.2,"desc":"Governance roles, responsibilities, and accountabilites, are established for data subject area by priority, as stated in the business or data strategy"},{"score":2.3,"desc":"Data subject area representatives participate in data governance and associated processes"},{"score":2.4,"desc":"Data governance follows defined policies, processes, and standards"},{"score":2.5,"desc":"A review process is established and followed to evaluate and improve data governance"},{"score":3.1,"desc":"An organization-wide data governance structure and rollout plan is established with executive sponsorship"},{"score":3.2,"desc":"Executive level organization-wide data governance is operational for the organization's high-priority subject areas"},{"score":3.3,"desc":"Data governance includes representatives from all business units, which are suppliers or consumers of high-priority data subject areas"},{"score":3.4,"desc":"Standard data governance policies and processes are followed"},{"score":3.5,"desc":"Data governance determines and approves appropriate metrics to evaluate effectiveness of governance activities"},{"score":3.6,"desc":"An evaluation process is established for refining data governance to align with changing business priorities and to expand as needed to encompass new functions and domains"},{"score":3.7,"desc":"Classroom, mentoring, e-learning, or on-the-job training in data governance processes is required for new governance members and other stakeholders"},{"score":3.8,"desc":"Data governance activities and results are analyzed against objectives periodically and reported to executive management"},{"score":4.1,"desc":"Statistical and other quantitative techniques are applied to determine if governance efforts are changing organizational  behaviors appropriately"},{"score":4.2,"desc":"Adjustments to data governance activities and structure are made based on analysis results"},{"score":5.1,"desc":"External governance structures and industry case studies are evaluated for best practices and lessons, providing ideas for improvements"},{"score":5.2,"desc":"The data governance structure is communicated to the peer industry as a model of best practice"},{"score":5.3,"desc":"Data governance processes are continually refined and improved"}],
    "Business Glossary": [{"score":1.1,"desc":"Business terms are defined for a particular purpose"},{"score":1.2,"desc":"Logical data models are created with reference to defined and approved business terms"},{"score":2.1,"desc":"A process is established, documented, and followed to define, manage, use, and maintain the business glossary"},{"score":2.2,"desc":"Standard business terms are readily available and promulgated to relevant stakeholders"},{"score":2.3,"desc":"Each business term added to the business glossary has a unique name and unique definition"},{"score":2.4,"desc":"New development, data integration, and data consolidation efforts apply standard business terms as part of the data requirements definition process"},{"score":3.1,"desc":"The organization uses the approved business glossary in the development of shared repositories, data transfer standards (e.g., XML), ontologies, semantic models, and similar initiatives involving corporate  data"},{"score":3.2,"desc":"Organization-wide access data governance for compliance with the business glossary process is implemented and followed"},{"score":3.3,"desc":"The organization has implemented a mechanism to facilitate transformation by mapping between business terms, attributes, and physical data element names or synonyms"},{"score":3.4,"desc":"Impact assessments are conducted, and governance approval is obtained, prior to implementing changes to business terms"},{"score":3.5,"desc":"Metrics are captured and used to evaluate the organization's progress toward a comprehensive business glossary"},{"score":3.6,"desc":"Compliance monitoring processes are used to verify correct use of business terms, highlight exceptions, and ensure they are addressed"},{"score":4.1,"desc":"Statistical and other quantitative techniques are used to manage the process and develop reporting and projections on business glossary integration for senior management"},{"score":4.2,"desc":"The business glossary is integrated into the organization's metadata repository with appropriate access permissions"},{"score":4.3,"desc":"The business glossary uses standard industry business terms and definition as appropriate"},{"score":5.1,"desc":"The business glossary is enhanced to contain assocociated business rules and ontology structures, and is consistent throughout the organization"},{"score":5.2,"desc":"Optimization techniques are employed to improve the process of developing taxonomies, ontologies, or semantic representations levaraging the business glossary"},{"score":5.3,"desc":"The organization publishes white papers and case studies addressing effective managemet of  business terms"}],
    "Metadata Management": [{"score":1.1,"desc":"Metadata documentation is developed, stored, and accessible"},{"score":2.1,"desc":"A metadata management process is established and followed"},{"score":2.2,"desc":"Metadata documentation captures data interdependencies"},{"score":2.3,"desc":"Metadata is developed and used to perform impact analysis on potential data changes"},{"score":2.4,"desc":"Metadata categories, properties, and standards are established and followed"},{"score":3.1,"desc":"A metadata management strategy for the organization is established, promulgated, and maintained by data governance with input from relevant stakeholders"},{"score":3.2,"desc":"The organization's metadata repository is populated with additional categories and classifications of metadata according to a phased implementation plan, and is linked to architecture layers"},{"score":3.3,"desc":"The data management function centralizes metadata management efforts and is overseen by data governance"},{"score":3.4,"desc":"Data governance approves metadata additions and changes"},{"score":3.5,"desc":"Measures and metrics are used to evaluate the accuracy and adoption of metadata"},{"score":3.6,"desc":"Metadata, and any changes to metadata, are validated against the existing architecture"},{"score":4.1,"desc":"The organization has developed an integrated meta-model deployed across all platforms"},{"score":4.2,"desc":"Metadata types and data definitions support consistent import, subscription, and consumption practices"},{"score":4.3,"desc":"The metadata repository extensions include exchange data representation standards used by the organization"},{"score":4.4,"desc":"New metadata management activities are guided by metadata metrics and historical information about metadata"},{"score":4.5,"desc":"Quantitative objectives guide metadata management and support process performance"},{"score":4.6,"desc":"Statistical analysis reports for process, reporting, and performance are included in the metadata repository and employed to support fact-based decision making for new metadata management initiatives"},{"score":5.1,"desc":"Root cause analysis is conducted to reduce the variations between the repository  information and the data it describes"},{"score":5.2,"desc":"Performance prediction models guide changes in metadata management processes"},{"score":5.3,"desc":"Quantitative metadata improvement objectives are derived from the metadata strategy"},{"score":5.4,"desc":"Planned data changes are evaluated for impact n the metadata repository; and metadata capture, change, and refinement process are continuously improved"}],
  },
  "Data Quality": {
    "Data Quality Strategy": [{"score":1.1,"desc":"Data quality objectives, rules and criteria are documented"},{"score":1.2,"desc":"Business stakeholders participate in setting data quality criteria and objectives"},{"score":1.3,"desc":"Data quality plans are followed; rules are implemented; criteria are monitored"},{"score":2.1,"desc":"A data quality strategy is defined, approved, and managed"},{"score":2.2,"desc":"Business stakeholders participate in creating the data quality strategy"},{"score":2.3,"desc":"The organization has established policies, processes, and guidelines to implement the data quality strategy"},{"score":2.4,"desc":"Data quality requirements are articulated employing data quality dimensions selected by the organization"},{"score":2.5,"desc":"The data quality strategy is created with reference to business objectives and plans, and is approved by executive management"},{"score":2.6,"desc":"Plans to meet the goals and objectives of the data qualit strategy are monitored to evaluate progress"},{"score":3.1,"desc":"The data quality strategy is followed across the organization and is accompanied  by corresponding policies, processes, and guidelines"},{"score":3.2,"desc":"Roles and responsibilities for governance, implementation, and management of data quality practices are defined"},{"score":3.3,"desc":"A defined process for defining benefits and costs for data quality initiatives is employed to guide data quality strategy implementation"},{"score":3.4,"desc":"The policies, processess, and governance contained in the data quality strategy are anchored across the data lifecycle, and corresponding processes are mandated in the system development lifecycle methodology"},{"score":3.5,"desc":"Data quality projects, such as data profiling, data assessments, data cleansing, and risk assessments are aligned with the business needs identified the data quality strategy and the cost-benefit analysis"},{"score":3.6,"desc":"A sequence plan for data quality improvement efforts across the organization is developed, monitored, and maintained"},{"score":4.1,"desc":"Data quality metrics are employed to analyze proposed changes to the data quality strategy"},{"score":4.2,"desc":"Prioritizing data quality issues for remediation or prevention is evaluated quantitively. Priorities are regularly reviewed and adjusted to address changing business objectives"},{"score":4.3,"desc":"Stakeholder reports of data quality issues are systematically collected. Their expectations for improving data quality are included in the data quality strategy, and are measured and monitored"},{"score":4.4,"desc":"The performance of policies, processes, and guidelines, which are defined to support the data quality strategy, are adjusted based on performance metrics analysis results"},{"score":5.1,"desc":"Data quality program milestones and metrics are regularly reviewed by executives, and continuous improvements are implemented"},{"score":5.2,"desc":"The organization shares best practices and successful approaches to improving data quality with industry peers"}],
    "Data Profiling": [{"score":1.1,"desc":"Basic profiling is performed for a data store(s)"},{"score":2.1,"desc":"A data profiling methodology is established and followed"},{"score":2.2,"desc":"Data profiling plans are established for projects"},{"score":2.3,"desc":"Plans for profiling a data store are shared with relevant stakeholdres and governance"},{"score":2.4,"desc":"Data profiling activities are conducted according to the plan, and efforts are adjusted when significant deviations from plan are detected"},{"score":2.5,"desc":"Data profiling results and recommendations are reported to the stakeholders"},{"score":3.1,"desc":"Data profiling methodologies, processes, practices, tools, and results templates have been defined and standardized"},{"score":3.2,"desc":"All techniques identified to meet the profiling objectives are performed"},{"score":3.3,"desc":"Traceability between data requirements, documented metadata, the physical data, and data quality rules is captured and maintained"},{"score":3.4,"desc":"Data governance is engaged to identify core shared data sets and the corresponding data stores that should be regularly profiled and monitored"},{"score":3.5,"desc":"Profiling processes are reusable and deployed across multiple data stores and shared data repositories"},{"score":3.6,"desc":"The SDLC inclues data profiling tasks with tailoring criteria, guidance, and governance"},{"score":4.1,"desc":"Performance of data profiling processes is emasured and used to manage activities across the organization"},{"score":4.2,"desc":"Data profiling efforts include evaluation of the conformity of data content with its approved metadata and standards"},{"score":4.3,"desc":"During a data profiling activity, actual issues are compared to the statistically predicted issues based on historical profiling results"},{"score":4.4,"desc":"Results are centrally stored, systematically monitored, and analyzed with respect to statistics and metrics to provide insight to data quality improvements over time"},{"score":5.1,"desc":"The organization addresses root causes of defects and other issues based on an understanding of the meaning, technical charcteristics, and behavior of the data over time"},{"score":5.2,"desc":"Data profiling processes and other activities are analyzed to identify defects and make improvements based on the quantified expected benefits, estimated costs, and business objectives"},{"score":5.3,"desc":"Real-time or near-real-time automated profiling reports are created for all critical data feeds and repsitories"}],
    "Data Quality Assessment": [{"score":1.1,"desc":"Data quality assessments are performed and results are documented"},{"score":2.1,"desc":"Data quality assessment objectives, targets, and thresholds are established, used and maintained according to standard techniques and processes"},{"score":2.2,"desc":"Data governance determines the key set of attributes by subject area for data quality assessments"},{"score":2.3,"desc":"Data quality assessments are conducted periodically according to an approved frequency per the data quality assessment policy"},{"score":2.4,"desc":"Data quality assessment results include recommendations for remediation with supporting rationale"},{"score":2.5,"desc":"Impact analysis includes estimates of the costs of fixes, the level of effort, characterization of business impact, and tangible and intangible benefits"},{"score":2.6,"desc":"High-level information in data quality assessment reports is traceable to component individual records to support analysis"},{"score":3.1,"desc":"Periodic data quality assessments are conducted in accordannce with data quality policies on an approved schedule, or according to specified event triggers"},{"score":3.2,"desc":"The methods for assessing business impacts, including costs and risks, are defined, approved, and consistently applied across the organization"},{"score":3.3,"desc":"Improvement plans resulting from data quality assessments are integrated at the organization level"},{"score":3.4,"desc":"Data quality is assessed using established thresholds and targets for each selected quality dimension"},{"score":3.5,"desc":"Data quality measurement reporting standards are integrated into the systems development lifecycle and compliance processes"},{"score":4.1,"desc":"Data quality measurement reports are systematically generated based on criticality of attributes and data volitality"},{"score":4.2,"desc":"Data quality operational metadata is standardized, captured, and analyzed using statistical and other quantitative techniques to guide improvements"},{"score":5.1,"desc":"The organization can quantitatively assess the benefits of proposed data changes and refine management priorities in line with data quality governance practices"},{"score":5.2,"desc":"Data quality assessment and reporting processes are continuously reviewed and improved"}],
    "Data Cleansing": [{"score":1.1,"desc":"Data cleansing requirements are defined and performed"},{"score":2.1,"desc":"Data cleansing activities adhere to data cleansing requirements, which are linked to process improvements to achieve business objectives"},{"score":2.2,"desc":"Data cleansing activities conform with data quality requirements (e.g, quality dimensions such as conformity, accuracy, uniqueness) and quality criteria"},{"score":2.3,"desc":"The scope of data cleansing is defined"},{"score":2.4,"desc":"The process for performing data cleansing is defined by a plan"},{"score":2.5,"desc":"A data cleansing policy is established and maintained"},{"score":2.6,"desc":"Methods for correcting the data have been established and are defined within a plan"},{"score":2.7,"desc":"Data cleansing issues are communicated and resolved, when possible, in the internal or external source"},{"score":3.1,"desc":"Data chance history is maintained thorugh cleansing activities"},{"score":3.2,"desc":"Policies, processes, and procedures exist to ensure that data cleansing activities are applied at the point of origination in accordance with published rules"},{"score":3.3,"desc":"Data cleansing rules are applied consistently across the organization"},{"score":3.4,"desc":"A governance group establishes, maintains, and ensures adherence to data cleansing rules"},{"score":3.5,"desc":"Standard data cleansing results report templates, at the detail and summary level, are employed"},{"score":4.1,"desc":"Service level agreements include data quality criteria to hold data providers accountable for cleansed data"},{"score":5.1,"desc":"The organization is involved in the establishment and maintenance of external or industry standards for improving the quality of data content"},{"score":5.2,"desc":"Data cleansing requirements for data providers are managed in accordance with standardized processes"}],
  },
  "Data Mgmt Strategy": {
    "Data Management Strategy": [{"score":1.1,"desc":"Data management objectives, priorities, and scope reflect stakeholder business objectives for at least one project"},{"score":2.1,"desc":"Data management objectives, priorities, and scope are defined and approved"},{"score":2.2,"desc":"Data management objectives and priorities are aligned with business objectives"},{"score":2.3,"desc":"A process for prioritizing projects across a business unit for a data perspective, as well as traceability to business objectices, is established and followed"},{"score":2.4,"desc":"A tactical plan for addressing data management objectices and priorities across the business unit is established and maintained"},{"score":2.5,"desc":"Metrics are used to assess the achievement of objectives for data management"},{"score":3.1,"desc":"A data management strategy representing an organization-wide scope is established, approved, promulgated, and maintained"},{"score":3.2,"desc":"Data management objectives for the organization are evaluated and prioritized against business drivers and goals, and aligned with the business strategy"},{"score":3.3,"desc":"Business and technology collaboratively  develop the organization's data management strategy"},{"score":3.4,"desc":"The sequence plan for implementation of the data management strategy is monitored and updated, based upon progress reviews"},{"score":3.5,"desc":"The organization's data management stragegy is documented, maintained, reviewed, and communicated according to the organization's defined standard process"},{"score":3.6,"desc":"The organization's data management stragegy is consistent with data management policies"},{"score":3.7,"desc":"Metrics are used to assess and monitor achievement of data management objectives"},{"score":4.1,"desc":"Statistical and other quantitive techniques are used to evaluate the effectiveness of strategic data management objectives in achieving business objectives, and modifications are made based on metrics"},{"score":4.2,"desc":"The organization researches innovative business processes and emerging regulatory requirements to ensure that the data management program is compatible with future business needs"},{"score":5.1,"desc":"The organization researches and adopts selected industry best practices for strategy and objectives development"},{"score":5.2,"desc":"Contributions are made to industry best practices for data management strategy development and implementation"}],
    "Communications": [{"score":1.1,"desc":"Communications related to data assets are managed within at least one project"},{"score":2.1,"desc":"The communications plan for data management is defined, documented, approved by stakeholders, and scheduled"},{"score":2.2,"desc":"Data management standards, policies, and processes are communicated and adjusted based upon feedback"},{"score":3.1,"desc":"The communications policy establishes criteria for the dissemination for promulgation of different types of data management communications"},{"score":3.2,"desc":"The communications strategy is guided by an organization-wide policy and adjusted based upon feedback"},{"score":3.3,"desc":"Standards, policies, and processes are promulgated across the organization and adjusted based upon feedback"},{"score":3.4,"desc":"Metrics are developed and used to measure effectiveness of the data management communications"},{"score":3.5,"desc":"Communications are reviewed by stakeholder peers according to a process that is required by defined standards, and processes"},{"score":3.6,"desc":"Metrics are employed to improve data management communications effectiveness"},{"score":4.1,"desc":"Data management communications with external stakeholders are planned and conducted according to  the communications strategy"},{"score":4.2,"desc":"Statistical and other quantitive techniques are employed to improve data management communications"},{"score":5.1,"desc":"External data management communications are made with the purpose of influencing public policies and industry best practices that impact data"}],
    "Data Management Function": [{"score":1.1,"desc":"Data management roles are established for at least one project"},{"score":2.1,"desc":"An approved interaction and engagement model ensures that stakeholders engage with the data management organization"},{"score":2.2,"desc":"Principles are defined and followed to guide the consistency of practices related to data management"},{"score":2.3,"desc":"Roles and responsibilities are specified to support the governance of data management and the interaction between governance and the data management function"},{"score":2.4,"desc":"Agreements are in place that provide explicit expectation for the use of shared staff resources with responsibilities for data management"},{"score":2.5,"desc":"A mechanism exists and is followed to identify and apply needed changes to enhance or redesign the data management function"},{"score":3.1,"desc":"A data management function is established with responsibility for managing activities that support data management objectives"},{"score":3.2,"desc":"The interaction model for the data management function ensures the involvement of data governance for projects that use shared data"},{"score":3.3,"desc":"A data management organization and specified structure are defined and periodically reviewed to ensure that they meet the needs of the organization"},{"score":3.4,"desc":"Data management processes are established and maintained by the data management function with governance approval"},{"score":3.5,"desc":"Data management is an explicitly recognized business function and is leveraged across the organization"},{"score":4.1,"desc":"The data management function has defined tasks that are measured and assessed using statistical and other quantitative techniques"},{"score":4.2,"desc":"Modifications of the data management function and its practices are based on an analysis of indicators using statistical and other quantitative techniques"},{"score":5.1,"desc":"The operational plan for the continuous improvement of data management activities be prioritized"},{"score":5.2,"desc":"Analysis using statistical and other quantitative techniques as well as the use of process performance models leverages data to improve operation efficiency"}],
    "Business Case": [{"score":1.1,"desc":"A business case is developed for project initiatives"},{"score":1.2,"desc":"The benefits and costs of data management are documented and used in local funding decisions"},{"score":2.1,"desc":"The business case methodology is defined and followed"},{"score":2.2,"desc":"Standard business cases support approval decisions for funding data management"},{"score":2.3,"desc":"The data management business case for new initiatives aligns with business objectives and data management objectives"},{"score":3.1,"desc":"The data management business case is developed according to the organization's standard of methodology"},{"score":3.2,"desc":"The business case reflects analysis of the data management program's total cost of ownership, and allocates costs elements to organizations, programs, and projects in accordance with organization's financial accounting methods"},{"score":3.3,"desc":"Data management business cases require executive sponsorship"},{"score":3.4,"desc":"Cost factors compromising data management TCO are managed and tracked across the data management lifecycle"},{"score":3.5,"desc":"Cost and benefit metrics guide data management priorities"},{"score":4.1,"desc":"Data management TCO is employed to measure, evaluate, and fund changes to data management initiatives and infrastructure"},{"score":4.2,"desc":"Statistical and other quantitative techniques are used to analyze data management cost metrics to assess data management TCO and collection methods"},{"score":4.3,"desc":"Data management program performance scorecards include TCO metrics"},{"score":4.4,"desc":"The organization's data management TCO model is validated, checked for accuracy, and enhanced through regular reviews and analysis"},{"score":5.1,"desc":"Statistical results and stakeholder feedback guide continuous improvement of TCO for data management"},{"score":5.2,"desc":"The organization shares TCO best practices to contribute to industry maturity through publications or conference sessions"},{"score":5.3,"desc":"Optimization techniques and predictive models are employed to anticipate results of proposed changes prior to implementation"}],
    "Program Funding": [{"score":1.1,"desc":"At least one data management project has been funded  based on cost-benefit analyses"},{"score":2.1,"desc":"Data management initiatives are financed upon criteria addressed by the business case"},{"score":2.2,"desc":"Stakeholders participate in and support data management program funding"},{"score":2.3,"desc":"Data management costs are mapped to business areas, operational functions, and IT"},{"score":2.4,"desc":"Governance of the funding process is defined and implemented"},{"score":3.1,"desc":"Data management program funding aligns with investment decision-making standards that are consistently employed across the organization"},{"score":3.2,"desc":"Program funding priorities align with the objectives and priorities of data management"},{"score":3.3,"desc":"Defined measures determine the effectiveness of program funding with respect to its objectives and expected benefits"},{"score":4.1,"desc":"Metrics are defined and statistically analyzed to evaluate the effectiveness and accuracy of program funding in meeting organizational objectives"},{"score":5.1,"desc":"Lessons learned form organization-wide program funding for data management are shared with industry peers"},{"score":5.2,"desc":"Optimization techniques and predictive models are employed for analysis of the anticipated results of proposed modifications to program funding methods prior to implementation"}],
  },
  "Data Operations": {
    "Data Requirements Definition": [{"score":1.1,"desc":"Stakeholders review and approve data requirements"},{"score":1.2,"desc":"The business glossary is updated with approved data requirements"},{"score":1.3,"desc":"Data requirements are evaluated and adjudicated against deliverables and either confirmed or modified"},{"score":2.1,"desc":"The data requirements definition process is documented and followed"},{"score":2.2,"desc":"The data requirements necessary to achieve data management goals are define and demonstrably aligned with business objectives"},{"score":2.3,"desc":"The traceability of data requirements to business requirements and objectives is maintained"},{"score":2.4,"desc":"Data requirements are aligned with the corresponding data model(s) and other related artifacts"},{"score":2.5,"desc":"Stakeholder roles and responsibilities for involvement with data requirements definition are specified, planned, monitored, and controlled"},{"score":3.1,"desc":"Data requirements are defined, validated, and integrated using the organization's standard requirements definition framework"},{"score":3.2,"desc":"Data requirements are assessed based on business priorities"},{"score":3.3,"desc":"The business processes that produce data are documented and linked to the data requirements"},{"score":3.4,"desc":"Data requirements comply with and include compliance requirements for both physical and logical data, including security rules as well as technical requirements"},{"score":3.5,"desc":"Requirements are evaluated to ensure that they are implementable in the target environment"},{"score":4.1,"desc":"Industry best practices pertaining to data requirements have been evaluated against selected criteria to determine if they should be adopted into the development lifecycle"},{"score":4.2,"desc":"Defined and managed metrics ensure that data requirements as defined satisfy business objectives; corrective actions are taken when performance is not meeting business needs"},{"score":5.1,"desc":"The organization has implemented continuous process improvement to ensure efficient and consistent prioritization, selection, and verification of data requirements"},{"score":5.2,"desc":"The organization shares best practices with industry and peers regarding data requirements"}],
    "Data Lifecycle Management": [{"score":1.1,"desc":"The data lifecycle for a business process(es) is defined and applied"},{"score":1.2,"desc":"Data dependencies--both upstream and downstream from the initial creation or ingest--have been identified and mapped"},{"score":1.3,"desc":"Stakeholders agree on the scope of data elements and authoritative data sources"},{"score":2.1,"desc":"The requirements of data consumers and producers are mapped and aligned"},{"score":2.2,"desc":"Business process to data mappings are defined, maintained, and periodically reviewed for compliance"},{"score":2.3,"desc":"A defined process for collaborative agreements with respect to shared data and its usage within business processes is followed"},{"score":2.4,"desc":"Selection criteria are defined and applied to designate authoritative data sources"},{"score":2.5,"desc":"The systems development lifecycle process requires reference to and adoption of approved shared data representations and obtaining data from authoritative sources"},{"score":3.1,"desc":"Data lifecycle management processes are defined and approved by stakeholders, and managed by data governance bodies and processes"},{"score":3.2,"desc":"Change management processes addressing the entire data lifecycle are established and maintained"},{"score":3.3,"desc":"Project responsibilties for system development lifecycle activities include mapping data attributes to business processes, shared data sets, sources, and target data sets that are important to the organization"},{"score":3.4,"desc":"Data flows and full data to process lifecycle maps for shared data are implemented for each major business process at the organization level"},{"score":3.5,"desc":"Changes to shared data sets or target data sets for a specific business purpose are managed by data governance structures with relevant stakeholder engagement"},{"score":3.6,"desc":"Designations of authoritative data sources are reviewed and approved by data governance"},{"score":3.7,"desc":"Measures and metrics are defined, and associated information is collected to assess progress in process to data mapping efforts and the adoption of authoritative data sources"},{"score":4.1,"desc":"A standard process is used across the organization for data lifecycle impact analysis, and to identify, estimate, and schedule changes to interfaces and data sets"},{"score":4.2,"desc":"Metrics are used to expand approved shared data resure and eliminate process redundancy"},{"score":5.1,"desc":"Metrics and stakeholder feedback are analyzed periodically for the purpose for introducing improvements into the mangement of data dependencies"},{"score":5.2,"desc":"Data lifecycle metrics are probably refined and reviewed by senior management"},{"score":5.3,"desc":"The organization shares experiences with industry and peers regarding data management lifecycle processes"}],
    "Provider Management": [{"score":1.1,"desc":"Data requirements are translated into data sourcing specifications"},{"score":1.2,"desc":"Analysis and testing are conducted to verify that procured data meet stated requirements"},{"score":2.1,"desc":"A process to analyze data requirements for data sourcing specifications, and mapping requirements to provided data elements, is defined and followed"},{"score":2.2,"desc":"A data procurement process for obtaining data from external providers is defined and followed"},{"score":2.3,"desc":"Data quality criteria are defined and embedded into service level agreements with both external and internal providers"},{"score":2.4,"desc":"Planned discussions are held with data providers to address deviations to established data quality thresholds and target defined in the service level agreement"},{"score":3.1,"desc":"Data governance monitors the standard organization-wide process used to develop data sourcing requirements"},{"score":3.2,"desc":"Metrics for the data sourcing management process are established, maintained, and used"},{"score":3.3,"desc":"Data sourcing evaluation and selection processes are defined and employed across the organization"},{"score":3.4,"desc":"Provider service level agreements are developed based on standard templates and processes, are implemented across the organization, tracked, and enforced"},{"score":3.5,"desc":"Service level agreements are periodically reviewed to assure satisfaction of business objectives and requirements"},{"score":3.6,"desc":"Periodic meetings are held with data providers to review planned changes to data content, processes, formats, quality, etc"},{"score":4.1,"desc":"Key performance metrics related to service level agreements are analyzed using statistical and other quantitative techniques, are reviewed, and are used to identify and address issues"},{"score":4.2,"desc":"Parterning relationships are developed with elected external providers based upon provider evaluation results and anticipated data needs"},{"score":5.1,"desc":"Statistical and other quantitative analyses of the provider processes are applied to improve them and ensure that business objectives are adequately supported"},{"score":5.2,"desc":"Sourcing lessons learned and evolved best practices are shared with industry peers"}],
  },
  "Platform & Architecture": {
    "Architectural Approach": [{"score":1.1,"desc":"A target data architecture aligns business requirements with the implemented data store for at least one project"},{"score":1.2,"desc":"Business and IT stakeholders are identified and involved in architectural decisions"},{"score":1.3,"desc":"Technical capabilities and requirements are defined to guide implementation"},{"score":2.1,"desc":"The target data architecture aligns with and complements the data management strategy"},{"score":2.2,"desc":"A governance process is established and followed to ensure that the target data architecture is jointly rationalized and approved by business and IT stakeholders"},{"score":2.3,"desc":"An architectural transition plan is based upon a mapping between the current data layer components and the future-state environment"},{"score":2.4,"desc":"A process is established and followed to ensure that data interface specifications are documented for shared data, with traceability from creation through consumption (end to end) by all sources within scope"},{"score":2.5,"desc":"A compliance process is established and followed to ensure that projects refer to and utilize the approved target architecture"},{"score":3.1,"desc":"The architectural approach for the target data architecture is followed across the organization"},{"score":3.2,"desc":"A data store rationalization process is performed"},{"score":3.3,"desc":"The target architecture is collaboratively developed and jointly approved by business units, IT and data governance"},{"score":3.4,"desc":"The organization creates and maintains metrics to evaluate progress on state transition and traceability mapping"},{"score":3.5,"desc":"Both internal and selected external data standards are evaluated and applied to the development of architectural blueprints and component designs"},{"score":3.6,"desc":"The architecture, technical requirements, and supporting infrastructure capabilities are aligned"},{"score":3.7,"desc":"The architecture includes the target integration layer, also known as interface design"},{"score":3.8,"desc":"Data profiling is performed prior to finalizing the design of a data store component that will contain existing data"},{"score":4.1,"desc":"Statistical analysis of performance and data quality improvements are used as input to the architectural design process"},{"score":5.1,"desc":"Prediction models are evaluated against architectural changes and adjusted as needed"},{"score":5.2,"desc":"The organization shares architecture and platform lessons learned through publications and conferences"}],
    "Architectural Standards": [{"score":1.1,"desc":"Data architecture standards are defined and followed for at least one project"},{"score":2.1,"desc":"Architectural standards addressing data representations, security, data access, and data provisioning are defined and followed"},{"score":2.2,"desc":"Architectural standards are reviewed with business stakeholders and approved by data governance"},{"score":2.3,"desc":"A process governing requests, approvals, and management of deviations from architectural standards is defined and followed"},{"score":2.4,"desc":"The architectural approach, blueprints, and componenet designs align with selected standards"},{"score":2.5,"desc":"Architectural standards are reviewed periodically against changing business, architectural, and technology needs"},{"score":3.1,"desc":"Architectural standards are followed across the organization"},{"score":3.2,"desc":"External requirements applicable to the organization are included in the data architecture"},{"score":3.3,"desc":"Stakeholder roles and responsibilities for architectural standards include compliance accountability, ownership, and training"},{"score":3.4,"desc":"Data governance ensures that architectural standards are aligned with business needs and aligned with the organization's senior architecture governance body"},{"score":3.5,"desc":"Metrics for monitoring and controlling adoption of, and compliance to, architectural standards are defined and implemented"},{"score":3.6,"desc":"An audit process is developed, documented, and performed for evaluating compliance to architectural standards"},{"score":4.1,"desc":"Audit result metrics and internal deviation patterns indicate where changes to data architecture standards are enhanced guidance for standards application are needed"},{"score":4.2,"desc":"The organization conducts risk-based impact analysis for proposed changes to organizational data architecture standards and guidance prior to acceptance"},{"score":5.1,"desc":"Feedback is provided to external stakeholders on new or proposed changes to data standards"},{"score":5.2,"desc":"The organization contributes to data architecture standards initiatives within its industry"},{"score":5.3,"desc":"The organization researches innovative data technologies and methods for potential adoption, and develops appropriate new standards for those which are deployed"},{"score":5.4,"desc":"The organization shares best standards practices and lessons learned through publications, conferences, and white papers"}],
    "Data Management Platform": [{"score":1.1,"desc":"Data management platforms and componenets are documented for at least one project"},{"score":2.1,"desc":"The platform implementation supports the target objectives set out in the data management strategy"},{"score":2.2,"desc":"A policy and process exists to ensure that build or buy decisions consider the target data architecture and support the data management strategy"},{"score":2.3,"desc":"Platforms are consistent with the technology stack and architectural designs"},{"score":2.4,"desc":"Platforms support the security and access requirements of the organization"},{"score":2.5,"desc":"The executive data governance body advises and consents about major platform decisions"},{"score":3.1,"desc":"Critical data elements for which the platform is an authoritative source, trusted source, or system of record are documented"},{"score":3.2,"desc":"Data set duplication across systems is documented, planned, and justified"},{"score":3.3,"desc":"Platform implementation plans address the scalability, resiliency, and security needed to accommodate changes in anticipated complexity as well as the volume of data and number of users"},{"score":3.4,"desc":"Platform design and capabilities ensure that work flow and service level requirements can be met"},{"score":3.5,"desc":"Plaform performance data is captured, stored, and used to verify that the platform meets business performance needs and capacity requirements"},{"score":3.6,"desc":"The platform contributes its metadata to the organization's metadata repository"},{"score":4.1,"desc":"Qualitative and quantitative performance metrics for the data management platform are analyzed, using statistical and other quantitative techniques, to support platform change decisions"},{"score":5.1,"desc":"Platform improvement objectives are quantitatively expressed and approved by governance"},{"score":5.2,"desc":"The organization continuously improves the platform based on statistical performance data and causal analysis"},{"score":5.3,"desc":"The effects of platform changes are compaared with prediction models and analyzed to improve the prediction models"},{"score":5.4,"desc":"The organization is sharing its experiences related to design, development, deployment, and operation of the data management platform within its industry"}],
    "Data Integration": [{"score":1.1,"desc":"Data integration between systems has been performed and documented"},{"score":2.1,"desc":"Data integration plans are documented"},{"score":2.2,"desc":"The set of data integration disciplines and tools used by the organization provides bulk transport and load, change data capture, versioning and configuration, metadata capture and management, and in-line data quality checks and controls"},{"score":2.3,"desc":"A change control process is established and followed to ensure that changes to the integration environment, including upstream sources and downstream targets, are controlled and coordinated"},{"score":2.4,"desc":"Remediation processes are estabilished and followed to address selected abnormal circumstances"},{"score":2.5,"desc":"Integration verification is performed to ensure that architecture and interfaace specifications are documented and will be met prior to being released into production"},{"score":3.1,"desc":"The organization follows a standard set of practices and rules for performing data integration activities"},{"score":3.2,"desc":"Quality checks are defined as a part of the organizational integration standard and performed as part of data integration processes"},{"score":3.3,"desc":"A standard process is established and followed to create and verify data precedence rules with business users based on use cases, requirements, and selected triggers"},{"score":3.4,"desc":"The development and deployment of integration interfaces are specified in accordance with architectural standards supporting re-use"},{"score":3.5,"desc":"Interface and integration performance metrics are collected and analyzed to identify nonconformance with standards and criteria"},{"score":3.6,"desc":"The organization documents and manages changes to data sources and destination through the data governance process"},{"score":4.1,"desc":"Statistical analysis of integration metrics guides decisions on changes to interfaces and integrations"},{"score":4.2,"desc":"Selected highly shared data is fully integrated, centrally managed, and delivered as needed to integration data stores"},{"score":5.1,"desc":"Performance models for data integration are periodically reviewed, and are used as input for enhancements"},{"score":5.2,"desc":"The organization publishes and shares integration best practices within its industry"}],
    "Historical Data & Retention": [{"score":1.1,"desc":"Historical data is available and used to support business decisions"},{"score":1.2,"desc":"A data store is backed up and data is archived as prescribed in policies"},{"score":2.1,"desc":"Policies mandate management of data history, including retention, destruction, and audit trail requirements"},{"score":2.2,"desc":"A defined method ensures that the historical data necessary to support business needs is accessible"},{"score":2.3,"desc":"Restoration testing is performed on selected archived data"},{"score":2.4,"desc":"Access, transmittal, and modifications to historical and archived data are controlled by policy and processes"},{"score":3.1,"desc":"The organization has a prescribed data warehouse repository that provides access to historical data for meeting analytics needs supporting business processes"},{"score":3.2,"desc":"Data context at any specific point in time can be recreated"},{"score":3.3,"desc":"Policy is defined and approved by data governance and implemented at the organizational level requiring logging of data changes, and retention of the logs"},{"score":3.4,"desc":"An audit program ensures compliance with organizational data logging, archive, and retention policies"},{"score":3.5,"desc":"A feedback mechanism exits with stakeholders and regulators to affirm existing retention and archiving policies"},{"score":4.1,"desc":"Statistical and other quantitative techniques are used to analyze historical data for input to business process and data quality improvements"},{"score":4.2,"desc":"Models are employed to predict compliance with legal and regulatory requirements"},{"score":4.3,"desc":"Metrics results and stakeholder feedback are used to improve data retention and archving policies"},{"score":5.1,"desc":"The organization shares policies and best practices regarding historical data and archiving withing its industry"}],
  },
  "Supporting Processes": {
    "Measurement & Analysis": [{"score":1.1,"desc":"Data management measurement and analysis is performed for at least one project"},{"score":2.1,"desc":"Establish and maintain measurement objectives derived from identified information needs and objectives"},{"score":2.2,"desc":"Specify measures to address measurement objectives"},{"score":2.3,"desc":"Specify how measurement data is obtained and stored"},{"score":2.4,"desc":"Specify how measurement data is analyzed and communicated"},{"score":2.5,"desc":"Obtain specified measurement data and ensure that it meets quality criteria"},{"score":2.6,"desc":"Analyze and interpret measurement data"},{"score":2.7,"desc":"Manage and store measurement data, measurement specifications, and analysis results"},{"score":2.8,"desc":"Communicate results of measurement and analysis activities to all relevant stakeholders"},{"score":3.1,"desc":"Measurement and analysis standards are established and followed"},{"score":3.2,"desc":"Measurement and analysis tailoring guidance is established and used"},{"score":3.3,"desc":"An organizational measurement repository is established and maintained in accordance with usage feedback"},{"score":3.4,"desc":"A data quality program for the measurement repository is established, used, and maintained"},{"score":4.1,"desc":"Process performance is monitored using statistical and other quantitative techniques"},{"score":4.2,"desc":"Understand the root causes for selected issues to address deficiencies in achieving objectives"},{"score":4.3,"desc":"Measures to address measurement objectives are managed"},{"score":4.4,"desc":"The performance of the data management attributes is analyzed and the data management baseline measures are maintained"},{"score":5.1,"desc":"The organization's business performance is managed by using statistical and other quantitative techniques to understand data management shortfalls, and to identify areas for process improvement"},{"score":5.2,"desc":"Root causes of selected outcomes are systematically determined"},{"score":5.3,"desc":"Selected improvements are validated by stakeholders"},{"score":5.4,"desc":"The effects of deployed improvements on data management are evaluated using statistical and other quantitative techniques"},{"score":5.5,"desc":"Measurement and analysis related experiences derived from planning and performing data management activities are collected and shared, and are included in the organizational process assets"}],
    "Process Management": [{"score":1.1,"desc":"A group is established to coordinate improvement of processes, standards, and procedures"},{"score":1.2,"desc":"Process needs are identified through appraisals or submitted change proposals"},{"score":1.3,"desc":"Process problems or improvement opportunities are addressed"},{"score":1.4,"desc":"Data, process, and work products are stored, maintained, and accessible"},{"score":2.1,"desc":"Establish and maintain the description of process needs and objectives for the organization"},{"score":2.2,"desc":"Appraise processes as needed to maintain an understanding of their strengths and weaknesses"},{"score":2.3,"desc":"Perform impact assessment on suggested improvements"},{"score":2.4,"desc":"Select and implement improvements for deployment based on an evaluation of costs, benefits, and other factors"},{"score":2.5,"desc":"Establish, maintain, and follow process action plans to address improvements to the process"},{"score":3.1,"desc":"Establish and maintain the organization's set of standard processes (OSSP)"},{"score":3.2,"desc":"Establish and maintain tailoring criteria and guidelines for the set of standard processes"},{"score":3.3,"desc":"Establish and maintain the organization's process asset library"},{"score":3.4,"desc":"Establish and maintain the organization's measurement repository"},{"score":4.1,"desc":"Establish and maintain the organization's quantitative objectives for quality and process performance, which are traceable to business objectives"},{"score":4.2,"desc":"Analyze the performance of the selected processes, and establish and maintain the process performance baselines"},{"score":4.3,"desc":"Establish and maintain process performance models for selected processes in the organization's set of standard processes"},{"score":5.1,"desc":"Maintain business objectives based on an understanding of business strategies and actual performance results"},{"score":5.2,"desc":"Analyze process performance data to determine the organization's ability to meet identified business objectives"},{"score":5.3,"desc":"Identify potential areas for improvement that could contribute to meeting business objectives"}],
    "Process Quality Assurance": [{"score":1.1,"desc":"Process and product issues are identified and addressed"},{"score":2.1,"desc":"Objectively evaluate selected performed processes against applicable process descriptions, standards, and procedures"},{"score":2.2,"desc":"Objectively evaluate selected work products against applicable process descriptions, standards, and procedures"},{"score":2.3,"desc":"Communicate quality issues and ensure the resolution of noncompliance issues with the staff and managers"},{"score":2.4,"desc":"Establish and maintain records of quality assurance activities"},{"score":3.1,"desc":"Establish, maintain, and follow organizational standard policies, processes, and procedures for process and product quality assurance"},{"score":3.2,"desc":"Establish, maintain, and follow organizational standard policies, processes, and procedures for reporting quality results and escalating noncompliance issues when they cannot be resolved at lower levels"},{"score":3.3,"desc":"Establish, maintain, and apply a measurement system of quality issues"},{"score":4.1,"desc":"The organization uses statistical and other quantitative techniques to predict where quality issues will arise"},{"score":5.1,"desc":"The organization uses statistical and other quantitative techniques to manage tradeoffs between cost and quality to meet business objectives"}],
    "Risk Management": [{"score":1.1,"desc":"Risks are identified, documented, and monitored"},{"score":2.1,"desc":"Analyze identified risks"},{"score":2.2,"desc":"Monitor identified risks"},{"score":3.1,"desc":"Determine risk sources and categories"},{"score":3.2,"desc":"Define parameters used to analyze and categorize risks and to control the risk management effort"},{"score":3.3,"desc":"Establish and maintain the strategy to be used for risk management"},{"score":3.4,"desc":"Identify, analyze, and document risks by following the organization's standard process"},{"score":3.5,"desc":"Evaluate and categorize each identified risk using defined risk categories and parameters, and determine its relative priority"},{"score":3.6,"desc":"Develop a risk mitigation plan in accordance with the risk management strategy"},{"score":3.7,"desc":"Monitor the status of each risk periodically and implement the risk mitigation plan as appropriate"},{"score":4.1,"desc":"Using statistical and other quantitative techniques, analyze and determine the quantitative risk to meeting the goals"},{"score":5.1,"desc":"Establish and maintain, using statistical and other quantitative techniques, the quantitative risk posture for selected quantitative objectives"}],
    "Configuration Management": [{"score":1.1,"desc":"Configuration management is documented and implemented"},{"score":1.2,"desc":"Configuration management information is available to all relevant stakeholders"},{"score":2.1,"desc":"Changes in the operational environment are planned, managed, and tested to determine impact on data stores, interfaces, and data management process assets"},{"score":2.2,"desc":"Data changes, including those originated by those external data providers, are subject to the organization's configuration management processes"},{"score":2.3,"desc":"Data interface changes are managed and controlled"},{"score":3.1,"desc":"A configuration management policy is defined, approved by governance, and implemented for selected platforms and data management process assets across the organization"},{"score":3.2,"desc":"Changes to data stores, data interfaces and data management process assets are planned and approved by stakeholders at the organizational level"},{"score":3.3,"desc":"An audit program ensures compliance with configuration management policy across the organization"},{"score":3.4,"desc":"Data governance has accountability and oversight authority for configuration management policies and processes"},{"score":4.1,"desc":"Metrics are used to measure compliance and effectiveness of configuration management policies and procedures"},{"score":5.1,"desc":"Predictive models are evaluated and improved after completion of the change"},{"score":5.2,"desc":"Metrics and stakeholder feedback are analyzed to improve configuration management of new releases from data providers"}],
  },
};

const AREAS = {
  "Data Governance": {
    short: "DG", color: "#0072BC", icon: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjYgNjYiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNjYgNjYiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PGc+PGc+PGc+PHBhdGggZD0ibTguMTMgMjguMTZoNi42djI1Ljg1aC02LjZ6IiBmaWxsPSIjY2RkMGRhIi8+PC9nPjwvZz48L2c+PGc+PGc+PGc+PHBhdGggZD0ibTIyLjUxIDI4LjE2aDYuNnYyNS44NWgtNi42eiIgZmlsbD0iI2NkZDBkYSIvPjwvZz48L2c+PC9nPjxnPjxnPjxnPjxwYXRoIGQ9Im0zNi44OSAyOC4xNmg2LjZ2MjUuODVoLTYuNnoiIGZpbGw9IiNjZGQwZGEiLz48L2c+PC9nPjwvZz48cGF0aCBkPSJtNTEuMjcgMjguMTZoNi42djI1Ljg1aC02LjZ6IiBmaWxsPSIjY2RkMGRhIi8+PGcgZmlsbD0iI2E5YjJiZCI+PHBhdGggZD0ibTE0LjczIDI4LjE2djI1Ljg1aC02LjZ2LTEuOTFjMi42OCAwIDQuODUtMi4xNyA0Ljg1LTQuODV2LTE5LjA5eiIvPjxwYXRoIGQ9Im0yOS4xMSAyOC4xNnYyNS44NWgtNi42di0xLjkxYzIuNjggMCA0Ljg1LTIuMTcgNC44NS00Ljg1di0xOS4wOXoiLz48cGF0aCBkPSJtNDMuNSAyOC4xNnYyNS44NWgtNi42MXYtMS45MWguMDFjMi42OCAwIDQuODUtMi4xNyA0Ljg1LTQuODV2LTE5LjA5eiIvPjxwYXRoIGQ9Im01Ny44OCAyOC4xNnYyNS44NWgtNi42MXYtMS45MWguMDFjMi42OCAwIDQuODUtMi4xNyA0Ljg1LTQuODV2LTE5LjA5eiIvPjwvZz48ZyBmaWxsPSIjNWQ5YmVjIj48cGF0aCBkPSJtMTYuNTcgNTcuNTVoLTEwLjI5di0zLjAzYzAtLjg0LjY4LTEuNTEgMS41MS0xLjUxaDcuMjZjLjg0IDAgMS41MS42OCAxLjUxIDEuNTF2My4wM3oiLz48cGF0aCBkPSJtMzAuOTUgNTcuNTVoLTEwLjI5di0zLjAzYzAtLjg0LjY4LTEuNTEgMS41MS0xLjUxaDcuMjZjLjg0IDAgMS41MS42OCAxLjUxIDEuNTF2My4wM3oiLz48cGF0aCBkPSJtNDUuMzQgNTcuNTVoLTEwLjI5di0zLjAzYzAtLjg0LjY4LTEuNTEgMS41MS0xLjUxaDcuMjZjLjg0IDAgMS41MS42OCAxLjUxIDEuNTF2My4wM3oiLz48cGF0aCBkPSJtNTkuNzIgNTcuNTVoLTEwLjI5di0zLjAzYzAtLjg0LjY4LTEuNTEgMS41MS0xLjUxaDcuMjZjLjg0IDAgMS41MS42OCAxLjUxIDEuNTF2My4wM3oiLz48L2c+PHBhdGggZD0ibTYzLjA5IDYwLjQ2aC02MC4xOHYtMi4xYzAtLjU5LjQ4LTEuMDYgMS4wNi0xLjA2aDU4LjA2Yy41OSAwIDEuMDYuNDggMS4wNiAxLjA2eiIgZmlsbD0iI2NkZDBkYSIvPjxwYXRoIGQ9Im02My41MyA2NC44NWgtNjEuMDZjLS41OSAwLTEuMDYtLjQ4LTEuMDYtMS4wNnYtMi40YzAtLjU5LjQ4LTEuMDYgMS4wNi0xLjA2aDYxLjA2Yy41OSAwIDEuMDYuNDggMS4wNiAxLjA2djIuNGMwIC41OS0uNDcgMS4wNi0xLjA2IDEuMDZ6IiBmaWxsPSIjNWQ5YmVjIi8+PHBhdGggZD0ibTE1LjA2IDI5LjE3aC03LjI2Yy0uODQgMC0xLjUxLS42OC0xLjUxLTEuNTF2LTMuMDNoMTAuMjl2My4wM2MtLjAxLjgzLS42OSAxLjUxLTEuNTIgMS41MXoiIGZpbGw9IiM1ZDliZWMiLz48cGF0aCBkPSJtMjkuNDQgMjkuMTdoLTcuMjZjLS44NCAwLTEuNTEtLjY4LTEuNTEtMS41MXYtMy4wM2gxMC4yOXYzLjAzYy0uMDEuODMtLjY4IDEuNTEtMS41MiAxLjUxeiIgZmlsbD0iIzVkOWJlYyIvPjxwYXRoIGQ9Im00My44MiAyOS4xN2gtNy4yNmMtLjg0IDAtMS41MS0uNjgtMS41MS0xLjUxdi0zLjAzaDEwLjI5djMuMDNjMCAuODMtLjY4IDEuNTEtMS41MiAxLjUxeiIgZmlsbD0iIzVkOWJlYyIvPjxwYXRoIGQ9Im02NS4wOSAyMS40OHYyLjAzYzAgLjYyLS41IDEuMTMtMS4xMiAxLjEzaC02MS45NGMtLjYyIDAtMS4xMy0uNS0xLjEzLTEuMTN2LTIuMDNjMC0uNjIuNS0xLjEzIDEuMTMtMS4xM2g2MS45NGMuNjIgMCAxLjEyLjUxIDEuMTIgMS4xM3oiIGZpbGw9IiNjZGQwZGEiLz48cGF0aCBkPSJtNTguMiAyOS4xN2gtNy4yNmMtLjg0IDAtMS41MS0uNjgtMS41MS0xLjUxdi0zLjAzaDEwLjI5djMuMDNjMCAuODMtLjY4IDEuNTEtMS41MiAxLjUxeiIgZmlsbD0iIzVkOWJlYyIvPjxwYXRoIGQ9Im02Mi40NyAyMC40MWgtNTguOTRsMjcuOTMtMTguNzljLjkzLS42MyAyLjE1LS42MyAzLjA5IDB6IiBmaWxsPSIjNWQ5YmVjIi8+PHBhdGggZD0ibTYyLjQ2IDIwLjQxaC01OC45M2wxLjQ5LTFoMjEuNjFjOS43OCAwIDEzLjY0LTEyLjY2IDUuNTMtMTguMTIuNzktLjI2IDEuNjctLjE1IDIuMzguMzN6IiBmaWxsPSIjNGI4OWRjIi8+PGNpcmNsZSBjeD0iMzIuOTIiIGN5PSIxMi4xMSIgZmlsbD0iI2ZmY2U1NCIgcj0iNS43NSIvPjxwYXRoIGQ9Im0zOC42NyAxMi4xMWMwIDMuMTgtMi41OCA1Ljc1LTUuNzUgNS43NS0xLjIyIDAtMi4zNi0uMzgtMy4yOS0xLjA0LjIuMDMuNDEuMDQuNjIuMDQgMy4xOCAwIDUuNzUtMi41NyA1Ljc1LTUuNzUgMC0xLjk1LS45OC0zLjY4LTIuNDctNC43MiAyLjg4LjMxIDUuMTQgMi43NiA1LjE0IDUuNzJ6IiBmaWxsPSIjZjZiYjQzIi8+PGcgb3BhY2l0eT0iLjIiPjxwYXRoIGQ9Im05LjIxIDQ1LjQyYy0uMjggMC0uNS0uMjItLjUtLjV2LTEzLjk0YzAtLjI4LjIyLS41LjUtLjVzLjUuMjIuNS41djEzLjk0YzAgLjI4LS4yMi41LS41LjV6IiBmaWxsPSIjZmZmIi8+PC9nPjwvZz48L3N2Zz4=",
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
    short: "DQ", color: "#009AA4", icon: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTMgNTMiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTMgNTMiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgaWQ9Il94MzlfNCI+PGc+PGc+PGc+PGc+PGc+PHBhdGggZD0ibTM0LjQzMzE4NTYgMzMuNDk2MDI4OWMwIDIuNDQzNjM3OC03LjE0ODEwNzUgNC40MTkzNjg3LTE1Ljk2ODIyNzQgNC40MTkzNjg3LTguODExMTQ1OCAwLTE1Ljk1OTI1MjQtMS45NzU3MzA5LTE1Ljk1OTI1MjQtNC40MTkzNjg3IDAtMi40NDQwODk5IDcuMTQ4MTA2Ni00LjQxOTM2ODcgMTUuOTU5MjUyNC00LjQxOTM2ODcgOC44MjAxMTk4IDAgMTUuOTY4MjI3NCAxLjk3NTI3ODggMTUuOTY4MjI3NCA0LjQxOTM2ODd6IiBmaWxsPSIjNWI1ZThiIi8+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJtMzQuNDMzMTg1NiAyMC4xNzM3NzA5YzAgMi40NDM2Mzk4LTcuMTQ4MTA3NSA0LjQxOTM2ODctMTUuOTY4MjI3NCA0LjQxOTM2ODctOC44MTExNDU4IDAtMTUuOTU5MjUyNC0xLjk3NTcyOS0xNS45NTkyNTI0LTQuNDE5MzY4NyAwLTIuNDQ0MDg4IDcuMTQ4MTA2Ni00LjQxOTM2NzggMTUuOTU5MjUyNC00LjQxOTM2NzggOC44MjAxMTk4IDAgMTUuOTY4MjI3NCAxLjk3NTI3OTggMTUuOTY4MjI3NCA0LjQxOTM2Nzh6IiBmaWxsPSIjNWI1ZThiIi8+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJtMzQuNDMzMTg1NiA2Ljg1MTUxMzljMCAyLjQ0MzYzOTgtNy4xNDgxMDc1IDQuNDE5MzY3OC0xNS45NjgyMjc0IDQuNDE5MzY3OC04LjgxMTE0NTggMC0xNS45NTkyNTI0LTEuOTc1NzI4LTE1Ljk1OTI1MjQtNC40MTkzNjc4IDAtMi40NDQwODg1IDcuMTQ4MTA2Ni00LjQxOTM2NzggMTUuOTU5MjUyNC00LjQxOTM2NzggOC44MjAxMTk4LS4wMDAwMDAzIDE1Ljk2ODIyNzQgMS45NzUyNzkzIDE1Ljk2ODIyNzQgNC40MTkzNjc4eiIgZmlsbD0iIzViNWU4YiIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0ibTI3Ljk0NjI2MjQgNi44NTE1MTM5YzAgMS40NTA2NTg4LTQuMjQzNDQ4MyAyLjYyMzU0MjgtOS40Nzk0ODA3IDIuNjIzNTQyOC01LjIzMDcwNjIgMC05LjQ3NDE1NDUtMS4xNzI4ODQtOS40NzQxNTQ1LTIuNjIzNTQyOCAwLTEuNDUwOTI0NCA0LjI0MzQ0ODMtMi42MjM1NDIzIDkuNDc0MTU0NS0yLjYyMzU0MjMgNS4yMzYwMzI0IDAgOS40Nzk0ODA3IDEuMTcyNjE3OSA5LjQ3OTQ4MDcgMi42MjM1NDIzeiIgZmlsbD0iIzMxMmU0YiIvPjwvZz48L2c+PGc+PGc+PGc+PHBhdGggZD0ibTM0LjQzMzE4NTYgMzMuNDk2MDI4OXY4LjI5NjM1MjRjMCAyLjQzNTExNTgtNy4xNDgxMDc1IDQuNDE5MzY4Ny0xNS45NjgyMjc0IDQuNDE5MzY4Ny04LjgxMTE0NTggMC0xNS45NTkyNTI0LTEuOTg0MjUyOS0xNS45NTkyNTI0LTQuNDE5MzY4N3YtOC4yOTYzNTI0YzAgMi40NDM2Mzc4IDcuMTQ4MTA2NiA0LjQxOTM2ODcgMTUuOTU5MjUyNCA0LjQxOTM2ODcgOC44MjAxMTk4IDAgMTUuOTY4MjI3NC0xLjk3NTczMDkgMTUuOTY4MjI3NC00LjQxOTM2ODd6IiBmaWxsPSIjZGVkZGZmIi8+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJtMzQuNDMzMTg1NiAyMC4xNzM3NzA5djguMjk2MzUyNGMwIDIuNDM1MTE3Ny03LjE0ODEwNzUgNC40MTkzNjg3LTE1Ljk2ODIyNzQgNC40MTkzNjg3LTguODExMTQ1OCAwLTE1Ljk1OTI1MjQtMS45ODQyNTEtMTUuOTU5MjUyNC00LjQxOTM2ODd2LTguMjk2MzUyNGMwIDIuNDQzNjM5OCA3LjE0ODEwNjYgNC40MTkzNjg3IDE1Ljk1OTI1MjQgNC40MTkzNjg3IDguODIwMTE5OCAwIDE1Ljk2ODIyNzQtMS45NzU3Mjg5IDE1Ljk2ODIyNzQtNC40MTkzNjg3eiIgZmlsbD0iI2RlZGRmZiIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0ibTM0LjQzMzE4NTYgNi44NTE1MTM5djguMjk2MzUzM2MwIDIuNDM1MTE1OC03LjE0ODEwNzUgNC40MTkzNjg3LTE1Ljk2ODIyNzQgNC40MTkzNjg3LTguODExMTQ1OCAwLTE1Ljk1OTI1MjQtMS45ODQyNTI5LTE1Ljk1OTI1MjQtNC40MTkzNjg3di04LjI5NjM1MzNjMCAyLjQ0MzYzOTggNy4xNDgxMDY2IDQuNDE5MzY3OCAxNS45NTkyNTI0IDQuNDE5MzY3OCA4LjgyMDExOTggMCAxNS45NjgyMjc0LTEuOTc1NzI4MSAxNS45NjgyMjc0LTQuNDE5MzY3OHoiIGZpbGw9IiNkZWRkZmYiLz48L2c+PC9nPjwvZz48Zz48Zz48Zz48cGF0aCBkPSJtMTMuNzE2OTYwOSA0Ni4wMTYwMTc5Yy02LjQ5NjkzOTItLjU2NDM0NjMtMTEuMjE0MTE4LTIuMjU3Mjg5OS0xMS4yMTQxMTgtNC4yMjUyNTQxdi04LjI5MTE4MzVjMCAuNzk1ODIyMS43Mzc5NzU0IDEuNTMzNzk4MiAyLjA0MDIwNzQgMi4xNzA0NzEydjYuMzUyMjc5N2MwIDEuNzY1Mjc0MSAzLjc0NzcyNSAzLjI4NDU5MTcgOS4xNzM5MTA2IDMuOTkzNjg2N3oiIGZpbGw9IiNjNmM2ZjciLz48L2c+PC9nPjxnPjxnPjxwYXRoIGQ9Im0xMy43MTY5NjA5IDMyLjY4OTI3Yy02LjQ5NjkzOTItLjU2NDM0MjUtMTEuMjE0MTE4LTIuMjQyODAzNi0xMS4yMTQxMTgtNC4yMjUxNjQ0di04LjI5MTI3MzFjMCAuNzgxNDI3NC43Mzc5NzU0IDEuNTE5NDAzNSAyLjA0MDIwNzQgMi4xNzA0NzV2Ni4zNTIyNzc4YzAgMS43NjUzNjM2IDMuNzQ3NzI1IDMuMjg0Njc5NCA5LjE3MzkxMDYgMy45OTM2ODQ3eiIgZmlsbD0iI2M2YzZmNyIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0ibTEzLjQ4NTM5NDUgMTkuMzMzNjQ2OGMtNi4zODExNTY1LS41NjQzNDQ0LTEwLjk4MjU1MTYtMi4yMjg0MTA3LTEwLjk4MjU1MTYtNC4xODE4MDE4di04LjMwNTY2ODRjMCAuNzk1ODIyNi43Mzc5NzU0IDEuNTMzNzk4NyAyLjA0MDIwNzQgMi4xNzA0NzQ1djYuMzUyMTg4MWMwIDEuNzUwODgxMyAzLjY0NjQyNDggMy4yNTU3MTI2IDguOTQyMzQ0MiAzLjk2NDgwNzZ6IiBmaWxsPSIjYzZjNmY3Ii8+PC9nPjwvZz48L2c+PC9nPjxnPjxnPjxnPjxnPjxjaXJjbGUgY3g9IjMwLjk3OSIgY3k9IjEzLjk0NSIgZmlsbD0iI2U4M2Q2MiIgcj0iMS40MTciLz48L2c+PC9nPjxnPjxnPjxjaXJjbGUgY3g9IjI2LjYxNSIgY3k9IjE0LjYwOCIgZmlsbD0iIzQ2Y2M2YiIgcj0iMS40MTciLz48L2c+PC9nPjwvZz48Zz48Zz48Zz48cGF0aCBkPSJtMTQuNzI0NjY1NiAxNi4wOTY1OWMtLjAxNzkxMzggMC0uMDM2NDkwNC0uMDAwNjYzOC0uMDU1MDY4LS4wMDEzMjc1LTUuMDEwNTI0Ny0uMzA5ODQwMi04LjMzNzgyNzctMS4yNjA1OTM0LTkuNjY0NzY3My0xLjk4MTEyMTEtLjQyODYwMTctLjIzMjg3ODctLjU4NzgzNDQtLjc2ODk2MTktLjM1NDk1NjYtMS4xOTc1NjQxLjIzMjg3ODItLjQyNzkzNzUuNzcwMjg4OS0uNTg1MTgwMyAxLjE5NzU2MzYtLjM1NDk1NTcuOTQwODAwMi41MTA4NzE5IDMuODgwNjM1NyAxLjQ1ODMwNjMgOC45MzA5NjkyIDEuNzcwMTM3OC40ODY5ODcxLjAzMDUxOTUuODU3MjAzNS40NDkxNjkyLjgyNzM0NjguOTM2MTU2My0uMDI5MTkyMy40Njg0MDk2LS40MTc5ODUzLjgyODY3NDMtLjg4MTA4NzcuODI4Njc0M3oiIGZpbGw9IiNiNWI1ZWEiLz48L2c+PC9nPjwvZz48L2c+PGc+PGc+PGc+PGc+PGNpcmNsZSBjeD0iMzAuOTc5IiBjeT0iMjcuMzE2IiBmaWxsPSIjZTgzZDYyIiByPSIxLjQxNyIvPjwvZz48L2c+PGc+PGc+PGNpcmNsZSBjeD0iMjYuNjE1IiBjeT0iMjcuOTc5IiBmaWxsPSIjNjViOWZmIiByPSIxLjQxNyIvPjwvZz48L2c+PC9nPjxnPjxnPjxnPjxwYXRoIGQ9Im0xNC43MjQ2NjU2IDI5LjQ2ODE2MDZjLS4wMTc5MTM4IDAtLjAzNjQ5MDQtLjAwMDY2MzgtLjA1NTA2OC0uMDAxMzI3NS01LjAxMDUyNDctLjMwOTgzOTItOC4zMzc4Mjc3LTEuMjYwNTkzNC05LjY2NDc2NzMtMS45ODExMjExLS40Mjg2MDE3LS4yMzI4Nzc3LS41ODc4MzQ0LS43Njg5NjEtLjM1NDk1NjYtMS4xOTc1NjMyLjIzMjg3ODItLjQyNzkzODUuNzcwMjg4OS0uNTg1MTgwMyAxLjE5NzU2MzYtLjM1NDk1NTcuOTQwODAwMi41MTA4NzE5IDMuODgwNjM1NyAxLjQ1ODMwNTQgOC45MzA5NjkyIDEuNzcwMTM3OC40ODY5ODcxLjAzMDUxOTUuODU3MjAzNS40NDkxNjkyLjgyNzM0NjguOTM2MTU1My0uMDI5MTkyMy40Njg0MTA2LS40MTc5ODUzLjgyODY3NDQtLjg4MTA4NzcuODI4Njc0NHoiIGZpbGw9IiNiNWI1ZWEiLz48L2c+PC9nPjwvZz48L2c+PGc+PGc+PGc+PGc+PGNpcmNsZSBjeD0iMzAuOTc5IiBjeT0iNDEuMDE5IiBmaWxsPSIjZTgzZDYyIiByPSIxLjQxNyIvPjwvZz48L2c+PGc+PGc+PGNpcmNsZSBjeD0iMjYuNjE1IiBjeT0iNDEuNjgzIiBmaWxsPSIjNDZjYzZiIiByPSIxLjQxNyIvPjwvZz48L2c+PC9nPjxnPjxnPjxnPjxwYXRoIGQ9Im0xNC43MjQ2NjU2IDQzLjE3MTMzMzNjLS4wMTc5MTM4IDAtLjAzNjQ5MDQtLjAwMDY2MzgtLjA1NTA2OC0uMDAxMzI3NS01LjAxMDUyNDctLjMwOTg0MTItOC4zMzc4Mjc3LTEuMjYwNTkzNC05LjY2NDc2NzMtMS45ODExMjExLS40Mjg2MDE3LS4yMzI4Nzk2LS41ODc4MzQ0LS43Njg5NjI5LS4zNTQ5NTY2LTEuMTk3NTYzMi4yMzI4NzgyLS40Mjc5NDA0Ljc3MDI4ODktLjU4NTE4MjIgMS4xOTc1NjM2LS4zNTQ5NTc2Ljk0MDgwMDIuNTEwODcxOSAzLjg4MDYzNTcgMS40NTgzMDU0IDguOTMwOTY5MiAxLjc3MDEzNzguNDg2OTg3MS4wMzA1MjE0Ljg1NzIwMzUuNDQ5MTY5Mi44MjczNDY4LjkzNjE1NzItLjAyOTE5MjMuNDY4NDEwNi0uNDE3OTg1My44Mjg2NzQ0LS44ODEwODc3LjgyODY3NDR6IiBmaWxsPSIjYjViNWVhIi8+PC9nPjwvZz48L2c+PC9nPjwvZz48L2c+PGc+PGc+PGc+PGc+PHBhdGggZD0ibTQ5LjE0ODE1OSA0OS40MTk1NTk1Yy0xLjg2NjEyNyAxLjc1MTYxMzYtNC44NDA4NjYxIDEuNDYwNzc3My02LjM1OTc1NjUtLjYwOTQ0MzctOS4wMDA1ODc1LTEyLjM5MTU4MjUgMS4xMDI1MiAxLjUxNTk5ODgtNS40NjU3MjExLTcuNTE2MjQ2OGw0LjU0MDI3MTgtNC4yMTc2OTcxYy4xMDAxMzIuMDg0MDQ5MiA3LjIxMjgwNjcgNi4wNTM3MjI0IDcuMTEyMzg4NiA1Ljk2OTE5NjMgMS45NTc4ODU3IDEuNjYxMTgyNCAyLjAzODQ4MjcgNC42MzU3NjEzLjE3MjgxNzIgNi4zNzQxOTEzeiIgZmlsbD0iI2ZjYjczZSIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0ibTQ5LjM0MDcwNTkgNDkuMjI3MzI5M2MtLjA1NTMxMzEuMDY0MzYxNi0uMTIzOTY2Mi4xMjgyNTM5LS4xOTI1NDY4LjE5MjIzMDItMS44NjYxMjcgMS43NTE2MTM2LTQuODQwODY2MSAxLjQ2MDc3NzMtNi4zNTk3NTY1LS42MDk0NDM3LTkuMDAwNTg3NS0xMi4zOTE1ODI1IDEuMTAyNTIgMS41MTU5OTg4LTUuNDY1NzIxMS03LjUxNjI0NjhsNC41NDAyNzE4LTQuMjE3Njk3MS4xMTYwMDg4LjA5Njk3MzRjLjEwMjQwOTQuMDg1NjI0NyAyLjk1NzA5NjEgMi40NzIzNzAxIDIuNzgzMzcxIDIuMzI3MTIxNy0uMTA4ODI5NS4xNjYyNzEyLS4yNzc1MzA3LjM4MTAzMS0uNDg1NjcyLjYyNTA2NDgtMS44OTcxNTU4IDIuMjI0MjgxMy0yLjA0NDkyNTcgNS40NTU4NDg3LS4zMzAxMjAxIDcuODIzNTYyNmwuMDAwMDAzOC4wMDAwMDM4YzEuMjc4NzU1IDEuNzMwMDcyMSAzLjU4MzQ5NTkgMi4yMDk0NzI4IDUuMzk0MTYxMSAxLjI3ODQzMTF6IiBmaWxsPSIjZmQ5ODJlIi8+PC9nPjwvZz48Zz48Zz48ZWxsaXBzZSBjeD0iMzMuMDYiIGN5PSIzMS45MzkiIGZpbGw9IiM2NWI5ZmYiIHJ4PSIxMS43NjEiIHJ5PSIxMS43NjEiIHRyYW5zZm9ybT0ibWF0cml4KC4wMzUgLS45OTkgLjk5OSAuMDM1IC0uMDI2IDYzLjg1KSIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0ibTI2LjQyMTQwNTggMzguNTkxMTc4OWMzLjc1MTU3OTMgNC4wMjYzMzI5IDkuNjY4MjUxIDQuODI3MzAxIDE0LjI2ODUwNTEgMi4yOTY2NjE0LTQuNzYyOTM5NSA0LjA2NzM5NDMtMTEuOTI4NTk2NSAzLjY4OTIyODEtMTYuMjM0NDgxOC0uOTMyMDA2OC00LjQzNDM5ODctNC43NTkxNTkxLTQuMTYzMzY4Mi0xMi4xOTU0MjMxLjU4NzIxNTQtMTYuNjIxODMuNzI0MTk1NS0uNjc0Nzc4IDEuNTExNDk5NC0xLjI0NzMyNTkgMi4zNDQ2OTYtMS43MDE1MDk1LS4xMjg3NTc1LjEwMzg0OTQtLjI0OTQ3MzYuMjE2MzI5Ni0uMzc4ODIwNC4zMzY4NDkyLTQuNzUwNTMyMSA0LjQyNjM1NzMtNS4wMjE1NjI1IDExLjg2MjYxOTQtLjU4NzExNDMgMTYuNjIxODM1N3oiIGZpbGw9IiMzZTdmZmYiLz48L2c+PC9nPjxnPjxnPjxwYXRoIGQ9Im0zOC44MTE1NDYzIDM4LjEwMTAxN2MtMy40MDgyOTA5IDMuMTgxNjEzOS04Ljc1NTI4MzQgMi45OTI3MzMtMTEuOTI0NzIwOC0uNDE1MTk5My0zLjE4MTU3NTgtMy40MDgzMjUyLTIuOTkyOTEwNC04Ljc0OTIxNDIuNDIxNDQ3OC0xMS45MzA2MTI2IDMuNDA4NDM1OC0zLjE4MTYxMDEgOC43NDkyMTQyLTIuOTkyOTQ2NiAxMS45MzA3MjUxLjQyMTQ1MTYgMy4xNjk0Mzc0IDMuNDA3ODk0MiAyLjk4MDU1NjUgOC43NTQ4NTQyLS40Mjc0NTIxIDExLjkyNDM2MDN6IiBmaWxsPSIjZGVkZGZmIi8+PC9nPjwvZz48L2c+PGc+PGc+PGc+PHBhdGggZD0ibTMxLjQwMjM1MzMgMzQuNzE2MDk4OC0yLjA4MDQ3MS0xLjY4NzE4MzRjLS40MjQwNDU2LS4zNDM4ODM1LS40ODg5NzU1LS45NjU5MDQyLS4xNDUwOTItMS4zODk5NTE3LjM0Mzg4MzUtLjQyNDA0MzcuOTY1OTA2MS0uNDg4OTc1NSAxLjM4OTk1MTctLjE0NTA5MmwxLjMxMjk1MDEgMS4wNjQ3NTI2IDIuNzUyMzYxMy0zLjM5Mzk1MzNjLjM0Mzg4MzUtLjQyNDA0NTYuOTY1OTA4MS0uNDg4OTc1NSAxLjM4OTk1MzYtLjE0NTA5MnMuNDg4OTc1NS45NjU5MDYxLjE0NTA5MiAxLjM4OTk1MTdsLTMuMzc0Nzk0IDQuMTYxNDc2MWMtLjM0Mzg3MjEuNDI0MDM0MS0uOTY1ODkyOC40ODg5ODMxLTEuMzg5OTUxNy4xNDUwOTJ6IiBmaWxsPSIjZTgzZDYyIi8+PC9nPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=",
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
    short: "DMS", color: "#005B96", icon: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTc2LjgzMyA0MzUuMTY3aDM2NC42NjdhMjAgMjAgMCAwIDAgMjAtMjB2LTM2OGgtMzE0LjY2N2wtNzAgNzB6IiBmaWxsPSIjZjFlOGRjIi8+PGNpcmNsZSBjeD0iNDExLjI2NCIgY3k9Ijc0LjE2OCIgZmlsbD0iIzlhOTlhMSIgcj0iNy41Ii8+PGNpcmNsZSBjeD0iMzMyLjI2NCIgY3k9Ijc0LjE2OCIgZmlsbD0iIzlhOTlhMSIgcj0iNy41Ii8+PGNpcmNsZSBjeD0iMjUzLjI2NCIgY3k9Ijc0LjE2OCIgZmlsbD0iIzlhOTlhMSIgcj0iNy41Ii8+PGNpcmNsZSBjeD0iMTc0LjI2NCIgY3k9Ijc0LjE2OCIgZmlsbD0iIzlhOTlhMSIgcj0iNy41Ii8+PHBhdGggZD0ibTI1OC40MSAyMTYuMzhoNTJhMCAwIDAgMCAxIDAgMHYzMGE1IDUgMCAwIDEgLTUgNWgtNDJhNSA1IDAgMCAxIC01LTV2LTMwYTAgMCAwIDAgMSAwIDB6IiBmaWxsPSIjNTRjMWVkIiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA1MTguMjkgLTUwLjUzKSIvPjxwYXRoIGQ9Im0zMjguOTEgMTc2Ljg4aDEyMWE1IDUgMCAwIDEgNSA1djMwYTAgMCAwIDAgMSAwIDBoLTEyNmE1IDUgMCAwIDEgLTUtNXYtMjVhNSA1IDAgMCAxIDUtNXoiIGZpbGw9IiNmNDY0NGQiIHRyYW5zZm9ybT0ibWF0cml4KDAgMSAtMSAwIDU4My43OSAtMTk1LjAzKSIvPjxwYXRoIGQ9Im0yODAuNDEgMjAzLjM4aDc4YTAgMCAwIDAgMSAwIDB2MzVhMCAwIDAgMCAxIDAgMGgtNzNhNSA1IDAgMCAxIC01LTV2LTMwYTAgMCAwIDAgMSAwIDB6IiBmaWxsPSIjOGJjOTMyIiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA1NDAuMjkgLTk4LjUzKSIvPjxwYXRoIGQ9Im0zMDEuOTEgMTg5Ljg4aDEwNWEwIDAgMCAwIDEgMCAwdjM1YTAgMCAwIDAgMSAwIDBoLTEwMGE1IDUgMCAwIDEgLTUtNXYtMzBhMCAwIDAgMCAxIDAgMHoiIGZpbGw9IiNmOWQzNmIiIHRyYW5zZm9ybT0ibWF0cml4KDAgMSAtMSAwIDU2MS43OSAtMTQ3LjAzKSIvPjxwYXRoIGQ9Im0xMjYuODMgNDM1LjE3aC01MHYtMzE4bDMwLTMwdjMyOGEyMC4wMDcgMjAuMDA3IDAgMCAwIDIwIDIweiIgZmlsbD0iI2VmZGJjNiIvPjxwYXRoIGQ9Im03Ni44MzMgMTE3LjE2OGg1MGEyMCAyMCAwIDAgMCAyMC0yMHYtNTB6IiBmaWxsPSIjZTVjZmJkIi8+PGcgZmlsbD0iIzlhOTlhMSI+PHBhdGggZD0ibTIzMy4wMzQgMTk1LjE2OGgtMTEwYTcuNSA3LjUgMCAxIDEgMC0xNWgxMTBhNy41IDcuNSAwIDAgMSAwIDE1eiIvPjxwYXRoIGQ9Im0yMDIuODg5IDIyOS4xNjloLTM5LjEzNGE3LjUgNy41IDAgMCAxIDAtMTVoMzkuMTM0YTcuNSA3LjUgMCAwIDEgMCAxNXoiLz48cGF0aCBkPSJtMTQwLjUzNSAyMjkuMTY5aC0xNy41YTcuNSA3LjUgMCAwIDEgMC0xNWgxNy41YTcuNSA3LjUgMCAwIDEgMCAxNXoiLz48cGF0aCBkPSJtMjMzLjAzNCAxNjEuMTY0aC04MmE3LjUgNy41IDAgMCAxIDAtMTVoODJhNy41IDcuNSAwIDAgMSAwIDE1eiIvPjxjaXJjbGUgY3g9IjEzMC41MzQiIGN5PSIxNTMuNjY4IiByPSI3LjUiLz48Y2lyY2xlIGN4PSIyMjUuNTM0IiBjeT0iMjIxLjY2OCIgcj0iNy41Ii8+PHBhdGggZD0ibTM5Ni45MSAzNTVoLTExMGE3LjUgNy41IDAgMCAxIDAtMTVoMTEwYTcuNSA3LjUgMCAxIDEgMCAxNXoiLz48cGF0aCBkPSJtMzY2Ljc2NSAzODloLTM5LjEzM2E3LjUgNy41IDAgMCAxIDAtMTVoMzkuMTMzYTcuNSA3LjUgMCAwIDEgMCAxNXoiLz48cGF0aCBkPSJtMzA0LjQxMSAzODloLTE3LjVhNy41IDcuNSAwIDAgMSAwLTE1aDE3LjVhNy41IDcuNSAwIDAgMSAwIDE1eiIvPjxwYXRoIGQ9Im0zOTYuOTEgMzIxaC04MmE3LjUgNy41IDAgMCAxIDAtMTVoODJhNy41IDcuNSAwIDAgMSAwIDE1eiIvPjxjaXJjbGUgY3g9IjI5NC40MSIgY3k9IjMxMy40OTgiIHI9IjcuNSIvPjxjaXJjbGUgY3g9IjM4OS40MSIgY3k9IjM4MS41MDIiIHI9IjcuNSIvPjwvZz48cGF0aCBkPSJtMjYwLjUgMzgzLjc5M3YtMjkuNTg2YTEwIDEwIDAgMCAwIC05LjA5NC05Ljk1OWwtMjIuMDY3LTIuMDA3YTg5LjM4MSA4OS4zODEgMCAwIDAgLTYuMzg2LTE1LjM1bDE0LjItMTcuMDQyYTEwIDEwIDAgMCAwIC0uNjExLTEzLjQ3M2wtMjAuOTIxLTIwLjkyMWExMCAxMCAwIDAgMCAtMTMuNDczLS42MTFsLTE3LjA0MiAxNC4yYTg5LjM4MSA4OS4zODEgMCAwIDAgLTE1LjM1LTYuMzg2bC0yLjAwNy0yMi4wNjdhMTAgMTAgMCAwIDAgLTkuOTU5LTkuMDk0aC0yOS41ODNhMTAgMTAgMCAwIDAgLTkuOTU5IDkuMDk0bC0yLjAwNyAyMi4wNjdhODkuMzgxIDg5LjM4MSAwIDAgMCAtMTUuMzUgNi4zODZsLTE3LjA0Mi0xNC4yYTEwIDEwIDAgMCAwIC0xMy40NzMuNjExbC0yMC45MjEgMjAuOTIxYTEwIDEwIDAgMCAwIC0uNjExIDEzLjQ3M2wxNC4yIDE3LjA0MmE4OS4zODEgODkuMzgxIDAgMCAwIC02LjM4NiAxNS4zNWwtMjIuMDY3IDIuMDA3YTEwIDEwIDAgMCAwIC05LjA5NCA5Ljk1OXYyOS41ODZhMTAgMTAgMCAwIDAgOS4wOTQgOS45NTlsMjIuMDY3IDIuMDA3YTg5LjM4MSA4OS4zODEgMCAwIDAgNi4zODYgMTUuMzVsLTE0LjIgMTcuMDQyYTEwIDEwIDAgMCAwIC42MTEgMTMuNDczbDIwLjkyMSAyMC45MjFhMTAgMTAgMCAwIDAgMTMuNDczLjYxMWwxNy4wNDItMTQuMmE4OS4zODEgODkuMzgxIDAgMCAwIDE1LjM1IDYuMzg2bDIuMDA3IDIyLjA2N2ExMCAxMCAwIDAgMCA5Ljk1OSA5LjA5NGgyOS41ODZhMTAgMTAgMCAwIDAgOS45NTktOS4wOTRsMi4wMDctMjIuMDY3YTg5LjM4MSA4OS4zODEgMCAwIDAgMTUuMzUtNi4zODZsMTcuMDQyIDE0LjJhMTAgMTAgMCAwIDAgMTMuNDczLS42MTFsMjAuOTIxLTIwLjkyMWExMCAxMCAwIDAgMCAuNjExLTEzLjQ3M2wtMTQuMi0xNy4wNDJhODkuMzgxIDg5LjM4MSAwIDAgMCA2LjM4Ni0xNS4zNWwyMi4wNjctMi4wMDdhMTAgMTAgMCAwIDAgOS4wOTEtOS45NTl6bS0xMTcuNSAyNy43NDFhNDIuNTM0IDQyLjUzNCAwIDEgMSA0Mi41MzQtNDIuNTM0IDQyLjU4NCA0Mi41ODQgMCAwIDEgLTQyLjUzNCA0Mi41MzR6IiBmaWxsPSIjNDZiZWU4Ii8+PHBhdGggZD0ibTcwLjM4IDI3NS40NS0yMC45MyAyMC45M2ExMCAxMCAwIDAgMCAtLjYxIDEzLjQ3bDE0LjIgMTcuMDNhOTAuNzE1IDkwLjcxNSAwIDAgMSAzNy44NC0zNy44NGwtMTcuMDMtMTQuMmExMCAxMCAwIDAgMCAtMTMuNDcuNjF6IiBmaWxsPSIjMTdhZmRlIi8+PHBhdGggZD0ibTYzLjA0IDQxMS4xMi0xNC4yIDE3LjAzYTEwIDEwIDAgMCAwIC42MSAxMy40N2wyMC45MyAyMC45MmE5Ljk5NSA5Ljk5NSAwIDAgMCAxMy40Ny42MmwxNy4wMy0xNC4yYTkwLjcxNSA5MC43MTUgMCAwIDEgLTM3Ljg0LTM3Ljg0eiIgZmlsbD0iIzE3YWZkZSIvPjxwYXRoIGQ9Im01Mi42IDM2OWE5MC4zMzUgOTAuMzM1IDAgMCAxIDQuMDQtMjYuNzZsLTIyLjA1IDIuMDFhOS45OTMgOS45OTMgMCAwIDAgLTkuMDkgOS45NnYyOS41OGE5Ljk5MyA5Ljk5MyAwIDAgMCA5LjA5IDkuOTZsMjIuMDUgMi4wMWE5MC4zMzUgOTAuMzM1IDAgMCAxIC00LjA0LTI2Ljc2eiIgZmlsbD0iIzE3YWZkZSIvPjxwYXRoIGQ9Im0xNDMgMzE0YTU1IDU1IDAgMSAwIDU1IDU1IDU1LjA2MSA1NS4wNjEgMCAwIDAgLTU1LTU1em0wIDgwYTI1IDI1IDAgMSAxIDI1LTI1IDI1LjAzIDI1LjAzIDAgMCAxIC0yNSAyNXoiIGZpbGw9IiMxN2FmZGUiLz48cGF0aCBkPSJtNDM2LjUgMTAwLjV2MjA2LjI4NmwyMC40NjcgNDMuOTc0YTUgNSAwIDAgMCA5LjA2NiAwbDIwLjQ2Ny00My45NzR2LTIwNi4yODZ6IiBmaWxsPSIjZmZiMTU1Ii8+PHBhdGggZD0ibTQ4Ni41IDcwLjVoLTUwdi0yMGEyNSAyNSAwIDAgMSAyNS0yNSAyNSAyNSAwIDAgMSAyNSAyNXoiIGZpbGw9IiNmNDY0NGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGQ9Im00MzYuNSA3MC41aDUwdjMwaC01MHoiIGZpbGw9IiNlNmYwZjYiLz48cGF0aCBkPSJtNDM2LjUgNzAuNWgyMHYzMGgtMjB6IiBmaWxsPSIjYWFjZmUyIi8+PHBhdGggZD0ibTQ3MS41IDMzOS4wMS01LjQ3IDExLjc1YTUgNSAwIDAgMSAtOS4wNiAwbC0yMC40Ny00My45N3YtMjA2LjI5aDIwdjIwNi4yOXoiIGZpbGw9IiNmMTliNDAiLz48cGF0aCBkPSJtNDU2LjUgMjZ2NDQuNWgtMjB2LTIwYTI1LjAwOSAyNS4wMDkgMCAwIDEgMjAtMjQuNXoiIGZpbGw9IiNlODUzM2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==",
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
    short: "DO", color: "#068941", icon: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48Zz48cGF0aCBkPSJtMzIzLjA2IDQ5MC4yNzFjMCA1LjkyNi0zMC4wMjQgMTAuNzI5LTY3LjA2IDEwLjcyOXMtNjcuMDYtNC44MDQtNjcuMDYtMTAuNzI5di0zNC4yNDZoMTM0LjEyMXYzNC4yNDZ6IiBmaWxsPSIjMTZiNTU2Ii8+PHBhdGggZD0ibTIwNC45OTIgNDk3LjIzNWMtMTAuMDA3LTEuODc0LTE2LjA1Mi00LjMwNi0xNi4wNTItNi45NjV2LTM0LjI0NmgxNi4wNTJ6IiBmaWxsPSIjMGZhMzRhIi8+PHBhdGggZD0ibTMyMy4wNiA0NTYuMDI0YzAgNS45MjYtMzAuMDI0IDEwLjcyOS02Ny4wNiAxMC43MjlzLTY3LjA2LTQuODA0LTY3LjA2LTEwLjcyOXYtMzQuMjQ2aDEzNC4xMjF2MzQuMjQ2eiIgZmlsbD0iIzBlYzc1YiIvPjxwYXRoIGQ9Im0yMDQuOTkyIDQ2Mi45ODljLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDYtMTYuMDUyLTYuOTY1di0zNC4yNDZoMTYuMDUyeiIgZmlsbD0iIzE2YjU1NiIvPjxwYXRoIGQ9Im0zMjMuMDYgNDIxLjc3OGMwIDUuOTI2LTMwLjAyNCAxMC43MjktNjcuMDYgMTAuNzI5cy02Ny4wNi00LjgwNC02Ny4wNi0xMC43Mjl2LTM0LjI0N2gxMzQuMTIxdjM0LjI0N3oiIGZpbGw9IiMyOGRiNzIiLz48cGF0aCBkPSJtMjA0Ljk5MiA0MjguNzQzYy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjMGVjNzViIi8+PHBhdGggZD0ibTI1NiAzOTguMjZjMzYuOTM1IDAgNjcuMDYtNC44MiA2Ny4wNi0xMC43M3MtMzAuMTI1LTEwLjcyOS02Ny4wNi0xMC43MjktNjcuMDYgNC44Mi02Ny4wNiAxMC43MjkgMzAuMTI1IDEwLjczIDY3LjA2IDEwLjczeiIgZmlsbD0iIzRmZTg4ZSIvPjxwYXRoIGQ9Im0yMDQuOTkyIDM5NC40OTZjLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDctMTYuMDUyLTYuOTY1IDAtNS4zOTMgMjQuODczLTkuODU3IDU3LjI2NS0xMC42MTUtMjcuMDQxIDEuNDU4LTQwLjc3OSA3LjMxOC00MS4yMTMgMTcuNTh6IiBmaWxsPSIjMjhkYjcyIi8+PC9nPjxnPjxwYXRoIGQ9Im0zMjMuMDYgMTI0LjQ2OWMwIDUuOTI2LTMwLjAyNCAxMC43MjktNjcuMDYgMTAuNzI5cy02Ny4wNi00LjgwMy02Ny4wNi0xMC43Mjl2LTM0LjI0N2gxMzQuMTIxdjM0LjI0N3oiIGZpbGw9IiNmODg1MDAiLz48cGF0aCBkPSJtMjA0Ljk5MiAxMzEuNDM0Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjZWQ3MDAzIi8+PHBhdGggZD0ibTMyMy4wNiA5MC4yMjNjMCA1LjkyNi0zMC4wMjQgMTAuNzMtNjcuMDYgMTAuNzNzLTY3LjA2LTQuODA0LTY3LjA2LTEwLjczdi0zNC4yNDdoMTM0LjEyMXYzNC4yNDZ6IiBmaWxsPSIjZjk5NTAwIi8+PHBhdGggZD0ibTIwNC45OTIgOTcuMTg4Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjZjg4NTAwIi8+PHBhdGggZD0ibTMyMy4wNiA1NS45NzZjMCA1LjkyNi0zMC4wMjQgMTAuNzI5LTY3LjA2IDEwLjcyOXMtNjcuMDYtNC44MDQtNjcuMDYtMTAuNzI5di0zNC4yNDZoMTM0LjEyMXYzNC4yNDZ6IiBmaWxsPSIjZjlhYzAwIi8+PHBhdGggZD0ibTIwNC45OTIgNjIuOTQxYy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ2aDE2LjA1MnoiIGZpbGw9IiNmOTk1MDAiLz48cGF0aCBkPSJtMjU2IDMyLjQ1OWMzNi45MzUgMCA2Ny4wNi00LjgyIDY3LjA2LTEwLjczcy0zMC4xMjUtMTAuNzI5LTY3LjA2LTEwLjcyOS02Ny4wNiA0LjgyLTY3LjA2IDEwLjcyOSAzMC4xMjUgMTAuNzMgNjcuMDYgMTAuNzN6IiBmaWxsPSIjZmRjNzJlIi8+PHBhdGggZD0ibTIwNC45OTIgMjguNjk1Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA3LTE2LjA1Mi02Ljk2NSAwLTUuMzkzIDI0Ljg3My05Ljg1NyA1Ny4yNjUtMTAuNjE1LTI3LjA0MSAxLjQ1OC00MC43NzkgNy4zMTgtNDEuMjEzIDE3LjU4eiIgZmlsbD0iI2Y5YWMwMCIvPjwvZz48Zz48cGF0aCBkPSJtNTAxIDMwNy4zN2MwIDUuOTI2LTMwLjAyNCAxMC43MjktNjcuMDYgMTAuNzI5cy02Ny4wNi00LjgwNC02Ny4wNi0xMC43Mjl2LTM0LjI0N2gxMzQuMTIxdjM0LjI0N3oiIGZpbGw9IiMyODkxZmEiLz48cGF0aCBkPSJtMzgyLjkzMSAzMTQuMzM1Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjMGY4NGZhIi8+PHBhdGggZD0ibTUwMSAyNzMuMTIzYzAgNS45MjYtMzAuMDI0IDEwLjcyOS02Ny4wNiAxMC43MjlzLTY3LjA2LTQuODAzLTY3LjA2LTEwLjcyOXYtMzQuMjQ2aDEzNC4xMjF2MzQuMjQ2eiIgZmlsbD0iIzQzYTJmZiIvPjxwYXRoIGQ9Im0zODIuOTMxIDI4MC4wODhjLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDYtMTYuMDUyLTYuOTY1di0zNC4yNDZoMTYuMDUyeiIgZmlsbD0iIzI4OTFmYSIvPjxwYXRoIGQ9Im01MDEgMjM4Ljg3N2MwIDUuOTI2LTMwLjAyNCAxMC43MjktNjcuMDYgMTAuNzI5cy02Ny4wNi00LjgwNC02Ny4wNi0xMC43Mjl2LTM0LjI0NmgxMzQuMTIxdjM0LjI0NnoiIGZpbGw9IiM2M2I2ZmYiLz48cGF0aCBkPSJtMzgyLjkzMSAyNDUuODQyYy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjNDNhMmZmIi8+PHBhdGggZD0ibTQzMy45NCAyMTUuMzZjMzYuOTM1IDAgNjcuMDYtNC44MiA2Ny4wNi0xMC43M3MtMzAuMTI1LTEwLjcyOS02Ny4wNi0xMC43MjktNjcuMDYgNC44Mi02Ny4wNiAxMC43MjkgMzAuMTI1IDEwLjczIDY3LjA2IDEwLjczeiIgZmlsbD0iIzcwYzFmOSIvPjxwYXRoIGQ9Im0zODIuOTMxIDIxMS41OTVjLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDctMTYuMDUyLTYuOTY1IDAtNS4zOTMgMjQuODczLTkuODU3IDU3LjI2NS0xMC42MTUtMjcuMDQxIDEuNDU4LTQwLjc3OSA3LjMxOC00MS4yMTMgMTcuNTh6IiBmaWxsPSIjNjNiNmZmIi8+PC9nPjxnPjxwYXRoIGQ9Im0xNDUuMTIxIDMwNy4zN2MwIDUuOTI2LTMwLjAyNCAxMC43My02Ny4wNiAxMC43M3MtNjcuMDYtNC44MDQtNjcuMDYtMTAuNzN2LTM0LjI0N2gxMzQuMTJ6IiBmaWxsPSIjZmI1NDVjIi8+PHBhdGggZD0ibTI3LjA1MiAzMTQuMzM1Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ3aDE2LjA1MnY0MS4yMTF6IiBmaWxsPSIjZjA0MTRhIi8+PHBhdGggZD0ibTE0NS4xMjEgMjczLjEyM2MwIDUuOTI2LTMwLjAyNCAxMC43MjktNjcuMDYgMTAuNzI5cy02Ny4wNi00LjgwMy02Ny4wNi0xMC43Mjl2LTM0LjI0NmgxMzQuMTJ6IiBmaWxsPSIjZmM2ZDc0Ii8+PHBhdGggZD0ibTI3LjA1MiAyODAuMDg4Yy0xMC4wMDctMS44NzQtMTYuMDUyLTQuMzA2LTE2LjA1Mi02Ljk2NXYtMzQuMjQ2aDE2LjA1MnoiIGZpbGw9IiNmYjU0NWMiLz48cGF0aCBkPSJtMTQ1LjEyMSAyMzguODc3YzAgNS45MjYtMzAuMDI0IDEwLjcyOS02Ny4wNiAxMC43MjlzLTY3LjA2LTQuODA0LTY3LjA2LTEwLjcyOXYtMzQuMjQ2aDEzNC4xMnoiIGZpbGw9IiNmZjgyODgiLz48cGF0aCBkPSJtMjcuMDUyIDI0NS44NDJjLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDYtMTYuMDUyLTYuOTY1di0zNC4yNDdoMTYuMDUydjQxLjIxMXoiIGZpbGw9IiNmYzZkNzQiLz48cGF0aCBkPSJtNzguMDYgMjE1LjM2YzM2LjkzNSAwIDY3LjA2LTQuODIgNjcuMDYtMTAuNzNzLTMwLjEyNS0xMC43MjktNjcuMDYtMTAuNzI5LTY3LjA2IDQuODItNjcuMDYgMTAuNzI5IDMwLjEyNSAxMC43MyA2Ny4wNiAxMC43M3oiIGZpbGw9IiNmZjllYTMiLz48cGF0aCBkPSJtMjcuMDUyIDIxMS41OTVjLTEwLjAwNy0xLjg3NC0xNi4wNTItNC4zMDctMTYuMDUyLTYuOTY1IDAtNS4zOTMgMjQuODcyLTkuODU3IDU3LjI2NS0xMC42MTUtMjcuMDQxIDEuNDU4LTQwLjc3OSA3LjMxOC00MS4yMTMgMTcuNTh6IiBmaWxsPSIjZmY4Mjg4Ii8+PC9nPjxwYXRoIGQ9Im00MDEuNDQgMzY4LjQ3Yy0zLjE3MS45NDUtNi41MDgtLjg2LTcuNDUzLTQuMDMxLS45NDQtMy4xNzEuODYtNi41MDkgNC4wMzEtNy40NTNsMjYuMjA3LTcuOGMzLjgxOS0xLjEzOCA3LjYyNyAxLjcwNCA3LjcwMiA1LjYzMWwyLjUgMjcuNTk0Yy4yOTggMy4yODctMi4xMjYgNi4xOTUtNS40MTQgNi40OTItMy4yODguMjk4LTYuMTk1LTIuMTI2LTYuNDkzLTUuNDE0bC0uOTY5LTEwLjcwNWMtNy43ODMgMTEuMDE4LTE2LjYzMSAyMS4yMTktMjYuMzkyIDMwLjQ0OS0xMi43MjggMTIuMDM3LTI3LjA0IDIyLjQ0OS00Mi41OTYgMzAuODk5LTIuODk5IDEuNTc5LTYuNTMxLjUwOC04LjExLTIuMzktMS41NzktMi44OTktLjUwOC02LjUzIDIuMzkxLTguMTA5IDE0LjYxNS03LjkzOSAyOC4wOTMtMTcuNzUxIDQwLjExMi0yOS4xMTggOS4zNzktOC44NjkgMTcuODUyLTE4LjY3MSAyNS4yNjktMjkuMjU0bC0xMC43ODUgMy4yMXptLTI1Ny45MSAzMi45NzFjLS45NDUtMy4xNzEuODYtNi41MDggNC4wMzEtNy40NTNzNi41MDkuODYgNy40NTMgNC4wMzFsNy44IDI2LjIwN2MxLjEzOCAzLjgxOS0xLjcwNCA3LjYyNy01LjYzMSA3LjcwM2wtMjcuNTk0IDIuNWMtMy4yODcuMjk4LTYuMTk0LTIuMTI2LTYuNDkyLTUuNDE0czIuMTI2LTYuMTk1IDUuNDE0LTYuNDkzbDEwLjcwNS0uOTY5Yy0xMS4wMTgtNy43ODMtMjEuMjE5LTE2LjYzMi0zMC40NS0yNi4zOTMtMTIuMDM3LTEyLjcyOC0yMi40NDktMjcuMDM5LTMwLjg5OS00Mi41OTYtMS41NzktMi44OTktLjUwOC02LjUzMSAyLjM5MS04LjExczYuNTMtLjUwOCA4LjEwOSAyLjM5MWM3LjkzOSAxNC42MTUgMTcuNzUxIDI4LjA5MyAyOS4xMTggNDAuMTEyIDguODY5IDkuMzc5IDE4LjY3MSAxNy44NTIgMjkuMjU0IDI1LjI2OWwtMy4yMS0xMC43ODV6bS0zMi45NzEtMjU3LjkxYzMuMTcxLS45NDUgNi41MDguODYgNy40NTMgNC4wMzFzLS44NiA2LjUwOS00LjAzMSA3LjQ1M2wtMjYuMjA3IDcuOGMtMy44MTkgMS4xMzgtNy42MjctMS43MDQtNy43MDItNS42MzFsLTIuNS0yNy41OTRjLS4yOTgtMy4yODcgMi4xMjYtNi4xOTQgNS40MTQtNi40OTJzNi4xOTQgMi4xMjYgNi40OTIgNS40MTRsLjk2OSAxMC43MDVjNy43ODMtMTEuMDE4IDE2LjYzMi0yMS4yMTkgMjYuMzkyLTMwLjQ0OSAxMi43MjgtMTIuMDM3IDI3LjAzOS0yMi40NDkgNDIuNTk3LTMwLjg5OSAyLjktMS41NzkgNi41MzEtLjUwOSA4LjExIDIuMzkxcy41MDggNi41My0yLjM5MSA4LjEwOWMtMTQuNjE1IDcuOTM5LTI4LjA5MiAxNy43NTEtNDAuMTEyIDI5LjExOC05LjM3OCA4Ljg2OS0xNy44NTIgMTguNjcxLTI1LjI2OSAyOS4yNTR6bTI1Ny45MDItMzIuOTdjLjk0NSAzLjE3MS0uODYgNi41MDgtNC4wMzEgNy40NTNzLTYuNTA4LS44Ni03LjQ1My00LjAzMWwtNy44LTI2LjIwN2MtMS4xMzgtMy44MTkgMS43MDQtNy42MjcgNS42MzEtNy43MDNsMjcuNTkzLTIuNDk5YzMuMjg4LS4yOTggNi4xOTUgMi4xMjYgNi40OTIgNS40MTQuMjk4IDMuMjg4LTIuMTI2IDYuMTk1LTUuNDE0IDYuNDkybC0xMC43MDYuOTdjMTEuMDE4IDcuNzgzIDIxLjIxOSAxNi42MzIgMzAuNDUgMjYuMzkzIDEyLjAzNyAxMi43MjggMjIuNDQ5IDI3LjAzOSAzMC44OTkgNDIuNTk2IDEuNTc5IDIuODk5LjUwOCA2LjUzLTIuMzkxIDguMTA5cy02LjUzLjUwOS04LjEwOS0yLjM5MWMtNy45MzktMTQuNjE1LTE3Ljc1MS0yOC4wOTItMjkuMTE4LTQwLjExMi04Ljg2OS05LjM3OS0xOC42NzEtMTcuODUyLTI5LjI1NC0yNS4yN2wzLjIxIDEwLjc4NnoiIGZpbGw9IiMzZDRhNzUiLz48L2c+PC9zdmc+",
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
    short: "PA", color: "#FF7A00", icon: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZGF0YS1uYW1lPSJMYXllciAxIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im0xMjQuODg0IDkwLjg5NmMtNDQuNjE3IDAtODAuNzg4IDM2LjE3LTgwLjc4OCA4MC43ODdzMzYuMTcgODAuNzg3IDgwLjc4OCA4MC43ODdoMjYyLjIzM2M0NC42MTggMCA4MC43ODgtMzYuMTcgODAuNzg4LTgwLjc4N3MtMzYuMTctODAuNzg3LTgwLjc4OC04MC43ODdjLTcuNTY4IDAtMTQuODgyIDEuMDQ5LTIxLjgyNyAyLjk3Ni0xMi44OTctNDguMzAyLTU2Ljk0OC04My44NzctMTA5LjMwNC04My44NzdzLTk2LjM3OCAzNS41NzUtMTA5LjI3NiA4My44NzdjLTYuOTQ1LTEuOTI3LTE0LjI1OC0yLjk3Ni0yMS44MjctMi45NzZ6IiBmaWxsPSIjZTFkYWU3Ii8+PHBhdGggZD0ibTEyNC44ODQgOTAuODk2Yy00NC42MTcgMC04MC43ODggMzYuMTctODAuNzg4IDgwLjc4N3MzNi4xNyA4MC43ODcgODAuNzg4IDgwLjc4N2gyNjIuMjMzYzEzLjg2MSAwIDI2Ljg3My0zLjQ4NyAzOC4yNjgtOS42MzggMTQuNTctMTQuMjAyIDIzLjY0MS0zNC4wMTYgMjMuNjQxLTU1Ljk4NCAwLTQzLjE0My0zNS4wMDgtNzguMTUxLTc4LjE1MS03OC4xNTEtNy4zNDIgMC0xNC40MjkgMS4wMi0yMS4xNDYgMi44OTEtMTIuNDQ0LTQ2LjcxNS01NS4wNzctODEuMTI4LTEwNS43MDQtODEuMTI4LTQwLjE2NyAwLTc1LjI2IDIxLjYyOC05NC4yOCA1My44NTgtMS4xNjIgMy4xMTgtMi4xNTQgNi4zMjEtMy4wMzMgOS41NTMtNi45NDUtMS45MjctMTQuMjU4LTIuOTc2LTIxLjgyNy0yLjk3NnoiIGZpbGw9IiNlYmU2ZWYiLz48cGF0aCBkPSJtNDQxLjQyOCAzMTYuNTkxdjIxLjAzM2MwIDYuNjMzLTQuMzM3IDEyLjI3NC0xMC43NDMgMTMuOTc1bC0yNi40MTkgNy4wODdjLTMuMjAzIDExLjM2Ny03Ljc2NyAyMi40NS0xMy42MzUgMzIuOTk1bDEzLjY2MyAyMy42NDFjMy4zMTYgNS43NTQgMi4zODEgMTIuNzg0LTIuMjk2IDE3LjQ5bC0xNC44ODIgMTQuODgyLTE0Ljg4MiAxNC44ODJjLTQuNzA2IDQuNzA2LTExLjczNSA1LjYxMy0xNy40OSAyLjI5NmwtMjMuNjY5LTEzLjY2M2MtMTAuNTE3IDUuODk2LTIxLjYgMTAuNDMxLTMyLjk2NyAxMy42MzVsLTcuMDg2IDI2LjQxOWMtMS43MjkgNi40MzUtNy4zNDIgMTAuNzQzLTEzLjk3NSAxMC43NDNoLTQyLjA5NGMtNi42MzMgMC0xMi4yNzQtNC4zMDktMTMuOTc1LTEwLjc0M2wtNy4wODYtMjYuNDE5Yy0xMS4zNjctMy4yMDMtMjIuNDUtNy43NjctMzIuOTk1LTEzLjYzNWwtMjMuNjQxIDEzLjY2M2MtNS43NTQgMy4zMTctMTIuNzg0IDIuNDEtMTcuNDktMi4yOTZsLTE0Ljg4Mi0xNC44ODItMTQuODgyLTE0Ljg4MmMtNC43MDYtNC43MDYtNS42MTMtMTEuNzM2LTIuMjk2LTE3LjQ5bDEzLjY2My0yMy42NjljLTUuODY4LTEwLjUxNy0xMC40MzEtMjEuNi0xMy42MzUtMzIuOTY3bC0yNi40MTgtNy4wODdjLTYuNDM1LTEuNzAxLTEwLjc0NC03LjM0Mi0xMC43NDQtMTMuOTc1di0yMS4wMzNoOTEuMjQ4YzAgNTEuOTg3IDQyLjE3OSA5NC4xNjcgOTQuMTY3IDk0LjE2N3M5NC4xNjctNDIuMTggOTQuMTY3LTk0LjE2N2g5MS4yNzZ6IiBmaWxsPSIjOTk5MmEzIi8+PHBhdGggZD0ibTQ0MS40MjggMzE2LjU5MXYyMS4wMzNjMCA2LjYzMy00LjMzNyAxMi4yNzQtMTAuNzQzIDEzLjk3NWwtMjYuNDE5IDcuMDg3Yy0zLjIwMyAxMS4zNjctNy43NjcgMjIuNDUtMTMuNjM1IDMyLjk5NWwxMy42NjMgMjMuNjQxYzMuMzE2IDUuNzU0IDIuMzgxIDEyLjc4NC0yLjI5NiAxNy40OWwtMTQuODgyIDE0Ljg4Mi0xNC44ODIgMTQuODgyYy00LjcwNiA0LjcwNi0xMS43MzUgNS42MTMtMTcuNDkgMi4yOTZsLTIzLjY2OS0xMy42NjNjLTEwLjUxNyA1Ljg5Ni0yMS42IDEwLjQzMS0zMi45NjcgMTMuNjM1bC03LjA4NiAyNi40MTljLTEuNzI5IDYuNDM1LTcuMzQyIDEwLjc0My0xMy45NzUgMTAuNzQzaC00Mi4wOTRjLTYuNjMzIDAtMTIuMjc0LTQuMzA5LTEzLjk3NS0xMC43NDNsLTcuMDg2LTI2LjQxOWM1NC4xNDIgMS43ODYgMTA0LjkzOC0yNi4wNzkgMTMyLjU0OC03Mi42OCAxMy43NzYtMjMuMzAxIDIwLjY5My00OS40MzYgMjAuNjkzLTc1LjU3Mmg3NC4yOTZ6IiBmaWxsPSIjODY4MDhmIi8+PHBhdGggZD0ibTE5NC43MDEgMzE2LjU5MWMwIDMzLjg0NiAyNy40MzkgNjEuMjg1IDYxLjI4NSA2MS4yODVzNjEuMjg1LTI3LjQzOSA2MS4yODUtNjEuMjg1eiIgZmlsbD0iI2ZmYjEyMiIvPjxwYXRoIGQ9Im0xOTQuNzAxIDMxNi41OTFjMCAyNy42MzggMTguMzEyIDUxLjAyNCA0My40ODMgNTguNjQ5IDI1LjE3MS03LjYyNSA0My40ODMtMzEuMDExIDQzLjQ4My01OC42NDloLTg2Ljk2N3oiIGZpbGw9IiNmZmM3MzgiLz48L2c+PHBhdGggZD0ibTI1MC4wMDUgMTIzLjA5OGMwLTMuMzE3IDIuNjkzLTYuMDEgNS45ODEtNi4wMSAzLjMxNiAwIDYuMDA5IDIuNjkzIDYuMDA5IDYuMDF2MTY0LjQzOGMwIDMuMzE3LTIuNjkzIDYuMDEtNi4wMDkgNi4wMS0zLjI4OSAwLTUuOTgxLTIuNjkzLTUuOTgxLTYuMDF6bS0xMTYuODQ0IDU0LjU2N2MtMy4zMTYgMC01Ljk4MS0yLjY2NS01Ljk4MS01Ljk4MXMyLjY2NS02LjAxIDUuOTgxLTYuMDFoNTguNzM0YzEuNjczIDAgMy4yMDMuNjggNC4yODEgMS44MTRsMjguMDYzIDI4LjA2M2MxLjE5IDEuMTYyIDEuNzU3IDIuNjkzIDEuNzU3IDQuMjI0djg3Ljc2YzAgMy4zMTctMi42OTMgNi4wMS01Ljk4MSA2LjAxLTMuMzE3IDAtNi4wMS0yLjY5My02LjAxLTYuMDF2LTg1LjI2NmwtMjQuNjA0LTI0LjYwNWgtNTYuMjR6bTI0NS42NTEtMTEuOTljMy4zMTYgMCA2LjAwOSAyLjY5MyA2LjAwOSA2LjAxcy0yLjY5MyA1Ljk4MS02LjAwOSA1Ljk4MWgtNTYuMjExbC0yNC42MDQgMjQuNjA1djg1LjI2NmMwIDMuMzE3LTIuNjkzIDYuMDEtNi4wMDkgNi4wMXMtNS45ODEtMi42OTMtNS45ODEtNi4wMXYtODcuNzZjMC0xLjUzMS41NjctMy4wNjIgMS43NTgtNC4yMjRsMjguMDYzLTI4LjA2M2MxLjA3Ny0xLjEzNCAyLjYwNy0xLjgxNCA0LjI4LTEuODE0aDU4LjcwNnoiIGZpbGw9IiM5OTkyYTMiLz48cGF0aCBkPSJtMzg3LjExNiAxNDQuNDcxYy0xNS4wMjMgMC0yNy4xODQgMTIuMTg5LTI3LjE4NCAyNy4yMTNzMTIuMTYxIDI3LjE4NCAyNy4xODQgMjcuMTg0IDI3LjE4NS0xMi4xNjEgMjcuMTg1LTI3LjE4NC0xMi4xNjEtMjcuMjEzLTI3LjE4NS0yNy4yMTN6bS0yNjIuMjMzIDBjMTUuMDIzIDAgMjcuMTg0IDEyLjE4OSAyNy4xODQgMjcuMjEzcy0xMi4xNjEgMjcuMTg0LTI3LjE4NCAyNy4xODQtMjcuMjEzLTEyLjE2MS0yNy4yMTMtMjcuMTg0IDEyLjE4OS0yNy4yMTMgMjcuMjEzLTI3LjIxM3ptMTMxLjEwMy00OC41NThjLTE0Ljk5NiAwLTI3LjE4NSAxMi4xNjEtMjcuMTg1IDI3LjE4NHMxMi4xODkgMjcuMTg0IDI3LjE4NSAyNy4xODQgMjcuMjEyLTEyLjE2MSAyNy4yMTItMjcuMTg0LTEyLjE4OS0yNy4xODQtMjcuMjEyLTI3LjE4NHoiIGZpbGw9IiNmZmM3MzgiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==",
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
    short: "SP", color: "#00CB5D", icon: "data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48Zz48Zz48Zz48cGF0aCBkPSJtNTEwLjEyNSA5Mi44MzN2LTE5LjU1YzAtMy43OTItMi43NTktNy4wMjEtNi41MDQtNy42MTJsLTEwLjQ3MS0xLjY1M2MtMi4xNjgtLjM0Mi00LjAxMS0xLjgwNS00Ljc4NC0zLjg1OS0uNTM3LTEuNDI3LTEuMTIzLTIuODMtMS43NTUtNC4yMDctLjkyMS0yLjAwNy0uNjYtNC4zNTkuNjM5LTYuMTQ1bDYuMjQ0LTguNTg2YzIuMjMtMy4wNjcgMS44OTgtNy4zLS43ODMtOS45ODJsLTEzLjgyNC0xMy44MjRjLTIuNjgxLTIuNjgxLTYuOTE1LTMuMDE0LTkuOTgyLS43ODNsLTguNTg2IDYuMjQ0Yy0xLjc4NiAxLjI5OS00LjEzNyAxLjU1OS02LjE0NS42MzktMS4zNzgtLjYzMi0yLjc4LTEuMjE4LTQuMjA3LTEuNzU1LTIuMDU1LS43NzMtMy41MTctMi42MTYtMy44NTktNC43ODRsLTEuNjUzLTEwLjQ3MWMtLjU5Mi0zLjc0Ni0zLjgyMS02LjUwNS03LjYxMy02LjUwNWgtMTkuNTVjLTMuNzkyIDAtNy4wMjEgMi43NTktNy42MTIgNi41MDRsLTEuNjUzIDEwLjQ3MWMtLjM0MiAyLjE2OC0xLjgwNSA0LjAxMS0zLjg1OSA0Ljc4NC0xLjQyNy41MzctMi44MyAxLjEyMy00LjIwNyAxLjc1NS0yLjAwNy45MjEtNC4zNTkuNjYtNi4xNDUtLjYzOWwtOC41ODYtNi4yNDRjLTMuMDY3LTIuMjMtNy4zLTEuODk4LTkuOTgyLjc4M2wtMTMuODI0IDEzLjgyNGMtMi42ODEgMi42ODEtMy4wMTQgNi45MTUtLjc4MyA5Ljk4Mmw2LjI0NCA4LjU4NmMxLjI5OSAxLjc4NiAxLjU2IDQuMTM3LjYzOSA2LjE0NS0uNjMyIDEuMzc4LTEuMjE4IDIuNzgxLTEuNzU1IDQuMjA3LS43NzMgMi4wNTUtMi42MTYgMy41MTctNC43ODQgMy44NTlsLTEwLjQ3MSAxLjY1M2MtMy43NDYuNTkxLTYuNTA0IDMuODItNi41MDQgNy42MTJ2MTkuNTVjMCAzLjc5MiAyLjc1OSA3LjAyMSA2LjUwNCA3LjYxMmwxMC40NzEgMS42NTNjMi4xNjguMzQyIDQuMDExIDEuODA1IDQuNzg0IDMuODU5LjUzNyAxLjQyNyAxLjEyMyAyLjgzIDEuNzU1IDQuMjA3LjkyMSAyLjAwNy42NiA0LjM1OS0uNjM5IDYuMTQ1bC02LjI0NCA4LjU4NmMtMi4yMyAzLjA2Ny0xLjg5OCA3LjMuNzgzIDkuOTgybDEzLjgyNCAxMy44MjRjMi42ODEgMi42ODEgNi45MTUgMy4wMTQgOS45ODIuNzgzbDguNTg2LTYuMjQ0YzEuNzg2LTEuMjk5IDQuMTM3LTEuNTU5IDYuMTQ1LS42MzkgMS4zNzguNjMyIDIuNzggMS4yMTggNC4yMDcgMS43NTUgMi4wNTUuNzczIDMuNTE3IDIuNjE2IDMuODU5IDQuNzg0bDEuNjUzIDEwLjQ3MWMuNTkxIDMuNzQ2IDMuODIgNi41MDQgNy42MTIgNi41MDRoMTkuNTVjMy43OTIgMCA3LjAyMS0yLjc1OSA3LjYxMi02LjUwNGwxLjY1My0xMC40NzFjLjM0Mi0yLjE2OCAxLjgwNS00LjAxMSAzLjg1OS00Ljc4NCAxLjQyNy0uNTM3IDIuODMtMS4xMjMgNC4yMDctMS43NTUgMi4wMDctLjkyMSA0LjM1OS0uNjYgNi4xNDUuNjM5bDguNTg2IDYuMjQ0YzMuMDY3IDIuMjMgNy4zIDEuODk4IDkuOTgyLS43ODNsMTMuODI0LTEzLjgyNGMyLjY4MS0yLjY4MSAzLjAxNC02LjkxNS43ODMtOS45ODJsLTYuMjQ0LTguNTg2Yy0xLjI5OS0xLjc4Ni0xLjU1OS00LjEzNy0uNjM5LTYuMTQ1LjYzMi0xLjM3OCAxLjIxOC0yLjc4IDEuNzU1LTQuMjA3Ljc3My0yLjA1NSAyLjYxNi0zLjUxNyA0Ljc4NC0zLjg1OWwxMC40NzEtMS42NTNjMy43NDYtLjU5MSA2LjUwNS0zLjgxOSA2LjUwNS03LjYxMXptLTgzLjA1OCAxNy45MTFjLTE1LjI5MSAwLTI3LjY4Ni0xMi4zOTUtMjcuNjg2LTI3LjY4NnMxMi4zOTUtMjcuNjg2IDI3LjY4Ni0yNy42ODYgMjcuNjg2IDEyLjM5NSAyNy42ODYgMjcuNjg2YzAgMTUuMjktMTIuMzk1IDI3LjY4Ni0yNy42ODYgMjcuNjg2eiIgZmlsbD0iIzYwYjdmZiIvPjwvZz48Zz48cGF0aCBkPSJtNTAzLjYyMSA2NS42NzEtMTAuNDcxLTEuNjUzYy0yLjE2OC0uMzQyLTQuMDExLTEuODA1LTQuNzg0LTMuODU5LS41MzctMS40MjctMS4xMjMtMi44My0xLjc1NS00LjIwNy0uOTIxLTIuMDA3LS42Ni00LjM1OS42MzktNi4xNDVsNi4yNDQtOC41ODZjMi4yMy0zLjA2NyAxLjg5OC03LjMtLjc4My05Ljk4MmwtMTMuODI0LTEzLjgyNGMtMS44OTktMS44OTktNC41NzUtMi42MTMtNy4wNjYtMi4wOCA2LjI4OSAxMS42OTUgOS44NiAyNS4wNjkgOS44NiAzOS4yNzggMCA0NS44NzItMzcuMTg2IDgzLjA1OC04My4wNTggODMuMDU4LTE0LjIwOSAwLTI3LjU4Mi0zLjU3MS0zOS4yNzgtOS44Ni0uNTMzIDIuNDkuMTgxIDUuMTY3IDIuMDggNy4wNjZsMTMuODI0IDEzLjgyNGMyLjY4MSAyLjY4MSA2LjkxNSAzLjAxNCA5Ljk4Mi43ODNsOC41ODYtNi4yNDRjMS43ODYtMS4yOTkgNC4xMzctMS41NTkgNi4xNDQtLjYzOSAxLjM3OC42MzIgMi43OCAxLjIxOCA0LjIwNyAxLjc1NSAyLjA1NS43NzMgMy41MTcgMi42MTYgMy44NTkgNC43ODRsMS42NTMgMTAuNDcxYy41OTEgMy43NDYgMy44MiA2LjUwNCA3LjYxMiA2LjUwNGgxOS41NWMzLjc5MiAwIDcuMDIxLTIuNzU5IDcuNjEyLTYuNTA0bDEuNjUzLTEwLjQ3MWMuMzQyLTIuMTY4IDEuODA1LTQuMDExIDMuODU5LTQuNzg0IDEuNDI3LS41MzcgMi44My0xLjEyMyA0LjIwNy0xLjc1NSAyLjAwNy0uOTIxIDQuMzU5LS42NiA2LjE0NS42MzlsOC41ODYgNi4yNDRjMy4wNjcgMi4yMyA3LjMgMS44OTggOS45ODItLjc4M2wxMy44MjQtMTMuODI0YzIuNjgxLTIuNjgxIDMuMDE0LTYuOTE1Ljc4My05Ljk4MmwtNi4yNDQtOC41ODZjLTEuMjk5LTEuNzg2LTEuNTU5LTQuMTM3LS42MzktNi4xNDUuNjMyLTEuMzc4IDEuMjE4LTIuNzggMS43NTUtNC4yMDcuNzczLTIuMDU1IDIuNjE2LTMuNTE3IDQuNzg0LTMuODU5bDEwLjQ3MS0xLjY1M2MzLjc0Ni0uNTkxIDYuNTA0LTMuODIgNi41MDQtNy42MTJ2LTE5LjU1Yy4wMDEtMy43OTItMi43NTgtNy4wMi02LjUwMy03LjYxMnoiIGZpbGw9IiMyNmE2ZmUiLz48L2c+PC9nPjxnPjxnPjxjaXJjbGUgY3g9Ijg4LjY4MyIgY3k9IjM1LjU5NiIgZmlsbD0iI2ZlZDJhNCIgcj0iMzUuNTk2Ii8+PC9nPjxnPjxwYXRoIGQ9Im04OC42ODMgNzEuMTkzYy0zMi4yNjQuMDAxLTU4LjQyMSAyNi4xNDYtNTguNDIxIDU4LjQxdjE5LjQ3NGMwIDkuNDExIDcuNjI5IDE3LjAzOSAxNy4wMzkgMTcuMDM5aDgyLjc2M2M5LjQxMSAwIDE3LjAzOS03LjYyOSAxNy4wMzktMTcuMDM5di0xOS40NzRjLjAwMS0zMi4yNjQtMjYuMTU2LTU4LjQwOS01OC40Mi01OC40MXoiIGZpbGw9IiNmZDgwODciLz48L2c+PGc+PHBhdGggZD0ibTg4LjY4MyA3MS4xOTNjLTQuNTk0IDAtOS4wNjEuNTM4LTEzLjM0OSAxLjU0MiAyNS44NDcgNi4wMjUgNDUuMTEgMjkuMTg2IDQ1LjExIDU2Ljg2OXYxOS40NzNjMCA5LjQxMS03LjYyOSAxNy4wNC0xNy4wMzkgMTcuMDRoMjYuNjYxYzkuNDExIDAgMTcuMDM5LTcuNjI5IDE3LjAzOS0xNy4wNHYtMTkuNDczYy0uMDAxLTMyLjI2NS0yNi4xNTgtNTguNDEtNTguNDIyLTU4LjQxMXoiIGZpbGw9IiNmZTY0NmYiLz48L2c+PC9nPjxnPjxnPjxjaXJjbGUgY3g9IjI1Ny44NzUiIGN5PSIyNTIuMjUiIGZpbGw9IiMwMGYyYTYiIHI9IjgzLjA1OCIvPjwvZz48Zz48cGF0aCBkPSJtMzExLjE5OSAxODguNTg0YzUuODgzIDExLjM5OCA5LjIyNiAyNC4zMiA5LjIyNiAzOC4wMzEgMCA0NS44NzItMzcuMTg2IDgzLjA1OC04My4wNTggODMuMDU4LTIwLjMwMyAwLTM4Ljg5NS03LjI5NC01My4zMjQtMTkuMzkyIDEzLjggMjYuNzM2IDQxLjY3MSA0NS4wMjcgNzMuODMyIDQ1LjAyNyA0NS44NzIgMCA4My4wNTgtMzcuMTg2IDgzLjA1OC04My4wNTggMC0yNS41NjktMTEuNTYyLTQ4LjQzLTI5LjczNC02My42NjZ6IiBmaWxsPSIjMGVkMjkwIi8+PC9nPjxnPjxnPjxwYXRoIGQ9Im0yMzguMjk4IDI0MS4xMjUgMTEuNjAxIDExLjYwMSAyNy41NTMtMjcuNTUzYzYuNDA3LTYuNDA3IDE2Ljc5NS02LjQwNyAyMy4yMDIgMCA2LjQwNyA2LjQwNyA2LjQwNyAxNi43OTUgMCAyMy4yMDJsLTM5LjE1NCAzOS4xNTVjLTYuNDA3IDYuNDA3LTE2Ljc5NSA2LjQwNy0yMy4yMDIgMGwtMjMuMjAyLTIzLjIwMmMtNi40MDctNi40MDctNi40MDctMTYuNzk1IDAtMjMuMjAyIDYuNDA3LTYuNDA4IDE2Ljc5NS02LjQwOCAyMy4yMDItLjAwMXoiIGZpbGw9IiNlYWY2ZmYiLz48L2c+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJtMTU0LjMwOSA1MDQuNWgtMTMxLjI1MnYtMTQ5LjcwOWMwLTkuMDYxIDcuMzQ1LTE2LjQwNyAxNi40MDctMTYuNDA3aDk4LjQzOWM5LjA2MSAwIDE2LjQwNyA3LjM0NSAxNi40MDcgMTYuNDA3djE0OS43MDl6IiBmaWxsPSIjN2E2ZDc5Ii8+PC9nPjxnPjxwYXRoIGQ9Im0xNTQuMzA5IDM1NC43OTFjMC05LjA2MS03LjM0NS0xNi40MDctMTYuNDA3LTE2LjQwN2gtMjYuNjYxYzkuMDYxIDAgMTYuNDA3IDcuMzQ2IDE2LjQwNyAxNi40MDd2MTQ5LjcwOWgyNi42NjF6IiBmaWxsPSIjNjg1ZTY4Ii8+PC9nPjwvZz48Zz48cGF0aCBkPSJtMzk0LjI1NCAzODMuNTAydjEwOC42OTNjMCA2Ljc5NiA1LjUwOSAxMi4zMDUgMTIuMzA1IDEyLjMwNWg3NS44OGM2Ljc5NiAwIDEyLjMwNS01LjUwOSAxMi4zMDUtMTIuMzA1di0xMDguNjkzYzAtNi43OTYtNS41MDktMTIuMzA1LTEyLjMwNS0xMi4zMDVoLTc1Ljg4Yy02Ljc5NiAwLTEyLjMwNSA1LjUwOS0xMi4zMDUgMTIuMzA1eiIgZmlsbD0iI2M0ZTJmZiIvPjwvZz48Zz48cGF0aCBkPSJtMzYxLjQ0MSAzNTAuNjg5djEwOC42OTNjMCA2Ljc5NiA1LjUwOSAxMi4zMDUgMTIuMzA1IDEyLjMwNWg3NS44OGM2Ljc5NiAwIDEyLjMwNS01LjUwOSAxMi4zMDUtMTIuMzA1di05NS4zOTNjMC0zLjI2My0xLjI5Ni02LjM5My0zLjYwNC04LjcwMWwtMTMuMy0xMy4zYy0yLjMwOC0yLjMwOC01LjQzNy0zLjYwNC04LjcwMS0zLjYwNGgtNjIuNThjLTYuNzk2IDAtMTIuMzA1IDUuNTA5LTEyLjMwNSAxMi4zMDV6IiBmaWxsPSIjZWFmNmZmIi8+PC9nPjwvZz48Zz48cGF0aCBkPSJtODYuMTE5IDQ2NC4xODdjLTQuMTQyIDAtNy41IDMuMzU3LTcuNSA3LjV2MzIuODEzaDE1di0zMi44MTNjMC00LjE0My0zLjM1OC03LjUtNy41LTcuNXoiIGZpbGw9IiM2MGI3ZmYiLz48Zz48cGF0aCBkPSJtMTIxLjQ5NiAzNzguNjk3aC02NS42MjZjLTQuMTQyIDAtNy41LTMuMzU3LTcuNS03LjVzMy4zNTgtNy41IDcuNS03LjVoNjUuNjI2YzQuMTQyIDAgNy41IDMuMzU3IDcuNSA3LjVzLTMuMzU4IDcuNS03LjUgNy41eiIgZmlsbD0iIzYwYjdmZiIvPjwvZz48Zz48cGF0aCBkPSJtMTIxLjQ5NiA0MTIuMTkzaC02NS42MjZjLTQuMTQyIDAtNy41LTMuMzU3LTcuNS03LjVzMy4zNTgtNy41IDcuNS03LjVoNjUuNjI2YzQuMTQyIDAgNy41IDMuMzU3IDcuNSA3LjVzLTMuMzU4IDcuNS03LjUgNy41eiIgZmlsbD0iIzYwYjdmZiIvPjwvZz48Zz48cGF0aCBkPSJtMTIxLjQ5NiA0NDUuNjkxaC02NS42MjZjLTQuMTQyIDAtNy41LTMuMzU3LTcuNS03LjVzMy4zNTgtNy41IDcuNS03LjVoNjUuNjI2YzQuMTQyIDAgNy41IDMuMzU3IDcuNSA3LjVzLTMuMzU4IDcuNS03LjUgNy41eiIgZmlsbD0iIzYwYjdmZiIvPjwvZz48ZyBmaWxsPSIjZmZkMTViIj48cGF0aCBkPSJtMjg0LjcxMSA1My4xNDVjLTIuOTI4LTIuOTI4LTcuNjc3LTIuOTI5LTEwLjYwNi4wMDEtMi45MjkgMi45MjktMi45MjkgNy42NzguMDAxIDEwLjYwNmwxMS44MDYgMTEuODA2aC03NC4xOGMtNC4xNDIgMC03LjUgMy4zNTctNy41IDcuNXMzLjM1OCA3LjUgNy41IDcuNWg3NC4xOGwtMTEuODA3IDExLjgwN2MtMi45MjkgMi45My0yLjkyOSA3LjY3OCAwIDEwLjYwNyAxLjQ2NSAxLjQ2NCAzLjM4NSAyLjE5NiA1LjMwNCAyLjE5NnMzLjgzOS0uNzMyIDUuMzA0LTIuMTk2bDI0LjYxLTI0LjYxYzEuNDA2LTEuNDA3IDIuMTk2LTMuMzE0IDIuMTk2LTUuMzA0cy0uNzktMy44OTYtMi4xOTctNS4zMDR6Ii8+PHBhdGggZD0ibTQ1Ni45OCAyNjguNDhjLTIuOTI4LTIuOTI4LTcuNjc3LTIuOTI5LTEwLjYwNi4wMDFsLTExLjgwNiAxMS44MDZ2LTc0LjE4YzAtNC4xNDMtMy4zNTctNy41LTcuNS03LjVzLTcuNSAzLjM1Ny03LjUgNy41djc0LjE4bC0xMS44MDctMTEuODA3Yy0yLjkzLTIuOTI4LTcuNjc4LTIuOTI4LTEwLjYwNyAwLTIuOTI5IDIuOTMtMi45MjkgNy42NzggMCAxMC42MDdsMjQuNjEgMjQuNjFjMS40MDcgMS40MDYgMy4zMTQgMi4xOTYgNS4zMDQgMi4xOTZzMy44OTYtLjc5IDUuMzA0LTIuMTk3bDI0LjYwOS0yNC42MWMyLjkyOC0yLjkyOSAyLjkyOC03LjY3OC0uMDAxLTEwLjYwNnoiLz48cGF0aCBkPSJtMzA0LjAxOSA0MTMuOTQyaC03NC4xODFsMTEuODA3LTExLjgwOGMyLjkyOS0yLjkyOSAyLjkyOS03LjY3OCAwLTEwLjYwNnMtNy42NzgtMi45MjktMTAuNjA2LjAwMWwtMjQuNjA5IDI0LjYxYy0yLjkyOSAyLjkyOS0yLjkyOSA3LjY3NyAwIDEwLjYwNmwyNC42MDkgMjQuNjA5YzEuNDY0IDEuNDY0IDMuMzg0IDIuMTk2IDUuMzAzIDIuMTk2czMuODM5LS43MzIgNS4zMDMtMi4xOTZjMi45MjktMi45MyAyLjkyOS03LjY3OCAwLTEwLjYwN2wtMTEuODA2LTExLjgwNmg3NC4xOGM0LjE0MyAwIDcuNS0zLjM1NyA3LjUtNy41cy0zLjM1OC03LjQ5OS03LjUtNy40OTl6Ii8+PC9nPjxwYXRoIGQ9Im0xLjg3NSA1MDQuNWMwIDQuMTQyIDMuMzU4IDcuNSA3LjUgNy41aDE1OC42MTZjNC4xNDIgMCA3LjUtMy4zNTggNy41LTcuNSAwLTQuMTQyLTMuMzU4LTcuNS03LjUtNy41aC0xNTguNjE2Yy00LjE0MiAwLTcuNSAzLjM1OC03LjUgNy41eiIgZmlsbD0iIzkxODI5MSIvPjxnPjxnPjxwYXRoIGQ9Im00MjkuMTE4IDM3OC42OTdoLTM0Ljg2NGMtNC4xNDMgMC03LjUtMy4zNTctNy41LTcuNXMzLjM1Ny03LjUgNy41LTcuNWgzNC44NjRjNC4xNDMgMCA3LjUgMy4zNTcgNy41IDcuNXMtMy4zNTcgNy41LTcuNSA3LjV6IiBmaWxsPSIjOTE4MjkxIi8+PC9nPjxnPjxwYXRoIGQ9Im00MjkuMTE4IDQxMi4xOTNoLTM0Ljg2NGMtNC4xNDMgMC03LjUtMy4zNTctNy41LTcuNXMzLjM1Ny03LjUgNy41LTcuNWgzNC44NjRjNC4xNDMgMCA3LjUgMy4zNTcgNy41IDcuNXMtMy4zNTcgNy41LTcuNSA3LjV6IiBmaWxsPSIjOTE4MjkxIi8+PC9nPjxnPjxwYXRoIGQ9Im00MTEuNjg2IDQ0NS42OTFoLTE3LjQzMmMtNC4xNDMgMC03LjUtMy4zNTctNy41LTcuNXMzLjM1Ny03LjUgNy41LTcuNWgxNy40MzJjNC4xNDMgMCA3LjUgMy4zNTcgNy41IDcuNXMtMy4zNTggNy41LTcuNSA3LjV6IiBmaWxsPSIjOTE4MjkxIi8+PC9nPjwvZz48L2c+PC9nPjxnLz48Zy8+PGcvPjxnLz48Zy8+PGcvPjxnLz48Zy8+PGcvPjxnLz48Zy8+PGcvPjxnLz48Zy8+PGcvPjwvc3ZnPg==",
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
  "Data Governance__0__goal__1": { score: 2.7, comment: "We have a Data Governance Council that meets monthly, with representatives from Finance, Risk, Operations, and IT. Roles such as Data Owner, Data Steward, and Data Custodian are formally defined in our RACI matrix. However, some business units are still onboarding to the model and accountability enforcement is inconsistent outside of core domains.", rationale: "The organization satisfies criteria 2.1 (a defined, documented governance structure is in place) and 2.2 (roles such as Data Owner, Data Steward, and Data Custodian are formally established in a RACI matrix by subject area) and 2.3 (Finance, Risk, Operations, and IT representatives participate in the monthly Data Governance Council). Criterion 2.5 (a review process to evaluate and improve governance) is partially met through the monthly cadence, but inconsistent accountability enforcement outside core domains and incomplete business-unit onboarding prevent satisfaction of 3.1, which requires an organization-wide rollout plan with executive sponsorship." },
  "Data Governance__0__goal__2": { score: 2.8, comment: "Data governance policies are published in our internal knowledge base and aligned to regulatory requirements (SOX, GDPR). Stewards are required to complete annual compliance sign-offs. We conduct quarterly reviews to assess adherence, though remediation of policy violations tends to be reactive rather than proactive.", rationale: "The organization meets criteria 2.4 (governance follows defined policies and standards, including SOX and GDPR alignment published in the knowledge base) and 2.5 (a quarterly review process is established and followed to evaluate adherence). Criterion 3.4 (standard governance policies and processes are followed) is not yet fully met because remediation of policy violations is reactive rather than proactive, indicating that the standard is not yet consistently enforced across the organization. Advancement to 3.4 requires shifting from reactive detection to proactive compliance assurance." },
  "Data Governance__0__q__0": { comment: "Cross-functional collaboration is facilitated through our Data Governance Council and domain working groups. Decision escalation paths are documented, though informal channels often bypass formal processes in practice." },
  "Data Governance__0__q__1": { comment: "Data domain ownership is assigned in our governance charter. Each domain has a named Data Owner at the VP level and designated stewards at the operational level." },

  // Topic 1: Business Glossary
  "Data Governance__1__goal__0": { score: 2.3, comment: "We have a business glossary in Collibra covering roughly 400 terms across our core financial and risk domains. Definitions were developed collaboratively with business SMEs. However, there are known inconsistencies between the glossary and how terms are used in legacy reporting systems and upstream source databases.", rationale: "The organization satisfies criterion 2.1 (a process is established, documented, and followed to define and manage the business glossary in Collibra) and 2.3 (400 terms have unique names and definitions developed with business SMEs). Criterion 2.4 (new development and data integration efforts apply standard business terms) is not fully met, as known inconsistencies between the Collibra glossary and legacy reporting systems and upstream source databases indicate that standard terms are not yet consistently applied at the point of integration." },
  "Data Governance__1__goal__1": { score: 2.2, comment: "The glossary covers approximately 60% of our enterprise data assets. Coverage is strong in Finance and Risk, but Marketing, HR, and Operations domains are underrepresented. We have a roadmap to expand coverage but no committed timeline.", rationale: "The organization satisfies criterion 2.1 (a documented process for defining, managing, and maintaining the glossary exists in Collibra) and 2.2 (standard business terms are available via the intranet and promulgated to some stakeholders). However, at approximately 60% enterprise coverage with Marketing, HR, and Operations underrepresented, the glossary does not yet meet the intent of criterion 3.2, which requires organization-wide compliance governance for the business glossary process. The absence of a committed expansion timeline further prevents advancement." },
  "Data Governance__1__goal__2": { score: 2.4, comment: "Naming conventions and metadata standards are documented and applied to new glossary entries. Legacy terms were added without consistent metadata tagging, creating gaps in search and discoverability.", rationale: "The organization meets criterion 2.3 (each new glossary entry has a unique name and unique definition per documented naming and metadata standards). Criterion 2.4 (new development and data integration efforts apply standard business terms) is partially satisfied for new work, but legacy terms lacking consistent metadata tagging create gaps in search and discoverability that indicate the standard has not been retroactively enforced. Full satisfaction of 2.4 requires consistent application across the entire glossary inventory, not only prospective entries." },
  "Data Governance__1__goal__3": { score: 2.1, comment: "The glossary is accessible to all employees via our intranet. Awareness is growing but adoption is uneven — power users in Finance actively reference it, while other departments are largely unaware of its existence.", rationale: "The organization meets criterion 2.2 (standard business terms are readily available via the intranet). However, uneven adoption — with Finance power-users actively referencing the glossary while other departments are largely unaware — means criterion 3.2 (organization-wide access governance for compliance with the business glossary process is implemented and followed) is not satisfied. Advancement requires a deliberate promulgation effort beyond technical accessibility, including training and adoption tracking, to achieve the consistent organizational use that 3.2 requires." },
  "Data Governance__1__goal__4": { score: 1.3, comment: "Governance review of new or updated business terms is informal. Terms are sometimes submitted via email to the governance team, reviewed ad hoc, and approved without a formal workflow. There is no SLA for term approval.", rationale: "The organization marginally meets criterion 1.1 (business terms are defined for a particular purpose), as some governance review of terms occurs informally via email. However, criterion 2.1 (a process is established, documented, and followed to define, manage, use, and maintain the business glossary) is not satisfied — term submissions occur ad hoc with no workflow, no SLA for approval, and no documented review procedure. The informal, undocumented nature of the review and approval process places this squarely at Level 1." },
  "Data Governance__1__goal__5": { score: 1.1, comment: "There is no formal compliance process for ensuring business terms are applied in new projects or application designs. Data architects occasionally reference the glossary but it is not mandated in project intake or design review checkpoints.", rationale: "The organization meets criterion 1.1 (business terms are defined for a particular purpose), as data architects occasionally reference the glossary. However, there is no compliance process ensuring that business terms are applied in new projects, so criterion 2.4 (new development, data integration, and data consolidation efforts apply standard business terms) is not satisfied. Without a mandatory gate in project intake or design review checkpoints, glossary usage is purely discretionary, and the organization cannot demonstrate that term application is a repeatable, enforced practice." },
  "Data Governance__1__goal__6": { score: 1.2, comment: "We do not have a formal feedback mechanism for glossary users. Feedback is occasionally received informally via the governance team's inbox but there is no structured channel or process to collect, triage, or act on stakeholder input.", rationale: "The organization meets criterion 1.2 (logical data models are created with some reference to defined terms) but does not satisfy criterion 2.1 (a documented process to define, manage, use, and maintain the business glossary) from a feedback perspective, as no structured channel exists to collect, triage, or act on stakeholder input. Feedback arrives informally via the governance team inbox without a process to respond to or incorporate it. Criterion 2.2 (standard terms are promulgated to relevant stakeholders) is also not fully met, as unstructured feedback indicates the promulgation mechanism lacks a loop for validating usefulness." },

  // Topic 2: Metadata Management
  "Data Governance__2__goal__0": { score: 2.2, comment: "Our metadata repository in Collibra currently covers data assets in our core data warehouse and three critical source systems. Technical metadata (schemas, lineage) is auto-harvested. Business metadata coverage is manually maintained and limited to high-priority domains. Coverage of operational databases, APIs, and unstructured data is minimal.", rationale: "The organization satisfies criterion 2.1 (a metadata management process is established and followed, with auto-harvesting of technical metadata in Collibra) and criterion 2.2 (metadata documentation captures data interdependencies across the core data warehouse and three critical source systems). Criterion 2.4 (metadata categories, properties, and standards are established and followed) is partially met for structured systems but not for APIs, operational databases, or unstructured data, preventing advancement to 3.2 which requires populating the repository across additional categories and classifications according to a phased implementation plan." },
  "Data Governance__2__goal__1": { score: 2.1, comment: "We reference DAMA-DMBOK and internal data architecture standards when defining metadata properties. ISO 11179 is aspirationally aligned but not formally adopted. Alignment between metadata standards and day-to-day data management processes is inconsistent.", rationale: "The organization meets criterion 2.1 (a metadata management process is established and followed, referencing DAMA-DMBOK and internal data architecture standards). Criterion 2.4 (metadata categories, properties, and standards are established and followed) is partially satisfied for new work but inconsistently applied across day-to-day data management processes. ISO 11179 is aspirationally but not formally adopted, meaning the organization cannot demonstrate the consistent standards alignment required by 2.4, and falls short of criterion 3.1, which requires a promulgated metadata management strategy established and maintained by data governance." },

  // ── DATA QUALITY ─────────────────────────────────────────────────────────────
  // Topic 0: DQ Strategy
  "Data Quality__0__goal__0": { score: 3.0, comment: "Our Data Quality strategy was formally approved by the CDO in 2023 and is embedded in our Enterprise Data Strategy. It outlines DQ principles, target state, and a 3-year roadmap. The strategy is reviewed annually and updated to reflect shifts in business priorities such as our ongoing cloud migration.", rationale: "The organization satisfies criteria 2.5 (the DQ strategy is created with reference to business objectives and approved by executive management via CDO approval in 2023), 3.1 (the strategy is followed across the organization and accompanied by policies, processes, and guidelines embedded in the Enterprise Data Strategy), and 3.2 (roles and responsibilities for governance, implementation, and management of DQ practices are defined). The score reflects satisfaction of criterion 3.1 at the defined level, with advancement to 4.1 requiring quantitative metrics to be used in evaluating strategy effectiveness and driving modifications." },
  "Data Quality__0__goal__1": { score: 2.9, comment: "DQ requirements are captured during project intake as part of our data requirements template. Business owners sign off on acceptability thresholds for critical data elements. Requirements are logged in Jira and traced through to testing.", rationale: "The organization satisfies criteria 2.4 (DQ requirements articulated using quality dimensions with business sign-off on acceptability thresholds) and 2.2 (business stakeholders participate in setting criteria at project intake). Criterion 3.4 (policies and governance contained in the DQ strategy are anchored across the data lifecycle and mandated in the SDLC) is substantially met through the Jira-traced requirements template used in project intake. The score stops at 2.9 because the process is well-practiced at the project level but not yet uniformly mandated as an organizational SDLC standard with compliance accountability across all project types." },
  "Data Quality__0__goal__2": { score: 2.3, comment: "We have assigned Data Quality Stewards for Finance and Risk domains. A DQ working group meets biweekly. However, the function lacks dedicated resources and relies heavily on part-time contributors from business units. There is no formal DQ team at the enterprise level.", rationale: "The organization meets criterion 2.2 (business stakeholders — Data Quality Stewards in Finance and Risk — participate in creating the DQ strategy through the biweekly working group). Criterion 3.2 (roles and responsibilities for governance, implementation, and management of DQ practices are defined) is partially satisfied, but the lack of a dedicated enterprise DQ function and reliance on part-time business-unit contributors means the organization cannot demonstrate the resource capacity and structural definition required by criterion 3.2. Advancement requires establishing a formal enterprise-level DQ team with dedicated resourcing." },
  "Data Quality__0__goal__3": { score: 2.0, comment: "Communication about DQ issues is primarily reactive — we issue incident reports when data quality problems impact downstream reports or regulatory filings. There is no proactive DQ communication plan or regular stakeholder reporting cadence for DQ performance.", rationale: "The organization meets criterion 2.3 (policies, processes, and guidelines to implement the DQ strategy are established, as evidenced by the existing incident reporting process). However, criterion 2.6 (plans to meet the goals and objectives of the DQ strategy are monitored to evaluate progress) is not met — with no proactive DQ communication plan or regular stakeholder reporting cadence, progress against the DQ strategy is not systematically tracked or communicated. Advancement to 3.1 requires a proactive reporting cadence that monitors and communicates DQ performance rather than responding reactively to incidents." },

  // Topic 1: Data Profiling
  "Data Quality__1__goal__0": { score: 3.1, comment: "Data profiling is executed as a standard step in our data onboarding process using Informatica DQ. Profiling results are documented and reviewed by Data Stewards before new datasets are onboarded to the data warehouse. Ad hoc profiling is also performed when data quality incidents are reported.", rationale: "The organization satisfies criterion 3.1 (data profiling methodologies, processes, practices, tools, and results templates have been defined and standardized using Informatica DQ) and criterion 3.2 (all techniques identified to meet profiling objectives are performed, including systematic onboarding profiling and ad hoc incident-driven profiling). The score reflects strong entry into Level 3 through institutionalized tooling and steward-review processes. Advancement to 4.1 would require profiling performance to be measured and used to manage activities across the organization, including trend analysis and benchmarking." },
  "Data Quality__1__goal__1": { score: 2.2, comment: "Profiling results are stored in Informatica and summarized in a profiling report template. Reports are reviewed by the data steward and project team but are not systematically shared with business data owners or incorporated into a centralized quality dashboard.", rationale: "The organization satisfies criterion 2.5 (profiling results and recommendations are reported to the data steward and project team using a standardized report template stored in Informatica). However, criterion 2.5 is only partially fulfilled because results are not shared with business data owners or incorporated into a centralized quality dashboard, limiting visibility beyond the immediate project team. Advancement to criterion 3.4 (data governance is engaged to identify core shared data sets for regular profiling and monitoring) requires broadening the audience and integrating profiling outputs into enterprise-level quality oversight." },
  "Data Quality__1__goal__2": { score: 2.4, comment: "We have documented data profiling standards that cover completeness, uniqueness, and format checks. Standards are applied to structured relational data. Semi-structured and unstructured data sources are not yet covered by profiling standards.", rationale: "The organization satisfies criterion 2.1 (a data profiling methodology is established and followed) and criterion 2.4 (profiling activities are conducted according to the plan, covering completeness, uniqueness, and format checks for structured relational data). Criterion 2.4 is met for the in-scope data landscape but falls short of full criterion 3.1 (standardized profiling methodologies, practices, and tools applied across all data types) because semi-structured and unstructured sources are excluded from coverage. Comprehensive standards applicable across all relevant data types would be required to advance to 3.1." },

  // Topic 2: DQ Assessment
  "Data Quality__2__goal__0": { score: 3.2, comment: "We conduct formal data quality assessments for critical data elements tied to regulatory reporting (BCBS 239, CCAR). Assessments use a defined scoring rubric across six dimensions: completeness, accuracy, consistency, timeliness, validity, and uniqueness. Results are reported to the Chief Data Officer quarterly.", rationale: "The organization satisfies criterion 3.1 (periodic DQ assessments are conducted in accordance with data quality policies on an approved schedule, triggered by regulatory reporting cycles) and criterion 3.4 (DQ is assessed using established thresholds and targets across six quality dimensions: completeness, accuracy, consistency, timeliness, validity, and uniqueness). Criterion 3.2 (methods for assessing business impacts are defined, approved, and consistently applied across the organization) is substantially met through the regulatory context. Advancement to 4.1 requires systematic generation of DQ measurement reports based on criticality and volatility attributes, extending beyond the current regulatory scope." },
  "Data Quality__2__goal__1": { score: 2.3, comment: "DQ assessment results are documented in a shared repository accessible to stewards and the data governance team. Business stakeholders receive findings through governance committee presentations but do not have self-service access to assessment history or trend data.", rationale: "The organization satisfies criterion 2.1 (assessment objectives, targets, and thresholds are established and maintained using standard techniques, with findings stored in a shared repository) and criterion 2.3 (assessments are conducted periodically per an approved frequency). Criterion 2.6 (high-level assessment report information is traceable to component individual records) is partially met for governance team users, but the absence of self-service access and trend data for business stakeholders means that criterion 3.3 (improvement plans resulting from DQ assessments are integrated at the organization level) cannot be fully achieved. Stakeholder self-service access would be needed to drive organization-wide improvement integration." },
  "Data Quality__2__goal__2": { score: 2.3, comment: "We track data quality issues in Jira with severity classifications and assigned owners. Remediation progress is reviewed in biweekly steward meetings. However, root cause analysis is not consistently performed for recurring issues and there is no formal issue escalation SLA.", rationale: "The organization meets criterion 2.3 (DQ assessments are conducted periodically per the Jira-based review cadence with biweekly steward meetings) and criterion 2.4 (assessment results include remediation recommendations with severity classification and ownership assignment). Criterion 2.5 (impact analysis includes cost estimates, level of effort, and business impact) is not satisfied — without consistent root cause analysis or formal escalation SLAs, impact analysis remains incomplete. The absence of systematic root cause investigation prevents the organization from advancing to criterion 3.2, which requires business impact methods to be consistently applied across the organization." },

  // Topic 3: Data Cleansing
  "Data Quality__3__goal__0": { score: 2.1, comment: "Data cleansing is performed on an ad hoc basis, typically triggered by data quality incidents or project needs. We have documented cleansing procedures for customer master data and product data, but no enterprise-wide cleansing strategy or scheduled cleansing cadence.", rationale: "The organization satisfies criterion 2.1 (data cleansing activities adhere to documented requirements for customer master data and product data, linked to process improvements for business objectives) and criterion 2.3 (the scope of data cleansing is defined for these priority domains). Criteria 2.5 (a data cleansing policy is established and maintained) and 2.6 (methods for correcting data are defined within a plan) are not met at the enterprise level — without an enterprise-wide cleansing strategy or scheduled cleansing cadence, the organization cannot demonstrate the managed consistency that 2.5 and 2.6 require across all domains." },
  "Data Quality__3__goal__1": { score: 1.4, comment: "Cleansed data is validated manually by the requesting team before being promoted to production. There is no standardized validation methodology, automated validation controls, or formal sign-off process. Validation quality depends heavily on individual team knowledge.", rationale: "The organization meets criterion 1.1 (data cleansing requirements are defined and some cleansing is performed before promotion to production). Criterion 2.2 (cleansing activities conform with data quality requirements such as conformity, accuracy, and uniqueness) is not satisfied because validation is performed manually without a standardized methodology, automated controls, or formal sign-off process, making outcomes dependent on individual team knowledge rather than repeatable quality criteria. Advancement to 2.2 requires standardized validation methodology and consistent quality criteria applied uniformly across all cleansing activities." },
  "Data Quality__3__goal__2": { score: 2.2, comment: "We use Informatica Data Quality for cleansing workflows in our Finance and customer domains. Other domains rely on manual SQL scripts maintained by individual developers. There is no enterprise standard for cleansing tooling across the organization.", rationale: "The organization satisfies criterion 2.2 (data cleansing activities in Finance and customer domains conform with quality requirements using Informatica Data Quality, which applies conformity, accuracy, and uniqueness checks). Criterion 2.6 (methods for correcting data are defined within a plan) is met for Informatica-managed domains but not for other domains relying on individually maintained SQL scripts, which have no standardized correction methodology. The absence of an enterprise standard for cleansing tooling prevents satisfaction of criterion 3.3 (data cleansing rules are applied consistently across the organization)." },

  // ── DATA MANAGEMENT STRATEGY ─────────────────────────────────────────────────
  // Topic 0: DM Strategy
  "Data Management Strategy__0__goal__0": { score: 3.1, comment: "Our Enterprise Data Strategy was published in 2022 and is reviewed annually by the CDO's office. It covers data governance, quality, architecture, and literacy as strategic pillars. The strategy is aligned to business objectives and presented to the Executive Leadership Team annually.", rationale: "The organization satisfies criterion 3.1 (an organization-wide Enterprise Data Strategy is established, approved, promulgated, and maintained with CDO ownership) and criterion 3.2 (data management objectives are evaluated and prioritized against business drivers and aligned with business strategy, as evidenced by annual ELT presentations). Criterion 3.5 (the strategy is documented, maintained, reviewed, and communicated according to defined standard process) is met through the annual CDO review cycle. Advancement to 4.1 would require statistical and quantitative techniques to evaluate the effectiveness of strategic objectives in achieving business outcomes." },
  "Data Management Strategy__0__goal__1": { score: 2.0, comment: "Business cases for data management investments are developed on a project basis but there is no standardized business case template or ROI measurement framework. Value realization from past investments is tracked informally through anecdotal evidence rather than quantified outcomes.", rationale: "The organization meets criterion 2.1 (data management objectives, priorities, and scope are defined and approved at the project level) and criterion 2.2 (project objectives are aligned with business objectives). However, criterion 2.5 (metrics are used to assess the achievement of objectives for data management) is not met — value realization from past investments is tracked through anecdotal evidence rather than quantified outcomes, and no standardized business case template or ROI measurement framework exists. Advancement to 3.7 requires defined metrics for assessing and monitoring achievement of data management objectives across the program." },
  "Data Management Strategy__0__goal__2": { score: 2.9, comment: "Data management principles are documented in our governance charter and referenced in architecture review board decisions. Principles are communicated during onboarding and in data governance training. Adherence is periodically reviewed by the governance team.", rationale: "The organization satisfies criteria 3.1 (an organization-wide data management strategy is established, approved, and maintained) and 3.5 (the strategy is documented, reviewed, and communicated according to a defined process, including onboarding and governance training). Criterion 3.6 (the strategy is consistent with data management policies, as evidenced by governance charter and Architecture Review Board integration) is substantially met. The score of 2.9 reflects that the principles are well-embedded but alignment between the strategy and all operational processes is still maturing, falling just short of full criterion 3.6 satisfaction." },

  // Topic 1: Communications
  "Data Management Strategy__1__goal__0": { score: 2.0, comment: "Data governance updates are communicated through quarterly newsletters, intranet posts, and governance council meeting minutes. There is no formal communications plan for data management, and messaging is inconsistent across channels and audiences.", rationale: "The organization meets criterion 2.1 (a communications plan is partially in place through quarterly newsletters, intranet posts, and governance council meeting minutes). However, criterion 2.1 is not fully satisfied because the plan lacks formal approval, stakeholder segmentation, and a consistent messaging framework across channels. Criterion 2.2 (data management standards, policies, and processes are communicated and adjusted based on feedback) is partially met, but the reactive, uncoordinated nature of communications prevents satisfaction of criterion 3.1, which requires a communications policy establishing criteria for disseminating different types of data management communications." },
  "Data Management Strategy__1__goal__1": { score: 2.1, comment: "Leadership engagement with data management is largely driven by regulatory requirements. The CFO and CRO are actively engaged due to BCBS 239 obligations. Broader executive engagement beyond regulatory-driven participation is limited and not systematically cultivated.", rationale: "The organization meets criterion 2.2 (data management standards and policies are communicated through regulatory compliance channels, with CFO and CRO engagement driven by BCBS 239 obligations). However, this communication is reactive and compliance-driven rather than proactively planned, meaning criterion 2.1 (a documented, stakeholder-approved, scheduled communications plan) is not fully met. Broader executive engagement beyond regulatory-driven participation is not systematically cultivated, preventing advancement to criterion 3.2 (a communications strategy guided by an organization-wide policy and adjusted based on feedback)." },

  // Topic 2: DM Function
  "Data Management Strategy__2__goal__0": { score: 3.3, comment: "The CDO organization was established in 2021 with dedicated functions for Data Governance, Data Architecture, Data Quality, and BI/Analytics. The CDO reports directly to the CEO. Roles and responsibilities are documented and regularly communicated to the business.", rationale: "The organization satisfies criteria 3.1 (a data management function with dedicated governance, architecture, quality, and BI/analytics capabilities is established under the CDO since 2021) and 3.3 (the data management organization and specified structure are defined and periodically reviewed to ensure they meet organizational needs). Criterion 3.5 (data management is an explicitly recognized business function leveraged across the organization, with direct CEO reporting by the CDO) is met. The score reflects strong Level 3 standing, with advancement to 4.1 requiring defined tasks measured and assessed using statistical and quantitative techniques." },
  "Data Management Strategy__2__goal__1": { score: 2.2, comment: "Data management processes are documented for core activities (governance, quality assessment, architecture review). Documentation is stored in Confluence. However, process adherence monitoring is informal and documentation currency is not consistently maintained — some processes reflect outdated workflows.", rationale: "The organization satisfies criterion 2.2 (principles are defined and followed to guide consistency of data management practices, stored in Confluence) and criterion 2.3 (roles and responsibilities are specified to support governance and the data management function). Criterion 2.5 (a mechanism exists and is followed to identify and apply changes to enhance or redesign the data management function) is not met — informal adherence monitoring and inconsistently maintained documentation with outdated workflows indicate that the change mechanism is not functioning effectively. Advancement to 3.4 requires processes to be established and maintained by the data management function with governance approval and current documentation." },
  "Data Management Strategy__2__goal__2": { score: 2.0, comment: "Data management staff participate in external conferences and vendor briefings, but there is no formal training curriculum or competency framework for the data management function. Professional development is largely self-directed.", rationale: "The organization meets criterion 2.1 (an approved interaction model exists through conferences and vendor briefings, supporting some stakeholder engagement with the data management organization). However, criterion 2.4 (agreements are in place providing explicit expectations for the use of shared staff resources with responsibilities for data management) is not met — with no formal training curriculum or competency framework, expectations for professional development are not codified. Self-directed development without structured role-based competency requirements prevents advancement to criterion 3.3, which requires a defined, periodically reviewed organizational structure that meets the needs of the organization." },

  // Topic 3: Business Case
  "Data Management Strategy__3__goal__0": { score: 2.0, comment: "We have developed informal benefit articulations for major data initiatives, primarily framed around regulatory compliance and cost avoidance. We have not developed a formal ROI methodology or systematically tracked realized benefits from data management investments.", rationale: "The organization meets criterion 2.1 (a business case methodology is informally defined, with benefit articulations developed for major initiatives focused on regulatory compliance and cost avoidance). Criterion 2.2 (standard business cases support approval decisions for funding data management) is partially met but not fully satisfied — without a formal ROI methodology or systematically tracked realized benefits, business cases are not comparable to the organization's standard investment approval process. Advancement to criterion 3.3 (data management business cases require executive sponsorship and reflect TCO analysis) requires a formalized methodology with tracked outcomes." },
  "Data Management Strategy__3__goal__1": { score: 1.2, comment: "We do not systematically measure or report on the financial impact of poor data quality. Anecdotal estimates are occasionally cited in governance discussions but no formal cost-of-poor-data-quality (CPDQ) analysis has been conducted.", rationale: "The organization meets criterion 1.2 (some costs and benefits of data management are informally documented through anecdotal estimates cited in governance discussions). Criterion 2.2 (standard business cases support approval decisions) requires the benefits and costs of data management to be formally measured and documented, which is not possible without CPDQ analysis. The absence of any structured cost-of-poor-data-quality measurement framework means the organization cannot produce the evidence-based business cases required to advance beyond criterion 1.2." },

  // Topic 4: Program Funding
  "Data Management Strategy__4__goal__0": { score: 2.2, comment: "Data management activities are funded through a mix of project-based budgets and the CDO office's operational budget. There is no dedicated enterprise data management program fund. Funding for cross-domain initiatives is negotiated annually and is subject to competing priorities.", rationale: "The organization satisfies criterion 2.1 (data management initiatives are financed based on business case criteria, as evidenced by CDO office operational budget and project-based funding) and criterion 2.2 (stakeholders in Finance, Risk, and IT participate in and support funding decisions). Criterion 2.3 (data management costs are mapped to business areas, operational functions, and IT) is partially met at a high level through the CDO budget but not at the capability or cost-driver level, preventing advancement to criterion 3.1 which requires funding to align with investment decision-making standards consistently employed across the organization." },
  "Data Management Strategy__4__goal__1": { score: 1.1, comment: "There is no formal TCO model for our data management platform or operations. Costs are tracked at a high level within the CDO budget but not broken down by capability area, function, or cost driver. We lack visibility into the true operational cost of our data environment.", rationale: "The organization meets criterion 1.1 (at least one data management project has been funded based on cost-benefit considerations, as evidenced by project-based funding decisions). Criterion 2.3 (data management costs are mapped to business areas, operational functions, and IT) is not met — costs are tracked only at a high level within the CDO budget without breakdown by capability area, function, or cost driver. The absence of a formal TCO model prevents the cost visibility needed to satisfy criterion 2.3 and prevents advancement to the managed funding governance required by 2.4." },

  // ── DATA OPERATIONS ───────────────────────────────────────────────────────────
  // Topic 0: Data Requirements Definition
  "Data Operations__0__goal__0": { score: 3.2, comment: "Data requirements are captured using a standardized template as part of our SDLC. The template covers source systems, transformation rules, business definitions, quality expectations, and retention requirements. Requirements are reviewed by the data architecture team and approved before development begins.", rationale: "The organization satisfies criterion 3.1 (data requirements are defined, validated, and integrated using a standard requirements definition framework embedded in the SDLC, with architecture team review and approval) and criterion 3.2 (data requirements are assessed based on business priorities). Criterion 3.4 (data requirements comply with and include compliance requirements for both physical and logical data, including security rules) is substantially met given the comprehensive template covering transformation rules, quality expectations, and retention requirements. Advancement to 4.2 would require defined and managed metrics to ensure data requirements satisfy business objectives with corrective actions when they do not." },
  "Data Operations__0__goal__1": { score: 3.0, comment: "Data requirements are traceable from business needs through technical specifications to implemented solutions using our Jira/Confluence toolchain. Traceability is reviewed during project closure. Gaps in traceability for legacy systems remain but are being addressed in a remediation program.", rationale: "The organization satisfies criterion 3.1 (requirements are defined and integrated using the organization's standard Jira/Confluence toolchain framework) and criterion 2.3 (traceability of data requirements to business requirements and objectives is maintained and reviewed at project closure). Criterion 3.3 (business processes that produce data are documented and linked to data requirements) is partially met for new systems but not yet for legacy systems, which are the subject of an active remediation program. The 3.0 score reflects solid Level 3 entry, with advancement requiring full traceability coverage across legacy and new systems." },
  "Data Operations__0__goal__2": { score: 2.2, comment: "Data requirements from regulatory programs are incorporated into our data management planning, but the integration is primarily driven by compliance deadlines rather than a systematic business-requirements-to-data-needs translation process.", rationale: "The organization meets criterion 2.2 (data requirements necessary to achieve regulatory data management goals are defined and demonstrably aligned with compliance objectives) and criterion 2.3 (traceability of regulatory requirements to business requirements is maintained). However, criterion 2.3 is only satisfied for compliance-driven requirements — the reactive, deadline-driven nature of integration rather than a systematic business-requirements-to-data-needs translation process indicates that the broader requirement of 2.2 (demonstrable alignment with all business objectives) is not met across non-regulatory domains." },

  // Topic 1: Data Lifecycle Management
  "Data Operations__1__goal__0": { score: 2.3, comment: "Data lifecycle policies are defined for regulated data classes (personal data, financial records) in compliance with GDPR and SOX. Policies cover retention, archival, and deletion timelines. For unregulated data classes, lifecycle management is largely undocumented and left to individual system owners.", rationale: "The organization satisfies criterion 2.2 (business process to data mappings are defined, maintained, and periodically reviewed for compliance-driven regulated data classes under GDPR and SOX) and criterion 2.4 (selection criteria are applied to designate authoritative sources for these regulated classes). Criterion 2.2 is not met for unregulated data classes, where lifecycle management is largely undocumented and left to individual system owners. Advancement to criterion 3.1 (lifecycle management processes defined and approved by stakeholders and managed by data governance bodies) requires extending the policy and governance framework beyond regulated data to all data classes." },
  "Data Operations__1__goal__1": { score: 2.4, comment: "A data classification scheme with four tiers (Public, Internal, Confidential, Restricted) is documented and published. Classification has been applied to data in our core financial systems and some cloud applications. Broad application across all data assets is in progress with an estimated 45% coverage rate.", rationale: "The organization meets criterion 2.4 (selection criteria are defined and applied to designate authoritative data sources, evidenced by the four-tier classification scheme covering Public, Internal, Confidential, and Restricted with 45% coverage). Criterion 2.5 (the SDLC process requires reference to approved shared data representations from authoritative sources) is partially met for financial systems and some cloud applications. The 45% coverage rate means that criterion 2.4 is not yet fully satisfied across the enterprise, preventing advancement to criterion 3.1 which requires lifecycle management processes to be defined, approved by stakeholders, and managed by governance bodies organization-wide." },
  "Data Operations__1__goal__2": { score: 1.3, comment: "We do not have a formalized data archival or disposal process. Archiving is performed on an ad hoc basis by system administrators when storage thresholds are hit. Disposal of physical media follows IT asset disposal procedures but data-layer deletion is not systematically verified.", rationale: "The organization meets criterion 1.3 (stakeholders agree on the scope of data elements and authoritative data sources for regulatory and financial systems). Criterion 2.2 (business process to data mappings are defined, maintained, and periodically reviewed) is not met for data archival and disposal — archiving is performed ad hoc by system administrators when storage thresholds are hit, and data-layer deletion is not systematically verified. The absence of formalized archival and disposal processes means the organization cannot demonstrate the managed consistency required by criterion 2.2, and falls short of criterion 1.2 (data is archived as prescribed in policies) for non-regulated data." },

  // Topic 2: Provider Management
  "Data Operations__2__goal__0": { score: 2.4, comment: "We maintain a register of external data providers including market data vendors (Bloomberg, Refinitiv) and reference data providers. Contracts include basic data quality and availability SLAs. Vendor performance is reviewed annually during contract renewal rather than on an ongoing basis.", rationale: "The organization satisfies criterion 2.3 (data quality criteria are defined and embedded into SLAs with Bloomberg and Refinitiv, covering quality and availability) and criterion 2.2 (a data procurement process for obtaining data from external providers is defined and followed, including a provider register). Criterion 2.4 (planned discussions are held with data providers to address deviations to established thresholds) is not met — annual-only performance reviews during contract renewal rather than ongoing monitoring mean that deviations are not addressed proactively. Advancement to 2.4 requires regular scheduled engagement with providers to address SLA deviations in a timely manner." },
  "Data Operations__2__goal__1": { score: 2.2, comment: "Data lineage from external providers is documented for our top five critical data feeds. For the remaining external feeds, lineage is partial or undocumented. We are implementing a lineage tool (Collibra Lineage) to automate capture but rollout is approximately 30% complete.", rationale: "The organization meets criterion 2.2 (a data procurement process for obtaining data from external providers is defined and followed for top critical feeds, with Collibra Lineage being implemented for automated capture). Criterion 2.3 (data quality criteria are embedded in SLAs with external providers) is met for the top five feeds. However, partial lineage documentation at approximately 30% Collibra Lineage rollout completion means criterion 3.2 (metrics for the data sourcing management process are established, maintained, and used) is not yet achievable, as comprehensive lineage coverage is a prerequisite for sourcing metrics." },

  // ── PLATFORM & ARCHITECTURE ───────────────────────────────────────────────────
  // Topic 0: Architectural Approach
  "Platform & Architecture__0__goal__0": { score: 3.3, comment: "Our enterprise data architecture is governed by an Architecture Review Board (ARB) that reviews all significant data platform decisions. A reference architecture is documented and updated annually. The architecture follows a medallion lakehouse pattern on Azure with a defined data mesh evolution roadmap.", rationale: "The organization satisfies criteria 3.1 (the architectural approach is followed across the organization, enforced through the ARB) and 3.3 (the target architecture — medallion lakehouse on Azure with a data mesh roadmap — is collaboratively developed and jointly approved by business units, IT, and data governance). Criterion 3.5 (both internal and selected external data standards are evaluated and applied to architectural blueprints) is substantially met through the annually updated reference architecture. Advancement to criterion 3.4 (the organization creates and maintains metrics to evaluate progress on state transition and traceability mapping) is the nearest gap." },
  "Platform & Architecture__0__goal__1": { score: 3.1, comment: "Architecture decisions are documented as Architecture Decision Records (ADRs) in Confluence. ADRs include context, decision rationale, and implications. Compliance with architectural standards is reviewed at project milestones.", rationale: "The organization satisfies criterion 3.1 (the architectural approach is followed across the organization, with ADRs documenting all significant decisions in Confluence) and criterion 2.5 (a compliance process ensures projects refer to and utilize the approved target architecture, reviewed at project milestones). Criterion 2.4 (data interface specifications are documented for shared data with end-to-end traceability) is partially met through ADRs, which include context, rationale, and implications. Advancement to criterion 3.4 (metrics to evaluate progress on state transition and traceability mapping) would require quantitative tracking of architectural compliance and transition progress." },
  "Platform & Architecture__0__goal__2": { score: 2.3, comment: "We have a technology roadmap for our data platform covering the next 24 months. The roadmap is updated semiannually and shared with senior leadership. However, roadmap execution is frequently disrupted by unplanned work and the roadmap does not include quantitative benefit projections for planned investments.", rationale: "The organization meets criterion 2.3 (an architectural transition plan based on a mapping between current and future-state environments exists as a 24-month technology roadmap updated semiannually and shared with senior leadership). Criterion 2.5 (a compliance process is followed to ensure projects refer to and utilize the approved target architecture) is partially met but is undermined by frequent disruption from unplanned work and the absence of quantitative benefit projections. Advancement to criterion 3.4 (the organization creates and maintains metrics to evaluate progress on state transition) would require the roadmap to include measurable milestones and benefit realization targets." },

  // Topic 1: Architectural Standards
  "Platform & Architecture__1__goal__0": { score: 3.2, comment: "Data architecture standards covering naming conventions, data modeling patterns, API design, and integration standards are documented in our Architecture Standards Catalog. Standards are mandatory for new development and reviewed by the ARB. Legacy exceptions are tracked in a technical debt register.", rationale: "The organization satisfies criteria 3.1 (architectural standards are followed across the organization, mandatory for new development with ARB enforcement) and 3.2 (external requirements, including regulatory standards, are included in the data architecture). Criterion 3.3 (stakeholder roles and responsibilities for architectural standards include compliance accountability, ownership, and training) is substantially met through the ARB mandate and standards catalog. A technical debt register for tracking legacy exceptions demonstrates criterion 2.3 (a process governing approvals and management of deviations) is in place. Advancement to 3.5 requires metrics for monitoring adoption and compliance to be defined and implemented." },
  "Platform & Architecture__1__goal__1": { score: 2.2, comment: "Standards are communicated through onboarding documentation and architecture forums. Awareness among senior engineers and architects is high. However, standards awareness among junior developers and cross-functional project teams is inconsistent, and we do not measure standards adoption rates.", rationale: "The organization satisfies criterion 2.1 (architectural standards addressing data representations, security, access, and provisioning are defined and followed) and criterion 2.5 (standards are reviewed periodically against changing business and technology needs, through onboarding documentation and architecture forums). However, criterion 3.1 (architectural standards are followed across the organization) is not fully met — inconsistent awareness among junior developers and cross-functional project teams, combined with the absence of adoption rate measurement, indicates the standards have not achieved universal organizational penetration. Criterion 3.5 (metrics for monitoring and controlling adoption and compliance) is specifically unmet." },

  // Topic 2: DM Platform
  "Platform & Architecture__2__goal__0": { score: 3.0, comment: "Our data management platform stack includes Azure Data Lake Storage Gen2, Azure Databricks, Azure Synapse Analytics, and Collibra for governance. The platform is deployed in production and supports our core analytics, reporting, and regulatory workloads. A cloud-native migration from on-premises Informatica CDGC to Microsoft Purview is planned for H2 2025.", rationale: "The organization satisfies criteria 2.3 (platforms are consistent with the technology stack and architectural designs, as Azure Data Lake Storage Gen2, Databricks, Synapse Analytics, and Collibra form a coherent enterprise platform) and 2.5 (the executive data governance body advises and consents on major platform decisions, including the planned Purview migration for H2 2025). Criterion 3.1 (critical data elements for which the platform is an authoritative source or system of record are documented) is substantially met for core analytics and regulatory workloads. Advancement to 3.5 would require platform performance data to be systematically captured and used to verify that business performance needs and capacity requirements are met." },
  "Platform & Architecture__2__goal__1": { score: 2.2, comment: "Platform performance monitoring is implemented for our data warehouse and core pipelines using Azure Monitor and Databricks observability tools. Data quality monitoring is primarily manual — there is no automated data observability layer for anomaly detection or pipeline health scoring.", rationale: "The organization meets criterion 2.3 (platforms are consistent with the technology stack and architectural designs, with Azure Monitor and Databricks observability tools providing infrastructure-level performance monitoring). Criterion 2.4 (platforms support security and access requirements) is met. However, criterion 3.5 (platform performance data is captured, stored, and used to verify that business performance needs and capacity requirements are met) is only partially satisfied for the infrastructure layer — the absence of an automated data observability layer for DQ anomaly detection and pipeline health scoring means the platform monitoring does not extend to data-layer quality verification required by 3.4." },
  "Platform & Architecture__2__goal__2": { score: 2.0, comment: "Platform capacity is managed reactively based on storage and compute utilization alerts. We do not have a formal capacity planning process that incorporates projected data volume growth or new workload demand forecasting.", rationale: "The organization meets criterion 2.3 (platforms are consistent with the technology stack and architectural designs, with storage and compute utilization alerts in place). Criterion 3.3 (platform implementation plans address scalability, resiliency, and security needed to accommodate changes in anticipated complexity and data volume) is not met — reactive capacity management based on utilization alerts, without demand-driven forecasting or formal capacity planning that incorporates projected data volume growth and new workload demand, means the organization cannot proactively address the scaling requirements criterion 3.3 demands." },

  // Topic 3: Data Integration
  "Platform & Architecture__3__goal__0": { score: 3.1, comment: "Data integration standards including design patterns (batch, micro-batch, streaming), error handling, logging, and SLA definitions are documented and applied to all new integration development. Legacy integrations are being brought into compliance through a modernization program.", rationale: "The organization satisfies criterion 3.1 (the organization follows a standard set of practices and rules for data integration activities, applied to all new development, including batch, micro-batch, and streaming patterns with error handling and SLA definitions) and criterion 3.4 (the development and deployment of integration interfaces are specified in accordance with architectural standards supporting reuse). An active legacy modernization program addresses non-compliant integrations, demonstrating commitment to criterion 3.1 organization-wide. Advancement to criterion 3.5 would require interface and integration performance metrics to be collected and analyzed to identify nonconformance." },
  "Platform & Architecture__3__goal__1": { score: 2.9, comment: "End-to-end data lineage for our regulatory reporting pipelines is documented in Collibra. Lineage captures source-to-target transformations and is used for impact analysis during change management. Coverage for analytical pipelines is in progress at approximately 65% completion.", rationale: "The organization satisfies criterion 3.1 (standard integration practices are followed across the organization for regulatory reporting pipelines) and criterion 3.6 (the organization documents and manages changes to data sources and destinations through the data governance process, supported by Collibra Lineage for end-to-end source-to-target lineage). Criterion 2.3 (a change control process for integration environment changes is followed, used for impact analysis during change management) is met. At 65% analytical pipeline coverage, advancement to full criterion 3.6 requires completing lineage documentation across all analytical pipelines." },
  "Platform & Architecture__3__goal__2": { score: 2.4, comment: "Integration testing includes automated regression tests for critical pipelines and manual validation for less critical feeds. Test coverage is estimated at 70% for production pipelines. We do not have a formal integration testing strategy that mandates coverage thresholds or test types across the entire integration portfolio.", rationale: "The organization satisfies criterion 2.5 (integration verification is performed to ensure architecture and interface specifications are met before release into production, with 70% automated regression test coverage and manual validation for lower-priority feeds) and criterion 2.4 (remediation processes are established to address abnormal circumstances). Criterion 3.2 (quality checks are defined as part of the organizational integration standard and performed as part of data integration processes) is partially met but not consistently applied — without a formal integration testing strategy mandating coverage thresholds or test types across the full integration portfolio, quality verification is inconsistent across the organization." },

  // Topic 4: Historical Data & Retention
  "Platform & Architecture__4__goal__0": { score: 2.3, comment: "Data retention schedules are defined for regulated data classes and enforced through automated archiving rules for our Azure storage tier. Non-regulated data retention is largely undefined and governed by default storage quotas.", rationale: "The organization satisfies criterion 2.1 (policies mandate management of data history, including retention, destruction, and audit trail requirements, with automated archiving rules for regulated data on Azure storage tiers) and criterion 2.4 (access, transmittal, and modifications to historical and archived data are controlled by policy for regulated classes). Criterion 2.1 is only partially met because non-regulated data retention is largely undefined and governed only by default storage quotas, meaning the policy mandate does not apply organization-wide. Advancement to criterion 3.3 (policy approved by data governance and implemented at the organizational level for all data) requires extending the retention policy framework to all data classes." },
  "Platform & Architecture__4__goal__1": { score: 2.2, comment: "Historical data is available in our data lake for financial data going back 7 years. Accessibility for older data requires manual retrieval from cold storage by the engineering team. Business users do not have self-service access to historical archives.", rationale: "The organization meets criterion 2.2 (a defined method ensures historical data necessary for business needs is accessible, with 7 years of financial data in the data lake) and criterion 1.2 (data is backed up and archived as prescribed in policies for regulated financial data). Criterion 2.2 is only partially satisfied because older data requires manual retrieval from cold storage by the engineering team, and business users lack self-service access to historical archives. Advancement to criterion 3.1 (a prescribed data warehouse repository that provides access to historical data for analytics supporting business processes) requires enabling business-accessible self-service retrieval without engineering intervention." },

  // ── SUPPORTING PROCESSES ──────────────────────────────────────────────────────
  // Topic 0: Measurement & Analysis
  "Supporting Processes__0__goal__0": { score: 2.3, comment: "We track a set of data governance KPIs including glossary coverage rate, DQ assessment completion %, and issue resolution SLA adherence. These are reported quarterly to the governance council. However, targets for most metrics are not formally defined and trend analysis is not consistently performed.", rationale: "The organization satisfies criteria 2.2 (measures are specified to address measurement objectives — glossary coverage rate, DQ assessment completion percentage, and issue resolution SLA adherence) and 2.8 (results of measurement and analysis activities are communicated to relevant stakeholders through quarterly governance council reporting). Criterion 2.6 (measurement data is analyzed and interpreted) is partially met but undermined by the absence of formal targets and inconsistent trend analysis. Advancement to criterion 3.1 (measurement and analysis standards are established and followed) requires targets to be formally defined for each metric and trend analysis to be conducted consistently." },
  "Supporting Processes__0__goal__1": { score: 2.1, comment: "Measurement results inform governance council discussions and CDO reporting but are not systematically used to drive process improvement decisions. The link between metric performance and specific process improvement actions is informal and not documented.", rationale: "The organization satisfies criterion 2.8 (measurement results are communicated to stakeholders through governance council discussions and CDO reporting) and criterion 2.6 (measurement data is analyzed and interpreted at a basic level). However, criterion 2.4 (measurement data is analyzed and communicated in a way that informs decisions) is not fully met because the link between metric performance and specific process improvement actions is informal and undocumented. Advancement to criterion 3.1 (measurement and analysis standards are established and followed) requires formalizing the connection between measurement outputs and process improvement decisions through a defined improvement cycle." },

  // Topic 1: Process Management
  "Supporting Processes__1__goal__0": { score: 2.3, comment: "Core data management processes (governance, quality assessment, architecture review) are documented in Confluence. Process documentation follows a standard template. However, documentation coverage is incomplete — several operational processes for data operations and lifecycle management are undocumented.", rationale: "The organization satisfies criterion 2.1 (process needs and objectives are established and maintained, with core data management processes documented in Confluence using a standard template) and criterion 1.4 (data, process, and work products are stored and accessible in Confluence). Criterion 2.2 (processes are appraised as needed to maintain an understanding of strengths and weaknesses) is partially met through governance council reviews. However, incomplete coverage of operational data operations and lifecycle management processes means criterion 3.1 (the organization's set of standard processes is established and maintained organization-wide) is not yet satisfied." },
  "Supporting Processes__1__goal__1": { score: 2.0, comment: "Process improvement is driven by governance council discussions and post-incident reviews. We do not have a formal process improvement program or structured retrospective cadence. Improvements are implemented on an ad hoc basis without documented change rationale or outcome tracking.", rationale: "The organization meets criterion 2.2 (processes are appraised through governance council discussions and post-incident reviews) and criterion 1.3 (process problems or improvement opportunities are identified and addressed when they surface). Criterion 2.5 (process action plans are established, maintained, and followed to address improvements) is not satisfied — improvements are implemented ad hoc without documented change rationale or outcome tracking, meaning improvement actions are not formally planned or monitored. Advancement to criterion 3.1 (an organization set of standard processes is established and maintained) requires a structured improvement cycle with documented rationale and tracked outcomes." },

  // Topic 2: Process Quality Assurance
  "Supporting Processes__2__goal__0": { score: 2.1, comment: "Quality assurance for data management processes is performed informally through governance council reviews and peer review of deliverables. There is no dedicated process QA function or structured quality gate framework for data management activities.", rationale: "The organization meets criterion 2.1 (processes are evaluated against applicable process descriptions and standards through governance council reviews and peer review of deliverables) and criterion 1.1 (process and product issues are identified and addressed informally). Criterion 2.4 (records of quality assurance activities are established and maintained) is not satisfied — without a dedicated QA function, structured quality gate framework, or documented QA records, the organization cannot demonstrate a managed and traceable quality assurance practice. Advancement to criterion 3.1 (organizational standard policies, processes, and procedures for process and product QA are established, maintained, and followed) requires formalizing the QA function." },
  "Supporting Processes__2__goal__1": { score: 1.3, comment: "Non-conformance to data management standards and processes is not systematically tracked or reported. Issues are identified and addressed informally when they surface but there is no formal non-conformance register or escalation process.", rationale: "The organization meets criterion 1.1 (process and product issues are identified and addressed when they surface informally). Criterion 2.3 (quality issues are communicated and noncompliance resolution is ensured with staff and managers) is not satisfied — without a formal non-conformance register or escalation process, identified issues are addressed inconsistently and there is no mechanism to ensure resolution or visibility at the appropriate management level. Advancement to criterion 2.3 requires establishing a systematic non-conformance tracking and escalation framework with defined resolution accountability." },

  // Topic 3: Risk Management
  "Supporting Processes__3__goal__0": { score: 3.1, comment: "Data risks are identified and tracked in our Enterprise Risk Management system. Data risk assessments are conducted annually for critical data assets. The CDO participates in the Enterprise Risk Committee and data risks are formally escalated through the ERM framework.", rationale: "The organization satisfies criterion 3.3 (a risk management strategy is established and maintained, formalized through the Enterprise Risk Management framework with CDO participation in the Enterprise Risk Committee) and criterion 3.4 (risks are identified, analyzed, and documented by following the organization's standard process through annual data risk assessments). Criterion 3.5 (risks are evaluated and categorized using defined risk categories and parameters to determine relative priority) is met through the ERM classification framework. Advancement to criterion 3.7 (the status of each risk is monitored periodically and mitigation plans are implemented as appropriate) requires more frequent interim monitoring beyond annual cycles." },
  "Supporting Processes__3__goal__1": { score: 2.3, comment: "Risk mitigation actions for identified data risks are assigned to owners and tracked in our ERM system. However, risk mitigation progress reporting is limited to annual reviews and interim progress is not consistently monitored or escalated between review cycles.", rationale: "The organization satisfies criterion 3.6 (risk mitigation plans are developed in accordance with the risk management strategy, with mitigation actions assigned to owners and tracked in the ERM system). Criterion 2.2 (identified risks are monitored) is only partially met — with mitigation progress reporting limited to annual reviews and no consistent interim monitoring between cycles, the organization cannot demonstrate the ongoing, periodic risk status monitoring that criterion 3.7 requires. Advancement to criterion 3.7 requires establishing a more frequent monitoring cadence with defined interim review checkpoints." },
  "Supporting Processes__3__goal__2": { score: 2.3, comment: "Data-related risks are included in our Business Continuity Plan for tier-1 systems. Recovery Time Objectives and Recovery Point Objectives are defined for critical data assets. BCP testing for data systems is conducted annually. Coverage for non-tier-1 systems is incomplete.", rationale: "The organization satisfies criterion 2.2 (identified risks are monitored, with data-related risks included in the Business Continuity Plan for tier-1 systems with defined RTOs and RPOs) and criterion 2.1 (identified risks are analyzed, as evidenced by annual BCP testing for data systems). Criterion 3.4 (risks are identified, analyzed, and documented following the organization's standard process) is partially met for tier-1 systems but incomplete for non-tier-1 systems. The partial BCP coverage means the organization cannot fully satisfy criterion 3.7 (periodic monitoring and implementation of mitigation plans) across its entire data asset portfolio." },

  // Topic 4: Configuration Management
  "Supporting Processes__4__goal__0": { score: 3.4, comment: "Data platform configuration is managed through infrastructure-as-code (Terraform, Azure Bicep) stored in Azure DevOps. All configuration changes require peer review and are deployed through an automated CI/CD pipeline. Environment configurations for dev, test, and production are maintained consistently.", rationale: "The organization satisfies criteria 3.1 (a configuration management policy is defined, approved by governance, and implemented across platforms using Terraform and Azure Bicep in Azure DevOps) and 3.2 (changes to data stores, data interfaces, and process assets are planned and approved by stakeholders through peer review and automated CI/CD deployment). Criterion 2.2 (data changes from external data providers are subject to the organization's configuration management processes) is substantially met through the CI/CD pipeline. Advancement to criterion 3.3 (an audit program ensures compliance with configuration management policy across the organization) would require a formal audit process beyond the automated pipeline controls." },
  "Supporting Processes__4__goal__1": { score: 2.3, comment: "Change control for data platform changes follows our IT change management process with CAB approval for high-impact changes. Data content changes (transformations, business rules) follow a lighter-weight change process that lacks the same rigor as infrastructure changes.", rationale: "The organization satisfies criterion 2.1 (changes in the operational environment are planned, managed, and tested through IT CAB approval for high-impact infrastructure changes) and criterion 2.3 (data interface changes are managed and controlled through the IT change management process). Criterion 2.2 (data content changes, including those from external data providers, are subject to the organization's configuration management processes) is not fully met — the lighter-weight change process for transformations and business rules lacks the same rigor as infrastructure changes, meaning data content changes are not subject to the same managed controls. Advancement to criterion 3.1 requires a uniform configuration management policy applied consistently to both infrastructure and data-layer changes." },
  "Supporting Processes__4__goal__2": { score: 2.1, comment: "Configuration audits are performed annually as part of our IT general controls testing. Data-layer configuration (business rules, transformation logic, data quality rules) is not included in audit scope. We rely on version control history as a proxy for configuration auditability.", rationale: "The organization satisfies criterion 2.1 (changes in the operational environment are planned and managed, with configuration audits performed annually as part of IT general controls testing) and criterion 1.2 (configuration management information is available to stakeholders via version control history). Criterion 2.2 (data changes, including those from external providers, are subject to the organization's configuration management processes) is not met — data-layer configuration such as business rules, transformation logic, and data quality rules are outside audit scope. Advancement to criterion 3.3 (an audit program ensures compliance with configuration management policy across the organization) requires extending audit coverage to include data-layer configuration artifacts." },
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
    <span style={{ background: c.bg, color: c.color, border: `1.5px solid ${c.color}40`, borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, whiteSpace: "nowrap", minWidth: size === "lg" ? 160 : 130 }}>
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
// ─── Report Page Builders ─────────────────────────────────────────────────────
function buildAreaPages(responses, areaSummaries, C, badge, bar, stats, projectedScores = null, areaRecsAndProjections = null) {
  return Object.entries(AREAS).map(([aName, area]) => {
    const as_ = stats.areaStats[aName];
    const areaAvg = as_.avg;
    const areaProjections = projectedScores ? (projectedScores[aName] ?? null) : null;
    const radarSvg = areaRadarSVG(aName, responses, 320, areaProjections);
    const areaNarratives = areaSummaries ? (areaSummaries[aName] || areaSummaries[Object.keys(areaSummaries).find(k => k.toLowerCase().includes(aName.toLowerCase().slice(0,6))) || ""] || null) : null;

    const narrativeSection = area.topics.map((topic, tIdx) => {
      const scored = topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean);
      if (scored.length === 0) return "";
      const topicAvg = scored.reduce((a, b) => a + b, 0) / scored.length;
      const narrative = areaNarratives
        ? (areaNarratives[topic.name] || areaNarratives[Object.keys(areaNarratives).find(k => k.toLowerCase().includes(topic.name.toLowerCase().slice(0,6))) || ""] || null)
        : null;

      const areaTopicRecs = areaRecsAndProjections ? (areaRecsAndProjections[aName] || null) : null;
      const topicRecData = (() => {
        if (!areaTopicRecs) return null;
        const name = topic.name;
        // 1. Exact match
        if (areaTopicRecs[name]) return areaTopicRecs[name];
        // 2. Case-insensitive exact match
        const lName = name.toLowerCase();
        const ciKey = Object.keys(areaTopicRecs).find(k => k.toLowerCase() === lName);
        if (ciKey) return areaTopicRecs[ciKey];
        // 3. Fuzzy: AI key contains the full topic name (case-insensitive)
        const fuzzyKey = Object.keys(areaTopicRecs).find(k => k.toLowerCase().includes(lName) || lName.includes(k.toLowerCase()));
        return fuzzyKey ? areaTopicRecs[fuzzyKey] : null;
      })();
      const recBullets = topicRecData?.recs?.length > 0
        ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid ${area.color}18;">
            <p style="font-size:9.5px;font-weight:700;color:#94a3b8;letter-spacing:1.4px;margin:0 0 8px;font-family:'Outfit',sans-serif;text-transform:uppercase;">Recommendations</p>
            <ul style="margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:7px;">
              ${topicRecData.recs.map(r => `<li style="display:flex;align-items:flex-start;gap:9px;font-size:12.5px;color:#334155;line-height:1.65;font-family:'Outfit',sans-serif;">
                <span style="width:18px;height:18px;border-radius:50%;background:${area.color}18;border:1.5px solid ${area.color}40;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:${area.color};flex-shrink:0;margin-top:1px;">→</span>
                <span>${r}</span>
              </li>`).join("")}
            </ul>
          </div>`
        : "";

      return `<div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1.5px solid ${area.color}20;">
          <span style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;">${topic.name}</span>
          ${badge(topicAvg)}
        </div>
        ${narrative
          ? `<p style="margin:0;font-size:13px;color:#334155;line-height:1.75;font-family:'Outfit',sans-serif;">${narrative}</p>`
          : `<p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;font-family:'Outfit',sans-serif;">AI narrative pending.</p>`
        }
        ${recBullets}
      </div>`;
    }).join("");

    return `<div style="padding:44px 28px;page-break-before:always;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1.5px solid #f1f5f9;">
        ${nttLogoBlackHTML(20)}
        <span style="font-size:10px;font-weight:700;color:#cbd5e1;letter-spacing:2px;font-family:'Outfit',sans-serif;">CMMI DMM ASSESSMENT REPORT</span>
      </div>
      <div style="background:linear-gradient(135deg,${area.color}12,${area.color}04);border-radius:12px;padding:20px 26px;margin-bottom:24px;border:1.5px solid ${area.color}1a;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:14px;">
            <img src="${area.icon}" alt="" style="width:32px;height:32px;object-fit:contain;" />
            <div>
              <h2 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;font-family:'Fraunces',serif;">${aName}</h2>
              <p style="margin:4px 0 0;font-size:12px;color:#64748b;font-family:'Outfit',sans-serif;">${area.topics.length} topics · ${as_.total} goals · ${as_.scored} scored</p>
            </div>
          </div>
          ${areaAvg ? `<div style="text-align:right;">${badge(areaAvg)}<div style="font-size:10px;color:#94a3b8;margin-top:5px;font-family:'Outfit',sans-serif;">Area average</div></div>` : ""}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 10px;font-family:'Outfit',sans-serif;">MATURITY PROFILE</p>
        ${radarSvg}
      </div>
      <div style="border-top:1.5px solid #f1f5f9;padding-top:22px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;margin:0 0 18px;font-family:'Outfit',sans-serif;">ASSESSMENT FINDINGS</p>
        ${narrativeSection || '<p style="color:#94a3b8;font-size:12px;font-family:Outfit,sans-serif;">No goals have been scored for this area yet.</p>'}
      </div>
    </div>`;
  }).join("");
}

function buildReportHTML(user, responses, aiSummary = null, areaSummaries = null, projectedScores = null, areaRecsAndProjections = null) {
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
    return `<span style="background:${c.bg};color:${c.color};border:1.5px solid ${c.color}50;border-radius:20px;padding:3px 11px;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;white-space:nowrap;display:inline-block;min-width:130px;text-align:center;">${score.toFixed(1)} — ${c.label}</span>`;
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
      <td style="padding:11px 16px;font-weight:600;color:#0f172a;font-size:13px;font-family:'Outfit',sans-serif;"><img src="${area.icon}" alt="" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:6px;" />${aName}</td>
      <td style="padding:11px 16px;text-align:center;">${avg ? badge(avg) : '<span style="color:#cbd5e1;font-size:13px;">—</span>'}</td>
      <td style="padding:11px 16px;text-align:center;font-size:12px;color:#64748b;font-family:'Outfit',sans-serif;">${as_.scored}/${as_.total}</td>
      <td style="padding:11px 16px;"><div style="background:#f1f5f9;border-radius:4px;height:8px;width:${Math.max(pct,2)}px;max-width:120px;"><div style="width:100%;background:${area.color};height:8px;border-radius:4px;"></div></div></td>
    </tr>`;
  }).join("");

  const areaDetailPages = buildAreaPages(responses, areaSummaries, C, badge, bar, stats, projectedScores, areaRecsAndProjections);

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:wght@400;600;700&display=swap');
      * { box-sizing:border-box; }
      @media print {
        @page { margin:14mm 8mm 16mm; size:A4; }
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
          <div style="font-family:'Fraunces',serif;font-size:68px;font-weight:700;color:#0f172a;line-height:1;">${stats.avg.toFixed(1)}</div>
          <div style="font-size:15px;color:#0072BC;margin-top:5px;font-family:'Outfit',sans-serif;">out of 5.0 — ${overallCmmi?.label || ""}</div>
        </div>` : ""}
        <div style="border-left:1px solid #e2e8f0;padding-left:44px;padding-bottom:6px;">
          <div style="font-size:10px;color:#94a3b8;font-weight:600;letter-spacing:1.5px;margin-bottom:10px;font-family:'Outfit',sans-serif;">ASSESSMENT COVERAGE</div>
          <div style="font-size:30px;font-weight:700;color:#0f172a;font-family:'Outfit',sans-serif;">${stats.scoredGoals}<span style="font-size:15px;color:#94a3b8;font-weight:400;"> / ${stats.totalGoals} goals</span></div>
          <div style="font-size:13px;color:#94a3b8;margin-top:3px;font-family:'Outfit',sans-serif;">${stats.pct}% complete</div>
        </div>
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:28px;display:flex;gap:44px;">
        <div><div style="font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:4px;font-family:'Outfit',sans-serif;">PREPARED BY</div><div style="font-size:14px;color:#0f172a;font-weight:500;font-family:'Outfit',sans-serif;">${user.name}</div>${user.role ? `<div style="font-size:11px;color:#64748b;font-family:'Outfit',sans-serif;">${user.role}</div>` : ""}</div>
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
        const cleaned = aiSummary.split('\n').filter(line => !/^\*\*.*\*\*$/.test(line.trim()) && !/^#+\s/.test(line.trim())).join('\n').trim();
        const paras = cleaned.split(/\n\n+/).filter(Boolean);
        const body = paras.map((p, i) =>
          `<p style="${i === 0 ? 'margin:0;' : 'margin:14px 0 0;'}font-size:14px;color:#334155;line-height:1.85;font-family:Outfit,sans-serif;">${p.replace(/\n/g, '<br/>')}</p>`
        ).join('');
        return `<div style="margin-bottom:32px;padding:32px 36px;background:#f8fafc;border-radius:14px;border:1.5px solid #e2e8f0;">
          <h3 style="font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:#0f172a;margin:0 0 20px;line-height:1.2;">Executive Assessment: Data Management Maturity</h3>
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
    </div>
  `;
}

// ─── Recs + Projections Generator ────────────────────────────────────────────
// Single combined call per area: produces per-topic bullet recommendations AND
// projected scores in one pass so projections are grounded in the actual recs.

async function generateSingleAreaRecsAndProjections(aName, responses, user) {
  const area = AREAS[aName];
  const clientName = (user && user.org) ? user.org : "the client";

  const topicBlocks = area.topics.map((topic, tIdx) => {
    const scored = topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean);
    if (scored.length === 0) return null;
    const avg = (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1);

    const goalLines = topic.goals.map((goalText, gIdx) => {
      const r = responses[rKey(aName, tIdx, "goal", gIdx)];
      if (!r?.score) return null;
      const lines = [`    Goal ${gIdx + 1} (Score ${r.score}/5): ${goalText}`];
      if (r.comment)   lines.push(`      Assessor notes: ${r.comment}`);
      if (r.rationale) lines.push(`      Scoring rationale: ${r.rationale}`);
      return lines.join("\n");
    }).filter(Boolean);

    // Append the rubric criteria for this topic so the AI knows exactly what advancement requires
    const rubricEntries = (DMM_RUBRIC[aName] || {})[topic.name] || [];
    const rubricLines = rubricEntries.length > 0
      ? "    DMM Rubric criteria for this topic:\n" +
        rubricEntries.map(e => `      ${e.score}: ${e.desc}`).join("\n")
      : "";

    const block = [`Topic: ${topic.name} (current avg ${avg}/5)`, ...goalLines];
    if (rubricLines) block.push(rubricLines);
    return block.join("\n");
  }).filter(Boolean);

  if (topicBlocks.length === 0) return null;

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `You are a senior CMMI DMM data governance consultant at NTT DATA. You have just completed stakeholder interviews and a maturity assessment at ${clientName} and are now writing the recommendations section of the findings report.

For each topic, write three to four recommendations. Ground every recommendation in the specific evidence from the assessor notes and scoring rationale — the tools, systems, roles, process gaps, and terminology that came up in interviews. A good recommendation explains what to do, why it matters to ${clientName} specifically, and what business value it unlocks.

Tone and style rules:
- Start each recommendation with a strong action verb (e.g. "Establish...", "Expand...", "Formalize...", "Implement..."). Never open with "${clientName} should" or any variation of that construction.
- Weave ${clientName}'s name naturally into the body of the recommendation where it adds clarity — but only when it reads naturally, not as a formula
- Never write "the organization" or "the client" — use ${clientName} or specific team/role names from the evidence
- Pull exact terms from the assessor notes: if the notes mention Collibra, BCBS 239, the CDO office, Data Stewards, Azure Purview, or any other specific system or role, use those terms — do not substitute generic language
- Do not quote or paraphrase rubric criteria; do not use "to satisfy criterion X.X" phrasing
- Each recommendation should feel like it came from someone who sat in the room with ${clientName}'s team — specific, grounded, and written for this client alone, not a template dressed up with a name substitution
- Vary sentence structure across recommendations so they don't read as a repeated pattern
- Include the business value or risk implication where it naturally fits — what does this unlock, or what risk does it close?

After the recommendations, produce a projected maturity score (decimal, e.g. 2.4) achievable after implementing them:
- Conservative: typical advancement is 0.3–0.8 points per improvement cycle
- Never project above 5.0 or below the current score
- If current score >= 4.0, cap projected improvement at 0.3 unless evidence clearly indicates near-readiness for next level
- The projected score must reflect the ambition and scope of what you actually recommended

Use American English spelling throughout.

CLIENT: ${clientName}
ASSESSMENT AREA: ${aName}

${topicBlocks.join("\n\n")}

Return ONLY a valid JSON object. No preamble, no markdown fences, no explanation:
{
  "Exact Topic Name": {
    "recs": [
      "Recommendation 1",
      "Recommendation 2",
      "Recommendation 3"
    ],
    "projected": 2.8
  }
}`
      }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.content.map(c => c.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    console.error(`Recs JSON parse failed for area "${aName}" — response may have been truncated. Raw output (first 500 chars):`, raw.slice(0, 500));
    throw e;
  }

  const validated = {};
  Object.entries(parsed).forEach(([topicName, val]) => {
    if (!val || !Array.isArray(val.recs)) return;
    const n = parseFloat(val.projected);
    validated[topicName] = {
      recs: val.recs.filter(r => typeof r === "string" && r.trim().length > 0),
      projected: !isNaN(n) && n >= 1.0 && n <= 5.0 ? Math.round(n * 10) / 10 : null,
    };
  });
  return Object.keys(validated).length > 0 ? validated : null;
}

async function generateAllAreaRecsAndProjections(responses, user) {
  const results = await Promise.allSettled(
    Object.keys(AREAS).map(aName =>
      generateSingleAreaRecsAndProjections(aName, responses, user).then(result => ({ aName, result }))
    )
  );

  const combined = {};
  results.forEach(r => {
    if (r.status === "fulfilled" && r.value?.result) {
      combined[r.value.aName] = r.value.result;
    } else if (r.status === "rejected") {
      console.error("Recs+projections failed for area:", r.reason?.message || r.reason);
    }
  });
  return Object.keys(combined).length > 0 ? combined : null;
}

function extractProjectedScores(areaRecsAndProjections) {
  if (!areaRecsAndProjections) return null;
  const projections = {};
  Object.entries(areaRecsAndProjections).forEach(([aName, topicData]) => {
    const topicProjections = {};
    Object.entries(topicData).forEach(([topicName, data]) => {
      if (data?.projected !== null && data?.projected !== undefined) {
        topicProjections[topicName] = data.projected;
      }
    });
    if (Object.keys(topicProjections).length > 0) projections[aName] = topicProjections;
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
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a senior CMMI DMM data governance consultant authoring a formal assessment report.

For each topic below, write a concise narrative paragraph (3–5 sentences) that:
- Characterizes the organization's current maturity based on the goal scores and evidence
- References specific observations from the assessor comments and AI rationales
- Identifies the key gap or risk
- Uses professional language appropriate for an executive audience
- Flowing prose only — no bullets, headers, or markdown

AREA: ${aName}
${topicBlocks.join("\n\n")}

Return ONLY a valid JSON object. No preamble, no markdown fences. Structure:
{ "Topic Name": "narrative paragraph" }`
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
  const overallAvg = stats.avg ? stats.avg.toFixed(1) : "N/A";

  // Build an evidence digest: for each area, include topic scores plus the single most
  // informative assessor comment per topic (the goal with the lowest score, which is
  // where the most specific observations tend to live). Cap each comment at 200 chars
  // to keep the prompt focused without losing org-specific language.
  const digest = Object.entries(AREAS).map(([aName, area]) => {
    const topicBlocks = area.topics.map((topic, tIdx) => {
      const scored = topic.goals
        .map((goalText, gIdx) => ({ goalText, gIdx, r: responses[rKey(aName, tIdx, "goal", gIdx)] }))
        .filter(x => x.r?.score);
      if (scored.length === 0) return null;

      const topicAvg = (scored.reduce((a, x) => a + x.r.score, 0) / scored.length).toFixed(1);

      // Pick the most informative goal: lowest-scored that has a comment
      const withComment = scored.filter(x => x.r.comment?.trim());
      const anchor = withComment.length > 0
        ? withComment.reduce((a, b) => a.r.score <= b.r.score ? a : b)
        : scored.reduce((a, b) => a.r.score <= b.r.score ? a : b);

      const lines = [`  Topic: ${topic.name} — avg ${topicAvg}/5`];
      if (anchor.r.comment)   lines.push(`    Key finding: "${anchor.r.comment.slice(0, 200)}${anchor.r.comment.length > 200 ? "…" : ""}"`);
      if (anchor.r.rationale) lines.push(`    Scoring rationale: ${anchor.r.rationale.slice(0, 180)}${anchor.r.rationale.length > 180 ? "…" : ""}`);
      return lines.join("\n");
    }).filter(Boolean);

    if (topicBlocks.length === 0) return null;
    const areaScores = area.topics.flatMap((topic, tIdx) =>
      topic.goals.map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score).filter(Boolean)
    );
    const areaAvg = (areaScores.reduce((a, b) => a + b, 0) / areaScores.length).toFixed(1);
    return `${aName} (avg ${areaAvg}/5):\n${topicBlocks.join("\n")}`;
  }).filter(Boolean).join("\n\n");

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{
        role: "user",
        content: `You are a senior data governance advisor at NTT DATA preparing the executive summary of a formal CMMI DMM assessment report for a client sponsor.

Organization: ${user.org}
Assessor: ${user.name}${user.role ? ` (${user.role})` : ""}
Overall Maturity Score: ${overallAvg}/5.0 (CMMI 1–5 scale)
Goals Scored: ${stats.scoredGoals} of ${stats.totalGoals}

ASSESSMENT EVIDENCE (area and topic scores with key findings from assessor interviews):
${digest}

Write a polished 4–5 paragraph executive summary. Requirements:
- Use the organization's name (${user.org}) naturally — this must read as written specifically for this client, not as a generic template
- Ground every observation in the evidence above — reference specific tools, processes, roles, pain points, or capabilities named in the key findings. Never make claims that cannot be traced to the evidence
- Open with a concise characterization of the organization's overall data management maturity posture
- Dedicate a paragraph to relative strengths — cite the highest-scoring areas and what the evidence says is working well
- Dedicate a paragraph to the most significant gaps — name the lowest-scoring areas and the specific findings that explain why, framing them as opportunities rather than failures
- Close with a forward-looking paragraph on the highest-priority focus areas needed to advance maturity — where the scoring rationales identify that the organization is close to satisfying the next rubric criterion, call that out specifically as a near-term opportunity
- Tone: authoritative, candid, and appropriate for a C-suite or board-level sponsor who commissioned the assessment
- Use American English spelling throughout
- Do NOT use bullet points, headers, numbered lists, or markdown — flowing prose paragraphs only
- Do NOT mention CMMI level numbers directly; use the level labels (Performed, Managed, Defined, Measured, Optimized) where relevant
- The scoring rationales reference specific DMM rubric criteria (e.g. "meets criterion 2.3 but not 2.4"); where relevant, translate these into plain business language about what capability is present and what is the next concrete step — never cite criterion numbers directly in the summary`
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`Anthropic error: ${data.error.message || JSON.stringify(data.error)}`);
  if (!data.content) throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  return data.content.map(c => c.text || "").join("").trim();
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

function ReportOverlay({ user, responses, onClose, cachedSummary, cachedAreaSummaries, cachedAreaRecsAndProjections, onSummaryGenerated, onAreaSummariesGenerated, onAreaRecsAndProjectionsGenerated }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [aiError, setAiError] = useState("");
  const [html, setHtml] = useState("");
  const summaryRef         = useRef(null);
  const areaSummariesRef          = useRef(null);
  const areaRecsAndProjectionsRef  = useRef(null);

  const rebuild = (summary, areaSummaries, areaRecsAndProjections) => {
    try {
      const projectedScores = extractProjectedScores(areaRecsAndProjections);
      setHtml(buildReportHTML(user, responses, summary, areaSummaries, projectedScores, areaRecsAndProjections));
    } catch (e) {
      console.error("buildReportHTML failed:", e);
      setErrorMsg(e.message || String(e));
      setStatus("error");
    }
  };

  useEffect(() => {
    // Build static shell immediately so the report is visible on open
    try {
      setHtml(buildReportHTML(user, responses, null, null));
    } catch (e) {
      setErrorMsg(e.message || String(e));
      setStatus("error");
      return;
    }

    // If fully cached, render complete report right away — no button needed
    if (cachedSummary && cachedAreaSummaries && cachedAreaRecsAndProjections) {
      summaryRef.current                = cachedSummary;
      areaSummariesRef.current          = cachedAreaSummaries;
      areaRecsAndProjectionsRef.current = cachedAreaRecsAndProjections;
      try {
        const projectedScores = extractProjectedScores(cachedAreaRecsAndProjections);
        setHtml(buildReportHTML(user, responses, cachedSummary, cachedAreaSummaries, projectedScores, cachedAreaRecsAndProjections));
        setStatus("ready");
      } catch (e) {
        setErrorMsg(e.message || String(e));
        setStatus("error");
      }
    }
    // Otherwise stay "idle" — user must click Generate AI Content

    return () => { const el = document.getElementById("dmm-print-style"); if (el) el.remove(); };
  }, []);

  const runAIGeneration = () => {
    setStatus("generating");
    setAiError("");

    const summaryCall     = cachedSummary                ? Promise.resolve(cachedSummary)                : generateAISummary(user, responses);
    const areaSummaryCall = cachedAreaSummaries          ? Promise.resolve(cachedAreaSummaries)          : generateAreaSummaries(responses);
    const recsProjectCall = cachedAreaRecsAndProjections ? Promise.resolve(cachedAreaRecsAndProjections) : generateAllAreaRecsAndProjections(responses, user);

    Promise.allSettled([summaryCall, areaSummaryCall, recsProjectCall]).then(([sRes, asRes, rpRes]) => {
      const summary                = (sRes.status  === "fulfilled" && sRes.value)  ? sRes.value  : null;
      const areaSummaries          = (asRes.status === "fulfilled" && asRes.value) ? asRes.value : null;
      const areaRecsAndProjections = (rpRes.status === "fulfilled" && rpRes.value) ? rpRes.value : null;

      if (sRes.status  === "rejected") { console.error("AI summary error:",        sRes.reason?.message  || sRes.reason); setAiError(`Summary failed: ${sRes.reason?.message || "unknown"}`); }
      if (asRes.status === "rejected") console.error("AI area summaries error:",   asRes.reason?.message || asRes.reason);
      if (rpRes.status === "rejected") console.error("AI recs+projections error:", rpRes.reason?.message || rpRes.reason);

      summaryRef.current                = summary;
      areaSummariesRef.current          = areaSummaries;
      areaRecsAndProjectionsRef.current = areaRecsAndProjections;

      if (summary                && !cachedSummary                && onSummaryGenerated)                 onSummaryGenerated(summary);
      if (areaSummaries          && !cachedAreaSummaries          && onAreaSummariesGenerated)           onAreaSummariesGenerated(areaSummaries);
      if (areaRecsAndProjections && !cachedAreaRecsAndProjections && onAreaRecsAndProjectionsGenerated) onAreaRecsAndProjectionsGenerated(areaRecsAndProjections);

      try {
        const projectedScores = extractProjectedScores(areaRecsAndProjections);
        setHtml(buildReportHTML(user, responses, summary, areaSummaries, projectedScores, areaRecsAndProjections));
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
  };

  const handleToggle = (val) => {
    setIncludeRecs(val);
    if (status === "ready") rebuild(summaryRef.current, areaSummariesRef.current, areaRecsAndProjectionsRef.current);
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
              onClick={() => { setStatus("idle"); setErrorMsg(""); }}
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
          {status === "idle" && (
            <button
              onClick={runAIGeneration}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,rgba(25,163,252,.18),rgba(0,203,148,.14))", border: "1px solid rgba(25,163,252,.35)", borderRadius: 20, padding: "5px 14px 5px 10px", cursor: "pointer", fontFamily: "inherit" }}
            >
              <span style={{ fontSize: 14, color: "#fff" }}>✦</span>
              <span style={{ color: "#7BCFFF", fontSize: 11, fontWeight: 700, letterSpacing: .3 }}>Generate AI Content</span>
            </button>
          )}
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
            {(status === "idle" || status === "generating") && (
              <div style={{ padding: "20px 40px", background: "linear-gradient(135deg,#070F26,#0A1E3D)", display: "flex", alignItems: "center", gap: 14, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                {status === "generating" ? (
                  <>
                    <div style={{ width: 18, height: 18, border: "2px solid rgba(25,163,252,.3)", borderTop: "2px solid #19A3FC", borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "#7BCFFF", fontSize: 13, margin: 0 }}>AI narrative &amp; recommendations generating — report will update automatically when ready…</p>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>✦</span>
                    <p style={{ color: "#7BCFFF", fontSize: 13, margin: 0 }}>Click <strong style={{ color: "#fff" }}>Generate AI Content</strong> in the toolbar to add executive narrative, area summaries, and projected scores to this report.</p>
                  </>
                )}
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
async function generateTopicRecs(responses) {
  const areaSummaries = Object.entries(AREAS).map(([aName, area]) => {
    const topicSummaries = area.topics.map((topic, tIdx) => {
      const goalLines = topic.goals.map((goalText, gIdx) => {
        const r = responses[rKey(aName, tIdx, "goal", gIdx)];
        if (!r?.score) return null;
        const lines = [`  Goal ${gIdx + 1} (score: ${r.score}/5): ${goalText}`];
        if (r.comment)   lines.push(`    Current state: ${r.comment}`);
        if (r.rationale) lines.push(`    AI rationale: ${r.rationale}`);
        return lines.join("\n");
      }).filter(Boolean);

      if (goalLines.length === 0) return null;

      const scored = topic.goals
        .map((_, gIdx) => responses[rKey(aName, tIdx, "goal", gIdx)]?.score)
        .filter(Boolean);
      const avg = (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1);

      return `  Topic: ${topic.name} (avg ${avg}/5)\n${goalLines.join("\n")}`;
    }).filter(Boolean);

    if (topicSummaries.length === 0) return null;
    return `${aName}:\n${topicSummaries.join("\n\n")}`;
  }).filter(Boolean).join("\n\n---\n\n");

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `You are a senior CMMI DMM data governance consultant preparing targeted recommendations for a client assessment report.

Below are the assessment results organized by area and topic. For each topic you will find the individual goal scores, the assessor's description of the organization's current state, and the AI rationale that justified each score.

Use this evidence to generate one specific, actionable recommendation per topic (max 20 words) that directly addresses the most critical gap revealed by the goal-level detail — not just the average score.

ASSESSMENT RESULTS:
${areaSummaries}

Return ONLY a valid JSON object. No preamble or markdown. Structure:
{
  "Area Name": {
    "Topic Name": { "rec": "specific actionable recommendation grounded in the assessment evidence", "priority": "high|medium|low" }
  }
}

Priority rules: avg score < 1.8 → high, < 2.5 → medium, ≥ 2.5 → low.`
      }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.content.map(c => c.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ responses, onNavigate, user, onExport, topicRecs, onTopicRecsChange }) {
  const stats = getStats(responses);
  const overallLevel = stats.avg ? Math.round(stats.avg) : null;
  const overallCmmi = overallLevel ? CMMI[overallLevel] : null;


  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .area-card { background:white; border-radius:16px; padding:20px; border:1.5px solid #F1F5F9; transition:box-shadow .2s,transform .15s; cursor:pointer; }
        .area-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }
      `}</style>

      <div style={{ marginBottom: 32, animation: "fadeIn .4s ease", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A", fontFamily: "'Fraunces', serif" }}>Assessment Dashboard</h2>
          <p style={{ color: "#64748B", marginTop: 6, fontSize: 14 }}>Track your organization's CMMI Data Management Maturity progress</p>
        </div>
        <button
          onClick={onExport}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#070F26,#005B96)", border: "none", borderRadius: 10, padding: "10px 18px", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,114,188,.25)", transition: "opacity .15s" }}
          onMouseOver={e => e.currentTarget.style.opacity = ".85"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          <span style={{ fontSize: 15 }}>⬇</span> Export PDF
        </button>
      </div>

      {/* Top summary row: overall score + master radar + CMMI scale */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: 16, marginBottom: 28, animation: "fadeIn .5s ease" }}>

        {/* Overall score + completion stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "linear-gradient(135deg, #070F26, #005B96)", borderRadius: 16, padding: 22, color: "white", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "#7BCFFF", marginBottom: 10 }}>OVERALL MATURITY</div>
            {stats.avg ? (
              <>
                <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, fontFamily: "'Fraunces', serif" }}>{stats.avg ? stats.avg.toFixed(1) : "—"}</div>
                <div style={{ fontSize: 13, color: "#B3DEFF", marginTop: 5 }}>out of 5.0 — {overallCmmi?.label}</div>
                <div style={{ marginTop: 10, background: "rgba(255,255,255,.1)", borderRadius: 4, height: 4 }}>
                  <div style={{ width: `${(stats.avg / 5) * 100}%`, background: "#19A3FC", height: 4, borderRadius: 4, transition: "width .6s ease" }} />
                </div>
              </>
            ) : (
              <div style={{ color: "#7BCFFF", fontSize: 13, marginTop: 8 }}>No goals scored yet</div>
            )}
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: 18, border: "1.5px solid #F1F5F9" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "#94A3B8", marginBottom: 10 }}>GOALS COMPLETED</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <ProgressRing pct={stats.pct} size={60} color="#0072BC" />
                <span style={{ position: "absolute", fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{stats.pct}%</span>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{stats.scoredGoals}<span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 400 }}>/{stats.totalGoals}</span></div>
                <div style={{ fontSize: 12, color: "#64748B" }}>goals analyzed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Radar */}
        <div style={{ background: "linear-gradient(145deg, #070F26, #0A1E3D)", borderRadius: 16, padding: "20px 16px 10px", border: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "rgba(165,180,252,.6)", marginBottom: 0, paddingLeft: 8 }}>MATURITY ACROSS ALL AREAS</div>
          <MasterRadarChart responses={responses} />
          {/* Area color legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingBottom: 6 }}>
            {Object.entries(AREAS).map(([aName, area]) => (
              <div key={aName} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: area.color, display: "inline-block" }} />
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", fontFamily: "'Outfit', sans-serif" }}>{area.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CMMI scale reference */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1.5px solid #F1F5F9", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "#94A3B8", marginBottom: 14 }}>CMMI SCALE REFERENCE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "space-around" }}>
            {Object.entries(CMMI).map(([lvl, c]) => (
              <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: `1.5px solid ${c.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c.color, flexShrink: 0 }}>{lvl}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area cards with embedded radar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", letterSpacing: 1.2 }}>ASSESSMENT AREAS</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, animation: "fadeIn .6s ease" }}>
        {Object.entries(AREAS).map(([aName, area]) => {
          const as_ = stats.areaStats[aName];
          const pct = as_.total > 0 ? Math.round((as_.scored / as_.total) * 100) : 0;
          return (
            <div key={aName} className="area-card" onClick={() => onNavigate(aName)} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: `${area.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><img src={area.icon} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} /></span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>{aName}</div>
                    <div style={{ color: "#94A3B8", fontSize: 12 }}>{area.topics.length} topics · {as_.total} goals</div>
                  </div>
                </div>
                {as_.avg && <ScoreBadge score={as_.avg} />}
              </div>

              {/* Radar chart */}
              <div style={{ borderTop: `1px solid ${area.color}15`, borderBottom: `1px solid ${area.color}15`, margin: "0 -20px", padding: "4px 0" }}>
                <AreaRadarChart areaName={aName} responses={responses} />
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Scoring progress</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{as_.scored}/{as_.total} goals</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${pct}%`, background: area.color, height: 5, borderRadius: 4, transition: "width .6s ease" }} />
                </div>
              </div>

              {/* Topic pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>


                {area.topics.map((t, i) => {
                  const scored = t.goals.filter((_, gIdx) => responses[rKey(aName, i, "goal", gIdx)]?.score).length;
                  const topicAvg = scored > 0
                    ? t.goals.map((_, gIdx) => responses[rKey(aName, i, "goal", gIdx)]?.score).filter(Boolean).reduce((a, b) => a + b, 0) / scored
                    : null;
                  return (
                    <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: scored > 0 ? `${area.color}12` : "#F8FAFC", color: scored > 0 ? area.color : "#94A3B8", border: `1px solid ${scored > 0 ? area.color + "30" : "#E2E8F0"}`, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      {t.name}
                      {topicAvg && <span style={{ fontWeight: 700 }}>· {topicAvg.toFixed(1)}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goalNum, goalText, areaColor, responseData, onCommentChange, onAnalyze, isAnalyzing }) {
  const r = responseData || {};
  const scored = !!r.score;

  return (
    <div style={{ background: "white", borderRadius: 14, border: `1.5px solid ${scored ? areaColor + "30" : "#E2E8F0"}`, padding: 22, marginBottom: 14, transition: "border-color .2s" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .analyze-btn { background:linear-gradient(135deg, #0072BC, #009AA4); border:none; border-radius:8px; padding:9px 18px; color:white; font-size:13px; font-weight:600; font-family:'Outfit',sans-serif; cursor:pointer; transition:opacity .2s; white-space:nowrap; }
        .analyze-btn:hover:not(:disabled) { opacity:.85; }
        .analyze-btn:disabled { opacity:.5; cursor:not-allowed; }
        .goal-textarea { width:100%; border:1.5px solid #E2E8F0; border-radius:10px; padding:12px; font-size:14px; font-family:'Outfit',sans-serif; color:#334155; resize:vertical; min-height:90px; outline:none; transition:border-color .2s; box-sizing:border-box; line-height:1.6; }
        .goal-textarea:focus { border-color:#19A3FC; }
        .goal-textarea::placeholder { color:#CBD5E1; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${areaColor}15`, color: areaColor, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>G{goalNum}</span>
        <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.65, fontWeight: 500 }}>{goalText}</p>
      </div>

      <textarea
        className="goal-textarea"
        placeholder="Describe your organization's current state for this goal. Include specific processes, tools, roles, or policies in place. The more detail you provide, the more accurate the AI scoring will be..."
        value={r.comment || ""}
        onChange={e => onCommentChange(e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 10 }}>
        <button className="analyze-btn" onClick={onAnalyze} disabled={!r.comment?.trim() || isAnalyzing}>
          {isAnalyzing ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Analyzing...
            </span>
          ) : "✦ Analyze with AI"}
        </button>
        {scored && <ScoreBadge score={r.score} size="lg" />}
      </div>

      {r.rationale && (() => {
        const lvl = Math.min(5, Math.max(1, Math.round(r.score)));
        const c = CMMI[lvl];
        return (
          <div style={{ marginTop: 14, padding: "12px 16px", background: `${c.bg}99`, borderRadius: 10, border: `1.5px solid ${c.color}70` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: 1, marginBottom: 5 }}>AI ASSESSMENT RATIONALE</div>
            <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.65 }}>{r.rationale}</p>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ qNum, qText, comment, onCommentChange }) {
  return (
    <div style={{ background: "#FAFAFA", borderRadius: 12, border: "1.5px solid #E2E8F0", padding: 18, marginBottom: 10 }}>
      <style>{`.q-textarea { width:100%; border:1.5px solid #E2E8F0; border-radius:10px; padding:10px 12px; font-size:14px; font-family:'Outfit',sans-serif; color:#334155; resize:vertical; min-height:70px; outline:none; background:white; transition:border-color .2s; box-sizing:border-box; line-height:1.6; } .q-textarea:focus { border-color:#CBD5E1; } .q-textarea::placeholder { color:#CBD5E1; }`}</style>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", flexShrink: 0, paddingTop: 1 }}>Q{qNum}</span>
        <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>{qText}</p>
      </div>
      <textarea
        className="q-textarea"
        placeholder="Enter your notes or observations for this question..."
        value={comment || ""}
        onChange={e => onCommentChange(e.target.value)}
      />
    </div>
  );
}

// ─── Assessment View ──────────────────────────────────────────────────────────
function AssessmentView({ areaName, responses, analyzing, onGoalComment, onQuestionComment, onAnalyze }) {
  const area = AREAS[areaName];
  const [activeTopic, setActiveTopic] = useState(0);

  // Reset to first topic whenever the area changes — prevents index-out-of-bounds crash
  // when switching from an area with more topics to one with fewer
  useEffect(() => { setActiveTopic(0); }, [areaName]);

  const topic = area?.topics?.[activeTopic];
  const stats = getStats(responses).areaStats[areaName];

  // Guard: if area or topic hasn't resolved yet, render nothing
  if (!area || !topic) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Area header */}
      <div style={{ padding: "24px 36px 0", background: "white", borderBottom: "1.5px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: `${area.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><img src={area.icon} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F172A", fontFamily: "'Fraunces', serif" }}>{areaName}</h2>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{stats.scored}/{stats.total} goals scored</span>
            </div>
          </div>
          {stats.avg && <ScoreBadge score={stats.avg} size="lg" />}
        </div>

        {/* Topic tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 0 }}>
          {area.topics.map((t, i) => {
            const scored = t.goals.filter((_, gIdx) => responses[rKey(areaName, i, "goal", gIdx)]?.score).length;
            const active = activeTopic === i;
            return (
              <button key={i} onClick={() => setActiveTopic(i)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? area.color : "#64748B", borderBottom: active ? `2.5px solid ${area.color}` : "2.5px solid transparent", transition: "all .15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                {t.name}
                {scored > 0 && <span style={{ fontSize: 10, background: `${area.color}20`, color: area.color, borderRadius: 10, padding: "1px 6px", fontWeight: 700 }}>{scored}/{t.goals.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px", animation: "fadeIn .3s ease" }}>
        {/* Goals */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: .5 }}>GOALS</span>
            <span style={{ fontSize: 11, background: `${area.color}15`, color: area.color, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{topic.goals.length} items · AI scored</span>
            <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
          </div>
          {topic.goals.map((goal, gIdx) => (
            <GoalCard
              key={gIdx}
              goalNum={gIdx + 1}
              goalText={goal}
              areaColor={area.color}
              responseData={responses[rKey(areaName, activeTopic, "goal", gIdx)]}
              onCommentChange={v => onGoalComment(areaName, activeTopic, gIdx, v)}
              onAnalyze={() => onAnalyze(areaName, activeTopic, gIdx)}
              isAnalyzing={analyzing === `${areaName}__${activeTopic}__${gIdx}`}
            />
          ))}
        </div>

        {/* Questions */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: .5 }}>ASSESSMENT QUESTIONS</span>
            <span style={{ fontSize: 11, background: "#F1F5F9", color: "#64748B", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{topic.questions.length} items · Commentary only</span>
            <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
          </div>
          <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 14, marginTop: -6, fontStyle: "italic" }}>These questions guide your assessment discussion. Enter observations and notes — they inform the broader topic narrative but are not individually scored.</p>
          {topic.questions.map((q, qIdx) => (
            <QuestionCard
              key={qIdx}
              qNum={qIdx + 1}
              qText={q}
              comment={responses[rKey(areaName, activeTopic, "q", qIdx)]?.comment}
              onCommentChange={v => onQuestionComment(areaName, activeTopic, qIdx, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
function MainApp({ user, responses, analyzing, onGoalComment, onQuestionComment, onAnalyze, onLogout, onClearTopicRecs }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [showReport, setShowReport] = useState(false);
  const [topicRecs, setTopicRecs] = useState(null);
  const [reportSummary, setReportSummary] = useState(null);
  const [reportAreaSummaries, setReportAreaSummaries] = useState(null);
  const [reportAreaRecsAndProjections, setReportAreaRecsAndProjections] = useState(null);

  // Expose a way for Root to clear all AI cache state when scores change
  useEffect(() => {
    if (onClearTopicRecs) onClearTopicRecs(() => {
      setTopicRecs(null);
      setReportSummary(null);
      setReportAreaSummaries(null);
      setReportAreaRecsAndProjections(null);
    });
  }, []);

  // Load cached report AI content from storage on mount
  useEffect(() => {
    (async () => {
      try { const s = await window.storage.get("dmm_report_summary");          if (s?.value) setReportSummary(s.value); } catch (e) {}
      try { const a = await window.storage.get("dmm_report_area_summaries");   if (a?.value) { const p = JSON.parse(a.value); if (p && typeof p === "object") setReportAreaSummaries(p); } } catch (e) {}
      try { const r = await window.storage.get("dmm_report_area_recs_proj");   if (r?.value) { const p = JSON.parse(r.value); if (p && typeof p === "object") setReportAreaRecsAndProjections(p); } } catch (e) {}
    })();
  }, []);
  const stats = getStats(responses);

  const navItem = (label, view, icon, color) => {
    const active = activeView === view;
    return (
      <button key={view} onClick={() => setActiveView(view)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: "none", background: active ? "rgba(255,255,255,.1)" : "none", color: active ? "white" : "rgba(255,255,255,.45)", fontFamily: "inherit", fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: "pointer", width: "100%", textAlign: "left", transition: "all .15s" }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: active ? color : "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s", flexShrink: 0 }}>{typeof icon === "string" && icon.startsWith("data:") ? <img src={icon} alt="" style={{ width: 16, height: 16, objectFit: "contain", opacity: active ? 1 : 0.8 }} /> : <span style={{ fontSize: 14 }}>{icon}</span>}</span>
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
          ? <Dashboard responses={responses} onNavigate={v => setActiveView(v)} user={user} onExport={() => setShowReport(true)} topicRecs={topicRecs} onTopicRecsChange={setTopicRecs} />
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
          cachedAreaSummaries={reportAreaSummaries}
          cachedAreaRecsAndProjections={reportAreaRecsAndProjections}
          onSummaryGenerated={s => {
            setReportSummary(s);
            try { window.storage.set("dmm_report_summary", s); } catch (e) {}
          }}
          onAreaSummariesGenerated={a => {
            setReportAreaSummaries(a);
            try { window.storage.set("dmm_report_area_summaries", JSON.stringify(a)); } catch (e) {}
          }}
          onAreaRecsAndProjectionsGenerated={p => {
            setReportAreaRecsAndProjections(p);
            try { window.storage.set("dmm_report_area_recs_proj", JSON.stringify(p)); } catch (e) {}
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

  const clearTopicRecsRef = useRef(null);

  const saveResponses = async (r) => {
    setResponses(r);
    try { await window.storage.set("dmm_responses", JSON.stringify(r)); } catch (e) {}
    // Invalidate all cached AI content so it reflects new scores
    try { await window.storage.delete("dmm_topic_recs"); } catch (e) {}
    try { await window.storage.delete("dmm_report_summary"); } catch (e) {}
    try { await window.storage.delete("dmm_report_area_summaries"); } catch (e) {}
    try { await window.storage.delete("dmm_report_area_recs_proj"); } catch (e) {}
    // Also clear in-memory recs in MainApp
    if (clearTopicRecsRef.current) clearTopicRecsRef.current();
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
      // Look up the specific rubric criteria for this area + topic
      const topicName = AREAS[area].topics[tIdx].name;
      const rubricEntries = (DMM_RUBRIC[area] || {})[topicName] || [];

      // Group rubric entries by integer level for the prompt
      const levelGroups = {};
      rubricEntries.forEach(e => {
        const lvl = Math.floor(e.score);
        if (!levelGroups[lvl]) levelGroups[lvl] = [];
        levelGroups[lvl].push(`    ${e.score}: ${e.desc}`);
      });
      const levelNames = {1:"Performed",2:"Managed",3:"Defined",4:"Measured",5:"Optimized"};
      const rubricFormatted = Object.entries(levelGroups)
        .sort(([a],[b]) => Number(a)-Number(b))
        .map(([lvl, descs]) => `Level ${lvl} — ${levelNames[lvl]}:\n${descs.join("\n")}`)
        .join("\n\n");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a CMMI Data Management Maturity (DMM) assessment specialist scoring a functional practice goal against the official DMM rubric.

ASSESSMENT CONTEXT:
Area: ${area}
Topic: ${topicName}
Goal: ${goalText}

OFFICIAL DMM SCORING RUBRIC FOR "${topicName}":
Each criterion uses a decimal score (e.g. 2.3) where the integer is the maturity level and the decimal identifies the specific sub-criterion within that level.

${rubricFormatted}

INTERVIEW RESPONSE:
${comment}

SCORING INSTRUCTIONS:
1. Identify which rubric criteria are clearly met, partially met, or not yet met based on the interview response
2. Assign a decimal score reflecting the HIGHEST sub-criterion within the highest level where ALL criteria at that level are substantially satisfied
3. The score must correspond to an actual rubric criterion number (e.g. if the org meets 2.1 and 2.2 but not 2.3, score is 2.2)
4. In your rationale, explicitly name the rubric criteria met (by number and description), quote or closely paraphrase the specific interview evidence that satisfies each one, and state which criterion the organization falls short of and why

Use American English spelling throughout.

Respond ONLY with a valid JSON object — no preamble, no markdown:
{"score": <decimal matching a rubric criterion e.g. 2.2>, "level": "<Performed|Managed|Defined|Measured|Optimized>", "rationale": "<3-4 sentences: name the rubric criteria met with evidence from the response, then explain what is missing or incomplete that prevents advancement to the next criterion>"}`
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
        onClearTopicRecs={fn => { clearTopicRecsRef.current = fn; }}
      />
    </ErrorBoundary>
  );
}
