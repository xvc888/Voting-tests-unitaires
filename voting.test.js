const { BN, ether, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { assert } = require('console');
const { find } = require('lodash');
const { from } = require('responselike');


let voting = artifacts.require('Voting.sol');

contract('voting', accounts => {

    const proposal = "Proposal";
    const owner = accounts[0];
    const voter = accounts[1];
    const nonVoter = accounts[2];


    // OWNER privilèges

    describe("Privilèges owner", function () {

        beforeEach(async () => {
            this.voting = await voting.new({ from: owner });
        });

        it('Should addvoter only if owner', async () => {
            await expectRevert(this.voting.addVoter(voter, { 'from': voter }), "caller is not the owner");
        });

        it('should StartProposalRegistering only if owner', async () => {
            await expectRevert(this.voting.startProposalsRegistering({ 'from': voter }), "caller is not the owner");
        });

        it('should endProposalRegistering only if owner', async () => {
            await expectRevert(this.voting.endProposalsRegistering({ 'from': voter }), "caller is not the owner");
        });

        it('Should startVotingSession only if owner', async () => {
            await expectRevert(this.voting.startVotingSession({ 'from': voter }), "caller is not the owner");
        });
        it('Should endVotingSession only if owner', async () => {
            await expectRevert(this.voting.endVotingSession({ 'from': voter }), "caller is not the owner");
        });
        it('Should tallyVotes only if owner', async () => {
            await expectRevert(this.voting.tallyVotes({ 'from': voter }), "caller is not the owner");
        });

    });

    // VOTER Privilèges

    describe("Privilèges des voters", function () {
        before('Deploy du contrat voting pour test voters only', async () => {
            this.voting = await voting.deployed();
        });
        it('Should getVoter only if voter', async () => {
            await expectRevert(this.voting.getVoter(voter, { 'from': voter }), "You're not a voter");
        });
        it('Should getOneProposal only if voter', async () => {
            await expectRevert(this.voting.getOneProposal(0, { 'from': voter }), "You're not a voter");
        });
        it('Should addProposal only if voter', async () => {
            await expectRevert(this.voting.addProposal(proposal, { 'from': voter }), "You're not a voter");
        });
        it('Should setVote only if voter', async () => {
            await expectRevert(this.voting.setVote(0, { 'from': voter }), "You're not a voter");
        });
    });



    //:::::::::::SETTERS:::::::::::

    describe("Setters et gestion des votes", function () {

        beforeEach(async () => {
            this.voting = await voting.new({ from: owner });
        });

        it("should add a proposal", async () => {
            await this.voting.addVoter(owner, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            const proposal = await this.voting.addProposal("myProposal", { from: owner });
            await this.voting.getOneProposal(0); // ici je récupere une proposition

            expect(proposal).to.exist
            expect(proposal).not.to.be.empty;
        });
        // ::::::::::::::::::::: VOTE ::::::::::::::::::::::::::::::::::

        it("should set vote if wf status is votingSession started", async () => {
            let idProposal = 0;
            await this.voting.addVoter(voter, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            await this.voting.addProposal("Bobo", { from: voter });
            await this.voting.endProposalsRegistering({ from: owner });

            await this.voting.startVotingSession({ from: owner });
            await this.voting.setVote(idProposal, { from: voter });

            const proposal = await this.voting.getOneProposal(idProposal, { from: voter });
            const voterInfo = await this.voting.getVoter(voter, { from: voter })

            expect(new BN(proposal.voteCount)).to.be.a.bignumber.that.equals(new BN(1))
            expect(new BN(voterInfo.votedProposalId)).to.be.a.bignumber.that.equals(new BN(idProposal))

            expect(voterInfo.hasVoted).to.be.true;
            expect(voterInfo.hasVoted).to.be.true;
        });


    });

    // ::::::::::::: GETTERS ::::::::::::: //

    describe("Getters", async function () {

        beforeEach(async () => {
            this.voting = await voting.new({ from: owner });
        });

        it("Should get winningId Proposal, tally votes", async () => {

            await this.voting.addVoter(voter, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            await this.voting.addProposal("prop 1", { from: voter });
            await this.voting.endProposalsRegistering({ from: owner });

            await this.voting.startVotingSession({ from: owner });
            await this.voting.setVote(0, { from: voter });

            await this.voting.endVotingSession({ from: owner });

            const result = await this.voting.tallyVotes({ from: owner });
            const winningProposalID = await this.voting.winningProposalID({ 'from': owner });

            expect(winningProposalID).to.be.bignumber.equal(new BN(0));
            expectEvent(result, 'WorkflowStatusChange', { previousStatus: new BN(voting.WorkflowStatus.VotingSessionEnded), newStatus: new BN(voting.WorkflowStatus.VotesTallied) });
        });
        it("Should change Voter status to true in Voter Struct", async () => {
            await this.voting.addVoter(voter, { from: owner });

            const result = await this.voting.getVoter(voter, { from: voter });
            expect(result.isRegistered === true);

            expect(result.hasVoted === false);
            expect(result.votedProposalId === 0);
        });

        it("Should revert if voter is not registered when getVoter is called", async () => {
            await expectRevert(this.voting.getVoter(voter, { from: nonVoter }), "You're not a voter");
        })


        it("Should return voter when getVoter is called", async () => {
            await this.voting.addVoter(voter, { from: owner });
            const result = await this.voting.getVoter(voter, { from: voter });

            expect(result).to.have.property('isRegistered');
            expect(result).to.have.property('hasVoted');
            expect(result).to.have.property('votedProposalId');
        })
        it("Should return a proposal id when getOneProposal is called", async () => {
            await this.voting.addVoter(voter, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            const proposal = await this.voting.addProposal("Bobo", { from: voter });
            const proposal2 = await this.voting.addProposal("Bibi", { from: voter });

            const storedData = await this.voting.getOneProposal(0, { from: voter });
            const storedData2 = await this.voting.getOneProposal(1, { from: voter });
        });
    });


    // ::::::::::::::::::: STATUS CHANGE ::::::::::::::::::::::::::

    describe("Status", async function () {
        beforeEach(async () => {
            this.voting = await voting.new({ from: owner });
        });

        it("Vérifie que le wf status est bien ProposalsResgistrationStarted", async () => {
            let status = await this.voting.workflowStatus();
            await this.voting.startProposalsRegistering({ from: owner });
            expect(new BN(status)).to.be.bignumber.equal(new BN(this.voting.workflowStatus.ProposalsRegistrationStarted));

        });

        //function startProposalsRegistering() external onlyOwner
        it("Vérifie le require de startProposalsRegistering", async () => {
            await expectRevert(this.voting.startProposalsRegistering({ from: voter }), "caller is not the owner");
        });

        //function endProposalsRegistering() external onlyOwner
        it("Vérifie le require de endProposalsRegistering", async () => {
            await expectRevert(this.voting.endProposalsRegistering({ from: voter }), "caller is not the owner");
            await expectRevert(this.voting.endProposalsRegistering({ from: owner }), "Registering proposals havent started yet");
        });

        //function startVotingSession() external onlyOwner
        it("Vérifie le require de startVotingSession", async () => {
            await expectRevert(this.voting.startVotingSession({ from: voter }), "caller is not the owner");
            await expectRevert(this.voting.startVotingSession({ from: owner }), "Registering proposals phase is not finished");
        });

        //function endVotingSession() external onlyOwner
        it("Vérifie le require de endVotingSession", async () => {
            await expectRevert(this.voting.endVotingSession({ from: voter }), "caller is not the owner");
            await expectRevert(this.voting.endVotingSession({ from: owner }), "Voting session havent started yet");
        });

        //function tallyVotes() external onlyOwner();
        it("Vérifie le require de tallyVotes", async () => {
            await expectRevert(this.voting.tallyVotes({ from: voter }), "caller is not the owner");
            await expectRevert(this.voting.tallyVotes({ from: owner }), "Current status is not voting session ended");
        });

    });

    //::::::::::::::::::: LES REQUIRES ::::::::::::::::


    describe("Requires", function () {
        beforeEach(async () => {
            this.voting = await voting.new({ 'from': owner });
        });
        it('Should add voters only if RegisteringVoters has started', async () => {
            this.voting.startProposalsRegistering({ 'from': owner });
            await expectRevert(this.voting.addVoter(voter, { 'from': owner }), "Voters registration is not open yet");
        });
        it('Should register voter only once', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await expectRevert(this.voting.addVoter(voter, { 'from': owner }), "Already registered");
        });
        it('Should add proposal only ProposalsRegistration is started', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await expectRevert(this.voting.addProposal(proposal, { 'from': voter }), "Proposals are not allowed yet");
        });
        it('Should not be able to add an empty proposal', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await this.voting.startProposalsRegistering({ 'from': owner });
            await expectRevert(this.voting.addProposal("", { 'from': voter }), "Vous ne pouvez pas ne rien proposer");
        });
        it('Should set vote only if VotingSession has started', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await expectRevert(this.voting.setVote(0, { 'from': voter }), "Voting session havent started yet");
        });
        it('A voter should only be able to vote once', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await this.voting.startProposalsRegistering({ 'from': owner });
            await this.voting.addProposal(proposal, { 'from': voter });
            await this.voting.endProposalsRegistering({ 'from': owner });
            await this.voting.startVotingSession({ 'from': owner });
            await this.voting.setVote(0, { 'from': voter });
            await expectRevert(this.voting.setVote(1, { 'from': voter }), "You have already voted");
        });
        it('Should only vote for an existing proposal', async () => {
            await this.voting.addVoter(voter, { 'from': owner });
            await this.voting.startProposalsRegistering({ 'from': owner });
            await this.voting.endProposalsRegistering({ 'from': owner });
            await this.voting.startVotingSession({ 'from': owner });
            await expectRevert(this.voting.setVote(1, { 'from': voter }), "Proposal not found");
            await expectRevert(this.voting.setVote(0, { 'from': voter }), "Proposal not found");
        });

    });


    //:::::::::::: EVENTS :::::::::::::::::::::::

    describe("Events", async function () {

        beforeEach(async () => {
            this.voting = await voting.new({ from: owner });
        });

        //event VoterRegistered(address voterAddress)
        it("should add voter, get event VoterRegistered", async () => {
            const findEvent = await this.voting.addVoter(voter, { from: owner });
            expectEvent(findEvent, "VoterRegistered", 0);

        });

        //event ProposalRegistered(uint256 proposalId)
        it("should add proposal, get event ProposalRegistered", async () => {
            await this.voting.addVoter(voter, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            const findEvent = await this.voting.addProposal("myProposal", { from: voter });
            expectEvent(findEvent, "ProposalRegistered", 0);
        });

        //event Voted(address voter, uint256 proposalId)
        it("should set vote, get event Voted", async () => {
            let idProposal = 0;
            await this.voting.addVoter(voter, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });

            await this.voting.addProposal("Bobo", { from: voter });
            await this.voting.endProposalsRegistering({ from: owner });

            await this.voting.startVotingSession({ from: owner });
            const findEvent = await this.voting.setVote(idProposal, { from: voter });

            expectEvent(findEvent, "Voted", 1);

        });

        //event WorkflowStatusChange
        it("should change wfs to ProposalsRegistrationStarted, get workflowStatusChange event", async () => {
            const findEvent = await this.voting.startProposalsRegistering({ from: owner });
            expectEvent(findEvent, "WorkflowStatusChange", { previousStatus: new BN(voting.WorkflowStatus.RegisteringVoters), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted) });
        });
        it("should change wfs to ProposalsRegistrationEnded, get workflowStatusChange event", async () => {
            await this.voting.startProposalsRegistering({ from: owner });
            const findEvent = await this.voting.endProposalsRegistering({ from: owner });

            expectEvent(findEvent, "WorkflowStatusChange", { previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded) });
        });

        it("should change wfs to VotingSessionStarted, get workflowStatusChange event", async () => {
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.endProposalsRegistering({ from: owner });

            const findEvent = await this.voting.startVotingSession({ from: owner });
            expectEvent(findEvent, "WorkflowStatusChange", { previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded), newStatus: new BN(voting.WorkflowStatus.VotingSessionStarted) });
        });

        it("should change wfs to VotingSessionEnded, get workflowStatusChange event", async () => {
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.endProposalsRegistering({ from: owner });

            await this.voting.startVotingSession({ from: owner });
            const findEvent = await this.voting.endVotingSession({ from: owner });

            expectEvent(findEvent, "WorkflowStatusChange", { previousStatus: new BN(voting.WorkflowStatus.VotingSessionStarted), newStatus: new BN(voting.WorkflowStatus.VotingSessionEnded) });
        });
        it("should change wfs to Votes Tallied, get workflowStatusChange event", async () => {
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.endProposalsRegistering({ from: owner });

            await this.voting.startVotingSession({ from: owner });
            await this.voting.endVotingSession({ from: owner });

            const findEvent = await this.voting.tallyVotes({ from: owner });
            expectEvent(findEvent, "WorkflowStatusChange", { previousStatus: new BN(voting.WorkflowStatus.VotingSessionEnded), newStatus: new BN(voting.WorkflowStatus.VotesTallied) });
        });
    });
});
