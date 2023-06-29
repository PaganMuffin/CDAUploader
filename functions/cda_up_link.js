import { genMD5, updateVideo } from "./utils.js";

export const uploadByLink = async (url, title, desc, priv, auth, info) => {
    return new Promise(async (resolve, rejects) => {
        const md5_gen = genMD5();
        const sett = {
            desc: desc != undefined ? desc : genMD5(),
            title: title != undefined ? title : genMD5(),
            private: priv ? "checked" : "unchecked",
        };

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

        const config_uploader_link_get = {
            headers: headers,
            referrer: "https://www.cda.pl/uploader_video",
            referrerPolicy: "no-referrer-when-downgrade",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
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

        if (info) console.log("Inicjacja uploadu...");
        const json = await createURLUpload(md5_gen, url, auth);
        if (json.status == "ok" && json.new_record) {
            if (info) console.log("Rozpoczynanie uploadu...");
        } else {
            throw json;
        }

        const upload_id = json.id;

        const response3 = await fetch(
            `https://upload-api.cda.pl/uploader/link/${upload_id}`,
            config_uploader_link_post
        );
        const json3 = await response3.json();
        if (info) console.log(`Status uploadu: ${json3.status}`);

        if (info) {
            console.log("Aktualizowanie ustawień...");
            console.log(
                "Tytuł: ",
                sett.title,
                "\nOpis",
                sett.desc,
                "\nPrywatne: ",
                priv
            );
        }

        const response4 = await fetch(
            `https://upload-api.cda.pl/uploader/link/${upload_id}`,
            config_uploader_link_get
        );
        const json4 = await response4.json();

        //============================================================================================================//
        var msg = false;
        const check = setInterval(async () => {
            const server = json4.api_redirect
                ? "?api_srv=" + json4.api_redirect
                : null;
            const res = await fetch(
                `https://upload-api.cda.pl/uploader/link/${upload_id}${server}`,
                config_uploader_link_get
            );
            const json5 = await res.json();

            if (info)
                !msg ? console.log("Start pobierania przez CDA...") : null;
            msg = true;
            if (json5.progress.status === "uploading") {
                const s = json5.progress;
                if (info) {
                    const str =
                        "Progress: " +
                        s.percentage +
                        "%" +
                        " Speed: " +
                        s.speed +
                        " MB/s" +
                        " ETA:" +
                        s.eta +
                        " min";
                    printProgress(str);
                }
            } else if (json5.progress.status === "download_error") {
                clearInterval(check);
                throw JSON.stringify(json5);
            } else if (
                json5.progress.status === "start" ||
                json5.progress.status === "starting"
            ) {
                if (info) console.log("Start");
            } else if (json5.progress.status === "uploaded") {
                const json6 = await updateVideo(
                    sett.title,
                    sett.desc,
                    priv,
                    upload_id,
                    auth
                );

                if (json6.status == "ok" && json6.isValid == 1) {
                    if (info) console.log("Zaktualizowano ustawienia.");
                } else {
                    throw json6;
                }

                const res2 = await fetch(
                    `https://upload-api.cda.pl/uploader/form/${upload_id}`,
                    config_uploader_link_post
                );
                const json7 = await res2.json();
                clearInterval(check);
                resolve(json7);
            }
        }, 2500);
    });
};
function printProgress(progress) {
    //process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}

async function createURLUpload(md5, url, auth) {
    const body = {
        md5_chunk: md5,
        md5_chunksize: 196,
        name: url,
        size: 0,
        type: "",
        private: 1,
        link: url,
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
