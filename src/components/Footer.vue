<script>
export default {
    setup() {
        const d = new Date();
        return {
            year: d.getFullYear()
        }
    }
}

</script>

<template>
    <div
        class="border-t border-gray-300 p-4 mt-10 text-center bg-white text-gray-400"
    >Copyright © {{ year }} TemcoControls, All Rights Reserved.</div>
</template>

<style>
</style>
