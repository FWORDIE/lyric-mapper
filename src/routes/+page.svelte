<script lang="ts">
    import { instance } from "@viz-js/viz";
    import { pzoom } from "@douganderson444/panzoom-node";
    import { createGraphViz, getLyrics } from "$lib/funcs";
    import type { songDataType } from "$lib/types";
    import { onMount } from "svelte";

    let svgArea: HTMLElement;
    let zoomable: HTMLElement;
    let dimensions = $state({ height: 0, width: 0 });

    let songData: songDataType = $state({
        title: "",
        artist: "",
        lyrics: "",
        colour: [0, 0, 0],
        strict: false,
        text: false,
        layout:'dot'
    });

    const colorIsDarkSimple = (bgColor: number[]) => {
        let r = bgColor[0]; // hexToR
        let g = bgColor[1]; // hexToG
        let b = bgColor[2]; // hexToB
        return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
    };

    const songSearchandRender = async () => {
        fetchandRender(false);
    };

    const topSongandRender = async () => {
        fetchandRender(true);
    };

    const fetchandRender = async (top = true) => {
        svgArea.innerHTML = "<h1>Loading...</h1>";
        let returnData = await getLyrics(songData.artist, songData.title, top);
        songData.title = returnData.title;
        songData.artist = returnData.artist;
        songData.lyrics = returnData.lyrics;
        songData.colour = returnData.colour;
        songData.text = colorIsDarkSimple(returnData.colour);

        let graph = await createGraphViz(songData, dimensions.height / dimensions.width);
        renderSVG(graph);
        resetZoom();
    };

    const renderSVG = (dot: string) => {
        instance().then((viz) => {
            let SVG = viz.renderSVGElement(dot,{engine:songData.layout});
            SVG.setAttribute("height", "auto");
            SVG.setAttribute("width", "100%");
            svgArea.innerHTML = "";

            svgArea.append(SVG);
        });
    };

    const resetZoom = () => {
        zoomable.dispatchEvent(new CustomEvent("home"));
    };

    const handleScaleChg = (e: any) => {};

    onMount(async () => {
        topSongandRender();
    });

    let hide = $state(false);
    let colour = $state(true);
    let invert = $state(false);
    let grabbing = $state(false);

    let style = $state(() => {
        let songText = !invert ? (songData.text ? "black" : "white") : `rgb(${songData.colour})`;
        let songBack = !invert ? `rgb(${songData.colour})` : songData.text ? "black" : "white";
        let basicText = !invert ? "black" : "white";
        let basicBack = !invert ? "white" : "black";
        return colour
            ? {
                  text: songText,
                  back: songBack,
              }
            : {
                  text: basicText,
                  back: basicBack,
              };
    });
</script>

<div
    class="container"
    style="
        --background: white;
        --text: {style().text};
        --background: {style().back};
    "
>
    <div
        class="SVGArea"
        bind:this={svgArea}
        bind:this={zoomable}
        use:pzoom={{ panAnywhere: true }}
        onscale={handleScaleChg}
        bind:clientHeight={dimensions.height}
        bind:clientWidth={dimensions.width}
        class:grabbing
    >
        
    </div>
</div>
<div class="devPanel">
    <div class="menu">
        {#if !hide}
            <div class="item">
                <h3>Lyric Mapper</h3>
                <a href="https://www.fredwordie.com/">By Fred Wordie</a>
            </div>
            <div class="item">
                <span>Title:</span>
                <input type="text" bind:value={songData.title} />
            </div>
            <div class="item">
                <span>Artist:</span>
                <input type="text" bind:value={songData.artist} />
            </div>
            <div class="item">
                <span>Strict Mode:</span>
                <input type="checkbox" bind:checked={songData.strict} />
            </div>
            <div class="item">
                <span>Strict Mode:</span>
                <select id="toolbar-engine" bind:value={songData.layout}
                    ><option>circo</option><option>dot</option><option>fdp</option><option>neato</option><option>nop</option><option>nop1</option><option
                        >nop2</option
                    ><option>osage</option><option>patchwork</option><option>sfdp</option><option>twopi</option></select
                >
            </div>
            <button onclick={songSearchandRender}>Generate Lyric Map</button>
            <div class="item">
                <span>Colour:</span>
                <input type="checkbox" bind:checked={colour} />
            </div>
            <div class="item">
                <span>Invert:</span>
                <input type="checkbox" bind:checked={invert} />
            </div>
            <button onclick={topSongandRender}>Random from Top 10</button>
            <button onclick={resetZoom}>Recenter Map</button>
        {/if}
        <button onclick={() => (hide = !hide)}>{hide ? "show panel" : "hide panel"}</button>
    </div>
    {#if !hide}
        <div class="background"></div>
    {/if}
</div>

<style lang="scss">
    .blank {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 10;
        pointer-events: none;
    }
    .container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: 100dvw;
        height: 100dvh;
        background-color: var(--background);
        cursor: grab;

        .SVGArea {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text);
        }
    }
    .grabbing {
        cursor: grabbing;
    }
    .devPanel {
        position: absolute;
        left: 1vw;
        top: 1vw;
        color: black;
        .background {
            background-color: white;
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
            top: 0;
            left: 0;
        }
        .menu {
            position: relative;
            z-index: 1;
            padding: 1vw;
            display: flex;
            flex-direction: column;
            gap: 1vw;
        }
    }
</style>
