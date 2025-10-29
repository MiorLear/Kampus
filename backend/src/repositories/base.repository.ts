import { db } from '../config/firebase';
import { 
  CollectionReference, 
  DocumentReference,
  Query,
  FieldValue
} from 'firebase-admin/firestore';

export abstract class BaseRepository<T> {
  protected collection: CollectionReference;

  constructor(collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  /**
   * Encontrar un documento por ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      console.error(`Error getting ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los documentos
   */
  async findAll(): Promise<T[]> {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as T));
    } catch (error) {
      console.error(`Error getting all from ${this.collection.path}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo documento
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await this.collection.add({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating in ${this.collection.path}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un documento
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<void> {
    try {
      await this.collection.doc(id).update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error updating ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un documento
   */
  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error(`Error deleting ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar documentos por campo
   */
  async findBy(field: string, value: any): Promise<T[]> {
    try {
      const snapshot = await this.collection.where(field, '==', value).get();
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as T));
    } catch (error) {
      console.error(`Error finding by ${field} in ${this.collection.path}:`, error);
      throw error;
    }
  }

  /**
   * Contar documentos que cumplen una condición
   */
  async countBy(field: string, value: any): Promise<number> {
    try {
      const snapshot = await this.collection.where(field, '==', value).get();
      return snapshot.size;
    } catch (error) {
      console.error(`Error counting by ${field} in ${this.collection.path}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si existe un documento
   */
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error(`Error checking existence of ${this.collection.path}/${id}:`, error);
      throw error;
    }
  }
}


