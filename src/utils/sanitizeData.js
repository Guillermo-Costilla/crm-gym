export function sanitizeClienteData(data) {
  return {
    nombre: data.nombre?.trim() || null,
    email: data.email?.trim() || null,
    telefono: data.telefono?.trim() || null,
    fecha_nacimiento: data.fecha_nacimiento || null,
    dni: data.dni ? parseInt(data.dni, 10) : null
  }
}

export function sanitizePagoData(data) {
  return {
    cliente_id: data.cliente_id ? parseInt(data.cliente_id, 10) : null,
    monto: data.monto ? parseFloat(data.monto) : null,
    metodo: data.metodo?.trim() || null,
    tipo: data.tipo || null,
    fecha_pago: data.fecha_pago || null,
    pagado: data.pagado ? 1 : 0,
  }
}
