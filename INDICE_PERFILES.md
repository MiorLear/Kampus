# 📚 Índice de Documentación - Sistema de Perfiles Kampus

Este índice te guiará a través de toda la documentación del sistema de perfiles de usuario.

---

## 🚀 Inicio Rápido

¿Nuevo en el sistema? Comienza aquí:

1. 📖 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Referencia rápida con tablas comparativas
2. 📋 **[PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md)** - Documentación completa y detallada
3. 🎨 **[DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md)** - Diagramas visuales de la estructura

---

## 📖 Documentación

### 📋 Documentos Principales

| Documento | Descripción | Cuándo Usarlo |
|-----------|-------------|---------------|
| **[PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md)** | Documentación completa de los 3 perfiles con ejemplos de código | Cuando necesites entender a fondo cada perfil |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Referencia rápida con tablas y comparaciones | Para consultas rápidas durante el desarrollo |
| **[DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md)** | Diagramas visuales de estructuras y flujos | Para entender visualmente la arquitectura |
| **[README.md](./README.md)** | Guía general del proyecto | Para setup inicial y overview del proyecto |

---

## 💻 Código Fuente

### 📁 Archivos TypeScript

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| **user-profiles.ts** | `src/types/` | Definiciones de interfaces y tipos para todos los perfiles |
| **user-profile.service.ts** | `src/services/` | Servicios para crear, leer y actualizar perfiles |
| **sample-users.ts** | `src/data/` | Datos de usuarios de ejemplo para cada rol |
| **seed-profiles.ts** | `src/utils/` | Script para poblar la BD con usuarios de ejemplo |
| **SeedProfiles.tsx** | `src/components/` | Componente UI para ejecutar seeding |

### 🔗 Enlaces Directos

```bash
# Ver definiciones de tipos
cat src/types/user-profiles.ts

# Ver servicios
cat src/services/user-profile.service.ts

# Ver datos de ejemplo
cat src/data/sample-users.ts

# Ver utilidad de seeding
cat src/utils/seed-profiles.ts

# Ver componente React
cat src/components/SeedProfiles.tsx
```

---

## 👥 Los 3 Perfiles

### 👨‍🎓 Estudiante (Student)

