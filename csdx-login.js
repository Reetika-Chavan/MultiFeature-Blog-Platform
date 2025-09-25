const { spawn } = require("child_process");
const { authenticator } = require("otplib");
require("dotenv").config({ path: "./apps/blog/.env" });

const email = process.env.EMAIL;
const password = process.env.PASS;
const secret = process.env.DEVMFA;

async function start() {
  const proc = loginProcess();
  await waitForOtpPrompt(proc);
  await selectOtpChannel(proc);
  await submitOtp(proc);
}

start();
//test
function loginProcess() {
  return spawn("csdx", ["auth:login", "-u", email, "-p", password], {
    stdio: ["pipe", "pipe", "inherit"],
  });
}

function waitForOtpPrompt(proc) {
  return new Promise((resolve) => {
    proc.stdout.on("data", (data) => {
      const text = data.toString();
      if (text.includes("Please select OTP channel")) {
        resolve();
      }
    });
  });
}

function selectOtpChannel(proc) {
  return new Promise((resolve) => {
    setTimeout(() => {
      proc.stdin.write("1\n");
      resolve();
    }, 300);
  });
}

function generateOTP() {
  return authenticator.generate(secret);
}

function submitOtp(proc) {
  return new Promise((resolve) => {
    let sentOtp = false;
    let loginDone = false;

    proc.stdout.on("data", (data) => {
      const text = data.toString();

      if (
        !sentOtp &&
        text.toLowerCase().includes("please provide the security code")
      ) {
        sentOtp = true;
        const token = generateOTP();
        proc.stdin.write(token + "\n");
      }

      if (!loginDone && text.toLowerCase().includes("successfully logged in")) {
        loginDone = true;
        console.log("Login successful!");
        resolve();
      }

      if (
        text
          .toLowerCase()
          .includes("two-factor authentication verification failed")
      ) {
        console.error("OTP verification failed");
        resolve();
      }
    });

    proc.on("close", (code) => {
      process.exit(code);
    });
  });
}
