interface ResizingVector {
    x: -1 | 0 | 1,
    y: -1 | 0 | 1
}

interface SelectImageAreaConfig {
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


interface ResizeHandle {
    id: string,
    vector: ResizingVector
}

interface SelectImageAreaElementsData {
    area: {
        id: string
    }
    areaSelected: {
        id: string
    }
    resizeHandles: {
        resizeB: ResizeHandle
        resizeT: ResizeHandle
        resizeR: ResizeHandle
        resizeL: ResizeHandle
        resizeBL: ResizeHandle
        resizeBR: ResizeHandle
        resizeTR: ResizeHandle
        resizeTL: ResizeHandle
    }
}

export type {
    ResizingVector,
    SelectImageAreaElementsData,
    SelectImageAreaConfig,
    EventDetail
}
