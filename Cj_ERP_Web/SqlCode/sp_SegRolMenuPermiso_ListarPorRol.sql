CREATE OR ALTER PROCEDURE dbo.sp_SegRolMenuPermiso_ListarPorRol
(
    @IdRol INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rm.IdRol,
        m.IdMenu,
        m.NombreMenu,
        m.CodigoMenu,
        m.Ruta,
        m.IdMenuPadre,
        m.Orden,

        ISNULL(p.PuedeVer, 0)      AS PuedeVer,
        ISNULL(p.PuedeCrear, 0)    AS PuedeCrear,
        ISNULL(p.PuedeEditar, 0)   AS PuedeEditar,
        ISNULL(p.PuedeEliminar, 0) AS PuedeEliminar,
        ISNULL(p.PuedeAprobar, 0)  AS PuedeAprobar,
        ISNULL(p.PuedeExportar, 0) AS PuedeExportar,

        p.IdRolMenuPermiso,
        ISNULL(p.Estado, 1) AS Estado
    FROM dbo.SegRolMenu rm
    INNER JOIN dbo.SegMenu m
        ON rm.IdMenu = m.IdMenu
    LEFT JOIN dbo.SegRolMenuPermiso p
        ON p.IdRol = rm.IdRol
       AND p.IdMenu = rm.IdMenu
    WHERE rm.IdRol = @IdRol
      AND ISNULL(rm.Estado, 1) = 1
      AND ISNULL(m.Estado, 1) = 1
    ORDER BY
        ISNULL(m.IdMenuPadre, 0),
        ISNULL(m.Orden, 0),
        m.NombreMenu;
END
GO