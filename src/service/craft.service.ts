// src/service/craft.service.ts
import { createId } from '@paralleldrive/cuid2';
import { ResponseError } from '../error/response-error';
import { Craft, craftsRef } from '../models/craft.model';
import { CraftValidation } from '../validation/craft.validation';
import { validate } from '../validation/validation';





const createCraftIdea = async (data: Omit<Craft, 'id' | 'createdAt' | 'updatedAt'>) => {
  const craft = validate(CraftValidation,data);


  const newId = createId();


  const newCraftIdea: Craft = {
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };

  //store database
  await craftsRef.doc(newId).set(newCraftIdea);


  return newCraftIdea;
};



const getAllCraftIdeas = async (categories?: string[], title?: string) => {
  const Fuse = (await import('fuse.js')).default;

  // Fetching crafts from Firestore
  const snapshot = await craftsRef.get();
  const crafts: Craft[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Craft[];

  // Initialize results with all crafts
  let results = crafts;

  // Filter by categories if provided
  if (categories && categories.length > 0) {
    results = results.filter(craft =>
      craft.categories?.some(category => categories.includes(category))  // Ensure matching categories
    );
  }

  // Apply fuzzy search for title if provided
  if (title) {
    const fuse = new Fuse(results, { keys: ["title"], includeScore: true });
    results = fuse.search(title).map(result => result.item);
  }

  return results;
};


const getCraftIdeaById = async (id: string) => {
  const doc = await craftsRef.doc(id).get();
  if (!doc.exists) {
    throw new ResponseError(404, 'Craft idea not found.');
  }
  return { id: doc.id, ...doc.data() } as Craft;
};



const updateCraftIdea = async (id: string, data: Partial<Omit<Craft, 'id' | 'createdAt'>>) => {
  const doc = await craftsRef.doc(id).get();
  if (!doc.exists) {
    throw new ResponseError(404, 'Craft idea not found.');
  }

  await craftsRef.doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  
  return { id, ...data, updatedAt: new Date().toISOString() };
};



const deleteCraftIdea = async (id: string) => {
  const doc = await craftsRef.doc(id).get();
  if (!doc.exists) {
    throw new ResponseError(404, 'Craft idea not found.');
  }

  await craftsRef.doc(id).delete();
  return { id };
};

export default {
  createCraftIdea,
  getAllCraftIdeas,
  getCraftIdeaById,
  updateCraftIdea,
  deleteCraftIdea,
};