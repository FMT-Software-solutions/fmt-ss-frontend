import { Badge } from '@repo/ui';
import { motion } from 'framer-motion';
import { Monitor, Cpu, HardDrive, Wifi } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'High Performance',
    description: 'Native performance with optimized resource usage',
  },
  {
    icon: HardDrive,
    title: 'Offline Capable',
    description: 'Works seamlessly without internet connection',
  },
  {
    icon: Wifi,
    title: 'System Integration',
    description: 'Deep integration with operating system features',
  },
  {
    icon: Monitor,
    title: 'Multi-Platform',
    description: 'Windows, macOS, and Linux compatibility',
  },
];

export function DesktopAppsSection() {
  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-secondary/10 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Desktop Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            {/* Desktop Frame */}
            <div className="relative">
              {/* Monitor Base */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-linear-to-b from-secondary to-secondary/50 rounded-b-lg"></div>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-secondary/80 rounded-t-sm"></div>

              {/* Monitor Screen */}
              <div className="bg-card border-4 border-secondary/30 rounded-lg shadow-2xl overflow-hidden mb-12">
                {/* Screen Bezel */}
                <div className="bg-secondary/50 dark:bg-primary/20 p-2">
                  <div className="bg-linear-to-br from-background to-secondary/10 rounded aspect-video relative overflow-hidden">
                    {/* Desktop App Interface */}
                    <div className="absolute inset-0 p-4">
                      {/* Title Bar */}
                      <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-t-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-sm font-medium">
                            Professional Desktop App
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-4 h-4 bg-secondary/50 rounded"></div>
                          <div className="w-4 h-4 bg-secondary/50 rounded"></div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="bg-card/80 backdrop-blur-sm border border-primary/30 border-t-0 rounded-b-lg p-4 h-full">
                        <img
                          src="https://res.cloudinary.com/deptmmxdn/image/upload/v1771610167/psp-shot_adbqpv.png"
                          alt="Desktop App Screenshot"
                          width={1200}
                          height={1200}
                        />
                      </div>
                    </div>

                    {/* Animated Elements */}
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-8 right-8 w-3 h-3 bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [15, -15, 15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-8 w-32 h-32 bg-secondary/20 rounded-full blur-xl"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                <Monitor className="w-4 h-4 mr-2" />
                Desktop Applications
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Powerful Desktop Solutions
              </h2>
              <p className="text-sm md:text-lg  text-muted-foreground leading-relaxed">
                Build robust desktop applications that leverage the full power
                of modern operating systems. Our solutions deliver native
                performance with beautiful, intuitive interfaces.
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
        </div>
      </div>
    </section>
  );
}
