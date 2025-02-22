import Discord, {
  MessageActionRow,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { NFTSale, SaleMethod } from "../marketplaces";
import truncateForAddress from "../truncateForAddress";

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscordSale(
  client: Discord.Client,
  channel: TextChannel,
  nftSale: NFTSale,
  solUsdPrice: number,
  test?: boolean
) {
  if (!client.isReady()) {
    return;
  }
  const { marketplace, nftData } = nftSale;

  const numberFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const price = solUsdPrice * nftSale.getPriceInSOL();

  if (!nftData) {
    console.log("missing nft Data for token: ", nftSale.token);
    return;
  }

  const method = `Sold${
    nftSale.method === SaleMethod.Bid ? " via bidding" : ""
  }`;

  const description = `${method} for ${nftSale.getPriceInSOL()} S◎L on ${
    marketplace.name
  }`;

  const actionRowMsg = new MessageActionRow({
    type: 1,
    components: [
      {
        style: 5,
        label: `View Transaction`,
        url: `https://solscan.io/tx/${nftSale.transaction}`,
        disabled: false,
        type: 2,
      },
      {
        style: 5,
        label: `View Token`,
        url: `https://solscan.io/token/${nftSale.token}`,
        disabled: false,
        type: 2,
      },
    ],
  });

  const embedMsg = new MessageEmbed({
    color: 0x0099ff,
    title: nftData.name,
    url: marketplace.itemURL(nftSale.token),
    timestamp: `${nftSale.soldAt}`,
    fields: [
      {
        name: "Sold for",
        value: `${nftSale.getPriceInSOL()} S◎L (${numberFormatter.format(
          price
        )} USD) ${nftSale.method === SaleMethod.Bid ? "(via bidding)" : ""}`,
        inline: false,
      },
      {
        name: "Buyer",
        value: truncateForAddress(nftSale.buyer),
        inline: true,
      },
      {
        name: "Seller",
        value: nftSale.seller ? truncateForAddress(nftSale.seller) : "unknown",
        inline: true,
      },
    ],
    image: {
      url: `${nftData.image}`,
      width: 600,
      height: 600,
    },
    footer: {
      text: `Sold on ${marketplace.name}`,
      icon_url: marketplace.iconURL,
      proxy_icon_url: marketplace.itemURL(nftSale.token),
    },
  });

  await channel.send({
    // components: [actionRowMsg],
    embeds: [embedMsg],
  });
  const logMsg = `Notified discord #${channel.name}: ${nftData.name} - ${description}`;
  console.log(logMsg);

  if (!test) {
    status.lastNotified = new Date();
    status.totalNotified++;
  }
}
