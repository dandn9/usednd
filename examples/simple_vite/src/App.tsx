import { useState } from 'react'
import Scenario1 from './scenarios/1'
import './App.css'
import Scenario2 from './scenarios/2'
import Scenario3 from './scenarios/3'
import Scenario4 from './scenarios/4'

const availableScenarios = [<Scenario1 />, <Scenario2 />, <Scenario3 />, <Scenario4 />]

function App() {
    const [currentScenario, setCurrentScenario] = useState(0)

    return (
        <main className="h-screen w-screen overflow-hidden flex justify-center items-center">
            <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 9999 }}>
                {availableScenarios.map((_, i) => (
                    <button onClick={setCurrentScenario.bind(null, i)} key={i}>
                        {i}
                    </button>
                ))}
            </div>
            {availableScenarios[currentScenario]}
        </main>
    )
}

export default App
