import { DndProvider, useDnd } from 'lib'
import { CSSTransform } from 'lib/src/utils'
import React from 'react'
const Scenario3 = () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    console.log('scenario 3 render', position)
    return (
        <div className="w-screen flex justify-center items-center">
            <DndProvider
                onDragEnd={(options) => {
                    setPosition((prev) => {
                        return {
                            x: prev.x + options.active.movementDelta.x,
                            y: prev.y + options.active.movementDelta.y,
                        }
                    })
                }}
            >
                <SimpleDraggable position={position} />
            </DndProvider>
        </div>
    )
}

function SimpleDraggable({ position }: { position: { x: number; y: number } }) {
    const { setNode, listeners, transform, active } = useDnd(1, {
        draggable: true,
        droppable: false,
    })
    return (
        <div
            className={`w-28 h-12 rounded bg-slate-900 text-center relative ${active && 'border-2 border-red-500'}`}
            style={{
                top: position.y,
                left: position.x,
                transform: CSSTransform(transform),
            }}
            ref={setNode}
            {...listeners}
        >
            Draggable
        </div>
    )
}

export default Scenario3