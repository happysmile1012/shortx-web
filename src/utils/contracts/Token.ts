import { Contract, ethers } from 'ethers'
import { IERC20ABI } from '../../metadata/abis/IERC20ABI'

class Token {
  public provider: ethers.providers.JsonRpcProvider
  public contractAddress: string
  public contractInstance: Contract

  constructor(address: string, provider: ethers.providers.JsonRpcProvider) {
    this.provider = provider
    //console.log('address', address)
    //this.contractAddress = ethers.utils.getAddress(address)
    this.contractAddress = address
    this.contractInstance = new ethers.Contract(
      address,
      IERC20ABI,
      provider.getSigner()
    )
  }

  async allowance(account: string, spender: string): Promise<string> {
    return await this.contractInstance.allowance(account, spender)
  }

  async balanceOf(account: string): Promise<string> {
    return await this.contractInstance.balanceOf(account)
  }

  async approve(
    user: ethers.Signer,
    spender: string,
    amount: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      // TODO - Gas estimation
      const gasPrice = await this.provider.getGasPrice()
      const gasLimit = await this.contractInstance
        .connect(user)
        .estimateGas.approve(spender, ethers.utils.parseEther(amount))

      console.log(`TOKEN Gas price: ${gasPrice.toString()}`)
      console.log(`TOKEN Gas limit: ${gasLimit.toString()}`)

      const tx = await this.contractInstance
        .connect(user)
        .approve(spender, ethers.utils.parseEther(amount), {
          gasLimit: gasLimit,
          gasPrice: gasPrice
        })

      const receipt = await tx.wait()
      // console.log(`Got receipt`);

      return receipt
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

export default Token
