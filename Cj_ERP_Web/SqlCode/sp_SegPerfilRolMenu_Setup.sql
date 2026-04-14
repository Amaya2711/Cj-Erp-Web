/* =========================================================
   TABLA + SPs: ASIGNACION MENU POR PERFIL-ROL
   ========================================================= */

IF OBJECT_ID('dbo.SegPerfilRolMenu', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SegPerfilRolMenu
    (
        IdPerfilRolMenu      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        IdPerfil             INT NOT NULL,
        IdRol                INT NOT NULL,
        IdMenu               INT NOT NULL,
        EsActivo             BIT NOT NULL CONSTRAINT DF_SegPerfilRolMenu_EsActivo DEFAULT(1),
        UsuarioCreacion      NVARCHAR(50) NULL,
        FechaCreacion        DATETIME NOT NULL CONSTRAINT DF_SegPerfilRolMenu_FechaCreacion DEFAULT(GETDATE()),
        UsuarioActualizacion NVARCHAR(50) NULL,
        FechaActualizacion   DATETIME NULL,
        CONSTRAINT UQ_SegPerfilRolMenu UNIQUE (IdPerfil, IdRol, IdMenu)
    );
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegPerfilRolMenu_ListarAsignado
    @IdPerfil INT,
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegPerfilRol pr
        WHERE pr.IdPerfil = @IdPerfil
          AND pr.IdRol = @IdRol
          AND ISNULL(pr.EsActivo, 1) = 1
    )
    BEGIN
        SELECT TOP 0
            m.IdMenu,
            m.IdMenuPadre,
            m.NombreMenu,
            m.Ruta,
            m.Icono,
            m.OrdenMenu,
            m.NivelMenu,
            m.CodigoMenu,
            m.EsVisible,
            m.EsActivo,
            CAST(0 AS BIT) AS EsNodoPrincipal
        FROM dbo.SegMenu m
        WHERE 1 = 0;
        RETURN;
    END

    SELECT DISTINCT
        m.IdMenu,
        m.IdMenuPadre,
        m.NombreMenu,
        m.Ruta,
        m.Icono,
        m.OrdenMenu,
        m.NivelMenu,
        m.CodigoMenu,
        m.EsVisible,
        m.EsActivo,
        CAST(CASE WHEN m.IdMenuPadre IS NULL THEN 1 ELSE 0 END AS BIT) AS EsNodoPrincipal
    FROM dbo.SegPerfilRolMenu prm
    INNER JOIN dbo.SegMenu m
        ON prm.IdMenu = m.IdMenu
    WHERE prm.IdPerfil = @IdPerfil
      AND prm.IdRol = @IdRol
      AND ISNULL(prm.EsActivo, 1) = 1
      AND ISNULL(m.EsActivo, 1) = 1
    ORDER BY m.NivelMenu, m.OrdenMenu, m.IdMenu;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegPerfilRolMenu_EliminarPorPerfilRol
    @IdPerfil INT,
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.SegPerfilRolMenu
    SET EsActivo = 0,
        UsuarioActualizacion = 'SISTEMA',
        FechaActualizacion = GETDATE()
    WHERE IdPerfil = @IdPerfil
      AND IdRol = @IdRol
      AND ISNULL(EsActivo, 1) = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegPerfilRolMenu_Insertar
    @IdPerfil INT,
    @IdRol INT,
    @IdMenu INT,
    @UsuarioCreacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.SegPerfilRolMenu
        WHERE IdPerfil = @IdPerfil
          AND IdRol = @IdRol
          AND IdMenu = @IdMenu
    )
    BEGIN
        UPDATE dbo.SegPerfilRolMenu
        SET EsActivo = 1,
            UsuarioActualizacion = @UsuarioCreacion,
            FechaActualizacion = GETDATE()
        WHERE IdPerfil = @IdPerfil
          AND IdRol = @IdRol
          AND IdMenu = @IdMenu;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.SegPerfilRolMenu
        (
            IdPerfil,
            IdRol,
            IdMenu,
            EsActivo,
            UsuarioCreacion,
            FechaCreacion
        )
        VALUES
        (
            @IdPerfil,
            @IdRol,
            @IdMenu,
            1,
            @UsuarioCreacion,
            GETDATE()
        );
    END
END
GO
