CREATE OR ALTER PROCEDURE dbo.sp_SegRol_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdRol,
        NombreRol,
        Descripcion,
        EsActivo,
        FechaCreacion
    FROM dbo.SegRol
    ORDER BY IdRol DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegRol_ObtenerPorId
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdRol,
        NombreRol,
        Descripcion,
        EsActivo,
        FechaCreacion
    FROM dbo.SegRol
    WHERE IdRol = @IdRol;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegRol_Crear
    @NombreRol NVARCHAR(100),
    @Descripcion NVARCHAR(250),
    @EsActivo BIT,
    @UsuarioCreacion NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM dbo.SegRol
        WHERE UPPER(LTRIM(RTRIM(NombreRol))) = UPPER(LTRIM(RTRIM(@NombreRol)))
    )
    BEGIN
        RAISERROR('Ya existe un rol con ese nombre.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.SegRol
    (
        NombreRol,
        Descripcion,
        EsActivo,
        UsuarioCreacion,
        FechaCreacion
    )
    VALUES
    (
        UPPER(LTRIM(RTRIM(@NombreRol))),
        LTRIM(RTRIM(@Descripcion)),
        @EsActivo,
        @UsuarioCreacion,
        GETDATE()
    );

    SELECT SCOPE_IDENTITY() AS IdRol;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegRol_Actualizar
    @IdRol INT,
    @NombreRol NVARCHAR(100),
    @Descripcion NVARCHAR(250),
    @EsActivo BIT,
    @UsuarioActualiza NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.SegRol
        WHERE IdRol = @IdRol
    )
    BEGIN
        RAISERROR('El rol no existe.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM dbo.SegRol
        WHERE UPPER(LTRIM(RTRIM(NombreRol))) = UPPER(LTRIM(RTRIM(@NombreRol)))
          AND IdRol <> @IdRol
    )
    BEGIN
        RAISERROR('Ya existe otro rol con ese nombre.', 16, 1);
        RETURN;
    END

    UPDATE dbo.SegRol
    SET
        NombreRol = UPPER(LTRIM(RTRIM(@NombreRol))),
        Descripcion = LTRIM(RTRIM(@Descripcion)),
        EsActivo = @EsActivo,
        UsuarioActualiza = @UsuarioActualiza,
        FechaActualiza = GETDATE()
    WHERE IdRol = @IdRol;

    SELECT @IdRol AS IdRol;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SegRol_Eliminar
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.SegRol
        WHERE IdRol = @IdRol
    )
    BEGIN
        RAISERROR('El rol no existe.', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.SegRol
    WHERE IdRol = @IdRol;

    SELECT @IdRol AS IdRol;
END
GO