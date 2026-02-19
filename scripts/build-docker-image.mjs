import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const IMAGE_NAME = "hellllex/hell-llex-bot";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.join(repoRoot, "package.json");

function isSemver(value) {
    return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

async function readPackageJson() {
    const raw = await fs.readFile(packageJsonPath, "utf8");
    return { data: JSON.parse(raw) };
}

async function writePackageJson(data) {
    const next = `${JSON.stringify(data, null, 2)}\n`;
    await fs.writeFile(packageJsonPath, next, "utf8");
}

function runCommand(cmd, args) {
    console.log(`Запуск: ${cmd} ${args.join(" ")}`);
    if (input.isTTY) input.setRawMode(false);
    input.pause();
    const result = spawnSync(cmd, args, {
        cwd: repoRoot,
        stdio: ["ignore", "inherit", "inherit"],
        shell: process.platform === "win32",
    });

    if (result.error) {
        console.error(`Не удалось запустить команду ${cmd}:`, result.error.message);
        process.exit(1);
    }

    if ((result.status ?? 1) !== 0) {
        process.exit(result.status ?? 1);
    }
}

function runCommandOptional(cmd, args) {
    console.log(`Запуск: ${cmd} ${args.join(" ")}`);
    if (input.isTTY) input.setRawMode(false);
    input.pause();
    const result = spawnSync(cmd, args, {
        cwd: repoRoot,
        stdio: ["ignore", "inherit", "inherit"],
        shell: process.platform === "win32",
    });

    if (result.error) {
        console.warn(`Не удалось запустить команду ${cmd}: ${result.error.message}`);
        return;
    }

    if ((result.status ?? 1) !== 0) {
        console.warn(`Команда завершилась с кодом ${result.status ?? 1}, продолжаем.`);
    }
}

async function askYesNoInstant(question) {
    if (!input.isTTY) {
        const rl = readline.createInterface({ input, output });
        try {
            const answer = (await rl.question(`${question} [y/N]: `)).trim().toLowerCase();
            return ["y", "yes", "д", "да"].includes(answer);
        } finally {
            rl.close();
        }
    }

    process.stdout.write(`${question} [y/N]: `);
    return await new Promise((resolve) => {
        const onData = (chunk) => {
            const key = String(chunk);

            if (key === "\u0003") {
                process.stdout.write("\n");
                process.exit(130);
            }

            if (key === "\r" || key === "\n") {
                process.stdout.write("N\n");
                cleanup();
                resolve(false);
                return;
            }

            const lower = key.toLowerCase();
            if (lower === "y" || lower === "д") {
                process.stdout.write(`${key}\n`);
                cleanup();
                resolve(true);
                return;
            }

            if (lower === "n" || lower === "н") {
                process.stdout.write(`${key}\n`);
                cleanup();
                resolve(false);
            }
        };

        const cleanup = () => {
            if (input.isTTY) input.setRawMode(false);
            input.pause();
            input.removeListener("data", onData);
        };

        if (input.isTTY) input.setRawMode(true);
        input.resume();
        input.on("data", onData);
    });
}

async function main() {
    const { data: pkg } = await readPackageJson();
    let version = pkg.version;
    const previousVersion = version;
    let versionUpdated = false;

    const shouldUpdate = await askYesNoInstant("Обновить версию перед сборкой?");

    if (shouldUpdate) {
        const rl = readline.createInterface({ input, output });
        try {
            const versionQuestion = rl.question("Новая версия: ");
            rl.write(version);
            const typed = (await versionQuestion).trim();
            const nextVersion = typed || version;

            if (!isSemver(nextVersion)) {
                console.error(`Некорректная версия: "${nextVersion}". Ожидается semver, например 1.0.0`);
                process.exit(1);
            }

            if (nextVersion !== version) {
                pkg.version = nextVersion;
                await writePackageJson(pkg);
                console.log(`package.json version: ${version} -> ${nextVersion}`);
                version = nextVersion;
                versionUpdated = true;
            } else {
                console.log(`Версия не изменена: ${version}`);
            }
        } finally {
            rl.close();
        }
    } else {
        console.log(`Оставляем текущую версию: ${version}`);
    }

    const buildArgs = [
        "build",
        "-t",
        `${IMAGE_NAME}:latest`,
        "-t",
        `${IMAGE_NAME}:${version}`,
        ".",
    ];
    runCommand("docker", buildArgs);

    runCommand("docker", ["push", `${IMAGE_NAME}:latest`]);
    runCommand("docker", ["push", `${IMAGE_NAME}:${version}`]);

    if (versionUpdated) {
        runCommandOptional("docker", ["image", "rm", `${IMAGE_NAME}:${previousVersion}`]);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
