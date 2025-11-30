import axios, { type AxiosResponse } from 'axios'

export const checkTonAddress = async (address: string) => {
  try {
    const result = await axios.get(`https://toncenter.com/api/v2/getAddressInformation?address=${address}`)
    return result.data.ok
  } catch (err: AxiosResponse) {
    if (err.response.data.code === 416) {
      return false
    }
   }
}

export const checkTronAddress = async (address: string) => {
  try {
    const result = await axios.post('https://api.shasta.trongrid.io/wallet/validateaddress', {
      address,
      visible: true
    })

    return result.data.result
  } catch (err) {
    // Error handled
  }
}