import type { MenuDto, MenuNode } from "../models/seguridad/menu.types";

export function buildMenuTree(items: MenuDto[]): MenuNode[] {
  const map = new Map<number, MenuNode>();
  const roots: MenuNode[] = [];

  const visibles = items
    .filter(x => x.esActivo && x.esVisible)
    .sort((a, b) => {
      if (a.nivelMenu !== b.nivelMenu) return a.nivelMenu - b.nivelMenu;
      if ((a.idMenuPadre ?? 0) !== (b.idMenuPadre ?? 0)) {
        return (a.idMenuPadre ?? 0) - (b.idMenuPadre ?? 0);
      }
      return a.ordenMenu - b.ordenMenu;
    });

  for (const item of visibles) {
    map.set(item.idMenu, {
      ...item,
      hijos: []
    });
  }

  for (const item of visibles) {
    const node = map.get(item.idMenu)!;

    if (item.idMenuPadre == null) {
      roots.push(node);
      continue;
    }

    const parent = map.get(item.idMenuPadre);
    if (parent) {
      parent.hijos.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.ordenMenu - b.ordenMenu);
    nodes.forEach(n => sortRecursive(n.hijos));
  };

  sortRecursive(roots);

  return roots;
}