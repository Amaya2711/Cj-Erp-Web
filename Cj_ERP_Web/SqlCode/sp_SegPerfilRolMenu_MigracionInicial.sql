/* =========================================================
   MIGRACION INICIAL: SegRolMenuAccion -> SegPerfilRolMenu
   Objetivo: preservar asignaciones existentes de menu por rol,
   expandiendolas a todos los perfiles que tienen ese rol activo.
   ========================================================= */

SET NOCOUNT ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegPerfilRolMenu_MigracionInicial
    @UsuarioMigracion NVARCHAR(50) = N'MIGRACION_INICIAL'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID('dbo.SegPerfilRol', 'U') IS NULL
    BEGIN
        RAISERROR('No existe dbo.SegPerfilRol.', 16, 1);
        RETURN;
    END

    IF OBJECT_ID('dbo.SegRolMenuAccion', 'U') IS NULL
    BEGIN
        RAISERROR('No existe dbo.SegRolMenuAccion.', 16, 1);
        RETURN;
    END

    IF OBJECT_ID('dbo.SegPerfilRolMenu', 'U') IS NULL
    BEGIN
        RAISERROR('No existe dbo.SegPerfilRolMenu. Ejecuta primero sp_SegPerfilRolMenu_Setup.sql.', 16, 1);
        RETURN;
    END

    DECLARE @FiltrarSoloVer BIT = CASE
        WHEN OBJECT_ID('dbo.SegAccion', 'U') IS NOT NULL
         AND COL_LENGTH('dbo.SegRolMenuAccion', 'IdAccion') IS NOT NULL
         AND COL_LENGTH('dbo.SegAccion', 'CodigoAccion') IS NOT NULL
        THEN 1
        ELSE 0
    END;

    DECLARE @RowsReactivadas INT = 0;
    DECLARE @RowsInsertadas INT = 0;

    BEGIN TRY
        BEGIN TRAN;

        ;WITH Fuente AS
        (
            SELECT DISTINCT
                pr.IdPerfil,
                rma.IdRol,
                rma.IdMenu
            FROM dbo.SegPerfilRol pr
            INNER JOIN dbo.SegRolMenuAccion rma
                ON pr.IdRol = rma.IdRol
            INNER JOIN dbo.SegMenu m
                ON m.IdMenu = rma.IdMenu
            WHERE ISNULL(pr.EsActivo, 1) = 1
              AND ISNULL(rma.EsActivo, 1) = 1
              AND ISNULL(rma.EsPermitido, 1) = 1
              AND ISNULL(m.EsActivo, 1) = 1
              AND (
                    @FiltrarSoloVer = 0
                    OR EXISTS
                    (
                        SELECT 1
                        FROM dbo.SegAccion a
                        WHERE a.IdAccion = rma.IdAccion
                          AND a.CodigoAccion = 'VER'
                    )
                  )
        )
        UPDATE tgt
        SET tgt.EsActivo = 1,
            tgt.UsuarioActualizacion = @UsuarioMigracion,
            tgt.FechaActualizacion = GETDATE()
        FROM dbo.SegPerfilRolMenu tgt
        INNER JOIN Fuente src
            ON src.IdPerfil = tgt.IdPerfil
           AND src.IdRol = tgt.IdRol
           AND src.IdMenu = tgt.IdMenu
        WHERE ISNULL(tgt.EsActivo, 1) = 0;

        SET @RowsReactivadas = @@ROWCOUNT;

        ;WITH Fuente AS
        (
            SELECT DISTINCT
                pr.IdPerfil,
                rma.IdRol,
                rma.IdMenu
            FROM dbo.SegPerfilRol pr
            INNER JOIN dbo.SegRolMenuAccion rma
                ON pr.IdRol = rma.IdRol
            INNER JOIN dbo.SegMenu m
                ON m.IdMenu = rma.IdMenu
            WHERE ISNULL(pr.EsActivo, 1) = 1
              AND ISNULL(rma.EsActivo, 1) = 1
              AND ISNULL(rma.EsPermitido, 1) = 1
              AND ISNULL(m.EsActivo, 1) = 1
              AND (
                    @FiltrarSoloVer = 0
                    OR EXISTS
                    (
                        SELECT 1
                        FROM dbo.SegAccion a
                        WHERE a.IdAccion = rma.IdAccion
                          AND a.CodigoAccion = 'VER'
                    )
                  )
        )
        INSERT INTO dbo.SegPerfilRolMenu
        (
            IdPerfil,
            IdRol,
            IdMenu,
            EsActivo,
            UsuarioCreacion,
            FechaCreacion
        )
        SELECT
            src.IdPerfil,
            src.IdRol,
            src.IdMenu,
            1,
            @UsuarioMigracion,
            GETDATE()
        FROM Fuente src
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM dbo.SegPerfilRolMenu tgt
            WHERE tgt.IdPerfil = src.IdPerfil
              AND tgt.IdRol = src.IdRol
              AND tgt.IdMenu = src.IdMenu
        );

        SET @RowsInsertadas = @@ROWCOUNT;

        COMMIT;

        SELECT
            @RowsInsertadas AS FilasInsertadas,
            @RowsReactivadas AS FilasReactivadas,
            @FiltrarSoloVer AS SeFiltroSoloAccionVer;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrNum INT = ERROR_NUMBER();
        DECLARE @ErrState INT = ERROR_STATE();

        RAISERROR('Error en migracion inicial SegPerfilRolMenu (%d): %s', 16, @ErrState, @ErrNum, @ErrMsg);
        RETURN;
    END CATCH
END
GO

/* =========================================================
   EJECUCION
   ========================================================= */
-- EXEC dbo.sp_SegPerfilRolMenu_MigracionInicial;
-- EXEC dbo.sp_SegPerfilRolMenu_MigracionInicial @UsuarioMigracion = N'SISTEMA';
