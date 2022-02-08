import TwitterAPI from "twitter-api-v2";
// import { fileTypeFromBuffer } from "file-type";
import { NFTSale, SaleMethod } from "../marketplaces";
import axios from "axios";

export default async function notifyTwitter(
  twitterClient: TwitterAPI,
  nftSale: NFTSale,
  solUsdPrice: number
) {
  const { marketplace, nftData } = nftSale;

  const numberFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const price = solUsdPrice * nftSale.getPriceInSOL();

  const nftName = nftData?.name;
  const text = `Welcome to the Echelon, operative. Stay vigilant.\n${nftName}\n\nPecked for ${nftSale.getPriceInSOL()} S◎L (${numberFormatter.format(
    price
  )} USD) on ${marketplace.name}! \n\n${marketplace.itemURL(nftSale.token)}`;
  const mediaArr: string[] = [];
  if (Boolean(nftSale.nftData?.image)) {
    const data = await getImageDataFromUrl(nftSale.nftData?.image as string);
    const media = await twitterClient.v1.uploadMedia(data, {
      type: await getDataType(data),
    });
    mediaArr.push(media);
  }
  return twitterClient.v1.tweet(text, {
    media_ids: mediaArr,
  });
}

async function getDataType(buffer: Buffer) {
  // reason why the import is here: https://github.com/sindresorhus/file-type/issues/525
  const { fromBuffer } = await import("file-type");
  const result = await fromBuffer(buffer);
  return result ? result.ext : undefined;
}

async function getImageDataFromUrl(url: string) {
  const img = await axios.get(url, { responseType: "arraybuffer" });
  return img.data as Buffer;
}
