Imports System.Data.Odbc
Public Class Cnx
    Public Shared cnx As OdbcConnection

    Public Shared Sub AbrirConexion()
        cnx = New OdbcConnection
        cnx.ConnectionString = "Dsn=Bd_AGH;uid=Admin;"
        cnx.Open()
    End Sub
End Class
