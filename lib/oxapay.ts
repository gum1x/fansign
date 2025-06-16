// OxaPay integration for cryptocurrency payments
export interface OxaPayConfig {
  merchantKey: string
  callbackUrl: string
  returnUrl: string
}

export interface OxaPayPaymentRequest {
  merchant: string
  amount: number
  currency: string
  lifeTime: number
  feePaidByPayer: number
  underPaidCover: number
  callbackUrl: string
  returnUrl: string
  description: string
  orderId: string
  email?: string
}

export interface OxaPayPaymentResponse {
  result: number
  message: string
  trackId?: number
  payLink?: string
}

export interface OxaPayCallbackData {
  trackId: number
  type: string
  status: string
  amount: number
  currency: string
  date: string
  txID: string
  hmac: string
}

export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 2.99, // $2.99 in USD
    popular: false
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 5.99, // $5.99 in USD
    popular: true
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 9.99, // $9.99 in USD
    popular: false
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 17.99, // $17.99 in USD
    popular: false
  }
]

export const GENERATION_COSTS = {
  'sign': 1,
  'bophouse': 1,
  'bophouse-new': 1,
  'liv': 1,
  'liv-digital': 1,
  'poppy': 1,
  'booty': 1,
  'double-monkey': 1,
  'three-cats': 1,
  'times-square': 2, // More expensive for image uploads
  'times-square-new': 3, // Most expensive for dual image uploads
}

export class OxaPayService {
  private merchantKey: string
  private baseUrl = 'https://api.oxapay.com'

  constructor(merchantKey: string) {
    this.merchantKey = merchantKey
  }

  async createPayment(request: OxaPayPaymentRequest): Promise<OxaPayPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('OxaPay API error:', error)
      throw new Error('Failed to create payment')
    }
  }

  async getPaymentStatus(trackId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant: this.merchantKey,
          trackId: trackId,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('OxaPay inquiry error:', error)
      throw new Error('Failed to get payment status')
    }
  }

  verifyCallback(callbackData: OxaPayCallbackData, expectedHmac: string): boolean {
    // Verify HMAC signature for security
    const crypto = require('crypto')
    const message = `${callbackData.trackId}*${callbackData.type}*${callbackData.status}*${callbackData.amount}*${callbackData.currency}*${callbackData.date}*${callbackData.txID}`
    const computedHmac = crypto.createHmac('sha512', this.merchantKey).update(message).digest('hex')
    
    return computedHmac === expectedHmac
  }
}

export const oxaPayService = new OxaPayService(process.env.OXAPAY_MERCHANT_KEY!)