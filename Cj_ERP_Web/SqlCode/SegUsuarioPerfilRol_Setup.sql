/* =========================================================
   TABLA: ASIGNACION USUARIO-PERFIL-ROL
   Relacion correcta:
   - SegUsuarioPerfilRol.IdUsuarioPerfil -> SegUsuarioPerfil.IdUsuarioPerfil
   - SegUsuarioPerfilRol.IdPerfilRol -> SegPerfilRol.IdPerfilRol
   ========================================================= */

IF OBJECT_ID('dbo.SegUsuarioPerfilRol', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SegUsuarioPerfilRol
    (
        IdUsuarioPerfilRol    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        IdUsuarioPerfil       INT NOT NULL,
        IdPerfilRol           INT NOT NULL,
        EsActivo              BIT NOT NULL CONSTRAINT DF_SegUsuarioPerfilRol_EsActivo DEFAULT (1),
        UsuarioCreacion       NVARCHAR(50) NULL,
        FechaCreacion         DATETIME NOT NULL CONSTRAINT DF_SegUsuarioPerfilRol_FechaCreacion DEFAULT (GETDATE()),
        UsuarioActualizacion  NVARCHAR(50) NULL,
        FechaActualizacion    DATETIME NULL
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UQ_SegUsuarioPerfilRol'
      AND object_id = OBJECT_ID('dbo.SegUsuarioPerfilRol')
)
BEGIN
    CREATE UNIQUE INDEX UQ_SegUsuarioPerfilRol
    ON dbo.SegUsuarioPerfilRol(IdUsuarioPerfil, IdPerfilRol);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_SegUsuarioPerfilRol_UsuarioPerfil'
)
BEGIN
    ALTER TABLE dbo.SegUsuarioPerfilRol
    ADD CONSTRAINT FK_SegUsuarioPerfilRol_UsuarioPerfil
        FOREIGN KEY (IdUsuarioPerfil) REFERENCES dbo.SegUsuarioPerfil(IdUsuarioPerfil);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_SegUsuarioPerfilRol_PerfilRol'
)
BEGIN
    ALTER TABLE dbo.SegUsuarioPerfilRol
    ADD CONSTRAINT FK_SegUsuarioPerfilRol_PerfilRol
        FOREIGN KEY (IdPerfilRol) REFERENCES dbo.SegPerfilRol(IdPerfilRol);
END;
GO

/* =========================================================
   SPs: REGISTRAR / MODIFICAR / ELIMINAR
   ========================================================= */

