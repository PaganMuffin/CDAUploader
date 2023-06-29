import crypto from "crypto";

export const updateVideo = async (title, desc, priv, id, auth) => {
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

    const config_uploader_form_put = {
        headers: headers,
        referrer: "https://www.cda.pl/uploader_video",
        referrerPolicy: "no-referrer-when-downgrade",
        body: JSON.stringify({
            nazwa_wyswietlana: title,
            opis: desc,
            private: priv,
            dla_doroslych: "",
            parental_przemoc: "tak",
            parental_seks: "tak",
            parental_uzaleznienia: "tak",
            parental_wulgaryzmy: "tak",
            regulamin: "checked",
            oswiadczenie: "checked",
            tags: [],
            fake_id: "",
        }),
        method: "PUT",
        mode: "cors",
        credentials: "include",
    };
    const response = await fetch(
        `https://upload-api.cda.pl/uploader/form/${id}`,
        config_uploader_form_put
    );
    const json = await response.json();
    console.log(json);
    if (json.status == "ok" && json.isValid == 1) {
        return json;
    } else {
        return 0;
    }
};

export const genMD5 = () => {
    return crypto
        .createHash("md5")
        .update(`${new Date().getTime()}`)
        .digest("hex");
};
