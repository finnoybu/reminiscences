import nextMDX from '@next/mdx'

const withMDX = nextMDX({
  extension: /\.mdx?$/,
})

export default withMDX({
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['@supabase/auth-js'],
  experimental: {
    typedRoutes: true
  }
})
