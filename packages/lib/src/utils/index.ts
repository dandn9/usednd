import { UniqueId, Element, ElementRect } from "../Context/DndContext"
import { DirectionType } from "../hooks/useDnd"

export function computeClosestDroppable(ev: PointerEvent, allElements: Map<UniqueId, Element>, active?: Element) {
    // max 32bit uint 
    let closestDistance = -1 >>> 1 // other cool way is ~0 >>> 1
    let closestElement: Element | null = null;
    let pointOfContact = { x: 0, y: 0 }


    for (const [id, element] of allElements) {
        if (element.id === active?.id) continue // do not calculate the active 
        if (!element.droppable) continue

        // {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}



        const distanceToCenter = Math.sqrt(pow2(ev.pageX - element.rect.center[0]) + pow2(ev.pageY - element.rect.center[1]))
        const dragAngle = Math.asin((Math.abs(ev.pageY - element.rect.center[1]) / distanceToCenter))

        let dist = 0
        let x = 0;
        let y = 0
        if (dragAngle === element.rect.angle) {
            dist = Math.sqrt(pow2(element.rect.width) + pow2(element.rect.center[1]))
        } else if (dragAngle < element.rect.angle) {
            //get the cos
            x = element.rect.width / 2
            y = x * Math.tan(dragAngle)
            dist = Math.sqrt(pow2(x) + pow2(y))
        } else {
            //get the sin
            y = element.rect.height / 2
            x = y * Math.tan(Math.PI / 2 - dragAngle)
            dist = Math.sqrt(pow2(y) + pow2(x))

        }

        const distance = distanceToCenter - dist;

        if (distance < closestDistance) {
            console.log('xy', x, y, element.id)
            pointOfContact.x = element.rect.center[0] + (ev.pageX > element.rect.center[0] ? x : -x)
            pointOfContact.y = element.rect.center[1] + (ev.pageY > element.rect.center[1] ? y : -y)
            closestDistance = distance;
            closestElement = element
        }

    }



    return {
        closestDistance, closestElement, pointOfContact
    }

}


/** Compute the 'rect' property in Element */
export function getElementRect(node: HTMLElement): ElementRect {

    const geometry = node.getBoundingClientRect()
    const center: [number, number] = [geometry.left + geometry.width / 2, geometry.top + geometry.height / 2]
    const angle = Math.asin(geometry.height / Math.sqrt(pow2(geometry.width) + pow2(geometry.height)))


    return { center, height: geometry.height, left: geometry.left, top: geometry.top, width: geometry.width, angle }
}




/** Very simple implementation, its mostly just to compare node's bounding boxes */
export function compareObjects(obj1: Object, obj2: Object): boolean {

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    type g = keyof typeof obj1
    // typescript :D
    const areEqual = keys1.every((key) => {
        if (typeof obj1[key as g] !== typeof obj2[key as g]) {
            return false
        }
        if (typeof obj1[key as g] === 'object') {
            return compareObjects(obj1[key as g], obj2[key as g])
        }

        return obj1[key as g] === obj2[key as g]
    })

    return areEqual
}

/** Calculate direction */
export function computeDirection(element: Element, position: [number, number]): DirectionType {


    const distanceToCenter = Math.sqrt(pow2(position[0] - element.rect.center[0]) + pow2(position[1] - element.rect.center[1]))
    const dragAngle = Math.asin((Math.abs(position[1] - element.rect.center[1]) / distanceToCenter))

    const x = position[0] - element.rect.center[0]
    const y = position[1] - element.rect.center[1]
    const vector = normalize([x, y])

    console.log('vector', vector)
    return {
        vector,
        up: y <= 0 && dragAngle >= element.rect.angle,
        down: y > 0 && dragAngle >= element.rect.angle,
        left: x <= 0 && dragAngle < element.rect.angle,
        right: x > 0 && dragAngle < element.rect.angle
    }


}





export function pow2(num: number) {
    return Math.pow(num, 2)
}

export function normalize(vec: [number, number]): [number, number] {
    const sum = Math.abs(vec[0]) + Math.abs(vec[1])
    return [vec[0] / sum, vec[1] / sum]
}
