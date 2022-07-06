// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        address candidate_address;
        string name;
        uint voteCount;
        bool approved;

    }
    address public contract_owner;
    uint256 wei_received;
    bool public gift_claimed;


    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;

    mapping(address => uint) private addressmap;
    // Store Candidates Count
    uint public candidatesCount;
    uint public endTime;
    uint public startTime;
    bool public votingProcess;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );
    modifier onlyAdmin(){
        require(contract_owner == msg.sender, "Admin Permission");
        _;
    }
    modifier votingPeriod(){
        require (startTime <= block.timestamp && block.timestamp <= endTime, "Voting Time Error");
        _;
    }
    constructor () payable {
        contract_owner =  msg.sender;
        votingProcess = false;
        wei_received = msg.value;
    }

    function registerCandidate (string memory _name) public {
        // require that they haven't registered before
        require(addressmap[msg.sender] == 0, "Already Registered");
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount,msg.sender, _name, 0, false);
        addressmap[msg.sender] = candidatesCount;
    }

    function approve (uint _candidateId) public onlyAdmin{
        require (candidates[_candidateId].id >= 1 && candidates[_candidateId].approved == false);
        candidates[_candidateId].approved = true;
    }

    function startVote(uint _voteMinutes) public onlyAdmin {
        require(votingProcess == false && _voteMinutes > 0, "Voting in Progress");
        require(candidatesCount >=2, "Less than 2 candidates");
        startTime = block.timestamp;
        endTime = block.timestamp + _voteMinutes*60;
        votingProcess = true;
    }

    function stopVote() public onlyAdmin {
        require(block.timestamp >= endTime && votingProcess);
        votingProcess = false;
        gift_claimed = false;
        startTime = 0;
        endTime = 0;
        for (uint i=1; i<= candidatesCount ; i++) {
            voters[candidates[i].candidate_address] = false;
            candidates[i].id = 0;
            candidates[i].candidate_address = address(0);
            candidates[i].name = '';
            candidates[i].voteCount = 0;
            candidates[i].approved = false;
        }
        candidatesCount = 0;
    }

    function vote (uint _candidateId) public votingPeriod{
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount && candidates[_candidateId].approved == true);

        // record that voter has voted
        voters[msg.sender] = true;
        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function claim_gift() public payable {
        require(block.timestamp >= endTime && votingProcess, "Voting not started");
        require(addressmap[msg.sender] != 0  && candidates[addressmap[msg.sender]].approved, "User not a Candidate");
        require(!gift_claimed, "Already Gift Claimed");
        address payable candidate_addr = payable(msg.sender);
        candidate_addr.transfer(wei_received);
        gift_claimed = true;
    }
}
