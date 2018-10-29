
export const createInitialUserCurrencyAccounts = () => ([
  {
    name: 'main',
    type: 'natural_person',
  },
]);

export const createInitialProjectCurrencyAccounts = () => ([
  {
    name: 'main',
    type: 'juristic_person',
  },
]);

export const createEscrowCurrencyAccount = () => ({
  name: 'main',
  type: 'escrow',
});
