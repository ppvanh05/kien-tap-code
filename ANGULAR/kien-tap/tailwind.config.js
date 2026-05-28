/** @type {import('tailwindcss').Config} */ 
 module.exports = { 
   content: [ 
     "./src/**/*.{html,ts}", 
   ], 
   theme: { 
     extend: { 
  
       // ===== COLORS ===== 
       colors: { 
  
         // Brand colors 
         primary: { 
           DEFAULT: "#009ba1", 
           hover:   "#007d82",   // Dùng khi hover button/link 
           light:   "#e6f7f7",   // Background nhạt, highlight 
         }, 
         secondary: { 
           DEFAULT: "#f37021",   // Orange — CTA phụ, accent 
           hover:   "#d4601a", 
           light:   "#fef0e6", 
         }, 
         navy: { 
           DEFAULT: "#0B2A4A",   // Heading chính, text quan trọng 
           light:   "#1a4068", 
         }, 
  
         // Semantic — dùng cho status badge, alert 
         success: { 
           DEFAULT: "#057A55", 
           light: "#DEF7EC", 
           text: "#03543F", 
         }, 
         warning: { 
           DEFAULT: "#C27803", 
           light: "#FDF6B2", 
           text: "#92400E", 
         }, 
         danger: { 
           DEFAULT: "#C81E1E", 
           light: "#FDE8E8", 
           text: "#9B1C1C", 
         }, 
         info: { 
           DEFAULT: "#1C64F2", 
           light: "#E1EFFE", 
           text: "#1E429F", 
         }, 
  
         // Neutral / Gray scale 
         surface: { 
           DEFAULT: "#FFFFFF", 
           container: "#F0F4F8", 
           "container-low": "#F7F9FC", 
           "container-lowest": "#FFFFFF", 
         }, 
         background: "#F8F9FA", 
  
         // On colors — màu text đặt trên nền tương ứng 
         "on-primary": "#FFFFFF", 
         "on-secondary": "#FFFFFF", 
         "on-surface": "#1B1B1F", 
         "on-surface-variant": "#44474E", 
         "on-surface-disabled": "#9EA3AE", 
         "outline": "#74777F", 
         "outline-variant": "#C4C6D0", 
       }, 
  
       // ===== TYPOGRAPHY ===== 
       fontSize: { 
         // Display — chỉ dùng cho hero banner 
         "display-lg": ["48px", { lineHeight: "56px", fontWeight: "700" }], 
         "display-md": ["36px", { lineHeight: "44px", fontWeight: "700" }], 
  
         // Headline — tiêu đề trang, section 
         "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }], 
         "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }], 
         "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }], 
  
         // Title — tiêu đề card, modal 
         "title-lg": ["18px", { lineHeight: "28px", fontWeight: "600" }], 
         "title-md": ["16px", { lineHeight: "24px", fontWeight: "500" }], 
         "title-sm": ["14px", { lineHeight: "20px", fontWeight: "500" }], 
  
         // Body — nội dung chính 
         "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }], 
         "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }], 
         "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }], 
  
         // Label — form label, badge, caption 
         "label-lg": ["14px", { lineHeight: "20px", fontWeight: "500" }], 
         "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }], 
         "label-sm": ["11px", { lineHeight: "16px", fontWeight: "500" }], 
       }, 
  
       fontFamily: { 
         // Be Vietnam Pro phù hợp hơn cho web Việt 
         body: ["Be Vietnam Pro", "Inter", "sans-serif"], 
       }, 
  
       // ===== SPACING ===== 
       spacing: { 
         "margin-desktop": "80px", 
         "margin-tablet": "32px", 
         "margin-mobile": "16px", 
         gutter: "24px", 
         "gutter-sm": "16px", 
       }, 
  
       // ===== MAX WIDTH ===== 
       maxWidth: { 
         "container-max": "1280px", 
       }, 
  
       // ===== BORDER RADIUS ===== 
       borderRadius: { 
         sm: "6px",    // Input, tag, badge 
         md: "8px",    // Button 
         lg: "12px",   // Card 
         xl: "16px",   // Modal, drawer 
         "2xl": "20px",  // Card lớn 
         full: "9999px", // Pill badge 
       }, 
  
       // ===== BOX SHADOW ===== 
       boxShadow: { 
         sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)", 
         md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)", 
         lg: "0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)", 
         card: "0 2px 8px rgba(0,0,0,0.06)",   // Dùng cho ticket card 
         modal: "0 20px 60px rgba(0,0,0,0.15)", // Dùng cho modal 
       }, 
  
     }, 
   }, 
   plugins: [], 
 } 
