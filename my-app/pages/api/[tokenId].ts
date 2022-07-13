export default function handler(req: any, res: any) {
  const tokenId = req.query.tokenId;
  const name = `Meme NFT #${tokenId}`;
  const description = "Meme NFTs";
  const image = `https://raw.githubusercontent.com/yanukadeneth99/Meme-NFT/master/my-app/public/nft/${tokenId}.png`;

  return res.status(200).json({
    name: name,
    description: description,
    image: image,
  });
}
