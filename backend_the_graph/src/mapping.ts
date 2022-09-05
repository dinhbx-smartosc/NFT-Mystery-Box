import {
  BoxCreated,
  OpenBoxRequested,
  NFTReceived,
  TransferSingle
} from "../generated/MysteryBox/MysteryBox";
import { Box, BoxBalance, NFT, OpenRequest, Sale } from "../generated/schema";
import {
  SaleCreated,
  BoxBought,
  SaleCanceled,
  PriceUpdated
} from "../generated/Marketplace/MysteryBoxMarketPlace";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// MysteryBox
export function handleTransferSingle(event: TransferSingle): void {
  const boxId = event.params.id.toHex();

  const from = event.params.from.toHex();
  const fromId = from + "." + boxId;
  const fromBalance = BoxBalance.load(fromId);
  if (from !== ADDRESS_ZERO && fromBalance !== null) {
    fromBalance.balance = fromBalance.balance.minus(event.params.value);
    fromBalance.save();
  }

  const to = event.params.to.toHex();
  const toId = to + "." + boxId;
  let toBalance = BoxBalance.load(toId);

  if (to === ADDRESS_ZERO) {
    return;
  }

  if (toBalance === null) {
    toBalance = new BoxBalance(toId);
    toBalance.owner = event.params.to;
    toBalance.boxId = event.params.id;
    toBalance.balance = event.params.value;
  } else {
    toBalance.balance = toBalance.balance.plus(event.params.value);
  }
  toBalance.save();
}

export function handleBoxCreated(event: BoxCreated): void {
  const boxId = event.params.boxId;
  const nftContractAddresses = event.params.nftContractAddresses;
  const nftTokenIDs = event.params.nftTokenIDs;

  const id = boxId.toHex();
  const box = new Box(id);
  const nfts: string[] = [];
  for (let i = 0; i < nftTokenIDs.length; i++) {
    const address = nftContractAddresses[i];
    const tokenId = nftTokenIDs[i];
    const nftId = address.toHex() + "." + tokenId.toHex();
    const nft = new NFT(nftId);
    nft.address = address;
    nft.tokenId = tokenId;
    nft.save();
    nfts.push(nftId);
  }
  box.boxId = boxId;
  box.tokenURI = "";
  box.leftNFT = nfts;
  box.openedNFT = [];
  box.save();
}

export function handleOpenBoxRequested(event: OpenBoxRequested): void {
  const requestId = event.params.requestId;
  const opener = event.params.opener;
  const boxId = event.params.boxId;
  const amount = event.params.amount;

  const request = new OpenRequest(requestId.toHex());
  request.requestId = requestId;
  request.opener = opener;
  request.boxId = boxId;
  request.amount = amount;
  request.openedNFT = [];
  request.completed = false;
  request.save();
}

export function handleNFTReceived(event: NFTReceived): void {
  const requestId = event.params.requestId;

  const nftAddresses = event.params.nftAddresses;
  const tokenIds = event.params.tokenIds;

  const request = OpenRequest.load(requestId.toHex());

  if (request === null) {
    return;
  }

  const nfts: string[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const address = nftAddresses[i];
    const tokenId = tokenIds[i];
    const nftId = address.toHex() + "." + tokenId.toHex();
    nfts.push(nftId);
  }

  request.openedNFT = nfts;
  request.completed = true;

  request.save();
}

//MarketPlace
export function handleSaleCreated(event: SaleCreated): void {
  const saleId = event.params.saleId;
  const seller = event.params.seller;
  const boxId = event.params.boxId;
  const amount = event.params.amount;
  const priceEach = event.params.priceEach;

  const sale = new Sale(saleId.toHex());
  sale.saleId = saleId;
  sale.seller = seller;
  sale.boxId = boxId;
  sale.quantity = amount;
  sale.priceEach = priceEach;
  sale.save();
}

export function handleBoxBought(event: BoxBought): void {
  const saleId = event.params.saleId.toHex();
  const sale = Sale.load(saleId);
  if (sale === null) {
    return;
  }
  sale.quantity = sale.quantity.minus(event.params.amount);
  sale.save();
}

export function handleOpenSaleCanceled(event: SaleCanceled): void {
  const saleId = event.params.saleId.toHex();
  const sale = Sale.load(saleId);
  if (sale === null) {
    return;
  }
  sale.quantity = sale.quantity.minus(event.params.amount);
  sale.save();
}

export function handlePriceUpdated(event: PriceUpdated): void {
  const saleId = event.params.saleId.toHex();
  const sale = Sale.load(saleId);
  if (sale === null) {
    return;
  }
  sale.priceEach = event.params.newPrice;
  sale.save();
}