| ¿Qué necesito? | ¿Dónde lo encuentro? |
|----------------|----------------------|
| Entender el perfil completo | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#1-perfil-de-estudiante) |
| Ver estructura visual | [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md#-estructura-del-perfil-de-estudiante) |
| Ejemplos de código | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#ejemplo-de-uso) |
| Ver usuarios de ejemplo | `src/data/sample-users.ts` → SAMPLE_STUDENTS |
| Definición TypeScript | `src/types/user-profiles.ts` → StudentProfile |

### 👨‍🏫 Profesor (Teacher)

| ¿Qué necesito? | ¿Dónde lo encuentro? |
|----------------|----------------------|
| Entender el perfil completo | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#2-perfil-de-profesor) |
| Ver estructura visual | [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md#-estructura-del-perfil-de-profesor) |
| Ejemplos de código | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#ejemplo-de-uso-1) |
| Ver usuarios de ejemplo | `src/data/sample-users.ts` → SAMPLE_TEACHERS |
| Definición TypeScript | `src/types/user-profiles.ts` → TeacherProfile |

### 👨‍💼 Administrador (Admin)

| ¿Qué necesito? | ¿Dónde lo encuentro? |
|----------------|----------------------|
| Entender el perfil completo | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#3-perfil-de-administrador) |
| Ver estructura visual | [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md#-estructura-del-perfil-de-administrador) |
| Sistema de permisos | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-matriz-de-permisos-admins) |
| Ver usuarios de ejemplo | `src/data/sample-users.ts` → SAMPLE_ADMINS |
| Definición TypeScript | `src/types/user-profiles.ts` → AdminProfile |

---

## 🛠️ Guías de Uso

### Para Desarrolladores

#### Crear un nuevo usuario

```typescript
// Ver: PERFILES_DE_USUARIO.md → "Guía de Implementación"
import { UserProfileService } from './services/user-profile.service';

// Crear estudiante
await UserProfileService.createStudentProfile(userId, {...});

// Crear profesor
await UserProfileService.createTeacherProfile(userId, {...});

// Crear admin
await UserProfileService.createAdminProfile(userId, {...});
```

**Dónde encontrar:**
- 📖 Ejemplos completos: [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-guía-de-implementación)
- 💻 Código fuente: `src/services/user-profile.service.ts`

#### Actualizar perfiles

```typescript
// Ver: PERFILES_DE_USUARIO.md → "Obtener y actualizar perfiles"
await UserProfileService.updateStudentProfile(userId, {...});
await UserProfileService.updateTeacherProfile(userId, {...});
await UserProfileService.updateAdminProfile(userId, {...});
```

**Dónde encontrar:**
- 📖 Guía: [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#3-obtener-y-actualizar-perfiles)
- 🚀 Referencia rápida: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-acciones-comunes-por-rol)

#### Actualizar estadísticas

```typescript
// Ver: QUICK_REFERENCE.md → "Acciones Comunes por Rol"
await UserProfileService.updateStudentStats(userId, {...});
await UserProfileService.updateTeacherStats(userId, {...});
await UserProfileService.updateAdminStats(userId, {...});
```

**Dónde encontrar:**
- 🚀 Ejemplos: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-acciones-comunes-por-rol)
- 📊 Diagrama de eventos: [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md#-actualización-de-estadísticas---eventos)

#### Verificar permisos (Admins)

```typescript
// Ver: PERFILES_DE_USUARIO.md → "Seguridad y Permisos"
const canManage = await UserProfileService.hasPermission(
  adminId,
  'manage_users'
);
```

**Dónde encontrar:**
- 📖 Guía completa: [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-seguridad-y-permisos)
- 🔐 Matriz de permisos: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-matriz-de-permisos-admins)
- 🎨 Flujo visual: [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md#-sistema-de-permisos---flujo-de-verificación)

---

## 🌱 Poblar Base de Datos

### Con Usuarios de Ejemplo

**Opción 1: Desde código**
```typescript
// Ver: README.md → "Poblar Base de Datos"
import { seedAllProfiles } from './utils/seed-profiles';
await seedAllProfiles();
```

**Opción 2: Desde UI**
- Usar el componente `SeedProfiles.tsx`
- Ver código: `src/components/SeedProfiles.tsx`

**Usuarios incluidos:**
- 3 Estudiantes
- 3 Profesores  
- 3 Administradores

**Contraseña:** `Kampus2024!`

**Dónde encontrar:**
- 📖 Guía: [README.md](./README.md#poblar-base-de-datos-con-usuarios-de-ejemplo)
- 👥 Lista de usuarios: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-usuarios-de-ejemplo)
- 💻 Script: `src/utils/seed-profiles.ts`

---

## 🔍 Buscar Información

### Por Tema

| Necesito información sobre... | Lo encuentro en... |
|-------------------------------|-------------------|
| **Campos de cada perfil** | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) → Sección del rol |
| **Comparar perfiles** | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-comparación-de-perfiles) |
| **Estructura visual** | [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md) |
| **Ejemplos de código** | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) → "Ejemplo de Uso" |
| **Estadísticas** | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-estadísticas-por-perfil) |
| **Permisos de admin** | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-matriz-de-permisos-admins) |
| **Casos de uso comunes** | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-casos-de-uso-comunes) |
| **Type Guards** | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#4-type-guards-verificar-tipo-de-perfil) |
| **Migración de perfiles** | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-migración-de-perfiles-antiguos) |
| **Setup inicial** | [README.md](./README.md#getting-started) |

### Por Rol de Usuario

#### Si soy Desarrollador Backend
1. `src/types/user-profiles.ts` - Tipos
2. `src/services/user-profile.service.ts` - Servicios
3. [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) - Documentación completa

#### Si soy Desarrollador Frontend
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida
2. `src/types/user-profiles.ts` - Interfaces
3. [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md) - UI de referencia

#### Si soy QA/Tester
1. [README.md](./README.md#poblar-base-de-datos-con-usuarios-de-ejemplo) - Crear usuarios de prueba
2. `src/data/sample-users.ts` - Ver usuarios de ejemplo
3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-usuarios-de-ejemplo) - Lista de credenciales

#### Si soy Product Manager / Diseñador
1. [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md) - Visualizaciones
2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-comparación-de-perfiles) - Comparaciones
3. [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) - Detalles completos

