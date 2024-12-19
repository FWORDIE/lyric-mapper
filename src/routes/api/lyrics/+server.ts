import { json } from "@sveltejs/kit";
import Genius from "genius-lyrics";
import Vibrant from "node-vibrant";
import * as cheerio from "cheerio";

// @ts-ignore
import { getChart } from "billboard-top-100";
import { KEY } from "$env/static/private";
const ratioTarget = 0.22222;
const textColour = { r: 14, g: 13, b: 13 };

export const GET = async (event) => {
    try {
        const Client = new Genius.Client(KEY);
        const top = event.url.searchParams.get("top");
        let artist = "";
        let title = "";
        if (top == "true") {
            let song = await top10Func();
            artist = song.artist;
            title = song.title;
        } else {
            artist = event.url.searchParams.get("artist") as string;
            title = event.url.searchParams.get("title") as string;
        }
        // console.log(`${artist} - ${title}`);

        const searches = await Client.songs.search(`${artist} - ${title}`);

        // console.log(searches);
        let returnData = {};

        // Pick first one
        const firstSong = searches[0];
        // console.log("first song:", firstSong);

        // console.log('lyrics', lyrics)
        if (firstSong) {
            // console.log("About the Song:\n", firstSong, "\n");
            let html = await fetch(firstSong.url);
            console.log('firstSong.ur:', firstSong.url)

            const body = await html.text();
            const $ = cheerio.load(body);
            console.log('body:', body)
            let string = $("[data-lyrics-container='true']")
                .contents()
                .map(function () {
                    return this.type === "text" ? $(this).text() + " " : "";
                })
                .get()
                .join("");
                console.log('string:', string)


            let songData = {
                title: firstSong.title,
                artist: firstSong.artist.name,
                lyrics: string,
                colour: await getPallete(firstSong.image),
                error: false,
            };
            returnData = songData;
            // // Ok lets get the lyrics
            // console.log("song data", songData);
        } else {
            returnData = {
                msg: "Could not find, sorry",
            };
        }
        // console.log("return data", returnData);

        return new Response(JSON.stringify(returnData), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (e: any) {
        console.error("Error in GET function:", e);
        return json({ error: e.message || "Unknown Error" }, { status: 500 });
    }
};

const top10Func = async () => {
    let top10 = (await getChartAsPromise()) as any[];
    let song = top10[Math.floor(Math.random() * top10.length)];
    // console.log(song);

    return song;
};
function getChartAsPromise() {
    return new Promise((resolve, reject) => {
        getChart((err: Error, chart: any) => {
            if (err) {
                reject(err); // Reject the Promise on error
            } else {
                resolve(chart.songs.slice(0, 10)); // Resolve the Promise with the chart
            }
        });
    });
}

const getPallete = async (src: string) => {
    try {
        let pal = await Vibrant.from(src).getPalette();
        return pal.Vibrant?.rgb;
    } catch (e) {
        console.error("Error in getPalette function:", e);
        throw new Error("Failed to get palette.");
    }
};
