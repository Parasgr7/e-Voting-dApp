import Election from "./contracts/Election.json";

const Contract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Election.networks[networkId];

    return new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address);
}

export default Contract;
