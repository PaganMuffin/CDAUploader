import { login, getBearer } from "./functions/cda_login.js";
import { uploadByLink } from "./functions/cda_up_link.js";
import { uploadByFile } from "./functions/cda_up_file.js";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const yarg = yargs(hideBin(process.argv));

const argv = yarg
    .option("file", {
        alias: "f",
        description: "Scieżka do pliku na dysku (wymagane)",
        type: "string",
    })
    .option("link", {
        alias: "l",
        description: "Link do pliku (wymagane)",
        type: "string",
    })
    .option("description", {
        alias: "d",
        description:
            "opis filmu, jeżeli nie podane program wygeneruje losowy hash",
        type: "string",
    })
    .option("title", {
        alias: "t",
        description:
            "tytuł filmu, jeżeli nie podane program wygeneruje losowy hash",
        type: "string",
    })
    .option("username", {
        alias: "u",
        description: "nazwa użytkownika",
        type: "string",
    })
    .option("password", {
        alias: "p",
        description: "hasło do konta",
        type: "string",
    })
    .option("private", {
        description: "Ustawia wrzucanemu filmowi status prywatny",
        type: "boolean",
    })
    .option("info", {
        description: "Wyswietlanie informacji o postępie wrzucania",
        type: "boolean",
    })
    .help()
    .alias("help", "h").argv;

(async function () {
    let auth =
        "Basic OWIzMmEwYmUtYmVkYy00NjRlLTk5NjUtOGM4ZDgwYjFkNzY3Ojg3d3RkejkwaTc1akU0ZExUbG9jRmZBODVLdEdUVERRQ3JFNzFqalZ3Ujg2d0ljTUVXUDgyTDM5SlFPVnhxaUQ";
    if (argv.u && argv.p) {
        const acc_password = login(argv.p);
        const ff = await getBearer(argv.u, acc_password);
        if (ff.error) {
            console.log(ff);
            return;
        }
        auth = `Bearer ${ff.access_token}`;
    }

    if (argv.f && argv.l) {
        console.log("Podaj tylko jeden argument: -f lub -l");
        return;
    }

    if (argv.f) {
        const res = await uploadByFile(
            argv.f,
            argv.t,
            argv.d,
            argv.private,
            auth,
            true
        );
        console.log("https://www.cda.pl/video/" + res.pliki_key);
    } else if (argv.l) {
        const res = await uploadByLink(
            argv.l,
            argv.t,
            argv.d,
            argv.private,
            auth,
            true
        );
        console.log("https://www.cda.pl/video/" + res.pliki_key);
    } else {
        console.log("Podaj link albo ścieźkę do pliku");
    }
})();
