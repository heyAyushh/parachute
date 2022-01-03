export const getProvider = async () => {
  if ("solana" in window) {

    // opens wallet to connect to
    // @ts-expect-error asd
    await window.solana.connect();
    // @ts-expect-error asd
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  } else {
    window.open("https://www.phantom.app/", "_blank");
  }
};