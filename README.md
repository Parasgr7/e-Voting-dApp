# Blockchain-based decentralized voting application

This is a demonstration of a Blockchain based authentication and decentralized e-Voting process. In this project login information are not stored in a database, but the hash resulting from login data is stored on a smart contract **[Authentication]**.
Another solidity contract **[Election]** is used for storing the electors as candidates and the voting process is taken care by Admin. At the end of the voting period the results are declared and winning candidate then claims  **1 Ether as prize money**[unlocked from the Smart Contract].
**IPFS[InterPlanetary File System]** is used for storing Id-proof uploaded by candidates.

## Features
1. Deployed Solidity Smart Contract to Ropsten Test Network
2. Solidity Smart Contract Test Cases written
3. Proper error handling [in Smart Contract and Frontend]
4. Usage of InterPlanetary File System[**IPFS**] to store IDProof of Candidates
5. Admin Feature[i.e Contract Owner]
6. Fully functional React App.

## Requirement:

1. Install Metamask extension[without which app will not load]
2. Connect to Ropsten network [Get free ethers for test network](https://faucet.egorfine.com/)
3. Enjoy the dApp [share your feedback]

Access the React project deployed over Ropsten Network [eVoitng dApp](https://parasgr7.github.io/e-Voting-dApp/).

![Homepage](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/1.png "Homepage")
![Canidate](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/2.png "Register as Canidate")
![Approved](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/3.png "Approved Canidate")
![Admin](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/4.png "Admin section")
![transact](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/5.png "Transaction")
![voting](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/6.png "Voting")
![result](https://github.com/Parasgr7/e-Voting-dApp/blob/master/client/src/img/7.png "Result")
