import './style.css'
import {clamp} from './helpers'

interface ResizingVector {
    x: number,
    y: number
}

interface SelectAreaConfig {
    minHeight: number
    minWidth: number
    coordinates: Coordinates
    size: Size

}

interface Coordinates {
    x: number;
    y: number;
}

interface Size {
    w: number;
    h: number;
}

interface EventDetail {
    coordinates: Coordinates;
    size: Size;
}


let instanceCount = 0

export default function (img: HTMLImageElement, config: Partial<SelectAreaConfig> = {}) {

    if (img.getAttribute('selectAreaImageInstance') !== null) {
        return
    }

    img.setAttribute('selectAreaImageInstance', instanceCount.toString())

    const buildSuffixedId = (element: string) => `${element}${instanceCount}`
    const buildSuffixedElement = (element: string) => document.getElementById(buildSuffixedId(element))

    img.insertAdjacentHTML('afterend', `
    <div id="${buildSuffixedId('area')}" class="select-area-image__area">
            <div id="${buildSuffixedId('areaSelected')}" class="select-area-image__areaSelected">
                <div id="${buildSuffixedId('resizeBottom')}" class="select-area-image__resizeBottom"></div>
                <div id="${buildSuffixedId('resizeTop')}" class="select-area-image__resizeTop"></div>
                <div id="${buildSuffixedId('resizeRight')}" class="select-area-image__resizeRight"></div>
                <div id="${buildSuffixedId('resizeLeft')}" class="select-area-image__resizeLeft"></div>
                <div id="${buildSuffixedId('resizeAll')}" class="select-area-image__resizeAll"></div>
            </div>
        </div>
    `)

    const areaSelected = buildSuffixedElement('areaSelected')
    const area = buildSuffixedElement('area')
    const resizeBottom = buildSuffixedElement("resizeBottom")
    const resizeTop = buildSuffixedElement("resizeTop")
    const resizeRight = buildSuffixedElement("resizeRight")
    const resizeLeft = buildSuffixedElement("resizeLeft")
    const resizeAll = buildSuffixedElement("resizeAll")

    if (
        areaSelected === null ||
        area === null ||
        resizeBottom === null ||
        resizeTop === null ||
        resizeRight === null ||
        resizeLeft === null ||
        resizeAll === null
    ) {
        return
    }

    const eventDetails = () => (<EventDetail>{
        coordinates: {
            x: areaSelected.offsetLeft,
            y: areaSelected.offsetTop,
        },
        size: {
            w: areaSelected.clientWidth,
            h: areaSelected.clientHeight,
        }
    })

    config.minHeight = config.minHeight || 70
    config.minWidth = config.minWidth || 100

    config.size = config.size || {
        w: img.clientWidth * 0.5,
        h: img.clientHeight * 0.25
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

    area.style.width = img.clientWidth + 'px'
    area.style.height = img.clientHeight + 'px'

    config.size.w = clamp(config.size.w, 0, area.clientWidth)
    config.size.h = clamp(config.size.h, 0, area.clientHeight)

    config.coordinates.x = clamp(config.coordinates.x, 0, area.clientWidth - config.size.w)
    config.coordinates.y = clamp(config.coordinates.y, 0, area.clientHeight - config.size.h)

    areaSelected.style.left = config.coordinates.x + 'px'
    areaSelected.style.top = config.coordinates.y + 'px'
    areaSelected.style.width = config.size.w + 'px'
    areaSelected.style.height = config.size.h + 'px'

    let initialAreaSelectedSize: { width: number, height: number } = {
        width: areaSelected.clientWidth,
        height: areaSelected.clientHeight
    }

    const setupResizeMouseDownEvent = (e: MouseEvent, vector: ResizingVector = {x: 0, y: 0}) => {
        if (areaSelected === null) {
            return
        }

        e.stopPropagation()
        resizingVector = vector
        initialAreaSelectedSize.width = areaSelected.clientWidth
        initialAreaSelectedSize.height = areaSelected.clientHeight
        initialMousePosition = {x: e.clientX, y: e.clientY}
    }

    const dispatchEvent = (name: 'moving' | 'resizing') => {
        img.dispatchEvent(new CustomEvent<EventDetail>(name, {detail: eventDetails()}))
    }

    const move = (e: MouseEvent) => {
        if (!isMoving) {
            return
        }
        const rect = area.getBoundingClientRect()

        let x = e.clientX + offsetX - rect.left
        let y = e.clientY + offsetY - rect.top

        areaSelected.style.left = clamp(x, 0, area.clientWidth - areaSelected.clientWidth) + 'px'
        areaSelected.style.top = clamp(y, 0, area.clientHeight - areaSelected.clientHeight) + 'px'

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
            offsetWidth = area.clientWidth - areaSelected.clientWidth - offsetWidth
        }

        if (resizingVector.y < 0) {
            offsetHeight = area.clientHeight - areaSelected.clientHeight - offsetHeight
        }

        areaSelected.style.width = clamp(width, minWidth, area.clientWidth - offsetWidth) + 'px'
        areaSelected.style.height = clamp(height, minHeight, area.clientHeight - offsetHeight) + 'px'

        dispatchEvent('resizing')

    }

    document.body.addEventListener('mousemove', e => {
        move(e)
        resize(e)
    })

    areaSelected.addEventListener('mousedown', e => {
        isMoving = true
        const rect = areaSelected?.getBoundingClientRect();
        offsetX = rect?.left - e.clientX
        offsetY = rect?.top - e.clientY
    })

    document.body.addEventListener('mouseup', e => {
        isMoving = false

        let value = (parseInt(areaSelected.style.right) - area.clientWidth)
        value += areaSelected.clientWidth
        value *= resizingVector.x
        areaSelected.style.left = value + 'px'
        areaSelected.style.right = ""

        let top = (parseInt(areaSelected.style.bottom) - area.clientHeight)
        top += areaSelected.clientHeight
        top *= resizingVector.y
        areaSelected.style.top = top + 'px'
        areaSelected.style.bottom = ""

        resizingVector = {x: 0, y: 0}
    })

    resizeLeft.addEventListener('mousedown', e => {
        setupResizeMouseDownEvent(e, {x: -1, y: 0})

        let value = area.clientWidth - parseInt(areaSelected.style.left)
        value -= areaSelected.clientWidth
        areaSelected.style.right = value + 'px'
        areaSelected.style.left = ""
    })

    resizeTop.addEventListener('mousedown', e => {
        setupResizeMouseDownEvent(e, {x: 0, y: -1})

        let bottom = area.clientHeight - parseInt(areaSelected.style.top)
        bottom -= areaSelected.clientHeight
        areaSelected.style.bottom = bottom + 'px'
        areaSelected.style.top = ""
    })


    resizeRight.addEventListener('mousedown', e => setupResizeMouseDownEvent(e, {x: 1, y: 0}));
    resizeBottom.addEventListener('mousedown', e => setupResizeMouseDownEvent(e, {x: 0, y: 1}))
    resizeAll.addEventListener('mousedown', e => setupResizeMouseDownEvent(e, {x: 1, y: 1}));

    instanceCount++
}