import configFile from "./config.json";
import fs from "fs";

class EventHandlers {
  /**
   * Process the events to set smart contract address
   * @param events Events
   */
  public static async handleEventsForSmartContractAddress(events, smartContractKey: string) {
    console.log("Processing events to fetch smart contract address");
    events.forEach((event) => {
      if (event.event.data.length === 2) {
        const smartcontractAddress = event.event.data[1].toString();
        if (smartcontractAddress.startsWith("5")) {
          configFile.network[smartContractKey] = smartcontractAddress;
          fs.writeFileSync("config.json", JSON.stringify(configFile));
          console.log(
            `The smart contract address is ${smartcontractAddress}\n`
          );
        }
      }
    });
  }

  /**
   * Process the events to set code hash
   * @param events Events
   */
  public static async handleEventsForCodeHash(events, emulationName: string) {
    console.log("Processing events to fetch code hash");
    events.forEach((event) => {
      const data = event.event.data[0].toString();
      if (data.startsWith("0x")) {
        configFile.emulations.sequence.find(
          (sequence) => sequence.name === emulationName
        // @ts-ignore
        ).code_hash = data;
        fs.writeFileSync("config.json", JSON.stringify(configFile));
        console.log(`The smart contract code hash is ${data}\n`);
      }
    });
  }
}

export default EventHandlers;
