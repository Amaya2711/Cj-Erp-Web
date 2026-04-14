IF OBJECT_ID('dbo.SegRolMenuPermiso', 'U') IS NOT NULL
    DROP TABLE dbo.SegRolMenuPermiso;
GO

CREATE TABLE dbo.SegRolMenuPermiso
(
    IdRolMenuPermiso     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    IdRol                INT NOT NULL,
    IdMenu               INT NOT NULL,

    PuedeVer             BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeVer DEFAULT(0),
    PuedeCrear           BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeCrear DEFAULT(0),
    PuedeEditar          BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeEditar DEFAULT(0),
    PuedeEliminar        BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeEliminar DEFAULT(0),
    PuedeAprobar         BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeAprobar DEFAULT(0),
    PuedeExportar        BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_PuedeExportar DEFAULT(0),

    Estado               BIT NOT NULL CONSTRAINT DF_SegRolMenuPermiso_Estado DEFAULT(1),
    UsuarioCreacion      NVARCHAR(50) NULL,
    FechaCreacion        DATETIME NOT NULL CONSTRAINT DF_SegRolMenuPermiso_FechaCreacion DEFAULT(GETDATE()),
    UsuarioActualizacion NVARCHAR(50) NULL,
    FechaActualizacion   DATETIME NULL
);
GO