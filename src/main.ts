import './style.css'
import {clamp} from './helpers'

interface ResizingVector {
    x: number,
    y: number
}

interface SelectAreaConfig {
    minHeight: number
    minWidth: number
}

export const selectArea = (img: HTMLImageElement, config: Partial<SelectAreaConfig>) => {

    config.minHeight = config.minHeight || 70
    config.minWidth = config.minWidth || 100

    img.insertAdjacentHTML('afterend', `
    <div id="area">
            <div id="areaSelected" style="width: 150px;  height: 100px;top: 100px; left: 100px;">
                <div id="resizeRight"></div>
                <div id="resizeLeft"></div>
                <div id="resizeTop"></div>
                <div id="resizeBottom"></div>
                <div id="resizeAll"></div>
            </div>
        </div>
    `)
    img.src = './src/front_chrome.png'

    const areaSelected = document.getElementById('areaSelected')
    const area = document.getElementById('area')
    const resizeBottom = document.getElementById("resizeBottom")
    const resizeTop = document.getElementById("resizeTop")
    const resizeRight = document.getElementById("resizeRight")
    const resizeLeft = document.getElementById("resizeLeft")
    const resizeAll = document.getElementById("resizeAll")
    const minHeight = config.minHeight
    const minWidth = config.minWidth
    let resizingVector: ResizingVector = {x: 0, y: 0}
    let isMoving = false
    let initialMousePosition = {x: 0, y: 0}
    let offsetX = 0
    let offsetY = 0


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

    let initialAreaSelectedSize: { width: number, height: number } = {
        width: areaSelected.clientWidth,
        height: areaSelected.clientHeight
    }

    function setupResizeMouseDownEvent(e: MouseEvent, vector: ResizingVector = {x: 0, y: 0}) {
        if (areaSelected === null) {
            return
        }

        e.stopPropagation()
        resizingVector = vector
        initialAreaSelectedSize.width = areaSelected.clientWidth
        initialAreaSelectedSize.height = areaSelected.clientHeight
        initialMousePosition = {x: e.clientX, y: e.clientY}
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
}

selectArea(document.getElementsByTagName('img')[0], {minHeight: 30})