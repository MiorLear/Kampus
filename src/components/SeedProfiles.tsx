/**
 * Componente para poblar la base de datos con perfiles de usuario de ejemplo
 * Solo para desarrollo y testing
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Users, CheckCircle, XCircle, Info } from 'lucide-react';
import { 
  seedStudents, 
  seedTeachers, 
  seedAdmins, 
  seedAllProfiles,
  printTestCredentials 
} from '../utils/seed-profiles';

interface SeedResult {
  success: boolean;
  userId?: string;
  email: string;
  role: string;
  error?: string;
}

export function SeedProfiles() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    students?: SeedResult[];
    teachers?: SeedResult[];
    admins?: SeedResult[];
    summary?: {
      total: number;
      successful: number;
      failed: number;
    };
  } | null>(null);

  const handleSeedAll = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const seedResults = await seedAllProfiles();
      setResults(seedResults);
      printTestCredentials();
    } catch (error) {
      console.error('Error al poblar base de datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedStudents = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const students = await seedStudents();
      setResults({ students });
    } catch (error) {
      console.error('Error al crear estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTeachers = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const teachers = await seedTeachers();
      setResults({ teachers });
    } catch (error) {
      console.error('Error al crear profesores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmins = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const admins = await seedAdmins();
      setResults({ admins });
    } catch (error) {
      console.error('Error al crear administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = (results: SeedResult[], title: string) => {
    if (!results || results.length === 0) return null;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">{title}</h4>
        
        {successful.length > 0 && (
          <div className="space-y-1 mb-2">
            {successful.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{result.email}</span>
              </div>
            ))}
          </div>
        )}
        
        {failed.length > 0 && (
          <div className="space-y-1">
            {failed.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                <span>{result.email} - {result.error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          Poblar Base de Datos con Perfiles de Ejemplo
        </CardTitle>
        <CardDescription>
          Crea usuarios de ejemplo para desarrollo y testing. Incluye estudiantes, profesores y administradores.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Esta funcionalidad es solo para desarrollo. 
            Todos los usuarios tendrán la contraseña: <code className="bg-gray-100 px-2 py-1 rounded">Kampus2024!</code>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleSeedAll}
            disabled={loading}
            variant="default"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Todos los Usuarios'
            )}
          </Button>

          <Button
            onClick={handleSeedStudents}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              '👨‍🎓 Crear Estudiantes'
            )}
          </Button>

          <Button
            onClick={handleSeedTeachers}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              '👨‍🏫 Crear Profesores'
            )}
          </Button>

          <Button
            onClick={handleSeedAdmins}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              '👨‍💼 Crear Administradores'
            )}
          </Button>
        </div>

        {results && results.summary && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-semibold mb-2">Resumen:</div>
              <div className="space-y-1 text-sm">
                <div>Total de usuarios: {results.summary.total}</div>
                <div className="text-green-600">✓ Exitosos: {results.summary.successful}</div>
                {results.summary.failed > 0 && (
                  <div className="text-red-600">✗ Fallidos: {results.summary.failed}</div>
                )}
              </div>
              <div className="mt-3 text-xs">
                Ver consola del navegador para las credenciales de acceso
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {results?.students && renderResults(results.students, '👨‍🎓 Estudiantes')}
          {results?.teachers && renderResults(results.teachers, '👨‍🏫 Profesores')}
          {results?.admins && renderResults(results.admins, '👨‍💼 Administradores')}
        </div>

        <Alert className="bg-yellow-50 border-yellow-200 mt-4">
          <AlertDescription className="text-yellow-800 text-sm">
            <strong>Usuarios de ejemplo incluidos:</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>3 Estudiantes (diferentes niveles académicos)</li>
              <li>3 Profesores (con diferentes especialidades)</li>
              <li>3 Administradores (super admin, admin, moderador)</li>
            </ul>
            <div className="mt-2">
              Revisa el archivo <code className="bg-white px-2 py-0.5 rounded">PERFILES_DE_USUARIO.md</code> para más detalles.
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

