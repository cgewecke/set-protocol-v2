import "module-alias/register";
import { BigNumber } from "ethers";
import { Address } from "@utils/types";
import { Account } from "@utils/test/types";
import { DgMigrationWrapV2Adapter, StandardTokenMock } from "@utils/contracts";
import { ZERO } from "@utils/constants";
import DeployHelper from "@utils/deploys";
import {
  ether,
} from "@utils/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect
} from "@utils/test/index";

const expect = getWaffleExpect();

describe("DgMigrationWrapV2Adapter", () => {
  let owner: Account;
  let deployer: DeployHelper;
  let adapter: DgMigrationWrapV2Adapter;

  let newDgToken: StandardTokenMock;
  let oldDgToken: StandardTokenMock;

  before(async () => {
    [
      owner
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    oldDgToken = await deployer.mocks.deployTokenMock(owner.address);
    newDgToken = await deployer.mocks.deployTokenMock(owner.address);

    adapter = await deployer.adapters.deployDgMigrationWrapV2Adapter(
      oldDgToken.address,
      newDgToken.address
    );
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("#constructor", () => {
    let subjectLegacyAddress: string;
    let subjectNewAddress: string;
    beforeEach(async () => {
      subjectLegacyAddress = oldDgToken.address;
      subjectNewAddress = newDgToken.address;
    });
    async function subject(): Promise<DgMigrationWrapV2Adapter> {
      return deployer.adapters.deployDgMigrationWrapV2Adapter(
        subjectLegacyAddress,
        subjectNewAddress
      );
    }
    it("should have the correct legacy token address", async () => {
      const deployedAdapter = await subject();

      expect(await deployedAdapter.dgLegacyToken()).to.eq(subjectLegacyAddress);
    });
    it("should have the correct new token address", async () => {
      const deployedAdapter = await subject();
      expect(await deployedAdapter.dgToken()).to.eq(subjectNewAddress);
    });
  });

  describe("#getWrapCallData", () => {
    let subjectUnderlyingToken: Address;
    let subjectWrappedToken: Address;
    let subjectNotionalUnderlying: BigNumber;

    beforeEach(async () => {
      subjectUnderlyingToken = oldDgToken.address;
      subjectWrappedToken = newDgToken.address;
      subjectNotionalUnderlying = ether(2);
    });

    async function subject(): Promise<[string, BigNumber, string]> {
      return adapter.getWrapCallData(subjectUnderlyingToken, subjectWrappedToken, subjectNotionalUnderlying);
    }

    it("should return correct calldata", async () => {
      // TODO: assert calldata.
      const [targetAddress, ethValue] = await subject();
      expect(targetAddress).to.eq(subjectWrappedToken);
      expect(ethValue).to.eq(ZERO);
    });

    it("should revert when underlying is not old dg token", async () => {

    });

    it("should revert when wrapped asset is not new dg token", async () => {

    });
  });

  describe("#getUnwrapCallData", () => {
    let subjectUnderlyingToken: string;
    let subjectWrappedToken: string;
    let subjectAmount: BigNumber;

    beforeEach(async () => {
      subjectUnderlyingToken = oldDgToken.address;
      subjectWrappedToken = newDgToken.address;
      subjectAmount = ether(2);
    });

    async function subject(): Promise<[string, BigNumber, string]> {
      return adapter.getUnwrapCallData(subjectUnderlyingToken, subjectWrappedToken, subjectAmount);
    }

    it("should revert", async () => {
      await expect(subject()).to.be.revertedWith("DG migration cannot be reversed");
    });
  });

  describe("#getSpenderAddress", () => {
    async function subject(): Promise<string> {
      return adapter.getSpenderAddress(oldDgToken.address, newDgToken.address);
    }
    it("should return the correct spender address", async () => {
      const spender = await subject();
      expect(spender).to.eq(newDgToken.address);
    });
  });
});
