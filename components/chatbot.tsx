"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

type Order = {
  items: string[]
  size?: string
  toppings?: string[]
  drinks?: string[]
}

type ConversationState = {
  lastQuestion?: string
  order: Order
}

// --- Intents for order flow ---
const INTENTS = [
  { intent: "order_pizza", keywords: ["pizza", "margherita", "pepperoni", "veggie"] },
  { intent: "order_burger", keywords: ["burger", "flame burger", "chicken burger", "veggie burger"] },
  { intent: "order_sub", keywords: ["submarine", "sub", "chicken sub", "veggie sub", "special sub"] },
  { intent: "order_drink", keywords: ["drink", "juice", "milkshake", "coffee"] },
  { intent: "ask_hours", keywords: ["hours", "open", "time"] },
  { intent: "ask_location", keywords: ["location", "address", "where"] },
  { intent: "ask_contact", keywords: ["contact", "phone", "email"] },
  { intent: "greeting", keywords: ["hi", "hello", "hey"] },
  { intent: "thanks", keywords: ["thanks", "thank you"] },
  { intent: "goodbye", keywords: ["bye", "goodbye"] },
]

// --- Rich Predefined Responses (old + more) ---
const PREDEFINED_RESPONSES: Record<string, string> = {
  hello: "Hello! Welcome to Flames Pizzeria! 🍕 How can I help you today?",
  hi: "Hi there! Ready for some delicious food? 😋",
  hey: "Hey! Let's satisfy those cravings! 🍔🍕",
  pizza: "Our pizzas come in Small (8\"), Medium (10\"), Large (12\"), and Family (14\"). Popular: Margherita, Pepperoni, BBQ Chicken, Veggie Supreme. Starting Rs. 1,200.",
  "veg pizza": "We have Veggie Pizza and Margherita. Vegetarian options available!",
  burger: "Try our Flame Burger, Chicken Burger, or Veggie Burger! Served with fries, starting from Rs. 800.",
  submarine: "Freshly made! Chicken Sub, Veggie Sub, or Special Sub with extra cheese. Starting Rs. 900.",
  "short eat": "Samosas, rolls, cutlets, and patties – perfect for snacking!",
  dessert: "Chocolate lava cake, ice cream, fruit salad, and more. 🍨",
  drink: "Soft drinks, fresh juices, milkshakes, and specialty coffees available.",
  delivery: "Fast delivery! Orders above Rs. 2,000 get free delivery. Usually within 30 min.",
  takeaway: "Order online and pick up from our store! 5% discount on takeaway orders.",
  "dine in": "Visit us for a comfortable dining experience and friendly service.",
  hours: "Open 10:00 AM - 11:00 PM every day.",
  location: "123 Main Street, Colombo. Also on Uber Eats and PickMe Food!",
  contact: "You can reach us at +94 11 234 5678 or info@flamespizzeria.lk",
  phone: "Call +94 11 234 5678",
  email: "Email: info@flamespizzeria.lk",
  name: "I’m FlameBot, your friendly Flames Pizzeria assistant! 😎",
  "who are you": "FlameBot at your service! I can help with menu, orders, offers, and more.",
  hungry: "Feeling hungry? 🍕 Check out our menu: pizzas, burgers, subs, short eats, drinks, desserts!",
  cheapest: "Our cheapest items: Veggie Pizza, samosas, rolls – starting from Rs. 1,200.",
  love: "We love serving our customers! ❤️ Hope you enjoy your meal.",
  thanks: "You're welcome! Enjoy your meal! 🍕",
  card: "We accept cash, major credit/debit cards, and online payments.",
  payment: "You can pay by cash, card, or online securely.",
  addon: "You can add extra toppings, cheese, or sides to your order while placing it.",
  size: "Pizza sizes: Small (8\"), Medium (10\"), Large (12\"), Family (14\").",
  toppings: "Toppings: Pepperoni, Chicken, Beef, Veggies, Cheese, Olives, Mushrooms, and more!",
  spicy: "Spicy options: Spicy Chicken Pizza, Devil’s Chicken Sub, or our spicy wings!",
  halal: "All our food is halal certified. We follow strict halal standards.",
  vegetarian: "Veggie options: Veggie Pizza, Veggie Burger, Vegetarian Sub, and more.",
  offers: "Special offers: Students get 10% off, orders above Rs. 2,000 get free delivery. Check app for more!",
  loyalty: "Join our loyalty program! Earn points with every order and get free items and exclusive discounts.",
  birthday: "Celebrate your birthday here! 15% off for groups of 4+.",
  party: "We cater birthdays, office parties, events. Call us for details.",
  catering: "We provide catering services for events. Contact us for custom orders.",
  wifi: "Yes, free WiFi available for dine-in customers.",
  parking: "Parking available for dine-in customers.",
  default: "I’m not sure about that. You can contact us at +94 11 234 5678 or info@flamespizzeria.lk, or ask about menu, offers, or orders!"
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm FlameBot, your Flames Pizzeria assistant! 🍕 How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ConversationState>({ order: { items: [] } })

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => scrollToBottom(), [messages])

  const detectIntent = (message: string) => {
    const msg = message.toLowerCase()
    for (const item of INTENTS) if (item.keywords.some(k => msg.includes(k))) return item.intent
    return "default"
  }

  const handleOrderFlow = (userMessage: string) => {
    let reply = ""
    const msg = userMessage.toLowerCase()

    if (state.lastQuestion === "ask_size") {
      setState(prev => ({ ...prev, order: { ...prev.order, size: msg }, lastQuestion: "ask_toppings" }))
      reply = "Got it! Do you want any extra toppings or drinks?"
      return reply
    }

    if (state.lastQuestion === "ask_toppings") {
      const toppings = msg.split(",").map(t => t.trim())
      setState(prev => ({ ...prev, order: { ...prev.order, toppings }, lastQuestion: "ask_drinks" }))
      reply = "Toppings added! Would you like any drinks with your order?"
      return reply
    }

    if (state.lastQuestion === "ask_drinks") {
      const drinks = msg.split(",").map(d => d.trim())
      setState(prev => ({ ...prev, order: { ...prev.order, drinks }, lastQuestion: undefined }))
      reply = `Great! Here's a summary of your order:\nItems: ${state.order.items.join(", ")}\nSize: ${state.order.size}\nToppings: ${state.order.toppings?.join(", ")}\nDrinks: ${drinks.join(", ")}\n\nWould you like to place this order?`
      return reply
    }

    return ""
  }

  const getBotResponse = (userMessage: string): string => {
    // Check order flow first
    const orderReply = handleOrderFlow(userMessage)
    if (orderReply) return orderReply

    // Detect intent
    const intent = detectIntent(userMessage)

    // Start order flow if ordering
    if (intent.startsWith("order_")) {
      setState(prev => ({ ...prev, order: { ...prev.order, items: [intent.split("_")[1]] }, lastQuestion: "ask_size" }))
    }

    // If keyword response exists in PREDEFINED_RESPONSES, use it
    for (const key in PREDEFINED_RESPONSES) {
      if (userMessage.toLowerCase().includes(key)) return PREDEFINED_RESPONSES[key]
    }

    return PREDEFINED_RESPONSES[intent] || PREDEFINED_RESPONSES.default
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const userMessage: Message = { id: Date.now().toString(), text: inputValue, isBot: false, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = { id: (Date.now() + 1).toString(), text: getBotResponse(inputValue), isBot: true, timestamp: new Date() }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)

    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSendMessage() }

  if (!isOpen) return (
    <div className="fixed bottom-[50px] right-[12px] z-50">
      <Button onClick={() => setIsOpen(true)} className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg">
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )

  return (
    <div className="fixed bottom-[100px] right-[12px] z-50">
      <Card className={cn("w-80 bg-gray-900 shadow-xl border border-gray-700 transition-all duration-200 rounded-2xl text-white", isMinimized ? "h-12" : "h-96")}>
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-gray-700 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img src="/img/logo.png" alt="Flames Pizzeria" className="w-4 h-4 object-contain" />
            </div>
            <CardTitle className="text-sm font-medium">Flames Pizzeria Assistant</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full">
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setIsMinimized(false) }} className="h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-full rounded-b-2xl">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.isBot ? "justify-start" : "justify-end")}>
                  <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm shadow-sm", msg.isBot ? "bg-gray-800 text-gray-100 border border-gray-600 rounded-bl-md" : "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md")}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-gray-800 p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-600 flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-700 bg-gray-800 rounded-b-2xl">
              <div className="flex gap-2">
                <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1 rounded-full border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-orange-400 px-4 py-2" />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full h-10 w-10 p-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
