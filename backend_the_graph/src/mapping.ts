import {
  BoxCreated,
  OpenBoxRequested,
  NFTReceived,
  TransferSingle,
  ApprovalForAll
} from "../generated/MysteryBox/MysteryBox";
import {
  Approval,
  Box,
  BoxBalance,
  EthBalance,
  NFT,
  OpenRequest,
  Sale
} from "../generated/schema";
import {
  SaleCreated,
  BoxBought,
  SaleCanceled,
  PriceUpdated,
  Withdraw
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
    toBalance.box = boxId;
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
  const uri = event.params.uri;

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
  box.tokenURI = uri;
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
  request.box = boxId.toHex();
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

  const box = Box.load(request.box);
  if (!box) {
    return;
  }
  const openedNFT = box.openedNFT;

  for (let i = 0; i < tokenIds.length; i++) {
    const address = nftAddresses[i];
    const tokenId = tokenIds[i];
    const nftId = address.toHex() + "." + tokenId.toHex();
    nfts.push(nftId);
    openedNFT.push(nftId);
  }

  request.openedNFT = nfts;
  request.completed = true;
  request.save();

  box.openedNFT = openedNFT;

  if (box.leftNFT) {
    const newLeftNfts: string[] = [];
    const leftNFT = box.leftNFT;
    for (let i = 0; i < leftNFT.length; i++) {
      const nft = leftNFT[i];
      if (!nfts.includes(nft)) {
        newLeftNfts.push(nft);
      }
    }
    box.leftNFT = newLeftNfts;
  }

  box.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  const approvalId = event.params.account.toHex() + "." + event.params.operator.toHex();
  let approval = Approval.load(approvalId);

  if (!approval) {
    approval = new Approval(approvalId);
    approval.account = event.params.account;
    approval.operator = event.params.operator;
  }

  approval.approved = event.params.approved;
  approval.save();
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
  sale.box = boxId.toHex();
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

  const balanceId = sale.seller.toHex();
  let balance = EthBalance.load(balanceId);
  const addedBalance = event.params.amount.times(sale.priceEach);

  if (!balance) {
    balance = new EthBalance(balanceId);
    balance.account = sale.seller;
    balance.balance = addedBalance;
  } else {
    balance.balance = balance.balance.plus(addedBalance);
  }

  balance.save();
  sale.save();
}

export function handleSaleCanceled(event: SaleCanceled): void {
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

export function handleWithdraw(event: Withdraw): void {
  const balanceId = event.params.account.toHex();
  let balance = EthBalance.load(balanceId);

  if (!balance) {
    return;
  }

  balance.balance = balance.balance.minus(event.params.value);
  balance.save();
}
