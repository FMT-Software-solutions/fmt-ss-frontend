import { motion } from 'framer-motion';
import { ComparisonScreen } from './ComparisonScreen';
import { Badge } from '@repo/ui';
import { Globe, Zap, Shield, Palette } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Cross-Platform',
    description: 'Works seamlessly across all browsers and devices'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with modern web technologies'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security and 99.9% uptime'
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Stunning UI/UX that delights your users'
  }
];

export function WebAppsSection() {
  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-background to-secondary/10">
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
                <Globe className="w-4 h-4 mr-2" />
                Web Applications
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Modern Web Solutions
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                We create powerful, responsive web applications that deliver exceptional user experiences. From simple websites to complex enterprise platforms, our solutions are built to scale.
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

          {/* Dashboard Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Browser Frame */}
            <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
              {/* Browser Header */}
              <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background/50 rounded px-3 py-1 text-xs text-muted-foreground">
                    https://your-app.com
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="aspect-video bg-linear-to-br from-background to-secondary/20 p-6">
                <ComparisonScreen />
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-secondary/20 rounded-full blur-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}