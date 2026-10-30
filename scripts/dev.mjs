import net from "node:net";
import { spawn } from "node:child_process";

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ port, host: "::" }, () => {
      server.close(() => resolve(true));
    });
  });

const findPort = async (start) => {
  for (let port = start; port < start + 50; port++) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found from ${start}`);
};

const preferred = Number(process.env.PORT) || 3000;
let port = preferred;

if (!(await isPortFree(preferred))) {
  port = await findPort(preferred + 1);
  console.log(`Port ${preferred} is busy, using port ${port} instead.`);
}

const child = spawn(`next dev -p ${port} 2>&1 | tee dev.log`, {
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
