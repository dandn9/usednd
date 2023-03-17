import React, { useRef, useId, useCallback, useEffect, useMemo } from 'react'
import { InternalDndContext, PublicDndContext } from '../Context/DndContext'
import { DndElement } from '../utils/DndElement'
import useDndEvents from './useDndEvents'

interface DndOptions {
	virtualize?: boolean
	draggable?: boolean
	id?: string
}
const defaultOptions: DndOptions = {
	virtualize: true,
	draggable: true,
	id: '',
}

export const useDnd = (options: DndOptions = defaultOptions) => {
	const realOpt = { ...defaultOptions, ...options }
	const id = realOpt.id || useId()

	const elementRef = useRef<DndElement | undefined>(undefined)
	const internalContext = React.useContext(InternalDndContext)
	const publicContext = React.useContext(PublicDndContext)
	console.log('update', elementRef.current)
	useDndEvents(elementRef)
	const offset = useMemo(() => {
		if (
			!elementRef.current ||
			!publicContext.context ||
			!publicContext.context.active
		)
			return { x: 0, y: 0 }
		const rect = elementRef.current.domNode.getBoundingClientRect()
		console.log('ins', rect, publicContext.context.mouse)
		return {
			x: rect.x - publicContext.context?.mouse.x,
			y: rect.y - publicContext.context?.mouse.y,
		}
	}, [publicContext.context?.mouse, elementRef.current])

	// const transform = useMemo(() => {
	// 	if (!elementRef.current) return { x: 0, y: 0 }
	// }, [publicContext.context?.mouse])

	const setRef = useCallback((node: HTMLElement | null) => {
		if (node instanceof HTMLElement) {
			elementRef.current = new DndElement(id, node, { drag: true })
			internalContext.dispatch?.({ type: 'add', payload: elementRef.current })
		} else {
			elementRef.current = undefined
			internalContext.dispatch?.({ type: 'remove', payload: id })
		}
	}, [])

	return { setRef, offset }
}
