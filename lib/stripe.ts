import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const PRODUCTS = {
  'pdf-epub': {
    name: "A Sailor's Reminiscences — PDF & ePub",
    price: 749,
    currency: 'usd',
  },
} as const

export type ProductId = keyof typeof PRODUCTS
