/* =========================================================
   SCRIPT CORRECTIVO FINAL
   Sincroniza el tipo de SegUsuarioPerfil.IdUsuario
   y SegUsuarioMenuAccion.IdUsuario con dbo.Usuario.IdUsuario
   ========================================================= */

SET NOCOUNT ON;
GO

/* =========================================================
   1. VALIDAR QUE EXISTA dbo.Usuario
   ========================================================= */
IF OBJECT_ID('dbo.Usuario', 'U') IS NULL
BEGIN
    RAISERROR('No existe la tabla dbo.Usuario.', 16, 1);
    RETURN;
END
GO

IF COL_LENGTH('dbo.Usuario', 'IdUsuario') IS NULL
BEGIN
    RAISERROR('No existe la columna dbo.Usuario.IdUsuario.', 16, 1);
    RETURN;
END
GO


/* =========================================================
   2. MOSTRAR TIPO REAL DE dbo.Usuario.IdUsuario
   ========================================================= */
SELECT
    c.name AS Columna,
    t.name AS TipoDato,
    c.max_length AS MaxLengthBytes,
    c.collation_name AS CollationName,
    c.is_nullable AS EsNullable
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Usuario')
  AND c.name = 'IdUsuario';
GO


/* =========================================================
   3. ELIMINAR FOREIGN KEYS SI EXISTEN
   ========================================================= */
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_SegUsuarioPerfil_Usuario')
BEGIN
    ALTER TABLE dbo.SegUsuarioPerfil DROP CONSTRAINT FK_SegUsuarioPerfil_Usuario;
END
GO

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_SegUsuarioMenuAccion_Usuario')
BEGIN
    ALTER TABLE dbo.SegUsuarioMenuAccion DROP CONSTRAINT FK_SegUsuarioMenuAccion_Usuario;
END
GO


/* =========================================================
   4. ELIMINAR ÍNDICES SI EXISTEN
   ========================================================= */
IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SegUsuarioPerfil_UQ'
      AND object_id = OBJECT_ID('dbo.SegUsuarioPerfil')
)
BEGIN
    DROP INDEX IX_SegUsuarioPerfil_UQ ON dbo.SegUsuarioPerfil;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SegUsuarioMenuAccion_UQ'
      AND object_id = OBJECT_ID('dbo.SegUsuarioMenuAccion')
)
BEGIN
    DROP INDEX IX_SegUsuarioMenuAccion_UQ ON dbo.SegUsuarioMenuAccion;
END
GO


/* =========================================================
   5. ALTERAR COLUMNAS AL MISMO TIPO DE dbo.Usuario.IdUsuario
   ========================================================= */
DECLARE @TipoBase NVARCHAR(50);
DECLARE @MaxLength INT;
DECLARE @Collation NVARCHAR(200);
DECLARE @Sql NVARCHAR(MAX);

SELECT
    @TipoBase = t.name,
    @MaxLength = c.max_length,
    @Collation = c.collation_name
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Usuario')
  AND c.name = 'IdUsuario';

-- max_length en nvarchar/varchar viene en bytes
DECLARE @TipoCompleto NVARCHAR(200);

IF @TipoBase IN ('nvarchar', 'nchar')
BEGIN
    SET @TipoCompleto = @TipoBase + '(' + 
        CASE WHEN @MaxLength = -1 THEN 'MAX' ELSE CAST(@MaxLength / 2 AS NVARCHAR(10)) END + ')';
END
ELSE IF @TipoBase IN ('varchar', 'char')
BEGIN
    SET @TipoCompleto = @TipoBase + '(' +
        CASE WHEN @MaxLength = -1 THEN 'MAX' ELSE CAST(@MaxLength AS NVARCHAR(10)) END + ')';
END
ELSE
BEGIN
    SET @TipoCompleto = @TipoBase;
END

-- SegUsuarioPerfil
IF OBJECT_ID('dbo.SegUsuarioPerfil', 'U') IS NOT NULL
BEGIN
    SET @Sql = '
        ALTER TABLE dbo.SegUsuarioPerfil
        ALTER COLUMN IdUsuario ' + @TipoCompleto +
        CASE WHEN @Collation IS NOT NULL AND @TipoBase IN ('varchar','nvarchar','char','nchar')
             THEN ' COLLATE ' + @Collation
             ELSE ''
        END + ' NOT NULL;';
    EXEC sp_executesql @Sql;
END

-- SegUsuarioMenuAccion
IF OBJECT_ID('dbo.SegUsuarioMenuAccion', 'U') IS NOT NULL
BEGIN
    SET @Sql = '
        ALTER TABLE dbo.SegUsuarioMenuAccion
        ALTER COLUMN IdUsuario ' + @TipoCompleto +
        CASE WHEN @Collation IS NOT NULL AND @TipoBase IN ('varchar','nvarchar','char','nchar')
             THEN ' COLLATE ' + @Collation
             ELSE ''
        END + ' NOT NULL;';
    EXEC sp_executesql @Sql;
END
GO


/* =========================================================
   6. RECREAR FOREIGN KEYS
   ========================================================= */
