import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/config/firebase.ts';

// Usuarios por defecto
const defaultUsers = [
  {
    id: "abc123",
    email: "student1@example.com",
    name: "Estudiante Uno",
    role: "student",
    photo_url: "https://example.com/photos/student1.jpg",
    created_at: serverTimestamp()
  },
  {
    id: "def456",
    email: "teacher1@example.com",
    name: "Profesor Uno",
    role: "teacher",
    photo_url: "https://example.com/photos/teacher1.jpg",
    created_at: serverTimestamp()
  },
  {
    id: "admin789",
    email: "admin@example.com",
    name: "Administrador",
    role: "admin",
    photo_url: "https://example.com/photos/admin.jpg",
    created_at: serverTimestamp()
  }
];

// Función para agregar usuarios
async function addDefaultUsers() {
  for (const user of defaultUsers) {
    try {
      await setDoc(doc(db, "users", user.id), user);
      console.log(`✅ Usuario ${user.name} añadido correctamente.`);
    } catch (error) {
      console.error(`❌ Error al añadir ${user.name}:`, error);
    }
  }
}

addDefaultUsers();