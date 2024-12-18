import type { songDataType } from "./types";

export const getLyrics = async (title: string, artist: string, top: boolean) => {
    const respone = await fetch(
        `/api/lyrics?` +
            new URLSearchParams({
                title: title,
                artist: artist,
                top: top.toString(),
            }).toString(),
        {
            headers: {
                Accept: "application/json",
            },
        }
    );

    let object = await respone.json();
    console.log(object);
    if (object) {
        return object;
    }

    return "Oops didn't work";
};

export const createGraphViz = (songInfo: songDataType, ratio: number) => {
    let words = splitWords(songInfo.lyrics);
    let string = songInfo.strict ? "strict" : "";
    string += ` 
digraph {
ratio=${ratio.toFixed(2)};
    "${songInfo.artist}" [shape=box];
    "${songInfo.title}" [shape=box];
  "${songInfo.title}" ->  "${songInfo.artist}" ->

`;
    words.map((word: string, i: number) => {
        word = word.replace('"', "`");
        word = word.replace(")", "");
        word = word.replace("(", "");
        word = word.replace(`"`, `'`);

        word = word.toLowerCase();
        string += '"' + word + '"';
        if (i != words.length - 1) {
            string += " -> ";
        }
    });

    string += `
    pad=1;
}`;
    return string;
};

const splitWords = (string: string) => {
    string = string.replace(/ *\[[^\]]*]/g, "");
    // console.log(string);
    let splitOne = string.split(/[ ,]+/);
    let splitWordsArray: string[] = [];
    splitOne.map((word) => {
        let thisWord = word.split(/\r?\n|\r|\n/g);
        splitWordsArray = [...splitWordsArray, ...thisWord];
    });
    // console.log(splitWords);
    return splitWordsArray.filter((n) => n);
};


