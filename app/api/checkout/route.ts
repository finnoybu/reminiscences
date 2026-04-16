import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRODUCTS, ProductId } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 })
  }

  const { productId } = await request.json() as { productId: string }

  if (!PRODUCTS[productId as ProductId]) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  const product = PRODUCTS[productId as ProductId]

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      product_id: productId,
    },
    line_items: [
      {
        price_data: {
          currency: product.currency,
          unit_amount: product.price,
          product_data: { name: product.name },
        },
        quantity: 1,
      },
    ],
    success_url: `${request.nextUrl.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/shop`,
  })

  return NextResponse.json({ url: session.url })
}
