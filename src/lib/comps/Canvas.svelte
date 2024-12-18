<script lang="ts">
    import { panzoom, type Options } from "svelte-pan-zoom";


    let { image } = $props();
    function render(ctx: CanvasRenderingContext2D, t: number) {
        if (image) {
            ctx.drawImage(image, 0, 0);
        }
    }
</script>

{#if image}
    <canvas use:panzoom={{ render, width: image.width, height: image.height, friction: 0.1, padding: 200 }} />
{/if}

<style>
    canvas {
        box-sizing: border-box;
        width: 100dvw;
        height: 100dvh;
        user-select: none;
        touch-action: none;
        overflow: hidden;
        background-color: blue;
        overscroll-behavior: none;
        -webkit-user-select: none; /* disable selection/Copy of UIWebView */
        -webkit-touch-callout: none; /* disable the IOS popup when long-press on a link */
    }
</style>
