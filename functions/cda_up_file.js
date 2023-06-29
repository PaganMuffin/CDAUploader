import { statSync, createReadStream } from "fs";
import { stdout } from "process";
import { genMD5, updateVideo } from "./utils.js";

export const uploadByFile = async (file, title, desc, priv, auth, info) => {
    const stats = statSync(file);
    const fileSizeInBytes = stats.size;

    const md5_gen = genMD5();

    const sett = {
        desc: desc != undefined ? desc : genMD5(),
        title: title != undefined ? title : genMD5(),
        private: priv ? "checked" : "unchecked",
    };

    if (info) console.log("Inicjacja uploadu...");
    const ff = await createUpload(md5_gen, file, fileSizeInBytes, auth);

    if (ff.status == "ok" && ff.new_record) {
        if (info) console.log("Rozpoczynanie uploadu...");
    } else {
        throw ff;
    }
    if (info) console.log("Aktualizowanie ustawień...");

    if (info)
        console.log(
            "Tytuł: ",
            sett.title,
            "\nOpis",
            sett.desc,
            "\nPrywatne: ",
            sett.private
        );
    const update = await updateVideo(
        sett.title,
        sett.desc,
        sett.private,
        ff.id,
        auth
    );
    if (update.status == "ok" && update.isValid == 1) {
        if (info) console.log("Zaktualizowano ustawienia.");
    } else {
        throw update;
    }

    //Upload Section
    let cr = {
        start: 0,
        end: 0,
        chunks: 0,
        size: fileSizeInBytes,
    };
    let i = 0,
        sum = 0;
    while (i < cr.size - 1) {
        if (cr.end === 0) {
            cr.end += 9999;
        } else if (cr.size - 9999 <= 1e7) {
            cr.end = cr.size - 1;
        } else if (cr.end + 1e7 < cr.size) {
            cr.end += 1e7;
        } else {
            cr.end = cr.size - 1;
        }

        const buff = await readStreamInRange(file, cr.start, cr.end);
        const startUpload = new Date().getTime();
        const ff = await PostBuffer(
            buff,
            cr.start,
            cr.end,
            fileSizeInBytes,
            md5_gen,
            file
        );
        const EndUpload = new Date().getTime();
        const ms = EndUpload - startUpload;
        // console.log("Speed",(buff.length/(ms/1000))/1024, "MB/s")
        if (info) {
            if (typeof ff === "object") {
                console.log("Koniec uploadu");
            } else {
                const str =
                    "Range " +
                    ff +
                    " Time [ms] " +
                    ms +
                    " Procent " +
                    (
                        (100 *
                            parseInt(
                                ff.match(/([0-9]+)\-([0-9]+)\/([0-9]+)/)[2]
                            )) /
                        cr.size
                    ).toFixed(2) +
                    "%";
                printProgress(str);
            }
        }
        sum += ms;
        i = cr.end;
        cr.start = cr.end;
    }
    const final = await getID(auth, ff.id);
    if (info) console.log("Upload time:", msToHMS(sum));
    return final;
};

function printProgress(progress) {
    //process.stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(progress);
}

//zwraca buffer
async function readStreamInRange(filename, start, end) {
    return new Promise((resolve, rejects) => {
        const stream = createReadStream(filename, {
            start: start,
            end: end,
        });
        const chunks = [];
        stream.on("data", (data) => {
            chunks.push(data);
        });
        stream.on("close", () => {
            resolve(Buffer.concat(chunks));
        });
    });
}

//0-9999/699020
async function PostBuffer(buffor, start, end, filesize, md5, filename) {
    const response = await fetch(
        "https://upload-resume-04.cda.pl/upload-resume",
        {
            headers: {
                accept: "*/*",
                "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-disposition": `attachment; filename="${filename}"`,
                "content-range": `bytes ${start}-${end}/${filesize}`,
                "content-type": "video/x-matroska",
                filesize: filesize,
                pragma: "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "session-id": md5,
            },
            referrer: "https://www.cda.pl/uploader_video",
            referrerPolicy: "no-referrer-when-downgrade",
            body: buffor,
            method: "POST",
            mode: "cors",
            credentials: "include",
        }
    );
    if (response.headers.get("content-type") === "application/json") {
        const json = await response.json();
        return json;
    } else {
        const text = await response.text();
        return text;
    }
}

async function getID(auth, id) {
    const headers = {
        accept: "application/vnd.cda.public+json",
        "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
        authorization: auth,
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    };

    const config_uploader_link_post = {
        headers: headers,
        referrer: "https://www.cda.pl/uploader_video",
        referrerPolicy: "no-referrer-when-downgrade",
        body: null,
        method: "POST",
        mode: "cors",
        credentials: "include",
    };
    const res2 = await fetch(
        `https://upload-api.cda.pl/uploader/form/${id}`,
        config_uploader_link_post
    );
    const json7 = await res2.json();
    return json7;
}

// { status: 'ok', new_record: true, id: '592809' }
async function createUpload(md5, file, fileSizeInBytes, auth, size) {
    const body = {
        md5_chunk: md5,
        md5_chunksize: 1000003,
        name: file,
        size: fileSizeInBytes,
        type: "video/x-matroska",
        private: 1,
    };

    const mm = await fetch("https://upload-api.cda.pl/uploader", {
        headers: {
            accept: "application/vnd.cda.public+json",
            "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
            authorization: auth,
            "cache-control": "no-cache",
            "content-type": "application/json",
            pragma: "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        },
        referrer: "https://www.cda.pl/uploader_video",
        referrerPolicy: "no-referrer-when-downgrade",
        body: JSON.stringify(body),
        method: "POST",
        mode: "cors",
        credentials: "include",
    });
    const ff = await mm.json();
    return ff;
}

function msToHMS(ms) {
    // 1- Convert to seconds:
    var seconds = ms / 1000;
    // 2- Extract hours:
    var hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    if (hours == 0) {
        hours = "00";
    }
    if (minutes >= 0 && minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds.toFixed(2) == 0.0) {
        seconds = "00.00";
    } else if (parseInt(seconds) >= 0 && parseInt(seconds) < 10) {
        seconds = "0" + seconds.toFixed(2);
    } else {
        seconds = seconds.toFixed(2);
    }
    return hours + ":" + minutes + ":" + seconds;
}
