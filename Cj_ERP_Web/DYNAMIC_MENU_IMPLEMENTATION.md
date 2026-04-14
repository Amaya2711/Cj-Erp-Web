# Dynamic Dashboard Menu Implementation - Resumen

## 🎯 Objetivo Logrado

El dashboard ahora carga menús **dinámicamente basado en el perfil y rol del usuario**, en lugar de usar una lista estática. Esto asegura que:

- ✅ Solo se muestren los módulos que el usuario tiene permiso para ver
- ✅ Se respeta la estructura de perfiles, roles y permisos de la BD
- ✅ Se mantiene completamente el diseño visual Fiori
- ✅ Las categorías se colorean automáticamente según configuración

## 📋 Arquitectura

### 1. **Backend (Ya Existía)**
```
GET /api/menu/usuario/{idUsuario}
  └─> Backend: sp_SegMenu_ListarPorUsuario
      └─> Query: SegMenu + SegUsuarioPerfil + SegPerfilRol + SegRolMenuAccion
      └─> Returns: MenuDto[]
```

Los permisos se calculan por:
1. Perfil del usuario (SegUsuarioPerfil)
2. Roles asignados al perfil (SegPerfilRol)
3. Menús permitidos al rol (SegRolMenuAccion)
4. Overrides específicos del usuario (SegUsuarioMenuAccion)

### 2. **Frontend (Implementado)**

#### Archivos Nuevos:

**`src/features/dashboard/config/categoryConfig.ts`**
- Define mapeo de códigos de menú a colores
- Ejemplo: `GESTION` → `#6E4CCB`
- Proporciona función `getCategoryConfig()` para lookup

**`src/features/dashboard/services/dashboardMenuService.ts`**
- `loadDashboardMenus(idUsuario)` - Carga menús del usuario
- `transformMenusToDashboard(MenuDto[])` - Transforma datos BD → estructura UI
- Agrupa menús por jerarquía (categorías vs. módulos)
- Ordena por `ordenMenu` y `nivelMenu`

#### Archivos Modificados:

**`src/pages/DashboardPage.tsx`**
- Agregó `useEffect()` para cargar menús al montar
- Obtiene usuario actual via `getAuthUser()` 
- Muestra estado de carga mientras obtiene datos
- Maneja errores gracefully
- Mantiene idéntica toda la estructura visual Fiori

## 🔄 Flujo de Datos

```
Usuario Autentica (localStorage)
  ↓
DashboardPage monta → useEffect
  ↓
getAuthUser() → obtiene idUsuario del usuario
  ↓
loadDashboardMenus(idUsuario) 
  ↓
menuService.obtenerPorUsuario(idUsuario)
  ↓
[HTTP GET] → /api/menu/usuario/{id}
  ↓
[Backend] sp_SegMenu_ListarPorUsuario → MenuDto[]
  ↓
transformMenusToDashboard(MenuDto[])
  - Agrupa por NivelMenu (0=categoría, 1+=módulos)
  - Agrupa por IdMenuPadre (padre-hijo)
  - Mapea colores vía codigoMenu
  ↓
DashboardGroup[] 
  ↓
[Render] Mostrar categorías con tiles
  ↓
Usuario hizo click → navigate(tile.path)
```

## 🏗️ Estructura de Datos

### MenuDto (del Backend)
```typescript
{
  idMenu: number
  idMenuPadre?: number | null        // Para jerarquía
  nombreMenu: string                 // Ej: "Operaciones"
  ruta?: string | null               // Ej: "/operaciones"
  icono?: string | null
  ordenMenu: number                  // Orden en UI
  nivelMenu: number                  // 0=categoría, 1+=módulos
  codigoMenu?: string | null         // Ej: "GESTION", "FINANZAS"
}
```

### DashboardGroup (para UI)
```typescript
{
  titulo: string                     // Ej: "Gestión"
  subtitulo?: string                 // Ej: "Operaciones"
  color: string                      // #6E4CCB
  tiles: DashboardTile[]            // Módulos dentro de categoría
}
```

## 🎨 Mapeo de Colores

Define en `categoryConfig.ts`:
```typescript
GESTION      → #6E4CCB  (púrpura)
FINANZAS     → #E74C3C  (rojo)
LOGISTICA    → #0EA5E9  (azul)
ADMINISTRACION → #22C55E  (verde)
SEGURIDAD    → #F59E0B  (ámbar)
PLANTA       → #8B5CF6  (violeta)
MANTENIMIENTO → #EC4899  (rosa)
PAGOS        → #14B8A6  (teal)
```

## ✨ Características

- **Dinámico**: Se regenera cada vez que el usuario accede
- **Seguro**: Solo muestra lo que el usuario tiene permiso
- **Mantenible**: Colores centralizados en `categoryConfig.ts`
- **Resiliente**: Muestra animación de carga y errores
- **No-Breaking**: Mantiene exacto el diseño visual Fiori

## 🧪 Para Probar

1. Autentica con un usuario
2. Ve a `/dashboard`
3. Verifica que solo ve módulos de su rol/perfil
4. Haz click en un tile y verifica navegación
5. Cambia perfil del usuario en BD y recarga → debe cambiar menú

## 📝 Notas Importantes

### El archivo `menuDashboard.ts` ahora es un legacy
- No se elimina todavía (podría tener referencias)
- Pero DashboardPage ya NO lo importa
- Puedes eliminarlo cuando estés seguro de que nada más lo usa

### Si el usuario no tiene menús
- El dashboard mostrará las secciones sin tiles
- Verifica permisos en BD: SegRolMenuAccion.EsPermitido=1

### Para agregar nuevas categorías
1. Agrega nuevo `CodigoMenu` en tabla SegMenu
2. Agrega entrada en `categoryConfig.ts`
3. Asigna menús a roles en SegRolMenuAccion
4. ¡Done!

## 🐛 Debugging

Si no ves menús esperados:
1. Verificar: `getAuthUser().usuario` no null
2. Verificar: Usuario existe en BD
3. Verificar: Usuario tiene perfil (SegUsuarioPerfil)
4. Verificar: Perfil tiene rol (SegPerfilRol)
5. Verificar: Rol tiene menú con permiso VER (SegRolMenuAccion)
6. Check browser console para errores HTTP
