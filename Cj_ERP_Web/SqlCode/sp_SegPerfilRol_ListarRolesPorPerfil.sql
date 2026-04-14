CREATE OR ALTER PROCEDURE dbo.sp_SegPerfilRol_ListarRolesPorPerfil
    @IdPerfil INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        r.IdRol,
        r.NombreRol,
        r.Descripcion,
        r.EsActivo,
        r.FechaCreacion
    FROM dbo.SegPerfilRol pr
    INNER JOIN dbo.SegRol r
        ON pr.IdRol = r.IdRol
    WHERE pr.IdPerfil = @IdPerfil
      AND pr.EsActivo = 1
      AND r.EsActivo = 1
    ORDER BY r.NombreRol;
END
GO