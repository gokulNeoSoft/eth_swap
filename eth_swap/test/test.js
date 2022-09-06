const Token = artifacts.require('Gtoken')
const EthSwap = artifacts.require('EthSwap')
const truffleAssert = require('truffle-assertions');

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, account]) => {
  let token, ethSwap;
  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    await token.mint(ethSwap.address,tokens('1000000'));
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'Gtoken')
    })
  })

  describe('EthSwap deployment', async () => {
    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result
    before(async () => {
      // Purchase tokens before each example
      result = await ethSwap.buyTokens({ from: account, value: web3.utils.toWei('1', 'ether')})
    })

    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
      let accountBalance = await token.balanceOf(account)
      assert.equal(accountBalance.toString(), tokens('100'))
      // Check ethSwap balance after purchase
      let ethSwapBalance
      ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('999900'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))
      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, account)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })

  describe('sellTokens()', async () => {
    let result
    before(async () => {
      // account must approve tokens before the purchase
      await token.approve(ethSwap.address, tokens('100'), { from: account })
      // account sells tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: account })
    })

    it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
      // Check account token balance after purchase
      let accountBalance = await token.balanceOf(account)
      assert.equal(accountBalance.toString(), tokens('0'))
      // Check ethSwap balance after purchase
      let ethSwapBalance;
      ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))
      const event = result.logs[0].args
      assert.equal(event.account, account)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // FAILURE: account can't sell more tokens than they have
      await truffleAssert.reverts(ethSwap.sellTokens(tokens('500'), { from: account }));
    })
  })

})
