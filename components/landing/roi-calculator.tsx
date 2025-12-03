'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { X, Calculator, TrendingUp, Clock, DollarSign, Zap, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

export function ROICalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoursPerWeek, setHoursPerWeek] = useState('10')
  const [hourlyRate, setHourlyRate] = useState('500')
  const [rateType, setRateType] = useState('freelancer')
  const [toolsCost, setToolsCost] = useState('7500')
  const [toolsType, setToolsType] = useState('fiverr')
  const [leadsNeeded, setLeadsNeeded] = useState('200')

  // Rate presets
  const ratePresets: Record<string, number> = {
    freelancer: 300,
    salesperson: 400,
    executive: 600,
    owner: 1000,
    custom: parseFloat(hourlyRate) || 500
  }

  // Tools cost presets
  const toolsPresets: Record<string, number> = {
    fiverr: 7500,
    va: 22500,
    tools: 50000,
    custom: parseFloat(toolsCost) || 5000
  }

  // Calculate ROI
  const calculateROI = () => {
    const hours = parseFloat(hoursPerWeek) || 0
    const rate = ratePresets[rateType] || parseFloat(hourlyRate) || 0
    const tools = toolsPresets[toolsType] || parseFloat(toolsCost) || 0
    const leads = parseFloat(leadsNeeded) || 0

    // Monthly costs with manual scraping
    const monthlyTimeCost = hours * 4 * rate // 4 weeks
    const monthlyToolsCost = tools
    const totalMonthlyCost = monthlyTimeCost + monthlyToolsCost

    // With EvoLeads AI (10x faster)
    const evoLeadsTime = hours / 10
    const evoLeadsTimeCost = evoLeadsTime * 4 * rate
    const evoLeadsCost = 4200 // Starter plan
    const evoLeadsTotalCost = evoLeadsTimeCost + evoLeadsCost

    // Savings
    const monthlySavings = totalMonthlyCost - evoLeadsTotalCost
    const yearlySavings = monthlySavings * 12
    const timeSaved = (hours - evoLeadsTime) * 4 // hours per month

    // Cost per lead
    const costPerLeadManual = leads > 0 ? totalMonthlyCost / leads : 0
    const costPerLeadAI = leads > 0 ? evoLeadsTotalCost / leads : 0

    return {
      currentCost: totalMonthlyCost,
      evoLeadsCost: evoLeadsTotalCost,
      monthlySavings,
      yearlySavings,
      timeSaved,
      costPerLeadManual,
      costPerLeadAI,
      roi: totalMonthlyCost > 0 ? ((monthlySavings / totalMonthlyCost) * 100) : 0
    }
  }

  const results = calculateROI()

  return (
    <>
      {/* Floating Hook Button */}
      <div className={cn(
        "fixed right-6 bottom-6 z-[100] hidden lg:block transition-all duration-300",
        isOpen && "opacity-0 pointer-events-none"
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 h-auto py-3 px-5 rounded-full"
        >
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="font-semibold whitespace-nowrap">See how much you can save</span>
              <Zap className="h-4 w-4" />
            </div>
          </div>
          
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Button>
      </div>

      {/* Calculator Panel */}
      {isOpen && (
        <div className="fixed right-6 bottom-6 z-[100] w-[400px] max-h-[calc(100vh-100px)] overflow-y-auto hidden lg:block animate-in slide-in-from-bottom duration-300">
          <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
            <CardHeader className="relative pb-4 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">ROI Calculator</CardTitle>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Stop wasting time & money on manual lead scraping. See how much you can save with EvoLeads AI!
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leads" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Leads needed per month
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[200, 500, 1000, 5000].map((count) => (
                      <Button
                        key={count}
                        type="button"
                        variant={leadsNeeded === count.toString() ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setLeadsNeeded(count.toString())}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="leads"
                    type="number"
                    value={leadsNeeded}
                    onChange={(e) => setLeadsNeeded(e.target.value)}
                    placeholder="200"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Hours spent per week on lead scraping
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    placeholder="10"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Your role
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      type="button"
                      variant={rateType === 'freelancer' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRateType('freelancer')}
                    >
                      Freelancer (₨300/hr)
                    </Button>
                    <Button
                      type="button"
                      variant={rateType === 'salesperson' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRateType('salesperson')}
                    >
                      Sales (₨400/hr)
                    </Button>
                    <Button
                      type="button"
                      variant={rateType === 'executive' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRateType('executive')}
                    >
                      Manager (₨600/hr)
                    </Button>
                    <Button
                      type="button"
                      variant={rateType === 'owner' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRateType('owner')}
                    >
                      Owner (₨1000/hr)
                    </Button>
                  </div>
                  {rateType === 'custom' && (
                    <Input
                      id="rate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="500"
                      min="0"
                    />
                  )}
                  <Button
                    type="button"
                    variant={rateType === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setRateType('custom')}
                  >
                    Custom Rate
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tools" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Monthly scraping method
                  </Label>
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <Button
                      type="button"
                      variant={toolsType === 'fiverr' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setToolsType('fiverr')}
                    >
                      Fiverr scraping (₨5,000-10,000)
                    </Button>
                    <Button
                      type="button"
                      variant={toolsType === 'va' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setToolsType('va')}
                    >
                      Virtual assistant (₨15,000-30,000)
                    </Button>
                    <Button
                      type="button"
                      variant={toolsType === 'tools' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setToolsType('tools')}
                    >
                      Paid tools (₨50,000+)
                    </Button>
                    <Button
                      type="button"
                      variant={toolsType === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setToolsType('custom')}
                    >
                      Custom amount
                    </Button>
                  </div>
                  {toolsType === 'custom' && (
                    <Input
                      id="tools"
                      type="number"
                      value={toolsCost}
                      onChange={(e) => setToolsCost(e.target.value)}
                      placeholder="5000"
                      min="0"
                    />
                  )}
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Your Potential Savings
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Current Monthly Cost</div>
                    <div className="text-lg font-bold text-red-600">
                      ₨{results.currentCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-muted-foreground mb-1">With EvoLeads AI</div>
                    <div className="text-lg font-bold text-green-600">
                      ₨{results.evoLeadsCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Subscription + Your Time
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Monthly Savings</span>
                    <span className="text-2xl font-bold text-primary">
                      ₨{results.monthlySavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Yearly Savings</span>
                    <span className="font-semibold text-primary">
                      ₨{results.yearlySavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Time Saved/Month</div>
                    <div className="text-lg font-bold text-blue-600">
                      {results.timeSaved.toFixed(1)} hrs
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs text-muted-foreground mb-1">ROI</div>
                    <div className="text-lg font-bold text-purple-600">
                      {results.roi.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <div className="text-sm font-medium mb-2 text-center">Cost Per Lead Comparison</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Manual</div>
                      <div className="text-xl font-bold text-red-600">
                        ₨{results.costPerLeadManual.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">With AI</div>
                      <div className="text-xl font-bold text-green-600">
                        ₨{results.costPerLeadAI.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm mb-1">10x Faster Results</div>
                      <div className="text-xs text-muted-foreground">
                        EvoLeads AI automates lead generation with AI-powered accuracy, saving you time and money.
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  size="lg"
                  asChild
                >
                  <a href="/sign-up">
                    Start Saving Today - Try Free
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
