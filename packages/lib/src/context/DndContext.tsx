import React, { PropsWithChildren, cloneElement, createContext, startTransition, useEffect, useMemo, useRef, useState } from "react"
import { clearOverStack, compareObjects, computeClosestDroppable, computeIntersectRect } from '../utils'
import { DndContext, UniqueId } from "./ContextTypes"
import { DndElement, } from "../entities/DndElement"
import { DndEvents } from "../options/DndEvents"
import { DndCollision } from "../options/DndCollisions"
import { flushSync } from "react-dom"
import { Transform } from "../hooks/useDnd"



interface DndGlobContext extends React.Context<DndContext> {
	getState: () => DndContext
}

export const Context = createContext<DndContext>({ dndProviderProps: {} } as DndContext) as DndGlobContext



export interface DndProviderProps extends Partial<DndEvents> {
	// onDrop?: (ev: PointerEvent, active: DndElement, over: DndElement, context: DndContext) => any
	debug?: boolean
	ghost?: () => JSX.Element
	/** Distance for mouse in pixels to element to trigger the over effect  
	*	Default value: 100 
	*/
	outsideThreshold?: number
	/** 
	 * 
	*/
	collisionDetection?: DndCollision
}



export const DndProvider: React.FC<PropsWithChildren<DndProviderProps>> = ({ collisionDetection = DndCollision.RectIntersect, outsideThreshold = 100, children, debug, ghost, ...callbacks }) => {

	// current problem: if props change the context is not updated or recreated
	const context = useMemo<DndContext>(() => ({
		elements: new Map(),
		cleanupFunctions: [],
		isDragging: false,
		isOutside: false,
		dndProviderProps: { collisionDetection, outsideThreshold, debug, ghost, callbacks },
		ghostNode: null,
		overStack: [],
		overElement: null,
		activeElement: null,
		register: (id, node, options) => {

			const element: DndElement = new DndElement(id, node, options)
			context.elements?.set(id, element)
			node.style.touchAction = 'manipulation'
			node.style.userSelect = 'none'
			return element;

		},
		unregister: (id) => {
			// dont delete it
			context.elements?.delete(id)
			// context.cleanupFunctions.push(() => context.elements.delete(id))
		}

	}), []);

	useEffect(() => {

		function pointerUp(ev: PointerEvent) {
			if (!context.isDragging) return

			/** Get rid of ghost */
			// if (ghostNode.current && isElement(ghostNode.current)) {
			// 	ghostNode.remove()
			// 	ghostNode.current = null
			// }



			if (context.activeElement && context.overElement) {
				context.overElement.onDrop?.(ev)
				callbacks?.onDrop?.({ event: ev, active: context.activeElement, over: context.overElement, context })

				// 	/** Cleanup */
				context.activeElement.node.style.opacity = '1.0'
			}

			// this is extremely hacky but it does work without compromising ux xd
			// prevent the screen from being repainted




			startTransition(() => {
				callbacks.onDragEnd?.({ context, active: context.activeElement, over: context.overElement })
				context.overElement?.onDragOverLeave?.(ev);
				context.activeElement?.onDragEnd(ev);
			})

			/** Cleanup after the react state has been updated  */
			// console.log('pushing cleanup')
			// context.cleanupFunctions.push(() => {
			// console.log('CLEANUP!!')
			context.activeElement.movementDelta = { x: 0, y: 0 }
			context.activeElement.isActive = false;
			context.overStack = [];
			(context.isDragging as boolean) = false;
			(context.activeElement as DndElement | null) = null;
			// })

		}
		function pointerMove(ev: PointerEvent) {
			if (!context.isDragging) return
			// console.log('is dragging')

			// if its dragging and its not inside a droppable element

			if (collisionDetection === DndCollision.ClosestPoint) {
				const result = computeClosestDroppable(ev, context.elements, context.activeElement)
				if (!result || result.distance > outsideThreshold) {
					while (context.overStack.length > 0) {
						clearOverStack(ev)
					}
					return

				}

				if (debug) {
					/** Update debug line if debug - just do it imperatively so it doesnt affect react performance */
					const line = document.querySelector('#dnd-debug-view') as SVGLineElement
					line.setAttribute('x1', ev.pageX.toString())
					line.setAttribute('x2', result.pointOfContact?.x.toString())
					line.setAttribute('y1', ev.pageY.toString())
					line.setAttribute('y2', result.pointOfContact?.y.toString())
				}

				if (result.element.isOver) {
					/** if its still over the same element, just fire the move */
					result.element.onDragOverMove(ev)

				} else {
					result.element?.onDragOverStart(ev)

				}
			}

			if (collisionDetection === DndCollision.RectIntersect) {
				const result = computeIntersectRect(ev)

				if (!result) {
					while (context.overStack.length > 0) {
						clearOverStack(ev)
					}

				} else {
					if (result.element.isOver) {
						result.element.onDragOverMove(ev)

					} else {
						result.element.onDragOverStart(ev)
					}
				}
			}



			context.activeElement.onDragMove(ev)
		}

		window.addEventListener('pointermove', pointerMove)
		window.addEventListener('pointerup', pointerUp)
		return () => {
			window.removeEventListener('pointermove', pointerMove);
			window.removeEventListener('pointerup', pointerUp);
		}

	}, [])

	useEffect(() => {
		Context.getState = () => context
	}, [context])


	/** Debug */
	useEffect(() => {
		const showState = (ev: KeyboardEvent) => { if (ev.key === 'X') console.log(context) }
		window.addEventListener('keydown', showState)
		return () => { window.removeEventListener('keydown', showState) }

	}, [])


	return <Context.Provider value={context}>
		{debug && (<svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} >
			<line x1={0} y1={0} x2={0} y2={0} stroke='red' id="dnd-debug-view"></line>
		</svg>)}
		{children}</Context.Provider>
}
export default DndProvider


