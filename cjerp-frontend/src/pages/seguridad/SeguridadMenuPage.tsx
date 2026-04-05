import { useEffect, useMemo, useState } from "react";
import {
  menuService,
  type MenuDto,
} from "../../features/seguridad/services/menuService";
import {
  perfilesService,
  type PerfilDto,
} from "../../features/seguridad/services/perfilesService";
import {
  rolesService,
  type RolDto,
} from "../../features/seguridad/services/rolesService";

type PerfilOption = {
  id: number;
  nombre: string;
};

type RolOption = {
  id: number;
  nombre: string;
};

type MenuNode = {
  id: number;
  label: string;
  path?: string;
  parentId: number | null;
  children: MenuNode[];
};

type MenuTreeItemProps = {
  node: MenuNode;
  selectedIds: Set<number>;
  expandedIds: Set<number>;
  onToggleSelected: (node: MenuNode, checked: boolean) => void;
  onToggleExpanded: (id: number) => void;
  level: number;
};

function buildTree(items: MenuDto[]): MenuNode[] {
  const map = new Map<number, MenuNode>();
  const roots: MenuNode[] = [];

  items.forEach((item) => {
    map.set(item.idMenu, {
      id: item.idMenu,
      label: item.nombreMenu,
      path: item.ruta ?? undefined,
      parentId: item.idMenuPadre ?? null,
      children: [],
    });
  });

  items.forEach((item) => {
    const current = map.get(item.idMenu);
    if (!current) return;

    const parentId = item.idMenuPadre ?? null;

    if (parentId === null || !map.has(parentId)) {
      roots.push(current);
      return;
    }

    map.get(parentId)!.children.push(current);
  });

  const sortRecursive = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label));
    nodes.forEach((node) => sortRecursive(node.children));
  };

  sortRecursive(roots);

  return roots;
}

function flattenTree(nodes: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = [];

  const recorrer = (items: MenuNode[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children.length > 0) {
        recorrer(item.children);
      }
    });
  };

  recorrer(nodes);
  return result;
}

function cloneDeep(nodes: MenuNode[]): MenuNode[] {
  return nodes.map((node) => ({
    ...node,
    children: cloneDeep(node.children),
  }));
}

function collectNodeAndChildrenIds(node: MenuNode): number[] {
  const ids: number[] = [node.id];

  node.children.forEach((child) => {
    ids.push(...collectNodeAndChildrenIds(child));
  });

  return ids;
}

function findParentChainIds(nodes: MenuNode[], targetId: number): number[] {
  const path: number[] = [];

  const buscar = (items: MenuNode[], parents: number[]): boolean => {
    for (const item of items) {
      if (item.id === targetId) {
        path.push(...parents);
        return true;
      }

      if (item.children.length > 0) {
        const found = buscar(item.children, [...parents, item.id]);
        if (found) return true;
      }
    }

    return false;
  };

  buscar(nodes, []);
  return path;
}

