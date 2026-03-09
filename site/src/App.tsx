import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Pipeline } from './components/Pipeline'
import { Skills } from './components/Skills'
import { AgentTeams } from './components/AgentTeams'
import { Platforms } from './components/Platforms'
import { Install } from './components/Install'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Pipeline />
        <Skills />
        <AgentTeams />
        <Platforms />
        <Install />
      </main>
      <Footer />
    </div>
  )
}

export default App
