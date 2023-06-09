import { DndElementRect, UniqueId } from '../context/ContextTypes'
import { getElementRect, CollisionResultSuccess, Collision, createEventOptions } from '../utils/utils'
import { Context } from '../context/DndContext'
import { DndElementEvents, DndPointerEvent } from '../options/DndEvents'
import { Transform } from '../hooks/useDnd'
import { Vec2 } from './Vec2'

export interface DndElementOptions {
    draggable: boolean
    droppable: boolean
    callbacks?: Partial<DndElementEvents>
    // eslint-disable-next-line
    data?: any
    collisionFilter?: (collision: Collision) => boolean
}

export class DndElement {
    id: UniqueId
    node: HTMLElement
    rect!: DndElementRect
    movementDelta: Vec2
    initialPoint: Vec2
    isActive: boolean
    isOver: boolean
    transform: Transform

    draggable: DndElementOptions['draggable']
    droppable: DndElementOptions['droppable']
    callbacks?: DndElementOptions['callbacks']
    data?: DndElementOptions['data']
    collisionFilter?: DndElementOptions['collisionFilter']

    constructor(id: UniqueId, node: HTMLElement, options: DndElementOptions) {
        this.id = id
        this.node = node
        this.draggable = options.draggable
        this.droppable = options.droppable
        this.callbacks = options.callbacks
        this.data = options.data
        this.collisionFilter = options.collisionFilter
        this.movementDelta = new Vec2(0, 0)
        this.initialPoint = new Vec2(0, 0)
        this.isActive = false
        this.isOver = false
        this.transform = { x: 0, y: 0, z: 0, scale: 1 }

        if (options.draggable) {
            this.node.style.userSelect = 'none'
            this.node.style.touchAction = 'none'
            this.node.style.cursor = 'grab'
        }

        this.updateRect()
    }

    public updateRect() {
        this.rect = getElementRect(this.node)
    }
    /** Events  */
    public onDragStart(ev: DndPointerEvent) {
        this.initialPoint = new Vec2(ev.pageX, ev.pageY)
        this.isActive = true

        const ctx = Context.getState()
        ctx.activeElement = this
        ctx.isDragging = true
        ctx.isOutside = true

        this.callbacks?.onDragStart?.(createEventOptions(ev))
        this.node.style.cursor = 'grabbing'
    }
    public onDragEnd(ev: DndPointerEvent) {
        this.node.style.cursor = 'grab'
        this.callbacks?.onDragEnd?.(createEventOptions(ev))
    }
    public onDragMove(ev: DndPointerEvent) {
        this.movementDelta.x = -(this.initialPoint.x - ev.pageX)
        this.movementDelta.y = -(this.initialPoint.y - ev.pageY)
        this.callbacks?.onDragMove?.(createEventOptions(ev))
    }

    public onDrop(ev: DndPointerEvent) {
        this.callbacks?.onDrop?.(createEventOptions(ev))
    }
    public onDragOverStart(ev: DndPointerEvent,) {
        const context = Context.getState()

        context.overElement?.onDragOverLeave?.(ev)
        context.overElement = this
        this.isOver = true

        this.callbacks?.onDragOverStart?.(createEventOptions(ev))
    }
    public onDragOverMove(ev: DndPointerEvent) {
        this.callbacks?.onDragOverMove?.(createEventOptions(ev))
    }
    public onDragOverLeave(ev: DndPointerEvent) {
        this.isOver = false
        this.callbacks?.onDragOverLeave?.(createEventOptions(ev))
    }
    public onActive(ev: DndPointerEvent) {
        this.callbacks?.onActive?.(createEventOptions(ev))
    }
}
