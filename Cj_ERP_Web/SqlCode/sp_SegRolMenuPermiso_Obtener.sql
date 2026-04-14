CREATE OR ALTER PROCEDURE dbo.sp_SegRolMenuPermiso_Obtener
(
    @IdRol  INT,
    @IdMenu INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        IdRolMenuPermiso,
        IdRol,
        IdMenu,
        PuedeVer,
        PuedeCrear,
        PuedeEditar,
        PuedeEliminar,
        PuedeAprobar,
        PuedeExportar,
        Estado
    FROM dbo.SegRolMenuPermiso
    WHERE IdRol = @IdRol
      AND IdMenu = @IdMenu;
END
GO