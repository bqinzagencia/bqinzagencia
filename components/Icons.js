// components/Icons.js
// Set de iconos de linea (estilo Lucide/Feather) para reemplazar los emojis
// del panel por una iconografia consistente, sobria y profesional —
// el mismo lenguaje visual de dashboards como Linear, Vercel o Stripe.
// Heredan el color del texto (currentColor) y aceptan size/strokeWidth/style.

import React from 'react';

function Base({ size = 18, strokeWidth = 1.75, style, className, children, ...rest }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
      className={className} {...rest}
    >
      {children}
    </svg>
  );
}

export const Home = (p) => <Base {...p}><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></Base>;
export const Calendar = (p) => <Base {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="3" y1="10" x2="21" y2="10"/></Base>;
export const MessageSquare = (p) => <Base {...p}><path d="M21 14.5a2 2 0 0 1-2 2H8l-4 4V6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></Base>;
export const ClipboardList = (p) => <Base {...p}><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h2a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></Base>;
export const Settings = (p) => <Base {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 17.41a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3.09 11H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 5.18a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0"/></Base>;
export const BarChart = (p) => <Base {...p}><line x1="6" y1="20" x2="6" y2="13"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="10"/></Base>;
export const Package = (p) => <Base {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Base>;
export const ShoppingCart = (p) => <Base {...p}><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 2.5h2l2.68 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21.5 7H6"/></Base>;
export const TrendingUp = (p) => <Base {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Base>;
export const Lock = (p) => <Base {...p}><rect x="3.5" y="11" width="17" height="10" rx="2"/><path d="M7 11V7.5a5 5 0 0 1 10 0V11"/></Base>;
export const Zap = (p) => <Base {...p}><polygon points="13 2 4 14 11 14 10 22 19 10 12 10 13 2"/></Base>;
export const AlertTriangle = (p) => <Base {...p}><path d="M10.3 4.4 2.4 18a1.9 1.9 0 0 0 1.6 2.8h16a1.9 1.9 0 0 0 1.6-2.8L13.7 4.4a1.9 1.9 0 0 0-3.4 0z"/><line x1="12" y1="9.5" x2="12" y2="13.5"/><line x1="12" y1="17" x2="12" y2="17"/></Base>;
export const QrCode = (p) => <Base {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="17" y2="14"/><line x1="14" y1="17" x2="14" y2="20"/><line x1="17" y1="17" x2="20" y2="17"/><line x1="17" y1="20" x2="20" y2="20"/><line x1="20" y1="14" x2="20" y2="15.5"/></Base>;
export const Hash = (p) => <Base {...p}><line x1="4.5" y1="9" x2="20" y2="9"/><line x1="3.5" y1="15" x2="19" y2="15"/><line x1="10" y1="3" x2="7.5" y2="21"/><line x1="16" y1="3" x2="13.5" y2="21"/></Base>;
export const Smartphone = (p) => <Base {...p}><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="11" y1="18.5" x2="13" y2="18.5"/></Base>;
export const Edit = (p) => <Base {...p}><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.4 2.6a2 2 0 0 1 2.83 2.83L11 15.7l-4 1 1-4z"/></Base>;
export const Check = (p) => <Base {...p}><polyline points="20 6 9 17 4 12"/></Base>;
export const X = (p) => <Base {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Base>;
export const RotateCcw = (p) => <Base {...p}><polyline points="2 5 2 10 7 10"/><path d="M3.6 15.5A9 9 0 1 0 5.7 5.3L2 10"/></Base>;
export const RefreshCw = (p) => <Base {...p}><polyline points="22 5 22 10 17 10"/><polyline points="2 19 2 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L22 10"/><path d="M20.5 15a9 9 0 0 1-14.8 3.4L2 14"/></Base>;
export const Tag = (p) => <Base {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2.5 12.5V3h9.5z"/><circle cx="7.5" cy="7.5" r="1"/></Base>;
export const DollarSign = (p) => <Base {...p}><line x1="12" y1="1.5" x2="12" y2="22.5"/><path d="M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Base>;
export const FileText = (p) => <Base {...p}><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><polyline points="14 2.5 14 8.5 19.5 8.5"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Base>;
export const Camera = (p) => <Base {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5l1.8-2.5h7.4L19.5 6H21a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.8"/></Base>;
export const Clock = (p) => <Base {...p}><circle cx="12" cy="12" r="9.5"/><polyline points="12 7 12 12 15.5 14"/></Base>;
export const Compass = (p) => <Base {...p}><circle cx="12" cy="12" r="9.5"/><polygon points="15.5 8.5 13.8 13.8 8.5 15.5 10.2 10.2 15.5 8.5"/></Base>;
export const Link2 = (p) => <Base {...p}><path d="M9.5 17h-2a5 5 0 0 1 0-10h2"/><path d="M14.5 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></Base>;
export const Lightbulb = (p) => <Base {...p}><path d="M9 18.5h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.5.4.8 1 .8 1.6v.7h6.4v-.7c0-.6.3-1.2.8-1.6A7 7 0 0 0 12 2z"/></Base>;
export const ArrowUpRight = (p) => <Base {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></Base>;
export const Plus = (p) => <Base {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Base>;
export const Trash2 = (p) => <Base {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Base>;
export const Copy = (p) => <Base {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Base>;
export const ChevronLeft = (p) => <Base {...p}><polyline points="15 18 9 12 15 6"/></Base>;
export const LayoutGrid = (p) => <Base {...p}><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></Base>;
export const MapPin = (p) => <Base {...p}><path d="M21 10.5c0 6-9 11.5-9 11.5S3 16.5 3 10.5a9 9 0 1 1 18 0z"/><circle cx="12" cy="10.5" r="3"/></Base>;
