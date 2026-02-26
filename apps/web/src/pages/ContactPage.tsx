import { useState } from "react"
import { useContact } from "@/hooks/queries/useContact"
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Badge } from "@repo/ui"
import { Clock, MapPin, Users, Mail, Phone, MessageCircle, Send, User } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { SEO } from "@/components/seo"

const contactInfo = [
  {
    title: "Email",
    icon: <Mail className="mr-2 h-5 w-5" />,
    content: "fmtsoftwaresolutions@gmail.com",
    action: () => window.open("mailto:fmtsoftwaresolutions@gmail.com", "_blank"),
    buttonText: "Send Email",
    description: "Get in touch via email for detailed inquiries",
  },
  {
    title: "Phone",
    icon: <Phone className="mr-2 h-5 w-5" />,
    content: "+233 53 051 6908",
    action: () => window.open("tel:+233559617959", "_blank"),
    buttonText: "Call Now",
    description: "Speak directly with our team",
  },
  {
    title: "WhatsApp",
    icon: <MessageCircle className="mr-2 h-5 w-5" />,
    content: "+233 55 961 7959",
    action: () => {
      const phoneNumber = "+233559617959"
      const message = encodeURIComponent("Hello! I would like to inquire about your services.")
      window.open(`https://wa.me/${phoneNumber.replace("+", "")}?text=${message}`, "_blank")
    },
    buttonText: "Chat on WhatsApp",
    description: "Quick responses via WhatsApp",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const { mutate: sendMessage, isPending } = useContact()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields")
      return
    }

    sendMessage(formData, {
      onSuccess: () => {
        toast.success("Message sent successfully!")
        setFormData({ name: "", email: "", message: "" })
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send message")
      },
    })
  }

  return (
    <div className="min-h-screen py-10">
      <SEO
        title="Contact Us"
        description="Get in touch with FMT Software Solutions for custom software solutions, and more."
      />
      <div className="container max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="relative py-12 px-6 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 -z-10" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
                Let's Connect
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Get In Touch
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Ready to transform your business with custom software solutions?
                Our team is here to discuss your project, answer questions, and
                provide expert guidance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Clock className="w-4 h-4" />
                Response within 24 hours
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <MapPin className="w-4 h-4" />
                Based in Ghana
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Users className="w-4 h-4" />
                Expert team ready to help
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {contactInfo.map((info) => (
            <Card key={info.title} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  {info.icon}
                  {info.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-1">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
                <Button
                  onClick={info.action}
                  className="w-full group-hover:scale-105 transition-transform duration-200"
                  variant="outline"
                >
                  {info.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-2 hover:border-primary/20 transition-colors duration-300">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">Send us a message</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
              <div className="flex justify-center mt-4">
                <Badge variant="secondary" className="px-3 py-1">
                  Your information is secure
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="How can we help you?"
                    className="min-h-37.5"
                    required
                  />
                </motion.div>

                <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Message"} <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