---

## 📊 Diagramas y Visualizaciones

Todos los diagramas están en: **[DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md)**

| Diagrama | Descripción |
|----------|-------------|
| Jerarquía de Perfiles | Estructura de herencia de BaseUser |
| Estructura de Estudiante | Árbol de campos del perfil |
| Estructura de Profesor | Árbol de campos del perfil |
| Estructura de Admin | Árbol de campos del perfil |
| Flujo de Datos | Cómo fluyen los datos por rol |
| Sistema de Permisos | Verificación de permisos paso a paso |
| Actualización de Stats | Eventos que actualizan estadísticas |
| UI por Rol | Mockups de dashboards |
| Ciclo de Vida | Estados de un usuario |

---

## 🔗 Enlaces Rápidos

### Documentos Markdown
- 📋 [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) - Documentación completa
- 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida
- 🎨 [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md) - Diagramas visuales
- 📖 [README.md](./README.md) - Guía del proyecto
- 📚 [INDICE_PERFILES.md](./INDICE_PERFILES.md) - Este documento

### Código TypeScript
- 📝 `src/types/user-profiles.ts` - Tipos e interfaces
- 🔧 `src/services/user-profile.service.ts` - Servicios CRUD
- 👥 `src/data/sample-users.ts` - Usuarios de ejemplo
- 🌱 `src/utils/seed-profiles.ts` - Script de seeding
- 🎨 `src/components/SeedProfiles.tsx` - UI de seeding

---

## 💡 Tips de Navegación

### Para consultas rápidas
1. Usa **QUICK_REFERENCE.md** - tiene tablas y comparaciones
2. Busca en **DIAGRAMA_PERFILES.md** para visualizar estructuras

### Para implementación
1. Lee **PERFILES_DE_USUARIO.md** → "Guía de Implementación"
2. Revisa el código en `src/services/user-profile.service.ts`
3. Copia ejemplos de `src/data/sample-users.ts`

### Para testing
1. Lee **README.md** → "Poblar Base de Datos"
2. Ejecuta `seedAllProfiles()` desde `src/utils/seed-profiles.ts`
3. Usa credenciales de **QUICK_REFERENCE.md** → "Usuarios de Ejemplo"

---

## 📝 Checklist de Implementación

- [ ] Leer [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) completo
- [ ] Entender las interfaces en `src/types/user-profiles.ts`
- [ ] Revisar servicios en `src/services/user-profile.service.ts`
- [ ] Poblar BD con usuarios de ejemplo
- [ ] Verificar que los 3 roles funcionan correctamente
- [ ] Implementar verificación de permisos para admins
- [ ] Actualizar estadísticas en eventos relevantes
- [ ] Probar Type Guards
- [ ] Implementar UI específica por rol

---

## 🆘 ¿Necesitas Ayuda?

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo crear un usuario? | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-guía-de-implementación) |
| ¿Qué campos tiene cada perfil? | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md) → Sección del rol |
| ¿Cómo actualizar estadísticas? | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-acciones-comunes-por-rol) |
| ¿Cómo funcionan los permisos? | [PERFILES_DE_USUARIO.md](./PERFILES_DE_USUARIO.md#-seguridad-y-permisos) |
| ¿Dónde veo ejemplos visuales? | [DIAGRAMA_PERFILES.md](./DIAGRAMA_PERFILES.md) |
| ¿Cómo poblar la BD? | [README.md](./README.md#poblar-base-de-datos-con-usuarios-de-ejemplo) |

---

**Última actualización:** Octubre 2024  
**Versión:** 1.0.0  
**Sistema:** Kampus Learning Management System

