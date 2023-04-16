import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useDnd, Provider } from 'lib'
import Scenario1 from './scenarios/1'
import './App.css'

const availableScenarios = [<Scenario1 />]

function App() {

	const [currentScenario, setCurrentScenario] = useState(0)

	return (
		<main>
			<div style={{ position: 'absolute', top: '0', left: '0', }}>{availableScenarios.map((scen, i) => <button onClick={setCurrentScenario.bind(null, i)} key={i}>{i}</button>)}</div>
			{availableScenarios[currentScenario]}
		</main>
	)
}


export default App