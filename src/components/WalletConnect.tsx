import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';

const WalletConnect = () => {
  const { isConnected } = useAccount();

  // Fallback component in case of RainbowKit issues
  const FallbackConnect = () => (
    <Button 
      variant="outline"
      className="border-primary/50 text-primary hover:bg-primary/10"
      onClick={() => console.log('Wallet connection not available')}
    >
      Connect Wallet
    </Button>
  );

  try {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button 
                      onClick={openConnectModal} 
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive">
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span>{account.ensName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</span>
                      </div>
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    );
  } catch (error) {
    console.error('RainbowKit error:', error);
    return <FallbackConnect />;
  }
};

export default WalletConnect;