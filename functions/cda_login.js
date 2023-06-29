import crypto from "crypto";
export const login = (pass) => {
    //arr1 = ["s", "0", "1", "m", "1", "O", "e", "r", "5", "I", "A"]
    //arr2 = ["N", "o", "y", "B", "X", "Q", "E", "T", "z", "S", "O", "L", "W", "X", "g", "W", "s", "0", "1", "m"]
    //arr3 = ["1", "O", "e", "r", "5", "b", "M", "g", "5", "x", "r", "T", "M", "M", "x", "R", "Z", "9", "P", "i"]
    //arr4 = ["4", "f", "I", "P", "e", "F", "g", "I", "V", "R", "Z", "9", "P", "e", "X", "L", "8", "m"]
    //arr5 = ["P", "f", "X", "Q", "E", "T", "Z", "G", "U", "A", "N", "5", "S", "t", "R", "Z", "9", "P"]
    //joined = arr1.join("") + arr2.join("") + arr3.join("") + arr4.join("") + arr5.join("")

    const secret =
        "s01m1Oer5IANoyBXQETzSOLWXgWs01m1Oer5bMg5xrTMMxRZ9Pi4fIPeFgIVRZ9PeXL8mPfXQETZGUAN5StRZ9P";
    const msg = crypto.createHash("md5").update(pass).digest("hex");
    const hash = crypto
        .createHmac("SHA256", secret)
        .update(msg)
        .digest("base64")
        .replaceAll("=", "")
        .replaceAll("/", "_")
        .replaceAll("+", "-");
    return hash;
};

export const getBearer = async (username, password) => {
    const headers = {
        accept: "application/vnd.cda.public+json",
        "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
        authorization:
            "Basic OWIzMmEwYmUtYmVkYy00NjRlLTk5NjUtOGM4ZDgwYjFkNzY3Ojg3d3RkejkwaTc1akU0ZExUbG9jRmZBODVLdEdUVERRQ3JFNzFqalZ3Ujg2d0ljTUVXUDgyTDM5SlFPVnhxaUQ",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    };
    const url = `https://upload-api.cda.pl/oauth/token?grant_type=password&login=${username}&password=${password}`;
    const res = await fetch(url, { method: "POST", headers: headers });
    const json = await res.json();
    return json;
};
