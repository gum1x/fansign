"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Star, Zap, Crown, Sparkles, ExternalLink, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { authService } from '@/lib/auth'
import { CREDIT_PACKAGES } from '@/lib/oxapay'
import type { AuthUser } from '@/lib/auth'

export default function PurchasePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push('/auth')
      return
    }
    setUser(currentUser)

    // Check for success parameter
    if (searchParams?.get('success') === 'true') {
      setShowSuccess(true)
      // Refresh user data to get updated credits
      authService.refreshUserData().then(updatedUser => {
        if (updatedUser) {
          setUser(updatedUser)
        }
      })
    }
  }, [router, searchParams])

  const handlePurchase = async (packageId: string) => {
    if (!user) return

    setIsLoading(true)
    setSelectedPackage(packageId)

    try {
      // Create OxaPay payment
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Redirect to OxaPay payment page
      if (data.payLink) {
        window.open(data.payLink, '_blank')
        
        // Start polling for payment status
        const trackId = data.trackId
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/payments/status/${trackId}`)
            const statusData = await statusResponse.json()
            
            if (statusData.status === 'completed') {
              clearInterval(pollInterval)
              // Refresh user data
              const updatedUser = await authService.refreshUserData()
              if (updatedUser) {
                setUser(updatedUser)
              }
              setShowSuccess(true)
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval)
              alert('Payment failed. Please try again.')
            }
          } catch (error) {
            console.error('Status polling error:', error)
          }
        }, 5000) // Poll every 5 seconds

        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
        }, 600000)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedPackage(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Payment Successful!</h2>
              <p className="text-gray-300 mb-6">
                Your credits have been added to your account. You can now create more amazing fansigns!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50 mb-6">
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                <span className="text-purple-300">Current Balance: {user.credits} credits</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950">
                  <Link href="/generate">
                    Start Creating
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-purple-700/50">
                  <Link href="/purchase" onClick={() => setShowSuccess(false)}>
                    Buy More Credits
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(138,43,226,0.5)]">
          <CardHeader className="bg-gradient-to-r from-violet-800 to-purple-900 border-b border-purple-700/50">
            <div className="flex items-center justify-between">
              <Link href="/generate" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CardTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                Purchase Credits
              </CardTitle>
              <div className="w-5"></div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50 mb-4">
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                <span className="text-purple-300">Current Balance: {user.credits} credits</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Choose Your Credit Package</h2>
              <p className="text-gray-300">Each fansign generation costs 1-3 credits depending on the style</p>
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💰 Pay with cryptocurrency via OxaPay - Bitcoin, Ethereum, USDT and more accepted!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CREDIT_PACKAGES.map((pkg) => {
                const Icon = pkg.id === 'credits_10' ? Star : 
                           pkg.id === 'credits_25' ? Zap :
                           pkg.id === 'credits_50' ? Crown : Sparkles

                return (
                  <div
                    key={pkg.id}
                    className={`relative bg-gray-800/50 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      pkg.popular
                        ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                        : 'border-purple-700/30 hover:border-purple-500/50'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-purple-400" />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        ${pkg.price.toFixed(2)}
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        ${(pkg.price / pkg.credits).toFixed(2)} per credit
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-sm text-gray-300">
                          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                          {pkg.credits} Credits
                        </div>
                        <div className="text-xs text-gray-400">
                          Generate {pkg.credits} fansigns
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isLoading}
                        className={`w-full transition-all duration-300 ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : 'bg-gradient-to-r from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950'
                        }`}
                      >
                        {isLoading && selectedPackage === pkg.id ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Pay with Crypto
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-gray-800/30 rounded-lg border border-purple-700/30">
              <h3 className="text-lg font-semibold text-purple-300 mb-4">Credit Usage Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">1 Credit</div>
                  <p className="text-gray-300">Text-based styles</p>
                  <p className="text-gray-400 text-xs">Classic, Handwritten, Digital</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">2 Credits</div>
                  <p className="text-gray-300">Single image upload</p>
                  <p className="text-gray-400 text-xs">Times Square Billboard</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">3 Credits</div>
                  <p className="text-gray-300">Multiple image uploads</p>
                  <p className="text-gray-400 text-xs">Times Square Dual</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h4 className="text-lg font-semibold text-blue-300 mb-2">Why OxaPay?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Accept 100+ cryptocurrencies
                  </div>
                  <div className="flex items-center text-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Fast and secure payments
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Low transaction fees
                  </div>
                  <div className="flex items-center text-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    No registration required
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Secure cryptocurrency payments powered by OxaPay • Credits never expire • Instant delivery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}