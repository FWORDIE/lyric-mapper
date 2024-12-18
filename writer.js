const { timeEnd } = require("node:console");
const fs = require("node:fs");
var exec = require("child_process").exec;
let artist = "Mark Almond";
let title = "What am I Living For";
let strict = false
console.log("wazzzup bitch");

// Process args from node command line (look at me kim)
process.argv.forEach(function (val, index, array) {

    if (index == 2) {
        title = val;
    }
    if (index == 3) {
        artist = val;
    }

});

let lyrics = `Well I said to my best friend, can't you see what a mess I'm in?
My daddy he taught me to drink whisky
But my momma she died from a-drinkin' gin
My brother, he works in a coal mine, works so hard to get his pay
My sister, she believes in sweet lord Jesus
And she's waitin' for redemption day
What am I livin' for?
Why am I living, why am I giving all my life
To bring up a family, children, and wife
Tell me my friend hasn't that been done before?
I remember my first job, I was singin' with a band
Every payday came around
I'd take my money from the man
He said "Now spend it wisely, boy, or save it while you have the time"
But I got drunk on a stand
And I blew the band
Now I'm standing in the unemployment line
What am I livin' for?
Why am I living, why am I giving all my life
To bring up a family, children, and wife
Tell me my friend hasn't that been done before?
I had me a sweet woman, mine until the sun don't shine
I came home one morning, early
And I found her with a friend of mine
It's not so much I needed her
But oh, God, how to stay away
I packed my bags, and I hit the road
And I've never seen her to this day
What am I livin' for?
Why am I living, why am I giving all my life
To bring up a family, children, and wife
Listen my friend, its been done before`;

const getLyrics = async (title, artist) => {
    const respone = await fetch(`https://lyrist.vercel.app/api/${title}/${artist}`);

    let object = await respone.json();

    if (artist == "anon") {
        artist = object.artist;
    }

    if (object.lyrics) {
        return object.lyrics;
    }
    return "Oops didn't work";
};

const splitWords = (lyrics) => {
    lyrics = lyrics.replace(/ *\[[^\]]*]/g, "");
    console.log(lyrics);
    const splitOne = lyrics.split(/[ ,]+/);
    let splitWords = [];
    splitOne.map((word) => {
        let thisWord = word.split(/\r?\n|\r|\n/g);
        splitWords = [...splitWords, ...thisWord];
    });
    // console.log(splitWords);
    return splitWords.filter((n) => n);
};

const createGraphViz = async (lyrics) => {
    if (title != "") {
        console.log(title);
        lyrics = await getLyrics(title, artist);
    }
    let words = splitWords(lyrics);
    let string = strict ? 'strict' : ''
    string += ` 
    digraph {
        fontname ="Relief SingleLine,Relief SingleLine Regular";
 graph [fontname = "Relief SingleLine,Relief SingleLine Regular"];
 node [fontname = "Relief SingleLine,Relief SingleLine Regular"];
 edge [fontname = "Relief SingleLine,Relief SingleLine Regular"];


    `;
    words.map((word, i) => {
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
    labelloc="t";
    fontsize = 50;
    label="${title} - ${artist}";}`;

    console.log(title);
    let filename = title.replace(/ /g,"_")
    console.log(filename)

    fs.writeFile(`${filename}.dot`, string, (err) => {
        if (err) {
            console.error(err);
        } else {
        }
    });
};

createGraphViz(lyrics);
