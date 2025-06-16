import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export { stripe }

export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 299, // $2.99 in cents
    popular: false
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 599, // $5.99 in cents
    popular: true
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 999, // $9.99 in cents
    popular: false
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 1799, // $17.99 in cents
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