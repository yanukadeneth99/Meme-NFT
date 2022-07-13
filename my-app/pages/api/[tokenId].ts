export default function handler(req: any, res: any) {
  const tokenId = req.query.tokenId;
  const name = `Meme NFT #${tokenId}`;
  const description = "Meme NFTs";
  const image = `#/${tokenId}`;

  return res.status(200).res.json({
    name: name,
    description: description,
    image: image,
  });
}
