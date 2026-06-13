  // Guardar todo en Firestore
  async function guardar(publicar = false) {
    setSaving(true);
    try {
      // No guardar base64 en Firestore (demasiado grande) — solo URLs https://
      const fotoAGuardar = datos.fotoHero && datos.fotoHero.startsWith('https://') 
        ? datos.fotoHero 
        : null;

      await updateEmpresa(user.uid, {
        plantillaWeb: plantillaId,
        webTitular: datos.titular,
        webDescripcion: datos.descripcion,
        webServicios: datos.servicios,
        fotoHeroPersonalizada: fotoAGuardar,
        ciudad: datos.ciudad,
        telefono: datos.telefono,
        email: datos.email,
        horario: datos.horario,
        whatsapp: datos.whatsapp,
        instagram: datos.instagram,
        webPublicada: true,
      });
      toast.success(publicar ? '🎉 ¡Web publicada con éxito!' : '✅ Cambios guardados');
      if (publicar) setPaso(3);
    } catch (err) {
      console.error('Error al guardar:', err);
      toast.error('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }