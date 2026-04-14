DECLARE 
    @IdCarga INT,
    @IdCliente INT,
    @IdProyectoOrigenA INT,
    @IdProyectoDestinoA INT,
    @IdSiteOrigen VARCHAR(50),
    @CorreSiteOrigen INT,
    @NombreProyectoImportar VARCHAR(200),
    @NombreProyectoImportar2 VARCHAR(200),
    @Tipo_Trabajo VARCHAR(50);

WHILE EXISTS (SELECT 1 FROM dbo.CargaProyectoMasiva WHERE Procesado = 0)
BEGIN
    SELECT TOP 1
        @IdCarga = IdCarga,
        @IdCliente = IdCliente,
        @IdProyectoOrigenA = IdProyectoOrigenA,
        @IdProyectoDestinoA = IdProyectoDestinoA,
        @IdSiteOrigen = IdSiteOrigen,
        @CorreSiteOrigen = CorreSiteOrigen,
        @NombreProyectoImportar = NombreProyectoImportar,
        @NombreProyectoImportar2 = NombreProyectoImportar2,
        @Tipo_Trabajo = Tipo_Trabajo
    FROM dbo.CargaProyectoMasiva
    WHERE Procesado = 0
    ORDER BY IdCarga;

    BEGIN TRY
        EXEC dbo.sp_ActualizarProyectoTablas_Parametrizado
            @IdCliente = @IdCliente,
            @IdProyectoOrigenA = @IdProyectoOrigenA,
            @IdProyectoDestinoA = @IdProyectoDestinoA,
            @IdSiteOrigen = @IdSiteOrigen,
            @CorreSiteOrigen = @CorreSiteOrigen,
            @NombreProyectoImportar = @NombreProyectoImportar,
            @NombreProyectoImportar2 = @NombreProyectoImportar2,
            @Tipo_Trabajo = @Tipo_Trabajo;

        UPDATE dbo.CargaProyectoMasiva
        SET Procesado = 1,
            Observacion = 'OK'
        WHERE IdCarga = @IdCarga;
    END TRY
    BEGIN CATCH
        UPDATE dbo.CargaProyectoMasiva
        SET Procesado = 1,
            Observacion = ERROR_MESSAGE()
        WHERE IdCarga = @IdCarga;
    END CATCH
END