CREATE OR ALTER PROCEDURE dbo.sp_SegUsuarioPerfilRol_Insertar
    @IdUsuarioPerfil INT,
    @IdPerfilRol INT,
    @UsuarioCreacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfil
        WHERE IdUsuarioPerfil = @IdUsuarioPerfil
          AND ISNULL(EsActivo, 1) = 1
    )
    BEGIN
        RAISERROR('No existe una relacion activa en SegUsuarioPerfil para el IdUsuarioPerfil enviado.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegPerfilRol
        WHERE IdPerfilRol = @IdPerfilRol
          AND ISNULL(EsActivo, 1) = 1
    )
    BEGIN
        RAISERROR('No existe una relacion activa en SegPerfilRol para el IdPerfilRol enviado.', 16, 1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfilRol
        WHERE IdUsuarioPerfil = @IdUsuarioPerfil
          AND IdPerfilRol = @IdPerfilRol
    )
    BEGIN
        UPDATE dbo.SegUsuarioPerfilRol
        SET EsActivo = 1,
            UsuarioActualizacion = @UsuarioCreacion,
            FechaActualizacion = GETDATE()
        WHERE IdUsuarioPerfil = @IdUsuarioPerfil
          AND IdPerfilRol = @IdPerfilRol;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.SegUsuarioPerfilRol
        (
            IdUsuarioPerfil,
            IdPerfilRol,
            EsActivo,
            UsuarioCreacion,
            FechaCreacion
        )
        VALUES
        (
            @IdUsuarioPerfil,
            @IdPerfilRol,
            1,
            @UsuarioCreacion,
            GETDATE()
        );
    END
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegUsuarioPerfilRol_Actualizar
    @IdUsuarioPerfilRol INT,
    @IdUsuarioPerfil INT,
    @IdPerfilRol INT,
    @UsuarioActualizacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfilRol
        WHERE IdUsuarioPerfilRol = @IdUsuarioPerfilRol
    )
    BEGIN
        RAISERROR('No existe el registro en SegUsuarioPerfilRol.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfil
        WHERE IdUsuarioPerfil = @IdUsuarioPerfil
          AND ISNULL(EsActivo, 1) = 1
    )
    BEGIN
        RAISERROR('No existe una relacion activa en SegUsuarioPerfil para el IdUsuarioPerfil enviado.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegPerfilRol
        WHERE IdPerfilRol = @IdPerfilRol
          AND ISNULL(EsActivo, 1) = 1
    )
    BEGIN
        RAISERROR('No existe una relacion activa en SegPerfilRol para el IdPerfilRol enviado.', 16, 1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfilRol
        WHERE IdUsuarioPerfil = @IdUsuarioPerfil
          AND IdPerfilRol = @IdPerfilRol
          AND IdUsuarioPerfilRol <> @IdUsuarioPerfilRol
    )
    BEGIN
        RAISERROR('Ya existe una relacion SegUsuarioPerfilRol con el mismo IdUsuarioPerfil e IdPerfilRol.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.SegUsuarioPerfilRol
    SET IdUsuarioPerfil = @IdUsuarioPerfil,
        IdPerfilRol = @IdPerfilRol,
        UsuarioActualizacion = @UsuarioActualizacion,
        FechaActualizacion = GETDATE()
    WHERE IdUsuarioPerfilRol = @IdUsuarioPerfilRol;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegUsuarioPerfilRol_Eliminar
    @IdUsuarioPerfilRol INT,
    @UsuarioActualizacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SegUsuarioPerfilRol
        WHERE IdUsuarioPerfilRol = @IdUsuarioPerfilRol
          AND ISNULL(EsActivo, 1) = 1
    )
    BEGIN
        RAISERROR('No existe un registro activo en SegUsuarioPerfilRol para eliminar.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.SegUsuarioPerfilRol
    SET EsActivo = 0,
        UsuarioActualizacion = @UsuarioActualizacion,
        FechaActualizacion = GETDATE()
    WHERE IdUsuarioPerfilRol = @IdUsuarioPerfilRol;
END;
GO

/* =========================================================
   EJEMPLO DE INSERCION CORRECTA
   Caso: asignar al usuario PTORRES el rol 4 dentro del perfil 8
   ========================================================= */
DECLARE @IdUsuario NVARCHAR(50) = N'PTORRES';
DECLARE @IdPerfil INT = 8;
DECLARE @IdRol INT = 4;
DECLARE @UsuarioAuditoria NVARCHAR(50) = N'SISTEMA';

INSERT INTO dbo.SegUsuarioPerfilRol
(
    IdUsuarioPerfil,
    IdPerfilRol,
    EsActivo,
    UsuarioCreacion
)
SELECT
    up.IdUsuarioPerfil,
    pr.IdPerfilRol,
    1,
    @UsuarioAuditoria
FROM dbo.SegUsuarioPerfil up
INNER JOIN dbo.SegPerfilRol pr
    ON pr.IdPerfil = up.IdPerfil
   AND pr.IdRol = @IdRol
   AND ISNULL(pr.EsActivo, 1) = 1
WHERE up.IdUsuario = @IdUsuario
  AND up.IdPerfil = @IdPerfil
  AND ISNULL(up.EsActivo, 1) = 1
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.SegUsuarioPerfilRol upr
      WHERE upr.IdUsuarioPerfil = up.IdUsuarioPerfil
        AND upr.IdPerfilRol = pr.IdPerfilRol
  );
GO

/* =========================================================
   VALIDACION
   ========================================================= */
SELECT
    upr.IdUsuarioPerfilRol,
    up.IdUsuario,
    up.IdPerfil,
    pr.IdRol,
    upr.EsActivo,
    upr.UsuarioCreacion,
    upr.FechaCreacion
FROM dbo.SegUsuarioPerfilRol upr
INNER JOIN dbo.SegUsuarioPerfil up
    ON up.IdUsuarioPerfil = upr.IdUsuarioPerfil
INNER JOIN dbo.SegPerfilRol pr
    ON pr.IdPerfilRol = upr.IdPerfilRol
WHERE up.IdUsuario = N'PTORRES';
GO