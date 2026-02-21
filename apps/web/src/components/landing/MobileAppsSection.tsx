import { motion } from 'framer-motion';
import { Badge } from '@repo/ui';
import { Smartphone, Zap, Users, Bell, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Native Performance',
    description: 'Smooth, responsive apps built for iOS and Android',
  },
  {
    icon: Users,
    title: 'User-Centric Design',
    description: 'Intuitive interfaces that users love to interact with',
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Keep users engaged with smart notification systems',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security for sensitive data',
  },
];

export function MobileAppsSection() {
  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Applications
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Mobile-First Experiences
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create engaging mobile applications that connect with your users
                wherever they are. From concept to app store, we deliver
                solutions that drive engagement and growth.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors duration-200"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            {/* Phone Frame */}
            <div className="relative">
              {/* Phone Body */}
              <div className="w-72 h-150 bg-linear-to-b from-secondary/30 to-secondary/10 rounded-[3rem] p-3 shadow-2xl border border-primary/20">
                {/* Screen */}
                <div className="w-full h-full bg-card rounded-[2.5rem] overflow-hidden relative border border-primary/10">
                  {/* Status Bar */}
                  <div className="bg-background/95 backdrop-blur-sm px-6 py-3 flex justify-between items-center text-xs">
                    <span className="font-medium">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-primary rounded-sm"></div>
                      <div className="w-6 h-3 border border-foreground/30 rounded-sm">
                        <div className="w-4 h-full bg-primary rounded-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 bg-linear-to-br from-background to-secondary/10 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold">Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                          Welcome back!
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary/40 rounded-full"></div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg mb-2"></div>
                        <div className="h-4 bg-secondary/40 rounded mb-1"></div>
                        <div className="h-3 bg-secondary/30 rounded w-2/3"></div>
                      </div>
                      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg mb-2"></div>
                        <div className="h-4 bg-secondary/40 rounded mb-1"></div>
                        <div className="h-3 bg-secondary/30 rounded w-2/3"></div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 mb-6">
                      <div className="h-3 bg-secondary/40 rounded mb-3 w-1/3"></div>
                      <div className="h-24 bg-linear-to-t from-primary/20 to-primary/5 rounded-lg relative overflow-hidden">
                        <motion.div
                          animate={{ x: [-20, 20, -20] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute bottom-0 left-4 w-1 h-16 bg-primary/60 rounded-full"
                        />
                        <motion.div
                          animate={{ x: [20, -20, 20] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute bottom-0 left-8 w-1 h-12 bg-primary/40 rounded-full"
                        />
                        <motion.div
                          animate={{ x: [-10, 30, -10] }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute bottom-0 left-12 w-1 h-20 bg-primary/80 rounded-full"
                        />
                      </div>
                    </div>

                    {/* List Items */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-card/60 rounded-lg">
                        <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-secondary/40 rounded mb-1 w-3/4"></div>
                          <div className="h-2 bg-secondary/30 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-card/60 rounded-lg">
                        <div className="w-8 h-8 bg-secondary/30 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-secondary/40 rounded mb-1 w-2/3"></div>
                          <div className="h-2 bg-secondary/30 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-foreground/20 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [20, -20, 20] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-8 -right-8 w-24 h-24 bg-secondary/20 rounded-full blur-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
