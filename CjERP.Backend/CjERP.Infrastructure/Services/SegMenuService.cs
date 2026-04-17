using System.Data;
using CjERP.Application.DTOs.Seguridad;
using CjERP.Application.Interfaces.Services;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace CjERP.Infrastructure.Services;

public class SegMenuService : ISegMenuService
{
    private readonly string _connectionString;

    private sealed class MenuDinamicoRow
    {
        public int IdMenuNivel1 { get; set; }
        public string? MenuNivel1 { get; set; }
        public string? IconoNivel1 { get; set; }
        public int? OrdenNivel1 { get; set; }

        public int? IdMenuNivel2 { get; set; }
        public string? MenuNivel2 { get; set; }
        public string? IconoNivel2 { get; set; }
        public int? OrdenNivel2 { get; set; }

        public int? IdMenuNivel3 { get; set; }
        public string? MenuNivel3 { get; set; }
        public string? RutaNivel3 { get; set; }
        public string? IconoNivel3 { get; set; }
        public int? OrdenNivel3 { get; set; }

        // Nuevo: campo Acceso
        public int? Acceso { get; set; }
    }

    public SegMenuService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión DefaultConnection.");
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    public async Task GuardarUsuarioPerfilAsync(string idUsuario, int idPerfil, string usuario)
    {
        using var connection = CreateConnection();

        var idUsuarioPerfil = await connection.QueryFirstOrDefaultAsync<int?>(
            """
            SELECT TOP 1 up.IdUsuarioPerfil
            FROM dbo.SegUsuarioPerfil up
            WHERE up.IdUsuario = @IdUsuario
              AND up.IdPerfil = @IdPerfil
              AND ISNULL(up.EsActivo, 1) = 1
            """,
            new { IdUsuario = idUsuario, IdPerfil = idPerfil }
        );

        if (idUsuarioPerfil.HasValue)
            return;

        await connection.ExecuteAsync(
            "dbo.sp_SegUsuarioPerfil_Guardar",
            new
            {
                IdUsuario = idUsuario,
                IdPerfil = idPerfil,
                UsuarioCreacion = usuario
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<bool> ExisteUsuarioPerfilAsync(string idUsuario, int idPerfil)
    {
        using var connection = CreateConnection();

        var idUsuarioPerfil = await connection.QueryFirstOrDefaultAsync<int?>(
            """
            SELECT TOP 1 up.IdUsuarioPerfil
            FROM dbo.SegUsuarioPerfil up
            WHERE up.IdUsuario = @IdUsuario
              AND up.IdPerfil = @IdPerfil
              AND ISNULL(up.EsActivo, 1) = 1
            """,
            new { IdUsuario = idUsuario, IdPerfil = idPerfil }
        );

        return idUsuarioPerfil.HasValue;
    }

    public async Task<IEnumerable<MenuDto>> ListarCompletoAsync()
    {
        using var connection = CreateConnection();

        var result = await connection.QueryAsync<MenuDto>(
            "dbo.sp_SegMenu_ListarCompleto",
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<IEnumerable<MenuDto>> ListarDinamicoTotalAsync()
    {
        using var connection = CreateConnection();

        var rows = await connection.QueryAsync<MenuDinamicoRow>(
            "dbo.sp_Seguridad_ObtenerMenuDinamicoTotal",
            commandType: CommandType.StoredProcedure
        );

        return BuildMenusFromDynamicRows(rows);
    }

    public async Task<IEnumerable<MenuDto>> ListarDinamicoPorPerfilAsync(int idPerfil)
    {
        using var connection = CreateConnection();

        var rows = await connection.QueryAsync<MenuDinamicoRow>(
            "dbo.sp_Seguridad_ObtenerMenuDinamico",
            new { IdPerfil = idPerfil },
            commandType: CommandType.StoredProcedure
        );

        return BuildMenusFromDynamicRows(rows);
    }

    public async Task<IEnumerable<MenuDto>> ListarMenuDinamicoAsync(string? idUsuario, int? idPerfil, int? idRol)
    {
        using var connection = CreateConnection();

        var rows = await connection.QueryAsync<MenuDinamicoRow>(
            "dbo.sp_Seguridad_ObtenerMenuDinamico",
            new
            {
                IdUsuario = idUsuario,
                IdPerfil = idPerfil,
                IdRol = idRol
            },
            commandType: CommandType.StoredProcedure
        );

       return BuildMenusFromDynamicRows(rows);
    }

    public async Task<IEnumerable<MenuDto>> ListarPorUsuarioAsync(string idUsuario)
    {
        using var connection = CreateConnection();

        var menus = (await connection.QueryAsync<MenuDto>(
            """
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
            WHERE m.EsActivo = 1
              AND m.EsVisible = 1
            """
        )).ToDictionary(m => m.IdMenu);

        var assignedMenuIds = (await connection.QueryAsync<int>(
            """
            SELECT DISTINCT prm.IdMenu
            FROM dbo.Usuario u
            INNER JOIN dbo.SegUsuarioPerfilRol upr
                ON u.IdUsuario = upr.IdUsuario
               AND upr.EsActivo = 1
            INNER JOIN dbo.SegPerfilRol pr
                ON upr.IdPerfilRol = pr.IdPerfilRol
               AND pr.EsActivo = 1
            INNER JOIN dbo.SegPerfilRolMenu prm
                ON pr.IdPerfil = prm.IdPerfil
               AND pr.IdRol = prm.IdRol
               AND prm.EsActivo = 1
            WHERE u.IdUsuario = @IdUsuario
            """,
            new { IdUsuario = idUsuario }
        )).ToHashSet();

        var visibleMenuIds = new HashSet<int>(assignedMenuIds);

        foreach (var menuId in assignedMenuIds)
        {
            var currentId = menuId;

            while (menus.TryGetValue(currentId, out var current) && current.IdMenuPadre.HasValue)
            {
                var parentId = current.IdMenuPadre.Value;

                if (!visibleMenuIds.Add(parentId))
                    break;

                currentId = parentId;
            }
        }

        return menus.Values
            .Where(m => visibleMenuIds.Contains(m.IdMenu))
            .OrderBy(m => m.NivelMenu)
            .ThenBy(m => m.OrdenMenu)
            .ThenBy(m => m.IdMenu)
            .ToList();
    }

    public async Task<int> CrearMenuAsync(CrearMenuPrincipalRequest request, string usuario)
    {
        using var connection = CreateConnection();

        var esNodoPrincipal = !request.IdMenuPadre.HasValue;

        var creado = await connection.QueryFirstOrDefaultAsync<MenuDto>(
            "dbo.sp_SegMenu_Crear",
            new
            {
                request.IdMenuPadre,
                request.NombreMenu,
                Ruta = string.IsNullOrWhiteSpace(request.Ruta) ? null : request.Ruta,
                request.Icono,
                request.OrdenMenu,
                request.CodigoMenu,
                request.EsVisible,
                request.EsActivo,
                EsNodoPrincipal = esNodoPrincipal,
                UsuarioCreacion = usuario
            },
            commandType: CommandType.StoredProcedure
        );

        if (creado is null)
            throw new InvalidOperationException("No se pudo crear el menú.");

        return creado.IdMenu;
    }

    public async Task<IEnumerable<MenuDto>> ListarAsignadoPorPerfilRolAsync(int idPerfil, int idRol)
    {
        using var connection = CreateConnection();

        var result = await connection.QueryAsync<MenuDto>(
            "dbo.sp_SegPerfilRolMenu_ListarAsignado",
            new { IdPerfil = idPerfil, IdRol = idRol },
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task GuardarAsignacionPerfilRolAsync(int idPerfil, int idRol, IEnumerable<MenuAsignadoDto> menus, string usuario)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();

        try
        {
            await connection.ExecuteAsync(
                "dbo.sp_SegPerfilRolMenu_EliminarPorPerfilRol",
                new { IdPerfil = idPerfil, IdRol = idRol },
                transaction: transaction,
                commandType: CommandType.StoredProcedure
            );

            foreach (var menu in menus.DistinctBy(x => x.IdMenu))
            {
                await connection.ExecuteAsync(
                    "dbo.sp_SegPerfilRolMenu_Insertar",
                    new
                    {
                        IdPerfil = idPerfil,
                        IdRol = idRol,
                        IdMenu = menu.IdMenu,
                        Acceso = menu.Acceso,
                        UsuarioCreacion = usuario
                    },
                    transaction: transaction,
                    commandType: CommandType.StoredProcedure
                );
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task GuardarUsuarioPerfilRolAsync(string idUsuario, int idPerfil, int idRol, string usuario)
    {
        using var connection = CreateConnection();

        var idPerfilRol = await connection.QueryFirstOrDefaultAsync<int?>(
            """
            SELECT TOP 1 pr.IdPerfilRol
            FROM dbo.SegPerfilRol pr
            WHERE pr.IdPerfil = @IdPerfil
              AND pr.IdRol = @IdRol
              AND ISNULL(pr.EsActivo, 1) = 1
            """,
            new { IdPerfil = idPerfil, IdRol = idRol }
        );

        if (!idPerfilRol.HasValue)
            throw new InvalidOperationException("No existe una relación activa Perfil-Rol para los datos seleccionados.");

        await connection.ExecuteAsync(
            "dbo.sp_SegUsuarioPerfilRol_Insertar",
            new
            {
                IdUsuario = idUsuario,
                IdPerfilRol = idPerfilRol.Value,
                UsuarioCreacion = usuario
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> SincronizarPerfilUsuarioAsync(int idPerfil, string idUsuario)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();

        try
        {
            var asignaciones = await connection.QueryAsync<(int IdRol, int IdMenu, int Acceso)>(
                """
                SELECT DISTINCT
                    pr.IdRol,
                    prm.IdMenu,
                    prm.Acceso
                FROM dbo.SegPerfilRol pr
                INNER JOIN dbo.SegPerfilRolMenu prm
                    ON pr.IdPerfil = prm.IdPerfil
                   AND pr.IdRol = prm.IdRol
                WHERE pr.IdPerfil = @IdPerfil
                  AND ISNULL(pr.EsActivo, 1) = 1
                  AND ISNULL(prm.EsActivo, 1) = 1
                """,
                new { IdPerfil = idPerfil },
                transaction: transaction
            );

            var total = 0;

            foreach (var asignacion in asignaciones)
            {
                await connection.ExecuteAsync(
                    "dbo.sp_SegPerfilRolMenu_Insertar",
                    new
                    {
                        IdPerfil = idPerfil,
                        IdRol = asignacion.IdRol,
                        IdMenu = asignacion.IdMenu,
                        Acceso = asignacion.Acceso,
                        UsuarioCreacion = idUsuario
                    },
                    transaction: transaction,
                    commandType: CommandType.StoredProcedure
                );

                total++;
            }

            transaction.Commit();
            return total;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private static IEnumerable<MenuDto> BuildMenusFromDynamicRows(IEnumerable<MenuDinamicoRow> rows)
    {
        var menuMap = new Dictionary<int, MenuDto>();

        // Nivel 1
        foreach (var group in rows.GroupBy(r => r.IdMenuNivel1))
        {
            var row = group.First();
            int acceso = row.Acceso ?? 0;
            if (row.IdMenuNivel1 > 0 && !menuMap.ContainsKey(row.IdMenuNivel1))
            {
                menuMap[row.IdMenuNivel1] = new MenuDto
                {
                    IdMenu = row.IdMenuNivel1,
                    IdMenuPadre = null,
                    NombreMenu = row.MenuNivel1 ?? string.Empty,
                    Ruta = null,
                    Icono = row.IconoNivel1,
                    OrdenMenu = row.OrdenNivel1 ?? 0,
                    NivelMenu = 0,
                    CodigoMenu = null,
                    Acceso = acceso
                };
            }
        }

        // Nivel 2
        foreach (var group in rows.Where(r => r.IdMenuNivel2.HasValue).GroupBy(r => r.IdMenuNivel2.Value))
        {
            // Buscar la fila donde el id del menú de nivel 2 coincide exactamente
            var row = group.FirstOrDefault(r => r.IdMenuNivel2 == r.IdMenuNivel2);
            if (row == null) continue;
            int acceso = row.Acceso ?? 0;
            if (!menuMap.ContainsKey(row.IdMenuNivel2.Value))
            {
                menuMap[row.IdMenuNivel2.Value] = new MenuDto
                {
                    IdMenu = row.IdMenuNivel2.Value,
                    IdMenuPadre = row.IdMenuNivel1,
                    NombreMenu = row.MenuNivel2 ?? string.Empty,
                    Ruta = null,
                    Icono = row.IconoNivel2,
                    OrdenMenu = row.OrdenNivel2 ?? 0,
                    NivelMenu = 1,
                    CodigoMenu = null,
                    Acceso = acceso
                };
            }
        }

        // Nivel 3
        foreach (var group in rows.Where(r => r.IdMenuNivel3.HasValue).GroupBy(r => r.IdMenuNivel3.Value))
        {
            // Buscar la fila donde el id del menú de nivel 3 coincide exactamente
            var row = group.FirstOrDefault(r => r.IdMenuNivel3 == r.IdMenuNivel3);
            if (row == null) continue;
            int acceso = row.Acceso ?? 0;
            var parentId = row.IdMenuNivel2 ?? row.IdMenuNivel1;
            if (!menuMap.ContainsKey(row.IdMenuNivel3.Value))
            {
                menuMap[row.IdMenuNivel3.Value] = new MenuDto
                {
                    IdMenu = row.IdMenuNivel3.Value,
                    IdMenuPadre = parentId,
                    NombreMenu = row.MenuNivel3 ?? string.Empty,
                    Ruta = row.RutaNivel3,
                    Icono = row.IconoNivel3,
                    OrdenMenu = row.OrdenNivel3 ?? 0,
                    NivelMenu = row.IdMenuNivel2.HasValue ? 2 : 1,
                    CodigoMenu = null,
                    Acceso = acceso
                };
            }
        }

        return menuMap.Values
            .OrderBy(m => m.NivelMenu)
            .ThenBy(m => m.OrdenMenu)
            .ThenBy(m => m.IdMenu)
            .ToList();
    }
}
