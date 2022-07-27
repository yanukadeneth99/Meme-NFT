import { NextPage } from "next";
import Image from "next/image";

const _NFTView: NextPage<any> = ({ nftCollection }) => {
  return (
    <>
      <div className="flex flex-row justify-center items-center w-full">
        {nftCollection.map((nft: any, index: number) => {
          return (
            <Image
              key={nft.id}
              src={nft.image_original_url}
              alt="NFT Image"
              width="150px"
              height="150px"
              layout="fixed"
            />
          );
        })}
      </div>
    </>
  );
};

export default _NFTView;
