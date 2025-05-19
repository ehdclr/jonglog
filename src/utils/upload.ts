// src/utils/upload.ts
export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '파일 업로드에 실패했습니다.')
  }
  
  return response.json()
}