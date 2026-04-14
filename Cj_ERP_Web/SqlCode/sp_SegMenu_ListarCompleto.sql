/* =========================================================
   MENU COMPLETO
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_SegMenu_ListarCompleto
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdMenu,
        IdMenuPadre,
        NombreMenu,
        Ruta,
        Icono,
        OrdenMenu,
        NivelMenu,
        CodigoMenu,
        EsActivo,
        EsVisible
    FROM dbo.SegMenu
    WHERE EsActivo = 1
    ORDER BY NivelMenu, OrdenMenu, IdMenu;
END
GO

/* =========================================================
   MENU EFECTIVO POR USUARIO
   Incluye ancestros para construir el árbol
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_SegMenu_ListarPorUsuario
    @IdUsuario NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH PermisosRol AS
    (
        SELECT DISTINCT
            rma.IdMenu,
            a.CodigoAccion,
            CAST(1 AS BIT) AS EsPermitidoRol
        FROM dbo.Usuario u
        INNER JOIN dbo.SegUsuarioPerfil up
            ON u.IdUsuario = up.IdUsuario
           AND up.EsActivo = 1
        INNER JOIN dbo.SegPerfilRol pr
            ON up.IdPerfil = pr.IdPerfil
           AND pr.EsActivo = 1
        INNER JOIN dbo.SegRolMenuAccion rma
            ON pr.IdRol = rma.IdRol
           AND rma.EsActivo = 1
           AND rma.EsPermitido = 1
        INNER JOIN dbo.SegAccion a
            ON rma.IdAccion = a.IdAccion
           AND a.EsActivo = 1
        WHERE u.IdUsuario = @IdUsuario
    ),
    PermisosUsuario AS
    (
        SELECT
            uma.IdMenu,
            a.CodigoAccion,
            uma.EsPermitido AS EsPermitidoUsuario
        FROM dbo.Usuario u
        INNER JOIN dbo.SegUsuarioMenuAccion uma
            ON u.IdUsuario = uma.IdUsuario
           AND uma.EsActivo = 1
           AND (uma.FechaInicio IS NULL OR uma.FechaInicio <= GETDATE())
           AND (uma.FechaFin IS NULL OR uma.FechaFin >= GETDATE())
        INNER JOIN dbo.SegAccion a
            ON uma.IdAccion = a.IdAccion
           AND a.EsActivo = 1
        WHERE u.IdUsuario = @IdUsuario
    ),
    PermisosFinales AS
    (
        SELECT
            COALESCE(pu.IdMenu, pr.IdMenu) AS IdMenu,
            COALESCE(pu.CodigoAccion, pr.CodigoAccion) AS CodigoAccion,
            CASE
                WHEN pu.EsPermitidoUsuario IS NOT NULL THEN pu.EsPermitidoUsuario
                WHEN pr.EsPermitidoRol IS NOT NULL THEN pr.EsPermitidoRol
                ELSE CAST(0 AS BIT)
            END AS EsPermitidoFinal
        FROM PermisosRol pr
        FULL OUTER JOIN PermisosUsuario pu
            ON pr.IdMenu = pu.IdMenu
           AND pr.CodigoAccion = pu.CodigoAccion
    ),
    MenusPermitidos AS
    (
        SELECT DISTINCT IdMenu
        FROM PermisosFinales
        WHERE CodigoAccion = 'VER'
          AND EsPermitidoFinal = 1
    ),
    ArbolMenus AS
    (
        SELECT
            m.IdMenu,
            m.IdMenuPadre,
            m.NombreMenu,
            m.Ruta,
            m.Icono,
            m.OrdenMenu,
            m.NivelMenu,
            m.CodigoMenu
        FROM dbo.SegMenu m
        INNER JOIN MenusPermitidos mp
            ON m.IdMenu = mp.IdMenu
        WHERE m.EsActivo = 1
          AND m.EsVisible = 1

        UNION ALL

        SELECT
            p.IdMenu,
            p.IdMenuPadre,
            p.NombreMenu,
            p.Ruta,
            p.Icono,
            p.OrdenMenu,
            p.NivelMenu,
            p.CodigoMenu
        FROM dbo.SegMenu p
        INNER JOIN ArbolMenus h
            ON p.IdMenu = h.IdMenuPadre
        WHERE p.EsActivo = 1
          AND p.EsVisible = 1
    )
    SELECT DISTINCT
        IdMenu,
        IdMenuPadre,
        NombreMenu,
        Ruta,
        Icono,
        OrdenMenu,
        NivelMenu,
        CodigoMenu
    FROM ArbolMenus
    ORDER BY NivelMenu, OrdenMenu, IdMenu;
END
GO

/* =========================================================
   MENU ASIGNADO POR ROL
   Solo acción VER
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_SegMenu_ListarAsignadoPorRol
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        m.IdMenu,
        m.IdMenuPadre,
        m.NombreMenu,
        m.Ruta,
        m.Icono,
        m.OrdenMenu,
        m.NivelMenu,
        m.CodigoMenu
    FROM dbo.SegRolMenuAccion rma
    INNER JOIN dbo.SegAccion a
        ON rma.IdAccion = a.IdAccion
       AND a.CodigoAccion = 'VER'
    INNER JOIN dbo.SegMenu m
        ON rma.IdMenu = m.IdMenu
    WHERE rma.IdRol = @IdRol
      AND rma.EsActivo = 1
      AND rma.EsPermitido = 1
      AND m.EsActivo = 1
    ORDER BY m.NivelMenu, m.OrdenMenu, m.IdMenu;
END
GO

/* =========================================================
   ELIMINAR ASIGNACIÓN VER POR ROL
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_SegRolMenuAccion_EliminarVerPorRol
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE rma
    FROM dbo.SegRolMenuAccion rma
    INNER JOIN dbo.SegAccion a
        ON rma.IdAccion = a.IdAccion
    WHERE rma.IdRol = @IdRol
      AND a.CodigoAccion = 'VER';
END
GO

/* =========================================================
   INSERTAR ASIGNACIÓN VER POR ROL
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_SegRolMenuAccion_InsertarVer
    @IdRol INT,
    @IdMenu INT,
    @UsuarioCreacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IdAccionVer INT;

    SELECT @IdAccionVer = IdAccion
    FROM dbo.SegAccion
    WHERE CodigoAccion = 'VER';

    IF @IdAccionVer IS NULL
    BEGIN
        RAISERROR('No existe la acción VER en SegAccion.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegRolMenuAccion
        WHERE IdRol = @IdRol
          AND IdMenu = @IdMenu
          AND IdAccion = @IdAccionVer
    )
    BEGIN
        INSERT INTO dbo.SegRolMenuAccion
        (
            IdRol,
            IdMenu,
            IdAccion,
            EsPermitido,
            EsActivo,
            UsuarioCreacion,
            FechaCreacion
        )
        VALUES
        (
            @IdRol,
            @IdMenu,
            @IdAccionVer,
            1,
            1,
            @UsuarioCreacion,
            GETDATE()
        );
    END
END
GO