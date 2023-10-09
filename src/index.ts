import ytdl from "ytdl-core";
import fs from "fs";

const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
const formats = ["mp4", "mp3"];

async function getTitle(url: string): Promise<string> {
    return (await ytdl.getInfo(url)).videoDetails.title.replace(/[^a-z0-9() ]/gi, "_");
}

if (!process.argv.includes("--v")) {
    console.log("Use --v [...videos] to specify videos to download");
    process.exit(1);
}

if (!process.argv.includes("--o")) {
    console.log("Use --o [output] to specify output directory");
    process.exit(1);
}

if (
    process.argv.indexOf("--o") > process.argv.indexOf("--v") ||
    process.argv.indexOf("--f") > process.argv.indexOf("--v")
) {
    console.log("--o or --f must come before --v");
    process.exit(1);
}

const videos = process.argv.slice(process.argv.indexOf("--v") + 1);
const outDir = process.argv[process.argv.indexOf("--o") + 1];
const format = process.argv[process.argv.indexOf("--f") + 1] || "mp4";

if (!formats.includes(format)) {
    console.log("Invalid format: " + format);
    console.log("Valid formats: " + formats.join(", "));
    process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

console.log("Downloading " + videos.length + " videos to " + outDir);

videos.forEach(async (video) => {
    if (youtubeRegex.test(video)) {
        const title = await getTitle(video);

        console.log('Downloading "' + title + '"');

        ytdl(video).pipe(fs.createWriteStream(`${outDir}/${title}.${format}`));

        console.log('Downloaded "' + title + '"');
    } else {
        console.log("Not a valid youtube url: " + video);
    }
});
