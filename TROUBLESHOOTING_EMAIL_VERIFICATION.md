# Solución de Problemas: Correo de Verificación

## Problema: No se envía el correo de verificación

Si el correo de verificación no se está enviando, sigue estos pasos para diagnosticar y solucionar el problema:

## 1. Verificar Configuración de Firebase

### A. Habilitar Email/Password Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Sign-in method**
4. Asegúrate de que **Email/Password** esté habilitado
5. Si no está habilitado, haz clic en **Email/Password** y luego en **Enable**

### B. Configurar Plantillas de Email

1. En Firebase Console, ve a **Authentication** > **Templates**
2. Verifica que la plantilla de **Email address verification** esté configurada
3. Puedes personalizar el asunto y el cuerpo del correo aquí
4. Asegúrate de que el remitente esté configurado correctamente

### C. Verificar Dominios Autorizados

1. En Firebase Console, ve a **Authentication** > **Settings** > **Authorized domains**
2. Asegúrate de que tu dominio esté en la lista
3. Para desarrollo local, `localhost` debería estar incluido automáticamente

## 2. Verificar Configuración del Código

### A. Revisar la Consola del Navegador

Abre la consola del navegador (F12) y busca:
- ✅ `Email verification sent successfully to: [email]` - El correo se envió correctamente
- ❌ `Email verification failed:` - Hay un error, revisa el código de error

### B. Códigos de Error Comunes

- **`auth/too-many-requests`**: Se han enviado demasiados correos. Espera unos minutos.
- **`auth/user-not-found`**: El usuario no existe. Intenta registrarte de nuevo.
- **`auth/invalid-email`**: El email no es válido.
- **`auth/network-request-failed`**: Problema de conexión. Verifica tu internet.

## 3. Verificar el Correo

### A. Revisar Carpeta de Spam

El correo de verificación puede estar en la carpeta de spam o correo no deseado.

### B. Verificar el Email Correcto

Asegúrate de haber ingresado el email correcto al registrarte.

### C. Esperar unos Minutos

A veces el correo puede tardar unos minutos en llegar.

## 4. Soluciones Alternativas

### A. Reenviar el Correo de Verificación

Si no recibiste el correo, puedes usar la opción "Resend Verification Email" en la pantalla de verificación.

### B. Verificar Manualmente en Firebase

1. Ve a Firebase Console > Authentication > Users
2. Busca tu usuario
3. Si el email no está verificado, puedes verificar manualmente haciendo clic en el usuario y luego en "Send email verification"

## 5. Verificar Configuración de Firebase Auth

### A. Verificar que el Proyecto Tenga Email Habilitado

Ejecuta este código en la consola del navegador para verificar:

```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Auth config:', auth.config);
```

### B. Verificar Límites de Firebase

Firebase tiene límites en el número de correos que se pueden enviar:
- **Plan Spark (Gratis)**: 100 correos/día
- **Plan Blaze (Pago)**: Sin límite

Si has alcanzado el límite, necesitarás actualizar tu plan.

## 6. Debugging en el Código

El código ahora incluye logs detallados. Revisa la consola del navegador para ver:

```javascript
✅ Email verification sent successfully to: [email]
```

O si hay un error:

```javascript
❌ Email verification failed: [error]
Error code: [code]
Error message: [message]
User email: [email]
User emailVerified: [status]
```

## 7. Solución Rápida

Si nada funciona, puedes verificar el email manualmente:

1. Ve a Firebase Console > Authentication > Users
2. Busca tu usuario por email
3. Haz clic en el usuario
4. Haz clic en "Send email verification" o marca manualmente como verificado

## 8. Verificar Configuración de Red

Si estás en un entorno corporativo o con firewall:

1. Verifica que no haya bloqueadores de correo
2. Verifica que las conexiones a Firebase estén permitidas
3. Prueba desde otra red (por ejemplo, datos móviles)

## 9. Contactar Soporte

Si después de seguir todos estos pasos el problema persiste:

1. Revisa los logs de Firebase Console > Authentication > Users
2. Contacta al soporte de Firebase con:
   - El código de error específico
   - El email que intentas verificar
   - Los logs de la consola del navegador

## Notas Importantes

- El correo de verificación solo se puede enviar si el usuario está autenticado
- Después del registro, el usuario se cierra sesión automáticamente para forzar la verificación
- Si el correo no se envía, el usuario puede usar la opción "Resend Verification Email" después de intentar iniciar sesión

