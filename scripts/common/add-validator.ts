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
      stashBalance,
      controllerBalance,
    };
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
  public bondValue(
    api,
    controllerAccountAddress,
    stashAccount,
    bondValue: number
  ) {
    console.log(`\nAdding validator`);
    console.log(`Bond value is ${bondValue}`);

    const transaction = api.tx.staking.bond(
      controllerAccountAddress,
      BigInt(bondValue),
      "Staked"
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          stashAccount,
          this.sendStatusCb.bind(this, res, rej)
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
    const transaction = api.tx.staking.setController(controllerAccountAddress);

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          stashAccount,
          this.sendStatusCb.bind(this, res, rej)
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
    const transaction = api.tx.session.setKeys(sessionKey, EMPTY_PROOF);

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          controllerAccount,
          this.sendStatusCb.bind(this, res, rej)
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
          this.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * wait till node sync
   * @param waitSeconds wait seconds
   */
  public async start(api,waitSeconds: string) {
    console.log("Check if syncing...");
    await this.callWithRetry(
      this.isSyncing.bind(this, api),
      {
        maxDepth: 5760,
      },
      0,
      waitSeconds
    );
    console.log("Sync is complete!");
  }

  /**
   * Check if node is syning or synced.
   */
  private async isSyncing(api) {
    const response = await api.rpc.system.health();
    if (response.isSyncing.valueOf()) {
      throw new Error("Node is syncing");
    }
  }

  /**
   * Function to be looped
   * @param fn function which needs to be looped
   * @param options
   * @param depth
   * @returns
   */
  private async callWithRetry(
    fn,
    options = { maxDepth: 5 },
    depth = 0,
    waitSeconds: string
  ) {
    try {
      return await fn();
    } catch (e) {
      if (depth > options.maxDepth) {
        throw e;
      }
      const seconds = parseInt(waitSeconds, 10);
      console.log(`Wait ${seconds}s.`);
      await this.sleep(15 * 1000);

      return this.callWithRetry(fn, options, depth + 1, waitSeconds);
    }
  }

  /**
   * Sleep
   * @param ms Time in milli second
   * @returns promise
   */
  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
      res(hash);
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