function MenuTreeItem({
  node,
  selectedIds,
  expandedIds,
  onToggleSelected,
  onToggleExpanded,
  level,
}: MenuTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const checked = selectedIds.has(node.id);

  return (
    <div>
      <div
        style={{
          ...styles.treeItemRow,
          paddingLeft: `${level * 20}px`,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpanded(node.id)}
            style={styles.treeToggleBtn}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : (
          <div style={styles.treeTogglePlaceholder} />
        )}

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleSelected(node, e.target.checked)}
        />

        <div style={styles.treeLabelBox}>
          <span style={styles.treeLabel}>{node.label}</span>
          {node.path ? (
            <span style={styles.treePath}>{node.path}</span>
          ) : null}
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <MenuTreeItem
              key={child.id}
              node={child}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleSelected={onToggleSelected}
              onToggleExpanded={onToggleExpanded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeguridadMenuPage() {
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [perfiles, setPerfiles] = useState<PerfilOption[]>([]);
  const [roles, setRoles] = useState<RolOption[]>([]);

  const [perfilId, setPerfilId] = useState<number | "">("");
  const [rolId, setRolId] = useState<number | "">("");

  const [menuBase, setMenuBase] = useState<MenuNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const totalAsignados = useMemo(() => selectedIds.size, [selectedIds]);

  useEffect(() => {
    void cargarPerfilesYMenu();
  }, []);

  const cargarPerfilesYMenu = async () => {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const [perfilesResult, menuResult] = await Promise.allSettled([
        perfilesService.listarPerfiles(),
        menuService.obtenerCompleto(),
      ]);

      const perfilesData =
        perfilesResult.status === "fulfilled" ? perfilesResult.value : [];
      const menuData = menuResult.status === "fulfilled" ? menuResult.value : [];

      if (perfilesResult.status === "rejected" || menuResult.status === "rejected") {
        setError("No se pudo cargar completamente perfiles y/o menú.");
      }

      const perfilesMapped: PerfilOption[] = perfilesData.map((p: PerfilDto) => ({
        id: p.idPerfil,
        nombre: p.nombrePerfil,
      }));

      const menuTree = buildTree(menuData);

      setPerfiles(perfilesMapped);
      setMenuBase(menuTree);

      const allExpanded = new Set<number>();
      flattenTree(menuTree).forEach((node: MenuNode) => {
        if (node.children.length > 0) {
          allExpanded.add(node.id);
        }
      });
      setExpandedIds(allExpanded);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar perfiles y menú.");
    } finally {
      setCargando(false);
    }
  };

  const cargarRoles = async (nuevoPerfilId: number) => {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const rolesData = await rolesService.listarRolesPorPerfil(nuevoPerfilId);

      const rolesMapped: RolOption[] = rolesData.map((r: RolDto) => ({
        id: r.idRol,
        nombre: r.nombreRol,
      }));

      setRoles(rolesMapped);
      setRolId("");
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los roles del perfil.");
      setRoles([]);
      setRolId("");
      setSelectedIds(new Set());
    } finally {
      setCargando(false);
    }
  };

  const cargarMenuAsignado = async (nuevoRolId: number) => {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const asignados = await menuService.obtenerPorRol(nuevoRolId);
      const ids = new Set<number>(asignados.map((x: MenuDto) => x.idMenu));

      setSelectedIds(ids);

      const expanded = new Set<number>(expandedIds);
      asignados.forEach((x: MenuDto) => {
        const parentChain = findParentChainIds(menuBase, x.idMenu);
        parentChain.forEach((id) => expanded.add(id));
      });
      setExpandedIds(expanded);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el menú asignado al rol.");
      setSelectedIds(new Set());
    } finally {
      setCargando(false);
    }
  };

  const handlePerfilChange = async (value: string) => {
    const nuevoPerfilId = value ? Number(value) : "";
    setPerfilId(nuevoPerfilId);

    if (nuevoPerfilId === "") {
      setRoles([]);
      setRolId("");
      setSelectedIds(new Set());
      return;
    }

    await cargarRoles(nuevoPerfilId);
  };

  const handleRolChange = async (value: string) => {
    const nuevoRolId = value ? Number(value) : "";
    setRolId(nuevoRolId);

    if (nuevoRolId === "") {
      setSelectedIds(new Set());
      return;
    }

    await cargarMenuAsignado(nuevoRolId);
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelected = (node: MenuNode, checked: boolean) => {
    const ids = collectNodeAndChildrenIds(node);
    const parentChain = findParentChainIds(menuBase, node.id);

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        ids.forEach((id) => next.add(id));
        parentChain.forEach((id) => next.add(id));
      } else {
        ids.forEach((id) => next.delete(id));
      }

      return next;
    });
  };

  const expandirTodo = () => {
    const next = new Set<number>();
    flattenTree(menuBase).forEach((node: MenuNode) => {
      if (node.children.length > 0) {
        next.add(node.id);
      }
    });
    setExpandedIds(next);
  };

  const colapsarTodo = () => {
    setExpandedIds(new Set());
  };

  const seleccionarTodo = () => {
    const next = new Set<number>();
    flattenTree(menuBase).forEach((node: MenuNode) => next.add(node.id));
    setSelectedIds(next);
  };

  const limpiarSeleccion = () => {
    setSelectedIds(new Set());
  };

  const guardarAsignacion = async () => {
    if (!rolId) {
      setError("Debe seleccionar un rol.");
      setMensaje("");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      await menuService.guardarAsignacionMenuRol({
        idRol: Number(rolId),
        menuIds: Array.from(selectedIds),
      });

      setMensaje("Asignación de menú guardada correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la asignación de menú.");
      setMensaje("");
    } finally {
      setGuardando(false);
    }
  };

  const menuVisual = useMemo(() => cloneDeep(menuBase), [menuBase]);

  return (
    <div style={styles.page}>
      <div style={styles.filtersCard}>
        <div style={styles.filterField}>
          <label style={styles.label}>
            Perfil
          </label>
          <select
            value={perfilId}
            onChange={(e) => void handlePerfilChange(e.target.value)}
            style={styles.select}
          >
            <option value="">Seleccione</option>
            {perfiles.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterField}>
          <label style={styles.label}>
            Rol
          </label>
          <select
            value={rolId}
            onChange={(e) => void handleRolChange(e.target.value)}
            style={styles.select}
            disabled={!perfilId}
          >
            <option value="">Seleccione</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.buttonField}>
          <button
            type="button"
            onClick={() => void cargarPerfilesYMenu()}
            style={styles.secondaryBtn}
          >
            Recargar
          </button>
        </div>

        <div style={styles.buttonField}>
          <button
            type="button"
            onClick={() => void guardarAsignacion()}
            disabled={!rolId || guardando}
            style={{
              ...styles.primaryBtn,
              opacity: !rolId || guardando ? 0.65 : 1,
              cursor: !rolId || guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "Guardar asignación"}
          </button>
        </div>
      </div>

      <div style={styles.actionsCard}>
        <button
          type="button"
          onClick={expandirTodo}
          style={styles.actionBtn}
        >
          Expandir todo
        </button>

        <button
          type="button"
          onClick={colapsarTodo}
          style={styles.actionBtn}
        >
          Colapsar todo
        </button>

        <button
          type="button"
          onClick={seleccionarTodo}
          style={styles.actionBtn}
        >
          Seleccionar todo
        </button>

        <button
          type="button"
          onClick={limpiarSeleccion}
          style={styles.actionBtn}
        >
          Limpiar selección
        </button>

        <div style={styles.totalText}>
          Total asignados: <span style={styles.totalValue}>{totalAsignados}</span>
        </div>
      </div>

      {cargando ? (
        <div style={styles.loadingCard}>
          Cargando información...
        </div>
      ) : null}

      {mensaje ? (
        <div style={styles.successBox}>
          {mensaje}
        </div>
      ) : null}

      {error ? (
        <div style={styles.errorBox}>
          {error}
        </div>
      ) : null}

      <div style={styles.card}>
        <h2 style={styles.treeTitle}>
          Árbol de menú
        </h2>

        {menuVisual.length === 0 ? (
          <div style={styles.emptyText}>No hay menús disponibles.</div>
        ) : (
          <div style={styles.treeContainer}>
            {menuVisual.map((node) => (
              <MenuTreeItem
                key={node.id}
                node={node}
                selectedIds={selectedIds}
                expandedIds={expandedIds}
                onToggleSelected={toggleSelected}
                onToggleExpanded={toggleExpanded}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 4,
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    padding: 20,
    boxShadow: "0 8px 24px rgba(23,20,58,0.06)",
  },
  title: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#1E293B",
  },
  subtitle: {
    margin: "10px 0 0",
    fontSize: 26,
    color: "#475569",
  },
  filtersCard: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    padding: 16,
    boxShadow: "0 8px 24px rgba(23,20,58,0.04)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    alignItems: "end",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
  },
  select: {
    width: "100%",
    minHeight: 40,
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    padding: "8px 10px",
    fontSize: 14,
    background: "#FFFFFF",
    color: "#0F172A",
  },
  buttonField: {
    display: "flex",
    alignItems: "end",
  },
  secondaryBtn: {
    width: "100%",
    minHeight: 40,
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    background: "#F8FAFC",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtn: {
    width: "100%",
    minHeight: 40,
    borderRadius: 10,
    border: "none",
    background: "#17143A",
    color: "#FFFFFF",
    fontWeight: 700,
  },
  actionsCard: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    padding: 12,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  actionBtn: {
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#334155",
    fontWeight: 600,
    fontSize: 13,
    padding: "8px 12px",
    cursor: "pointer",
  },
  totalText: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#64748B",
  },
  totalValue: {
    fontWeight: 800,
    color: "#0F172A",
  },
  loadingCard: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: 14,
    color: "#64748B",
  },
  successBox: {
    borderRadius: 12,
    border: "1px solid #A7F3D0",
    background: "#ECFDF5",
    color: "#047857",
    padding: 12,
  },
  errorBox: {
    borderRadius: 12,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: 12,
  },
  treeTitle: {
    margin: "0 0 12px",
    fontSize: 18,
    fontWeight: 800,
    color: "#1E293B",
  },
  treeContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  treeItemRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 0",
  },
  treeToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#334155",
    fontSize: 14,
    cursor: "pointer",
  },
  treeTogglePlaceholder: {
    width: 28,
    height: 28,
  },
  treeLabelBox: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  treeLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0F172A",
  },
  treePath: {
    fontSize: 12,
    color: "#64748B",
  },
};