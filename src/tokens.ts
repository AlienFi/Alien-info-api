import { NowRequest, NowResponse } from '@now/node'
import { return200, return500,return400 } from './utils/response'
import { getAddress } from "@ethersproject/address";
import {getBundleEthPrice, getTokenByAddress} from "./_shared"
export default async function (req: NowRequest, res: NowResponse): Promise<void> {
  if (
    !req.query.address ||
    typeof req.query.address !== "string" ||
    !req.query.address.match(/^0x[0-9a-fA-F]{40}$/)
  ) {
    return400(res, "Invalid address");
    return;
  }

  try {
    const ethPriceData=await getBundleEthPrice()
    const ethPrice=ethPriceData?.bundle?.ethPrice    
    const address = getAddress(req.query.address);
    const token = await getTokenByAddress(address.toLowerCase());

    return200(res, {
      updated_at: new Date().getTime(),
      data: {
        name: token?.name,
        symbol: token?.symbol,
        price_usd: token?.derivedETH * ethPrice,
        price_eth: token?.derivedETH,
      },
    }, 60 * 60 * 24);
  } catch (error) {
    return500(res, error);
  }
}
