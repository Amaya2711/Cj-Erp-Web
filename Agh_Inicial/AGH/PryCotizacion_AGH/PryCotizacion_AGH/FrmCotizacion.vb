Imports System.Security.Cryptography
Imports CrystalDecisions.CrystalReports.Engine
Imports CrystalDecisions.Shared

Public Class FrmCotizacion
    Public Comando As Odbc.OdbcCommand
    Public adaptador As Odbc.OdbcDataAdapter
    Public MiReporte As Object


    Public Sub ValidarCliente()

        'Dim daC As New OleDb.OleDbDataAdapter("select nombre_cli, RUC, Direccion_cli , " &
        '                                      " Telefono_cli, estado_cli from cliente where RUC = '" &
        ' txtRuc.Text & "'", Conexion)
        Dim daC As New Odbc.OdbcDataAdapter("select nombre_cli, RUC, Direccion_cli , " &
                                             " Telefono_cli, estado_cli from cliente where RUC = '" &
                                        txtRuc.Text & "'", Cnx.cnx)
        Dim dsC As New DataSet
        daC.Fill(dsC)
        If dsC.Tables(0).Rows.Count > 0 Then
            MsgBox("Nro de RUC Ya existe")
            txtCliente.Text = dsC.Tables(0).Rows(0).Item("nombre_cli").ToString
            'TxtRuc.Text = dsC.Tables(0).Rows(0).Item(2).ToString
            txtDireccion.Text = dsC.Tables(0).Rows(0).Item("Direccion_cli").ToString
            ChkEliminado.Checked = dsC.Tables(0).Rows(0).Item("Estado_cli").ToString
        Else
            GrabarRegistro()
        End If
    End Sub
    Private Sub GrabarRegistro()
        If txtCliente.Text = String.Empty Then
            MsgBox("Debe ingresar nombre del cliente")
            Exit Sub
        End If
        If txtRuc.Text = String.Empty Then
            MsgBox("Debe ingresar nro de RUC")
            Exit Sub
        End If
        If txtDireccion.Text = String.Empty Then
            MsgBox("Debe ingresar direccion del cliente")
            Exit Sub
        End If

        'Dim dbacL As New OleDb.OleDbDataAdapter("select * from cliente where ruc = '" &
        Dim dbacL As New Odbc.OdbcDataAdapter("select * from cliente where ruc = '" &
                    txtRuc.Text & "'", Cnx.cnx)
        Dim dsbcl As New DataSet
        dbacL.Fill(dsbcl)
        If dsbcl.Tables(0).Rows.Count > 0 Then
            MsgBox("Datos de cliente YA EXISTE")
            LimpiarTxt()
            txtCliente.Focus()
            Exit Sub
        End If

        '        Dim cmdI As New OleDb.OleDbCommand("insert into cliente (Nombre_Cli, RUC, Direccion_Cli, Telefono_Cli)  values ('" &

        Dim cmdI As New Odbc.OdbcCommand("insert into cliente (Nombre_Cli, RUC, Direccion_Cli, Telefono_Cli)  values ('" &
                                             txtCliente.Text.ToUpper & "','" & txtRuc.Text &
                                             "','" & txtDireccion.Text & "','" & txtTelefono.Text & "')", Cnx.cnx)
        'cmdI.Parameters.Add("parametro", OleDb.OleDbType).Value = valor
        cmdI.ExecuteNonQuery()

        CargarGrid()
    End Sub

    Public Sub CargarGrid()
        Dim da As New Odbc.OdbcDataAdapter("select * from cliente", Cnx.cnx)
        Dim ds As New DataSet
        da.Fill(ds)
        If ds.Tables(0).Rows.Count > 0 Then
            DtgCliente.DataSource = ds.Tables(0)
            DtgCliente.Columns(0).Visible = False

            DtgCliente.Columns(1).HeaderText = "Cliente"
            DtgCliente.Columns(2).HeaderText = "RUC"
            DtgCliente.Columns(3).HeaderText = "Direccion"
            DtgCliente.Columns(4).HeaderText = "Telefono"
            DtgCliente.Columns(5).HeaderText = "Estado"
            DtgCliente.AllowUserToAddRows = False
        Else
            DtgCliente.DataSource = Nothing
        End If
        txtruceli.Text = ""
        'DtgCliente.Columns(1).HeaderText = "Cliente"
        'DtgCliente.Columns(2).HeaderText = "RUC"
        'DtgCliente.Columns(3).HeaderText = "Direccion"
        'DtgCliente.Columns(4).HeaderText = "Telefono"
        'DtgCliente.Columns(5).HeaderText = "Estado"
        'DtgCliente.AllowUserToAddRows = False
    End Sub

    Private Sub FrmCliente_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        'AbrirCnx()
        Cnx.AbrirConexion()
        CargarGrid()
        LimpiarTxt()
        Correlativo()
    End Sub

    Public Sub Nuevo()
        LimpiarTxt()
        CargarGrid()
        Correlativo()
    End Sub

    Public Sub Correlativo()
        Dim daCo As New Odbc.OdbcDataAdapter("select max(correlativo) + 1 from cotizacion ", Cnx.cnx)
        Dim dsCo As New DataSet
        daCo.Fill(dsCo)
        If dsCo.Tables(0).Rows.Count > 0 Then
            lblCorrelativo.Text = dsCo.Tables(0).Rows(0).Item(0).ToString
            If lblCorrelativo.Text = "" Then
                lblCorrelativo.Text = "1"
            End If
        Else
            lblCorrelativo.Text = "1"
        End If

        If DtgDetalle.Rows.Count > 0 Then
            Dim CtaF As Integer = 1
            While DtgDetalle.Rows.Count > 1
                DtgDetalle.Rows.Remove(DtgDetalle.Rows(CtaF))
            End While
            DtgDetalle.Rows.Remove(DtgDetalle.Rows(0))
        End If
        VerPrint()
    End Sub

    Public Sub LimpiarTxt()
        txtCliente.Text = String.Empty
        txtDireccion.Text = String.Empty
        txtRuc.Text = String.Empty
        txtruceli.Text = String.Empty
        txtTelefono.Text = String.Empty
        ChkEliminado.Checked = False
        lblFecha.Text = Date.Now.Date

        If DtgCliente.Rows.Count > 0 Then
            DtgCliente.Columns(1).Width = 220
            DtgCliente.Columns(2).Width = 105
            DtgCliente.Columns(3).Width = 220
            DtgCliente.Columns(4).Width = 85
            DtgCliente.Columns(5).Width = 60
        End If
        'CrReporte.ShowGroupTreeButton = False
        LimpiarTxtCot()
        TabControl1.SelectedTab = TabPage1
        TabControl2.SelectedTab = TabPage3
    End Sub
    Public Sub LimpiarTxtCot()
        CargarPago()
        CargarMoneda()
        lblSubtotal.Text = 0
        lblIgv.Text = 0
        lblTotal.Text = 0
        lblYear.Text = Year(Now)
        lblIdcliente.Text = String.Empty
        Correlativo()
    End Sub
    Public Sub BuscarCliente()
        Dim dba As New Odbc.OdbcDataAdapter("select * from cliente where Nombre_cli like '%" &
            txtCliente.Text & "%'", Cnx.cnx)
        Dim dsb As New DataSet
        dba.Fill(dsb)
        If dsb.Tables(0).Rows.Count > 0 Then
            DtgCliente.DataSource = dsb.Tables(0)
            DtgCliente.Columns(0).Visible = False
            If dsb.Tables(0).Rows.Count = 1 Then
                txtCliente.Text = dsb.Tables(0).Rows(0).Item("nombre_cli").ToString
                txtRuc.Text = dsb.Tables(0).Rows(0).Item("RUC").ToString
                txtDireccion.Text = dsb.Tables(0).Rows(0).Item("Direccion_cli").ToString
                ChkEliminado.Checked = dsb.Tables(0).Rows(0).Item("Estado_cli").ToString
                lblIdcliente.Text = dsb.Tables(0).Rows(0).Item("Id").ToString
                BuscarRegistrosCliente()
            Else
                LimpiarTxt()
            End If
            Correlativo()
        Else
            MsgBox("No existen registros con esas coincidencias de busqueda")
            LimpiarTxt()
            txtCliente.Focus()
        End If
        txtruceli.Text = ""

    End Sub

    Public Sub BuscarRegistrosCliente()
        Dim dbRc As New Odbc.OdbcDataAdapter("select b.nombre_cli,a.correlativo,a.año,a.fecha, a.subtotal,a.igv,a.total " &
            " from cotizacion a,cliente b " &
            " where a.id_cliente = b.id and  a.id_cliente = " &
            lblIdcliente.Text & "", Cnx.cnx)
        Dim dsRc As New DataSet
        dbRc.Fill(dsRc)


        If dsRc.Tables(0).Rows.Count > 0 Then
            DtgListadoCliente.DataSource = dsRc.Tables(0)
            DtgListadoCliente.Columns(0).HeaderText = "Cliente"
            DtgListadoCliente.Columns(1).HeaderText = "Correlativo"
            DtgListadoCliente.Columns(2).HeaderText = "Año"
            DtgListadoCliente.Columns(3).HeaderText = "Fecha"
            DtgListadoCliente.Columns(4).HeaderText = "Subtotal"
            DtgListadoCliente.Columns(5).HeaderText = "Igv"
            DtgListadoCliente.Columns(6).HeaderText = "Total"

            DtgListadoCliente.Columns(0).Width = 200
            DtgListadoCliente.Columns(1).Width = 70
            DtgListadoCliente.Columns(2).Width = 50
            DtgListadoCliente.Columns(3).Width = 80
            DtgListadoCliente.Columns(4).Width = 60
            DtgListadoCliente.Columns(5).Width = 60
            DtgListadoCliente.Columns(6).Width = 70

            'DtgListadoCliente.Columns(0).Visible = False
            'txtCliente.Text = dsRc.Tables(0).Rows(0).Item("nombre_cli").ToString
            'txtRuc.Text = dsRc.Tables(0).Rows(0).Item("RUC").ToString
            'txtDireccion.Text = dsRc.Tables(0).Rows(0).Item("Direccion_cli").ToString
            'ChkEliminado.Checked = dsRc.Tables(0).Rows(0).Item("Estado_cli").ToString
            'lblIdcliente.Text = dsRc.Tables(0).Rows(0).Item("Id").ToString

            'Correlativo()
        Else
            'MsgBox("No existen registros con esas coincidencias de busqueda")
            'LimpiarTxt()
            'txtCliente.Focus()
        End If
        txtruceli.Text = txtRuc.Text

    End Sub

    Public Sub CargarPago()
        Dim dbP As New Odbc.OdbcDataAdapter("select * from tipo_pago", Cnx.cnx)
        Dim dsP As New DataSet
        dbP.Fill(dsP)
        If dsP.Tables(0).Rows.Count > 0 Then
            CmbPago.DataSource = dsP.Tables(0)
            CmbPago.DisplayMember = "Forma_pago"
            CmbPago.ValueMember = "Id"

        End If

    End Sub

    Public Sub CargarMoneda()
        Dim dbM As New Odbc.OdbcDataAdapter("select * from moneda", Cnx.cnx)
        Dim dsM As New DataSet
        dbM.Fill(dsM)
        If dsM.Tables(0).Rows.Count > 0 Then
            CmbMoneda.DataSource = dsM.Tables(0)
            CmbMoneda.DisplayMember = "Tipo_moneda"
            CmbMoneda.ValueMember = "Id"

        End If

    End Sub

    Private Sub ModificarRegistro()
        If txtruceli.Text = "" Then
            MsgBox("Seleccionar registro a modificar")
            Exit Sub
        End If
        Dim res = MsgBox("¿Desea actualizar los datos del RUC" & txtruceli.Text & "?", MsgBoxStyle.YesNo, "Responder")
        If res = MsgBoxResult.No Then
            Exit Sub
        End If

        Dim cmdA As New Odbc.OdbcCommand("update cliente set Nombre_Cli = '" & txtCliente.Text &
                                           "', RUC ='" & txtRuc.Text & "', Direccion_Cli = '" & txtDireccion.Text &
                                           "', Telefono_Cli = '" & txtTelefono.Text & "', Estado_Cli = " & ChkEliminado.Checked &
                                           " where RUC = '" & txtruceli.Text & "'", Cnx.cnx)
        'cmdI.Parameters.Add("parametro", OleDb.OleDbType).Value = valor
        cmdA.ExecuteNonQuery()

        CargarGrid()
    End Sub

    Private Sub EliminarRegistro()
        If txtruceli.Text = "" Then
            MsgBox("Seleccionar registro a eliminar")
            Exit Sub
        End If
        Dim res = MsgBox("¿Desea ELIMINAR los datos del RUC" & txtruceli.Text & "?", MsgBoxStyle.YesNo, "Responder")
        If res = MsgBoxResult.No Then
            Exit Sub
        End If


        Dim cmdE As New Odbc.OdbcCommand("update cliente set Estado_Cli = 1 where RUC = '" & txtRuc.Text & "'", Cnx.cnx)
        'Dim cmdI As New OleDb.OleDbCommand("delete from cliente where RUC = '" & TxtRuc.Text & "'", Conexion)

        'cmdI.Parameters.Add("parametro", OleDb.OleDbType).Value = valor
        cmdE.ExecuteNonQuery()

        CargarGrid()
    End Sub

    Private Sub GrabarCotizacion()
        'Dim report As New ReportDocument
        If lblIdcliente.Text = String.Empty Or Val(lblIdcliente.Text) = 0 Then
            MsgBox("No hay cliente seleccionado")
            Exit Sub
        End If

        If DtgDetalle.Rows.Count <= 0 Then
            MsgBox("No existen detalles ingresados")
            Exit Sub
        End If

        Dim res = MsgBox("¿Desea ACEPTAR la cotizacion?", MsgBoxStyle.YesNo, "Responder")
        If res = MsgBoxResult.No Then
            MsgBox("Cotizacion no aceptada")
            Exit Sub
        End If

        Dim dbBcl As New Odbc.OdbcDataAdapter("select * from cotizacion where correlativo = " &
            Val(lblCorrelativo.Text) & " and año = " & Val(lblYear.Text) & "", Cnx.cnx)
        Dim dsBcl As New DataSet
        dbBcl.Fill(dsBcl)
        If dsBcl.Tables(0).Rows.Count > 0 Then
            MsgBox("Documento ya existe")
            Exit Sub
        End If

        Dim cmdCo As New Odbc.OdbcCommand("insert into cotizacion (Correlativo,Año,Id_Cliente,Fecha,Pago,Moneda,Valido," &
                                            "entrega,Subtotal,IGV,Total,DiasCredito) values ('" &
                                             (lblCorrelativo.Text) & "','" & (lblYear.Text) &
                                             "','" & (lblIdcliente.Text) & "','" & Now.Date & "','" &
                                             (CmbPago.SelectedValue) & "','" & (CmbMoneda.SelectedValue) &
                                             "','" & (txtValido.Text) & "','" & (txtEntrega.Text) &
                                             "','" & (lblSubtotal.Text) & "','" & (lblIgv.Text) & "','" &
                                             (lblTotal.Text) & "'," & TxtDiascredito.Text & ")", Cnx.cnx)
        'cmdI.Parameters.Add("parametro", OleDb.OleDbType).Value = valor
        cmdCo.ExecuteNonQuery()

        Dim FilaD As Integer = 0
        For Each row As DataGridViewRow In Me.DtgDetalle.Rows
            Dim cmdDe As New Odbc.OdbcCommand("insert into Detalle_cotizacion (Correlativo,Año,Cantidad,Descripcion," &
                                            "precioUnitario,Total) values ('" &
                                             (lblCorrelativo.Text) & "','" & (lblYear.Text) &
                                             "','" & (DtgDetalle.Rows(FilaD).Cells(0).Value) &
                                             "','" & (DtgDetalle.Rows(FilaD).Cells(1).Value) &
                                             "','" & (DtgDetalle.Rows(FilaD).Cells(2).Value) &
                                             "','" & (DtgDetalle.Rows(FilaD).Cells(3).Value) & "')", Cnx.cnx)
            'cmdI.Parameters.Add("parametro", OleDb.OleDbType).Value = valor
            cmdDe.ExecuteNonQuery()

            FilaD = FilaD + 1
        Next
        VerPrint()
        TabControl1.SelectedTab = TabImpresion ' ("TabPage2")
        'MsgBox("Cotizacion creada")
        VerPrint()
        BuscarRegistrosCliente()
    End Sub

    Private Sub AgregarLinea()
        If txtCantidad.Text = String.Empty Or txtPrecio.Text = String.Empty Or txtDescripcion.Text = String.Empty Then
            MsgBox("Falta ingresar informacion del detalle")
            txtCantidad.Focus()
            Exit Sub
        End If

        DtgDetalle.Rows.Add(txtCantidad.Text, txtDescripcion.Text, txtPrecio.Text, txtTotal.Text)
        txtCantidad.Text = String.Empty
        txtPrecio.Text = String.Empty
        txtDescripcion.Text = String.Empty
        txtTotal.Text = String.Empty
        txtCantidad.Focus()
    End Sub

    Private Sub SumarGrid()
        Dim Fila As Integer = 0 'Me.DtgDetalle.CurrentCell.ColumnIndex
        Dim SumaFila As Double = 0
        For Each row As DataGridViewRow In Me.DtgDetalle.Rows
            SumaFila = SumaFila + Val(DtgDetalle.Rows(Fila).Cells(3).Value)
            Fila = Fila + 1
        Next
        Me.lblSubtotal.Text = SumaFila.ToString
        Me.lblIgv.Text = Val(SumaFila * 0.18)
        Me.lblIgv.Text = Math.Round(Val(Me.lblIgv.Text), 2)
        Me.lblTotal.Text = Val(lblIgv.Text) + Val(lblSubtotal.Text)
    End Sub

    Private Sub VerPrint()
        'TabControl2.SelectedTab = TabPage5 ' ("TabPage2")

        Dim dt As New DataTable
        MiReporte = New CryReporte

        Try
            adaptador = New Odbc.OdbcDataAdapter("SELECT Cliente.Nombre_cli, Cliente.RUC, Cliente.Direccion_Cli, Cotizacion.Correlativo, Cotizacion.Año, Cotizacion.Fecha, " &
            " Cotizacion.Valido, Cotizacion.Entrega, Cotizacion.Subtotal, Cotizacion.IGV, Cotizacion.Total, Moneda.Tipo_moneda, " &
            " Tipo_Pago.Forma_Pago, Detalle_Cotizacion.Cantidad, Detalle_Cotizacion.descripcion, Detalle_Cotizacion.PrecioUnitario, " &
            " Detalle_Cotizacion.Total as STotal, cotizacion.DiasCredito " &
            " From     Cotizacion, Moneda, Tipo_Pago, Cliente, Detalle_Cotizacion " &
            " WHERE  Cotizacion.Moneda = Moneda.Id AND Cotizacion.Pago = Tipo_Pago.Id AND Cotizacion.Id_Cliente = Cliente.Id and " &
            " cotizacion.correlativo = detalle_cotizacion.correlativo And cotizacion.año = detalle_cotizacion.año and cotizacion.correlativo =  " & lblCorrelativo.Text, Cnx.cnx)
            Dim dsRpt As New DataSet
            adaptador.Fill(dsRpt)


            adaptador.Fill(dt)
            MiReporte.SetDataSource(dt)

            CrReporte.ReportSource = MiReporte 'Mainform.MIreporte 'oReport
            CrReporte.Refresh()

        Catch ex As Exception

        End Try
        'Dim oReport As New ReportDocument
        'oReport.Load("C:\Users\pc\source\repos\PryCotizacion_AGH\CryReportes\CryCotizacion.rpt")
        'oReport.SetParameterValue("pCorre", lblCorrelativo.Text)

        'CrReporte.ReportSource = oReport
        'CrReporte.Refresh()



        ''Dim crystalrpt As New ReportDocument()
        ''crystalrpt.Load("C:\Users\Samuel Susana\Documents\Visual Studio 2015\Projects\SistemadeventaPOO\SistemadeventaPOO\CrystalReportclientes.rpt")
        ''CrystalReportViewer1.ReportSource = crystalrpt
        ''CrystalReportViewer1.Refresh()
    End Sub

    Private Sub MnuGrabar_Click(sender As Object, e As EventArgs)
        ValidarCliente()
    End Sub

    Private Sub MnuEliminar_Click(sender As Object, e As EventArgs)
        EliminarRegistro()
    End Sub

    Private Sub DtgCliente_CellDoubleClick(sender As Object, e As DataGridViewCellEventArgs) Handles DtgCliente.CellDoubleClick
        txtCliente.Text = DtgCliente.Rows(e.RowIndex).Cells(1).Value
        txtRuc.Text = DtgCliente.Rows(e.RowIndex).Cells(2).Value
        txtDireccion.Text = DtgCliente.Rows(e.RowIndex).Cells(3).Value
        txtTelefono.Text = DtgCliente.Rows(e.RowIndex).Cells(4).Value
        ChkEliminado.Checked = DtgCliente.Rows(e.RowIndex).Cells(5).Value
        txtruceli.Text = txtRuc.Text 'Dato para borrar
        lblIdcliente.Text = DtgCliente.Rows(e.RowIndex).Cells(0).Value
        BuscarRegistrosCliente()
        Correlativo()
        If DtgListadoCliente.Rows.Count > 0 Then TabControl2.SelectedTab = TabPage4
    End Sub

    Private Sub MnuModificar_Click(sender As Object, e As EventArgs)
        ModificarRegistro()
    End Sub

    Private Sub BtnBuscar_Click(sender As Object, e As EventArgs) Handles BtnBuscar.Click
        BuscarCliente()
    End Sub

    Private Sub mnuNuevo_Click(sender As Object, e As EventArgs)
        Nuevo()
    End Sub

    Private Sub BtnAdd_Click(sender As Object, e As EventArgs)
        AgregarLinea()
    End Sub

    Private Sub txtCantidad_KeyPress(sender As Object, e As KeyPressEventArgs) Handles txtCantidad.KeyPress
        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 48 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If

    End Sub

    Private Sub txtPrecio_KeyPress(sender As Object, e As KeyPressEventArgs) Handles txtPrecio.KeyPress

        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 46 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If
    End Sub

    Private Sub txtRuc_KeyPress(sender As Object, e As KeyPressEventArgs) Handles txtRuc.KeyPress
        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 48 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If

    End Sub


    Private Sub txtEntrega_KeyPress(sender As Object, e As KeyPressEventArgs) Handles txtEntrega.KeyPress
        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 48 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If

    End Sub

    Private Sub txtValido_KeyPress(sender As Object, e As KeyPressEventArgs) Handles txtValido.KeyPress
        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 48 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If

    End Sub

    Private Sub txtCantidad_LostFocus(sender As Object, e As EventArgs) Handles txtCantidad.LostFocus
        txtTotal.Text = Val(txtCantidad.Text) * Val(txtPrecio.Text)
    End Sub

    Private Sub txtPrecio_LostFocus(sender As Object, e As EventArgs) Handles txtPrecio.LostFocus
        txtTotal.Text = Val(txtCantidad.Text) * Val(txtPrecio.Text)
    End Sub



    Private Sub DtgDetalle_RowsAdded(sender As Object, e As DataGridViewRowsAddedEventArgs) Handles DtgDetalle.RowsAdded
        SumarGrid()
    End Sub

    Private Sub DtgDetalle_RowsRemoved(sender As Object, e As DataGridViewRowsRemovedEventArgs) Handles DtgDetalle.RowsRemoved
        SumarGrid()
    End Sub

    Private Sub MnuAdd_Click(sender As Object, e As EventArgs) Handles MnuAdd.Click
        GrabarCotizacion()
    End Sub

    Private Sub btnNew_Click(sender As Object, e As EventArgs) Handles btnNew.Click
        Correlativo()
    End Sub

    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click
        AgregarLinea()
    End Sub

    Private Sub BtnGrabar_Click(sender As Object, e As EventArgs) Handles BtnGrabar.Click
        GrabarRegistro()
    End Sub

    Private Sub BtnEliminar_Click(sender As Object, e As EventArgs) Handles BtnEliminar.Click
        EliminarRegistro()
    End Sub

    Private Sub BtnModificar_Click(sender As Object, e As EventArgs) Handles BtnModificar.Click
        ModificarRegistro()
    End Sub

    Private Sub BtnNuevo_Click(sender As Object, e As EventArgs) Handles BtnNuevo.Click
        Nuevo()
    End Sub

    Private Sub BtnAdd_Click_1(sender As Object, e As EventArgs) Handles BtnAdd.Click
        GrabarCotizacion()
    End Sub

    Private Sub BtnNewRegistro_Click(sender As Object, e As EventArgs) Handles BtnNewRegistro.Click
        LimpiarTxtCot()
    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs)
        VerPrint()
    End Sub



    Private Sub DtgListadoCliente_CellDoubleClick(sender As Object, e As DataGridViewCellEventArgs) Handles DtgListadoCliente.CellDoubleClick
        lblCorrelativo.Text = DtgListadoCliente.Rows(e.RowIndex).Cells(1).Value
        lblYear.Text = DtgListadoCliente.Rows(e.RowIndex).Cells(2).Value
        VerPrint()
        TabControl1.SelectedTab = TabImpresion ' ("TabPage2")

    End Sub

    Private Sub TabControl1_Click(sender As Object, e As EventArgs) Handles TabControl1.Click
        Correlativo()
    End Sub


    Private Sub TxtDiascredito_KeyPress(sender As Object, e As KeyPressEventArgs) Handles TxtDiascredito.KeyPress
        '97 - 122 = Ascii codes for simple letters
        '65 - 90  = Ascii codes for capital letters
        '48 - 57  = Ascii codes for numbers

        If Asc(e.KeyChar) <> 8 Then
            If Asc(e.KeyChar) < 48 Or Asc(e.KeyChar) > 57 Then
                e.Handled = True
            End If
        End If
    End Sub

    Private Sub CmbPago_SelectedIndexChanged(sender As Object, e As EventArgs) Handles CmbPago.SelectedIndexChanged
        If CmbPago.Text = "Credito" Then
            TxtDiascredito.Enabled = True
            TxtDiascredito.Text = "7"
        Else
            TxtDiascredito.Enabled = False
            TxtDiascredito.Text = "0"
        End If
    End Sub

    Private Sub SplitContainer1_SplitterMoved(sender As Object, e As SplitterEventArgs) Handles SplitContainer1.SplitterMoved

    End Sub

    Private Sub DtgCliente_CellContentClick(sender As Object, e As DataGridViewCellEventArgs) Handles DtgCliente.CellContentClick

    End Sub

    Private Sub DtgListadoCliente_CellContentClick(sender As Object, e As DataGridViewCellEventArgs) Handles DtgListadoCliente.CellContentClick

    End Sub
End Class
