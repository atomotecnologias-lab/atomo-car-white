import { supabase } from '@/lib/supabase'
import type { PhotoSlotKey } from '@/types'

const BUCKET = 'vehicles'
const MAX_SIZE_MB = 10

export interface PhotoUploadInput {
  vehicleId: string
  slot: PhotoSlotKey
  file: File
  isMain: boolean
  sortOrder: number
}

export interface UploadResult {
  slot: PhotoSlotKey
  imageUrl: string
  storagePath: string
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase()
}

export async function uploadVehicleImage(input: PhotoUploadInput): Promise<UploadResult> {
  const { vehicleId, slot, file } = input

  if (!file.type.startsWith('image/')) {
    throw new Error('Formato inválido. Envie apenas imagens (jpg, png, webp).')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Arquivo excede o limite de ${MAX_SIZE_MB} MB.`)
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''))
  const storagePath = `${vehicleId}/${slot}-${safeName}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)

  return { slot, imageUrl: publicUrl, storagePath }
}

export async function saveVehicleImages(
  vehicleId: string,
  uploads: Array<{ slot: PhotoSlotKey; file: File; isMain: boolean; sortOrder: number }>,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (!uploads.length) return

  const results: UploadResult[] = []

  for (const item of uploads) {
    const result = await uploadVehicleImage({
      vehicleId,
      slot: item.slot,
      file: item.file,
      isMain: item.isMain,
      sortOrder: item.sortOrder,
    })
    results.push(result)
    onProgress?.(results.length, uploads.length)
  }

  const rows = results.map((r, idx) => ({
    vehicle_id: vehicleId,
    storage_path: r.storagePath,
    image_url: r.imageUrl,
    position: r.slot,
    is_cover: uploads[idx].isMain,
    sort_order: uploads[idx].sortOrder,
  }))

  const { error } = await supabase.from('vehicle_images').insert(rows)
  if (error) throw error
}

export async function deleteVehicleImage(imageId: string, storagePath: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([storagePath])
  await supabase.from('vehicle_images').delete().eq('id', imageId)
}

export async function setCoverImage(vehicleId: string, imageId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from('vehicle_images')
    .update({ is_cover: false })
    .eq('vehicle_id', vehicleId)
  if (clearError) throw clearError

  const { error } = await supabase
    .from('vehicle_images')
    .update({ is_cover: true })
    .eq('id', imageId)
  if (error) throw error
}

export async function reorderImages(
  updates: Array<{ id: string; sortOrder: number }>,
): Promise<void> {
  await Promise.all(
    updates.map(({ id, sortOrder }) =>
      supabase.from('vehicle_images').update({ sort_order: sortOrder }).eq('id', id),
    ),
  )
}
