import { supabase } from '@/lib/supabase'
import type { Vehicle, VehicleImage, VehicleStatus } from '@/types'
import type { Database } from '@/types/database'
import { vehicleSlug } from '@/lib/slug'
import { computeQualityScore } from '@/lib/quality-score'

type VehicleRow = Database['public']['Tables']['vehicles']['Row']
type VehicleImageRow = Database['public']['Tables']['vehicle_images']['Row']
type FeatureRow = Database['public']['Tables']['vehicle_features']['Row']

function toVehicle(row: VehicleRow, images: VehicleImageRow[], features: FeatureRow[]): Vehicle {
  const vehicleImages: VehicleImage[] = images.map((img) => ({
    id: img.id,
    vehicleId: img.vehicle_id,
    url: img.image_url,
    storagePath: img.storage_path,
    position: img.position as VehicleImage['position'],
    isRequired: false,
    isRecommended: false,
    isMain: img.is_cover,
    sortOrder: img.sort_order,
  }))

  const coverImage = images.find((img) => img.is_cover)
  const mainImage = coverImage?.image_url ?? images[0]?.image_url ?? ''

  const vehicle: Vehicle = {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version,
    yearManufacture: row.year_manufacture,
    yearModel: row.year_model,
    price: Number(row.price),
    mileage: row.mileage,
    transmission: row.transmission as Vehicle['transmission'],
    fuel: row.fuel_type as Vehicle['fuel'],
    color: row.color,
    doors: row.doors,
    plateFinal: row.plate_final ?? undefined,
    features: features.map((f) => f.feature_name),
    descriptionShort: row.description_short,
    descriptionFull: row.description_full,
    status: row.status as VehicleStatus,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    mainImage,
    images: vehicleImages,
    qualityScore: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  return { ...vehicle, qualityScore: computeQualityScore(vehicle).total }
}

async function fetchWithRelations(ids: string[]): Promise<{ images: VehicleImageRow[]; features: FeatureRow[] }> {
  if (!ids.length) return { images: [], features: [] }
  const [{ data: images }, { data: features }] = await Promise.all([
    supabase.from('vehicle_images').select('*').in('vehicle_id', ids).order('sort_order'),
    supabase.from('vehicle_features').select('*').in('vehicle_id', ids),
  ])
  return { images: images ?? [], features: features ?? [] }
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data: rows, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!rows?.length) return []
  const { images, features } = await fetchWithRelations(rows.map((r) => r.id))
  return rows.map((row) =>
    toVehicle(
      row,
      images.filter((img) => img.vehicle_id === row.id),
      features.filter((f) => f.vehicle_id === row.id),
    ),
  )
}

export async function listPublishedVehicles(): Promise<Vehicle[]> {
  const { data: rows, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!rows?.length) return []
  const { images, features } = await fetchWithRelations(rows.map((r) => r.id))
  return rows.map((row) =>
    toVehicle(
      row,
      images.filter((img) => img.vehicle_id === row.id),
      features.filter((f) => f.vehicle_id === row.id),
    ),
  )
}

export async function listFeaturedVehicles(): Promise<Vehicle[]> {
  const { data: rows, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!rows?.length) return []
  const { images, features } = await fetchWithRelations(rows.map((r) => r.id))
  return rows.map((row) =>
    toVehicle(
      row,
      images.filter((img) => img.vehicle_id === row.id),
      features.filter((f) => f.vehicle_id === row.id),
    ),
  )
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const { data: row, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !row) return null
  const { images, features } = await fetchWithRelations([row.id])
  return toVehicle(row, images, features)
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { data: row, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !row) return null
  const { images, features } = await fetchWithRelations([row.id])
  return toVehicle(row, images, features)
}

export async function listRelatedVehicles(vehicle: Vehicle, limit = 3): Promise<Vehicle[]> {
  const { data: rows, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_published', true)
    .neq('id', vehicle.id)
    .eq('brand', vehicle.brand)
    .limit(limit)
  if (error || !rows?.length) return []
  const { images, features } = await fetchWithRelations(rows.map((r) => r.id))
  return rows.map((row) =>
    toVehicle(
      row,
      images.filter((img) => img.vehicle_id === row.id),
      features.filter((f) => f.vehicle_id === row.id),
    ),
  )
}

export interface CreateVehicleInput {
  brand: string
  model: string
  version: string
  yearManufacture: number
  yearModel: number
  price: number
  mileage: number
  transmission: string
  fuel: string
  color: string
  doors: number
  plateFinal?: string
  descriptionShort: string
  descriptionFull: string
  status: VehicleStatus
  isFeatured: boolean
  features: string[]
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const { data: dealership } = await supabase.from('dealerships').select('id').single()
  const { data: { user } } = await supabase.auth.getUser()

  const id = crypto.randomUUID()
  const slug = vehicleSlug({
    brand: input.brand,
    model: input.model,
    version: input.version,
    yearModel: input.yearModel,
    id: id.slice(0, 8),
  })

  const isPublished = input.status === 'active'

  const { data: row, error } = await supabase
    .from('vehicles')
    .insert({
      id,
      slug,
      dealership_id: dealership?.id ?? null,
      brand: input.brand,
      model: input.model,
      version: input.version,
      year_manufacture: input.yearManufacture,
      year_model: input.yearModel,
      price: input.price,
      mileage: input.mileage,
      transmission: input.transmission,
      fuel_type: input.fuel,
      color: input.color,
      doors: input.doors,
      plate_final: input.plateFinal || null,
      description_short: input.descriptionShort,
      description_full: input.descriptionFull,
      status: input.status,
      is_featured: input.isFeatured,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw error

  if (input.features.length > 0) {
    await supabase
      .from('vehicle_features')
      .insert(input.features.map((feature_name) => ({ vehicle_id: id, feature_name })))
  }

  const featureRows: FeatureRow[] = input.features.map((name) => ({
    id: crypto.randomUUID(),
    vehicle_id: id,
    feature_name: name,
  }))

  return toVehicle(row, [], featureRows)
}

export interface UpdateVehicleInput {
  price?: number
  status?: VehicleStatus
  descriptionShort?: string
  descriptionFull?: string
  isFeatured?: boolean
}

export async function updateVehicle(id: string, input: UpdateVehicleInput): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.price !== undefined) patch.price = input.price
  if (input.status !== undefined) {
    patch.status = input.status
    patch.is_published = input.status === 'active'
    patch.published_at = input.status === 'active' ? new Date().toISOString() : null
  }
  if (input.descriptionShort !== undefined) patch.description_short = input.descriptionShort
  if (input.descriptionFull !== undefined) patch.description_full = input.descriptionFull
  if (input.isFeatured !== undefined) patch.is_featured = input.isFeatured
  const { error } = await supabase.from('vehicles').update(patch).eq('id', id)
  if (error) throw error
}

export async function updateVehicleStatus(id: string, status: VehicleStatus): Promise<void> {
  const isPublished = status === 'active'
  const { error } = await supabase
    .from('vehicles')
    .update({
      status,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id)
  if (error) throw error
}
