# How to use?

### With npm or yarn

```bash
yarn add select-image-area

npm i select-image-area
```

### Exemple for Vue.js 2.0

```html
<template>
    <div>
        <img ref="img" @moving="getEventDataArea" @resizing="getEventDataArea" :src="image.url" alt="">
    </div>
</template

<script>
    import selectImageArea from "./src/main.ts"

    export default {

        data() {
            return {
                area: {}
            }
        },

        methods: {
            selectArea() {
                selectImageArea(this.$refs.img, {...this.area})
            },

            getEventDataArea(e) {
                this.area = {coordinates: {...e.detail.coordinates}, size: {...e.detail.size}}
            },
        }
</script>
```

### Configuration

- minHeight: `number` <br />
- minWidth: `number` <br />
- coordinates:  **x** `number` y `number` <br />
- size:  **w** `number` **h** `number` <br />
