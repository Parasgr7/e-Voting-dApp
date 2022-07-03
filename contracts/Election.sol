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
    address public admin_address;

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
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
        require(admin_address == msg.sender, "Admin Permission");
        _;
    }
    modifier votingPeriod(){
        require (startTime <= block.timestamp && block.timestamp <= endTime, "Voting Time Error");
        _;
    }
    constructor (){
        admin_address = msg.sender;
        votingProcess = false;
    }

    function registerCandidate (string memory _name) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount,msg.sender, _name, 0, false);
    }

    function approve (uint _candidateId) public onlyAdmin{
        require (candidates[_candidateId].id >= 1 && candidates[_candidateId].approved == false);
        candidates[_candidateId].approved = true;
    }

    function startVote(uint _voteMinutes) public onlyAdmin {
        require(votingProcess == false && _voteMinutes > 0, "Voting in Progress");
        startTime = block.timestamp;
        endTime = block.timestamp + _voteMinutes*60;
        votingProcess = true;
    }
     function stopVote() public onlyAdmin {
        require(block.timestamp >= endTime && votingProcess);
        votingProcess = false;
        startTime = 0;
        endTime = 0;
        for (uint i=1; i<= candidatesCount ; i++) {
            candidates[i].approved = false;
            candidates[i].voteCount = 0;
            voters[candidates[i].candidate_address] = false;
        }
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
}
