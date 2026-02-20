'use client';

import { Button } from '@repo/ui';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function HeroSection() {
  return (
    <section className="relative py-20 flex items-center justify-center overflow-hidden bg-linear-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-slate-900 dark:via-pink-900/20 dark:to-purple-900/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-pink-500/5 to-purple-500/10" />

        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-linear-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl"
        />

        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-3/4 right-1/4 w-48 h-48 bg-linear-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            x: [-30, 30, -30],
            y: [10, -10, 10],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-linear-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-lg"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-size-[50px_50px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200/20 dark:border-pink-800/20 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary dark:text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400 bg-clip-text text-transparent">
              Transforming Ideas Into Reality
            </span>
          </motion.div> */}

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            <span className="bg-linear-to-r from-primary to-pink-500 dark:from-pink-200 dark:via-pink-400 dark:to-purple-200 bg-clip-text text-transparent">
              Innovative Software
            </span>
            <br />
            <span className="bg-linear-to-r from-primary via-pink-600 to-rose-600 dark:from-primary dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
              Solutions
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            We provide solutions to your software development needs. We build
            <span className="font-semibold text-primary dark:text-pink-600">
              {' '}
              web apps
            </span>
            ,
            <span className="font-semibold text-pink-600 dark:text-pink-300">
              {' '}
              mobile apps
            </span>
            , and
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {' '}
              desktop apps
            </span>{' '}
            that address real challenges across all sectors to help the growth
            of your business or organization.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden bg-linear-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link to="/store">
                <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Visit our marketplace
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
