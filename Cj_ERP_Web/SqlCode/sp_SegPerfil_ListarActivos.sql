CREATE OR ALTER PROCEDURE dbo.sp_SegPerfil_ListarActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdPerfil,
        NombrePerfil,
        Descripcion,
        EsActivo,
        FechaCreacion
    FROM dbo.SegPerfil
    WHERE ISNULL(EsActivo, 1) = 1
    ORDER BY NombrePerfil;
END
GO
