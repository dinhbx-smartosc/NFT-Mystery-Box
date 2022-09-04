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

// MysteryBox
export function handleTransferSingle(event: TransferSingle): void {}

export function handleBoxCreated(event: BoxCreated): void {
  const { boxId, nftContractAddresses, nftTokenIDs } = event.params;
  const id = boxId.toHex();
  const box = new Box(id);
  const nfts: string[] = [];
  for (let i = 0; i < nftTokenIDs.length; i++) {
    const address = nftContractAddresses[i];
    const tokenId = nftTokenIDs[i];
    const nftId = address.toHex() + "-" + tokenId.toHex();
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
}

export function handleOpenBoxRequested(event: OpenBoxRequested): void {}

export function handleNFTReceived(event: NFTReceived): void {}

//MarketPlace
export function handleSaleCreated(event: SaleCreated): void {}

export function handleBoxBought(event: BoxBought): void {}

export function handleOpenSaleCanceled(event: SaleCanceled): void {}

export function handlePriceUpdated(event: PriceUpdated): void {}
