import {describe, it, expect, vi} from "vitest";
import {Window} from "happy-dom";
import SelectImageArea from "../src/main"

// @vitest-environment happy-dom

const window = new Window();
const document = window.document

document.write(`
    <html>
        <head>
             <title>Test page</title>
        </head>
        <body>
             <div>
                <img id="image" src="../public/front_chrome.png" />
            </div>
        </body>
    </html>
`);

vi.stubGlobal('document', document)

describe('selectImageArea', () => {
    it('is mounted successfully', () => {
        const image = document.querySelector('#image');

        SelectImageArea(image as unknown as HTMLElement)

        const area = document.querySelector('#select-image-area__area0')
        expect(area).toBeTruthy()

        const areaSelected = document.querySelector('#select-image-area__area-selected0')
        expect(areaSelected).toBeTruthy()
    })
})
