import React, { useEffect, useState } from 'react'
import { useDnd, DndProvider } from 'lib'
import './App.css'

function App() {
	const [count, setCount] = useState(0)
	console.log('dnd')

	return (
		<main>
			<DndProvider>{count % 2 == 0 && <Draggable />}</DndProvider>
			<button
				onClick={() => {
					setCount(count + 1)
				}}>
				x
			</button>
		</main>
	)
}

const Draggable: React.FC<React.PropsWithChildren<any>> = () => {
	const x = useDnd({ id: 'test123' })
	return (
		<div
			ref={x.setRef}
			style={{
				width: 100,
				height: 100,
				border: '1px solid #fff',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			Draggable
		</div>
	)
}

export default App
