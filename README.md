# Blockchain-based Authentication

This project shows how the use of Blockchain allows to create a Blockchain-based authentication where the user's login data hash is stored in a smart contract.


## Diagram

The following diagram shows all steps to generate the user's login data hash from the username, the password, the 6 digit code and the ethereum address. To register the user must fill a form to provide the username, the password and the 6 digit code, the ethereum address is retrieved directly from the wallet. This address is associated to the username to generate a signature via the web3 function sign, the generated signature is hashed (hash1). The password is associated with the 6 digit code to generate another hash (hash2). The two hashes are combined to generated the final hash that is stored in the smart contract. To login, the user must be connected to the Blockchain with the same address used during registration, and fill the login form with right username, password and the 6 digit code. The back-end code then generates the hash with this login information and compares it with the hash that was stored in the smart contract by the ethereum address which request the login, if the two hashes match, then the user is authorized to login, if not, the access is denied.

![alt text](https://github.com/Edoumou/blockchain-based-authentication/blob/main/client/src/img/pdf/diagram.png "BBA diagram")

---
