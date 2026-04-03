import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CategoryEntity, CategoryDocument } from 'src/schema/categorie.schema'
const DEFAULT_CATEGORIES = [
  { name: 'Identité',  slug: 'identite',  icon: 'id-card',    description: 'CNI, passeport, permis de conduire' },
  { name: 'Santé',     slug: 'sante',     icon: 'heart',      description: 'Ordonnances, résultats, cartes vitale' },
  { name: 'Finance',   slug: 'finance',   icon: 'banknote',   description: 'Relevés, impôts, contrats bancaires' },
  { name: 'Travail',   slug: 'travail',   icon: 'briefcase',  description: 'Contrats, fiches de paie, diplômes' },
  { name: 'Logement',  slug: 'logement',  icon: 'home',       description: 'Bail, factures, assurance habitation' },
  { name: 'Famille',   slug: 'famille',   icon: 'users',      description: 'Actes, livret de famille, tutelle' },
  { name: 'Juridique', slug: 'juridique', icon: 'scale',      description: 'Jugements, actes notariés, procurations' },
  { name: 'Autre',     slug: 'autre',     icon: 'folder',     description: 'Documents divers' },
]

@Injectable()
export class CategorySeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async onApplicationBootstrap() {
    for (const cat of DEFAULT_CATEGORIES) {
      await this.categoryModel.updateOne(
        { slug: cat.slug },
        { $setOnInsert: { ...cat, isActive: true, ownerId: null } },
        { upsert: true },
      )
    }
    console.log('Categories seeded')
  }
}