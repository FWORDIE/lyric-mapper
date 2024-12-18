import { error, json } from "@sveltejs/kit";
import Genius from "genius-lyrics";
import Vibrant from "node-vibrant";
// @ts-ignore
import { getChart } from "billboard-top-100";
const ratioTarget = 0.22222;
const textColour = { r: 14, g: 13, b: 13 };

export const GET = async (event) => {
    try {
        const Client = new Genius.Client();
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
        console.log(`${artist} - ${title}`)
        const searches = await Client.songs.search(`${artist} - ${title}`);
        let returnData = {};

        // Pick first one
        const firstSong = searches[0];

        if (firstSong) {
            console.log("About the Song:\n", firstSong, "\n");
            let songData = {
                title: firstSong.title,
                artist: firstSong.artist.name,
                lyrics: await firstSong.lyrics(),
                colour: await getPallete(firstSong.image),
                error: false,
            };
            returnData = songData;
            // // Ok lets get the lyrics
            console.log(songData);
        } else {
            returnData = {
                msg: "Could not find, sorry",
            };
        }

        return json(returnData);
    } catch (e: any) {
        console.error("Error in GET function:", e);
        return json({ error: e.message || "Unknown Error" }, { status: 500 });
    }
};

const top10Func = async () => {
    let top10 = (await getChartAsPromise()) as any[];
    let song = top10[Math.floor(Math.random() * top10.length)];
    console.log(song);

    return song;
};
function getChartAsPromise() {
    return new Promise((resolve, reject) => {
        getChart((err:Error, chart:any) => {
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