IF OBJECT_ID('dbo.SegUsuarioPerfil', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_SegUsuarioPerfil_Usuario')
BEGIN
    ALTER TABLE dbo.SegUsuarioPerfil
    ADD CONSTRAINT FK_SegUsuarioPerfil_Usuario
    FOREIGN KEY (IdUsuario) REFERENCES dbo.Usuario(IdUsuario);
END
GO

IF OBJECT_ID('dbo.SegUsuarioMenuAccion', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_SegUsuarioMenuAccion_Usuario')
BEGIN
    ALTER TABLE dbo.SegUsuarioMenuAccion
    ADD CONSTRAINT FK_SegUsuarioMenuAccion_Usuario
    FOREIGN KEY (IdUsuario) REFERENCES dbo.Usuario(IdUsuario);
END
GO


/* =========================================================
   7. RECREAR ÍNDICES
   ========================================================= */
IF OBJECT_ID('dbo.SegUsuarioPerfil', 'U') IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SegUsuarioPerfil_UQ'
      AND object_id = OBJECT_ID('dbo.SegUsuarioPerfil')
)
BEGIN
    CREATE UNIQUE INDEX IX_SegUsuarioPerfil_UQ
    ON dbo.SegUsuarioPerfil(IdUsuario, IdPerfil);
END
GO

IF OBJECT_ID('dbo.SegUsuarioMenuAccion', 'U') IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SegUsuarioMenuAccion_UQ'
      AND object_id = OBJECT_ID('dbo.SegUsuarioMenuAccion')
)
BEGIN
    CREATE UNIQUE INDEX IX_SegUsuarioMenuAccion_UQ
    ON dbo.SegUsuarioMenuAccion(IdUsuario, IdMenu, IdAccion);
END
GO


/* =========================================================
   8. VERIFICAR TIPOS FINALES
   ========================================================= */
SELECT
    'Usuario' AS Tabla,
    c.name AS Columna,
    t.name AS TipoDato,
    c.max_length AS MaxLengthBytes,
    c.collation_name AS CollationName
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Usuario')
  AND c.name = 'IdUsuario'

UNION ALL

SELECT
    'SegUsuarioPerfil' AS Tabla,
    c.name AS Columna,
    t.name AS TipoDato,
    c.max_length AS MaxLengthBytes,
    c.collation_name AS CollationName
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.SegUsuarioPerfil')
  AND c.name = 'IdUsuario'

UNION ALL

SELECT
    'SegUsuarioMenuAccion' AS Tabla,
    c.name AS Columna,
    t.name AS TipoDato,
    c.max_length AS MaxLengthBytes,
    c.collation_name AS CollationName
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.SegUsuarioMenuAccion')
  AND c.name = 'IdUsuario';
GO


/* =========================================================
   9. INSERT DE EJEMPLO: ASIGNAR USUARIO A PERFIL
   ========================================================= */
IF EXISTS (SELECT 1 FROM dbo.Usuario WHERE IdUsuario = 'PTORRES')
AND EXISTS (SELECT 1 FROM dbo.SegPerfil WHERE NombrePerfil = 'PAGOS')
AND NOT EXISTS
(
    SELECT 1
    FROM dbo.SegUsuarioPerfil
    WHERE IdUsuario = 'PTORRES'
      AND IdPerfil = (SELECT IdPerfil FROM dbo.SegPerfil WHERE NombrePerfil = 'PAGOS')
)
BEGIN
    INSERT INTO dbo.SegUsuarioPerfil
    (
        IdUsuario, IdPerfil, EsActivo, UsuarioCreacion
    )
    SELECT
        'PTORRES',
        IdPerfil,
        1,
        'SISTEMA'
    FROM dbo.SegPerfil
    WHERE NombrePerfil = 'PAGOS';
END
GO


/* =========================================================
   10. EJEMPLO OPCIONAL: PERMISO ESPECIAL
   ========================================================= */
-- Descomenta si quieres probar
/*
IF EXISTS (SELECT 1 FROM dbo.Usuario WHERE IdUsuario = 'PTORRES')
AND EXISTS (SELECT 1 FROM dbo.SegMenu WHERE CodigoMenu = 'PAG_GASTOS')
AND EXISTS (SELECT 1 FROM dbo.SegAccion WHERE CodigoAccion = 'APROBAR')
AND NOT EXISTS
(
    SELECT 1
    FROM dbo.SegUsuarioMenuAccion
    WHERE IdUsuario = 'PTORRES'
      AND IdMenu = (SELECT IdMenu FROM dbo.SegMenu WHERE CodigoMenu = 'PAG_GASTOS')
      AND IdAccion = (SELECT IdAccion FROM dbo.SegAccion WHERE CodigoAccion = 'APROBAR')
)
BEGIN
    INSERT INTO dbo.SegUsuarioMenuAccion
    (
        IdUsuario, IdMenu, IdAccion, EsPermitido, EsActivo,
        FechaInicio, FechaFin, Observacion, UsuarioCreacion
    )
    SELECT
        'PTORRES',
        (SELECT IdMenu FROM dbo.SegMenu WHERE CodigoMenu = 'PAG_GASTOS'),
        (SELECT IdAccion FROM dbo.SegAccion WHERE CodigoAccion = 'APROBAR'),
        1,
        1,
        GETDATE(),
        NULL,
        'Permiso especial aprobar gastos',
        'SISTEMA';
END
GO
*/


/* =========================================================
   11. PRUEBAS
   ========================================================= */
-- SELECT * FROM dbo.SegUsuarioPerfil;
-- SELECT * FROM dbo.SegUsuarioMenuAccion;