import './style.css'
import {EventDetail, ResizingVector, SelectImageAreaConfig, SelectImageAreaElementsData} from "./types";

let instanceCount = 0

export default function (target: HTMLElement, config: Partial<SelectImageAreaConfig> = {}) {

    if (target.getAttribute('selectImageAreaInstance') !== null) {
        return
    }

    target.setAttribute('selectImageAreaInstance', instanceCount.toString())

    const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
    const getWidth = (element: HTMLElement) => parseInt(getComputedStyle(element).width)
    const getHeight = (element: HTMLElement) => parseInt(getComputedStyle(element).height)
    const suffixWithInstanceCount = (id: string) => `select-image-area__${id}${instanceCount}`
    const getElement = (element: string): HTMLElement => {

        const el = document.getElementById(element);

        if (el == null) {
            throw `${element} cannot be null!`
        }

        return el
    }

    const elements: SelectImageAreaElementsData = {
        area: {
            id: suffixWithInstanceCount('area'),
        },
        areaSelected: {
            id: suffixWithInstanceCount('area-selected'),
        },
        resizeHandles: {
            resizeB: {
                id: suffixWithInstanceCount('resize-b'),
                vector: {x: 0, y: 1}
            },
            resizeT: {
                id: suffixWithInstanceCount('resize-t'),
                vector: {x: 0, y: -1}
            },
            resizeR: {
                id: suffixWithInstanceCount('resize-r'),
                vector: {x: 1, y: 0}
            },
            resizeL: {
                id: suffixWithInstanceCount('resize-l'),
                vector: {x: -1, y: 0}
            },
            resizeBL: {
                id: suffixWithInstanceCount('resize-bl'),
                vector: {x: -1, y: 1}
            },
            resizeBR: {
                id: suffixWithInstanceCount('resize-br'),
                vector: {x: 1, y: 1}
            },
            resizeTR: {
                id: suffixWithInstanceCount('resize-tr'),
                vector: {x: 1, y: -1}
            },
            resizeTL: {
                id: suffixWithInstanceCount('resize-tl'),
                vector: {x: -1, y: -1}
            },
        }
    }

    target.insertAdjacentHTML('afterend', `
    <div id="${elements.area.id}" style="background-color: rgba(0, 0, 0, 0.05); position: absolute; top: 0;">
            <div id="${elements.areaSelected.id}" style="position: absolute; background-color: rgba(255, 255, 255, 0.70); border: 3px dashed black; box-sizing: border-box;">
               
                <div style="display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: 100%;">
                  <div style="position: relative; width: 100%; height: 1px;">
                        <div id="${elements.resizeHandles.resizeTL.id}" class="select-image-area__resize-handle" style=" left: -7px;  cursor: nwse-resize;"></div>
                        <div id="${elements.resizeHandles.resizeT.id}" class="select-image-area__resize-handle" style=" right: 0; left: 0;  cursor: n-resize;"></div>
                        <div id="${elements.resizeHandles.resizeTR.id}" class="select-image-area__resize-handle" style=" right: -7px;  cursor: nesw-resize;"></div>
                    </div>
                    
                     <div style="position: relative; width: 100%; height: 1px;">
                        <div id="${elements.resizeHandles.resizeL.id}" class="select-image-area__resize-handle" style=" left: -7px;  cursor: w-resize;"></div>
                        <div id="${elements.resizeHandles.resizeR.id}" class="select-image-area__resize-handle" style=" right: -7px;  cursor: e-resize;"></div>
                    </div>
                    
                <div style="position: relative; width: 100%; height: 1px;">
                        <div id="${elements.resizeHandles.resizeBL.id}" class="select-image-area__resize-handle" style=" left: -7px;  cursor: nesw-resize;"></div>
                        <div id="${elements.resizeHandles.resizeB.id}" class="select-image-area__resize-handle" style=" right: 0; left: 0;  cursor: s-resize;"></div>
                        <div id="${elements.resizeHandles.resizeBR.id}" class="select-image-area__resize-handle" style=" right: -7px;  cursor: nwse-resize;"></div>
                    </div>
</div>
                
            </div>
        </div>
    `)

    const area = getElement(elements.area.id)
    const areaSelected = getElement(elements.areaSelected.id)

    const eventDetail = () => (<EventDetail>{
        coordinates: {
            x: areaSelected.offsetLeft,
            y: areaSelected.offsetTop,
        },
        size: {
            w: getWidth(areaSelected),
            h: getHeight(areaSelected),
        }
    })

    config.minHeight = config.minHeight || 70
    config.minWidth = config.minWidth || 100

    config.size = config.size || {
        w: getWidth(target) * 0.5,
        h: getHeight(target) * 0.25
    }

    config.coordinates = config.coordinates || {
        x: 0,
        y: 0
    }


    const minHeight = config.minHeight
    const minWidth = config.minWidth
    let resizingVector: ResizingVector = {x: 0, y: 0}
    let isMoving = false
    let initialMousePosition = {x: 0, y: 0}
    let offsetX = 0
    let offsetY = 0

    area.style.width = getWidth(target) + 'px'
    area.style.height = getHeight(target) + 'px'

    config.size.w = clamp(config.size.w, 0, getWidth(area))
    config.size.h = clamp(config.size.h, 0, getHeight(area))

    config.coordinates.x = clamp(config.coordinates.x, 0, getWidth(area) - config.size.w)
    config.coordinates.y = clamp(config.coordinates.y, 0, getHeight(area) - config.size.h)

    areaSelected.style.left = config.coordinates.x + 'px'
    areaSelected.style.top = config.coordinates.y + 'px'
    areaSelected.style.width = config.size.w + 'px'
    areaSelected.style.height = config.size.h + 'px'

    let initialAreaSelectedSize: { width: number, height: number } = {
        width: getWidth(areaSelected),
        height: getHeight(areaSelected)
    }

    const setupResizeMouseDownEvent = (e: MouseEvent, vector: ResizingVector = {x: 0, y: 0}) => {
        if (areaSelected === null) {
            return
        }

        e.stopPropagation()
        resizingVector = vector

        if (resizingVector.y < 0) {
            let bottom = getHeight(area) - parseInt(areaSelected.style.top)
            bottom -= getHeight(areaSelected)
            areaSelected.style.bottom = bottom + 'px'
            areaSelected.style.top = ""
        }

        if (resizingVector.x < 0) {
            let right = getWidth(area) - parseInt(areaSelected.style.left)
            right -= getWidth(areaSelected)
            areaSelected.style.right = right + 'px'
            areaSelected.style.left = ""
        }

        initialAreaSelectedSize.width = getWidth(areaSelected)
        initialAreaSelectedSize.height = getHeight(areaSelected)
        initialMousePosition = {x: e.clientX, y: e.clientY}
    }

    const dispatchEvent = (name: 'moving' | 'resizing') => {
        target.dispatchEvent(new CustomEvent<EventDetail>(name, {detail: eventDetail()}))
    }

    const move = (e: MouseEvent) => {
        if (!isMoving) {
            return
        }
        const rect = area.getBoundingClientRect()

        let x = e.clientX + offsetX - rect.left
        let y = e.clientY + offsetY - rect.top

        areaSelected.style.left = clamp(x, 0, getWidth(area) - getWidth(areaSelected)) + 'px'
        areaSelected.style.top = clamp(y, 0, getHeight(area) - getHeight(areaSelected)) + 'px'

        dispatchEvent('moving')

    }

    const resize = (e: MouseEvent) => {
        if (resizingVector.x === 0 && resizingVector.y === 0) {
            return
        }

        let width = initialAreaSelectedSize.width - ((initialMousePosition.x - e.clientX) * resizingVector.x)
        let height = initialAreaSelectedSize.height - ((initialMousePosition.y - e.clientY) * resizingVector.y)
        let offsetWidth = areaSelected.offsetLeft
        let offsetHeight = areaSelected.offsetTop

        if (resizingVector.x < 0) {
            offsetWidth = getWidth(area) - getWidth(areaSelected) - offsetWidth
        }

        if (resizingVector.y < 0) {
            offsetHeight = getHeight(area) - getHeight(areaSelected) - offsetHeight
        }

        areaSelected.style.width = clamp(width, minWidth, getWidth(area) - offsetWidth) + 'px'
        areaSelected.style.height = clamp(height, minHeight, getHeight(area) - offsetHeight) + 'px'

        dispatchEvent('resizing')
    }

    areaSelected.addEventListener('mousedown', e => {
        isMoving = true
        const rect = areaSelected?.getBoundingClientRect();
        offsetX = rect?.left - e.clientX
        offsetY = rect?.top - e.clientY
    })

    const cancelAction = () => {
        isMoving = false

        let left = (parseInt(areaSelected.style.right) - getWidth(area))
        left += getWidth(areaSelected)
        left *= resizingVector.x
        areaSelected.style.left = left + 'px'
        areaSelected.style.right = ""

        let top = (parseInt(areaSelected.style.bottom) - getHeight(area))
        top += getHeight(areaSelected)
        top *= resizingVector.y
        areaSelected.style.top = top + 'px'
        areaSelected.style.bottom = ""

        resizingVector = {x: 0, y: 0}
    }

    document.body.addEventListener('mouseup', cancelAction)
    document.body.addEventListener('mouseleave', cancelAction)
    document.body.addEventListener('mousemove', e => {
        move(e)
        resize(e)
    })

    for (const handleName in elements.resizeHandles) {
        const handle = elements.resizeHandles[handleName as keyof typeof elements.resizeHandles]
        getElement(handle.id).addEventListener('mousedown', e => setupResizeMouseDownEvent(e, handle.vector))
    }

    instanceCount++
}
