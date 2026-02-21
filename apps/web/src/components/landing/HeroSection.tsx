'use client';

import { Button } from '@repo/ui';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="dark relative py-16 flex items-center justify-center dark:bg-[#020817]/70">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-125 bg-linear-to-b from-primary/20 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Innovative Software
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80  dark:to-primary/70">
                Solutions
              </span>
            </h1>

            <p className="mx-auto max-w-175 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We build scalable, high-performance web applications tailored to your business needs.
              Experience the future of software development with us.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button asChild size="lg">
              <Link to="/marketplace">
                Marketplace
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request-quote">Request Quote</Link>
            </Button>
          </motion.div>

          {/* Macbook Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            className="relative w-full max-w-5xl mt-16 -mb-48 lg:-mb-64 perspective-[2000px]"
          >
            <div className="relative">
              <img
                src="https://res.cloudinary.com/deptmmxdn/image/upload/v1771610247/macbook-mockup_zb9yfv.png"
                alt="App Dashboard Mockup"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section >
  );
}
