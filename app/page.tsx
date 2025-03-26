import ConstellationViewer from "@/components/constellation-viewer"

export default function Home() {
  return (
    <main className="container mx-auto py-4 px-4 md:px-6 lg:px-8 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Constellation Viewer</h1>
      </div>
      <ConstellationViewer />
    </main>
  )
}

