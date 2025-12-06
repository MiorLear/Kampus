# Verificar Configuración de Correo de Verificación en Firebase

## Problema: El correo se "envía" pero no llega

Si ves el mensaje `✅ Email verification sent successfully` en la consola pero no recibes el correo, sigue estos pasos:

## 1. Verificar Configuración en Firebase Console

### A. Verificar que Email/Password esté habilitado

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **kampus-21cfc**
3. Ve a **Authentication** > **Sign-in method**
4. Verifica que **Email/Password** esté **habilitado** (debe estar en verde)
5. Si no está habilitado:
   - Haz clic en **Email/Password**
   - Haz clic en **Enable**
   - Guarda los cambios

### B. Verificar Plantillas de Email

1. En Firebase Console, ve a **Authentication** > **Templates**
2. Busca la plantilla **Email address verification**
3. Verifica que esté **habilitada**
4. Revisa el **remitente (sender)** - debe ser algo como `noreply@kampus-21cfc.firebaseapp.com`
5. Si el remitente no está configurado:
   - Haz clic en **Email address verification**
   - Verifica que el remitente esté configurado
   - Guarda los cambios

### C. Verificar Dominios Autorizados

1. En Firebase Console, ve a **Authentication** > **Settings** > **Authorized domains**
2. Verifica que estos dominios estén en la lista:
   - `localhost` (para desarrollo)
   - Tu dominio de producción (si aplica)
3. Si falta algún dominio:
   - Haz clic en **Add domain**
   - Agrega el dominio
   - Guarda

## 2. Verificar Límites de Firebase

### A. Revisar Uso de Correos

1. En Firebase Console, ve a **Usage and billing**
2. Revisa el uso de **Email sends**
3. Si has alcanzado el límite:
   - **Plan Spark (Gratis)**: 100 correos/día
   - Si alcanzaste el límite, espera 24 horas o actualiza a Plan Blaze

### B. Verificar Estado del Proyecto

1. En Firebase Console, ve a **Project Settings** > **General**
2. Verifica que el proyecto esté **activo**
3. Verifica que no haya advertencias o suspensiones

## 3. Verificar el Correo

### A. Revisar Carpeta de Spam

- El correo puede estar en **spam** o **correo no deseado**
- Busca correos de `noreply@kampus-21cfc.firebaseapp.com` o `noreply@firebaseapp.com`
- Marca como "No es spam" si lo encuentras

### B. Verificar Filtros de Correo

- Algunos proveedores de correo (Gmail, Outlook) pueden filtrar correos automáticos
- Revisa la carpeta de **Promociones** (Gmail) o **Otros** (Outlook)

### C. Esperar unos Minutos

- Los correos de Firebase pueden tardar **2-5 minutos** en llegar
- No te preocupes si no llega inmediatamente

## 4. Probar el Envío Manual

### A. Enviar desde Firebase Console

1. Ve a Firebase Console > **Authentication** > **Users**
2. Busca el usuario por email (ej: `miorlear@gmail.com`)
3. Haz clic en el usuario
4. Haz clic en **Send email verification**
5. Verifica si recibes este correo

### B. Verificar Estado del Usuario

1. En la misma página del usuario
2. Verifica el campo **Email verified**
3. Si dice **No**, el correo no se ha verificado
4. Si dice **Sí**, el correo ya está verificado (puedes iniciar sesión)

## 5. Verificar Configuración del Código

### A. Revisar Logs en la Consola

Cuando registres un usuario, deberías ver estos logs:

```
🔄 Attempting to create user with email: [email]
✅ User created successfully: [uid]
📧 Sending verification email to: [email]
📧 Action code URL: http://localhost:3000/auth?email=[email]
📧 User UID: [uid]
📧 User email verified status: false
✅ Email verification sent successfully to: [email]
📬 Please check your inbox and spam folder
⏰ Email may take a few minutes to arrive
```

### B. Si Ves Errores

Si ves errores como:
- `auth/too-many-requests` → Espera unos minutos
- `auth/invalid-email` → Verifica el formato del email
- `auth/user-not-found` → El usuario no existe

## 6. Solución Temporal: Verificar Manualmente

Si necesitas verificar el email inmediatamente:

1. Ve a Firebase Console > **Authentication** > **Users**
2. Busca el usuario
3. Haz clic en el usuario
4. Haz clic en los **tres puntos** (⋮) en la parte superior
5. Selecciona **Verify email** o marca manualmente como verificado

## 7. Verificar Configuración de Red

Si estás en una red corporativa o con firewall:

1. Verifica que no haya bloqueadores de correo
2. Verifica que las conexiones a Firebase estén permitidas
3. Prueba desde otra red (datos móviles, otra WiFi)

## 8. Contactar Soporte de Firebase

Si después de seguir todos estos pasos el problema persiste:

1. Ve a [Firebase Support](https://firebase.google.com/support)
2. Proporciona:
   - El email que intentas verificar
   - El UID del usuario (visible en la consola)
   - Los logs de la consola del navegador
   - Capturas de pantalla de la configuración de Firebase

## Checklist Rápido

- [ ] Email/Password está habilitado en Firebase
- [ ] La plantilla de verificación está configurada
- [ ] El dominio está autorizado
- [ ] No se ha alcanzado el límite de correos
- [ ] Revisaste la carpeta de spam
- [ ] Esperaste al menos 5 minutos
- [ ] Probaste enviar el correo manualmente desde Firebase Console
- [ ] Revisaste los logs en la consola del navegador

## Nota Importante

El código ahora incluye `ActionCodeSettings` que mejora la entrega del correo. Si aún no recibes el correo después de verificar todo lo anterior, es probable que sea un problema de configuración en Firebase Console o un límite alcanzado.

