import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import './App.css'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp'
const AI_OPTIONS = [
  { value: 'claude', label: 'Claude' },
  { value: 'qwen', label: 'Qwen' },
] as const

type Ai = (typeof AI_OPTIONS)[number]['value']

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function App() {
  const [ai, setAi] = useState<Ai>('qwen')
  const [file, setFile] = useState<File | null>(null)
  const [submittedImage, setSubmittedImage] = useState<{ url: string; name: string } | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleAiChange(event: ChangeEvent<HTMLSelectElement>) {
    setAi(event.target.value as Ai)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setLoading(true)
    setSubmittedImage(null)
    setDescription(null)
    setError(false)

    try {
      const image = await readAsDataUrl(file)
      setSubmittedImage({ url: image, name: file.name })
      const response = await fetch('/get-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai, image }),
      })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      setDescription(await response.text())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <h1>AI Photo Description</h1>
      <p className="instructions">Add an image to get a description of it.</p>

      <label className="ai-select">
        AI model
        <select value={ai} onChange={handleAiChange} disabled={loading}>
          {AI_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <form className="upload-form" onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          accept={ACCEPTED_TYPES}
          aria-label="Image file"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Describing…' : 'Submit'}
        </button>
      </form>

      {submittedImage && (
        <img
          className="submitted-image"
          src={submittedImage.url}
          alt={`Submitted image: ${submittedImage.name}`}
        />
      )}

      <div aria-live="polite">
        {description && <p className="description">{description}</p>}
      </div>
      {error && (
        <p className="error" role="alert">
          Something went wrong
        </p>
      )}
    </main>
  )
}

export default App
