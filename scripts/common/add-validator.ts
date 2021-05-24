export class Validator {

  /**
   * Fetch stash and controller account balance
   */
  public async accountBalance(api, stashAccount, controllerAccount) {
    console.log(`Fetching stash and controller account balance`);
    const {
      data: { free: sbalance },
    } = await api.query.system.account(stashAccount);
    const stashBalance = Number(sbalance);
    const {
      data: { free: cbalance },
    } = await api.query.system.account(controllerAccount);
    const controllerBalance = Number(cbalance);
    return {
     stashBalance, controllerBalance
   }
  }

  /**
   * Generate session key
   * @param api ApiPromise
   * @retunrs session key
   */
  public async generateSessionKey(api) {
    console.log(`\nGenerating Session Key`);
    const sessionKey = await api.rpc.author.rotateKeys();
    return sessionKey;
  }

  /**
   * Add validator to the node
   * @param api ApiPromise
   * @param controllerAccountAddress controller ss58 address
   * @param stashAccount stash account keyringpair
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public bondValue(api, controllerAccountAddress, stashAccount, bondValue: number) {
    console.log(`\nAdding validator`);
    console.log(`Bond value is ${bondValue}`);
    // if (this.stashBalance <= Number(bondValue)) {
    //   throw new Error("Bond value needs to be lesser than balance.");
    // }

    const transaction = api.tx.staking.bond(
      controllerAccountAddress,
      BigInt(bondValue),
      "Staked"
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
         stashAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * set controller account
   * @param api ApiPromise
   * @param controllerAccountAddress controller ss58 address
   * @param stashAccount stashAccount keyringpair
   * @returns transaction hash
   */
  public async setController(api, controllerAccountAddress, stashAccount) {
    console.log(`\n Setting controller account`);
    const transaction = api.tx.staking.setController(
      controllerAccountAddress
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          stashAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Set session key
   * @param api ApiPromise
   * @param controllerAccount controller account keyringpair
   * @param sessionKey session key
   */
  public async setSessionKey(api, sessionKey, controllerAccount) {
    console.log(`\nSetting session key`);
    const EMPTY_PROOF = new Uint8Array();
    const transaction = api.tx.session.setKeys(
      sessionKey,
      EMPTY_PROOF
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          controllerAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * set rewards commission
   * @param api ApiPromise
   * @param commissionValue rewards commission
   * @param controllerAccount controller account keyringpair
   */
  public async setCommission(api, commissionValue: number, controllerAccount) {
    console.log(`\nSetting reward commission`);
    // https://github.com/polkadot-js/apps/blob/23dad13c9e67de651e5551e4ce7cba3d63d8bb47/packages/page-staking/src/Actions/partials/Validate.tsx#L53
    const COMM_MUL = 10000000;
    const commission = commissionValue * COMM_MUL;
    const transaction = api.tx.staking.validate({
      commission,
    });

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          controllerAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * callback function for send status
   */
  private sendStatusCb(
    res,
    rej,
    {
      events = [],
      status,
    }: {
      events?: any;
      status: any;
    }
  ) {
    if (status.isInvalid) {
      console.info("Transaction invalid");
      rej("Transaction invalid");
    } else if (status.isReady) {
      console.info("Transaction is ready");
    } else if (status.isBroadcast) {
      console.info("Transaction has been broadcasted");
    } else if (status.isInBlock) {
      const hash = status.asInBlock.toHex();
      console.info(`Transaction is in block: ${hash}`);
    } else if (status.isFinalized) {
      const hash = status.asFinalized.toHex();
      console.info(`Transaction has been included in blockHash ${hash}`);
      events.forEach(({ event }) => {
        if (event.method === "ExtrinsicSuccess") {
          console.info("Transaction succeeded");
        } else if (event.method === "ExtrinsicFailed") {
          console.info("Transaction failed");
          throw new Error("Transaction failed");
        }
      });

      res(hash);
    }
  }
}
