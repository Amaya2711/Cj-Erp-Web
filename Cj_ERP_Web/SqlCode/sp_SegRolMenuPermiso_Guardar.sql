CREATE OR ALTER PROCEDURE dbo.sp_SegRolMenuPermiso_Guardar
(
    @IdRol           INT,
    @IdMenu          INT,
    @PuedeVer        BIT,
    @PuedeCrear      BIT,
    @PuedeEditar     BIT,
    @PuedeEliminar   BIT,
    @PuedeAprobar    BIT,
    @PuedeExportar   BIT,
    @Usuario         NVARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.SegRolMenuPermiso
        WHERE IdRol = @IdRol
          AND IdMenu = @IdMenu
    )
    BEGIN
        UPDATE dbo.SegRolMenuPermiso
        SET PuedeVer = @PuedeVer,
            PuedeCrear = @PuedeCrear,
            PuedeEditar = @PuedeEditar,
            PuedeEliminar = @PuedeEliminar,
            PuedeAprobar = @PuedeAprobar,
            PuedeExportar = @PuedeExportar,
            Estado = 1,
            UsuarioActualizacion = @Usuario,
            FechaActualizacion = GETDATE()
        WHERE IdRol = @IdRol
          AND IdMenu = @IdMenu;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.SegRolMenuPermiso
        (
            IdRol,
            IdMenu,
            PuedeVer,
            PuedeCrear,
            PuedeEditar,
            PuedeEliminar,
            PuedeAprobar,
            PuedeExportar,
            Estado,
            UsuarioCreacion,
            FechaCreacion
        )
        VALUES
        (
            @IdRol,
            @IdMenu,
            @PuedeVer,
            @PuedeCrear,
            @PuedeEditar,
            @PuedeEliminar,
            @PuedeAprobar,
            @PuedeExportar,
            1,
            @Usuario,
            GETDATE()
        );
    END
END
GO