import { Suspense, lazy, useMemo } from "react";
import { useParams } from "react-router-dom";
import DynamicMenuRoutePage from "../../pages/DynamicMenuRoutePage";

type ModuleLoader = () => Promise<unknown>;

const securityPageModules = import.meta.glob("../../pages/seguridad/*.tsx") as Record<
  string,
  ModuleLoader
>;

export default function AutoSecurityRoute() {
  const { autoPage } = useParams<{ autoPage: string }>();

  const moduleKey = `../../pages/seguridad/${autoPage || ""}.tsx`;
  const loader = securityPageModules[moduleKey];

  const LazyPage = useMemo(() => {
    if (!loader) {
      return null;
    }

    return lazy(async () => {
      const mod = (await loader()) as { default: React.ComponentType };
      return { default: mod.default };
    });
  }, [loader]);

  if (!LazyPage) {
    return <DynamicMenuRoutePage />;
  }

  return (
    <Suspense fallback={<div>Cargando módulo...</div>}>
      <LazyPage />
    </Suspense>
  );
}
