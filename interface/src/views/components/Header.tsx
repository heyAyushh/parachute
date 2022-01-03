import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Img from 'next/image';

export default function Header() {
  return (
    <div className="navbar mb-2 mt-8 ml-16 mr-16 shadow-lg bg-neutral text-neutral-content rounded-box">
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <span className="text-4xl">
            <Img width={64} height={64} placeholder="empty" src="https://img.icons8.com/external-photo3ideastudio-gradient-photo3ideastudio/64/000000/external-parachute-military-photo3ideastudio-gradient-photo3ideastudio.png" />
          </span>
        </button>
      </div>
      <div className="flex-1 px-2 mx-2">
        {/* <span className="text-lg font-bold">Caw Caw</span> */}
      </div>
      <div className="flex-none">
        <WalletMultiButton className="btn btn-ghost" />
      </div>
    </div>
  )
};