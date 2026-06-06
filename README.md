# NEXOIA — Plataforma de Automatización Empresarial con IA

> Desarrollado por NexoTI / SoporteIA — Alexander Borrero Q.

## Stack
- **Next.js 14** (Pages Router)
- **Firebase** (Auth + Firestore)
- **Vercel** (deploy)
- **react-hot-toast** (notificaciones)

---

## ⚠️ Antes de empezar — Backup

Siempre antes de cambios:
```bash
git add . && git commit -m "backup antes de cambios"
```

---

## 🚀 Instalación

### 1. Crea el proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea proyecto: `nexoia-app` (o el nombre que quieras)
3. Activa **Authentication** → Email/Password
4. Activa **Firestore Database** en producción
5. Copia las credenciales del SDK web

### 2. Configura variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales Firebase
```

### 3. Instala dependencias

```bash
npm install
```

### 4. Despliega reglas de Firestore

```bash
# Instala Firebase CLI si no lo tienes
npm install -g firebase-tools
firebase login
firebase init firestore  # selecciona tu proyecto
firebase deploy --only firestore:rules
```

### 5. Crea tu cuenta de superadmin

En Firebase Console → Firestore → crea la colección `admins` y agrega un documento con el UID de tu usuario:
```
admins/
  TU_UID_AQUI:
    rol: "superadmin"
    nombre: "Alexander"
```

### 6. Corre en desarrollo

```bash
npm run dev
# http://localhost:3000
```

### 7. Deploy a Vercel

```bash
# En CMD (no PowerShell) dentro del proyecto
vercel --prod
```

---

## 📁 Estructura del proyecto

```
nexoia/
├── pages/
│   ├── index.js              ← Landing page
│   ├── auth/
│   │   ├── login.js          ← Login
│   │   └── register.js       ← Registro (3 pasos)
│   ├── dashboard/
│   │   ├── index.js          ← Panel principal
│   │   ├── agentes.js        ← Gestión agentes IA
│   │   ├── conversaciones.js ← Chat unificado
│   │   ├── crm.js            ← CRM de clientes
│   │   ├── agenda.js         ← Calendario y citas
│   │   ├── web.js            ← Constructor web
│   │   ├── reportes.js       ← Analytics
│   │   └── configuracion.js  ← Configuración
│   └── admin/
│       └── index.js          ← Super admin panel
├── components/
│   └── layout/
│       └── DashboardLayout.js ← Sidebar + topbar
├── lib/
│   ├── firebase.js           ← Config + helpers
│   ├── AuthContext.js        ← Auth context
│   └── utils.js              ← Utilidades + constantes
├── styles/
│   └── globals.css           ← Estilos globales
└── firestore.rules           ← Reglas de seguridad
```

## 💰 Planes

| Plan | Precio | Agentes | Conversaciones |
|------|--------|---------|---------------|
| Emprendedor | $149.000 COP/mes | 1 | 500/mes |
| Profesional | $349.000 COP/mes | 3 | Ilimitadas |
| Agencia | $890.000 COP/mes | Ilimitados | Ilimitadas |

## 🔧 Soporte

- Email: soportesistemas@soporteia.net
- Tel: 310-505-6616
- Web: www.nexoti.net
