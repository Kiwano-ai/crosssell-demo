'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { LayoutDashboard, Users, Megaphone, Plug, Settings, ChevronDown, Play, Bell, Wand2, Pen, AlertTriangle, Send, CheckCircle, Mail } from 'lucide-react'

export default function Dashboard() {
  const [notificationText, setNotificationText] = useState<string[]>([])
  const [recommendationText, setRecommendationText] = useState<string[]>([])
  const [warningText, setWarningText] = useState<string[]>([])
  const [isPlayingNotification, setIsPlayingNotification] = useState(false)
  const [isPlayingRecommendation, setIsPlayingRecommendation] = useState(false)
  const [isPlayingWarning, setIsPlayingWarning] = useState(false)
  const [showNotificationBadge, setShowNotificationBadge] = useState(false)
  const [showRecommendationBadge, setShowRecommendationBadge] = useState(false)
  const [showWarningBadge, setShowWarningBadge] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(true)
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(true)
  const [isWarningOpen, setIsWarningOpen] = useState(true)

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Outreach', icon: <Megaphone className="w-4 h-4" /> },
    { name: 'Integrations', icon: <Plug className="w-4 h-4" /> },
    { name: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const notificationFullText = [
    "Incoming high-priority request from Meta, one of our top enterprise customers.",
    "Mark Zuckerberg has requested an urgent meeting to discuss AI integration.",
    "Analyzing calendar availability...",
    "Checking meeting room availability...",
    "Responding and auto-scheduling meeting now...",
    "Meeting booked for tomorrow at 2 PM PST in the VR Conference Room.",
    "Confirmation sent to zaeem@yolodex.ai and mark@meta.com"
  ]

  const recommendationFullText = [
    "Customer Success Alert: Amazon is experiencing integration issues.",
    "Jeff Bezos has attempted to connect his Intercom account to Yolodex 3 times in the last hour.",
    "Analyzing recent customer interactions from Mixpanel...",
    "Reviewing customer chat history from Zendesk...",
    "Scanning relevant FAQs and documentation...",
    "Drafting a comprehensive guide on Intercom integration...",
    "Email prepared for Jeff with a step-by-step Intercom configuration guide.",
    "Recommendation: Send the prepared email to jeff@amazon.com"
  ]

  const warningFullText = [
    "Urgent Churn Risk Alert: Tesla account showing signs of disengagement.",
    "Elon Musk's activity indicates potential dissatisfaction:",
    "- Viewed billing page 5 times in the last 48 hours",
    "- Last login was 3 weeks ago, down from daily logins",
    "- Recent LinkedIn post mentions 'streamlining SaaS expenses'",
    "Analyzing similar patterns from historical data:",
    "- Case study: NVIDIA in 2020 showed similar behavior before downsizing",
    "- Action taken then: Offered 20% discount on annual subscription",
    "- Result: Successfully retained NVIDIA for 2 more years",
    "Recommendation: Proactively offer a tailored annual plan to Tesla"
  ]

  const streamText = (
    setText: React.Dispatch<React.SetStateAction<string[]>>,
    fullText: string[],
    onComplete: () => void
  ) => {
    let i = 0
    const intervalId = setInterval(() => {
      setText(prev => [...prev, fullText[i]])
      i++
      if (i >= fullText.length) {
        clearInterval(intervalId)
        onComplete()
      }
    }, 1000)
    return () => clearInterval(intervalId)
  }

  useEffect(() => {
    if (isPlayingNotification) {
      setShowNotificationBadge(true)
      return streamText(setNotificationText, notificationFullText, () => {
        setIsPlayingNotification(false)
        setTimeout(() => {
          setShowRecommendationBadge(true)
          setIsPlayingRecommendation(true)
        }, 2000)
      })
    }
  }, [isPlayingNotification])

  useEffect(() => {
    if (isPlayingRecommendation) {
      return streamText(setRecommendationText, recommendationFullText, () => {
        setIsPlayingRecommendation(false)
        setTimeout(() => {
          setShowWarningBadge(true)
          setIsPlayingWarning(true)
        }, 1000)
      })
    }
  }, [isPlayingRecommendation])

  useEffect(() => {
    if (isPlayingWarning) {
      return streamText(setWarningText, warningFullText, () => {
        setIsPlayingWarning(false)
      })
    }
  }, [isPlayingWarning])

  const handlePlayDemo = () => {
    setNotificationText([])
    setRecommendationText([])
    setWarningText([])
    setShowNotificationBadge(false)
    setShowRecommendationBadge(false)
    setShowWarningBadge(false)
    setIsNotificationOpen(true)
    setIsRecommendationOpen(true)
    setIsWarningOpen(true)
    setIsPlayingNotification(true)
  }

  return (
    <div className="flex h-screen bg-[#F4F6FB] overflow-hidden text-sm">
      <aside className="w-48 h-full bg-white/80 backdrop-blur-sm flex flex-col justify-between p-3 border-r">
        <div>
          <h1 className="text-[#f97315] text-xl font-bold mb-6">Yolodex AI</h1>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button key={item.name} variant="ghost" className="w-full justify-start py-1 px-2 h-8">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center">
          <Avatar className="h-7 w-7">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="ml-2 flex-grow text-xs">
            <p className="font-medium">John Doe</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-semibold">Customer Health Dashboard</h1>
            <Button onClick={handlePlayDemo} disabled={isPlayingNotification || isPlayingRecommendation || isPlayingWarning} size="sm">
              <Play className="w-3 h-3 mr-1" />
              Play Demo
            </Button>
          </div>
          <Tabs defaultValue="dashboard">
            <TabsList>
              {navItems.map((item) => (
                <TabsTrigger key={item.name} value={item.name.toLowerCase()} className="text-xs py-1 px-2">
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="p-4 space-y-4" style={{
          backgroundImage: `radial-gradient(ellipse at bottom left, rgba(249, 115, 21, 0.2) 0%, transparent 70%),
                            radial-gradient(ellipse at bottom right, rgba(255, 206, 8, 0.2) 0%, transparent 70%)`
        }}>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="py-3">
              <Collapsible open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0">
                    <div className="flex items-center">
                      <Bell className={`w-4 h-4 mr-2 ${showNotificationBadge ? 'text-green-500' : 'text-gray-500'}`} />
                      <CardTitle className="text-sm">Notifications</CardTitle>
                      {showNotificationBadge && <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">1</span>}
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-3 text-xs space-y-1 relative pb-12">
                    {notificationText.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                    {!isPlayingNotification && notificationText.length > 0 && (
                      <div className="absolute bottom-3 left-3 space-x-2">
                        <Button size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as read
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-3 h-3 mr-1" />
                          View email
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="py-3">
              <Collapsible open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0">
                    <div className="flex items-center">
                      <Bell className={`w-4 h-4 mr-2 ${showRecommendationBadge ? 'text-blue-500' : 'text-gray-500'}`} />
                      <CardTitle className="text-sm">Recommendations</CardTitle>
                      {showRecommendationBadge && <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">1</span>}
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-3 text-xs space-y-1 relative pb-12">
                    {recommendationText.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                    {!isPlayingRecommendation && recommendationText.length > 0 && (
                      <div className="absolute bottom-3 left-3 space-x-2">
                        <Button size="sm">
                          <Wand2 className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button variant="outline" size="sm">
                          <Pen className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="py-3">
              <Collapsible open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0">
                    <div className="flex items-center">
                      <AlertTriangle className={`w-4 h-4 mr-2 ${showWarningBadge ? 'text-red-500' : 'text-gray-500'}`} />
                      <CardTitle className="text-sm">Warnings</CardTitle>
                      {showWarningBadge && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">1</span>}
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-3 text-xs space-y-1 relative pb-12">
                    {warningText.map((line, index) => (
                      <p  key={index}>{line}</p>
                    ))}
                    {!isPlayingWarning && warningText.length > 0 && (
                      <div className="absolute bottom-3 left-3 space-x-2">
                        <Button size="sm">
                          <Wand2 className="w-3 h-3 mr-1" />
                          View report
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="w-3 h-3 mr-1" />
                          Send to manager
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}