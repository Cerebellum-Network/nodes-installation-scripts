const config = {
  ChainId: "u8",
  DepositNonce: "u64",
  ResourceId: "[u8; 32]",
  ProposalStatus: {
    _enum: ['Initiated', 'Approved', 'Rejected']
  },
  ProposalVotes: {
    votes_for: "Vec<AccountId>",
    votes_against: "Vec<AccountId>",
    status: "ProposalStatus",
    expiry: "BlockNumber"
  },
  TokenId: "u256",
  Erc721Token: {
    id: "TokenId",
    metadata: "Vec<u8>"
  },
  Address: "AccountId",
  LookupSource: "AccountId"
};

export default config;