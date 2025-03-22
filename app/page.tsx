import ConstellationViewer from "@/components/constellation-viewer"
import ThemeToggle from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 md:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Constellation Viewer</h1>
        <ThemeToggle />
      </div>
      <ConstellationViewer />
    </main>
  )
}

