using Microsoft.Extensions.Logging;
using System.Text.Json;

public static class ILoggerExtensions
{
    public static void LogObject<T>(this ILogger logger, LogLevel level, string message, T obj)
    {
        var json = JsonSerializer.Serialize(obj, new JsonSerializerOptions { WriteIndented = true });
        logger.Log(level, $"{message}: {json}");
    }
}
