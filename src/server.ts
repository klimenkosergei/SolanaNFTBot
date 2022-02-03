import { initClient as initDiscordClient } from "./lib/discord";
import initWorkers from "./workers/initWorkers";
import { newConnection } from "./lib/solana/connection";
import dotenv from "dotenv";
import { loadConfig } from "./config";
import { Worker } from "./workers/types";
import notifyNFTSalesWorker from "./workers/notifyNFTSalesWorker";
import initTwitterClient from "./lib/twitter";

const main = async () => {
  try {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
    const config = loadConfig();

    const web3Conn = newConnection();
    const discordClient = await initDiscordClient();
    const twitterClient = await initTwitterClient();

    const workers: Worker[] = config.subscriptions.map((s) => {
      return notifyNFTSalesWorker(discordClient, twitterClient, web3Conn, {
        discordChannelId: s.discordChannelId,
        mintAddress: s.mintAddress,
      });
    });

    initWorkers(workers);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

main();
